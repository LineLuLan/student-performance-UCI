import pandas as pd, numpy as np, json, sys
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split, cross_validate, StratifiedKFold
from sklearn.metrics import confusion_matrix, precision_recall_fscore_support

mat = pd.read_csv('../data/raw/student-mat.csv', sep=';'); mat['subject']='math'
por = pd.read_csv('../data/raw/student-por.csv', sep=';'); por['subject']='portuguese'
df = pd.concat([mat, por], ignore_index=True)
df.columns = df.columns.str.lower()
df = df.rename(columns={
    'medu':'mother_edu','fedu':'father_edu','mjob':'mother_job','fjob':'father_job',
    'dalc':'alcohol_weekday','walc':'alcohol_weekend',
    'g1':'grade_mid1','g2':'grade_mid2','g3':'grade_final'
})
df['at_risk'] = (df['grade_final'] < 10).astype(int)
for col in ['schoolsup','famsup','paid','activities','internet','romantic','nursery','higher']:
    df[col] = df[col].str.lower().map({'yes':1,'no':0})
df['sex'] = df['sex'].str.lower()
df['school'] = df['school'].str.lower()
df['address'] = df['address'].str.lower()
df['pstatus'] = df['pstatus'].str.lower()
df['famsize'] = df['famsize'].str.lower()

# ── Pearson correlations ──────────────────────────────────────────
numeric_feats = ['grade_mid1','grade_mid2','absences','failures','studytime',
                 'mother_edu','father_edu','goout','alcohol_weekday','alcohol_weekend',
                 'health','freetime','famrel','age','traveltime']
corrs = {f: round(float(df[f].corr(df['grade_final'])),4) for f in numeric_feats}
sorted_corrs = dict(sorted(corrs.items(), key=lambda x: abs(x[1]), reverse=True))
print('===CORRS==='); print(json.dumps(sorted_corrs)); print('===END===')
sys.stdout.flush()

# ── K-Means 3 clusters ───────────────────────────────────────────
cluster_cols = ['studytime','absences','goout','alcohol_weekend']
# Semantic key assigned by at_risk-rate ascending so clusters keep the same
# identity (Focused / Average / Social Risk) across the combined fit and the
# subject-stratified fits below.
SEMANTIC_KEYS = ['focused', 'average', 'social_risk']

def train_kmeans(sub_df):
    """K-Means k=3 on lifestyle features; returns 3 cluster dicts sorted by
    at_risk ascending and tagged with a semantic key so the personas card can
    match colour and name to the same behavioural pattern regardless of which
    subject filter is active."""
    s = sub_df.reset_index(drop=True)
    Xc = s[cluster_cols].fillna(0)
    sc = StandardScaler(); Xn = sc.fit_transform(Xc)
    k  = KMeans(n_clusters=3, random_state=42, n_init=10)
    labels = k.fit_predict(Xn)

    raw = []
    for cid in sorted(set(labels)):
        g = s[labels == cid]
        raw.append({
            'count':      int(len(g)),
            'grade':      round(float(g['grade_final'].mean()), 2),
            'studytime':  round(float(g['studytime'].mean()), 2),
            'absences':   round(float(g['absences'].mean()), 2),
            'goout':      round(float(g['goout'].mean()), 2),
            'alcohol':    round(float(g['alcohol_weekend'].mean()), 2),
            'health':     round(float(g['health'].mean()), 2),
            'freetime':   round(float(g['freetime'].mean()), 2),
            'at_risk':    round(float(g['at_risk'].mean()), 3),
        })
    raw.sort(key=lambda r: r['at_risk'])
    for i, c in enumerate(raw):
        c['semantic'] = SEMANTIC_KEYS[i]
    return raw, labels, k

# Combined fit — used both for ===CLUSTERS=== output and for assigning the
# `cluster` column on the exported CSV (so any downstream consumer that joins
# on cluster id still works against the combined model).
combined_clusters, combined_labels, _ = train_kmeans(df)
df['cluster'] = combined_labels
print('===CLUSTERS==='); print(json.dumps(combined_clusters)); print('===END===')
sys.stdout.flush()

math_clusters, _, _ = train_kmeans(df[df['subject'] == 'math'])
print('===CLUSTERS_MATH==='); print(json.dumps(math_clusters)); print('===END===')
sys.stdout.flush()

por_clusters, _, _ = train_kmeans(df[df['subject'] == 'portuguese'])
print('===CLUSTERS_POR==='); print(json.dumps(por_clusters)); print('===END===')
sys.stdout.flush()

# ── Random Forest classifier ──────────────────────────────────────
feature_cols = ['grade_mid1','grade_mid2','absences','failures','studytime',
                'mother_edu','father_edu','goout','alcohol_weekend','romantic',
                'internet','schoolsup','activities']

def train_rf(sub_df, label):
    """Fit a Random Forest on sub_df with the same hyperparameters as the
    combined model. Returns the metric dict and the train/test split tensors
    so callers can reuse them (e.g. for baseline comparison)."""
    Xs = sub_df[feature_cols].fillna(0); ys = sub_df['at_risk']
    Xtr, Xte, ytr, yte = train_test_split(Xs, ys, test_size=0.2,
                                          random_state=42, stratify=ys)
    m = RandomForestClassifier(n_estimators=200, class_weight='balanced',
                               random_state=42, n_jobs=-1)
    m.fit(Xtr, ytr); yp = m.predict(Xte)
    cm = confusion_matrix(yte, yp).tolist()
    p, r, f, _ = precision_recall_fscore_support(yte, yp, pos_label=1, average='binary')
    acc = float((yte == yp).mean())
    data = {
        'subject': label,
        'n_total': int(len(sub_df)),
        'n_test': int(len(yte)),
        'n_at_risk_test': int(int((yte == 1).sum())),
        'accuracy': round(acc, 4), 'precision': round(float(p), 4),
        'recall':   round(float(r), 4), 'f1':       round(float(f), 4),
        'tn': int(cm[0][0]), 'fp': int(cm[0][1]),
        'fn': int(cm[1][0]), 'tp': int(cm[1][1]),
    }
    return data, (Xtr, Xte, ytr, yte), m

# Combined model (deployed model — preserves the existing ===RF=== output)
rf_data, (X_train, X_test, y_train, y_test), rf_model = train_rf(df, 'combined')
X_rf = df[feature_cols].fillna(0); y_rf = df['at_risk']  # retained for CV below
print('===RF==='); print(json.dumps(rf_data)); print('===END===')
sys.stdout.flush()

# RF feature importances on the combined model — drives the dual-mode
# "Pearson r | RF Importance" toggle in the Key Drivers card. Each value is
# in [0,1] and they sum to 1 across feature_cols.
rf_importance = sorted(
    [{'key': k, 'importance': round(float(v), 4)}
     for k, v in zip(feature_cols, rf_model.feature_importances_)],
    key=lambda r: r['importance'], reverse=True)
print('===RF_IMPORTANCE==='); print(json.dumps(rf_importance)); print('===END===')
sys.stdout.flush()

# Subject-stratified models
rf_math, _, _ = train_rf(df[df['subject'] == 'math'].reset_index(drop=True), 'math')
print('===RF_MATH==='); print(json.dumps(rf_math)); print('===END===')
sys.stdout.flush()

rf_por, _, _ = train_rf(df[df['subject'] == 'portuguese'].reset_index(drop=True), 'portuguese')
print('===RF_POR==='); print(json.dumps(rf_por)); print('===END===')
sys.stdout.flush()

# ── Fairness audit on the combined Random Forest ──────────────────
# Recompute the same stratified test split on a reset-indexed copy of df so
# we can attach the demographic `sex` column to each predicted row. The split
# is byte-identical to the one inside train_rf(df, 'combined') because both
# use random_state=42 + stratify=y on the same feature matrix.
_df_rs = df.reset_index(drop=True)
_Xf = _df_rs[feature_cols].fillna(0)
_yf = _df_rs['at_risk']
_, X_te_fair, _, y_te_fair = train_test_split(
    _Xf, _yf, test_size=0.2, random_state=42, stratify=_yf)
test_rows = _df_rs.loc[X_te_fair.index]
y_pred_fair = rf_model.predict(X_te_fair)
y_true_fair = y_te_fair.values

fairness = {}
for sex_val, label in [('f', 'female'), ('m', 'male')]:
    mask = (test_rows['sex'].values == sex_val)
    yt = y_true_fair[mask]; yp = y_pred_fair[mask]
    cm = confusion_matrix(yt, yp, labels=[0, 1]).tolist()
    p_f, r_f, f1_f, _ = precision_recall_fscore_support(
        yt, yp, pos_label=1, average='binary', zero_division=0)
    fairness[label] = {
        'n_test':     int(mask.sum()),
        'n_at_risk':  int(int(yt.sum())),
        'accuracy':   round(float((yt == yp).mean()), 4),
        'precision':  round(float(p_f), 4),
        'recall':     round(float(r_f), 4),
        'f1':         round(float(f1_f), 4),
        'tn': int(cm[0][0]), 'fp': int(cm[0][1]),
        'fn': int(cm[1][0]), 'tp': int(cm[1][1]),
        'selection_rate': round(float((yp == 1).mean()), 4),
    }
# Disparity ratios (smaller / larger so the ratio is always <= 1; closer to 1
# means better fairness; 80 % is the common four-fifths rule of thumb).
def _ratio(a, b):
    if b == 0 or a == 0: return None
    lo, hi = sorted([a, b])
    return round(lo / hi, 4)
fairness['disparity'] = {
    'recall_ratio':         _ratio(fairness['female']['recall'],
                                   fairness['male']['recall']),
    'precision_ratio':      _ratio(fairness['female']['precision'],
                                   fairness['male']['precision']),
    'selection_rate_ratio': _ratio(fairness['female']['selection_rate'],
                                   fairness['male']['selection_rate']),
}
print('===FAIRNESS==='); print(json.dumps(fairness)); print('===END===')
sys.stdout.flush()

# ── 5-fold stratified cross-validation on Random Forest ──────────
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_scoring = ['accuracy', 'precision', 'recall', 'f1']
cv_clf = RandomForestClassifier(n_estimators=200, class_weight='balanced',
                                random_state=42, n_jobs=-1)
cv_scores = cross_validate(cv_clf, X_rf, y_rf, cv=cv, scoring=cv_scoring, n_jobs=-1)
cv_summary = {m: {'mean': round(float(cv_scores[f'test_{m}'].mean()), 4),
                  'std':  round(float(cv_scores[f'test_{m}'].std()),  4)}
              for m in cv_scoring}
print('===CV==='); print(json.dumps(cv_summary)); print('===END===')
sys.stdout.flush()

# ── Baseline models on the same stratified 80/20 split ───────────
# LogReg needs scaled inputs; DT does not
scaler_b = StandardScaler()
X_train_s = scaler_b.fit_transform(X_train)
X_test_s  = scaler_b.transform(X_test)

baselines = {}
for name, model, X_tr, X_te in [
    ('logreg', LogisticRegression(class_weight='balanced', max_iter=1000,
                                  random_state=42), X_train_s, X_test_s),
    ('dtree',  DecisionTreeClassifier(class_weight='balanced',
                                      random_state=42),                X_train,   X_test),
]:
    model.fit(X_tr, y_train)
    y_pred_b = model.predict(X_te)
    cm_b = confusion_matrix(y_test, y_pred_b).tolist()
    p_b, r_b, f_b, _ = precision_recall_fscore_support(y_test, y_pred_b,
                                                       pos_label=1, average='binary')
    baselines[name] = {
        'accuracy': round(float((y_test == y_pred_b).mean()), 4),
        'precision': round(float(p_b), 4),
        'recall': round(float(r_b), 4),
        'f1': round(float(f_b), 4),
        'tn': int(cm_b[0][0]), 'fp': int(cm_b[0][1]),
        'fn': int(cm_b[1][0]), 'tp': int(cm_b[1][1]),
    }
print('===BASELINES==='); print(json.dumps(baselines)); print('===END===')
sys.stdout.flush()

# ── Export clean CSV ──────────────────────────────────────────────
export_cols = ['school','sex','age','address','famsize','pstatus',
               'mother_edu','father_edu','mother_job','father_job','reason','guardian',
               'traveltime','studytime','failures','schoolsup','famsup','paid',
               'activities','nursery','higher','internet','romantic',
               'famrel','freetime','goout','alcohol_weekday','alcohol_weekend',
               'health','absences','grade_mid1','grade_mid2','grade_final',
               'at_risk','subject','cluster']
df[export_cols].to_csv('../data/processed/clean_students.csv', index=False)
import shutil; shutil.copy('../data/processed/clean_students.csv', '../web/data/clean_students.csv')
print(f'EXPORTED {len(df)} rows, {len(export_cols)} cols')
