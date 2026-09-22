"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { STATES_DATA, PROJECTS } from "../data/mpladsData";
import type { StateData, User } from "../types";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  IconTarget,
  IconCoin,
  IconCheck,
  IconAlertTriangle,
  IconZoomIn,
  IconZoomOut,
  IconRefresh,
  IconMapPin,
  IconReceipt2,
  IconX,
  IconFlame,
  IconLayersLinked,
} from "@tabler/icons-react";

// State code mappings for SimpleMaps
export const STATE_CODE_TO_NAME: Record<string, string> = {
  INAN: "Andaman and Nicobar",
  INAP: "Andhra Pradesh",
  INAR: "Arunachal Pradesh",
  INAS: "Assam",
  INBR: "Bihar",
  INCH: "Chandigarh",
  INCT: "Chhattisgarh",
  INDH: "Dadra and Nagar Haveli and Daman and Diu",
  INDL: "Delhi",
  INGA: "Goa",
  INGJ: "Gujarat",
  INHP: "Himachal Pradesh",
  INHR: "Haryana",
  INJH: "Jharkhand",
  INJK: "Jammu and Kashmir",
  INKA: "Karnataka",
  INKL: "Kerala",
  INLA: "Ladakh",
  INLD: "Lakshadweep",
  INMH: "Maharashtra",
  INML: "Meghalaya",
  INMN: "Manipur",
  INMP: "Madhya Pradesh",
  INMZ: "Mizoram",
  INNL: "Nagaland",
  INOR: "Odisha",
  INPB: "Punjab",
  INPY: "Puducherry",
  INRJ: "Rajasthan",
  INSK: "Sikkim",
  INTG: "Telangana",
  INTN: "Tamil Nadu",
  INTR: "Tripura",
  INUP: "Uttar Pradesh",
  INUT: "Uttarakhand",
  INWB: "West Bengal",
};

interface SimpleMapsStateSpecific {
  name: string;
  color?: string;
  hover_color?: string;
  description?: string;
  zoomable?: string;
}

interface SimpleMapsCountryMapData {
  main_settings: Record<string, any>;
  state_specific: Record<string, SimpleMapsStateSpecific>;
}

const STATE_NAME_TO_CODE: Record<string, string> = Object.entries(
  STATE_CODE_TO_NAME
).reduce((acc, [code, name]) => {
  acc[name.toLowerCase()] = code;
  return acc;
}, {} as Record<string, string>);

const stateByName = new Map(STATES_DATA.map((s) => [s.state.toLowerCase(), s]));

// Risk clusters
const CLUSTERS = [
  {
    name: "Shivpuri Cluster",
    state: "Madhya Pradesh",
    stateCode: "INMP",
    lat: "25.42",
    lng: "77.66",
    severity: "medium",
    desc: "3 overlapping borewells",
    color: "#F59E0B",
  },
  {
    name: "Jaipur Anomaly",
    state: "Rajasthan",
    stateCode: "INRJ",
    lat: "26.91",
    lng: "75.79",
    severity: "critical",
    desc: "Contractor risk +20% overrun",
    color: "#DC2626",
  },
  {
    name: "Sundarbans Delay",
    state: "West Bengal",
    stateCode: "INWB",
    lat: "21.83",
    lng: "88.53",
    severity: "high",
    desc: "Flood shelter 180+ days late",
    color: "#F97316",
  },
];

// Color scales
function riskColor(ratio: number): { color: string; hover: string } {
  if (ratio >= 0.09) return { color: "#991B1B", hover: "#7F1D1D" };
  if (ratio >= 0.07) return { color: "#DC2626", hover: "#B91C1C" };
  if (ratio >= 0.05) return { color: "#F97316", hover: "#EA580C" };
  if (ratio >= 0.03) return { color: "#F59E0B", hover: "#D97706" };
  if (ratio >= 0.01) return { color: "#84CC16", hover: "#65A30D" };
  return { color: "#16A34A", hover: "#15803D" };
}

function utilizationColor(pct: number): { color: string; hover: string } {
  if (pct >= 90) return { color: "#14532D", hover: "#052E16" };
  if (pct >= 82) return { color: "#16A34A", hover: "#15803D" };
  if (pct >= 74) return { color: "#84CC16", hover: "#65A30D" };
  if (pct >= 64) return { color: "#F59E0B", hover: "#D97706" };
  if (pct >= 54) return { color: "#F97316", hover: "#EA580C" };
  return { color: "#DC2626", hover: "#B91C1C" };
}

function completionColor(pct: number): { color: string; hover: string } {
  if (pct >= 80) return { color: "#1D4ED8", hover: "#1E40AF" };
  if (pct >= 70) return { color: "#3B82F6", hover: "#2563EB" };
  if (pct >= 60) return { color: "#60A5FA", hover: "#3B82F6" };
  if (pct >= 50) return { color: "#93C5FD", hover: "#60A5FA" };
  return { color: "#CBD5E1", hover: "#94A3B8" };
}

const LAYERS = [
  {
    id: "risk",
    label: "Risk Ratio",
    icon: IconTarget,
    colorFn: (s: StateData) => riskColor(s.riskProjects / s.totalProjects),
    valueFn: (s: StateData) =>
      `${((s.riskProjects / s.totalProjects) * 100).toFixed(1)}% risk`,
    legend: [
      { color: "#991B1B", label: ">9% (Extreme)" },
      { color: "#DC2626", label: "7–9% (Critical)" },
      { color: "#F97316", label: "5–7% (High)" },
      { color: "#F59E0B", label: "3–5% (Medium)" },
      { color: "#84CC16", label: "1–3% (Low)" },
      { color: "#16A34A", label: "<1% (Minimal)" },
    ],
  },
  {
    id: "utilization",
    label: "Fund Utilization",
    icon: IconCoin,
    colorFn: (s: StateData) => utilizationColor(s.utilization),
    valueFn: (s: StateData) => `${s.utilization}% utilized`,
    legend: [
      { color: "#14532D", label: "≥90% (Optimal)" },
      { color: "#16A34A", label: "82–90% (Good)" },
      { color: "#84CC16", label: "74–82% (Moderate)" },
      { color: "#F59E0B", label: "64–74% (Caution)" },
      { color: "#F97316", label: "54–64% (Lagging)" },
      { color: "#DC2626", label: "<54% (Critical)" },
    ],
  },
  {
    id: "completion",
    label: "Completion Rate",
    icon: IconCheck,
    colorFn: (s: StateData) =>
      completionColor((s.completedProjects / s.totalProjects) * 100),
    valueFn: (s: StateData) =>
      `${Math.round((s.completedProjects / s.totalProjects) * 100)}% done`,
    legend: [
      { color: "#1D4ED8", label: "≥80% (High)" },
      { color: "#3B82F6", label: "70–80%" },
      { color: "#60A5FA", label: "60–70%" },
      { color: "#93C5FD", label: "50–60%" },
      { color: "#CBD5E1", label: "<50% (Slow)" },
    ],
  },
];

declare global {
  interface Window {
    simplemaps_countrymap_mapdata?: any;
    simplemaps_countrymap?: any;
  }
}

interface GISViewProps {
  user?: User;
}

export default function GISView({ user }: GISViewProps = {}) {
  const [layerIdx, setLayerIdx] = useState(0);
  const [selectedState, setSelectedState] = useState<string | null>(
    user?.state || null
  );
  const [showClusters, setShowClusters] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapBoxRef = useRef<HTMLDivElement>(null);

  const activeLayer = LAYERS[layerIdx];

  // Selected state data
  const selectedStateData = useMemo(() => {
    const targetState = selectedState || (user?.role === "State" ? user.state : null);
    if (!targetState) return null;
    return stateByName.get(targetState.toLowerCase()) || null;
  }, [selectedState, user]);

  // Projects in selected state / district
  const stateProjects = useMemo(() => {
    let list = PROJECTS;
    if (user?.role === "District" && user.district) {
      return list.filter((p) => p.district.toLowerCase() === user.district!.toLowerCase());
    }
    if (user?.role === "MP") {
      return list.filter(
        (p) =>
          (user.constituency && p.constituency?.toLowerCase() === user.constituency.toLowerCase()) ||
          (user.district && p.district.toLowerCase() === user.district.toLowerCase())
      );
    }
    const targetState = selectedState || (user?.role === "State" ? user.state : null);
    if (!targetState) return [];
    return list.filter((p) => p.state.toLowerCase() === targetState.toLowerCase());
  }, [selectedState, user]);

  // Ranked states for sidebar leaderboard
  const rankedStates = useMemo(() => {
    return [...STATES_DATA].sort((a, b) => {
      if (activeLayer.id === "risk")
        return (
          b.riskProjects / b.totalProjects - a.riskProjects / a.totalProjects
        );
      if (activeLayer.id === "utilization") return b.utilization - a.utilization;
      return (
        b.completedProjects / b.totalProjects -
        a.completedProjects / a.totalProjects
      );
    });
  }, [activeLayer]);

  // Synchronize SimpleMaps mapdata configuration with active layer and states data
  const updateMapData = useCallback(() => {
    if (typeof window === "undefined" || !window.simplemaps_countrymap_mapdata)
      return;

    const mapdata = window.simplemaps_countrymap_mapdata;

    mapdata.main_settings = {
      ...mapdata.main_settings,
      width: "responsive",
      background_transparent: "yes",
      border_color: "#ffffff",
      border_size: 1.2,
      label_color: "#ffffff",
      label_hover_color: "#ffffff",
      label_size: 11,
      hide_labels: "no",
      all_states_zoomable: "no",
      zoom: "yes",
      manual_zoom: "no",
      div: "map",
      auto_load: "no",
    };

    // Populate state colors and rich HTML tooltip descriptions
    Object.keys(STATE_CODE_TO_NAME).forEach((code) => {
      const stateName = STATE_CODE_TO_NAME[code];
      const sd = stateByName.get(stateName.toLowerCase());

      if (!mapdata.state_specific) mapdata.state_specific = {};
      if (!mapdata.state_specific[code]) {
        mapdata.state_specific[code] = { name: stateName };
      }

      if (sd) {
        const { color, hover } = activeLayer.colorFn(sd);
        const completionPct = Math.round(
          (sd.completedProjects / sd.totalProjects) * 100
        );
        const riskPct = (
          (sd.riskProjects / sd.totalProjects) *
          100
        ).toFixed(1);

        mapdata.state_specific[code].color = color;
        mapdata.state_specific[code].hover_color = hover;
        mapdata.state_specific[code].description = `
          <div style="font-family: inherit; line-height: 1.4; padding: 3px 6px; min-width: 180px;">
            <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px; color: #0F172A;">${sd.state}</div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
              <span style="color: #64748B;">Total Works:</span>
              <strong style="color: #0F172A;">${sd.totalProjects}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
              <span style="color: #64748B;">Completed:</span>
              <strong style="color: #16A34A;">${sd.completedProjects} (${completionPct}%)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
              <span style="color: #64748B;">Fund Utilization:</span>
              <strong style="color: #2563EB;">${sd.utilization}%</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
              <span style="color: #64748B;">Delayed Works:</span>
              <strong style="color: #DC2626;">${sd.delayedProjects}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span style="color: #64748B;">Risk Ratio:</span>
              <strong style="color: #EA580C;">${riskPct}% (${sd.riskProjects} flagged)</strong>
            </div>
            <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #E2E8F0; font-size: 10px; color: #3B82F6; text-align: center;">
              Click state to inspect details
            </div>
          </div>
        `;
      } else {
        mapdata.state_specific[code].color = "#CBD5E1";
        mapdata.state_specific[code].hover_color = "#94A3B8";
        mapdata.state_specific[code].description = `<strong>${stateName}</strong><br/><span style="color: #64748B;">NIDHI-RAKSHAK Data Syncing</span>`;
      }
    });

    // Populate Cluster Locations
    mapdata.locations = {};
    if (showClusters) {
      CLUSTERS.forEach((c, idx) => {
        mapdata.locations[String(idx)] = {
          name: c.name,
          lat: c.lat,
          lng: c.lng,
          color: c.color,
          size: 16,
          type: "circle",
          description: `
            <div style="font-family: inherit; padding: 2px 4px;">
              <div style="font-weight: 700; color: ${c.color}; font-size: 12px; margin-bottom: 2px;">${c.name}</div>
              <div style="font-size: 11px; color: #0F172A; margin-bottom: 2px;">${c.state}</div>
              <div style="font-size: 10px; color: #64748B;">${c.desc}</div>
            </div>
          `,
        };
      });
    }

    if (window.simplemaps_countrymap && window.simplemaps_countrymap.loaded) {
      window.simplemaps_countrymap.refresh();
    }
  }, [activeLayer, showClusters]);

  // Load official SimpleMaps scripts on client
  useEffect(() => {
    let isSubscribed = true;

    const loadScripts = async () => {
      const mapdataScriptId = "simplemaps-mapdata-script";
      const countrymapScriptId = "simplemaps-countrymap-script";

      const loadScript = (id: string, src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
          const existing = document.getElementById(id);
          if (existing) {
            existing.remove();
          }
          const s = document.createElement("script");
          s.id = id;
          s.src = `${src}?v=${Date.now()}`;
          s.async = false;
          s.onload = () => resolve();
          s.onerror = (e) => reject(e);
          document.body.appendChild(s);
        });
      };

      try {
        await loadScript(mapdataScriptId, "/map/mapdata.js");
        await loadScript(countrymapScriptId, "/map/countrymap.js");

        if (!isSubscribed) return;

        // Configure click hook
        if (window.simplemaps_countrymap) {
          window.simplemaps_countrymap.hooks =
            window.simplemaps_countrymap.hooks || {};
          window.simplemaps_countrymap.hooks.click_state = (id: string) => {
            const stateName = STATE_CODE_TO_NAME[id];
            if (stateName) {
              setSelectedState((curr) =>
                curr === stateName ? null : stateName
              );
            }
          };
        }

        updateMapData();

        // Initialize / Load map into container
        if (
          window.simplemaps_countrymap &&
          typeof window.simplemaps_countrymap.load === "function"
        ) {
          window.simplemaps_countrymap.load();
        }

        setMapLoaded(true);
      } catch (err) {
        console.error("Failed to load map scripts:", err);
      }
    };

    loadScripts();

    return () => {
      isSubscribed = false;
    };
  }, [updateMapData]);

  // Update map colors on layer or clusters change
  useEffect(() => {
    if (mapLoaded) {
      updateMapData();
    }
  }, [layerIdx, showClusters, mapLoaded, updateMapData]);

  const handleZoomIn = () => {
    if (window.simplemaps_countrymap?.zoom_in) {
      window.simplemaps_countrymap.zoom_in();
    }
  };

  const handleZoomOut = () => {
    if (window.simplemaps_countrymap?.zoom_out) {
      window.simplemaps_countrymap.zoom_out();
    }
  };

  const handleResetZoom = () => {
    if (window.simplemaps_countrymap?.back) {
      window.simplemaps_countrymap.back();
    }
    setSelectedState(null);
  };

  const selectStateFromList = (stateName: string) => {
    setSelectedState((curr) => (curr === stateName ? null : stateName));
    const code = STATE_NAME_TO_CODE[stateName.toLowerCase()];
    if (code && window.simplemaps_countrymap?.state_zoom) {
      window.simplemaps_countrymap.state_zoom(code);
    }
  };

  // Attach mouse wheel scroll zoom on the map container
  useEffect(() => {
    const container = mapBoxRef.current || mapContainerRef.current;
    if (!container) return;

    let lastZoomTime = 0;
    const ZOOM_COOLDOWN = 100; // ms between zoom steps

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const now = Date.now();
      if (now - lastZoomTime < ZOOM_COOLDOWN) return;
      lastZoomTime = now;

      if (!window.simplemaps_countrymap) return;

      if (e.deltaY < 0) {
        // Scrolling up -> zoom in
        if (typeof window.simplemaps_countrymap.zoom_in === "function") {
          window.simplemaps_countrymap.zoom_in();
        }
      } else if (e.deltaY > 0) {
        // Scrolling down -> zoom out
        if (typeof window.simplemaps_countrymap.zoom_out === "function") {
          window.simplemaps_countrymap.zoom_out();
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [mapLoaded]);

  return (
    <div className="flex-1 space-y-5 p-4 md:p-6">
      <style jsx global>{`
        #map_container_box #map {
          position: relative;
          width: 100%;
          max-width: 580px;
          height: 560px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #map_container_box #map svg {
          width: 100% !important;
          height: 100% !important;
          max-height: 560px !important;
          margin: 0 auto !important;
          display: block !important;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.05));
        }
        #map_container_box #map path {
          transition: fill 0.15s ease, opacity 0.15s ease;
          cursor: pointer;
        }
        #map_container_box #map path:hover {
          filter: brightness(1.08);
        }
        #map_container_box .sm_nav,
        #map_container_box [id^="map_inner_nav"],
        #map_container_box #map_access,
        #map_container_box #map_outer,
        #map_container_box #map_zoom,
        #map_container_box #map_legend,
        #map_container_box select,
        #map_container_box a,
        #map_container_box text[fill="#999"],
        [id$="_access"],
        [id$="_outer"],
        [id$="_zoom"],
        [id$="_legend"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        div[id^="tt_sm_"] {
          background: #ffffff !important;
          color: #0f172a !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
          border-radius: 12px !important;
          padding: 8px 10px !important;
          font-family: inherit !important;
          font-size: 12px !important;
          pointer-events: none !important;
          z-index: 9999 !important;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl flex items-center gap-2">
            <IconLayersLinked className="size-6 text-primary" />
            GIS Monitoring — India
          </h1>
          <p className="text-xs text-muted-foreground md:text-sm">
            All 36 States & UTs · Official vector choropleth map · Click any state to drill down
          </p>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="flex items-center gap-1.5 bg-card border rounded-lg p-1 shadow-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            title="Zoom In"
          >
            <IconZoomIn className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            title="Zoom Out"
          >
            <IconZoomOut className="size-4" />
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <IconRefresh className="size-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* ── Main Layout Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Left Map Canvas Column (8 of 12 cols on desktop) ── */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <Card className="overflow-hidden shadow-xs border bg-card flex flex-col">
            {/* Top Toolbar: Layer Tabs & Cluster Toggle Bar */}
            <div className="px-4 py-3 border-b bg-card flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5 bg-muted/40 border rounded-lg p-1">
                {LAYERS.map((layer, idx) => {
                  const Icon = layer.icon;
                  const isActive = layerIdx === idx;
                  return (
                    <Button
                      key={layer.id}
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setLayerIdx(idx)}
                      className="h-7 px-2.5 text-xs font-medium gap-1.5 transition-all shadow-none"
                    >
                      <Icon className="size-3.5" />
                      {layer.label}
                    </Button>
                  );
                })}
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none bg-muted/40 border px-2.5 py-1 rounded-lg">
                <input
                  type="checkbox"
                  checked={showClusters}
                  onChange={(e) => setShowClusters(e.target.checked)}
                  className="rounded accent-primary size-3.5 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <IconFlame className="size-3.5 text-amber-500" />
                  Show Risk Clusters
                </span>
              </label>
            </div>

            {/* Map Canvas Box: Centered Frame for India Map */}
            <div
              id="map_container_box"
              ref={mapBoxRef}
              className="relative bg-slate-50/50 dark:bg-slate-950/30 p-6 min-h-[590px] h-[590px] flex items-center justify-center overflow-hidden"
            >
              {/* SimpleMaps Root Target Div */}
              <div
                id="map"
                ref={mapContainerRef}
                className="w-full max-w-[580px] h-[560px] flex items-center justify-center mx-auto"
              />

              {/* Floating Choropleth Legend */}
              <div className="absolute bottom-4 left-4 z-10 bg-background/95 backdrop-blur-xs border rounded-xl p-2.5 shadow-md text-xs space-y-1.5 max-w-[200px]">
                <div className="font-semibold text-foreground text-[11px] flex items-center justify-between">
                  <span>{activeLayer.label}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                    Scale
                  </Badge>
                </div>
                <div className="space-y-1">
                  {activeLayer.legend.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-[11px] text-muted-foreground"
                    >
                      <span
                        className="size-2.5 rounded-sm shrink-0 border border-black/10"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Selected State Pill if any */}
              {selectedState && (
                <div className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur-xs border border-primary/30 rounded-lg px-3 py-1.5 shadow-sm text-xs flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-semibold text-foreground">
                    {selectedState}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedState(null)}
                  >
                    <IconX className="size-3" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ── Right Details / Drilldown Panel (4 of 12 cols on desktop) ── */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {selectedStateData ? (
            /* ── State Dossier Drilldown View ── */
            <Card className="shadow-xs border bg-card flex flex-col">
              <CardHeader className="p-4 pb-3 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="text-[10px] mb-1">
                      State Inspection
                    </Badge>
                    <CardTitle className="text-base font-bold text-foreground">
                      {selectedStateData.state}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {selectedStateData.mps} Lok Sabha / RS Constituencies
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setSelectedState(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <IconX className="size-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[580px]">
                {/* Key KPIs Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border bg-muted/30 p-2.5">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Total Works
                    </div>
                    <div className="text-sm font-mono font-bold text-foreground mt-0.5">
                      {selectedStateData.totalProjects}
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-2.5">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Completed
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {selectedStateData.completedProjects} (
                      {Math.round(
                        (selectedStateData.completedProjects /
                          selectedStateData.totalProjects) *
                          100
                      )}
                      %)
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-2.5">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Fund Utilization
                    </div>
                    <div className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                      {selectedStateData.utilization}%
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-2.5">
                    <div className="text-[10px] text-muted-foreground uppercase">
                      Delayed Works
                    </div>
                    <div className="text-sm font-mono font-bold text-destructive mt-0.5">
                      {selectedStateData.delayedProjects}
                    </div>
                  </div>
                </div>

                {/* Financial Summary Card */}
                <div className="rounded-lg border p-3 bg-muted/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>Funds Allocation</span>
                    <IconReceipt2 className="size-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sanctioned:</span>
                      <span className="font-mono font-semibold text-foreground">
                        ₹{selectedStateData.totalFunds} Cr
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Utilized:</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{selectedStateData.utilizedFunds} Cr
                      </span>
                    </div>
                  </div>
                </div>

                {/* State Projects List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Sample Works ({stateProjects.length})
                    </h4>
                  </div>
                  {stateProjects.length === 0 ? (
                    <div className="text-xs text-muted-foreground py-4 text-center border rounded-lg">
                      No active anomalies flagged in database for this state.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {stateProjects.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-lg border p-2.5 bg-card hover:bg-muted/40 transition-colors text-xs space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-medium text-foreground line-clamp-1">
                              {p.name}
                            </span>
                            <Badge
                              variant={
                                p.status === "Completed"
                                  ? "secondary"
                                  : p.status === "Delayed"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="text-[10px] px-1.5 py-0"
                            >
                              {p.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{p.district}</span>
                            <span className="font-mono font-medium text-foreground">
                              {p.sanctionedAmount >= 100
                                ? `₹${(p.sanctionedAmount / 100).toFixed(2)}Cr`
                                : `₹${p.sanctionedAmount.toFixed(1)}L`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-3 border-t bg-muted/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedState(null)}
                  className="w-full text-xs"
                >
                  Back to National View
                </Button>
              </CardFooter>
            </Card>
          ) : (
            /* ── National Overview & Rankings Panel ── */
            <div className="space-y-4">
              {/* Guidance Info Card */}
              <Card className="shadow-xs border border-primary/20 bg-primary/5 p-3.5">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <IconMapPin className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">
                      Click any state to drill down
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      Inspect district-level allocations, risk scores, and progress tranches across India.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Active Risk Clusters Card */}
              {showClusters && (
                <Card className="shadow-xs border">
                  <CardHeader className="p-3 pb-2 border-b bg-muted/20">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <IconAlertTriangle className="size-4 text-amber-500" />
                      Active Risk Clusters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {CLUSTERS.map((c, i) => (
                      <div
                        key={i}
                        onClick={() => selectStateFromList(c.state)}
                        className="rounded-lg border p-2 bg-card hover:bg-muted/40 cursor-pointer transition-colors text-xs space-y-0.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {c.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${
                              c.severity === "critical"
                                ? "border-destructive/40 text-destructive bg-destructive/10"
                                : c.severity === "high"
                                ? "border-amber-500/40 text-amber-600 bg-amber-500/10"
                                : "border-yellow-500/40 text-yellow-600 bg-yellow-500/10"
                            }`}
                          >
                            {c.severity}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {c.state} · {c.desc}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* National Rankings Leaderboard */}
              <Card className="shadow-xs border overflow-hidden">
                <CardHeader className="p-3 pb-2 border-b bg-muted/20">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                    <span>Rankings — {activeLayer.label}</span>
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      Top States
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <div className="max-h-[280px] overflow-y-auto">
                  <Table>
                    <TableBody>
                      {rankedStates.slice(0, 10).map((s, idx) => {
                        const val = activeLayer.valueFn(s);
                        const { color } = activeLayer.colorFn(s);
                        return (
                          <TableRow
                            key={s.state}
                            onClick={() => selectStateFromList(s.state)}
                            className="cursor-pointer hover:bg-muted/40 transition-colors text-xs"
                          >
                            <TableCell className="py-2 pl-3 font-mono text-muted-foreground w-6">
                              {idx + 1}
                            </TableCell>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className="size-2.5 rounded-xs shrink-0"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="font-medium text-foreground hover:text-primary transition-colors">
                                  {s.state}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-2 pr-3 text-right font-mono font-semibold text-foreground">
                              {val}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
