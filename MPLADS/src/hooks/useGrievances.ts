"use client";

import { useState, useEffect, useCallback } from "react";

export interface GrievanceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  district: string;
  state?: string;
  status: "Open" | "Under Review" | "Resolved";
  name: string;
  mobile: string;
  projectId?: string;
  date: string;
}

const FALLBACK_GRIEVANCES: GrievanceItem[] = [
  { id: "GRV-2024-001", title: "Road construction stopped mid-way, Lucknow", description: "Work halted for 3 weeks without notice.", status: "Under Review", date: "2024-08-10", category: "Project Stall", district: "Lucknow", name: "Ramesh Kumar", mobile: "+91 9876543210" },
  { id: "GRV-2024-002", title: "Borewell not functional after completion", description: "Water pump failed after 5 days.", status: "Resolved", date: "2024-07-22", category: "Quality Issue", district: "Shivpuri", name: "Priya Sharma", mobile: "+91 9812345678" },
  { id: "GRV-2024-003", title: "No visibility of sanctioned funds usage", description: "No signboard at site.", status: "Open", date: "2024-08-20", category: "Transparency", district: "Barmer", name: "Amit Patel", mobile: "+91 9988776655" },
];

export function useGrievances() {
  const [grievances, setGrievances] = useState<GrievanceItem[]>(FALLBACK_GRIEVANCES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchGrievances = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch("/api/grievances");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setGrievances(json.data);
          setIsLive(true);
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      console.warn("useGrievances polling failed, keeping current data:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrievances();
    const interval = setInterval(() => {
      fetchGrievances(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchGrievances]);

  const submitGrievance = async (form: {
    name: string;
    mobile: string;
    district: string;
    category: string;
    desc: string;
    projectId?: string;
  }) => {
    try {
      const res = await fetch("/api/grievances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setGrievances((prev) => [json.data, ...prev]);
          setLastUpdated(new Date());
          return json.data as GrievanceItem;
        }
      }
    } catch (err) {
      console.error("Failed to submit grievance:", err);
    }
    return null;
  };

  return {
    grievances,
    isLoading,
    isLive,
    lastUpdated,
    refresh: () => fetchGrievances(false),
    submitGrievance,
  };
}
