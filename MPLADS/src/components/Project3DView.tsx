"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  IconCube,
  IconEye,
  IconSun,
  IconMoon,
  IconRotate,
  IconMaximize,
  IconMinimize,
  IconLayersIntersect,
  IconCheck,
  IconInfoCircle,
  IconMapPin,
  IconArrowRight,
  IconRefresh,
  IconBuildingCommunity,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ViewpointPreset = "perspective" | "aerial" | "front" | "side" | "top";

export interface Project3DData {
  id: string;
  name: string;
  category: "bridge" | "building" | "street" | "dam";
  categoryLabel: string;
  sanctionedCost: string;
  expenditure: string;
  location: string;
  constituency: string;
  state: string;
  currentMilestone: string;
  overallProgress: number;
  steps: Array<{
    stepNumber: number;
    title: string;
    stage: string;
    progress: number;
    description: string;
    statutoryChecks: string[];
  }>;
  hotspots: Array<{
    position: [number, number, number];
    title: string;
    status: "verified" | "pending";
    detail: string;
  }>;
}

// ── 4 Featured 3D Projects ───────────────────────────────────────────────────

export const FEATURED_3D_PROJECTS: Project3DData[] = [
  {
    id: "MPLAD-UP-0401-2024-001",
    name: "Gomti River Bypass Bridge & Flyover",
    category: "bridge",
    categoryLabel: "Bridge & Flyover Infrastructure",
    sanctionedCost: "₹480.00 Lakhs",
    expenditure: "₹395.20 Lakhs",
    location: "Gomti Nagar, Lucknow",
    constituency: "Lucknow",
    state: "Uttar Pradesh",
    currentMilestone: "Deck Girders & Superstructure Installed",
    overallProgress: 82,
    steps: [
      {
        stepNumber: 1,
        title: "Sub-surface Piles & Caissons",
        stage: "Foundation (0-25%)",
        progress: 25,
        description: "Deep bore cast-in-situ reinforced concrete piles drilled 22m into river stratum with capping slabs.",
        statutoryChecks: ["Bore log stratigraphy report verified", "28-day concrete cube core test passed (M35)"],
      },
      {
        stepNumber: 2,
        title: "Concrete Piers & Abutments",
        stage: "Structural Framing (25-50%)",
        progress: 50,
        description: "Heavy reinforced RCC bridge piers rising 8m above high-flood line with elastomeric bearing pedestals.",
        statutoryChecks: ["Seismic pier jacketing inspection certified", "High flood level clearance verified (2.5m buffer)"],
      },
      {
        stepNumber: 3,
        title: "Pre-stressed Girders & Deck",
        stage: "Superstructure (50-75%)",
        progress: 75,
        description: "Pre-stressed post-tensioned concrete I-girders launched with reinforced composite deck slab and waterproofing.",
        statutoryChecks: ["Cable tensioning elongation logs audited", "Deck expansion joint alignment verified"],
      },
      {
        stepNumber: 4,
        title: "Stay Cables, Crash Barriers & Lighting",
        stage: "Finishing & Commissioning (75-100%)",
        progress: 100,
        description: "Steel tension stay-cables, crash-tested parapet walls, solar street lamps, and bituminous wearing coat.",
        statutoryChecks: ["Load test displacement deflection sensor test", "Solar lighting lux test and night visibility clearance"],
      },
    ],
    hotspots: [
      { position: [0, 5, 0], title: "Central Pier P-2", status: "verified", detail: "RCC M35 Pier with elastomeric bearing pads - GPS matched." },
      { position: [-8, 6.2, 0], title: "Deck Girders Span A", status: "verified", detail: "Post-tensioned girders installed. Deflection 1.2mm (within 4mm limit)." },
      { position: [8, 8.5, 0], title: "Stay Cable Anchor", status: "verified", detail: "High-tensile zinc-galvanized stay cable tension calibrated." },
    ],
  },
  {
    id: "MPLAD-UP-0401-2024-002",
    name: "Adarsh Community Health Centre & School",
    category: "building",
    categoryLabel: "Public Health & Educational Building",
    sanctionedCost: "₹165.00 Lakhs",
    expenditure: "₹112.50 Lakhs",
    location: "Bakshi Ka Talab, Lucknow",
    constituency: "Lucknow",
    state: "Uttar Pradesh",
    currentMilestone: "First Floor Masonry & Roof Slab Curing",
    overallProgress: 68,
    steps: [
      {
        stepNumber: 1,
        title: "Excavation & Plinth Beam Grid",
        stage: "Foundation (0-25%)",
        progress: 25,
        description: "Soil compaction, anti-termite treatment, isolated footings, and tied reinforced plinth beams.",
        statutoryChecks: ["Soil bearing capacity test certified", "Plinth elevation above road grade (+0.9m)"],
      },
      {
        stepNumber: 2,
        title: "RCC Frame & Multi-story Columns",
        stage: "Structural Framing (25-50%)",
        progress: 50,
        description: "Earthquake-resistant ductile RCC columns, tie-beams, and monolithic intermediate floor slab casting.",
        statutoryChecks: ["Rebar spacing & lap length physically inspected", "Curing compliance certificate uploaded"],
      },
      {
        stepNumber: 3,
        title: "Masonry Walls, Windows & Ramp",
        stage: "Superstructure (50-75%)",
        progress: 75,
        description: "Fly-ash brick partition walls, UPVC casement windows, electrical conduit piping, and barrier-free access ramp.",
        statutoryChecks: ["Divyangjan accessibility ramp gradient (1:12)", "Ventilation and natural lighting lumen audit"],
      },
      {
        stepNumber: 4,
        title: "Solar Rooftop, Paint & Landscaping",
        stage: "Finishing & Handover (75-100%)",
        progress: 100,
        description: "15kW rooftop solar PV array with grid net-metering, antibacterial vinyl hospital flooring, and green courtyard.",
        statutoryChecks: ["Grid synchronization test by discom", "Potable RO water connection and fire safety clearance"],
      },
    ],
    hotspots: [
      { position: [0, 4.5, 5], title: "Barrier-Free Access Ramp", status: "verified", detail: "1:12 slope with stainless steel double handrail for wheelchair access." },
      { position: [0, 9.5, 0], title: "15kW Rooftop Solar Array", status: "verified", detail: "Monocrystalline Tier-1 solar panels with bidirectional net-meter." },
      { position: [-5, 5, 0], title: "Pediatric Ward Wing", status: "verified", detail: "Anti-microbial wall finish and backup oxygen manifold station." },
    ],
  },
  {
    id: "MPLAD-UP-0401-2024-003",
    name: "Model Smart Paver Street & Stormwater Conduit",
    category: "street",
    categoryLabel: "Urban Paver Street & Underground Drainage",
    sanctionedCost: "₹75.00 Lakhs",
    expenditure: "₹67.80 Lakhs",
    location: "Chowk Heritage Ward, Lucknow",
    constituency: "Lucknow",
    state: "Uttar Pradesh",
    currentMilestone: "Paver Block Interlocking & Solar Poles Active",
    overallProgress: 90,
    steps: [
      {
        stepNumber: 1,
        title: "Subgrade Compaction & Trenching",
        stage: "Excavation & Bedding (0-25%)",
        progress: 25,
        description: "10-ton vibratory roller subgrade compaction and excavation of side stormwater drainage trenches.",
        statutoryChecks: ["Dry density compaction test (>98% Proctor)", "Underground water/gas line utility mapping"],
      },
      {
        stepNumber: 2,
        title: "Underground Drainage Box Conduits",
        stage: "Conduit Infrastructure (25-50%)",
        progress: 50,
        description: "RCC precast box culverts with heavy-duty ductile iron inspection grates and silt sedimentation pits.",
        statutoryChecks: ["Drainage gradient slope 1:200 verified", "Precast culvert hydraulic capacity test"],
      },
      {
        stepNumber: 3,
        title: "Interlocking Concrete Paver Surface",
        stage: "Pavement Laying (50-75%)",
        progress: 75,
        description: "80mm M40 high-density zig-zag interlocking pavers laid over 50mm clean river sand bedding with edge kerbs.",
        statutoryChecks: ["Paver abrasion resistance test report", "Edge kerb beam confinement check"],
      },
      {
        stepNumber: 4,
        title: "Solar Street Poles, Planters & Markings",
        stage: "Urban Amenities (75-100%)",
        progress: 100,
        description: "Integrated 40W dusk-to-dawn LED solar street lights, native green tree pit bollards, and reflective street signage.",
        statutoryChecks: ["Photovoltaic battery backup autonomy test (36 hrs)", "Pedestrian tactile paving for visual accessibility"],
      },
    ],
    hotspots: [
      { position: [-6, 1.2, 0], title: "Precast Stormwater Sump", status: "verified", detail: "Silt collection pit prevents street waterlogging during monsoon." },
      { position: [0, 4, 3], title: "Solar LED Streetpole 04", status: "verified", detail: "Lithium Ferro Phosphate (LiFePO4) solar pole with automated dusk sensor." },
      { position: [5, 1, -2], title: "M40 Interlocking Paver Section", status: "verified", detail: "Heavy axle load tested up to 25 metric tonnes." },
    ],
  },
  {
    id: "MPLAD-UP-0401-2024-004",
    name: "Water Conservation Check Dam & Reservoir",
    category: "dam",
    categoryLabel: "Check Dam & Watershed Reservoir",
    sanctionedCost: "₹92.00 Lakhs",
    expenditure: "₹69.00 Lakhs",
    location: "Malihabad Watershed, Lucknow",
    constituency: "Lucknow",
    state: "Uttar Pradesh",
    currentMilestone: "Spillway Crest Cast & Sluice Gate Fitted",
    overallProgress: 75,
    steps: [
      {
        stepNumber: 1,
        title: "Riverbed Cutoff Trench & Key Wall",
        stage: "Foundation (0-25%)",
        progress: 25,
        description: "Excavation to hard rock anchor layer and insertion of impervious clay cutoff trench to prevent sub-surface piping.",
        statutoryChecks: ["Geotechnical permeability test (<10^-6 cm/sec)", "Rock anchor grout tension test"],
      },
      {
        stepNumber: 2,
        title: "Stepped Gravity Dam Core",
        stage: "Gravity Structure (25-50%)",
        progress: 50,
        description: "Mass stone masonry and cyclopean concrete dam core with downstream energy dissipating stepped cascade.",
        statutoryChecks: ["Mortar proportion test (1:3 cement sand)", "Uplift pressure relief hole clearance"],
      },
      {
        stepNumber: 3,
        title: "Ogee Spillway & Sluice Control Gate",
        stage: "Hydraulic Controls (50-75%)",
        progress: 75,
        description: "Hydraulic ogee spillway crest, stainless steel manual/electric sluice gates, and side training retaining walls.",
        statutoryChecks: ["Peak 100-year flood discharge capacity", "Sluice seal watertightness hydrostatic test"],
      },
      {
        stepNumber: 4,
        title: "Stilling Basin, Gauge Staff & Telemetry",
        stage: "Reservoir Commissioning (75-100%)",
        progress: 100,
        description: "Downstream hydraulic jump stilling basin, water depth gauge staff, protective rock rip-rap, and IoT water sensor.",
        statutoryChecks: ["IoT telemetry water level broadcast to state water portal", "Catchment afforestation perimeter certified"],
      },
    ],
    hotspots: [
      { position: [0, 4.5, 0], title: "Ogee Overflow Spillway", status: "verified", detail: "Discharges peak floodwaters without scouring riverbed." },
      { position: [-5, 3.2, 2], title: "Sluice Gate Chamber", status: "verified", detail: "Allows controlled release for downstream agricultural irrigation." },
      { position: [6, 5, -3], title: "IoT Hydrostatic Telemetry Mast", status: "verified", detail: "Transmits hourly live reservoir volume to District Collector portal." },
    ],
  },
];

// ── Main 3D Component ────────────────────────────────────────────────────────

interface Project3DViewProps {
  initialProjectId?: string;
  onNavigateBack?: () => void;
}

export default function Project3DView({ initialProjectId, onNavigateBack }: Project3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Groups for 3D model layers
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const stepGroupsRef = useRef<THREE.Group[]>([]);
  const hotspotsGroupRef = useRef<THREE.Group | null>(null);

  // State
  const resolveInitialId = (id?: string) => {
    if (!id) return FEATURED_3D_PROJECTS[0].id;
    const direct = FEATURED_3D_PROJECTS.find((p) => p.id === id);
    if (direct) return direct.id;
    const lower = id.toLowerCase();
    if (lower.includes("bridge") || lower.includes("flyover")) return FEATURED_3D_PROJECTS[0].id;
    if (lower.includes("health") || lower.includes("school") || lower.includes("anganwadi") || lower.includes("building") || lower.includes("centre")) return FEATURED_3D_PROJECTS[1].id;
    if (lower.includes("street") || lower.includes("road") || lower.includes("light") || lower.includes("solar")) return FEATURED_3D_PROJECTS[2].id;
    if (lower.includes("water") || lower.includes("dam") || lower.includes("reservoir") || lower.includes("canal")) return FEATURED_3D_PROJECTS[3].id;
    return FEATURED_3D_PROJECTS[0].id;
  };

  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => resolveInitialId(initialProjectId));

  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(resolveInitialId(initialProjectId));
    }
  }, [initialProjectId]);

  const [activeStep, setActiveStep] = useState<number>(4); // 1 to 4 (default shows full project)
  const [viewpoint, setViewpoint] = useState<ViewpointPreset>("perspective");
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  // Current active project
  const currentProject = FEATURED_3D_PROJECTS.find((p) => p.id === selectedProjectId) || FEATURED_3D_PROJECTS[0];

  // Mouse interaction for Orbit Controls
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cameraTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 3, 0));
  const targetCameraPos = useRef<THREE.Vector3>(new THREE.Vector3(22, 16, 22));

  // ── Set Viewpoint Camera Positions ──────────────────────────────────────────

  const applyViewpoint = useCallback((preset: ViewpointPreset) => {
    setViewpoint(preset);
    if (!cameraRef.current) return;

    switch (preset) {
      case "aerial":
        targetCameraPos.current.set(0, 36, 4);
        cameraTarget.current.set(0, 0, 0);
        break;
      case "perspective":
        targetCameraPos.current.set(22, 16, 22);
        cameraTarget.current.set(0, 3, 0);
        break;
      case "front":
        targetCameraPos.current.set(0, 5, 26);
        cameraTarget.current.set(0, 4, 0);
        break;
      case "side":
        targetCameraPos.current.set(28, 7, 0);
        cameraTarget.current.set(0, 3, 0);
        break;
      case "top":
        targetCameraPos.current.set(0.1, 32, 0);
        cameraTarget.current.set(0, 0, 0);
        break;
    }
  }, []);

  // ── Procedural 3D Mesh Builders ─────────────────────────────────────────────

  // Build Bridge 3D Model
  const buildBridgeModel = useCallback((scene: THREE.Scene) => {
    const step1 = new THREE.Group(); // Piles & Caissons
    const step2 = new THREE.Group(); // Piers & Abutments
    const step3 = new THREE.Group(); // Deck & Girders
    const step4 = new THREE.Group(); // Cables, Railings & Lights

    // Environment: River and terrain
    const riverGeo = new THREE.PlaneGeometry(60, 24);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.y = -0.1;
    scene.add(river);

    // River banks
    const bankGeo = new THREE.BoxGeometry(60, 1, 10);
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const bankN = new THREE.Mesh(bankGeo, bankMat);
    bankN.position.set(0, 0.4, 14);
    scene.add(bankN);
    const bankS = new THREE.Mesh(bankGeo, bankMat);
    bankS.position.set(0, 0.4, -14);
    scene.add(bankS);

    // ── STEP 1: Piles & Caisson Foundation ──
    const pileGeo = new THREE.CylinderGeometry(0.7, 0.7, 10, 16);
    const pileMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
    [-10, 0, 10].forEach((x) => {
      [-2, 2].forEach((z) => {
        const pile = new THREE.Mesh(pileGeo, pileMat);
        pile.position.set(x, -3, z);
        step1.add(pile);
      });
      // Foundation Cap
      const capGeo = new THREE.BoxGeometry(3, 1, 6);
      const cap = new THREE.Mesh(capGeo, pileMat);
      cap.position.set(x, 0.8, 0);
      step1.add(cap);
    });

    // ── STEP 2: Concrete Piers & Abutments ──
    const pierGeo = new THREE.BoxGeometry(2, 6, 4.5);
    const pierMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
    [-10, 0, 10].forEach((x) => {
      const pier = new THREE.Mesh(pierGeo, pierMat);
      pier.position.set(x, 4.2, 0);
      step2.add(pier);

      // Pier cap crosshead
      const crossheadGeo = new THREE.BoxGeometry(2.6, 0.8, 7.5);
      const crosshead = new THREE.Mesh(crossheadGeo, pierMat);
      crosshead.position.set(x, 7.5, 0);
      step2.add(crosshead);
    });

    // ── STEP 3: Deck & Girders ──
    // Girders
    const girderGeo = new THREE.BoxGeometry(38, 1, 0.8);
    const girderMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.3 });
    [-2, 0, 2].forEach((z) => {
      const girder = new THREE.Mesh(girderGeo, girderMat);
      girder.position.set(0, 8.4, z);
      step3.add(girder);
    });

    // Road Deck
    const deckGeo = new THREE.BoxGeometry(40, 0.6, 7.2);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 9.1, 0);
    step3.add(deck);

    // Center divider markings
    const markingGeo = new THREE.PlaneGeometry(36, 0.25);
    const markingMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const marking = new THREE.Mesh(markingGeo, markingMat);
    marking.rotation.x = -Math.PI / 2;
    marking.position.set(0, 9.42, 0);
    step3.add(marking);

    // ── STEP 4: Cable Suspension, Railings & Solar Streetlights ──
    // Central Cable Pylon
    const pylonGeo = new THREE.CylinderGeometry(0.5, 0.9, 14, 16);
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.5, roughness: 0.2 });
    const pylon = new THREE.Mesh(pylonGeo, pylonMat);
    pylon.position.set(0, 14.5, 0);
    step4.add(pylon);

    // Stay Cables
    const cableMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 2 });
    [-14, -10, -6, 6, 10, 14].forEach((x) => {
      [-3.2, 3.2].forEach((z) => {
        const points = [new THREE.Vector3(0, 20.5, 0), new THREE.Vector3(x, 9.5, z)];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const cable = new THREE.Line(lineGeo, cableMat);
        step4.add(cable);
      });
    });

    // Barriers
    const barrierGeo = new THREE.BoxGeometry(40, 0.8, 0.2);
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });
    const barrierL = new THREE.Mesh(barrierGeo, barrierMat);
    barrierL.position.set(0, 9.8, 3.5);
    step4.add(barrierL);
    const barrierR = new THREE.Mesh(barrierGeo, barrierMat);
    barrierR.position.set(0, 9.8, -3.5);
    step4.add(barrierR);

    // Streetlights
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 3, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const lampLightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-15, -7, 7, 15].forEach((x) => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(x, 11, 3.4);
      step4.add(pole);

      const lampHead = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), lampLightMat);
      lampHead.position.set(x, 12.5, 3.1);
      step4.add(lampHead);
    });

    return [step1, step2, step3, step4];
  }, []);

  // Build Community Building 3D Model
  const buildBuildingModel = useCallback((scene: THREE.Scene) => {
    const step1 = new THREE.Group();
    const step2 = new THREE.Group();
    const step3 = new THREE.Group();
    const step4 = new THREE.Group();

    // Ground grass surface
    const groundGeo = new THREE.PlaneGeometry(44, 44);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    // Concrete Plinth Base
    const plinthGeo = new THREE.BoxGeometry(22, 0.8, 16);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.set(0, 0.4, 0);
    step1.add(plinth);

    // Foundation Columns
    const footingGeo = new THREE.BoxGeometry(1.5, 1, 1.5);
    for (let x = -8; x <= 8; x += 8) {
      for (let z = -6; z <= 6; z += 6) {
        const footing = new THREE.Mesh(footingGeo, plinthMat);
        footing.position.set(x, -0.3, z);
        step1.add(footing);
      }
    }

    // ── STEP 2: RCC Columns & Slabs ──
    const colGeo = new THREE.BoxGeometry(0.8, 9, 0.8);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
    const cols = [-9, 0, 9];
    const colZ = [-6.5, 0, 6.5];
    cols.forEach((x) => {
      colZ.forEach((z) => {
        const col = new THREE.Mesh(colGeo, colMat);
        col.position.set(x, 5.2, z);
        step2.add(col);
      });
    });

    // Mid-floor slab
    const midSlabGeo = new THREE.BoxGeometry(21, 0.4, 15);
    const midSlab = new THREE.Mesh(midSlabGeo, colMat);
    midSlab.position.set(0, 5, 0);
    step2.add(midSlab);

    // Roof slab
    const roofSlabGeo = new THREE.BoxGeometry(22, 0.5, 16);
    const roofSlab = new THREE.Mesh(roofSlabGeo, colMat);
    roofSlab.position.set(0, 9.8, 0);
    step2.add(roofSlab);

    // ── STEP 3: Enclosure Walls & Access Ramp ──
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.7 });

    // Exterior Wall Shell
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8.8, 14), wallMat);
    wallL.position.set(-9.5, 5.1, 0);
    step3.add(wallL);

    const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 8.8, 14), wallMat);
    wallR.position.set(9.5, 5.1, 0);
    step3.add(wallR);

    const wallB = new THREE.Mesh(new THREE.BoxGeometry(19, 8.8, 0.4), wallMat);
    wallB.position.set(0, 5.1, -7);
    step3.add(wallB);

    // Front Façade with Window Panes
    const frontL = new THREE.Mesh(new THREE.BoxGeometry(7, 8.8, 0.4), wallMat);
    frontL.position.set(-6, 5.1, 7);
    step3.add(frontL);

    const frontR = new THREE.Mesh(new THREE.BoxGeometry(7, 8.8, 0.4), wallMat);
    frontR.position.set(6, 5.1, 7);
    step3.add(frontR);

    // Entrance Glass Doors
    const glassEntrance = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 0.2), glassMat);
    glassEntrance.position.set(0, 2.8, 7.1);
    step3.add(glassEntrance);

    // Windows
    [-6, 6].forEach((x) => {
      [3.2, 7.5].forEach((y) => {
        const windowPane = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2, 0.5), glassMat);
        windowPane.position.set(x, y, 7.1);
        step3.add(windowPane);
      });
    });

    // Access Ramp
    const rampGeo = new THREE.BoxGeometry(4, 0.3, 6);
    const ramp = new THREE.Mesh(rampGeo, plinthMat);
    ramp.rotation.x = 0.14;
    ramp.position.set(0, 0.4, 9.8);
    step3.add(ramp);

    // ── STEP 4: Solar Rooftop, Hospital Cross & Exterior Finishes ──
    // Solar Panel Grid
    const solarGeo = new THREE.BoxGeometry(3.5, 0.1, 2);
    const solarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
    for (let x = -6; x <= 6; x += 4) {
      for (let z = -4; z <= 4; z += 3) {
        const panel = new THREE.Mesh(solarGeo, solarMat);
        panel.rotation.x = 0.15;
        panel.position.set(x, 10.4, z);
        step4.add(panel);
      }
    }

    // Health Care Red Cross Symbol on facade
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.5, 0.1), crossMat);
    crossV.position.set(0, 7.8, 7.25);
    step4.add(crossV);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 0.1), crossMat);
    crossH.position.set(0, 7.8, 7.25);
    step4.add(crossH);

    // Water tank on roof
    const tankGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.2, 16);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(7, 11.2, -4);
    step4.add(tank);

    return [step1, step2, step3, step4];
  }, []);

  // Build Smart Paver Street Model
  const buildStreetModel = useCallback((scene: THREE.Scene) => {
    const step1 = new THREE.Group();
    const step2 = new THREE.Group();
    const step3 = new THREE.Group();
    const step4 = new THREE.Group();

    // Earth sub-base excavation trench
    const earthGeo = new THREE.BoxGeometry(18, 0.6, 44);
    const earthMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.position.set(0, -0.3, 0);
    step1.add(earth);

    // ── STEP 2: Underground Stormwater Box Conduits & Manholes ──
    const pipeGeo = new THREE.CylinderGeometry(0.8, 0.8, 42, 16);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.2 });
    const pipeL = new THREE.Mesh(pipeGeo, pipeMat);
    pipeL.rotation.x = Math.PI / 2;
    pipeL.position.set(-5.5, 0.3, 0);
    step2.add(pipeL);

    const pipeR = new THREE.Mesh(pipeGeo, pipeMat);
    pipeR.rotation.x = Math.PI / 2;
    pipeR.position.set(5.5, 0.3, 0);
    step2.add(pipeR);

    // Manholes
    [-14, 0, 14].forEach((z) => {
      const mh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.4, 16), pipeMat);
      mh.position.set(-5.5, 1.3, z);
      step2.add(mh);
    });

    // ── STEP 3: Paver Roadway & Kerbs ──
    // Paver Roadway
    const roadGeo = new THREE.BoxGeometry(8, 0.3, 44);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(0, 1.2, 0);
    step3.add(road);

    // Footpaths / Sidewalks
    const walkGeo = new THREE.BoxGeometry(3.5, 0.45, 44);
    const walkMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });
    const walkL = new THREE.Mesh(walkGeo, walkMat);
    walkL.position.set(-5.8, 1.3, 0);
    step3.add(walkL);

    const walkR = new THREE.Mesh(walkGeo, walkMat);
    walkR.position.set(5.8, 1.3, 0);
    step3.add(walkR);

    // Kerb Stones
    const kerbGeo = new THREE.BoxGeometry(0.3, 0.55, 44);
    const kerbMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9 });
    const kerbL = new THREE.Mesh(kerbGeo, kerbMat);
    kerbL.position.set(-4, 1.4, 0);
    step3.add(kerbL);

    const kerbR = new THREE.Mesh(kerbGeo, kerbMat);
    kerbR.position.set(4, 1.4, 0);
    step3.add(kerbR);

    // ── STEP 4: Solar Streetlights, Planters & Markings ──
    // LED Solar Poles
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.5, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const solarHeadGeo = new THREE.BoxGeometry(1.2, 0.08, 0.8);
    const solarHeadMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const lampLightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    [-16, -6, 6, 16].forEach((z) => {
      // Pole
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(-6.8, 3.5, z);
      step4.add(pole);

      // Solar Panel on top
      const solarPanel = new THREE.Mesh(solarHeadGeo, solarHeadMat);
      solarPanel.position.set(-6.8, 5.8, z);
      solarPanel.rotation.z = -0.2;
      step4.add(solarPanel);

      // Lamp light
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), lampLightMat);
      lamp.position.set(-6.2, 5.3, z);
      step4.add(lamp);

      // Green Planter on opposite side
      const potGeo = new THREE.CylinderGeometry(0.6, 0.4, 0.8, 12);
      const potMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.set(6.8, 1.7, z);
      step4.add(pot);

      const bushGeo = new THREE.DodecahedronGeometry(0.7);
      const bushMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
      const bush = new THREE.Mesh(bushGeo, bushMat);
      bush.position.set(6.8, 2.5, z);
      step4.add(bush);
    });

    return [step1, step2, step3, step4];
  }, []);

  // Build Check Dam 3D Model
  const buildDamModel = useCallback((scene: THREE.Scene) => {
    const step1 = new THREE.Group();
    const step2 = new THREE.Group();
    const step3 = new THREE.Group();
    const step4 = new THREE.Group();

    // River Valley Gorge
    const valleyGeo = new THREE.BoxGeometry(36, 1, 40);
    const valleyMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.9 });
    const valley = new THREE.Mesh(valleyGeo, valleyMat);
    valley.position.set(0, 0, 0);
    scene.add(valley);

    // ── STEP 1: Cutoff Trench & Rock Anchoring ──
    const cutoffGeo = new THREE.BoxGeometry(24, 2, 4);
    const cutoffMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.9 });
    const cutoff = new THREE.Mesh(cutoffGeo, cutoffMat);
    cutoff.position.set(0, -0.6, 0);
    step1.add(cutoff);

    // ── STEP 2: Stepped Masonry Core Wall ──
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.6 });
    // Tier 1 Base
    const t1 = new THREE.Mesh(new THREE.BoxGeometry(24, 2, 6), coreMat);
    t1.position.set(0, 1.5, 0);
    step2.add(t1);

    // Tier 2 Middle
    const t2 = new THREE.Mesh(new THREE.BoxGeometry(22, 2.5, 4.5), coreMat);
    t2.position.set(0, 3.5, 0);
    step2.add(t2);

    // Tier 3 Top
    const t3 = new THREE.Mesh(new THREE.BoxGeometry(20, 2, 3), coreMat);
    t3.position.set(0, 5.5, 0);
    step2.add(t3);

    // ── STEP 3: Ogee Spillway & Sluice Gate ──
    const ogeeGeo = new THREE.BoxGeometry(10, 1.5, 3.5);
    const ogeeMat = new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.3 });
    const ogee = new THREE.Mesh(ogeeGeo, ogeeMat);
    ogee.position.set(0, 6.2, 0);
    step3.add(ogee);

    // Sluice Gate Metal Frame
    const gateFrameGeo = new THREE.BoxGeometry(3, 4, 0.4);
    const gateFrameMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 });
    const gate = new THREE.Mesh(gateFrameGeo, gateFrameMat);
    gate.position.set(-7, 4.5, 0);
    step3.add(gate);

    // Upstream Water Body
    const waterGeo = new THREE.BoxGeometry(28, 4.5, 18);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.6,
      transparent: true,
      opacity: 0.75,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.set(0, 2.5, -9.5);
    step3.add(water);

    // ── STEP 4: Stilling Basin, Sensor Mast & Gauge ──
    // Downstream apron / stilling basin
    const apronGeo = new THREE.BoxGeometry(18, 0.5, 10);
    const apronMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.5 });
    const apron = new THREE.Mesh(apronGeo, apronMat);
    apron.position.set(0, 0.8, 6.5);
    step4.add(apron);

    // IoT Telemetry Mast
    const mastGeo = new THREE.CylinderGeometry(0.1, 0.1, 7, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(8.5, 6.5, 1.5);
    step4.add(mast);

    const sensorBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    sensorBeacon.position.set(8.5, 10, 1.5);
    step4.add(sensorBeacon);

    // Water Gauge Staff
    const staffGeo = new THREE.BoxGeometry(0.3, 6, 0.3);
    const staffMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const staff = new THREE.Mesh(staffGeo, staffMat);
    staff.position.set(8.5, 3.5, -2);
    step4.add(staff);

    return [step1, step2, step3, step4];
  }, []);

  // ── Setup Hotspot Sprite Pins ───────────────────────────────────────────────

  const buildHotspots = useCallback(
    (hotspots: Project3DData["hotspots"]) => {
      const group = new THREE.Group();

      hotspots.forEach((h, idx) => {
        const pinCanvas = document.createElement("canvas");
        pinCanvas.width = 64;
        pinCanvas.height = 64;
        const ctx = pinCanvas.getContext("2d");
        if (ctx) {
          ctx.beginPath();
          ctx.arc(32, 32, 24, 0, Math.PI * 2);
          ctx.fillStyle = h.status === "verified" ? "#10B981" : "#F59E0B";
          ctx.fill();
          ctx.lineWidth = 4;
          ctx.strokeStyle = "#FFFFFF";
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 24px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(idx + 1), 32, 32);
        }

        const texture = new THREE.CanvasTexture(pinCanvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(...h.position);
        sprite.scale.set(2, 2, 1);
        sprite.userData = { id: h.title, data: h };
        group.add(sprite);
      });

      return group;
    },
    []
  );

  // ── Initialize Scene & Render Loop ──────────────────────────────────────────

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // Create Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isNightMode ? 0x090d16 : 0xf8fafc);
    scene.fog = new THREE.FogExp2(isNightMode ? 0x090d16 : 0xf8fafc, 0.015);

    // Create Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.copy(targetCameraPos.current);
    camera.lookAt(cameraTarget.current);

    // Create Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(isNightMode ? 0x334155 : 0xffffff, isNightMode ? 0.4 : 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(isNightMode ? 0x38bdf8 : 0xfffaed, isNightMode ? 0.6 : 1.2);
    dirLight.position.set(18, 28, 18);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.35);
    fillLight.position.set(-18, 12, -18);
    scene.add(fillLight);

    // Model Group
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    // Build specific category model
    let steps: THREE.Group[] = [];
    if (currentProject.category === "bridge") {
      steps = buildBridgeModel(scene);
    } else if (currentProject.category === "building") {
      steps = buildBuildingModel(scene);
    } else if (currentProject.category === "street") {
      steps = buildStreetModel(scene);
    } else {
      steps = buildDamModel(scene);
    }

    stepGroupsRef.current = steps;
    steps.forEach((s) => modelGroup.add(s));

    // Hotspots Group
    const hotspots = buildHotspots(currentProject.hotspots);
    hotspotsGroupRef.current = hotspots;
    scene.add(hotspots);

    // ── Animation Loop ──
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      // Smooth camera interpolation towards target
      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCameraPos.current, 0.06);
        cameraRef.current.lookAt(cameraTarget.current);
      }

      // Auto rotation
      if (isAutoRotate && modelGroupRef.current) {
        modelGroupRef.current.rotation.y += 0.004;
      }

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize Handler ──
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 560;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      renderer.dispose();
    };
  }, [
    selectedProjectId,
    currentProject,
    isNightMode,
    isAutoRotate,
    buildBridgeModel,
    buildBuildingModel,
    buildStreetModel,
    buildDamModel,
    buildHotspots,
  ]);

  // ── Update Step Visibility & Wireframe ───────────────────────────────────────

  useEffect(() => {
    stepGroupsRef.current.forEach((group, idx) => {
      const stepNum = idx + 1;
      const isVisible = stepNum <= activeStep;
      group.visible = isVisible;

      // Apply wireframe mode
      group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => {
              if (m && "wireframe" in m) {
                (m as THREE.MeshStandardMaterial).wireframe = isWireframe;
              }
            });
          } else if (mesh.material && "wireframe" in mesh.material) {
            (mesh.material as THREE.MeshStandardMaterial).wireframe = isWireframe;
          }
        }
      });
    });
  }, [activeStep, isWireframe]);

  // ── Mouse Drag for Orbiting ─────────────────────────────────────────────────

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !modelGroupRef.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    modelGroupRef.current.rotation.y += deltaX * 0.008;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
    targetCameraPos.current.multiplyScalar(zoomFactor);
    // Limit zoom distance
    const dist = targetCameraPos.current.length();
    if (dist < 10) targetCameraPos.current.setLength(10);
    if (dist > 65) targetCameraPos.current.setLength(65);
  };

  return (
    <div className={`space-y-5 ${isFullscreen ? "fixed inset-0 z-50 bg-background p-6 overflow-y-auto" : ""}`}>
      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center font-bold">
              <IconCube className="size-4.5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              3D Digital Twin & Layout Viewer
            </h2>
            <Badge variant="outline" className="text-[10px] font-bold bg-violet-500/10 text-violet-700 border-violet-500/30">
              Interactive WebGL
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Step-by-step architectural layouts and multi-angle viewpoint inspection for high-value public infrastructure.
          </p>
        </div>

        {onNavigateBack && (
          <Button variant="outline" size="sm" onClick={onNavigateBack} className="h-8 text-xs gap-1.5 self-start sm:self-auto">
            &larr; Back to Dashboard
          </Button>
        )}
      </div>

      {/* ── 4 Project Selectors ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {FEATURED_3D_PROJECTS.map((proj) => {
          const isSelected = proj.id === selectedProjectId;
          return (
            <button
              key={proj.id}
              onClick={() => {
                setSelectedProjectId(proj.id);
                setActiveStep(4);
                setSelectedHotspot(null);
                applyViewpoint("perspective");
              }}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                isSelected
                  ? "bg-violet-500/10 border-violet-500 shadow-xs ring-1 ring-violet-500/30"
                  : "bg-card border-border/80 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <Badge variant="outline" className="text-[9px] uppercase font-bold px-1.5 py-0">
                  {proj.category}
                </Badge>
                <span className="text-[10px] font-bold text-violet-600">{proj.overallProgress}% Complete</span>
              </div>
              <h4 className="text-xs font-bold text-foreground line-clamp-1">{proj.name}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {proj.sanctionedCost} &bull; {proj.location}
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Main 3D Canvas Card ── */}
      <Card className="overflow-hidden border-border/80 shadow-md rounded-2xl bg-card">
        {/* Canvas HUD Controls Bar */}
        <div className="p-3.5 border-b border-border/80 bg-muted/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Viewpoint Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mr-1 flex items-center gap-1">
              <IconEye className="size-3.5" /> Viewpoint:
            </span>
            {(
              [
                { id: "perspective", label: "📐 3D Perspective" },
                { id: "aerial", label: "🦅 Aerial Bird's Eye" },
                { id: "front", label: "🏛️ Front Elevation" },
                { id: "side", label: "🔭 Side Profile" },
                { id: "top", label: "📄 Plan Blueprint" },
              ] as const
            ).map((vp) => (
              <button
                key={vp.id}
                onClick={() => applyViewpoint(vp.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewpoint === vp.id
                    ? "bg-violet-600 text-white shadow-xs"
                    : "bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {vp.label}
              </button>
            ))}
          </div>

          {/* Quick HUD Toggles */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => setIsWireframe(!isWireframe)}
              title="Toggle Wireframe / Structural X-Ray"
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-medium transition-all ${
                isWireframe ? "bg-amber-500/20 text-amber-700 border-amber-500/40" : "bg-card border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              <IconLayersIntersect className="size-4" />
              <span className="hidden sm:inline">X-Ray</span>
            </button>

            <button
              onClick={() => setIsAutoRotate(!isAutoRotate)}
              title="Toggle Continuous Auto-Rotation"
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-medium transition-all ${
                isAutoRotate ? "bg-violet-500/20 text-violet-700 border-violet-500/40" : "bg-card border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              <IconRotate className="size-4" />
              <span className="hidden sm:inline">Rotate</span>
            </button>

            <button
              onClick={() => setIsNightMode(!isNightMode)}
              title="Toggle Day / Night Lighting"
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground"
            >
              {isNightMode ? <IconSun className="size-4 text-amber-500" /> : <IconMoon className="size-4 text-indigo-500" />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Toggle Fullscreen"
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground"
            >
              {isFullscreen ? <IconMinimize className="size-4" /> : <IconMaximize className="size-4" />}
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas Container */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-[480px] sm:h-[540px] relative cursor-grab active:cursor-grabbing select-none overflow-hidden"
        >
          {/* Floating Instructions Pill */}
          <div className="absolute top-3 left-3 pointer-events-none bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border/70 text-[11px] font-medium text-muted-foreground shadow-xs flex items-center gap-1.5">
            <span>🖱️ Drag to rotate &bull; Scroll to zoom &bull; Click step to inspect construction phase</span>
          </div>

          {/* Floating Hotspots Inspector Badge */}
          <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-md p-2.5 rounded-xl border border-border/80 text-xs shadow-md max-w-xs space-y-1">
            <div className="font-bold text-foreground flex items-center gap-1.5 text-[11px]">
              <IconMapPin className="size-3.5 text-emerald-500" />
              <span>Inspection Pins:</span>
            </div>
            <div className="space-y-1">
              {currentProject.hotspots.map((h, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedHotspot(h.title)}
                  className={`text-[10px] p-1.5 rounded-lg border cursor-pointer transition-all ${
                    selectedHotspot === h.title
                      ? "bg-emerald-500/10 border-emerald-500/40 text-foreground font-semibold"
                      : "bg-muted/30 border-transparent hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="font-bold text-emerald-600 mr-1">#{i + 1}</span> {h.title}
                  {selectedHotspot === h.title && <p className="text-[10px] text-muted-foreground mt-0.5">{h.detail}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Step-by-Step Layout Timeline Stepper ── */}
        <div className="p-5 border-t border-border/80 bg-gradient-to-r from-muted/20 via-card to-muted/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <IconLayersIntersect className="size-4 text-violet-600" />
                Step-by-Step Construction Layout Stepper
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Click each milestone below to isolate and inspect the architectural layout evolution.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-bold text-violet-700 bg-violet-500/10 border-violet-500/30">
              Active Stage: Step {activeStep} of 4
            </Badge>
          </div>

          {/* 4 Step Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {currentProject.steps.map((st) => {
              const isCurrent = st.stepNumber === activeStep;
              const isCompleted = st.stepNumber <= activeStep;

              return (
                <button
                  key={st.stepNumber}
                  onClick={() => setActiveStep(st.stepNumber)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isCurrent
                      ? "bg-violet-600 text-white shadow-md border-violet-600 ring-2 ring-violet-500/30"
                      : isCompleted
                      ? "bg-violet-500/10 border-violet-500/30 text-foreground"
                      : "bg-card border-border/80 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-1">
                    <span>Step 0{st.stepNumber}</span>
                    <span>{st.progress}%</span>
                  </div>
                  <h4 className={`text-xs font-bold truncate ${isCurrent ? "text-white" : "text-foreground"}`}>
                    {st.title}
                  </h4>
                  <p className={`text-[10px] line-clamp-1 mt-0.5 ${isCurrent ? "text-violet-200" : "text-muted-foreground"}`}>
                    {st.stage}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Detailed Active Step Card */}
          {(() => {
            const currentStepData = currentProject.steps.find((s) => s.stepNumber === activeStep) || currentProject.steps[3];
            return (
              <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.03] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-foreground flex items-center gap-1.5">
                    <IconShieldCheck className="size-4 text-emerald-500" />
                    Step {currentStepData.stepNumber}: {currentStepData.title} &bull; {currentStepData.stage}
                  </span>
                  <span className="text-[11px] font-bold text-violet-600">{currentStepData.progress}% Structural Target</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  {currentStepData.description}
                </p>
                <div className="pt-2 border-t border-border/60 flex flex-wrap gap-2 text-[10px]">
                  <span className="font-bold text-foreground">Mandatory Statutory Checks:</span>
                  {currentStepData.statutoryChecks.map((chk, idx) => (
                    <span key={idx} className="bg-background px-2 py-0.5 rounded-md border border-border/80 text-muted-foreground flex items-center gap-1">
                      <IconCheck className="size-3 text-emerald-500" />
                      {chk}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </Card>
    </div>
  );
}
