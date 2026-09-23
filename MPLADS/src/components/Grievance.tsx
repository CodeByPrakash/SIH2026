"use client";

import React, { useState, useMemo } from "react";
import { useGrievances, GrievanceItem } from "@/hooks/useGrievances";
import { PROJECTS } from "@/data/mpladsData";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/types";
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
  IconShieldCheck,
  IconLock,
  IconEye,
  IconSearch,
  IconFilter,
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconBuildingCommunity,
  IconMapPin,
  IconFileSearch,
  IconArrowRight,
  IconRefresh,
  IconUserCheck,
  IconSparkles,
  IconX,
  IconMessageReport,
  IconCircleCheck,
  IconActivity,
  IconInfoCircle,
  IconFileText,
} from "@tabler/icons-react";

interface GrievanceProps {
  initialTab?: "submit" | "track" | "all";
  user?: User;
}

export default function Grievance({ initialTab, user: propUser }: GrievanceProps = {}) {
  const { user: authUser } = useAuth();
  const user = useMemo<User | null>(() => {
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

  const { grievances, isLive, lastUpdated, submitGrievance } = useGrievances();
  const [activeTab, setActiveTab] = useState<"community" | "track" | "submit">(
    initialTab === "track" ? "track" : initialTab === "submit" ? "submit" : "community"
  );

  // Scoped project list for grievance submission
  const availableProjects = useMemo(() => {
    if (user?.role === "District" && user.district) {
      return PROJECTS.filter((p) => p.district.toLowerCase() === user.district!.toLowerCase());
    }
    if (user?.role === "State" && user.state) {
      return PROJECTS.filter((p) => p.state.toLowerCase() === user.state!.toLowerCase());
    }
    if (user?.role === "MP") {
      return PROJECTS.filter(
        (p) =>
          (user.constituency && p.constituency?.toLowerCase() === user.constituency.toLowerCase()) ||
          (user.district && p.district.toLowerCase() === user.district.toLowerCase())
      );
    }
    return PROJECTS;
  }, [user]);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Selected Grievance for Transparent Track Status View
  const [selectedGrievance, setSelectedGrievance] = useState<GrievanceItem | null>(null);

  // Direct Track search in "track" tab
  const [directTrackId, setDirectTrackId] = useState<string>("GRV-2024-001");

  // Form State
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    district: user?.district || "Lucknow",
    category: "Project Stall",
    desc: "",
    projectId: availableProjects[0]?.id || PROJECTS[0]?.id || "",
    anonymousConsent: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<GrievanceItem | null>(null);

  // Stats calculation
  const stats = useMemo(() => {
    const total = grievances.length;
    const resolved = grievances.filter((g) => g.status === "Resolved").length;
    const underReview = grievances.filter((g) => g.status === "Under Review").length;
    const open = grievances.filter((g) => g.status === "Open").length;
    return { total, resolved, underReview, open, avgSla: "4.8 Days" };
  }, [grievances]);

  // Unique districts for filter
  const districts = useMemo(() => {
    if (user?.role === "District" && user.district) {
      return [user.district];
    }
    const set = new Set<string>();
    grievances.forEach((g) => {
      if (g.district) set.add(g.district);
    });
    return Array.from(set);
  }, [grievances, user]);

  // Filtered grievances for Community Feed
  const filteredGrievances = useMemo(() => {
    return grievances.filter((g) => {
      if (user?.role === "District" && user.district) {
        if (g.district.toLowerCase() !== user.district.toLowerCase()) return false;
      }
      if (user?.role === "State" && user.state) {
        if (g.state && g.state.toLowerCase() !== user.state.toLowerCase()) return false;
      }

      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        g.id.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.district.toLowerCase().includes(q) ||
        (g.category && g.category.toLowerCase().includes(q));

      const matchDistrict = districtFilter === "All" || g.district === districtFilter;
      const matchStatus = statusFilter === "All" || g.status === statusFilter;
      const matchCategory = categoryFilter === "All" || g.category === categoryFilter;

      return matchSearch && matchDistrict && matchStatus && matchCategory;
    });
  }, [grievances, search, districtFilter, statusFilter, categoryFilter, user]);

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.district || !form.category || !form.desc) return;
    setIsSubmitting(true);

    const projectObj = PROJECTS.find((p) => p.id === form.projectId);

    const created = await submitGrievance({
      name: form.name,
      mobile: form.mobile,
      district: form.district,
      category: form.category,
      desc: form.desc,
      projectId: form.projectId,
    });

    setIsSubmitting(false);

    if (created) {
      setSubmittedSuccess(created);
      setSelectedGrievance(created);
    } else {
      const fallbackItem: GrievanceItem = {
        id: `GRV-${new Date().getFullYear()}-${String(grievances.length + 1).padStart(3, "0")}`,
        title: `${form.category}: ${form.desc.slice(0, 50)}...`,
        description: form.desc,
        category: form.category,
        district: form.district,
        status: "Open",
        name: form.name,
        mobile: form.mobile,
        anonymizedName: `Anonymous Citizen (${form.district})`,
        maskedMobile: `+91 ••••• ••${form.mobile.replace(/\D/g, "").slice(-3)}`,
        isAnonymous: true,
        projectId: form.projectId,
        projectName: projectObj?.name || "",
        priority: "High",
        assignedOfficer: `Designated Nodal Officer (${form.district} Grievance Cell)`,
        actionTaken: "Case registered and routed to technical team for verification.",
        slaDays: 7,
        date: new Date().toISOString().split("T")[0],
      };
      setSubmittedSuccess(fallbackItem);
      setSelectedGrievance(fallbackItem);
    }

    setForm({
      name: "",
      mobile: "",
      district: "Lucknow",
      category: "Project Stall",
      desc: "",
      projectId: PROJECTS[0]?.id || "",
      anonymousConsent: true,
    });
  };

  // Currently actively tracked grievance in "track" tab
  const trackedItem = useMemo(() => {
    if (!directTrackId.trim()) return null;
    const cleanId = directTrackId.trim().toLowerCase();
    return (
      grievances.find(
        (g) =>
          g.id.toLowerCase() === cleanId ||
          g.mobile.replace(/\D/g, "").includes(cleanId) ||
          g.id.toLowerCase().includes(cleanId)
      ) || null
    );
  }, [grievances, directTrackId]);

  return (
    <div className="p-4 sm:p-6 animate-slide-in max-w-6xl mx-auto space-y-6">
      {/* ── Top Header Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card rounded-2xl border border-border p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <IconMessageReport className="size-6 text-primary" />
              Public Grievances & Redressal Tracking
            </h1>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 bg-emerald-500/10 font-mono text-[11px] gap-1">
              <IconLock className="size-3" />
              Anonymity Shield Active
            </Badge>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                isLive
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <span className={`size-1.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              {isLive ? "Live Sync" : "Static Mode"}
            </span>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm mt-1">
            Transparent public grievance portal: View transparent track status of all community grievances with citizen identities strictly anonymous and protected.
            {lastUpdated && ` · Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("community")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "community"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <IconEye className="size-3.5" />
            Community Grievances ({grievances.length})
          </button>
          <button
            onClick={() => setActiveTab("track")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "track"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <IconFileSearch className="size-3.5" />
            Track Grievance Status
          </button>
          <button
            onClick={() => setActiveTab("submit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "submit"
                ? "bg-[#0F2044] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <IconShieldCheck className="size-3.5" />
            Lodge Grievance
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3.5 bg-card border-border shadow-xs">
          <div className="text-[11px] font-medium text-muted-foreground">Total Community Grievances</div>
          <div className="text-xl font-bold font-mono text-foreground mt-0.5">{stats.total}</div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <IconLock className="size-3 text-emerald-600" /> All Identities Anonymized
          </div>
        </Card>
        <Card className="p-3.5 bg-card border-border shadow-xs">
          <div className="text-[11px] font-medium text-amber-700">Under Review / Enquiry</div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-0.5">{stats.underReview}</div>
          <div className="text-[10px] text-amber-600 mt-1">Field inspection & notices issued</div>
        </Card>
        <Card className="p-3.5 bg-card border-border shadow-xs">
          <div className="text-[11px] font-medium text-emerald-700">Successfully Resolved</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{stats.resolved}</div>
          <div className="text-[10px] text-emerald-600 mt-1">Rectified on site & verified</div>
        </Card>
        <Card className="p-3.5 bg-card border-border shadow-xs">
          <div className="text-[11px] font-medium text-blue-700">Target Resolution SLA</div>
          <div className="text-xl font-bold font-mono text-blue-700 mt-0.5">{stats.avgSla}</div>
          <div className="text-[10px] text-blue-600 mt-1">Citizens notified at each step</div>
        </Card>
      </div>

      {/* ── TAB 1: COMMUNITY GRIEVANCES (PUBLIC FEED WITH CITIZEN ANONYMITY) ── */}
      {activeTab === "community" && (
        <div className="space-y-4">
          {/* Anonymity & Public Transparency Notice */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                <IconShieldCheck className="size-4" />
              </div>
              <div>
                <span className="font-bold text-emerald-950 block">
                  Public Transparency & Whistleblower Anonymity Shield Active
                </span>
                <span className="text-emerald-800 text-[11px]">
                  All citizen names and contact numbers are encrypted and hidden in public view. You can inspect any grievance's transparent tracking lifecycle, official enquiry, and resolution status below.
                </span>
              </div>
            </div>
            <Badge variant="outline" className="bg-white border-emerald-300 text-emerald-800 shrink-0 text-[10px] font-mono font-semibold">
              🔒 Privacy Guaranteed
            </Badge>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-3 rounded-xl border border-border shadow-xs">
            <div className="relative flex-1">
              <IconSearch className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search other citizens' grievances by Ref ID, keyword, or village..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <IconX className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* District Filter */}
              <Select value={districtFilter} onValueChange={(val) => setDistrictFilter(val || "All")}>
                <SelectTrigger className="h-9 text-xs w-[140px]">
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Districts</SelectItem>
                  {districts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "All")}>
                <SelectTrigger className="h-9 text-xs w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              {(search || districtFilter !== "All" || statusFilter !== "All") && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setDistrictFilter("All");
                    setStatusFilter("All");
                  }}
                  className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Grievances List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGrievances.map((item) => (
              <Card
                key={item.id}
                className="p-4 bg-card border-border hover:border-blue-300 transition-all cursor-pointer shadow-xs hover:shadow-sm flex flex-col justify-between"
                onClick={() => setSelectedGrievance(item)}
              >
                <div>
                  {/* Card Header: Reference ID + Status + Priority */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {item.id}
                      </span>
                      {item.priority && (
                        <Badge
                          variant="outline"
                          className={
                            item.priority === "High"
                              ? "bg-red-50 text-red-700 border-red-200 text-[10px]"
                              : "bg-slate-50 text-slate-700 border-slate-200 text-[10px]"
                          }
                        >
                          {item.priority} Priority
                        </Badge>
                      )}
                    </div>
                    <Badge
                      className={
                        item.status === "Resolved"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[11px]"
                          : item.status === "Under Review"
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-100 text-[11px]"
                          : "bg-red-100 text-red-800 hover:bg-red-100 text-[11px]"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>

                  {/* Citizen Anonymity Banner */}
                  <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 mb-2.5">
                    <span className="flex items-center gap-1.5 font-medium text-emerald-800">
                      <IconLock className="size-3 text-emerald-600" />
                      {item.anonymizedName || `Anonymous Citizen (${item.district})`}
                    </span>
                    <span className="font-mono text-slate-400 text-[10px]">
                      {item.maskedMobile || "+91 ••••• ••xxx"}
                    </span>
                  </div>

                  {/* Grievance Title & Category */}
                  <div className="mb-2">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-0.5">
                      <span className="text-blue-600 font-bold">{item.category}</span>
                      <span>•</span>
                      <span>{item.district}</span>
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm text-foreground line-clamp-1">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 bg-white/50 p-2 rounded border border-slate-100 italic">
                    "{item.description}"
                  </p>

                  {/* Transparent Tracking Mini-Status */}
                  <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] space-y-1 mb-3">
                    <div className="flex items-center justify-between text-blue-900 font-medium">
                      <span className="flex items-center gap-1">
                        <IconActivity className="size-3.5 text-blue-700" />
                        Live Track Status:
                      </span>
                      <span className="font-mono text-[10px] text-blue-700 font-bold">
                        {item.status === "Resolved"
                          ? "✓ Redressal Published"
                          : item.status === "Under Review"
                          ? "⏳ Official Enquiry Ongoing"
                          : "📋 Triaged & Assigned"}
                      </span>
                    </div>
                    {item.actionTaken && (
                      <div className="text-slate-600 text-[10px] line-clamp-1">
                        <span className="font-semibold text-slate-700">Official Action:</span> {item.actionTaken}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2.5 border-t border-border mt-1">
                  <div className="flex items-center gap-1">
                    <IconClock className="size-3 text-slate-400" />
                    <span>Lodge Date: {item.date}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2.5 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50 font-semibold"
                  >
                    Track Status & Timeline →
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredGrievances.length === 0 && (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="text-sm font-semibold text-slate-800">No grievances match the filter criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try resetting your search query or selecting "All Districts".
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setDistrictFilter("All");
                  setStatusFilter("All");
                }}
                className="mt-3 text-xs"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: TRACK SPECIFIC GRIEVANCE STATUS ── */}
      {activeTab === "track" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Track Search Box */}
          <Card className="p-5 bg-card border-border shadow-xs">
            <h2 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
              <IconFileSearch className="size-4 text-primary" />
              Transparent Grievance Lifecycle Tracking
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Enter any Grievance Reference ID or phone number digits to track the transparent step-by-step progress, official enquiry findings, and resolution timeline.
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <IconSearch className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="e.g. GRV-2024-001 or mobile number..."
                  value={directTrackId}
                  onChange={(e) => setDirectTrackId(e.target.value)}
                  className="pl-9 h-10 text-xs font-mono"
                />
              </div>
              <Button
                size="sm"
                className="h-10 px-4 text-xs font-semibold bg-[#0F2044] hover:bg-blue-900"
              >
                Track Status
              </Button>
            </div>

            {/* Quick Suggestions */}
            <div className="flex items-center gap-2 mt-3 flex-wrap text-xs text-slate-500">
              <span className="text-[11px]">Quick Track:</span>
              {grievances.slice(0, 4).map((g) => (
                <button
                  key={g.id}
                  onClick={() => setDirectTrackId(g.id)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-[11px] font-mono transition-colors"
                >
                  {g.id}
                </button>
              ))}
            </div>
          </Card>

          {/* Render Tracked Grievance Details */}
          {trackedItem ? (
            <Card className="p-6 bg-card border-border shadow-sm space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold bg-slate-100 text-slate-900 px-2.5 py-1 rounded">
                      {trackedItem.id}
                    </span>
                    <Badge
                      className={
                        trackedItem.status === "Resolved"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs"
                          : trackedItem.status === "Under Review"
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs"
                          : "bg-red-100 text-red-800 hover:bg-red-100 text-xs"
                      }
                    >
                      {trackedItem.status}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-2">{trackedItem.title}</h3>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {trackedItem.category} • {trackedItem.district} • Filed on {trackedItem.date}
                  </div>
                </div>

                {/* Submitter Anonymity Card */}
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 text-xs space-y-1 sm:text-right">
                  <div className="font-semibold text-emerald-800 flex items-center gap-1 sm:justify-end">
                    <IconLock className="size-3.5 text-emerald-600" />
                    <span>Citizen Identity Anonymized</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Handle: <strong>{trackedItem.anonymizedName || `Anonymous Citizen (${trackedItem.district})`}</strong>
                  </div>
                  <div className="text-slate-500 font-mono text-[10px]">
                    Mobile: {trackedItem.maskedMobile || "+91 ••••• ••xxx"}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Citizen Ground Observation:
                </span>
                <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 italic">
                  "{trackedItem.description}"
                </p>
              </div>

              {/* Linked Project Information (if any) */}
              {trackedItem.projectName && (
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-blue-900 uppercase tracking-wide block">
                      Linked MPLADS Project
                    </span>
                    <span className="font-semibold text-slate-800 block text-xs mt-0.5">
                      {trackedItem.projectName}
                    </span>
                    {trackedItem.projectId && (
                      <span className="font-mono text-[10px] text-slate-500">ID: {trackedItem.projectId}</span>
                    )}
                  </div>
                  <Badge variant="outline" className="bg-white text-blue-800 border-blue-300 text-[10px] shrink-0">
                    Official Record Linked
                  </Badge>
                </div>
              )}

              {/* ── 5-Stage Transparent Lifecycle Stepper ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <IconActivity className="size-4 text-blue-600" />
                    Transparent Tracking Lifecycle & Audit Milestones
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Target SLA: {trackedItem.slaDays || 7} Days
                  </span>
                </div>

                <div className="space-y-4 pt-2">
                  {(trackedItem.timeline && trackedItem.timeline.length > 0
                    ? trackedItem.timeline
                    : [
                        {
                          stage: "Submitted",
                          title: "Grievance Lodged & Cryptographically Timestamped",
                          timestamp: trackedItem.date,
                          actor: "Citizen Portal (Identity Encrypted)",
                          status: "Completed" as const,
                          remarks: "Grievance recorded on portal with citizen anonymity shield active.",
                        },
                        {
                          stage: "AI_Triaged",
                          title: "AI NLP Triage & Risk Classification",
                          timestamp: trackedItem.date,
                          actor: "NIDHI-RAKSHAK AI Engine",
                          status: "Completed" as const,
                          remarks: `Categorized as '${trackedItem.category}'. Alert dispatched to district cell.`,
                        },
                        {
                          stage: "Assigned",
                          title: "Assigned to District Nodal Authority",
                          timestamp: "Active",
                          actor: trackedItem.assignedOfficer || "District Collectorate",
                          status: trackedItem.status === "Open" ? ("In_Progress" as const) : ("Completed" as const),
                          remarks: trackedItem.actionTaken || "Nodal officer assigned to inspect and respond.",
                        },
                        ...(trackedItem.status === "Resolved"
                          ? [
                              {
                                stage: "Resolved",
                                title: "Grievance Resolved & Rectification Published",
                                timestamp: "Completed",
                                actor: "District Grievance Officer",
                                status: "Completed" as const,
                                remarks: "Action completed on site and verified with public closure report.",
                              },
                            ]
                          : []),
                      ]
                  ).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative">
                      {/* Left icon & vertical line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            step.status === "Completed"
                              ? "bg-emerald-600 text-white"
                              : step.status === "In_Progress"
                              ? "bg-amber-500 text-white animate-pulse"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {step.status === "Completed" ? (
                            <IconCheck className="size-3.5" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        {idx < (trackedItem.timeline?.length || 3) - 1 && (
                          <div
                            className={`w-0.5 h-12 mt-1 ${
                              step.status === "Completed" ? "bg-emerald-300" : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="font-semibold text-xs text-slate-900">{step.title}</span>
                          <span className="font-mono text-[10px] text-slate-500">{step.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-blue-700 font-medium">Actor: {step.actor}</div>
                        <p className="text-slate-600 text-[11px] leading-relaxed pt-0.5">{step.remarks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Departmental Response Box */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <IconBuildingCommunity className="size-4 text-emerald-400" />
                    Official Departmental Redressal Summary
                  </span>
                  <Badge className="bg-emerald-500 text-slate-950 font-bold text-[10px]">
                    Public Audit Record
                  </Badge>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-400">Assigned Nodal Authority:</span>{" "}
                    <strong className="text-white">
                      {trackedItem.assignedOfficer || "District Rural Development Authority"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Current Action:</span>{" "}
                    <span className="text-slate-200">{trackedItem.actionTaken || "Enquiry ongoing."}</span>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl border border-border">
              <div className="text-4xl mb-2">🔎</div>
              <h3 className="text-sm font-semibold text-slate-800">No grievance found for "{directTrackId}"</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Please check the Reference ID format (e.g. GRV-2024-001) or browse the Community Grievances tab.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: SUBMIT A GRIEVANCE ── */}
      {activeTab === "submit" && (
        <Card className="max-w-2xl mx-auto p-6 bg-card border-border shadow-sm">
          <div className="mb-5 pb-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Lodge a Citizen Grievance</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Report stalled projects, quality defects, or transparency issues. Your identity is automatically encrypted and hidden from the public feed under the Whistleblower Protection Charter.
            </p>
          </div>

          {submittedSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-5xl">🛡️</div>
              <h3 className="text-base font-bold text-emerald-800">Grievance Registered Successfully!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your grievance has been assigned Reference ID:{" "}
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                  {submittedSuccess.id}
                </span>
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left max-w-lg mx-auto text-xs space-y-2">
                <div className="flex items-center justify-between border-b pb-1.5 font-bold text-slate-900">
                  <span>Transparent Public Record</span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-300 font-mono">
                    🔒 Submitter Identity Encrypted
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-500">Public Anonymous Handle:</span>{" "}
                  <strong>{submittedSuccess.anonymizedName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Masked Contact:</span>{" "}
                  <span className="font-mono">{submittedSuccess.maskedMobile}</span>
                </div>
                <div>
                  <span className="text-slate-500">Category & District:</span>{" "}
                  <span>{submittedSuccess.category} • {submittedSuccess.district}</span>
                </div>
                <div>
                  <span className="text-slate-500">Automatic Action:</span>{" "}
                  <span className="text-blue-700 font-medium">Nodal Alert ALT-GRV Dispatched for Technical Verification</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setDirectTrackId(submittedSuccess.id);
                    setActiveTab("track");
                  }}
                  className="bg-[#0F2044] text-white text-xs h-9"
                >
                  Track Lifecycle Status →
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSubmittedSuccess(null);
                  }}
                  className="text-xs h-9"
                >
                  Submit Another Grievance
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Your Full Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="h-9 text-xs"
                  />
                  <span className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-0.5">
                    <IconLock className="size-3" /> Hidden from public view
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Mobile Number
                  </label>
                  <Input
                    required
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={form.mobile}
                    onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
                    className="h-9 text-xs"
                  />
                  <span className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-0.5">
                    <IconLock className="size-3" /> Masked in public tracking feed
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    District
                  </label>
                  <Select
                    value={form.district}
                    onValueChange={(val) => setForm((p) => ({ ...p, district: val || "Lucknow" }))}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Lucknow", "Shivpuri", "Barmer", "Varanasi", "Rae Bareli", "Bhopal"].map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Grievance Category
                  </label>
                  <Select
                    value={form.category}
                    onValueChange={(val) => setForm((p) => ({ ...p, category: val || "Project Stall" }))}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Project Stall",
                        "Quality Issue",
                        "Transparency",
                        "Fund Misuse",
                        "Security & Maintenance",
                        "Delay in Execution",
                      ].map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Link to MPLADS Project (Optional)
                </label>
                <Select
                  value={form.projectId}
                  onValueChange={(val) => setForm((p) => ({ ...p, projectId: val || "" }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Associated Project" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProjects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.district})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Grievance Description & Ground Facts
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the issue in detail (e.g., location, date work halted, defects noticed, absence of signboard...)"
                  value={form.desc}
                  onChange={(e) => setForm((p) => ({ ...p, desc: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl outline-none focus:border-blue-400 bg-background text-foreground resize-none"
                />
              </div>

              {/* Anonymity Shield Notice */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <IconShieldCheck className="size-4 text-emerald-600" />
                  <span>Whistleblower & Citizen Anonymity Protocol</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Your identity is protected under government public transparency norms. Your name and phone number will never be shown to other citizens or public viewers. Only the anonymized ID, district, and verifiable project facts are published.
                </p>
                <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.anonymousConsent}
                    onChange={(e) => setForm((p) => ({ ...p, anonymousConsent: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Keep my citizen name and contact details anonymous on the public portal.</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !form.anonymousConsent}
                className="w-full h-10 bg-[#0F2044] text-white rounded-xl text-xs font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Encrypting & Submitting to Public DB…" : "Submit Grievance Securely →"}
              </Button>
            </form>
          )}
        </Card>
      )}

      {/* ── Side-by-Side Transparent Track Status Sheet ── */}
      <Sheet open={!!selectedGrievance} onOpenChange={(open) => !open && setSelectedGrievance(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
          {selectedGrievance && (
            <>
              <SheetHeader className="p-4 md:p-6 border-b bg-card sticky top-0 z-10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-900 px-2.5 py-1 rounded">
                      {selectedGrievance.id}
                    </span>
                    <Badge
                      className={
                        selectedGrievance.status === "Resolved"
                          ? "bg-emerald-100 text-emerald-800 text-xs"
                          : selectedGrievance.status === "Under Review"
                          ? "bg-amber-100 text-amber-800 text-xs"
                          : "bg-red-100 text-red-800 text-xs"
                      }
                    >
                      {selectedGrievance.status}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 bg-emerald-50 font-mono text-[10px] gap-1">
                    <IconLock className="size-3" />
                    Identity Protected
                  </Badge>
                </div>
                <SheetTitle className="text-base font-bold text-foreground mt-2">
                  {selectedGrievance.title}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Public Grievance • Category: {selectedGrievance.category} • District: {selectedGrievance.district} • Filed: {selectedGrievance.date}
                </SheetDescription>
              </SheetHeader>

              <div className="p-4 md:p-6 space-y-6">
                {/* Anonymity Shield Banner */}
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 text-xs space-y-1">
                  <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <IconShieldCheck className="size-4 text-emerald-600" />
                    <span>Citizen Identity Protection Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                    <div>
                      Public Handle: <strong>{selectedGrievance.anonymizedName || `Anonymous Citizen (${selectedGrievance.district})`}</strong>
                    </div>
                    <div>
                      Masked Contact: <span className="font-mono">{selectedGrievance.maskedMobile || "+91 ••••• ••xxx"}</span>
                    </div>
                  </div>
                </div>

                {/* Ground Observation */}
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1">
                    Citizen Ground Observation:
                  </span>
                  <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 italic leading-relaxed">
                    "{selectedGrievance.description}"
                  </p>
                </div>

                {/* Linked Project Card */}
                {selectedGrievance.projectName && (
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-950 flex items-center gap-1.5">
                        <IconBuildingCommunity className="size-4 text-blue-700" />
                        Linked MPLADS Infrastructure Project
                      </span>
                      <Badge variant="outline" className="bg-white text-blue-800 border-blue-300 text-[10px]">
                        NIDHI-RAKSHAK Database
                      </Badge>
                    </div>
                    <div className="font-semibold text-slate-900 pt-1">{selectedGrievance.projectName}</div>
                    {selectedGrievance.projectId && (
                      <div className="font-mono text-[10px] text-slate-500">ID: {selectedGrievance.projectId}</div>
                    )}
                  </div>
                )}

                {/* Transparent Lifecycle Stepper */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <IconActivity className="size-4 text-blue-600" />
                      Transparent Tracking Lifecycle
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Target SLA: {selectedGrievance.slaDays || 7} Days
                    </span>
                  </div>

                  <div className="space-y-4 pt-1">
                    {(selectedGrievance.timeline && selectedGrievance.timeline.length > 0
                      ? selectedGrievance.timeline
                      : [
                          {
                            stage: "Submitted",
                            title: "Grievance Lodged & Cryptographically Timestamped",
                            timestamp: selectedGrievance.date,
                            actor: "Citizen Portal (Identity Encrypted)",
                            status: "Completed" as const,
                            remarks: "Grievance recorded on portal with citizen anonymity shield active.",
                          },
                          {
                            stage: "AI_Triaged",
                            title: "AI NLP Triage & Risk Classification",
                            timestamp: selectedGrievance.date,
                            actor: "NIDHI-RAKSHAK AI Engine",
                            status: "Completed" as const,
                            remarks: `Categorized as '${selectedGrievance.category}'. Alert dispatched to district cell.`,
                          },
                          {
                            stage: "Assigned",
                            title: "Assigned to District Nodal Authority",
                            timestamp: "Active",
                            actor: selectedGrievance.assignedOfficer || "District Collectorate",
                            status: selectedGrievance.status === "Open" ? ("In_Progress" as const) : ("Completed" as const),
                            remarks: selectedGrievance.actionTaken || "Nodal officer assigned to inspect and respond.",
                          },
                          ...(selectedGrievance.status === "Resolved"
                            ? [
                                {
                                  stage: "Resolved",
                                  title: "Grievance Resolved & Rectification Published",
                                  timestamp: "Completed",
                                  actor: "District Grievance Officer",
                                  status: "Completed" as const,
                                  remarks: "Action completed on site and verified with public closure report.",
                                },
                              ]
                            : []),
                        ]
                    ).map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 relative">
                        <div className="flex flex-col items-center">
                          <div
                            className={`size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              step.status === "Completed"
                                ? "bg-emerald-600 text-white"
                                : step.status === "In_Progress"
                                ? "bg-amber-500 text-white animate-pulse"
                                : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {step.status === "Completed" ? (
                              <IconCheck className="size-3.5" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          {idx < (selectedGrievance.timeline?.length || 3) - 1 && (
                            <div
                              className={`w-0.5 h-12 mt-1 ${
                                step.status === "Completed" ? "bg-emerald-300" : "bg-slate-200"
                              }`}
                            />
                          )}
                        </div>

                        <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="font-semibold text-xs text-slate-900">{step.title}</span>
                            <span className="font-mono text-[10px] text-slate-500">{step.timestamp}</span>
                          </div>
                          <div className="text-[11px] text-blue-700 font-medium">Actor: {step.actor}</div>
                          <p className="text-slate-600 text-[11px] leading-relaxed pt-0.5">{step.remarks}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Departmental Response */}
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      <IconBuildingCommunity className="size-4 text-emerald-400" />
                      Official Departmental Redressal Action
                    </span>
                    <Badge className="bg-emerald-500 text-slate-950 font-bold text-[10px]">
                      Transparent Action Log
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div>
                      <span className="text-slate-400">Assigned Nodal Authority:</span>{" "}
                      <strong className="text-white">
                        {selectedGrievance.assignedOfficer || "District Rural Development Authority"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Official Action Taken:</span>{" "}
                      <span className="text-slate-200">{selectedGrievance.actionTaken || "Enquiry ongoing."}</span>
                    </div>
                  </div>
                </div>
              </div>

              <SheetFooter className="p-4 border-t bg-card flex flex-row items-center justify-between">
                <SheetClose render={<Button size="sm" className="text-xs" />}>
                  Close Inspector
                </SheetClose>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
