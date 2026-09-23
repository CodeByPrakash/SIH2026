export type UserRole = "MP" | "District" | "State" | "Ministry" | "Citizen";

export interface User {
  name: string;
  role: UserRole;
  constituency?: string;
  district?: string;
  state?: string;
  mpId?: string;
  phone: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  state: string;
  district: string;
  constituency: string;
  mpName: string;
  mpId: string;
  sanctionedAmount: number;
  releasedAmount: number;
  expenditure: number;
  status: "Completed" | "In Progress" | "Not Started" | "On Hold" | "Delayed";
  sanctionDate: string;
  completionDate?: string;
  expectedCompletion: string;
  progress: number;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  riskFlags: string[];
  contractor?: string;
  geoLat: number;
  geoLng: number;
  photos: number;
  inspections: number;
  ucSubmitted: boolean;
  assetCreated: boolean;
  workOrderNo: string;
  agreementDate?: string;
  payments: Payment[];
  // Evidence & Statutory Verification (ML Audit Fields)
  photoLocationMatch?: boolean;       // GPS geo-fencing match within 500m
  similarWorkCount500m?: number;      // Nearby duplicate works within 500m radius
  evidenceScore?: number;             // Composite (inspection + photo + gpsMatch) / 3.0 * 100
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  date: string;
  amount: number;
  billNo: string;
  status: "Paid" | "Pending" | "Rejected";
}

export interface RiskFlag {
  id: string;
  projectId: string;
  projectName: string;
  type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  reasons: string[];
  evidence: string[];
  peerComparison: string;
  recommendation: string;
  detectedOn: string;
  status: "Open" | "Under Review" | "Resolved";
  riskScore: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: "Delay" | "Cost Overrun" | "Utilization" | "Compliance" | "Anomaly";
  severity: "Low" | "Medium" | "High" | "Critical";
  projectId?: string;
  state?: string;
  district?: string;
  constituency?: string;
  roles?: UserRole[];
  createdAt: string;
  daysRemaining?: number;
  actionRequired: string;
  status: "Active" | "Acknowledged" | "Resolved";
}

export interface StateData {
  state: string;
  totalProjects: number;
  completedProjects: number;
  totalFunds: number;
  utilizedFunds: number;
  pendingProjects: number;
  delayedProjects: number;
  riskProjects: number;
  utilization: number;
  mps: number;
}

export interface FundSummary {
  year: string;
  allocated: number;
  released: number;
  utilized: number;
  lapsed: number;
}

export type VerificationCategory =
  | "CONSISTENT"
  | "POTENTIAL_CONFLICT"
  | "CONFLICT_DETECTED"
  | "INSUFFICIENT_EVIDENCE";

export type DuplicateStatus =
  | "EXACT_DUPLICATE"
  | "NEAR_DUPLICATE"
  | "VISUALLY_SIMILAR"
  | "NO_DUPLICATE_DETECTED"
  | "INSUFFICIENT_DATA";

export type GeoVerificationStatus =
  | "VERIFIED"
  | "MISMATCH"
  | "UNAVAILABLE";

export type CrossCheckResultStatus =
  | "VERIFIED_CONSISTENT"
  | "LOCATION_MISMATCH"
  | "POTENTIAL_REUSED_EVIDENCE"
  | "POTENTIAL_INCONSISTENCY"
  | "MULTIPLE_FLAGS"
  | "INSUFFICIENT_EVIDENCE";

export interface ICitizenEvidence {
  evidenceId: string;
  projectId: string;
  projectName: string;
  submittedBy?: string;
  citizenContact?: string;
  evidenceType: "Photo" | "Document" | "Physical Observation" | "Inspection Report";
  category: "Completion Discrepancy" | "Quality Defect" | "Fund Misuse" | "Location Issue" | "Delay" | "Other";
  description: string;
  location: string;
  evidenceDate: string;
  photoUrl?: string;
  privacyStatus: "Protected";
  processingStatus: "Processed" | "Pending";
  aiStatus: "Cross-Checked" | "Pending";
  aiConfidence: number;
  verificationCategory: VerificationCategory;
  observationSentiment?: "POSITIVE" | "NEGATIVE" | "MIXED" | "NEUTRAL" | "INSUFFICIENT_INFORMATION";
  officialRecordClaim: string;
  citizenObservation: string;
  fieldDiscrepancy: string;
  explanation: string;
  recommendedAction: string;
  additionalEvidenceRequired: string[];
  // Geo-tag, Image Reuse & Cross-Check USP fields
  imageHash?: string;
  perceptualHash?: string;
  photoLatitude?: number;
  photoLongitude?: number;
  photoTimestamp?: string;
  capturedAt?: string;
  gpsSource?: "Image EXIF" | "Manual override" | "Unavailable" | string;
  metadataSource?: "EXIF" | "MANUAL" | "NONE" | string;
  geoStatus?: GeoVerificationStatus;
  duplicateStatus?: DuplicateStatus;
  crossProjectReuse?: boolean;
  similarEvidenceId?: string;
  similarProjectId?: string;
  similarProjectName?: string;
  similarityScore?: number;
  locationDistanceKm?: number;
  locationDescription?: string;
  duplicateDescription?: string;
  timestampStatus?: string;
  visualConsistencyStatus?: string;
  verificationResultStatus?: CrossCheckResultStatus;
  verificationFlags?: string[];
  overallAssessment?: string;
  verificationProcessedAt?: string;
  locationVerification?: {
    status: "MATCH" | "MISMATCH" | "UNAVAILABLE";
    distanceMeters: number | null;
    allowedRadiusMeters: number;
    photoLocation: {
      latitude: number | null;
      longitude: number | null;
    };
    projectLocation: {
      latitude: number | null;
      longitude: number | null;
    };
    checkedAt?: string | Date;
  };
  duplicateCheck?: {
    status: "NO_MATCH" | "EXACT_DUPLICATE" | "LIKELY_REUSED" | "SIMILAR_IMAGE" | "UNAVAILABLE";
    similarityScore: number | null;
    similarityPercent?: number;
    matchedEvidenceId: string | null;
    matchedProjectId: string | null;
    matchedProjectName: string | null;
    matchType: "SHA256" | "PERCEPTUAL_HASH" | null;
    isCrossProject: boolean;
    sha256: string | null;
    perceptualHash: string | null;
    message: string;
    checkedAt?: string | Date;
  };
  calculationInconsistency?: CalculationInconsistencyEvaluation;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CalculationInconsistencyEvaluation {
  inconsistencyScore: number; // 0 to 100
  inconsistencyLevel: "Low" | "Moderate" | "High" | "Critical";
  hasCalculationInconsistency: boolean;
  // Physical vs Financial Execution
  claimedProgressPct: number;
  calculatedObservedProgressPct: number;
  progressDeficitPct: number;
  disbursedExpenditureLakh: number;
  justifiedExpenditureLakh: number;
  unjustifiedAtRiskLakh: number;
  // Unit Cost & Rate Variance
  sanctionedUnitCost?: string;
  effectiveObservedUnitCost?: string;
  unitCostVariancePct?: number;
  // Statutory Compliance & Milestone
  ucClaimStatus: string;
  statutoryViolation: boolean;
  // Mathematical Evaluation Narrative
  evaluationSummary: string;
  discrepancyFormula: string;
  auditRecommendations: string[];
}

export interface IDuplicateCheckResult {
  status: "NO_MATCH" | "EXACT_DUPLICATE" | "LIKELY_REUSED" | "SIMILAR_IMAGE" | "UNAVAILABLE";
  similarityScore: number | null;
  similarityPercent?: number;
  matchedEvidenceId: string | null;
  matchedProjectId: string | null;
  matchedProjectName: string | null;
  matchType: "SHA256" | "PERCEPTUAL_HASH" | null;
  isCrossProject: boolean;
  sha256: string | null;
  perceptualHash: string | null;
  message: string;
  checkedAt?: string | Date;
}

export interface ILocationVerification {
  status: "MATCH" | "MISMATCH" | "UNAVAILABLE";
  distanceMeters: number | null;
  allowedRadiusMeters: number;
  photoLocation: {
    latitude: number | null;
    longitude: number | null;
  };
  projectLocation: {
    latitude: number | null;
    longitude: number | null;
  };
  checkedAt?: string | Date;
}

export type InterventionType = "RELEASE" | "HOLD" | "CORRECTIVE_ACTION";

export interface ScenarioDetail {
  projectedOutcome: string;
  benefits: string[];
  risks: string[];
  complianceImpact: string;
  projectImpact: string;
  monitoringRequired: string[];
  confidence: number;
}

export interface IScenarioSimulationResult {
  simulationId: string;
  projectId: string;
  projectName: string;
  timestamp: string;
  simulationStatus: "COMPLETED" | "INSUFFICIENT_DATA" | "FAILED";
  scenarios: {
    release: ScenarioDetail;
    hold: ScenarioDetail;
    correctiveAction: ScenarioDetail;
  };
  keyFactors: string[];
  additionalInformationRequired: string[];
  assumptionsUsed?: {
    progress: number;
    riskLevel: string;
    hasCitizenConflict: boolean;
    complianceStatus: string;
  };
  dataQualityRating: "High" | "Medium" | "Low";
  disclaimer: string;
}

export interface IAuthorityDecision {
  decisionId: string;
  projectId: string;
  projectName: string;
  selectedIntervention: InterventionType;
  decisionNote: string;
  recordedByRole: UserRole;
  recordedByName?: string;
  recordedAt: string;
  simulationIdRef?: string;
}
