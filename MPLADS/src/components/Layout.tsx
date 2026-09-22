"use client";

import * as React from "react";
import Image from "next/image";
import type { User, UserRole } from "@/types";
import { ALERTS } from "@/data/mpladsData";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarRail,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  IconLayoutDashboard,
  IconBuildingCommunity,
  IconMap,
  IconReceiptTax,
  IconShieldExclamation,
  IconBell,
  IconLayersIntersect,
  IconCircleCheck,
  IconChartBar,
  IconHelp,
  IconSettings,
  IconMessageReport,
  IconLogout,
  IconSearch,
  IconSelector,
  IconSparkles,
  IconArrowRight,
  IconAlertTriangle,
  IconClock,
  IconScale,
  IconPhoto,
  IconBrain,
  IconCube,
} from "@tabler/icons-react";

type Page =
  | "dashboard"
  | "projects"
  | "risk"
  | "alerts"
  | "compliance"
  | "gis"
  | "reports"
  | "investigation"
  | "grievance"
  | "evidence"
  | "simulation"
  | "crosscheck"
  | "ai-audit"
  | "3d-view";

interface LayoutProps {
  user: User;
  onLogout: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
  alertCount?: number;
}

interface NavItem {
  id: Page;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const buildNav = (role: UserRole, alertCount: number): NavGroup[] => {
  const monitor: NavItem[] = [
    {
      id: "dashboard",
      label:
        role === "MP"
          ? "My Constituency"
          : role === "District"
          ? "District Overview"
          : role === "State"
          ? "State Dashboard"
          : role === "Ministry"
          ? "National Overview"
          : "Overview",
      sub: "Overview & Key Insights",
      icon: IconLayoutDashboard,
    },
    {
      id: "projects",
      label: "Projects & Works",
      sub: "All Projects & Progress",
      icon: IconBuildingCommunity,
    },
    {
      id: "3d-view",
      label: "3D Digital Twin",
      sub: "3D Layouts & Viewpoints",
      icon: IconCube,
    },
    {
      id: "gis",
      label: "GIS Map View",
      sub: "Geo-spatial Analytics",
      icon: IconMap,
    },
    {
      id: "reports",
      label: "Financial Analytics",
      sub: "Allocations & Trends",
      icon: IconReceiptTax,
    },
  ];

  const intelligence: NavItem[] = [
    {
      id: "ai-audit",
      label: "AI Audit Engine",
      sub: "ML-Powered CAG Anomaly Audit",
      icon: IconBrain,
    },
    {
      id: "crosscheck",
      label: "Photo Geo-CrossCheck AI",
      sub: "Geo-Distance & Image Reuse AI",
      icon: IconPhoto,
    },
    {
      id: "simulation",
      label: "AI Intervention Simulator",
      sub: "Compare Release, Hold & Action",
      icon: IconScale,
    },
    {
      id: "evidence",
      label: "Citizen Evidence AI",
      sub: "Ground Discrepancy Cross-Check",
      icon: IconSparkles,
    },
    {
      id: "risk",
      label: "AI Risk Center",
      sub: "Risk Analysis & Anomaly",
      icon: IconShieldExclamation,
    },
    {
      id: "alerts",
      label: "Alerts & Warnings",
      sub: "Action Required",
      icon: IconBell,
      badge: alertCount,
    },
    {
      id: "investigation",
      label: "Duplicate Detection",
      sub: "Overlapping Works AI",
      icon: IconLayersIntersect,
    },
  ];

  const governance: NavItem[] = [
    {
      id: "compliance",
      label: "Compliance Engine",
      sub: "Guidelines & Audit Checks",
      icon: IconCircleCheck,
    },
    {
      id: "reports",
      label: "Reports & Exports",
      sub: "Analytics & Downloads",
      icon: IconChartBar,
    },
  ];

  const citizenIntelligence: NavItem[] = [
    {
      id: "crosscheck",
      label: "Photo Geo-CrossCheck AI",
      sub: "On-Site Image & Geo Verification",
      icon: IconPhoto,
    },
    {
      id: "simulation",
      label: "AI Intervention Simulator",
      sub: "Compare Scenario Projections",
      icon: IconScale,
    },
    {
      id: "evidence",
      label: "Citizen Evidence AI",
      sub: "Independent Evidence Verification",
      icon: IconSparkles,
    },
    {
      id: "grievance",
      label: "Public Grievances",
      sub: "Submit & Track Complaints",
      icon: IconMessageReport,
    },
  ];

  if (role === "Citizen") {
    return [
      {
        label: "Monitor",
        items: monitor.filter((i) => ["dashboard", "projects", "3d-view", "gis"].includes(i.id)),
      },
      { label: "Citizen Services", items: citizenIntelligence },
      {
        label: "Reports",
        items: [
          {
            id: "reports",
            label: "Public Reports",
            sub: "Constituency Spending & Works",
            icon: IconChartBar,
          },
        ],
      },
    ];
  }

  return [
    { label: "Monitor", items: monitor },
    { label: "AI & Intelligence", items: intelligence },
    { label: "Governance", items: governance },
  ];
};

function UserNavFooter({
  user,
  onLogout,
  onNavigate,
  alertCount = 0,
}: {
  user: User;
  onLogout: () => void;
  onNavigate: (page: Page) => void;
  alertCount?: number;
}) {
  const { isMobile } = useSidebar();
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const location = user.constituency || user.district || user.state || user.role;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8 rounded-lg bg-primary text-primary-foreground font-bold text-xs shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.role} • {location}
              </span>
            </div>
            <IconSelector className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg bg-popover text-popover-foreground border-border"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg bg-primary text-primary-foreground font-bold text-xs shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.role} • {location}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => onNavigate("dashboard")}>
                <IconSparkles className="size-4 mr-2 text-primary" />
                Executive Overview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate("alerts")}>
                <IconBell className="size-4 mr-2 text-muted-foreground" />
                Active Alerts ({alertCount})
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                onLogout();
              }}
              onSelect={() => {
                onLogout();
              }}
            >
              <IconLogout className="size-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function AppSidebar({
  user,
  onLogout,
  currentPage,
  onNavigate,
  alertCount = 0,
}: {
  user: User;
  onLogout: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  alertCount?: number;
}) {
  const groups = buildNav(user.role, alertCount);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* ── Header / Logo ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
              onClick={() => {
                window.location.href = "/";
              }}
              tooltip="National Public Portal"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-lg overflow-hidden shrink-0">
                <Image
                  src="/logo.png"
                  alt="NIDHI-RAKSHAK Logo"
                  width={36}
                  height={36}
                  className="size-full object-contain"
                  priority
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold tracking-tight text-sidebar-foreground text-xs uppercase">
                  NIDHI-RAKSHAK
                </span>
                <span className="truncate text-[10px] text-muted-foreground font-medium">
                  AI Public Fund Monitor
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Navigation groups ── */}
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = currentPage === item.id;
                  const IconComp = item.icon;
                  return (
                    <SidebarMenuItem key={`${group.label}-${item.id}-${item.label}`}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        onClick={() => onNavigate(item.id)}
                      >
                        <IconComp className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && item.badge > 0 ? (
                        <SidebarMenuBadge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* System / Utilities */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Preferences</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="National Public Portal"
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  className="text-primary hover:text-primary font-medium"
                >
                  <IconBuildingCommunity className="size-4 shrink-0 text-primary" />
                  <span>Public Landing Page</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Support & Guidelines">
                  <IconHelp className="size-4 shrink-0 text-muted-foreground" />
                  <span>Help & Guidelines</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                  <IconSettings className="size-4 shrink-0 text-muted-foreground" />
                  <span>System Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer / User Profile ── */}
      <SidebarFooter>
        <UserNavFooter
          user={user}
          onLogout={onLogout}
          onNavigate={onNavigate}
          alertCount={alertCount}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default function Layout({
  user,
  onLogout,
  currentPage,
  onNavigate,
  children,
  alertCount = 0,
}: LayoutProps) {
  const [alertSheetOpen, setAlertSheetOpen] = React.useState(false);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const location = user.constituency || user.district || user.state || user.role;

  const activeAlertsList = React.useMemo(() => {
    return ALERTS.filter((a) => a.status === "Active");
  }, []);

  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AppSidebar
        user={user}
        onLogout={onLogout}
        currentPage={currentPage}
        onNavigate={onNavigate}
        alertCount={alertCount}
      />
      <SidebarInset className="flex flex-col min-w-0 h-screen overflow-hidden bg-background">
        {/* Top Header */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="relative w-full">
              <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search works, sanctions, districts..."
                className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Right Header Status */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = "/";
              }}
              className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold h-8 px-2.5 text-primary border-primary/25 hover:bg-primary/5 cursor-pointer"
            >
              <IconBuildingCommunity className="size-3.5" />
              <span>National Portal</span>
            </Button>

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-foreground">PFMS Live Sync</span>
            </div>
            <Badge variant="outline" className="hidden md:inline-flex text-[11px] font-mono border-border">
              FY 2024-25 Q2
            </Badge>

            {/* Alert Button Triggering Right Side Sheet */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAlertSheetOpen(true)}
              className="relative flex items-center gap-1.5 text-xs font-medium border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2.5"
            >
              <IconBell className="size-3.5" />
              <span>{alertCount} Alerts</span>
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-destructive" />
                </span>
              )}
            </Button>

            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="hidden text-right lg:block">
                <p className="text-xs font-medium leading-none text-foreground">{user.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{location}</p>
              </div>
              <Avatar className="size-7 bg-primary text-primary-foreground font-bold text-[10px]">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main Page Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background/50">
          {children}
        </main>
      </SidebarInset>

      {/* ── Right-Side Alert Drawer / Sheet ── */}
      <Sheet open={alertSheetOpen} onOpenChange={setAlertSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md lg:w-[40vw] lg:max-w-[40vw] p-0 flex flex-col bg-card border-l border-border">
          <SheetHeader className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                  <IconBell className="size-4" />
                </div>
                <div>
                  <SheetTitle className="text-base font-semibold text-foreground">
                    Early Warning Alerts
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                    Real-time anomaly triggers & compliance breach items
                  </SheetDescription>
                </div>
              </div>
              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                {activeAlertsList.length} Active
              </Badge>
            </div>
          </SheetHeader>

          {/* Alert items list inside Sheet */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeAlertsList.map((alert) => {
              const isCrit = alert.severity === "Critical";
              const isHigh = alert.severity === "High";
              return (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-all space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant={isCrit ? "destructive" : "outline"}
                        className={`text-[10px] uppercase font-bold px-1.5 py-0 ${
                          isHigh ? "border-amber-500/50 text-amber-600 bg-amber-500/10" : ""
                        }`}
                      >
                        {alert.severity}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {alert.type}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {alert.createdAt}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-foreground leading-snug">
                    {alert.title.replace(/^(Critical|High|Medium|Low):\s*/, "")}
                  </h4>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="rounded-lg bg-muted/60 p-2 text-[11px] text-foreground border border-border/60">
                    <div className="font-medium text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                      Action Required:
                    </div>
                    <div>{alert.actionRequired}</div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
                    <span>{alert.district ? `${alert.district}, ${alert.state}` : alert.state || "National"}</span>
                    {alert.daysRemaining !== undefined && (
                      <span className="flex items-center gap-1 text-destructive font-medium">
                        <IconClock className="size-3" />
                        {alert.daysRemaining > 0 ? `${alert.daysRemaining}d delay` : "Overdue"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <SheetFooter className="p-4 border-t border-border bg-muted/20">
            <Button
              onClick={() => {
                setAlertSheetOpen(false);
                onNavigate("alerts");
              }}
              className="w-full gap-1.5 text-xs font-semibold h-9"
            >
              <span>Go to Full Alerts Center</span>
              <IconArrowRight className="size-4" />
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}
