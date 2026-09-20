import mongoose, { Schema, Document, Model } from "mongoose";
import type { IScenarioSimulationResult, IAuthorityDecision } from "@/types";

export interface IInterventionSimulationDocument extends Omit<IScenarioSimulationResult, "simulationId">, Document {
  simulationId: string;
}

export interface IAuthorityDecisionDocument extends Omit<IAuthorityDecision, "decisionId">, Document {
  decisionId: string;
}

const ScenarioDetailSchema = new Schema(
  {
    projectedOutcome: { type: String, required: true },
    benefits: { type: [String], default: [] },
    risks: { type: [String], default: [] },
    complianceImpact: { type: String, required: true },
    projectImpact: { type: String, required: true },
    monitoringRequired: { type: [String], default: [] },
    confidence: { type: Number, required: true },
  },
  { _id: false }
);

const InterventionSimulationSchema = new Schema<IInterventionSimulationDocument>(
  {
    simulationId: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    projectName: { type: String, required: true },
    timestamp: { type: String, required: true },
    simulationStatus: { type: String, enum: ["COMPLETED", "INSUFFICIENT_DATA", "FAILED"], default: "COMPLETED" },
    scenarios: {
      release: { type: ScenarioDetailSchema, required: true },
      hold: { type: ScenarioDetailSchema, required: true },
      correctiveAction: { type: ScenarioDetailSchema, required: true },
    },
    keyFactors: { type: [String], default: [] },
    additionalInformationRequired: { type: [String], default: [] },
    assumptionsUsed: {
      progress: { type: Number },
      riskLevel: { type: String },
      hasCitizenConflict: { type: Boolean },
      complianceStatus: { type: String },
    },
    dataQualityRating: { type: String, enum: ["High", "Medium", "Low"], default: "High" },
    disclaimer: { type: String, required: true },
  },
  { timestamps: true }
);

const AuthorityDecisionSchema = new Schema<IAuthorityDecisionDocument>(
  {
    decisionId: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    projectName: { type: String, required: true },
    selectedIntervention: {
      type: String,
      enum: ["RELEASE", "HOLD", "CORRECTIVE_ACTION"],
      required: true,
    },
    decisionNote: { type: String, required: true },
    recordedByRole: {
      type: String,
      enum: ["MP", "District", "State", "Ministry", "Citizen"],
      required: true,
    },
    recordedByName: { type: String, default: "Authorized Official" },
    recordedAt: { type: String, required: true },
    simulationIdRef: { type: String, default: "" },
  },
  { timestamps: true }
);

export const InterventionSimulationModel: Model<IInterventionSimulationDocument> =
  mongoose.models.InterventionSimulation ||
  mongoose.model<IInterventionSimulationDocument>("InterventionSimulation", InterventionSimulationSchema);

export const AuthorityDecisionModel: Model<IAuthorityDecisionDocument> =
  mongoose.models.AuthorityDecision ||
  mongoose.model<IAuthorityDecisionDocument>("AuthorityDecision", AuthorityDecisionSchema);
