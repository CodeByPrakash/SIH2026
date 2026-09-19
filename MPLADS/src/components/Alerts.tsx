"use client";

import * as React from "react";
import { ALERTS } from "@/data/mpladsData";
import type { Alert } from "@/types";
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
} from "@tabler/icons-react";

export default function Alerts() {
  const [alertsList, setAlertsList] = React.useState<Alert[]>(ALERTS);
  const [selectedAlert, setSelectedAlert] = React.useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterSev, setFilterSev] = React.useState<string>("All");
  const [filterType, setFilterType] = React.useState<string>("All");
  const [filterStatus, setFilterStatus] = React.useState<string>("All");

  const filtered = React.useMemo(() => {
    return alertsList.filter((a) => {
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
  }, [alertsList, searchQuery, filterSev, filterType, filterStatus]);

  const stats = React.useMemo(() => {
    return {
      active: alertsList.filter((a) => a.status === "Active").length,
      critical: alertsList.filter((a) => a.severity === "Critical").length,
      high: alertsList.filter((a) => a.severity === "High").length,
      medium: alertsList.filter((a) => a.severity === "Medium").length,
      low: alertsList.filter((a) => a.severity === "Low").length,
    };
  }, [alertsList]);

  const handleAcknowledge = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAlertsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Acknowledged" } : a))
    );
    if (selectedAlert && selectedAlert.id === id) {
      setSelectedAlert((prev) => (prev ? { ...prev, status: "Acknowledged" } : null));
    }
  };

  const handleResolve = (id: string) => {
    setAlertsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Resolved" } : a))
    );
    setSelectedAlert(null);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Alerts Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              Early Warning Alerts & Risk Triage
            </h1>
            <Badge variant="destructive" className="font-mono text-[10px]">
              {stats.active} ACTIVE
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Intelligent prioritization • Predictive risk detection • SLA breach prevention
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
              setAlertsList((prev) =>
                prev.map((a) => (a.status === "Active" ? { ...a, status: "Acknowledged" } : a))
              );
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
