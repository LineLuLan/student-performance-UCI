# Video Script — Student Risk Early Warning Dashboard

**Target duration:** 13 minutes 30 seconds (sits comfortably inside the 10–15 min window).
**Style reference:** Perin, Vuillemot & Fekete, *À Table! Improving Temporal Navigation in Soccer Ranking Tables*, CHI 2014 (Inria AVIZ). An academic paper-demo video — calm declarative voiceover over a screen recording, no talking head, no music or only very subtle ambient.
**Pacing target:** ~135 words/minute. Read the narration once silently, twice aloud, then record.

---

## How to use this script

Each scene has three columns:

- **Timestamp** — when the scene starts and ends. Watch the OBS timer.
- **On-screen action** — exactly what the cursor and the page do. Rehearse these clicks once with the script muted before recording with voice.
- **Narration** — read **verbatim**. Square brackets `[ … ]` are speaking notes, not words to say.

If you flub a sentence, **pause for two full seconds and re-read the sentence from the beginning** — the silence is easy to cut in post.

---

## Pre-flight checklist (do this once before recording)

- [ ] Open <https://student-uci-dashboard.vercel.app/> in a new Chrome incognito window.
- [ ] Resize the window to 1440 × 900 (or as close as your screen allows).
- [ ] Confirm all six cards render, the KPI bar shows numbers, dark mode toggle works.
- [ ] Set zoom level to 100% (`Ctrl + 0`).
- [ ] Hide the bookmarks bar (`Ctrl + Shift + B`).
- [ ] Close every other tab and Slack / Discord / mail notifications.
- [ ] OBS scene: one source = the browser window, capture at 1920 × 1080 / 30 fps.
- [ ] Enable a cursor highlighter (OBS plug-in or system-level tool like Mouseposé).
- [ ] Mic check — record 10 seconds of silence + a sentence, play it back, confirm no fan / typing noise.
- [ ] Have the title and "Part 2" interstitial slide images ready on the desktop (see *Slide assets* below).

---

## Slide assets to prepare (3 static images, 1920 × 1080)

You can build these in Google Slides, Keynote, or even a single Figma frame each. Plain background, large type, no logos other than your university's if you wish.

| Slide | Contents |
|---|---|
| **Title card** | *Student Risk Early Warning* / *An Interactive Dashboard on the UCI Student Performance Dataset* / Team names / Course code / Month 2026 |
| **Dataset slide** | *Dataset · UCI Student Performance (Cortez & Silva, 2008)* / Cohort: 1,044 students (Math 395 + Portuguese 649) / Pass threshold: G3 ≥ 10 / Class imbalance: 22% at-risk minority / Six research questions answered by six dashboard cards |
| **Part 2 interstitial** | *Part 2 · A teacher's question, answered in clicks* — minimalist single-line slide |
| **End card** | Citation: *Cortez & Silva, 2008* / GitHub: github.com/LineLuLan/student-performance-UCI / Live demo: student-uci-dashboard.vercel.app / Team names / *Thank you.* |

---

## Scene 1 · Title card (0:00 – 0:25)

| | |
|---|---|
| **On-screen** | Title slide static for the full 25 seconds. |
| **Narration** | *"By the time a secondary-school teacher sees a failing final grade, it is too late to intervene. In the UCI Student Performance dataset, twenty-two percent of students fail their final exam. But the data already contains the signals to identify them earlier. This is a dashboard that surfaces those signals, and lets a teacher reason about them, end to end."* |

## Scene 2 · Dataset & research questions (0:25 – 0:55)

| | |
|---|---|
| **On-screen** | Cut to the dataset slide. Hold static. |
| **Narration** | *"We use the canonical UCI Student Performance dataset from Cortez and Silva, two thousand eight — one thousand and forty-four students across two Portuguese secondary schools and two subjects. The target is at-risk equals one when the final grade falls below ten out of twenty — the Portuguese pass threshold. The dashboard answers six research questions through six interactive cards."* |

## Scene 3 · Cut to the dashboard (0:55 – 1:00)

| | |
|---|---|
| **On-screen** | Cut to the live deployment. Show the full dashboard at default state for two beats. |
| **Narration** | *"This is the dashboard."* [pause, let viewer take in the layout for two seconds] |

---

# PART 1 · Components of the visualization (1:00 – 6:30)

Each component follows the same micro-structure: **question → chart → encoding → readout.** Keep cursor movements deliberate.

## Scene 4 · Key Drivers + RF Importance toggle (1:00 – 2:15)

| | |
|---|---|
| **On-screen** | Move cursor to the *Key Drivers of Final Grade* card. Pause one second. Hover the top lollipop (grade_mid2). Tooltip appears. Then hover the `failures` row. Tooltip appears. Cursor moves to the **Pearson r | RF Importance** toggle in the card header — click **RF Importance**. Chart redraws with blue lollipops. Hover the *Absences* row — tooltip shows RF importance 0.052 with the "non-linear, no sign" badge. Then click the **Pearson r** button to return. |
| **Narration** | *"The first card answers: which signals matter at all? We compute the Pearson correlation between each of fifteen numeric features and the final grade, and visualise the top ten by absolute value. Green stems are protective factors — the second midterm at r equals zero point nine one, the first midterm at zero point eight one. Red stems are risk factors — past failures at negative zero point three eight. But Pearson only captures linear effects. The card has a second mode: toggle to **Random Forest Importance**." — click the toggle. — "The same chart redraws against the trained Random Forest's Gini importance. Look at absences: in Pearson mode, absences sat at rank fifteen with r equals negative zero point zero four six — so weak it was dropped from the visualisation entirely. In Random Forest mode, absences is rank four, at zero point zero five two. That is the signature of a threshold effect — a student with zero to three absences passes at the cohort rate, but a student with ten or more is sharply more at-risk — and a linear coefficient averages it to nothing while a tree ensemble splits at the threshold and catches it. The toggle turns a hidden statistical phenomenon into a visible card behaviour."* — toggle back to Pearson before the next scene. |

## Scene 5 · Grade Correlation (1:50 – 2:40)

| | |
|---|---|
| **On-screen** | Move cursor to *Grade Correlation* card. Pause. Hover one dot below the pass line — tooltip shows per-student profile. Move cursor along the OLS line. Hover one dot above the pass line. |
| **Narration** | *"The second card asks: is the relationship real at the individual level? We plot the final grade against any chosen feature as a scatter, with seeded jitter so identical filter state always produces identical positions — the chart never visually flickers. The OLS line gives us a sense of slope and fit; r and R-squared are reported in the header. A horizontal line marks the pass threshold at grade ten. Each dot carries a full per-student profile on hover."* |

## Scene 6 · Behavioural Profiles (2:40 – 3:35)

| | |
|---|---|
| **On-screen** | Move cursor to *Student Behavioural Profiles* card. Click the *Focused Achievers* tab. Pause two seconds reading the attribute bars. Click *Average Learners*. Pause. Click *Social Risk Group* — linger on the at-risk badge reading "29.4%". |
| **Narration** | *"The third card answers: are there distinct types of students? We run K-Means with k equals three on four standardised lifestyle features — study time, absences, going-out frequency, and weekend alcohol — deliberately excluding the grades themselves so the clustering is not circular. The elbow method supports three clusters. We name them in plain language. Focused Achievers — two hundred and seven students, twelve point six percent at-risk. Average Learners — five hundred and twenty-four students, twenty-one point four percent. And the Social Risk Group — three hundred and thirteen students, twenty-nine point four percent at-risk. Like the Risk Predictor, this card is subject-aware: when the user toggles the Subject filter, all three K-Means clusters re-fit on the corresponding sub-cohort. We'll see in Part 2 that the same Social Risk archetype carries twenty-percent-different operational urgency depending on whether the teacher is teaching Math or Portuguese."* |

## Scene 7 · Dropout Risk Predictor (3:35 – 4:30)

| | |
|---|---|
| **On-screen** | Move cursor to *Dropout Risk Predictor*. Pause. Hover each of the four matrix cells in order: caught, false-alarm, missed, all-clear. Then hover the *Recall* metric bar. The header reads *"ALL SUBJECTS · n=209 test"*. |
| **Narration** | *"The fourth card asks: can a model flag at-risk students before the final exam, and what is the cost of being wrong? We train a Random Forest with two hundred trees on a stratified eighty-twenty split, with class-weight balanced to compensate for the twenty-two-percent minority. On a held-out test set of two hundred and nine students, the combined model catches thirty-eight of forty-six at-risk students. Eight are missed. We render the full confusion matrix because, in an early-warning system, the cost of a missed student is much higher than the cost of a false alarm. That is why MISSED is rendered in red, and why we lead the metrics with recall at eighty-two point six percent — not accuracy. The card actually switches between three models — combined, Math-only, and Portuguese-only — when the user toggles the subject. We'll see this live in Part 2."* |

## Scene 8 · Progression (4:30 – 5:15)

| | |
|---|---|
| **On-screen** | Move cursor to *Period-by-Period Progression*. Hover one group's mean dot at G3 — tooltip shows mean, sigma, N. Open the group-by dropdown briefly to show options, close. |
| **Narration** | *"The fifth card answers: how do grades evolve from the first midterm to the final, and do subgroups diverge? Each spaghetti line is one student; the bold lines are group means; the shaded bands are plus-or-minus one standard deviation. The Y-axis is data-tight rather than fixed at zero to twenty, so one-or-two-point group differences are visible rather than invisible. The group-by dropdown is independent of the global view-switcher, so a teacher can compare progression across one dimension while the rest of the dashboard is faceted by another."* |

## Scene 9 · Distribution (5:15 – 5:55)

| | |
|---|---|
| **On-screen** | Move cursor to *Grade Distribution*. Toggle G1 → G2 → G3. Land on G3. Hover the G3 = 0 bar — tooltip shows "53 students withdrew." |
| **Narration** | *"The sixth card answers: what structure does the grade distribution reveal? Bars are coloured by pass-fail at the threshold of ten; a KDE overlay traces the shape. The most important finding here is not in the central distribution. It is here. At grade equals zero, fifty-three students — five point one percent of the cohort — withdrew before the final exam. The distribution is bimodal. This failure mode is invisible to summary statistics alone — the mean and median both look healthy."* |

## Scene 10 · Global controls (5:55 – 6:30)

| | |
|---|---|
| **On-screen** | Click subject toggle: *Both* → *Math* → *Portuguese*. KPI bar recomputes each time. Click view-by: *Gender* → *School*. Colours shift across every chart. Click a chip to filter out *Male*. Then back to *Both*. Toggle dark mode on, off. |
| **Narration** | *"Four global controls personalise every step of the reasoning. The subject toggle filters the cohort to math or Portuguese. The view-by switcher recolours every chart along one semantic axis — here, gender, then school. The chip filter selects a sub-cohort. And the dark-mode toggle swaps the entire palette via CSS variables, persists to local storage, and respects the operating-system preference on first load. The KPI bar and insight strip recompute live on every change."* |

---

## Scene 11 · Transition interstitial (6:30 – 6:50)

| | |
|---|---|
| **On-screen** | Cut to the Part-2 interstitial slide. Hold for the full 20 seconds. |
| **Narration** | *"That was the toolkit. Now let's watch it answer one teacher's question, end to end, in clicks."* [pause, let the slide breathe for the remaining seconds before Part 2 starts] |

---

# PART 2 · Use case walkthrough (6:50 – 12:30)

One continuous live demo. No cuts between cards — the cursor moves naturally between them as a real user would. This is the CHI-paper-demo signature.

## Scene 12 · Scenario setup (6:50 – 7:20)

| | |
|---|---|
| **On-screen** | Cut back to the dashboard. Default state. Cursor parked at the top-left. |
| **Narration** | *"Here is the question. A coordinator at one of the two schools asks: among Portuguese-class students, looking at the female cohort, which students are most at risk? Why? And how confident is the model that we are catching the right ones? Let's walk it."* |

## Scene 13 · Filter the cohort (7:20 – 8:00)

| | |
|---|---|
| **On-screen** | Click *Subject = Portuguese*. KPI numbers change — pause one second. Click *View by = Gender*. Chips appear: Female, Male. Click the *Male* chip to remove it; Female remains active. Pause two seconds while the dashboard redraws. |
| **Narration** | *"First, filter. Subject Portuguese. View by gender. Then toggle the male chip off, leaving only female students. Every card redraws. The KPI bar now reports the new cohort size, the new average grade, and the new at-risk percentage for this slice. The insight strip summarises the gender gap in one sentence."* |

## Scene 14 · Step 1 — Find the strongest negative signal (8:00 – 8:40)

| | |
|---|---|
| **On-screen** | Move cursor to *Key Drivers*. Scan the lollipops from top to bottom. Linger on the `failures` dot — its r-value label reads. Click `failures`. |
| **Narration** | *"Step one. Which signal matters most for this sub-cohort? In Key Drivers, the strongest negative correlate is past failures, at r equals negative zero point three eight. Among the levers a teacher can actually act on — as opposed to immutable attributes like family size — this is the largest. Click it."* |

## Scene 15 · Step 2 — Confirm per-student (8:40 – 9:30)

| | |
|---|---|
| **On-screen** | The Grade Correlation scatter auto-pivots. X-axis now reads *failures*. Cursor traces the cliff from failures equals zero to failures equals one — most dots drop below the pass line. Hover one dot at failures = 2 below the pass line. |
| **Narration** | *"Step two. The scatter pivots its X-axis to failures. Now we can see the cliff at the individual level. With zero past failures, the cloud spans both sides of the pass line. With even one failure, the cloud collapses below ten. With two or three failures, almost every student is at-risk. This is the relationship made concrete — not a single r-value, but a population shape."* |

## Scene 16 · Step 3 — Segment the population (9:30 – 10:20)

| | |
|---|---|
| **On-screen** | Move cursor to *Student Behavioural Profiles*. Click the *Social Risk Group* tab. Pause two seconds. Hover the *absences* attribute bar — tooltip shows the group mean compared to the cohort. Hover *alcohol_weekend*. |
| **Narration** | *"Step three. Which type of student owns this risk? The Social Risk Group. Their absences are about double the cohort mean. Their weekend alcohol score is three point seven on a five-point scale, where the cohort mean is one point seven. Their at-risk rate is twenty-nine point four percent — almost a third. A teacher who reaches this student needs to know they are part of a behavioural pattern, not a one-off failure."* |

## Scene 17 · Step 4 — What the model says (10:20 – 11:20)

| | |
|---|---|
| **On-screen** | Move cursor to *Dropout Risk Predictor*. The header now reads *"PORTUGUESE ONLY · n=130 test"* — the card has already re-stratified to the Portuguese model because the Subject toggle is on Portuguese. Hover the *MISSED* cell (FN = 5). Hover the *Recall* metric bar (75.0%). |
| **Narration** | *"Step four. Look at the header — the card is now showing the Portuguese-only Random Forest, automatically, because the subject toggle is on Portuguese. On the Portuguese held-out test set of one hundred and thirty students, the model catches fifteen of twenty at-risk cases. Five are missed. Recall is seventy-five percent. That is the honest number for this sub-cohort — and it is meaningfully lower than the combined model's eighty-two point six percent, because the Portuguese cohort has a smaller at-risk minority and fewer positive examples to learn from."* |

## Scene 17b · Live model + persona stratification (11:20 – 12:10)

| | |
|---|---|
| **On-screen** | Click *Subject = Math*. The Risk Card header re-renders to *"MATH ONLY · n=79 test"*; recall jumps to **88.5%**; MISSED drops to 3. **The Behavioural Profiles card re-fits at the same time — with the Social Risk tab still active, the at-risk badge rises to 42.1%.** Pause two seconds. Click *Subject = Portuguese*. Risk Card → 75.0% recall. **Behavioural Profiles Social Risk badge drops to 21.3%.** |
| **Narration** | *"Watch this. Toggle to Math. Two cards retrain together — the Risk Predictor switches to the Math-only Random Forest, recall jumps to eighty-eight point five percent. And the Behavioural Profiles card re-fits K-Means on the Math cohort: the Social Risk Group's at-risk badge climbs from twenty-nine to forty-two percent. Toggle to Portuguese. Risk recall drops to seventy-five percent; the Social Risk badge falls to twenty-one percent. Same archetype — high absences, high alcohol — but the operational urgency is half what it was in Math. Two cards moving together turn subject-conditional risk into direct manipulation. For Part Two we leave it on Portuguese."* |

## Scene 18 · Cross-check (12:10 – 12:40)

| | |
|---|---|
| **On-screen** | Move cursor to *Progression*. Open the group-by dropdown, select *Gender*. Look at the female mean line from G1 to G3. Hover the G3 mean dot. Then move to *Distribution* — toggle to G3 — point the cursor at the G3 = 0 spike. |
| **Narration** | *"Cross-check across two more views. The progression chart, regrouped by gender for the Portuguese cohort, shows the female mean trajectory across the three periods. The standard-deviation bands tell us how dispersed the cohort is around the mean. And in the distribution panel, the G3-equals-zero spike of withdrawals is visible at the left edge. The pattern is consistent — the bimodality is not an artefact, it is a population of withdrawals embedded in the cohort."* |

## Scene 19 · Theme & responsiveness (12:40 – 13:05)

| | |
|---|---|
| **On-screen** | Toggle dark mode on. Wait for redraw. Resize the browser window — drag the right edge in, then back out. Each chart re-lays out independently. |
| **Narration** | *"Two short notes on craft. Dark mode persists across reloads and respects the operating-system preference on first load. And the dashboard responds to container resize — each chart redraws independently when its card changes size, not when the viewport does. The reasoning fits on one screen on a standard fourteen-forty-by-nine-hundred display, with no scroll."* |

---

# Closing (13:05 – 14:05)

## Scene 20 · Findings recap (13:05 – 13:35)

| | |
|---|---|
| **On-screen** | Cut to a static slide with four large lines: *r = 0.91 (G2 → G3)* / *Combined recall 82.6% — 8 missed; Math recall 88.5% — 3 missed; Portuguese recall 75.0% — 5 missed* / *5-fold CV recall 79.1% ± 8.1 pp* / *53 withdrawals (5.1% of cohort)*. |
| **Narration** | *"Four numbers to remember. R equals zero point nine one — the second midterm is an almost-deterministic predictor of the final. Recall across the three stratified models — eighty-two point six percent combined, eighty-eight point five on Math alone, seventy-five on Portuguese alone — showing that the combined model is essentially a weighted average. Five-fold cross-validation recall seventy-nine point one percent plus-or-minus eight — the result is stable. And fifty-three withdrawals — a failure mode the summary statistics would have hidden."* |

## Scene 21 · Honest limitations (13:35 – 13:55)

| | |
|---|---|
| **On-screen** | Static slide, two bullet lines: *ML numbers are hardcoded — re-run analyze.py to refresh all subject-stratified blocks.* / *Read-only dashboard — no per-student inference UI yet.* |
| **Narration** | *"Two limitations we report openly. The machine-learning numbers are hardcoded into the front end; refreshing them requires re-running the Python pipeline. And the dashboard is read-only — there is no live per-student prediction panel; that is on the roadmap. Pearson linearity, single hold-out, and combined-cohort modelling — all three are addressed in the body of the work."* |

## Scene 22 · End card (13:55 – 14:05)

| | |
|---|---|
| **On-screen** | End-card slide: citation, GitHub URL, live URL, team names, *"Thank you."* |
| **Narration** | *"Thank you for watching."* |

---

# Total running time

| Section | Duration |
|---|---|
| Title + dataset slides | 0:55 |
| Part 1 (six components + global controls, incl. Scene 4 RF Importance toggle demo) | 5:55 |
| Transition | 0:20 |
| Part 2 (use case walkthrough, incl. live model + persona stratification scene 17b) | 6:30 |
| Closing (4-number recap + limitations + end card) | 1:00 |
| **Total** | **14:40** |

Sits inside the 10–15 min window with ~20 seconds of headroom for natural pauses. **Two "wow moments" in the script:** the Pearson↔RF Importance toggle in Scene 4 (showing `absences` jumping from rank 15 to rank 4) and the live Subject-toggle stratification in Scene 17b (showing two cards moving together — Risk recall 82.6% → 88.5% Math-only, and Behavioural Profiles Social Risk badge 29.4% → 42.1% Math-only).

---

# Recording workflow

## Recommended tools

| Purpose | Free option | Paid option |
|---|---|---|
| Screen + voice recording | **OBS Studio** | Camtasia |
| Audio cleanup (denoise, normalise) | **Audacity** | Adobe Audition |
| Editing & joining takes | **DaVinci Resolve** (free tier) | Premiere Pro |
| Cursor highlighting | **Cursor Highlighter** (built into OBS via plug-in) | Mouseposé (Mac) |

## Two-take strategy

Record Part 1 separately, then Part 2 separately, then join in a video editor. Each take is around six minutes — much easier to re-do than one continuous fourteen-minute take.

1. **Take 1 — Title + Dataset + Part 1** (Scenes 1 – 10, target 6:30)
2. **Take 2 — Transition + Part 2 + Closing** (Scenes 11 – 22, target 7:00)

Join in your editor, add slide images for Scenes 1, 2, 11, 20, 21, 22, export at 1080p / 30 fps.

## Voice direction

- **Pace.** Aim for ~135 words per minute. The lines above are timed at that pace. If you finish a scene before its slot ends, just wait — silence is fine in a paper-demo video.
- **Tone.** Calm, declarative, present tense. Not energetic. Not casual. Imagine you are presenting at a conference, not on TikTok.
- **Diction.** Practise the numbers out loud first — *"zero point nine one"*, *"twenty-two percent"*, *"r equals negative zero point three eight"*. Awkward numbers are the most common re-take cause.
- **Re-take rule.** Any sentence with a stumble — pause two seconds and re-read from the start of the sentence. Cuts are trivial in post.

## Music & audio polish

- **Music: none.** This is the CHI-paper-demo default. The only acceptable use is a very quiet ambient pad under the title and end cards, at less than −20 dB so it never competes with the voice.
- **Denoise.** Run Audacity's noise reduction with a 0.5-second sample of room silence first.
- **Normalise.** Target peak −3 dB, RMS around −18 dB. YouTube and Google Drive both normalise audio on playback; the key is consistent loudness across scenes.

## Final review

Watch the full cut once at **1× speed** (catch jump cuts, audio gaps), once at **0.5× speed** (catch visual artefacts and unexpected cursor jumps), and once **without looking at the screen** (does the narration alone tell the story?). Re-edit until all three passes are clean.
