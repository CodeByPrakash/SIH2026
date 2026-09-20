import mongoose, { Schema, Document, Model } from "mongoose";
import type { Project as IProject } from "@/types";

export interface IProjectDocument extends Omit<IProject, "id">, Document {
  id: string;
}

const PaymentSchema = new Schema(
  {
    date: { type: String, required: true },
    amount: { type: Number, required: true },
    billNo: { type: String, required: true },
    status: { type: String, enum: ["Paid", "Pending", "Rejected"], default: "Pending" },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProjectDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, default: "" },
    state: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    constituency: { type: String, default: "" },
    mpName: { type: String, default: "" },
    mpId: { type: String, default: "" },
    sanctionedAmount: { type: Number, default: 0 },
    releasedAmount: { type: Number, default: 0 },
    expenditure: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Completed", "In Progress", "Not Started", "On Hold", "Delayed"],
      default: "In Progress",
      index: true,
    },
    sanctionDate: { type: String, default: "" },
    completionDate: { type: String },
    expectedCompletion: { type: String, default: "" },
    progress: { type: Number, default: 0 },
    riskScore: { type: Number, default: 0 },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
      index: true,
    },
    riskFlags: { type: [String], default: [] },
    contractor: { type: String, default: "" },
    geoLat: { type: Number, default: 0 },
    geoLng: { type: Number, default: 0 },
    photos: { type: Number, default: 0 },
    inspections: { type: Number, default: 0 },
    ucSubmitted: { type: Boolean, default: false },
    assetCreated: { type: Boolean, default: false },
    workOrderNo: { type: String, default: "" },
    agreementDate: { type: String },
    payments: { type: [PaymentSchema], default: [] },
  },
  { timestamps: true }
);

export const ProjectModel: Model<IProjectDocument> =
  mongoose.models.Project || mongoose.model<IProjectDocument>("Project", ProjectSchema);
