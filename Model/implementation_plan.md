# Implementation Plan: MPLADS Codebase Audit, High-Risk Realism Rebalancing & SIH Model Enhancement

## Problem Statement & Overview
The current codebase in `Model/` consists of:
1. `trainingData/mplads_mp_table.csv` (542 MPs with allocations, constituencies, state, party, house).
2. `trainingData/mplads_work_table.csv` (15,000 simulated works with costs, dates, inspections, photos, and fraud labels).
3. `model.ipynb` (Jupyter notebook with feature engineering, XGBoost binary classifier, multiclass anomaly classifier, Isolation Forest, and Risk Fusion Engine).

### Current Codebase Weaknesses & Discrepancies:
- **Unrealistic Benign Distribution**: Currently, 87.7% of all works are labeled "clean" (`fraud_label = 0`), and the average MP fraud rate is only 12.3%. **Zero MPs** have a risk rate above 33.3%, and expenditure exceeds sanctions. This directly contradicts reality, where the national fund utilization average is only ~33.9%, 57% of works violate the 45-day sanction/order mandate, and CAG reports show systemic unverified expenditure (₹161 Cr+), ghost assets, and cost inflation.
- **User Requirement**: *"make the Maximum mp data csv work to high risk means very less MP's have used amount in best way"*.
- **Bug in `model.ipynb`**: In Cell 15, `y_train, y_test = train_test_split(..., y_type, ...)` overwrites the binary `y_test` with multiclass targets. Consequently, Cell 18 crashes with `ValueError: Target is multiclass but average='binary'` and achieves an erroneous 4.8% accuracy.
- **Missing End-to-End MP Risk Profiling**: While individual works get a risk score, there is no aggregated MP/Constituency and District Authority ranking engine to show the SIH Demo role-based views (Ministry National View, DA District View, MP Constituency View) identifying high-risk vs. low-risk MPs.

---

## User Review Required

> [!IMPORTANT]
> **Data Realism Rebalancing Strategy**:
> To align with the user's requirement ("*make the Maximum mp data csv work to high risk means very less MP's have used amount in best way*") and real CAG/MoSPI audit realities:
> - **High-Risk MPs (Top ~70-75%)**: Exhibit low utilization (<35%), severe project delays (>45 to 180+ days), high uninspected works, photo/GPS mismatches (ghost asset indicators), inflated cost estimates (>20-50% over SOR), repeated contractor concentration, and duplicate works within 500m.
> - **Moderate-Risk MPs (~15-20%)**: Moderate utilization (40-60%), occasional administrative delays, minor documentation gaps.
> - **Exemplary / Low-Risk MPs (~5-10%)**: The few MPs who actively and cleanly utilize >85% of allocated funds with 100% inspection, verified geotagged photos, zero duplicate works, and on-time completion.

---

## Proposed Changes

### Component 1: Dataset Generation & Realism Rebalancing

#### [MODIFY] [mplads_work_table.csv](file:///c:/Users/absol/Desktop/SIH2026/Model/trainingData/mplads_work_table.csv)
- Rebalance the 15,000 works across the 542 MPs:
  - Inject realistic expenditure ratios reflecting the national average (~33.9% spent vs allocated).
  - Skew the MP risk distribution: ~70-75% of MPs have majority high-risk works (cost overruns, delays > 45 days, missing inspections, photo-GPS mismatches, duplicate works within 500m, vendor syndication).
  - Maintain a clean cohort of ~5-10% benchmark MPs with high utilization and verified assets.
  - Set realistic `fraud_label` and `anomaly_type` (`delay_anomaly`, `cost_anomaly`, `duplicate_work`, `ghost_asset`, `vendor_anomaly`, `payment_anomaly`, `none`).

#### [MODIFY] [mplads_mp_table.csv](file:///c:/Users/absol/Desktop/SIH2026/Model/trainingData/mplads_mp_table.csv)
- Maintain the real MPLADS allocation profile: ₹14.7 Cr standard baseline, with the real-world documented outliers (Eatala Rajender ₹32.75 Cr, Priyanka Gandhi ₹12.25 Cr, Basirhat ₹4.90 Cr, etc.).
- Ensure MP IDs match cleanly with the works dataset.

---

### Component 2: Notebook & Model Pipeline Enhancement

#### [MODIFY] [model.ipynb](file:///c:/Users/absol/Desktop/SIH2026/Model/model.ipynb)
1. **Fix Variable Overwrite Bug**: Separate binary target split (`y_train_bin, y_test_bin`) from multiclass target split (`y_train_type, y_test_type`) so evaluation metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix) execute cleanly without errors.
2. **Enhanced Feature Engineering**:
   - `cost_deviation`: (estimated - sanctioned) / sanctioned
   - `expenditure_ratio`: actual_expenditure / sanctioned_cost
   - `utilization_rate`: actual_expenditure / annual_allocation (MP-level fund efficiency)
   - `completion_delay`: actual_completion_days - expected_completion_days
   - `delay_beyond_mandate`: max(0, completion_delay - 45) (enforcing 45-day guideline)
   - `photo_mismatch`, `inspection_missing`, `evidence_missing`, `duplicate_signal`
3. **Model 1 (Binary Risk Detector)**: XGBoost Classifier with class weighting to handle high-risk vs normal works, ROC-AUC > 0.90, full classification report.
4. **Model 2 (Multi-Class Anomaly Classifier)**: XGBoost Multiclass (`multi:softprob`) with proper evaluation per anomaly type (`cost_anomaly`, `delay_anomaly`, `duplicate_work`, `ghost_asset`, `payment_anomaly`, `vendor_anomaly`).
5. **Model 3 (Unsupervised Outlier Detection)**: Isolation Forest on numerical and spatial risk signals.
6. **Risk Fusion Engine (0-100 Score)**:
   - Combine ML probability, Isolation Forest outlier score, cost inflation risk, duplicate work proximity, evidence failure risk, delay penalty, and fund utilization penalty.
7. **MP-Level Aggregation & Role-Based Summary**:
   - Aggregate work scores to MP level: `mp_risk_score`, `total_allocated`, `total_spent`, `utilization_pct`, `high_risk_works_count`, `risk_category` ("High Risk", "Moderate Risk", "Clean / Exemplary").
   - Confirm that the maximum MPs fall into the "High Risk" category, with very few MPs in "Clean / Exemplary".
   - Output district-level and national-level summaries for the SIH Demo presentation.

---

### Component 3: Standalone Helper / Export Script (for reproducible SIH demo)

#### [NEW] [generate_high_risk_dataset.py](file:///c:/Users/absol/Desktop/SIH2026/Model/generate_high_risk_dataset.py)
- A reproducible Python script using the `.venv` environment to generate and validate the updated `mplads_work_table.csv` and `mplads_mp_table.csv`, ensuring exact reproducibility and logging distribution stats.

---

## Verification Plan

### Automated & Execution Verification:
1. Run `generate_high_risk_dataset.py` using `..\.venv\Scripts\python.exe`.
2. Verify output CSV distributions:
   - Check work-level anomaly breakdown.
   - Check MP-level risk distribution (verify that >70% of MPs are High Risk, and <10% are Low Risk).
   - Check expenditure and utilization averages match real-world MPLADS benchmarks (~30-40% utilization).
3. Execute all cells of `model.ipynb` (or test runner script) to verify:
   - Zero syntax errors or runtime crashes.
   - Fixed Cell 18 with accurate binary classification metrics.
   - Model 2 multiclass predictions cleanly mapping to anomaly names.
   - Risk Fusion Engine generating 0-100 scores across all 15,000 works and 542 MPs.
4. Export MP Risk Leaderboard CSV / Summary for SIH demo pitch.
