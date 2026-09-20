"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import type { Project } from "../types";
import { PROJECTS } from "../data/mpladsData";
import { useProjects } from "@/hooks/useProjects";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  IconSearch,
  IconTable,
  IconLayoutGrid,
  IconDownload,
  IconX,
  IconCheck,
  IconAlertTriangle,
  IconEye,
  IconMapPin,
  IconUser,
  IconCalendar,
  IconFileSpreadsheet,
  IconReceipt2,
  IconFileText,
  IconShieldCheck,
  IconRefresh,
  IconFilter,
  IconSparkles,
} from "@tabler/icons-react";

const STATUSES = ["All", "Completed", "In Progress", "Delayed", "On Hold", "Not Started"] as const;
const CATEGORIES = [
  "All",
  "Roads & Connectivity",
  "Water Supply & Sanitation",
  "Education & Child Dev",
  "Health",
  "Energy & Solar",
  "Sports & Culture",
  "Disaster Management",
] as const;
const STATES = [
  "All",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Maharashtra",
  "Rajasthan",
  "Tamil Nadu",
  "Gujarat",
  "West Bengal",
  "Karnataka",
] as const;

function fmt(n: number) {
  return n >= 100 ? `₹${(n / 100).toFixed(2)}Cr` : `₹${n.toFixed(2)}L`;
}

function RiskBadge({ level, score }: { level: string; score?: number }) {
  if (level === "Critical") {
    return (
      <Badge variant="destructive" className="font-semibold text-[11px] px-2 py-0.5">
        {score !== undefined ? `${score} ` : ""}Critical
      </Badge>
    );
  }
  if (level === "High") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/40 text-amber-600 bg-amber-500/10 font-semibold text-[11px] px-2 py-0.5 dark:text-amber-400"
      >
        {score !== undefined ? `${score} ` : ""}High
      </Badge>
    );
  }
  if (level === "Medium") {
    return (
      <Badge
        variant="outline"
        className="border-yellow-500/40 text-yellow-700 bg-yellow-500/10 font-medium text-[11px] px-2 py-0.5 dark:text-yellow-400"
      >
        {score !== undefined ? `${score} ` : ""}Medium
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="border-emerald-500/40 text-emerald-700 bg-emerald-500/10 font-medium text-[11px] px-2 py-0.5 dark:text-emerald-400"
    >
      {score !== undefined ? `${score} ` : ""}Low
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "Completed") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/30 text-emerald-700 bg-emerald-500/10 font-medium text-[11px] px-2 py-0.5 dark:text-emerald-400"
      >
        <span className="size-1.5 rounded-full bg-emerald-500 mr-1 inline-block" />
        Completed
      </Badge>
    );
  }
  if (status === "In Progress") {
    return (
      <Badge
        variant="outline"
        className="border-blue-500/30 text-blue-700 bg-blue-500/10 font-medium text-[11px] px-2 py-0.5 dark:text-blue-400"
      >
        <span className="size-1.5 rounded-full bg-blue-500 mr-1 inline-block" />
        In Progress
      </Badge>
    );
  }
  if (status === "Delayed") {
    return (
      <Badge
        variant="destructive"
        className="font-medium text-[11px] px-2 py-0.5"
      >
        <span className="size-1.5 rounded-full bg-white mr-1 inline-block" />
        Delayed
      </Badge>
    );
  }
  if (status === "On Hold") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/30 text-amber-700 bg-amber-500/10 font-medium text-[11px] px-2 py-0.5 dark:text-amber-400"
      >
        <span className="size-1.5 rounded-full bg-amber-500 mr-1 inline-block" />
        On Hold
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="font-medium text-[11px] px-2 py-0.5">
      <span className="size-1.5 rounded-full bg-muted-foreground mr-1 inline-block" />
      {status}
    </Badge>
  );
}

function RiskScorePill({ score, level }: { score: number; level: string }) {
  let color = "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400";
  if (level === "Critical" || score >= 80) {
    color = "bg-destructive/10 text-destructive border-destructive/30";
  } else if (level === "High" || score >= 60) {
    color = "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400";
  } else if (level === "Medium" || score >= 35) {
    color = "bg-yellow-500/10 text-yellow-700 border-yellow-500/30 dark:text-yellow-400";
  }

  return (
    <span
      className={`inline-flex items-center justify-center size-7 rounded-full border text-xs font-bold tabular-nums ${color}`}
    >
      {score}
    </span>
  );
}

export default function ProjectExplorer() {
  const { projects, isLive, lastUpdated, updateProjectStatus } = useProjects();
  const [status, setStatus] = useState<string>("All");
  const [category, setCategory] = useState<string>("All");
  const [state, setState] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [sortBy, setSortBy] = useState<"riskScore" | "sanctionedAmount" | "progress" | "name">("riskScore");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchStatus = status === "All" || p.status === status;
      const matchCategory = category === "All" || p.category === category;
      const matchState = state === "All" || p.state === state;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.mpName.toLowerCase().includes(q) ||
        (p.contractor && p.contractor.toLowerCase().includes(q));

      return matchStatus && matchCategory && matchState && matchSearch;
    }).sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return b[sortBy] - a[sortBy];
    });
  }, [projects, status, category, state, search, sortBy]);

  const stats = useMemo(() => {
    return {
      total: projects.length,
      completed: projects.filter((p) => p.status === "Completed").length,
      inProgress: projects.filter((p) => p.status === "In Progress").length,
      delayed: projects.filter((p) => p.status === "Delayed").length,
      onHold: projects.filter((p) => p.status === "On Hold").length,
    };
  }, [projects]);

  const hasActiveFilters = status !== "All" || category !== "All" || state !== "All" || search !== "";

  const resetFilters = () => {
    setStatus("All");
    setCategory("All");
    setState("All");
    setSearch("");
  };

  const handleExport = () => {
    const exportData = filtered.map((p) => ({
      "Project ID": p.id,
      "Project Name": p.name,
      Category: p.category,
      "Sub-Category": p.subCategory,
      State: p.state,
      District: p.district,
      Constituency: p.constituency,
      MP: p.mpName,
      "Sanctioned Amount (₹ Lakh)": p.sanctionedAmount,
      "Released Amount (₹ Lakh)": p.releasedAmount,
      "Expenditure (₹ Lakh)": p.expenditure,
      "Cost Variance (%)": ((p.expenditure - p.sanctionedAmount) / p.sanctionedAmount * 100).toFixed(1),
      Status: p.status,
      "Physical Progress (%)": p.progress,
      "Risk Score": p.riskScore,
      "Risk Level": p.riskLevel,
      "Risk Flags": p.riskFlags.join("; "),
      Contractor: p.contractor || "N/A",
      "Work Order No": p.workOrderNo,
      "Sanction Date": p.sanctionDate,
      "Expected Completion": p.expectedCompletion,
      "UC Submitted": p.ucSubmitted ? "Yes" : "No",
      "Asset Created": p.assetCreated ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MPLADS Projects");
    XLSX.writeFile(workbook, `MPLADS_Projects_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="flex-1 space-y-5 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Project Explorer
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                isLive
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              {isLive ? "Live Data" : "Static Mode"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground md:text-sm">
            Browse, filter, and inspect all MPLADS works across constituencies
            {lastUpdated && ` · Last synced: ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-input bg-card p-1 shadow-xs">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-7 px-2.5 text-xs font-medium"
            >
              <IconTable className="size-3.5 mr-1" />
              Table
            </Button>
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("card")}
              className="h-7 px-2.5 text-xs font-medium"
            >
              <IconLayoutGrid className="size-3.5 mr-1" />
              Cards
            </Button>
          </div>
          <Button
            size="sm"
            onClick={handleExport}
            className="h-8 gap-1.5 text-xs shadow-xs"
          >
            <IconDownload className="size-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <Card className="shadow-xs">
        <CardContent className="p-3.5 md:p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
            {/* Search Input */}
            <div className="relative sm:col-span-2 lg:col-span-4">
              <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects, districts, MPs..."
                className="pl-8 pr-8 h-8 text-xs"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <IconX className="size-3.5" />
                </button>
              )}
            </div>

            {/* State Select */}
            <div className="lg:col-span-2">
              <Select value={state} onValueChange={(val) => setState(val || "All")}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="State: All" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === "All" ? "All States" : s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Select */}
            <div className="lg:col-span-2">
              <Select value={category} onValueChange={(val) => setCategory(val || "All")}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Category: All" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c === "All" ? "All Categories" : c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Select */}
            <div className="lg:col-span-2">
              <Select value={status} onValueChange={(val) => setStatus(val || "All")}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Status: All" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((st) => (
                    <SelectItem key={st} value={st}>
                      {st === "All" ? "All Statuses" : st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Select */}
            <div className="lg:col-span-2">
              <Select
                value={sortBy}
                onValueChange={(val) => setSortBy((val as typeof sortBy) || "riskScore")}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="riskScore">Sort: Risk Score</SelectItem>
                  <SelectItem value="sanctionedAmount">Sort: Amount</SelectItem>
                  <SelectItem value="progress">Sort: Progress</SelectItem>
                  <SelectItem value="name">Sort: Project Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Counts & Status Summary */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {filtered.length}
              </span>{" "}
              projects found
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
                >
                  <IconRefresh className="size-3" />
                  Reset filters
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setStatus((curr) => (curr === "Completed" ? "All" : "Completed"))}
                className={`inline-flex items-center gap-1.5 transition-colors hover:text-foreground ${
                  status === "Completed" ? "font-semibold text-emerald-600 dark:text-emerald-400" : ""
                }`}
              >
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>
                  {filtered.filter((p) => p.status === "Completed").length} Completed
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatus((curr) => (curr === "In Progress" ? "All" : "In Progress"))}
                className={`inline-flex items-center gap-1.5 transition-colors hover:text-foreground ${
                  status === "In Progress" ? "font-semibold text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                <span className="size-1.5 rounded-full bg-blue-500" />
                <span>
                  {filtered.filter((p) => p.status === "In Progress").length} In Progress
                </span>
              </button>

              <button
                type="button"
                onClick={() => setStatus((curr) => (curr === "Delayed" ? "All" : "Delayed"))}
                className={`inline-flex items-center gap-1.5 transition-colors hover:text-foreground ${
                  status === "Delayed" ? "font-semibold text-destructive" : ""
                }`}
              >
                <span className="size-1.5 rounded-full bg-destructive" />
                <span>
                  {filtered.filter((p) => p.status === "Delayed").length} Delayed
                </span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Table / Cards View ── */}
      {viewMode === "table" ? (
        <Card className="overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/40 text-muted-foreground">
                  <TableHead className="w-[320px] text-xs font-semibold uppercase tracking-wider">
                    Project
                  </TableHead>
                  <TableHead className="w-[180px] text-xs font-semibold uppercase tracking-wider">
                    State / District
                  </TableHead>
                  <TableHead className="w-[140px] text-xs font-semibold uppercase tracking-wider">
                    Category
                  </TableHead>
                  <TableHead className="w-[130px] text-right text-xs font-semibold uppercase tracking-wider">
                    Amount
                  </TableHead>
                  <TableHead className="w-[160px] text-xs font-semibold uppercase tracking-wider">
                    Progress
                  </TableHead>
                  <TableHead className="w-[120px] text-center text-xs font-semibold uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="w-[80px] text-center text-xs font-semibold uppercase tracking-wider">
                    Risk
                  </TableHead>
                  <TableHead className="w-[80px] text-right text-xs font-semibold uppercase tracking-wider">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-36 text-center text-muted-foreground text-sm">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <IconFilter className="size-7 text-muted-foreground/50" />
                        <div>No projects matching current search and filters</div>
                        <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs mt-1">
                          Clear Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((p) => {
                    const overrun = p.expenditure > p.sanctionedAmount;
                    const overrunPct = overrun
                      ? (((p.expenditure - p.sanctionedAmount) / p.sanctionedAmount) * 100).toFixed(1)
                      : null;

                    return (
                      <TableRow
                        key={p.id}
                        onClick={() => setSelectedProject(p)}
                        className="cursor-pointer transition-colors hover:bg-muted/40 group"
                      >
                        {/* Project Info */}
                        <TableCell className="align-middle py-3">
                          <div className="font-medium text-foreground text-sm leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                            {p.id}
                          </div>
                        </TableCell>

                        {/* State / District */}
                        <TableCell className="align-middle py-3">
                          <div className="text-xs font-medium text-foreground">{p.state}</div>
                          <div className="text-[11px] text-muted-foreground">{p.district}</div>
                        </TableCell>

                        {/* Category */}
                        <TableCell className="align-middle py-3">
                          <Badge variant="secondary" className="text-[11px] font-normal px-2 py-0.5">
                            {p.category.split(" ")[0]}
                          </Badge>
                        </TableCell>

                        {/* Amount & Overrun */}
                        <TableCell className="align-middle py-3 text-right">
                          <div className="font-mono text-xs font-semibold text-foreground tabular-nums">
                            {fmt(p.sanctionedAmount)}
                          </div>
                          {overrun && (
                            <div className="text-[10px] font-mono font-medium text-destructive mt-0.5">
                              +{overrunPct}% overrun
                            </div>
                          )}
                        </TableCell>

                        {/* Progress Bar */}
                        <TableCell className="align-middle py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden min-w-[60px]">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  p.progress === 100
                                    ? "bg-emerald-500"
                                    : p.status === "Delayed"
                                    ? "bg-destructive"
                                    : "bg-primary"
                                }`}
                                style={{ width: `${p.progress}%` }}
                              />
                            </div>
                            <span className="font-mono text-xs text-muted-foreground tabular-nums w-8 text-right">
                              {p.progress}%
                            </span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="align-middle py-3 text-center">
                          <StatusBadge status={p.status} />
                        </TableCell>

                        {/* Risk */}
                        <TableCell className="align-middle py-3 text-center">
                          <RiskScorePill score={p.riskScore} level={p.riskLevel} />
                        </TableCell>

                        {/* Action */}
                        <TableCell className="align-middle py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground group-hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProject(p);
                            }}
                          >
                            <IconEye className="size-4" />
                            <span className="sr-only">Inspect project</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        /* ── Cards View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center text-muted-foreground text-sm">
              <IconFilter className="size-8 mx-auto mb-2 text-muted-foreground/50" />
              <div>No projects matching current criteria</div>
              <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs mt-2">
                Clear Filters
              </Button>
            </div>
          ) : (
            filtered.map((p) => (
              <Card
                key={p.id}
                onClick={() => setSelectedProject(p)}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/40 group flex flex-col justify-between"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-mono text-muted-foreground truncate">
                      {p.id}
                    </span>
                    <RiskBadge level={p.riskLevel} score={p.riskScore} />
                  </div>
                  <CardTitle className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {p.name}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {p.district}, {p.state} · {p.mpName}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 py-2">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Physical Progress</span>
                      <span className="font-mono font-medium text-foreground">{p.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          p.status === "Delayed"
                            ? "bg-destructive"
                            : p.progress === 100
                            ? "bg-emerald-500"
                            : "bg-primary"
                        }`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial & Status Row */}
                  <div className="flex items-center justify-between pt-1">
                    <StatusBadge status={p.status} />
                    <div className="text-right">
                      <div className="font-mono text-xs font-semibold text-foreground">
                        {fmt(p.sanctionedAmount)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Sanctioned</div>
                    </div>
                  </div>

                  {/* Risk flags callout if present */}
                  {p.riskFlags.length > 0 && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2 text-[11px] text-destructive space-y-0.5">
                      <div className="font-semibold flex items-center gap-1">
                        <IconAlertTriangle className="size-3" />
                        {p.riskFlags.length} risk flag{p.riskFlags.length > 1 ? "s" : ""}
                      </div>
                      <div className="line-clamp-1 text-[11px] text-muted-foreground">
                        {p.riskFlags[0]}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 border-t text-xs text-muted-foreground flex items-center justify-between">
                  <span>{p.category.split(" ")[0]}</span>
                  <span className="text-primary font-medium flex items-center gap-1 group-hover:underline">
                    View dossier
                    <IconEye className="size-3" />
                  </span>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── Project Inspection Dossier Sheet ── */}
      <Sheet
        open={Boolean(selectedProject)}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-xl lg:w-[40vw] lg:max-w-[40vw] p-0 flex flex-col overflow-hidden">
          {selectedProject && (
            <>
              {/* Sheet Header */}
              <SheetHeader className="p-4 md:p-6 pb-4 border-b bg-card">
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-1">
                  <span>{selectedProject.id}</span>
                  <span>·</span>
                  <span>{selectedProject.workOrderNo}</span>
                </div>
                <SheetTitle className="text-base font-bold text-foreground leading-snug">
                  {selectedProject.name}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  {selectedProject.district}, {selectedProject.state} · Constituency:{" "}
                  {selectedProject.constituency}
                </SheetDescription>

                <div className="flex flex-wrap items-center gap-2 pt-3">
                  <StatusBadge status={selectedProject.status} />
                  <RiskBadge level={selectedProject.riskLevel} score={selectedProject.riskScore} />
                  <Badge variant="outline" className="text-xs font-normal">
                    MP: {selectedProject.mpName}
                  </Badge>
                </div>
              </SheetHeader>

              {/* Sheet Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {/* Physical Progress Bar */}
                <div className="rounded-xl border bg-card p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Physical Execution</span>
                    <span className="font-mono font-bold text-foreground">
                      {selectedProject.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        selectedProject.progress === 100
                          ? "bg-emerald-500"
                          : selectedProject.status === "Delayed"
                          ? "bg-destructive"
                          : "bg-primary"
                      }`}
                      style={{ width: `${selectedProject.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Sanction: {selectedProject.sanctionDate}</span>
                    <span>Target: {selectedProject.expectedCompletion}</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="rounded-xl border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Financial Breakdown
                    </h3>
                    <IconReceipt2 className="size-4 text-muted-foreground" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/40 p-2.5">
                      <div className="text-[10px] text-muted-foreground uppercase">Sanctioned</div>
                      <div className="text-sm font-mono font-bold text-foreground">
                        {fmt(selectedProject.sanctionedAmount)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2.5">
                      <div className="text-[10px] text-muted-foreground uppercase">Released</div>
                      <div className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400">
                        {fmt(selectedProject.releasedAmount)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2.5">
                      <div className="text-[10px] text-muted-foreground uppercase">Expenditure</div>
                      <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {fmt(selectedProject.expenditure)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2.5">
                      <div className="text-[10px] text-muted-foreground uppercase">Cost Variance</div>
                      {(() => {
                        const variance =
                          ((selectedProject.expenditure - selectedProject.sanctionedAmount) /
                            selectedProject.sanctionedAmount) *
                          100;
                        return (
                          <div
                            className={`text-sm font-mono font-bold ${
                              variance > 0
                                ? "text-destructive"
                                : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {variance >= 0 ? "+" : ""}
                            {variance.toFixed(1)}%
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Key Metadata Grid */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Project Attributes
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: "Category", value: selectedProject.category },
                      { label: "Sub-Category", value: selectedProject.subCategory },
                      { label: "State", value: selectedProject.state },
                      { label: "District", value: selectedProject.district },
                      { label: "Constituency", value: selectedProject.constituency },
                      { label: "MP Name", value: selectedProject.mpName },
                      { label: "Work Order No", value: selectedProject.workOrderNo },
                      { label: "Contractor", value: selectedProject.contractor || "Direct Dept Work" },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg border bg-card p-2.5">
                        <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
                        <div className="font-medium text-foreground truncate mt-0.5">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Flags */}
                {selectedProject.riskFlags.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-destructive flex items-center gap-1.5">
                      <IconAlertTriangle className="size-4" />
                      Active Risk Flags ({selectedProject.riskFlags.length})
                    </h3>
                    <div className="space-y-1.5">
                      {selectedProject.riskFlags.map((flag, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive"
                        >
                          <span className="font-bold">•</span>
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment History */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <IconFileText className="size-4" />
                    Payment Tranches ({selectedProject.payments.length})
                  </h3>
                  <div className="rounded-xl border bg-card overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 text-muted-foreground text-[11px]">
                          <TableHead className="py-2">Bill No</TableHead>
                          <TableHead className="py-2">Date</TableHead>
                          <TableHead className="py-2 text-right">Amount</TableHead>
                          <TableHead className="py-2 text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedProject.payments.map((p, idx) => (
                          <TableRow key={idx} className="text-xs">
                            <TableCell className="font-mono text-muted-foreground py-2">
                              {p.billNo}
                            </TableCell>
                            <TableCell className="py-2">{p.date}</TableCell>
                            <TableCell className="font-mono font-semibold text-foreground text-right py-2">
                              {fmt(p.amount)}
                            </TableCell>
                            <TableCell className="text-center py-2">
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${
                                  p.status === "Paid"
                                    ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                                    : p.status === "Pending"
                                    ? "border-amber-500/30 text-amber-600 bg-amber-500/10"
                                    : "border-destructive/30 text-destructive bg-destructive/10"
                                }`}
                              >
                                {p.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Compliance & Audit */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <IconShieldCheck className="size-4" />
                    Statutory Compliance & Verification
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "UC Submitted", ok: selectedProject.ucSubmitted },
                      { label: "Asset Created", ok: selectedProject.assetCreated },
                      {
                        label: `Geo-photos (${selectedProject.photos})`,
                        ok: selectedProject.photos >= 10,
                      },
                      {
                        label: `Inspections (${selectedProject.inspections})`,
                        ok: selectedProject.inspections >= 3,
                      },
                    ].map(({ label, ok }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs font-medium ${
                          ok
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-destructive/10 border-destructive/30 text-destructive"
                        }`}
                      >
                        {ok ? (
                          <IconCheck className="size-3.5 shrink-0" />
                        ) : (
                          <IconX className="size-3.5 shrink-0" />
                        )}
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sheet Footer */}
              <SheetFooter className="p-4 border-t bg-card flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-muted-foreground font-medium">Update Status:</span>
                  <Select
                    value={selectedProject.status}
                    onValueChange={(val) => {
                      if (val && selectedProject) {
                        updateProjectStatus(selectedProject.id, val as Project["status"]);
                        setSelectedProject((prev) => (prev ? { ...prev, status: val as Project["status"] } : null));
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Delayed">Delayed</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.location.href = `/dashboard/simulation`;
                      }
                    }}
                    className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    <IconSparkles className="size-3.5" />
                    Simulate AI Intervention →
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const ws = XLSX.utils.json_to_sheet([
                        {
                          ID: selectedProject.id,
                          Name: selectedProject.name,
                          Status: selectedProject.status,
                          Category: selectedProject.category,
                          SanctionedAmount: selectedProject.sanctionedAmount,
                          ReleasedAmount: selectedProject.releasedAmount,
                          Expenditure: selectedProject.expenditure,
                          Progress: selectedProject.progress,
                          RiskScore: selectedProject.riskScore,
                        },
                      ]);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Dossier");
                      XLSX.writeFile(wb, `${selectedProject.id}_Dossier.xlsx`);
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <IconFileSpreadsheet className="size-3.5" />
                    Export Dossier
                  </Button>
                  <SheetClose render={<Button size="sm" className="text-xs" />}>
                    Close
                  </SheetClose>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
