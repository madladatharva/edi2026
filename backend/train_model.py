import pandas as pd
import os
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score

print("Loading synthetic time-series dataset...")
df = pd.read_csv('../data/processed/zones_timeseries.csv')

print("Engineering temporal features (1hr, 3hr, 6hr rolling sums)...")
df['timestamp'] = pd.to_datetime(df['timestamp'])
df = df.sort_values(by=['zone_id', 'timestamp'])
df['rainfall_3hr_sum'] = df.groupby('zone_id')['rainfall_mm'].rolling(3).sum().reset_index(0, drop=True).fillna(0)
df['rainfall_6hr_sum'] = df.groupby('zone_id')['rainfall_mm'].rolling(6).sum().reset_index(0, drop=True).fillna(0)

features = ['rainfall_mm', 'rainfall_3hr_sum', 'rainfall_6hr_sum', 'elevation_m', 'drainage_capacity_score']
X = df[features]
y = df['flood_incident_flag']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training Random Forest Classifier...")
clf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42, class_weight='balanced')
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
print(f"F1 Score:  {f1_score(y_test, y_pred):.4f}")

os.makedirs('models', exist_ok=True)
model_path = 'models/risk_model.pkl'
joblib.dump(clf, model_path)
print(f"Model saved to {model_path}")

print("\nFeature Importances:")
importances = clf.feature_importances_
for f, imp in zip(features, importances):
    print(f" - {f}: {imp:.4f}")
