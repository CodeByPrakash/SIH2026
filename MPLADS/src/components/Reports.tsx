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
  PROJECTS,
} from "../data/mpladsData";
import type { User, Project } from "../types";
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
import WhyRiskModal, { WhyRiskButton } from "@/components/WhyRiskModal";
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
  IconLock,
  IconReceiptTax,
  IconBuildingCommunity,
  IconWorld,
  IconBuildingArch,
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
  // ── Role Resolution ──
  const isDistrict = user.role === "District";
  const isState = user.role === "State";
  const isMP = user.role === "MP";
  const isMinistry = user.role === "Ministry";
  const isCitizen = user.role === "Citizen";

  const userDistrict = user.district || "Lucknow";
  const userState = user.state || "Uttar Pradesh";
  const userConstituency = user.constituency || "";

  // District login cannot access state-wise performance tab
  const [reportType, setReportType] = useState<
    "financial" | "physical" | "state" | "risk"
  >(() => {
    if (isDistrict && initialTab === "state") return "financial";
    return initialTab;
  });

  useEffect(() => {
    if (initialTab) {
      if (isDistrict && initialTab === "state") {
        setReportType("financial");
      } else {
        setReportType(initialTab);
      }
    }
  }, [initialTab, isDistrict]);

  const [stateSearch, setStateSearch] = useState("");
  const [whyRiskProject, setWhyRiskProject] = useState<Project | null>(null);

  // ── Scoped Project Datasets ──
  const districtProjects = useMemo(() => {
    return PROJECTS.filter(
      (p) =>
        p.district?.toLowerCase() === userDistrict.toLowerCase() ||
        (p.state?.toLowerCase() === userState.toLowerCase() && !p.district)
    );
  }, [userDistrict, userState]);

  const stateProjects = useMemo(() => {
    return PROJECTS.filter(
      (p) => p.state?.toLowerCase() === userState.toLowerCase()
    );
  }, [userState]);

  const mpProjects = useMemo(() => {
    return PROJECTS.filter(
      (p) =>
        (userConstituency &&
          p.constituency?.toLowerCase() === userConstituency.toLowerCase()) ||
        p.district?.toLowerCase() === userDistrict.toLowerCase()
    );
  }, [userConstituency, userDistrict]);

  // ── Financial Metrics Computations ──
  // 1. District Financials
  const distSanctioned = useMemo(
    () => districtProjects.reduce((s, p) => s + p.sanctionedAmount, 0),
    [districtProjects]
  );
  const distReleased = useMemo(
    () => districtProjects.reduce((s, p) => s + p.releasedAmount, 0),
    [districtProjects]
  );
  const distExpenditure = useMemo(
    () => districtProjects.reduce((s, p) => s + p.expenditure, 0),
    [districtProjects]
  );
  const distUnspent = Math.max(0, distReleased - distExpenditure);
  const distUtilPct =
    distReleased > 0 ? Math.round((distExpenditure / distReleased) * 100) : 0;

  // District payment transactions
  const districtPayments = useMemo(() => {
    const list: {
      date: string;
      amount: number;
      billNo: string;
      status: "Paid" | "Pending" | "Rejected";
      projectName: string;
      workOrderNo: string;
    }[] = [];
    districtProjects.forEach((p) => {
      p.payments.forEach((pay) => {
        list.push({
          ...pay,
          projectName: p.name,
          workOrderNo: p.workOrderNo,
        });
      });
    });
    return list;
  }, [districtProjects]);

  // District category distribution
  const districtCategoryDistribution = useMemo(() => {
    const catMap = new Map<string, number>();
    districtProjects.forEach((p) => {
      catMap.set(p.category, (catMap.get(p.category) || 0) + p.sanctionedAmount);
    });
    return Array.from(catMap.entries()).map(([name, val]) => ({
      name,
      value: distSanctioned > 0 ? Math.round((val / distSanctioned) * 100) : 0,
      amount: val,
    }));
  }, [districtProjects, distSanctioned]);

  // 2. State Financials
  const stateData = useMemo(() => {
    return (
      STATES_DATA.find(
        (s) => s.state.toLowerCase() === userState.toLowerCase()
      ) || STATES_DATA[0]
    );
  }, [userState]);

  const stateAllocated = stateData.totalFunds; // in Cr
  const stateReleased = Math.round(
    stateData.totalFunds * (stateData.utilization >= 85 ? 0.88 : 0.78)
  ); // in Cr
  const stateExpenditure = stateData.utilizedFunds; // in Cr
  const stateUnspent = Math.max(0, stateReleased - stateExpenditure);
  const stateUtilPct = stateData.utilization;

  // Districts within this state
  const stateDistrictsBreakdown = useMemo(() => {
    const distMap = new Map<
      string,
      {
        district: string;
        totalWorks: number;
        completed: number;
        delayed: number;
        highRisk: number;
        sanctioned: number;
        expenditure: number;
      }
    >();

    stateProjects.forEach((p) => {
      const dName = p.district || "General Works";
      const curr = distMap.get(dName) || {
        district: dName,
        totalWorks: 0,
        completed: 0,
        delayed: 0,
        highRisk: 0,
        sanctioned: 0,
        expenditure: 0,
      };
      curr.totalWorks += 1;
      if (p.status === "Completed") curr.completed += 1;
      if (p.status === "Delayed") curr.delayed += 1;
      if (
        p.riskLevel === "High" ||
        p.riskLevel === "Critical" ||
        p.riskScore >= 50
      ) {
        curr.highRisk += 1;
      }
      curr.sanctioned += p.sanctionedAmount;
      curr.expenditure += p.expenditure;
      distMap.set(dName, curr);
    });

    return Array.from(distMap.values()).map((d) => ({
      ...d,
      utilization:
        d.sanctioned > 0 ? Math.round((d.expenditure / d.sanctioned) * 100) : 0,
    }));
  }, [stateProjects]);

  // 3. MP Financials
  const mpSanctioned = useMemo(
    () => mpProjects.reduce((s, p) => s + p.sanctionedAmount, 0),
    [mpProjects]
  );
  const mpReleased = useMemo(
    () => mpProjects.reduce((s, p) => s + p.releasedAmount, 0),
    [mpProjects]
  );
  const mpExpenditure = useMemo(
    () => mpProjects.reduce((s, p) => s + p.expenditure, 0),
    [mpProjects]
  );
  const mpUnspent = Math.max(0, mpReleased - mpExpenditure);
  const mpUtilPct =
    mpReleased > 0 ? Math.round((mpExpenditure / mpReleased) * 100) : 0;

  // Filtered states for National / MP view
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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  {isDistrict
                    ? `Financial & Operational Analytics — ${userDistrict}`
                    : isState
                    ? `State Financial Dossier — ${userState}`
                    : isMP
                    ? `Constituency Financial Analytics — ${userConstituency || "MP Scope"}`
                    : "Reports & Financial Analytics"}
                </h1>

                {/* Role Scope Badge */}
                {isDistrict ? (
                  <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 gap-1 text-[11px] font-semibold">
                    <IconLock className="size-3" />
                    District Authority Scope: {userDistrict}
                  </Badge>
                ) : isState ? (
                  <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 gap-1 text-[11px] font-semibold">
                    <IconBuildingCommunity className="size-3" />
                    State Authority Scope: {userState}
                  </Badge>
                ) : isMP ? (
                  <Badge className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30 gap-1 text-[11px] font-semibold">
                    <IconBuildingArch className="size-3" />
                    MP Scope: {userConstituency} & National
                  </Badge>
                ) : (
                  <Badge className="bg-primary/10 text-primary border-primary/30 gap-1 text-[11px] font-semibold">
                    <IconWorld className="size-3" />
                    National Central Ministry
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground md:text-sm mt-0.5">
                {isDistrict
                  ? `Financial clearance, implementing agency disbursements, and project burn rates in ${userDistrict} (${userState})`
                  : isState
                  ? `State SNA allocations, central releases, and district financial performance across ${userState}`
                  : isMP
                  ? `Constituency work order funding, installment releases, and parliamentary audit trail`
                  : "National NIDHI-RAKSHAK reporting engine · All 36 States & UTs · Export-ready dossiers"}
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

      {/* ── Report Type Switcher Tabs (Role-Based) ── */}
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
          {isDistrict
            ? `${userDistrict} Financial Analytics`
            : isState
            ? `${userState} Financial Analytics`
            : "Financial Analytics"}
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

        {/* 
          CRITICAL REQUIREMENT:
          District login CANNOT see state-wise performance and released to state amounts!
          State login sees District Ledger within their own state.
          National & MP see the All-India State Ledger.
        */}
        {!isDistrict && (
          <button
            onClick={() => setReportType("state")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              reportType === "state"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <IconMapPin className="size-4 text-indigo-500" />
            {isState ? `District Ledger (${userState})` : "State-wise Performance"}
          </button>
        )}

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
      {/* 1. FINANCIAL ANALYTICS (Role-Scoping Enforced)                                      */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {reportType === "financial" && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Sanctioned Allocation */}
            <Card className="shadow-xs hover:border-primary/40 transition-all">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {isDistrict
                      ? `District Works Sanctioned`
                      : isState
                      ? `State Allocation (${userState})`
                      : isMP
                      ? `Constituency Allocation`
                      : `Total Allocated (FY 24-25)`}
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <IconBuildingBank className="size-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                    {isDistrict
                      ? `₹${distSanctioned >= 100 ? (distSanctioned / 100).toFixed(2) + " Cr" : distSanctioned.toFixed(1) + " L"}`
                      : isState
                      ? `₹${stateAllocated.toLocaleString()} Cr`
                      : isMP
                      ? `₹${mpSanctioned >= 100 ? (mpSanctioned / 100).toFixed(2) + " Cr" : mpSanctioned.toFixed(1) + " L"}`
                      : "₹25,000 Cr"}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                    <Badge
                      variant="secondary"
                      className="px-1.5 py-0 text-[10px] text-blue-600 bg-blue-500/10 border-none font-medium"
                    >
                      {isDistrict
                        ? `${districtProjects.length} Works`
                        : isState
                        ? `${stateData.totalProjects} Works`
                        : isMP
                        ? `${mpProjects.length} Works`
                        : "₹250Cr / MP"}
                    </Badge>
                    <span>
                      {isDistrict
                        ? `Sanctioned in ${userDistrict}`
                        : isState
                        ? `Across ${userState}`
                        : isMP
                        ? `${userConstituency || "Constituency"}`
                        : "× 100 MPs (Sample)"}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-full" />
                </div>
              </CardContent>
            </Card>

            {/* 
              Card 2: Released Funds 
              ROLE-BASED:
              - District: "Released to Executing Agencies" (NEVER "Released to States")
              - State: "Released by Ministry to [State]"
              - MP: "Released to Constituency Works"
              - Ministry: "Released to States"
            */}
            <Card className="shadow-xs hover:border-primary/40 transition-all">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {isDistrict
                      ? `Released to Implementing Agencies`
                      : isState
                      ? `Released to ${userState} (SNA)`
                      : isMP
                      ? `Released to Constituency`
                      : `Released to States`}
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <IconSend className="size-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
                    {isDistrict
                      ? `₹${distReleased >= 100 ? (distReleased / 100).toFixed(2) + " Cr" : distReleased.toFixed(1) + " L"}`
                      : isState
                      ? `₹${stateReleased.toLocaleString()} Cr`
                      : isMP
                      ? `₹${mpReleased >= 100 ? (mpReleased / 100).toFixed(2) + " Cr" : mpReleased.toFixed(1) + " L"}`
                      : "₹16,800 Cr"}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                    <span className="text-indigo-600 font-semibold flex items-center">
                      <IconArrowUpRight className="size-3.5 inline" />
                      {isDistrict
                        ? `${distSanctioned > 0 ? Math.round((distReleased / distSanctioned) * 100) : 100}%`
                        : isState
                        ? `${Math.round((stateReleased / stateAllocated) * 100)}%`
                        : isMP
                        ? `${mpSanctioned > 0 ? Math.round((mpReleased / mpSanctioned) * 100) : 100}%`
                        : "67.2%"}
                    </span>
                    <span>
                      {isDistrict
                        ? "of sanctioned work orders"
                        : isState
                        ? "of state allocation"
                        : isMP
                        ? "of sanctioned works"
                        : "of total allocation"}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{
                      width: isDistrict
                        ? `${distSanctioned > 0 ? Math.min(100, Math.round((distReleased / distSanctioned) * 100)) : 100}%`
                        : isState
                        ? `${Math.min(100, Math.round((stateReleased / stateAllocated) * 100))}%`
                        : isMP
                        ? `${mpSanctioned > 0 ? Math.min(100, Math.round((mpReleased / mpSanctioned) * 100)) : 100}%`
                        : "67.2%",
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Utilized Expenditure */}
            <Card className="shadow-xs hover:border-primary/40 transition-all">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {isDistrict
                      ? `District Ground Expenditure`
                      : isState
                      ? `Utilized across ${userState}`
                      : isMP
                      ? `Constituency Expenditure`
                      : `Utilized (Expenditure)`}
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <IconCircleCheck className="size-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                    {isDistrict
                      ? `₹${distExpenditure >= 100 ? (distExpenditure / 100).toFixed(2) + " Cr" : distExpenditure.toFixed(1) + " L"}`
                      : isState
                      ? `₹${stateExpenditure.toLocaleString()} Cr`
                      : isMP
                      ? `₹${mpExpenditure >= 100 ? (mpExpenditure / 100).toFixed(2) + " Cr" : mpExpenditure.toFixed(1) + " L"}`
                      : "₹14,200 Cr"}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                    <span className="text-emerald-600 font-semibold flex items-center">
                      <IconTrendingUp className="size-3.5 inline" />
                      {isDistrict
                        ? `${distUtilPct}%`
                        : isState
                        ? `${stateUtilPct}%`
                        : isMP
                        ? `${mpUtilPct}%`
                        : "84.5%"}
                    </span>
                    <span>
                      {isDistrict
                        ? `utilized in ${userDistrict}`
                        : isState
                        ? `efficiency in ${userState}`
                        : "of released funds"}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: isDistrict
                        ? `${distUtilPct}%`
                        : isState
                        ? `${stateUtilPct}%`
                        : isMP
                        ? `${mpUtilPct}%`
                        : "84.5%",
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Unspent / Held Balance */}
            <Card className="shadow-xs hover:border-primary/40 transition-all">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {isDistrict
                      ? `Unspent Balance in Treasury`
                      : isState
                      ? `Unspent State SNA Balance`
                      : isMP
                      ? `Unutilized Balance`
                      : `Pending Release`}
                  </span>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <IconHourglassEmpty className="size-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
                    {isDistrict
                      ? `₹${distUnspent >= 100 ? (distUnspent / 100).toFixed(2) + " Cr" : distUnspent.toFixed(1) + " L"}`
                      : isState
                      ? `₹${stateUnspent.toLocaleString()} Cr`
                      : isMP
                      ? `₹${mpUnspent >= 100 ? (mpUnspent / 100).toFixed(2) + " Cr" : mpUnspent.toFixed(1) + " L"}`
                      : "₹8,200 Cr"}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                    <Badge
                      variant="outline"
                      className="px-1.5 py-0 text-[10px] text-amber-600 bg-amber-500/10 border-none font-medium"
                    >
                      {isDistrict ? "District SNA" : isState ? "State SNA" : "Stage 2"}
                    </Badge>
                    <span>
                      {isDistrict
                        ? `Held in ${userDistrict} account`
                        : isState
                        ? `Available for disbursement`
                        : "Held at district level"}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: isDistrict
                        ? `${Math.max(0, 100 - distUtilPct)}%`
                        : isState
                        ? `${Math.max(0, 100 - stateUtilPct)}%`
                        : isMP
                        ? `${Math.max(0, 100 - mpUtilPct)}%`
                        : "32.8%",
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 
            CHARTS SECTION:
            For District: Show District Work Orders Financial Ledger & Payment Transactions
            For State: Show State vs Benchmark & District Breakdown
            For Ministry/MP: Show 5-Year All-India Fund Trend & Monthly Expenditure
          */}
          {isDistrict ? (
            /* ── District-Specific Financial Views ── */
            <div className="space-y-6">
              {/* District Work Orders Financial Comparison */}
              <Card className="shadow-xs">
                <CardHeader className="pb-3 border-b bg-muted/20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Work Orders Financial Breakdown — {userDistrict} District
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Sanctioned allocation, released amount, and actual ground expenditure per work order (₹ in Lakh)
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono">
                      {districtProjects.length} Active Works
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={districtProjects.map((p) => ({
                          name: p.workOrderNo.split("/").pop() || p.id,
                          fullName: p.name,
                          sanctioned: p.sanctionedAmount,
                          released: p.releasedAmount,
                          expenditure: p.expenditure,
                        }))}
                        margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `₹${v}L`}
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
                            `₹${Number(val).toFixed(1)} Lakh`,
                            name,
                          ]}
                        />
                        <Bar
                          dataKey="sanctioned"
                          fill="#94A3B8"
                          radius={[4, 4, 0, 0]}
                          name="Sanctioned"
                        />
                        <Bar
                          dataKey="released"
                          fill="#3B82F6"
                          radius={[4, 4, 0, 0]}
                          name="Released"
                        />
                        <Bar
                          dataKey="expenditure"
                          fill="#10B981"
                          radius={[4, 4, 0, 0]}
                          name="Expended"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* District Work Orders Detailed Financial Table with Why Risk */}
              <Card className="shadow-xs overflow-hidden">
                <CardHeader className="p-4 border-b bg-muted/20">
                  <CardTitle className="text-base font-semibold">
                    District Project Expenditure Ledger
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Contractor payment status, cost variances, and risk audits for {userDistrict}
                  </CardDescription>
                </CardHeader>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 text-[11px] uppercase tracking-wider">
                        <TableHead className="font-semibold text-foreground">Work Order</TableHead>
                        <TableHead className="font-semibold text-foreground">Project Name</TableHead>
                        <TableHead className="font-semibold text-foreground">Category</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">Sanctioned</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">Released</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">Expended</TableHead>
                        <TableHead className="text-center font-semibold text-foreground">Utilization</TableHead>
                        <TableHead className="text-center font-semibold text-foreground">Risk Audit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {districtProjects.map((p) => {
                        const util =
                          p.releasedAmount > 0
                            ? Math.round((p.expenditure / p.releasedAmount) * 100)
                            : 0;
                        const hasHighRisk =
                          p.riskLevel === "High" ||
                          p.riskLevel === "Critical" ||
                          p.riskScore >= 50;

                        return (
                          <TableRow key={p.id} className="hover:bg-muted/30 text-xs">
                            <TableCell className="font-mono font-medium text-foreground">
                              {p.workOrderNo}
                            </TableCell>
                            <TableCell className="max-w-[220px]">
                              <div className="font-semibold text-foreground line-clamp-1">
                                {p.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {p.contractor || "Direct Dept Work"}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {p.category}
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold">
                              ₹{p.sanctionedAmount.toFixed(1)}L
                            </TableCell>
                            <TableCell className="text-right font-mono text-blue-600 dark:text-blue-400">
                              ₹{p.releasedAmount.toFixed(1)}L
                            </TableCell>
                            <TableCell className="text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                              ₹{p.expenditure.toFixed(1)}L
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-mono ${
                                  util >= 85
                                    ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/10"
                                    : util >= 70
                                    ? "border-amber-500/50 text-amber-600 bg-amber-500/10"
                                    : "border-destructive/50 text-destructive bg-destructive/10"
                                }`}
                              >
                                {util}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <Badge
                                  variant={hasHighRisk ? "destructive" : "secondary"}
                                  className="text-[10px] font-mono"
                                >
                                  {p.riskScore}/100
                                </Badge>
                                {hasHighRisk && (
                                  <WhyRiskButton
                                    project={p}
                                    compact
                                    onClick={() => setWhyRiskProject(p)}
                                  />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* District Payment History Transactions */}
              {districtPayments.length > 0 && (
                <Card className="shadow-xs overflow-hidden">
                  <CardHeader className="p-4 border-b bg-muted/20">
                    <CardTitle className="text-base font-semibold">
                      Payment Transactions & Bill Settlement Pipeline — {userDistrict}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Treasury clearance of contractor invoices across active works
                    </CardDescription>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 text-[11px] uppercase tracking-wider">
                          <TableHead className="font-semibold text-foreground">Date</TableHead>
                          <TableHead className="font-semibold text-foreground">Bill No</TableHead>
                          <TableHead className="font-semibold text-foreground">Project</TableHead>
                          <TableHead className="text-right font-semibold text-foreground">Amount</TableHead>
                          <TableHead className="text-center font-semibold text-foreground">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {districtPayments.map((pay, i) => (
                          <TableRow key={i} className="hover:bg-muted/30 text-xs">
                            <TableCell className="font-mono text-[11px] text-muted-foreground">
                              {pay.date}
                            </TableCell>
                            <TableCell className="font-mono font-semibold text-foreground">
                              {pay.billNo}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground text-[11px]">
                              {pay.projectName}
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold text-foreground">
                              ₹{pay.amount.toFixed(2)}L
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  pay.status === "Paid"
                                    ? "secondary"
                                    : pay.status === "Pending"
                                    ? "outline"
                                    : "destructive"
                                }
                                className={`text-[10px] ${
                                  pay.status === "Paid"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                    : pay.status === "Pending"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                    : ""
                                }`}
                              >
                                {pay.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            /* ── National / State Multi-Year Trend Charts ── */
            <>
              {/* 5-Year Fund Trend Chart */}
              <Card className="shadow-xs">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {isState
                          ? `State Multi-Year Fund Flow — ${userState}`
                          : "National Multi-Year Fund Trend (5 Years)"}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {isState
                          ? `Allocations, releases, and ground expenditures for ${userState} (₹ in Crore)`
                          : "Central allocation vs state releases vs actual expenditure (₹ in Crore)"}
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
                        Monthly Expenditure vs Target Rate
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
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {/* 2. PHYSICAL PROGRESS (Role-Scoped)                                                */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {reportType === "physical" && (
        <div className="space-y-6">
          {/* Top Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-xs">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
                  <span>
                    {isDistrict ? `Works in ${userDistrict}` : "Total Works Sanctioned"}
                  </span>
                  <IconHammer className="size-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold font-mono text-foreground">
                  {isDistrict ? districtProjects.length : isState ? stateProjects.length : "89,472"}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isDistrict
                    ? `Sanctioned in ${userDistrict} District`
                    : isState
                    ? `Active works in ${userState}`
                    : "Across 780+ parliamentary constituencies"}
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
                  {isDistrict
                    ? districtProjects.filter((p) => p.status === "Completed").length
                    : isState
                    ? stateProjects.filter((p) => p.status === "Completed").length
                    : "62,841"}
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-600 px-1.5 py-0 text-[10px] font-semibold border-none"
                  >
                    {isDistrict && districtProjects.length > 0
                      ? `${Math.round(
                          (districtProjects.filter((p) => p.status === "Completed").length /
                            districtProjects.length) *
                            100
                        )}%`
                      : "70.2%"}
                  </Badge>
                  <span className="text-muted-foreground">Completion Rate</span>
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
                  {isDistrict
                    ? districtProjects.filter((p) => p.status === "In Progress").length
                    : isState
                    ? stateProjects.filter((p) => p.status === "In Progress").length
                    : "21,847"}
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-600 px-1.5 py-0 text-[10px] font-semibold border-none"
                  >
                    {isDistrict && districtProjects.length > 0
                      ? `${Math.round(
                          (districtProjects.filter((p) => p.status === "In Progress").length /
                            districtProjects.length) *
                            100
                        )}%`
                      : "24.4%"}
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
                  {isDistrict
                    ? districtProjects.filter((p) => p.status === "Delayed").length
                    : isState
                    ? stateProjects.filter((p) => p.status === "Delayed").length
                    : "4,784"}
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Badge
                    variant="secondary"
                    className="bg-red-500/10 text-red-600 px-1.5 py-0 text-[10px] font-semibold border-none"
                  >
                    {isDistrict && districtProjects.length > 0
                      ? `${Math.round(
                          (districtProjects.filter((p) => p.status === "Delayed").length /
                            districtProjects.length) *
                            100
                        )}%`
                      : "5.4%"}
                  </Badge>
                  <span className="text-muted-foreground">
                    {isDistrict ? "Immediate district review" : "Escalated to DMs"}
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
                  {isDistrict
                    ? `Works by Category — ${userDistrict}`
                    : `Projects by Category`}
                </CardTitle>
                <CardDescription className="text-xs">
                  Sector-wise breakdown of sanctioned infrastructure works
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[260px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          isDistrict && districtCategoryDistribution.length > 0
                            ? districtCategoryDistribution
                            : CATEGORY_DISTRIBUTION
                        }
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {(isDistrict && districtCategoryDistribution.length > 0
                          ? districtCategoryDistribution
                          : CATEGORY_DISTRIBUTION
                        ).map((entry, idx) => (
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
                {(isDistrict && districtCategoryDistribution.length > 0
                  ? districtCategoryDistribution
                  : CATEGORY_DISTRIBUTION
                ).map((c, idx) => {
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
      {/* 3. STATE-WISE / DISTRICT PERFORMANCE LEDGER                                       */}
      {/* (STRICTLY HIDDEN / RESTRICTED FOR DISTRICT LOGINS)                                 */}
      {/* ══════════════════════════════════════════════════════════════════════════════════ */}
      {!isDistrict && reportType === "state" && (
        <div className="space-y-6">
          {/* For State Login: Show District-wise breakdown within their State */}
          {isState ? (
            <div className="space-y-6">
              {/* State vs Benchmark Target Card */}
              <Card className="shadow-xs border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <Badge variant="outline" className="text-[10px] font-semibold border-blue-500/40 text-blue-700 dark:text-blue-300">
                      State Jurisdiction: {userState}
                    </Badge>
                    <div className="text-base font-bold text-foreground">
                      {userState} Fund Utilization Efficiency: {stateUtilPct}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Comparing state ground expenditure rate against the National MPLADS 90% benchmark
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center px-3 py-1.5 rounded-lg border bg-background">
                      <div className="text-[10px] text-muted-foreground uppercase">State Rate</div>
                      <div className="text-base font-bold font-mono text-blue-600">{stateUtilPct}%</div>
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-lg border bg-background">
                      <div className="text-[10px] text-muted-foreground uppercase">National Target</div>
                      <div className="text-base font-bold font-mono text-foreground">90%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* District Performance Ledger in State */}
              <Card className="shadow-xs overflow-hidden">
                <CardHeader className="p-4 border-b bg-muted/20">
                  <CardTitle className="text-base font-semibold">
                    District Performance Ledger — {userState}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Comprehensive audit ledger across districts in {userState}
                  </CardDescription>
                </CardHeader>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 text-[11px] uppercase tracking-wider">
                        <TableHead className="font-semibold text-foreground">District</TableHead>
                        <TableHead className="text-center font-semibold text-foreground">Total Works</TableHead>
                        <TableHead className="text-center font-semibold text-foreground">Completed</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">Sanctioned</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">Utilized</TableHead>
                        <TableHead className="text-center font-semibold text-foreground">Utilization %</TableHead>
                        <TableHead className="text-center font-semibold text-foreground">Delayed</TableHead>
                        <TableHead className="text-center font-semibold text-foreground">Risk Flags</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stateDistrictsBreakdown.map((d) => (
                        <TableRow key={d.district} className="hover:bg-muted/30 text-xs">
                          <TableCell className="font-semibold text-foreground">{d.district}</TableCell>
                          <TableCell className="text-center font-mono">{d.totalWorks}</TableCell>
                          <TableCell className="text-center font-mono text-emerald-600">{d.completed}</TableCell>
                          <TableCell className="text-right font-mono">₹{d.sanctioned.toFixed(1)}L</TableCell>
                          <TableCell className="text-right font-mono font-semibold text-foreground">₹{d.expenditure.toFixed(1)}L</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-mono ${
                                d.utilization >= 85
                                  ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/10"
                                  : d.utilization >= 70
                                  ? "border-amber-500/50 text-amber-600 bg-amber-500/10"
                                  : "border-destructive/50 text-destructive bg-destructive/10"
                              }`}
                            >
                              {d.utilization}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-mono text-red-600">{d.delayed}</TableCell>
                          <TableCell className="text-center">
                            {d.highRisk > 0 ? (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                {d.highRisk}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-emerald-600">
                                0
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          ) : (
            /* For National Authority & MP: Full All-India State Ledger */
            <>
              {/* State Comparison Chart */}
              <Card className="shadow-xs">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-base font-semibold">
                        State Fund Utilization Comparison (All-India)
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
                        <span className="text-muted-foreground">National Target (90%)</span>
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
                        <TableHead className="font-semibold text-foreground">State / UT</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">Total Works</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">Completed</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">Total Funds</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">Utilized</TableHead>
                        <TableHead className="text-center font-semibold text-foreground">Fund Utilization</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">Delayed</TableHead>
                        <TableHead className="text-right font-semibold text-foreground">Risk Works</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStates.map((s) => {
                        const compPct = Math.round(
                          (s.completedProjects / s.totalProjects) * 100
                        );
                        return (
                          <TableRow key={s.state} className="hover:bg-muted/30 text-xs">
                            <TableCell className="font-semibold text-foreground">{s.state}</TableCell>
                            <TableCell className="text-right font-mono">{s.totalProjects.toLocaleString()}</TableCell>
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
                                variant={s.riskProjects > 50 ? "destructive" : "secondary"}
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
            </>
          )}
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
                  {isDistrict
                    ? `District Risk Audit Dossier — ${userDistrict}`
                    : isState
                    ? `State Risk Dossier — ${userState}`
                    : `Executive Risk Dossier — September 2024`}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-red-700/80 dark:text-red-300/80">
                {isDistrict
                  ? `Automated geospatial and contractor anomaly flags requiring immediate Collectorate intervention in ${userDistrict}`
                  : `Automated geospatial and contractor anomaly flags requiring administrative intervention`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border border-red-200/50 dark:border-red-900/40 shadow-xs">
                  <div className="text-2xl font-bold font-mono text-red-600 mb-0.5">
                    {isDistrict
                      ? districtProjects.filter(
                          (p) => p.riskLevel === "High" || p.riskLevel === "Critical" || p.riskScore >= 50
                        ).length
                      : "3,847"}
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    Total Flagged Projects
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {isDistrict ? `In ${userDistrict} District` : "4.3% of total portfolio"}
                  </div>
                </div>

                <div className="bg-card rounded-xl p-4 border border-red-200/50 dark:border-red-900/40 shadow-xs">
                  <div className="text-2xl font-bold font-mono text-red-700 dark:text-red-400 mb-0.5">
                    {isDistrict
                      ? districtProjects.filter((p) => p.riskLevel === "Critical").length
                      : "284"}
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
                    {isDistrict
                      ? districtProjects.filter((p) => p.riskLevel === "High").length
                      : "891"}
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
                    {isDistrict
                      ? `₹${(distExpenditure * 0.4).toFixed(1)}L`
                      : "₹2,840 Cr"}
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

          {/* Grid: Risk breakdown + Top Required Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Risk in Jurisdiction */}
            <Card className="lg:col-span-5 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  {isDistrict
                    ? `Flagged Works in ${userDistrict}`
                    : `Flagged Projects by State`}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isDistrict
                    ? `Projects with active risk triggers in ${userDistrict}`
                    : `Top states ranked by volume of flagged anomalies`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-1">
                {isDistrict ? (
                  districtProjects.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      No high-risk works currently flagged in {userDistrict}.
                    </div>
                  ) : (
                    districtProjects.map((p) => {
                      const hasHighRisk =
                        p.riskLevel === "High" ||
                        p.riskLevel === "Critical" ||
                        p.riskScore >= 50;

                      return (
                        <div
                          key={p.id}
                          className="rounded-lg border p-2.5 bg-card hover:bg-muted/40 transition-colors text-xs space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-semibold text-foreground line-clamp-1">
                              {p.name}
                            </span>
                            <Badge
                              variant={hasHighRisk ? "destructive" : "secondary"}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {p.riskScore}/100
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1">
                            {p.riskFlags.join("; ") || "Compliance on track"}
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t text-[11px]">
                            <span>Progress: <strong>{p.progress}%</strong></span>
                            {hasHighRisk && (
                              <WhyRiskButton
                                project={p}
                                compact
                                onClick={() => setWhyRiskProject(p)}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )
                ) : (
                  STATES_DATA.slice()
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
                    ))
                )}
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
                  ...(isDistrict
                    ? [
                        {
                          action: `Reconcile pending Utilization Certificates for ${userDistrict}`,
                          urgency: "Immediate",
                          due: "Within 7 days",
                          tag: "District UC Compliance",
                        },
                        {
                          action: `Conduct site physical verification of 95%+ completion works`,
                          urgency: "Immediate",
                          due: "Within 3 days",
                          tag: "Asset Handover Audit",
                        },
                        {
                          action: `Audit contractor bills against GeM benchmark rates in ${userDistrict}`,
                          urgency: "Within 15 days",
                          due: "Sep 20, 2024",
                          tag: "Price Verification",
                        },
                      ]
                    : [
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
                      ]),
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

      {/* ── Root Why Risk Anomaly Modal ── */}
      <WhyRiskModal
        project={whyRiskProject}
        isOpen={!!whyRiskProject}
        onClose={() => setWhyRiskProject(null)}
      />
    </div>
  );
}
