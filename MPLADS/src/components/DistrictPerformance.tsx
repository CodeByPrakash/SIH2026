"use client";

import React, { useState, useMemo } from "react";
import type { User, Project } from "@/types";
import { PROJECTS } from "@/data/mpladsData";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  IconBuildingCommunity,
  IconSearch,
  IconTrendingUp,
  IconAlertTriangle,
  IconCheck,
  IconArrowUpRight,
  IconFilter,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconArrowRight,
  IconShieldExclamation,
  IconCircleCheck,
  IconClock,
  IconMapPin,
  IconSparkles,
} from "@tabler/icons-react";

interface DistrictPerformanceProps {
  user: User;
  onNavigate?: (page: string) => void;
}

interface DistrictMetric {
  name: string;
  state: string;
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  delayedProjects: number;
  riskProjects: number;
  sanctionedAmount: number; // in Lakhs
  expenditure: number; // in Lakhs
  utilizationRate: number; // percentage
  status: "High Performing" | "Moderate" | "Lagging";
}

// Pre-compiled comprehensive district dataset for State monitoring
const STATE_DISTRICT_BASELINES: Record<string, DistrictMetric[]> = {
  "Uttar Pradesh": [
    { name: "Lucknow", state: "Uttar Pradesh", totalProjects: 142, completedProjects: 118, inProgressProjects: 18, delayedProjects: 6, riskProjects: 3, sanctionedAmount: 4850, expenditure: 4365, utilizationRate: 90.0, status: "High Performing" },
    { name: "Varanasi", state: "Uttar Pradesh", totalProjects: 128, completedProjects: 112, inProgressProjects: 12, delayedProjects: 4, riskProjects: 2, sanctionedAmount: 4200, expenditure: 3906, utilizationRate: 93.0, status: "High Performing" },
    { name: "Kanpur Nagar", state: "Uttar Pradesh", totalProjects: 115, completedProjects: 92, inProgressProjects: 16, delayedProjects: 7, riskProjects: 4, sanctionedAmount: 3800, expenditure: 3268, utilizationRate: 86.0, status: "High Performing" },
    { name: "Agra", state: "Uttar Pradesh", totalProjects: 98, completedProjects: 74, inProgressProjects: 15, delayedProjects: 9, riskProjects: 5, sanctionedAmount: 3400, expenditure: 2686, utilizationRate: 79.0, status: "Moderate" },
    { name: "Gorakhpur", state: "Uttar Pradesh", totalProjects: 104, completedProjects: 88, inProgressProjects: 11, delayedProjects: 5, riskProjects: 3, sanctionedAmount: 3600, expenditure: 3168, utilizationRate: 88.0, status: "High Performing" },
    { name: "Prayagraj", state: "Uttar Pradesh", totalProjects: 110, completedProjects: 85, inProgressProjects: 17, delayedProjects: 8, riskProjects: 4, sanctionedAmount: 3750, expenditure: 3075, utilizationRate: 82.0, status: "Moderate" },
    { name: "Meerut", state: "Uttar Pradesh", totalProjects: 86, completedProjects: 68, inProgressProjects: 12, delayedProjects: 6, riskProjects: 3, sanctionedAmount: 2900, expenditure: 2378, utilizationRate: 82.0, status: "Moderate" },
    { name: "Bareilly", state: "Uttar Pradesh", totalProjects: 78, completedProjects: 54, inProgressProjects: 14, delayedProjects: 10, riskProjects: 6, sanctionedAmount: 2600, expenditure: 1846, utilizationRate: 71.0, status: "Moderate" },
    { name: "Jhansi", state: "Uttar Pradesh", totalProjects: 65, completedProjects: 42, inProgressProjects: 13, delayedProjects: 10, riskProjects: 7, sanctionedAmount: 2200, expenditure: 1452, utilizationRate: 66.0, status: "Lagging" },
    { name: "Ayodhya", state: "Uttar Pradesh", totalProjects: 92, completedProjects: 81, inProgressProjects: 8, delayedProjects: 3, riskProjects: 1, sanctionedAmount: 3100, expenditure: 2883, utilizationRate: 93.0, status: "High Performing" },
    { name: "Aligarh", state: "Uttar Pradesh", totalProjects: 72, completedProjects: 48, inProgressProjects: 14, delayedProjects: 10, riskProjects: 5, sanctionedAmount: 2450, expenditure: 1690, utilizationRate: 69.0, status: "Lagging" },
    { name: "Moradabad", state: "Uttar Pradesh", totalProjects: 68, completedProjects: 45, inProgressProjects: 13, delayedProjects: 10, riskProjects: 6, sanctionedAmount: 2300, expenditure: 1564, utilizationRate: 68.0, status: "Lagging" },
  ],
  "Maharashtra": [
    { name: "Pune", state: "Maharashtra", totalProjects: 156, completedProjects: 138, inProgressProjects: 12, delayedProjects: 6, riskProjects: 2, sanctionedAmount: 5200, expenditure: 4836, utilizationRate: 93.0, status: "High Performing" },
    { name: "Nagpur", state: "Maharashtra", totalProjects: 124, completedProjects: 106, inProgressProjects: 12, delayedProjects: 6, riskProjects: 3, sanctionedAmount: 4100, expenditure: 3690, utilizationRate: 90.0, status: "High Performing" },
    { name: "Nashik", state: "Maharashtra", totalProjects: 98, completedProjects: 80, inProgressProjects: 11, delayedProjects: 7, riskProjects: 4, sanctionedAmount: 3300, expenditure: 2805, utilizationRate: 85.0, status: "High Performing" },
    { name: "Thane", state: "Maharashtra", totalProjects: 110, completedProjects: 89, inProgressProjects: 13, delayedProjects: 8, riskProjects: 3, sanctionedAmount: 3900, expenditure: 3276, utilizationRate: 84.0, status: "Moderate" },
    { name: "Wardha", state: "Maharashtra", totalProjects: 62, completedProjects: 44, inProgressProjects: 11, delayedProjects: 7, riskProjects: 4, sanctionedAmount: 2100, expenditure: 1533, utilizationRate: 73.0, status: "Moderate" },
    { name: "Chhatrapati Sambhajinagar", state: "Maharashtra", totalProjects: 78, completedProjects: 52, inProgressProjects: 15, delayedProjects: 11, riskProjects: 6, sanctionedAmount: 2600, expenditure: 1768, utilizationRate: 68.0, status: "Lagging" },
  ],
};

export default function DistrictPerformance({ user, onNavigate }: DistrictPerformanceProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "High Performing" | "Moderate" | "Lagging">("ALL");
  const [sortBy, setSortBy] = useState<"utilization" | "projects" | "risk">("utilization");

  const currentState = user.state || "Uttar Pradesh";

  // Derive districts from baseline augmented with live projects data
  const districtList: DistrictMetric[] = useMemo(() => {
    const baseline = STATE_DISTRICT_BASELINES[currentState] || STATE_DISTRICT_BASELINES["Uttar Pradesh"];
    
    // Supplement with any live project districts in the state
    const stateProjects = PROJECTS.filter((p) => !user.state || p.state.toLowerCase() === user.state.toLowerCase());
    const projectDistricts = Array.from(new Set(stateProjects.map((p) => p.district).filter(Boolean)));

    const existingNames = new Set(baseline.map((b) => b.name.toLowerCase()));
    const augmented = [...baseline];

    projectDistricts.forEach((dName) => {
      if (!existingNames.has(dName.toLowerCase())) {
        const dProjects = stateProjects.filter((p) => p.district.toLowerCase() === dName.toLowerCase());
        const total = dProjects.length;
        const completed = dProjects.filter((p) => p.status === "Completed").length;
        const delayed = dProjects.filter((p) => p.status === "Delayed").length;
        const inProg = dProjects.filter((p) => p.status === "In Progress").length;
        const risk = dProjects.filter((p) => p.riskScore > 50).length;
        const sanctioned = dProjects.reduce((sum, p) => sum + p.sanctionedAmount, 0);
        const exp = dProjects.reduce((sum, p) => sum + p.expenditure, 0);
        const util = sanctioned > 0 ? Math.round((exp / sanctioned) * 100) : 75;

        augmented.push({
          name: dName,
          state: currentState,
          totalProjects: total,
          completedProjects: completed,
          inProgressProjects: inProg,
          delayedProjects: delayed,
          riskProjects: risk,
          sanctionedAmount: Math.round(sanctioned),
          expenditure: Math.round(exp),
          utilizationRate: util,
          status: util >= 85 ? "High Performing" : util >= 70 ? "Moderate" : "Lagging",
        });
      }
    });

    return augmented;
  }, [currentState, user.state]);

  // Filtered and sorted districts
  const filteredDistricts = useMemo(() => {
    return districtList
      .filter((d) => {
        const matchesSearch =
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.state.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "utilization") return b.utilizationRate - a.utilizationRate;
        if (sortBy === "projects") return b.totalProjects - a.totalProjects;
        if (sortBy === "risk") return b.riskProjects - a.riskProjects;
        return 0;
      });
  }, [districtList, search, statusFilter, sortBy]);

  // Aggregate State KPIs
  const totalDistrictsCount = districtList.length;
  const highPerformingCount = districtList.filter((d) => d.status === "High Performing").length;
  const laggingCount = districtList.filter((d) => d.status === "Lagging").length;
  const avgUtilization = Math.round(
    districtList.reduce((acc, curr) => acc + curr.utilizationRate, 0) / (districtList.length || 1)
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 animate-in fade-in duration-200">
      {/* ── Top Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconBuildingCommunity className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                District Performance Monitoring
              </h1>
              <p className="text-xs text-muted-foreground md:text-sm">
                Inter-district efficiency benchmark · {currentState} State Directorate
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs font-semibold gap-1 text-primary border-primary/30 bg-primary/5">
            <IconMapPin className="size-3.5 text-primary" />
            {currentState} ({totalDistrictsCount} Districts)
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-8 gap-1.5 text-xs font-medium"
          >
            <IconFileTypePdf className="size-3.5 text-red-500" />
            Export Dossier
          </Button>
        </div>
      </div>

      {/* ── Top 4 KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Average State Utilization</span>
              <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <IconTrendingUp className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{avgUtilization}%</span>
              <span className="text-xs text-emerald-600 font-medium">Target: 90%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${avgUtilization >= 85 ? "bg-emerald-500" : "bg-blue-500"}`}
                style={{ width: `${Math.min(avgUtilization, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">High Performing Districts</span>
              <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <IconCircleCheck className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">{highPerformingCount}</span>
              <span className="text-xs text-muted-foreground font-medium">of {totalDistrictsCount} districts</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <IconSparkles className="size-3" />
              Utilization Rate ≥ 85%
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Lagging / High Delay</span>
              <div className="size-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                <IconShieldExclamation className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">{laggingCount}</span>
              <span className="text-xs text-muted-foreground font-medium">Require Intervention</span>
            </div>
            <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
              <IconAlertTriangle className="size-3" />
              Utilization Rate &lt; 70%
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs hover:border-primary/40 transition-all">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total State Works</span>
              <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <IconBuildingCommunity className="size-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {districtList.reduce((acc, curr) => acc + curr.totalProjects, 0).toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground font-medium">Active Works</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Total Sanctioned: ₹{(districtList.reduce((acc, curr) => acc + curr.sanctionedAmount, 0) / 100).toFixed(1)} Cr
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── District Utilization Comparison Chart ── */}
      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold">
                District-Wise Fund Utilization Comparison
              </CardTitle>
              <CardDescription className="text-xs">
                Efficiency score compared against the National 90% MPLADS benchmark
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-xs bg-emerald-500 inline-block" />
                <span className="text-muted-foreground">≥85% (High)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-xs bg-amber-500 inline-block" />
                <span className="text-muted-foreground">70–84% (Moderate)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-xs bg-red-500 inline-block" />
                <span className="text-muted-foreground">&lt;70% (Lagging)</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={districtList.map((d) => ({
                  name: d.name,
                  utilization: d.utilizationRate,
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: unknown) => [`${val}%`, "Fund Utilization"]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <ReferenceLine
                  y={90}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{ value: "90% Benchmark", position: "top", fill: "#ef4444", fontSize: 10 }}
                />
                <Bar dataKey="utilization" radius={[4, 4, 0, 0]}>
                  {districtList.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.utilizationRate >= 85
                          ? "#10b981"
                          : entry.utilizationRate >= 70
                          ? "#f59e0b"
                          : "#ef4444"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── District Filters & Data Table ── */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">
                District Performance League Table
              </CardTitle>
              <CardDescription className="text-xs">
                Detailed project completion, expenditure, and active risk alerts
              </CardDescription>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative w-48 sm:w-60">
                <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search district..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 border rounded-lg p-0.5 bg-muted/30 text-xs">
                {(["ALL", "High Performing", "Moderate", "Lagging"] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setStatusFilter(tier)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      statusFilter === tier
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tier === "ALL" ? "All Tiers" : tier}
                  </button>
                ))}
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground border rounded-lg px-2 h-8">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "utilization" | "projects" | "risk")}
                  className="bg-transparent border-none text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="utilization">Utilization %</option>
                  <option value="projects">Total Works</option>
                  <option value="risk">Risk Flags</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-y border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">District</th>
                  <th className="px-4 py-3 font-semibold text-center">Total Works</th>
                  <th className="px-4 py-3 font-semibold text-center">Completed</th>
                  <th className="px-4 py-3 font-semibold text-center">Delayed</th>
                  <th className="px-4 py-3 font-semibold">Sanctioned</th>
                  <th className="px-4 py-3 font-semibold">Expenditure</th>
                  <th className="px-4 py-3 font-semibold">Utilization Rate</th>
                  <th className="px-4 py-3 font-semibold text-center">Risk Alerts</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDistricts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-muted-foreground text-xs">
                      No district found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDistricts.map((d) => (
                    <tr key={d.name} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <span>{d.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1 py-0 font-normal ${
                              d.status === "High Performing"
                                ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5"
                                : d.status === "Moderate"
                                ? "border-amber-500/30 text-amber-600 bg-amber-500/5"
                                : "border-red-500/30 text-red-600 bg-red-500/5"
                            }`}
                          >
                            {d.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-medium">{d.totalProjects}</td>
                      <td className="px-4 py-3 text-center font-mono text-emerald-600 font-medium">
                        {d.completedProjects}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-amber-600 font-medium">
                        {d.delayedProjects}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium">₹{(d.sanctionedAmount / 100).toFixed(2)} Cr</td>
                      <td className="px-4 py-3 font-mono font-medium">₹{(d.expenditure / 100).toFixed(2)} Cr</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1 w-32">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-semibold text-foreground">{d.utilizationRate}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                d.utilizationRate >= 85
                                  ? "bg-emerald-500"
                                  : d.utilizationRate >= 70
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(d.utilizationRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {d.riskProjects > 0 ? (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-mono">
                            {d.riskProjects} Flagged
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (onNavigate) {
                              onNavigate("projects");
                            }
                          }}
                          className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1 px-2"
                        >
                          <span>Explore</span>
                          <IconArrowRight className="size-3" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
