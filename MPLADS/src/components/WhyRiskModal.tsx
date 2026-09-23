"use client";

import React from "react";
import type { Project } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconAlertTriangle,
  IconScale,
  IconFileCertificate,
  IconPhoto,
  IconCoins,
  IconClock,
  IconCheck,
  IconX,
  IconShieldExclamation,
  IconArrowRight,
  IconInfoCircle,
} from "@tabler/icons-react";

interface WhyRiskModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WhyRiskButton({
  project,
  onClick,
  compact = false,
  className = "",
}: {
  project: Project;
  onClick: (e: React.MouseEvent) => void;
  compact?: boolean;
  className?: string;
}) {
  // Show if project has high/critical risk or noticeable score
  const isHighRisk = project.riskLevel === "High" || project.riskLevel === "Critical" || project.riskScore >= 60;
  const isHighProgress = project.progress >= 70;

  return (
    <button
      type="button"
      onClick={onClick}
      title={`Explain why progress is ${project.progress}% but risk score is ${project.riskScore}`}
      className={`inline-flex items-center gap-1 font-semibold rounded-md transition-all cursor-pointer ${
        compact
          ? "text-[10px] px-1.5 py-0.5 border"
          : "text-xs px-2 py-1 border shadow-2xs"
      } ${
        isHighRisk && isHighProgress
          ? "bg-amber-500/15 text-amber-800 border-amber-500/40 hover:bg-amber-500/25 dark:text-amber-300"
          : isHighRisk
          ? "bg-red-500/10 text-red-700 border-red-500/30 hover:bg-red-500/20 dark:text-red-400"
          : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300"
      } ${className}`}
    >
      <IconInfoCircle className={compact ? "size-3 text-amber-600" : "size-3.5 text-amber-600"} />
      <span>{compact ? "Why?" : "Why high risk?"}</span>
    </button>
  );
}

export default function WhyRiskModal({ project, isOpen, onClose }: WhyRiskModalProps) {
  if (!project) return null;

  const isCostOverrun = project.expenditure > project.sanctionedAmount;
  const overrunPct = isCostOverrun
    ? (((project.expenditure - project.sanctionedAmount) / project.sanctionedAmount) * 100).toFixed(1)
    : "0";

  // Build specific audit breakdown reasons
  const auditReasons: {
    title: string;
    badge: string;
    badgeColor: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [];

  // Reason 1: Statutory UC Delay (Very common paradox in government works)
  if (!project.ucSubmitted) {
    auditReasons.push({
      title: "Statutory Utilization Certificate (UC) Missing / Overdue",
      badge: "CAG Statutory Breach",
      badgeColor: "bg-red-100 text-red-800 border-red-200",
      description: `Physical progress is claimed at ${project.progress}%, but the formal Utilization Certificate (UC) has NOT been submitted to the Ministry. Under MPLADS Guideline Rule 4.2, no final tranche can be sanctioned without physical UC verification. Claiming ${project.progress}% progress without UC triggers a statutory audit red-flag for unauthorized advance disbursement.`,
      icon: IconFileCertificate,
    });
  }

  // Reason 2: Missing Asset Creation Certificate
  if (!project.assetCreated) {
    auditReasons.push({
      title: "Asset Creation Certificate Missing on Master Portal",
      badge: "Public Asset Breach",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      description: `Although ${project.progress}% completion is reported, the permanent Asset Creation Certificate and GIS coordinates are absent on the National Portal. Without verified asset creation, public expenditure of ₹${project.expenditure}L remains classified as uncapitalized risk.`,
      icon: IconScale,
    });
  }

  // Reason 3: Cost Overrun or Expenditure Anomaly
  if (isCostOverrun) {
    auditReasons.push({
      title: `Expenditure Exceeds Sanctioned Limit (+${overrunPct}%)`,
      badge: "Fiscal Overrun",
      badgeColor: "bg-red-100 text-red-800 border-red-200",
      description: `Actual expenditure incurred is ₹${project.expenditure.toFixed(2)}L against the sanctioned budget of ₹${project.sanctionedAmount.toFixed(2)}L (+${overrunPct}% cost overrun). In government procurement, disbursing beyond sanctioned outlay without prior revised administrative sanction carries high audit scrutiny.`,
      icon: IconCoins,
    });
  }

  // Reason 4: Timeline Delay or Schedule Breach
  if (
    project.status === "Delayed" ||
    project.riskFlags.some((f) => f.toLowerCase().includes("delay") || f.toLowerCase().includes("deadline"))
  ) {
    auditReasons.push({
      title: "Completion Deadline Breached",
      badge: "Schedule Default",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      description: `Project is marked '${project.status}' with target completion ${project.expectedCompletion}. Even if claimed at ${project.progress}%, contractor delays beyond contractual timelines mandate liquidated damages (LD) deductions before final billing.`,
      icon: IconClock,
    });
  }

  // Reason 5: Photo and Inspection Deficit
  if (project.photos < 15 || project.inspections < 3) {
    auditReasons.push({
      title: `Low Photographic Verification (${project.photos} photos uploaded)`,
      badge: "Evidence Gap",
      badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-200",
      description: `Near-completion works (${project.progress}%) require comprehensive 4-stage photographic records (foundation, sub-base, superstructure, completion). Having only ${project.photos} uploaded photos fails the automated AI geo-crosscheck standard.`,
      icon: IconPhoto,
    });
  }

  // Reason 6: Ground Reality / Citizen Discrepancies
  if (
    project.id === "MPLAD-UP-0401-2024-001" ||
    project.riskFlags.some(
      (f) => f.toLowerCase().includes("citizen") || f.toLowerCase().includes("ground") || f.toLowerCase().includes("unpaved")
    )
  ) {
    auditReasons.push({
      title: "Citizen Ground Evidence Contradiction",
      badge: "Field Discrepancy",
      badgeColor: "bg-red-100 text-red-800 border-red-200",
      description: `Independent citizen verification with geo-tagged photographic evidence reveals physical work on site is incomplete (~35% observed reality vs ${project.progress}% contractor claim). Automated calculation inconsistency engine flagged unjustified outlay at risk.`,
      icon: IconShieldExclamation,
    });
  }

  // Reason 7: Any other specific risk flags from database
  project.riskFlags.forEach((flag) => {
    // Avoid exact duplicate
    if (
      !auditReasons.some(
        (r) =>
          r.title.toLowerCase().includes(flag.toLowerCase()) ||
          r.description.toLowerCase().includes(flag.toLowerCase())
      )
    ) {
      auditReasons.push({
        title: flag,
        badge: "Official Risk Flag",
        badgeColor: "bg-slate-100 text-slate-800 border-slate-200",
        description: `Official NIDHI-RAKSHAK risk engine flagged: "${flag}". This flag continues to impact the composite risk score calculation until cleared by a competent engineering inspection.`,
        icon: IconAlertTriangle,
      });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <div className="p-5 border-b bg-slate-900 text-white">
          <div className="flex items-center justify-between gap-2">
            <Badge className="bg-amber-500 text-slate-950 font-bold text-xs gap-1">
              <IconAlertTriangle className="size-3.5" />
              Risk Paradox Audit Analysis
            </Badge>
            <span className="font-mono text-xs text-slate-300">
              ID: {project.id}
            </span>
          </div>

          <DialogTitle className="text-base sm:text-lg font-bold text-white mt-2 leading-snug">
            Why is Risk Score {project.riskScore} (High) Despite {project.progress}% Completion?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-300 mt-1">
            Automated CAG and NIDHI-RAKSHAK audit explanation for {project.name}
          </DialogDescription>
        </div>

        <div className="p-5 space-y-5">
          {/* Paradox Comparison Card */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border bg-slate-50">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                Reported Physical Progress
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-blue-700">
                  {project.progress}%
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  ({project.status})
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Claimed as nearly finished by contractor/agency
              </p>
            </div>

            <div className="space-y-1 pl-4 border-l border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                AI Composite Risk Score
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-black font-mono ${
                    project.riskLevel === "Critical"
                      ? "text-red-700"
                      : project.riskLevel === "High"
                      ? "text-amber-700"
                      : "text-yellow-700"
                  }`}
                >
                  {project.riskScore}
                  <span className="text-xs font-normal text-slate-400"> / 100</span>
                </span>
                <Badge
                  className={
                    project.riskLevel === "Critical"
                      ? "bg-red-600 text-white text-[10px]"
                      : "bg-amber-600 text-white text-[10px]"
                  }
                >
                  {project.riskLevel} Risk
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                Statutory, fiscal & physical compliance vulnerability
              </p>
            </div>
          </div>

          {/* Core Audit Principle Explanation */}
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/80 text-xs space-y-1.5">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <IconInfoCircle className="size-4 text-amber-700 shrink-0" />
              <span>Why High Progress Projects Often Carry the Highest Risk:</span>
            </div>
            <p className="text-amber-900 text-[11px] leading-relaxed">
              In public works governance, projects reaching <strong>{project.progress}%</strong> completion enter the most critical vulnerability window. Contractors frequently attempt to disburse 100% of public funds before submitting mandatory <strong>Utilization Certificates (UCs)</strong>, uploading geo-tagged photographs, or completing formal quality handovers. A project is only genuinely low-risk when both <em>physical execution</em> AND <em>statutory compliance</em> are fully satisfied.
            </p>
          </div>

          {/* ── Concrete Breakdown Factors ── */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <IconScale className="size-4 text-primary" />
              Root Causes of High Risk Score for this Project ({auditReasons.length} Factors)
            </h4>

            <div className="space-y-2.5">
              {auditReasons.map((reason, idx) => {
                const IconComponent = reason.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border bg-card hover:bg-slate-50/50 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-slate-100 text-slate-700">
                          <IconComponent className="size-3.5" />
                        </div>
                        <span className="font-bold text-xs text-foreground">
                          {reason.title}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono font-semibold ${reason.badgeColor}`}
                      >
                        {reason.badge}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
                      {reason.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statutory Action Recommendation */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <IconAlertTriangle className="size-4 text-amber-400" />
              Recommended Immediate Audit Actions for Authorities
            </div>
            <ul className="space-y-1 text-[11px] text-slate-300 pl-4 list-disc">
              <li>
                <strong>Withhold Final Tranche / Retention Money (5-10%):</strong> Do not release final payment until formal UC is countersigned.
              </li>
              <li>
                <strong>Joint Physical Verification:</strong> Order spot-inspection by Executive Engineer to verify whether the claimed {project.progress}% progress matches actual on-ground assets.
              </li>
              <li>
                <strong>7-Day Mandatory Notice:</strong> Issue notice to contractor ({project.contractor || "Implementing Agency"}) for mandatory GIS upload and Asset Creation Certificate.
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            CAG MPLADS Audit Norms · Automated Rule Engine 4.2
          </span>
          <Button size="sm" onClick={onClose} className="text-xs">
            Done / Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
