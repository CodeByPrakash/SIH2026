"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import * as XLSX from "xlsx";
import type { User, Project } from "@/types";
import {
  NATIONAL_KPIs,
  STATES_DATA,
  MONTHLY_EXPENDITURE,
  CATEGORY_DISTRIBUTION,
  FUND_HISTORY,
  PROJECTS,
  ALERTS,
} from "@/data/mpladsData";
import { useProjects } from "@/hooks/useProjects";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconBuildingCommunity,
  IconCircleCheck,
  IconCoin,
  IconAlertTriangle,
  IconClock,
  IconClipboardCheck,
  IconTrendingUp,
  IconTrendingDown,
  IconFileSpreadsheet,
  IconFileAnalytics,
  IconSparkles,
  IconArrowUpRight,
  IconSearch,
  IconChartPie,
  IconChartBar,
  IconChartLine,
  IconChartAreaLine,
  IconRefresh,
  IconDotsVertical,
  IconFileText,
  IconListDetails,
  IconChartBar as IconChartBarAlt,
  IconDownload,
  IconCalendarEvent,
  IconRoad,
  IconDroplet,
  IconSchool,
  IconHeart,
  IconBolt,
  IconCategory,
  IconLoader2,
  IconCheck,
  IconX,
  IconMapPin,
  IconUser,
  IconCurrencyRupee,
  IconPhoto,
  IconShieldCheck,
  IconShieldExclamation,
  IconInfoCircle,
  IconCircleFilled,
  IconClockHour4,
  IconBuildingBank,
  IconReceipt,
  IconCube,
  IconMap,
} from "@tabler/icons-react";
import { FEATURED_3D_PROJECTS } from "@/components/Project3DView";

interface Props {
  user: User;
  onNavigate: (page: string) => void;
}

// ── Chart Configurations ──────────────────────────────────────────────────────
const areaChartConfig = {
  expenditure: { label: "Actual Expenditure", color: "var(--chart-1)" },
  target: { label: "Planned Target", color: "var(--chart-2)" },
} satisfies ChartConfig;

const pieChartConfig = {
  "Roads & Connectivity": { label: "Roads & Connectivity", color: "var(--chart-1)" },
  "Water Supply & Sanitation": { label: "Water Supply & Sanitation", color: "var(--chart-2)" },
  "Education & Child Dev": { label: "Education & Child Dev", color: "var(--chart-3)" },
  Health: { label: "Health Infrastructure", color: "var(--chart-4)" },
  "Energy & Solar": { label: "Energy & Solar", color: "var(--chart-5)" },
  Others: { label: "Others & Civic Amenities", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

const barChartConfig = {
  totalFunds: { label: "Sanctioned (₹Cr)", color: "var(--chart-1)" },
  utilizedFunds: { label: "Utilized (₹Cr)", color: "var(--chart-2)" },
} satisfies ChartConfig;

const lineChartConfig = {
  utilizationRate: { label: "Fund Utilization (%)", color: "var(--chart-1)" },
  completionRate: { label: "Project Completion (%)", color: "var(--chart-3)" },
} satisfies ChartConfig;

const PIE_COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
  "var(--chart-4)", "var(--chart-5)", "var(--primary)",
  "var(--destructive)", "var(--muted-foreground)",
];

const fmt = (n: number) => (n >= 100 ? `₹${(n / 100).toFixed(1)}Cr` : `₹${n}L`);
const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toFixed(1)}%` : "—");

// ── Sector Icon ─────────────────────────────────────────────────────────────
function SectorIcon({ category, className }: { category: string; className?: string }) {
  const cls = `size-4 ${className ?? ""}`;
  if (category.includes("Road")) return <IconRoad className={cls} />;
  if (category.includes("Water")) return <IconDroplet className={cls} />;
  if (category.includes("Education") || category.includes("Child")) return <IconSchool className={cls} />;
  if (category.includes("Health")) return <IconHeart className={cls} />;
  if (category.includes("Energy") || category.includes("Solar")) return <IconBolt className={cls} />;
  return <IconCategory className={cls} />;
}

// ── Risk Badge ───────────────────────────────────────────────────────────────
function RiskStatusBadge({ riskLevel, size = "sm" }: { riskLevel: string; size?: "sm" | "lg" }) {
  const base = size === "lg"
    ? "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
    : "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border";

  if (riskLevel === "Critical" || riskLevel === "High") {
    return (
      <span className={`${base} bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50`}>
        <span className={`rounded-full bg-red-500 shrink-0 ${size === "lg" ? "size-2" : "size-1.5"}`} />
        High Risk
      </span>
    );
  }
  if (riskLevel === "Medium") {
    return (
      <span className={`${base} bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50`}>
        <span className={`rounded-full bg-amber-500 shrink-0 ${size === "lg" ? "size-2" : "size-1.5"}`} />
        Early Risk
      </span>
    );
  }
  return (
    <span className={`${base} bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50`}>
      <span className={`rounded-full bg-emerald-500 shrink-0 ${size === "lg" ? "size-2" : "size-1.5"}`} />
      On Track
    </span>
  );
}

// ── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, riskLevel }: { value: number; riskLevel: string }) {
  const color =
    riskLevel === "High" || riskLevel === "Critical" ? "bg-red-500"
    : riskLevel === "Medium" ? "bg-amber-500"
    : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="font-mono text-[11px] text-foreground">{value}%</span>
    </div>
  );
}

// ── Sync timestamp ────────────────────────────────────────────────────────────
function formatSyncTime(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    + ", " + date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ── Chart data helpers ────────────────────────────────────────────────────────
function buildPaymentData(project: Project) {
  return project.payments.map((pay, i) => ({
    name: `Bill ${i + 1}`,
    amount: pay.amount,
    status: pay.status,
  }));
}

function buildProgressData(project: Project) {
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const steps = Math.max(1, Math.ceil(project.progress / 12));
  return months.slice(0, Math.min(steps + 3, months.length)).map((m, i) => ({
    month: m,
    progress: Math.min(project.progress, (i + 1) * Math.ceil(project.progress / steps)),
    target: Math.min(100, Math.round((i + 1) * (100 / (steps + 2)))),
  }));
}

function buildRadarData(project: Project) {
  return [
    { subject: "Progress", value: project.progress },
    { subject: "Evidence", value: project.evidenceScore ?? 60 },
    { subject: "Compliance", value: project.ucSubmitted ? 85 : 35 },
    { subject: "Inspection", value: Math.min(100, project.inspections * 20) },
    { subject: "Fund Use", value: project.sanctionedAmount > 0 ? Math.round((project.expenditure / project.sanctionedAmount) * 100) : 0 },
  ];
}

// ── Risk color helper ─────────────────────────────────────────────────────────
function getRiskColor(riskLevel: string) {
  if (riskLevel === "High" || riskLevel === "Critical") return "#ef4444";
  if (riskLevel === "Medium") return "#f59e0b";
  return "#10b981";
}

// ═══════════════════════════════════════════════════════════════════════════
// RIGHT PANEL — REPORT
// ═══════════════════════════════════════════════════════════════════════════
function ReportPanel({ project, onClose }: { project: Project; onClose: () => void }) {
  const riskColor = getRiskColor(project.riskLevel);
  const utilPct = project.sanctionedAmount > 0
    ? Math.round((project.expenditure / project.sanctionedAmount) * 100)
    : 0;

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:w-[520px] lg:w-[580px] lg:max-w-[580px] p-0 flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border bg-card shrink-0">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <IconFileText className="size-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-sm font-bold text-foreground leading-tight line-clamp-2 max-w-[380px]">
                {project.name}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[11px] text-muted-foreground font-mono">{project.workOrderNo}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[11px] text-muted-foreground">{project.district}, {project.state}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors shrink-0">
            <IconX className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Risk Banner */}
          <div className={`mx-5 mt-5 rounded-xl p-4 border ${
            project.riskLevel === "High" || project.riskLevel === "Critical"
              ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/40"
              : project.riskLevel === "Medium"
              ? "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800/40"
              : "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/40"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <RiskStatusBadge riskLevel={project.riskLevel} size="lg" />
              <span className="text-[11px] text-muted-foreground">AI Audit Engine · FY 2024-25</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed">
              This <strong>{project.category}</strong> project in {project.district} is at <strong>{project.progress}%</strong> completion.
              Expected delivery: <strong>{project.expectedCompletion}</strong>.
              {project.riskFlags.length > 0
                ? ` Flagged issues: ${project.riskFlags.join("; ")}.`
                : " No critical risk flags at this time."}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="px-5 mt-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Financial Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Sanctioned Amount", value: fmt(project.sanctionedAmount), icon: IconCurrencyRupee, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
                { label: "Released Amount", value: fmt(project.releasedAmount), icon: IconBuildingBank, color: "text-violet-500 bg-violet-50 dark:bg-violet-900/20" },
                { label: "Expenditure", value: fmt(project.expenditure), icon: IconReceipt, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
                { label: "Utilization", value: `${utilPct}%`, icon: IconChartBarAlt, color: utilPct >= 80 ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "text-amber-500 bg-amber-50 dark:bg-amber-900/20" },
              ].map((m) => {
                const IconComp = m.icon;
                return (
                  <div key={m.label} className="rounded-xl border bg-card p-3.5 flex items-center gap-3">
                    <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${m.color}`}>
                      <IconComp className="size-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">{m.label}</div>
                      <div className="text-sm font-bold font-mono text-foreground">{m.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Visual */}
          <div className="px-5 mt-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Completion Progress</h3>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-bold font-mono" style={{ color: riskColor }}>{project.progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${project.progress}%`, backgroundColor: riskColor }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                <span>0%</span>
                <span>Milestone: 50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* AI Risk Flags */}
          {project.riskFlags.length > 0 && (
            <div className="px-5 mt-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <IconShieldExclamation className="size-3.5 text-amber-500" />
                AI-Detected Risk Flags
              </h3>
              <div className="space-y-2">
                {project.riskFlags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/30">
                    <IconAlertTriangle className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-amber-800 dark:text-amber-300">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Details */}
          <div className="px-5 mt-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Project Details</h3>
            <div className="rounded-xl border bg-card overflow-hidden">
              {[
                { label: "Category", value: `${project.category} — ${project.subCategory}` },
                { label: "Contractor", value: project.contractor ?? "—" },
                { label: "Sanction Date", value: project.sanctionDate },
                { label: "Agreement Date", value: project.agreementDate ?? "—" },
                { label: "Expected Completion", value: project.expectedCompletion },
                { label: "Completion Date", value: project.completionDate ?? "In Progress" },
                { label: "Risk Score", value: `${project.riskScore} / 100` },
                { label: "Risk Level", value: project.riskLevel },
                { label: "UC Submitted", value: project.ucSubmitted ? "✓ Yes" : "✗ No" },
                { label: "Asset Created", value: project.assetCreated ? "✓ Yes" : "✗ No" },
                { label: "Photos Uploaded", value: `${project.photos} photos` },
                { label: "Inspections Done", value: `${project.inspections} inspections` },
                { label: "Constituency", value: project.constituency },
                { label: "MP", value: project.mpName },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  className={`flex items-start justify-between px-4 py-2.5 text-xs ${i < arr.length - 1 ? "border-b border-border/60" : ""}`}
                >
                  <span className="text-muted-foreground shrink-0 w-36">{item.label}</span>
                  <span className={`font-medium text-right ${
                    item.value.startsWith("✓") ? "text-emerald-600" : item.value.startsWith("✗") ? "text-red-500" : "text-foreground"
                  }`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          <div className="px-5 mt-5 pb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <IconCurrencyRupee className="size-3.5 text-primary" />
              Payment Transactions
            </h3>
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-[11px] py-2">Date</TableHead>
                    <TableHead className="text-[11px] py-2">Bill No</TableHead>
                    <TableHead className="text-[11px] py-2 text-right">Amount</TableHead>
                    <TableHead className="text-[11px] py-2">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.payments.map((pay, i) => (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell className="text-[11px] font-mono py-2.5">{pay.date}</TableCell>
                      <TableCell className="text-[11px] font-mono text-muted-foreground py-2.5">{pay.billNo}</TableCell>
                      <TableCell className="text-[11px] font-mono font-semibold text-right py-2.5">{fmt(pay.amount)}</TableCell>
                      <TableCell className="py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          pay.status === "Paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : pay.status === "Pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        }`}>{pay.status}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card/80 shrink-0 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5" onClick={onClose}>
            <IconX className="size-3.5" /> Close
          </Button>
          <Button size="sm" className="flex-1 text-xs gap-1.5">
            <IconDownload className="size-3.5" /> Download PDF
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RIGHT PANEL — DETAILED STATUS (Full comprehensive dedicated view)
// ═══════════════════════════════════════════════════════════════════════════
function DetailedStatusPanel({ project, onClose, onNavigate }: { project: Project; onClose: () => void; onNavigate: (p: string) => void }) {
  const riskColor = getRiskColor(project.riskLevel);
  const utilPct = project.sanctionedAmount > 0
    ? Math.round((project.expenditure / project.sanctionedAmount) * 100)
    : 0;

  const timeline = [
    { label: "Work Order Sanctioned", date: project.sanctionDate, done: true, desc: `Work order ${project.workOrderNo} issued for ${project.category}` },
    { label: "Agreement Signed", date: project.agreementDate ?? "—", done: !!project.agreementDate, desc: project.contractor ? `Agreement with ${project.contractor}` : "Contractor agreement" },
    { label: "Work Commenced", date: "—", done: project.progress > 0, desc: "Ground-level construction / execution started" },
    { label: "50% Milestone", date: "—", done: project.progress >= 50, desc: "Halfway execution checkpoint passed" },
    { label: "75% Milestone", date: "—", done: project.progress >= 75, desc: "Three-quarter execution checkpoint passed" },
    { label: "Completion & Handover", date: project.completionDate ?? project.expectedCompletion, done: project.status === "Completed", desc: project.status === "Completed" ? "Work completed and asset handed over" : `Expected: ${project.expectedCompletion}` },
    { label: "UC Submission", date: "—", done: project.ucSubmitted, desc: "Utilization Certificate submitted to district authority" },
    { label: "Asset Registration", date: "—", done: project.assetCreated, desc: "Public asset registered in NIDHI-RAKSHAK records" },
  ];

  const auditItems = [
    { label: "Progress", value: project.progress, max: 100, unit: "%", color: riskColor },
    { label: "Evidence Score", value: project.evidenceScore ?? 60, max: 100, unit: "/100", color: "#6366f1" },
    { label: "Inspection Rate", value: Math.min(100, project.inspections * 20), max: 100, unit: "%", color: "#0ea5e9" },
    { label: "Fund Utilization", value: utilPct, max: 100, unit: "%", color: "#10b981" },
    { label: "UC Compliance", value: project.ucSubmitted ? 100 : 0, max: 100, unit: "%", color: "#f59e0b" },
    { label: "Asset Creation", value: project.assetCreated ? 100 : 0, max: 100, unit: "%", color: "#8b5cf6" },
  ];

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:w-[600px] lg:w-[660px] lg:max-w-[660px] p-0 flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        {/* ── Header ── */}
        <div className="shrink-0 border-b border-border bg-card">
          <div className="flex items-start justify-between p-5">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <IconListDetails className="size-5 text-blue-500" />
              </div>
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Detailed Status Report</div>
                <SheetTitle className="text-sm font-bold text-foreground leading-tight line-clamp-2 max-w-[440px]">
                  {project.name}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[11px] font-mono text-muted-foreground">{project.workOrderNo}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <RiskStatusBadge riskLevel={project.riskLevel} />
                </div>
              </div>
            </div>
            <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors shrink-0">
              <IconX className="size-4 text-muted-foreground" />
            </button>
          </div>

          {/* Quick metrics strip */}
          <div className="grid grid-cols-4 divide-x divide-border border-t border-border">
            {[
              { label: "Progress", value: `${project.progress}%` },
              { label: "Sanctioned", value: fmt(project.sanctionedAmount) },
              { label: "Spent", value: fmt(project.expenditure) },
              { label: "Risk Score", value: `${project.riskScore}/100` },
            ].map((m) => (
              <div key={m.label} className="px-4 py-2.5 text-center">
                <div className="text-[10px] text-muted-foreground">{m.label}</div>
                <div className="text-sm font-bold font-mono text-foreground">{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          {/* Location + ID bar */}
          <div className="flex items-center gap-4 px-5 py-3 bg-muted/30 border-b border-border/60">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <IconMapPin className="size-3.5 text-primary shrink-0" />
              <span>{project.constituency}, {project.district}, {project.state}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <IconUser className="size-3.5 shrink-0" />
              <span>{project.mpName}</span>
            </div>
          </div>

          {/* ── Progress Ring + Status ── */}
          <div className="px-5 pt-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Execution Status</h3>
            <div className="rounded-xl border bg-card p-5 flex items-center gap-6">
              {/* Ring */}
              <div className="relative size-28 shrink-0">
                <svg className="size-28 -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="44" strokeWidth="10" className="stroke-muted fill-none" />
                  <circle
                    cx="56" cy="56" r="44" strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 44}`}
                    strokeDashoffset={`${2 * Math.PI * 44 * (1 - project.progress / 100)}`}
                    strokeLinecap="round"
                    fill="none"
                    stroke={riskColor}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold tabular-nums leading-none" style={{ color: riskColor }}>
                    {project.progress}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium mt-0.5">percent</span>
                </div>
              </div>
              {/* Status details */}
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant={project.status === "Completed" ? "default" : project.status === "Delayed" ? "destructive" : "secondary"} className="text-[11px]">
                    {project.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Risk Level</span>
                  <RiskStatusBadge riskLevel={project.riskLevel} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Expected Completion</span>
                  <span className="text-xs font-medium font-mono text-foreground">{project.expectedCompletion}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Contractor</span>
                  <span className="text-xs font-medium text-foreground text-right max-w-[200px] line-clamp-1">{project.contractor ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Sector</span>
                  <span className="text-xs font-medium text-foreground">{project.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── AI Audit Scorecard ── */}
          <div className="px-5 mt-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <IconSparkles className="size-3.5 text-violet-500" />
              AI Audit Scorecard
            </h3>
            <div className="rounded-xl border bg-card p-4 space-y-3">
              {auditItems.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-muted-foreground">{item.label}</span>
                    <span className="text-[11px] font-bold font-mono" style={{ color: item.color }}>
                      {item.value}{item.unit}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(item.value / item.max) * 100}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <IconSparkles className="size-3.5 text-violet-500" />
                    Deep ML & NLP Audit
                  </span>
                  <p className="text-[10px] text-muted-foreground">XGBoost &bull; Isolation Forest &bull; Nidhi-saathi NLP</p>
                </div>
                <Button
                  size="sm"
                  className="h-7.5 px-3 text-xs font-semibold gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-xs"
                  onClick={() => {
                    onClose();
                    onNavigate(`ai-audit?projectId=${project.id}`);
                  }}
                >
                  View AI Audit &rarr;
                </Button>
              </div>
            </div>
          </div>

          {/* ── Execution Timeline ── */}
          <div className="px-5 mt-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <IconClockHour4 className="size-3.5 text-primary" />
              Execution Timeline
            </h3>
            <div className="rounded-xl border bg-card p-4">
              {timeline.map((step, i) => (
                <div key={i} className="flex gap-4">
                  {/* Connector */}
                  <div className="flex flex-col items-center">
                    <div className={`size-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      step.done
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-muted-foreground/25 bg-muted/30"
                    }`}>
                      {step.done
                        ? <IconCheck className="size-4 text-emerald-500" />
                        : <span className="size-2 rounded-full bg-muted-foreground/30" />
                      }
                    </div>
                    {i < timeline.length - 1 && (
                      <div className={`w-0.5 flex-1 my-1 min-h-[20px] ${step.done ? "bg-emerald-400/40" : "bg-muted"}`} />
                    )}
                  </div>
                  {/* Content */}
                  <div className={`pb-4 flex-1 ${i === timeline.length - 1 ? "pb-0" : ""}`}>
                    <div className={`text-xs font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{step.desc}</div>
                    {step.date && step.date !== "—" && (
                      <div className="text-[10px] font-mono text-primary mt-0.5">{step.date}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Risk Flags ── */}
          {project.riskFlags.length > 0 && (
            <div className="px-5 mt-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <IconShieldExclamation className="size-3.5 text-amber-500" />
                Active Risk Flags ({project.riskFlags.length})
              </h3>
              <div className="space-y-2">
                {project.riskFlags.map((flag, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-200/70 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/30">
                    <div className="size-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <IconAlertTriangle className="size-3 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-xs text-amber-800 dark:text-amber-300 font-medium">{flag}</div>
                      <div className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-0.5">Flagged by AI Audit Engine</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Financial Breakdown ── */}
          <div className="px-5 mt-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <IconCurrencyRupee className="size-3.5 text-primary" />
              Financial Breakdown
            </h3>
            <div className="rounded-xl border bg-card overflow-hidden">
              {[
                { label: "Total Sanctioned", value: fmt(project.sanctionedAmount), note: "Approved allocation" },
                { label: "Amount Released", value: fmt(project.releasedAmount), note: "Disbursed to executing agency" },
                { label: "Total Expenditure", value: fmt(project.expenditure), note: "Actual on-ground spend" },
                { label: "Remaining Balance", value: fmt(Math.max(0, project.sanctionedAmount - project.expenditure)), note: "Unspent sanctioned amount" },
                { label: "Utilization Rate", value: `${utilPct}%`, note: utilPct >= 80 ? "On track" : "Below target" },
              ].map((row, i, arr) => (
                <div key={row.label} className={`flex items-center justify-between px-4 py-3 text-xs ${i < arr.length - 1 ? "border-b border-border/60" : ""}`}>
                  <div>
                    <div className="font-medium text-foreground">{row.label}</div>
                    <div className="text-[10px] text-muted-foreground">{row.note}</div>
                  </div>
                  <div className="font-bold font-mono text-foreground">{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Payment Transactions ── */}
          <div className="px-5 mt-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <IconReceipt className="size-3.5 text-primary" />
              Payment Transactions
            </h3>
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-[11px] py-2.5">Date</TableHead>
                    <TableHead className="text-[11px] py-2.5">Bill No</TableHead>
                    <TableHead className="text-[11px] py-2.5 text-right">Amount</TableHead>
                    <TableHead className="text-[11px] py-2.5">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.payments.map((pay, i) => (
                    <TableRow key={i} className="hover:bg-muted/30">
                      <TableCell className="text-[11px] font-mono py-3">{pay.date}</TableCell>
                      <TableCell className="text-[11px] font-mono text-muted-foreground py-3">{pay.billNo}</TableCell>
                      <TableCell className="text-[11px] font-mono font-bold text-right py-3">{fmt(pay.amount)}</TableCell>
                      <TableCell className="py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          pay.status === "Paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : pay.status === "Pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        }`}>{pay.status}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* ── Verification & Compliance ── */}
          <div className="px-5 mt-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <IconShieldCheck className="size-3.5 text-emerald-500" />
              Verification & Compliance
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "UC Submitted", status: project.ucSubmitted, icon: IconClipboardCheck },
                { label: "Asset Created", status: project.assetCreated, icon: IconBuildingCommunity },
                { label: "Geo-tagged Photos", status: project.photos > 0, icon: IconPhoto, count: `${project.photos} photos` },
                { label: "Inspections Done", status: project.inspections > 0, icon: IconCircleCheck, count: `${project.inspections} done` },
              ].map((item) => {
                const IconComp = item.icon;
                return (
                  <div key={item.label} className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                    item.status ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/30"
                    : "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/30"
                  }`}>
                    <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.status ? "bg-emerald-500/20" : "bg-red-500/20"
                    }`}>
                      <IconComp className={`size-4 ${item.status ? "text-emerald-600" : "text-red-500"}`} />
                    </div>
                    <div>
                      <div className={`text-[11px] font-semibold ${item.status ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {item.status ? "✓ " : "✗ "}{item.label}
                      </div>
                      {"count" in item && (
                        <div className="text-[10px] text-muted-foreground">{item.count}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Location ── */}
          <div className="px-5 mt-5 mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <IconMapPin className="size-3.5 text-primary" />
              Location Details
            </h3>
            <div className="rounded-xl border bg-card overflow-hidden">
              {[
                { label: "State", value: project.state },
                { label: "District", value: project.district },
                { label: "Constituency", value: project.constituency },
                { label: "MP", value: project.mpName },
                { label: "GPS Coordinates", value: `${project.geoLat.toFixed(4)}°N, ${project.geoLng.toFixed(4)}°E` },
              ].map((row, i, arr) => (
                <div key={row.label} className={`flex items-center justify-between px-4 py-2.5 text-xs ${i < arr.length - 1 ? "border-b border-border/60" : ""}`}>
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card/80 shrink-0 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5" onClick={onClose}>
            <IconX className="size-3.5" /> Close
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs gap-1.5 bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20 dark:text-blue-400 font-semibold"
            onClick={() => {
              onClose();
              onNavigate(`3d-view?projectId=${project.id}`);
            }}
          >
            <IconCube className="size-3.5 text-blue-500" /> 3D View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs gap-1.5 bg-violet-500/10 text-violet-600 border-violet-500/30 hover:bg-violet-500/20 dark:text-violet-400 font-semibold"
            onClick={() => {
              onClose();
              onNavigate(`ai-audit?projectId=${project.id}`);
            }}
          >
            <IconSparkles className="size-3.5 text-violet-500" /> AI Audit
          </Button>
          <Button size="sm" className="flex-1 text-xs gap-1.5">
            <IconDownload className="size-3.5" /> Export
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RIGHT PANEL — GRAPHS
// ═══════════════════════════════════════════════════════════════════════════
function GraphsPanel({ project, onClose }: { project: Project; onClose: () => void }) {
  const riskColor = getRiskColor(project.riskLevel);
  const paymentData = buildPaymentData(project);
  const progressData = buildProgressData(project);
  const radarData = buildRadarData(project);

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:w-[560px] lg:w-[600px] lg:max-w-[600px] p-0 flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border bg-card shrink-0">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <IconChartBarAlt className="size-5 text-violet-500" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Project Analytics & Graphs</div>
              <SheetTitle className="text-sm font-bold text-foreground leading-tight line-clamp-2 max-w-[420px]">
                {project.name}
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-muted-foreground font-mono">{project.workOrderNo}</span>
                <span className="text-muted-foreground/40">·</span>
                <RiskStatusBadge riskLevel={project.riskLevel} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors shrink-0">
            <IconX className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Progress vs Target */}
          <div className="px-5 pt-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <IconChartAreaLine className="size-3.5 text-primary" />
              Progress vs Target (Monthly)
            </h3>
            <div className="rounded-xl border bg-card p-4">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={progressData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPanelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={riskColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={riskColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)" }} />
                  <Area type="monotone" dataKey="target" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Target %" />
                  <Area type="monotone" dataKey="progress" stroke={riskColor} strokeWidth={2.5} fill="url(#gPanelGrad)" name="Progress %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Milestones */}
          {paymentData.length > 0 && (
            <div className="px-5 mt-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <IconChartBar className="size-3.5 text-primary" />
                Payment Milestones (₹ Lakhs)
              </h3>
              <div className="rounded-xl border bg-card p-4">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={paymentData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)" }} />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} name="Amount (₹L)">
                      {paymentData.map((entry, i) => (
                        <Cell key={i} fill={entry.status === "Paid" ? "#10b981" : entry.status === "Pending" ? "#f59e0b" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2 justify-center">
                  {[{ color: "#10b981", label: "Paid" }, { color: "#f59e0b", label: "Pending" }, { color: "#ef4444", label: "Rejected" }].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="size-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                      {l.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Multi-dimension Radar */}
          <div className="px-5 mt-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <IconSparkles className="size-3.5 text-violet-500" />
              AI Audit Multi-Dimension Score
            </h3>
            <div className="rounded-xl border bg-card p-4">
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData} margin={{ top: 8, right: 30, bottom: 8, left: 30 }}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Score" dataKey="value" stroke={riskColor} fill={riskColor} fillOpacity={0.2} strokeWidth={2.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Fund Flow Summary */}
          <div className="px-5 mt-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <IconCurrencyRupee className="size-3.5 text-emerald-500" />
              Fund Flow Overview
            </h3>
            <div className="rounded-xl border bg-card p-4">
              <ResponsiveContainer width="100%" height={130}>
                <BarChart
                  data={[
                    { name: "Sanctioned", amount: project.sanctionedAmount, fill: "#6366f1" },
                    { name: "Released", amount: project.releasedAmount, fill: "#0ea5e9" },
                    { name: "Expended", amount: project.expenditure, fill: "#10b981" },
                  ]}
                  layout="vertical"
                  margin={{ left: 20, right: 20, top: 8, bottom: 8 }}
                >
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={65} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid var(--border)" }} formatter={(v) => [`₹${v}L`, "Amount"]} />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                    {[{ fill: "#6366f1" }, { fill: "#0ea5e9" }, { fill: "#10b981" }].map((c, i) => (
                      <Cell key={i} fill={c.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score Summary Cards */}
          <div className="px-5 mt-5 mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Score Summary</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Risk Score", value: project.riskScore, color: riskColor },
                { label: "Evidence", value: project.evidenceScore ?? 60, color: "#6366f1" },
                { label: "Inspection", value: Math.min(100, project.inspections * 20), color: "#0ea5e9" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border bg-card p-3 text-center">
                  <div className="text-[10px] text-muted-foreground mb-1">{s.label}</div>
                  <div className="text-xl font-extrabold font-mono" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-muted-foreground">/ 100</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card/80 shrink-0 flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5" onClick={onClose}>
            <IconX className="size-3.5" /> Close
          </Button>
          <Button size="sm" className="flex-1 text-xs gap-1.5">
            <IconDownload className="size-3.5" /> Export Charts
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT HELPER
// ═══════════════════════════════════════════════════════════════════════════
function exportDashboard(
  user: User,
  projects: Project[],
  filterLabel: string = "All",
) {
  const wb = XLSX.utils.book_new();
  const ts = new Date().toLocaleDateString("en-IN");

  const projectRows = [
    ["NIDHI-RAKSHAK Executive Project Export", "", "", "", "", "", "", "", ""],
    [`Role: ${user.role}`, `Name: ${user.name}`, `Filter: ${filterLabel}`, "", "", "", "", `Exported: ${ts}`, ""],
    [`Total Projects in Export: ${projects.length}`, "", "", "", "", "", "", "", ""],
    [""],
    ["#","Work Order No","Project Name","Category","Sub-Category","State","District","Constituency","MP Name","Sanctioned (₹L)","Released (₹L)","Expenditure (₹L)","Progress %","Status","Risk Level","Risk Score","UC Submitted","Asset Created","Sanction Date","Expected Completion","Completion Date","Photos","Inspections"],
    ...projects.map((p, i) => [i+1,p.workOrderNo,p.name,p.category,p.subCategory,p.state,p.district,p.constituency,p.mpName,p.sanctionedAmount,p.releasedAmount,p.expenditure,p.progress,p.status,p.riskLevel,p.riskScore,p.ucSubmitted?"Yes":"No",p.assetCreated?"Yes":"No",p.sanctionDate,p.expectedCompletion,p.completionDate??"—",p.photos,p.inspections]),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(projectRows);
  ws1["!cols"] = [4,14,42,18,20,14,16,18,20,12,12,12,10,12,10,10,10,10,12,14,14,8,10].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws1, "Projects");

  // Risk summary sheet
  const riskRows = [
    ["Risk Summary"],
    [""],
    ["Risk Level", "Count", "% of Total"],
    ...["High","Critical","Medium","Low"].map((lvl) => {
      const cnt = projects.filter((p) => p.riskLevel === lvl).length;
      return [lvl, cnt, projects.length > 0 ? ((cnt / projects.length) * 100).toFixed(1) + "%" : "0%"];
    }),
    [""],
    ["Status", "Count", "% of Total"],
    ...["Completed","In Progress","Delayed","Not Started"].map((s) => {
      const cnt = projects.filter((p) => p.status === s).length;
      return [s, cnt, projects.length > 0 ? ((cnt / projects.length) * 100).toFixed(1) + "%" : "0%"];
    }),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(riskRows);
  XLSX.utils.book_append_sheet(wb, ws2, "Risk Summary");

  const fundRows = [["Fund History — FY-wise Allocation & Utilization"],[""],["Financial Year","Allocated (₹Cr)","Released (₹Cr)","Utilized (₹Cr)","Lapsed (₹Cr)","Utilization %"],...FUND_HISTORY.map((f) => [f.year,(f.allocated/100).toFixed(2),(f.released/100).toFixed(2),(f.utilized/100).toFixed(2),(f.lapsed/100).toFixed(2),f.released>0?((f.utilized/f.released)*100).toFixed(1)+"%":"—"])];
  const ws3 = XLSX.utils.aoa_to_sheet(fundRows);
  XLSX.utils.book_append_sheet(wb, ws3, "Fund History");

  const role = user.role;
  const scope = role==="MP"?user.constituency:role==="District"?user.district:role==="State"?user.state:"National";
  const safeFilter = filterLabel.replace(/[^a-zA-Z0-9]/g, "-");
  XLSX.writeFile(wb, `NIDHI-RAKSHAK_${role}_${scope}_${safeFilter}_${ts.replace(/\//g,"-")}.xlsx`);
}

// ═══════════════════════════════════════════════════════════════════════════
// CITIZEN PROJECT DETAILS PANEL (Heading & Description Only, No Risk Score)
// ═══════════════════════════════════════════════════════════════════════════
function CitizenProjectDetailsPanel({
  project,
  onClose,
  onNavigate,
}: {
  project: Project;
  onClose: () => void;
  onNavigate: (p: string) => void;
}) {
  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] p-0 flex flex-col overflow-hidden"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="p-5 border-b border-border bg-card flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
              Public Overview
            </span>
            <SheetTitle className="text-base font-bold text-foreground mt-1 leading-snug">
              {project.name}
            </SheetTitle>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors shrink-0"
          >
            <IconX className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content: Only Heading and Description, no more information, no risk score */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Project Title
            </h4>
            <p className="text-sm font-semibold text-foreground">
              {project.name}
            </p>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-border/60">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Description
            </h4>
            <p className="text-sm text-foreground leading-relaxed">
              {project.category} · {project.subCategory}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Public community development work executed in {project.constituency}, {project.district} ({project.state}) under the MPLADS programme for public benefit.
            </p>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-border/60">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Locality
            </h4>
            <p className="text-xs text-foreground flex items-center gap-1.5">
              <IconMapPin className="size-3.5 text-primary shrink-0" />
              <span>{project.constituency}, {project.district} ({project.state})</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card/80 shrink-0 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs gap-1.5"
            onClick={() => {
              onClose();
              onNavigate(`3d-view?projectId=${project.id}`);
            }}
          >
            <IconCube className="size-3.5" /> View in 3D
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
export default function Dashboard({ user, onNavigate }: Props) {
  const isMinistry = user.role === "Ministry";
  const isMP = user.role === "MP";
  const isDistrict = user.role === "District";
  const isCitizen = user.role === "Citizen";

  const [timePeriod, setTimePeriod] = React.useState("fy-all");
  const [projectFilter, setProjectFilter] = React.useState("all");
  const [pageSize, setPageSize] = React.useState(15);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [lastSynced, setLastSynced] = React.useState<Date>(() => new Date(2024, 9, 15, 11, 42));
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [panelType, setPanelType] = React.useState<"report" | "status" | "graphs" | null>(null);

  const filterLabel = React.useMemo(() => {
    if (projectFilter === "completed") return "Completed";
    if (projectFilter === "delayed") return "Delayed";
    if (projectFilter === "risk") return "High Risk";
    return "All Works";
  }, [projectFilter]);

  const {
    projects: liveProjects,
    isLoading: isLoadingProjects,
    refresh: refreshProjects,
    syncNow,
  } = useProjects({
    district: user.role === "District" ? user.district : undefined,
    constituency: user.role === "MP" ? user.constituency : undefined,
    state: user.role === "State" ? user.state : undefined,
    limit: user.role === "Ministry" ? 1000 : 500,
  });

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await syncNow(true);
      setLastSynced(new Date());
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const openPanel = (project: Project, type: "report" | "status" | "graphs") => {
    setSelectedProject(project);
    setPanelType(type);
  };

  const closePanel = () => {
    setSelectedProject(null);
    setPanelType(null);
  };

  const showProjects = React.useMemo(() => {
    if (user.role === "MP") {
      const match = liveProjects.filter(
        (p) =>
          (user.constituency && p.constituency?.toLowerCase() === user.constituency?.toLowerCase()) ||
          (user.district && p.district?.toLowerCase() === user.district?.toLowerCase())
      );
      return match.length > 0 ? match : liveProjects;
    }
    if (user.role === "District") {
      const match = liveProjects.filter(
        (p) => user.district && p.district?.toLowerCase() === user.district?.toLowerCase()
      );
      return match.length > 0 ? match : liveProjects;
    }
    if (user.role === "State") {
      const match = liveProjects.filter(
        (p) => user.state && p.state?.toLowerCase() === user.state?.toLowerCase()
      );
      return match.length > 0 ? match : liveProjects;
    }
    return liveProjects;
  }, [liveProjects, user.role, user.constituency, user.district, user.state]);

  const filteredProjects = React.useMemo(() => {
    if (projectFilter === "completed") return showProjects.filter((p) => p.status === "Completed");
    if (projectFilter === "delayed") return showProjects.filter((p) => p.status === "Delayed");
    if (projectFilter === "risk") return showProjects.filter((p) => p.riskScore > 50 || p.riskLevel === "High" || p.riskLevel === "Critical");
    return showProjects;
  }, [showProjects, projectFilter]);

  // Reset to page 1 whenever filter or page size changes
  React.useEffect(() => { setCurrentPage(1); }, [projectFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const pagedProjects = filteredProjects.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeAlerts = ALERTS.filter((a) => a.status === "Active").slice(0, 4);

  const filteredMonthlyExpenditure = React.useMemo(() => {
    if (timePeriod === "h1") return MONTHLY_EXPENDITURE.slice(0, 6);
    if (timePeriod === "q2") return MONTHLY_EXPENDITURE.slice(3, 6);
    return MONTHLY_EXPENDITURE;
  }, [timePeriod]);

  const lineTrendData = React.useMemo(() => FUND_HISTORY.map((f, idx) => {
    const utilRate = f.released > 0 ? Math.round((f.utilized / f.released) * 100) : 0;
    return { year: f.year, utilizationRate: utilRate, completionRate: Math.min(100, Math.round(utilRate * 0.92 + (idx > 2 ? 6 : 2))), allocated: Math.round(f.allocated / 100), utilized: Math.round(f.utilized / 100) };
  }), []);

  const stateBarData = React.useMemo(() => STATES_DATA.map((s) => ({
    state: s.state.replace("Pradesh", "P.").replace("Bengal", "B."),
    totalFunds: Math.round(s.totalFunds / 100),
    utilizedFunds: Math.round(s.utilizedFunds / 100),
  })), []);

  const totalSectorCount = CATEGORY_DISTRIBUTION.reduce((s, c) => s + c.value, 0);

  // ── Citizen view ──────────────────────────────────────────────────────
  if (isCitizen) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Citizen Hero Banner */}
        <Card className="bg-primary text-primary-foreground border-none shadow-md overflow-hidden relative">
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-8 opacity-10 pointer-events-none">
            <IconCube className="size-80" />
          </div>
          <CardHeader className="p-6 md:p-8 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-none">Citizen Transparency Portal</Badge>
              <span className="text-xs text-primary-foreground/80 font-mono">Real-time Public Works & 3D Twins</span>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-primary-foreground">
              Track Public Works In Your Constituency (NIDHI-RAKSHAK)
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-sm mt-1 max-w-2xl">
              Inspect verified public fund allocation, explore interactive 3D digital twins of infrastructure, track on-ground progress with GPS geo-tagged photos, and report anomalies directly.
            </CardDescription>

            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <div className="relative flex-1 min-w-[240px]">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter district, constituency, or project name..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-card text-foreground border border-input text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground"
                />
              </div>
              <Button variant="secondary" className="font-semibold text-xs h-10 px-5">Search Works</Button>
              <Button
                variant="outline"
                onClick={() => onNavigate("3d-view")}
                className="font-semibold text-xs h-10 px-4 gap-1.5 bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground border-primary-foreground/30 backdrop-blur-xs"
              >
                <IconCube className="size-4 text-cyan-300" />
                3D Digital Twin Studio
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate("gis")}
                className="font-semibold text-xs h-10 px-4 gap-1.5 bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground border-primary-foreground/30 backdrop-blur-xs"
              >
                <IconMap className="size-4" />
                GIS Map
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Projects", value: "89,472", sub: "Nationwide works", icon: IconBuildingCommunity },
            { label: "Completed Works", value: "62,841", sub: "Verified public assets", icon: IconCircleCheck },
            { label: "Active Execution", value: "21,847", sub: "Under construction", icon: IconClock },
            { label: "Total Investment", value: "₹1,68,200 Cr", sub: "Disbursed to date", icon: IconCoin },
          ].map((item) => {
            const IconComp = item.icon;
            return (
              <Card key={item.label} className="@container/card">
                <CardHeader>
                  <CardDescription>{item.label}</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">{item.value}</CardTitle>
                  <CardAction>
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <IconComp className="size-4" />
                    </div>
                  </CardAction>
                </CardHeader>
                <CardFooter className="text-xs text-muted-foreground">{item.sub}</CardFooter>
              </Card>
            );
          })}
        </div>

        {/* ── 3D Digital Twin Showcase Section ── */}
        <Card className="border border-border/80 shadow-sm overflow-hidden bg-card">
          <CardHeader className="p-6 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="border-cyan-500/40 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 gap-1 text-[11px] font-semibold">
                    <IconCube className="size-3.5" /> 3D Digital Twin & BIM Models
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">Interactive Physical Audits</span>
                </div>
                <CardTitle className="text-lg md:text-xl font-bold text-foreground">
                  Constituency Public Infrastructure 3D Twin
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Inspect 3D digital twins of public works with structural layers, physical milestones, GPS coordinates, and statutory verification checks.
                </CardDescription>
              </div>
              <Button
                onClick={() => onNavigate("3d-view")}
                className="gap-2 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold h-9"
              >
                <IconCube className="size-4" />
                Launch 3D Explorer
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURED_3D_PROJECTS.map((p3d) => {
                const stepCount = p3d.steps.length;
                const checkCount = p3d.steps.reduce((acc, s) => acc + s.statutoryChecks.length, 0);
                return (
                  <div
                    key={p3d.id}
                    className="group relative p-4 rounded-xl border border-border/70 bg-muted/20 hover:bg-muted/40 hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px] font-medium capitalize bg-secondary text-secondary-foreground">
                          {p3d.categoryLabel}
                        </Badge>
                        <span className="text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400">
                          {p3d.overallProgress}% Complete
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {p3d.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <IconMapPin className="size-3 shrink-0" />
                        {p3d.location}, {p3d.constituency}
                      </p>

                      {/* Progress Track */}
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span className="truncate">{p3d.currentMilestone}</span>
                          <span className="font-mono text-foreground font-medium shrink-0">{p3d.expenditure}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${p3d.overallProgress}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground border-t border-border/50 pt-2.5">
                        <span className="flex items-center gap-1">
                          <IconBuildingCommunity className="size-3 text-primary" />
                          {stepCount} BIM Stages
                        </span>
                        <span className="flex items-center gap-1">
                          <IconShieldCheck className="size-3 text-emerald-500" />
                          {checkCount} Statutory Audits
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-border/50 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onNavigate(`3d-view?projectId=${p3d.id}`)}
                        className="flex-1 h-8 text-xs font-semibold gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-xs"
                      >
                        <IconCube className="size-3.5" />
                        View 3D Model
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onNavigate("gis")}
                        className="h-8 text-xs px-3"
                        title="View on Geo-Spatial GIS Map"
                      >
                        <IconMap className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Local Constituency Public Works ── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Active Works in Constituency</CardTitle>
              <CardDescription className="text-xs">
                Browse on-ground infrastructure works in your locality, track budgets, and inspect 3D twin models.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("projects")} className="text-xs text-primary">
              All Works →
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {showProjects.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors gap-3"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {p.category} · {p.subCategory} — {p.district || p.constituency} ({p.state})
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openPanel(p, "status")}
                    className="h-7 text-xs text-foreground hover:bg-muted font-medium"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right-side Panels for Citizen (Heading and Description Only, No Risk Score) */}
        {selectedProject && panelType === "status" && (
          <CitizenProjectDetailsPanel project={selectedProject} onClose={closePanel} onNavigate={onNavigate} />
        )}
      </div>
    );
  }

  // ── KPI list ──────────────────────────────────────────────────────────
  const kpiList = isMinistry
    ? [
        { label: "Total Projects", value: "89,472", sub: "Nationwide across 543 constituencies", footer: "Active public asset portfolio", trend: "+12.4%", isPositive: true },
        { label: "Completed Works", value: "62,841", sub: `${pct(NATIONAL_KPIs.completedProjects, NATIONAL_KPIs.totalProjects)} completion benchmark`, footer: "Trending above target", trend: "+8.2%", isPositive: true },
        { label: "Fund Utilization", value: "84.8%", sub: "₹1,68,200 Cr of ₹1,98,400 Cr released", footer: "Solid pace in Q2", trend: "+3.1%", isPositive: true },
        { label: "Flagged Risks", value: "3,847", sub: "AI anomaly detection triggers", footer: "Resolution in progress", trend: "-5.3%", isPositive: true },
      ]
    : isMP
    ? [
        { label: "Constituency Works", value: String(showProjects.length), sub: `In ${user.constituency} constituency`, footer: "All active work orders", trend: "+4 new", isPositive: true },
        { label: "Completed Works", value: String(showProjects.filter((p) => p.status === "Completed").length), sub: "Verified on-ground completion", footer: `${pct(showProjects.filter((p) => p.status === "Completed").length, showProjects.length)} success rate`, trend: "On Track", isPositive: true },
        { label: "Disbursed Funds", value: fmt(showProjects.reduce((s, p) => s + p.expenditure, 0)), sub: "Direct ground disbursements", footer: "87.4% fund deployment", trend: "+8.2%", isPositive: true },
        { label: "Active Risk Alerts", value: String(showProjects.filter((p) => p.riskScore > 50).length), sub: "High/Critical inspection triggers", footer: "Requires MP review", trend: "Urgent", isPositive: false },
      ]
    : [
        { label: "Total Projects", value: isDistrict ? "482" : "1,847", sub: `Jurisdiction: ${user.district || user.state}`, footer: "Tracked in real-time", trend: "+8.2%", isPositive: true },
        { label: "Completed Works", value: isDistrict ? "314" : "1,204", sub: "65.2% milestone completion", footer: "Meets SLA expectation", trend: "+4.1%", isPositive: true },
        { label: "Fund Utilization", value: "75.0%", sub: "₹6,180 Cr of ₹8,240 Cr deployed", footer: "Q2 target trajectory", trend: "+2.1%", isPositive: true },
        { label: "Risk Flags", value: isDistrict ? "24" : "94", sub: "Open for verification", footer: "Under field audit", trend: "+12.5%", isPositive: false },
      ];

  return (
    <div className="space-y-6">
      {/* ── Header + Sync Strip ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {isMinistry ? "National NIDHI-RAKSHAK Executive Overview"
                : isMP ? `${user.constituency} Constituency Dashboard`
                : user.role === "State" ? `${user.state} — State Level Dashboard`
                : `${user.district} District Overview`}
            </h1>
            <Badge variant="secondary" className="font-mono text-[10px] hidden md:inline-flex">PFMS-INTEGRATED</Badge>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Real-time project monitoring, risk insights and fund utilisation
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card shadow-xs">
            <div className={`size-2 rounded-full shrink-0 ${isSyncing ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
            <div>
              <div className="text-[10px] text-muted-foreground leading-none">Last Synced</div>
              <div className="text-[11px] font-medium text-foreground leading-tight mt-0.5 font-mono">{formatSyncTime(lastSynced)}</div>
            </div>
          </div>
          <Button size="sm" onClick={handleSync} disabled={isSyncing} className="text-xs h-10 gap-1.5 font-medium min-w-[110px]">
            {isSyncing ? <IconLoader2 className="size-4 animate-spin" /> : <IconRefresh className="size-4" />}
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportDashboard(user, filteredProjects, filterLabel)}
            className="text-xs h-10 gap-1.5 hidden md:flex"
            title={`Export ${filteredProjects.length} ${filterLabel} projects to Excel`}
          >
            <IconFileSpreadsheet className="size-4 text-emerald-600" />
            Export ({filteredProjects.length})
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiList.map((kpi) => (
          <Card key={kpi.label} className="@container/card bg-linear-to-t from-primary/5 to-card shadow-xs dark:bg-card">
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">{kpi.value}</CardTitle>
              <CardAction>
                <Badge variant="outline" className={kpi.isPositive ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10" : "border-destructive/30 text-destructive bg-destructive/10"}>
                  {kpi.isPositive ? <IconTrendingUp className="size-3.5 mr-1" /> : <IconTrendingDown className="size-3.5 mr-1" />}
                  {kpi.trend}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-xs">
              <div className="line-clamp-1 font-medium text-foreground">{kpi.footer}</div>
              <div className="text-muted-foreground">{kpi.sub}</div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* ── Ongoing Projects + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <IconClipboardCheck className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Ongoing Projects & Works</CardTitle>
                <CardDescription className="text-xs">
                  Live list of projects under implementation in your {isDistrict ? "district" : isMP ? "constituency" : "jurisdiction"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Filter selector */}
              <Select value={projectFilter} onValueChange={(v) => { if (v) setProjectFilter(v); }}>
                <SelectTrigger size="sm" className="w-28 text-xs hidden sm:flex">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Works</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="risk">High Risk</SelectItem>
                </SelectContent>
              </Select>
              {/* Rows per page */}
              <Select value={String(pageSize)} onValueChange={(v) => { if (v) setPageSize(Number(v)); }}>
                <SelectTrigger size="sm" className="w-20 text-xs hidden sm:flex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="15">15 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("projects")} className="text-xs text-primary font-medium gap-1">
                All <IconArrowUpRight className="size-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/60">
                  <TableHead className="text-[11px] pl-6 w-8">#</TableHead>
                  <TableHead className="text-[11px]">Project Name</TableHead>
                  <TableHead className="text-[11px]">Sector</TableHead>
                  <TableHead className="text-[11px] text-right">Sanctioned (₹)</TableHead>
                  <TableHead className="text-[11px]">Progress</TableHead>
                  <TableHead className="text-[11px]">Exp. Completion</TableHead>
                  <TableHead className="text-[11px]">Risk Status</TableHead>
                  <TableHead className="text-[11px] text-center pr-4">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedProjects.map((project, index) => (
                  <TableRow key={project.id} className="hover:bg-muted/40 transition-colors group">
                    <TableCell className="pl-6 text-xs text-muted-foreground font-mono w-8">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px]">
                      <div className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{project.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{project.workOrderNo}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                          <SectorIcon category={project.category} className="text-primary" />
                        </div>
                        <span className="text-muted-foreground text-[11px] line-clamp-2 max-w-[90px]">{project.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono font-semibold text-right">{fmt(project.sanctionedAmount)}</TableCell>
                    <TableCell className="text-xs">
                      <ProgressBar value={project.progress} riskLevel={project.riskLevel} />
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground font-mono">{project.expectedCompletion}</TableCell>
                    <TableCell><RiskStatusBadge riskLevel={project.riskLevel} /></TableCell>
                    <TableCell className="text-center pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="inline-flex items-center justify-center size-7 rounded-lg hover:bg-muted transition-colors focus:outline-none"
                          title="Project actions"
                        >
                          <IconDotsVertical className="size-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => openPanel(project, "report")}>
                            <IconFileText className="size-3.5 text-primary" />
                            Report
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => openPanel(project, "status")}>
                            <IconListDetails className="size-3.5 text-blue-500" />
                            Detailed Status
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => openPanel(project, "graphs")}>
                            <IconChartBarAlt className="size-3.5 text-violet-500" />
                            Graphs
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs gap-2 cursor-pointer" onClick={() => onNavigate(`3d-view?projectId=${project.id}`)}>
                            <IconCube className="size-3.5 text-cyan-500" />
                            3D Digital Twin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Empty state */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-10 text-xs text-muted-foreground">No projects match the selected filter.</div>
            )}

            {/* Pagination footer */}
            {filteredProjects.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 gap-3">
                {/* Info */}
                <span className="text-[11px] text-muted-foreground shrink-0">
                  Showing <strong className="text-foreground">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredProjects.length)}</strong>
                  {" "}of <strong className="text-foreground">{filteredProjects.length}</strong> {filterLabel} projects
                </span>

                {/* Page controls */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 text-xs"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                    title="First page"
                  >
                    «
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    ‹ Prev
                  </Button>

                  {/* Page number pills */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page: number;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`h-7 min-w-[28px] px-1.5 rounded-md text-[11px] font-medium transition-colors ${
                            page === currentPage
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted text-muted-foreground"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next ›
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 text-xs"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    title="Last page"
                  >
                    »
                  </Button>
                </div>

                {/* Export filtered */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] gap-1.5 text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 shrink-0"
                  onClick={() => exportDashboard(user, filteredProjects, filterLabel)}
                  title={`Download all ${filteredProjects.length} ${filterLabel} projects`}
                >
                  <IconFileSpreadsheet className="size-3.5" />
                  Export {filteredProjects.length}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Project Distribution by Sector</CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono">
                  <IconChartPie className="size-3 mr-1" />
                  {isDistrict ? "482" : isMP ? showProjects.length : "1,847"} Projects
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[180px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie data={CATEGORY_DISTRIBUTION} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={3}>
                    {CATEGORY_DISTRIBUTION.map((_, index) => (
                      <Cell key={`sidebar-pie-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="space-y-1.5 mt-2">
                {CATEGORY_DISTRIBUTION.map((cat, index) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className="text-muted-foreground text-[11px]">{cat.name}</span>
                    </div>
                    <span className="font-mono text-[11px] font-medium text-foreground">{Math.round((cat.value / totalSectorCount) * 100)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-1.5">
                <IconBolt className="size-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {[
                { label: "View High Risk Projects", icon: IconAlertTriangle, color: "text-red-500", hover: "hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-900/10 dark:hover:text-red-400", action: () => onNavigate("risk") },
                { label: "3D Digital Twin Explorer", icon: IconCube, color: "text-cyan-500", hover: "hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700 dark:hover:bg-cyan-900/10 dark:hover:text-cyan-400", action: () => onNavigate("3d-view") },
                { label: "Field Verification Schedule", icon: IconCalendarEvent, color: "text-blue-500", hover: "hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-900/10 dark:hover:text-blue-400", action: () => onNavigate("compliance") },
                { label: "Download District Report", icon: IconDownload, color: "text-emerald-500", hover: "hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 dark:hover:bg-emerald-900/10 dark:hover:text-emerald-400", action: () => exportDashboard(user, filteredProjects, filterLabel) },
                { label: "AI Audit Engine", icon: IconSparkles, color: "text-violet-500", hover: "hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 dark:hover:bg-violet-900/10 dark:hover:text-violet-400", action: () => onNavigate("ai-audit") },
              ].map((item) => {
                const IconComp = item.icon;
                return (
                  <Button key={item.label} variant="outline" className={`w-full justify-between text-xs h-9 font-medium group transition-colors ${item.hover}`} onClick={item.action}>
                    <span className="flex items-center gap-2">
                      <IconComp className={`size-4 ${item.color}`} />
                      {item.label}
                    </span>
                    <IconArrowUpRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Charts: Area + Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 @container/card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Monthly Fund Utilization Trajectory</CardTitle>
              <CardDescription className="text-xs">Monthly actual expenditure vs planned targets (FY 2024-25 in ₹ Crore)</CardDescription>
            </div>
            <CardAction>
              <ToggleGroup multiple={false} value={[timePeriod]} onValueChange={(val) => { if (val?.[0]) setTimePeriod(val[0]); }} variant="outline" className="hidden *:data-[slot=toggle-group-item]:px-3! md:flex">
                <ToggleGroupItem value="fy-all">All Year</ToggleGroupItem>
                <ToggleGroupItem value="h1">H1 (Apr-Sep)</ToggleGroupItem>
                <ToggleGroupItem value="q2">Q2 (Jul-Sep)</ToggleGroupItem>
              </ToggleGroup>
              <Select value={timePeriod} onValueChange={(val) => { if (val !== null) setTimePeriod(val); }}>
                <SelectTrigger className="flex w-32 md:hidden" size="sm"><SelectValue placeholder="Period" /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="fy-all">All Year</SelectItem>
                  <SelectItem value="h1">H1 (Apr-Sep)</SelectItem>
                  <SelectItem value="q2">Q2 (Jul-Sep)</SelectItem>
                </SelectContent>
              </Select>
            </CardAction>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={areaChartConfig} className="aspect-auto h-[260px] w-full">
              <AreaChart data={filteredMonthlyExpenditure} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaExpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-[11px]" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-[11px]" />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area type="monotone" dataKey="target" stroke="var(--chart-2)" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
                <Area type="monotone" dataKey="expenditure" stroke="var(--chart-1)" strokeWidth={2} fill="url(#areaExpGradient)" />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 @container/card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Sector Distribution</CardTitle>
                <CardDescription className="text-xs">NIDHI-RAKSHAK project count share</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono"><IconChartPie className="size-3 mr-1" /> Donut</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[260px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={CATEGORY_DISTRIBUTION} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {CATEGORY_DISTRIBUTION.map((_, index) => (
                    <Cell key={`pie-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" className="-translate-y-2 flex-wrap gap-2 text-[10px]" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Bar + Line Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">State Fund Sanctioned vs Utilized</CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono"><IconChartBar className="size-3 mr-1" /> Bar Chart</Badge>
              </div>
              <CardDescription className="text-xs">Capital allocations against verified ground expenditures (₹ Cr)</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("gis")} className="text-xs text-primary">GIS Map →</Button>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={barChartConfig} className="aspect-auto h-[260px] w-full">
              <BarChart data={stateBarData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="state" tickLine={false} axisLine={false} tickMargin={8} className="text-[11px]" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-[11px]" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="totalFunds" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="utilizedFunds" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">Utilization & Completion Velocity</CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono"><IconChartLine className="size-3 mr-1" /> Line</Badge>
              </div>
              <CardDescription className="text-xs">Year-over-Year utilization & completion curve (FY 2019-20 to 2024-25)</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("reports")} className="text-xs text-primary">Audits →</Button>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={lineChartConfig} className="aspect-auto h-[260px] w-full">
              <LineChart data={lineTrendData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} className="text-[11px]" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[60, 100]} className="text-[11px]" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="utilizationRate" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--chart-1)" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="completionRate" stroke="var(--chart-3)" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: "var(--chart-3)" }} />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── AI Risk Alerts ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Active AI Risk Alerts</CardTitle>
            <CardDescription className="text-xs">{activeAlerts.length} urgent triggers requiring intervention</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("alerts")} className="text-xs text-destructive hover:text-destructive/80">View All →</Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {activeAlerts.map((alert) => (
              <div key={alert.id} onClick={() => onNavigate("alerts")} className="group p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-start gap-2.5">
                  <div className={`size-2 rounded-full mt-1.5 shrink-0 ${alert.severity === "Critical" ? "bg-destructive animate-pulse" : alert.severity === "High" ? "bg-amber-500" : "bg-blue-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-foreground line-clamp-1">{alert.title.replace(/^(Critical|High|Medium|Low):\s*/, "")}</span>
                      <Badge variant={alert.severity === "Critical" ? "destructive" : "outline"} className="text-[9px] px-1 py-0 uppercase shrink-0">{alert.severity}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{alert.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 pt-1.5 border-t border-border/50">
                      <span>{alert.district ? `${alert.district}, ${alert.state}` : alert.state || "National"}</span>
                      <span className="font-mono">{alert.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Ministry Fund Table ── */}
      {isMinistry && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">National Fund Summary — Year-wise</CardTitle>
              <CardDescription className="text-xs">Historical allocation, disbursement, ground utilization, and lapse amounts (₹ in Crore)</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => onNavigate("reports")} className="text-xs">Full Audit Dossier →</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Financial Year</TableHead>
                  <TableHead className="text-xs text-right">Allocated</TableHead>
                  <TableHead className="text-xs text-right">Released</TableHead>
                  <TableHead className="text-xs text-right">Utilized</TableHead>
                  <TableHead className="text-xs text-right">Lapsed</TableHead>
                  <TableHead className="text-xs text-right">Utilization %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {FUND_HISTORY.map((f) => {
                  const utilPct = Number(((f.utilized / f.released) * 100).toFixed(1));
                  return (
                    <TableRow key={f.year} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-xs">{f.year}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">₹{(f.allocated / 100).toFixed(0)}Cr</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">₹{(f.released / 100).toFixed(0)}Cr</TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-foreground">₹{(f.utilized / 100).toFixed(0)}Cr</TableCell>
                      <TableCell className="text-right font-mono text-xs text-destructive">₹{(f.lapsed / 100).toFixed(0)}Cr</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={`font-mono text-xs font-semibold ${utilPct >= 88 ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/10" : utilPct >= 80 ? "border-amber-500/50 text-amber-600 bg-amber-500/10" : "border-destructive/50 text-destructive bg-destructive/10"}`}>
                          {utilPct}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ── Right-side Panels ── */}
      {selectedProject && panelType === "report" && (
        <ReportPanel project={selectedProject} onClose={closePanel} />
      )}
      {selectedProject && panelType === "status" && (
        <DetailedStatusPanel project={selectedProject} onClose={closePanel} onNavigate={onNavigate} />
      )}
      {selectedProject && panelType === "graphs" && (
        <GraphsPanel project={selectedProject} onClose={closePanel} />
      )}
    </div>
  );
}
