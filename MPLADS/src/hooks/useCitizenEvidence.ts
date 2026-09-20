"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { ICitizenEvidence } from "@/types";
import { PROTOTYPE_SEED_EVIDENCE } from "@/data/prototypeEvidenceData";

export function useCitizenEvidence() {
  const [evidenceList, setEvidenceList] = useState<ICitizenEvidence[]>(PROTOTYPE_SEED_EVIDENCE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchEvidence = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch("/api/citizen-evidence");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setEvidenceList(json.data);
          setIsLive(true);
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      console.warn("useCitizenEvidence polling failed, keeping current data:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvidence();
    const interval = setInterval(() => {
      fetchEvidence(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchEvidence]);

  const submitEvidence = async (form: {
    projectId: string;
    category: ICitizenEvidence["category"];
    description: string;
    location: string;
    evidenceType: ICitizenEvidence["evidenceType"];
    photoUrl?: string;
    photoName?: string;
    photoLatitude?: number;
    photoLongitude?: number;
    photoTimestamp?: string;
    capturedAt?: string;
    gpsSource?: "Image EXIF" | "Manual override" | "Unavailable" | string;
    metadataSource?: "EXIF" | "MANUAL" | "NONE" | string;
    duplicateCheck?: any;
    submittedBy?: string;
  }) => {
    try {
      const res = await fetch("/api/citizen-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setEvidenceList((prev) => [json.data, ...prev]);
          setLastUpdated(new Date());
          return json.data as ICitizenEvidence;
        }
      }
    } catch (err) {
      console.error("Failed to submit evidence:", err);
    }
    return null;
  };

  const stats = useMemo(() => {
    return {
      total: evidenceList.length,
      crossChecked: evidenceList.filter((e) => e.aiStatus === "Cross-Checked").length,
      conflictDetected: evidenceList.filter((e) => e.verificationCategory === "CONFLICT_DETECTED").length,
      potentialConflict: evidenceList.filter((e) => e.verificationCategory === "POTENTIAL_CONFLICT").length,
      consistent: evidenceList.filter((e) => e.verificationCategory === "CONSISTENT").length,
      insufficient: evidenceList.filter((e) => e.verificationCategory === "INSUFFICIENT_EVIDENCE").length,
    };
  }, [evidenceList]);

  return {
    evidenceList,
    isLoading,
    isLive,
    lastUpdated,
    stats,
    refresh: () => fetchEvidence(false),
    submitEvidence,
  };
}
