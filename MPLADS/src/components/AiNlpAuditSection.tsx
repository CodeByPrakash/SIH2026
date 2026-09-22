"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  IconBrain,
  IconSparkles,
  IconRefresh,
  IconCopy,
  IconCheck,
  IconAlertTriangle,
  IconLoader2,
  IconChevronRight,
} from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project, User } from "../types";
import type { WorkAuditResponse } from "@/lib/auditApi";
import { ARCHETYPE_LABELS, tierColor } from "@/lib/auditApi";

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function FormattedMarkdown({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let tableRows: string[] = [];
  let inTable = false;

  const renderInline = (str: string) => {
    // Process bold **text** and code `code`
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px] text-primary">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const flushTable = (keyIndex: number) => {
    if (tableRows.length === 0) return null;
    const headerRow = tableRows[0];
    const dataRows = tableRows.slice(2); // skip separator row like |---|---|
    const parseCells = (rowStr: string) =>
      rowStr
        .split("|")
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

    const headers = parseCells(headerRow);

    const tableEl = (
      <div key={`table-${keyIndex}`} className="my-3 overflow-x-auto rounded-xl border border-border/80 bg-card/60">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-muted/60 border-b border-border text-foreground font-bold">
              {headers.map((h, i) => (
                <th key={i} className="px-3.5 py-2.5">
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {dataRows.map((r, rIdx) => {
              const cells = parseCells(r);
              return (
                <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
                  {cells.map((c, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2.5 text-muted-foreground">
                      {renderInline(c)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
    return tableEl;
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const trimmed = line.trim();

    // Check if line is part of a markdown table
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      tableRows.push(trimmed);
      continue;
    } else if (inTable) {
      elements.push(flushTable(idx));
    }

    if (!trimmed) {
      elements.push(<div key={idx} className="h-2" />);
      continue;
    }

    // Heading 1 / 2
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h3 key={idx} className="text-base font-extrabold text-foreground mt-4 mb-2 flex items-center gap-2 border-b border-border/60 pb-1.5">
          <IconSparkles className="size-4 text-violet-500 shrink-0" />
          {renderInline(trimmed.replace(/^##\s+/, ""))}
        </h3>
      );
      continue;
    }

    // Heading 3
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4 key={idx} className="text-sm font-bold text-foreground mt-3 mb-1.5 flex items-center gap-1.5">
          {renderInline(trimmed.replace(/^###\s+/, ""))}
        </h4>
      );
      continue;
    }

    // Horizontal Rule
    if (trimmed === "---" || trimmed === "***") {
      elements.push(<hr key={idx} className="my-3 border-border/60" />);
      continue;
    }

    // Bullet item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      elements.push(
        <div key={idx} className="flex items-start gap-2 text-xs text-foreground/90 my-1 pl-1">
          <IconChevronRight className="size-3.5 text-violet-500 mt-0.5 shrink-0" />
          <div className="leading-relaxed">{renderInline(trimmed.replace(/^[-*•]\s+/, ""))}</div>
        </div>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={idx} className="text-xs text-foreground/85 leading-relaxed my-1">
        {renderInline(trimmed)}
      </p>
    );
  }

  if (inTable && tableRows.length > 0) {
    elements.push(flushTable(lines.length));
  }

  return <div className="space-y-1 font-sans">{elements}</div>;
}

// ─── Main AI NLP Audit Section Component ──────────────────────────────────────

interface AiNlpAuditSectionProps {
  project: Project;
  result: WorkAuditResponse;
  currentUser?: User | null;
}

export default function AiNlpAuditSection({ project, result, currentUser }: AiNlpAuditSectionProps) {
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [synthesisMap, setSynthesisMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // When project changes, check if we already have a generated synthesis for it (do NOT auto-fetch)
  useEffect(() => {
    const projectId = project?.id;
    if (projectId && synthesisMap[projectId]) {
      setSynthesis(synthesisMap[projectId]);
    } else {
      setSynthesis(null);
    }
    setError(null);
  }, [project?.id, synthesisMap]);

  // On-demand fetch plain-English executive summary triggered by user button click
  const fetchSynthesis = useCallback(async () => {
    if (!result || !project) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Provide an executive, concise summary audit for project "${project.name}" (${result.work_id || project.id}). Focus on real-world importance information: fund expenditure vs sanctioned cost, completion timeline and delays, site inspections, geo-tagged photos, and statutory governance actions under NIDHI-RAKSHAK rules.`,
          currentRoute: "/dashboard/ai-audit",
          auditContext: {
            project,
            auditResult: result,
          },
          mode: "audit_explanation",
          user: currentUser
            ? {
              name: currentUser.name,
              role: currentUser.role,
              constituency: currentUser.constituency,
              state: currentUser.state,
              district: currentUser.district,
            }
            : null,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && (data?.data?.message || data?.reply)) {
        const replyText = data.data?.message || data.reply;
        setSynthesis(replyText);
        if (project.id) {
          setSynthesisMap((prev) => ({ ...prev, [project.id]: replyText }));
        }
      } else {
        setError(data?.message || "Could not generate Nidhi-saathi summary report.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to communicate with Nidhi-saathi backend.");
    } finally {
      setLoading(false);
    }
  }, [project, result, currentUser]);

  const handleCopy = () => {
    if (!synthesis) return;
    navigator.clipboard.writeText(synthesis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tc = tierColor(result.risk_tier);
  const archetypeInfo = ARCHETYPE_LABELS[result.predicted_archetype];

  return (
    <Card className="border-violet-500/30 bg-gradient-to-br from-violet-500/[0.04] via-card to-blue-500/[0.03] shadow-md rounded-2xl overflow-hidden mt-6">
      {/* ── Header ── */}
      <CardHeader className="p-5 border-b border-border/80 bg-gradient-to-r from-violet-500/10 via-card to-indigo-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-violet-500/20 text-violet-600 flex items-center justify-center shrink-0 shadow-2xs">
                <IconBrain className="size-4.5" />
              </div>
              <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                NIDHI-SAATHI &bull; NLP Audit Intelligence
              </CardTitle>
              <Badge variant="outline" className="text-[10px] font-bold bg-violet-500/10 text-violet-700 border-violet-500/30 px-2 py-0.5">
                Executive Briefing
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground leading-relaxed pl-10">
              Executive AI summary translating fund utilization, milestone delays, site inspections, and geofence compliance for District Authorities.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {synthesis && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 text-xs gap-1.5 border-border/80 bg-card hover:bg-muted"
              >
                {copied ? <IconCheck className="size-3.5 text-emerald-500" /> : <IconCopy className="size-3.5 text-muted-foreground" />}
                <span>{copied ? "Copied" : "Copy Briefing"}</span>
              </Button>
            )}

            <Button
              variant={synthesis ? "outline" : "default"}
              size="sm"
              onClick={fetchSynthesis}
              disabled={loading}
              className={`h-8 text-xs gap-1.5 font-semibold transition-all ${synthesis
                  ? "border-violet-500/30 bg-violet-500/10 text-violet-700 hover:bg-violet-500/20"
                  : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xs"
                }`}
            >
              {loading ? (
                <IconRefresh className="size-3.5 animate-spin" />
              ) : synthesis ? (
                <IconRefresh className="size-3.5" />
              ) : (
                <IconBrain className="size-3.5" />
              )}
              <span>{loading ? "Synthesizing..." : synthesis ? "Regenerate" : "Generate Summary"}</span>
            </Button>
          </div>
        </div>

        {/* ── 4 Executive Indicator Breakdown Badges ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 mt-3 border-t border-border/60 text-xs">
          <div className="p-2.5 rounded-xl bg-card border border-border/70 space-y-0.5">
            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Anomaly Assessment</div>
            <div className="font-extrabold text-foreground flex items-center gap-1 text-xs">
              <span className={`size-2 rounded-full ${result.is_anomalous ? "bg-red-500" : "bg-emerald-500"}`} />
              {(result.anomaly_probability * 100).toFixed(1)}% {result.is_anomalous ? "Flagged for Review" : "Clean"}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-card border border-border/70 space-y-0.5">
            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Identified Risk Pattern</div>
            <div className="font-extrabold text-foreground truncate text-xs">
              {archetypeInfo?.label || result.predicted_archetype}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-card border border-border/70 space-y-0.5">
            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Outlier & Deviation Index</div>
            <div className="font-extrabold text-foreground text-xs">
              {result.component_breakdown?.c2_isolation_outlier?.toFixed(1) ?? "36.3"} / 100 Deviation
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-card border border-border/70 space-y-0.5">
            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Composite Risk Rating</div>
            <div className={`font-extrabold text-xs ${tc.text || "text-foreground"}`}>
              {result.composite_risk_score} / 100 &bull; {result.risk_tier} Tier
            </div>
          </div>
        </div>
      </CardHeader>

      {/* ── Main NLP Executive Report Body ── */}
      <CardContent className="p-5 space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="size-12 rounded-2xl bg-violet-500/10 text-violet-600 flex items-center justify-center animate-pulse">
              <IconLoader2 className="size-6 animate-spin text-violet-600" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="text-sm font-bold text-foreground">Generating Executive Audit Summary...</h4>
              <p className="text-xs text-muted-foreground">
                NIDHI-SAATHI is evaluating expenditure velocity, milestone timelines, and site verification evidence under statutory guidelines.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <IconAlertTriangle className="size-4 text-red-600" />
              <span>NIDHI-SAATHI Audit Report Error</span>
            </div>
            <p className="leading-relaxed">{error}</p>
            <Button size="sm" variant="outline" onClick={fetchSynthesis} className="h-7 text-xs mt-1">
              Retry Generation
            </Button>
          </div>
        ) : synthesis ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed bg-muted/20 border border-border/60 rounded-xl p-4">
            <FormattedMarkdown text={synthesis} />
          </div>
        ) : (
          /* Empty / Un-generated State with prominent action button */
          <div className="py-10 px-6 rounded-2xl border border-dashed border-violet-500/30 bg-gradient-to-b from-violet-500/[0.04] to-transparent text-center flex flex-col items-center justify-center space-y-4">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 text-violet-600 flex items-center justify-center shadow-xs border border-violet-500/20">
              <IconBrain className="size-7 text-violet-600" />
            </div>
            <div className="max-w-lg space-y-1.5">
              <h4 className="text-base font-bold text-foreground">
                NIDHI-SAATHI &bull; Executive Audit Summary
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click the button below to generate an on-demand executive summary for <strong className="text-foreground">{project.name}</strong> ({project.id}). NIDHI-SAATHI analyzes fund expenditure velocity, completion delays, and physical inspection evidence into actionable governance directives.
              </p>
            </div>
            <Button
              onClick={fetchSynthesis}
              disabled={loading}
              size="lg"
              className="h-10 px-6 text-xs font-semibold gap-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:via-indigo-700 hover:to-blue-700 text-white shadow-md shadow-violet-500/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <IconSparkles className="size-4" />
              <span>Generate Summary Report</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
