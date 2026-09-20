"use client";

import { useState, useEffect, useCallback } from "react";
import type { Alert } from "@/types";
import { ALERTS as FALLBACK_ALERTS } from "@/data/mpladsData";

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(FALLBACK_ALERTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAlerts = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await fetch("/api/alerts");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setAlerts(json.data);
          setIsLive(true);
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      console.warn("useAlerts polling failed, keeping current data:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => {
      fetchAlerts(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const acknowledgeAlert = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Acknowledged" } : a))
    );

    try {
      await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Acknowledged" }),
      });
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
    }
  };

  const resolveAlert = async (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Resolved" } : a))
    );

    try {
      await fetch(`/api/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Resolved" }),
      });
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  };

  return {
    alerts,
    isLoading,
    isLive,
    lastUpdated,
    refresh: () => fetchAlerts(false),
    acknowledgeAlert,
    resolveAlert,
  };
}
