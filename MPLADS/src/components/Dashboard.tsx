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
} from "recharts";
import * as XLSX from "xlsx";
import type { User } from "@/types";
import {
  NATIONAL_KPIs,
  STATES_DATA,
  MONTHLY_EXPENDITURE,
  CATEGORY_DISTRIBUTION,
  FUND_HISTORY,
  PROJECTS,
  ALERTS,
} from "@/data/mpladsData";
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
  IconShieldExclamation,
  IconChartPie,
  IconChartBar,
  IconChartLine,
  IconChartAreaLine,
  IconFilter,
} from "@tabler/icons-react";

interface Props {
  user: User;
  onNavigate: (page: string) => void;
}

// ── Chart Configurations ──────────────────────────────────────────────────────
const areaChartConfig = {
  expenditure: {
    label: "Actual Expenditure",
    color: "var(--chart-1)",
  },
  target: {
    label: "Planned Target",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const pieChartConfig = {
  "Roads & Connectivity": {
    label: "Roads & Connectivity",
    color: "var(--chart-1)",
  },
  "Water Supply & Sanitation": {
    label: "Water Supply & Sanitation",
    color: "var(--chart-2)",
  },
  "Education & Child Dev": {
    label: "Education & Child Dev",
    color: "var(--chart-3)",
  },
  Health: {
    label: "Health Infrastructure",
    color: "var(--chart-4)",
  },
  "Energy & Solar": {
    label: "Energy & Solar",
    color: "var(--chart-5)",
  },
  Others: {
    label: "Others & Civic Amenities",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

const barChartConfig = {
  totalFunds: {
    label: "Sanctioned (₹Cr)",
    color: "var(--chart-1)",
  },
  utilizedFunds: {
    label: "Utilized (₹Cr)",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const lineChartConfig = {
  utilizationRate: {
    label: "Fund Utilization (%)",
    color: "var(--chart-1)",
  },
  completionRate: {
    label: "Project Completion (%)",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
  "var(--destructive)",
  "var(--muted-foreground)",
];

const fmt = (n: number) => (n >= 100 ? `₹${(n / 100).toFixed(1)}Cr` : `₹${n}L`);
const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toFixed(1)}%` : "—");

function exportDashboard(user: User) {
  const wb = XLSX.utils.book_new();
  const ts = new Date().toLocaleDateString("en-IN");

  const projects =
    user.role === "MP"
      ? PROJECTS.filter((p) => p.constituency === user.constituency)
      : user.role === "District"
      ? PROJECTS.filter((p) => p.district === user.district)
      : user.role === "State"
      ? PROJECTS.filter((p) => p.state === user.state)
      : PROJECTS;

  const projectRows = [
    ["NIDHI-RAKSHAK MPLADS Executive Export", "", "", "", "", "", "", "", ""],
    [`Role: ${user.role}`, `Name: ${user.name}`, "", "", "", "", "", `Exported: ${ts}`, ""],
    [""],
    [
      "Work Order No",
      "Project Name",
      "Category",
      "State",
      "District",
      "Constituency",
      "MP Name",
      "Sanctioned (₹L)",
      "Released (₹L)",
      "Expenditure (₹L)",
      "Progress %",
      "Status",
      "Risk Level",
      "Risk Score",
      "UC Submitted",
      "Asset Created",
      "Sanction Date",
      "Expected Completion",
      "Completion Date",
      "Photos",
      "Inspections",
    ],
    ...projects.map((p) => [
      p.workOrderNo,
      p.name,
      p.category,
      p.state,
      p.district,
      p.constituency,
      p.mpName,
      p.sanctionedAmount,
      p.releasedAmount,
      p.expenditure,
      p.progress,
      p.status,
      p.riskLevel,
      p.riskScore,
      p.ucSubmitted ? "Yes" : "No",
      p.assetCreated ? "Yes" : "No",
      p.sanctionDate,
      p.expectedCompletion,
      p.completionDate ?? "—",
      p.photos,
      p.inspections,
    ]),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(projectRows);
  ws1["!cols"] = [
    12, 40, 18, 14, 16, 18, 20, 12, 12, 12, 10, 12, 10, 10, 10, 10, 12, 14, 14, 8, 10,
  ].map((w) => ({ wch: w }));
  ws1["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];
  XLSX.utils.book_append_sheet(wb, ws1, "Projects");

  const fundRows = [
    ["Fund History — FY-wise Allocation & Utilization"],
    [""],
    [
      "Financial Year",
      "Allocated (₹Cr)",
      "Released (₹Cr)",
      "Utilized (₹Cr)",
      "Lapsed (₹Cr)",
      "Utilization %",
    ],
    ...FUND_HISTORY.map((f) => [
      f.year,
      (f.allocated / 100).toFixed(2),
      (f.released / 100).toFixed(2),
      (f.utilized / 100).toFixed(2),
      (f.lapsed / 100).toFixed(2),
      f.released > 0 ? ((f.utilized / f.released) * 100).toFixed(1) + "%" : "—",
    ]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(fundRows);
  ws2["!cols"] = [14, 16, 16, 16, 14, 14].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws2, "Fund History");

  const monthRows = [
    ["Monthly Expenditure vs Target (FY 2024-25)"],
    [""],
    ["Month", "Target (₹Cr)", "Actual Expenditure (₹Cr)", "Variance (₹Cr)", "Achievement %"],
    ...MONTHLY_EXPENDITURE.map((m) => {
      const variance = (m.expenditure - m.target).toFixed(1);
      const pctVal = m.target > 0 ? ((m.expenditure / m.target) * 100).toFixed(1) + "%" : "—";
      return [m.month, m.target, m.expenditure, variance, pctVal];
    }),
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(monthRows);
  ws3["!cols"] = [10, 14, 20, 14, 14].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws3, "Monthly Expenditure");

  if (user.role === "Ministry" || user.role === "State") {
    const stateRows = [
      ["State-wise MPLADS Performance"],
      [""],
      [
        "State",
        "Total Projects",
        "Completed",
        "Pending",
        "Delayed",
        "Risk Projects",
        "Total Funds (₹Cr)",
        "Utilized Funds (₹Cr)",
        "Utilization %",
        "No. of MPs",
      ],
      ...STATES_DATA.map((s) => [
        s.state,
        s.totalProjects,
        s.completedProjects,
        s.pendingProjects,
        s.delayedProjects,
        s.riskProjects,
        (s.totalFunds / 100).toFixed(2),
        (s.utilizedFunds / 100).toFixed(2),
        s.utilization + "%",
        s.mps,
      ]),
    ];
    const ws4 = XLSX.utils.aoa_to_sheet(stateRows);
    ws4["!cols"] = [22, 14, 12, 12, 12, 14, 16, 18, 14, 10].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws4, "State Performance");
  }

  const role = user.role;
  const scope =
    role === "MP"
      ? user.constituency
      : role === "District"
      ? user.district
      : role === "State"
      ? user.state
      : "National";
  const filename = `NIDHI-RAKSHAK_${role}_${scope}_${ts.replace(/\//g, "-")}.xlsx`;
  XLSX.writeFile(wb, filename);
}

export default function Dashboard({ user, onNavigate }: Props) {
  const isMinistry = user.role === "Ministry";
  const isMP = user.role === "MP";
  const isDistrict = user.role === "District";
  const isCitizen = user.role === "Citizen";

  const [timePeriod, setTimePeriod] = React.useState("fy-all");
  const [projectFilter, setProjectFilter] = React.useState("all");

  const showProjects =
    user.role === "MP"
      ? PROJECTS.filter((p) => p.constituency === user.constituency)
      : user.role === "District"
      ? PROJECTS.filter((p) => p.district === user.district)
      : user.role === "State"
      ? PROJECTS.filter((p) => p.state === user.state)
      : PROJECTS;

  const filteredProjects = React.useMemo(() => {
    if (projectFilter === "completed") return showProjects.filter((p) => p.status === "Completed");
    if (projectFilter === "delayed") return showProjects.filter((p) => p.status === "Delayed");
    if (projectFilter === "risk") return showProjects.filter((p) => p.riskScore > 50);
    return showProjects;
  }, [showProjects, projectFilter]);

  const activeAlerts = ALERTS.filter((a) => a.status === "Active").slice(0, 4);

  // Filtered monthly expenditure data based on selected range
  const filteredMonthlyExpenditure = React.useMemo(() => {
    if (timePeriod === "h1") return MONTHLY_EXPENDITURE.slice(0, 6);
    if (timePeriod === "q2") return MONTHLY_EXPENDITURE.slice(3, 6);
    return MONTHLY_EXPENDITURE;
  }, [timePeriod]);

  // Line chart multi-year trend data derived from FUND_HISTORY
  const lineTrendData = React.useMemo(() => {
    return FUND_HISTORY.map((f, idx) => {
      const utilRate = f.released > 0 ? Math.round((f.utilized / f.released) * 100) : 0;
      const compRate = Math.min(100, Math.round(utilRate * 0.92 + (idx > 2 ? 6 : 2)));
      return {
        year: f.year,
        utilizationRate: utilRate,
        completionRate: compRate,
        allocated: Math.round(f.allocated / 100),
        utilized: Math.round(f.utilized / 100),
      };
    });
  }, []);

  // Bar chart state comparison dataset
  const stateBarData = React.useMemo(() => {
    return STATES_DATA.map((s) => ({
      state: s.state.replace("Pradesh", "P.").replace("Bengal", "B."),
      totalFunds: Math.round(s.totalFunds / 100),
      utilizedFunds: Math.round(s.utilizedFunds / 100),
      utilization: s.utilization,
      completedProjects: s.completedProjects,
      totalProjects: s.totalProjects,
    }));
  }, []);

  // Citizen specialized view
  if (isCitizen) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Card className="bg-primary text-primary-foreground border-none shadow-md">
          <CardHeader className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-none">
                Citizen Transparency Portal
              </Badge>
              <span className="text-xs text-primary-foreground/80 font-mono">Real-time Public Works</span>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-primary-foreground">
              Track MPLADS Projects In Your Constituency
            </CardTitle>
            <CardDescription className="text-primary-foreground/80 text-sm mt-1 max-w-2xl">
              Inspect verified public fund allocation, track on-ground progress with GPS geo-tagged photos, and report anomalies directly to authorities.
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-2.5 mt-5">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter district, constituency, or MP name..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-card text-foreground border border-input text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground"
                />
              </div>
              <Button variant="secondary" className="font-semibold text-xs h-10 px-5">
                Search Works
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Citizen Quick Stats */}
        <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
          {[
            { label: "Total Projects", value: "89,472", sub: "Nationwide works", icon: IconBuildingCommunity },
            { label: "Completed Works", value: "62,841", sub: "Verified assets", icon: IconCircleCheck },
            { label: "Active Execution", value: "21,847", sub: "Under construction", icon: IconClock },
            { label: "Total Investment", value: "₹1,68,200 Cr", sub: "Disbursed to date", icon: IconCoin },
          ].map((item) => {
            const IconComp = item.icon;
            return (
              <Card key={item.label} className="@container/card">
                <CardHeader>
                  <CardDescription>{item.label}</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums text-foreground">
                    {item.value}
                  </CardTitle>
                  <CardAction>
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <IconComp className="size-4" />
                    </div>
                  </CardAction>
                </CardHeader>
                <CardFooter className="text-xs text-muted-foreground">
                  {item.sub}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Citizen Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="@container/card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Fund Allocation by Sector</CardTitle>
                  <CardDescription className="text-xs">Distribution across civic development areas</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  <IconChartPie className="size-3.5 mr-1" /> Donut Chart
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[260px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={CATEGORY_DISTRIBUTION}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {CATEGORY_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="name" className="-translate-y-2 flex-wrap gap-2 text-[11px]" />}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="@container/card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Monthly Expenditure Pace</CardTitle>
                  <CardDescription className="text-xs">Actual funds deployed vs planned monthly target</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs">
                  <IconChartAreaLine className="size-3.5 mr-1" /> Area Chart
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={areaChartConfig} className="aspect-auto h-[260px] w-full">
                <AreaChart data={MONTHLY_EXPENDITURE} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="citizenAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-[11px]" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-[11px]" />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="var(--chart-2)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="none"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenditure"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#citizenAreaGrad)"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Works Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Verified Works in Your Region</CardTitle>
                <CardDescription className="text-xs">Showing latest monitored works in Lucknow / UP area</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate("projects")} className="text-xs">
                Explore All Works →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Project Name</TableHead>
                  <TableHead className="text-xs">Sector</TableHead>
                  <TableHead className="text-xs">Sanctioned</TableHead>
                  <TableHead className="text-xs">Progress</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROJECTS.slice(0, 4).map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onNavigate("projects")}
                  >
                    <TableCell className="font-medium text-xs">
                      <div>{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{p.district} • {p.workOrderNo}</div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.category}</TableCell>
                    <TableCell className="text-xs font-mono font-medium">{fmt(p.sanctionedAmount)}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px]">{p.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === "Completed"
                            ? "default"
                            : p.status === "Delayed"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px] px-2 py-0.5"
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Institutional KPI Cards (formatted following dashboard-01 Card structure)
  const kpiList = isMinistry
    ? [
        {
          label: "Total Projects",
          value: "89,472",
          sub: "Nationwide across 543 constituencies",
          footer: "Active public asset portfolio",
          trend: "+12.4%",
          isPositive: true,
        },
        {
          label: "Completed Works",
          value: "62,841",
          sub: `${pct(NATIONAL_KPIs.completedProjects, NATIONAL_KPIs.totalProjects)} completion benchmark`,
          footer: "Trending above target",
          trend: "+8.2%",
          isPositive: true,
        },
        {
          label: "Fund Utilization",
          value: "84.8%",
          sub: "₹1,68,200 Cr of ₹1,98,400 Cr released",
          footer: "Solid pace in Q2",
          trend: "+3.1%",
          isPositive: true,
        },
        {
          label: "Flagged Risks",
          value: "3,847",
          sub: "AI anomaly detection triggers",
          footer: "Resolution in progress",
          trend: "-5.3%",
          isPositive: true,
        },
      ]
    : isMP
    ? [
        {
          label: "Constituency Works",
          value: String(showProjects.length),
          sub: `In ${user.constituency} constituency`,
          footer: "All active work orders",
          trend: "+4 new",
          isPositive: true,
        },
        {
          label: "Completed Works",
          value: String(showProjects.filter((p) => p.status === "Completed").length),
          sub: "Verified on-ground completion",
          footer: `${pct(showProjects.filter((p) => p.status === "Completed").length, showProjects.length)} success rate`,
          trend: "On Track",
          isPositive: true,
        },
        {
          label: "Disbursed Funds",
          value: fmt(showProjects.reduce((s, p) => s + p.expenditure, 0)),
          sub: "Direct ground disbursements",
          footer: "87.4% fund deployment",
          trend: "+8.2%",
          isPositive: true,
        },
        {
          label: "Active Risk Alerts",
          value: String(showProjects.filter((p) => p.riskScore > 50).length),
          sub: "High/Critical inspection triggers",
          footer: "Requires MP review",
          trend: "Urgent",
          isPositive: false,
        },
      ]
    : [
        {
          label: "Total Projects",
          value: isDistrict ? "482" : "1,847",
          sub: `Jurisdiction: ${user.district || user.state}`,
          footer: "Tracked in real-time",
          trend: "+8.2%",
          isPositive: true,
        },
        {
          label: "Completed Works",
          value: isDistrict ? "314" : "1,204",
          sub: "65.2% milestone completion",
          footer: "Meets SLA expectation",
          trend: "+4.1%",
          isPositive: true,
        },
        {
          label: "Fund Utilization",
          value: "75.0%",
          sub: "₹6,180 Cr of ₹8,240 Cr deployed",
          footer: "Q2 target trajectory",
          trend: "+2.1%",
          isPositive: true,
        },
        {
          label: "Risk Flags",
          value: isDistrict ? "24" : "94",
          sub: "Open for verification",
          footer: "Under field audit",
          trend: "-3.2%",
          isPositive: true,
        },
      ];

  return (
    <div className="space-y-6">
      {/* ── Top Dashboard Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {isMinistry
                ? "National MPLADS Executive Overview"
                : isMP
                ? `${user.constituency} Constituency Dashboard`
                : user.role === "State"
                ? `${user.state} — State Level Dashboard`
                : `${user.district} District Operations Dashboard`}
            </h1>
            <Badge variant="secondary" className="font-mono text-[10px] hidden md:inline-flex">
              PFMS-INTEGRATED
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Real-time analytics, predictive risk surveillance & fund flow insights • FY 2024-25 Q2
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportDashboard(user)}
            className="text-xs h-9 gap-1.5"
          >
            <IconFileSpreadsheet className="size-4 text-emerald-600" />
            <span>Export Excel</span>
          </Button>
          <Button
            size="sm"
            onClick={() => onNavigate("reports")}
            className="text-xs h-9 gap-1.5 font-medium"
          >
            <IconFileAnalytics className="size-4" />
            <span>Analytics Dossier</span>
          </Button>
        </div>
      </div>

      {/* ── Metric KPI Cards Grid (Styled in dashboard-01 style) ── */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {kpiList.map((kpi) => (
          <Card key={kpi.label} className="@container/card">
            <CardHeader>
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
                {kpi.value}
              </CardTitle>
              <CardAction>
                <Badge
                  variant="outline"
                  className={
                    kpi.isPositive
                      ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                      : "border-destructive/30 text-destructive bg-destructive/10"
                  }
                >
                  {kpi.isPositive ? (
                    <IconTrendingUp className="size-3.5 mr-1" />
                  ) : (
                    <IconTrendingDown className="size-3.5 mr-1" />
                  )}
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

      {/* ── Primary Charts Grid (Area Chart & Pie/Donut Chart) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Interactive Area Chart (Monthly Expenditure vs Target) */}
        <Card className="lg:col-span-2 @container/card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Monthly Fund Utilization Trajectory</CardTitle>
              <CardDescription className="text-xs">
                Monthly actual expenditure vs planned targets (FY 2024-25 in ₹ Crore)
              </CardDescription>
            </div>
            <CardAction>
              <ToggleGroup
                multiple={false}
                value={[timePeriod]}
                onValueChange={(val) => {
                  if (val?.[0]) setTimePeriod(val[0]);
                }}
                variant="outline"
                className="hidden *:data-[slot=toggle-group-item]:px-3! md:flex"
              >
                <ToggleGroupItem value="fy-all">All Year</ToggleGroupItem>
                <ToggleGroupItem value="h1">H1 (Apr-Sep)</ToggleGroupItem>
                <ToggleGroupItem value="q2">Q2 (Jul-Sep)</ToggleGroupItem>
              </ToggleGroup>
              <Select
                value={timePeriod}
                onValueChange={(val) => {
                  if (val !== null) setTimePeriod(val);
                }}
              >
                <SelectTrigger className="flex w-32 md:hidden" size="sm">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
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
              <AreaChart
                data={filteredMonthlyExpenditure}
                margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="areaExpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-[11px]"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-[11px]"
                />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="var(--chart-2)"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="expenditure"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#areaExpGradient)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Card 2: Pie / Donut Chart (Category & Sector Allocation) */}
        <Card className="lg:col-span-1 @container/card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Sector Distribution</CardTitle>
                <CardDescription className="text-xs">MPLADS project count share</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                <IconChartPie className="size-3 mr-1" /> Donut Chart
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[260px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={CATEGORY_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {CATEGORY_DISTRIBUTION.map((entry, index) => (
                    <Cell
                      key={`pie-cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" className="-translate-y-2 flex-wrap gap-2 text-[10px]" />}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Secondary Charts Grid (Bar Chart & Line Chart) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 3: Bar Chart (State/District Fund Sanctions vs Utilization) */}
        <Card className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">State Fund Sanctioned vs Utilized</CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono">
                  <IconChartBar className="size-3 mr-1" /> Bar Chart
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Comparison of total capital allocations against verified ground expenditures (₹ in Cr)
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("gis")}
              className="text-xs text-primary"
            >
              GIS Map →
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={barChartConfig} className="aspect-auto h-[260px] w-full">
              <BarChart data={stateBarData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="state"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-[11px]"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-[11px]"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="totalFunds" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="utilizedFunds" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Card 4: Line Chart (Multi-Year Fund Utilization Rate & Completion Velocity) */}
        <Card className="@container/card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">Utilization & Completion Velocity Trend</CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono">
                  <IconChartLine className="size-3 mr-1" /> Line Chart
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Year-over-Year utilization rate (%) & completion curve (FY 2019-20 to 2024-25)
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("reports")}
              className="text-xs text-primary"
            >
              Audits →
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            <ChartContainer config={lineChartConfig} className="aspect-auto h-[260px] w-full">
              <LineChart data={lineTrendData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-[11px]"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  domain={[60, 100]}
                  className="text-[11px]"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="utilizationRate"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "var(--chart-1)" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="completionRate"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "var(--chart-3)" }}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Lower Data Section: Projects Table & Risk Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Monitored Works Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Active Monitored Works</CardTitle>
              <CardDescription className="text-xs">
                Real-time project tracking with verified progress & anomaly risk scoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={projectFilter}
                onValueChange={(val) => {
                  if (val !== null) setProjectFilter(val);
                }}
              >
                <SelectTrigger size="sm" className="w-32 text-xs">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Works</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="risk">High Risk</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate("projects")}
                className="text-xs"
              >
                All Projects ({showProjects.length}) →
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Work Name & Order</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Sanctioned</TableHead>
                  <TableHead className="text-xs">Progress</TableHead>
                  <TableHead className="text-xs">Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.slice(0, 5).map((p) => (
                  <TableRow
                    key={p.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onNavigate("projects")}
                  >
                    <TableCell className="font-medium text-xs">
                      <div className="font-semibold text-foreground line-clamp-1">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {p.workOrderNo} • {p.district}, {p.state}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.category}</TableCell>
                    <TableCell className="text-xs font-mono font-medium">{fmt(p.sanctionedAmount)}</TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px]">{p.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.riskLevel === "Critical"
                            ? "destructive"
                            : p.riskLevel === "High"
                            ? "destructive"
                            : "outline"
                        }
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 ${
                          p.riskLevel === "Medium"
                            ? "border-amber-500/50 text-amber-600 bg-amber-500/10"
                            : p.riskLevel === "Low"
                            ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/10"
                            : ""
                        }`}
                      >
                        {p.riskLevel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Column: Active AI Risk Alerts */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Active AI Risk Alerts</CardTitle>
              <CardDescription className="text-xs">
                {activeAlerts.length} urgent triggers requiring intervention
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("alerts")}
              className="text-xs text-destructive hover:text-destructive/80"
            >
              View All →
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => onNavigate("alerts")}
                className="group p-3 rounded-lg border border-border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`size-2 rounded-full mt-1.5 shrink-0 ${
                      alert.severity === "Critical"
                        ? "bg-destructive animate-pulse"
                        : alert.severity === "High"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-foreground line-clamp-1">
                        {alert.title.replace(/^(Critical|High|Medium|Low):\s*/, "")}
                      </span>
                      <Badge
                        variant={alert.severity === "Critical" ? "destructive" : "outline"}
                        className="text-[9px] px-1 py-0 uppercase"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                      {alert.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 pt-1.5 border-t border-border/50">
                      <span>{alert.district ? `${alert.district}, ${alert.state}` : alert.state || "National"}</span>
                      <span className="font-mono">{alert.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── National Fund History Table (Ministry view) ── */}
      {isMinistry && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">National Fund Summary — Year-wise</CardTitle>
              <CardDescription className="text-xs">
                Historical allocation, disbursement, ground utilization, and lapse amounts (₹ in Crore)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("reports")}
              className="text-xs"
            >
              Full Audit Dossier →
            </Button>
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
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        ₹{(f.allocated / 100).toFixed(0)}Cr
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        ₹{(f.released / 100).toFixed(0)}Cr
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                        ₹{(f.utilized / 100).toFixed(0)}Cr
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-destructive">
                        ₹{(f.lapsed / 100).toFixed(0)}Cr
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs font-semibold ${
                            utilPct >= 88
                              ? "border-emerald-500/50 text-emerald-600 bg-emerald-500/10"
                              : utilPct >= 80
                              ? "border-amber-500/50 text-amber-600 bg-amber-500/10"
                              : "border-destructive/50 text-destructive bg-destructive/10"
                          }`}
                        >
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
    </div>
  );
}
