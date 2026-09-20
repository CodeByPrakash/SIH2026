export const WEBSITE_IDENTITY = {
  name: "NIDHI-RAKSHAK AI",
  subtitle: "MPLADS Copilot",
  platformName: "MPLADS SATHI / Nidhi Portal",
  description:
    "An advanced AI-assisted governance and monitoring portal for the Member of Parliament Local Area Development Scheme (MPLADS). It provides project tracking, fund utilization monitoring, automated risk scoring, real-time alert triage, citizen evidence cross-checking with EXIF & GPS verification, image reuse detection (SHA-256 & perceptual hash), financial analytics, compliance tracking, and intervention simulation.",
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
    purpose: "Comprehensive directory of all MPLADS infrastructure projects with status filter, risk scores, progress tracking, and detailed project views.",
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
    purpose: "Geographic visualization of MPLADS projects across states and districts with interactive location pins.",
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
    title: "Central Ministry (MoSPI) Oversight",
    purpose: "National level oversight, macro policy compliance, pan-India financial utilization, and system-wide anomaly detection.",
  },
};

export const STATIC_KNOWLEDGE = `
NIDHI-RAKSHAK AI PLATFORM KNOWLEDGE:

1. PLATFORM OVERVIEW:
   - Name: NIDHI-RAKSHAK AI (MPLADS Copilot) embedded in MPLADS SATHI / Nidhi Portal.
   - Purpose: Monitoring system for the Member of Parliament Local Area Development Scheme (MPLADS).
   - Core Features: Real-time project tracking, alert triage, photo EXIF & GPS verification, image reuse detection (SHA-256 & perceptual hash), financial analytics, citizen evidence cross-checking, compliance, and AI intervention simulation.

2. ON-SITE EVIDENCE & PHOTO GEO-CROSSCHECK AI:
   - EXIF Metadata Extraction: Automatically extracts camera metadata, EXIF timestamp, and embedded GPS coordinates (latitude/longitude) directly from binary JPEG/PNG headers.
   - Location Verification: Calculates geodesic distance between the photo's GPS coordinates and the registered project location. Compares against an allowed radius (e.g., 500 meters). Result is MATCH, MISMATCH, or UNAVAILABLE.
   - Image Reuse & Duplicate Detection: Generates a cryptographic SHA-256 hash of the uploaded image binary to detect exact duplicates across all previously submitted evidence (both same-project and cross-project reuse). Also calculates perceptual hash for visually similar image detection.
   - Integrity Principles: Photo GPS and EXIF timestamps provide strong location consistency indicators but do not constitute mathematical proof of legal fraud; system marks items carefully as "VERIFIED_CONSISTENT", "LOCATION_MISMATCH", "POTENTIAL_REUSED_EVIDENCE", or "MULTIPLE_FLAGS".

3. AI INTERVENTION SIMULATOR:
   - Purpose: Administrative decision-support tool.
   - Scenarios: Simulates outcomes of "Release Funds", "Hold Funds", or "Order Corrective Action".
   - Note: The simulator provides risk projections; human authorities (District Collectors / MoSPI officials) remain strictly responsible for final decision-making.

4. ALERTS & WARNINGS:
   - Types: Delay, Cost Overrun, Utilization, Compliance, Anomaly.
   - Severities: Critical, High, Medium, Low.
   - Statuses: Active, Acknowledged, Resolved.

5. USER ROLES & ACCESS:
   - Roles: Citizen, Member of Parliament (MP), District Nodal Officer, State Nodal Officer, Central Ministry (MoSPI).
   - Scope: Users can view analytics and project records within their authorized jurisdiction/constituency.
`;
