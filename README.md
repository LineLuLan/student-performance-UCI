# Student Risk Early Warning — UCI Student Performance

An interactive analytical dashboard and machine-learning pipeline built on the **UCI Student Performance dataset** (Cortez, 2008). The project frames the data as an **Early Academic Warning System**: given a student's demographic profile and their first- and second-period midterm results, can we identify who is likely to fail the final examination *before* the final grade is issued, and explain *why*?

The work was developed as a coursework submission combining exploratory data analysis, statistical inference, unsupervised segmentation, supervised classification, and front-end data visualisation.

---

## 1. Academic Context

**Dataset.** Paulo Cortez & Alice Silva, *Using Data Mining to Predict Secondary School Student Performance*, 2008. Two Portuguese secondary schools (Gabriel Pereira, Mousinho da Silveira), two subjects (Mathematics *n*=395, Portuguese *n*=649), **combined *n*=1,044 students**, 33 raw attributes covering demographics, family background, schooling support, lifestyle, and three grade periods (G1 midterm, G2 midterm, G3 final, each on a 0–20 scale).

**Target construction.** Following the Portuguese pass threshold, a binary label `at_risk = 1` is assigned when `grade_final < 10`. This yields a **22.0 % minority class** (230 at-risk students) — an imbalanced classification problem that motivates `class_weight='balanced'` in the classifier and recall as the headline metric.

**Research questions.** The dashboard is organised around six questions drawn directly from the dataset:

| # | Question | Method | Evidence card |
|---|----------|--------|---------------|
| RQ1 | Which numeric features correlate most strongly with the final grade G3? | Pearson *r* | *Key Drivers of Final Grade* |
| RQ2 | How well does each feature predict G3 at the individual level, and is the relationship linear? | Scatter + OLS regression (*r*, *R²*, slope) | *Grade Correlation* |
| RQ3 | Can students be grouped into interpretable behavioural personas without using their grades? | K-Means (*k*=3) on standardised lifestyle features | *Student Behavioural Profiles* |
| RQ4 | Can a supervised model flag at-risk students accurately enough to be actionable, and which errors matter? | Random Forest + confusion matrix | *Dropout Risk Predictor* |
| RQ5 | How do grades evolve across G1 → G2 → G3, and do subgroups diverge? | Spaghetti plot + group means + ±1σ bands | *Period-by-Period Progression* |
| RQ6 | What is the shape of the grade distribution, and does it reveal structural phenomena (e.g. withdrawal)? | Histogram + KDE overlay | *Grade Distribution* |

**Key empirical findings.**
- G2 is an almost-deterministic predictor of G3: Pearson *r* = 0.91, *R²* = 0.83. G1 follows at *r* = 0.81. Past `failures` is the strongest negative predictor (*r* = −0.38).
- The final-grade distribution is **bimodal**: a primary Gaussian centred near 11/20 plus a secondary spike at G3 = 0, corresponding to **53 students (5.1 %) who withdrew** before the final exam — a failure mode invisible to summary statistics alone.
- K-Means (k=3) separates students into *Focused Achievers* (n=207, grade 12.5, at-risk 12.6 %), *Average Learners* (n=524, grade 11.3, at-risk 21.4 %), and a *Social Risk Group* (n=313, grade 10.6, at-risk 29.4 %) whose absences and weekend alcohol scores are both ~2× the cohort mean.
- A 200-tree Random Forest trained on pre-final features achieves **accuracy 91.4 %, precision 79.2 %, recall 82.6 %, F1 80.9 %** on a stratified 20 % hold-out (*n*=209). Of 46 true at-risk students in the test set, 38 are caught and 8 are missed — the single quantity most relevant to an early-warning use case.

---

## 2. Tech Stack

### Analysis layer (offline, one-shot)
| Purpose | Library |
|---|---|
| Data wrangling | `pandas`, `numpy` |
| Statistical inference | `scipy.stats`, `statsmodels` (OLS with robust SE) |
| Unsupervised learning | `sklearn.cluster.KMeans` + `StandardScaler` |
| Supervised learning | `sklearn.ensemble.RandomForestClassifier`, stratified `train_test_split`, 5-fold `cross_val_score` |
| Evaluation | `sklearn.metrics.confusion_matrix`, `precision_recall_fscore_support`, `classification_report` |
| Notebook plots | `matplotlib`, `seaborn` |

### Presentation layer (browser, zero build step)
| Purpose | Technology |
|---|---|
| Structure | Semantic HTML5 (`<main>`, `<header>`, ARIA live tooltip) |
| Styling | Vanilla CSS with CSS custom properties, `color-mix()`, `@media (prefers-color-scheme)`, 24-column CSS grid, light/dark themes via `data-theme` attribute |
| Typography | DM Sans (one family, via Google Fonts, mapped to `--font-body`/`--font-display`/`--font-mono`) |
| Charting | **D3.js v7** imported as ES module from `jsdelivr` CDN — no bundler, no build step |
| App code | Vanilla ES modules (`type="module"`), one file per chart |
| Serving | `python -m http.server` — any static host (GitHub Pages, Netlify, S3) works identically |
| Responsiveness | `ResizeObserver` redraws all SVGs on container size change; seeded LCG jitter keeps scatter positions stable across redraws |

The front end ships **no dependencies to install** — every asset is either local or CDN-linked, and the entire app is ~1,200 lines of plain JavaScript across seven modules.

---

## 3. Features

### 3.1 Global controls
- **Subject toggle** — *Both / Math / Portuguese*, filters the underlying cohort.
- **View-by switcher** — recolours and regroups every chart by **Gender / School / Internet access / Higher-education aspiration**.
- **Chip filter** — per-view group toggles (e.g. show Female-only or GP-school-only). The filter is additive and cannot produce an empty set (last active chip is locked).
- **Dark-mode toggle** — full palette swap via CSS `data-theme`; all D3 charts re-render to pick up new CSS variables.
- **KPI bar** — six live metrics (cohort size, average final grade, pass rate, average absences, at-risk percentage, top risk factor) recomputed on every filter change.
- **Insight strip** — dynamic group-gap headline (e.g. *"Gender Gap: +1.2 pts — avg grade: Female 12.1 · Male 10.9"*), updated per view.

### 3.2 Chart cards

**Grade Correlation (scatter).** Interactive G3 ~ X-feature scatter with seeded jitter to reveal density in integer-valued columns, per-group colouring, OLS regression line, Pearson *r* and *R²* in the card header, and a pass-threshold reference line at G3 = 10 drawn on top of the dot cloud. The X-axis feature is bound to the *Key Drivers* card: clicking a factor there repoints the scatter.

**Key Drivers of Final Grade (lollipop).** Horizontal lollipop of Pearson *r* against G3 for the 15 numeric features, sorted by `|r|`, with positive values in green and negative in red. Each dot is clickable and drives the scatter card. A directional legend at the top margin explains sign semantics.

**Student Behavioural Profiles (K-Means personas).** Tab-selectable view of the three K-Means clusters. Each persona card shows sample size and share of cohort, average final grade as hero number, an at-risk badge, and six behavioural attribute bars (study time, absences, goes-out, alcohol, health, free time) rendered proportionally against their domain max. The *Social Risk Group* is coloured orange, not red, so red remains reserved for the pass threshold semantic.

**Dropout Risk Predictor (confusion matrix + metrics).** A 2×2 confusion matrix with explicit `← PREDICTED →` / `ACTUAL ↓` axis labels, cell values colour-coded by outcome (true-negative green, false-positive yellow, *missed* false-negative red, true-positive green), and a right-hand panel with the four model metrics rendered as progress bars. Hovering any cell or metric exposes a tooltip explaining the operational meaning.

**Period-by-Period Progression (trajectory).** Spaghetti plot of up to 120 individual student trajectories across G1 → G2 → G3, with group mean lines (thick) and ±1σ bands (translucent) overlaid. The Y-axis is data-tight (not a fixed [0, 20]) so 1–2-point group differences are visually legible. Group-by dropdown switches the grouping dimension independently of the global view-switcher. A G1 → G3 delta annotation sits in the top-right.

**Grade Distribution (histogram + KDE).** Frequency histogram with a superimposed kernel-density estimate, threshold reference line at 10, an `N withdrew` annotation on the G3 = 0 spike (when G3 is selected), and toggle buttons to compare G1 / G2 / G3 distributions.

### 3.3 Interaction details
- Global tooltip component (`#tooltip`) with edge-aware positioning (flips around the cursor on right/top margins, final-clamps so it never overflows any viewport edge).
- Every chart is redrawn on container resize, not viewport resize, so card-level layout changes update only their owning chart.
- Scatter jitter is generated from a **seeded LCG** (`d3.randomLcg(0.42)`): identical filter state always yields identical dot positions across re-renders, so redraws from resize, theme change, or redundant clicks are position-stable.

---

## 4. Repository Layout

```
student-performance-UCI/
├── README.md
├── analysis/
│   ├── analyze.py            # one-shot pipeline: clean + corr + K-Means + RF + export
│   └── eda.ipynb             # annotated notebook companion
├── data/
│   ├── raw/
│   │   ├── student-mat.csv   # UCI raw — Math subject
│   │   └── student-por.csv   # UCI raw — Portuguese subject
│   └── processed/
│       └── clean_students.csv
├── visual/                   # static plots produced by the notebook
│   ├── correlations.png
│   ├── elbow.png
│   ├── g2_vs_g3.png
│   └── grade_distributions.png
└── web/
    ├── index.html            # dashboard entry
    ├── style.css             # theme, grid, components
    ├── main.js               # state, filters, event wiring
    ├── data/clean_students.csv
    └── charts/
        ├── scatter.js
        ├── importance.js
        ├── personas.js
        ├── risk.js
        ├── progression.js
        ├── histogram.js
        └── utils.js          # tooltip positioning helper
```

---

## 5. Reproducing the Pipeline

### 5.1 Regenerate derived data and ML numbers
```bash
cd analysis
python -m pip install pandas numpy scikit-learn scipy statsmodels matplotlib seaborn
python analyze.py
```
The script prints Pearson correlations, cluster statistics, and Random Forest metrics, and writes `clean_students.csv` to both `data/processed/` and `web/data/`.

### 5.2 Launch the dashboard
```bash
python -m http.server 8000 --directory web
# then open http://localhost:8000
```
A static server is required because the front end uses `fetch("/data/clean_students.csv")` and ES module imports, which do not work from `file://` URLs.

### 5.3 Tested environment
- Python 3.11, scikit-learn 1.4
- Chrome / Firefox / Edge current stable — no IE / legacy support
- All random seeds fixed (`random_state=42`, `d3.randomLcg(0.42)`) for reproducibility

---

## 6. Limitations and Future Work

- The ML numbers displayed in the dashboard are **computed offline and hard-coded** in the JS charts. Re-running `analyze.py` regenerates the CSV but does not auto-update those numbers; they must be copied across manually if the pipeline changes.
- Only Pearson correlation is reported for the *Key Drivers* card. Non-linear relationships (e.g. a U-shape on `goout`) are therefore under-represented; Spearman or mutual information would be a reasonable extension.
- The Random Forest is trained once on the full cohort rather than per-subject; a Math-only / Portuguese-only split would let the dashboard report subject-specific recall.
- The dashboard is read-only. A natural next step is a "predict for one student" input panel that runs the classifier client-side via a serialised model (e.g. ONNX or a hand-rolled decision-tree ensemble in JS).

---

## 7. Citation

> P. Cortez and A. Silva. *Using Data Mining to Predict Secondary School Student Performance.* In A. Brito and J. Teixeira, editors, *Proceedings of 5th Future Business Technology Conference (FUBUTEC 2008)*, pp. 5–12, Porto, Portugal, April 2008. EUROSIS.

Dataset hosted by the UCI Machine Learning Repository: <https://archive.ics.uci.edu/dataset/320/student+performance>.

## License

See [`LICENSE`](LICENSE) for distribution terms. The UCI dataset itself is released under a CC BY 4.0 licence by the original authors.
