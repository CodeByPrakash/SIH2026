"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project } from "@/types";
import { PROJECTS as FALLBACK_PROJECTS } from "@/data/mpladsData";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchProjects = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setProjects(json.data);
          setIsLive(true);
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      console.warn("useProjects polling failed, keeping current data:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(() => {
      fetchProjects(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchProjects]);

  const updateProjectStatus = async (id: string, status: Project["status"]) => {
    // Optimistic UI update
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchProjects(true);
      }
    } catch (err) {
      console.error("Failed to update project status:", err);
    }
  };

  return {
    projects,
    isLoading,
    isLive,
    lastUpdated,
    refresh: () => fetchProjects(false),
    updateProjectStatus,
  };
}
