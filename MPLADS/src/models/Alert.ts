import mongoose, { Schema, Document, Model } from "mongoose";
import type { Alert as IAlert } from "@/types";

export interface IAlertDocument extends Omit<IAlert, "id">, Document {
  id: string;
}

const AlertSchema = new Schema<IAlertDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["Delay", "Cost Overrun", "Utilization", "Compliance", "Anomaly"],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: true,
      index: true,
    },
    projectId: { type: String, default: "" },
    state: { type: String, default: "" },
    district: { type: String, default: "" },
    createdAt: { type: String, required: true },
    daysRemaining: { type: Number },
    actionRequired: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Active", "Acknowledged", "Resolved"],
      default: "Active",
      index: true,
    },
  },
  { timestamps: true }
);

export const AlertModel: Model<IAlertDocument> =
  mongoose.models.Alert || mongoose.model<IAlertDocument>("Alert", AlertSchema);
