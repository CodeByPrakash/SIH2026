import { Suspense } from "react";
import DashboardShell from "../DashboardShell";

export default function Project3DViewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading 3D Digital Twin Viewer...</div>}>
      <DashboardShell activeSection="3d-view" />
    </Suspense>
  );
}
