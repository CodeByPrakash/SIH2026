"use client";

import { useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
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
  IconBrain,
  IconShieldExclamation,
  IconAlertTriangle,
  IconFlame,
  IconChartBar,
  IconSparkles,
  IconFilter,
  IconX,
  IconPlayerPlay,
  IconDownload,
  IconAdjustments,
  IconArrowRight,
  IconFileText,
  IconSend,
  IconCheck,
  IconRadar,
  IconLayersLinked,
  IconChevronRight,
  IconTrendingUp,
} from "@tabler/icons-react";

const SEVERITY_CONFIG: Record<
  string,
  {
    color: string;
    bg: string;
    border: string;
    badge: string;
    dot: string;
    score: string;
    badgeVariant: "destructive" | "default" | "secondary" | "outline";
  }
> = {
  Critical: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    badge: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
    dot: "bg-red-500",
    score: "text-red-600 dark:text-red-400",
    badgeVariant: "destructive",
  },
  High: {
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    badge: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
    dot: "bg-orange-500",
    score: "text-orange-600 dark:text-orange-400",
    badgeVariant: "default",
  },
  Medium: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    dot: "bg-amber-500",
    score: "text-amber-600 dark:text-amber-400",
    badgeVariant: "secondary",
  },
  Low: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    dot: "bg-emerald-500",
    score: "text-emerald-600 dark:text-emerald-400",
    badgeVariant: "outline",
  },
};

const RISK_TYPE_DATA = [
  { type: "Cost Overrun", count: 124, pct: 32 },
  { type: "Delay Risk", count: 98, pct: 25 },
  { type: "Compliance Gap", count: 76, pct: 20 },
  { type: "Duplicate Works", count: 45, pct: 12 },
  { type: "Contractor Issue", count: 28, pct: 7 },
  { type: "Documentation", count: 15, pct: 4 },
];

function RiskDetailPanel({
  flag,
  onClose,
}: {
  flag: RiskFlag;
  onClose: () => void;
}) {
  const cfg = SEVERITY_CONFIG[flag.severity] || SEVERITY_CONFIG.Medium;
  const radarData = [
    { axis: "Cost Dev.", value: flag.riskScore > 70 ? 85 : 45 },
    { axis: "Timeline", value: flag.riskScore > 60 ? 78 : 35 },
    { axis: "Compliance", value: flag.riskScore > 50 ? 68 : 30 },
    { axis: "Contractor", value: flag.type.includes("Contractor") ? 92 : 35 },
    { axis: "Documentation", value: flag.riskScore > 40 ? 60 : 25 },
    { axis: "Inspection", value: flag.riskScore > 65 ? 75 : 40 },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-end z-50 animate-in fade-in-50 duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl lg:w-[45vw] lg:max-w-[45vw] h-full bg-background border-l shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel Header */}
        <div
          className={`sticky top-0 z-20 ${cfg.bg} border-b ${cfg.border} px-6 py-4 backdrop-blur-md flex items-start justify-between gap-4`}
        >
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant={cfg.badgeVariant} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0">
                {flag.severity} Risk
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 bg-background/50">
                {flag.id}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Score: <strong className={cfg.score}>{flag.riskScore}/100</strong>
              </span>
            </div>
            <h2 className="text-base font-bold text-foreground leading-snug">
              {flag.projectName}
            </h2>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <span>{flag.type}</span>
              <span>·</span>
              <span>Detected: {flag.detectedOn}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="size-8 p-0 rounded-full text-muted-foreground hover:text-foreground shrink-0"
          >
            <IconX className="size-4" />
          </Button>
        </div>

        {/* Panel Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* AI Risk Assessment Card */}
          <div className="rounded-2xl p-5 bg-slate-900 text-slate-100 dark:bg-slate-950 dark:border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                  <IconBrain className="size-4" />
                </div>
                <span className="text-sm font-semibold text-white">
                  AI Neural Risk Assessment
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-blue-400/30 text-blue-300">
                MPLADS-AI v2.4
              </Badge>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {flag.description}
            </p>
          </div>

          {/* Risk Radar & Score Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="shadow-xs bg-card">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <IconRadar className="size-3.5 text-primary" />
                  Risk Vector Radar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-[170px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis
                        dataKey="axis"
                        tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                      />
                      <Radar
                        dataKey="value"
                        stroke="#EF4444"
                        fill="#EF4444"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 flex flex-col justify-between">
              <Card className="shadow-xs bg-card p-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Anomaly Severity Index
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`font-mono text-3xl font-extrabold ${cfg.score}`}>
                    {flag.riskScore}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 100 max</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500"
                    style={{ width: `${flag.riskScore}%` }}
                  />
                </div>
              </Card>

              <Card className="shadow-xs bg-card p-4 space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current Case Status
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      flag.status === "Open"
                        ? "destructive"
                        : flag.status === "Under Review"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs px-2.5 py-0.5 font-semibold"
                  >
                    {flag.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Assigned to District Nodal Officer
                  </span>
                </div>
              </Card>
            </div>
          </div>

          {/* Risk Factors Identified */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Badge variant="destructive" className="size-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                {flag.reasons.length}
              </Badge>
              Risk Factors & Non-Compliance Rules
            </h3>
            <div className="space-y-2">
              {flag.reasons.map((r, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-xs"
                >
                  <span className="flex-shrink-0 size-5 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-[10px] flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-foreground leading-relaxed font-medium">
                    {r}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Data Points */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IconFileText className="size-4 text-primary" />
              Evidence & Audit Telemetry
            </h3>
            <div className="space-y-2">
              {flag.evidence.map((e, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 border text-xs"
                >
                  <span className="text-muted-foreground font-mono text-[11px] shrink-0 mt-0.5">
                    #{i + 1}
                  </span>
                  <p className="text-foreground font-mono text-[11px] leading-relaxed">
                    {e}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Peer Comparison */}
          <Card className="border-blue-500/20 bg-blue-500/5 shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <IconLayersLinked className="size-4" />
                Adaptive Peer Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-blue-900/90 dark:text-blue-200/90 leading-relaxed">
                {flag.peerComparison}
              </p>
            </CardContent>
          </Card>

          {/* Recommended Action Directives */}
          <Card className="border-amber-500/20 bg-amber-500/5 shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <IconAlertTriangle className="size-4" />
                Recommended Verification Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {flag.recommendation
                .split(/\d+\.\s/)
                .filter(Boolean)
                .map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-amber-900/90 dark:text-amber-200/90">
                    <span className="flex-shrink-0 size-4 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="leading-relaxed">{step.trim()}</p>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Action Footer */}
        <div className="sticky bottom-0 z-20 bg-background/95 backdrop-blur-md border-t p-4 flex flex-wrap gap-2.5">
          <Button
            className="flex-1 h-9 text-xs font-semibold gap-1.5 shadow-xs"
            onClick={() => alert("Opening formal vigilance investigation dossier...")}
          >
            <IconPlayerPlay className="size-4" />
            Open Investigation
          </Button>
          <Button
            variant="outline"
            className="h-9 text-xs font-semibold gap-1.5 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
            onClick={() => alert("Escalating to District Magistrate...")}
          >
            <IconSend className="size-4" />
            Escalate
          </Button>
          <Button
            variant="ghost"
            className="h-9 text-xs font-semibold gap-1.5 text-muted-foreground"
            onClick={() => {
              alert("Case marked as verified.");
              onClose();
            }}
          >
            <IconCheck className="size-4" />
            Mark Verified
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RiskCenter() {
  const [selectedFlag, setSelectedFlag] = useState<RiskFlag | null>(null);
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeTab, setActiveTab] = useState<"flags" | "analytics" | "predictive">("flags");

  const filtered = RISK_FLAGS.filter(
    (f) =>
      (filterSeverity === "All" || f.severity === filterSeverity) &&
      (filterStatus === "All" || f.status === filterStatus)
  );

  const criticalCount = RISK_FLAGS.filter((f) => f.severity === "Critical").length;
  const highCount = RISK_FLAGS.filter((f) => f.severity === "High").length;
  const openCount = RISK_FLAGS.filter((f) => f.status === "Open").length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 animate-in fade-in-50 duration-200">
      {/* ── Top Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              <IconShieldExclamation className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                AI Risk Intelligence Center
              </h1>
              <p className="text-xs text-muted-foreground md:text-sm">
                Context-aware anomaly detection · Adaptive peer comparison · Geospatial duplication audit
              </p>
            </div>
          </div>
        </div>

        {/* Live Engine Status & Actions */}
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="px-3 py-1 text-xs font-medium gap-2 border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300"
          >
            <span className="size-2 rounded-full bg-violet-500 animate-pulse" />
            AI Engine Active (v2.4 Neural Guard)
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium gap-1.5 hidden sm:flex"
            onClick={() => alert("Running real-time anomaly scan...")}
          >
            <IconPlayerPlay className="size-3.5 text-primary" />
            Run Scan
          </Button>
        </div>
      </div>

      {/* ── Top 4 KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs border-red-500/30 bg-red-500/5 hover:border-red-500/50 transition-all">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                Critical Risks
              </span>
              <div className="size-2.5 rounded-full bg-red-500 animate-ping" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-red-600 dark:text-red-400">
              {criticalCount}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Immediate intervention required
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50 transition-all">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                High Risks
              </span>
              <div className="size-2.5 rounded-full bg-orange-500" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-orange-600 dark:text-orange-400">
              {highCount}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Priority TPI verification
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 transition-all">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Open Cases
              </span>
              <div className="size-2.5 rounded-full bg-amber-500" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
              {openCount}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Pending administrative resolution
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50 transition-all">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Total Flagged
              </span>
              <div className="size-2.5 rounded-full bg-blue-500" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
              {RISK_FLAGS.length}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Across 5 active inspection jurisdictions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-muted/50 p-1.5 border w-fit max-w-full">
        <button
          onClick={() => setActiveTab("flags")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            activeTab === "flags"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconFlame className="size-4 text-red-500" />
          Risk Flags ({filtered.length})
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            activeTab === "analytics"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconChartBar className="size-4 text-blue-500" />
          Analytics & Clusters
        </button>
        <button
          onClick={() => setActiveTab("predictive")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            activeTab === "predictive"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconSparkles className="size-4 text-violet-500" />
          Predictive Warnings
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* 1. RISK FLAGS LIST                                                                */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "flags" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 bg-card p-3 rounded-xl border shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <IconFilter className="size-3.5" />
              <span>Filters:</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Severity:</span>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-background border text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {["All", "Critical", "High", "Medium", "Low"].map((s) => (
                  <option key={s} value={s}>
                    {s} Severity
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-background border text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {["All", "Open", "Under Review", "Resolved"].map((s) => (
                  <option key={s} value={s}>
                    {s} Status
                  </option>
                ))}
              </select>
            </div>

            <Badge variant="secondary" className="ml-auto text-xs px-2.5 py-0.5 font-medium">
              Showing {filtered.length} of {RISK_FLAGS.length} cases
            </Badge>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filtered.map((flag) => {
              const cfg = SEVERITY_CONFIG[flag.severity] || SEVERITY_CONFIG.Medium;
              return (
                <Card
                  key={flag.id}
                  onClick={() => setSelectedFlag(flag)}
                  className={`group cursor-pointer border hover:border-primary/50 hover:shadow-md transition-all relative overflow-hidden`}
                >
                  {/* Left severity color strip */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 ${
                      flag.severity === "Critical"
                        ? "bg-red-500"
                        : flag.severity === "High"
                        ? "bg-orange-500"
                        : "bg-amber-500"
                    }`}
                  />

                  <CardContent className="p-4 sm:p-5 pl-5 sm:pl-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        {/* Tags Row */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={cfg.badgeVariant} className="text-[10px] uppercase font-bold tracking-wide px-2 py-0">
                            {flag.severity}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">
                            {flag.id}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium">
                            {flag.type} · Detected on {flag.detectedOn}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {flag.projectName}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {flag.description}
                        </p>

                        {/* Bottom Score & Action Pill */}
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-muted-foreground">Risk Score:</span>
                            <span className={`font-mono font-bold text-xs ${cfg.score}`}>
                              {flag.riskScore}/100
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-muted-foreground">Violations:</span>
                            <span className="font-mono font-semibold text-foreground">
                              {flag.reasons.length} rules
                            </span>
                          </div>
                          <Badge
                            variant={
                              flag.status === "Open"
                                ? "destructive"
                                : flag.status === "Under Review"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-[10px] px-2 py-0 h-4 font-semibold ml-auto sm:ml-0"
                          >
                            {flag.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Right side arrow */}
                      <div className="hidden sm:flex items-center text-xs font-semibold text-primary gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform self-center">
                        <span>Inspect</span>
                        <IconChevronRight className="size-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* 2. ANALYTICS & CLUSTERS                                                           */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Risk by Type Bar Chart */}
            <Card className="lg:col-span-6 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Risk Category Breakdown
                </CardTitle>
                <CardDescription className="text-xs">
                  Distribution of AI flagged anomaly patterns across national portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={RISK_TYPE_DATA}
                      layout="vertical"
                      margin={{ left: 10, right: 30, top: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="type"
                        tick={{ fontSize: 11, fill: "var(--foreground)" }}
                        axisLine={false}
                        tickLine={false}
                        width={110}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                          color: "var(--foreground)",
                          fontSize: "12px",
                        }}
                        formatter={(val: any) => [`${val} cases`, "Occurrences"]}
                      />
                      <Bar dataKey="count" fill="#EF4444" radius={[0, 4, 4, 0]} name="Cases" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* High-Risk Projects Leaderboard */}
            <Card className="lg:col-span-6 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Top Priority High-Risk Projects
                </CardTitle>
                <CardDescription className="text-xs">
                  Sanctioned works exceeding 45+ composite risk index
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {PROJECTS.filter((p) => p.riskScore >= 45)
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .slice(0, 5)
                  .map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                      <div className="size-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                        <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400">
                          {p.riskScore}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-foreground truncate">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {p.district}, {p.state} · ₹{(p.sanctionedAmount / 100000).toFixed(0)}L
                        </div>
                      </div>
                      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${p.riskScore}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>

          {/* AI Peer Comparison Engine Banner */}
          <Card className="bg-slate-900 text-white dark:bg-slate-950 border-slate-800 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                  <IconBrain className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-white">
                    AI Cross-Constituency Peer Engine
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Continuous cross-referencing against category norms, historical unit costs, and contractor patterns
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Avg Cost Deviation", value: "+3.2%", sub: "National peer baseline" },
                  { label: "Peer Anomalies", value: "127", sub: "Above 15% cost variance" },
                  { label: "Spatial Clusters", value: "23", sub: "Duplicate work proximity" },
                  { label: "Billing Patterns", value: "8", sub: "Suspicious billing sequences" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="font-mono text-xl font-bold text-amber-400 mb-1">
                      {s.value}
                    </div>
                    <div className="text-xs font-semibold text-white">
                      {s.label}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* 3. PREDICTIVE WARNINGS                                                            */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "predictive" && (
        <div className="space-y-6">
          {/* Predictive Warning Banner */}
          <Card className="bg-gradient-to-r from-violet-700 to-purple-800 text-white shadow-md border-none">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-white/20 text-white">
                  <IconSparkles className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-white">
                    Predictive Early Warning System
                  </CardTitle>
                  <CardDescription className="text-xs text-violet-200">
                    Machine learning model forecasting project delays & cost creep before completion deadlines
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "At Delay Risk (90 days)", value: "23 projects", confidence: "High (82% accuracy)" },
                  { label: "Cost Overrun Likely", value: "31 projects", confidence: "Medium (71% accuracy)" },
                  { label: "Fund Lapse Hazard", value: "4 States", confidence: "High (88% accuracy)" },
                ].map((p) => (
                  <div key={p.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-xs border border-white/10">
                    <div className="font-mono text-xl font-bold mb-1 text-white">
                      {p.value}
                    </div>
                    <div className="text-xs font-semibold text-violet-100">
                      {p.label}
                    </div>
                    <div className="text-[10px] text-violet-300 mt-1">
                      {p.confidence}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dual Projection Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Delay Risk Projections (Top 5)",
                items: [
                  { name: "Drinking Water Scheme, Barmer", risk: 94, detail: "240 days behind schedule" },
                  { name: "Flood Shelter, Sundarbans", risk: 82, detail: "180 days behind schedule" },
                  { name: "Road Widening, Jaipur Bypass", risk: 74, detail: "65 days behind schedule" },
                  { name: "PHC Construction, Alwar", risk: 71, detail: "48 days behind schedule" },
                  { name: "School Building, Shivpuri", risk: 68, detail: "32 days behind schedule" },
                ],
              },
              {
                title: "Cost Overrun Probability (Top 5)",
                items: [
                  { name: "Solar Project, Jaipur Rural", risk: 88, detail: "+20% estimated deviation" },
                  { name: "CC Road, Lucknow GP", risk: 72, detail: "+15% estimated deviation" },
                  { name: "Bridge, Nashik Rural", risk: 65, detail: "+12% estimated deviation" },
                  { name: "Stadium, Bhopal North", risk: 58, detail: "+9% estimated deviation" },
                  { name: "RO Plants, Kutch", risk: 42, detail: "+6% estimated deviation" },
                ],
              },
            ].map((panel) => (
              <Card key={panel.title} className="shadow-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    {panel.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3.5 pt-1">
                  {panel.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="font-mono text-xs text-muted-foreground w-4 text-center font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {item.detail}
                        </div>
                        <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{ width: `${item.risk}%` }}
                          />
                        </div>
                      </div>
                      <div className="font-mono text-xs font-bold text-red-600 dark:text-red-400 shrink-0">
                        {item.risk}%
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Slide-over Detail Modal ── */}
      {selectedFlag && (
        <RiskDetailPanel
          flag={selectedFlag}
          onClose={() => setSelectedFlag(null)}
        />
      )}
    </div>
  );
}
