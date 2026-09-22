"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import ProjectExplorer from "@/components/ProjectExplorer";
import RiskCenter from "@/components/RiskCenter";
import Alerts from "@/components/Alerts";
import Compliance from "@/components/Compliance";
import GISView from "@/components/GISView";
import Reports from "@/components/Reports";
import Investigation from "@/components/Investigation";
import Grievance from "@/components/Grievance";
import CitizenEvidenceVerification from "@/components/CitizenEvidenceVerification";
import InterventionSimulation from "@/components/InterventionSimulation";
import GeoPhotoCrossCheckUSP from "@/components/GeoPhotoCrossCheckUSP";
import AICopilot from "@/components/AICopilot";
import AiAuditEngine from "@/components/AiAuditEngine";
import Project3DView from "@/components/Project3DView";
import { ALERTS, MP_USERS, DISTRICT_USERS, STATE_USERS, MINISTRY_USER, CITIZEN_USER } from "@/data/mpladsData";
import type { User, UserRole } from "@/types";

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

interface DashboardShellProps {
  role?: UserRole;
  activeSection?: Page;
}

function DashboardShellContent({ role, activeSection }: DashboardShellProps) {
  const { user, login, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramProjectId = searchParams ? searchParams.get("projectId") : null;

  // Protect route & handle role switching for authenticated users
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (role && user.role !== role) {
      let u: User;
      if (role === "MP") u = MP_USERS[0];
      else if (role === "District") u = DISTRICT_USERS[0];
      else if (role === "State") u = STATE_USERS[0];
      else if (role === "Ministry") u = MINISTRY_USER;
      else u = CITIZEN_USER;
      login(u);
    }
  }, [role, user, isLoading, login, router]);

  const activeAlerts = ALERTS.filter((a) => a.status === "Active").length;

  // Derive current page from path or prop
  let currentPage: Page = activeSection || "dashboard";
  if (!activeSection) {
    if (pathname.includes("/ai-audit")) currentPage = "ai-audit";
    else if (pathname.includes("/3d-view")) currentPage = "3d-view";
    else if (pathname.includes("/projects")) currentPage = "projects";
    else if (pathname.includes("/risk")) currentPage = "risk";
    else if (pathname.includes("/alerts")) currentPage = "alerts";
    else if (pathname.includes("/compliance")) currentPage = "compliance";
    else if (pathname.includes("/gis")) currentPage = "gis";
    else if (pathname.includes("/reports")) currentPage = "reports";
    else if (pathname.includes("/investigation")) currentPage = "investigation";
    else if (pathname.includes("/grievance")) currentPage = "grievance";
    else if (pathname.includes("/evidence")) currentPage = "evidence";
    else if (pathname.includes("/simulation")) currentPage = "simulation";
    else if (pathname.includes("/crosscheck")) currentPage = "crosscheck";
    else currentPage = "dashboard";
  }

  const handleNavigate = (page: string) => {
    if (page === "dashboard") {
      const currentRole = user?.role?.toLowerCase() || role?.toLowerCase() || "mp";
      router.push(`/dashboard/${currentRole}`);
    } else {
      router.push(`/dashboard/${page}`);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-muted-foreground font-medium">Loading MPLADS Portal...</p>
        </div>
      </div>
    );
  }

  const currentUser: User = user;

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard user={currentUser} onNavigate={handleNavigate} />;
      case "projects":
        return <ProjectExplorer />;
      case "3d-view":
        return (
          <Project3DView
            initialProjectId={paramProjectId || undefined}
            onNavigateBack={() => handleNavigate("projects")}
          />
        );
      case "risk":
        return <RiskCenter />;
      case "alerts":
        return <Alerts />;
      case "compliance":
        return <Compliance />;
      case "gis":
        return <GISView />;
      case "reports":
        return <Reports user={currentUser} />;
      case "investigation":
        return <Investigation />;
      case "grievance":
        return <Grievance />;
      case "evidence":
        return <CitizenEvidenceVerification user={currentUser} />;
      case "simulation":
        return <InterventionSimulation />;
      case "crosscheck":
        return <GeoPhotoCrossCheckUSP />;
      case "ai-audit":
        return <AiAuditEngine initialProjectId={paramProjectId} />;
      default:
        return <Dashboard user={currentUser} onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <Layout
        user={currentUser}
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        alertCount={activeAlerts}
      >
        {renderContent()}
      </Layout>
      <AICopilot onNavigate={handleNavigate} user={currentUser} />
    </>
  );
}

export default function DashboardShell(props: DashboardShellProps) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-muted-foreground font-medium">Loading MPLADS Portal...</p>
          </div>
        </div>
      }
    >
      <DashboardShellContent {...props} />
    </React.Suspense>
  );
}
