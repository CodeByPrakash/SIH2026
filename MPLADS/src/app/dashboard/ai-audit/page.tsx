import { Suspense } from "react";
import DashboardShell from "../DashboardShell";

export default function AiAuditPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading AI Audit Engine...</div>}>
      <DashboardShell activeSection="ai-audit" />
    </Suspense>
  );
}
