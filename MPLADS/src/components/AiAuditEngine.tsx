"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import AiNlpAuditSection from "@/components/AiNlpAuditSection";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  IconZoomOut,
  IconZoomReset,
  IconMaximize,
  IconMinimize,
  IconExternalLink,
  IconChevronLeft,
  IconFolderOpen,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { Project, User } from "../types";
import { PROJECTS, STATES_DATA } from "../data/mpladsData";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/context/AuthContext";
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

interface AiAuditEngineProps {
  initialProjectId?: string | null;
  user?: User;
}

export default function AiAuditEngine({ initialProjectId, user: propUser }: AiAuditEngineProps = {}) {
  const searchParams = useSearchParams();
  const queryProjectId = searchParams ? searchParams.get("projectId") : null;
  const activeTargetId = initialProjectId || queryProjectId;

  // Extra projects fetched directly (e.g. deep-linked from Dashboard)
  const [extraProjects, setExtraProjects] = useState<Project[]>([]);

  const { user: authUser } = useAuth();

  // Resolve effective user synchronously with storage fallback
  const effectiveUser = useMemo<User | null>(() => {
    if (propUser) return propUser;
    if (authUser) return authUser;
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("mplads_user");
        if (raw) return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    return null;
  }, [propUser, authUser]);

  // Live Database Projects Roster from MongoDB scoped strictly to effectiveUser
  const { projects: dbProjects } = useProjects({
    user: effectiveUser,
    role: effectiveUser?.role,
    userRole: effectiveUser?.role,
    district: effectiveUser?.role === "District" ? effectiveUser?.district : undefined,
    userDistrict: effectiveUser?.district,
    state: effectiveUser?.role === "State" ? effectiveUser?.state : (effectiveUser?.role === "District" ? effectiveUser?.state : undefined),
    userState: effectiveUser?.state,
    constituency: effectiveUser?.role === "MP" ? effectiveUser?.constituency : undefined,
    userConstituency: effectiveUser?.constituency,
    limit: 10000,
  });

  const projectsList = useMemo(() => {
    const map = new Map<string, Project>();
    extraProjects.forEach((p) => map.set(p.id, p));
    if (dbProjects && dbProjects.length > 0) {
      dbProjects.forEach((p) => {
        if (!map.has(p.id)) map.set(p.id, p);
      });
    } else {
      let pool = PROJECTS;
      if (effectiveUser?.role === "District" && effectiveUser.district) {
        pool = pool.filter((p) => p.district.toLowerCase() === effectiveUser.district!.toLowerCase());
      } else if (effectiveUser?.role === "State" && effectiveUser.state) {
        pool = pool.filter((p) => p.state.toLowerCase() === effectiveUser.state!.toLowerCase());
      }
      pool.forEach((p) => {
        if (!map.has(p.id)) map.set(p.id, p);
      });
    }
    const all = Array.from(map.values());
    if (effectiveUser?.role === "District" && effectiveUser.district) {
      return all.filter((p) => p.district?.toLowerCase() === effectiveUser.district!.toLowerCase());
    }
    if (effectiveUser?.role === "State" && effectiveUser.state) {
      return all.filter((p) => p.state?.toLowerCase() === effectiveUser.state!.toLowerCase());
    }
    if (effectiveUser?.role === "MP") {
      return all.filter(
        (p) =>
          (effectiveUser.constituency && p.constituency?.toLowerCase() === effectiveUser.constituency.toLowerCase()) ||
          (effectiveUser.district && p.district?.toLowerCase() === effectiveUser.district.toLowerCase())
      );
    }
    return all;
  }, [dbProjects, extraProjects, effectiveUser]);

  // Navigation & Mode States
  const [activeTab, setActiveTab] = useState("studio");
  const [searchProject, setSearchProject] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const defaultState =
    effectiveUser?.role === "District" || effectiveUser?.role === "State"
      ? effectiveUser.state || "All"
      : "All";
  const defaultDistrict =
    effectiveUser?.role === "District"
      ? effectiveUser.district || "All"
      : "All";

  const [stateFilter, setStateFilter] = useState(defaultState);
  const [districtFilter, setDistrictFilter] = useState(defaultDistrict);
  const [statusFilter, setStatusFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(80);

  // Synchronize state and district filters when effectiveUser loads or changes
  useEffect(() => {
    if (effectiveUser?.role === "District" && effectiveUser.district) {
      setDistrictFilter(effectiveUser.district);
      if (effectiveUser.state) setStateFilter(effectiveUser.state);
    } else if (effectiveUser?.role === "State" && effectiveUser.state) {
      setStateFilter(effectiveUser.state);
    }
  }, [effectiveUser]);

  // Dynamic States and Districts derived from scoped projects list
  const availableStates = useMemo(() => {
    if (effectiveUser?.role === "District" || effectiveUser?.role === "State") {
      if (effectiveUser?.state) return [effectiveUser.state];
    }
    const set = new Set<string>();
    projectsList.forEach((p) => {
      if (p.state) set.add(p.state);
    });
    return Array.from(set).sort();
  }, [projectsList, effectiveUser]);

  const availableDistricts = useMemo(() => {
    if (effectiveUser?.role === "District" && effectiveUser.district) {
      return [effectiveUser.district];
    }
    const set = new Set<string>();
    projectsList.forEach((p) => {
      if (stateFilter === "All" || p.state?.toLowerCase() === stateFilter.toLowerCase()) {
        if (p.district) set.add(p.district);
      }
    });
    return Array.from(set).sort();
  }, [projectsList, stateFilter, effectiveUser]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    projectsList.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [projectsList]);
  
  // Selected Website Project for Studio Mode
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    if (activeTargetId) return activeTargetId;
    return "";
  });

  // Keep selectedProjectId synchronized to first valid scoped project
  useEffect(() => {
    if (projectsList.length > 0 && (!selectedProjectId || !projectsList.some((p) => p.id === selectedProjectId))) {
      setSelectedProjectId(projectsList[0].id);
    }
  }, [projectsList, selectedProjectId]);

  const selectedProject = useMemo(() => {
    return (
      projectsList.find((p) => p.id === selectedProjectId) ||
      projectsList[0] ||
      PROJECTS.find((p) => {
        if (effectiveUser?.role === "District" && effectiveUser.district) {
          return p.district.toLowerCase() === effectiveUser.district.toLowerCase();
        }
        if (effectiveUser?.role === "State" && effectiveUser.state) {
          return p.state.toLowerCase() === effectiveUser.state.toLowerCase();
        }
        return true;
      }) ||
      PROJECTS[0]
    );
  }, [projectsList, selectedProjectId, effectiveUser]);

  // Editable Form for Studio Project (allowing officer to adjust real-time inspection inputs)
  const [studioForm, setStudioForm] = useState<Partial<Project>>({ ...selectedProject });

  // Update studio form whenever a new project is picked
  useEffect(() => {
    if (selectedProject) {
      // Don't overwrite form with fallback project if actively loading deep-linked target
      if (activeTargetId && selectedProject.id !== activeTargetId && auditedTargetRef.current !== activeTargetId) {
        return;
      }
      setStudioForm({ ...selectedProject });
      setResult(null);
    }
  }, [selectedProject, activeTargetId]);

  // Results State
  const [result, setResult] = useState<WorkAuditResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Batch Database Audit State
  const [batchResults, setBatchResults] = useState<BatchAuditResponse | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchFilterTier, setBatchFilterTier] = useState<string>("ALL");

  // Custom Proposal Form State scoped to user jurisdiction
  const [customForm, setCustomForm] = useState(() => ({
    name: "Construction of Multi-Purpose Community Infrastructure",
    category: "Community & Civic Amenities",
    state: effectiveUser?.state || "Uttar Pradesh",
    district: effectiveUser?.district || "Lucknow",
    constituency: effectiveUser?.constituency || effectiveUser?.district || "Lucknow",
    sanctionedAmount: 75.0,
    expenditure: 72.5,
    sanctionDate: "2024-02-10",
    expectedCompletion: "2024-11-30",
    completionDate: "2024-11-15",
    contractor: "M/s Local Infrastructure Developers",
    photos: 18,
    inspections: 4,
    geoLat: effectiveUser?.district?.toLowerCase() === "lucknow" ? 26.8467 : 20.501,
    geoLng: effectiveUser?.district?.toLowerCase() === "lucknow" ? 80.9462 : 86.422,
    hasGeoMismatch: false,
  }));

  useEffect(() => {
    if (effectiveUser) {
      setCustomForm((prev) => ({
        ...prev,
        state: effectiveUser.state || prev.state,
        district: effectiveUser.district || prev.district,
        constituency: effectiveUser.constituency || effectiveUser.district || prev.constituency,
      }));
    }
  }, [effectiveUser]);

  // Metadata & Health State
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);
  const [plotZoom, setPlotZoom] = useState<number>(1);
  const [isPlotFullscreen, setIsPlotFullscreen] = useState<boolean>(false);
  const [showIntelModal, setShowIntelModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePlotIndex = useMemo(() => {
    if (!selectedPlot) return -1;
    const fileName = selectedPlot.replace(/^\/model-plots\//, "");
    return MODEL_PLOTS.findIndex((p) => p.file === fileName);
  }, [selectedPlot]);

  const activePlot = activePlotIndex >= 0 ? MODEL_PLOTS[activePlotIndex] : null;

  const handlePrevPlot = useCallback(() => {
    if (activePlotIndex >= 0) {
      const prev = MODEL_PLOTS[(activePlotIndex - 1 + MODEL_PLOTS.length) % MODEL_PLOTS.length];
      setSelectedPlot(`/model-plots/${prev.file}`);
      setPlotZoom(1);
    }
  }, [activePlotIndex]);

  const handleNextPlot = useCallback(() => {
    if (activePlotIndex >= 0) {
      const next = MODEL_PLOTS[(activePlotIndex + 1) % MODEL_PLOTS.length];
      setSelectedPlot(`/model-plots/${next.file}`);
      setPlotZoom(1);
    }
  }, [activePlotIndex]);

  // Keyboard navigation & zoom shortcuts when inspecting figures
  useEffect(() => {
    if (!selectedPlot) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevPlot();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextPlot();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setPlotZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)));
      } else if (e.key === "-") {
        e.preventDefault();
        setPlotZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)));
      } else if (e.key === "0") {
        e.preventDefault();
        setPlotZoom(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPlot, handlePrevPlot, handleNextPlot]);

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

  // Run Live Audit on Studio Project (reusable)
  const executeAudit = useCallback(async (projectData?: Partial<Project>) => {
    const data = projectData || studioForm;
    setLoading(true);
    setError(null);
    try {
      const auditPayload: Partial<Project> = {
        ...data,
        sanctionedAmount: Number(data.sanctionedAmount || 0),
        expenditure: Number(data.expenditure || 0),
        inspections: Number(data.inspections || 0),
        photos: Number(data.photos || 0),
        photoLocationMatch: data.photoLocationMatch !== false,
        similarWorkCount500m: Number(data.similarWorkCount500m || 0),
        ucSubmitted: data.ucSubmitted ?? false,
        assetCreated: data.assetCreated ?? false,
        sanctionDate: data.sanctionDate || "2024-01-15",
        expectedCompletion: data.expectedCompletion || "2024-06-30",
      };
      const res = await auditWebsiteProject(auditPayload);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Inference failed. Is the ML backend online?");
    } finally {
      setLoading(false);
    }
  }, [studioForm]);

  const handleStudioAudit = () => {
    executeAudit(studioForm);
  };

  // Auto-audit whenever activeTargetId changes (e.g. from Dashboard Detailed Status)
  const auditedTargetRef = useRef<string | null>(null);
  useEffect(() => {
    if (activeTargetId && auditedTargetRef.current !== activeTargetId) {
      const found = projectsList.find(
        (p) =>
          p.id.toLowerCase() === activeTargetId.toLowerCase() ||
          p.id.toLowerCase().includes(activeTargetId.toLowerCase()) ||
          p.workOrderNo?.toLowerCase() === activeTargetId.toLowerCase()
      );
      if (found) {
        auditedTargetRef.current = activeTargetId;
        setSelectedProjectId(found.id);
        setStudioForm({ ...found });
        setActiveTab("studio");
        executeAudit(found);
      } else {
        // Fetch single project directly by ID from API route
        fetch(`/api/projects/${encodeURIComponent(activeTargetId)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((json) => {
            if (json?.success && json?.data) {
              auditedTargetRef.current = activeTargetId;
              setExtraProjects((prev) => [json.data, ...prev.filter((x) => x.id !== json.data.id)]);
              setSelectedProjectId(json.data.id);
              setStudioForm({ ...json.data });
              setActiveTab("studio");
              executeAudit(json.data);
            }
          })
          .catch((err) => console.warn("Failed to fetch target project for audit:", err));
      }
    }
  }, [activeTargetId, projectsList, executeAudit]);

  // Strictly isolate projects pool for Batch Audit according to role & area
  const scopedBatchProjects = useMemo(() => {
    return projectsList.filter((p) => {
      if (effectiveUser?.role === "District" && effectiveUser.district) {
        return p.district?.toLowerCase() === effectiveUser.district.toLowerCase();
      }
      if (effectiveUser?.role === "State" && effectiveUser.state) {
        return p.state?.toLowerCase() === effectiveUser.state.toLowerCase();
      }
      if (effectiveUser?.role === "MP") {
        const matchesConst = effectiveUser.constituency && p.constituency?.toLowerCase() === effectiveUser.constituency.toLowerCase();
        const matchesDist = effectiveUser.district && p.district?.toLowerCase() === effectiveUser.district.toLowerCase();
        return Boolean(matchesConst || matchesDist);
      }
      return true;
    });
  }, [projectsList, effectiveUser]);

  // Reset batch audit results whenever effective user or jurisdiction switches
  useEffect(() => {
    setBatchResults(null);
  }, [effectiveUser?.role, effectiveUser?.district, effectiveUser?.state, effectiveUser?.constituency]);

  // Run Batch Audit across Scoped Jurisdiction Projects
  const handleAuditAllProjects = async () => {
    setBatchLoading(true);
    setError(null);
    try {
      const targetBatch = scopedBatchProjects.slice(0, 100);
      if (targetBatch.length === 0) {
        setError("No projects found in your assigned jurisdiction to audit.");
        return;
      }
      const res = await auditWebsiteProjectsBatch(targetBatch);
      // Guarantee no out-of-district works in batchResults
      const scopedResults = res.results.filter((r) => {
        return scopedBatchProjects.some((p) => p.id === r.work_id);
      });
      setBatchResults({
        total_audited: scopedResults.length,
        high_or_critical_count: scopedResults.filter((r) => r.risk_tier === "HIGH" || r.risk_tier === "CRITICAL").length,
        results: scopedResults,
      });
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
    const q = searchProject.trim().toLowerCase();
    return projectsList.filter((p) => {
      // Guaranteed Role & Area isolation
      if (effectiveUser?.role === "District" && effectiveUser.district) {
        if (p.district?.toLowerCase() !== effectiveUser.district.toLowerCase()) return false;
      } else if (effectiveUser?.role === "State" && effectiveUser.state) {
        if (p.state?.toLowerCase() !== effectiveUser.state.toLowerCase()) return false;
      } else if (effectiveUser?.role === "MP") {
        const matchesConst = effectiveUser.constituency && p.constituency?.toLowerCase() === effectiveUser.constituency.toLowerCase();
        const matchesDist = effectiveUser.district && p.district?.toLowerCase() === effectiveUser.district.toLowerCase();
        if (!matchesConst && !matchesDist) return false;
      }

      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        (p.contractor && p.contractor.toLowerCase().includes(q)) ||
        (p.mpName && p.mpName.toLowerCase().includes(q));

      const matchesState = stateFilter === "All" || p.state?.toLowerCase() === stateFilter.toLowerCase();
      const matchesDistrict = districtFilter === "All" || p.district?.toLowerCase() === districtFilter.toLowerCase();
      const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "risk"
          ? (p.riskScore && p.riskScore > 50) || p.riskLevel === "High" || p.riskLevel === "Critical"
          : p.status === statusFilter);

      return matchesSearch && matchesState && matchesDistrict && matchesCat && matchesStatus;
    });
  }, [projectsList, searchProject, stateFilter, districtFilter, categoryFilter, statusFilter, effectiveUser]);

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

  // Derived Batch Data strictly scoped to current user jurisdiction
  const scopedBatchResults = useMemo(() => {
    if (!batchResults) return [];
    return batchResults.results.filter((r) => {
      return scopedBatchProjects.some((p) => p.id === r.work_id);
    });
  }, [batchResults, scopedBatchProjects]);

  const batchTierData = useMemo(() => {
    return ["LOW", "MODERATE", "HIGH", "CRITICAL"].map((tier) => ({
      name: tier,
      value: scopedBatchResults.filter((r) => r.risk_tier === tier).length,
    }));
  }, [scopedBatchResults]);

  const filteredBatchResults = useMemo(() => {
    if (batchFilterTier === "ALL") return scopedBatchResults;
    return scopedBatchResults.filter((r) => r.risk_tier === batchFilterTier);
  }, [scopedBatchResults, batchFilterTier]);

  const PIE_COLORS = ["#10b981", "#f59e0b", "#f97316", "#ef4444"];

  // Export Batch to Excel strictly for scoped projects
  const exportBatchToExcel = () => {
    if (!scopedBatchResults || scopedBatchResults.length === 0) return;
    const rows = scopedBatchResults.map((r) => {
      const matched = scopedBatchProjects.find((p) => p.id === r.work_id);
      return {
        "Work ID": r.work_id,
        "Project Name": matched?.name || "N/A",
        "State": matched?.state || effectiveUser?.state || "N/A",
        "District": matched?.district || effectiveUser?.district || "N/A",
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
    XLSX.writeFile(wb, `NIDHI_RAKSHAK_${effectiveUser?.district || "Jurisdiction"}_Audit_Dossier.xlsx`);
  };

  return (
    <div className="space-y-6 pb-16 px-1">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b pb-6">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5">
            <IconBrain className="size-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">NIDHI-RAKSHAK AI Audit Engine</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Official NIDHI-RAKSHAK ML Governance Engine
            </p>
          </div>
        </div>

        {/* Backend Connectivity Status & Highlighted Intel Action */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Highlighted Model Intel & CAG Specs Button */}
          <Button
            onClick={() => setShowIntelModal(true)}
            className="relative group bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs px-3.5 py-1.5 h-auto rounded-full shadow-md hover:shadow-indigo-500/25 border border-indigo-400/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <IconSparkles className="size-3.5 text-amber-300 animate-pulse" />
            <span>Model Intel & CAG Specs</span>
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px] px-1.5 py-0 font-mono">
              16 Figures
            </Badge>
          </Button>

          <button
            onClick={refreshHealth}
            title="Click to re-check backend connection"
            className="flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-full border border-border bg-card hover:bg-muted transition-colors shadow-xs cursor-pointer"
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

      {/* ── Highlighted Model Intel & CAG Specs Top Banner ─────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-500/30 shadow-xs backdrop-blur-xs">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 text-[11px] font-bold px-2.5 py-0.5 flex items-center gap-1.5 shadow-xs">
            <IconSparkles className="size-3.5 text-amber-300" />
            MoSPI & CAG Spec Compliant
          </Badge>
          <span className="text-muted-foreground/60 hidden sm:inline">•</span>
          <span className="font-semibold text-foreground">
            Tri-Model Ensemble Architecture:
          </span>
          <span className="text-muted-foreground">
            XGBoost Binary Classifier (99.98% ROC-AUC) • Softprob Corruption Archetypes • Isolation Forest Zero-Day Outlier
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowIntelModal(true)}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-500/10 flex items-center gap-1.5 shrink-0 self-end sm:self-auto cursor-pointer p-1 h-auto"
        >
          <span>View Architecture & 16 Training Plots</span>
          <IconChevronRight className="size-3.5" />
        </Button>
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

      {/* ── Main Feature Tabs (3 Clean Operational Tabs) ──────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full overflow-x-auto no-scrollbar pb-1">
          <TabsList className="inline-flex min-w-full w-max md:w-full md:grid md:grid-cols-3 h-auto min-h-[48px] p-1.5 bg-muted/60 dark:bg-muted/30 border border-border/80 rounded-2xl gap-1.5">
            <TabsTrigger
              value="studio"
              className="flex-1 min-w-[200px] md:min-w-0 flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/50 transition-all cursor-pointer"
            >
              <IconActivity className="size-4 shrink-0 text-primary" />
              <span>Project Audit Studio</span>
            </TabsTrigger>
            <TabsTrigger
              value="batch"
              className="flex-1 min-w-[200px] md:min-w-0 flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/50 transition-all cursor-pointer"
            >
              <IconFileSpreadsheet className="size-4 shrink-0 text-primary" />
              <span>Database Batch Audit</span>
            </TabsTrigger>
            <TabsTrigger
              value="proposal"
              className="flex-1 min-w-[200px] md:min-w-0 flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-border/50 transition-all cursor-pointer"
            >
              <IconSend className="size-4 shrink-0 text-primary" />
              <span>New Proposal Audit</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 1: PROJECT AUDIT STUDIO (Easy Interactive Flow)
        ═════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="studio" className="space-y-6 mt-5 w-full">
          {/* Step 1: Select Website Project Banner */}
          <Card className="w-full border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 shadow-sm rounded-2xl">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      STEP 1
                    </Badge>
                    <CardTitle className="text-xl font-bold tracking-tight">
                      Select Website Project to Audit
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs font-normal">
                      {filteredProjects.length} Projects Available
                    </Badge>
                    {effectiveUser?.role === "District" && effectiveUser.district && (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold dark:text-emerald-400">
                        <IconMapPin className="size-3 mr-1 inline" />
                        District Jurisdiction: {effectiveUser.district}, {effectiveUser.state}
                      </Badge>
                    )}
                    {effectiveUser?.role === "State" && effectiveUser.state && (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold dark:text-blue-400">
                        <IconMapPin className="size-3 mr-1 inline" />
                        State Jurisdiction: {effectiveUser.state}
                      </Badge>
                    )}
                    {effectiveUser?.role === "MP" && (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold dark:text-purple-400">
                        <IconMapPin className="size-3 mr-1 inline" />
                        Constituency: {effectiveUser.constituency || effectiveUser.district}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  Pick any active public works project from the national NIDHI-RAKSHAK database. All parameters load automatically in native ₹ Lakhs format.
                </CardDescription>

                {/* Filter Controls Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
                  <div className="relative">
                    <IconSearch className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search title, ID, MP..."
                      value={searchProject}
                      onChange={(e) => setSearchProject(e.target.value)}
                      className="h-9 pl-9 text-xs bg-card"
                    />
                  </div>

                  <Select
                    value={stateFilter}
                    disabled={effectiveUser?.role === "District" || effectiveUser?.role === "State"}
                    onValueChange={(val) => { setStateFilter(val || "All"); setDistrictFilter("All"); }}
                  >
                    <SelectTrigger className="h-9 text-xs bg-card disabled:opacity-85 disabled:cursor-not-allowed">
                      <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {effectiveUser?.role !== "District" && effectiveUser?.role !== "State" && (
                        <SelectItem value="All" className="text-xs">All States</SelectItem>
                      )}
                      {availableStates.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={districtFilter}
                    disabled={effectiveUser?.role === "District"}
                    onValueChange={(val) => setDistrictFilter(val || "All")}
                  >
                    <SelectTrigger className="h-9 text-xs bg-card disabled:opacity-85 disabled:cursor-not-allowed">
                      <SelectValue placeholder="All Districts" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {effectiveUser?.role !== "District" && (
                        <SelectItem value="All" className="text-xs">All Districts</SelectItem>
                      )}
                      {availableDistricts.map((d) => (
                        <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "All")}>
                    <SelectTrigger className="h-9 text-xs bg-card">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All" className="text-xs">All Status</SelectItem>
                      <SelectItem value="Ongoing" className="text-xs">Ongoing</SelectItem>
                      <SelectItem value="Completed" className="text-xs">Completed</SelectItem>
                      <SelectItem value="Delayed" className="text-xs">Delayed</SelectItem>
                      <SelectItem value="risk" className="text-xs">High Risk</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "All")}>
                    <SelectTrigger className="h-9 text-xs bg-card">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="All" className="text-xs">All Categories</SelectItem>
                      {availableCategories.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              {/* Quick Select Project Cards - Minimized to Project Name and Cost info */}
              {filteredProjects.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-xs space-y-1">
                  <p className="font-medium">No projects found matching the current filters.</p>
                  <p>Try resetting filters or searching with a different keyword.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-80 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    {filteredProjects.slice(0, visibleCount).map((p) => {
                      const isSelected = p.id === selectedProjectId;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProjectId(p.id)}
                          className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[76px] ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40"
                              : "border-border/70 bg-card hover:bg-muted/40 hover:border-primary/40 hover:shadow-xs"
                          }`}
                        >
                          <p className="font-semibold text-xs text-foreground line-clamp-2 leading-snug">
                            {p.name}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/40 text-[11px]">
                            <span className="font-semibold text-foreground">
                              {fmtLakhs(p.sanctionedAmount)}
                            </span>
                            <span className="text-muted-foreground text-[10.5px]">
                              Spent {fmtLakhs(p.expenditure)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {filteredProjects.length > visibleCount && (
                    <div className="flex justify-center mt-3 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVisibleCount((prev) => prev + 80)}
                        className="text-xs h-8 gap-1 font-medium"
                      >
                        Load More ({filteredProjects.length - visibleCount} remaining)
                      </Button>
                    </div>
                  )}
                </>
              )}
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
                            <p className="text-[10px] text-muted-foreground">National NIDHI-RAKSHAK Portal upload proof</p>
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

                  {/* ── DeepBot AI NLP Audit Synthesis (Plain English Interpretation) ── */}
                  <AiNlpAuditSection project={selectedProject} result={result} />

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
                  <CardTitle className="text-lg flex flex-wrap items-center gap-2">
                    <IconFileSpreadsheet className="size-5 text-primary" />
                    {effectiveUser?.role === "District" && effectiveUser.district
                      ? `Batch Risk Audit — District Jurisdiction: ${effectiveUser.district}, ${effectiveUser.state || "Uttar Pradesh"}`
                      : effectiveUser?.role === "State" && effectiveUser.state
                      ? `Batch Risk Audit — State Jurisdiction: ${effectiveUser.state}`
                      : effectiveUser?.role === "MP"
                      ? `Batch Risk Audit — Constituency (${effectiveUser.constituency || effectiveUser.district})`
                      : "Batch Risk Audit — Full National Database"}
                    {effectiveUser?.role && (
                      <Badge variant="outline" className="text-xs font-semibold bg-primary/10 text-primary border-primary/30">
                        {effectiveUser.role === "District" ? `District • ${effectiveUser.district}` : effectiveUser.role}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {effectiveUser?.role === "District" && effectiveUser.district
                      ? `Execute live ML evaluation across all ${scopedBatchProjects.length} projects in your district registry (${effectiveUser.district}, ${effectiveUser.state || "Uttar Pradesh"}), ranking works by risk score descending.`
                      : effectiveUser?.role === "State" && effectiveUser.state
                      ? `Execute live ML evaluation across all ${scopedBatchProjects.length} projects in your state registry (${effectiveUser.state}), ranking works by risk score descending.`
                      : effectiveUser?.role === "MP"
                      ? `Execute live ML evaluation across all ${scopedBatchProjects.length} projects in your constituency, ranking works by risk score descending.`
                      : "Execute live ML evaluation across all projects currently in the website registry, ranking works by risk score descending (as specified in Section 6.3 of TechStack doc)."}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    onClick={handleAuditAllProjects}
                    disabled={batchLoading || scopedBatchProjects.length === 0}
                    className="gap-2 font-bold shadow-sm w-full sm:w-auto"
                  >
                    {batchLoading ? (
                      <>
                        <IconLoader2 className="size-4 animate-spin" />
                        Evaluating {scopedBatchProjects.length} Projects...
                      </>
                    ) : (
                      <>
                        <IconPlayerPlay className="size-4" />
                        {effectiveUser?.role === "District" && effectiveUser.district
                          ? `Audit All District Projects (${scopedBatchProjects.length})`
                          : effectiveUser?.role === "State" && effectiveUser.state
                          ? `Audit All State Projects (${scopedBatchProjects.length})`
                          : effectiveUser?.role === "MP"
                          ? `Audit Constituency Projects (${scopedBatchProjects.length})`
                          : `Audit All Website Projects (${scopedBatchProjects.length})`}
                      </>
                    )}
                  </Button>
                  {scopedBatchResults.length > 0 && (
                    <Button variant="outline" onClick={exportBatchToExcel} className="gap-1.5 text-xs w-full sm:w-auto">
                      <IconDownload className="size-3.5" />
                      Export Dossier (.xlsx)
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {scopedBatchResults.length > 0 ? (
                <>
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm space-y-1">
                      <span className="text-xs text-muted-foreground">Total Projects Audited</span>
                      <p className="text-2xl font-extrabold text-foreground">
                        {scopedBatchResults.length}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 space-y-1">
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Low Risk</span>
                      <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                        {scopedBatchResults.filter((r) => r.risk_tier === "LOW").length}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border bg-amber-500/10 border-amber-500/30 space-y-1">
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Moderate Risk</span>
                      <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                        {scopedBatchResults.filter((r) => r.risk_tier === "MODERATE").length}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl border bg-red-500/10 border-red-500/30 space-y-1">
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium">Critical Risk</span>
                      <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">
                        {scopedBatchResults.filter((r) => r.risk_tier === "CRITICAL").length}
                      </p>
                    </div>
                  </div>

                  {/* Distribution Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border bg-card/50">
                      <CardHeader className="pb-1 pt-3 px-4">
                        <CardTitle className="text-xs font-semibold">Tier Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="h-44 p-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={batchTierData}
                              cx="50%"
                              cy="50%"
                              innerRadius={38}
                              outerRadius={65}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {batchTierData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                            <Legend wrapperStyle={{ fontSize: "10px" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="border bg-card/50">
                      <CardHeader className="pb-1 pt-3 px-4">
                        <CardTitle className="text-xs font-semibold">Risk Distribution Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="h-44 p-4 flex flex-col justify-center space-y-2.5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">High/Critical Risk Ratio</span>
                            <span className="font-bold text-red-500">
                              {(
                                (scopedBatchResults.filter((r) => r.risk_tier === "HIGH" || r.risk_tier === "CRITICAL").length /
                                  Math.max(1, scopedBatchResults.length)) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-red-500 h-full rounded-full transition-all"
                              style={{
                                width: `${(
                                  (scopedBatchResults.filter((r) => r.risk_tier === "HIGH" || r.risk_tier === "CRITICAL").length /
                                    Math.max(1, scopedBatchResults.length)) *
                                  100
                                ).toFixed(0)}%`,
                              }}
                            />
                          </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                          Batch inference finished for {scopedBatchResults.length}{" "}
                          {effectiveUser?.role === "District" && effectiveUser.district
                            ? `${effectiveUser.district} district`
                            : effectiveUser?.role === "State" && effectiveUser.state
                            ? `${effectiveUser.state} state`
                            : "jurisdiction"}{" "}
                          projects. Evaluated against calibrated ML isolation and XGBoost decision surfaces.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Filterable Table */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-bold flex items-center gap-1.5">
                        <IconFilter className="size-3.5 text-primary" />
                        Individual Risk Ledger ({filteredBatchResults.length} works)
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Filter Tier:</span>
                        <Select value={batchFilterTier} onValueChange={(val) => val && setBatchFilterTier(val)}>
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">All Tiers</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MODERATE">Moderate</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="CRITICAL">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border rounded-xl overflow-x-auto shadow-sm">
                      <Table className="min-w-[700px]">
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
                            const matched = scopedBatchProjects.find((p) => p.id === r.work_id);
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
                                      {matched?.district || effectiveUser?.district || "N/A"}, {matched?.state || effectiveUser?.state || "N/A"} • {matched?.category || "Infrastructure"} •{" "}
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
                  </div>
                </>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <IconFileSpreadsheet className="size-8" />
                  </div>
                  <h4 className="font-bold text-base">
                    {effectiveUser?.role === "District" && effectiveUser.district
                      ? `${effectiveUser.district} District Batch Audit Ready`
                      : effectiveUser?.role === "State" && effectiveUser.state
                      ? `${effectiveUser.state} State Batch Audit Ready`
                      : "Jurisdiction Database Batch Audit Ready"}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-md">
                    Click the button below to run real-time ML inference on all {scopedBatchProjects.length}{" "}
                    {effectiveUser?.role === "District" && effectiveUser.district
                      ? `${effectiveUser.district} district`
                      : effectiveUser?.role === "State" && effectiveUser.state
                      ? `${effectiveUser.state} state`
                      : "jurisdiction"}{" "}
                    projects simultaneously. The system will compute risk scores, archetypes, and component weights in milliseconds.
                  </p>
                  <Button onClick={handleAuditAllProjects} disabled={batchLoading || scopedBatchProjects.length === 0} className="font-bold gap-2">
                    {batchLoading ? (
                      <>
                        <IconLoader2 className="size-4 animate-spin" />
                        Evaluating {scopedBatchProjects.length} Projects...
                      </>
                    ) : (
                      <>
                        <IconPlayerPlay className="size-4" />
                        {scopedBatchProjects.length > 0
                          ? `Run Batch Audit on ${scopedBatchProjects.length} Projects`
                          : "No Projects in Jurisdiction"}
                      </>
                    )}
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

      </Tabs>

      {/* ── Model Intel & CAG Specs Right-Side Drawer (Slides in from Right) ── */}
      <Sheet open={showIntelModal} onOpenChange={setShowIntelModal}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 flex flex-col overflow-hidden bg-card border-l border-border shadow-2xl"
        >
          <SheetHeader className="p-6 pb-4 border-b shrink-0 bg-card/95 backdrop-blur-md pr-12">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shrink-0 mt-0.5">
                <IconSparkles className="size-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <SheetTitle className="text-lg font-bold tracking-tight">
                    Model Intelligence & CAG Specifications
                  </SheetTitle>
                  <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold border-0">
                    MoSPI & CAG Spec
                  </Badge>
                </div>
                <SheetDescription className="text-xs text-muted-foreground leading-relaxed">
                  Specifications formulated in accordance with MoSPI guidelines and CAG Public Works audit compliance standards.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Architecture Overview */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <IconActivity className="size-3.5 text-primary" />
                <span>Tri-Model Ensemble Architecture</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-foreground">Model 1: Binary Classifier</span>
                    <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30 font-mono">XGBoost</Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Detects general risk anomaly. Trained on 17 features with scale_pos_weight. ROC-AUC: 0.9998.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-foreground">Model 2: Multiclass Archetype</span>
                    <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/30 font-mono">Softprob</Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Stratifies anomalies into 6 institutional corruption archetypes (Vendor cartel, ghost assets, delays).
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-foreground">Model 3: Outlier Isolation</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-mono">Isolation Forest</Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Unsupervised anomaly detection partitioning feature space to catch zero-day and unseen fraud patterns.
                  </p>
                </div>
              </div>
            </div>

            {/* Model Visualization Gallery (16 Plots) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <IconPhoto className="size-4 text-primary" />
                  <span>Model Training & Evaluation Plots Gallery (16 Figures)</span>
                </h4>
                <span className="text-[11px] text-muted-foreground">Click figure to inspect in full zoom</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {MODEL_PLOTS.map((p) => (
                  <div
                    key={p.file}
                    onClick={() => {
                      setSelectedPlot(`/model-plots/${p.file}`);
                      setPlotZoom(1);
                      setIsPlotFullscreen(false);
                    }}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border bg-muted/20 hover:border-primary/50 transition-all p-2 flex flex-col justify-between hover:shadow-md"
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
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── High-Res Plot Modal ────────────────────────────────────────────── */}
      <Dialog
        open={!!selectedPlot}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPlot(null);
            setPlotZoom(1);
            setIsPlotFullscreen(false);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className={cn(
            "flex flex-col p-0 gap-0 overflow-hidden shadow-2xl border bg-card transition-all duration-200",
            isPlotFullscreen
              ? "fixed inset-0 top-0 left-0 translate-x-0 translate-y-0 w-screen h-screen sm:max-w-none max-w-none rounded-none m-0 border-0 z-50"
              : "w-[96vw] sm:w-[94vw] max-w-6xl sm:max-w-6xl h-[90vh] max-h-[92vh] rounded-2xl"
          )}
        >
          <DialogTitle className="sr-only">
            {activePlot?.title || "Model Evaluation Plot Inspector"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Interactive high-resolution inspection of {activePlot?.title || "model evaluation plot"}
          </DialogDescription>

          {selectedPlot && (
            <>
              {/* Header Bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-card shrink-0 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 text-primary shrink-0">
                    <IconPhoto className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                        {activePlot?.title || "Model Evaluation Figure"}
                      </h3>
                      {activePlotIndex >= 0 && (
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] bg-primary/5 text-primary border-primary/20 shrink-0"
                        >
                          Figure {activePlotIndex + 1} of {MODEL_PLOTS.length}
                        </Badge>
                      )}
                    </div>
                    {activePlot?.desc && (
                      <p className="text-xs text-muted-foreground truncate hidden sm:block">
                        {activePlot.desc}
                      </p>
                    )}
                  </div>
                </div>

                {/* Header Toolbar */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Previous / Next buttons */}
                  <div className="flex items-center bg-muted/40 rounded-lg p-0.5 border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={handlePrevPlot}
                      title="Previous Figure (←)"
                    >
                      <IconChevronLeft className="size-4" />
                    </Button>
                    <span className="text-[11px] font-mono px-2 text-muted-foreground select-none">
                      {activePlotIndex + 1}/{MODEL_PLOTS.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={handleNextPlot}
                      title="Next Figure (→)"
                    >
                      <IconChevronRight className="size-4" />
                    </Button>
                  </div>

                  {/* Zoom Controls */}
                  <div className="hidden sm:flex items-center bg-muted/40 rounded-lg p-0.5 border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setPlotZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
                      title="Zoom Out (-)"
                      disabled={plotZoom <= 0.75}
                    >
                      <IconZoomOut className="size-4" />
                    </Button>
                    <button
                      onClick={() => setPlotZoom((z) => (z === 1 ? 1.5 : z === 1.5 ? 2 : 1))}
                      className="px-2 py-0.5 text-xs font-mono font-semibold hover:bg-muted rounded transition-colors text-foreground select-none"
                      title="Click to cycle zoom (100% / 150% / 200%)"
                    >
                      {Math.round(plotZoom * 100)}%
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setPlotZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
                      title="Zoom In (+)"
                      disabled={plotZoom >= 2.5}
                    >
                      <IconZoomIn className="size-4" />
                    </Button>
                    {plotZoom !== 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-primary hover:text-primary"
                        onClick={() => setPlotZoom(1)}
                        title="Reset Zoom (0)"
                      >
                        <IconZoomReset className="size-4" />
                      </Button>
                    )}
                  </div>

                  {/* Fullscreen Toggle */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => setIsPlotFullscreen((f) => !f)}
                    title={isPlotFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                  >
                    {isPlotFullscreen ? <IconMinimize className="size-4" /> : <IconMaximize className="size-4" />}
                  </Button>

                  {/* Open Raw in New Tab */}
                  <a
                    href={selectedPlot}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Open Full Image in New Tab"
                  >
                    <IconExternalLink className="size-4" />
                  </a>

                  {/* Download Image */}
                  <a
                    href={selectedPlot}
                    download={activePlot?.file || "model-plot.png"}
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Download Figure PNG"
                  >
                    <IconDownload className="size-4" />
                  </a>

                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setSelectedPlot(null);
                      setPlotZoom(1);
                      setIsPlotFullscreen(false);
                    }}
                    title="Close (Esc)"
                  >
                    <IconX className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Main Image Display Area */}
              <div className="relative flex-1 min-h-0 bg-slate-950/95 dark:bg-black overflow-auto flex items-center justify-center p-4 sm:p-6 select-none">
                {/* Floating Left Arrow */}
                <button
                  onClick={handlePrevPlot}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-2xl hover:scale-105 active:scale-95 group"
                  title="Previous Figure (←)"
                >
                  <IconChevronLeft className="size-6 transition-transform group-hover:-translate-x-0.5" />
                </button>

                {/* Floating Right Arrow */}
                <button
                  onClick={handleNextPlot}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-11 rounded-full bg-black/60 hover:bg-black/90 text-white/90 hover:text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-2xl hover:scale-105 active:scale-95 group"
                  title="Next Figure (→)"
                >
                  <IconChevronRight className="size-6 transition-transform group-hover:translate-x-0.5" />
                </button>

                {/* Image Canvas */}
                <div
                  className="transition-transform duration-150 ease-out flex items-center justify-center w-full h-full"
                  style={{
                    transform: `scale(${plotZoom})`,
                    transformOrigin: "center center",
                  }}
                >
                  <img
                    src={selectedPlot}
                    alt={activePlot?.title || "Model Evaluation Figure"}
                    className={cn(
                      "w-auto max-w-full object-contain rounded-lg shadow-2xl bg-white transition-all",
                      isPlotFullscreen ? "max-h-[84vh]" : "max-h-[70vh] sm:max-h-[74vh]"
                    )}
                    style={{
                      imageRendering: "-webkit-optimize-contrast",
                    }}
                    draggable={false}
                  />
                </div>
              </div>

              {/* Footer Info & Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-2.5 border-t bg-muted/20 shrink-0 gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono truncate w-full sm:w-auto">
                  <span className="truncate">{selectedPlot}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-muted-foreground hidden lg:inline">
                    Use <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px] font-mono">←</kbd> / <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px] font-mono">→</kbd> to cycle • <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px] font-mono">+</kbd> / <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px] font-mono">-</kbd> to zoom • <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px] font-mono">Esc</kbd> to close
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={handlePrevPlot}
                    >
                      <IconChevronLeft className="size-3.5" />
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={handleNextPlot}
                    >
                      Next
                      <IconChevronRight className="size-3.5" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 text-xs ml-1"
                      onClick={() => {
                        setSelectedPlot(null);
                        setPlotZoom(1);
                        setIsPlotFullscreen(false);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
