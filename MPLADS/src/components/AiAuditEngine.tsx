"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IconBrain,
  IconSend,
  IconUpload,
  IconDownload,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconShieldCheck,
  IconFlame,
  IconActivity,
  IconChartRadar,
  IconPhoto,
  IconRefresh,
  IconPlayerPlay,
  IconSparkles,
  IconCircleCheck,
  IconCircleX,
  IconInfoCircle,
  IconFileSpreadsheet,
  IconChevronRight,
  IconLoader2,
  IconSearch,
  IconMapPin,
  IconCalendar,
  IconCurrencyRupee,
  IconBuilding,
  IconCamera,
  IconListCheck,
  IconFilter,
  IconZoomIn,
  IconFolderOpen,
} from "@tabler/icons-react";
import type { Project } from "../types";
import { PROJECTS, STATES_DATA } from "../data/mpladsData";
import { ArchetypeIcon } from "@/components/ArchetypeIcon";
import {
  type WorkAuditRequest,
  type WorkAuditResponse,
  type BatchAuditResponse,
  type ModelMetadata,
  type HealthResponse,
  auditSingleWork,
  auditWebsiteProject,
  auditWebsiteProjectsBatch,
  checkHealth,
  getMetadata,
  tierColor,
  ARCHETYPE_LABELS,
  WORK_CATEGORIES,
  CONSTITUENCY_TYPES,
  COMPONENT_LABELS,
  MODEL_PLOTS,
  fmtLakhs,
  lakhsToInr,
  inrToLakhs,
  calcDaysBetween,
} from "@/lib/auditApi";

// ─── Risk Score Gauge Component (Enlarged & High-Visibility) ──────────────────

function RiskGauge({ score, tier }: { score: number; tier: string }) {
  const tc = tierColor(tier);
  const radius = 105;
  const stroke = 18;
  const cx = 135;
  const cy = 135;
  const circumference = Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const offset = circumference - (progress / 100) * circumference;

  const gradientId = "gaugeGradLarge";

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <svg width={270} height={160} viewBox="0 0 270 160" className="overflow-visible drop-shadow-sm">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        {/* Background Arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/20"
        />
        {/* Value Arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        {/* Main Score Display */}
        <text
          x={cx}
          y={cy - 20}
          textAnchor="middle"
          className="fill-foreground font-black tracking-tight"
          style={{ fontSize: "44px", fontWeight: 900 }}
        >
          {score.toFixed(1)}
        </text>
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          className="fill-muted-foreground font-semibold"
          style={{ fontSize: "13px" }}
        >
          / 100 Composite Score
        </text>
      </svg>
      <div className="flex items-center gap-2">
        <Badge
          className={`${tc.bg} ${tc.text} ${tc.border} border text-sm px-5 py-1.5 font-black tracking-wider rounded-full shadow-sm`}
        >
          {tier} RISK TIER
        </Badge>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AiAuditEngine() {
  // Navigation & Mode States
  const [activeTab, setActiveTab] = useState("studio");
  const [searchProject, setSearchProject] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // Selected Website Project for Studio Mode
  const [selectedProjectId, setSelectedProjectId] = useState<string>(PROJECTS[0]?.id || "");
  const selectedProject = useMemo(() => {
    return PROJECTS.find((p) => p.id === selectedProjectId) || PROJECTS[0];
  }, [selectedProjectId]);

  // Editable Form for Studio Project (allowing officer to adjust real-time inspection inputs)
  const [studioForm, setStudioForm] = useState<Partial<Project>>({ ...PROJECTS[0] });

  // Update studio form whenever a new project is picked
  useEffect(() => {
    if (selectedProject) {
      setStudioForm({ ...selectedProject });
      setResult(null);
    }
  }, [selectedProject]);

  // Results State
  const [result, setResult] = useState<WorkAuditResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Batch Database Audit State
  const [batchResults, setBatchResults] = useState<BatchAuditResponse | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchFilterTier, setBatchFilterTier] = useState<string>("ALL");

  // Custom Proposal Form State
  const [customForm, setCustomForm] = useState({
    name: "Construction of Multi-Purpose Cyclone Shelter",
    category: "Disaster Management",
    state: "Odisha",
    district: "Kendrapara",
    constituency: "Kendrapara",
    sanctionedAmount: 75.0,
    expenditure: 72.5,
    sanctionDate: "2024-02-10",
    expectedCompletion: "2024-11-30",
    completionDate: "2024-11-15",
    contractor: "M/s Coastal Infra Developers",
    photos: 18,
    inspections: 4,
    geoLat: 20.501,
    geoLng: 86.422,
    hasGeoMismatch: false,
  });

  // Metadata & Health State
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check health on mount
  useEffect(() => {
    checkHealth()
      .then((h) => {
        setHealth(h);
        setBackendOnline(true);
      })
      .catch(() => setBackendOnline(false));

    getMetadata()
      .then(setMetadata)
      .catch(() => {});
  }, []);

  const refreshHealth = () => {
    setBackendOnline(null);
    checkHealth()
      .then((h) => {
        setHealth(h);
        setBackendOnline(true);
      })
      .catch(() => setBackendOnline(false));
  };

  // Run Live Audit on Studio Project
  const handleStudioAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const auditPayload: Partial<Project> = {
        ...studioForm,
        // Guarantee proper types
        sanctionedAmount: Number(studioForm.sanctionedAmount || 0),
        expenditure: Number(studioForm.expenditure || 0),
        inspections: Number(studioForm.inspections || 0),
        photos: Number(studioForm.photos || 0),
        photoLocationMatch: studioForm.photoLocationMatch !== false,
        similarWorkCount500m: Number(studioForm.similarWorkCount500m || 0),
        ucSubmitted: studioForm.ucSubmitted ?? false,
        assetCreated: studioForm.assetCreated ?? false,
      };
      const res = await auditWebsiteProject(auditPayload);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Inference failed. Is the FastAPI backend running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  // Run Batch Audit across All Website Projects
  const handleAuditAllProjects = async () => {
    setBatchLoading(true);
    setError(null);
    try {
      const res = await auditWebsiteProjectsBatch(PROJECTS);
      setBatchResults(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Batch audit failed");
    } finally {
      setBatchLoading(false);
    }
  };

  // Run Custom Proposal Audit
  const handleCustomAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const auditPayload: Partial<Project> = {
        id: `PROPOSAL-${Date.now().toString().slice(-4)}`,
        name: customForm.name,
        category: customForm.category,
        state: customForm.state,
        district: customForm.district,
        constituency: customForm.constituency,
        sanctionedAmount: Number(customForm.sanctionedAmount),
        expenditure: Number(customForm.expenditure),
        sanctionDate: customForm.sanctionDate,
        expectedCompletion: customForm.expectedCompletion,
        completionDate: customForm.completionDate,
        contractor: customForm.contractor,
        inspections: Number(customForm.inspections),
        photos: Number(customForm.photos),
        geoLat: customForm.hasGeoMismatch ? 0 : customForm.geoLat,
        geoLng: customForm.hasGeoMismatch ? 0 : customForm.geoLng,
        riskFlags: customForm.hasGeoMismatch ? ["GPS coordinate mismatch with GIS sanction"] : [],
      };
      const res = await auditWebsiteProject(auditPayload);
      setResult(res);
      setActiveTab("studio");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Proposal audit failed");
    } finally {
      setLoading(false);
    }
  };

  // Filtered Projects for Studio Selector
  const filteredProjects = useMemo(() => {
    return PROJECTS.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchProject.toLowerCase()) ||
        p.id.toLowerCase().includes(searchProject.toLowerCase()) ||
        p.district.toLowerCase().includes(searchProject.toLowerCase()) ||
        p.state.toLowerCase().includes(searchProject.toLowerCase()) ||
        (p.contractor && p.contractor.toLowerCase().includes(searchProject.toLowerCase()));
      const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [searchProject, categoryFilter]);

  // Derived Radar & Bar Data
  const radarData = result
    ? COMPONENT_LABELS.map((c) => ({
        component: c.short,
        value: result.component_breakdown[c.key],
        fullMark: 100,
      }))
    : [];

  const barData = result
    ? COMPONENT_LABELS.map((c) => ({
        name: c.short,
        score: result.component_breakdown[c.key],
        weight: c.weight,
      }))
    : [];

  // Derived Batch Data
  const batchTierData = batchResults
    ? ["LOW", "MODERATE", "HIGH", "CRITICAL"].map((tier) => ({
        name: tier,
        value: batchResults.results.filter((r) => r.risk_tier === tier).length,
      }))
    : [];

  const filteredBatchResults = useMemo(() => {
    if (!batchResults) return [];
    if (batchFilterTier === "ALL") return batchResults.results;
    return batchResults.results.filter((r) => r.risk_tier === batchFilterTier);
  }, [batchResults, batchFilterTier]);

  const PIE_COLORS = ["#10b981", "#f59e0b", "#f97316", "#ef4444"];

  // Export Batch to Excel
  const exportBatchToExcel = () => {
    if (!batchResults) return;
    const rows = batchResults.results.map((r) => {
      const matched = PROJECTS.find((p) => p.id === r.work_id);
      return {
        "Work ID": r.work_id,
        "Project Name": matched?.name || "N/A",
        "State": matched?.state || "N/A",
        "District": matched?.district || "N/A",
        "Category": matched?.category || "N/A",
        "Sanctioned (₹ Lakhs)": matched?.sanctionedAmount || 0,
        "Expenditure (₹ Lakhs)": matched?.expenditure || 0,
        "Composite Risk Score": r.composite_risk_score,
        "Risk Tier": r.risk_tier,
        "Anomaly Detected": r.is_anomalous ? "YES" : "NO",
        "Anomaly Archetype": r.predicted_archetype,
        "Archetype Confidence (%)": (r.archetype_confidence * 100).toFixed(1),
        "Key Risk Drivers": r.risk_drivers.join(" | "),
        "Statutory Governance Action": r.governance_action,
        "ML Score (30%)": r.component_breakdown.c1_supervised_ml,
        "Isolation Score (15%)": r.component_breakdown.c2_isolation_outlier,
        "Cost Overrun (20%)": r.component_breakdown.c3_cost_overrun_penalty,
        "Spatial Duplication (10%)": r.component_breakdown.c4_spatial_duplication_penalty,
        "Evidence Deficit (15%)": r.component_breakdown.c5_evidence_deficit_penalty,
        "Statutory Delay (10%)": r.component_breakdown.c6_statutory_delay_penalty,
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ML_Audit_Matrix");
    XLSX.writeFile(wb, "MPLADS_SATHI_AI_Audit_Dossier.xlsx");
  };

  return (
    <div className="space-y-6 pb-16 px-1">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <IconBrain className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI Audit Engine & Intelligence Hub</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Official ML Governance Engine — XGBoost Binary + Multiclass Archetype + Isolation Forest with Hybrid Risk Fusion
              </p>
            </div>
          </div>
        </div>

        {/* Backend Connectivity Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={refreshHealth}
            title="Click to re-check backend connection"
            className="flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition-colors shadow-sm"
          >
            <span
              className={`size-2.5 rounded-full ${
                backendOnline === true
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"
                  : backendOnline === false
                  ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                  : "bg-yellow-500 animate-pulse"
              }`}
            />
            <span className="font-medium">
              {backendOnline === true
                ? "Inference Engine Online (Port 8000)"
                : backendOnline === false
                ? "Backend Offline"
                : "Connecting..."}
            </span>
          </button>
          {health && (
            <Badge variant="outline" className="text-xs font-normal">
              {health.models_loaded.length} Model Artifacts Ready
            </Badge>
          )}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm shadow-sm">
          <IconAlertTriangle className="size-5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}>
            <IconX className="size-4" />
          </button>
        </div>
      )}

      {/* ── Main Feature Tabs ──────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full h-12 p-1 bg-muted/60 border rounded-xl">
          <TabsTrigger value="studio" className="gap-2 text-xs sm:text-sm font-semibold data-[state=active]:shadow-sm rounded-lg">
            <IconActivity className="size-4 shrink-0" />
            <span className="hidden sm:inline">Project Audit Studio</span>
            <span className="sm:hidden">Studio</span>
          </TabsTrigger>
          <TabsTrigger value="batch" className="gap-2 text-xs sm:text-sm font-semibold data-[state=active]:shadow-sm rounded-lg">
            <IconFileSpreadsheet className="size-4 shrink-0" />
            <span className="hidden sm:inline">Database Batch Audit</span>
            <span className="sm:hidden">Batch</span>
          </TabsTrigger>
          <TabsTrigger value="proposal" className="gap-2 text-xs sm:text-sm font-semibold data-[state=active]:shadow-sm rounded-lg">
            <IconSend className="size-4 shrink-0" />
            <span className="hidden sm:inline">New Proposal Audit</span>
            <span className="sm:hidden">Proposal</span>
          </TabsTrigger>
          <TabsTrigger value="intel" className="gap-2 text-xs sm:text-sm font-semibold data-[state=active]:shadow-sm rounded-lg">
            <IconSparkles className="size-4 shrink-0" />
            <span className="hidden sm:inline">Model Intel & CAG Specs</span>
            <span className="sm:hidden">Model</span>
          </TabsTrigger>
        </TabsList>

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 1: PROJECT AUDIT STUDIO (Easy Interactive Flow)
        ═════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="studio" className="space-y-6 mt-5 w-full">
          {/* Step 1: Select Website Project Banner */}
          <Card className="w-full border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 shadow-sm rounded-2xl">
            <CardHeader className="pb-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      STEP 1
                    </Badge>
                    <CardTitle className="text-xl font-bold tracking-tight">
                      Select Website Project to Audit
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm mt-1.5 leading-relaxed">
                    Pick any active public works project from the national MPLADS database. All parameters load automatically in native ₹ Lakhs format.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-full sm:w-72">
                    <IconSearch className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search ID, title, state, MP..."
                      value={searchProject}
                      onChange={(e) => setSearchProject(e.target.value)}
                      className="h-10 pl-10 text-sm bg-card"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {/* Quick Select Project Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {filteredProjects.slice(0, 15).map((p) => {
                  const isSelected = p.id === selectedProjectId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between min-h-[120px] ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                          : "border-border bg-card hover:bg-muted/40 hover:border-primary/40 hover:shadow-sm"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-[11px] text-muted-foreground">{p.id}</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
                            {p.category}
                          </Badge>
                        </div>
                        <p className="font-bold text-sm text-foreground line-clamp-2 leading-tight">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.district}, {p.state}
                        </p>
                        <p className="text-[11px] text-muted-foreground">MP: {p.mpName}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/50 text-xs">
                        <span className="font-semibold text-foreground">
                          {fmtLakhs(p.sanctionedAmount)}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          Spent {fmtLakhs(p.expenditure)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Audit Workspace (Form on Left + Live ML Results on Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── Left Column (5 cols): Selected Project & Parameter Adjustments ── */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px]">
                        STEP 2
                      </Badge>
                      <CardTitle className="text-sm font-bold">Project Parameters (Website Format)</CardTitle>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {studioForm.id}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Inspect and verify statutory inputs before running the ML model
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-xs">
                  {/* Title & Contractor */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Project Title</Label>
                    <Input
                      value={studioForm.name || ""}
                      onChange={(e) => setStudioForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="h-8 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">State / UT</Label>
                      <Input
                        value={studioForm.state || ""}
                        onChange={(e) => setStudioForm((prev) => ({ ...prev, state: e.target.value }))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">District</Label>
                      <Input
                        value={studioForm.district || ""}
                        onChange={(e) => setStudioForm((prev) => ({ ...prev, district: e.target.value }))}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Contractor</Label>
                      <Input
                        value={studioForm.contractor || ""}
                        onChange={(e) => setStudioForm((prev) => ({ ...prev, contractor: e.target.value }))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Work Order No</Label>
                      <Input
                        value={studioForm.workOrderNo || "WO/2024/AUTO"}
                        onChange={(e) => setStudioForm((prev) => ({ ...prev, workOrderNo: e.target.value }))}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Financial Inputs in Lakhs */}
                  <div className="p-3 rounded-xl bg-muted/40 border space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <IconCurrencyRupee className="size-4 text-emerald-500" />
                        Financial Sanction & Expenditure (₹ Lakhs)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Sanctioned Budget</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            value={studioForm.sanctionedAmount ?? 0}
                            onChange={(e) =>
                              setStudioForm((prev) => ({
                                ...prev,
                                sanctionedAmount: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="h-8 pr-7 text-xs font-semibold"
                          />
                          <span className="absolute right-2 top-2 text-[10px] text-muted-foreground">L</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          = ₹{lakhsToInr(Number(studioForm.sanctionedAmount || 0)).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-muted-foreground">Actual Expenditure</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            value={studioForm.expenditure ?? 0}
                            onChange={(e) =>
                              setStudioForm((prev) => ({
                                ...prev,
                                expenditure: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="h-8 pr-7 text-xs font-semibold"
                          />
                          <span className="absolute right-2 top-2 text-[10px] text-muted-foreground">L</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          = ₹{lakhsToInr(Number(studioForm.expenditure || 0)).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dates & Timeline */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sanction Date</Label>
                      <Input
                        type="date"
                        value={studioForm.sanctionDate || ""}
                        onChange={(e) => setStudioForm((prev) => ({ ...prev, sanctionDate: e.target.value }))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Expected Completion</Label>
                      <Input
                        type="date"
                        value={studioForm.expectedCompletion || ""}
                        onChange={(e) => setStudioForm((prev) => ({ ...prev, expectedCompletion: e.target.value }))}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Physical Verification & Evidence Indicators (Clarified & Aligned with ML Dataset) */}
                  {(() => {
                    const inspCount = Number(studioForm.inspections || 0);
                    const photoCount = Number(studioForm.photos || 0);
                    const gpsMatch = studioForm.photoLocationMatch !== false;
                    const evidencePoints = (inspCount > 0 ? 1 : 0) + (photoCount > 0 ? 1 : 0) + (gpsMatch && photoCount > 0 ? 1 : 0);
                    const liveEvidencePct = Math.round((evidencePoints / 3) * 100);

                    return (
                      <div className="p-3.5 rounded-xl bg-card border border-border shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                          <span className="flex items-center gap-1.5">
                            <IconShieldCheck className="size-4 text-emerald-500" />
                            Physical Evidence & Statutory Verification System
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold px-2 py-0.5 border ${
                              liveEvidencePct === 100
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                : liveEvidencePct >= 66
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                : "bg-red-500/10 text-red-600 border-red-500/30"
                            }`}
                          >
                            Evidence Score: {liveEvidencePct}% ({evidencePoints}/3 Pillars)
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* 1. Physical Inspections Done */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-[11px] font-medium text-foreground">Physical Inspections Done</Label>
                              <span className={`text-[10px] font-semibold ${inspCount > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                {inspCount > 0 ? "✓ Verified" : "⚠ 0 Inspections"}
                              </span>
                            </div>
                            <Input
                              type="number"
                              min="0"
                              value={studioForm.inspections ?? 0}
                              onChange={(e) =>
                                setStudioForm((prev) => ({ ...prev, inspections: Math.max(0, parseInt(e.target.value) || 0) }))
                              }
                              className="h-8 text-xs font-semibold"
                            />
                            <p className="text-[10px] text-muted-foreground">Junior / Exec Engineer site visits</p>
                          </div>

                          {/* 2. Geo-Tagged Photos Uploaded */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-[11px] font-medium text-foreground">Geo-Tagged Photos Uploaded</Label>
                              <span className={`text-[10px] font-semibold ${photoCount > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                {photoCount > 0 ? `${photoCount} Photos` : "⚠ No Photos"}
                              </span>
                            </div>
                            <Input
                              type="number"
                              min="0"
                              value={studioForm.photos ?? 0}
                              onChange={(e) =>
                                setStudioForm((prev) => ({ ...prev, photos: Math.max(0, parseInt(e.target.value) || 0) }))
                              }
                              className="h-8 text-xs font-semibold"
                            />
                            <p className="text-[10px] text-muted-foreground">National MPLADS Portal upload proof</p>
                          </div>
                        </div>

                        {/* 3. GPS Location Match & 4. Spatial Proximity */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/60">
                          {/* GPS Geo-Fence Match Toggle */}
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-medium text-foreground">GPS Location Match (GIS 500m)</Label>
                            <button
                              type="button"
                              onClick={() =>
                                setStudioForm((prev) => ({
                                  ...prev,
                                  photoLocationMatch: !(prev.photoLocationMatch !== false),
                                }))
                              }
                              className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs font-medium transition-all ${
                                studioForm.photoLocationMatch !== false
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                                  : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 ring-1 ring-red-500/20"
                              }`}
                            >
                              <span className="flex items-center gap-1.5 text-[11px]">
                                <IconMapPin className="size-3.5" />
                                {studioForm.photoLocationMatch !== false ? "Verified Within 500m" : "GPS Mismatch (>500m)"}
                              </span>
                              <span className="text-[10px] underline cursor-pointer">
                                {studioForm.photoLocationMatch !== false ? "Simulate Discrepancy" : "Reset Match"}
                              </span>
                            </button>
                            <p className="text-[10px] text-muted-foreground">Mismatch adds +50 penalty points (Ghost Asset)</p>
                          </div>

                          {/* Similar Work Count 500m */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label className="text-[11px] font-medium text-foreground">Nearby Clustered Works (500m)</Label>
                              <span
                                className={`text-[10px] font-semibold ${
                                  (studioForm.similarWorkCount500m || 0) > 0 ? "text-amber-600" : "text-muted-foreground"
                                }`}
                              >
                                {(studioForm.similarWorkCount500m || 0) > 0 ? "Spatial Cluster" : "Isolated"}
                              </span>
                            </div>
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              value={studioForm.similarWorkCount500m ?? 0}
                              onChange={(e) =>
                                setStudioForm((prev) => ({
                                  ...prev,
                                  similarWorkCount500m: Math.max(0, parseInt(e.target.value) || 0),
                                }))
                              }
                              className="h-8 text-xs font-semibold"
                            />
                            <p className="text-[10px] text-muted-foreground">Identifies duplicate or cartelized sanctions</p>
                          </div>
                        </div>

                        {/* 5. Statutory Documentation Status (UC & Asset Register) */}
                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={studioForm.ucSubmitted ?? false}
                              onChange={(e) => setStudioForm((prev) => ({ ...prev, ucSubmitted: e.target.checked }))}
                              className="size-3.5 rounded accent-primary cursor-pointer"
                            />
                            <span className="text-[11px] text-foreground">Utilization Certificate (UC)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={studioForm.assetCreated ?? false}
                              onChange={(e) => setStudioForm((prev) => ({ ...prev, assetCreated: e.target.checked }))}
                              className="size-3.5 rounded accent-primary cursor-pointer"
                            />
                            <span className="text-[11px] text-foreground">Asset Register Entry</span>
                          </label>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Action Button */}
                  <Button
                    onClick={handleStudioAudit}
                    disabled={loading}
                    className="w-full h-10 gap-2 font-bold shadow-md"
                  >
                    {loading ? (
                      <>
                        <IconLoader2 className="size-4 animate-spin" />
                        Running ML Inference Engine...
                      </>
                    ) : (
                      <>
                        <IconPlayerPlay className="size-4" />
                        Run AI Model Audit on This Project
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* ── Results & Visualizations Column ── */}
            <div className="lg:col-span-7 space-y-5">
              {result ? (
                <div className="space-y-5 animate-in fade-in-50 duration-500">
                  {/* ── 1. Hero Risk & Archetype Card ── */}
                  <Card className="border-border shadow-md overflow-hidden bg-card/90 backdrop-blur-xs">
                    <div className="p-4 md:p-6 space-y-6">
                      {/* Top bar with work ID and timestamp */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="size-3 rounded-full bg-emerald-500 animate-ping" />
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold px-2.5 py-0.5">
                            LIVE ML PREDICTION COMPLETED
                          </Badge>
                          <span className="font-mono text-xs font-semibold text-muted-foreground">
                            {result.work_id}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs font-normal">
                          Model v1.0 • Hybrid Fusion
                        </Badge>
                      </div>

                      {/* Main Hero Grid: Large Gauge + Archetype Card + Statutory Mandate */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Left: Large Animated Risk Gauge */}
                        <div className="md:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-muted/20 border border-border/80 shadow-xs">
                          <RiskGauge score={result.composite_risk_score} tier={result.risk_tier} />
                        </div>

                        {/* Right: Archetype & Statutory Mandate */}
                        <div className="md:col-span-7 space-y-4">
                          {/* Archetype Card */}
                          <div className="p-4 rounded-2xl border bg-card/80 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Detected Anomaly Archetype
                              </span>
                              <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5">
                                {(result.archetype_confidence * 100).toFixed(1)}% Confidence
                              </Badge>
                            </div>
                            <div className="flex items-start gap-3 pt-1">
                              <div className="p-2.5 rounded-xl bg-muted/60 border flex items-center justify-center">
                                <ArchetypeIcon archetype={result.predicted_archetype} className="size-7" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-extrabold text-base text-foreground tracking-tight">
                                  {ARCHETYPE_LABELS[result.predicted_archetype]?.label || result.predicted_archetype}
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {ARCHETYPE_LABELS[result.predicted_archetype]?.desc || "Statistical pattern identified by Model 2"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Statutory Governance Mandate */}
                          <div className={`p-4 rounded-2xl border ${tierColor(result.risk_tier).border} ${tierColor(result.risk_tier).bg} space-y-1.5`}>
                            <div className="flex items-center gap-2 text-xs font-extrabold tracking-wide uppercase">
                              <IconShieldCheck className="size-4.5 shrink-0" />
                              <span>Statutory Governance Directive</span>
                            </div>
                            <p className="text-xs text-foreground font-semibold leading-relaxed">
                              {result.governance_action}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Key Risk Drivers & Observations */}
                      <div className="space-y-2.5 pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                            <IconListCheck className="size-4 text-amber-500" />
                            Statutory Risk Drivers & Observations ({result.risk_drivers.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {result.risk_drivers.map((driver, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 text-xs p-3 rounded-xl bg-muted/30 border border-border/80 text-foreground font-medium"
                            >
                              <IconChevronRight className="size-4 text-primary shrink-0 mt-0.5" />
                              <span className="leading-snug">{driver}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* ── 2. Derived Real-World Metrics Grid (5 KPI Cards) ── */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    <div className="p-3.5 rounded-xl border bg-card shadow-xs space-y-1">
                      <span className="text-[11px] text-muted-foreground uppercase font-semibold">Cost Overrun</span>
                      <p className={`text-base font-extrabold ${result.derived_metrics.cost_overrun_ratio > 0.05 ? "text-red-500" : "text-emerald-500"}`}>
                        {result.derived_metrics.cost_overrun_ratio > 0 ? "+" : ""}
                        {(result.derived_metrics.cost_overrun_ratio * 100).toFixed(1)}%
                      </p>
                      <span className="text-[10px] text-muted-foreground">vs Sanction</span>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-card shadow-xs space-y-1">
                      <span className="text-[11px] text-muted-foreground uppercase font-semibold">Statutory Delay</span>
                      <p className={`text-base font-extrabold ${result.derived_metrics.delay_days > 45 ? "text-red-500" : "text-foreground"}`}>
                        {Math.round(result.derived_metrics.delay_days)} Days
                      </p>
                      <span className="text-[10px] text-muted-foreground">beyond deadline</span>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-card shadow-xs space-y-1">
                      <span className="text-[11px] text-muted-foreground uppercase font-semibold">Cost Deviation</span>
                      <p className="text-base font-extrabold text-foreground">
                        {result.derived_metrics.cost_deviation_pct > 0 ? "+" : ""}
                        {result.derived_metrics.cost_deviation_pct.toFixed(1)}%
                      </p>
                      <span className="text-[10px] text-muted-foreground">vs Initial Estimate</span>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-card shadow-xs space-y-1">
                      <span className="text-[11px] text-muted-foreground uppercase font-semibold">Execution Ratio</span>
                      <p className="text-base font-extrabold text-foreground">
                        {(result.derived_metrics.completion_ratio * 100).toFixed(0)}%
                      </p>
                      <span className="text-[10px] text-muted-foreground">Time elapsed ratio</span>
                    </div>

                    <div className="p-3.5 rounded-xl border bg-card shadow-xs space-y-1 col-span-2 sm:col-span-1">
                      <span className="text-[11px] text-muted-foreground uppercase font-semibold">Evidence Score</span>
                      <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        {(result.derived_metrics.evidence_score * 100).toFixed(0)}%
                      </p>
                      <span className="text-[10px] text-muted-foreground">Photos & Site Audit</span>
                    </div>
                  </div>

                  {/* ── 3. Visual Charts (Spacious Radar + Bar Chart) ── */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Radar Chart (Enlarged Height: 320px) */}
                    <Card className="shadow-xs border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <IconChartRadar className="size-4.5 text-primary" />
                            6-Pillar Risk Radar
                          </CardTitle>
                          <Badge variant="outline" className="text-[11px] font-normal">
                            0 - 100 Scale
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          ML probability, Outlier score, Overrun, Geo duplication, Evidence deficit, Statutory delay
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData} outerRadius="75%">
                              <PolarGrid stroke="rgba(128,128,128,0.25)" />
                              <PolarAngleAxis
                                dataKey="component"
                                tick={{ fontSize: 11, fill: "currentColor", fontWeight: 600 }}
                              />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                              <Radar
                                name="Risk Score"
                                dataKey="value"
                                stroke="#f97316"
                                fill="#f97316"
                                fillOpacity={0.45}
                                strokeWidth={2.5}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "var(--background)",
                                  borderColor: "var(--border)",
                                  fontSize: "12px",
                                  borderRadius: "10px",
                                  fontWeight: 600,
                                }}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bar Chart (Enlarged Height: 320px) */}
                    <Card className="shadow-xs border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <IconActivity className="size-4.5 text-primary" />
                            Component Penalties & Weights
                          </CardTitle>
                          <Badge variant="outline" className="text-[11px] font-normal">
                            Hybrid Fusion
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          Ensemble weights contributing to the overall Composite Score
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80 w-full pt-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(128,128,128,0.18)" />
                              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                              <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fontSize: 11, fontWeight: 600 }}
                                width={65}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "var(--background)",
                                  borderColor: "var(--border)",
                                  fontSize: "12px",
                                  borderRadius: "10px",
                                  fontWeight: 600,
                                }}
                                formatter={(val: any, name: any, item: any) => [
                                  `${val} / 100 (Weight: ${item.payload.weight})`,
                                  "Penalty Score",
                                ]}
                              />
                              <Bar dataKey="score" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={22} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                /* Empty state prompting to run audit */
                <Card className="h-full min-h-[460px] flex flex-col items-center justify-center p-12 text-center border-dashed bg-muted/10">
                  <div className="p-5 rounded-3xl bg-primary/10 text-primary mb-4 ring-8 ring-primary/5">
                    <IconBrain className="size-12" />
                  </div>
                  <h3 className="font-extrabold text-lg text-foreground">AI Risk Engine Standing By</h3>
                  <p className="text-xs text-muted-foreground max-w-md mt-1.5 mb-6 leading-relaxed">
                    Select any project on the left or adjust its inspection and budget inputs, then click <strong>&quot;Run AI Model Audit on This Project&quot;</strong> to generate real-time risk scores, anomaly classification, and statutory governance mandates.
                  </p>
                  <Button onClick={handleStudioAudit} disabled={loading} className="gap-2.5 font-bold h-11 px-6 shadow-md">
                    <IconPlayerPlay className="size-4" />
                    Audit {studioForm.id || "Selected Work"}
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 2: DATABASE BATCH AUDIT (Evaluate all website projects)
        ═════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="batch" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IconFileSpreadsheet className="size-5 text-primary" />
                    Batch Risk Audit — Full National Database
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Execute live ML evaluation across all projects currently in the website registry, ranking works by risk score descending (as specified in Section 6.3 of TechStack doc).
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2.5">
                  <Button
                    onClick={handleAuditAllProjects}
                    disabled={batchLoading}
                    className="gap-2 font-bold shadow-sm"
                  >
                    {batchLoading ? (
                      <>
                        <IconLoader2 className="size-4 animate-spin" />
                        Evaluating All Projects...
                      </>
                    ) : (
                      <>
                        <IconPlayerPlay className="size-4" />
                        Audit All Website Projects ({PROJECTS.length})
                      </>
                    )}
                  </Button>
                  {batchResults && (
                    <Button variant="outline" onClick={exportBatchToExcel} className="gap-1.5 text-xs">
                      <IconDownload className="size-3.5" />
                      Export Dossier (.xlsx)
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {batchResults ? (
                <>
                  {/* Summary Metrics & Pie Chart */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border bg-card space-y-1">
                      <span className="text-xs text-muted-foreground">Total Projects Audited</span>
                      <p className="text-2xl font-extrabold">{batchResults.total_audited}</p>
                      <span className="text-[10px] text-muted-foreground">100% evaluated by ML</span>
                    </div>
                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-1">
                      <span className="text-xs text-red-600 font-medium">High & Critical Risks</span>
                      <p className="text-2xl font-extrabold text-red-600">
                        {batchResults.high_or_critical_count}
                      </p>
                      <span className="text-[10px] text-muted-foreground">Requires mandatory district audit</span>
                    </div>
                    <div className="p-4 rounded-xl border bg-card space-y-1">
                      <span className="text-xs text-muted-foreground">Average Risk Score</span>
                      <p className="text-2xl font-extrabold">
                        {(
                          batchResults.results.reduce((acc, r) => acc + r.composite_risk_score, 0) /
                          batchResults.results.length
                        ).toFixed(1)}
                        <span className="text-xs font-normal text-muted-foreground"> / 100</span>
                      </p>
                      <span className="text-[10px] text-muted-foreground">National portfolio index</span>
                    </div>
                    <div className="p-4 rounded-xl border bg-card flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Risk Tier Ratio</span>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="size-2 rounded-full bg-emerald-500" /> Low
                          <span className="size-2 rounded-full bg-amber-500" /> Mod
                          <span className="size-2 rounded-full bg-orange-500" /> High
                          <span className="size-2 rounded-full bg-red-500" /> Crit
                        </div>
                      </div>
                      <div className="size-16">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={batchTierData}
                              dataKey="value"
                              innerRadius={16}
                              outerRadius={28}
                              strokeWidth={1}
                            >
                              {batchTierData.map((_, idx) => (
                                <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Filter Tier Tabs */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">Filter by Tier:</span>
                      {(["ALL", "LOW", "MODERATE", "HIGH", "CRITICAL"] as const).map((tier) => (
                        <Button
                          key={tier}
                          variant={batchFilterTier === tier ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBatchFilterTier(tier)}
                          className="h-7 text-xs px-2.5"
                        >
                          {tier}
                        </Button>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Showing {filteredBatchResults.length} of {batchResults.total_audited} works
                    </span>
                  </div>

                  {/* Batch Results Table */}
                  <div className="rounded-xl border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-28 text-xs">Work ID</TableHead>
                          <TableHead className="text-xs">Project Details</TableHead>
                          <TableHead className="text-xs">Risk Score</TableHead>
                          <TableHead className="text-xs">Tier</TableHead>
                          <TableHead className="text-xs">Archetype</TableHead>
                          <TableHead className="text-xs">Governance Mandate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBatchResults.map((r) => {
                          const matched = PROJECTS.find((p) => p.id === r.work_id);
                          const tc = tierColor(r.risk_tier);
                          return (
                            <TableRow key={r.work_id} className="hover:bg-muted/30">
                              <TableCell className="font-mono text-xs font-semibold">{r.work_id}</TableCell>
                              <TableCell>
                                <div className="space-y-0.5">
                                  <p className="font-medium text-xs text-foreground line-clamp-1">
                                    {matched?.name || "Public Works Project"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {matched?.district}, {matched?.state} • {matched?.category} •{" "}
                                    {fmtLakhs(matched?.sanctionedAmount || 0)}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`text-xs font-extrabold ${tc.text}`}>
                                  {r.composite_risk_score.toFixed(1)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge className={`${tc.bg} ${tc.text} ${tc.border} border text-[10px] px-2 py-0`}>
                                  {r.risk_tier}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-xs font-medium">
                                  <ArchetypeIcon archetype={r.predicted_archetype} className="size-4" />
                                  <span className="capitalize">{ARCHETYPE_LABELS[r.predicted_archetype]?.label || r.predicted_archetype.replace("_", " ")}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                                {r.governance_action}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <IconFileSpreadsheet className="size-8" />
                  </div>
                  <h4 className="font-bold text-base">National Database Batch Audit Ready</h4>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Click the button above to run real-time inference on all {PROJECTS.length} website projects simultaneously.
                    The system will compute risk scores, archetypes, and component weights in milliseconds.
                  </p>
                  <Button onClick={handleAuditAllProjects} disabled={batchLoading} className="font-bold gap-2">
                    <IconPlayerPlay className="size-4" />
                    Run Batch Audit on All Projects
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 3: NEW PROPOSAL AUDIT (Evaluate upcoming works)
        ═════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="proposal" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">New Work Proposal Risk Evaluator</CardTitle>
              <CardDescription className="text-xs">
                Simulate and audit a new public works proposal before sanction approval by the District Magistrate (DM/DC).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Proposal Title</Label>
                  <Input
                    value={customForm.name}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Sector Category</Label>
                  <Select
                    value={customForm.category}
                    onValueChange={(v) => setCustomForm((prev) => ({ ...prev, category: v || "Community" }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORK_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">State</Label>
                  <Input
                    value={customForm.state}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, state: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">District</Label>
                  <Input
                    value={customForm.district}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, district: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Constituency</Label>
                  <Input
                    value={customForm.constituency}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, constituency: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Sanctioned Estimate (₹ Lakhs)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={customForm.sanctionedAmount}
                    onChange={(e) =>
                      setCustomForm((prev) => ({ ...prev, sanctionedAmount: parseFloat(e.target.value) || 0 }))
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Proposed Contractor</Label>
                  <Input
                    value={customForm.contractor}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, contractor: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Sanction Date</Label>
                  <Input
                    type="date"
                    value={customForm.sanctionDate}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, sanctionDate: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Expected Completion Date</Label>
                  <Input
                    type="date"
                    value={customForm.expectedCompletion}
                    onChange={(e) => setCustomForm((prev) => ({ ...prev, expectedCompletion: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Geo Match Checkbox */}
              <div className="p-3 rounded-xl bg-muted/40 border flex items-center justify-between">
                <div>
                  <p className="font-semibold text-xs text-foreground">Simulate GPS & Location Discrepancy</p>
                  <p className="text-[11px] text-muted-foreground">
                    Test how the Isolation Forest and Ghost Asset detector respond to GIS mismatches
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={customForm.hasGeoMismatch}
                  onChange={(e) => setCustomForm((prev) => ({ ...prev, hasGeoMismatch: e.target.checked }))}
                  className="size-4 rounded accent-primary cursor-pointer"
                />
              </div>

              <Button onClick={handleCustomAudit} disabled={loading} className="w-full h-10 font-bold gap-2 mt-2">
                {loading ? <IconLoader2 className="size-4 animate-spin" /> : <IconPlayerPlay className="size-4" />}
                Evaluate Proposal Risk in Studio
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 4: MODEL INTELLIGENCE & CAG RESEARCH
        ═════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="intel" className="space-y-6 mt-6">
          {/* Architecture Overview Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <IconSparkles className="size-5 text-primary" />
                MPLADS-SATHI AI Governance Model Architecture
              </CardTitle>
              <CardDescription className="text-xs">
                Specifications formulated in accordance with MoSPI guidelines and CAG Public Works audit compliance standards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Model 1: Binary Classifier</span>
                    <Badge variant="outline" className="text-[10px]">XGBoost</Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Detects general risk anomaly. Trained on 17 features with scale_pos_weight. ROC-AUC: 0.9998.
                  </p>
                </div>
                <div className="p-3 rounded-xl border bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Model 2: Multiclass Archetype</span>
                    <Badge variant="outline" className="text-[10px]">Softprob</Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Stratifies anomalies into 6 institutional corruption archetypes (Vendor cartel, ghost assets, delays).
                  </p>
                </div>
                <div className="p-3 rounded-xl border bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">Model 3: Outlier Isolation</span>
                    <Badge variant="outline" className="text-[10px]">Isolation Forest</Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    Unsupervised anomaly detection partitioning feature space to catch zero-day and unseen fraud patterns.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model Visualization Gallery (16 Plots) */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <IconPhoto className="size-5 text-primary" />
                    Model Training & Evaluation Plots Gallery (16 Figures)
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Click on any figure to inspect high-resolution analytical metrics.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MODEL_PLOTS.map((p) => (
                  <div
                    key={p.file}
                    onClick={() => setSelectedPlot(`/model-plots/${p.file}`)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border bg-muted/20 hover:border-primary/50 transition-all p-2 flex flex-col justify-between"
                  >
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-black/5 relative">
                      <img
                        src={`/model-plots/${p.file}`}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <IconZoomIn className="size-5" />
                      </div>
                    </div>
                    <div className="mt-2 space-y-0.5">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">{p.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── High-Res Plot Modal ────────────────────────────────────────────── */}
      <Dialog open={!!selectedPlot} onOpenChange={(open) => !open && setSelectedPlot(null)}>
        <DialogContent className="max-w-4xl p-2 bg-card">
          {selectedPlot && (
            <div className="p-2 space-y-2">
              <img
                src={selectedPlot}
                alt="Model Evaluation Figure"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-mono text-muted-foreground">{selectedPlot}</span>
                <Button size="sm" variant="outline" onClick={() => setSelectedPlot(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
