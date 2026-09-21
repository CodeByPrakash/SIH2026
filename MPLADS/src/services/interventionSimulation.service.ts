import { dbConnect } from "@/lib/mongodb";
import {
  InterventionSimulationModel,
  AuthorityDecisionModel,
  IInterventionSimulationDocument,
  IAuthorityDecisionDocument,
} from "@/models/InterventionSimulation";
import type {
  Project,
  ICitizenEvidence,
  Alert,
  IScenarioSimulationResult,
  IAuthorityDecision,
  InterventionType,
  UserRole,
} from "@/types";
import { getProjectById, getAllProjects } from "./project.service";
import { getAllEvidence } from "./citizenEvidence.service";
import { getAllAlerts } from "./alert.service";

let memorySimulations: IScenarioSimulationResult[] = [];
let memoryDecisions: IAuthorityDecision[] = [];

export interface WhatIfInputs {
  progress?: number;
  riskLevel?: "Low" | "Medium" | "High" | "Critical";
  hasCitizenConflict?: boolean;
  complianceStatus?: "Compliant" | "UC Pending" | "Discrepancy Flagged" | "Inspection Required";
}

export async function runInterventionSimulation(
  projectId: string,
  customInputs?: WhatIfInputs
): Promise<IScenarioSimulationResult> {
  const project = await getProjectById(projectId);
  if (!project) {
    throw new Error(`Project with ID ${projectId} not found.`);
  }

  const allEvidence = await getAllEvidence();
  const projectEvidence = allEvidence.filter((e) => e.projectId === projectId);
  const conflictEvidence = projectEvidence.filter(
    (e) => e.verificationCategory === "CONFLICT_DETECTED" || e.verificationCategory === "POTENTIAL_CONFLICT"
  );

  const allAlerts = await getAllAlerts();
  const projectAlerts = allAlerts.filter((a) => a.projectId === projectId && a.status === "Active");

  // Effective parameters considering What-If overrides
  const effectiveProgress = customInputs?.progress ?? project.progress;
  const effectiveRiskLevel = customInputs?.riskLevel ?? project.riskLevel;
  const hasConflict = customInputs?.hasCitizenConflict ?? (conflictEvidence.length > 0);
  const isUcPending = !project.ucSubmitted || customInputs?.complianceStatus === "UC Pending";

  const financialUtilization = project.sanctionedAmount > 0
    ? Math.round((project.expenditure / project.sanctionedAmount) * 100)
    : 0;

  // Key factors extraction
  const keyFactors: string[] = [];
  if (hasConflict) {
    keyFactors.push(`Citizen Evidence Conflict Detected (${conflictEvidence.length} reports)`);
  } else if (projectEvidence.length > 0) {
    keyFactors.push(`Verified Citizen Evidence Available (${projectEvidence.length} reports)`);
  }

  if (isUcPending) {
    keyFactors.push("Utilization Certificate (UC) Pending");
  } else {
    keyFactors.push("Utilization Certificate (UC) Submitted & Verified");
  }

  if (effectiveRiskLevel === "High" || effectiveRiskLevel === "Critical") {
    keyFactors.push(`High Risk Level Indicator (${project.riskScore}/100)`);
  }

  if (projectAlerts.length > 0) {
    keyFactors.push(`Active System Alerts (${projectAlerts.length} active)`);
  }

  keyFactors.push(`Progress: ${effectiveProgress}% vs Expenditure: ${financialUtilization}%`);

  // Data Quality & Confidence Assessment
  const infoGaps: string[] = [];
  let dataScore = 100;

  if (project.inspections < 2) {
    infoGaps.push("Third-party physical inspection report required");
    dataScore -= 15;
  }
  if (project.photos < 3) {
    infoGaps.push("Updated geotagged photo evidence needed");
    dataScore -= 10;
  }
  if (projectEvidence.length === 0) {
    infoGaps.push("No independent citizen ground verification available");
    dataScore -= 10;
  }
  if (!project.contractor) {
    infoGaps.push("Contractor milestone details incomplete");
    dataScore -= 10;
  }

  const dataQualityRating: "High" | "Medium" | "Low" =
    dataScore >= 80 ? "High" : dataScore >= 60 ? "Medium" : "Low";

  // Base confidence scores per scenario calculated deterministically based on available data quality
  const releaseConfidence = Math.max(45, Math.min(95, dataScore - (hasConflict ? 15 : 0) - (isUcPending ? 10 : 0)));
  const holdConfidence = Math.max(50, Math.min(95, dataScore + (hasConflict ? 10 : -5)));
  const correctiveConfidence = Math.max(50, Math.min(95, dataScore + (hasConflict ? 15 : 5) + (effectiveRiskLevel === "High" || effectiveRiskLevel === "Critical" ? 10 : 0)));

  // SCENARIO 1: RELEASE
  let releaseOutcome = "";
  const releaseBenefits: string[] = [];
  const releaseRisks: string[] = [];
  let releaseCompliance = "";
  let releaseImpact = "";
  const releaseMonitoring: string[] = [];

  if (effectiveProgress >= 90 && !hasConflict && !isUcPending) {
    releaseOutcome = `Project implementation can proceed to final completion and milestone closeout for "${project.name}".`;
    releaseBenefits.push("Avoids funding disruption or contractor payment delays");
    releaseBenefits.push("Ensures timely completion without administrative bottleneck");
    releaseRisks.push("Requires post-completion auditing to verify long-term asset quality");
    releaseCompliance = "Fully compliant with fund release guidelines subject to standard final audit.";
    releaseImpact = "Milestones on schedule; expected final asset creation without delay.";
    releaseMonitoring.push("Conduct routine post-release asset inspection");
  } else if (hasConflict) {
    releaseOutcome = `Releasing funds while unresolved citizen evidence conflicts exist carries financial and quality risk.`;
    releaseBenefits.push("Maintains financial pace and contractor cash flow");
    releaseRisks.push(`Existing reported defects (${conflictEvidence[0]?.category || "Quality Defect"}) may remain unrectified`);
    releaseRisks.push("Risk of public grievance escalation if reported ground issues are ignored");
    releaseCompliance = "Potential audit observation due to releasing funds amidst reported ground discrepancy.";
    releaseImpact = "Work may continue, but quality defects could be permanently covered up.";
    releaseMonitoring.push("Mandatory field verification within 14 days of release");
    releaseMonitoring.push("Joint inspection with District Nodal Officer");
  } else if (isUcPending) {
    releaseOutcome = `Funds release proceeds prior to UC submission; procedural compliance warning active.`;
    releaseBenefits.push("Prevents site execution stoppage due to liquidity constraints");
    releaseRisks.push("Non-adherence to NIDHI-RAKSHAK UC submission guidelines prior to next installment");
    releaseCompliance = "UC delay flagged â€” conditional release requires MoSPI/District waiver.";
    releaseImpact = "Accelerates physical work but increases documentation backlog.";
    releaseMonitoring.push("Enforce UC submission deadline within 30 days");
  } else {
    releaseOutcome = `Fund release supports ongoing construction progress (Currently ${effectiveProgress}% completed).`;
    releaseBenefits.push("Ensures uninterrupted supply chain and labor availability");
    releaseBenefits.push("Keeps project aligned with target timeline");
    releaseRisks.push("Monetary risk if progress reports overestimate actual physical work");
    releaseCompliance = "Compliant with standard milestone installment criteria.";
    releaseImpact = `Project momentum maintained; expected progress to reach ${Math.min(100, effectiveProgress + 20)}% next cycle.`;
    releaseMonitoring.push("Verify milestone billing against physical measurement book");
  }

  // SCENARIO 2: HOLD
  let holdOutcome = "";
  const holdBenefits: string[] = [];
  const holdRisks: string[] = [];
  let holdCompliance = "";
  let holdImpact = "";
  const holdMonitoring: string[] = [];

  if (hasConflict) {
    holdOutcome = `Temporary hold allows immediate investigation into reported citizen evidence conflicts regarding "${project.name}".`;
    holdBenefits.push("Prevents potential misallocation or payment for substandard work");
    holdBenefits.push("Provides opportunity for independent ground inspection and geotag verification");
    holdRisks.push("Project completion timeline will be delayed by 2 to 4 weeks");
    holdRisks.push("Contractor may file formal grievance or pause ongoing labor on site");
    holdCompliance = "Mitigates compliance risk by enforcing verification before financial disbursement.";
    holdImpact = "Site work paused temporarily; milestone timeline shifted by verification window.";
    holdMonitoring.push("Depute District Engineer for immediate physical site audit");
    holdMonitoring.push("Cross-reference citizen geotagged evidence with contractor bills");
  } else if (isUcPending) {
    holdOutcome = `Holding release enforces strict UC compliance before further public funds are disbursed.`;
    holdBenefits.push("Ensures full financial accountability and proper utilization of previous tranche");
    holdRisks.push("Project progress stalls; risk of cost overrun due to delay");
    holdCompliance = "Strict adherence to NIDHI-RAKSHAK financial guidelines.";
    holdImpact = "Work on hold until executing agency submits validated UC.";
    holdMonitoring.push("Issue formal request to Executing Agency for expedited UC submission");
  } else {
    holdOutcome = `Holding fund release for a low-risk project creates unnecessary delay without clear risk mitigation.`;
    holdBenefits.push("Conserves liquidity pending further administrative review");
    holdRisks.push("Unjustified contractor delay and potential asset degradation");
    holdRisks.push("Public discontent over stalled community utility");
    holdCompliance = "No immediate compliance violation, but delayed fund utilization score for constituency.";
    holdImpact = `Schedule delay of 30+ days; project completion target extended.`;
    holdMonitoring.push("Review hold status within 7 working days");
  }

  // SCENARIO 3: CORRECTIVE ACTION
  let correctiveOutcome = "";
  const correctiveBenefits: string[] = [];
  const correctiveRisks: string[] = [];
  let correctiveCompliance = "";
  let correctiveImpact = "";
  const correctiveMonitoring: string[] = [];

  if (hasConflict || effectiveRiskLevel === "High" || effectiveRiskLevel === "Critical") {
    correctiveOutcome = `Requiring formal corrective action ensures reported deficiencies are rectified before any further release.`;
    correctiveBenefits.push("Mandates contractor to fix quality flaws at their own expense prior to payment");
    correctiveBenefits.push("Upholds high engineering and safety standards for public infrastructure");
    correctiveRisks.push("Requires additional administrative oversight and re-inspection cycles");
    correctiveRisks.push("Contractor rectification timeline may extend completion date by 15-30 days");
    correctiveCompliance = "Establishes strong governance trail and addresses audit risk proactively.";
    correctiveImpact = "Rectification work initiated; payout tied strictly to compliance certificate.";
    correctiveMonitoring.push("Issue formal Rectification Notice specifying exact defect details");
    correctiveMonitoring.push("Require geotagged post-rectification photographic evidence");
    correctiveMonitoring.push("Final joint re-inspection before fund release approval");
  } else {
    correctiveOutcome = `Issuing corrective guidelines to align minor execution items with NIDHI-RAKSHAK standards.`;
    correctiveBenefits.push("Enhances asset durability and compliance documentation");
    correctiveRisks.push("Minor delay in final release while documentation/finishing touches are rectified");
    correctiveCompliance = "Ensures 100% adherence to technical specifications.";
    correctiveImpact = "Minor site adjustments required; completion delayed by 7-10 days.";
    correctiveMonitoring.push("Verify updated compliance checklist prior to final payment");
  }

  const simulationId = `SIM-2026-${Date.now().toString().slice(-6)}`;
  const timestamp = new Date().toISOString();

  const simulationResult: IScenarioSimulationResult = {
    simulationId,
    projectId: project.id,
    projectName: project.name,
    timestamp,
    simulationStatus: "COMPLETED",
    scenarios: {
      release: {
        projectedOutcome: releaseOutcome,
        benefits: releaseBenefits,
        risks: releaseRisks,
        complianceImpact: releaseCompliance,
        projectImpact: releaseImpact,
        monitoringRequired: releaseMonitoring,
        confidence: releaseConfidence,
      },
      hold: {
        projectedOutcome: holdOutcome,
        benefits: holdBenefits,
        risks: holdRisks,
        complianceImpact: holdCompliance,
        projectImpact: holdImpact,
        monitoringRequired: holdMonitoring,
        confidence: holdConfidence,
      },
      correctiveAction: {
        projectedOutcome: correctiveOutcome,
        benefits: correctiveBenefits,
        risks: correctiveRisks,
        complianceImpact: correctiveCompliance,
        projectImpact: correctiveImpact,
        monitoringRequired: correctiveMonitoring,
        confidence: correctiveConfidence,
      },
    },
    keyFactors,
    additionalInformationRequired: infoGaps,
    assumptionsUsed: {
      progress: effectiveProgress,
      riskLevel: effectiveRiskLevel,
      hasCitizenConflict: hasConflict,
      complianceStatus: isUcPending ? "UC Pending" : "Compliant",
    },
    dataQualityRating,
    disclaimer:
      "AI Scenario Simulation â€” Projected outcome based on available project data. Does not determine final administrative decision.",
  };

  // Persist to DB and memory
  memorySimulations.unshift(simulationResult);

  try {
    const conn = await dbConnect();
    if (conn) {
      await InterventionSimulationModel.create(simulationResult);
      console.log(`Successfully stored Intervention Simulation ${simulationId} in MongoDB Atlas.`);
    }
  } catch (err) {
    console.error("Failed to store intervention simulation in DB:", err);
  }

  return simulationResult;
}

export async function recordAuthorityDecision(input: {
  projectId: string;
  selectedIntervention: InterventionType;
  decisionNote: string;
  recordedByRole: UserRole;
  recordedByName?: string;
  simulationIdRef?: string;
}): Promise<IAuthorityDecision> {
  const project = await getProjectById(input.projectId);
  const projectName = project ? project.name : `Project ${input.projectId}`;
  const decisionId = `DEC-2026-${Date.now().toString().slice(-6)}`;
  const recordedAt = new Date().toISOString();

  const decisionRecord: IAuthorityDecision = {
    decisionId,
    projectId: input.projectId,
    projectName,
    selectedIntervention: input.selectedIntervention,
    decisionNote: input.decisionNote,
    recordedByRole: input.recordedByRole,
    recordedByName: input.recordedByName || `${input.recordedByRole} Official`,
    recordedAt,
    simulationIdRef: input.simulationIdRef || "",
  };

  memoryDecisions.unshift(decisionRecord);

  try {
    const conn = await dbConnect();
    if (conn) {
      await AuthorityDecisionModel.create(decisionRecord);
      console.log(`Successfully recorded Authority Decision ${decisionId} in MongoDB Atlas.`);
    }
  } catch (err) {
    console.error("Failed to record authority decision in DB:", err);
  }

  return decisionRecord;
}

export async function getAuthorityDecisionsForProject(projectId: string): Promise<IAuthorityDecision[]> {
  try {
    const conn = await dbConnect();
    if (conn) {
      const docs = await AuthorityDecisionModel.find({ projectId })
        .sort({ createdAt: -1 })
        .lean<IAuthorityDecisionDocument[]>();
      if (docs && docs.length > 0) {
        return docs.map((d) => ({
          decisionId: d.decisionId,
          projectId: d.projectId,
          projectName: d.projectName,
          selectedIntervention: d.selectedIntervention,
          decisionNote: d.decisionNote,
          recordedByRole: d.recordedByRole,
          recordedByName: d.recordedByName,
          recordedAt: d.recordedAt,
          simulationIdRef: d.simulationIdRef,
        }));
      }
    }
  } catch (err) {
    console.error("Error fetching authority decisions from DB:", err);
  }
  return memoryDecisions.filter((d) => d.projectId === projectId);
}
