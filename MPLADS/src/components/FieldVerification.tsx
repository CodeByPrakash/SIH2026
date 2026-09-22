"use client";

import React, { useState, useMemo } from "react";
import type { User, Project } from "@/types";
import { PROJECTS } from "@/data/mpladsData";
import { useProjects } from "@/hooks/useProjects";
import {
  IconMapPinCheck,
  IconSearch,
  IconFilter,
  IconCalendar,
  IconCheck,
  IconAlertTriangle,
  IconClock,
  IconDownload,
  IconUser,
  IconFileCertificate,
  IconMapPin,
  IconCube,
  IconMap,
  IconPlus,
  IconX,
  IconShieldCheck,
  IconBuildingCommunity,
  IconFileText,
  IconPhoto,
} from "@tabler/icons-react";
import * as XLSX from "xlsx";

interface FieldVerificationProps {
  user: User;
  onNavigate: (page: string) => void;
}

interface InspectionRecord {
  id: string;
  projectId: string;
  projectName: string;
  workOrderNo: string;
  district: string;
  block: string;
  officerName: string;
  officerDesignation: string;
  scheduledDate: string;
  completedDate?: string;
  status: "Completed" | "Scheduled" | "Discrepancy Flagged" | "Overdue";
  gpsMatch: boolean;
  mbVerified: boolean;
  qualityPassed: boolean;
  boardInstalled: boolean;
  photosCount: number;
  remarks: string;
}

const INITIAL_INSPECTIONS: InspectionRecord[] = [
  {
    id: "INSP-2024-001",
    projectId: "proj-1",
    projectName: "Construction of Community Hall at Block A",
    workOrderNo: "WO-2024-001",
    district: "South Delhi",
    block: "Hauz Khas",
    officerName: "Er. Ramesh Kumar",
    officerDesignation: "Executive Engineer (PWD)",
    scheduledDate: "2024-08-10",
    completedDate: "2024-08-11",
    status: "Completed",
    gpsMatch: true,
    mbVerified: true,
    qualityPassed: true,
    boardInstalled: true,
    photosCount: 6,
    remarks: "Structure completed as per approved drawing. Plaque installed on site with MP details.",
  },
  {
    id: "INSP-2024-002",
    projectId: "proj-2",
    projectName: "Solar Street Light Installation in 12 Wards",
    workOrderNo: "WO-2024-002",
    district: "South Delhi",
    block: "Mehrauli",
    officerName: "Sh. Alok Sharma",
    officerDesignation: "Assistant Engineer (Electrical)",
    scheduledDate: "2024-08-18",
    completedDate: "2024-08-19",
    status: "Completed",
    gpsMatch: true,
    mbVerified: true,
    qualityPassed: true,
    boardInstalled: true,
    photosCount: 14,
    remarks: "All 12 solar poles tested and functional. Battery warranty cards verified in MB.",
  },
  {
    id: "INSP-2024-003",
    projectId: "proj-3",
    projectName: "Upgradation of PHC Drinking Water RO Plant",
    workOrderNo: "WO-2024-003",
    district: "South Delhi",
    block: "Kalkaji",
    officerName: "Dr. Sunita Rao",
    officerDesignation: "Sub-Divisional Magistrate (SDM)",
    scheduledDate: "2024-09-02",
    completedDate: "2024-09-03",
    status: "Discrepancy Flagged",
    gpsMatch: true,
    mbVerified: false,
    qualityPassed: false,
    boardInstalled: true,
    photosCount: 4,
    remarks: "Water flow rate 30% below tender specification. Contractor directed to replace RO membrane within 7 days.",
  },
  {
    id: "INSP-2024-004",
    projectId: "proj-4",
    projectName: "All-Weather Link Road from Main Market to NH-48",
    workOrderNo: "WO-2024-004",
    district: "South Delhi",
    block: "Saket",
    officerName: "Er. Amit Saxena",
    officerDesignation: "Assistant Engineer (Civil)",
    scheduledDate: "2024-09-25",
    status: "Scheduled",
    gpsMatch: false,
    mbVerified: false,
    qualityPassed: false,
    boardInstalled: false,
    photosCount: 0,
    remarks: "Field inspection scheduled for pre-monsoon bituminous layer compaction check.",
  },
  {
    id: "INSP-2024-005",
    projectId: "proj-5",
    projectName: "Renovation of Govt Girls Secondary School Library",
    workOrderNo: "WO-2024-005",
    district: "South Delhi",
    block: "Malviya Nagar",
    officerName: "Smt. Neha Gupta",
    officerDesignation: "Block Development Officer (BDO)",
    scheduledDate: "2024-09-12",
    status: "Overdue",
    gpsMatch: false,
    mbVerified: false,
    qualityPassed: false,
    boardInstalled: false,
    photosCount: 0,
    remarks: "Inspection delayed due to officer district court duty. Rescheduling pending.",
  },
];

export default function FieldVerification({ user, onNavigate }: FieldVerificationProps) {
  const { projects: liveProjects } = useProjects({
    district: user.role === "District" ? user.district : undefined,
    state: user.role === "State" ? user.state : undefined,
  });

  const projectList = liveProjects && liveProjects.length > 0 ? liveProjects : PROJECTS;

  const [inspections, setInspections] = useState<InspectionRecord[]>(INITIAL_INSPECTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // New Inspection Form
  const [formProjectId, setFormProjectId] = useState(projectList[0]?.id || "");
  const [formOfficerName, setFormOfficerName] = useState("");
  const [formOfficerDesig, setFormOfficerDesig] = useState("Executive Engineer (PWD)");
  const [formDate, setFormDate] = useState("");
  const [formRemarks, setFormRemarks] = useState("");

  const totalWorksCount = projectList.length || 482;
  const statutory10PctMandate = Math.ceil(totalWorksCount * 0.1);
  const completedInspectionsCount = inspections.filter((i) => i.status === "Completed").length;
  const currentCoveragePct = ((completedInspectionsCount / totalWorksCount) * 100).toFixed(1);

  const filteredInspections = useMemo(() => {
    return inspections.filter((i) => {
      const matchesSearch =
        searchTerm === "" ||
        i.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.workOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.block.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === "All" || i.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [inspections, searchTerm, selectedStatus]);

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projectList.find((p) => p.id === formProjectId) || projectList[0];
    const newRecord: InspectionRecord = {
      id: `INSP-2024-${String(inspections.length + 1).padStart(3, "0")}`,
      projectId: proj.id,
      projectName: proj.name,
      workOrderNo: proj.workOrderNo,
      district: user.district || proj.district || "District Office",
      block: "Nodal Block",
      officerName: formOfficerName || "Designated Nodal Officer",
      officerDesignation: formOfficerDesig,
      scheduledDate: formDate || new Date().toISOString().split("T")[0],
      status: "Scheduled",
      gpsMatch: false,
      mbVerified: false,
      qualityPassed: false,
      boardInstalled: false,
      photosCount: 0,
      remarks: formRemarks || "Routine 10% statutory physical verification scheduled.",
    };

    setInspections([newRecord, ...inspections]);
    setIsScheduleModalOpen(false);
    setFormOfficerName("");
    setFormDate("");
    setFormRemarks("");
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const rows = [
      ["NIDHI-RAKSHAK — District Authority Field Verification Register"],
      [`District: ${user.district || "South Delhi"} · Date: ${new Date().toLocaleDateString("en-IN")}`],
      [`Statutory 10% Mandate: ${statutory10PctMandate} works · Completed: ${completedInspectionsCount} works`],
      [""],
      [
        "Inspection ID",
        "Work Order No",
        "Project Name",
        "Block / Taluk",
        "Inspecting Officer",
        "Designation",
        "Scheduled Date",
        "Completed Date",
        "Status",
        "GPS Match",
        "MB Verified",
        "Quality Passed",
        "Citizen Board",
        "Photos",
        "Remarks",
      ],
      ...filteredInspections.map((i) => [
        i.id,
        i.workOrderNo,
        i.projectName,
        i.block,
        i.officerName,
        i.officerDesignation,
        i.scheduledDate,
        i.completedDate || "—",
        i.status,
        i.gpsMatch ? "Yes" : "No",
        i.mbVerified ? "Yes" : "No",
        i.qualityPassed ? "Yes" : "No",
        i.boardInstalled ? "Yes" : "No",
        i.photosCount,
        i.remarks,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Field Inspections");
    XLSX.writeFile(wb, `District_Field_Verification_${Date.now()}.xlsx`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-slide-in">
      {/* ── Top Header ── */}
      <div className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              District Field Verification Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Statutory 10% Rule Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Mandatory physical verification of sanctioned works by District Collector & designated officers.
            Inspect on-ground execution, Measurement Books (MB), geo-tagged photos, and citizen display plaques.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            <IconDownload className="size-4" /> Export Register
          </button>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <IconPlus className="size-4" /> Schedule Inspection
          </button>
        </div>
      </div>

      {/* ── 4 KPI Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Annual 10% Target
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-foreground mt-1 block">
            {statutory10PctMandate} Works
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Out of {totalWorksCount} total works
          </span>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Physically Verified
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
            {completedInspectionsCount} ({currentCoveragePct}%)
          </span>
          <span className="text-[11px] text-emerald-600/80 mt-0.5 block">
            ✓ Target Exceeded
          </span>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Scheduled / Pending
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1 block">
            {inspections.filter((i) => i.status === "Scheduled").length}
          </span>
          <span className="text-[11px] text-blue-600/80 mt-0.5 block">
            Field officers deployed
          </span>
        </div>

        <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Discrepancies Flagged
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1 block">
            {inspections.filter((i) => i.status === "Discrepancy Flagged").length}
          </span>
          <span className="text-[11px] text-amber-600/80 mt-0.5 block">
            Rectification notices sent
          </span>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-card border border-border/70 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <IconSearch className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by project name, work order, officer, or block..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg outline-none focus:border-primary text-foreground placeholder:text-muted-foreground transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconFilter className="size-3.5" /> Filter:
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground outline-none focus:border-primary"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Discrepancy Flagged">Discrepancy Flagged</option>
            <option value="Overdue">Overdue</option>
          </select>

          <span className="text-xs text-muted-foreground font-mono">
            {filteredInspections.length} records
          </span>
        </div>
      </div>

      {/* ── Inspection Records Table / Cards ── */}
      <div className="bg-card border border-border/70 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-[11px] text-muted-foreground uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Inspection ID</th>
                <th className="py-3 px-4">Project & Work Order</th>
                <th className="py-3 px-4">Inspecting Officer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Checklist Checks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredInspections.map((i) => (
                <tr key={i.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    {i.id}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-foreground line-clamp-1">
                      {i.projectName}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {i.workOrderNo} · {i.block} Block
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-foreground">{i.officerName}</div>
                    <div className="text-[11px] text-muted-foreground">{i.officerDesignation}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                    {i.completedDate ? `Done: ${i.completedDate}` : `Due: ${i.scheduledDate}`}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`size-2 rounded-full ${
                          i.gpsMatch ? "bg-emerald-500" : "bg-muted-foreground/40"
                        }`}
                        title={i.gpsMatch ? "GPS Match" : "GPS Pending"}
                      />
                      <span
                        className={`size-2 rounded-full ${
                          i.mbVerified ? "bg-emerald-500" : "bg-muted-foreground/40"
                        }`}
                        title={i.mbVerified ? "MB Verified" : "MB Pending"}
                      />
                      <span
                        className={`size-2 rounded-full ${
                          i.qualityPassed ? "bg-emerald-500" : "bg-muted-foreground/40"
                        }`}
                        title={i.qualityPassed ? "Quality Passed" : "Quality Pending"}
                      />
                      <span
                        className={`size-2 rounded-full ${
                          i.boardInstalled ? "bg-emerald-500" : "bg-muted-foreground/40"
                        }`}
                        title={i.boardInstalled ? "Plaque Installed" : "Plaque Pending"}
                      />
                      <span className="text-[10px] text-muted-foreground ml-1">
                        {i.photosCount} photos
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        i.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : i.status === "Scheduled"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                            : i.status === "Discrepancy Flagged"
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              : "bg-red-500/10 text-red-600 border border-red-500/20"
                      }`}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedRecord(i)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Inspection Sheet →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Inspection Sheet Modal ── */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-scale-in relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
            >
              <IconX className="size-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                {selectedRecord.id}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  selectedRecord.status === "Completed"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : selectedRecord.status === "Scheduled"
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-amber-500/10 text-amber-600"
                }`}
              >
                {selectedRecord.status}
              </span>
            </div>

            <h2 className="font-display text-base font-bold text-foreground mt-2">
              {selectedRecord.projectName}
            </h2>
            <p className="text-xs text-muted-foreground">
              Work Order: {selectedRecord.workOrderNo} · Block: {selectedRecord.block}
            </p>

            {/* Checklist Results */}
            <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border/60 space-y-2.5">
              <h4 className="text-xs font-bold uppercase text-foreground">Field Verification Checklist</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className={selectedRecord.gpsMatch ? "text-emerald-500" : "text-muted-foreground"}>
                    {selectedRecord.gpsMatch ? "✓" : "○"}
                  </span>
                  <span>GPS Geo-Tag Matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={selectedRecord.mbVerified ? "text-emerald-500" : "text-muted-foreground"}>
                    {selectedRecord.mbVerified ? "✓" : "○"}
                  </span>
                  <span>Measurement Book (MB)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={selectedRecord.qualityPassed ? "text-emerald-500" : "text-muted-foreground"}>
                    {selectedRecord.qualityPassed ? "✓" : "○"}
                  </span>
                  <span>Material Quality Tests</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={selectedRecord.boardInstalled ? "text-emerald-500" : "text-muted-foreground"}>
                    {selectedRecord.boardInstalled ? "✓" : "○"}
                  </span>
                  <span>Citizen Display Plaque</span>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="mt-4 space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Inspecting Officer Remarks:
              </span>
              <p className="text-xs text-foreground bg-muted/20 p-3 rounded-lg border border-border/50">
                {selectedRecord.remarks}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Inspected by: {selectedRecord.officerName} ({selectedRecord.officerDesignation})
              </p>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-border flex justify-end gap-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  onNavigate("gis");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Locate on GIS Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Schedule Field Inspection Modal ── */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-in relative">
            <button
              onClick={() => setIsScheduleModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg"
            >
              <IconX className="size-5" />
            </button>

            <h2 className="font-display text-lg font-bold text-foreground">
              Schedule Statutory Field Inspection
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Assign an engineer to conduct physical verification under the mandatory 10% annual quota.
            </p>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">
                  Select Project
                </label>
                <select
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                  className="w-full p-2 rounded-lg bg-background border border-border text-foreground outline-none focus:border-primary"
                >
                  {projectList.slice(0, 15).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.workOrderNo} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">
                  Inspecting Officer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Er. Rajesh Verma"
                  required
                  value={formOfficerName}
                  onChange={(e) => setFormOfficerName(e.target.value)}
                  className="w-full p-2 rounded-lg bg-background border border-border text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">
                  Designation
                </label>
                <select
                  value={formOfficerDesig}
                  onChange={(e) => setFormOfficerDesig(e.target.value)}
                  className="w-full p-2 rounded-lg bg-background border border-border text-foreground outline-none focus:border-primary"
                >
                  <option value="Executive Engineer (PWD)">Executive Engineer (PWD)</option>
                  <option value="Assistant Engineer (Civil)">Assistant Engineer (Civil)</option>
                  <option value="Sub-Divisional Magistrate (SDM)">Sub-Divisional Magistrate (SDM)</option>
                  <option value="Block Development Officer (BDO)">Block Development Officer (BDO)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">
                  Inspection Due Date
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full p-2 rounded-lg bg-background border border-border text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">
                  Special Verification Instructions
                </label>
                <textarea
                  placeholder="e.g. Conduct core test for compressive strength and verify citizen display board."
                  rows={2}
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="w-full p-2 rounded-lg bg-background border border-border text-foreground outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-muted text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Issue Inspection Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
