"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Project } from "@/types";
import { PROJECTS as FALLBACK_PROJECTS } from "@/data/mpladsData";

export interface UseProjectsOptions {
  district?: string;
  state?: string;
  constituency?: string;
  status?: string;
  limit?: number;
}

// Global Module-level SWR Cache to share across all components without network thrashing
interface CacheEntry {
  data: Project[];
  timestamp: number;
}
const clientCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<Project[]>>();
const CLIENT_CACHE_TTL_MS = 30 * 1000; // 30 seconds

function buildKey(options?: UseProjectsOptions): string {
  return [
    options?.district?.trim().toLowerCase() || "",
    options?.state?.trim().toLowerCase() || "",
    options?.constituency?.trim().toLowerCase() || "",
    options?.status || "",
    options?.limit || "",
  ].join("|");
}

export function useProjects(options?: UseProjectsOptions) {
  const cacheKey = buildKey(options);

  // Initialize with client-side cache if available for 0ms initial render
  const cachedEntry = clientCache.get(cacheKey);
  const isCacheFresh = cachedEntry && Date.now() - cachedEntry.timestamp < CLIENT_CACHE_TTL_MS;

  const [projects, setProjects] = useState<Project[]>(
    isCacheFresh && cachedEntry ? cachedEntry.data : FALLBACK_PROJECTS
  );
  const [isLoading, setIsLoading] = useState<boolean>(!isCacheFresh);
  const [isLive, setIsLive] = useState<boolean>(Boolean(cachedEntry));
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    cachedEntry ? new Date(cachedEntry.timestamp) : null
  );

  const district = options?.district;
  const state = options?.state;
  const constituency = options?.constituency;
  const status = options?.status;
  const limit = options?.limit;

  const fetchProjects = useCallback(
    async (silent = false, force = false): Promise<Project[]> => {
      const currentKey = [
        district?.trim().toLowerCase() || "",
        state?.trim().toLowerCase() || "",
        constituency?.trim().toLowerCase() || "",
        status || "",
        limit || "",
      ].join("|");

      // Check client cache if not forced
      if (!force && clientCache.has(currentKey)) {
        const entry = clientCache.get(currentKey)!;
        if (Date.now() - entry.timestamp < CLIENT_CACHE_TTL_MS) {
          setProjects(entry.data);
          setIsLive(true);
          setLastUpdated(new Date(entry.timestamp));
          if (!silent) setIsLoading(false);
          return entry.data;
        }
      }

      // In-flight deduplication: return existing promise if already requesting same params
      if (!force && inFlightRequests.has(currentKey)) {
        try {
          const data = await inFlightRequests.get(currentKey)!;
          setProjects(data);
          setIsLive(true);
          setLastUpdated(new Date());
          if (!silent) setIsLoading(false);
          return data;
        } catch {
          // fallback to fetching directly
        }
      }

      if (!silent) setIsLoading(true);

      const requestPromise = (async () => {
        const params = new URLSearchParams();
        if (district) params.set("district", district);
        if (state) params.set("state", state);
        if (constituency) params.set("constituency", constituency);
        if (status) params.set("status", status);
        if (limit) params.set("limit", String(limit));
        if (force) params.set("force", "true");

        const url = params.toString() ? `/api/projects?${params.toString()}` : "/api/projects";
        const res = await fetch(url, {
          cache: force ? "no-store" : "default",
        });

        if (!res.ok) {
          throw new Error(`API responded with ${res.status}`);
        }

        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          clientCache.set(currentKey, {
            data: json.data,
            timestamp: Date.now(),
          });
          return json.data as Project[];
        }
        return projects;
      })();

      inFlightRequests.set(currentKey, requestPromise);

      try {
        const result = await requestPromise;
        setProjects(result);
        setIsLive(true);
        setLastUpdated(new Date());
        return result;
      } catch (err) {
        console.warn("useProjects request failed, retaining current data:", err);
        return projects;
      } finally {
        inFlightRequests.delete(currentKey);
        if (!silent) setIsLoading(false);
      }
    },
    [district, state, constituency, status, limit, projects]
  );

  const fetchRef = useRef(fetchProjects);
  fetchRef.current = fetchProjects;

  useEffect(() => {
    fetchRef.current(false, false);

    // Smart visibility-aware polling: Only poll when user is viewing the page
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return; // Pause polling when tab is backgrounded
      }
      fetchRef.current(true, false);
    }, 30000); // Poll every 30s instead of 15s to halve requests

    return () => clearInterval(interval);
  }, [cacheKey]);

  const updateProjectStatus = async (id: string, newStatus: Project["status"]) => {
    // Optimistic UI update
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // Invalidate current cache key and refresh
        clientCache.delete(cacheKey);
        fetchProjects(true, true);
      }
    } catch (err) {
      console.error("Failed to update project status:", err);
    }
  };

  const syncNow = useCallback(
    async (force = true) => {
      if (force) {
        clientCache.delete(cacheKey);
      }
      return fetchProjects(false, force);
    },
    [cacheKey, fetchProjects]
  );

  return {
    projects,
    isLoading,
    isLive,
    lastUpdated,
    refresh: () => syncNow(false),
    syncNow,
    updateProjectStatus,
  };
}
