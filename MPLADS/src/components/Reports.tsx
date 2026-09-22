"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import {
  FUND_HISTORY,
  MONTHLY_EXPENDITURE,
  CATEGORY_DISTRIBUTION,
  STATES_DATA,
} from "../data/mpladsData";
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
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  IconFileAnalytics,
  IconFileTypePdf,
  IconFileSpreadsheet,
  IconPrinter,
  IconCoins,
  IconProgressCheck,
  IconMapPin,
  IconAlertTriangle,
  IconBuildingBank,
  IconSend,
  IconCircleCheck,
  IconHourglassEmpty,
  IconArrowUpRight,
  IconTrendingUp,
  IconHammer,
  IconClockHour4,
  IconShieldExclamation,
  IconSparkles,
} from "@tabler/icons-react";

const SECTOR_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#64748B",
];

interface Props {
  user: User;
  initialTab?: "financial" | "physical" | "state" | "risk";
}

export default function Reports({ user, initialTab = "financial" }: Props) {
  const [reportType, setReportType] = useState<
    "financial" | "physical" | "state" | "risk"
  >(initialTab);

  useEffect(() => {
    if (initialTab) {
      setReportType(initialTab);
    }
  }, [initialTab]);
  const [stateSearch, setStateSearch] = useState("");

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return STATES_DATA;
    return STATES_DATA.filter((s) =>
      s.state.toLowerCase().includes(stateSearch.toLowerCase())
    );
  }, [stateSearch]);

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
              <IconFileAnalytics className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                Reports & Analytics
              </h1>
              <p className="text-xs text-muted-foreground md:text-sm">
                National NIDHI-RAKSHAK reporting engine · Export-ready dossiers · Decision intelligence
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
            <IconSparkles className="size-3.5 text-amber-500" />
            FY 2024–25 (Q2)
          </Badge>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium"
            onClick={() => alert("Exporting PDF report...")}
          >
            <IconFileTypePdf className="size-4 text-red-500" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium"
            onClick={() => alert("Exporting Excel file...")}
          >
            <IconFileSpreadsheet className="size-4 text-emerald-600" />
            Excel
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

      {/* ── Report Type Switcher Tabs ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-muted/50 p-1.5 border w-fit max-w-full">
        <button
          onClick={() => setReportType("financial")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            reportType === "financial"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconCoins className="size-4 text-blue-500" />
          Financial Analytics
        </button>
        <button
          onClick={() => setReportType("physical")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            reportType === "physical"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconProgressCheck className="size-4 text-emerald-500" />
          Physical Progress
        </button>
        <button
          onClick={() => setReportType("state")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            reportType === "state"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconMapPin className="size-4 text-indigo-500" />
          State-wise Performance
        </button>
        <button
          onClick={() => setReportType("risk")}
          className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
            reportType === "risk"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <IconAlertTriangle className="size-4 text-amber-500" />
          Risk Summary & Actions
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* 1. FINANCIAL ANALYTICS                                                            */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {reportType === "financial" && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-xs hover:border-primary/40 transition-all">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Allocated (FY 24-25)
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <IconBuildingBank className="size-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                    ₹25,000 Cr
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 text-[10px] text-blue-600 bg-blue-500/10 border-none font-medium"
                    >
                      ₹250Cr / MP
                    </Badge>
                    <span>× 100 MPs (Sample)</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-full" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs hover:border-primary/40 transition-all">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Released to States
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <IconSend className="size-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                    ₹16,800 Cr
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                    <span className="text-indigo-600 font-semibold flex items-center">
                      <IconArrowUpRight className="size-3.5 inline" />
                      67.2%
                    </span>
                    <span>of total allocation</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full w-[67.2%]" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs hover:border-primary/40 transition-all">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Utilized (Expenditure)
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <IconCircleCheck className="size-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                    ₹14,200 Cr
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                    <span className="text-emerald-600 font-semibold flex items-center">
                      <IconTrendingUp className="size-3.5 inline" />
                      84.5%
                    </span>
                    <span>of released funds</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[84.5%]" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs hover:border-primary/40 transition-all">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Pending Release
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <IconHourglassEmpty className="size-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
                    ₹8,200 Cr
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                    <Badge
                      variant="outline"
                      className="px-1.5 py-0 text-[10px] text-amber-600 bg-amber-500/10 border-none font-medium"
                    >
                      Stage 2
                    </Badge>
                    <span>Held at district level</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[32.8%]" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 5-Year Fund Trend Chart */}
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Fund Trend (5 Years)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Multi-year allocation vs release vs actual expenditure (₹ in Crore)
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-xs bg-slate-300 dark:bg-slate-700 inline-block" />
                    <span className="text-muted-foreground">Allocated</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-xs bg-blue-500 inline-block" />
                    <span className="text-muted-foreground">Released</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-xs bg-emerald-500 inline-block" />
                    <span className="text-muted-foreground">Utilized</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-xs bg-red-500 inline-block" />
                    <span className="text-muted-foreground">Lapsed</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={FUND_HISTORY}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v / 1000}k`}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                        color: "var(--foreground)",
                        fontSize: "12px",
                      }}
                      formatter={(val: any, name: any) => [
                        `₹${Number(val).toLocaleString()} Cr`,
                        name,
                      ]}
                    />
                    <Bar
                      dataKey="allocated"
                      fill="#94A3B8"
                      radius={[4, 4, 0, 0]}
                      name="Allocated"
                    />
                    <Bar
                      dataKey="released"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                      name="Released"
                    />
                    <Bar
                      dataKey="utilized"
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                      name="Utilized"
                    />
                    <Bar
                      dataKey="lapsed"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                      name="Lapsed"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Expenditure vs Target */}
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Monthly Expenditure vs Target
                  </CardTitle>
                  <CardDescription className="text-xs">
                    FY 2024–25 monthly burn velocity vs planned trajectory (₹ in Crore)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 border-t-2 border-dashed border-slate-400 inline-block" />
                    <span className="text-muted-foreground">Target Rate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-blue-500 inline-block" />
                    <span className="text-muted-foreground font-medium">
                      Actual Spend
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={MONTHLY_EXPENDITURE}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="spendGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3B82F6"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3B82F6"
                          stopOpacity={0.0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v}Cr`}
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
                      formatter={(val: any, name: any) => [
                        `₹${Number(val).toLocaleString()} Cr`,
                        name === "expenditure" ? "Actual Spend" : "Target",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#94A3B8"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                      name="Target"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenditure"
                      stroke="#3B82F6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#spendGradient)"
                      dot={{
                        r: 4,
                        fill: "#3B82F6",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      name="expenditure"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* 2. PHYSICAL PROGRESS                                                              */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {reportType === "physical" && (
        <div className="space-y-6">
          {/* Top Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-xs">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                  <span>Total Works Sanctioned</span>
                  <IconHammer className="size-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-foreground">
                  89,472
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Across 780+ parliamentary constituencies
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-emerald-500/20">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                  <span>Completed & Certified</span>
                  <IconCircleCheck className="size-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  62,841
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-600 px-1.5 py-0 text-[10px] font-semibold border-none"
                  >
                    70.2%
                  </Badge>
                  <span className="text-muted-foreground">
                    Completion Rate
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                  <span>Works in Progress</span>
                  <IconProgressCheck className="size-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  21,847
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-600 px-1.5 py-0 text-[10px] font-semibold border-none"
                  >
                    24.4%
                  </Badge>
                  <span className="text-muted-foreground">Under execution</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-red-500/20">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                  <span>Delayed Works (&gt;90d)</span>
                  <IconClockHour4 className="size-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-red-600 dark:text-red-400">
                  4,784
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Badge
                    variant="secondary"
                    className="bg-red-500/10 text-red-600 px-1.5 py-0 text-[10px] font-semibold border-none"
                  >
                    5.4%
                  </Badge>
                  <span className="text-muted-foreground">
                    Escalated to DMs
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Donut Chart */}
            <Card className="lg:col-span-6 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Projects by Category
                </CardTitle>
                <CardDescription className="text-xs">
                  Sector-wise breakdown of sanctioned NIDHI-RAKSHAK infrastructure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[260px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={CATEGORY_DISTRIBUTION}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {CATEGORY_DISTRIBUTION.map((entry, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={SECTOR_COLORS[idx % SECTOR_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                          color: "var(--foreground)",
                          fontSize: "12px",
                        }}
                        formatter={(val: any, name: any) => [
                          `${val}% Share`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Progress Bars */}
            <Card className="lg:col-span-6 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Category Share & Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Proportionate focus on public infrastructure assets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 pt-2">
                {CATEGORY_DISTRIBUTION.map((c, idx) => {
                  const color = SECTOR_COLORS[idx % SECTOR_COLORS.length];
                  return (
                    <div key={c.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full inline-block shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium text-foreground">
                            {c.name}
                          </span>
                        </div>
                        <span className="font-mono font-semibold text-foreground">
                          {c.value}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${c.value * 3.2}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* 3. STATE-WISE PERFORMANCE                                                         */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {reportType === "state" && (
        <div className="space-y-6">
          {/* State Comparison Chart */}
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold">
                    State Fund Utilization Comparison
                  </CardTitle>
                  <CardDescription className="text-xs">
                    State-level expenditure efficiency compared against 90% benchmark
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-xs bg-blue-500 inline-block" />
                    <span className="text-muted-foreground">Utilization %</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-xs bg-slate-300 dark:bg-slate-700 inline-block" />
                    <span className="text-muted-foreground">
                      National Target (90%)
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={STATES_DATA.map((s) => ({
                      name: s.state.split(" ")[0],
                      utilization: s.utilization,
                      target: 90,
                    }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
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
                      formatter={(val: any) => [`${val}%`, "Utilization"]}
                    />
                    <Bar
                      dataKey="utilization"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                      name="Utilization %"
                    />
                    <Bar
                      dataKey="target"
                      fill="#E2E8F0"
                      radius={[4, 4, 0, 0]}
                      name="Target (90%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* State Performance Table */}
          <Card className="shadow-xs overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">
                    State-wise NIDHI-RAKSHAK Performance Ledger
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Comprehensive audit ledger across sanctioned funds, completion ratios, and delayed works
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search state..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="w-full h-8 px-3 rounded-lg bg-background border text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/40 text-[11px] uppercase tracking-wider">
                    <TableHead className="font-semibold text-foreground">
                      State / UT
                    </TableHead>
                    <TableHead className="text-right font-semibold text-foreground">
                      Total Works
                    </TableHead>
                    <TableHead className="text-right font-semibold text-foreground">
                      Completed
                    </TableHead>
                    <TableHead className="text-right font-semibold text-foreground">
                      Total Funds
                    </TableHead>
                    <TableHead className="text-right font-semibold text-foreground">
                      Utilized
                    </TableHead>
                    <TableHead className="text-center font-semibold text-foreground">
                      Fund Utilization
                    </TableHead>
                    <TableHead className="text-right font-semibold text-foreground">
                      Delayed
                    </TableHead>
                    <TableHead className="text-right font-semibold text-foreground">
                      Risk Works
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStates.map((s) => {
                    const compPct = Math.round(
                      (s.completedProjects / s.totalProjects) * 100
                    );
                    return (
                      <TableRow
                        key={s.state}
                        className="hover:bg-muted/30 text-xs"
                      >
                        <TableCell className="font-semibold text-foreground">
                          {s.state}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {s.totalProjects.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                          {s.completedProjects.toLocaleString()} ({compPct}%)
                        </TableCell>
                        <TableCell className="text-right font-mono text-muted-foreground">
                          ₹{(s.totalFunds / 100).toFixed(0)} Cr
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-foreground">
                          ₹{(s.utilizedFunds / 100).toFixed(0)} Cr
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  s.utilization >= 85
                                    ? "bg-emerald-500"
                                    : s.utilization >= 70
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${s.utilization}%` }}
                              />
                            </div>
                            <span
                              className={`font-mono font-bold text-xs ${
                                s.utilization >= 85
                                  ? "text-emerald-600"
                                  : s.utilization >= 70
                                  ? "text-amber-600"
                                  : "text-red-600"
                              }`}
                            >
                              {s.utilization}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-red-600 font-medium">
                          {s.delayedProjects}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          <Badge
                            variant={
                              s.riskProjects > 50 ? "destructive" : "secondary"
                            }
                            className="text-[10px] px-1.5 py-0 h-5"
                          >
                            {s.riskProjects}
                          </Badge>
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
      {/* 4. RISK SUMMARY & ACTION PLAN                                                     */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {reportType === "risk" && (
        <div className="space-y-6">
          {/* Red Risk Summary Hero Card */}
          <Card className="border-red-500/30 bg-red-500/5 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-red-500/20 text-red-600">
                  <IconShieldExclamation className="size-4" />
                </div>
                <CardTitle className="text-base font-bold text-red-900 dark:text-red-300">
                  Executive Risk Dossier — September 2024
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-red-700/80 dark:text-red-300/80">
                Automated geospatial and contractor anomaly flags requiring immediate administrative intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border border-red-200/50 dark:border-red-900/40 shadow-xs">
                  <div className="text-2xl font-bold font-mono text-red-600 mb-0.5">
                    3,847
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    Total Flagged Projects
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    4.3% of total portfolio
                  </div>
                </div>

                <div className="bg-card rounded-xl p-4 border border-red-200/50 dark:border-red-900/40 shadow-xs">
                  <div className="text-2xl font-bold font-mono text-red-700 dark:text-red-400 mb-0.5">
                    284
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    Critical Anomalies
                  </div>
                  <div className="text-[10px] text-red-600 font-medium mt-0.5">
                    Immediate action required
                  </div>
                </div>

                <div className="bg-card rounded-xl p-4 border border-red-200/50 dark:border-red-900/40 shadow-xs">
                  <div className="text-2xl font-bold font-mono text-amber-600 mb-0.5">
                    891
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    High Risk Threshold
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Priority TPI verification
                  </div>
                </div>

                <div className="bg-card rounded-xl p-4 border border-red-200/50 dark:border-red-900/40 shadow-xs">
                  <div className="text-2xl font-bold font-mono text-red-600 mb-0.5">
                    ₹2,840 Cr
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    Funds at Risk Exposure
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Pending UC / audit checks
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid: Risk by State + Top Required Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Risk by State */}
            <Card className="lg:col-span-5 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Flagged Projects by State
                </CardTitle>
                <CardDescription className="text-xs">
                  Top states ranked by volume of flagged anomalies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-1">
                {STATES_DATA.slice()
                  .sort((a, b) => b.riskProjects - a.riskProjects)
                  .map((s) => (
                    <div key={s.state} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">
                          {s.state}
                        </span>
                        <span className="font-mono font-semibold text-red-600">
                          {s.riskProjects} works
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-red-500"
                          style={{
                            width: `${Math.min(
                              100,
                              (s.riskProjects / 100) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Top Risk Actions Required */}
            <Card className="lg:col-span-7 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Priority Administrative Directives
                </CardTitle>
                <CardDescription className="text-xs">
                  Time-bound compliance tasks triggered by AI anomaly detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-1">
                {[
                  {
                    action: "Issue show-cause notice to Barmer contractor",
                    urgency: "Immediate",
                    due: "Sep 5, 2024",
                    tag: "Contractor Collusion",
                  },
                  {
                    action:
                      "Freeze stage-2 disbursements for Jaipur solar project",
                    urgency: "Immediate",
                    due: "Sep 2, 2024",
                    tag: "Cost Overrun Anomaly",
                  },
                  {
                    action:
                      "Commission emergency TPI audit — Sundarbans flood shelter",
                    urgency: "Within 10 days",
                    due: "Sep 9, 2024",
                    tag: "Physical Delay >180d",
                  },
                  {
                    action:
                      "District UC reconciliation drive — 847 pending certificates",
                    urgency: "Within 30 days",
                    due: "Sep 30, 2024",
                    tag: "Financial Compliance",
                  },
                  {
                    action:
                      "Drone GIS spatial audit — Shivpuri borewell cluster",
                    urgency: "Within 15 days",
                    due: "Sep 14, 2024",
                    tag: "Geotag Proximity Anomaly",
                  },
                ].map((a, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border bg-card hover:bg-muted/30 transition-all text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex-shrink-0 size-6 rounded-full font-bold flex items-center justify-center text-[11px] ${
                          a.urgency === "Immediate"
                            ? "bg-red-500/10 text-red-600 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-foreground">
                          {a.action}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge
                            variant={
                              a.urgency === "Immediate"
                                ? "destructive"
                                : "outline"
                            }
                            className="text-[10px] px-1.5 py-0 h-4 font-semibold"
                          >
                            {a.urgency}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            Due: {a.due}
                          </span>
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                            {a.tag}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px] shrink-0 font-medium"
                    >
                      Issue Order
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
