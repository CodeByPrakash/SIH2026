import mongoose, { Schema, Document, Model } from "mongoose";

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
  projectId?: string;
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
    projectId: { type: String, default: "" },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

export const GrievanceModel: Model<IGrievanceDocument> =
  mongoose.models.Grievance || mongoose.model<IGrievanceDocument>("Grievance", GrievanceSchema);
