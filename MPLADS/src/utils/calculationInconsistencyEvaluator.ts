import type { Project, ICitizenEvidence, CalculationInconsistencyEvaluation } from "@/types";

export function evaluateCalculationInconsistency(
  evidence: Partial<ICitizenEvidence>,
  project?: Project | null
): CalculationInconsistencyEvaluation {
  // Fallbacks if project data is not explicitly provided
  const claimedProgress = project?.progress ?? (evidence.category === "Completion Discrepancy" ? 100 : 75);
  const sanctionedAmount = project?.sanctionedAmount ?? 48.5;
  const expenditure = project?.expenditure ?? 51.2;
  const ucSubmitted = project?.ucSubmitted ?? false;
  const category = (project?.category || evidence.category || "General").toLowerCase();

  const desc = (evidence.description || "").toLowerCase();
  const verCat = evidence.verificationCategory || "POTENTIAL_CONFLICT";

  // 1. Calculate Ground Observed Physical Progress %
  let calculatedObservedProgress = claimedProgress;

  if (verCat === "CONFLICT_DETECTED") {
    if (desc.includes("unpaved") || desc.includes("not exist") || desc.includes("no work") || desc.includes("halted")) {
      calculatedObservedProgress = Math.min(35, Math.round(claimedProgress * 0.35));
    } else if (desc.includes("incomplete") || desc.includes("broken") || desc.includes("cracks")) {
      calculatedObservedProgress = Math.min(45, Math.round(claimedProgress * 0.45));
    } else {
      calculatedObservedProgress = Math.min(40, Math.round(claimedProgress * 0.4));
    }
  } else if (verCat === "POTENTIAL_CONFLICT") {
    if (desc.includes("motor") || desc.includes("equipment") || desc.includes("uninstalled") || desc.includes("wiring")) {
      calculatedObservedProgress = Math.max(30, claimedProgress - 22);
    } else if (desc.includes("defect") || desc.includes("leakage") || desc.includes("delay")) {
      calculatedObservedProgress = Math.max(35, claimedProgress - 18);
    } else {
      calculatedObservedProgress = Math.max(40, claimedProgress - 15);
    }
  } else if (verCat === "CONSISTENT") {
    calculatedObservedProgress = claimedProgress;
  } else {
    // Insufficient evidence
    calculatedObservedProgress = Math.max(0, claimedProgress - 10);
  }

  calculatedObservedProgress = Math.max(0, Math.min(100, Math.round(calculatedObservedProgress)));
  const progressDeficit = Math.max(0, claimedProgress - calculatedObservedProgress);

  // 2. Financial Discrepancy Calculations
  const justifiedExpenditure = Number(((sanctionedAmount * calculatedObservedProgress) / 100).toFixed(2));
  const unjustifiedAtRisk = Number(Math.max(0, expenditure - justifiedExpenditure).toFixed(2));

  // 3. Unit Cost & Rate Calculations
  let sanctionedUnitCost: string | undefined;
  let effectiveObservedUnitCost: string | undefined;
  let unitCostVariancePct: number | undefined;

  if (category.includes("road")) {
    const sanctionedKm = 2.5; // Benchmark 2.5 km
    const sRate = sanctionedAmount / sanctionedKm;
    const deliveredKm = Math.max(0.3, Number(((sanctionedKm * calculatedObservedProgress) / 100).toFixed(2)));
    const eRate = expenditure / deliveredKm;
    sanctionedUnitCost = `₹${sRate.toFixed(2)} Lakhs/km`;
    effectiveObservedUnitCost = `₹${eRate.toFixed(2)} Lakhs/km`;
    unitCostVariancePct = Number((((eRate - sRate) / sRate) * 100).toFixed(1));
  } else if (category.includes("light") || category.includes("solar") || category.includes("energy")) {
    const units = 25; // 25 fixtures
    const sRate = (sanctionedAmount * 100000) / units;
    const activeUnits = Math.max(1, Math.round((units * calculatedObservedProgress) / 100));
    const eRate = (expenditure * 100000) / activeUnits;
    sanctionedUnitCost = `₹${Math.round(sRate).toLocaleString("en-IN")}/pole`;
    effectiveObservedUnitCost = `₹${Math.round(eRate).toLocaleString("en-IN")}/pole`;
    unitCostVariancePct = Number((((eRate - sRate) / sRate) * 100).toFixed(1));
  } else if (category.includes("water") || category.includes("health") || category.includes("education")) {
    const sRate = sanctionedAmount;
    const effectiveRealized = (sanctionedAmount * calculatedObservedProgress) / 100;
    const infl = effectiveRealized > 0 ? ((expenditure - effectiveRealized) / effectiveRealized) * 100 : 0;
    sanctionedUnitCost = `₹${sRate.toFixed(2)} L (Planned Cost)`;
    effectiveObservedUnitCost = `₹${expenditure.toFixed(2)} L (Actual Billed)`;
    unitCostVariancePct = Number(infl.toFixed(1));
  }

  // 4. Milestone & Statutory UC Verification
  let ucClaimStatus = "Milestone Verified";
  let statutoryViolation = false;

  if (ucSubmitted && calculatedObservedProgress < 75) {
    statutoryViolation = true;
    ucClaimStatus = `Statutory Breach: 100% UC Claimed while ground execution evaluated at only ${calculatedObservedProgress}% (<75% statutory threshold)`;
  } else if (ucSubmitted) {
    ucClaimStatus = "Statutory Compliance Met: UC backed by ground execution (≥75%)";
  } else {
    ucClaimStatus = `Interim Stage: UC Not Yet Due (Ground execution at ${calculatedObservedProgress}%)`;
  }

  // 5. Inconsistency Score & Classification
  // Inconsistency score = 0.5 * progressDeficit + 0.35 * (unjustifiedAtRisk / sanctioned * 100) + 0.15 * (statutoryViolation ? 100 : 0)
  const financialRiskRatio = Math.min(100, (unjustifiedAtRisk / (sanctionedAmount || 1)) * 100);
  const rawScore = progressDeficit * 0.5 + financialRiskRatio * 0.35 + (statutoryViolation ? 15 : 0);
  const inconsistencyScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  let inconsistencyLevel: "Low" | "Moderate" | "High" | "Critical" = "Low";
  if (inconsistencyScore >= 70) inconsistencyLevel = "Critical";
  else if (inconsistencyScore >= 45) inconsistencyLevel = "High";
  else if (inconsistencyScore >= 20) inconsistencyLevel = "Moderate";

  const hasCalculationInconsistency = progressDeficit > 10 || unjustifiedAtRisk > 2.0;

  // 6. Mathematical Evaluation Narrative & Recommendations
  const discrepancyFormula = `Unjustified Outlay = Disbursed (₹${expenditure}L) - [Sanctioned (₹${sanctionedAmount}L) × Observed Progress (${calculatedObservedProgress}%) / 100] = ₹${unjustifiedAtRisk}L`;

  const evaluationSummary = hasCalculationInconsistency
    ? `Mathematical cross-check reveals a -${progressDeficit}% physical execution deficit against the official claimed ${claimedProgress}% progress. ₹${unjustifiedAtRisk} Lakhs of public funds have been disbursed without on-ground asset verification.${unitCostVariancePct && unitCostVariancePct > 10 ? ` Unit execution cost shows an inflationary rate variance of +${unitCostVariancePct}%.` : ""}`
    : `Mathematical evaluation confirms that ground measurements align with recorded disbursements. Progress deficit is negligible (${progressDeficit}%), and disbursed funds are justified by on-site asset creation.`;

  const auditRecommendations: string[] = [];
  if (statutoryViolation) {
    auditRecommendations.push("Freeze further tranche disbursements under Section 4 MPLADS guidelines due to premature UC filing.");
  }
  if (unjustifiedAtRisk > 10) {
    auditRecommendations.push(`Issue demand notice for financial reconciliation of ₹${unjustifiedAtRisk} Lakhs unverified outlay.`);
  }
  if (unitCostVariancePct && unitCostVariancePct > 50) {
    auditRecommendations.push(`Order third-party measurement book (M-Book) re-survey for unit rate escalation (+${unitCostVariancePct}%).`);
  }
  if (auditRecommendations.length === 0) {
    auditRecommendations.push("Record mathematical evaluation in project dossier; proceed with routine milestone audit.");
  }

  return {
    inconsistencyScore,
    inconsistencyLevel,
    hasCalculationInconsistency,
    claimedProgressPct: claimedProgress,
    calculatedObservedProgressPct: calculatedObservedProgress,
    progressDeficitPct: progressDeficit,
    disbursedExpenditureLakh: expenditure,
    justifiedExpenditureLakh: justifiedExpenditure,
    unjustifiedAtRiskLakh: unjustifiedAtRisk,
    sanctionedUnitCost,
    effectiveObservedUnitCost,
    unitCostVariancePct,
    ucClaimStatus,
    statutoryViolation,
    evaluationSummary,
    discrepancyFormula,
    auditRecommendations,
  };
}
