"""
MPLADS-SATHI: Model Training & Artifact Serialization Pipeline (Base / MLOps)
Author: Team Code_Warrior6 (SIH 2026)
Location: Model/training/export_models.py
Purpose: Trains supervised (XGBoost) and unsupervised (Isolation Forest) models on the
         all-states dataset and exports production-grade serialized artifacts to Model/saved_models/.
"""

import json
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder, StandardScaler
import xgboost as xgb

# Robust path resolution pointing to Model/ root
MODEL_ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(MODEL_ROOT_DIR, "dataset", "mplads_work_table.csv")
OUTPUT_DIR = os.path.join(MODEL_ROOT_DIR, "saved_models")
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("=" * 65)
print("  [BASE PIPELINE] MPLADS-SATHI: Model Training & Serialization")
print("=" * 65)

# 1. Load Dataset
print(f"Loading dataset: {DATASET_PATH}...")
df = pd.read_csv(DATASET_PATH)
print(f"Loaded {len(df):,} works with {df.shape[1]} columns.")

# 2. Feature Engineering & Type Normalization
int_cols = [
    'expected_completion_days', 'actual_completion_days', 'inspection_done',
    'photo_available', 'photo_location_match', 'similar_work_count_500m',
    'payment_count', 'is_anomalous'
]
for col in int_cols:
    if col in df.columns:
        df[col] = df[col].astype(int)

float_cols = [
    'estimated_cost_inr', 'sanctioned_cost_inr', 'actual_expenditure_inr',
    'cost_overrun_ratio', 'delay_days', 'cost_deviation_pct'
]
for col in float_cols:
    if col in df.columns:
        df[col] = df[col].astype(float)

# Derived features
if 'completion_ratio' not in df.columns:
    df['completion_ratio'] = (df['actual_completion_days'] / df['expected_completion_days'].clip(lower=1)).round(4)
if 'cost_efficiency' not in df.columns:
    df['cost_efficiency'] = (df['actual_expenditure_inr'] / df['sanctioned_cost_inr'].clip(lower=1)).round(4)
if 'evidence_score' not in df.columns:
    df['evidence_score'] = (df['inspection_done'] + df['photo_available'] + df['photo_location_match']) / 3.0

# 3. Label Encoders
le_constituency = LabelEncoder()
df['constituency_type_enc'] = le_constituency.fit_transform(df['constituency_type'].astype(str))
joblib.dump(le_constituency, os.path.join(OUTPUT_DIR, "le_constituency.joblib"))
print("  -> Saved: le_constituency.joblib")

# Supervised Feature Columns
FEATURE_COLS = [
    'estimated_cost_inr', 'sanctioned_cost_inr', 'actual_expenditure_inr',
    'expected_completion_days', 'actual_completion_days',
    'inspection_done', 'photo_available', 'photo_location_match',
    'similar_work_count_500m', 'payment_count',
    'cost_overrun_ratio', 'delay_days', 'cost_deviation_pct',
    'completion_ratio', 'cost_efficiency', 'evidence_score',
    'constituency_type_enc'
]

X = df[FEATURE_COLS].copy()
y_binary = df['is_anomalous'].copy()

# 4. Train & Export Model 1: Binary Risk Classifier (XGBoost)
print("\n[1/3] Training Model 1: XGBoost Binary Risk Classifier...")
xgb_binary = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=3,
    gamma=0.1,
    reg_alpha=0.1,
    reg_lambda=1.0,
    random_state=42,
    eval_metric='logloss'
)
xgb_binary.fit(X, y_binary)
xgb_binary.save_model(os.path.join(OUTPUT_DIR, "xgb_binary.json"))
print("  -> Saved: xgb_binary.json")

# 5. Train & Export Model 2: Multiclass Anomaly Classifier (XGBoost)
print("\n[2/3] Training Model 2: XGBoost Multiclass Anomaly Classifier...")
anom_df = df[df['is_anomalous'] == 1].copy()
le_anomaly = LabelEncoder()
anom_df['anomaly_label'] = le_anomaly.fit_transform(anom_df['anomaly_type'])
joblib.dump(le_anomaly, os.path.join(OUTPUT_DIR, "le_anomaly.joblib"))

X_anom = anom_df[FEATURE_COLS].copy()
y_anom = anom_df['anomaly_label'].copy()

xgb_multi = xgb.XGBClassifier(
    n_estimators=250,
    max_depth=7,
    learning_rate=0.08,
    subsample=0.85,
    colsample_bytree=0.85,
    min_child_weight=3,
    gamma=0.15,
    reg_alpha=0.1,
    reg_lambda=1.0,
    objective='multi:softprob',
    num_class=len(le_anomaly.classes_),
    random_state=42,
    eval_metric='mlogloss'
)
xgb_multi.fit(X_anom, y_anom)
xgb_multi.save_model(os.path.join(OUTPUT_DIR, "xgb_multi.json"))
print("  -> Saved: xgb_multi.json")

# 6. Train & Export Model 3: Isolation Forest (Unsupervised)
print("\n[3/3] Training Model 3: Isolation Forest Outlier Detector...")
ISO_FEATURES = [
    'estimated_cost_inr', 'sanctioned_cost_inr', 'actual_expenditure_inr',
    'expected_completion_days', 'actual_completion_days',
    'cost_overrun_ratio', 'delay_days', 'payment_count',
    'similar_work_count_500m', 'cost_deviation_pct', 'completion_ratio'
]

X_iso = df[ISO_FEATURES].copy()
iso_scaler = StandardScaler()
X_iso_scaled = iso_scaler.fit_transform(X_iso)
joblib.dump(iso_scaler, os.path.join(OUTPUT_DIR, "iso_scaler.joblib"))

iso_forest = IsolationForest(
    n_estimators=200,
    max_samples='auto',
    contamination=0.10,
    max_features=1.0,
    bootstrap=False,
    random_state=42,
    n_jobs=-1
)
iso_forest.fit(X_iso_scaled)
joblib.dump(iso_forest, os.path.join(OUTPUT_DIR, "iso_forest.joblib"))
print("  -> Saved: iso_forest.joblib & iso_scaler.joblib")

# Compute Isolation Forest score bounds for calibration
raw_iso_scores = iso_forest.decision_function(X_iso_scaled)
iso_min = float(raw_iso_scores.min())
iso_max = float(raw_iso_scores.max())

# 7. Export Metadata & Feature Manifest
metadata = {
    "project": "MPLADS-SATHI",
    "team": "Code_Warrior6",
    "version": "1.0.0",
    "feature_cols_supervised": FEATURE_COLS,
    "feature_cols_isolation": ISO_FEATURES,
    "constituency_types": list(le_constituency.classes_),
    "anomaly_types": list(le_anomaly.classes_),
    "iso_score_bounds": {"min": iso_min, "max": iso_max},
    "risk_weights": {
        "w_ml": 0.30,
        "w_iso": 0.15,
        "w_cost": 0.20,
        "w_geo": 0.10,
        "w_evidence": 0.15,
        "w_delay": 0.10
    },
    "risk_tiers": {
        "LOW": [0, 30],
        "MODERATE": [30, 60],
        "HIGH": [60, 80],
        "CRITICAL": [80, 100]
    }
}

with open(os.path.join(OUTPUT_DIR, "metadata.json"), "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2)
print("  -> Saved: metadata.json")

print("\n" + "=" * 65)
print(f"  All model artifacts successfully exported to:\n  {OUTPUT_DIR}")
print("=" * 65)
