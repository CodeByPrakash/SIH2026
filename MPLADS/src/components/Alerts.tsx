"use client";

import * as React from "react";
import { ALERTS } from "@/data/mpladsData";
import { useAlerts } from "@/hooks/useAlerts";
import type { Alert, User } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconAlertTriangle,
  IconShieldExclamation,
  IconBell,
  IconClock,
  IconCheck,
  IconCircleCheck,
  IconSearch,
  IconRefresh,
  IconArrowRight,
  IconFlame,
  IconFilter,
} from "@tabler/icons-react";

interface AlertsProps {
  user?: User;
}

export default function Alerts({ user }: AlertsProps = {}) {
  const { alerts, isLive, lastUpdated, acknowledgeAlert, resolveAlert } = useAlerts();
  const [selectedAlert, setSelectedAlert] = React.useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterSev, setFilterSev] = React.useState<string>("All");
  const [filterType, setFilterType] = React.useState<string>("All");
  const [filterStatus, setFilterStatus] = React.useState<string>("All");
  const [viewScope, setViewScope] = React.useState<"role" | "all">("role");

  // Filter alerts by role relevance
  const roleAlerts = React.useMemo(() => {
    if (!user) return alerts;
    if (user.role === "Citizen") return [];

    return alerts.filter((a) => {
      if (a.roles && a.roles.length > 0) {
        return a.roles.includes(user.role);
      }
      if (user.role === "Ministry") return true;
      if (user.role === "MP") {
        return !a.constituency || a.constituency === user.constituency;
      }
      if (user.role === "State") {
        return !a.state || a.state === user.state;
      }
      if (user.role === "District") {
        return !a.district || a.district === user.district;
      }
      return true;
    });
  }, [alerts, user]);

  const baseAlerts = viewScope === "role" && user && user.role !== "Citizen" ? roleAlerts : alerts;

  const filtered = React.useMemo(() => {
    return baseAlerts.filter((a) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.district && a.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.state && a.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (a.projectId && a.projectId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSev = filterSev === "All" || a.severity === filterSev;
      const matchType = filterType === "All" || a.type === filterType;
      const matchStatus = filterStatus === "All" || a.status === filterStatus;

      return matchSearch && matchSev && matchType && matchStatus;
    });
  }, [baseAlerts, searchQuery, filterSev, filterType, filterStatus]);

  const stats = React.useMemo(() => {
    return {
      active: baseAlerts.filter((a) => a.status === "Active").length,
      critical: baseAlerts.filter((a) => a.severity === "Critical").length,
      high: baseAlerts.filter((a) => a.severity === "High").length,
      medium: baseAlerts.filter((a) => a.severity === "Medium").length,
      low: baseAlerts.filter((a) => a.severity === "Low").length,
    };
  }, [baseAlerts]);

  const handleAcknowledge = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    acknowledgeAlert(id);
    if (selectedAlert && selectedAlert.id === id) {
      setSelectedAlert((prev) => (prev ? { ...prev, status: "Acknowledged" } : null));
    }
  };

  const handleResolve = (id: string) => {
    resolveAlert(id);
    setSelectedAlert(null);
  };

  if (user?.role === "Citizen") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="border-border/60 shadow-sm text-center">
          <CardHeader className="pb-3">
            <div className="mx-auto size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <IconBell className="size-6" />
            </div>
            <CardTitle className="text-xl font-bold">Internal Risk Alerts & Triage</CardTitle>
            <CardDescription className="text-sm">
              Early warning risk triage and critical threshold escalation are reserved for parliamentary, ministry, and district administrative authorities.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pb-6">
            Citizens have full access to public project tracking, fund utilization statistics, and the Citizen Feedback & Grievance reporting portal.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Top Alerts Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Early Warning Alerts & Risk Triage
            </h1>
            <Badge variant="destructive" className="font-mono text-[10px]">
              {stats.active} ACTIVE
            </Badge>
            {user && (
              <Badge variant="outline" className="text-[11px] font-medium border-primary/30 text-primary bg-primary/5">
                {user.role === "Ministry"
                  ? "Ministry / National Scope"
                  : user.role === "MP"
                  ? `Constituency: ${user.constituency || "Varanasi"}`
                  : user.role === "State"
                  ? `State: ${user.state || "Department"}`
                  : `District: ${user.district || "Administration"}`}
              </Badge>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                isLive
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              <span className={`size-1.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              {isLive ? "Live Sync" : "Static Mode"}
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Intelligent prioritization • Predictive risk detection • SLA breach prevention
            {lastUpdated && ` · Last synced: ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {user && (
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewScope("role")}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  viewScope === "role"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                My Role Alerts ({roleAlerts.length})
              </button>
              <button
                type="button"
                onClick={() => setViewScope("all")}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  viewScope === "all"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Alerts ({alerts.length})
              </button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilterSev("All");
              setFilterType("All");
              setFilterStatus("All");
              setSearchQuery("");
            }}
            className="text-xs h-9 gap-1.5"
          >
            <IconRefresh className="size-4" />
            <span>Reset Filters</span>
          </Button>
          <Button
            size="sm"
            onClick={() => {
              baseAlerts
                .filter((a) => a.status === "Active")
                .forEach((a) => acknowledgeAlert(a.id));
            }}
            className="text-xs h-9 gap-1.5 font-medium"
          >
            <IconCheck className="size-4" />
            <span>Acknowledge All</span>
          </Button>
        </div>
      </div>

      {/* ── Summary Strip / Metric Cards ── */}
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {/* Active Alerts */}
        <Card
          className={`@container/card cursor-pointer transition-all ${
            filterStatus === "Active" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setFilterStatus((curr) => (curr === "Active" ? "All" : "Active"))}
        >
          <CardHeader>
            <CardDescription>Active Alerts</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
              {stats.active}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                <IconBell className="size-3.5 mr-1" />
                Live Feed
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-xs">
            <div className="line-clamp-1 font-medium text-foreground">Requires immediate review</div>
            <div className="text-muted-foreground">Across all constituencies</div>
          </CardFooter>
        </Card>

        {/* Critical Alerts */}
        <Card
          className={`@container/card cursor-pointer transition-all ${
            filterSev === "Critical" ? "ring-2 ring-destructive" : ""
          }`}
          onClick={() => setFilterSev((curr) => (curr === "Critical" ? "All" : "Critical"))}
        >
          <CardHeader>
            <CardDescription>Critical Severity</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-destructive @[250px]/card:text-3xl">
              {stats.critical}
            </CardTitle>
            <CardAction>
              <Badge variant="destructive">
                <IconFlame className="size-3.5 mr-1 animate-pulse" />
                Urgent Action
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-xs">
            <div className="line-clamp-1 font-medium text-destructive">Lapse risk & debarments</div>
            <div className="text-muted-foreground">SLA breach imminent</div>
          </CardFooter>
        </Card>

        {/* High Priority Alerts */}
        <Card
          className={`@container/card cursor-pointer transition-all ${
            filterSev === "High" ? "ring-2 ring-amber-500" : ""
          }`}
          onClick={() => setFilterSev((curr) => (curr === "High" ? "All" : "High"))}
        >
          <CardHeader>
            <CardDescription>High Priority</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-amber-600 @[250px]/card:text-3xl">
              {stats.high}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-500/10">
                <IconAlertTriangle className="size-3.5 mr-1" />
                Warning
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-xs">
            <div className="line-clamp-1 font-medium text-foreground">UC overdue & delay risks</div>
            <div className="text-muted-foreground">Second escalation level</div>
          </CardFooter>
        </Card>

        {/* Medium & Low Alerts */}
        <Card
          className={`@container/card cursor-pointer transition-all ${
            filterSev === "Medium" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => setFilterSev((curr) => (curr === "Medium" ? "All" : "Medium"))}
        >
          <CardHeader>
            <CardDescription>Medium & Low</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums text-foreground @[250px]/card:text-3xl">
              {stats.medium + stats.low}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <IconShieldExclamation className="size-3.5 mr-1" />
                Under Watch
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-xs">
            <div className="line-clamp-1 font-medium text-foreground">Slowdown & anomaly tracking</div>
            <div className="text-muted-foreground">Predictive surveillance</div>
          </CardFooter>
        </Card>
      </div>

      {/* ── Filters & Search Bar ── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search alerts by title, district, state, or work ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
              <Select value={filterSev} onValueChange={(val) => val && setFilterSev(val)}>
                <SelectTrigger size="sm" className="w-32 text-xs">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="All">All Severities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={(val) => val && setFilterType(val)}>
                <SelectTrigger size="sm" className="w-32 text-xs">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Delay">Delay</SelectItem>
                  <SelectItem value="Anomaly">Anomaly</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Utilization">Utilization</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={(val) => val && setFilterStatus(val)}>
                <SelectTrigger size="sm" className="w-32 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Badge variant="secondary" className="text-xs h-8 px-2.5 flex items-center font-mono">
                {filtered.length} Results
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Alerts Cards List ── */}
      <div className="space-y-3.5">
        {filtered.map((alert) => {
          const isCrit = alert.severity === "Critical";
          const isHigh = alert.severity === "High";
          return (
            <Card
              key={alert.id}
              className="transition-all hover:shadow-md cursor-pointer border-l-4"
              style={{
                borderLeftColor: isCrit
                  ? "var(--destructive)"
                  : isHigh
                  ? "#F59E0B"
                  : "var(--chart-1)",
              }}
              onClick={() => setSelectedAlert(alert)}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={isCrit ? "destructive" : "outline"}
                      className={`text-xs uppercase font-bold px-2 py-0.5 ${
                        isHigh ? "border-amber-500/50 text-amber-600 bg-amber-500/10" : ""
                      }`}
                    >
                      {alert.severity}
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {alert.type}
                    </Badge>
                    <Badge
                      variant={
                        alert.status === "Active"
                          ? "destructive"
                          : alert.status === "Acknowledged"
                          ? "outline"
                          : "default"
                      }
                      className={`text-xs px-2 py-0.5 font-medium ${
                        alert.status === "Acknowledged"
                          ? "border-amber-500/50 text-amber-600 bg-amber-500/10"
                          : ""
                      }`}
                    >
                      {alert.status}
                    </Badge>
                    {alert.projectId && (
                      <span className="text-xs font-mono text-muted-foreground">
                        {alert.projectId}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {alert.createdAt}
                  </span>
                </div>
                <CardTitle className="text-sm md:text-base font-semibold text-foreground mt-1.5">
                  {alert.title}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  {alert.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                <div className="rounded-lg bg-muted/60 p-3 text-xs text-foreground border border-border/60">
                  <div className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                    <IconAlertTriangle className="size-3.5 text-amber-500" />
                    <span>Mandatory Action Required:</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{alert.actionRequired}</p>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span>
                    Location:{" "}
                    <strong className="text-foreground">
                      {alert.district ? `${alert.district}, ${alert.state}` : alert.state || "National"}
                    </strong>
                  </span>
                  {alert.daysRemaining !== undefined && (
                    <span className="flex items-center gap-1 text-destructive font-medium">
                      <IconClock className="size-3.5" />
                      {alert.daysRemaining > 0 ? `${alert.daysRemaining} days delay` : "Overdue"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
                  {alert.status === "Active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleAcknowledge(alert.id, e)}
                      className="text-xs h-8 px-3 gap-1.5"
                    >
                      <IconCheck className="size-3.5" />
                      <span>Acknowledge</span>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAlert(alert);
                    }}
                    className="text-xs h-8 px-3 gap-1.5 font-medium"
                  >
                    <span>Investigate & Resolve</span>
                    <IconArrowRight className="size-3.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* ── Alert Detail Modal / Dialog ── */}
      {selectedAlert && (
        <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
          <DialogContent className="sm:max-w-lg p-5">
            <DialogHeader className="pr-8">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge
                  variant={selectedAlert.severity === "Critical" ? "destructive" : "outline"}
                  className="text-xs uppercase font-bold px-2 py-0.5"
                >
                  {selectedAlert.severity}
                </Badge>
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {selectedAlert.type}
                </Badge>
                <Badge
                  variant={selectedAlert.status === "Active" ? "destructive" : "outline"}
                  className="text-xs font-mono px-2 py-0.5"
                >
                  {selectedAlert.status}
                </Badge>
              </div>
              <DialogTitle className="text-base font-bold text-foreground leading-snug">
                {selectedAlert.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Triggered on {selectedAlert.createdAt} • Surveillance telemetry
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 text-xs">
              <p className="text-muted-foreground leading-relaxed text-xs">
                {selectedAlert.description}
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg bg-muted/50 p-2.5 border border-border/50">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Jurisdiction</div>
                  <div className="font-semibold text-foreground mt-0.5 truncate">
                    {selectedAlert.district ? `${selectedAlert.district}, ${selectedAlert.state}` : selectedAlert.state || "National"}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5 border border-border/50">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Project Work ID</div>
                  <div className="font-mono font-semibold text-foreground mt-0.5 truncate">
                    {selectedAlert.projectId || "Multi-Work Scope"}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/60 p-3 border border-border/70">
                <div className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1.5">
                  <IconAlertTriangle className="size-3.5 text-amber-500" />
                  <span>Required Resolution Protocol:</span>
                </div>
                <p className="text-foreground leading-relaxed">{selectedAlert.actionRequired}</p>
              </div>
            </div>

            <DialogFooter className="gap-2.5 sm:gap-2.5 sm:justify-end mt-2">
              {selectedAlert.status === "Active" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAcknowledge(selectedAlert.id)}
                  className="text-xs h-8 px-3 gap-1.5"
                >
                  <IconCheck className="size-3.5" />
                  <span>Mark Acknowledged</span>
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => handleResolve(selectedAlert.id)}
                className="text-xs h-8 px-3 gap-1.5 font-medium"
              >
                <IconCircleCheck className="size-3.5" />
                <span>Resolve Alert</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
