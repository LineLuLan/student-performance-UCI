# Team Information

> **Action required:** Replace every `[BRACKETED]` placeholder before submission.
> Percentages below are a *starting suggestion* based on the workstreams visible in the repository — adjust to reflect actual contributions.

## Project

| Field | Value |
|---|---|
| **Project title** | Student Risk Early Warning: An Interactive Analytical Dashboard on the UCI Student Performance Dataset |
| **Course** | Data Science and Data Visualization |
| **Instructor** | M.Sc. T. T. Tung |
| **Institution** | International University — Vietnam National University Ho Chi Minh City (IU — VNU-HCM) |
| **Submission date** | 16 May 2026 |
| **GitHub repository** | https://github.com/LineLuLan/student-performance-UCI |
| **Live deployment** | https://student-uci-dashboard.vercel.app/ |
| **Video (Google Drive)** | `[PASTE SHAREABLE DRIVE LINK AFTER UPLOAD]` |

## Members

| # | Full name | Student ID (MSSV) | Email | Role |
|---|---|---|---|---|
| 1 | **Tran Nam Anh** *(Leader)* | **ITDSIU23030** | tnanh.gdsciu@gmail.com | Data & ML Engineering |
| 2 | **Nguyen Duc Hai** | **ITDSIU23006** | ngduchaidev0301@gmail.com | Visualization & Frontend |
| 3 | **Dang Minh Phat** | **ITDSIU23017** | dangminhphat753@gmail.com | Documentation, Report & Video |

> If your team has only **two** members, merge the third row's responsibilities into one of the others — see "Two-member variant" at the end of this file.

## Contribution breakdown (three-member team)

| Member | Primary deliverables | Files / artifacts owned | Share |
|---|---|---|---|
| **Tran Nam Anh — Data & ML Engineer** *(Leader, ITDSIU23030)* | UCI raw data ingestion, cleaning pipeline, feature engineering (`at_risk` target, subject column), Pearson correlation analysis, K-Means clustering with `StandardScaler` and elbow-method *k* selection, Random Forest training with stratified split and `class_weight='balanced'`, 5-fold stratified cross-validation, Logistic-Regression and Decision-Tree baselines, subject-stratified Random Forest models (combined / Math / Portuguese), EDA notebook & static plots, hardcoding ML numbers into the frontend chart modules | `analysis/analyze.py`, `analysis/eda.ipynb`, `data/processed/clean_students.csv`, `web/data/clean_students.csv`, `visual/correlations.png`, `visual/elbow.png`, `visual/g2_vs_g3.png`, `visual/grade_distributions.png`, the constant blocks inside `web/charts/importance.js`, `web/charts/personas.js`, `web/charts/risk.js` | **35%** |
| **Nguyen Duc Hai — Visualization & Frontend** *(ITDSIU23006)* | All six D3 v7 chart modules (lollipop, scatter, K-Means personas, confusion matrix, spaghetti+bands, histogram+KDE), main state machine (subject toggle, view switcher, chip filter, KPI bar, insight strip), cross-card linking, seeded LCG jitter, light/dark theme system with `localStorage` persistence, 24-column responsive CSS grid, accessibility baseline (focus-visible, prefers-reduced-motion, aria-live, aria-pressed), live subject-toggle model switching in `risk.js`, orange/blue palette fix and chip-filter colour-stability fix, Vercel deployment configuration | `web/index.html`, `web/main.js`, `web/style.css`, `web/charts/scatter.js`, `web/charts/importance.js`, `web/charts/personas.js`, `web/charts/risk.js`, `web/charts/progression.js`, `web/charts/histogram.js`, `web/charts/utils.js`, `vercel.json` | **35%** |
| **Dang Minh Phat — Documentation, Report & Video** *(ITDSIU23017)* | README authorship and architecture diagram, USECASE.md problem framing and four-step pipeline write-up, the academic report (this submission), video script and recording, video editing, screenshots for documentation, submission to Google Drive / Google Sheet / Blackboard | `README.md`, `USECASE.md`, `REPORT.docx`, `VIDEO_SCRIPT.md`, `docs/screenshots/dashboard-light.jpg`, `docs/screenshots/dashboard-dark.jpg`, the final video file, the Google Sheet row, the Blackboard upload | **30%** |
| **Total** | | | **100%** |

## Two-member variant (use only if your team is two people)

Merge the Documentation role into one of the engineering roles. Pick whichever member did more of the written/presentation work.

| Member | Primary deliverables | Share |
|---|---|---|
| **`[MEMBER A]` — Data, ML & Documentation** | Everything in Member 1's row above + the report, video script, recording, and submission | **55–65%** |
| **`[MEMBER B]` — Visualization & Frontend** | Everything in Member 2's row above; possibly some documentation if it makes the split more even | **35–45%** |

## Signatures

By signing below, each member confirms that the contribution percentages above accurately reflect their work on this project.

| Member | Signature | Date |
|---|---|---|
| Tran Nam Anh | __________________ | __ / __ / 2026 |
| Nguyen Duc Hai | __________________ | __ / __ / 2026 |
| Dang Minh Phat | __________________ | __ / __ / 2026 |

## Google Sheet row (copy-paste source)

Paste this single line into the lecturer's Google Sheet at <https://docs.google.com/spreadsheets/d/13tdSCmP19CvT0MDo6W5uUubkfSkKew13fpfkgUejrb0/edit?gid=0#gid=0>. Only the team number and the Drive video link still need to be filled in.

```
Team [TEAM NUMBER] | Tran Nam Anh (ITDSIU23030), Nguyen Duc Hai (ITDSIU23006), Dang Minh Phat (ITDSIU23017) | Student Risk Early Warning — UCI Student Performance Dashboard | https://github.com/LineLuLan/student-performance-UCI | https://student-uci-dashboard.vercel.app/ | [DRIVE VIDEO LINK]
```
