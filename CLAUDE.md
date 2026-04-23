# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Dashboard

```bash
# Serve the frontend (MUST use HTTP — ES modules don't work on file://)
python -m http.server 8000 --directory web
# Open: http://localhost:8000
```

## Regenerating the Data + ML Numbers

```bash
cd analysis
python analyze.py        # outputs Pearson r, K-Means clusters, RF metrics, exports CSVs
# OR run the full notebook:
jupyter notebook eda.ipynb
```

After running, the script auto-copies `data/processed/clean_students.csv` → `web/data/clean_students.csv`. If running the notebook manually, copy it yourself.

## Architecture

**No bundler. No npm.** `index.html` loads `main.js` as `type="module"`, which imports the six chart files from `web/charts/`. D3 v7 is loaded from CDN via ESM import.

### Data flow

```
data/raw/*.csv  →  analysis/analyze.py  →  data/processed/clean_students.csv
                                                        ↓ (auto-copied)
                                               web/data/clean_students.csv
                                                        ↓ (d3.csv at runtime)
                                                     main.js allData[]
                                                        ↓ getFilteredData()
                                                     chart draw functions
```

### Grid layout (24-column CSS)

```
Row 1:  #card-importance (col 1–8)  |  #card-scatter (col 8–18)  |  #card-radar (col 18–25)
        [1.75 wide]                     [2.5 wide — CENTER]          [1.75 wide]

Row 2:  #card-bar (col 1–9)  |  #card-env (col 9–17)  |  #card-extra (col 17–25)
        [equal thirds]           [equal thirds]             [equal thirds]
```

Card IDs map to: importance=lollipop, scatter=scatter, radar=personas, bar=risk, env=progression, extra=histogram.

### State in `main.js`

All dashboard state lives in `main.js`:
- `allData` — full 1,044-row dataset (never filtered; passed to `drawImportance`)
- `currentView` — active view key (`"sex"` | `"school"` | `"internet"` | `"higher"`)
- `currentSubject` — `"all"` | `"math"` | `"portuguese"`
- `activeChips` — `Set<string>` of chip values currently visible
- `scatterXField` — which column drives the scatter X axis
- `histGrade` — which grade column the histogram shows (`grade_mid1` | `grade_mid2` | `grade_final`)
- `window.__viewField__` / `window.__viewColors__` / `window.__viewValues__` / `window.__viewLabels__` — globals read by `scatter.js` to color dots and render human-readable legend labels

All four `window.__view*__` globals must be updated together whenever `switchView()` is called.

### `VIEW_CONFIG` — adding a new view

Each entry needs: `label`, `field` (CSV column), `values[]`, `chipLabels[]`, `colors[]`, `insightLabel`, `scatterTitle`. String fields (sex, school) use string values; numeric-encoded fields (internet, higher) use `[1, 0]`.

### Chart module convention

Every chart in `web/charts/` exports exactly one `draw*` function. The function:
1. Calls `container.selectAll("*").interrupt().remove()` to clear before redraw
2. Reads dimensions from `container.node().getBoundingClientRect()`
3. Guards for empty data or zero-size containers
4. Uses `d3.select("#tooltip")` — the single shared tooltip div in `index.html`
5. Sets tooltip position **and** content in the `mouseover` handler (not just in `mousemove`)

`drawPersonas()` and `drawRisk()` take no arguments — they render hardcoded ML results. All other chart functions receive `filteredData` as their first argument. `drawImportance` receives `allData` (not filtered) so correlations stay global.

`window.onFactorClick` in `main.js` calls **both** `drawScatter` and `drawImportance` when an importance dot is clicked — so the active-field highlight updates in both charts simultaneously.

### Hardcoded ML values

When the model is retrained, update these files manually:
- `web/charts/importance.js` — `FIELDS[]` array with real Pearson r values
- `web/charts/personas.js` — `CLUSTERS[]` array (K-Means k=3 on studytime/absences/goout/alcohol_weekend)
- `web/charts/risk.js` — `RF` object (confusion matrix + precision/recall/F1)

Current values: RF accuracy 91.4%, recall 82.6%. K-Means clusters: Focused Achievers (n=207, grade=12.52), Average Learners (n=524, grade=11.34), Social Risk Group (n=313, grade=10.56).

---

## CSS Design System

### Font system — all DM Sans
All three font variables resolve to DM Sans (unified sans-serif, no serif or mono):
```css
--font-display: 'DM Sans', sans-serif;
--font-body:    'DM Sans', sans-serif;
--font-mono:    'DM Sans', sans-serif;
```
Because JS chart files use these CSS variables inline (`.style("font-family","var(--font-mono)")`), redefining the CSS variable is all that's needed to change fonts everywhere. **Never reintroduce DM Serif Display or DM Mono.** When adding new text in JS chart files, use `var(--font-body)`.

Weight rule: since DM Sans 400 looks thin for titles, all heading-level elements use `font-weight: 700` (`.header-title`, `.card-title`, `.kpi-value`).

### Color palette
- `--accent-orange: #ea580c` (light) / `#fb923c` (dark) — for "elevated risk / warning" (Social Risk cluster). **Do not use `--accent-red` for cluster groups** — red is reserved for threshold lines, error states, and missed-detection cells.
- Dark mode is a **single** `[data-theme="dark"]` block. Never add a second one.
- Dark mode minimum readable: `--text-muted: #7c8ca0` (never go darker).

### Borders
Intentionally light: `rgba(0,0,0,0.06)` light / `rgba(255,255,255,0.06)` dark. Shadow does the visual separation — do not increase border opacity.

### Typography minimum
Nothing below 9px for any visible text.

---

## Per-chart Visual Conventions (from UI audit)

### scatter.js
- Dot: radius `2.5`, opacity `0.45`, jitter `d3.randomNormal(0, 0.35)` — large jitter needed because grades are integers, σ=0.18 is invisible
- Hover: radius `5`, opacity `1`
- Do not add inline value labels to dots — tooltip is sufficient
- `margin.top = 26` to host a **top strip** (r/R² left, legend right) drawn on `svgEl` (SVG root), NOT on the chart `g`. This keeps both items above the plot area and out of the dot cloud.
- SVG creation: always split into `svgEl` (the `<svg>` element) and `svg` (the inner `<g>` with translate). Top-strip elements append to `svgEl`; chart elements append to `svg`.
- Legend is horizontal right-aligned in the top strip, built right-to-left with `text-anchor="end"` and ~6px-per-char width estimate.

### importance.js
- No direction text annotations. Instead: a legend box (`"Boost Grade"` green + `"Lower Grade"` red) lives in the **right margin** at `translate(W + 4, 8)` — `margin.right = 80` provides enough room. Box is 76px wide, entirely outside the chart plot area.
- All text uses `var(--font-body)` including r-value labels

### progression.js
- Y-axis is **dynamic** (tight): pre-compute min(mean−sd) and max(mean+sd) across all groups and periods, clamp to [0,20], add ±1 margin. Never use fixed `[0, 20]` — it makes group differences invisible
- No per-dot grade value labels (removed — tooltip shows values on hover)
- Gridlines: `yScale.ticks(3)` — max 3 reference lines
- Std bands: set opacity via `.style("opacity","0.15")` (inline style overrides the CSS class `.std-band { opacity: 0.12 }`)
- Spaghetti background: capped at 120 lines, opacity 0.05

### risk.js (confusion matrix)
- Must have explicit axis labels: `← PREDICTED →` spanning both column cells (in a flex row above the column headers), `ACTUAL ↓` in the corner cell
- Row/column labels are just `"Pass"` / `"Risk"` (no "Act:" / "Pred:" prefix — axis titles provide the context)
- Column width for row labels: `60px` (fits "Risk" and "Pass" comfortably)

### histogram.js
- Stats annotation (avg/median) is at `x=4, text-anchor=start` (top-left) to avoid colliding with "PASS (≥10)" label at `x=xScale(10)+3`

### personas.js
- Social Risk Group color: `var(--accent-orange)` — not red
- **Interactive tab design**: 3 cluster tabs (F / A / S) at top with underline indicator (`border-bottom: 3px solid [color]`). Clicking the active tab deselects → reverts to "All Students" (weighted averages). Module-level `let activeCluster = null` persists the selection across re-renders (e.g. window resize).
- Tab row uses `box-shadow: inset 0 -1px 0 var(--border)` instead of `border-bottom` to create the baseline. This lets the active tab's 3px border paint ON TOP of the 1px shadow — avoiding a visible double-line. **Never switch back to `border-bottom` on the tabRow without re-adding `margin-bottom: -1px` to tabs.**
- `CLUSTERS[]` now includes `health` and `freetime` fields (estimated per-cluster means, not K-Means variables). `ALL` object holds weighted averages across all three clusters.
- `ATTRS[]` ordered: Study Time, Absences, Goes Out, Alcohol (K-Means vars), then Health Status, Free Time.
- Dynamic attr count: `nAttrs = Math.min(5, Math.max(4, Math.floor((height - 190) / 30)))` — shows 4 when card is short, up to 5 when taller. Fixed chrome reservation is ~190px.
- `renderStats(panel, data, total, tooltip, attrsToShow)` is a standalone function (not exported). Each attr row shows label + value on **one line** (`"Study Time: 3.3/4"`), progress bar below (height 6px, border-radius 20px).
