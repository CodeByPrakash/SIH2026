"""
MPLADS Model Inference Engine (SIH 2026).
Loads exported models and provides instant risk assessment and audit flag generation
for new incoming project proposals, ongoing works, or completed assets.

Usage:
  from inference import MPLADSPredictor

  predictor = MPLADSPredictor()
  result = predictor.predict_work({
      "state": "Haryana",
      "district": "District 002",
      "work_category": "Road",
      "work_subcategory": "Road Construction",
      "house": "Lok Sabha",
      "party": "INC",
      "constituency_type": "General",
      "estimated_cost_inr": 4500000.0,
      "sanctioned_cost_inr": 6200000.0,
      "actual_expenditure_inr": 7100000.0,
      "expected_completion_days": 120,
      "actual_completion_days": 280,
      "inspection_done": 0,
      "photo_available": 1,
      "photo_location_match": 0,
      "similar_work_count_500m": 3,
      "payment_count": 6
  })
"""

import os
import json
import joblib
import pandas as pd
import numpy as np

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")

class MPLADSPredictor:
    def __init__(self, model_dir=MODEL_DIR):
        print(f"Loading MPLADS AI models from {model_dir}...")
        self.bin_model = joblib.load(os.path.join(model_dir, "bin_model.joblib"))
        self.type_model = joblib.load(os.path.join(model_dir, "type_model.joblib"))
        self.iso_forest = joblib.load(os.path.join(model_dir, "iso_forest.joblib"))
        self.label_encoder = joblib.load(os.path.join(model_dir, "label_encoder.joblib"))

        with open(os.path.join(model_dir, "metadata.json"), "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        self.features = self.metadata["features"]
        self.isolation_features = self.metadata["isolation_features"]
        self.iso_min = self.metadata["iso_min"]
        self.iso_max = self.metadata["iso_max"]
        print("Models loaded and ready for live inference!")

    def _prepare_features(self, df_input):
        df = df_input.copy()

        # Map state/constituency column names if standard names passed
        if "state" in df.columns and "state_work" not in df.columns:
            df["state_work"] = df["state"]

        # Default fallbacks for optional metadata
        defaults = {
            "house": "Lok Sabha",
            "party": "Independent",
            "constituency_type": "General",
            "district": "District 001",
            "inspection_done": 1,
            "photo_available": 1,
            "photo_location_match": 1,
            "similar_work_count_500m": 0,
            "payment_count": 3,
            "expected_completion_days": 180,
            "actual_completion_days": 180
        }
        for k, v in defaults.items():
            if k not in df.columns:
                df[k] = v

        # Compute derived domain audit features
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

        return df

    def predict(self, df_input):
        """Predict risk, anomaly type, and calibrated risk score for a DataFrame of works."""
        df = self._prepare_features(df_input)
        X = df[self.features]

        # 1. Supervised Binary Risk
        is_anomalous = self.bin_model.predict(X)
        ml_risk_prob = self.bin_model.predict_proba(X)[:, 1] * 100

        # 2. Anomaly Classification
        type_idx = self.type_model.predict(X)
        anomaly_types = self.label_encoder.inverse_transform(type_idx)
        type_probs = self.type_model.predict_proba(X)
        type_confidence = np.max(type_probs, axis=1) * 100

        # 3. Isolation Forest Outlier
        iso_scores = -self.iso_forest.score_samples(df[self.isolation_features])
        isolation_risk = np.clip(
            ((iso_scores - self.iso_min) / (self.iso_max - self.iso_min)) * 100,
            0, 100
        )
        unsupervised_outlier = (self.iso_forest.predict(df[self.isolation_features]) == -1)

        # 4. Domain Components
        cost_risk = np.clip(np.abs(df["cost_deviation"]) * 100, 0, 100)
        duplicate_risk = np.clip(df["similar_work_count_500m"] * 25, 0, 100)
        evidence_risk = np.clip(
            (1 - df["photo_available"]) * 40 +
            (1 - df["photo_location_match"]) * 40 +
            (1 - df["inspection_done"]) * 20,
            0, 100
        )
        timeline_risk = np.clip((df["completion_delay"] / 180) * 100, 0, 100)
        compliance_risk = np.clip(
            (df["inspection_done"] == 0).astype(int) * 50 +
            (df["photo_available"] == 0).astype(int) * 50,
            0, 100
        )

        # 5. Composite Work Risk Score (0-100)
        work_risk_score = (
            ml_risk_prob * 0.40 +
            isolation_risk * 0.15 +
            cost_risk * 0.15 +
            duplicate_risk * 0.10 +
            evidence_risk * 0.10 +
            timeline_risk * 0.05 +
            compliance_risk * 0.05
        ).clip(0, 100).round(2)

        # 6. Audit Rule Flags
        def get_flags(row):
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

        audit_flags = df.apply(get_flags, axis=1)

        results = pd.DataFrame({
            "risk_score": work_risk_score,
            "risk_verdict": np.where(work_risk_score >= 50, "HIGH RISK", np.where(work_risk_score >= 25, "MODERATE RISK", "LOW RISK / CLEAN")),
            "is_anomalous": is_anomalous,
            "predicted_anomaly": anomaly_types,
            "anomaly_confidence_pct": np.round(type_confidence, 1),
            "unsupervised_outlier": unsupervised_outlier,
            "audit_flags": audit_flags
        })
        return results

    def predict_work(self, work_dict):
        """Predict for a single project dictionary."""
        df_single = pd.DataFrame([work_dict])
        res = self.predict(df_single)
        row = res.iloc[0]
        return {
            "risk_score": float(row["risk_score"]),
            "risk_verdict": str(row["risk_verdict"]),
            "is_anomalous": bool(row["is_anomalous"]),
            "predicted_anomaly": str(row["predicted_anomaly"]),
            "confidence_pct": float(row["anomaly_confidence_pct"]),
            "is_unsupervised_outlier": bool(row["unsupervised_outlier"]),
            "audit_flags": list(row["audit_flags"])
        }

if __name__ == "__main__":
    predictor = MPLADSPredictor()

    print("\n========================================================")
    print("DEMO TEST 1: High-Risk Suspicious Project (Ghost Asset + Cost Pad)")
    print("========================================================")
    suspicious_work = {
        "state": "Haryana",
        "district": "District 002",
        "work_category": "Sports",
        "work_subcategory": "Sports Complex",
        "house": "Lok Sabha",
        "party": "INC",
        "constituency_type": "General",
        "estimated_cost_inr": 3500000.0,
        "sanctioned_cost_inr": 5400000.0,     # +54% inflated
        "actual_expenditure_inr": 6200000.0, # further overrun
        "expected_completion_days": 120,
        "actual_completion_days": 280,       # 160 days delay
        "inspection_done": 0,                # uninspected
        "photo_available": 1,
        "photo_location_match": 0,           # GPS mismatch!
        "similar_work_count_500m": 3,        # duplicate works nearby
        "payment_count": 6
    }
    pred_1 = predictor.predict_work(suspicious_work)
    print(json.dumps(pred_1, indent=2))

    print("\n========================================================")
    print("DEMO TEST 2: Clean Exemplary Project (On-Time + Verified)")
    print("========================================================")
    clean_work = {
        "state": "Sikkim",
        "district": "District 010",
        "work_category": "Health",
        "work_subcategory": "Primary Health Centre",
        "house": "Lok Sabha",
        "party": "BJD",
        "constituency_type": "General",
        "estimated_cost_inr": 4200000.0,
        "sanctioned_cost_inr": 4180000.0,    # within budget
        "actual_expenditure_inr": 4150000.0, # transparent expenditure
        "expected_completion_days": 180,
        "actual_completion_days": 175,       # completed on time
        "inspection_done": 1,                # physical inspection verified
        "photo_available": 1,
        "photo_location_match": 1,           # GPS match verified
        "similar_work_count_500m": 0,
        "payment_count": 3
    }
    pred_2 = predictor.predict_work(clean_work)
    print(json.dumps(pred_2, indent=2))
