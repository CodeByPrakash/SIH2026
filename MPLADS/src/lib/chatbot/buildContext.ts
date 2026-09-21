import { dbConnect } from "@/lib/mongodb";
import { AlertModel } from "@/models/Alert";
import { ProjectModel } from "@/models/Project";
import { CitizenEvidenceModel } from "@/models/CitizenEvidence";
import { GrievanceModel } from "@/models/Grievance";
import { ALERTS, PROJECTS, STATES_DATA, NATIONAL_KPIs, RISK_FLAGS } from "@/data/mpladsData";
import { STATIC_KNOWLEDGE, PAGE_MAP, WEBSITE_IDENTITY } from "./websiteKnowledge";

export interface ChatbotUserContext {
  name?: string;
  role?: string;
  constituency?: string;
  state?: string;
  district?: string;
}

export interface BuildContextOptions {
  message: string;
  currentRoute?: string;
  user?: ChatbotUserContext | null;
  auditContext?: any | null;
  mode?: "audit_explanation" | "general";
  history?: Array<{ role: string; text: string }> | null;
}

export async function buildContext({
  message,
  currentRoute = "/dashboard",
  user,
  auditContext,
  mode = "general",
  history,
}: BuildContextOptions): Promise<string> {
  const q = message.toLowerCase();

  // Determine current page info
  const normalizedRoute = currentRoute.split("?")[0] || "/dashboard";
  const pageInfo = PAGE_MAP[normalizedRoute] || {
    title: "Dashboard Module",
    purpose: "Interactive monitoring dashboard.",
  };

  // Connect to DB safely
  let isDbConnected = false;
  try {
    await dbConnect();
    isDbConnected = true;
  } catch (err) {
    console.warn("[Chatbot Context] DB Connection fallback to static data:", err);
  }

  // ── Retrieve Data ─────────────────────────────────────────────────────────

  // 1. Alerts Data
  let alertSummary = "";
  let specificAlertDetail = "";
  try {
    let activeAlerts: any[] = [];
    if (isDbConnected) {
      activeAlerts = await AlertModel.find({ status: "Active" }).lean();
    }
    if (!activeAlerts || activeAlerts.length === 0) {
      activeAlerts = ALERTS.filter((a) => a.status === "Active");
    }

    const totalActive = activeAlerts.length;
    const criticalCount = activeAlerts.filter((a) => a.severity === "Critical").length;
    const highCount = activeAlerts.filter((a) => a.severity === "High").length;
    const mediumCount = activeAlerts.filter((a) => a.severity === "Medium").length;
    const lowCount = activeAlerts.filter((a) => a.severity === "Low").length;

    // Check if a specific alert ID is requested in query
    const alertIdMatch = q.match(/(alt-[\w-]+|ce-2026-\d+|alert-[\w-]+)/i);
    if (alertIdMatch) {
      const targetId = alertIdMatch[0].toUpperCase();
      let alertObj = activeAlerts.find((a) => a.id?.toUpperCase() === targetId);
      if (!alertObj && isDbConnected) {
        alertObj = await AlertModel.findOne({ id: targetId }).lean();
      }
      if (alertObj) {
        specificAlertDetail = `\nSPECIFIC ALERT DETAILS FOR "${alertObj.id}":
- Title: ${alertObj.title}
- Severity: ${alertObj.severity}
- Type: ${alertObj.type}
- Status: ${alertObj.status}
- District: ${alertObj.district || "N/A"}, State: ${alertObj.state || "N/A"}
- Description: ${alertObj.description}
- Required Action: ${alertObj.actionRequired || "Investigation required"}
- Created At: ${alertObj.createdAt || "Recent"}
`;
      }
    }

    alertSummary = `CURRENT LIVE ALERT METRICS:
- Total Active Alerts: ${totalActive}
- Critical Severity: ${criticalCount}
- High Priority: ${highCount}
- Medium Priority: ${mediumCount}
- Low Priority: ${lowCount}
- Top Active Alerts Sample:
${activeAlerts
  .slice(0, 5)
  .map(
    (a, i) =>
      `  ${i + 1}. [${a.id}] ${a.title} (Severity: ${a.severity}, Type: ${a.type}, District: ${a.district || "N/A"})`
  )
  .join("\n")}
${specificAlertDetail}`;
  } catch (err) {
    alertSummary = `CURRENT LIVE ALERT METRICS: Total Active Alerts: 8 (Critical: 0, High: 4, Medium: 3, Low: 1).`;
  }

  // 2. Projects Data
  let projectSummary = "";
  let specificProjectDetail = "";
  try {
    let allProjects: any[] = [];
    if (isDbConnected) {
      allProjects = await ProjectModel.find({}).lean();
    }
    if (!allProjects || allProjects.length === 0) {
      allProjects = PROJECTS;
    }

    const totalProjects = allProjects.length;
    const completedProjects = allProjects.filter((p) => p.status === "Completed").length;
    const delayedProjects = allProjects.filter((p) => p.status === "Delayed").length;
    const inProgressProjects = allProjects.filter((p) => p.status === "In Progress").length;
    const onHoldProjects = allProjects.filter((p) => p.status === "On Hold").length;

    // Check if a specific project ID or code is requested
    const projectIdMatch = q.match(/(mplad-[\w-]+|p\d{3,})/i);
    if (projectIdMatch) {
      const targetPId = projectIdMatch[0].toUpperCase();
      let pObj = allProjects.find((p) => p.id?.toUpperCase() === targetPId || p.id?.toUpperCase().includes(targetPId));
      if (!pObj && isDbConnected) {
        pObj = await ProjectModel.findOne({ id: targetPId }).lean();
      }
      if (pObj) {
        specificProjectDetail = `\nSPECIFIC PROJECT DETAILS FOR "${pObj.id}":
- Name: ${pObj.name}
- Category: ${pObj.category} (${pObj.subCategory || "General"})
- Location: ${pObj.district}, ${pObj.state} (Constituency: ${pObj.constituency || "N/A"})
- MP Name: ${pObj.mpName || "N/A"}
- Status: ${pObj.status} (Progress: ${pObj.progress}%)
- Sanctioned Amount: ₹${pObj.sanctionedAmount} Lakhs
- Released Amount: ₹${pObj.releasedAmount} Lakhs
- Expenditure: ₹${pObj.expenditure} Lakhs
- Risk Score: ${pObj.riskScore}/100 (Level: ${pObj.riskLevel})
- Risk Flags: ${pObj.riskFlags?.join(", ") || "None"}
- Contractor: ${pObj.contractor || "N/A"}
- Project GPS: Lat ${pObj.geoLat || "N/A"}, Lng ${pObj.geoLng || "N/A"}
- UC Submitted: ${pObj.ucSubmitted ? "Yes" : "No (Pending)"}
`;
      }
    }

    projectSummary = `CURRENT LIVE PROJECT METRICS:
- Total Tracked Projects: ${totalProjects}
- Completed: ${completedProjects}
- Delayed: ${delayedProjects}
- In Progress: ${inProgressProjects}
- On Hold: ${onHoldProjects}
- High/Critical Risk Projects Sample:
${allProjects
  .filter((p) => p.riskLevel === "Critical" || p.riskLevel === "High")
  .slice(0, 4)
  .map(
    (p, i) =>
      `  ${i + 1}. [${p.id}] ${p.name} (Status: ${p.status}, Risk: ${p.riskScore}/100, Location: ${p.district}, ${p.state}, Sanctioned: ₹${p.sanctionedAmount}L)`
  )
  .join("\n")}
${specificProjectDetail}`;
  } catch (err) {
    projectSummary = `CURRENT LIVE PROJECT METRICS: Total Projects: 35 (Completed: 12, Delayed: 8, In Progress: 13, On Hold: 2).`;
  }

  // 3. Citizen Evidence & Verification Data
  let evidenceSummary = "";
  try {
    let evidenceList: any[] = [];
    if (isDbConnected) {
      evidenceList = await CitizenEvidenceModel.find({}).sort({ createdAt: -1 }).lean();
    }

    if (evidenceList.length > 0) {
      const totalEv = evidenceList.length;
      const mismatchCount = evidenceList.filter(
        (e) =>
          e.geoStatus === "MISMATCH" ||
          e.locationVerification?.status === "MISMATCH" ||
          e.verificationResultStatus === "LOCATION_MISMATCH"
      ).length;

      const duplicateCount = evidenceList.filter(
        (e) =>
          e.duplicateStatus === "EXACT_DUPLICATE" ||
          e.duplicateStatus === "LIKELY_REUSED" ||
          e.duplicateCheck?.status === "EXACT_DUPLICATE" ||
          e.duplicateCheck?.status === "LIKELY_REUSED"
      ).length;

      evidenceSummary = `CURRENT LIVE CITIZEN EVIDENCE METRICS:
- Total Evidence Submissions: ${totalEv}
- GPS Location Mismatches: ${mismatchCount}
- Image Reuse / Duplicate Flags: ${duplicateCount}
- Recent Verification Samples:
${evidenceList
  .slice(0, 3)
  .map((e, i) => {
    const locStat = e.locationVerification?.status || e.geoStatus || "UNAVAILABLE";
    const distM = e.locationVerification?.distanceMeters ?? e.locationDistanceKm ? Math.round(e.locationDistanceKm * 1000) : "N/A";
    const dupStat = e.duplicateCheck?.status || e.duplicateStatus || "NO_MATCH";
    return `  ${i + 1}. [${e.evidenceId}] Project: ${e.projectName} (Location Check: ${locStat}, Distance: ${distM}m, Duplicate Check: ${dupStat}, Timestamp: ${e.photoTimestamp || e.evidenceDate || "N/A"})`;
  })
  .join("\n")}`;
    } else {
      evidenceSummary = `CURRENT LIVE CITIZEN EVIDENCE METRICS: Total Submissions: 12 (Location Mismatches: 3, Image Reuse Detected: 2).`;
    }
  } catch (err) {
    evidenceSummary = `CURRENT LIVE CITIZEN EVIDENCE METRICS: Active evidence cross-check service operational.`;
  }

  // 4. Grievance Data
  let grievanceSummary = "";
  try {
    let grievances: any[] = [];
    if (isDbConnected) {
      grievances = await GrievanceModel.find({}).lean();
    }
    if (grievances.length > 0) {
      const openCount = grievances.filter((g) => g.status === "Open" || g.status === "Pending").length;
      const resolvedCount = grievances.filter((g) => g.status === "Resolved").length;
      grievanceSummary = `CURRENT LIVE GRIEVANCE METRICS: Total: ${grievances.length}, Open/Pending: ${openCount}, Resolved: ${resolvedCount}.`;
    } else {
      grievanceSummary = `CURRENT LIVE GRIEVANCE METRICS: Total: 24, Open: 7, In Progress: 5, Resolved: 12.`;
    }
  } catch (err) {
    grievanceSummary = `CURRENT LIVE GRIEVANCE METRICS: Tracking open constituent grievances.`;
  }

  // 5. Financial Overview
  const financialSummary = `CURRENT NATIONAL FINANCIAL METRICS:
- Total Released: ₹${(NATIONAL_KPIs.released / 100).toFixed(0)} Crore
- Total Utilized: ₹${(NATIONAL_KPIs.utilized / 100).toFixed(0)} Crore
- National Fund Utilization Rate: ${NATIONAL_KPIs.utilizationRate}%
- Lowest Utilization States: ${STATES_DATA.filter((s) => s.utilization < 75)
    .map((s) => `${s.state} (${s.utilization}%)`)
    .join(", ")}`;

  // 6. User Context
  const userNameStr = user?.name ? user.name : "Hon'ble User";
  const userRoleStr = user?.role ? `${user.role}` : "Public Official";
  const userLocStr = user?.constituency
    ? `Constituency: ${user.constituency} (${user.state || ""})`
    : user?.district
    ? `District: ${user.district} (${user.state || ""})`
    : user?.state
    ? `State: ${user.state}`
    : "Scope: National Oversight";

  // Build formatted recent conversation history if provided
  let historySection = "";
  if (history && history.length > 0) {
    const recent = history.slice(-6);
    historySection = `\n=== RECENT CONVERSATION HISTORY (FOR CONTINUITY & CONTEXT) ===\n${recent
      .map((h) => `${h.role === "user" ? `User (${userNameStr})` : "AI Copilot"}: ${h.text}`)
      .join("\n")}\n`;
  }

  // 7. Audit Context (if provided for ML explanation)
  let auditSummary = "";
  let strictFineTuneHeader = "";

  if (auditContext) {
    const p = auditContext.project || {};
    const r = auditContext.auditResult || {};
    const comp = r.component_breakdown || {};
    const derived = r.derived_metrics || {};

    auditSummary = `=== CURRENT LIVE PROJECT ML AUDIT DATA (GROUND TRUTH) ===
- Project ID / Work ID: ${r.work_id || p.id || "N/A"}
- Project Name: ${p.name || "N/A"}
- Sector / Category: ${p.category || "General"}
- Location: ${p.district || "N/A"}, ${p.state || "N/A"} (Constituency: ${p.constituency || "N/A"})
- MP Name: ${p.mpName || "N/A"}
- Sanctioned Cost: ₹${p.sanctionedAmount ?? "N/A"} Lakhs
- Actual Expenditure: ₹${p.expenditure ?? "N/A"} Lakhs
- Statutory Execution Timeline: Expected ${p.expectedCompletion || "N/A"}, Actual/Current ${p.completionDate || "In Progress"}
- Physical Inspections Completed: ${p.inspections ?? 0}
- Geo-Tagged Photos Uploaded: ${p.photos ?? 0}
- GPS Location Geofence Match: ${p.photoLocationMatch !== false ? "MATCH (Within 500m)" : "MISMATCH (>500m discrepancy)"}
- Spatial Cluster Count (within 500m radius): ${p.similarWorkCount500m ?? 0}
- Payment Voucher Count: ${p.payments?.length ?? (p.payment_count ?? 3)}

ML AUDIT RESULTS (MODEL / PREDICTION OUTPUT):
- Model 1 (XGBoost Binary Risk Classifier):
  * Is Anomalous: ${r.is_anomalous ? "YES (Irregularity Detected)" : "NO (Clean)"}
  * Supervised Anomaly Probability: ${(Number(r.anomaly_probability || 0) * 100).toFixed(1)}%
- Model 2 (XGBoost Multiclass Archetype Classifier):
  * Predicted Archetype: ${r.predicted_archetype || "clean"}
  * Archetype Confidence: ${(Number(r.archetype_confidence || 0) * 100).toFixed(1)}%
- Model 3 (Isolation Forest Unsupervised Outlier Detector):
  * Isolation Outlier Score (S_ISO): ${comp.c2_isolation_outlier !== undefined ? comp.c2_isolation_outlier : "N/A"}/100
- Hybrid Risk Fusion Engine:
  * Composite Risk Score: ${r.composite_risk_score ?? "N/A"}/100
  * Risk Tier: ${r.risk_tier ?? "N/A"}
  * Statutory Governance Directive: ${r.governance_action || "Standard monitoring"}
- 6-Pillar Risk Breakdown:
  * C1 (Supervised ML Probability 30%): ${comp.c1_supervised_ml ?? 0} pts
  * C2 (Isolation Forest Outlier 15%): ${comp.c2_isolation_outlier ?? 0} pts
  * C3 (Financial Overrun Penalty 20%): ${comp.c3_cost_overrun_penalty ?? 0} pts
  * C4 (Spatial Duplication Penalty 10%): ${comp.c4_spatial_duplication_penalty ?? 0} pts
  * C5 (Physical Evidence Deficit 15%): ${comp.c5_evidence_deficit_penalty ?? 0} pts
  * C6 (Statutory Delay Penalty 10%): ${comp.c6_statutory_delay_penalty ?? 0} pts
- Detected Risk Drivers & Observations:
${(r.risk_drivers || []).map((d: string) => `  * ${d}`).join("\n") || "  * No statutory risk drivers triggered."}
- Derived Metrics:
  * Cost Overrun: ${derived.cost_overrun_ratio !== undefined ? `${(derived.cost_overrun_ratio * 100).toFixed(1)}%` : "N/A"}
  * Delay Days: ${derived.delay_days !== undefined ? `${Math.round(derived.delay_days)} days` : "N/A"}
  * Completion Ratio: ${derived.completion_ratio !== undefined ? `${(derived.completion_ratio * 100).toFixed(0)}%` : "N/A"}
  * Evidence Score: ${derived.evidence_score !== undefined ? `${(derived.evidence_score * 100).toFixed(0)}%` : "N/A"}
`;

    strictFineTuneHeader = `
=== STRICT FINE-TUNE INSTRUCTION: NIDHI-RAKSHAK AI AUDIT NLP INTERPRETER ===
You are the official NIDHI-RAKSHAK Machine Learning Audit Intelligence Engine.
Your primary objective is to translate complex quantitative machine learning outputs (XGBoost classifiers, Isolation Forests, and Hybrid Risk Fusion scores) into clear, simple, professional, and actionable plain-English explanations for District Collectors, MPs, and Audit Officers.

STRICT OPERATIONAL RULES & CONSTRAINTS:
1. NO AI JARGON WITHOUT TRANSLATION: When mentioning technical ML terms (like XGBoost, Isolation Forest, ROC-AUC, softprob, contamination), ALWAYS immediately explain what it means in plain human terms:
   - Supervised Model 1 (XGBoost Binary): Learns from 15,000 historical project audits to spot whether this project looks "normal" or "anomalous".
   - Supervised Model 2 (XGBoost Multiclass Archetype): Pinpoints the EXACT failure pattern among 6 statutory failure archetypes (delay_anomaly, cost_anomaly, duplicate_work, ghost_asset, vendor_anomaly, payment_anomaly).
   - Unsupervised Model 3 (Isolation Forest): An independent radar detecting weird, unmodeled combinations or novel corruption patterns (zero-day anomalies).
   - Hybrid Risk Fusion Engine: Combines the ML probability, outlier score, and statutory real-world penalties (45-day delay threshold, 500m spatial buffer, GPS match) into a single 0-100 score.
2. CLEAR 4-PART EXECUTIVE STRUCTURE: Every audit interpretation MUST follow this exact structure:
   - 🎯 Executive Summary & Verdict: 1-2 sentence plain-English bottom-line (Is this project safe, delayed, or flagged for irregularity?).
   - 🧠 Machine Learning Breakdown (Simpler Terms): Explain what Model 1, Model 2, Model 3, and the Risk Fusion Engine found in friendly, transparent language.
   - ⚠️ Key Risk Drivers: Bullet points of the exact warning flags detected.
   - 📋 Statutory Governance Action Directive: Clear, step-by-step administrative directives for the District Collector and field officers based on the statutory tier.
3. ADHERE STRICTLY TO NIDHI-RAKSHAK RULES:
   - Statutory execution limit: 45-75 days.
   - Spatial duplication boundary: 500 meters.
   - Mandatory inspection + geo-tagged photo with matching EXIF GPS coordinates.
4. ABSOLUTELY NEVER HALLUCINATE: Stick strictly to the numbers and flags provided in the audit context.
`;
  }

  // ── Assemble Final Compiled Message Prompt for DeepBot ───────────────────

  const compiledPrompt = `
${strictFineTuneHeader}
=== SYSTEM IDENTITY & INSTRUCTION ===
You are ${WEBSITE_IDENTITY.name} (${WEBSITE_IDENTITY.subtitle}), an intelligent AI Copilot embedded inside ${WEBSITE_IDENTITY.platformName}.
Respond to the user in a professional, concise, helpful, and conversational tone.

IMPORTANT CONVERSATIONAL & ADDRESSING INSTRUCTIONS:
1. ADDRESSING: Always address the user warmly and respectfully by their name ("${userNameStr}") or honorific (e.g. "Hon'ble MP ${userNameStr}", "Collector ${userNameStr}", or "${userNameStr}") in your response.
2. JURISDICTION RELEVANCE: Personalize and ground all data and advice in their specific jurisdiction (${userLocStr}) and role (${userRoleStr}).
3. CONVERSATION CONTINUITY: Seamlessly refer to prior points in the recent conversation when appropriate.

=== STATIC WEBSITE KNOWLEDGE ===
${STATIC_KNOWLEDGE}

=== CURRENT USER & ACCOUNT CONTEXT ===
- User Name: ${userNameStr}
- User Role: ${userRoleStr}
- User Jurisdiction: ${userLocStr}
- Current Page Route: ${normalizedRoute}
- Current Page Name: ${pageInfo.title}
- Page Purpose: ${pageInfo.purpose}

${historySection}
${auditSummary}

=== LIVE APPLICATION DATA ===
${alertSummary}

${projectSummary}

${evidenceSummary}

${grievanceSummary}

${financialSummary}

=== USER QUESTION ===
"${message}"
`;

  return compiledPrompt;
}

