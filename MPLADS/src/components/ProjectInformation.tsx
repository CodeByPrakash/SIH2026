"use client";

import React, { useState, useMemo } from "react";
import type { User, Project } from "@/types";
import { PROJECTS } from "@/data/mpladsData";
import { useProjects } from "@/hooks/useProjects";
import {
  IconSearch,
  IconFilter,
  IconBuildingCommunity,
  IconMapPin,
  IconCurrencyRupee,
  IconCalendar,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconDownload,
  IconFileSpreadsheet,
  IconEye,
  IconMap,
  IconCube,
  IconSparkles,
  IconX,
  IconShieldCheck,
  IconUser,
  IconFileCertificate,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import * as XLSX from "xlsx";

interface ProjectInformationProps {
  user: User;
  onNavigate: (page: string) => void;
}

export default function ProjectInformation({ user, onNavigate }: ProjectInformationProps) {
  const { projects: liveProjects } = useProjects({
    constituency: user.role === "MP" ? user.constituency : undefined,
    district: user.role === "District" ? user.district : undefined,
    state: user.role === "State" ? user.state : undefined,
  });

  const projectList = liveProjects && liveProjects.length > 0 ? liveProjects : PROJECTS;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    projectList.forEach((p) => set.add(p.category));
    return ["All", ...Array.from(set)];
  }, [projectList]);

  const filteredProjects = useMemo(() => {
    return projectList.filter((p) => {
      const matchesSearch =
        searchTerm === "" ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.constituency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.contractor && p.contractor.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [projectList, searchTerm, selectedCategory, selectedStatus]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  const totalProjects = filteredProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalProjects / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProjects = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, safeCurrentPage, pageSize]);

  const startIndex = totalProjects === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, totalProjects);

  // Export disclosure table to Excel
  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const rows = [
      ["NIDHI-RAKSHAK — Section 4(1)(b) RTI Public Project Disclosures"],
      [`Generated for Citizen Public Transparency: ${new Date().toLocaleDateString("en-IN")}`],
      [""],
      [
        "Work Order No",
        "Project Name",
        "Category",
        "Sub-Category",
        "Constituency",
        "District",
        "State",
        "MP Name",
        "Sanctioned (₹L)",
        "Released (₹L)",
        "Expenditure (₹L)",
        "Progress %",
        "Status",
        "Implementing Agency / Contractor",
        "Sanction Date",
        "Expected Completion",
        "UC Submitted",
        "Asset Created",
      ],
      ...filteredProjects.map((p) => [
        p.workOrderNo,
        p.name,
        p.category,
        p.subCategory,
        p.constituency,
        p.district,
        p.state,
        p.mpName,
        p.sanctionedAmount,
        p.releasedAmount,
        p.expenditure,
        `${p.progress}%`,
        p.status,
        p.contractor,
        p.sanctionDate,
        p.expectedCompletion,
        p.ucSubmitted ? "Yes" : "No",
        p.assetCreated ? "Yes" : "No",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Public Project Disclosures");
    XLSX.writeFile(wb, `MPLADS_Public_Project_Information_${Date.now()}.xlsx`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-slide-in">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/70 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Project Information Transparency Portal
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <IconShieldCheck className="size-3.5" /> RTI Section 4(1)(b)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Public transparency disclosures of all sanctioned, ongoing, and completed MPLADS works. 
            Citizens can inspect project costs, contractors, geo-tags, and utilization certificates.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shrink-0"
        >
          <IconDownload className="size-4" /> Export Public Disclosures
        </button>
      </div>

      {/* ── Key Metrics Overview ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Total Disclosed Works
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-1 block">
            {projectList.length}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">100% public access</span>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Completed Assets
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
            {projectList.filter((p) => p.status === "Completed").length}
          </span>
          <span className="text-[11px] text-emerald-600/80 mt-0.5 block">Handed over to community</span>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Active Works
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1 block">
            {projectList.filter((p) => p.status === "In Progress").length}
          </span>
          <span className="text-[11px] text-blue-600/80 mt-0.5 block">Under ground execution</span>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            UC Compliance Rate
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 block">
            {Math.round(
              (projectList.filter((p) => p.ucSubmitted).length / (projectList.length || 1)) * 100
            )}%
          </span>
          <span className="text-[11px] text-amber-600/80 mt-0.5 block">Utilization certs verified</span>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <IconSearch className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search work order, project title, constituency, or contractor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <IconX className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconFilter className="size-3.5" /> Filter:
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground outline-none focus:border-primary"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Sectors" : c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground outline-none focus:border-primary"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Delayed">Delayed</option>
            <option value="Sanctioned">Sanctioned</option>
          </select>

          <span className="text-xs text-muted-foreground font-mono">
            {filteredProjects.length} records
          </span>
        </div>
      </div>

      {/* ── Project Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedProjects.map((p) => (
          <div
            key={p.id}
            className="bg-card border border-border/70 hover:border-primary/50 transition-all rounded-xl p-4 shadow-sm flex flex-col justify-between group"
          >
            <div>
              {/* Header tags */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {p.workOrderNo}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    p.status === "Completed"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : p.status === "In Progress"
                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        : p.status === "Delayed"
                          ? "bg-red-500/10 text-red-600 border border-red-500/20"
                          : "bg-slate-500/10 text-slate-600 border border-slate-500/20"
                  }`}
                >
                  {p.status}
                </span>
              </div>

              {/* Title & Category */}
              <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {p.name}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                {p.category} · {p.subCategory}
              </p>

              {/* Location & MP */}
              <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <IconMapPin className="size-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    {p.constituency}, {p.district} ({p.state})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IconUser className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">MP: {p.mpName}</span>
                </div>
              </div>

              {/* Financial Progress Bar */}
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between text-xs mb-1 font-mono">
                  <span className="text-muted-foreground">Execution Progress</span>
                  <span className="font-bold text-foreground">{p.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      p.progress >= 90
                        ? "bg-emerald-500"
                        : p.progress >= 50
                          ? "bg-blue-500"
                          : "bg-amber-500"
                    }`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono mt-2">
                  <span className="text-muted-foreground">
                    Sanctioned: <strong className="text-foreground">₹{(p.sanctionedAmount / 100).toFixed(2)} Cr</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Spent: <strong className="text-foreground">₹{(p.expenditure / 100).toFixed(2)} Cr</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedProject(p)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <IconEye className="size-3.5" /> Full Transparency Sheet
              </button>

              <button
                onClick={() => onNavigate("evidence")}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 px-2 py-1 rounded-md transition-colors"
                title="Submit Ground Evidence"
              >
                <IconSparkles className="size-3 text-amber-500" /> Evidence
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Pagination Bar ── */}
      {filteredProjects.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-card border border-border/70 rounded-xl text-xs text-muted-foreground">
          <span>
            Showing <strong className="text-foreground font-semibold">{startIndex}</strong> to{" "}
            <strong className="text-foreground font-semibold">{endIndex}</strong> of{" "}
            <strong className="text-foreground font-semibold">{totalProjects}</strong> records
          </span>

          <div className="flex items-center gap-1">
            <button
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage(1)}
              className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="First page"
            >
              <IconChevronsLeft className="size-3.5" />
            </button>
            <button
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center gap-1 transition-colors"
            >
              <IconChevronLeft className="size-3.5" /> Prev
            </button>
            <span className="px-2 font-mono text-xs text-foreground font-medium">
              Page {safeCurrentPage} of {totalPages}
            </span>
            <button
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center gap-1 transition-colors"
            >
              Next <IconChevronRight className="size-3.5" />
            </button>
            <button
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              className="p-1.5 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Last page"
            >
              <IconChevronsRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {filteredProjects.length === 0 && (
        <div className="text-center py-16 bg-card border border-border/70 rounded-2xl">
          <IconFileSpreadsheet className="size-10 text-muted-foreground mx-auto mb-2 opacity-50" />
          <h4 className="text-sm font-semibold text-foreground">No Projects Found</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Try adjusting your search keywords or filter options.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
              setSelectedStatus("All");
            }}
            className="mt-3 text-xs text-primary font-semibold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* ── Full Transparency Disclosure Modal ── */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-scale-in relative">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
            >
              <IconX className="size-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                {selectedProject.workOrderNo}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Public Transparency Disclosure
              </span>
            </div>

            <h2 className="font-display text-lg font-bold text-foreground mt-2">
              {selectedProject.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedProject.category} · {selectedProject.subCategory}
            </p>

            {/* Grid of Disclosures */}
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  Constituency & MP
                </span>
                <span className="font-semibold text-foreground mt-0.5 block">
                  {selectedProject.constituency} ({selectedProject.state})
                </span>
                <span className="text-muted-foreground text-[11px]">MP: {selectedProject.mpName}</span>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  Implementing Agency / Contractor
                </span>
                <span className="font-semibold text-foreground mt-0.5 block truncate">
                  {selectedProject.contractor}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  District Admin: {selectedProject.district}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  Financial Sanction
                </span>
                <span className="font-mono font-bold text-foreground mt-0.5 block">
                  Sanctioned: ₹{(selectedProject.sanctionedAmount / 100).toFixed(2)} Cr
                </span>
                <span className="font-mono text-muted-foreground text-[11px]">
                  Released: ₹{(selectedProject.releasedAmount / 100).toFixed(2)} Cr | Spent: ₹
                  {(selectedProject.expenditure / 100).toFixed(2)} Cr
                </span>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  Timeline & Status
                </span>
                <span className="font-semibold text-foreground mt-0.5 block">
                  Status: {selectedProject.status} ({selectedProject.progress}%)
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Target Completion: {selectedProject.expectedCompletion}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  Geo-Tag & Coordinates
                </span>
                <span className="font-mono font-semibold text-foreground mt-0.5 block">
                  {(selectedProject.geoLat ?? 28.6139).toFixed(4)}° N,{" "}
                  {(selectedProject.geoLng ?? 77.2090).toFixed(4)}° E
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {selectedProject.photos} geo-tagged ground photos uploaded
                </span>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                  Compliance Certifications
                </span>
                <span className="font-semibold text-foreground mt-0.5 block">
                  UC: {selectedProject.ucSubmitted ? "✅ Submitted" : "⚠️ Pending Verification"}
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Public Asset Registry: {selectedProject.assetCreated ? "Enrolled" : "In Progress"}
                </span>
              </div>
            </div>

            {/* Action Buttons inside Modal */}
            <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => {
                  setSelectedProject(null);
                  onNavigate("gis");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                <IconMap className="size-3.5 text-primary" /> View on GIS Map
              </button>

              <button
                onClick={() => {
                  setSelectedProject(null);
                  onNavigate("3d-view");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
              >
                <IconCube className="size-3.5 text-indigo-500" /> View in 3D
              </button>

              <button
                onClick={() => {
                  setSelectedProject(null);
                  onNavigate("evidence");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                <IconSparkles className="size-3.5" /> Submit Ground Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
