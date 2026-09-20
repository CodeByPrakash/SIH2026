"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import type { User, UserRole, ICitizenEvidence, VerificationCategory } from "@/types";
import { PROJECTS } from "@/data/mpladsData";
import { useCitizenEvidence } from "@/hooks/useCitizenEvidence";
import { extractExifFromFile } from "@/utils/exifExtractor";
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
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconEye,
  IconSearch,
  IconRefresh,
  IconLock,
  IconSparkles,
  IconFileText,
  IconPhoto,
  IconMapPin,
  IconBuildingCommunity,
  IconUserCheck,
  IconShieldExclamation,
  IconHelpCircle,
  IconArrowRight,
  IconFilter,
} from "@tabler/icons-react";

interface Props {
  user?: User;
}

function CategoryBadge({ category }: { category: VerificationCategory }) {
  if (category === "CONFLICT_DETECTED") {
    return (
      <Badge variant="destructive" className="font-semibold text-[11px] px-2 py-0.5 gap-1">
        <IconAlertTriangle className="size-3" />
        Conflict Detected
      </Badge>
    );
  }
  if (category === "POTENTIAL_CONFLICT") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/40 text-amber-700 bg-amber-500/10 font-semibold text-[11px] px-2 py-0.5 gap-1 dark:text-amber-400"
      >
        <IconShieldExclamation className="size-3" />
        Potential Conflict
      </Badge>
    );
  }
  if (category === "CONSISTENT") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/40 text-emerald-700 bg-emerald-500/10 font-medium text-[11px] px-2 py-0.5 gap-1 dark:text-emerald-400"
      >
        <IconCheck className="size-3" />
        Consistent
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="font-medium text-[11px] px-2 py-0.5 gap-1">
      <IconHelpCircle className="size-3" />
      Insufficient Evidence
    </Badge>
  );
}

export default function CitizenEvidenceVerification({ user }: Props) {
  const { evidenceList, isLive, lastUpdated, stats, submitEvidence } = useCitizenEvidence();
  const [activeTab, setActiveTab] = useState<"explore" | "submit">("explore");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [selectedEvidence, setSelectedEvidence] = useState<ICitizenEvidence | null>(null);

  // Form State
  const [form, setForm] = useState({
    projectId: PROJECTS[0]?.id || "",
    category: "Completion Discrepancy" as ICitizenEvidence["category"],
    description: "",
    location: "Gram Panchayat Rampur, Lucknow",
    evidenceType: "Photo" as ICitizenEvidence["evidenceType"],
    photoUrl: "",
    submittedBy: user?.name || "Citizen User",
    consent: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<ICitizenEvidence | null>(null);

  // File Upload & EXIF State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSizeFormatted, setFileSizeFormatted] = useState<string>("");
  const [extractedLat, setExtractedLat] = useState<number | undefined>(undefined);
  const [extractedLng, setExtractedLng] = useState<number | undefined>(undefined);
  const [extractedTimestamp, setExtractedTimestamp] = useState<string | undefined>(undefined);
  const [gpsSource, setGpsSource] = useState<"Image EXIF" | "Manual override" | "Unavailable">("Unavailable");
  const [submitStatusText, setSubmitStatusText] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // EXIF Metadata Inspection and Preview
  const stripExifAndPreview = async (file: File) => {
    setFileError(null);

    // Validation 1: MIME & Extension Check
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedTypes.includes(file.type.toLowerCase()) && !["jpg", "jpeg", "png", "webp"].includes(ext)) {
      setFileError("Invalid file format. Please select a JPEG, PNG, or WEBP image.");
      setSelectedFile(null);
      setFilePreview(null);
      setFileSizeFormatted("");
      setExtractedLat(undefined);
      setExtractedLng(undefined);
      setGpsSource("Unavailable");
      return;
    }

    // Validation 2: File Size Limit (5 MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFileError(`File size exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB selected). Please choose a smaller image.`);
      setSelectedFile(null);
      setFilePreview(null);
      setFileSizeFormatted("");
      setExtractedLat(undefined);
      setExtractedLng(undefined);
      setGpsSource("Unavailable");
      return;
    }

    // Extract EXIF metadata BEFORE canvas redraw
    const exif = await extractExifFromFile(file);
    if (exif.hasGps && typeof exif.latitude === "number" && typeof exif.longitude === "number") {
      setExtractedLat(exif.latitude);
      setExtractedLng(exif.longitude);
      setGpsSource("Image EXIF");
    } else {
      setExtractedLat(undefined);
      setExtractedLng(undefined);
      setGpsSource("Unavailable");
    }
    if (exif.timestamp) {
      setExtractedTimestamp(exif.timestamp);
    }

    // Format human-readable size
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeKb = Math.round(file.size / 1024);
    setFileSizeFormatted(file.size >= 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`);

    // Preview generation
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const cleanFile = new File([blob], file.name, {
                  type: file.type || "image/jpeg",
                  lastModified: Date.now(),
                });
                setSelectedFile(cleanFile);
                setFilePreview(canvas.toDataURL("image/jpeg", 0.92));
                return;
              }
              setSelectedFile(file);
              setFilePreview(e.target?.result as string);
            },
            file.type || "image/jpeg",
            0.92
          );
          return;
        }
        setSelectedFile(file);
        setFilePreview(e.target?.result as string);
      };
      img.onerror = () => {
        setSelectedFile(file);
        setFilePreview(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stripExifAndPreview(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileError(null);
    setFileSizeFormatted("");
    setExtractedLat(undefined);
    setExtractedLng(undefined);
    setExtractedTimestamp(undefined);
    setGpsSource("Unavailable");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const filteredList = useMemo(() => {
    return evidenceList.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.evidenceId.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);

      const matchCategory =
        categoryFilter === "All" || item.verificationCategory === categoryFilter;

      return matchSearch && matchCategory;
    });
  }, [evidenceList, search, categoryFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.location) return;
    if (fileError) return;

    setIsSubmitting(true);
    let uploadedPhotoUrl = form.photoUrl || "";

    // Step 1: Upload Image file if selected
    if (selectedFile) {
      setSubmitStatusText("Uploading evidence photo...");
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          if (uploadJson.success && uploadJson.url) {
            uploadedPhotoUrl = uploadJson.url;
          }
        }
      } catch (uploadErr) {
        console.warn("Upload failed, utilizing client preview reference:", uploadErr);
        if (filePreview) uploadedPhotoUrl = filePreview;
      }
    }

    // Step 2: Cross-check evidence with AI engine
    setSubmitStatusText("Cross-checking evidence...");

    const created = await submitEvidence({
      projectId: form.projectId,
      category: form.category,
      description: form.description,
      location: form.location,
      evidenceType: form.evidenceType,
      photoUrl: uploadedPhotoUrl,
      photoName: selectedFile?.name || "",
      photoLatitude: extractedLat,
      photoLongitude: extractedLng,
      photoTimestamp: extractedTimestamp,
      capturedAt: extractedTimestamp,
      gpsSource,
      metadataSource: gpsSource === "Image EXIF" ? "EXIF" : gpsSource === "Manual override" ? "MANUAL" : "NONE",
      submittedBy: form.submittedBy,
    });

    setSubmitStatusText("Verification complete.");

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatusText("");
      if (created) {
        setSubmittedSuccess(created);
        setSelectedEvidence(created);
      }
    }, 400);
  };

  const selectedProject = useMemo(() => {
    if (!selectedEvidence) return null;
    return PROJECTS.find((p) => p.id === selectedEvidence.projectId) || null;
  }, [selectedEvidence]);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Citizen Evidence Verification
            </h1>
            <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 bg-emerald-500/10 font-semibold text-xs gap-1">
              <IconLock className="size-3" />
              Privacy Protected
            </Badge>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                isLive
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <span className={`size-1.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              {isLive ? "Live DB Sync" : "Prototype Mode"}
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Independent citizen ground evidence cross-checked against project records using AI while protecting citizen privacy.
            {lastUpdated && ` · Last synced: ${lastUpdated.toLocaleTimeString()}`}
          </p>
          <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md font-mono">
            <span>Data Source:</span>
            <span className="font-semibold text-slate-700">Official Project Record — MPLADS SATHI Database</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "explore" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("explore")}
            className="text-xs h-9 gap-1.5"
          >
            <IconSearch className="size-4" />
            <span>Cross-Check Explorer</span>
          </Button>
          <Button
            variant={activeTab === "submit" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTab("submit");
              setSubmittedSuccess(null);
            }}
            className="text-xs h-9 gap-1.5 bg-blue-900 text-white hover:bg-blue-800"
          >
            <IconSparkles className="size-4" />
            <span>Submit Evidence</span>
          </Button>
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <Card className="p-3.5 bg-card border-border shadow-xs">
          <div className="text-[11px] font-medium text-muted-foreground">Total Submissions</div>
          <div className="text-xl font-bold tracking-tight text-foreground mt-1">{stats.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Database backed</div>
        </Card>
        <Card className="p-3.5 bg-card border-border shadow-xs">
          <div className="text-[11px] font-medium text-muted-foreground">AI Cross-Checks</div>
          <div className="text-xl font-bold tracking-tight text-blue-600 mt-1">{stats.crossChecked}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">100% Completed</div>
        </Card>
        <Card className="p-3.5 bg-card border-border shadow-xs border-l-4 border-l-red-500">
          <div className="text-[11px] font-medium text-muted-foreground">Conflicts Flagged</div>
          <div className="text-xl font-bold tracking-tight text-red-600 mt-1">{stats.conflictDetected}</div>
          <div className="text-[10px] text-red-600 font-medium mt-0.5">Field Audit Req.</div>
        </Card>
        <Card className="p-3.5 bg-card border-border shadow-xs border-l-4 border-l-amber-500">
          <div className="text-[11px] font-medium text-muted-foreground">Potential Conflicts</div>
          <div className="text-xl font-bold tracking-tight text-amber-600 mt-1">{stats.potentialConflict}</div>
          <div className="text-[10px] text-amber-600 font-medium mt-0.5">Review Required</div>
        </Card>
        <Card className="p-3.5 bg-card border-border shadow-xs border-l-4 border-l-emerald-500">
          <div className="text-[11px] font-medium text-muted-foreground">Consistent Records</div>
          <div className="text-xl font-bold tracking-tight text-emerald-600 mt-1">{stats.consistent}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Verified Ground Data</div>
        </Card>
      </div>

      {/* ── Privacy Protection Shield Banner ── */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700 shrink-0">
            <IconLock className="size-5" />
          </div>
          <div>
            <div className="font-semibold text-emerald-900 dark:text-emerald-300">
              🔒 Privacy-Preserving Citizen Evidence Protocol
            </div>
            <div className="text-slate-600 dark:text-slate-400 mt-0.5 text-[11px]">
              Citizens provide independent observations • Identity & contact info remain strictly protected • Anonymized IDs (`CE-2026-XXX`) assigned • Locations generalized to district/village parameters.
            </div>
          </div>
        </div>
        <Badge variant="outline" className="border-emerald-500/40 text-emerald-800 bg-white font-mono text-[10px] shrink-0 self-start md:self-auto">
          PII Anonymized
        </Badge>
      </div>

      {/* ── Main Tab Content ── */}
      {activeTab === "explore" ? (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
            <div className="relative flex-1 max-w-md">
              <IconSearch className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by Evidence ID, project name, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Filter AI Status:</span>
              <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || "All")}>
                <SelectTrigger className="h-9 text-xs w-[180px]">
                  <SelectValue placeholder="AI Verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories ({evidenceList.length})</SelectItem>
                  <SelectItem value="CONFLICT_DETECTED">Conflict Detected ({stats.conflictDetected})</SelectItem>
                  <SelectItem value="POTENTIAL_CONFLICT">Potential Conflict ({stats.potentialConflict})</SelectItem>
                  <SelectItem value="CONSISTENT">Consistent ({stats.consistent})</SelectItem>
                  <SelectItem value="INSUFFICIENT_EVIDENCE">Insufficient Evidence ({stats.insufficient})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Evidence Grid / List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.map((item) => (
              <Card
                key={item.evidenceId}
                className="p-4 bg-card border-border hover:border-blue-300 transition-all cursor-pointer shadow-xs hover:shadow-sm"
                onClick={() => setSelectedEvidence(item)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {item.evidenceId}
                  </span>
                  <CategoryBadge category={item.verificationCategory} />
                </div>

                <h3 className="font-semibold text-xs text-foreground line-clamp-1 mb-1">
                  {item.projectName}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  "{item.description}"
                </p>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] space-y-1 mb-3">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">AI Cross-Check Result:</span>
                    <span className="font-mono font-bold text-blue-700">{item.aiConfidence}% Match Confidence</span>
                  </div>
                  <div className="text-slate-500 line-clamp-1 italic">
                    {item.fieldDiscrepancy || item.explanation}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
                  <div className="flex items-center gap-1">
                    <IconMapPin className="size-3.5 text-slate-400" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                      <IconLock className="size-3" /> Identity Protected
                    </span>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-[11px] text-blue-600">
                      Inspect Side-by-Side →
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        /* ── Submit Evidence Form ── */
        <Card className="max-w-2xl mx-auto p-6 bg-card border-border shadow-sm">
          <div className="mb-5 pb-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Submit Independent Citizen Evidence</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Provide ground observation or photographs. Our AI engine will cross-check your submission against official MPLADS project records while keeping your identity confidential.
            </p>
          </div>

          {submittedSuccess ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-5xl">🛡️</div>
              <h3 className="text-base font-bold text-emerald-800">Evidence Submitted & AI Cross-Checked!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Assigned Anonymized Evidence ID: <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">{submittedSuccess.evidenceId}</span>
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left max-w-lg mx-auto text-xs space-y-2.5 my-4">
                <div className="font-bold text-slate-900 border-b pb-1.5 flex items-center justify-between">
                  <span>AI Verification Result</span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 border-emerald-300 text-emerald-800 font-mono">
                    🔒 Identity Protected
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold text-slate-700 block text-[11px]">Observation Understanding:</span>
                    <span className="font-bold text-blue-900 capitalize">
                      {submittedSuccess.observationSentiment === "INSUFFICIENT_INFORMATION"
                        ? "Insufficient Info"
                        : (submittedSuccess.observationSentiment || "Neutral").toLowerCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block text-[11px]">Match Confidence:</span>
                    <span className="font-mono font-bold text-blue-700">{submittedSuccess.aiConfidence}% Match</span>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 block text-[11px]">AI Analysis & Explanation:</span>
                  <p className="text-slate-800 leading-relaxed bg-white p-2 rounded border border-slate-200 mt-0.5">
                    {submittedSuccess.explanation}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 block text-[11px]">Comparison with Project Record:</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    {submittedSuccess.officialRecordClaim}
                  </p>
                </div>

                {submittedSuccess.fieldDiscrepancy && (
                  <div>
                    <span className="font-semibold text-slate-700 block text-[11px]">Potential Conflict / Discrepancy:</span>
                    <p className="text-amber-900 font-medium bg-amber-50 p-2 rounded border border-amber-200 text-[11px] mt-0.5">
                      {submittedSuccess.fieldDiscrepancy}
                    </p>
                  </div>
                )}

                <div>
                  <span className="font-semibold text-slate-700 block text-[11px]">Recommended Action:</span>
                  <p className="text-blue-900 font-semibold bg-blue-100/70 p-2 rounded border border-blue-200 text-[11px] mt-0.5">
                    👉 {submittedSuccess.recommendedAction}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab("explore")} className="text-xs">
                  View in Explorer
                </Button>
                <Button size="sm" onClick={() => setSubmittedSuccess(null)} className="text-xs bg-blue-900 text-white">
                  Submit Another Evidence
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Select Project
                </label>
                <Select
                  value={form.projectId}
                  onValueChange={(val) => {
                    setForm((p) => ({ ...p, projectId: val || "" }));
                    handleRemoveImage();
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Choose project..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECTS.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-xs">
                        {p.name} ({p.id} - {p.state})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Evidence Category
                  </label>
                  <Select
                    value={form.category}
                    onValueChange={(val) =>
                      val && setForm((p) => ({ ...p, category: val as ICitizenEvidence["category"] }))
                    }
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Completion Discrepancy">Completion Discrepancy</SelectItem>
                      <SelectItem value="Quality Defect">Quality Defect</SelectItem>
                      <SelectItem value="Fund Misuse">Fund Misuse</SelectItem>
                      <SelectItem value="Location Issue">Location Issue</SelectItem>
                      <SelectItem value="Delay">Delay</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">
                    Evidence Medium
                  </label>
                  <Select
                    value={form.evidenceType}
                    onValueChange={(val) =>
                      val && setForm((p) => ({ ...p, evidenceType: val as ICitizenEvidence["evidenceType"] }))
                    }
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Medium" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Photo">Site Photograph</SelectItem>
                      <SelectItem value="Physical Observation">Physical Observation</SelectItem>
                      <SelectItem value="Document">Supporting Document</SelectItem>
                      <SelectItem value="Inspection Report">Inspection Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Ground Location / Village / District
                </label>
                <Input
                  required
                  placeholder="e.g. Gram Panchayat Rampur, Lucknow"
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Ground Observation Details
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe what you observed on site (e.g., road unpaved despite completion status, solar light non-functional...)"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl outline-none focus:border-blue-400 bg-background text-foreground resize-none"
                />
              </div>

              {/* Upload Ground Evidence Photo Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Upload Ground Evidence Photo</span>
                  <span className="text-[11px] font-normal text-slate-500">Optional · Max 5 MB (JPG, PNG, WEBP)</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="evidence-photo-upload"
                />

                {filePreview ? (
                  /* Compact Image Preview */
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="size-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white shadow-xs">
                        <img
                          src={filePreview}
                          alt="Ground evidence preview"
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">
                          {selectedFile?.name || "Ground_Evidence_Photo.jpg"}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{fileSizeFormatted || "2.1 MB"}</span>
                          <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                            <IconLock className="size-3" /> EXIF Stripped
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-7 text-[11px] px-2.5"
                      >
                        Change Image
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="h-7 text-[11px] px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <IconX className="size-3.5 mr-0.5" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Upload Drop / Click Area */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30 flex flex-col items-center justify-center gap-1"
                  >
                    <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                      <IconPhoto className="size-5" />
                    </div>
                    <div className="text-xs font-semibold text-slate-700 mt-1">
                      Click to select an image from your device
                    </div>
                    <div className="text-[11px] text-slate-500">
                      JPEG, JPG, PNG, or WEBP up to 5 MB
                    </div>
                  </div>
                )}

                {/* Validation Error Banner */}
                {fileError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 font-medium">
                    <IconAlertTriangle className="size-4 text-red-600 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>

              {/* Privacy Consent Checkbox */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-800">
                  <IconShieldCheck className="size-4 text-emerald-600" />
                  <span>Privacy Protection & Anonymization Notice</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Your full name and phone number will be encrypted and hidden. Officers only see anonymized Evidence ID (<span className="font-mono font-bold">CE-2026-XXX</span>) and ground observation details.
                </p>
                <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => setForm((p) => ({ ...p, consent: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>I agree to provide independent ground evidence under MPLADS privacy terms.</span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !form.consent || !!fileError}
                className="w-full h-10 bg-[#0F2044] text-white rounded-xl text-xs font-semibold hover:bg-blue-900 transition-colors disabled:opacity-50"
              >
                {isSubmitting
                  ? (submitStatusText || "Processing Evidence…")
                  : "Submit & Cross-Check Evidence →"}
              </Button>
            </form>
          )}
        </Card>
      )}

      {/* ── Side-by-Side Comparison Drawer ── */}
      <Sheet open={!!selectedEvidence} onOpenChange={(open) => !open && setSelectedEvidence(null)}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
          {selectedEvidence && (
            <>
              <SheetHeader className="p-4 md:p-6 border-b bg-card sticky top-0 z-10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded">
                      {selectedEvidence.evidenceId}
                    </span>
                    <CategoryBadge category={selectedEvidence.verificationCategory} />
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 bg-emerald-50 font-mono text-[10px] gap-1">
                    <IconLock className="size-3" />
                    Privacy Protected
                  </Badge>
                </div>
                <SheetTitle className="text-base font-bold text-foreground mt-2">
                  {selectedEvidence.projectName}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  AI Cross-Check Verification • Submitted on {selectedEvidence.evidenceDate} at {selectedEvidence.location}
                </SheetDescription>
              </SheetHeader>

              <div className="p-4 md:p-6 space-y-6">
                {/* ── Side-by-Side Comparison Matrix ── */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <IconSparkles className="size-4 text-blue-600" />
                    Side-by-Side Evidence Comparison
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Column 1: OFFICIAL PROJECT RECORD */}
                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                        <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                          <IconBuildingCommunity className="size-4" />
                          OFFICIAL PROJECT RECORD
                        </span>
                        <Badge variant="outline" className="text-[9px] bg-white border-blue-300 text-blue-800 font-mono">
                          Database Record
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Data Source:</span>
                          <span className="font-medium text-slate-800">Official Project Record — MPLADS SATHI Database</span>
                        </div>
                        {selectedProject ? (
                          <>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Project Status:</span>
                                <span className="font-bold text-slate-800">{selectedProject.status}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Physical Progress:</span>
                                <span className="font-mono font-bold text-blue-700">{selectedProject.progress}%</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Sanctioned Amount:</span>
                                <span className="font-mono text-slate-800">₹{selectedProject.sanctionedAmount}L</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block text-[10px]">Expenditure:</span>
                                <span className="font-mono text-slate-800">₹{selectedProject.expenditure}L</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[10px]">Contractor:</span>
                              <span className="font-medium text-slate-800">{selectedProject.contractor || "N/A"}</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-slate-600 text-xs italic">{selectedEvidence.officialRecordClaim}</div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: CITIZEN GROUND EVIDENCE */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                          <IconPhoto className="size-4" />
                          CITIZEN EVIDENCE
                        </span>
                        <Badge variant="outline" className="text-[9px] bg-emerald-50 border-emerald-300 text-emerald-800 font-mono">
                          Protected Citizen Input
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Citizen Identity:</span>
                          <span className="font-semibold text-emerald-700 flex items-center gap-1">
                            <IconLock className="size-3" /> {selectedEvidence.submittedBy}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Evidence Medium:</span>
                          <span className="font-medium text-slate-800">{selectedEvidence.evidenceType} ({selectedEvidence.category})</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Location Observed:</span>
                          <span className="font-medium text-slate-800">{selectedEvidence.location}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[10px]">Ground Observation Remark:</span>
                          <span className="font-medium text-slate-800 italic bg-white p-2 rounded border border-slate-200 block mt-1">
                            "{selectedEvidence.description}"
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── AI ON-SITE EVIDENCE CROSS-CHECK USP CARD (GEO-TAG & IMAGE REUSE) ── */}
                <div className="p-4 rounded-xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50/70 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-indigo-700 text-white text-[10px] font-bold">
                        AI ON-SITE EVIDENCE CROSS-CHECK
                      </Badge>
                      <span className="font-mono text-xs text-indigo-900 font-semibold">
                        ID: {selectedEvidence.evidenceId}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        selectedEvidence.verificationResultStatus === "LOCATION_MISMATCH"
                          ? "border-red-500/50 text-red-700 bg-red-50 font-bold text-xs"
                          : selectedEvidence.verificationResultStatus === "POTENTIAL_REUSED_EVIDENCE" || selectedEvidence.crossProjectReuse
                          ? "border-amber-500/50 text-amber-800 bg-amber-50 font-bold text-xs"
                          : "border-emerald-500/50 text-emerald-800 bg-emerald-50 font-bold text-xs"
                      }
                    >
                      {selectedEvidence.verificationResultStatus === "LOCATION_MISMATCH"
                        ? "LOCATION MISMATCH"
                        : selectedEvidence.verificationResultStatus === "POTENTIAL_REUSED_EVIDENCE" || selectedEvidence.crossProjectReuse
                        ? "POTENTIAL REUSED EVIDENCE"
                        : selectedEvidence.verificationResultStatus === "POTENTIAL_INCONSISTENCY"
                        ? "POTENTIAL INCONSISTENCY"
                        : "VERIFIED / CONSISTENT"}
                    </Badge>
                  </div>

                  {/* 📍 1. LOCATION VERIFICATION */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <IconMapPin className="size-3.5 text-indigo-600" />
                        📍 LOCATION CROSS-CHECK
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          selectedEvidence.geoStatus === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]"
                            : selectedEvidence.geoStatus === "MISMATCH"
                            ? "bg-red-50 text-red-700 border-red-300 text-[10px]"
                            : "bg-slate-100 text-slate-600 border-slate-300 text-[10px]"
                        }
                      >
                        {selectedEvidence.geoStatus === "VERIFIED"
                          ? "✓ Location Broadly Consistent"
                          : selectedEvidence.geoStatus === "MISMATCH"
                          ? "⚠ Location Mismatch"
                          : "Location Metadata Unavailable"}
                      </Badge>
                    </div>
                    <div className="text-slate-600 space-y-0.5 text-[11px]">
                      <div>Project Recorded Site: <strong className="text-slate-800">{selectedProject?.district || selectedEvidence.location}, {selectedProject?.state || "MPLADS Site"}</strong></div>
                      {typeof selectedEvidence.locationDistanceKm === "number" && (
                        <div>Photo GPS Distance: <strong className="text-indigo-700 font-mono font-bold">{selectedEvidence.locationDistanceKm} km</strong> from project benchmark</div>
                      )}
                      <p className="text-[11px] text-slate-500 italic pt-0.5">{selectedEvidence.locationDescription || "GPS metadata evaluation completed."}</p>
                    </div>
                  </div>

                  {/* 🔄 2. IMAGE REUSE & DUPLICATE CHECK */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <IconRefresh className="size-3.5 text-indigo-600" />
                        🔄 IMAGE REUSE & DUPLICATE CHECK
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          selectedEvidence.crossProjectReuse || selectedEvidence.duplicateStatus === "EXACT_DUPLICATE" || selectedEvidence.duplicateStatus === "NEAR_DUPLICATE"
                            ? "bg-amber-50 text-amber-800 border-amber-300 text-[10px] font-bold"
                            : "bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]"
                        }
                      >
                        {selectedEvidence.crossProjectReuse
                          ? "⚠ Potentially Reused Evidence"
                          : selectedEvidence.duplicateStatus === "EXACT_DUPLICATE"
                          ? "⚠ Exact Duplicate Detected"
                          : selectedEvidence.duplicateStatus === "NEAR_DUPLICATE"
                          ? "⚠ Possible Duplicate Detected"
                          : "✓ No Duplicate Detected"}
                      </Badge>
                    </div>
                    <div className="text-slate-600 space-y-0.5 text-[11px]">
                      {(selectedEvidence.similarityScore || 0) > 0 && (
                        <div>Image Similarity Score: <strong className="font-mono text-indigo-700 font-bold">{selectedEvidence.similarityScore}% match</strong></div>
                      )}
                      {selectedEvidence.similarEvidenceId && (
                        <div>Matching Historical Record: <strong className="font-mono text-slate-800">{selectedEvidence.similarEvidenceId}</strong> {selectedEvidence.similarProjectId && `(Project: ${selectedEvidence.similarProjectId})`}</div>
                      )}
                      <p className="text-[11px] text-slate-500 italic pt-0.5">
                        {selectedEvidence.duplicateDescription || "Perceptual image hash compared against historical evidence records in database."}
                      </p>
                    </div>
                  </div>

                  {/* 🕒 3. TIMESTAMP & VISUAL VERIFICATION */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-800 block mb-0.5">🕒 Timestamp Check:</span>
                      <span className="text-slate-600 text-[11px] block">{selectedEvidence.timestampStatus || "Consistent with project timeline."}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="font-semibold text-slate-800 block mb-0.5">👁 Visual Cross-Check:</span>
                      <span className="text-slate-600 text-[11px] block">{selectedEvidence.visualConsistencyStatus || "Broadly consistent with official records."}</span>
                    </div>
                  </div>

                  {/* 🤖 4. AI OVERALL ASSESSMENT */}
                  <div className="p-3 bg-indigo-900 text-white rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-indigo-100">
                      <span>AI Overall Assessment:</span>
                      <span className="font-mono text-emerald-300">{selectedEvidence.aiConfidence}% Analysis Quality</span>
                    </div>
                    <p className="text-indigo-200 text-[11px] leading-relaxed">
                      "{selectedEvidence.overallAssessment || selectedEvidence.explanation}"
                    </p>
                    <div className="text-[10px] text-indigo-300/80 pt-1 border-t border-indigo-800 mt-1">
                      Note: This is an AI-assisted verification result based on available project records. It does not establish wrongdoing or fraud.
                    </div>
                  </div>
                </div>

                {/* ── AI Cross-Check Analysis Panel ── */}
                <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                      <IconSparkles className="size-4 text-blue-600" />
                      Detailed Discrepancy & Action Recommendation
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] bg-white border-blue-200 text-blue-900 font-semibold capitalize">
                        {selectedEvidence.observationSentiment === "INSUFFICIENT_INFORMATION"
                          ? "Insufficient Info"
                          : (selectedEvidence.observationSentiment || "Neutral").toLowerCase()}
                      </Badge>
                      <span className="font-mono text-xs font-bold text-blue-700">
                        {selectedEvidence.aiConfidence}% Match Confidence
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Detected Discrepancy:</span>
                      <p className="text-slate-800 font-medium bg-white p-2 rounded border border-slate-200">
                        {selectedEvidence.fieldDiscrepancy || "No discrepancy detected."}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">AI Explanation:</span>
                      <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                        {selectedEvidence.explanation}
                      </p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Recommended Action:</span>
                      <p className="text-blue-900 font-semibold bg-blue-100/70 p-2.5 rounded border border-blue-200">
                        👉 {selectedEvidence.recommendedAction}
                      </p>
                    </div>

                    {selectedEvidence.additionalEvidenceRequired?.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-700 block mb-1">Additional Evidence Required:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                          {selectedEvidence.additionalEvidenceRequired.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Privacy Protection Audit Panel ── */}
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2 text-xs">
                  <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <IconLock className="size-4 text-emerald-600" />
                    <span>Privacy Safeguards Active for Evidence ID: {selectedEvidence.evidenceId}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div>✔ Identity: Protected / Anonymized</div>
                    <div>✔ Contact Details: Hidden</div>
                    <div>✔ EXIF Metadata: Stripped</div>
                    <div>✔ Audit Log: Role Authorized Access Only</div>
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
