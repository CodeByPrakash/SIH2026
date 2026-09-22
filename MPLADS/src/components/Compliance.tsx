"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { PROJECTS } from "../data/mpladsData";
import type { User } from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  IconShieldCheck,
  IconFileAlert,
  IconSearch,
  IconCamera,
  IconBuildingCommunity,
  IconChartBar,
  IconFileCheck,
  IconScale,
  IconCalendarTime,
  IconFileTypePdf,
  IconFileSpreadsheet,
  IconPrinter,
  IconSend,
  IconCheck,
  IconAlertTriangle,
  IconClock,
  IconExternalLink,
  IconFilter,
  IconSparkles,
  IconCertificate,
} from "@tabler/icons-react";

const UC_DATA = [
  { state: "Tamil Nadu", submitted: 94, pending: 6, total: 100 },
  { state: "Karnataka", submitted: 91, pending: 9, total: 100 },
  { state: "Gujarat", submitted: 88, pending: 12, total: 100 },
  { state: "Maharashtra", submitted: 85, pending: 15, total: 100 },
  { state: "Madhya Pradesh", submitted: 78, pending: 22, total: 100 },
  { state: "Uttar Pradesh", submitted: 72, pending: 28, total: 100 },
  { state: "Rajasthan", submitted: 68, pending: 32, total: 100 },
  { state: "West Bengal", submitted: 65, pending: 35, total: 100 },
];

const COMPLIANCE_RULES = [
  {
    rule: "Utilization Certificate within 3 months of project completion",
    violations: 847,
    critical: true,
    clause: "Rule 4.2(a)",
  },
  {
    rule: "Empanelled Third-Party Inspection (TPI) mandatory every 6 months",
    violations: 312,
    critical: true,
    clause: "Rule 5.1(b)",
  },
  {
    rule: "High-resolution geo-tagged photographs (minimum 10 per project)",
    violations: 1284,
    critical: false,
    clause: "Rule 3.7",
  },
  {
    rule: "Quarterly progress & expenditure report submission by DMs",
    violations: 234,
    critical: false,
    clause: "Rule 6.3",
  },
  {
    rule: "Public asset geo-registration on national portal within 90 days",
    violations: 421,
    critical: true,
    clause: "Rule 7.1",
  },
  {
    rule: "Civil work completion strictly within sanctioned timeline",
    violations: 4784,
    critical: true,
    clause: "Rule 2.4",
  },
  {
    rule: "Single project individual financial ceiling limit (max ₹5 Crore)",
    violations: 12,
    critical: false,
    clause: "Rule 1.8",
  },
  {
    rule: "Annual fund recommendation limit per MP (₹5 Crore per year)",
    violations: 0,
    critical: false,
    clause: "Rule 1.1",
  },
  {
    rule: "District unspent balance limit reconciliation check",
    violations: 28,
    critical: false,
    clause: "Rule 4.5",
  },
  {
    rule: "Formal contractor agreement execution prior to initial mobilization advance",
    violations: 5,
    critical: true,
    clause: "Rule 3.2",
  },
];

const TIMELINE_ITEMS = [
  {
    date: "2024-09-30",
    event: "Q2 Progress & Expenditure Report Statutory Deadline",
    type: "deadline",
    status: "upcoming",
    daysLeft: "14 days left",
  },
  {
    date: "2024-10-31",
    event: "National UC Reconciliation Drive — State Submissions",
    type: "compliance",
    status: "upcoming",
    daysLeft: "45 days left",
  },
  {
    date: "2024-08-31",
    event: "Mid-Year Expenditure Target Benchmark (50% Portfolio)",
    type: "target",
    status: "today",
    daysLeft: "Action Due Today",
  },
  {
    date: "2024-07-15",
    event: "Bi-annual Third Party Inspection (TPI) Batch Audits",
    type: "inspection",
    status: "passed",
    daysLeft: "Completed 60d ago",
  },
  {
    date: "2024-06-30",
    event: "Q1 Comprehensive State Compliance Submissions",
    type: "compliance",
    status: "done",
    daysLeft: "89% States Achieved",
  },
  {
    date: "2024-04-01",
    event: "FY 2024–25 First Installment Fund Release & Allocation",
    type: "fund",
    status: "done",
    daysLeft: "₹2,500 Cr Released",
  },
];

interface ComplianceProps {
  user?: User;
}

export default function Compliance({ user }: ComplianceProps = {}) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "uc" | "rules" | "timeline"
  >("overview");
  const [ucSearch, setUcSearch] = useState("");

  const relevantProjects = useMemo(() => {
    if (!user || user.role === "Ministry") return PROJECTS;
    if (user.role === "State" && user.state) {
      const s = user.state.toLowerCase();
      return PROJECTS.filter((p) => p.state.toLowerCase() === s);
    }
    if (user.role === "District" && user.district) {
      const d = user.district.toLowerCase();
      return PROJECTS.filter((p) => p.district.toLowerCase() === d);
    }
    if (user.role === "MP") {
      const c = user.constituency?.toLowerCase();
      const d = user.district?.toLowerCase();
      return PROJECTS.filter(
        (p) =>
          (c && p.constituency?.toLowerCase() === c) ||
          (d && p.district.toLowerCase() === d)
      );
    }
    return PROJECTS;
  }, [user]);

  const ucPending = relevantProjects.filter(
    (p) => p.status === "Completed" && !p.ucSubmitted
  ).length;
  const tpiDue = relevantProjects.filter(
    (p) => p.inspections < 3 && p.status === "In Progress"
  ).length;
  const photoGap = relevantProjects.filter((p) => p.photos < 10).length;
  const assetPending = relevantProjects.filter(
    (p) => p.status === "Completed" && !p.assetCreated
  ).length;

  const filteredPendingUcProjects = useMemo(() => {
    const list = relevantProjects.filter(
      (p) => p.status === "Completed" && !p.ucSubmitted
    );
    if (!ucSearch.trim()) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(ucSearch.toLowerCase()) ||
        p.state.toLowerCase().includes(ucSearch.toLowerCase()) ||
        p.district.toLowerCase().includes(ucSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(ucSearch.toLowerCase())
    );
  }, [relevantProjects, ucSearch]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 animate-in fade-in-50 duration-200">
      {/* ── Top Header & Actions ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconShieldCheck className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                Compliance Center
              </h1>
              <p className="text-xs text-muted-foreground md:text-sm">
                Statutory NIDHI-RAKSHAK guidelines · UC tracking · Physical verification · Audit benchmarks
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="hidden lg:flex px-2.5 py-1 text-xs font-mono font-medium gap-1 text-muted-foreground border-border"
          >
            <IconSparkles className="size-3.5 text-blue-500" />
            Guidelines 2023 (v3.1)
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium"
            onClick={() => alert("Downloading Compliance Dossier...")}
          >
            <IconFileTypePdf className="size-4 text-red-500" />
            PDF Dossier
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium shadow-xs"
            onClick={handlePrint}
          >
            <IconPrinter className="size-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* ── Top 4 KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs border-red-500/30 bg-red-500/5 hover:border-red-500/50 transition-all">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                UC Pending
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-red-500/15 text-red-600">
                <IconFileAlert className="size-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono text-red-600 dark:text-red-400">
              {ucPending}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Overdue (&gt;3 months post-completion)
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50 transition-all">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                TPI Due
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-orange-500/15 text-orange-600">
                <IconSearch className="size-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono text-orange-600 dark:text-orange-400">
              {tpiDue}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Third-Party site inspection required
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 transition-all">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Photo Documentation Gap
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
                <IconCamera className="size-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
              {photoGap}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Fewer than 10 geotagged photos uploaded
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50 transition-all">
          <CardContent className="p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Asset Registration Pending
              </span>
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600">
                <IconBuildingCommunity className="size-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
              {assetPending}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Not yet registered in national registry
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs Switcher ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-muted/50 p-1.5 border w-fit max-w-full">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            activeTab === "overview"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconChartBar className="size-4 text-blue-500" />
          Overview Matrix
        </button>
        <button
          onClick={() => setActiveTab("uc")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            activeTab === "uc"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconFileCheck className="size-4 text-emerald-500" />
          UC Status & Ledger
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            activeTab === "rules"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconScale className="size-4 text-amber-500" />
          Statutory Guidelines
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            activeTab === "timeline"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconCalendarTime className="size-4 text-violet-500" />
          Compliance Deadlines
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* 1. OVERVIEW MATRIX                                                                */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Project Compliance Matrix */}
            <Card className="lg:col-span-6 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Sample Project Compliance Matrix
                </CardTitle>
                <CardDescription className="text-xs">
                  4-pillar verification: UC, Asset Entry, Geo Photos, and TPI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {PROJECTS.slice(0, 6).map((p) => {
                  const score =
                    (p.ucSubmitted ? 25 : 0) +
                    (p.assetCreated ? 25 : 0) +
                    (p.photos >= 10 ? 25 : 0) +
                    (p.inspections >= 3 ? 25 : 0);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl border bg-card hover:bg-muted/30 transition-colors text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">
                          {p.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {[
                            { ok: p.ucSubmitted, label: "UC" },
                            { ok: p.assetCreated, label: "Asset" },
                            { ok: p.photos >= 10, label: "Photos" },
                            { ok: p.inspections >= 3, label: "TPI" },
                          ].map(({ ok, label }) => (
                            <Badge
                              key={label}
                              variant={ok ? "default" : "destructive"}
                              className={`text-[9px] px-1.5 py-0 h-4 font-semibold ${
                                ok
                                  ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                                  : "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30"
                              }`}
                            >
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-mono font-bold text-sm ${
                            score === 100
                              ? "text-emerald-600 dark:text-emerald-400"
                              : score >= 50
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {score}%
                        </span>
                        <div className="h-1.5 w-14 bg-muted rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              score === 100
                                ? "bg-emerald-500"
                                : score >= 50
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Compliance Score by State */}
            <Card className="lg:col-span-6 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Compliance Score by State
                </CardTitle>
                <CardDescription className="text-xs">
                  Aggregated composite index across documentation and physical audits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {[
                  { state: "Tamil Nadu", score: 94 },
                  { state: "Karnataka", score: 91 },
                  { state: "Gujarat", score: 88 },
                  { state: "Maharashtra", score: 85 },
                  { state: "Madhya Pradesh", score: 78 },
                  { state: "Uttar Pradesh", score: 72 },
                  { state: "West Bengal", score: 65 },
                  { state: "Rajasthan", score: 61 },
                ].map((s) => (
                  <div key={s.state} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">
                        {s.state}
                      </span>
                      <span
                        className={`font-mono font-semibold ${
                          s.score >= 90
                            ? "text-emerald-600 dark:text-emerald-400"
                            : s.score >= 75
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {s.score}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          s.score >= 90
                            ? "bg-emerald-500"
                            : s.score >= 75
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Benchmarks Hero Section */}
          <Card className="bg-slate-900 text-white dark:bg-slate-950 border-slate-800 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                  <IconCertificate className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-white">
                    Benchmarking vs National Guidelines Standards
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Live operational metrics compared with MoSPI statutory thresholds
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Avg. Project Duration", national: "14 months", current: "16.2 months", ok: false },
                  { label: "UC Submission Rate", national: "90%+", current: "78.4%", ok: false },
                  { label: "Fund Utilization Rate", national: "90%+", current: "84.8%", ok: false },
                  { label: "Photo Documentation", national: "100%", current: "91.2%", ok: false },
                  { label: "Cost Deviation Avg.", national: "<5%", current: "+3.2%", ok: true },
                  { label: "Asset Registration", national: "100%", current: "82.6%", ok: false },
                  { label: "Inspection Compliance", national: "100%", current: "74.3%", ok: false },
                  { label: "Quarterly Report Rate", national: "100%", current: "89.1%", ok: true },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-1"
                  >
                    <div className="text-xs text-slate-400">{b.label}</div>
                    <div
                      className={`font-mono text-xl font-bold ${
                        b.ok ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {b.current}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Standard: {b.national}
                    </div>
                    <div
                      className={`text-[10px] font-semibold pt-0.5 flex items-center gap-1 ${
                        b.ok ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {b.ok ? "✓ Within standard" : "⚠ Below standard"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* 2. UC STATUS & LEDGER                                                             */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "uc" && (
        <div className="space-y-6">
          {/* Stacked Bar Chart */}
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold">
                    UC Submission Status by State
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Submitted vs pending utilization certificates across state jurisdictions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-xs bg-emerald-500 inline-block" />
                    <span className="text-muted-foreground">Submitted</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-xs bg-red-500 inline-block" />
                    <span className="text-muted-foreground">Pending</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={UC_DATA}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis
                      dataKey="state"
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
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
                      formatter={(val: any, name: any) => [`${val}%`, name]}
                    />
                    <Bar
                      dataKey="submitted"
                      stackId="a"
                      fill="#10B981"
                      radius={[0, 0, 0, 0]}
                      name="Submitted"
                    />
                    <Bar
                      dataKey="pending"
                      stackId="a"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                      name="Pending"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pending UCs Table */}
          <Card className="shadow-xs overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Projects with Overdue Utilization Certificates
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Statutory notice list for completed works lacking certified expenditure submissions
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search project, state, or ID..."
                    value={ucSearch}
                    onChange={(e) => setUcSearch(e.target.value)}
                    className="w-full h-8 px-3 rounded-lg bg-background border text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/40 text-[11px] uppercase tracking-wider">
                    <TableHead className="font-semibold text-foreground">Project Details</TableHead>
                    <TableHead className="font-semibold text-foreground">State</TableHead>
                    <TableHead className="font-semibold text-foreground">Completion Date</TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Sanctioned</TableHead>
                    <TableHead className="text-center font-semibold text-foreground">Days Overdue</TableHead>
                    <TableHead className="text-center font-semibold text-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPendingUcProjects.map((p) => {
                    const days = Math.floor(
                      (new Date().getTime() -
                        new Date(
                          p.completionDate || p.expectedCompletion
                        ).getTime()) /
                        86400000
                    );
                    return (
                      <TableRow key={p.id} className="hover:bg-muted/30 text-xs">
                        <TableCell className="font-medium text-foreground">
                          <div className="font-bold truncate max-w-sm">{p.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{p.id}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.state}</TableCell>
                        <TableCell className="font-mono text-muted-foreground">
                          {p.completionDate || p.expectedCompletion}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          ₹{(p.sanctionedAmount / 100000).toFixed(0)}L
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          <Badge
                            variant={
                              days > 180
                                ? "destructive"
                                : days > 90
                                ? "default"
                                : "secondary"
                            }
                            className="text-[10px] px-2 py-0"
                          >
                            {days > 0 ? `${days}d overdue` : "Due soon"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[11px] font-medium gap-1 text-primary border-primary/30 hover:bg-primary/10"
                            onClick={() => alert(`Issuing formal reminder for project: ${p.name}`)}
                          >
                            <IconSend className="size-3" />
                            Send Notice
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* 3. STATUTORY RULES                                                                */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "rules" && (
        <Card className="shadow-xs overflow-hidden">
          <CardHeader className="p-4 border-b bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold">
                  NIDHI-RAKSHAK Guidelines Compliance Registry
                </CardTitle>
                <CardDescription className="text-xs">
                  Statutory mandates and national violation metrics per Guidelines 2023
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-mono w-fit">
                Statutory Order No. 2023/NR/33
              </Badge>
            </div>
          </CardHeader>
          <div className="divide-y divide-border">
            {COMPLIANCE_RULES.map((r, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors text-xs"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span
                    className={`size-2.5 rounded-full shrink-0 mt-1.5 ${
                      r.critical ? "bg-red-500" : "bg-amber-500"
                    }`}
                  />
                  <div>
                    <div className="font-semibold text-foreground">
                      {r.rule}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Statutory Reference:{" "}
                      <span className="font-mono font-medium text-foreground">
                        {r.clause}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-6 sm:pl-0">
                  <div className="text-right">
                    <span
                      className={`font-mono text-sm font-bold ${
                        r.violations === 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : r.violations > 500
                          ? "text-red-600 dark:text-red-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {r.violations === 0 ? "0 (Compliant)" : r.violations.toLocaleString()}
                    </span>
                    <div className="text-[10px] text-muted-foreground">
                      {r.violations === 0 ? "Full compliance" : "Flagged violations"}
                    </div>
                  </div>

                  <Badge
                    variant={r.critical ? "destructive" : "secondary"}
                    className="text-[10px] uppercase font-bold px-2 py-0.5"
                  >
                    {r.critical ? "Critical" : "Standard"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* 4. COMPLIANCE TIMELINE                                                             */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {activeTab === "timeline" && (
        <div className="space-y-3">
          {TIMELINE_ITEMS.map((item, i) => (
            <Card
              key={i}
              className={`p-4 transition-all shadow-xs ${
                item.status === "today"
                  ? "border-amber-500/40 bg-amber-500/5"
                  : item.status === "upcoming"
                  ? "border-blue-500/30 bg-blue-500/5"
                  : item.status === "done"
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div
                    className={`size-3 rounded-full mt-1 shrink-0 ${
                      item.status === "today"
                        ? "bg-amber-500 animate-ping"
                        : item.status === "upcoming"
                        ? "bg-blue-500"
                        : item.status === "done"
                        ? "bg-emerald-500"
                        : "bg-muted-foreground"
                    }`}
                  />
                  <div>
                    <h3 className="font-bold text-foreground text-sm">
                      {item.event}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                      <span className="font-mono text-xs font-medium">
                        {item.date}
                      </span>
                      <span>·</span>
                      <span className="text-[11px] font-medium">{item.daysLeft}</span>
                    </div>
                  </div>
                </div>

                <Badge
                  variant={
                    item.status === "today"
                      ? "destructive"
                      : item.status === "upcoming"
                      ? "default"
                      : "secondary"
                  }
                  className={`text-[10px] px-2.5 py-0.5 font-semibold w-fit shrink-0 ${
                    item.status === "done" ? "bg-emerald-600 hover:bg-emerald-600 text-white" : ""
                  }`}
                >
                  {item.status === "today"
                    ? "⚡ Due Today"
                    : item.status === "upcoming"
                    ? "📅 Upcoming"
                    : item.status === "done"
                    ? "✓ Completed"
                    : "⏱ Passed"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
