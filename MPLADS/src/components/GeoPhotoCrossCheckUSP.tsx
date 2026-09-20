"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCitizenEvidence } from "@/hooks/useCitizenEvidence";
import { useProjects } from "@/hooks/useProjects";
import type { ICitizenEvidence, Project, CrossCheckResultStatus, IDuplicateCheckResult } from "@/types";
import { extractExifFromFile } from "@/utils/exifExtractor";
import type { LocationVerificationResult } from "@/lib/locationVerification";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  IconPhoto,
  IconMapPin,
  IconRefresh,
  IconSparkles,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconShieldCheck,
  IconClock,
  IconLock,
  IconInfoCircle,
  IconSearch,
  IconBuildingCommunity,
  IconFilter,
  IconArrowRight,
  IconPlayerPlay,
} from "@tabler/icons-react";

export default function GeoPhotoCrossCheckUSP() {
  const { user } = useAuth();
  const { evidenceList, refresh: refreshEvidence, submitEvidence } = useCitizenEvidence();
  const { projects } = useProjects();

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedEvidence, setSelectedEvidence] = useState<ICitizenEvidence | null>(null);

  // Verification Sandbox Form State
  const [sandboxProjectId, setSandboxProjectId] = useState<string>("");
  const [sandboxDesc, setSandboxDesc] = useState<string>("CC Road construction site inspection at Gram Panchayat Rampur");
  const [sandboxFile, setSandboxFile] = useState<File | null>(null);
  const [sandboxFilePreview, setSandboxFilePreview] = useState<string | null>(null);
  const [sandboxLat, setSandboxLat] = useState<string>("");
  const [sandboxLng, setSandboxLng] = useState<string>("");
  const [sandboxTimestamp, setSandboxTimestamp] = useState<string>("");

  // EXIF & GPS Source Tracking (Phase 1 Real Photo EXIF Metadata)
  const [extractedExifLat, setExtractedExifLat] = useState<number | undefined>(undefined);
  const [extractedExifLng, setExtractedExifLng] = useState<number | undefined>(undefined);
  const [capturedAt, setCapturedAt] = useState<string | null>(null);
  const [metadataLoading, setMetadataLoading] = useState<boolean>(false);
  const [metadataError, setMetadataError] = useState<string>("");
  const [metadataSource, setMetadataSource] = useState<"EXIF" | "MANUAL" | "NONE">("NONE");
  const [gpsSource, setGpsSource] = useState<"Image EXIF" | "Manual override" | "Unavailable">("Unavailable");
  const [isRunningCheck, setIsRunningCheck] = useState<boolean>(false);
  const [sandboxResult, setSandboxResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Request Sequence Reference for Async Race Condition Protection
  const requestSeqRef = useRef<number>(0);

  // Phase 2 Location Verification State
  const [locationCheckResult, setLocationCheckResult] = useState<LocationVerificationResult | null>(null);

  // Phase 3 Duplicate Check State
  const [duplicateCheckResult, setDuplicateCheckResult] = useState<IDuplicateCheckResult | null>(null);

  // Dynamically resolve currently selected project record from actual project list
  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === sandboxProjectId) || null;
  }, [projects, sandboxProjectId]);

  // STEP 17: Dedicated Project Change & Form Reset Handler
  const handleProjectChange = (newProjectId: string) => {
    // 1. Invalidate any in-flight async operations
    const currentSeq = ++requestSeqRef.current;

    // 2. Set new Project ID
    setSandboxProjectId(newProjectId);

    // 3. Update ground remark placeholder for selected project
    const targetProj = projects.find((p) => p.id === newProjectId);
    if (targetProj) {
      setSandboxDesc(`CC Road inspection & ground verification for ${targetProj.name}`);
    } else {
      setSandboxDesc("Ground observation remark...");
    }

    // 4. Clear current photo file & preview
    setSandboxFile(null);
    setSandboxFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // 5. Clear latitude, longitude & EXIF timestamp metadata
    setSandboxLat("");
    setSandboxLng("");
    setExtractedExifLat(undefined);
    setExtractedExifLng(undefined);
    setCapturedAt(null);
    setSandboxTimestamp("");
    setMetadataSource("NONE");
    setGpsSource("Unavailable");
    setMetadataLoading(false);
    setMetadataError("");

    // 6. Clear Phase 2 Location Verification state
    setLocationCheckResult(null);

    // 7. Clear Phase 3 Duplicate Check state
    setDuplicateCheckResult(null);

    // 8. Clear previous execution sandbox result
    setSandboxResult(null);
  };

  // Initialize selected project ID for sandbox ONLY when no project is currently selected
  useEffect(() => {
    if (projects.length > 0 && !sandboxProjectId) {
      handleProjectChange(projects[0].id);
    }
  }, [projects]);

  // Phase 2 Location Verification API call effect with stale request protection
  useEffect(() => {
    if (!sandboxProjectId || (!sandboxLat.trim() && !sandboxLng.trim())) {
      setLocationCheckResult(null);
      return;
    }

    const currentSeq = requestSeqRef.current;
    let isMounted = true;

    const runLocationCheck = async () => {
      try {
        const pLat = sandboxLat.trim() ? parseFloat(sandboxLat.trim()) : null;
        const pLng = sandboxLng.trim() ? parseFloat(sandboxLng.trim()) : null;

        const res = await fetch("/api/evidence/location-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: sandboxProjectId,
            latitude: typeof pLat === "number" && !isNaN(pLat) ? pLat : null,
            longitude: typeof pLng === "number" && !isNaN(pLng) ? pLng : null,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted && currentSeq === requestSeqRef.current) {
            setLocationCheckResult(json.data);
          }
        }
      } catch (err) {
        console.warn("Location check request failed:", err);
      }
    };

    runLocationCheck();
    return () => {
      isMounted = false;
    };
  }, [sandboxProjectId, sandboxLat, sandboxLng]);

  // Phase 3 Duplicate Check API call effect with stale request protection
  useEffect(() => {
    if (!sandboxFile) {
      setDuplicateCheckResult(null);
      return;
    }

    const currentSeq = requestSeqRef.current;
    let isMounted = true;

    const runDuplicateCheck = async () => {
      try {
        const formData = new FormData();
        formData.append("image", sandboxFile);
        if (sandboxProjectId) {
          formData.append("currentProjectId", sandboxProjectId);
        }

        const res = await fetch("/api/evidence/duplicate-check", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted && currentSeq === requestSeqRef.current) {
            setDuplicateCheckResult(json.data);
          }
        }
      } catch (err) {
        console.warn("Duplicate check request failed:", err);
      }
    };

    runDuplicateCheck();
    return () => {
      isMounted = false;
    };
  }, [sandboxFile, sandboxProjectId]);

  // Derived filtered evidence list
  const filteredEvidence = useMemo(() => {
    return evidenceList.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.evidenceId.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);

      let matchStatus = true;
      if (statusFilter === "LOCATION_MISMATCH") {
        matchStatus = item.geoStatus === "MISMATCH" || item.verificationResultStatus === "LOCATION_MISMATCH";
      } else if (statusFilter === "REUSED") {
        matchStatus = Boolean(item.crossProjectReuse || item.duplicateStatus === "EXACT_DUPLICATE" || item.duplicateStatus === "NEAR_DUPLICATE");
      } else if (statusFilter === "VERIFIED") {
        matchStatus = item.verificationResultStatus === "VERIFIED_CONSISTENT" || item.geoStatus === "VERIFIED";
      }

      return matchSearch && matchStatus;
    });
  }, [evidenceList, searchQuery, statusFilter]);

  // Metrics overview
  const metrics = useMemo(() => {
    const total = evidenceList.length;
    const geoVerified = evidenceList.filter((e) => e.geoStatus === "VERIFIED").length;
    const geoMismatch = evidenceList.filter((e) => e.geoStatus === "MISMATCH").length;
    const reusedMatches = evidenceList.filter((e) => e.crossProjectReuse || e.duplicateStatus === "EXACT_DUPLICATE" || e.duplicateStatus === "NEAR_DUPLICATE").length;
    return { total, geoVerified, geoMismatch, reusedMatches };
  }, [evidenceList]);

  // STEP 18: Handle file select & photo change (clears old photo analysis state immediately)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Invalidate any in-flight async operations
    const currentSeq = ++requestSeqRef.current;

    // 2. Immediately clear previous photo results
    setSandboxFile(file);
    setSandboxLat("");
    setSandboxLng("");
    setExtractedExifLat(undefined);
    setExtractedExifLng(undefined);
    setCapturedAt(null);
    setSandboxTimestamp("");
    setMetadataSource("NONE");
    setGpsSource("Unavailable");
    setMetadataLoading(true);
    setMetadataError("");
    setLocationCheckResult(null);
    setDuplicateCheckResult(null);
    setSandboxResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (currentSeq === requestSeqRef.current) {
        setSandboxFilePreview(evt.target?.result as string);
      }
    };
    reader.readAsDataURL(file);

    try {
      // Send to Next.js Server API /api/evidence/metadata
      const exif = await extractExifFromFile(file);

      if (currentSeq !== requestSeqRef.current) return;

      if (exif.hasGps && typeof exif.latitude === "number" && typeof exif.longitude === "number") {
        setSandboxLat(String(exif.latitude));
        setSandboxLng(String(exif.longitude));
        setExtractedExifLat(exif.latitude);
        setExtractedExifLng(exif.longitude);
        setGpsSource("Image EXIF");
        setMetadataSource("EXIF");
      } else {
        setSandboxLat("");
        setSandboxLng("");
        setExtractedExifLat(undefined);
        setExtractedExifLng(undefined);
        setGpsSource("Unavailable");
        setMetadataSource("NONE");
      }

      if (exif.capturedAt) {
        setCapturedAt(exif.capturedAt);
        setSandboxTimestamp(exif.capturedAt);
      } else if (exif.timestamp) {
        setCapturedAt(exif.timestamp);
        setSandboxTimestamp(exif.timestamp);
      } else {
        setCapturedAt(null);
        setSandboxTimestamp("");
      }
    } catch (err: any) {
      if (currentSeq !== requestSeqRef.current) return;
      console.error("EXIF extraction error:", err);
      setMetadataError("Could not parse EXIF metadata from this image.");
    } finally {
      if (currentSeq === requestSeqRef.current) {
        setMetadataLoading(false);
      }
    }
  };

  // Handle Lat/Lng change (Detect manual override)
  const handleLatChange = (val: string) => {
    setSandboxLat(val);
    updateGpsSource(val, sandboxLng);
  };

  const handleLngChange = (val: string) => {
    setSandboxLng(val);
    updateGpsSource(sandboxLat, val);
  };

  const updateGpsSource = (latVal: string, lngVal: string) => {
    const pLat = latVal ? parseFloat(latVal) : undefined;
    const pLng = lngVal ? parseFloat(lngVal) : undefined;

    if (typeof pLat !== "number" || typeof pLng !== "number" || isNaN(pLat) || isNaN(pLng)) {
      setGpsSource("Unavailable");
      setMetadataSource("NONE");
      return;
    }

    if (
      typeof extractedExifLat === "number" &&
      typeof extractedExifLng === "number" &&
      Math.abs(pLat - extractedExifLat) < 0.0001 &&
      Math.abs(pLng - extractedExifLng) < 0.0001
    ) {
      setGpsSource("Image EXIF");
      setMetadataSource("EXIF");
    } else {
      setGpsSource("Manual override");
      setMetadataSource("MANUAL");
    }
  };

  // Run Sandbox Cross-Check
  const handleRunSandboxCheck = async () => {
    if (!sandboxProjectId) return;
    setIsRunningCheck(true);
    setSandboxResult(null);

    const targetProject = projects.find((p) => p.id === sandboxProjectId) || null;
    const parsedLat = sandboxLat.trim() ? parseFloat(sandboxLat.trim()) : undefined;
    const parsedLng = sandboxLng.trim() ? parseFloat(sandboxLng.trim()) : undefined;

    try {
      const created = await submitEvidence({
        projectId: sandboxProjectId,
        category: "Completion Discrepancy",
        description: sandboxDesc,
        location: targetProject ? `${targetProject.district}, ${targetProject.state}` : "Project Site",
        evidenceType: "Photo",
        photoUrl: sandboxFilePreview || undefined,
        photoName: sandboxFile?.name || "onsite_photo.jpg",
        photoLatitude: parsedLat,
        photoLongitude: parsedLng,
        photoTimestamp: sandboxTimestamp || new Date().toISOString().split("T")[0],
        gpsSource,
        duplicateCheck: duplicateCheckResult || undefined,
        submittedBy: user?.name || "Authorized Auditor",
      });

      if (created) {
        setSandboxResult(created);
        setSelectedEvidence(created);
        refreshEvidence();
      }
    } catch (err) {
      console.error("Sandbox cross-check error:", err);
    } finally {
      setIsRunningCheck(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. Page Title & USP Header Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-xl p-6 shadow-xl border border-indigo-500/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className="bg-indigo-600 text-white px-3 py-1 font-bold text-xs tracking-wide">
                <IconPhoto className="w-3.5 h-3.5 mr-1 text-indigo-300" />
                GEO-TAG & IMAGE REUSE USP
              </Badge>
              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 text-xs">
                AI Cross-Check Engine
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-200 border-blue-400/40 text-xs">
                Perceptual Hash & Haversine Distance
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Geo-Tagged Photo & Image Reuse AI</h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-3xl">
              AI cross-checks on-site photographs against recorded project GPS coordinates, historical evidence databases across all projects, and timeline records to detect location mismatches and reused evidence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                if (projects.length > 0) {
                  handleProjectChange(projects[0].id);
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 h-10 shadow-md"
            >
              <IconSparkles className="w-4 h-4 mr-1.5" />
              New Cross-Check Scan
            </Button>
          </div>
        </div>
      </div>

      {/* ── 2. Important Data Honesty & Objective Wording Notice ── */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-blue-900 dark:text-blue-200 text-sm flex items-start gap-3 shadow-sm">
        <IconInfoCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block text-blue-800 dark:text-blue-300">
            Project Record Source — MPLADS SATHI Database & Image Hashing Engine
          </span>
          <p className="text-xs text-blue-800/80 dark:text-blue-300/80 mt-0.5">
            Verification results are analytical estimations using Haversine GPS distance algorithms, SHA-256 file hashing, and 64-bit perceptual image fingerprinting. Flags are labeled as <strong>"Potentially Reused Evidence"</strong> or <strong>"Location Mismatch"</strong> to guide field inspections without making automated fraud assertions.
          </p>
        </div>
      </div>

      {/* ── 3. Metrics Overview Cards Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Photos Cross-Checked</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">{metrics.total}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600">
              <IconPhoto className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Location Verified</span>
              <span className="text-2xl font-bold text-emerald-600 font-mono">{metrics.geoVerified}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <IconMapPin className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Location Mismatch Flags</span>
              <span className="text-2xl font-bold text-red-600 font-mono">{metrics.geoMismatch}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-600">
              <IconAlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Reused / Duplicate Evidence</span>
              <span className="text-2xl font-bold text-amber-600 font-mono">{metrics.reusedMatches}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
              <IconRefresh className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 4. Interactive Photo Upload & Cross-Check Verification Sandbox ── */}
      <Card className="border-2 border-indigo-500/40 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <Badge className="bg-indigo-600 text-white mb-1">INTERACTIVE CROSS-CHECK SANDBOX</Badge>
              <CardTitle className="text-lg text-white">Upload On-Site Photo & Run AI Cross-Check</CardTitle>
              <CardDescription className="text-xs text-indigo-200">
                Select a project, upload an on-site image (EXIF GPS auto-extracted if available), and trigger multi-layered verification against system records.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block mb-1">
                Select Target Project:
              </label>
              <Select value={sandboxProjectId} onValueChange={(val) => handleProjectChange(val || "")}>
                <SelectTrigger className="h-10 text-xs bg-white dark:bg-slate-800">
                  <SelectValue placeholder="Select project..." />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="font-mono text-indigo-600 font-bold mr-2">[{p.id}]</span>
                      <span>{p.name.length > 34 ? p.name.substring(0, 34) + "…" : p.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block mb-1">
                Ground Observation Remark:
              </label>
              <Input
                value={sandboxDesc}
                onChange={(e) => setSandboxDesc(e.target.value)}
                placeholder="Describe ground work condition..."
                className="h-10 text-xs bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* STEP 4, 5, 6, 20 — DYNAMIC TARGET PROJECT DISPLAY BOX */}
          {selectedProject ? (
            <div className="p-3.5 rounded-lg bg-slate-900 text-white border border-indigo-500/30 space-y-1 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-indigo-900/80 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-indigo-600 text-white text-[10px] font-mono tracking-wide">
                    TARGET PROJECT
                  </Badge>
                  <span className="font-mono text-xs font-bold text-indigo-300">
                    [{selectedProject.id}]
                  </span>
                  <Badge variant="outline" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40 text-[10px]">
                    {selectedProject.status}
                  </Badge>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  Sanctioned: ₹{(selectedProject.sanctionedAmount / 100000).toFixed(2)} Lakhs
                </span>
              </div>

              <div className="text-sm font-bold text-white pt-1">
                {selectedProject.name}
              </div>

              <div className="text-xs text-indigo-200 flex flex-wrap gap-4 pt-1">
                <span>Location: <strong className="text-white">{selectedProject.district}, {selectedProject.state}</strong></span>
                {typeof selectedProject.geoLat === "number" && typeof selectedProject.geoLng === "number" && (
                  <span>
                    Registered Project GPS: <strong className="font-mono text-emerald-300">{selectedProject.geoLat.toFixed(4)}, {selectedProject.geoLng.toFixed(4)}</strong>
                  </span>
                )}
                <span>Category: <strong className="text-white">{selectedProject.category}</strong></span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs">
              Please select a project to initialize the cross-check verification form.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Image Selection Box */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                On-Site Evidence Photo:
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-lg p-3 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40 flex flex-col items-center justify-center gap-1 h-24"
              >
                {sandboxFilePreview ? (
                  <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
                    <img src={sandboxFilePreview} alt="Preview" className="w-10 h-10 object-cover rounded border" />
                    <span className="truncate max-w-[120px]">{sandboxFile?.name || "Image Selected"}</span>
                  </div>
                ) : (
                  <>
                    <IconPhoto className="w-5 h-5 text-indigo-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Click to Select Photo</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WEBP up to 5 MB</span>
                  </>
                )}
              </div>
            </div>

            {/* Extracted or Manual Photo GPS Latitude */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block mb-1">
                Photo Latitude (GPS):
              </label>
              <Input
                value={sandboxLat}
                onChange={(e) => handleLatChange(e.target.value)}
                placeholder={metadataLoading ? "Extracting EXIF..." : "Auto-extracted from EXIF or enter manual"}
                className="h-10 text-xs bg-white dark:bg-slate-800"
              />
              <span className="text-[10px] text-slate-400 block">
                {metadataSource === "EXIF"
                  ? "✓ Extracted from image EXIF metadata"
                  : metadataSource === "MANUAL"
                  ? "⚠ Manually entered coordinates (not EXIF)"
                  : "Optional EXIF GPS Latitude"}
              </span>
            </div>

            {/* Extracted or Manual Photo GPS Longitude */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block mb-1">
                Photo Longitude (GPS):
              </label>
              <Input
                value={sandboxLng}
                onChange={(e) => handleLngChange(e.target.value)}
                placeholder={metadataLoading ? "Extracting EXIF..." : "Auto-extracted from EXIF or enter manual"}
                className="h-10 text-xs bg-white dark:bg-slate-800"
              />
              <span className="text-[10px] text-slate-400 block">
                {metadataSource === "EXIF"
                  ? "✓ Extracted from image EXIF metadata"
                  : metadataSource === "MANUAL"
                  ? "⚠ Manually entered coordinates (not EXIF)"
                  : "Optional EXIF GPS Longitude"}
              </span>
            </div>
          </div>

          {/* EXIF Capture Timestamp Display & GPS Metadata Status Banner */}
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <IconClock className="w-4 h-4 text-indigo-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">EXIF Capture Timestamp:</span>
                {capturedAt ? (
                  <span className="font-mono text-indigo-700 dark:text-indigo-300 font-bold">
                    {new Date(capturedAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">EXIF capture timestamp not available.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px] font-medium">Metadata Source:</span>
                {metadataSource === "EXIF" ? (
                  <Badge className="bg-emerald-600 text-white font-semibold text-xs gap-1">
                    <IconCheck className="w-3.5 h-3.5" /> Source: Image EXIF
                  </Badge>
                ) : metadataSource === "MANUAL" ? (
                  <Badge className="bg-amber-600 text-white font-semibold text-xs gap-1">
                    <IconAlertTriangle className="w-3.5 h-3.5" /> Source: Manual override
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-slate-200 text-slate-700 font-semibold text-xs">
                    Source: Unavailable
                  </Badge>
                )}
              </div>
            </div>

            {/* Non-blocking message if GPS unavailable */}
            {!sandboxLat && !sandboxLng && sandboxFile && !metadataLoading && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium pt-1 border-t border-slate-200 dark:border-slate-700">
                ℹ GPS metadata is not available in this photo. You can manually enter site coordinates above if known.
              </p>
            )}
          </div>

          {/* ── PHASE 2 LOCATION VERIFICATION RESULTS CARD ── */}
          {locationCheckResult && (
            <div
              className={`p-4 rounded-xl border-2 space-y-3 transition-all text-xs ${
                locationCheckResult.status === "MATCH"
                  ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500/40"
                  : locationCheckResult.status === "MISMATCH"
                  ? "bg-amber-50/80 dark:bg-amber-950/20 border-amber-500/40"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <IconMapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    LOCATION VERIFICATION
                  </span>
                </div>

                <Badge
                  className={
                    locationCheckResult.status === "MATCH"
                      ? "bg-emerald-600 text-white font-bold text-xs px-3 py-1 gap-1"
                      : locationCheckResult.status === "MISMATCH"
                      ? "bg-amber-600 text-white font-bold text-xs px-3 py-1 gap-1"
                      : "bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-1 gap-1"
                  }
                >
                  {locationCheckResult.status === "MATCH"
                    ? "✓ Location Consistent"
                    : locationCheckResult.status === "MISMATCH"
                    ? "⚠ Location Mismatch"
                    : "○ Verification Unavailable"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold uppercase">Photo GPS:</span>
                  <span className="font-mono font-medium text-xs">
                    {locationCheckResult.photoLocation.latitude !== null &&
                    locationCheckResult.photoLocation.longitude !== null
                      ? `${locationCheckResult.photoLocation.latitude.toFixed(
                          4
                        )}, ${locationCheckResult.photoLocation.longitude.toFixed(4)}`
                      : "Unavailable"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold uppercase">Project GPS:</span>
                  <span className="font-mono font-medium text-xs">
                    {locationCheckResult.projectLocation.latitude !== null &&
                    locationCheckResult.projectLocation.longitude !== null
                      ? `${locationCheckResult.projectLocation.latitude.toFixed(
                          4
                        )}, ${locationCheckResult.projectLocation.longitude.toFixed(4)}`
                      : "Unavailable"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold uppercase">Calculated Distance:</span>
                  <span className="font-mono font-bold text-xs text-indigo-700 dark:text-indigo-300">
                    {locationCheckResult.distanceFormatted || "N/A"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold uppercase">Allowed Radius:</span>
                  <span className="font-mono font-medium text-xs">
                    {locationCheckResult.allowedRadiusMeters} m
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* ── PHASE 3 IMAGE REUSE & DUPLICATE CHECK RESULTS CARD ── */}
          {duplicateCheckResult && (
            <div
              className={`p-4 rounded-xl border-2 space-y-3 transition-all text-xs ${
                duplicateCheckResult.status === "EXACT_DUPLICATE"
                  ? "bg-red-50/80 dark:bg-red-950/20 border-red-500/40"
                  : duplicateCheckResult.status === "LIKELY_REUSED" || duplicateCheckResult.status === "SIMILAR_IMAGE"
                  ? "bg-amber-50/80 dark:bg-amber-950/20 border-amber-500/40"
                  : duplicateCheckResult.status === "NO_MATCH"
                  ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500/40"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                <div className="flex items-center gap-2">
                  <IconRefresh className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    IMAGE REUSE CHECK (SHA-256 & PERCEPTUAL HASH)
                  </span>
                  {duplicateCheckResult.isCrossProject && (
                    <Badge className="bg-amber-600 text-white font-bold text-[10px] px-2 py-0.5">
                      ⚠ Cross-Project Match
                    </Badge>
                  )}
                </div>

                <Badge
                  className={
                    duplicateCheckResult.status === "EXACT_DUPLICATE"
                      ? "bg-red-600 text-white font-bold text-xs px-3 py-1 gap-1"
                      : duplicateCheckResult.status === "LIKELY_REUSED" || duplicateCheckResult.status === "SIMILAR_IMAGE"
                      ? "bg-amber-600 text-white font-bold text-xs px-3 py-1 gap-1"
                      : duplicateCheckResult.status === "NO_MATCH"
                      ? "bg-emerald-600 text-white font-bold text-xs px-3 py-1 gap-1"
                      : "bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-1 gap-1"
                  }
                >
                  {duplicateCheckResult.status === "EXACT_DUPLICATE"
                    ? "⚠ Exact Duplicate Detected"
                    : duplicateCheckResult.status === "LIKELY_REUSED" || duplicateCheckResult.status === "SIMILAR_IMAGE"
                    ? "⚠ Potential Evidence Reuse Detected"
                    : duplicateCheckResult.status === "NO_MATCH"
                    ? "✓ No Previous Match Found"
                    : "○ Image Reuse Verification Unavailable"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-slate-700 dark:text-slate-300">
                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold uppercase">SHA-256 Hash:</span>
                  <span className="font-mono font-medium text-xs truncate block" title={duplicateCheckResult.sha256 || undefined}>
                    {duplicateCheckResult.sha256 ? `${duplicateCheckResult.sha256.substring(0, 12)}…` : "Unavailable"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold uppercase">Perceptual Hash:</span>
                  <span className="font-mono font-medium text-xs truncate block" title={duplicateCheckResult.perceptualHash || undefined}>
                    {duplicateCheckResult.perceptualHash ? `${duplicateCheckResult.perceptualHash.substring(0, 12)}…` : "Unavailable"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold uppercase">Matched Evidence ID:</span>
                  <span className="font-mono font-bold text-xs text-indigo-700 dark:text-indigo-300">
                    {duplicateCheckResult.matchedEvidenceId || "None"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block font-semibold uppercase">Visual Similarity:</span>
                  <span className="font-mono font-bold text-xs text-indigo-700 dark:text-indigo-300">
                    {duplicateCheckResult.similarityPercent ?? duplicateCheckResult.similarityScore ?? 0}% match
                  </span>
                </div>
              </div>

              {duplicateCheckResult.matchedProjectName && (
                <div className="text-[11px] text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 p-2 rounded border border-slate-200 dark:border-slate-700">
                  Matched Historical Project: <strong>{duplicateCheckResult.matchedProjectName}</strong> ({duplicateCheckResult.matchedProjectId})
                </div>
              )}

              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium pt-1 border-t border-slate-200 dark:border-slate-700">
                {duplicateCheckResult.message}
              </p>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleRunSandboxCheck}
              disabled={isRunningCheck || !sandboxProjectId}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-6 h-10"
            >
              {isRunningCheck ? (
                <>
                  <IconRefresh className="w-4 h-4 mr-2 animate-spin" />
                  Running AI Geo & Image Hash Cross-Check…
                </>
              ) : (
                <>
                  <IconPlayerPlay className="w-4 h-4 mr-2" />
                  Execute AI Evidence Cross-Check →
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 5. Evidence Verification List & Search Controls ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <IconShieldCheck className="w-5 h-5 text-indigo-600" />
            Cross-Checked On-Site Evidence Repository ({filteredEvidence.length})
          </h2>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <IconSearch className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, location, description..."
                className="pl-8 text-xs h-9 bg-white dark:bg-slate-800"
              />
            </div>

            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "ALL")}>
              <SelectTrigger className="h-9 text-xs w-36 bg-white dark:bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="VERIFIED">Verified Consistent</SelectItem>
                <SelectItem value="LOCATION_MISMATCH">Location Mismatch</SelectItem>
                <SelectItem value="REUSED">Reused / Duplicate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Evidence Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvidence.map((item) => {
            const isLocationMismatch = item.geoStatus === "MISMATCH" || item.verificationResultStatus === "LOCATION_MISMATCH";
            const isReused = Boolean(item.crossProjectReuse || item.duplicateStatus === "EXACT_DUPLICATE" || item.duplicateStatus === "NEAR_DUPLICATE");
            const hasMultipleFlags = item.verificationResultStatus === "MULTIPLE_FLAGS" || (item.verificationFlags && item.verificationFlags.length > 1);

            return (
              <Card
                key={item.evidenceId}
                onClick={() => setSelectedEvidence(item)}
                className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                  hasMultipleFlags || isLocationMismatch
                    ? "border-l-red-500"
                    : isReused
                    ? "border-l-amber-500"
                    : "border-l-emerald-500"
                }`}
              >
                <CardHeader className="pb-2 bg-slate-50/50 dark:bg-slate-900/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {item.evidenceId}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        hasMultipleFlags || isLocationMismatch
                          ? "bg-red-50 text-red-700 border-red-300 text-[10px] font-bold"
                          : isReused
                          ? "bg-amber-50 text-amber-800 border-amber-300 text-[10px] font-bold"
                          : "bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]"
                      }
                    >
                      {hasMultipleFlags
                        ? "⚠ Multiple Flags"
                        : isLocationMismatch
                        ? "Location Mismatch"
                        : isReused
                        ? "Potentially Reused"
                        : "Verified Consistent"}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm line-clamp-1">{item.projectName}</CardTitle>
                  <CardDescription className="text-[11px]">
                    Project: <span className="font-mono text-indigo-600 font-bold">{item.projectId}</span> · {item.evidenceDate}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-3 space-y-2 text-xs">
                  <p className="text-slate-700 dark:text-slate-300 line-clamp-2 italic bg-slate-100 dark:bg-slate-800/80 p-2 rounded">
                    "{item.description}"
                  </p>

                  <div className="space-y-1 text-[11px] pt-1">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <IconMapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{item.locationDescription || `Location: ${item.location}`}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <IconRefresh className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{item.duplicateDescription || "No image duplicate detected."}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Confidence: <strong className="text-indigo-600">{item.aiConfidence}%</strong></span>
                  <Button variant="ghost" size="sm" className="text-xs text-indigo-600 p-0 h-auto font-semibold">
                    Inspect Verification Dossier →
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── 6. Full Cross-Check Inspector Dossier Modal ── */}
      {selectedEvidence && (
        <Card className="border-2 border-indigo-600 shadow-2xl bg-white dark:bg-slate-900">
          <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <Badge className="bg-indigo-600 text-white mb-1 font-mono">
                  VERIFICATION DOSSIER: {selectedEvidence.evidenceId}
                </Badge>
                <CardTitle className="text-xl text-white">{selectedEvidence.projectName}</CardTitle>
                <CardDescription className="text-xs text-indigo-200">
                  Detailed AI Geo-Location, Image Reuse & Multi-Layer Verification Assessment
                </CardDescription>
              </div>

              <Button variant="ghost" size="sm" onClick={() => setSelectedEvidence(null)} className="text-white hover:bg-slate-800">
                <IconX className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* ── AI ON-SITE EVIDENCE CROSS-CHECK CARD ── */}
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
                    selectedEvidence.verificationResultStatus === "MULTIPLE_FLAGS"
                      ? "border-red-500/50 text-red-700 bg-red-50 font-bold text-xs"
                      : selectedEvidence.verificationResultStatus === "LOCATION_MISMATCH"
                      ? "border-red-500/50 text-red-700 bg-red-50 font-bold text-xs"
                      : selectedEvidence.verificationResultStatus === "POTENTIAL_REUSED_EVIDENCE" || selectedEvidence.crossProjectReuse
                      ? "border-amber-500/50 text-amber-800 bg-amber-50 font-bold text-xs"
                      : "border-emerald-500/50 text-emerald-800 bg-emerald-50 font-bold text-xs"
                  }
                >
                  {selectedEvidence.verificationResultStatus === "MULTIPLE_FLAGS"
                    ? "MULTIPLE VERIFICATION FLAGS"
                    : selectedEvidence.verificationResultStatus === "LOCATION_MISMATCH"
                    ? "LOCATION MISMATCH"
                    : selectedEvidence.verificationResultStatus === "POTENTIAL_REUSED_EVIDENCE" || selectedEvidence.crossProjectReuse
                    ? "POTENTIAL REUSED EVIDENCE"
                    : "VERIFIED / CONSISTENT"}
                </Badge>
              </div>

              {/* MULTIPLE / SINGLE FLAGS DISPLAY */}
              {selectedEvidence.verificationFlags && selectedEvidence.verificationFlags.length > 0 ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs space-y-1.5">
                  <div className="font-bold text-red-800 flex items-center gap-1.5">
                    <IconAlertTriangle className="w-4 h-4 text-red-600" />
                    <span>⚠ {selectedEvidence.verificationFlags.length > 1 ? "MULTIPLE VERIFICATION FLAGS DETECTED" : "VERIFICATION WARNING"}</span>
                  </div>
                  <ul className="list-disc list-inside text-red-700 text-[11px] space-y-1 font-medium pl-1">
                    {selectedEvidence.verificationFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-red-800 font-bold pt-1.5 border-t border-red-200 mt-1">
                    Recommended Action: Additional field verification recommended.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <IconCheck className="w-4 h-4 text-emerald-600" />
                    <span>✓ EVIDENCE BROADLY CONSISTENT</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    All verification layers (location, image reuse, timeline, visual condition, project record status, ground observation) are consistent with available project records.
                  </p>
                </div>
              )}

              {/* 📍 1. LOCATION VERIFICATION */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <IconMapPin className="size-3.5 text-indigo-600" />
                    📍 LOCATION CROSS-CHECK (HAVERSINE DISTANCE)
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
                      ? "✓ Location Consistent"
                      : selectedEvidence.geoStatus === "MISMATCH"
                      ? "⚠ Location Mismatch"
                      : "GPS Metadata Unavailable"}
                  </Badge>
                </div>
                <div className="text-slate-600 space-y-0.5 text-[11px] pt-1">
                  <div>Project Site Benchmark: <strong className="text-slate-800">{selectedEvidence.location}</strong></div>
                  <div>GPS Data Source: <strong className="text-indigo-700 font-semibold">{selectedEvidence.gpsSource || "Unavailable"}</strong></div>
                  {typeof selectedEvidence.locationDistanceKm === "number" && (
                    <div>Photo GPS Distance: <strong className="text-indigo-700 font-mono font-bold">{selectedEvidence.locationDistanceKm} km</strong> from project benchmark</div>
                  )}
                  <p className="text-[11px] text-slate-500 italic pt-0.5">{selectedEvidence.locationDescription || "GPS metadata evaluation completed."}</p>
                </div>
              </div>

              {/* 🔄 2. IMAGE REUSE & DUPLICATE CHECK */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <IconRefresh className="size-3.5 text-indigo-600" />
                    🔄 IMAGE REUSE & PERCEPTUAL HASH CHECK
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
                <div className="text-slate-600 space-y-0.5 text-[11px] pt-1">
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
                  <span className="text-slate-600 text-[11px] block">{selectedEvidence.timestampStatus || "Timestamp metadata unavailable."}</span>
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
                  <span className="font-mono text-emerald-300">{selectedEvidence.aiConfidence}% Analysis Confidence</span>
                </div>
                <p className="text-indigo-200 text-[11px] leading-relaxed whitespace-pre-line">
                  {selectedEvidence.overallAssessment || selectedEvidence.explanation}
                </p>
                <div className="text-[10px] text-indigo-300/80 pt-1 border-t border-indigo-800 mt-1">
                  Note: This is an AI-assisted analytical cross-check based on available project records. It does not establish wrongdoing or fraud.
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-4 border-t flex justify-end">
            <Button size="sm" onClick={() => setSelectedEvidence(null)} className="text-xs bg-slate-900 text-white">
              Close Dossier
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
