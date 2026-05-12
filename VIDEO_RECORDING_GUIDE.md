# Video Recording Guide

Companion to `VIDEO_SCRIPT.md`. The script is *what to say*; this guide is *who says what, how to move the cursor, and how to make each chart land in the recording*.

---

## 1. Audit summary — is the script + report ready?

**Numbers cross-check:** every figure spoken in `VIDEO_SCRIPT.md` matches the corresponding entry in `REPORT.md` and the Python output of `analysis/analyze.py`. Verified for: cohort sizes (1,044 / 395 / 649), test-set sizes (209 / 79 / 130), recalls (combined 82.6%, Math 88.5%, Portuguese 75.0%), CV recall (79.1% ± 8.1pp), Pearson coefficients (G2 0.91, G1 0.81, failures −0.38), RF importance (absences 0.052 at rank 4 vs Pearson rank 15), cluster percentages across the 3 × 3 subject-cluster matrix, withdrawal count (53 = 5.1%), and the gender-fairness audit (Female recall 91.3% vs Male 73.9%, disparity ratio 0.81).

**Speaking time vs slot length** (measured at 135 words/minute, the script's stated pace):

| Total speaking time @ 135 wpm | 12 min 55 s |
|---|---|
| Total speaking time @ 145 wpm (recommended) | ~12 min 00 s |
| Plus UI interaction pauses (~1:30 across the recording) | adds ~1:30 |
| **Realistic recording length @ 145 wpm** | **~13:30 (safely under the 15-min cap with ~1:30 of headroom)** |

**Six scenes are slightly over their declared slot at 135 wpm.** This is fine — slightly fast pacing absorbs it, and post-edit cuts smooth the rest. Do not trim wording.

| Scene | Slot | At 135 wpm | At 145 wpm | Verdict |
|---|---:|---:|---:|---|
| 4 (Key Drivers + RF toggle) | 75 s | 98 s | 91 s | Mild over — keep the full pitch (this is a "wow moment") |
| 6 (Behavioural Profiles) | 55 s | 64 s | 60 s | Mild over — fine |
| 7 (Risk Predictor) | 55 s | 64 s | 60 s | Mild over — fine |
| 18 (Cross-check) | 30 s | 33 s | 31 s | Trivial over |
| 20 (Findings recap) | 30 s | 36 s | 33 s | Mild over |
| 21 (Limitations) | 20 s | 25 s | 23 s | Mild over |

**Five placeholders still to fill manually before submission** (none of them stop recording — they go on the slides and in REPORT/TEAM_INFO files):

1. Course code + course name (REPORT cover, TEAM_INFO project block, Title slide)
2. Instructor name (REPORT cover, TEAM_INFO)
3. Email addresses for **Nguyen Duc Hai** and **Dang Minh Phat** (TEAM_INFO)
4. Team number for the Google Sheet row (TEAM_INFO)
5. Drive video URL (REPORT cover footer + TEAM_INFO — fill after upload)

**Verdict: script + report are recording-ready.** Fill the placeholders before you re-export REPORT.docx, then record.

---

## 2. Who reads what — Phat vs Hai vs Anh

**Recommended assignment** (built around each member's role, the script's narrative structure, and which scenes need dashboard interaction):

| Role | Person | Speaks during | Operates the cursor during | Total speaking time |
|---|---|---|---|---:|
| **Operator** | **Tran Nam Anh** *(Leader)* | — (no narration) | Whole recording | 0:00 |
| **Narrator A — framing / storytelling** | **Dang Minh Phat** | Scenes 1, 2, 3, 11, 12, 13, 14, 15, 16, 17, 17b, 18, 19, 20, 21, 22 | — | ~7:00 |
| **Narrator B — component demos** | **Nguyen Duc Hai** | Scenes 4, 5, 6, 7, 8, 9, 10 | — | ~5:30 |

**Rationale for this split.** Phat owns Documentation/Report/Video; he knows the narrative thread (Part 2 is a use-case story). Hai owns Visualization/Frontend; he built the cards, so his voice carries authority when he describes them. Anh leads the project and knows the ML behaviour intimately, so he is the most reliable operator (cursor timing has to match every metric jump). All three contribute to the recording; only Phat and Hai are on the audio track.

### Scene-by-scene assignment

| Scene | Time | Speaker | Operator action |
|---|---|---|---|
| 1 Title card | 0:00–0:25 | **Phat** | Slide image, no cursor |
| 2 Dataset & RQs | 0:25–0:55 | **Phat** | Slide image, no cursor |
| 3 Cut to dashboard | 0:55–1:00 | **Phat** | Switch to live dashboard, cursor parked top-left |
| 4 Key Drivers + RF toggle | 1:00–2:15 | **Hai** | See §3 below — most complex scene |
| 5 Grade Correlation | 1:50–2:40 | **Hai** | Hover scatter dots |
| 6 Behavioural Profiles | 2:40–3:35 | **Hai** | Tab clicks Focused → Average → Social Risk |
| 7 Dropout Risk Predictor | 3:35–4:30 | **Hai** | Hover 4 confusion-matrix cells |
| 8 Progression | 4:30–5:15 | **Hai** | Hover mean dot at G3 |
| 9 Distribution | 5:15–5:55 | **Hai** | G1→G2→G3 toggle, hover G3=0 bar |
| 10 Global controls | 5:55–6:30 | **Hai** | Subject toggle, view-by, chip, dark mode |
| 11 Transition | 6:30–6:50 | **Phat** | Slide image |
| 12 Scenario setup | 6:50–7:20 | **Phat** | Dashboard default state, cursor parked |
| 13 Filter cohort | 7:20–8:00 | **Phat** | Subject=Por, View=Gender, chip Male off |
| 14 Find strongest signal | 8:00–8:40 | **Phat** | Hover lollipops, click `failures` |
| 15 Confirm per-student | 8:40–9:30 | **Phat** | Cursor sweep over the cliff in scatter |
| 16 Segment the population | 9:30–10:20 | **Phat** | Click Social Risk tab, hover bars |
| 17 What the model says | 10:20–11:20 | **Phat** | Hover MISSED cell, Recall bar |
| 17b Live model + persona | 11:20–12:10 | **Phat** | Subject Math → Portuguese — the second wow moment |
| 18 Cross-check | 12:10–12:40 | **Phat** | Progression by Gender, Distribution G3 |
| 19 Theme & responsiveness | 12:40–13:05 | **Phat** | Dark mode, window resize |
| 20 Findings recap | 13:05–13:35 | **Phat** | Slide image |
| 21 Honest limitations | 13:35–13:55 | **Phat** | Slide image |
| 22 End card | 13:55–14:05 | **Phat** *(or both together)* | Slide image |

### Two-take strategy (recommended)

Record audio + screen **separately**, combine in post:

1. **Anh records the screen** with only the cursor movements and clicks — no audio (or audio muted in OBS). The full recording should be ~14 minutes of pure UI demo with appropriate pauses. He runs through the whole script in one or two takes following the cursor cues in column 2 of each scene.
2. **Hai records his audio** at his own pace, scene by scene, in any quiet room. He doesn't need to watch the screen — he reads the narration cells aloud. One scene at a time. Stumble → pause 2 s → re-read the sentence. Cuts are free in post.
3. **Phat records his audio** the same way.
4. **Editor (Anh or Phat)** aligns the audio tracks against the screen recording's cursor cues. This is much easier than syncing live, because each audio file is short and editable.

**Why this is dramatically better than live recording:**
- Hai doesn't have to be present when Phat records, and vice versa.
- No risk of keyboard / mouse-click noise on the voice track.
- Each person can re-take their own sentences without coordinating.
- Editor can adjust pace by stretching/shrinking the screen recording's pauses to fit the audio.

---

## 3. Cursor + interaction patterns (the "how to focus on each chart" answer)

The CHI-paper-demo style is **calm, deliberate, no-flair**. The cursor itself is the visual focus; we are not zooming, highlighting, or annotating in post. Three universal rules:

1. **Slow arc movement.** Move the cursor from card to card in a curved trajectory, never a straight line. ~1 second per card-to-card transition. Never a flick.
2. **Pause-before-click and pause-after-click.** 0.5 s of stillness before every click; 0.8–1.5 s of stillness after, so the UI render is visible before the cursor moves on.
3. **Hover and hold.** Tooltips need 1.5 s of stillness to be readable. The cursor should be motionless inside the tooltip while the narrator finishes the sentence about that element.

### Per-card recipes

#### Card 1 · Key Drivers (Scene 4 — the first wow moment)

| Step | Cursor action | Hold | Why |
|---|---|---|---|
| 1 | Enter card from top-left, glide to the top lollipop (`grade_mid2`) | 1.5 s | Establishes the strongest signal |
| 2 | Slide down 3 dots to `failures` (negative side) | 1.5 s | Establishes the strongest risk |
| 3 | Arc up to the **Pearson r \| RF Importance** toggle | 0.5 s pause then click **RF Importance** | The click is the moment |
| 4 | Cursor parked still | 1.0 s | Let the chart redraw without movement |
| 5 | Glide down to the `Absences` row in the new sorted order | **2.0 s** | This is the diagnostic finding — hold so the lecturer reads "0.052" |
| 6 | Arc back to the toggle, click **Pearson r** | 0.5 s | Reset for the next scene |

**Practice the numbers separately before recording.** Hai needs to deliver *"absences sat at rank fifteen with r equals negative zero point zero four six — so weak it was dropped from the visualisation entirely. In Random Forest mode, absences is rank four, at zero point zero five two"* without a stumble. Practice that exact sentence ten times before pressing record.

#### Card 2 · Grade Correlation (Scene 5)

| Step | Cursor action | Hold |
|---|---|---|
| 1 | Glide from Key Drivers to the scatter, land on a dot below the pass line | 1.5 s |
| 2 | Trace cursor along the OLS line from bottom-left to top-right | 2.0 s |
| 3 | Hover one dot above the pass line | 1.5 s |

The scatter is dense — pick dots that have headroom around them so the tooltip is readable.

#### Card 3 · Behavioural Profiles (Scene 6)

| Step | Cursor action | Hold |
|---|---|---|
| 1 | Glide to *Focused Achievers* tab, click | 2.0 s |
| 2 | Glide vertically down the attribute bars (study time → absences → goes out → alcohol) | ~3.0 s total |
| 3 | Click *Average Learners* tab | 1.5 s |
| 4 | Click *Social Risk Group* tab | **2.0 s — linger on the badge reading 29.4%** |

The badge colour is red on this tab. That visual is the punchline of the scene.

#### Card 4 · Dropout Risk Predictor (Scene 7)

| Step | Cursor action | Hold |
|---|---|---|
| 1 | Hover **TRUE NEG** (top-left, green, 153) | 1.2 s |
| 2 | Hover **FALSE POS** (top-right, yellow, 10) | 1.2 s |
| 3 | Hover **MISSED** (bottom-left, red, 8) | **2.0 s — operationally critical cell** |
| 4 | Hover **TRUE POS** (bottom-right, green, 38) | 1.2 s |
| 5 | Arc right to the *Recall* metric bar | 1.5 s |

The order matters: caught → false-alarm → missed → all-clear matches the narration. Going in the wrong order makes the voice-over feel disconnected.

#### Card 5 · Progression (Scene 8)

| Step | Cursor action | Hold |
|---|---|---|
| 1 | Glide to a group's mean dot at G3 | 1.5 s |
| 2 | Click the group-by dropdown to show options, click outside to close | 1.0 s |

Don't actually change the group-by here — that's a Part 2 action.

#### Card 6 · Distribution (Scene 9)

| Step | Cursor action | Hold |
|---|---|---|
| 1 | Click G1 toggle | 1.0 s |
| 2 | Click G2 toggle | 1.0 s |
| 3 | Click G3 toggle (land here) | 1.5 s |
| 4 | Glide to the G3 = 0 bar at the far left | **2.5 s — withdrawal finding** |

The withdraw bar is the punchline. Hover it last and longest.

### Cursor pattern for Scene 17b (the second wow moment)

This scene is the dashboard's signature trick — two cards retrain together. Cursor choreography matters:

1. **Cursor parked between Risk and Personas cards.** Both are visible in the same row.
2. **Click Subject = Math.** Do *not* move the cursor after clicking. Let it sit still for **2 full seconds**.
3. **In those 2 seconds, the eye moves from the Risk card (recall 88.5%) to the Personas card (Social Risk badge 42.1%) without the cursor moving.** The viewer's eye follows the numbers, not the cursor.
4. **After 2 seconds, click Subject = Portuguese.** Again, cursor still for 2 seconds. Eye follows Risk (75.0%) → Personas (21.3%).
5. **After 2 seconds, the cursor finally moves** to where the next scene begins.

The "watch this" beat is the cursor *not moving* while two numbers change. Resist the urge to gesture.

---

## 4. Practice protocol for the two wow moments

These two scenes carry disproportionate weight in the lecturer's impression. Spend ~30 minutes practising each before the final recording.

### Wow moment 1 — Scene 4 (Hai)

Drill the **absences sentence** in isolation. The hard part is *"r equals negative zero point zero four six"* (five separate spoken numerals) immediately followed by *"rank four, at zero point zero five two"* (four more numerals). Number sequences are the most common stumble source.

**Drill:** read the full Scene 4 narration aloud. Time it. Then read **only** the absences sentence five times in a row, paying attention to the consonant transitions (*"zero four six"* — the "f" in "four" follows a vowel "o", easy to slur). Then read the full scene again. The number sentence should now feel automatic.

### Wow moment 2 — Scene 17b (Phat)

The hard part is **eye discipline** more than diction. The narration is:

> *"Two cards retrain together — the Risk Predictor switches to the Math-only Random Forest, recall jumps to eighty-eight point five percent. And the Behavioural Profiles card re-fits K-Means on the Math cohort: the Social Risk Group's at-risk badge climbs from twenty-nine to forty-two percent."*

The natural urge is to look at the Risk card while saying "recall jumps to eighty-eight point five", then look at the Personas card while saying "twenty-nine to forty-two". Phat doesn't need to do this *in his audio recording* — he can read calmly without watching anything. But the **screen recording** that Anh captures has to show this eye-path implicitly through cursor stillness while both cards animate.

**Drill:** Anh records this scene in OBS five times. Watch each playback and pick the take where (i) the click landed cleanly on the toggle, (ii) the cursor stayed still for the full 2-second post-click window, and (iii) both cards finished their transitions visibly.

---

## 5. Audio direction

The CHI paper-demo style is **calm declarative**. Imagine you are presenting at a conference, not on TikTok. Three concrete habits:

| Habit | What it sounds like |
|---|---|
| **Land on consonants** | Final consonants of each sentence are pronounced fully. *"…rank four, at zero point zero five **t**woo."* Not *"…fye-uh."* The viewer's ear uses consonants to know a sentence has ended. |
| **No upward intonation** | Each sentence ends with a flat or falling pitch, never rising. Rising pitch reads as a question or as uncertainty. Declarative all the way. |
| **No filler** | No *"so…"*, *"basically…"*, *"kind of…"*. The script has no filler. If you find one creeping in, pause and re-take. |

### Common stumble points (practice these explicitly)

- *"r equals zero point nine one"* — say each numeral distinctly. Not *"point ninety-one"*.
- *"r equals negative zero point three eight"* — the word *"negative"* always before *"zero"*.
- *"eighty-two point six percent"* — the *"point"* is a separate word, not a glide.
- *"five-fold cross-validation"* — *"five fold"* is two words.
- *"forty-two point one percent"* — the *"one"* matters; viewers will replay if they think you said *"forty-two percent"*.

---

## 6. Pre-record verification checklist

Run through this once on Anh's machine, immediately before the screen-recording session.

- [ ] Live dashboard loads at <https://student-uci-dashboard.vercel.app/> in incognito Chrome (no extensions, no notifications)
- [ ] Window is 1440 × 900 (or as close as your screen allows); browser zoom 100% (`Ctrl + 0`)
- [ ] KPI bar shows 1,044 / 11.3 / 78% / 4.4 days / 22% / Past Failures
- [ ] Subject toggle defaults to **Both**, view defaults to **Gender**
- [ ] Click Key Drivers RF Importance toggle — chart redraws to blue lollipops with `absences` at rank 4 — click back to Pearson
- [ ] Click Subject = Math — Risk card header reads *"MATH ONLY · n=79 test"*, recall 88.5%, MISSED = 3
- [ ] Personas card Social Risk Group tab — at-risk badge reads **42.1%** when Subject = Math, **21.3%** when Subject = Portuguese
- [ ] Click Subject = Both — everything returns to baseline
- [ ] Dark mode toggle works
- [ ] OBS source = browser window only (no taskbar, no other windows)
- [ ] Cursor highlighter is on
- [ ] Mic is selected as the correct input; record 10 s of silence + a test sentence; play back; confirm no fan / typing noise

---

## 7. Editing checklist (after takes are in)

- [ ] Audio normalised to peak −3 dB, RMS around −18 dB
- [ ] Noise reduction applied (0.5 s silence sample → Audacity Noise Reduction)
- [ ] Each scene's audio aligned to its screen-recording timing
- [ ] Cuts between takes are crossfaded over ~50 ms (avoid clicks)
- [ ] Cursor stayed visible across every scene
- [ ] No accidental keyboard / window-switch sounds
- [ ] Slide images (1, 2, 11, 20, 21, 22) inserted at correct timestamps
- [ ] Final video is 1080p / 30 fps
- [ ] Total length is between 12 and 15 minutes
- [ ] Title slide has the team names, course code (once filled), instructor name (once filled)
- [ ] End card has the GitHub URL, live URL, team names

### Three-pass review (required)

1. **1× speed, eyes on screen.** Catch jump cuts, audio gaps, unexpected cursor jumps.
2. **0.5× speed, eyes on screen.** Catch visual artefacts and frame drops.
3. **1× speed, eyes off screen** (or play through headphones while doing something else). Does the narration alone tell the story?

If all three pass, ship.

---

## 8. After recording — upload + submission flow

1. Upload the final `.mp4` to Google Drive in the team's shared folder. Right-click → *Get link* → set sharing to "Anyone with the link, Viewer".
2. Paste the Drive URL into:
   - `TEAM_INFO.md` (the *Video (Google Drive)* row, replacing `[PASTE SHAREABLE DRIVE LINK AFTER UPLOAD]`)
   - `REPORT.md` cover page (if you add a footer line)
   - The Google Sheet row (last column)
3. Fill the remaining placeholders in `REPORT.md` and `TEAM_INFO.md`: course code, instructor name, two emails, team number.
4. Re-run `python build_report.py` to regenerate `REPORT.docx` with the filled placeholders.
5. Commit and push the filled-in versions to `main`.
6. Submit:
   - **Google Sheet** (the lecturer's spreadsheet linked in TEAM_INFO §Google Sheet row) — paste the one-line team summary.
   - **Blackboard** — upload `REPORT.docx`.
   - **Google Drive** — confirm the video link is reachable from an incognito window before walking away.
7. Submit at least 4 hours before the 23:59 Saturday 16/05/2026 deadline. Drive sometimes takes 10+ minutes to finish processing after upload.

Good luck.
