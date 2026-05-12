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
X_c = df[cluster_cols].copy().fillna(0)
scaler = StandardScaler(); X_scaled = scaler.fit_transform(X_c)
km = KMeans(n_clusters=3, random_state=42, n_init=10); df['cluster'] = km.fit_predict(X_scaled)
cstats = []
for cid in sorted(df['cluster'].unique()):
    g = df[df['cluster']==cid]
    cstats.append({
        'id':int(cid),'count':int(len(g)),
        'grade_mean':round(float(g['grade_final'].mean()),2),
        'studytime_mean':round(float(g['studytime'].mean()),2),
        'absences_mean':round(float(g['absences'].mean()),2),
        'goout_mean':round(float(g['goout'].mean()),2),
        'alcohol_mean':round(float(g['alcohol_weekend'].mean()),2),
        'at_risk_rate':round(float(g['at_risk'].mean()),3)
    })
print('===CLUSTERS==='); print(json.dumps(cstats)); print('===END===')
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
