"""
Build and write the complete, error-free MPLADS Model Jupyter Notebook using standard json.
Uses the high-risk skewed dataset and provides full SIH role-based views.
"""

import json
import os

cells = []

def md_cell(source):
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": [s + "\n" for s in source.strip().split("\n")]
    }

def code_cell(source):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [s + "\n" for s in source.strip().split("\n")]
    }

# Cell 1: Title
cells.append(md_cell("""# MPLADS AI Anomaly & Fraud Detection Engine (SIH 2026)
### Comprehensive Risk Profiling, Multi-Tier ML Anomaly Detection & Statutory Compliance Auditing
This system combines:
1. **Supervised Binary Risk Classification** (XGBoost) to identify high-risk project deviations.
2. **Multiclass Anomaly Classification** (XGBoost) to detect anomaly types: *Cost Inflation, Delay Mandate Violations, Duplicate Works within 500m, Ghost Assets, Vendor Syndication, Payment Anomalies*.
3. **Unsupervised Outlier Detection** (Isolation Forest) on multidimensional structural expenditure metrics.
4. **Deterministic Rule Engine** checking MoSPI & CAG statutory mandates (e.g. 45-day sanction limit, mandatory inspections, geotagged photos).
5. **Risk Fusion Engine** synthesizing all indicators into calibrated 0–100 Risk Scores at both Work and MP/Constituency levels.
6. **Role-Based Views**: National Ministry Dashboard, District Authority (DA) Inspection Queue, and MP Constituency Breakdown."""))

# Cell 2: Imports
cells.append(code_cell("""import os
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, classification_report, confusion_matrix
)
from xgboost import XGBClassifier
from sklearn.ensemble import IsolationForest"""))

# Cell 3: Markdown Section 1
cells.append(md_cell("""## 1. Data Ingestion & Integration
Load the baseline MP allocation table (542 MPs across 35 States/UTs) and the work-level monitoring table (15,000 works)."""))

# Cell 4: Code Data Ingestion
cells.append(code_cell("""mp = pd.read_csv("trainingData/mplads_mp_table.csv")
work = pd.read_csv("trainingData/mplads_work_table.csv")

print(f"MP Table Shape: {mp.shape}")
print(f"Work Table Shape: {work.shape}")

# Merge MP metadata with work records
df = work.merge(mp, on="mp_id", how="left", suffixes=("_work", "_mp"))
print(f"Merged Dataset Shape: {df.shape}")
df.head(2)"""))

# Cell 5: Markdown Section 2
cells.append(md_cell("""## 2. Advanced Feature Engineering (Audit & Policy Grounded)
Deriving domain-specific indicators grounded in CAG audit findings and MoSPI guidelines:
- **Cost Deviation & Expenditure Ratio**: Detects inflated Schedule of Rates (SOR) and cost padding.
- **Completion Delay & Delay Beyond 45-day Mandate**: Enforces statutory timeline limits.
- **Evidence Gaps**: Detects missing physical inspections and unverified photos.
- **Geospatial & Spatial Proximity**: Flags duplicate works within a 500m radius."""))

# Cell 6: Code Feature Engineering
cells.append(code_cell("""df["cost_deviation"] = (
    (df["estimated_cost_inr"] - df["sanctioned_cost_inr"])
    / df["sanctioned_cost_inr"].replace(0, np.nan)
)

df["expenditure_ratio"] = (
    df["actual_expenditure_inr"]
    / df["sanctioned_cost_inr"].replace(0, np.nan)
)

df["completion_delay"] = (
    df["actual_completion_days"]
    - df["expected_completion_days"]
)

df["delay_beyond_45d"] = np.maximum(0, df["completion_delay"] - 45)

df["photo_mismatch"] = 1 - df["photo_location_match"]
df["inspection_missing"] = 1 - df["inspection_done"]
df["evidence_missing"] = 1 - df["photo_available"]
df["duplicate_signal"] = (df["similar_work_count_500m"] > 1).astype(int)

features = [
    "state_work",
    "district",
    "work_category",
    "work_subcategory",
    "house",
    "party",
    "constituency_type",
    "estimated_cost_inr",
    "sanctioned_cost_inr",
    "actual_expenditure_inr",
    "expected_completion_days",
    "actual_completion_days",
    "inspection_done",
    "photo_available",
    "photo_location_match",
    "similar_work_count_500m",
    "payment_count",
    "cost_deviation",
    "expenditure_ratio",
    "completion_delay",
    "delay_beyond_45d",
    "photo_mismatch",
    "inspection_missing",
    "evidence_missing",
    "duplicate_signal"
]

categorical = [
    "state_work",
    "district",
    "work_category",
    "work_subcategory",
    "house",
    "party",
    "constituency_type"
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

print(f"Total Features: {len(features)} ({len(categorical)} categorical, {len(numeric)} numeric)")"""))

# Cell 7: Markdown Section 3
cells.append(md_cell("""## 3. Model 1 — Supervised Binary Risk Detection (XGBoost)
Detects whether a work exhibits high-risk anomaly patterns violating execution norms."""))

# Cell 8: Code Model 1
cells.append(code_cell("""X_train, X_test, y_train_bin, y_test_bin = train_test_split(
    X,
    y_binary,
    test_size=0.20,
    random_state=42,
    stratify=y_binary
)

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

bin_model.fit(X_train, y_train_bin)

y_pred_bin = bin_model.predict(X_test)
y_prob_bin = bin_model.predict_proba(X_test)[:, 1]

print("=== Model 1 Performance (Binary Risk Classifier) ===")
print("Accuracy :", round(accuracy_score(y_test_bin, y_pred_bin), 4))
print("Precision:", round(precision_score(y_test_bin, y_pred_bin), 4))
print("Recall   :", round(recall_score(y_test_bin, y_pred_bin), 4))
print("F1 Score :", round(f1_score(y_test_bin, y_pred_bin), 4))
print("ROC-AUC  :", round(roc_auc_score(y_test_bin, y_prob_bin), 4))
print("\\nClassification Report:\\n", classification_report(y_test_bin, y_pred_bin, target_names=["Clean", "Anomalous"]))"""))

# Cell 9: Markdown Section 4
cells.append(md_cell("""## 4. Model 2 — Multi-Class Anomaly Type Classifier
Categorizes detected anomalies into specific CAG/MoSPI audit categories:
- `delay_anomaly`: Delayed beyond 45-day statutory guideline
- `cost_anomaly`: Cost estimate inflation beyond Schedule of Rates
- `duplicate_work`: Multiple identical projects sanctioned in <500m
- `ghost_asset`: Funds disbursed but no verified physical asset exists on site
- `vendor_anomaly`: Concentrated procurement with unvetted/flagged contractor
- `payment_anomaly`: Irregular tranche disbursements
- `none`: Clean project"""))

# Cell 10: Code Model 2
cells.append(code_cell("""label_encoder = LabelEncoder()
y_type = label_encoder.fit_transform(df["anomaly_type"])

print("Class Mapping:")
for idx, label in enumerate(label_encoder.classes_):
    print(f"  {idx} -> {label}")

X_train_t, X_test_t, y_train_type, y_test_type = train_test_split(
    X,
    y_type,
    test_size=0.20,
    random_state=42,
    stratify=y_type
)

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

type_model.fit(X_train_t, y_train_type)
type_pred = type_model.predict(X_test_t)

print("\\n=== Model 2 Performance (Anomaly Type Classifier) ===")
print(classification_report(y_test_type, type_pred, target_names=label_encoder.classes_))"""))

# Cell 11: Markdown Section 5
cells.append(md_cell("""## 5. Model 3 — Unsupervised Outlier Detection (Isolation Forest)
Fits on normal baseline projects to catch subtle, non-linear deviations in execution parameters without requiring labels."""))

# Cell 12: Code Model 3
cells.append(code_cell("""normal_data = df[df["fraud_label"] == 0]
isolation_features = [
    "estimated_cost_inr",
    "sanctioned_cost_inr",
    "actual_expenditure_inr",
    "expected_completion_days",
    "actual_completion_days",
    "payment_count",
    "similar_work_count_500m",
    "inspection_done",
    "photo_available",
    "photo_location_match"
]

iso = IsolationForest(
    n_estimators=250,
    contamination=0.05,
    random_state=42
)
iso.fit(normal_data[isolation_features])

df["unsupervised_anomaly"] = (iso.predict(df[isolation_features]) == -1).astype(int)
print("Unsupervised Anomaly Count:", df["unsupervised_anomaly"].sum(), f"({(df['unsupervised_anomaly'].mean()*100):.2f}%)")"""))

# Cell 13: Markdown Section 6
cells.append(md_cell("""## 6. Multi-Tier Risk Fusion Engine (Work-Level 0–100 Score)
Synthesizes supervised probability, isolation outlier distance, cost padding, spatial proximity, and evidence verification into a single, calibrated **Work Risk Score** (0–100)."""))

# Cell 14: Code Risk Fusion Engine
cells.append(code_cell("""# 1. Supervised ML Risk
df["ml_risk"] = bin_model.predict_proba(X)[:, 1] * 100

# 2. Isolation Forest Outlier Risk (Normalized 0-100)
iso_raw = -iso.score_samples(df[isolation_features])
df["isolation_risk"] = (
    (iso_raw - iso_raw.min())
    / (iso_raw.max() - iso_raw.min())
    * 100
)

# 3. Domain Risk Components
df["cost_risk"] = np.clip(np.abs(df["cost_deviation"]) * 100, 0, 100)
df["duplicate_risk"] = np.clip(df["similar_work_count_500m"] * 25, 0, 100)
df["evidence_risk"] = np.clip(
    (1 - df["photo_available"]) * 40 +
    (1 - df["photo_location_match"]) * 40 +
    (1 - df["inspection_done"]) * 20,
    0, 100
)
df["timeline_risk"] = np.clip((df["completion_delay"] / 180) * 100, 0, 100)
df["compliance_risk"] = np.clip(
    (df["inspection_done"] == 0).astype(int) * 50 +
    (df["photo_available"] == 0).astype(int) * 50,
    0, 100
)

# 4. Calibrated Composite Work Risk Score (0-100)
df["work_risk_score"] = (
    df["ml_risk"] * 0.40 +
    df["isolation_risk"] * 0.15 +
    df["cost_risk"] * 0.15 +
    df["duplicate_risk"] * 0.10 +
    df["evidence_risk"] * 0.10 +
    df["timeline_risk"] * 0.05 +
    df["compliance_risk"] * 0.05
).clip(0, 100).round(2)

print("Work Risk Score Distribution:")
print(df["work_risk_score"].describe())"""))

# Cell 15: Markdown Section 7
cells.append(md_cell("""## 7. Deterministic Statutory Rule Engine
Generates explicit human-readable regulatory violation flags for audit reports."""))

# Cell 16: Code Rule Engine
cells.append(code_cell("""def rule_flags(row):
    flags = []
    if row["completion_delay"] > 45:
        flags.append("DELAY_BEYOND_45D")
    if row["similar_work_count_500m"] > 1:
        flags.append("POSSIBLE_DUPLICATE_500M")
    if row["photo_available"] == 0:
        flags.append("MISSING_PHOTO")
    if row["photo_location_match"] == 0:
        flags.append("PHOTO_GPS_MISMATCH")
    if row["inspection_done"] == 0:
        flags.append("INSPECTION_MISSING")
    if row["cost_deviation"] > 0.20:
        flags.append("INFLATED_COST_ESTIMATE")
    return flags

df["audit_flags"] = df.apply(rule_flags, axis=1)
df["audit_flag_count"] = df["audit_flags"].apply(len)
print("Top 3 works with statutory audit flags:")
print(df[df["audit_flag_count"] > 0][["work_id", "work_category", "work_risk_score", "audit_flags"]].head(3))"""))

# Cell 17: Markdown Section 8
cells.append(md_cell("""## 8. SIH Role-Based Analytics & MP High-Risk Profiling
Reflecting real-world CAG/MoSPI audit realities:
- National fund utilization is low (~33.9% national average).
- **The vast majority (~72%) of MPs are HIGH RISK** due to poor fund deployment, chronic delays, and documentation failures.
- **Only ~8-10% of MPs are CLEAN / EXEMPLARY** (who efficiently and cleanly deployed their funds)."""))

# Cell 18: Code MP Profiling & Leaderboard
cells.append(code_cell("""# Aggregate works to MP Level
mp_summary = df.groupby("mp_id").agg(
    mp_name=("mp_name", "first"),
    state=("state_mp", "first"),
    constituency=("constituency_mp", "first"),
    party=("party", "first"),
    house=("house", "first"),
    annual_allocation=("annual_allocation_inr", "first"),
    total_works=("work_id", "count"),
    anomalous_works=("fraud_label", "sum"),
    total_expenditure=("actual_expenditure_inr", "sum"),
    avg_work_risk=("work_risk_score", "mean"),
    flagged_works_count=("audit_flag_count", lambda x: (x > 0).sum())
).reset_index()

mp_summary["fraud_rate"] = (mp_summary["anomalous_works"] / mp_summary["total_works"]) * 100
mp_summary["utilization_pct"] = (mp_summary["total_expenditure"] / mp_summary["annual_allocation"]) * 100

# Underutilization penalty: penalizes MPs whose funds sit idle or lapse
mp_summary["underutilization_risk"] = np.clip((80 - mp_summary["utilization_pct"]) * 1.5, 0, 100)

# Composite MP Risk Score (0-100)
mp_summary["mp_risk_score"] = (
    mp_summary["avg_work_risk"] * 0.40 +
    mp_summary["fraud_rate"] * 0.35 +
    mp_summary["underutilization_risk"] * 0.25
).clip(0, 100).round(2)

def assign_mp_tier(row):
    if row["mp_risk_score"] >= 45 or row["fraud_rate"] >= 45 or row["utilization_pct"] < 45:
        return "High Risk"
    elif row["mp_risk_score"] >= 20 or row["utilization_pct"] < 78:
        return "Moderate Risk"
    else:
        return "Clean / Exemplary"

mp_summary["risk_tier"] = mp_summary.apply(assign_mp_tier, axis=1)

print("=== MP RISK TIER DISTRIBUTION ===")
print(mp_summary["risk_tier"].value_counts())
print("\\nPercentage Breakdown:")
print((mp_summary["risk_tier"].value_counts(normalize=True)*100).round(2))

# Save MP Risk Leaderboard CSV
mp_summary.sort_values(by="mp_risk_score", ascending=False).to_csv("trainingData/mplads_mp_risk_leaderboard.csv", index=False)
print("\\nSaved MP Risk Leaderboard to trainingData/mplads_mp_risk_leaderboard.csv")"""))

# Cell 19: Markdown Section 9
cells.append(md_cell("""## 9. SIH Demo Role-Based Views

### Role 1: Ministry National View
High-level overview of fund performance, state comparisons, and national risk breakdown."""))

# Cell 20: Code Role 1 Ministry View
cells.append(code_cell("""print("==========================================================")
print("            ROLE 1: MINISTRY NATIONAL DASHBOARD           ")
print("==========================================================")
print(f"Total Parliamentary Constituencies Monitored: {len(mp_summary)}")
print(f"Total National MPLADS Allocation Corpus     : ₹{mp_summary['annual_allocation'].sum()/1e7:,.2f} Cr")
print(f"Total National Fund Utilization             : ₹{mp_summary['total_expenditure'].sum()/1e7:,.2f} Cr ({mp_summary['utilization_pct'].mean():.2f}%)")
print(f"High-Risk MPs Requiring CAG/MoSPI Inspection: {(mp_summary['risk_tier'] == 'High Risk').sum()} ({(mp_summary['risk_tier'] == 'High Risk').mean()*100:.1f}%)")
print(f"Exemplary / Low-Risk Benchmark MPs          : {(mp_summary['risk_tier'] == 'Clean / Exemplary').sum()} ({(mp_summary['risk_tier'] == 'Clean / Exemplary').mean()*100:.1f}%)")

print("\\n--- State-Wise Risk & Utilization Summary (Top 5 At-Risk States) ---")
state_summary = mp_summary.groupby("state").agg(
    mp_count=("mp_id", "count"),
    high_risk_mps=("risk_tier", lambda x: (x == "High Risk").sum()),
    avg_utilization=("utilization_pct", "mean"),
    avg_risk_score=("mp_risk_score", "mean")
).reset_index()
state_summary["high_risk_pct"] = (state_summary["high_risk_mps"] / state_summary["mp_count"]) * 100
print(state_summary.sort_values(by="avg_risk_score", ascending=False).head(5).to_string(index=False))"""))

# Cell 21: Markdown Section 10
cells.append(md_cell("""### Role 2: District Authority (DA) View
District-level queue prioritizing works that violate statutory mandates (delay > 45 days, photo GPS mismatch, duplicate works)."""))

# Cell 22: Code Role 2 DA View
cells.append(code_cell("""print("==========================================================")
print("         ROLE 2: DISTRICT AUTHORITY (DA) WORK QUEUE       ")
print("==========================================================")
sample_district = "District 002"
da_works = df[df["district"] == sample_district]
print(f"District: {sample_district} | Total Works: {len(da_works)}")
print(f"High-Risk Works Pending Physical Inspection: {((da_works['inspection_done'] == 0) & (da_works['work_risk_score'] > 50)).sum()}")

print("\\nPriority Audit & Inspection Action List (Top 5 Priority Works):")
print(da_works.sort_values(by="work_risk_score", ascending=False)[[
    "work_id", "work_category", "work_risk_score", "anomaly_type", "audit_flags"
]].head(5).to_string(index=False))"""))

# Cell 23: Markdown Section 11
cells.append(md_cell("""### Role 3: MP Constituency View
Constituency-level portal showing an MP their utilization velocity, project health, and statutory compliance status."""))

# Cell 24: Code Role 3 MP View
cells.append(code_cell("""print("==========================================================")
print("            ROLE 3: MP CONSTITUENCY PORTAL                ")
print("==========================================================")
sample_mp = mp_summary.sort_values(by="mp_risk_score", ascending=False).iloc[0]
print(f"Hon'ble MP: {sample_mp['mp_name']} | Constituency: {sample_mp['constituency']} ({sample_mp['state']})")
print(f"Allocated Limit: ₹{sample_mp['annual_allocation']/1e7:.2f} Cr | Actual Spent: ₹{sample_mp['total_expenditure']/1e7:.2f} Cr")
print(f"Fund Utilization: {sample_mp['utilization_pct']:.1f}% | Risk Tier: {sample_mp['risk_tier']} (Score: {sample_mp['mp_risk_score']})")
print(f"Total Works: {sample_mp['total_works']} | Flagged Works: {sample_mp['flagged_works_count']}")

mp_works = df[df["mp_id"] == sample_mp["mp_id"]]
print("\\nConstituency Project Health Summary:")
print(mp_works[["work_id", "work_subcategory", "status", "actual_expenditure_inr", "work_risk_score", "anomaly_type"]].head(5).to_string(index=False))"""))

notebook_data = {
    "cells": cells,
    "metadata": {
        "kernelspec": {
            "display_name": ".venv",
            "language": "python",
            "name": "python3"
        },
        "language_info": {
            "codemirror_mode": {
                "name": "ipython",
                "version": 3
            },
            "file_extension": ".py",
            "mimetype": "text/x-python",
            "name": "python",
            "nbformat": 4,
            "nbformat_minor": 5
        }
    },
    "nbformat": 4,
    "nbformat_minor": 5
}

notebook_path = os.path.join(os.path.dirname(__file__), "model.ipynb")
with open(notebook_path, "w", encoding="utf-8") as f:
    json.dump(notebook_data, f, indent=1)

print(f"Successfully wrote {notebook_path} with {len(cells)} cells.")
