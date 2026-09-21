/**
 * NIDHI-RAKSHAK: Typed API Client for FastAPI ML Backend
 * Provides typed interfaces and fetch wrappers for all model inference endpoints.
 */

// ─── Request / Response Types ─────────────────────────────────────────────────

export interface WorkAuditRequest {
  work_id?: string;
  work_title?: string;
  state?: string;
  district?: string;
  constituency?: string;
  constituency_type: string;
  work_category?: string;
  estimated_cost_inr: number;
  sanctioned_cost_inr: number;
  actual_expenditure_inr: number;
  expected_completion_days: number;
  actual_completion_days: number;
  inspection_done: number;
  photo_available: number;
  photo_location_match: number;
  similar_work_count_500m: number;
  payment_count: number;
}

export interface RiskComponentScores {
  c1_supervised_ml: number;
  c2_isolation_outlier: number;
  c3_cost_overrun_penalty: number;
  c4_spatial_duplication_penalty: number;
  c5_evidence_deficit_penalty: number;
  c6_statutory_delay_penalty: number;
}

export interface WorkAuditResponse {
  work_id: string;
  is_anomalous: boolean;
  anomaly_probability: number;
  predicted_archetype: string;
  archetype_confidence: number;
  composite_risk_score: number;
  risk_tier: string;
  governance_action: string;
  risk_drivers: string[];
  component_breakdown: RiskComponentScores;
  derived_metrics: Record<string, number>;
}

export interface BatchAuditResponse {
  total_audited: number;
  high_or_critical_count: number;
  results: WorkAuditResponse[];
}

export interface ModelMetadata {
  project: string;
  team: string;
  version: string;
  feature_cols_supervised: string[];
  feature_cols_isolation: string[];
  constituency_types: string[];
  anomaly_types: string[];
  iso_score_bounds: { min: number; max: number };
  risk_weights: Record<string, number>;
  risk_tiers: Record<string, number[]>;
}

export interface HealthResponse {
  status: string;
  service: string;
  team: string;
  models_loaded: string[];
}

// ─── API Base URL ─────────────────────────────────────────────────────────────

const API_BASE = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) || "/api/v1";

// ─── API Functions ────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function getMetadata(): Promise<ModelMetadata> {
  const res = await fetch(`${API_BASE}/metadata`);
  if (!res.ok) throw new Error(`Metadata fetch failed: ${res.status}`);
  return res.json();
}

export async function auditSingleWork(
  work: WorkAuditRequest
): Promise<WorkAuditResponse> {
  const res = await fetch(`${API_BASE}/audit/single`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(work),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Audit failed: ${res.status}`);
  }
  return res.json();
}

import type { Project } from "../types";

export async function auditWebsiteProject(
  project: Partial<Project>
): Promise<WorkAuditResponse> {
  const res = await fetch(`${API_BASE}/audit/project`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Project audit failed: ${res.status}`);
  }
  return res.json();
}

export async function auditWebsiteProjectsBatch(
  projects: Project[]
): Promise<BatchAuditResponse> {
  const res = await fetch(`${API_BASE}/audit/projects/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(projects),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Batch projects audit failed: ${res.status}`);
  }
  return res.json();
}

export async function getWorkRisk(workId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/works/${encodeURIComponent(workId)}/risk`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to fetch work risk: ${res.status}`);
  }
  return res.json();
}

export function lakhsToInr(lakhs: number): number {
  return Math.round(lakhs * 100000);
}

export function inrToLakhs(inr: number): number {
  return Number((inr / 100000).toFixed(2));
}

export function fmtLakhs(lakhs: number): string {
  if (lakhs >= 100) {
    return `₹${(lakhs / 100).toFixed(2)} Cr`;
  }
  return `₹${lakhs.toFixed(2)} L`;
}

export function calcDaysBetween(start: string, end: string): number {
  try {
    const d1 = new Date(start).getTime();
    const d2 = new Date(end).getTime();
    return Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
  } catch {
    return 90;
  }
}

export function calculateEvidenceScore(
  inspections: number,
  photos: number,
  photoLocationMatch: boolean
): { score: number; inspectionDone: boolean; photoAvailable: boolean; gpsMatch: boolean } {
  const inspectionDone = inspections > 0;
  const photoAvailable = photos > 0;
  const gpsMatch = photoLocationMatch && photoAvailable;
  const points = (inspectionDone ? 1 : 0) + (photoAvailable ? 1 : 0) + (gpsMatch ? 1 : 0);
  const score = Math.round((points / 3) * 100);
  return { score, inspectionDone, photoAvailable, gpsMatch };
}

export function projectToWorkAuditRequest(p: Project): WorkAuditRequest {
  const expectedDays = calcDaysBetween(p.sanctionDate, p.expectedCompletion);
  const actualDays = p.completionDate
    ? calcDaysBetween(p.sanctionDate, p.completionDate)
    : Math.max(expectedDays, calcDaysBetween(p.sanctionDate, "2024-10-01"));

  const flagsText = (p.riskFlags || []).join(" ").toLowerCase();
  const hasGeoMismatch = p.photoLocationMatch === false || flagsText.includes("geo") || flagsText.includes("location") || flagsText.includes("mismatch") || (p.geoLat === 0 && p.geoLng === 0);

  return {
    work_id: p.id,
    work_title: p.name,
    state: p.state,
    district: p.district,
    constituency: p.constituency,
    constituency_type: "General",
    work_category: p.category,
    estimated_cost_inr: lakhsToInr(p.sanctionedAmount),
    sanctioned_cost_inr: lakhsToInr(p.sanctionedAmount),
    actual_expenditure_inr: lakhsToInr(p.expenditure),
    expected_completion_days: expectedDays,
    actual_completion_days: actualDays,
    inspection_done: (p.inspections || 0) > 0 ? 1 : 0,
    photo_available: (p.photos || 0) > 0 ? 1 : 0,
    photo_location_match: hasGeoMismatch ? 0 : (p.photoLocationMatch !== undefined ? (p.photoLocationMatch ? 1 : 0) : ((p.photos || 0) > 0 ? 1 : 0)),
    similar_work_count_500m: p.similarWorkCount500m !== undefined ? p.similarWorkCount500m : (flagsText.includes("duplicate") || flagsText.includes("cartel") ? 2 : 0),
    payment_count: p.payments?.length || (p.expenditure > 0 ? 3 : 1),
  };
}

// ─── Default Form Values ──────────────────────────────────────────────────────

export const DEFAULT_AUDIT_FORM: WorkAuditRequest = {
  work_id: "",
  work_title: "",
  state: "",
  district: "",
  constituency: "",
  constituency_type: "General",
  work_category: "Community",
  estimated_cost_inr: 1000000,
  sanctioned_cost_inr: 1000000,
  actual_expenditure_inr: 950000,
  expected_completion_days: 90,
  actual_completion_days: 85,
  inspection_done: 1,
  photo_available: 1,
  photo_location_match: 1,
  similar_work_count_500m: 0,
  payment_count: 2,
};

// ─── Preset Test Cases ────────────────────────────────────────────────────────

export const PRESET_HIGH_RISK: WorkAuditRequest = {
  work_id: "WRK-TEST-HIGH-001",
  work_title: "Installation of 50 Solar High-Mast Lights",
  state: "Uttar Pradesh",
  district: "Varanasi",
  constituency: "Varanasi",
  constituency_type: "General",
  work_category: "Electricity",
  estimated_cost_inr: 2500000,
  sanctioned_cost_inr: 3000000,
  actual_expenditure_inr: 4800000,
  expected_completion_days: 60,
  actual_completion_days: 180,
  inspection_done: 0,
  photo_available: 1,
  photo_location_match: 0,
  similar_work_count_500m: 3,
  payment_count: 8,
};

export const PRESET_CLEAN: WorkAuditRequest = {
  work_id: "WRK-TEST-CLEAN-002",
  work_title: "Primary School Computer Lab Setup",
  state: "Tamil Nadu",
  district: "Coimbatore",
  constituency: "Coimbatore",
  constituency_type: "General",
  work_category: "Education",
  estimated_cost_inr: 1000000,
  sanctioned_cost_inr: 1000000,
  actual_expenditure_inr: 950000,
  expected_completion_days: 90,
  actual_completion_days: 85,
  inspection_done: 1,
  photo_available: 1,
  photo_location_match: 1,
  similar_work_count_500m: 0,
  payment_count: 2,
};

// ─── Utility ──────────────────────────────────────────────────────────────────

export function tierColor(tier: string) {
  switch (tier) {
    case "LOW":
      return { text: "text-emerald-600", bg: "bg-emerald-500/15", border: "border-emerald-500/30", fill: "#10b981" };
    case "MODERATE":
      return { text: "text-amber-600", bg: "bg-amber-500/15", border: "border-amber-500/30", fill: "#f59e0b" };
    case "HIGH":
      return { text: "text-orange-600", bg: "bg-orange-500/15", border: "border-orange-500/30", fill: "#f97316" };
    case "CRITICAL":
      return { text: "text-red-600", bg: "bg-red-500/15", border: "border-red-500/30", fill: "#ef4444" };
    default:
      return { text: "text-muted-foreground", bg: "bg-muted", border: "border-border", fill: "#888" };
  }
}

export const ARCHETYPE_LABELS: Record<string, { label: string; desc: string }> = {
  clean: { label: "Clean", desc: "No anomaly detected — all metrics within thresholds" },
  cost_anomaly: { label: "Cost Anomaly", desc: "Sanction inflation or post-facto budget escalation" },
  delay_anomaly: { label: "Delay Anomaly", desc: "Extended delay beyond statutory expectation" },
  duplicate_work: { label: "Duplicate Work", desc: "High spatial cluster count within 500m radius" },
  ghost_asset: { label: "Ghost Asset", desc: "Missing inspection, photograph, or GPS mismatch" },
  vendor_anomaly: { label: "Vendor Anomaly", desc: "High payment count with inflated expenditure" },
  payment_anomaly: { label: "Payment Anomaly", desc: "Extreme disbursement fragmentation" },
};

export const WORK_CATEGORIES = [
  "Road", "Healthcare", "Education", "Water Supply",
  "Sanitation", "Electricity", "Community", "Sports",
];

export const CONSTITUENCY_TYPES = ["General", "SC", "ST"];

export const COMPONENT_LABELS: { key: keyof RiskComponentScores; label: string; weight: string; short: string }[] = [
  { key: "c1_supervised_ml", label: "Supervised ML Score", weight: "30%", short: "ML" },
  { key: "c2_isolation_outlier", label: "Isolation Outlier Score", weight: "15%", short: "Outlier" },
  { key: "c3_cost_overrun_penalty", label: "Cost Overrun Penalty", weight: "20%", short: "Cost" },
  { key: "c4_spatial_duplication_penalty", label: "Spatial Duplication", weight: "10%", short: "Spatial" },
  { key: "c5_evidence_deficit_penalty", label: "Evidence Deficit", weight: "15%", short: "Evidence" },
  { key: "c6_statutory_delay_penalty", label: "Statutory Delay", weight: "10%", short: "Delay" },
];

export const MODEL_PLOTS = [
  { file: "plot_correlation_heatmap.png", title: "Feature Correlation Heatmap", desc: "Pearson correlations among all 17 continuous features" },
  { file: "plot_state_risk_heatmap.png", title: "State Risk Heatmap", desc: "Anomaly archetype concentration per state" },
  { file: "plot_feature_temperature.png", title: "Feature Temperature Grid", desc: "Feature intensity driving each anomaly archetype" },
  { file: "plot_cost_vs_delay_scatter.png", title: "Cost vs Delay Scatter", desc: "15,000 works mapped by delay vs cost overrun" },
  { file: "plot_risk_fusion.png", title: "Risk Fusion Analysis", desc: "4-panel composite risk score analysis" },
  { file: "plot_binary_roc_pr.png", title: "ROC & PR Curves", desc: "Binary classifier ROC-AUC = 0.9998" },
  { file: "plot_multiclass_confusion.png", title: "Multiclass Confusion Matrix", desc: "6×6 confusion matrix for anomaly archetypes" },
  { file: "plot_binary_feature_importance.png", title: "Binary Feature Importance", desc: "Gain-based ranking for Model 1" },
  { file: "plot_multiclass_feature_importance.png", title: "Multiclass Feature Importance", desc: "Gain-based importance for Model 2" },
  { file: "plot_isolation_forest.png", title: "Isolation Forest Analysis", desc: "Score distributions: Clean vs Anomalous" },
  { file: "plot_model_comparison.png", title: "Model Comparison", desc: "Metric benchmarks across all models" },
  { file: "plot_anomaly_distribution.png", title: "Anomaly Distribution", desc: "Breakdown of 6 anomaly archetypes" },
  { file: "plot_state_distribution.png", title: "State Distribution", desc: "Clean vs Anomalous across top 20 states" },
  { file: "plot_risk_tiers.png", title: "Risk Tier Analysis", desc: "MP-level risk tier distribution" },
  { file: "plot_cost_analysis.png", title: "Cost Analysis", desc: "Sectoral expenditure distribution" },
  { file: "plot_work_categories.png", title: "Work Categories", desc: "Volume across 8 development sectors" },
];
