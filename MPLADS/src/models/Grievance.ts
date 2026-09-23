import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGrievanceTimelineEvent {
  stage: "Submitted" | "AI_Triaged" | "Assigned" | "Investigation_Action" | "Resolved";
  title: string;
  timestamp: string;
  actor: string;
  status: "Completed" | "In_Progress" | "Pending";
  remarks: string;
}

export interface IGrievance {
  id: string;
  title: string;
  description: string;
  category: string;
  district: string;
  state?: string;
  status: "Open" | "Under Review" | "Resolved";
  name: string;
  mobile: string;
  anonymizedName?: string;
  maskedMobile?: string;
  isAnonymous?: boolean;
  projectId?: string;
  projectName?: string;
  priority?: "High" | "Medium" | "Low";
  assignedOfficer?: string;
  actionTaken?: string;
  slaDays?: number;
  timeline?: IGrievanceTimelineEvent[];
  date: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGrievanceDocument extends Omit<IGrievance, "id">, Document {
  id: string;
}

const GrievanceSchema = new Schema<IGrievanceDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, required: true },
    district: { type: String, required: true, index: true },
    state: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Open", "Under Review", "Resolved"],
      default: "Open",
      index: true,
    },
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    anonymizedName: { type: String, default: "" },
    maskedMobile: { type: String, default: "" },
    isAnonymous: { type: Boolean, default: true },
    projectId: { type: String, default: "" },
    projectName: { type: String, default: "" },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    assignedOfficer: { type: String, default: "" },
    actionTaken: { type: String, default: "" },
    slaDays: { type: Number, default: 7 },
    timeline: { type: [Schema.Types.Mixed], default: [] },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

export const GrievanceModel: Model<IGrievanceDocument> =
  mongoose.models.Grievance || mongoose.model<IGrievanceDocument>("Grievance", GrievanceSchema);
