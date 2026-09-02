"""
Export and Save all trained MPLADS Models for production/demo deployment.
Saves:
- bin_model.joblib: Binary Risk Detection Pipeline (Preprocessor + XGBoost)
- type_model.joblib: Multiclass Anomaly Classifier Pipeline (Preprocessor + XGBoost)
- iso_forest.joblib: Isolation Forest Outlier Detector
- label_encoder.joblib: Anomaly Type Label Encoder
- metadata.json: Feature lists, version info, and calibration constants
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier
from sklearn.ensemble import IsolationForest

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

print("1. Loading training datasets...")
mp = pd.read_csv("trainingData/mplads_mp_table.csv")
work = pd.read_csv("trainingData/mplads_work_table.csv")
df = work.merge(mp, on="mp_id", how="left", suffixes=("_work", "_mp"))

print("2. Computing domain features...")
df["cost_deviation"] = (
    (df["estimated_cost_inr"] - df["sanctioned_cost_inr"])
    / df["sanctioned_cost_inr"].replace(0, np.nan)
)
df["expenditure_ratio"] = (
    df["actual_expenditure_inr"]
    / df["sanctioned_cost_inr"].replace(0, np.nan)
)
df["completion_delay"] = (
    df["actual_completion_days"] - df["expected_completion_days"]
)
df["delay_beyond_45d"] = np.maximum(0, df["completion_delay"] - 45)
df["photo_mismatch"] = 1 - df["photo_location_match"]
df["inspection_missing"] = 1 - df["inspection_done"]
df["evidence_missing"] = 1 - df["photo_available"]
df["duplicate_signal"] = (df["similar_work_count_500m"] > 1).astype(int)

features = [
    "state_work", "district", "work_category", "work_subcategory",
    "house", "party", "constituency_type",
    "estimated_cost_inr", "sanctioned_cost_inr", "actual_expenditure_inr",
    "expected_completion_days", "actual_completion_days",
    "inspection_done", "photo_available", "photo_location_match",
    "similar_work_count_500m", "payment_count",
    "cost_deviation", "expenditure_ratio", "completion_delay",
    "delay_beyond_45d", "photo_mismatch", "inspection_missing",
    "evidence_missing", "duplicate_signal"
]

categorical = [
    "state_work", "district", "work_category", "work_subcategory",
    "house", "party", "constituency_type"
]
numeric = [c for c in features if c not in categorical]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
        ("num", "passthrough", numeric)
    ]
)

X = df[features]
y_binary = df["fraud_label"]

print("3. Training Model 1 (Binary Risk Detector)...")
bin_model = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", XGBClassifier(
        n_estimators=350,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.85,
        colsample_bytree=0.85,
        eval_metric="logloss",
        random_state=42
    ))
])
bin_model.fit(X, y_binary)

print("4. Training Model 2 (Multiclass Anomaly Classifier)...")
label_encoder = LabelEncoder()
y_type = label_encoder.fit_transform(df["anomaly_type"])

type_model = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", XGBClassifier(
        n_estimators=350,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.85,
        colsample_bytree=0.85,
        objective="multi:softprob",
        num_class=len(label_encoder.classes_),
        eval_metric="mlogloss",
        random_state=42
    ))
])
type_model.fit(X, y_type)

print("5. Training Model 3 (Isolation Forest Outlier Detector)...")
isolation_features = [
    "estimated_cost_inr", "sanctioned_cost_inr", "actual_expenditure_inr",
    "expected_completion_days", "actual_completion_days",
    "payment_count", "similar_work_count_500m",
    "inspection_done", "photo_available", "photo_location_match"
]
normal_data = df[df["fraud_label"] == 0]
iso = IsolationForest(n_estimators=250, contamination=0.05, random_state=42)
iso.fit(normal_data[isolation_features])

# Score limits for normalization
iso_scores = -iso.score_samples(df[isolation_features])
iso_min = float(iso_scores.min())
iso_max = float(iso_scores.max())

print("6. Exporting model artifacts to saved_models/...")
joblib.dump(bin_model, os.path.join(MODEL_DIR, "bin_model.joblib"))
joblib.dump(type_model, os.path.join(MODEL_DIR, "type_model.joblib"))
joblib.dump(iso, os.path.join(MODEL_DIR, "iso_forest.joblib"))
joblib.dump(label_encoder, os.path.join(MODEL_DIR, "label_encoder.joblib"))

metadata = {
    "features": features,
    "categorical": categorical,
    "numeric": numeric,
    "isolation_features": isolation_features,
    "classes": list(label_encoder.classes_),
    "iso_min": iso_min,
    "iso_max": iso_max,
    "version": "SIH2026-v1.0"
}

with open(os.path.join(MODEL_DIR, "metadata.json"), "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)

print(f"\nSUCCESS! All models successfully exported to: {MODEL_DIR}")
print("Saved files:")
for f in os.listdir(MODEL_DIR):
    size_kb = os.path.getsize(os.path.join(MODEL_DIR, f)) / 1024
    print(f"  - {f} ({size_kb:.1f} KB)")
