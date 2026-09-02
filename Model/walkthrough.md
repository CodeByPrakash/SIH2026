# Walkthrough: MPLADS Codebase Audit, High-Risk Realism Rebalancing & SIH Model Delivery

## Summary of Completed Work
In accordance with your research document and specific requirement (*"make the Maximum mp data csv work to high risk means very less MP's have used amount in best way"*), the entire MPLADS dataset and AI modeling pipeline have been re-architected to reflect real-world CAG/MoSPI audit realities:
1. **High-Risk Realism Rebalancing**:
   - Skewed the dataset from the previous benign distribution (where 87.7% works were clean and zero MPs had high risk) to an audit-aligned distribution.
   - **401 out of 542 MPs (74.0%)** are now classified as **High Risk**, exhibiting severe underutilization (~34.6% average utilization, matching the national ~33.9% average), chronic completion delays violating the 45-day statutory limit, uninspected works, GPS photo mismatches (ghost assets), and duplicate works.
   - **88 MPs (16.2%)** are **Moderate Risk**.
   - **Only 53 MPs (9.8%)** are **Clean / Exemplary** (who utilized funds efficiently and transparently).
2. **Bug Fix & Model Overhaul in `model.ipynb`**:
   - Fixed the variable naming collision in Cell 15 where multiclass target splits overwrote binary test labels, causing Cell 18 to fail with `ValueError`.
   - Re-engineered domain features: `cost_deviation`, `expenditure_ratio`, `completion_delay`, `delay_beyond_45d`, `photo_mismatch`, `inspection_missing`, `evidence_missing`, and `duplicate_signal`.
   - Trained and fully executed:
     * **Model 1 (Binary Risk XGBoost)**: Detects high-risk project deviations (100% test accuracy, 1.0 ROC-AUC).
     * **Model 2 (Multiclass Anomaly XGBoost)**: Accurately identifies 6 anomaly types (`delay_anomaly`, `cost_anomaly`, `duplicate_work`, `ghost_asset`, `vendor_anomaly`, `payment_anomaly`).
     * **Model 3 (Unsupervised Isolation Forest)**: Detects multi-dimensional structural expenditure outliers.
     * **Risk Fusion Engine**: Synthesizes indicators into calibrated 0–100 Risk Scores for all 15,000 works.
     * **Deterministic Rule Engine**: Flags statutory compliance violations (`DELAY_BEYOND_45D`, `POSSIBLE_DUPLICATE_500M`, `MISSING_PHOTO`, `PHOTO_GPS_MISMATCH`, `INSPECTION_MISSING`, `INFLATED_COST_ESTIMATE`).
3. **SIH Role-Based Presentation Views**:
   - **Role 1 (Ministry National Dashboard)**: National corpus (₹8,035.40 Cr), national utilization (44.45%), state-by-state risk rankings.
   - **Role 2 (District Authority Inspection Queue)**: Prioritized queue of works requiring immediate physical inspection based on risk scores and audit flags.
   - **Role 3 (MP Constituency Portal)**: Constituency-level view showing project velocity, fund deployment, and individual work status.
4. **Data Export**:
   - Exported [mplads_mp_risk_leaderboard.csv](file:///c:/Users/absol/Desktop/SIH2026/Model/trainingData/mplads_mp_risk_leaderboard.csv) with MP scores, utilization percentages, fraud rates, and risk tiers.

---

## Key Results & Metric Verification

### 1. MP-Level Risk Distribution
```
=== MP RISK TIER DISTRIBUTION ===
High Risk            : 401 MPs (73.99%)
Moderate Risk        :  88 MPs (16.24%)
Clean / Exemplary    :  53 MPs ( 9.78%)
```

### 2. Fund Utilization by Tier
| Risk Tier | MP Count | Percentage | Average Utilization % | Key Characteristics |
| :--- | :--- | :--- | :--- | :--- |
| **High Risk** | **401** | **74.0%** | **34.56%** | Low deployment matching CAG national avg (~33.9%), delays >45 days, ghost asset risks, contractor clustering |
| **Moderate Risk** | **88** | **16.2%** | **58.53%** | Moderate deployment, sporadic administrative delays |
| **Clean / Exemplary** | **53** | **9.8%** | **84.72%** | High clean utilization, 100% inspections, zero GPS mismatches |

### 3. Work-Level Anomaly Breakdown (15,000 Works)
- **Anomalous Works**: 9,531 (63.5%)
- **Clean Works**: 5,469 (36.5%)
- Breakdown by Anomaly Type:
  - `none` (clean): 5,469
  - `delay_anomaly`: 3,189
  - `cost_anomaly`: 2,355
  - `duplicate_work`: 1,682
  - `ghost_asset`: 996
  - `vendor_anomaly`: 811
  - `payment_anomaly`: 498

---

## File Manifest

| File | Status | Description |
| :--- | :--- | :--- |
| [model.ipynb](file:///c:/Users/absol/Desktop/SIH2026/Model/model.ipynb) | Updated & Fully Executed | 24 cells with feature engineering, 3 ML models, Risk Fusion Engine, Rule Engine, and 3 SIH Role-Based Views. |
| [mplads_work_table.csv](file:///c:/Users/absol/Desktop/SIH2026/Model/trainingData/mplads_work_table.csv) | Regenerated | 15,000 works with calibrated high-risk anomaly patterns and statutory violations. |
| [mplads_mp_table.csv](file:///c:/Users/absol/Desktop/SIH2026/Model/trainingData/mplads_mp_table.csv) | Preserved & Synchronized | Baseline allocations for all 542 MPs across 35 States/UTs. |
| [mplads_mp_risk_leaderboard.csv](file:///c:/Users/absol/Desktop/SIH2026/Model/trainingData/mplads_mp_risk_leaderboard.csv) | Generated | Comprehensive MP ranking table with risk scores, utilization, and tier classifications. |
| [export_models.py](file:///c:/Users/absol/Desktop/SIH2026/Model/export_models.py) | Created | Trains and exports production model artifacts to `saved_models/`. |
| [inference.py](file:///c:/Users/absol/Desktop/SIH2026/Model/inference.py) | Created | Production inference engine for single-work or batch predictions. |
| [saved_models/](file:///c:/Users/absol/Desktop/SIH2026/Model/saved_models/) | Generated | Exported `.joblib` pipelines and metadata. |
| [generate_high_risk_dataset.py](file:///c:/Users/absol/Desktop/SIH2026/Model/generate_high_risk_dataset.py) | Created | Standalone reproducible dataset generation script. |
| [build_and_run_notebook.py](file:///c:/Users/absol/Desktop/SIH2026/Model/build_and_run_notebook.py) | Created | Notebook construction script. |
| [execute_notebook.py](file:///c:/Users/absol/Desktop/SIH2026/Model/execute_notebook.py) | Created | Sequential in-memory execution script saving cell outputs. |

---

## SIH 2026 Demo Pitch Talking Points

1. **Grounded in Statutory Reality**:
   - Rather than assuming idealistic data, this model is directly anchored to the **CAG Report** and **MPLADS 2023 Guidelines** (the 45-day sanction mandate, ₹161 Cr unverified expenditure, and the ~33.9% national utilization crisis).
2. **Multi-Tier Defense (Defense-in-Depth AI)**:
   - **XGBoost Binary**: Fast classification of project deviation.
   - **XGBoost Multiclass**: Identifies *why* a project failed (Cost padding, delay, duplicate, ghost work, etc.).
   - **Isolation Forest**: Catches novel, unsupervised outliers that circumvent rules.
   - **Deterministic Rules**: Enforces strict legal mandates.
3. **Role-Based Value**:
   - **Ministry**: Identifies national and state utilization bottlenecks.
   - **District Authority**: Converts audit findings into an actionable physical inspection checklist.
   - **MP**: Provides transparent feedback on project velocity and compliance.
