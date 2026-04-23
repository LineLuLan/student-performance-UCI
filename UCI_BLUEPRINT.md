# Student Dashboard — UCI Project Blueprint

Tài liệu này ghi lại toàn bộ kỹ thuật từ project hiện tại và hướng dẫn adaptation sang
UCI Student Performance dataset. Giữ nguyên phong cách dashboard, thay toàn bộ data/use case.

---

## Part 1 — Tech Stack (giữ nguyên 100%)

### Runtime

| Layer | Tool | Ghi chú |
|---|---|---|
| Frontend | Vanilla JS (ES Modules) | Không bundler, không npm, không package.json |
| Charting | D3 v7 từ CDN | `import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"` |
| Fonts | Google Fonts (DM Serif Display · DM Sans · DM Mono) | Load từ `<link>` trong `<head>` |
| Python | venv (`.venv/`) | pandas · scikit-learn · statsmodels · seaborn · matplotlib |
| Data serving | `python -m http.server 8000 --directory web` | ES modules cần HTTP origin, KHÔNG mở `file://` |

### Tại sao không có bundler?
`index.html` import `main.js` với `type="module"`, từ đó import các `charts/*.js`. Browser tự
resolve. Không cần webpack/vite. Chỉ cần server trả đúng MIME type `text/javascript`.

---

## Part 2 — Cấu trúc thư mục (copy y chang)

```
new-project/
├── .venv/                          # Python virtual environment (tạo mới)
├── analysis/
│   └── eda.ipynb                   # Notebook EDA + ML training
├── data/
│   ├── raw/
│   │   ├── student-mat.csv         # UCI Math file (download về đây)
│   │   └── student-por.csv         # UCI Portuguese file
│   └── processed/
│       └── clean_students.csv      # Output của notebook → copy sang web/data/
├── web/
│   ├── data/
│   │   └── clean_students.csv      # File được serve cho browser
│   ├── charts/
│   │   ├── scatter.js
│   │   ├── importance.js
│   │   ├── bar.js
│   │   ├── environment.js
│   │   ├── histogram.js
│   │   ├── personas.js             # K-Means clusters (hardcoded sau khi train)
│   │   └── risk.js                 # RF Classifier metrics (hardcoded)
│   ├── index.html
│   ├── main.js
│   └── style.css
├── visual/                         # Screenshots để demo
├── README.md
└── CLAUDE.md
```

**Quy tắc data flow quan trọng:**
Notebook output CSV → `data/processed/clean_students.csv` → copy thủ công → `web/data/clean_students.csv`.
Nếu quên copy, dashboard hiện data cũ. Không có auto-sync.

---

## Part 3 — CSS Design System (copy từ style.css hiện tại)

### Custom Properties (`:root`)

```css
--bg:           #eef1f7;
--surface:      #ffffff;
--surface-2:    #f0f3f8;
--border:       rgba(0,0,0,0.09);
--border-hover: rgba(0,0,0,0.20);

--text-primary:   #0a0e1a;
--text-secondary: #2d3748;
--text-muted:     #64748b;

--accent-blue:   #2563eb;
--accent-purple: #7c3aed;
--accent-green:  #16a34a;
--accent-red:    #dc2626;
--accent-yellow: #d97706;
--amber-label:   #a16207;   /* Dùng cho badge "Static ML Model Snapshot" */

/* Chip filter colors — thay đổi theo view */
--low-color:  #ef4444;
--med-color:  #f59e0b;
--high-color: #22c55e;

--font-display: 'DM Serif Display', Georgia, serif;
--font-body:    'DM Sans', sans-serif;
--font-mono:    'DM Mono', monospace;

--radius:    12px;
--radius-sm: 6px;
--shadow:    0 1px 8px rgba(0,0,0,0.07);
--shadow-lg: 0 4px 20px rgba(0,0,0,0.11);
```

### Dark Mode (`[data-theme="dark"]`) — CHỈ 1 block duy nhất

```css
[data-theme="dark"] {
    --bg:           #0f1117;
    --surface:      #161b27;
    --surface-2:    #1e2436;
    --border:       rgba(255,255,255,0.08);

    --text-primary:   #f0f2f8;
    --text-secondary: #94a3b8;
    --text-muted:     #7c8ca0;      /* KHÔNG dùng #4a5568 — quá tối, chữ chìm */

    --accent-blue:   #4C8EF5;
    --accent-purple: #a78bfa;
    --accent-green:  #34d399;       /* KHÔNG dùng #4ADE80 — quá neon */
    --accent-red:    #F87171;
    --accent-yellow: #fbbf24;
    --amber-label:   #fbbf24;       /* badge sáng hơn trên nền tối */

    --low-color:  #F87171;
    --med-color:  #fbbf24;
    --high-color: #34d399;
}
/* KHÔNG tạo block [data-theme="dark"] thứ 2 — nó sẽ override block đầu */
```

### Grid Layout (`.grid` trong `main`)

```css
.grid {
    display: grid;
    grid-template-columns: 3fr 2.5fr 2fr;   /* 3 cột */
    grid-template-rows:    1fr 1fr;          /* 2 hàng */
    gap: 6px;
    flex: 1;
    min-height: 0;
}
/* Card positions — thay đổi nếu cần nhưng giữ tổng thể */
#card-scatter    { grid-column: 1/2; grid-row: 1; }
#card-importance { grid-column: 2/3; grid-row: 1; }
#card-radar      { grid-column: 3/4; grid-row: 1; }  /* Personas */
#card-bar        { grid-column: 1/2; grid-row: 2; }  /* Risk Engine */
#card-env        { grid-column: 2/3; grid-row: 2; }
#card-extra      { grid-column: 3/4; grid-row: 2; }  /* Histogram */
```

### Typography — Kích thước tối thiểu

| Nơi dùng | Font | Size | Weight |
|---|---|---|---|
| Header title | `--font-display` | 21px | 400 |
| Card title | `--font-display` | 14px | 400 |
| KPI value | `--font-display` | 24px | 400 |
| ML hero score | `--font-display` | 28px | 700 |
| Chip, button | `--font-body` | 12px | 600 |
| Axis labels | `--font-mono` | 10.5–11px | 500–600 |
| KPI label | `--font-mono` | 9px | 700 |
| Tooltip value | `--font-body` | 13px | 700 |
| Description text | `--font-body` | 10px | 400 |
| **TUYỆT ĐỐI KHÔNG** dưới 9px cho bất kỳ text hiển thị nào | | | |

---

## Part 4 — Frontend Architecture

### `main.js` — Orchestrator

**`VIEW_CONFIG`** là trái tim của view switcher. Mỗi view định nghĩa:

```js
const VIEW_CONFIG = {
    viewKey: {
        label:       "Tên hiển thị",
        field:       "tên_cột_trong_csv",        // cột categorical để filter
        values:      ["val1", "val2", "val3"],   // các giá trị có thể
        chipLabels:  ["Label1", "Label2", "Label3"],
        colors:      ["var(--low-color)", "var(--med-color)", "var(--high-color)"],
        scatterSubtitle: "Mô tả cho scatter khi view này active",
        sidePanelTitle:  "TIÊU ĐỀ PANEL",
        sidePanelStat:   "+X.Y pts",             // stat nổi bật
        sidePanelDesc:   "Mô tả stat",
        baselineField:   "tên_cột",
        baselineLow:     "giá_trị_thấp",
        baselineHigh:    "giá_trị_cao",
    }
}
```

**`window.__viewField__`** — shared global giữa `main.js` và `scatter.js`.
Charts đọc biến này để biết đang color theo cột nào mà không cần threading qua tham số.

**Flow khi user tương tác:**
1. Click chip filter → `update()` → `getFilteredData()` → `drawAll()`
2. Click lollipop dot → `onFactorClick(key, label)` → update `scatterXField` → `drawScatter()` only
3. Click view switcher → `switchView(viewKey)` → rebuild chips → `update()`
4. Resize window → `drawAll()` (charts tự đọc lại `getBoundingClientRect()`)

### Chart Module Convention

Mỗi file `charts/*.js` export **đúng 1 function** `drawX(data, ...args)`:

```js
export function drawX(data, ...args) {
    const container = d3.select("#container-id");
    container.selectAll("*").interrupt().remove();  // clear trước khi vẽ lại

    // Guard: empty data
    if (!data || data.length === 0) {
        container.html(`<div style="...">Select a filter above</div>`);
        return;
    }

    // Đọc kích thước từ DOM — KHÔNG hardcode
    const { width, height } = container.node().getBoundingClientRect();
    if (width < 10 || height < 10) return;

    // ... vẽ D3 ...
}
```

**Tooltip:** Dùng `d3.select("#tooltip")` (div duy nhất trong `index.html`).
Không tạo tooltip riêng per-chart.

```js
const tooltip = d3.select("#tooltip");
// Hiện:
tooltip.style("opacity", 1).html(`<strong>Label</strong><span class="tt-val">value</span>`);
tooltip.style("left", tx+"px").style("top", ty+"px");
// Ẩn:
tooltip.style("opacity", 0);
```

**ML Charts (personas.js, risk.js):** Static data hardcoded — không nhận `data` argument.
Gọi `drawPersonas()` và `drawRiskEngine()` mỗi lần `drawAll()` nhưng chúng bỏ qua filtered data.
Sau khi train lại notebook → update constants trong file bằng tay.

---

## Part 5 — UCI Student Performance Dataset

### Download

URL: https://archive.ics.uci.edu/dataset/320/student+performance

Giải nén ra 2 file:
- `student-mat.csv` — 395 học sinh môn Toán
- `student-por.csv` — 649 học sinh môn Tiếng Bồ Đào Nha

Separator là `;` không phải `,`. Load bằng `pd.read_csv("...", sep=";")`

### Columns

| Column | Type | Mô tả |
|---|---|---|
| school | cat | GP hoặc MS (2 trường) |
| sex | cat | F / M |
| age | int | 15–22 |
| address | cat | U (urban) / R (rural) |
| famsize | cat | LE3 (≤3 người) / GT3 |
| Pstatus | cat | T (sống cùng) / A (sống riêng) |
| Medu / Fedu | int | Học vấn bố/mẹ (0–4) |
| Mjob / Fjob | cat | Nghề nghiệp (teacher/health/services/at_home/other) |
| traveltime | int | Thời gian đi học (1–4: <15min đến >1h) |
| studytime | int | Giờ tự học/tuần (1–4: <2h đến >10h) |
| failures | int | Số lần trượt môn trước đây (0–4) |
| schoolsup | cat | Hỗ trợ học thêm từ trường (yes/no) |
| famsup | cat | Hỗ trợ từ gia đình (yes/no) |
| paid | cat | Học thêm có trả phí (yes/no) |
| activities | cat | Hoạt động ngoại khóa (yes/no) |
| internet | cat | Có internet ở nhà (yes/no) |
| romantic | cat | Đang có bạn tình (yes/no) |
| famrel | int | Chất lượng quan hệ gia đình (1–5) |
| freetime | int | Thời gian rảnh sau học (1–5) |
| goout | int | Đi chơi với bạn bè (1–5) |
| Dalc / Walc | int | Uống rượu ngày thường / cuối tuần (1–5) |
| health | int | Tình trạng sức khỏe (1–5) |
| absences | int | Số ngày vắng mặt (0–93) |
| **G1** | int | Điểm kỳ 1 (0–20) |
| **G2** | int | Điểm kỳ 2 (0–20) |
| **G3** | int | **Điểm cuối kỳ (0–20) — TARGET** |

### Use Case: "Early Academic Warning System"

**Story thuyết phục hơn dataset Kaggle:**

> Sau khi có điểm kỳ 1 (G1), nhà trường muốn biết ai có nguy cơ trượt môn cuối kỳ (G3 < 10)
> để can thiệp kịp thời bằng tutoring, tư vấn, hoặc hỗ trợ gia đình.

- **At risk** = `G3 < 10` (ngưỡng 10/20 là điểm đậu trong hệ thống giáo dục Bồ Đào Nha)
- **Input features cho classifier:** G1, G2, absences, failures, studytime, Medu/Fedu, goout, Walc, romantic
- **Không dùng G3 làm input** (data leakage)
- **Real-world hơn:** G3 có distribution bimodal — nhiều học sinh điểm 0 (bỏ học/không thi), nhiều ở 10–15

**G3 distribution sẽ trông như thế này:**
- Spike ở 0 (học sinh bỏ học, không nộp bài)
- Bell curve ở 10–16
- Std dev ~4–5 (realistic, khác hẳn dataset Kaggle std=3.9 giả tạo)

---

## Part 6 — EDA Notebook Plan (`analysis/eda.ipynb`)

### Cell 1: Setup

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import statsmodels.api as sm
from scipy import stats

# Load — separator là ";"
mat = pd.read_csv("../data/raw/student-mat.csv", sep=";")
por = pd.read_csv("../data/raw/student-por.csv", sep=";")

# Gắn nhãn môn học trước khi merge
mat["subject"] = "math"
por["subject"] = "portuguese"

# Combine — dùng cả 2 để có n lớn hơn (~1044 rows)
df = pd.concat([mat, por], ignore_index=True)
print(df.shape)  # (1044, 34)
```

### Cell 2: Cleaning & Feature Engineering

```python
# Lowercase columns
df.columns = df.columns.str.lower()

# Rename quan trọng
df = df.rename(columns={
    "medu": "mother_edu",
    "fedu": "father_edu",
    "mjob": "mother_job",
    "fjob": "father_job",
    "dalc": "alcohol_weekday",
    "walc": "alcohol_weekend",
    "g1":   "grade_mid1",
    "g2":   "grade_mid2",
    "g3":   "grade_final",
})

# Target: at_risk nếu grade_final < 10
df["at_risk"] = (df["grade_final"] < 10).astype(int)

# Encode binary categoricals sang 0/1 cho ML
binary_map = {"yes": 1, "no": 0, "u": 1, "r": 0, "f": 1, "m": 0, "t": 1, "a": 0}
for col in ["schoolsup","famsup","paid","activities","internet","romantic","address","sex","pstatus"]:
    df[col] = df[col].str.lower().map(binary_map)

# Export cleaned CSV
df.to_csv("../data/processed/clean_students.csv", index=False)
print("DONE EXPORT:", df.shape)
```

### Cell 3: Pearson Correlations (numeric features vs grade_final)

```python
numeric_feats = ["grade_mid1","grade_mid2","absences","failures","studytime",
                 "mother_edu","father_edu","goout","alcohol_weekday","alcohol_weekend",
                 "health","freetime","famrel","age","traveltime"]

corrs = {f: df[f].corr(df["grade_final"]) for f in numeric_feats}
corr_df = pd.Series(corrs).sort_values(key=abs, ascending=False)
print("=== PEARSON r vs grade_final ===")
print(corr_df.round(4))
```

**Kết quả dự kiến (từ research về dataset này):**
- `grade_mid2` (G2): r ≈ +0.90 — gần như linear (đây là feature mạnh nhất)
- `grade_mid1` (G1): r ≈ +0.80
- `failures`: r ≈ -0.36 (trượt nhiều → điểm thấp)
- `absences`: r ≈ -0.10 đến -0.20 (khá yếu, nhiều noise)
- `mother_edu`, `father_edu`: r ≈ +0.20
- `goout`, `Walc`: r ≈ -0.10 đến -0.15

**Insight quan trọng:** G2 giải thích ~81% variance của G3. Dashboard nên nói thẳng điều này.

### Cell 4: Regression Analysis

```python
# 1. Grade progression G1 → G2 → G3
for prev, curr in [("grade_mid1","grade_mid2"), ("grade_mid2","grade_final")]:
    X = sm.add_constant(df[prev])
    model = sm.OLS(df[curr], X).fit()
    r = df[prev].corr(df[curr])
    print(f"{prev} → {curr}: r={r:.3f}, R²={model.rsquared:.3f}, β={model.params[prev]:.4f}, p={model.pvalues[prev]:.2e}")

# 2. Absences impact
r_abs = df["absences"].corr(df["grade_final"])
print(f"absences → grade_final: r={r_abs:.3f}")

# 3. Failures impact
r_fail = df["failures"].corr(df["grade_final"])
print(f"failures → grade_final: r={r_fail:.3f}")
```

### Cell 5: K-Means Clustering (3 Behavioral Personas)

**Cluster trên behavior, KHÔNG phải grades:**

```python
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

# Features: studytime, absences, goout, Walc — behavior features
cluster_cols = ["studytime", "absences", "goout", "alcohol_weekend"]
X_c = df[cluster_cols].copy()

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_c)

# Elbow method để chọn K
inertias = []
for k in range(2, 8):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(X_scaled)
    inertias.append(km.inertia_)

plt.plot(range(2,8), inertias, "o-")
plt.xlabel("K"); plt.ylabel("Inertia"); plt.title("Elbow Method")
plt.show()

# Chọn K (thường là 3 hoặc 4) sau khi xem elbow
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
df["cluster"] = kmeans.fit_predict(X_scaled)

# Phân tích cluster
result = df.groupby("cluster").agg({
    "studytime":       "mean",
    "absences":        "mean",
    "goout":           "mean",
    "alcohol_weekend": "mean",
    "grade_final":     ["mean","count"]
}).round(2)
print(result)
```

**Cluster naming dựa trên data thực tế (tên sẽ thay đổi theo kết quả):**
Sau khi chạy, gán tên theo logic: cluster nào có studytime cao + absences thấp = "Engaged",
cluster có goout/Walc cao = "Social", cluster balanced = "Average". Đừng đặt tên trước khi xem data.

**Hardcode kết quả vào `personas.js`** sau khi chạy xong.

### Cell 6: Random Forest Risk Classifier

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix

# Features: KHÔNG được dùng grade_final (data leakage)
# Được dùng G1, G2 vì đây là "mid-term early warning"
feature_cols = [
    "grade_mid1", "grade_mid2",           # có sau kỳ 2
    "absences", "failures", "studytime",   # behavior
    "mother_edu", "father_edu",            # socioeconomic
    "goout", "alcohol_weekend", "romantic",
    "internet", "schoolsup", "activities"
]

X = df[feature_cols]
y = df["at_risk"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

clf = RandomForestClassifier(
    n_estimators=200,
    class_weight="balanced",  # quan trọng: at_risk minority class
    random_state=42,
    n_jobs=-1
)
clf.fit(X_train, y_train)
y_pred = clf.predict(X_test)

print(classification_report(y_test, y_pred, target_names=["Pass","At Risk"]))
cm = confusion_matrix(y_test, y_pred)
print("Confusion Matrix:")
print(cm)  # [[TN, FP], [FN, TP]]

# Cross-validation
cv_scores = cross_val_score(clf, X, y, cv=5, scoring="recall")
print(f"CV Recall: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
```

**Tại sao dùng G1 và G2 mà không bị data leakage:**
G3 là target. G1, G2 là kết quả của các kỳ thi TRƯỚC, available trước kỳ thi cuối.
Đây chính xác là setting của real-world early warning system.

**Hardcode metrics vào `risk.js`** sau khi chạy:

```js
const RF = {
    accuracy:  0.XX,   // từ classification_report
    precision: 0.XX,   // của class "At Risk"
    recall:    0.XX,   // của class "At Risk" — metric quan trọng nhất
    f1:        0.XX,
    matrix: {
        tn: cm[0][0],
        fp: cm[0][1],
        fn: cm[1][0],   // Missed at-risk — ô đỏ
        tp: cm[1][1]
    }
};
```

---

## Part 7 — Dashboard Adaptation

### KPI Bar

| KPI hiện tại | KPI mới | Cách tính |
|---|---|---|
| Total Students | Total Students | `data.length` |
| Avg Exam Score | Avg Final Grade | `d3.mean(data, d => d.grade_final)` — hiện dạng `/20` |
| Avg Attendance | Avg Absences | `d3.mean(data, d => d.absences)` + suffix ` days` |
| Avg Study Hrs/Wk | Pass Rate | `% G3 >= 10` |
| Above Avg Score | Below Avg | `% G3 < mean` |
| #1 Key Factor | #1 Risk Factor | computed Pearson r |

**Thay đổi trong `main.js`** — `updateKPI()`:

```js
// Thay exam_score → grade_final, attendance → absences
const avgGrade   = d3.mean(data, d => d.grade_final) || 0;
const avgAbsence = d3.mean(data, d => d.absences) || 0;
const passRate   = data.filter(d => d.grade_final >= 10).length / total * 100;
```

### `main.js` — VIEW_CONFIG mới

4 view phù hợp với UCI:

```js
const VIEW_CONFIG = {
    // View 1: Sex (F vs M)
    sex: {
        label:      "Gender",
        field:      "sex",            // 1=F, 0=M sau encoding → dùng "f"/"m" string
        values:     ["f", "m"],
        chipLabels: ["Female", "Male"],
        colors:     ["var(--accent-purple)", "var(--accent-blue)"],
        scatterSubtitle: "Does gender affect academic outcomes?",
        sidePanelTitle:  "GENDER GAP",
        sidePanelStat:   "~0.5 pts",
        sidePanelDesc:   "avg grade difference between female and male students",
    },
    // View 2: School
    school: {
        label:      "School",
        field:      "school",
        values:     ["gp", "ms"],
        chipLabels: ["Gabriel Pereira", "Mousinho da Silveira"],
        colors:     ["var(--accent-blue)", "var(--accent-green)"],
        scatterSubtitle: "Performance comparison between the two schools",
    },
    // View 3: Internet Access
    internet: {
        label:      "Internet Access",
        field:      "internet",       // 1/0 sau encoding, hoặc giữ "yes"/"no"
        values:     ["1", "0"],       // hoặc ["yes","no"] nếu không encode trước export
        chipLabels: ["Has Internet", "No Internet"],
        colors:     ["var(--accent-green)", "var(--accent-red)"],
    },
    // View 4: Higher Education Aspiration
    higher: {
        label:      "Higher Education Goal",
        field:      "higher",
        values:     ["1", "0"],
        chipLabels: ["Wants Higher Edu", "Doesn't"],
        colors:     ["var(--accent-blue)", "var(--text-muted)"],
    }
};
```

**Lưu ý:** Giữ `currentView` default là cái nào meaningful nhất — thường là `"sex"` hoặc `"school"`.

### `main.js` — CSV loader

```js
d3.csv("/data/processed/clean_students.csv", d => ({
    // Grades (numeric)
    grade_mid1:   +d.grade_mid1,
    grade_mid2:   +d.grade_mid2,
    grade_final:  +d.grade_final,
    at_risk:      +d.at_risk,

    // Behavior (numeric)
    studytime:        +d.studytime,
    absences:         +d.absences,
    failures:         +d.failures,
    goout:            +d.goout,
    alcohol_weekend:  +d.alcohol_weekend,
    alcohol_weekday:  +d.alcohol_weekday,
    health:           +d.health,
    freetime:         +d.freetime,
    famrel:           +d.famrel,
    age:              +d.age,
    traveltime:       +d.traveltime,

    // Socioeconomic (numeric post-encode)
    mother_edu:   +d.mother_edu,
    father_edu:   +d.father_edu,
    internet:     d.internet,        // "1"/"0" string để filter chip hoạt động
    romantic:     d.romantic,
    activities:   d.activities,
    schoolsup:    d.schoolsup,

    // Categorical (giữ string)
    school:       (d.school||"").toLowerCase(),
    sex:          (d.sex||"").toLowerCase(),    // "f" / "m"
    mother_job:   (d.mother_job||"").toLowerCase(),
    father_job:   (d.father_job||"").toLowerCase(),
    higher:       d.higher,          // "1"/"0" string
    address:      d.address,
    subject:      d.subject,
}))
```

### `charts/importance.js` — FIELDS mới

```js
const FIELDS = [
    { key: "grade_mid2",      label: "Midterm 2 (G2)", type: "numeric" },
    { key: "grade_mid1",      label: "Midterm 1 (G1)", type: "numeric" },
    { key: "failures",        label: "Past Failures",  type: "numeric" },
    { key: "absences",        label: "Absences",       type: "numeric" },
    { key: "studytime",       label: "Study Time",     type: "numeric" },
    { key: "mother_edu",      label: "Mother Edu",     type: "numeric" },
    { key: "father_edu",      label: "Father Edu",     type: "numeric" },
    { key: "goout",           label: "Goes Out",       type: "numeric" },
    { key: "alcohol_weekend", label: "Weekend Alcohol",type: "numeric" },
];

// Highlight hero: grade_mid2 (G2) sẽ chiếm dominant — cần note điều này
const dotColor = (d) => {
    if (d.key === "grade_mid2") return "var(--accent-green)";   // hero positive
    if (d.key === "failures")   return "var(--accent-red)";     // hero negative
    return "var(--text-muted)";
};
```

**Xóa `mockR` fake value** — tất cả fields phải dùng Pearson r thật.

### `charts/scatter.js`

Thay `exam_score` → `grade_final` trong tất cả references:
- Y-axis label: `"FINAL GRADE (G3)"` thay vì `"EXAM SCORE"`
- Y-axis domain: `[0, 20]` fixed thay vì `d3.extent()` (để dễ đọc)
- Default x-field: `"grade_mid1"` hoặc `"absences"`

```js
// Thay trong linearRegression(), calculateR2(), pearsonR():
const sumY  = d3.sum(data, d => d.grade_final);   // was: d.exam_score
```

### `charts/environment.js` — Factor vs Score

Thay đổi dropdown options:

```html
<select id="environmentSelect">
    <option value="grade_mid1">Midterm 1 (G1)</option>
    <option value="grade_mid2">Midterm 2 (G2)</option>
    <option value="absences">Absences (days)</option>
    <option value="studytime">Study Time</option>
    <option value="goout">Goes Out Frequency</option>
    <option value="alcohol_weekend">Weekend Alcohol</option>
</select>
```

Thay `exam_score` → `grade_final` trong chart computation.

### `charts/histogram.js`

Thay `exam_score` → `grade_final`, điều chỉnh bins:

```js
// G3 range 0–20, bins by integer hoặc groups
const bins = d3.bin()
    .value(d => d.grade_final)
    .domain([0, 20])
    .thresholds(20);  // 1 bin per grade point
```

**Lưu ý về bimodal distribution:** G3=0 là spike lớn (học sinh bỏ thi). Cân nhắc:
- Hiện toàn bộ distribution kể cả G3=0
- Hoặc filter G3>0 và note `"Excluding {n} students with G3=0 (withdrew)"`

### `charts/bar.js` (Top vs Bottom)

Thay `exam_score` → `grade_final`, `Q75/Q25` thay bằng `>=15` (Pass with distinction) vs `<10` (Fail):

```js
const topStudents    = data.filter(d => d.grade_final >= 15);   // Merit
const bottomStudents = data.filter(d => d.grade_final < 10);    // At risk
```

### `charts/personas.js` — K-Means Clusters mới

Sau khi chạy notebook, hardcode kết quả. Ví dụ cấu trúc:

```js
const CLUSTERS = [
    {
        name: "Engaged",
        subtitle: "High Performers",
        initial: "E",
        color: "var(--accent-green)",
        score: XX.X,       // grade_final mean của cluster
        absences: XX.X,
        studytime: X.X,
        goout: X.X,
        alcohol: X.X,
        insight: "Low absences, dedicated study"
    },
    // ...
];

const STATS = [
    { key: "absences",  label: "Absences", unit: " days", max: 30 },
    { key: "studytime", label: "Study Time", unit: "/4",  max: 4  },
    { key: "goout",     label: "Goes Out",  unit: "/5",  max: 5   },
];
```

### `charts/risk.js` — RF Classifier mới

Hardcode từ notebook output. Logic giữ nguyên, chỉ thay số và labels:

```js
const RF = {
    accuracy:  0.XX,
    precision: 0.XX,
    recall:    0.XX,    // metric quan trọng nhất — "catches XX% of at-risk students"
    f1:        0.XX,
    matrix: { tn: XXX, fp: XX, fn: XX, tp: XXX }
};
// Đổi column header: "Pred: Pass" / "Pred: Risk"
// Đổi row label: "Actual: Pass" / "Actual: Risk"
```

---

## Part 8 — `index.html` Changes

### Header

```html
<!-- Thay title -->
<h1 class="header-title">Student Risk <em>Early Warning</em></h1>
<!-- Hoặc -->
<h1 class="header-title">Academic Performance <em>Analytics</em></h1>
```

### Card titles

```html
<!-- card-scatter -->
<div class="card-tag">Grade Correlation</div>
<h2 class="card-title" id="scatter-title">Midterm G1 vs Final Grade G3</h2>

<!-- card-importance -->
<div class="card-tag">Risk Factors</div>
<h2 class="card-title">Key Drivers of Final Grade</h2>
<div style="...">Click any factor to explore correlation</div>

<!-- card-radar (Personas) -->
<div class="card-tag">K-Means Clustering</div>
<h2 class="card-title">Student Behavioral Profiles</h2>
<div class="card-badge" style="...color:var(--accent-purple)...">ML · 3 Clusters</div>

<!-- card-bar (Risk Engine) -->
<div class="card-tag">Random Forest Classifier</div>
<h2 class="card-title">Dropout Risk Predictor</h2>
<div class="card-badge" style="...color:var(--accent-green)...">ML · XX% Accuracy</div>

<!-- card-env -->
<div class="card-tag">Trend Analysis</div>
<h2 class="card-title">Factor vs Final Grade</h2>

<!-- card-extra -->
<div class="card-tag">Score Distribution</div>
<h2 class="card-title">G3 Grade Distribution</h2>
```

### Lưu ý: Badge "Static ML Model Snapshot"

Badge này dùng `color: var(--amber-label)` (đã fix ở project hiện tại). Giữ nguyên HTML này, đừng dùng hardcode `#a16207`.

---

## Part 9 — Setup Commands

```bash
# 1. Tạo project folder mới
mkdir student-dashboard-v2
cd student-dashboard-v2

# 2. Copy web/ và analysis/ từ project cũ, đổi data
cp -r ../student-dashboard/web/ .
cp -r ../student-dashboard/analysis/ .

# 3. Tạo thư mục data
mkdir -p data/raw data/processed web/data

# 4. Đặt UCI files vào
# data/raw/student-mat.csv
# data/raw/student-por.csv

# 5. Tạo Python venv
python -m venv .venv
source .venv/Scripts/activate     # Windows bash
# hoặc: .venv\Scripts\Activate.ps1  # PowerShell

# 6. Install dependencies
pip install pandas numpy scikit-learn statsmodels seaborn matplotlib jupyter

# 7. Chạy notebook để generate cleaned CSV
# Sau khi notebook chạy xong:
cp data/processed/clean_students.csv web/data/clean_students.csv

# 8. Serve dashboard
python -m http.server 8000 --directory web
# Mở: http://localhost:8000
```

---

## Part 10 — Checklist Trước Khi Nộp

### Data
- [ ] Dataset UCI real, không phải synthetic — mention trong README
- [ ] Combine Math + Portuguese để có n ≥ 1000
- [ ] G3=0 được xử lý có chủ đích (giữ hay filter — phải document)
- [ ] Không có `mockR` hay hardcoded fake correlation values
- [ ] CSV đã sync vào `web/data/`

### EDA
- [ ] Pearson r thực tế từ data (không fake)
- [ ] Elbow method để chọn K cho K-Means
- [ ] Cluster naming dựa trên data thực (không đặt tên tùy tiện)
- [ ] Regression output có R², slope, p-value
- [ ] Classification report có precision/recall/F1 cho từng class

### Dashboard
- [ ] Tên chart, KPI label phản ánh đúng dataset UCI
- [ ] `VIEW_CONFIG` fields tồn tại trong cleaned CSV
- [ ] ML hardcoded numbers update theo notebook output mới
- [ ] Dark mode test — `--text-muted` đủ sáng (`#7c8ca0` trở lên)
- [ ] Không có hardcoded color `#a16207` trong HTML — dùng `var(--amber-label)`
- [ ] Không có dark mode CSS block thứ 2 (trùng lặp)

### Use Case Narrative (khi present)
- [ ] "Early Warning System: predict dropout risk after first exam (G1)"
- [ ] Mention dataset: UCI Student Performance (Paulo Cortez, 2008), real survey data
- [ ] G2 giải thích ~81% variance G3 — acknowledge và explain why (grade stability)
- [ ] Recall là metric chính cho risk classifier, không phải accuracy
- [ ] Cluster naming có data-backed explanation

---

*Blueprint dựa trên codebase `student-dashboard` @ commit `fb3507c`. Phong cách visual, CSS design system, và chart conventions giữ nguyên hoàn toàn.*
