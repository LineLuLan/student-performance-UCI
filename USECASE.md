# Use Case — Student Risk Early Warning

A focused companion to [`README.md`](README.md): this document explains **the problem the dashboard actually solves**, **how we solve it step by step**, and **which dashboard feature answers each step** so a reader can follow the reasoning end-to-end.

---

## 1. The use case

### 1.1 Who is this for?

- **Secondary-school teachers and coordinators** who issue end-of-term (G3) grades on a 0–20 scale but see students twice *before* that point — at G1 (first midterm) and G2 (second midterm).
- **Academic advisors / welfare officers** responsible for reaching out to students before failure is locked in.
- **Data / ML students (us)** using the UCI Student Performance dataset as a realistic, imbalanced, mixed-type supervised-learning case study.

### 1.2 The problem in one sentence

> **Given everything we know about a student *before* the final exam (demographics, family, lifestyle, absences, G1, G2), can we identify — early and explain-ably — who is likely to fail G3, so a teacher can intervene in time?**

This is an **early-warning classification** problem with three hard constraints:

1. **Imbalanced.** Only 22.0 % of students are at-risk (`grade_final < 10`), so naive accuracy is misleading — recall on the at-risk class is what matters.
2. **Explainable.** A teacher will not act on a black-box prediction. Every "at-risk" flag must come with a *why*: which factor drove the risk, and is the student part of a known behavioural pattern?
3. **Actionable.** The output must point to **levers** — study time, attendance, absences — that a teacher can actually influence, not immutable attributes alone.

### 1.3 Why this dataset fits

The UCI Student Performance dataset (Cortez & Silva, 2008) captures exactly the three pre-exam signals a teacher has access to:

| Layer | Features | Role in the use case |
|------|---------|----------------------|
| **Static context** | school, sex, age, address, family size, parental job & education, reason for school choice | Background — helps segment, rarely actionable |
| **Lifestyle** | study time, free time, going out, weekday/weekend alcohol, health, romantic, absences | Actionable levers — what a teacher can coach |
| **Academic progress** | G1 (period 1), G2 (period 2) | Strongest *pre-final* predictors — the main signal |
| **Outcome (ground truth)** | G3 (final grade 0–20), `at_risk = 1 if G3 < 10` | Target |

Combined `n = 1,044` (395 Math + 649 Portuguese).

---

## 2. How we solve it

We treat the use case as a four-step reasoning pipeline. Each step answers one question a teacher would reasonably ask.

### Step 1 — *"Which signals matter at all?"* (feature importance)

- Compute **Pearson correlation** of every numeric feature with `grade_final` over the full cohort.
- Rank by `|r|` to surface the strongest positive and negative drivers.
- Surface sign explicitly (positive ⇒ protective factor; negative ⇒ risk factor).

**Why this step first:** before trusting any model, we want to confirm that *something* in this feature set is actually informative, and to set a shortlist of variables the teacher should pay attention to.

### Step 2 — *"Is the relationship real at the individual level?"* (bivariate exploration)

- Plot G3 against any chosen feature as a scatter with **seeded jitter** (grades are integer-valued and heavily overplotted).
- Fit a simple **OLS regression line** and report `r` and `R²` in the header.
- Draw the **pass threshold at G3 = 10** so the reader can see who sits above vs below the fail line.

**Why this step:** a correlation number is a single scalar; a scatter reveals outliers, non-linearities (e.g. U-shape on `goout`), and whether the pattern holds inside a subgroup.

### Step 3 — *"Are there distinct 'types' of students?"* (unsupervised segmentation)

- Run **K-Means (k = 3)** on standardised lifestyle features (study time, absences, goes-out, weekend alcohol) — **deliberately excluding G1/G2/G3** so the clustering is not circular.
- Label the resulting groups in plain language: *Focused Achievers*, *Average Learners*, *Social Risk Group*.
- Report each group's at-risk rate and average grade to verify the clusters are academically meaningful.

**Why this step:** prediction alone tells a teacher *who*; segmentation tells them *what kind of intervention*. A Social-Risk-Group student with high absences needs a different conversation than an Average Learner who failed G2.

### Step 4 — *"Can a model flag them before G3, and what's the cost of being wrong?"* (supervised classification)

- Train a **Random Forest** (200 trees, stratified 80/20 split, `class_weight='balanced'`) on all pre-final features.
- Report **accuracy, precision, recall, F1**, but lead with **recall** on the at-risk class — the operationally relevant number.
- Render the full **confusion matrix** so the reader can see the count of *missed* at-risk students (false negatives). In an early-warning system, a miss is much more expensive than a false alarm.

**Why this step:** this is the final decision support. A single number ("91 % accuracy") is not enough; we must show the teacher exactly how many students we would miss, and how many we'd falsely flag.

### Supporting step — *"How do students evolve, and is the outcome distribution 'clean'?"*

Two diagnostic views that sit alongside the four steps:

- **Trajectory (G1 → G2 → G3)** with group means and ±1σ bands — reveals whether a subgroup is catching up, stable, or diverging across periods.
- **Distribution of G3** with KDE overlay — reveals that the grade distribution is **bimodal**: a primary mode near 11/20 plus a secondary spike at G3 = 0 from **53 students (5.1 %) who withdrew**. This is a failure mode that summary statistics alone miss entirely.

---

## 3. How the dashboard shows every feature needed to solve the use case

Every card in the dashboard is wired to one of the steps above. The table below is the complete mapping.

| Step | Question | Dashboard card | What the teacher sees | Interactions that unlock the answer |
|------|----------|----------------|-----------------------|-------------------------------------|
| 1 | Which signals matter? | **Key Drivers of Final Grade** (lollipop) | All 15 numeric features ranked by Pearson *r*, green stems = protective, red stems = risky. *r*-value printed next to each dot. | Click any dot → scatter repoints to that feature; hover → sign, `r`, `R²` impact (%). |
| 2 | Is the relationship real per-student? | **Grade Correlation** (scatter) | G3 vs chosen X-feature, OLS line, `r` and `R²` in header, pass threshold line at G3 = 10, dots coloured by current view. | Drives the X-axis from *Key Drivers* clicks; hover a dot → full per-student profile (G1/G2/G3, absences, study time, failures, at-risk badge). |
| 3 | Are there student types? | **Student Behavioural Profiles** (K-Means) | 3 cluster tabs with name, size, cohort share, average G3, at-risk badge, six attribute bars. | Tab click → switches the active persona; hover attributes → group interpretation note. |
| 4 | How well does the model flag them? | **Dropout Risk Predictor** (confusion matrix + metrics) | 2×2 matrix with explicit ACTUAL / PREDICTED axes, colour-coded cells (`MISSED ⚠` in red), four metrics as bars. | Hover any cell → count, share, operational description; hover a metric → definition in plain language. |
| Support | How do grades evolve? | **Period-by-Period Progression** (trajectory) | Up to 120 spaghetti lines + group mean ± 1σ bands, data-tight Y-axis, G1→G3 delta, pass line (drawn only if in range). | Group-by dropdown (gender / school / subject / internet / higher-edu); hover a mean dot → mean, σ, N, period-to-period change. |
| Support | Is the distribution clean? | **Grade Distribution** (histogram + KDE) | Histogram with bars coloured pass/fail by x-bin, KDE overlay, pass threshold line, *"N withdrew"* annotation on the G3 = 0 spike. | G1 / G2 / G3 toggle to compare period distributions; hover any bar → student count, share, period label. |

### 3.1 Global controls — how the use case is personalised

A teacher rarely asks "tell me about all 1,044 students at once." The dashboard has **four global control bands** that let the same six cards answer the four steps for a specific sub-cohort:

- **Subject toggle** — *Both / Math / Portuguese*. The Portuguese cohort is larger (649 vs 395) and has a different pass rate, so isolating one subject changes the KPIs and the top-risk factors.
- **View-by switcher** — *Gender / School / Internet / Higher-Edu Goal*. This is the **semantic colour axis**: every card recolours so the same student stays the same colour across scatter, progression, personas badge, etc., letting the eye track one group through every chart.
- **Chip filter** — per-view group toggles (e.g. *Female only*). Re-runs every step (KPIs, correlations of visible data, insight strip, scatter, progression, histogram). The last active chip is locked so the filter can never collapse to empty.
- **Dark-mode toggle** — reuses the same CSS variable system so chart re-renders pick up new colours immediately. Purely presentational, no data change.

### 3.2 KPI bar + insight strip — the one-glance summary

Even before looking at a chart, the **KPI bar** answers: *for the currently-filtered cohort, how big is it, what's the average G3, what's the pass rate, average absences, at-risk share, and the top risk factor?* The **insight strip** under it converts the current view into a one-sentence headline (e.g. *"Gender gap: +1.2 pts — avg grade: Female 12.1 · Male 10.9"*). Both recompute on every control change and are announced to screen readers via `aria-live="polite"`.

### 3.3 Cross-card linking — the reasoning is literally clickable

The four steps are **chained**: a user following the use case end-to-end can do so *purely through clicks*, in the same order described above:

1. Look at **Key Drivers** → find the biggest negative driver (e.g. `failures`, `r = −0.38`).
2. **Click that lollipop dot** → the **Grade Correlation** scatter repoints its X-axis to `failures` and redraws the OLS line. You see the cliff: students with ≥1 failure drop below G3 = 10 en masse.
3. Pick a tab in **Student Behavioural Profiles** to see which persona owns that risk (*Social Risk Group*, at-risk 29.4 %).
4. Read **Dropout Risk Predictor** to see how many of those students the model would catch (recall 82.6 % → 38 / 46 caught, 8 missed in the test set).
5. Cross-check with **Progression** (does the Social-Risk group diverge over G1→G3?) and **Distribution** (is the G3 = 0 withdrawal spike dominated by one subgroup?).

Every step is visible on one screen with no navigation, because the grid is a **24-column single-viewport layout** — six cards, no scroll, on a standard 1440×900 display.

---

## 4. What this use case deliberately does not try to do

To keep the dashboard honest about its scope:

- **No individual prediction UI.** We do not let a user type a student's features and get a single-student risk score. The Random Forest lives offline; the dashboard reports its aggregate behaviour, not a live inference endpoint. *(This is on the roadmap — see README §6.)*
- **No causal claims.** `r` and feature importance are associations, not interventions. A student with high `goout` and low `studytime` is not *made* at-risk by going out; these are correlated lifestyle patterns.
- **No longitudinal tracking beyond G1→G2→G3.** The dataset captures a single academic year; evolution across years is out of scope.
- **ML numbers are hard-coded in the JS.** Recomputing requires re-running `analysis/analyze.py` and copying the numbers into the chart files (see `personas.js`, `risk.js`, `importance.js`). This is a conscious trade-off to keep the front end build-free.

---

## 5. Reading order for a first-time viewer

If you have two minutes, read the dashboard in this order:

1. **KPI bar** — know the cohort size and the 22 % at-risk baseline.
2. **Key Drivers** — see what predicts G3 (top: G2, G1, failures).
3. **Grade Correlation** — click `failures` in Key Drivers, see the scatter confirm the cliff.
4. **Student Behavioural Profiles** — tab through the three clusters, notice the Social Risk Group's 29.4 % at-risk rate.
5. **Dropout Risk Predictor** — read *recall 82.6 %* and the `MISSED ⚠ = 8` cell. That's the operational cost.
6. **Progression** + **Distribution** — confirm the pattern holds across periods and note the G3 = 0 withdrawal spike.

That is the full use case, end to end, in one view.
