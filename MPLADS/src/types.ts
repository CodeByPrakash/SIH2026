export type UserRole = "MP" | "District" | "State" | "Ministry" | "Citizen";

export interface User {
  name: string;
  role: UserRole;
  constituency?: string;
  district?: string;
  state?: string;
  mpId?: string;
  phone: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  state: string;
  district: string;
  constituency: string;
  mpName: string;
  mpId: string;
  sanctionedAmount: number;
  releasedAmount: number;
  expenditure: number;
  status: "Completed" | "In Progress" | "Not Started" | "On Hold" | "Delayed";
  sanctionDate: string;
  completionDate?: string;
  expectedCompletion: string;
  progress: number;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  riskFlags: string[];
  contractor?: string;
  geoLat: number;
  geoLng: number;
  // Physical Verification & Statutory Evidence System (Dataset & ML Feature Aligned)
  photos: number;
  inspections: number;
  photoLocationMatch: boolean; // 1 if photo geotag coordinates match sanctioned site within 500m, 0 if GPS mismatch
  similarWorkCount500m: number; // Count of duplicate/similar public works within 500m radius
  ucSubmitted: boolean; // MoSPI statutory Utilization Certificate submitted
  assetCreated: boolean; // Entry completed in National Asset Register
  evidenceScore?: number; // Composite physical evidence score (0-100%)
  workOrderNo: string;
  agreementDate?: string;
  payments: Payment[];
}

export interface Payment {
  date: string;
  amount: number;
  billNo: string;
  status: "Paid" | "Pending" | "Rejected";
}

export interface RiskFlag {
  id: string;
  projectId: string;
  projectName: string;
  type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  reasons: string[];
  evidence: string[];
  peerComparison: string;
  recommendation: string;
  detectedOn: string;
  status: "Open" | "Under Review" | "Resolved";
  riskScore: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: "Delay" | "Cost Overrun" | "Utilization" | "Compliance" | "Anomaly";
  severity: "Low" | "Medium" | "High" | "Critical";
  projectId?: string;
  state?: string;
  district?: string;
  createdAt: string;
  daysRemaining?: number;
  actionRequired: string;
  status: "Active" | "Acknowledged" | "Resolved";
}

export interface StateData {
  state: string;
  totalProjects: number;
  completedProjects: number;
  totalFunds: number;
  utilizedFunds: number;
  pendingProjects: number;
  delayedProjects: number;
  riskProjects: number;
  utilization: number;
  mps: number;
}

export interface FundSummary {
  year: string;
  allocated: number;
  released: number;
  utilized: number;
  lapsed: number;
}
