import pandas as pd, numpy as np, json, sys
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
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
X_rf = df[feature_cols].fillna(0); y_rf = df['at_risk']
X_train,X_test,y_train,y_test = train_test_split(
    X_rf, y_rf, test_size=0.2, random_state=42, stratify=y_rf)
clf = RandomForestClassifier(n_estimators=200,class_weight='balanced',random_state=42,n_jobs=-1)
clf.fit(X_train, y_train); y_pred = clf.predict(X_test)
cm = confusion_matrix(y_test, y_pred).tolist()
p,r,f,_ = precision_recall_fscore_support(y_test, y_pred, pos_label=1, average='binary')
acc = float((y_test==y_pred).mean())
rf_data = {
    'accuracy':round(acc,4), 'precision':round(float(p),4),
    'recall':round(float(r),4), 'f1':round(float(f),4),
    'tn':int(cm[0][0]),'fp':int(cm[0][1]),'fn':int(cm[1][0]),'tp':int(cm[1][1])
}
print('===RF==='); print(json.dumps(rf_data)); print('===END===')
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
