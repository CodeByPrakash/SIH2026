# 🏛️ SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## AI & Machine Learning Risk Intelligence Subsystem (Model Module)
### Project: MPLADS-SATHI (*System for Automated Tracking, Hazard-detection & Inspection*)

```
Document Reference : SIH2026-MPLADS-SATHI-SRS-MOD-001
Directory Scope    : /Model
Version            : 1.0.0
Classification     : Technical / Architectural Specification
Author             : Code_Warrior6 (Smart India Hackathon 2026)
Status             : Fully Implemented & Verified
Official PDF       : MODEL_SRS_DOCUMENTATION.pdf (20-Page Complete Illustrated Document)
```

> 📄 **Download Official Illustrated PDF**: [MODEL_SRS_DOCUMENTATION.pdf](MODEL_SRS_DOCUMENTATION.pdf) *(20 Pages with All 16 Execution Cells & Plots)*

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) document provides a formal, exhaustive technical specification of the Machine Learning and Risk Intelligence subsystem located in the `Model/` directory of the **MPLADS-SATHI** platform. It details all implemented features, technology stack choices, mathematical formulations, algorithmic flows, data schemas, verification benchmarks, and execution procedures.

### 1.2 Scope of the Subsystem
The `Model/` subsystem is responsible for:
- Data ingestion, cleaning, and standardization across all **36 States and Union Territories of India (542 Lok Sabha MPs)**.
- High-fidelity feature engineering reflecting real-world public works procurement and field audits.
- Supervised binary risk detection (`Clean` vs `Anomalous`).
- Supervised multiclass anomaly classification across 6 institutional corruption and delay archetypes.
- Unsupervised anomaly isolation using recursive tree space partitioning (Isolation Forest).
- Composite risk scoring ($R_i \in [0, 100]$) and governance tier stratification via the **Hybrid Risk Fusion Engine**.
- Visual analytics generation featuring temperature maps, correlation heatmaps, ROC/PR curves, and cost vs delay scatter plots.
- Programmatic Jupyter notebook compilation and autonomous headless validation.

### 1.3 Definitions, Acronyms, and Abbreviations
- **MPLADS**: Member of Parliament Local Area Development Scheme.
- **MoSPI**: Ministry of Statistics and Programme Implementation.
- **CAG**: Comptroller and Auditor General of India.
- **SRS**: Software Requirements Specification.
- **DC / DM**: District Collector / District Magistrate (Statutory Authority).
- **ROC-AUC**: Receiver Operating Characteristic - Area Under Curve.
- **AP**: Average Precision.
- **F1**: Harmonic mean of precision and recall.
- **DPI**: Dots Per Inch (Image resolution standard).
- **GIS / GPS**: Geographic Information System / Global Positioning System.

---

## 2. Technology Stack & Library Inventory (Where & What Used)

Every dependency utilized in the `Model/` subsystem has been intentionally selected to deliver maximum mathematical precision, execution speed, and cross-platform reliability.

### 2.1 Technology & Library Breakdown

| Technology / Library | Version Specified | Module / File Location | Role & Implemented Features | Engineering Rationale |
|:---|:---|:---|:---|:---|
| **Python** | `3.11.x` | `generate_dataset.py`, `build_notebook.py`, `model.ipynb` | Runtime platform & interpreter | Modern syntax, optimized memory management, full compatibility with scikit-learn & XGBoost C++ backends. |
| **NumPy** | `1.26.4+` | `generate_dataset.py`, `build_notebook.py`, `model.ipynb` | Vectorized linear algebra, random seed management, array clipping | Vectorized risk fusion evaluation across 15,000 works in under 5 milliseconds. Controls pseudo-random seed (`seed=42`) for 100% reproducible data generation. |
| **Pandas** | `2.2.2+` (3.0 compat) | `generate_dataset.py`, `build_notebook.py`, `model.ipynb` | Tabular data ETL, feature engineering, CSV persistence | Rapid DataFrame operations, group-by aggregations, missing value handling, column derivations. Enforces `infer_string=False` to prevent PyArrow string truncations. |
| **Scikit-Learn** | `1.5.0+` | `build_notebook.py`, `model.ipynb` | Unsupervised outlier detection, data preprocessing, model evaluation | Implements `IsolationForest`, `StandardScaler`, `LabelEncoder`, `train_test_split`, `StratifiedKFold`, `cross_val_score`, `roc_curve`, `precision_recall_curve`, `confusion_matrix`. |
| **XGBoost** | `2.0.3+` | `build_notebook.py`, `model.ipynb` | Supervised Gradient Boosted Decision Trees | Powers Model 1 (`binary:logistic`) and Model 2 (`multi:softprob`). Optimized tree depth and column subsampling prevents overfitting; handles class imbalances via `scale_pos_weight`. |
| **Matplotlib** | `3.9.0+` | `build_notebook.py`, `model.ipynb` | Graphical figure composition and rendering | Generates 16 high-resolution publication-quality PNG diagrams (150 DPI) with custom typography, legends, annotations, and temperature colorbars. |
| **Seaborn** | `0.13.2+` | `build_notebook.py`, `model.ipynb` | Statistical visualizations and heatmaps | Delivers visual polish using customized colormaps (`YlOrRd`, `hot_r`, `coolwarm`, `plasma`), confusion matrix heatmaps with percentage text overlays, and multi-distribution boxplots. |
| **nbformat** | `5.10.4+` | `build_notebook.py` | Programmatic Jupyter notebook authoring | Assembles valid v4 Jupyter notebooks (`model.ipynb`) with exact cell boundaries, Markdown documentation, and reproducible code blocks without manual JSON editing. |
| **nbconvert / Jupyter**| `7.16.4+` | Command Line / PowerShell | Headless CI/CD notebook execution | Executes `model.ipynb` end-to-end, executing all 30 code cells, training all 3 models, and rendering all plots directly into the notebook structure. |

---

## 3. System Architecture & Information Flow

The architecture operates as a 5-phase deterministic data processing and inference pipeline:

```
[Phase 1: Ingestion & Seeding]
       │
       ▼
[Phase 2: Cleaning & Feature Engineering]
       │
       ▼
[Phase 3: Multi-Model Machine Learning Engine]
   ├── Model 1: XGBoost Binary (P_ML)
   ├── Model 2: XGBoost Multiclass (Archetype)
   └── Model 3: Isolation Forest (S_ISO)
       │
       ▼
[Phase 4: Hybrid Risk Fusion Engine (Score: 0 - 100)]
       │
       ▼
[Phase 5: Visual Analytics & Reporting]
```

### 3.1 Data Flow Pipeline Specifications
1. **Ingestion**: `generate_dataset.py` reads real seed allocations (`MPLADS_MP_Allocated_Limit_Analysis.csv`), loads constituency demographics for 36 States/UTs, and synthesizes 15,000 project records matching CAG audit anomaly frequencies.
2. **Sanitization**: Numerical boundaries are enforced (zero-clipped costs and durations), categorical variables are whitespace-stripped and standardized, and missing values are imputed.
3. **Engineering**: 8 derived indicators (`cost_overrun_ratio`, `delay_days`, `completion_ratio`, `evidence_score`, `cost_deviation_pct`, `is_severely_delayed`, `cost_efficiency`, `constituency_type_enc`) are computed.
4. **Machine Learning Execution**: Features are passed to Model 1, Model 2, and Model 3 simultaneously.
5. **Risk Fusion & Stratification**: Risk vectors are combined via weighted ensemble into a 0-100 score, assigned to 4 tiers (`Low`, `Moderate`, `High`, `Critical`).
6. **Artifact Export**: Outputs are serialized into 3 CSV tables and 16 PNG visualization assets.

---

## 4. Functional Requirements

### 4.1 Data Management & Generator Requirements (FR-01 to FR-04)
- **FR-01 (All-States Ingestion)**: The system shall support all 36 States and Union Territories of India, allocating projects across 542 Lok Sabha constituencies.
- **FR-02 (CAG Calibration)**: The anomaly distribution shall reflect official audit findings: exactly 63.5% anomalous works distributed across 6 archetypes:
  - Delay Anomaly: 33.45%
  - Cost Anomaly: 24.71%
  - Duplicate Work: 17.64%
  - Ghost Asset: 10.45%
  - Vendor Anomaly: 8.51%
  - Payment Anomaly: 5.23%
- **FR-03 (Data Cleaning)**: The pipeline shall remove duplicate IDs, replace null entries with neutral defaults, clamp negative cost or duration values, and enforce proper data types.
- **FR-04 (Persistence)**: Generated data shall be persisted to CSV with UTF-8 encoding and full string preservation without Arrow truncation.

### 4.2 Machine Learning Requirements (FR-05 to FR-08)
- **FR-05 (Supervised Binary Detection)**: The system shall train an XGBoost binary classifier achieving $\ge 98\%$ Accuracy and $\ge 0.99$ ROC-AUC.
- **FR-06 (Multi-Class Root-Cause Diagnosis)**: The system shall train a 6-class XGBoost classifier achieving $\ge 95\%$ Accuracy and Weighted F1.
- **FR-07 (Unsupervised Outlier Discovery)**: The system shall run an Isolation Forest with 10% contamination factor to flag unmodeled spatial and financial anomalies.
- **FR-08 (Continuous Calibration)**: All model outputs shall be scaled and calibrated to continuous numeric ranges $[0.0, 100.0]$ for seamless downstream consumption.

### 4.3 Risk Fusion Engine Requirements (FR-09 to FR-10)
- **FR-09 (Composite Formulation)**: The system shall compute a deterministic composite score $R_i$ weighting:
  - Supervised Anomaly Probability: 30%
  - Isolation Forest Outlier Score: 15%
  - Financial Overrun Penalty: 20%
  - Spatial Clustering Penalty: 10%
  - Evidence Deficit Penalty: 15%
  - Statutory Delay Penalty: 10%
- **FR-10 (Four-Tier Stratification)**: Projects shall be automatically categorized into:
  - `Low Risk` ($R_i \in [0, 30]$)
  - `Moderate Risk` ($R_i \in (30, 60]$)
  - `High Risk` ($R_i \in (60, 80]$)
  - `Critical Risk` ($R_i \in (80, 100]$)

### 4.4 Reporting & Visualization Requirements (FR-11 to FR-12)
- **FR-11 (Temperature Heatmaps)**: The system shall generate feature correlation temperature maps, state-level risk heatmaps, and feature-by-anomaly intensity grids.
- **FR-12 (Leaderboard Generation)**: The system shall calculate MP-level risk indices and produce a ranked national risk leaderboard (`mplads_mp_risk_leaderboard.csv`).

---

## 5. Non-Functional Requirements

### 5.1 Performance & Throughput (NFR-01)
- Data generation for 15,000 records shall execute in $< 15$ seconds on standard multi-core hardware.
- Complete model training (Binary XGBoost + Multiclass XGBoost + Isolation Forest) and notebook execution shall finish in $< 90$ seconds.
- Single-work risk inference latency shall be $< 5$ milliseconds.

### 5.2 Determinism & Reproducibility (NFR-02)
- All random processes (splitting, bootstrapping, synthetic generation) shall utilize fixed random seeds (`seed=42`), guaranteeing byte-for-byte identical outcomes on subsequent runs.

### 5.3 Modularity & Maintainability (NFR-03)
- Feature engineering, model definitions, and plotting logic shall be cleanly partitioned. The notebook can be rebuilt programmatically at any time via `build_notebook.py`.

### 5.4 Transparency & Explainability (NFR-04)
- Every prediction shall be decomposable into its constituent sub-scores (ML probability, financial penalty, statutory delay, evidence score), eliminating black-box opacity for audit authorities.

---

## 6. Comprehensive Data Dictionary

The primary analysis dataset `dataset/mplads_work_table.csv` contains 15,000 rows and 26 core columns (plus engineered features):

| Field Name | Type | Constraints / Range | Description |
|:---|:---:|:---|:---|
| `work_id` | String | Format: `W\d{6}` | Unique identifier for the sanctioned project. |
| `mp_id` | Integer | `[1, 542]` | Foreign key linking work to the sponsoring MP. |
| `mp_name` | String | Title Case | Full name of the Member of Parliament. |
| `state` | String | 36 States/UTs | Administrative State/UT jurisdiction. |
| `district` | String | Categorical | District jurisdiction of project site. |
| `constituency` | String | Upper Case | Electoral Lok Sabha constituency. |
| `constituency_type` | String | `General`, `SC`, `ST` | Electoral reservation status. |
| `house` | String | `Lok Sabha` | Parliamentary house. |
| `party` | String | Recognized Parties | Political party affiliation. |
| `work_category` | String | 8 Core Sectors | Public infrastructure sector. |
| `work_subcategory` | String | Specific Item | Specific item of work. |
| `estimated_cost_inr` | Float | $\ge 0.0$ | Engineering preliminary cost estimate in INR. |
| `sanctioned_cost_inr`| Float | $\ge 0.0$ | District Collector administrative sanction in INR. |
| `actual_expenditure_inr`| Float | $\ge 0.0$ | Actual cumulative disbursed expenditure in INR. |
| `expected_completion_days`| Integer | $[30, 180]$ | Scheduled construction timeline in days. |
| `actual_completion_days`| Integer | $[25, 750]$ | Total elapsed calendar days to completion/audit. |
| `inspection_done` | Binary | $0$ or $1$ | Physical site inspection certificate logged. |
| `photo_available` | Binary | $0$ or $1$ | Geotagged photograph uploaded to portal. |
| `photo_location_match` | Binary | $0$ or $1$ | Photo EXIF coordinates match sanctioned GIS coordinates. |
| `similar_work_count_500m` | Integer | $[0, 5]$ | Count of identical works sanctioned within 500 meters. |
| `payment_count` | Integer | $[1, 20]$ | Number of discrete disbursement installments. |
| `is_anomalous` | Binary | $0$ or $1$ | Ground-truth irregularity label. |
| `anomaly_type` | String | 7 Categories | Specific failure category (`clean` or one of 6 anomalies). |
| `cost_overrun_ratio` | Float | Engineered | Relative cost escalation over sanctioned budget. |
| `delay_days` | Float | Engineered | Calendar days delayed beyond expected schedule. |
| `cost_deviation_pct` | Float | Engineered | Percentage cost variation from original estimate. |
| `completion_ratio` | Float | Engineered | Ratio of actual duration to expected duration. |
| `cost_efficiency` | Float | Engineered | Ratio of actual expenditure to sanctioned cost. |
| `evidence_score` | Float | Engineered | Average of inspection, photo, and GPS compliance ($[0.0, 1.0]$). |
| `is_severely_delayed`| Binary | Engineered | Flag indicating delay $> 45$ statutory days. |
| `risk_score` | Float | $[0.0, 100.0]$ | Composite risk score from Risk Fusion Engine. |
| `risk_tier` | String | 4 Categories | Governance risk category (`Low`, `Moderate`, `High`, `Critical`). |

---

## 7. Mathematical Formulations & Algorithmic Logic

### 7.1 Financial & Operational Feature Formulas

1. **Cost Overrun Ratio**:
   $$\text{cost\_overrun\_ratio} = \frac{\text{actual\_expenditure\_inr} - \text{sanctioned\_cost\_inr}}{\max(1.0, \; \text{sanctioned\_cost\_inr})}$$

2. **Statutory Delay Days**:
   $$\text{delay\_days} = \max\left(0, \; \text{actual\_completion\_days} - \text{expected\_completion\_days}\right)$$

3. **Cost Deviation Percentage**:
   $$\text{cost\_deviation\_pct} = \frac{\text{actual\_expenditure\_inr} - \text{estimated\_cost\_inr}}{\max(1.0, \; \text{estimated\_cost\_inr})} \times 100$$

4. **Physical Evidence Score**:
   $$\text{evidence\_score} = \frac{\text{inspection\_done} + \text{photo\_available} + \text{photo\_location\_match}}{3.0}$$

### 7.2 Risk Fusion Engine Formulation

The composite score $R_i \in [0, 100]$ combines machine learning predictions with rule-based statutory penalties:

$$R_i = \min\left(100, \; 0.30 \cdot P_{\text{ML}} + 0.15 \cdot S_{\text{Iso}} + 0.20 \cdot R_{\text{Cost}} + 0.10 \cdot R_{\text{Geo}} + 0.15 \cdot R_{\text{Evidence}} + 0.10 \cdot R_{\text{Delay}}\right)$$

Where:
- $P_{\text{ML}} = \text{XGBoost Probability} \times 100 \in [0, 100]$
- $S_{\text{Iso}} = 100 - \left( \frac{s(x) - \min(s)}{\max(s) - \min(s)} \times 100 \right) \in [0, 100]$
- $R_{\text{Cost}} = \text{clip}\left(\text{cost\_overrun\_ratio} \times 100, \; 0, \; 100\right)$
- $R_{\text{Geo}} = \text{clip}\left(\text{similar\_work\_count\_500m} \times 25, \; 0, \; 100\right)$
- $R_{\text{Evidence}} = (1 - \text{photo\_location\_match}) \cdot 50 + (1 - \text{inspection\_done}) \cdot 30 + (1 - \text{photo\_available}) \cdot 20$
- $R_{\text{Delay}} = \text{clip}\left(\frac{\max(0, \; \text{delay\_days} - 45)}{30} \times 20, \; 0, \; 100\right)$

---

## 8. Verification & Validation Metrics

| Model / Subsystem | Benchmark Metric | Measured Result | Standard / Target | Status |
|:---|:---|:---:|:---:|:---:|
| **Model 1: Binary Classifier** | Accuracy | **99.70%** | $\ge 98.0\%$ | ✅ PASSED |
| **Model 1: Binary Classifier** | ROC-AUC Score | **0.9998** | $\ge 0.9900$ | ✅ PASSED |
| **Model 1: Binary Classifier** | 5-Fold CV ROC-AUC | **0.9997 ± 0.0002** | $\ge 0.9900$ | ✅ PASSED |
| **Model 2: Multiclass Classifier**| Accuracy | **98.58%** | $\ge 95.0\%$ | ✅ PASSED |
| **Model 2: Multiclass Classifier**| Weighted F1-Score | **0.9859** | $\ge 0.9500$ | ✅ PASSED |
| **Model 3: Isolation Forest** | Outliers Detected | **1,500 (10.0%)** | $10.0\% \pm 0.5\%$ | ✅ PASSED |
| **Risk Fusion Engine** | Mean Score | **33.09 / 100** | $[30.0, 38.0]$ | ✅ PASSED |
| **Notebook Execution** | Code Cells Executed | **30 / 30** | $100\%$ zero errors | ✅ PASSED |
| **Visual Artifacts** | PNG Plots Generated | **16 / 16** | 16 valid PNGs | ✅ PASSED |

---

## 9. Operational & Execution Procedures

```powershell
# 1. Navigate to Model Directory
cd c:\Users\absol\Desktop\SIH2026\Model

# 2. Ensure UTF-8 Console Encoding
$env:PYTHONIOENCODING="utf-8"

# 3. Generate Cleaned Datasets (All 36 States/UTs, 542 MPs, 15,000 Works)
python generate_dataset.py

# 4. Programmatically Recompile Jupyter Notebook
python build_notebook.py

# 5. Interactive Inspection in Jupyter
jupyter notebook model.ipynb
```

---

*Sign-off: Team CodeByPrakash — SIH 2026 AI/ML Engineering Lead.*
