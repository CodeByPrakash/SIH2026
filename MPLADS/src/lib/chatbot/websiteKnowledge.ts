export const WEBSITE_IDENTITY = {
  name: "NIDHI-RAKSHAK AI",
  subtitle: "NIDHI-RAKSHAK Copilot",
  platformName: "NIDHI-RAKSHAK Portal",
  description:
    "An advanced AI-assisted governance and monitoring portal under the NIDHI-RAKSHAK framework. It provides project tracking, fund utilization monitoring, automated risk scoring, real-time alert triage, citizen evidence cross-checking with EXIF & GPS verification, image reuse detection (SHA-256 & perceptual hash), financial analytics, compliance tracking, and intervention simulation.",
};

export const PAGE_MAP: Record<string, { title: string; purpose: string }> = {
  "/": {
    title: "Home / Overview",
    purpose: "Main platform overview and gateway to monitoring modules.",
  },
  "/dashboard": {
    title: "Main Dashboard",
    purpose: "National and constituency level KPI overview, executive summary, key risk metrics, and top alerts.",
  },
  "/dashboard/alerts": {
    title: "Alerts & Warnings",
    purpose: "Early warning system tracking active anomalies, cost overruns, work delays, and compliance issues categorized by severity (Critical, High, Medium, Low).",
  },
  "/dashboard/projects": {
    title: "Projects & Works",
    purpose: "Comprehensive directory of all NIDHI-RAKSHAK infrastructure projects with status filter, risk scores, progress tracking, and detailed project views.",
  },
  "/dashboard/crosscheck": {
    title: "Photo Geo-CrossCheck AI Sandbox",
    purpose: "Interactive AI verification system for on-site evidence photos. Extracts EXIF capture metadata, verifies photo GPS against project coordinates, and detects duplicate or reused evidence photos using SHA-256 and perceptual hashing.",
  },
  "/dashboard/citizen": {
    title: "Citizen Evidence AI",
    purpose: "Citizen-submitted field evidence portal. Analyzes submitted photos, claims vs official records, sentiment, and AI-determined discrepancy severity.",
  },
  "/dashboard/evidence": {
    title: "Image Reuse & Duplicate Verification Center",
    purpose: "Audit view comparing uploaded evidence photos across different projects to detect duplicate submissions and cross-project image reuse.",
  },
  "/dashboard/risk": {
    title: "AI Risk Center",
    purpose: "Contractor anomaly detection, risk score rankings, cost inflation clustering, and high-risk work order investigations.",
  },
  "/dashboard/simulation": {
    title: "AI Intervention Simulator",
    purpose: "Decision support tool allowing administrators to simulate intervention scenarios (Release Funds, Hold Funds, Order Corrective Action) and view projected outcome risks before taking action.",
  },
  "/dashboard/reports": {
    title: "Financial Analytics & Reports",
    purpose: "State-wise and constituency-wise fund utilization analytics, sanctioned vs expenditure reports, and Utilization Certificate (UC) compliance status.",
  },
  "/dashboard/gis": {
    title: "GIS Map View",
    purpose: "Geographic visualization of NIDHI-RAKSHAK projects across states and districts with interactive location pins.",
  },
  "/dashboard/grievance": {
    title: "Grievance Redressal Center",
    purpose: "Public and constituent grievance tracking regarding stalled works, fund delays, or infrastructure quality defects.",
  },
  "/dashboard/compliance": {
    title: "Compliance Engine",
    purpose: "Tracking guidelines compliance, overdue Utilization Certificates (UCs), inspection schedules, and audit readiness.",
  },
  "/dashboard/investigation": {
    title: "Work Order Investigation",
    purpose: "Deep-dive audit into flagged projects, contractor history, and field discrepancies.",
  },
  "/dashboard/mp": {
    title: "My Constituency (MP Dashboard)",
    purpose: "Tailored view for Members of Parliament showing constituency fund allocation, active works, local alerts, and constituent evidence.",
  },
  "/dashboard/district": {
    title: "District Nodal Officer View",
    purpose: "District Collector / District Nodal Officer workflow for approving work orders, verifying site photos, and managing implementation agencies.",
  },
  "/dashboard/state": {
    title: "State Nodal Officer View",
    purpose: "State-wide aggregation of district performance, fund releases, and delayed works.",
  },
  "/dashboard/ministry": {
    title: "Central Ministry Oversight",
    purpose: "National level oversight, macro policy compliance, pan-India financial utilization, and system-wide anomaly detection.",
  },
};

export const STATIC_KNOWLEDGE = `
NIDHI-RAKSHAK AI PLATFORM KNOWLEDGE:

1. PLATFORM OVERVIEW:
   - Name: NIDHI-RAKSHAK AI Platform.
   - Purpose: Monitoring and vigilance intelligence system under the NIDHI-RAKSHAK framework.
   - Core Features: Real-time project tracking, alert triage, photo EXIF & GPS verification, image reuse detection (SHA-256 & perceptual hash), financial analytics, citizen evidence cross-checking, compliance, and AI intervention simulation.

2. ON-SITE EVIDENCE & PHOTO GEO-CROSSCHECK AI:
   - EXIF Metadata Extraction: Automatically extracts camera metadata, EXIF timestamp, and embedded GPS coordinates (latitude/longitude) directly from binary JPEG/PNG headers.
   - Location Verification: Calculates geodesic distance between the photo's GPS coordinates and the registered project location. Compares against an allowed radius (e.g., 500 meters). Result is MATCH, MISMATCH, or UNAVAILABLE.
   - Image Reuse & Duplicate Detection: Generates a cryptographic SHA-256 hash of the uploaded image binary to detect exact duplicates across all previously submitted evidence (both same-project and cross-project reuse). Also calculates perceptual hash for visually similar image detection.
   - Integrity Principles: Photo GPS and EXIF timestamps provide strong location consistency indicators but do not constitute mathematical proof of legal fraud; system marks items carefully as "VERIFIED_CONSISTENT", "LOCATION_MISMATCH", "POTENTIAL_REUSED_EVIDENCE", or "MULTIPLE_FLAGS".

3. AI INTERVENTION SIMULATOR:
   - Purpose: Administrative decision-support tool.
   - Scenarios: Simulates outcomes of "Release Funds", "Hold Funds", or "Order Corrective Action".
   - Note: The simulator provides risk projections; human authorities (District Collectors / Ministry officials) remain strictly responsible for final decision-making.

4. ALERTS & WARNINGS:
   - Types: Delay, Cost Overrun, Utilization, Compliance, Anomaly.
   - Severities: Critical, High, Medium, Low.
   - Statuses: Active, Acknowledged, Resolved.

5. USER ROLES & ACCESS:
   - Roles: Citizen, Member of Parliament (MP), District Nodal Officer, State Nodal Officer, Central Ministry.
   - Scope: Users can view analytics and project records within their authorized jurisdiction/constituency.

6. NIDHI-RAKSHAK AI & ML RISK INTELLIGENCE ENGINE (TECHNICAL ARCHITECTURE):
   - System Overview: Multi-tier, hybrid Machine Learning and Risk Intelligence Engine designed to audit public works, detect irregularities, classify root-cause anomaly archetypes, detect zero-day corruption patterns, and compute deterministic Composite Risk Scores (0-100).
   - Model 1: XGBoost Binary Risk Classifier (Supervised)
     * Objective: Classifies clean vs. irregular/anomalous public works projects.
     * Output: P_ML (Supervised Anomaly Probability, 0 to 100%).
     * Performance: ROC-AUC = 0.9998, Accuracy = 99.70%, Precision = 0.9984, Recall = 0.9968.
     * What it means: Evaluates whether a project's financial, execution, spatial, and evidence parameters match historical patterns of audit failure.
   - Model 2: XGBoost Multiclass Archetype Classifier (Supervised)
     * Objective: Identifies the root-cause failure archetype among 6 institutional failure classes:
       1. delay_anomaly: Severe execution delay exceeding 45-75 days statutory limit (often 200%-600% delay), low completion ratio.
       2. cost_anomaly: Unsanctioned budget overruns >20-50%, post-facto inflation, cost deviation vs initial estimate.
       3. duplicate_work: High spatial cluster count (>=2 similar works within 500m radius), indicative of spatial duplication or contract splitting.
       4. ghost_asset: Missing physical inspection, missing geo-tagged photo, or EXIF GPS mismatch (>500m distance from sanctioned coordinates).
       5. vendor_anomaly: Inflated payment count coupled with escalated expenditure and contractor concentration.
       6. payment_anomaly: Artificial voucher fragmentation (>=8-20 partial disbursements) designed to bypass statutory sanction limits.
     * Performance: 98.58% accuracy, 0.9859 weighted F1-score.
   - Model 3: Isolation Forest Outlier Detector (Unsupervised)
     * Objective: Identifies novel, zero-day, unmodeled spatial/financial anomalies that fall outside predefined rule categories.
     * Contamination: 10% (1,500 works out of 15,000 national dataset).
     * Output: Isolation Score S_ISO in [0, 100] (higher means more anomalous/atypical).
   - Hybrid Risk Fusion Engine (Composite Scoring):
     * Formula: R_i = min(100, sum(w_k * C_k)) across 6 weighted components (sum of weights = 1.00):
       - C1 (Weight 0.30): Supervised ML Anomaly Probability (P_ML * 100) from Model 1.
       - C2 (Weight 0.15): Unsupervised Outlier Score (S_ISO) from Model 3.
       - C3 (Weight 0.20): Financial Overrun Penalty (min(100, max(0, (Actual - Sanctioned)/Sanctioned * 100))).
       - C4 (Weight 0.10): Spatial Duplication Penalty (min(100, similar_work_count_500m * 25)).
       - C5 (Weight 0.15): Physical Verification Deficit ((1 - GPS_Match)*50 + (1 - Inspection)*30 + (1 - Photo)*20).
       - C6 (Weight 0.10): Statutory Delay Penalty (min(100, (max(0, delay_days - 45)/30) * 20)).
   - Risk Stratification Tiers & Statutory Governance Actions:
     * Low Risk (0 - 30): Automatic Pass. Meets timeline, cost, and physical inspection requirements.
     * Moderate Risk (30 - 60): Routine Inspection. Minor delays or documentation gaps. Flagged for field monitoring.
     * High Risk (60 - 80): Field Audit. Substantial cost overrun (>20%) or missing inspection records. Mandatory district audit.
     * Critical Risk (80 - 100): Immediate Stop-Work & Vigilance Inquiry. Evidence of ghost assets, extreme cost inflation (>50%), or spatial duplication. Immediate fund freeze and anti-corruption inquiry.
`;

