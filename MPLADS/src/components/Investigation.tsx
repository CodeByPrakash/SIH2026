"use client";

import { useState, useMemo } from "react";
import { RISK_FLAGS, PROJECTS } from "../data/mpladsData";
import type { RiskFlag } from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  IconSearch,
  IconFolderCheck,
  IconGavel,
  IconFileText,
  IconMapPinCheck,
  IconReportAnalytics,
  IconBrain,
  IconShieldExclamation,
  IconCheck,
  IconClock,
  IconPaperclip,
  IconDownload,
  IconSend,
  IconCalendarEvent,
  IconUserCheck,
  IconChevronRight,
  IconSparkles,
  IconFileTypePdf,
  IconPrinter,
  IconAlertTriangle,
} from "@tabler/icons-react";

const SEVERITY_BADGES: Record<
  string,
  {
    variant: "destructive" | "default" | "secondary" | "outline";
    color: string;
    bg: string;
    scoreClass: string;
  }
> = {
  Critical: {
    variant: "destructive",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    scoreClass: "text-red-600 dark:text-red-400",
  },
  High: {
    variant: "default",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
    scoreClass: "text-orange-600 dark:text-orange-400",
  },
  Medium: {
    variant: "secondary",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    scoreClass: "text-amber-600 dark:text-amber-400",
  },
  Low: {
    variant: "outline",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    scoreClass: "text-emerald-600 dark:text-emerald-400",
  },
};

export default function Investigation() {
  const [selectedId, setSelectedId] = useState<string>(RISK_FLAGS[0].id);
  const [stage, setStage] = useState<"review" | "field" | "report">("review");
  const [searchTerm, setSearchTerm] = useState("");
  const [fieldChecks, setFieldChecks] = useState<Record<number, string>>({
    0: "pending",
    1: "pending",
    2: "in-progress",
    3: "pending",
    4: "pending",
    5: "pending",
  });

  const selected = useMemo(
    () => RISK_FLAGS.find((f) => f.id === selectedId) || RISK_FLAGS[0],
    [selectedId]
  );

  const filteredFlags = useMemo(() => {
    if (!searchTerm.trim()) return RISK_FLAGS;
    return RISK_FLAGS.filter(
      (f) =>
        f.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const openCasesCount = RISK_FLAGS.filter((f) => f.status === "Open").length;

  const toggleCheck = (idx: number) => {
    setFieldChecks((prev) => {
      const current = prev[idx];
      const next =
        current === "done"
          ? "pending"
          : current === "in-progress"
          ? "done"
          : "in-progress";
      return { ...prev, [idx]: next };
    });
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 animate-in fade-in-50 duration-200">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconGavel className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                Investigation Center
              </h1>
              <p className="text-xs text-muted-foreground md:text-sm">
                Deep-dive anomaly investigation · Field verification telemetry · Audit dossier generation
              </p>
            </div>
          </div>
        </div>

        {/* Status Tag & Print Actions */}
        <div className="flex items-center gap-2">
          <Badge
            variant="destructive"
            className="px-3 py-1 text-xs font-semibold gap-1.5"
          >
            <span className="size-2 rounded-full bg-white animate-pulse" />
            {openCasesCount} Open Vigilance Cases
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium"
            onClick={handlePrint}
          >
            <IconPrinter className="size-3.5" />
            Print Dossier
          </Button>
        </div>
      </div>

      {/* ── Main 2-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column: Active Cases Master List (4 cols) ── */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IconFolderCheck className="size-4" />
              Active Vigilance Cases
            </h2>
            <span className="text-[11px] font-mono text-muted-foreground">
              {filteredFlags.length} of {RISK_FLAGS.length}
            </span>
          </div>

          {/* Search Filter */}
          <div className="relative">
            <IconSearch className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search case, project, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-background border text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Cases List */}
          <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredFlags.map((flag) => {
              const isSelected = selected.id === flag.id;
              const cfg = SEVERITY_BADGES[flag.severity] || SEVERITY_BADGES.Medium;
              return (
                <div
                  key={flag.id}
                  onClick={() => setSelectedId(flag.id)}
                  className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                      : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                  }`}
                >
                  {/* Active Indicator Strip */}
                  {isSelected && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-md" />
                  )}

                  <div className="space-y-1.5">
                    {/* Tags row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={cfg.variant}
                          className="text-[9px] uppercase font-bold px-1.5 py-0 h-4"
                        >
                          {flag.severity}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[9px] font-mono px-1 py-0 h-4"
                        >
                          {flag.id}
                        </Badge>
                      </div>
                      <span className={`font-mono text-xs font-bold ${cfg.scoreClass}`}>
                        {flag.riskScore}/100
                      </span>
                    </div>

                    {/* Project Title */}
                    <h3 className={`text-xs font-semibold leading-snug line-clamp-2 ${
                      isSelected ? "text-primary" : "text-foreground group-hover:text-primary transition-colors"
                    }`}>
                      {flag.projectName}
                    </h3>

                    {/* Type & Status */}
                    <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground">
                      <span className="truncate max-w-[180px]">{flag.type}</span>
                      <Badge
                        variant={
                          flag.status === "Open"
                            ? "destructive"
                            : flag.status === "Under Review"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[9px] px-1.5 py-0 h-4 font-semibold"
                      >
                        {flag.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Column: Investigation Workspace (8 cols) ── */}
        <div className="lg:col-span-8 space-y-4">
          {/* Stage Switcher Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-muted/50 p-1.5 border w-fit max-w-full">
            <button
              onClick={() => setStage("review")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                stage === "review"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconFileText className="size-4 text-blue-500" />
              Document & AI Review
            </button>
            <button
              onClick={() => setStage("field")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                stage === "field"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconMapPinCheck className="size-4 text-emerald-500" />
              Field Verification
            </button>
            <button
              onClick={() => setStage("report")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                stage === "report"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <IconReportAnalytics className="size-4 text-violet-500" />
              Formal Dossier & Report
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════════ */}
          {/* STAGE 1: DOCUMENT & AI REVIEW                                             */}
          {/* ══════════════════════════════════════════════════════════════════════════ */}
          {stage === "review" && (
            <div className="space-y-4">
              <Card className="shadow-xs overflow-hidden">
                <CardHeader className="p-5 border-b bg-muted/20">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            SEVERITY_BADGES[selected.severity]?.variant || "default"
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {selected.severity} Risk
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {selected.id}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Detected on {selected.detectedOn}
                        </span>
                      </div>
                      <CardTitle className="text-base font-bold text-foreground">
                        {selected.projectName}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {selected.type} · Anomaly Rating Index:{" "}
                        <strong className="text-red-600 font-mono">
                          {selected.riskScore}/100
                        </strong>
                      </CardDescription>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium gap-1.5 shrink-0"
                      onClick={() => setStage("field")}
                    >
                      <span>Proceed to Field Audit</span>
                      <IconChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-5">
                  {/* AI Risk Summary Card */}
                  <div className="rounded-xl p-4 bg-red-500/5 border border-red-500/20 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold uppercase tracking-wider text-[10px]">
                      <IconBrain className="size-4 text-red-600" />
                      AI Anomaly Summary & Synthesis
                    </div>
                    <p className="text-foreground leading-relaxed font-medium">
                      {selected.description}
                    </p>
                  </div>

                  {/* Risk Factors Breakdown */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <IconAlertTriangle className="size-3.5 text-amber-500" />
                      Specific Risk Factors Identified ({selected.reasons.length})
                    </h3>
                    <div className="space-y-2">
                      {selected.reasons.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border text-xs"
                        >
                          <span className="size-5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="text-foreground font-medium leading-relaxed">
                            {r}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evidence & Telemetry Documents */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <IconPaperclip className="size-3.5 text-primary" />
                      Evidence Documents & Telemetry Records
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selected.evidence.map((e, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-muted/30 transition-all text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <IconFileText className="size-4 text-primary shrink-0" />
                            <span className="font-mono text-[11px] text-foreground truncate">
                              {e}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                            title="Download Record"
                            onClick={() => alert(`Downloading evidence: ${e}`)}
                          >
                            <IconDownload className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Peer Comparison */}
                  <div className="rounded-xl p-4 bg-blue-500/5 border border-blue-500/20 text-xs space-y-1">
                    <div className="text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider text-[10px]">
                      Adaptive Peer Comparison Benchmark
                    </div>
                    <p className="text-blue-900/90 dark:text-blue-200/90 leading-relaxed font-normal">
                      {selected.peerComparison}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════════ */}
          {/* STAGE 2: FIELD VERIFICATION                                               */}
          {/* ══════════════════════════════════════════════════════════════════════════ */}
          {stage === "field" && (
            <div className="space-y-4">
              <Card className="shadow-xs">
                <CardHeader className="p-5 border-b bg-muted/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">
                        Field Verification Protocol & Checklist
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Ground truth verification protocols for {selected.projectName}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono w-fit">
                      TPI Protocol: NR-TPI-88
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-5">
                  {/* Checklist items */}
                  <div className="space-y-2.5">
                    {[
                      { item: "Physical site inspection by empanelled Third-Party Inspection (TPI) agency", tag: "Physical" },
                      { item: "GPS-tagged high-resolution photo evidence collection (minimum 20 geotagged coordinates)", tag: "Geotag" },
                      { item: "Contractor debarment & credential verification with State CPWD/PWD registry", tag: "Vendor" },
                      { item: "Civil measurement & structural load test of completed works", tag: "Technical" },
                      { item: "UC & final expenditure bill reconciliation with implementing agency", tag: "Financial" },
                      { item: "Beneficiary interviews with Gram Panchayat Sarpanch and local residents", tag: "Social Audit" },
                    ].map((step, idx) => {
                      const st = fieldChecks[idx] || "pending";
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleCheck(idx)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            st === "done"
                              ? "bg-emerald-500/5 border-emerald-500/30"
                              : st === "in-progress"
                              ? "bg-amber-500/5 border-amber-500/30"
                              : "bg-card hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <div
                              className={`size-5 rounded-md border flex items-center justify-center shrink-0 ${
                                st === "done"
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : st === "in-progress"
                                  ? "bg-amber-500 border-amber-500 text-white"
                                  : "border-muted-foreground/40 bg-background"
                              }`}
                            >
                              {st === "done" && <IconCheck className="size-3.5 stroke-[3]" />}
                              {st === "in-progress" && <IconClock className="size-3 stroke-[3]" />}
                            </div>
                            <span
                              className={`text-xs ${
                                st === "done"
                                  ? "line-through text-muted-foreground font-medium"
                                  : "text-foreground font-medium"
                              }`}
                            >
                              {step.item}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                              {step.tag}
                            </Badge>
                            <Badge
                              variant={
                                st === "done"
                                  ? "default"
                                  : st === "in-progress"
                                  ? "secondary"
                                  : "outline"
                              }
                              className={`text-[10px] px-2 py-0 h-5 font-semibold ${
                                st === "done"
                                  ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                                  : st === "in-progress"
                                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {st === "done"
                                ? "Verified"
                                : st === "in-progress"
                                ? "In Progress"
                                : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recommended Verification Directives */}
                  <div className="rounded-xl p-4 bg-amber-500/5 border border-amber-500/20 space-y-2">
                    <div className="text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <IconAlertTriangle className="size-3.5" />
                      Recommended AI Verification Directives
                    </div>
                    <div className="space-y-1.5">
                      {selected.recommendation
                        .split(/\d+\.\s/)
                        .filter(Boolean)
                        .map((step, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 text-xs text-amber-900/90 dark:text-amber-200/90 font-medium"
                          >
                            <span className="font-bold font-mono text-[11px] text-amber-700 dark:text-amber-300">
                              {i + 1}.
                            </span>
                            <span>{step.trim()}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap gap-2.5 pt-2 border-t">
                    <Button
                      className="h-8 text-xs font-semibold gap-1.5"
                      onClick={() => alert("Assigned to Empanelled Field Agency (WAPCOS Ltd.)")}
                    >
                      <IconUserCheck className="size-4" />
                      Assign Field Agency
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 text-xs font-semibold gap-1.5"
                      onClick={() => alert("Scheduled Drone site survey for next Monday.")}
                    >
                      <IconCalendarEvent className="size-4 text-primary" />
                      Schedule Site Visit
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 text-xs font-semibold gap-1.5 ml-auto"
                      onClick={() => setStage("report")}
                    >
                      <span>Draft Investigation Report</span>
                      <IconChevronRight className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════════ */}
          {/* STAGE 3: FORMAL INVESTIGATION REPORT                                      */}
          {/* ══════════════════════════════════════════════════════════════════════════ */}
          {stage === "report" && (
            <div className="space-y-4">
              <Card className="shadow-xs">
                <CardHeader className="p-5 border-b bg-muted/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">
                        Vigilance Investigation Report Draft
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Official administrative report ready for submission to District Magistrate & MoSPI
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-medium gap-1.5"
                        onClick={() => alert("Exporting official PDF Report...")}
                      >
                        <IconFileTypePdf className="size-4 text-red-500" />
                        Export PDF
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 text-xs font-semibold gap-1.5 shadow-xs"
                        onClick={() => alert("Investigation dossier submitted to State Vigilance Committee.")}
                      >
                        <IconSend className="size-4" />
                        Submit Report
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-5">
                  {/* Case Metadata Grid */}
                  <div className="rounded-xl p-4 bg-muted/30 border text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Case Identifier</span>
                        <span className="font-mono font-bold text-foreground">{selected.id}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Project Code</span>
                        <span className="font-mono font-bold text-foreground">{selected.projectId}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Assigned Severity</span>
                        <Badge
                          variant={SEVERITY_BADGES[selected.severity]?.variant || "default"}
                          className="text-[10px] uppercase font-bold px-1.5 py-0 mt-0.5"
                        >
                          {selected.severity}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Risk Anomaly Score</span>
                        <span className="font-mono font-bold text-red-600 text-sm">
                          {selected.riskScore}/100
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Detection Telemetry</span>
                        <span className="font-semibold text-foreground">{selected.detectedOn}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Report Generation Date</span>
                        <span className="font-semibold text-foreground">16 Sep 2024</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Executive Findings */}
                  <div className="space-y-1.5 text-xs">
                    <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                      1. Executive Summary & Anomaly Findings
                    </h4>
                    <p className="text-muted-foreground leading-relaxed p-3 rounded-lg bg-card border">
                      {selected.description}
                    </p>
                  </div>

                  {/* Section 2: Peer Comparison Analysis */}
                  <div className="space-y-1.5 text-xs">
                    <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                      2. Regional Peer Unit-Cost Benchmark
                    </h4>
                    <p className="text-muted-foreground leading-relaxed p-3 rounded-lg bg-card border">
                      {selected.peerComparison}
                    </p>
                  </div>

                  {/* Section 3: Recommendations */}
                  <div className="space-y-1.5 text-xs">
                    <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                      3. Statutory Directives & Enforcement Recommendation
                    </h4>
                    <p className="text-muted-foreground leading-relaxed p-3 rounded-lg bg-card border">
                      {selected.recommendation}
                    </p>
                  </div>

                  {/* Bottom Escalation Action Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t">
                    <Button
                      variant="destructive"
                      className="flex-1 h-9 text-xs font-semibold gap-1.5"
                      onClick={() => alert("Escalated to Director General (MoSPI) for administrative inquiry.")}
                    >
                      <IconShieldExclamation className="size-4" />
                      Escalate to Director General
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-9 text-xs font-semibold gap-1.5 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                      onClick={() => alert("Show-Cause Notice issued to State Implementing Agency.")}
                    >
                      <IconSend className="size-4" />
                      Issue State Show-Cause Notice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
