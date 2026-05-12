# Student Risk Early Warning

## An Interactive Analytical Dashboard on the UCI Student Performance Dataset

---

**Team members**
- `[MEMBER 1 FULL NAME]` — Student ID `[MSSV 1]` — `[MEMBER 1 EMAIL]`
- `[MEMBER 2 FULL NAME]` — Student ID `[MSSV 2]` — `[MEMBER 2 EMAIL]`
- `[MEMBER 3 FULL NAME]` — Student ID `[MSSV 3]` — `[MEMBER 3 EMAIL]`

**Course:** `[COURSE CODE — COURSE NAME]`
**Instructor:** `[INSTRUCTOR NAME]`
**Institution:** `[UNIVERSITY NAME]`
**Submission date:** 16 May 2026

**Repository:** https://github.com/LineLuLan/student-performance-UCI
**Live deployment:** https://student-uci-dashboard.vercel.app/

---

## Abstract

Early identification of secondary-school students at risk of failing their final examination is a long-standing problem in educational data mining. Conventional summary reports based on end-of-term grades arrive too late to inform intervention; predictive models, when offered as opaque scores, lack the explainability that classroom practitioners require. This project presents an end-to-end pipeline that combines exploratory statistics, unsupervised segmentation, and supervised classification with an interactive web dashboard designed for the early-warning use case. We operate on the canonical UCI Student Performance dataset of Cortez and Silva, comprising 1,044 students from two Portuguese secondary schools across two subjects. After preprocessing and binary-target construction (`at_risk = 1` when the final grade falls below ten of twenty), we compute Pearson correlations for fifteen numeric features, apply K-Means clustering on four standardised lifestyle features to recover three interpretable behavioural personas, and train a Random Forest classifier on a stratified eighty-twenty split with class-balanced weights. The classifier achieves accuracy 91.4%, precision 79.2%, recall 82.6%, and F1 80.9% on the held-out test set, catching thirty-eight of forty-six at-risk students while missing eight. The dashboard, implemented as a build-free single-page application using D3.js version seven, presents these results across six linked cards on a single-viewport twenty-four-column grid. We argue that *recall*, not accuracy, must lead model evaluation in this context, and that the cost of missed students should be visible as a first-class element of the interface. A bimodal distribution of final grades, including a spike of fifty-three withdrawals at grade zero, illustrates a failure mode invisible to summary statistics — motivating distributional visualisations alongside predictive metrics.

**Keywords** — educational data mining; early-warning systems; interactive visualisation; Random Forest; K-Means; visual analytics; D3.js.

---

## Table of Contents

1. Introduction
2. Related Work
3. Dataset
4. Methodology
5. Visualisation Design
6. Implementation
7. Results and Findings
8. Discussion
9. Conclusion and Future Work
10. References

Appendix A — Team Contributions
Appendix B — Repository Layout
Appendix C — Figures
Appendix D — Pre-Submission Checklist

---

## 1. Introduction

### 1.1 Motivation

Secondary-school grading systems in many countries — including the Portuguese system that underlies the dataset used here — release a definitive *G3* final grade only at the end of the academic period. By the time a teacher or coordinator sees that grade, the option to intervene has elapsed. Yet the data routinely collected over the academic period — two earlier midterm grades, absences, lifestyle factors, family background — already encode much of the signal needed to anticipate the final outcome.

The pedagogical question, then, is not *who failed?* but *who is going to fail, why, and what can we do about it?* This is a classical early-warning problem with three hard constraints:

1. **It is imbalanced.** Approximately twenty-two percent of students in our cohort are at risk (`grade_final < 10`). Naïve accuracy on such an imbalanced target is misleading; a model that predicts every student passes obtains roughly seventy-eight percent accuracy while catching zero at-risk students. The operational metric is *recall* on the minority class.
2. **It must be explainable.** A classroom practitioner will not act on a black-box risk score. Each at-risk flag must be accompanied by *why* — which feature drove the risk, and is the student part of a recognisable behavioural pattern.
3. **It must be actionable.** The output must point to *levers* a teacher can influence — study time, attendance, absences — rather than to immutable demographic attributes alone.

### 1.2 Problem statement

> *Given everything we know about a student before the final exam — demographics, family, lifestyle, absences, the two earlier midterm grades — can we identify, early and explainably, who is likely to fail the final exam, so a teacher can intervene in time?*

### 1.3 Contributions

This project makes three concrete contributions:

1. **A reproducible end-to-end pipeline** from the raw UCI dataset to a deployed web dashboard. A single Python script (`analysis/analyze.py`) produces the cleaned data and all machine-learning numbers; the dashboard is a build-free static site that loads in any modern browser.
2. **A recall-led model evaluation,** in which the confusion matrix is rendered as a first-class element of the user interface, with the *missed* false-negative cell coloured in red to make the operational cost of error inescapable.
3. **A clickable four-step reasoning interface** in which the user follows the early-warning logic end to end — *which signals matter?* → *is the relationship real?* → *are there student types?* → *can we predict?* — through direct manipulation, with no menu hierarchy.

### 1.4 Report outline

Section 2 surveys related work in educational data mining, predictive student-risk modelling, and visual analytics for machine learning. Section 3 describes the dataset, including a deliberate migration from an earlier Kaggle source to UCI. Section 4 details the machine-learning methodology. Section 5 sets out the visualisation-design rationale. Section 6 covers implementation and deployment. Section 7 reports empirical findings. Section 8 discusses interpretation, limitations, and threats to validity. Section 9 concludes.

---

## 2. Related Work

### 2.1 The original UCI study

Cortez and Silva [1] introduced the dataset used in this project as part of an investigation of data-mining methods applied to secondary-school student performance. Their experiments compared decision trees, random forests, neural networks, and support vector machines on the same cohort under three input scenarios: (A) without grade information, (B) using G1, and (C) using both G1 and G2. Their headline finding — that G2 in particular is a near-deterministic predictor of G3 — is reproduced and visualised in our Section 7.

### 2.2 Educational data mining

The broader field of educational data mining has accumulated a large body of work on early-warning and dropout-prediction systems. Romero and Ventura [2] survey the field, identifying classification, clustering, and association-rule mining as the dominant methodological strands. More recent work has emphasised explainability and stakeholder trust as prerequisites for deployment in real schools, paralleling the wider trend toward interpretable ML.

### 2.3 Visual analytics for machine learning

The use of visualisation as a means to make machine-learning models explainable has been surveyed by Hohman et al. [3], whose taxonomy distinguishes between visualisations *of* model internals (weights, activations, importance) and visualisations *of* model behaviour (predictions, confusion matrices, residuals). The present work falls primarily into the second category, supplementing it with traditional exploratory visualisations (correlation lollipops, scatter plots, histograms) drawn from Few [4] and Munzner [5].

### 2.4 Dashboard design principles

The single-viewport, no-scroll dashboard pattern advocated by Few [4] informs our 24-column grid layout. Munzner's [5] framework — *what, why, how* — informs our chart-type selection: each visualisation is chosen for the task it answers, not for aesthetic novelty. The *cross-card linking* mechanism (clicking a feature in the Pearson lollipop repoints the scatter X-axis) follows the *linked-views* tradition formalised by Buja, McDonald, Michalak, and Stuetzle [6] and implemented in countless visual-analytics systems since.

### 2.5 Gap

Public visualisations on the UCI Student Performance dataset are dominated by static notebooks — most commonly notebooks shared on Kaggle and on academic course pages, which present numerous bar charts and correlation heatmaps but do not link reasoning across views or surface the operational cost of model error. Our dashboard departs from this pattern by adopting a recall-led evaluation, a click-driven reasoning pipeline, and a deliberately bimodal-aware distribution view that exposes withdrawal cases the summary statistics would conceal.

---

## 3. Dataset

### 3.1 Source

The project uses the *Student Performance* dataset published on the UCI Machine Learning Repository [7], collected by Cortez and Silva [1] from two Portuguese secondary schools — Gabriel Pereira and Mousinho da Silveira — during the 2005–2006 academic year. The dataset is distributed as two CSV files, one for the Mathematics class (`student-mat.csv`, *n* = 395) and one for the Portuguese-language class (`student-por.csv`, *n* = 649), each containing thirty-three attributes covering demographics, family background, schooling support, lifestyle factors, and three grade periods (G1, G2, G3) on a zero-to-twenty scale.

### 3.2 Dataset migration and rationale

The project was originally scoped against a different dataset of Kaggle origin — a publicly distributed student-performance dataset (in the family of *Students Performance in Exams* and similar aggregator-style datasets, characterised by a single composite outcome and a small set of demographic predictors). After preliminary exploration we migrated to the UCI Student Performance dataset. The migration was deliberate and is justified on three methodological grounds.

**First, provenance and validation.** The UCI dataset is the canonical academic reference for this problem, accompanied by a peer-reviewed publication [1] and hosted by a curated repository [7]. Its variables and recording conventions have been examined and reused by subsequent researchers, providing a stable basis for reproducibility and external comparability. The earlier Kaggle source, while convenient, lacks an accompanying peer-reviewed publication, and its variable semantics are not always documented to the same standard.

**Second, richer signal structure.** The UCI dataset records three time-stamped grade periods — the first midterm (G1), the second midterm (G2), and the final grade (G3) — rather than a single outcome score. This is essential to the early-warning framing of our project: we want to predict the final outcome *before* it is known, using the earlier midterms as the most recent academic signal available to the teacher. A dataset with only a single composite outcome cannot support this question. Additionally, the UCI dataset includes thirty-three attributes spanning four semantic layers (static context, lifestyle, academic progress, outcome), versus the smaller, demographics-only feature set typical of Kaggle aggregator datasets.

**Third, realistic class imbalance and distributional structure.** The UCI dataset exhibits a 22.0% at-risk minority class — a realistic imbalance that motivates recall-led evaluation, class-weight balancing, and confusion-matrix-led visualisation. Crucially, the distribution of G3 is *bimodal*: a primary mode near eleven out of twenty, plus a secondary spike at G3 = 0 corresponding to fifty-three students who withdrew before the final examination. This pedagogically valuable feature — a failure mode invisible to summary statistics alone — is what motivates our distribution visualisation as a diagnostic complement to the predictive model. A cleaner, balanced Kaggle dataset would not have surfaced this design lesson.

The migration is therefore framed not as a switch of convenience but as a methodological upgrade: from a single-outcome aggregator dataset to a peer-reviewed, time-stamped, realistically imbalanced dataset that the early-warning research community has used for two decades.

> *Editorial note: the original Kaggle dataset name should be inserted here once confirmed by the team — for example, "Students Performance in Exams" by Royce Kimmons (n = 1,000)*.

### 3.3 Schema

The two raw CSV files share a thirty-three-column schema. We group these columns into four semantic layers, summarised in Table 1.

**Table 1 — Schema layers**

| Layer | Variables | Role in the use case |
|---|---|---|
| **Static context** | school, sex, age, address, famsize, pstatus, mother_edu, father_edu, mother_job, father_job, reason, guardian, traveltime | Background and segmentation — rarely actionable |
| **Lifestyle** | studytime, failures, schoolsup, famsup, paid, activities, nursery, higher, internet, romantic, famrel, freetime, goout, alcohol_weekday, alcohol_weekend, health, absences | Actionable levers — what a teacher can coach |
| **Academic progress** | grade_mid1 (G1), grade_mid2 (G2) | Strongest pre-final predictors |
| **Outcome (target)** | grade_final (G3), at_risk (derived) | Ground truth |

After preprocessing we add two further engineered columns: `subject` (whether the row came from the Math or Portuguese file) and `cluster` (the K-Means assignment described in §4.3).

### 3.4 Preprocessing pipeline

All preprocessing is implemented in `analysis/analyze.py`. The pipeline executes the following ordered steps:

1. **Load** the two raw CSVs from `data/raw/`, both semicolon-delimited with header rows.
2. **Add a `subject` column** to each file (`"math"` and `"portuguese"`) and concatenate vertically, yielding `n = 1,044` rows.
3. **Standardise column names** to lower-case snake_case (`Medu → mother_edu`, `Fedu → father_edu`, `Mjob → mother_job`, `Dalc → alcohol_weekday`, `Walc → alcohol_weekend`, `G1 → grade_mid1`, `G2 → grade_mid2`, `G3 → grade_final`).
4. **Encode binary categorical features** that take `yes`/`no` values (schoolsup, famsup, paid, activities, nursery, higher, internet, romantic) as numeric 1/0.
5. **Construct the binary target** `at_risk = 1 if grade_final < 10 else 0`. The threshold matches the Portuguese pass requirement.
6. **Persist** the cleaned dataset to `data/processed/clean_students.csv` and copy it to `web/data/clean_students.csv` so the dashboard front-end can fetch it directly.

The pipeline is deterministic — all random operations (K-Means initialisation, train-test split, Random Forest seeding) use the fixed seed `random_state = 42`.

### 3.5 Descriptive statistics

After preprocessing the cleaned dataset contains 1,044 rows and 35 columns (the 33 source attributes, plus `subject` and `at_risk`, with `cluster` added later in §4.3). Key descriptive properties:

- **Class imbalance.** 230 students (22.0%) are at-risk; 814 (78.0%) pass. This 1 : 3.5 imbalance is moderate but operationally meaningful.
- **Grade distribution.** G3 is bimodal: a primary Gaussian-like mode centred near eleven, plus a secondary mode at G3 = 0 corresponding to 53 students (5.1%) who withdrew before the final exam. The mean and median of G3 are misleadingly close to the pass threshold; the bimodality is only visible in a histogram or kernel-density overlay.
- **Subject split.** Mathematics: 395 students; Portuguese: 649. The Portuguese cohort is larger and has a different pass rate, which motivates the *Subject* toggle in the dashboard.
- **Missing values.** None in the cleaned dataset — the source UCI files are fully populated.

---

## 4. Methodology

This section describes the analytical methods that produce the numbers visualised in the dashboard. Each method maps onto one or more of the six research questions (Table 2).

**Table 2 — Research questions and methods**

| # | Question | Method | Dashboard card |
|---|---|---|---|
| RQ1 | Which numeric features correlate most strongly with G3? | Pearson *r* | *Key Drivers of Final Grade* |
| RQ2 | How well does each feature predict G3 at the individual level? | Scatter + OLS (r, R², slope) | *Grade Correlation* |
| RQ3 | Can students be grouped into interpretable behavioural personas? | K-Means clustering (k = 3) on standardised lifestyle features | *Student Behavioural Profiles* |
| RQ4 | Can a model flag at-risk students accurately enough to act on, and which errors matter? | Random Forest + confusion matrix | *Dropout Risk Predictor* |
| RQ5 | How do grades evolve G1 → G2 → G3, and do subgroups diverge? | Group means ± 1σ bands across periods | *Period-by-Period Progression* |
| RQ6 | What structure does the grade distribution reveal? | Histogram + KDE | *Grade Distribution* |

### 4.1 Pearson correlation (RQ1)

We compute the Pearson product-moment correlation coefficient between each of fifteen numeric features and the target `grade_final`. The fifteen features are: `grade_mid1`, `grade_mid2`, `absences`, `failures`, `studytime`, `mother_edu`, `father_edu`, `goout`, `alcohol_weekday`, `alcohol_weekend`, `health`, `freetime`, `famrel`, `age`, `traveltime`.

Correlations are sorted by absolute value, with sign preserved. The sign carries operational meaning: positive correlation indicates a *protective* factor (e.g., higher G2 predicts higher G3), negative correlation indicates a *risk* factor (e.g., more past failures predicts lower G3). Both are rendered distinctly in the dashboard (green and red lollipop stems).

### 4.2 Bivariate regression visualisation (RQ2)

For each chosen feature we plot G3 against that feature as a two-dimensional scatter. Two practical issues require deliberate handling.

**Integer grades and overplotting.** Both axes are commonly integer-valued (G3 is 0–20 integer; many features such as `failures`, `studytime`, `goout` are 0–4 or 1–5 ordinals). Without jitter, hundreds of students collapse onto identical pixel coordinates, hiding density. We therefore add Gaussian jitter with σ = 0.35, generated from a seeded linear-congruential generator (`d3.randomLcg(0.42)`) so identical filter state always produces identical jitter — the chart never visually flickers between redraws.

**Ordinary least squares.** We fit a simple OLS regression line on the visible (filtered) data using the closed-form solution for slope and intercept. The header reports r, R², and the slope, so the reader can see both the strength and the rate of the relationship. The pass threshold is drawn at G3 = 10 as a horizontal reference line.

### 4.3 K-Means clustering (RQ3)

We segment students into behavioural personas using K-Means clustering. Three design choices are critical.

**Feature selection.** We cluster on four standardised lifestyle features: `studytime`, `absences`, `goout`, `alcohol_weekend`. The choice deliberately excludes the grade variables (G1, G2, G3). Clustering on grades would yield trivially obvious clusters that recover the pass threshold — circular reasoning. By excluding grades from the clustering input but reporting each cluster's at-risk rate as an *output*, we test whether lifestyle alone carries independent signal.

**Standardisation.** Features are standardised to zero mean and unit variance using `StandardScaler` before clustering, because K-Means is sensitive to feature scale.

**Choosing k.** We chose *k* = 3 based on the elbow method applied to within-cluster sum of squares (visual/elbow.png in the repository) and on interpretability — three named personas are easier for a stakeholder to remember and act on than five or seven.

**Algorithm parameters.** `sklearn.cluster.KMeans` is configured with `n_clusters = 3`, `random_state = 42`, `n_init = 10` (multiple restarts to escape local minima).

The resulting three clusters, with hand-assigned plain-language names, are:

- *Focused Achievers* — *n* = 207, mean grade 12.52, mean study time 3.28, mean absences 3.20, mean goout 2.82, mean weekend alcohol 1.67, at-risk rate 12.6%.
- *Average Learners* — *n* = 524, mean grade 11.34, mean study time 1.64, mean absences 3.28, mean goout 2.67, mean weekend alcohol 1.69, at-risk rate 21.4%.
- *Social Risk Group* — *n* = 313, mean grade 10.56, mean study time 1.66, mean absences 7.18, mean goout 4.20, mean weekend alcohol 3.68, at-risk rate 29.4%.

### 4.4 Random Forest classification (RQ4)

We train a Random Forest classifier to predict the binary `at_risk` target.

**Feature set.** Thirteen pre-final features are used as inputs: `grade_mid1`, `grade_mid2`, `absences`, `failures`, `studytime`, `mother_edu`, `father_edu`, `goout`, `alcohol_weekend`, `romantic`, `internet`, `schoolsup`, `activities`. Demographic variables that are not actionable (e.g., `age`, `traveltime`) are excluded.

**Train–test split.** The data are split eighty–twenty with stratification on the target, using `random_state = 42`. The test set contains 209 students, of whom 46 are at-risk (22.0% — the same imbalance as the full cohort, by construction).

**Hyperparameters.** `RandomForestClassifier` is configured with `n_estimators = 200`, `class_weight = "balanced"`, `random_state = 42`, `n_jobs = -1`. The `class_weight = "balanced"` setting penalises misclassification of the minority at-risk class in inverse proportion to its frequency, which is critical for an early-warning system in which a *missed* student is much more costly than a false alarm.

**Evaluation.** We compute accuracy, precision, recall, F1, and the confusion matrix on the held-out test set. To complement the held-out evaluation, we additionally report **5-fold stratified cross-validation** (`StratifiedKFold`, `shuffle=True`, `random_state=42`) over the full cohort, scoring on accuracy, precision, recall, and F1. The CV results in §7.3 are the methodologically primary numbers; the hold-out matrix (Table 6) is retained so the operational cost of each cell (caught, false alarm, **MISSED**, all-clear) can be interpreted directly.

### 4.4.1 Baseline models

For comparison we train two baselines on the same stratified 80/20 split. (i) `LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)` on standardised features (a `StandardScaler` is fit on the training split and applied to the test split). (ii) `DecisionTreeClassifier(class_weight="balanced", random_state=42)` on the raw features. Both baselines are evaluated with the same recall-led framing as the Random Forest. We report the comparison in §7.3 (Table 5).

### 4.5 Progression analysis (RQ5)

We compute group means and standard deviations of each grade period (G1, G2, G3) within each subgroup of the active *view-by* dimension (sex, school, internet, higher-education aspiration). The progression card overlays up to 120 individual student trajectories (sampled deterministically from the cohort) as light spaghetti lines beneath the bold mean lines, with shaded ±1σ bands around each mean. The Y-axis is data-tight: it spans from the minimum of the lower band edge to the maximum of the upper band edge, with a ±1.5-grade buffer, so that one- or two-point differences between subgroup means are visually resolvable (a fixed [0, 20] domain renders these differences invisible).

### 4.6 Distribution analysis (RQ6)

We render a histogram of G1, G2, or G3 (toggleable), with bars coloured by pass-fail at the threshold G3 = 10. A kernel-density estimate (Gaussian kernel, bandwidth = 1.2) is overlaid to highlight the shape of the distribution. The G3 view annotates the spike at G3 = 0 with the count of withdrawals (53, or 5.1% of cohort).

### 4.7 Reproducibility

All random operations use fixed seeds: `random_state = 42` for the train-test split, K-Means initialisation, and Random Forest; `d3.randomLcg(0.42)` for scatter jitter. Re-running `analysis/analyze.py` reproduces the cleaned dataset and machine-learning numbers bit-for-bit. The exact numerical values reported in §7 are stable across machines.

---

## 5. Visualisation Design

This section sets out the rationale for the chart-type and interaction choices in the dashboard. Each decision is grounded in the early-warning use case rather than in chart aesthetics.

### 5.1 Design principles

**Recall, not accuracy, leads.** A 91% accuracy on a 22% minority class is misleading. The dashboard renders the *MISSED ⚠* false-negative cell in red precisely because that is the operational cost of model error in an early-warning context.

**Cross-card linking — reasoning by clicks.** Clicking a feature in *Key Drivers* repoints the *Grade Correlation* scatter to that feature. The four-step reasoning pipeline (which signals matter? → is the relationship real? → are there student types? → can we predict?) is literally clickable in order, with no menu hierarchy.

**Single-viewport, no-scroll layout.** Six cards on a 24-column CSS grid fit on a standard 1440 × 900 display without scrolling. The reasoning fits on one screen.

**Seeded jitter for stability.** Grades are integer-valued and heavily overplotted. Jitter is generated from a deterministic LCG seeded at `0.42`, so identical filter state always produces identical dot positions across redraws — the chart never visually flickers when the user toggles a filter.

**Data-tight Y-axis on the trajectory chart.** A fixed [0, 20] domain makes 1–2-point group differences invisible. The progression chart auto-zooms to where the mean lines actually live, with a ±1.5-grade buffer.

**Theme that persists.** Toggling dark mode survives a page reload via `localStorage`. First load respects the operating-system `prefers-color-scheme` preference. All charts redraw on theme change — no stale cached colours.

### 5.2 Chart-type rationale

**Lollipop, not bar (Key Drivers).** Lollipop charts read the same as bar charts but use less ink for the same data — a Tufte-inspired choice. The dot at the tip allows precise hover targeting; the stem encodes magnitude.

**Scatter with OLS line, not heatmap (Grade Correlation).** A scatter preserves individual students as discrete marks, which is essential when the unit of intervention is the individual student. A heatmap would aggregate them away.

**Tabbed personas, not radar chart (Behavioural Profiles).** Radar charts are notoriously hard to compare across categories because the polygon area is non-linear in the underlying values. Tabs with side-by-side attribute bars preserve linear comparability and add a clear at-risk-rate badge.

**Confusion matrix, not single accuracy number (Dropout Risk Predictor).** A 2 × 2 matrix exposes the four outcome types — correctly caught, false alarm, missed, all-clear — independently. The asymmetric cost of *missed* versus *false alarm* in our use case demands this exposure; a single accuracy figure conceals it.

**Spaghetti + group means with bands, not box plot (Progression).** A box plot collapses each period into five summary numbers and obscures the trajectory of individual students. Spaghetti preserves trajectories; bold group means and ±1σ bands provide the comparative reading.

**Histogram + KDE, not boxplot (Distribution).** A box plot would entirely conceal the bimodality. The histogram exposes the secondary mode at G3 = 0 directly; the KDE overlay smooths the central distribution for shape reading.

### 5.3 Interaction model

**Global controls.** Four bands of global controls personalise every step of reasoning:

- *Subject toggle* — Both / Math / Portuguese.
- *View-by switcher* — Gender / School / Internet / Higher-Education Goal — the semantic colour axis.
- *Chip filter* — per-view subgroup toggles, additive.
- *Dark-mode toggle* — persisted; respects OS preference.

**Cross-card linking.** Clicking a feature in *Key Drivers* repoints the *Grade Correlation* scatter to that feature. This single linkage encodes the four-step reasoning pipeline in clicks — the user does not need menus.

**KPI bar and insight strip.** A six-metric KPI bar (cohort size, average G3, pass rate, average absences, at-risk %, top risk factor) sits above the cards and recomputes live on every control change. An insight strip below it converts the current view into a one-sentence headline (e.g. *"Gender gap: +0.2 pts — avg grade: Female 11.4 · Male 11.2"*). Both regions are `aria-live="polite"` so screen-reader users are notified of updates.

**Hover and tooltips.** A single global tooltip with edge-aware positioning (flips around the cursor near right and top margins, clamps to viewport) is used across all charts. Hovering any chart element surfaces a per-element profile.

### 5.4 Visual design

**Typography.** A single sans-serif family — DM Sans, via Google Fonts — is used for all text. Three CSS variables (`--font-display`, `--font-body`, `--font-mono`) resolve to DM Sans, so any per-chart text element automatically inherits the family. Numeric text uses `font-variant-numeric: tabular-nums` so digits align across rows.

**Colour semantics.** Red is reserved for danger and threshold lines (the pass line, the MISSED cell, at-risk badges) and is never used for cluster groups. Orange (`--accent-orange`) is used for the *Social Risk Group* persona — the "elevated risk" cluster — to avoid mis-reading the cluster as a system error.

**Layout.** A 24-column CSS grid distributes the six cards across two rows, with column ratios (1.75 : 2.5 : 1.75) in the first row that put the scatter chart, the centrepiece of bivariate reasoning, in the widest position.

**Borders and shadows.** Card borders use a near-transparent rule (`rgba(0,0,0,0.06)` in light mode, `rgba(255,255,255,0.06)` in dark mode), with box-shadow doing the heavy lifting of visual separation. This avoids the "cramped" feeling of heavy lines noted in early UI audits of the dashboard.

### 5.5 Accessibility

Accessibility is treated as a baseline, not an add-on:

- All interactive elements (chips, view switchers, persona tabs, theme toggle, chart dots used as buttons) have visible focus rings (`:focus-visible`) using a defined `--focus-ring` CSS variable.
- All transitions respect `prefers-reduced-motion`. When the user has requested reduced motion at the OS level, dashboard transitions are reduced to instantaneous state changes.
- The KPI bar and insight strip are `aria-live="polite"` so screen-reader users hear updates without the announcement interrupting the current speech.
- The theme toggle uses `aria-pressed` to expose its current state to assistive technology.
- Chips and persona tabs are keyboard-activatable; pressing Enter or Space invokes the same handler as a mouse click.

These choices follow the WCAG 2.2 guidelines [8] and the Section 508 baselines that many universities and school systems require.

---

## 6. Implementation

### 6.1 Architecture

The system is structured into two cleanly separated layers — an offline Python analysis pipeline and an in-browser presentation layer — connected only by a single CSV file and a small number of hardcoded constants. Figure 1 (Appendix C) shows the full architecture.

The offline pipeline (`analysis/analyze.py`) reads the two raw UCI files, performs all cleaning and machine learning, and emits the cleaned CSV plus stdout JSON blocks containing the Pearson correlations, K-Means cluster statistics, and Random Forest metrics. These numerical outputs are then copied into the relevant frontend chart modules (`web/charts/importance.js`, `web/charts/personas.js`, `web/charts/risk.js`) as JavaScript object literals.

The in-browser layer (`web/`) loads `clean_students.csv` once via `d3.csv`, holds the data in a single application state object in `main.js`, and dispatches to six chart modules. Each chart module exports a single drawing function that takes the data and the current state; redraws are triggered by control events (subject toggle, view switcher, chip filter, theme change) and by a `ResizeObserver` on each card.

### 6.2 Technology stack

**Analysis layer.** Python 3.11, `pandas` and `numpy` for data manipulation, `scikit-learn` 1.4 for K-Means and Random Forest, `scipy.stats` and `statsmodels` for inferential statistics, `matplotlib` and `seaborn` for the static EDA plots in `visual/`.

**Presentation layer.** D3.js version 7, imported as an ES module from a CDN (`https://cdn.jsdelivr.net/npm/d3@7/+esm`). No front-end build step, no bundler, no npm install. The entire front end is approximately 1,200 lines of plain JavaScript across seven modules, plus one HTML file and one CSS file. The choice of "zero build" is deliberate: it removes a class of toolchain failure modes (Node version mismatches, broken dependency graphs, sourcemap drift) that have historically derailed student projects.

**Styling.** Vanilla CSS with custom properties (`--bg-card`, `--text-primary`, `--accent-blue`, etc.) drives the theme system. Light and dark modes are switched by toggling a `data-theme` attribute on the document root; all colour-bearing rules read from CSS variables, so a theme change is a single attribute write that cascades through the entire document. Typography is DM Sans from Google Fonts.

### 6.3 Deployment

The site is configured for one-click static deployment to Vercel. The repository root contains a `vercel.json` that declares `outputDirectory: "web"` and no build command:

```json
{
  "outputDirectory": "web",
  "buildCommand": null,
  "framework": null
}
```

Vercel serves the contents of the `web/` directory directly as static files. The dashboard is live at <https://student-uci-dashboard.vercel.app/>. Any other static host (GitHub Pages, Netlify, Cloudflare Pages, Amazon S3 with CloudFront) works identically by pointing the root at `web/`.

Local development uses Python's built-in HTTP server (`python -m http.server 8000 --directory web`), which is sufficient because the dashboard uses ES-module imports and a `fetch` of `clean_students.csv` — both require an HTTP origin and do not work from `file://` URLs.

### 6.4 Trade-off: hardcoded numbers versus live inference

A deliberate architectural trade-off is that the machine-learning numbers (Pearson correlations, cluster statistics, Random Forest metrics) are hardcoded into the front-end chart modules rather than loaded dynamically. The benefits are concrete: the front end has no build step, no API dependency, no server-side runtime, and no possibility of CSV–numbers drift at request time. The cost is concrete too: refreshing the numbers requires re-running `analyze.py` and manually copying the output blocks into the chart files. For a project of this scope — a static, read-only dashboard for an academic submission — the benefits outweigh the cost. A production deployment with frequent data updates would require a different architecture (live API or build-time pre-computation).

---

## 7. Results and Findings

### 7.1 Key drivers (RQ1)

Table 3 reports the Pearson correlation of each of the fifteen numeric features with the final grade, sorted by absolute value. Positive coefficients indicate protective factors; negative coefficients indicate risk factors.

**Table 3 — Pearson r between numeric features and grade_final**

| Rank | Feature | r | Interpretation |
|---|---|---:|---|
| 1 | grade_mid2 | +0.9107 | Strongest protective signal — near-deterministic |
| 2 | grade_mid1 | +0.8091 | Second strongest — same direction as G2 but weaker |
| 3 | failures | −0.3831 | Strongest risk signal — past failures predict future failure |
| 4 | mother_edu | +0.2015 | Moderate protective — family-context proxy |
| 5 | studytime | +0.1616 | Moderate protective — actionable lever |
| 6 | father_edu | +0.1407 | Moderate protective — same direction as mother_edu |
| 7 | absences | −0.1140 | Mild risk — surprisingly weak overall |
| 8 | age | −0.1051 | Mild risk — older repeaters skew negative |
| 9 | goout | −0.0813 | Mild risk |
| 10 | alcohol_weekday | −0.0734 | Mild risk |
| 11 | freetime | −0.0581 | Near-zero |
| 12 | health | −0.0556 | Near-zero |
| 13 | famrel | +0.0511 | Near-zero |
| 14 | traveltime | −0.0500 | Near-zero |
| 15 | alcohol_weekend | −0.0481 | Near-zero |

The dominant finding — *r* = 0.91 for grade_mid2 and *R*² ≈ 0.83 — confirms Cortez and Silva's result and visually anchors the lollipop chart. Past failures emerge as the strongest *actionable* risk signal, since the academic-history variables (G1, G2) are themselves outcomes rather than levers.

### 7.2 Cluster characteristics (RQ3)

Table 4 reports the three K-Means clusters with their behavioural attributes and at-risk rates. The cluster names are hand-assigned for stakeholder interpretability and are stable across re-runs (`n_init = 10`, `random_state = 42`).

**Table 4 — K-Means cluster characteristics (k = 3)**

| Cluster | n | Mean grade | Study time | Absences | Goout | Weekend alcohol | At-risk rate |
|---|---:|---:|---:|---:|---:|---:|---:|
| *Focused Achievers* | 207 | 12.52 | 3.28 | 3.20 | 2.82 | 1.67 | 12.6% |
| *Average Learners* | 524 | 11.34 | 1.64 | 3.28 | 2.67 | 1.69 | 21.4% |
| *Social Risk Group* | 313 | 10.56 | 1.66 | 7.18 | 4.20 | 3.68 | 29.4% |

The Social Risk Group has roughly double the cohort-average absences and roughly double the cohort-average weekend alcohol score. Its at-risk rate is 29.4%, more than double that of the Focused Achievers cluster. These clusters are recovered from lifestyle features alone — the grade variables are deliberately excluded from the clustering input — so the elevated at-risk rate in the Social Risk Group constitutes independent evidence that lifestyle is a meaningful predictor beyond academic history.

### 7.3 Classifier performance (RQ4)

We report three classifiers on the held-out test set (n = 209, of which 46 are at-risk), and a 5-fold stratified cross-validation summary on the Random Forest.

**Table 5 — Held-out test-set performance for the three classifiers (n = 209)**

| Metric | Logistic Regression | Decision Tree | **Random Forest** |
|---|---:|---:|---:|
| Accuracy | 88.0% | 88.0% | **91.4%** |
| Precision (at-risk) | 66.7% | 71.4% | **79.2%** |
| Recall (at-risk) | **91.3%** | 76.1% | 82.6% |
| F1 (at-risk) | 77.1% | 73.7% | **80.9%** |

The three models present a clear *recall–precision trade-off*. Logistic Regression catches the most at-risk students (recall 91.3%, missing only 4 of 46), but at the cost of 21 false alarms (precision 66.7%). The Decision Tree behaves in the opposite direction, missing 11 of 46 at-risk students. The Random Forest sits between the two, achieving the highest F1 (80.9%) — the best-balanced choice given an early-warning use case that values both catching at-risk students *and* not over-flagging the cohort. We adopt the Random Forest as the deployed model in the dashboard, while reporting Logistic Regression openly as a viable alternative if a school's intervention budget makes false alarms cheap.

**Table 5b — 5-fold stratified cross-validation on the Random Forest**

| Metric | Mean | Std |
|---|---:|---:|
| Accuracy | 92.4% | ± 1.2 pp |
| Precision | 85.7% | ± 2.4 pp |
| **Recall** | **79.1%** | ± 8.1 pp |
| F1 | 82.0% | ± 3.9 pp |

The CV mean recall (79.1%) is within roughly 3.5 percentage points of the hold-out recall (82.6%), indicating that the hold-out is mildly optimistic for the at-risk class but not pathologically so. The relatively wide recall standard deviation (± 8.1 pp) is the most informative caveat: recall on this dataset depends meaningfully on *which* 209 students happen to be in the test fold — driven by the small at-risk minority (≈46 per fold) and the heterogeneity inside it. Accuracy, precision, and F1 are all stable to within a few percentage points across folds.

The held-out confusion matrix (Table 6) decomposes the Random Forest's aggregate metrics into the four operational outcomes.

**Table 6 — Confusion matrix for the Random Forest on the held-out test set**

| | Predicted Pass | Predicted At-Risk |
|---|---:|---:|
| **Actually Pass** (n = 163) | TN = 153 (94%) | FP = 10 (6%) |
| **Actually At-Risk** (n = 46) | **FN = 8 (17%) — MISSED** | TP = 38 (83%) |

The headline operational result is **recall = 82.6%** — the deployed Random Forest catches 38 of 46 at-risk students on the test set. Eight at-risk students are missed (the false-negative cell, rendered in red in the dashboard). Ten passing students are flagged falsely (the false-positive cell). In an early-warning context, a false negative is operationally more costly than a false positive — a missed student receives no intervention; a falsely flagged student receives a check-in conversation that costs only the teacher's time. The dashboard surfaces this asymmetry deliberately.

### 7.3.1 Subject-stratified Random Forest models

To probe whether the cohort-wide model masks subject-specific dynamics, we additionally train two stratified Random Forests — one on Mathematics only (*n* = 395) and one on Portuguese only (*n* = 649) — using the same hyperparameters, the same feature set, and the same stratified 80/20 split protocol (`random_state = 42`). Table 5c reports the held-out metrics for all three models side by side. The dashboard's *Subject* toggle now switches between these three models in addition to filtering the displayed cohort.

**Table 5c — Subject-stratified Random Forest performance on held-out test sets**

| Model | n total | n test | At-risk in test | Accuracy | Precision | **Recall** | F1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Combined (deployed default) | 1,044 | 209 | 46 | 91.4% | 79.2% | **82.6%** | 80.9% |
| **Math only** | **395** | **79** | **26** | 89.9% | 82.1% | **88.5%** | 85.2% |
| **Portuguese only** | **649** | **130** | **20** | 90.0% | 65.2% | **75.0%** | 69.8% |

Two observations follow.

**Math is easier to predict than Portuguese.** The Math-only model catches twenty-three of twenty-six at-risk students (recall 88.5%, F1 85.2%) and meaningfully outperforms the combined model on every metric except accuracy. The Portuguese-only model catches fifteen of twenty (recall 75.0%) at the cost of a much lower precision (65.2%) and F1 (69.8%). Two structural reasons drive this gap. First, the Mathematics cohort has a higher base rate of at-risk students (38.7% of Math students are at-risk versus 12.4% of Portuguese students), so the minority class is less imbalanced and the classifier sees more positive examples per training fold. Second, the Math test set (n = 79) is smaller but the at-risk class is denser (26 of 79 = 32.9% versus 20 of 130 = 15.4%); a small absolute change in catches has a larger relative effect on recall.

**The combined model is essentially a weighted average.** With n = 1,044 combined and a 22.0% at-risk rate, the combined model's recall (82.6%) sits squarely between the two stratified models (88.5% Math, 75.0% Portuguese) — closer to the Portuguese number than to the Math number, because Portuguese contributes more rows. This makes the combined model the appropriate default when the user has not chosen a subject, but argues for the stratified models when a teacher is acting in a single-subject context. The dashboard surfaces this choice through the *Subject* toggle.

### 7.4 Diagnostic insight: bimodal G3 and the withdrawal cohort

The G3 histogram exposes a clearly bimodal distribution: a primary mode centred near eleven out of twenty, plus a secondary spike at G3 = 0. This secondary mode corresponds to **53 students (5.1% of cohort)** whose final grade is recorded as zero — interpretable as students who withdrew or did not sit the final exam.

This finding has two consequences. First, it makes summary statistics about G3 systematically misleading: the mean and median are pulled toward the pass threshold by the bulk of students near eleven, masking the existence of a discrete sub-population of withdrawals. Second, it argues for separating *failure* (G3 < 10 but > 0) from *withdrawal* (G3 = 0) in any future at-risk modelling, since the antecedents of these two outcomes are likely different. The current model treats both as a single `at_risk` class.

---

## 8. Discussion

### 8.1 Interpretation of findings

Three observations follow from the empirical results.

**G2 is a near-deterministic predictor of G3** (*r* = 0.91, *R*² = 0.83). In practical terms, by the time the teacher sees the second midterm, the eventual outcome of the final exam is largely determined. This means an early-warning system worth deploying must produce its flags *before* G2, ideally using G1 plus lifestyle and demographic context. Our Random Forest uses both G1 and G2 because the dashboard's framing places the intervention point *after* G2 (when both midterms are available but the final is not yet sat). A more aggressive deployment would predict before G2 and re-predict after G2, treating the two midterms as sequential decision points.

**Lifestyle clusters carry independent at-risk signal.** The Social Risk Group's at-risk rate of 29.4% — recovered from lifestyle features that do not include any grade information — is significantly higher than the cohort baseline of 22.0%. This argues that lifestyle is not merely a downstream consequence of academic struggle but contributes its own predictive signal, consistent with the educational data mining literature [2].

**Recall–precision trade-off favours recall in this domain.** Our model trades a small amount of precision (79.2% of flagged students are genuinely at-risk; 20.8% are false alarms) for a substantial gain in recall (82.6% of at-risk students are caught). Under `class_weight = "balanced"`, the cost matrix implicitly assigns higher weight to false negatives, and this is the correct direction of bias for an early-warning system. A teacher can absorb the cost of speaking with a few extra students; the cost of failing to speak with a student who then fails the final is operationally much higher.

### 8.2 Limitations

We list three concrete limitations of the present system.

1. **Hardcoded ML numbers.** Pearson correlations, cluster statistics, and Random Forest metrics (across all three stratifications) are baked into JavaScript object literals in `web/charts/*.js`. Re-running `analyze.py` regenerates the cleaned CSV and recomputes every number, but the figures displayed on the dashboard must be copied across manually. The trade-off (no build step) is acceptable for this project but would not scale to a production deployment with frequent data updates.
2. **Pearson misses non-linearity.** The Pearson coefficient assumes a linear relationship. Variables such as `goout` may exhibit U-shaped or threshold relationships with G3 that the coefficient understates. Spearman rank correlation and mutual information would be reasonable extensions.
3. **No live single-student inference.** The dashboard is read-only. A natural extension is an input panel that accepts a student's features and runs the classifier client-side via a serialised model (ONNX runtime or a hand-rolled tree-ensemble in JavaScript).

### 8.3 Threats to validity

We acknowledge several threats to the external validity of these results.

**Population.** The dataset captures one academic year (2005–2006) at two schools in one country (Portugal). Generalisability to other educational systems, time periods, or countries is not established by the present work.

**Class-imbalance handling.** We use `class_weight = "balanced"` rather than data-level resampling techniques such as SMOTE [9]. The choice is principled (preserves the original distribution; no synthetic samples introduced), but a comparison with SMOTE-based resampling would strengthen the result.

**Fairness.** The dataset contains sex, family status, and other demographic variables that could be used to assess fairness across demographic subgroups. We do not report subgroup-conditional precision and recall in the current work. A more complete deployment would include a fairness audit and, if necessary, reweighting or post-hoc thresholding.

**Withdrawal versus failure.** As noted in §7.4, the binary `at_risk` target collapses two operationally distinct outcomes (withdrawal at G3 = 0 and failure at 0 < G3 < 10). A three-class formulation may be more appropriate.

---

## 9. Conclusion and Future Work

### 9.1 Summary of contributions

This project has presented an end-to-end pipeline — from raw UCI data through cleaning, exploratory statistics, unsupervised segmentation, and supervised classification, to a live deployed dashboard — for the secondary-school early-warning problem. The principal contributions are:

1. A **reproducible analytical pipeline** driven by a single Python script, with all numerical results stable under fixed random seeds.
2. A **recall-led model evaluation** in which the confusion matrix, and especially the *missed* cell, is rendered as a first-class element of the interface.
3. A **clickable four-step reasoning interface** that surfaces the early-warning logic — *which signals matter?* → *is the relationship real per-student?* → *are there student types?* → *can we predict?* — as direct manipulation across six linked cards on a single-viewport grid.

### 9.2 Future work

Five concrete directions for extension, in priority order:

1. **Random Forest feature importance** as a complement to Pearson r in the Key Drivers card, exposing non-linear feature contributions the Pearson coefficient understates.
2. **Subject-stratified models and metrics**, with the Random Forest re-trained when the Subject toggle changes, so the dashboard can report subject-specific recall.
3. **Live single-student inference**, with a serialised model running client-side, so a teacher can type a hypothetical student profile and receive a risk score with feature attributions.
4. **Address (urban / rural) and family status as additional view-by dimensions**, to expose socio-economic and family-stability proxies already present in the cleaned dataset.
5. **K-fold cross-validation** in the analytical pipeline, replacing the single hold-out with a more statistically robust estimate.

---

## 10. References

[1] P. Cortez and A. Silva, "Using data mining to predict secondary school student performance," in *Proc. 5th Future Business Technology Conference (FUBUTEC 2008)*, A. Brito and J. Teixeira, Eds. Porto, Portugal: EUROSIS, Apr. 2008, pp. 5–12.

[2] C. Romero and S. Ventura, "Educational data mining: A review of the state of the art," *IEEE Trans. Syst., Man, Cybern. C*, vol. 40, no. 6, pp. 601–618, Nov. 2010.

[3] F. Hohman, M. Kahng, R. Pienta, and D. H. Chau, "Visual analytics in deep learning: An interrogative survey for the next frontiers," *IEEE Trans. Visualization and Computer Graphics*, vol. 25, no. 8, pp. 2674–2693, Aug. 2019.

[4] S. Few, *Information Dashboard Design: The Effective Visual Communication of Data*, 1st ed. Sebastopol, CA, USA: O'Reilly Media, 2006.

[5] T. Munzner, *Visualization Analysis and Design*, 1st ed. Boca Raton, FL, USA: CRC Press, 2014.

[6] A. Buja, J. A. McDonald, J. Michalak, and W. Stuetzle, "Interactive data visualization using focusing and linking," in *Proc. IEEE Conf. Visualization*, 1991, pp. 156–163.

[7] D. Dua and C. Graff. (2017). *UCI Machine Learning Repository: Student Performance Data Set.* University of California, Irvine, School of Information and Computer Sciences. [Online]. Available: https://archive.ics.uci.edu/dataset/320/student+performance

[8] World Wide Web Consortium, *Web Content Accessibility Guidelines (WCAG) 2.2*, W3C Recommendation, Oct. 2023. [Online]. Available: https://www.w3.org/TR/WCAG22/

[9] N. V. Chawla, K. W. Bowyer, L. O. Hall, and W. P. Kegelmeyer, "SMOTE: Synthetic minority over-sampling technique," *J. Artif. Intell. Res.*, vol. 16, pp. 321–357, Jun. 2002.

[10] M. Bostock, V. Ogievetsky, and J. Heer, "D³: Data-driven documents," *IEEE Trans. Visualization and Computer Graphics*, vol. 17, no. 12, pp. 2301–2309, Dec. 2011.

[11] F. Pedregosa et al., "Scikit-learn: Machine learning in Python," *J. Machine Learning Res.*, vol. 12, pp. 2825–2830, 2011.

[12] L. Breiman, "Random forests," *Machine Learning*, vol. 45, no. 1, pp. 5–32, Oct. 2001.

---

## Appendix A — Team Contributions

| Member | Role | Primary deliverables | Share |
|---|---|---|---:|
| `[MEMBER 1]` | Data & ML Engineer | `analysis/analyze.py`; cleaned dataset; Pearson, K-Means, and Random Forest analyses; EDA notebook; hardcoded ML constants in `web/charts/{importance,personas,risk}.js` | **35%** |
| `[MEMBER 2]` | Visualisation & Frontend | All six D3 chart modules; main state machine in `web/main.js`; CSS theme system; 24-column grid; cross-card linking; accessibility baseline; Vercel deployment | **35%** |
| `[MEMBER 3]` | Documentation, Report & Video | README, USECASE, this report, video script, video recording and editing, screenshots, submission logistics | **30%** |

Each member confirms by signing below that the percentages above reflect their actual contribution.

| Member | Signature | Date |
|---|---|---|
| `[MEMBER 1]` | __________________ | __ / __ / 2026 |
| `[MEMBER 2]` | __________________ | __ / __ / 2026 |
| `[MEMBER 3]` | __________________ | __ / __ / 2026 |

---

## Appendix B — Repository Layout

```
student-performance-UCI/
├── README.md                  Project overview and getting-started guide
├── USECASE.md                 Problem framing and four-step reasoning pipeline
├── REPORT.md / REPORT.docx    This report
├── VIDEO_SCRIPT.md            Scene-by-scene script for the submission video
├── TEAM_INFO.md               Team table + Google Sheet copy-paste source
├── LICENSE
├── vercel.json                Static deploy configuration (outputDirectory: "web")
├── analysis/
│   ├── analyze.py             One-shot pipeline: clean → corr → K-Means → RF → export
│   └── eda.ipynb              Annotated notebook companion
├── data/
│   ├── raw/
│   │   ├── student-mat.csv    UCI raw — Math, n = 395
│   │   └── student-por.csv    UCI raw — Portuguese, n = 649
│   └── processed/
│       └── clean_students.csv n = 1,044, 35 columns
├── visual/                    Static plots from the EDA notebook
│   ├── correlations.png
│   ├── elbow.png
│   ├── g2_vs_g3.png
│   └── grade_distributions.png
├── docs/screenshots/          Dashboard screenshots for documentation
│   ├── dashboard-light.jpg
│   └── dashboard-dark.jpg
└── web/                       Deploy root (vercel.json points here)
    ├── index.html
    ├── style.css
    ├── main.js
    ├── data/clean_students.csv
    └── charts/
        ├── scatter.js
        ├── importance.js
        ├── personas.js
        ├── risk.js
        ├── progression.js
        ├── histogram.js
        └── utils.js
```

---

## Appendix C — Figures

The following images are stored in the repository and should be embedded in the rendered `.docx` version of this report at the locations referenced below.

| Figure | File | Referenced in |
|---|---|---|
| 1 | `docs/screenshots/dashboard-light.jpg` | §1, §5, §6 — overall dashboard layout |
| 2 | `docs/screenshots/dashboard-dark.jpg` | §5.4 — dark-mode rendering |
| 3 | `visual/correlations.png` | §4.1, §7.1 — Pearson correlation matrix |
| 4 | `visual/elbow.png` | §4.3 — K-Means elbow-method support for k = 3 |
| 5 | `visual/g2_vs_g3.png` | §4.2, §7.1 — bivariate G2 vs G3 with OLS line |
| 6 | `visual/grade_distributions.png` | §4.6, §7.4 — G1/G2/G3 distributions with the G3 = 0 spike |

---

## Appendix D — Pre-submission Checklist

Tick before submitting:

- [ ] All `[BRACKETED]` placeholders in the cover page and Appendix A replaced with real names, student IDs, and emails.
- [ ] Original Kaggle dataset name confirmed and inserted in §3.2 (replace the editorial note).
- [ ] Video recorded, ≤ 15 minutes, exported at 1080p / 30 fps.
- [ ] Video uploaded to Google Drive; shareable link copied.
- [ ] This report exported to `REPORT.docx`.
- [ ] Google Sheet row at <https://docs.google.com/spreadsheets/d/13tdSCmP19CvT0MDo6W5uUubkfSkKew13fpfkgUejrb0/edit?gid=0#gid=0> filled.
- [ ] Submission to Google Drive (video + report).
- [ ] Submission to Blackboard (report).
- [ ] Final read-through of the report by all members.
