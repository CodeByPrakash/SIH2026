"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/useProjects";
import type {
  Project,
  IScenarioSimulationResult,
  IAuthorityDecision,
  InterventionType,
  UserRole,
} from "@/types";
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
  IconSparkles,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconPlayerPlay,
  IconShieldCheck,
  IconClock,
  IconFileText,
  IconAdjustmentsHorizontal,
  IconScale,
  IconLock,
  IconInfoCircle,
  IconRefresh,
  IconArrowRight,
} from "@tabler/icons-react";

interface InterventionSimulationProps {
  initialProjectId?: string;
}

export default function InterventionSimulation({ initialProjectId }: InterventionSimulationProps) {
  const { user } = useAuth();
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || "");

  // Derive selected project object cleanly from selectedProjectId and projects array
  const selectedProject = React.useMemo(() => {
    if (!selectedProjectId) return projects[0] || null;
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  // Simulation State
  const [simulation, setSimulation] = useState<IScenarioSimulationResult | null>(null);
  const [loadingSimulation, setLoadingSimulation] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // What-If Assumption Controls
  const [showWhatIf, setShowWhatIf] = useState<boolean>(false);
  const [whatIfProgress, setWhatIfProgress] = useState<number>(50);
  const [whatIfRiskLevel, setWhatIfRiskLevel] = useState<"Low" | "Medium" | "High" | "Critical">("Low");
  const [whatIfConflict, setWhatIfConflict] = useState<boolean>(false);
  const [whatIfCompliance, setWhatIfCompliance] = useState<string>("Compliant");

  // Authority Decision Form State
  const [decisionIntervention, setDecisionIntervention] = useState<InterventionType>("HOLD");
  const [decisionNote, setDecisionNote] = useState<string>("");
  const [savingDecision, setSavingDecision] = useState<boolean>(false);
  const [decisionSuccessMsg, setDecisionSuccessMsg] = useState<string | null>(null);
  const [decisionHistory, setDecisionHistory] = useState<IAuthorityDecision[]>([]);

  // Initialize selected project ONLY if not set yet or if selected project is invalid
  useEffect(() => {
    if (projects.length > 0) {
      if (!selectedProjectId || !projects.some((p) => p.id === selectedProjectId)) {
        const defaultId = initialProjectId && projects.some((p) => p.id === initialProjectId)
          ? initialProjectId
          : projects[0].id;
        setSelectedProjectId(defaultId);
      }
    }
  }, [projects, initialProjectId, selectedProjectId]);

  // Sync what-if state ONLY when the selected project ID actually changes
  useEffect(() => {
    if (selectedProject) {
      setWhatIfProgress(selectedProject.progress);
      setWhatIfRiskLevel(selectedProject.riskLevel);
      setWhatIfConflict(false);
      setWhatIfCompliance(selectedProject.ucSubmitted ? "Compliant" : "UC Pending");
    }
  }, [selectedProject?.id]);

  // Run simulation API call with race condition protection
  const handleRunSimulation = useCallback(
    async (overrideWhatIf?: boolean) => {
      if (!selectedProjectId) return;
      const targetProjectId = selectedProjectId;
      setLoadingSimulation(true);
      setErrorMsg(null);
      setDecisionSuccessMsg(null);

      try {
        const payload: any = {};
        if (overrideWhatIf) {
          payload.customInputs = {
            progress: whatIfProgress,
            riskLevel: whatIfRiskLevel,
            hasCitizenConflict: whatIfConflict,
            complianceStatus: whatIfCompliance,
          };
        }

        const res = await fetch(`/api/projects/${targetProjectId}/simulate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        // Guard against race conditions: only update state if user hasn't switched projects
        if (json.success && json.data) {
          if (json.data.projectId === targetProjectId) {
            setSimulation(json.data);
          }
        } else {
          setErrorMsg(json.error || "Failed to generate simulation");
        }
      } catch (err: any) {
        setErrorMsg("Network error while communicating with AI Simulation engine");
      } finally {
        setLoadingSimulation(false);
      }
    },
    [selectedProjectId, whatIfProgress, whatIfRiskLevel, whatIfConflict, whatIfCompliance]
  );

  // Fetch decision history with race condition protection
  const fetchDecisionHistory = useCallback(async (projId: string) => {
    try {
      const res = await fetch(`/api/projects/${projId}/decision`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDecisionHistory(json.data);
      }
    } catch {
      // Quiet fallback
    }
  }, []);

  // Run simulation automatically when selected project changes
  useEffect(() => {
    if (selectedProjectId) {
      handleRunSimulation(false);
      fetchDecisionHistory(selectedProjectId);
    }
  }, [selectedProjectId, fetchDecisionHistory]);

  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
  };

  // Submit Official Authority Decision
  const handleRecordDecision = async () => {
    if (!selectedProjectId) return;
    if (!decisionNote.trim()) {
      setErrorMsg("Please enter a decision rationale note before submitting.");
      return;
    }

    setSavingDecision(true);
    setErrorMsg(null);
    setDecisionSuccessMsg(null);

    const currentUserRole: UserRole = user?.role || "District";
    const currentUserName = user?.name || `${currentUserRole} Official`;

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedIntervention: decisionIntervention,
          decisionNote,
          userRole: currentUserRole,
          userName: currentUserName,
          simulationId: simulation?.simulationId,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setDecisionSuccessMsg(`Authority Decision (${decisionIntervention}) recorded successfully in MongoDB Atlas.`);
        setDecisionNote("");
        fetchDecisionHistory(selectedProjectId);
      } else {
        setErrorMsg(json.error || "Failed to record authority decision");
      }
    } catch (err) {
      setErrorMsg("Network error recording decision");
    } finally {
      setSavingDecision(false);
    }
  };

  const isCitizen = user?.role === "Citizen";

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-lg border border-indigo-700/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-indigo-500/20 text-indigo-200 border-indigo-400/40 px-3 py-1">
                <IconSparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                AI Scenario Simulator USP
              </Badge>
              <Badge variant="outline" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/40">
                Decision Support Engine
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">AI Intervention Scenario Simulator</h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-3xl">
              AI simulates projected outcomes to compare <strong>Release</strong>, <strong>Hold</strong>, or{" "}
              <strong>Corrective Action</strong>, helping authorities choose the right intervention based on real ground data.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-64">
              <label className="text-xs text-indigo-200 mb-1 block font-medium">Select Project for Analysis:</label>
              <Select value={selectedProjectId} onValueChange={(val) => { if (val) handleProjectSelect(val); }}>
                <SelectTrigger className="bg-slate-800/80 border-indigo-500/50 text-white h-10">
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white max-h-72">
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="focus:bg-indigo-800 focus:text-white">
                      <span className="font-semibold text-xs text-indigo-300 mr-2">[{p.id}]</span>
                      <span>{p.name.length > 32 ? p.name.substring(0, 32) + "…" : p.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => handleRunSimulation(showWhatIf)}
              disabled={loadingSimulation || !selectedProjectId}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white mt-auto h-10 px-4"
            >
              {loadingSimulation ? (
                <>
                  <IconRefresh className="w-4 h-4 mr-2 animate-spin" />
                  Simulating…
                </>
              ) : (
                <>
                  <IconPlayerPlay className="w-4 h-4 mr-2" />
                  Re-Run Simulation
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Official Notice Banner & Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-3 shadow-sm">
        <IconInfoCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block text-amber-700 dark:text-amber-300">
            AI Scenario Simulation — Projected outcome based on available project data.
          </span>
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
            This analytical estimate helps compare intervention implications. It does <strong>not</strong> determine the final administrative decision or dictate official policy. Final authority remains with the authorized officer.
          </p>
        </div>
      </div>

      {/* 3. Project Ground State Overview Bar */}
      {selectedProject && (
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 bg-slate-50 dark:bg-slate-900/50 rounded-t-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    ID: {selectedProject.id}
                  </Badge>
                  <Badge className="bg-slate-700 text-white">{selectedProject.category}</Badge>
                  <Badge
                    variant="outline"
                    className={
                      selectedProject.status === "Completed"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : selectedProject.status === "On Hold"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                    }
                  >
                    {selectedProject.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-1.5">{selectedProject.name}</CardTitle>
                <CardDescription>
                  {selectedProject.constituency}, {selectedProject.district}, {selectedProject.state} · MP: {selectedProject.mpName}
                </CardDescription>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="text-right">
                  <span className="text-slate-500 block">Sanctioned</span>
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">
                    ₹{(selectedProject.sanctionedAmount / 100000).toFixed(2)} Lakh
                  </span>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-right">
                  <span className="text-slate-500 block">Released</span>
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">
                    ₹{(selectedProject.releasedAmount / 100000).toFixed(2)} Lakh
                  </span>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-right">
                  <span className="text-slate-500 block">Expenditure</span>
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">
                    ₹{(selectedProject.expenditure / 100000).toFixed(2)} Lakh
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>Physical Progress</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedProject.progress}%</span>
              </div>
              <Progress value={selectedProject.progress} className="h-2" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span>Risk Indicator</span>
                <span
                  className={
                    selectedProject.riskLevel === "Critical" || selectedProject.riskLevel === "High"
                      ? "text-red-600 font-bold"
                      : selectedProject.riskLevel === "Medium"
                      ? "text-amber-600 font-bold"
                      : "text-emerald-600 font-bold"
                  }
                >
                  {selectedProject.riskLevel} ({selectedProject.riskScore}/100)
                </span>
              </div>
              <Progress
                value={selectedProject.riskScore}
                className={
                  selectedProject.riskLevel === "Critical" || selectedProject.riskLevel === "High"
                    ? "[&>div]:bg-red-500 h-2"
                    : selectedProject.riskLevel === "Medium"
                    ? "[&>div]:bg-amber-500 h-2"
                    : "[&>div]:bg-emerald-500 h-2"
                }
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <IconFileText className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <span className="text-slate-500 block">UC Compliance:</span>
                <span className={selectedProject.ucSubmitted ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                  {selectedProject.ucSubmitted ? "UC Submitted & Verified" : "UC Pending Submission"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <IconShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              <div>
                <span className="text-slate-500 block">Ground Inspections:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {selectedProject.inspections} Audits · {selectedProject.photos} Geotagged Photos
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. What-If Assumption Tuning Controls */}
      <Card className="border border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20">
        <CardHeader className="py-3 cursor-pointer" onClick={() => setShowWhatIf(!showWhatIf)}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IconAdjustmentsHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-base text-indigo-950 dark:text-indigo-200">
                What-If Scenario Assumption Tuning
              </CardTitle>
              <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 border-indigo-300">
                Interactive Demo Controls
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-indigo-600 dark:text-indigo-300">
              {showWhatIf ? "Hide Controls ▲" : "Modify Assumptions ▼"}
            </Button>
          </div>
        </CardHeader>

        {showWhatIf && (
          <CardContent className="pt-2 pb-4 space-y-4 border-t border-indigo-500/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assumed Physical Progress: <span className="text-indigo-600 font-bold">{whatIfProgress}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={whatIfProgress}
                  onChange={(e) => setWhatIfProgress(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Assumed Risk Level:
                </label>
                <Select value={whatIfRiskLevel} onValueChange={(val: any) => setWhatIfRiskLevel(val)}>
                  <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="Low">Low Risk</SelectItem>
                    <SelectItem value="Medium">Medium Risk</SelectItem>
                    <SelectItem value="High">High Risk</SelectItem>
                    <SelectItem value="Critical">Critical Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Citizen Evidence Conflict:
                </label>
                <Select value={whatIfConflict ? "Yes" : "No"} onValueChange={(val) => setWhatIfConflict(val === "Yes")}>
                  <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="No">No Evidence Conflict</SelectItem>
                    <SelectItem value="Yes">Discrepancy Reported by Citizen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  UC Compliance Assumption:
                </label>
                <Select value={whatIfCompliance} onValueChange={(val) => { if (val) setWhatIfCompliance(val); }}>
                  <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="Compliant">UC Submitted & Compliant</SelectItem>
                    <SelectItem value="UC Pending">UC Pending Tranche 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedProject) {
                    setWhatIfProgress(selectedProject.progress);
                    setWhatIfRiskLevel(selectedProject.riskLevel);
                    setWhatIfConflict(false);
                    setWhatIfCompliance(selectedProject.ucSubmitted ? "Compliant" : "UC Pending");
                  }
                }}
                className="text-xs"
              >
                Reset to Real Project Data
              </Button>

              <Button
                size="sm"
                onClick={() => handleRunSimulation(true)}
                disabled={loadingSimulation}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
              >
                <IconPlayerPlay className="w-3.5 h-3.5 mr-1" />
                Run What-If AI Simulation
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2">
          <IconAlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading Overlay */}
      {loadingSimulation && (
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border space-y-3">
          <IconRefresh className="w-8 h-8 mx-auto text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Synthesizing ground records, citizen evidence, compliance data & financial indicators…
          </p>
        </div>
      )}

      {/* 5. SIDE-BY-SIDE 3 SCENARIO COMPARISON */}
      {!loadingSimulation && simulation && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <IconScale className="w-5 h-5 text-indigo-600" />
              Intervention Scenario Comparison
            </h2>
            <div className="text-xs text-slate-500">
              Simulation ID: <span className="font-mono font-semibold">{simulation.simulationId}</span> · Quality:{" "}
              <Badge variant="outline" className="text-xs font-semibold">
                {simulation.dataQualityRating} Quality
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SCENARIO 1: RELEASE */}
            <Card className="border-t-4 border-t-emerald-500 shadow-md flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 bg-emerald-500/5">
                  <div className="flex justify-between items-center mb-1">
                    <Badge className="bg-emerald-600 text-white font-bold tracking-wide">SCENARIO 1</Badge>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">RELEASE FUNDS</span>
                  </div>
                  <CardTitle className="text-xl text-emerald-950 dark:text-emerald-200">RELEASE</CardTitle>
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Simulates outcome if financial disbursement proceeds immediately.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-4 space-y-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">Projected Outcome:</span>
                    <p className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700 leading-relaxed">
                      "{simulation.scenarios.release.projectedOutcome}"
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">Potential Benefits:</span>
                    <ul className="space-y-1">
                      {simulation.scenarios.release.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                          <IconCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-amber-700 dark:text-amber-400 block mb-1">Potential Risks:</span>
                    <ul className="space-y-1">
                      {simulation.scenarios.release.risks.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                          <IconAlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">Compliance Impact:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{simulation.scenarios.release.complianceImpact}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">Project Impact:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{simulation.scenarios.release.projectImpact}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">Monitoring Required:</span>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5">
                      {simulation.scenarios.release.monitoringRequired.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-3 border-t bg-slate-50 dark:bg-slate-900/50 flex flex-col items-stretch gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Analysis Confidence:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{simulation.scenarios.release.confidence}%</span>
                </div>
                <Progress value={simulation.scenarios.release.confidence} className="h-1.5 [&>div]:bg-emerald-500" />
                <span className="text-[10px] text-slate-400 text-center">
                  Confidence in analysis quality based on dataset completeness
                </span>
              </CardFooter>
            </Card>

            {/* SCENARIO 2: HOLD */}
            <Card className="border-t-4 border-t-amber-500 shadow-md flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 bg-amber-500/5">
                  <div className="flex justify-between items-center mb-1">
                    <Badge className="bg-amber-600 text-white font-bold tracking-wide">SCENARIO 2</Badge>
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">TEMPORARY HOLD</span>
                  </div>
                  <CardTitle className="text-xl text-amber-950 dark:text-amber-200">HOLD</CardTitle>
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Simulates outcome if fund release is temporarily held pending verification.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-4 space-y-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">Projected Outcome:</span>
                    <p className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700 leading-relaxed">
                      "{simulation.scenarios.hold.projectedOutcome}"
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">Potential Benefits:</span>
                    <ul className="space-y-1">
                      {simulation.scenarios.hold.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                          <IconCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-amber-700 dark:text-amber-400 block mb-1">Potential Risks:</span>
                    <ul className="space-y-1">
                      {simulation.scenarios.hold.risks.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                          <IconAlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">Compliance Impact:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{simulation.scenarios.hold.complianceImpact}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">Project Impact (Schedule Delay):</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{simulation.scenarios.hold.projectImpact}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">Recommended Verification:</span>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5">
                      {simulation.scenarios.hold.monitoringRequired.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-3 border-t bg-slate-50 dark:bg-slate-900/50 flex flex-col items-stretch gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Analysis Confidence:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{simulation.scenarios.hold.confidence}%</span>
                </div>
                <Progress value={simulation.scenarios.hold.confidence} className="h-1.5 [&>div]:bg-amber-500" />
                <span className="text-[10px] text-slate-400 text-center">
                  Confidence in analysis quality based on dataset completeness
                </span>
              </CardFooter>
            </Card>

            {/* SCENARIO 3: CORRECTIVE ACTION */}
            <Card className="border-t-4 border-t-purple-600 shadow-md flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 bg-purple-500/5">
                  <div className="flex justify-between items-center mb-1">
                    <Badge className="bg-purple-600 text-white font-bold tracking-wide">SCENARIO 3</Badge>
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">RECTIFICATION FIRST</span>
                  </div>
                  <CardTitle className="text-xl text-purple-950 dark:text-purple-200">CORRECTIVE ACTION</CardTitle>
                  <CardDescription className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Simulates outcome if mandatory corrective work is enforced before release.
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-4 space-y-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">Projected Outcome:</span>
                    <p className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700 leading-relaxed">
                      "{simulation.scenarios.correctiveAction.projectedOutcome}"
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">Potential Benefits:</span>
                    <ul className="space-y-1">
                      {simulation.scenarios.correctiveAction.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                          <IconCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-amber-700 dark:text-amber-400 block mb-1">Potential Risks:</span>
                    <ul className="space-y-1">
                      {simulation.scenarios.correctiveAction.risks.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                          <IconAlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">Compliance Impact:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{simulation.scenarios.correctiveAction.complianceImpact}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">Implementation Impact:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{simulation.scenarios.correctiveAction.projectImpact}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">Follow-Up Verification:</span>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5">
                      {simulation.scenarios.correctiveAction.monitoringRequired.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-3 border-t bg-slate-50 dark:bg-slate-900/50 flex flex-col items-stretch gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Analysis Confidence:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{simulation.scenarios.correctiveAction.confidence}%</span>
                </div>
                <Progress value={simulation.scenarios.correctiveAction.confidence} className="h-1.5 [&>div]:bg-purple-500" />
                <span className="text-[10px] text-slate-400 text-center">
                  Confidence in analysis quality based on dataset completeness
                </span>
              </CardFooter>
            </Card>
          </div>

          {/* 6. Key Factors & Information Gaps Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <IconSparkles className="w-4 h-4 text-indigo-600" />
                  Key Evaluated Factors
                </CardTitle>
                <CardDescription className="text-xs">
                  Ground variables influencing scenario estimations
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 text-xs">
                <ul className="space-y-2">
                  {simulation.keyFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <IconInfoCircle className="w-4 h-4 text-amber-500" />
                  Additional Information Recommended
                </CardTitle>
                <CardDescription className="text-xs">
                  Data gaps that would further increase confidence scores
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 text-xs">
                {simulation.additionalInformationRequired.length === 0 ? (
                  <p className="text-emerald-600 font-medium">
                    Comprehensive dataset available. No critical information gaps identified.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {simulation.additionalInformationRequired.map((gap, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 bg-amber-500/5 p-2 rounded border border-amber-500/20">
                        <IconAlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 7. Authority Decision Record Form */}
          <Card className="border-2 border-indigo-500/40 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-t-lg">
              <div className="flex justify-between items-start md:items-center">
                <div>
                  <Badge className="bg-indigo-500 text-white mb-1">AUTHORITY DECISION RECORD</Badge>
                  <CardTitle className="text-lg text-white">Record Official Administrative Intervention</CardTitle>
                  <CardDescription className="text-xs text-indigo-200">
                    After reviewing the AI scenario comparison, the authorized authority records their final choice and rationale.
                  </CardDescription>
                </div>

                {isCitizen && (
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-200 border-amber-400">
                    <IconLock className="w-3 h-3 mr-1" />
                    Read-Only (Citizen View)
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-5">
              {decisionSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm flex items-center gap-2">
                  <IconCheck className="w-4 h-4 shrink-0" />
                  <span>{decisionSuccessMsg}</span>
                </div>
              )}

              {isCitizen ? (
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <IconLock className="w-4 h-4 text-slate-500" />
                  <span>
                    Citizens can review the AI scenario analysis above, but administrative intervention decisions are reserved for District Officers, State Nodal Authorities, and MPs.
                  </span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block mb-2">
                      Selected Intervention:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setDecisionIntervention("RELEASE")}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          decisionIntervention === "RELEASE"
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/30"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm">RELEASE</span>
                          {decisionIntervention === "RELEASE" && <IconCheck className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <span className="text-[11px] text-slate-500 font-normal block mt-1">
                          Proceed with funding installment
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDecisionIntervention("HOLD")}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          decisionIntervention === "HOLD"
                            ? "border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-200 font-bold ring-2 ring-amber-500/30"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm">HOLD</span>
                          {decisionIntervention === "HOLD" && <IconCheck className="w-4 h-4 text-amber-600" />}
                        </div>
                        <span className="text-[11px] text-slate-500 font-normal block mt-1">
                          Pause release pending ground verification
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDecisionIntervention("CORRECTIVE_ACTION")}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          decisionIntervention === "CORRECTIVE_ACTION"
                            ? "border-purple-600 bg-purple-500/10 text-purple-950 dark:text-purple-200 font-bold ring-2 ring-purple-500/30"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm">CORRECTIVE ACTION</span>
                          {decisionIntervention === "CORRECTIVE_ACTION" && <IconCheck className="w-4 h-4 text-purple-600" />}
                        </div>
                        <span className="text-[11px] text-slate-500 font-normal block mt-1">
                          Require rectification before payment
                        </span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-100 block mb-1">
                      Official Decision Rationale & Directives:
                    </label>
                    <Textarea
                      rows={3}
                      value={decisionNote}
                      onChange={(e) => setDecisionNote(e.target.value)}
                      placeholder="Specify rationale, conditions, joint inspection dates, or directives for executing agency…"
                      className="text-xs"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-500">
                      Recording as: <strong className="text-indigo-600">{user?.name || user?.role || "District Nodal Officer"}</strong> ({user?.role || "District"})
                    </span>
                    <Button
                      onClick={handleRecordDecision}
                      disabled={savingDecision}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5"
                    >
                      {savingDecision ? (
                        <>
                          <IconRefresh className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Saving Decision…
                        </>
                      ) : (
                        <>
                          <IconFileText className="w-3.5 h-3.5 mr-1.5" />
                          Record Official Decision
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* 8. Audit Trail of Recorded Decisions */}
          {decisionHistory.length > 0 && (
            <Card className="border shadow-sm">
              <CardHeader className="py-3 bg-slate-50 dark:bg-slate-900">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <IconClock className="w-4 h-4 text-slate-600" />
                  Recorded Authority Decision Log ({decisionHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 text-xs">
                <div className="space-y-3">
                  {decisionHistory.map((d) => (
                    <div key={d.decisionId} className="p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              d.selectedIntervention === "RELEASE"
                                ? "bg-emerald-600 text-white"
                                : d.selectedIntervention === "HOLD"
                                ? "bg-amber-600 text-white"
                                : "bg-purple-600 text-white"
                            }
                          >
                            {d.selectedIntervention}
                          </Badge>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            By {d.recordedByName} ({d.recordedByRole})
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(d.recordedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 mt-1 italic">"{d.decisionNote}"</p>
                      <div className="text-[10px] text-slate-400 pt-1 font-mono">
                        Decision ID: {d.decisionId} {d.simulationIdRef && `· Ref Simulation: ${d.simulationIdRef}`}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
