import mongoose, { Schema, Document, Model } from "mongoose";
import type { ICitizenEvidence, VerificationCategory } from "@/types";

export type { VerificationCategory, ICitizenEvidence };

export interface ICitizenEvidenceDocument extends Omit<ICitizenEvidence, "evidenceId">, Document {
  evidenceId: string;
}

const CitizenEvidenceSchema = new Schema<ICitizenEvidenceDocument>(
  {
    evidenceId: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, index: true },
    projectName: { type: String, required: true },
    submittedBy: { type: String, default: "Anonymous Citizen" },
    citizenContact: { type: String, default: "Protected" },
    evidenceType: {
      type: String,
      enum: ["Photo", "Document", "Physical Observation", "Inspection Report"],
      default: "Photo",
    },
    category: {
      type: String,
      enum: ["Completion Discrepancy", "Quality Defect", "Fund Misuse", "Location Issue", "Delay", "Other"],
      required: true,
    },
    description: { type: String, required: true },
    location: { type: String, required: true },
    evidenceDate: { type: String, required: true },
    photoUrl: { type: String, default: "" },
    privacyStatus: { type: String, default: "Protected" },
    processingStatus: { type: String, enum: ["Processed", "Pending"], default: "Processed" },
    aiStatus: { type: String, enum: ["Cross-Checked", "Pending"], default: "Cross-Checked" },
    aiConfidence: { type: Number, default: 85 },
    verificationCategory: {
      type: String,
      enum: ["CONSISTENT", "POTENTIAL_CONFLICT", "CONFLICT_DETECTED", "INSUFFICIENT_EVIDENCE"],
      default: "POTENTIAL_CONFLICT",
      index: true,
    },
    observationSentiment: {
      type: String,
      enum: ["POSITIVE", "NEGATIVE", "MIXED", "NEUTRAL", "INSUFFICIENT_INFORMATION"],
      default: "NEUTRAL",
    },
    officialRecordClaim: { type: String, required: true },
    citizenObservation: { type: String, required: true },
    fieldDiscrepancy: { type: String, default: "" },
    explanation: { type: String, required: true },
    recommendedAction: { type: String, required: true },
    additionalEvidenceRequired: { type: [String], default: [] },
    // Geo-tag, Image Reuse & Cross-Check USP fields
    imageHash: { type: String, default: "" },
    perceptualHash: { type: String, default: "" },
    photoLatitude: { type: Number },
    photoLongitude: { type: Number },
    photoTimestamp: { type: String, default: "" },
    capturedAt: { type: String, default: null },
    metadataSource: {
      type: String,
      enum: ["EXIF", "MANUAL", "NONE"],
      default: "NONE",
    },
    gpsSource: {
      type: String,
      default: "Unavailable",
    },
    geoStatus: {
      type: String,
      enum: ["VERIFIED", "MISMATCH", "UNAVAILABLE"],
      default: "UNAVAILABLE",
    },
    duplicateStatus: {
      type: String,
      enum: ["EXACT_DUPLICATE", "NEAR_DUPLICATE", "VISUALLY_SIMILAR", "NO_DUPLICATE_DETECTED", "NO_MATCH", "LIKELY_REUSED", "SIMILAR_IMAGE", "UNAVAILABLE", "INSUFFICIENT_DATA"],
      default: "NO_DUPLICATE_DETECTED",
    },
    crossProjectReuse: { type: Boolean, default: false },
    similarEvidenceId: { type: String, default: "" },
    similarProjectId: { type: String, default: "" },
    similarProjectName: { type: String, default: "" },
    similarityScore: { type: Number, default: 0 },
    locationDistanceKm: { type: Number },
    locationDescription: { type: String, default: "" },
    duplicateDescription: { type: String, default: "" },
    timestampStatus: { type: String, default: "" },
    visualConsistencyStatus: { type: String, default: "" },
    verificationResultStatus: {
      type: String,
      enum: ["VERIFIED_CONSISTENT", "LOCATION_MISMATCH", "POTENTIAL_REUSED_EVIDENCE", "POTENTIAL_INCONSISTENCY", "MULTIPLE_FLAGS", "INSUFFICIENT_EVIDENCE"],
      default: "VERIFIED_CONSISTENT",
    },
    verificationFlags: { type: [String], default: [] },
    overallAssessment: { type: String, default: "" },
    verificationProcessedAt: { type: String, default: "" },
    locationVerification: {
      status: {
        type: String,
        enum: ["MATCH", "MISMATCH", "UNAVAILABLE"],
        default: "UNAVAILABLE",
      },
      distanceMeters: { type: Number, default: null },
      allowedRadiusMeters: { type: Number, default: 500 },
      photoLocation: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
      },
      projectLocation: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
      },
      checkedAt: { type: String, default: "" },
    },
    duplicateCheck: {
      status: {
        type: String,
        enum: ["NO_MATCH", "EXACT_DUPLICATE", "LIKELY_REUSED", "SIMILAR_IMAGE", "UNAVAILABLE"],
        default: "UNAVAILABLE",
      },
      similarityScore: { type: Number, default: null },
      matchedEvidenceId: { type: String, default: null },
      matchedProjectId: { type: String, default: null },
      matchedProjectName: { type: String, default: null },
      matchType: { type: String, default: null },
      isCrossProject: { type: Boolean, default: false },
      sha256: { type: String, default: null, index: true },
      perceptualHash: { type: String, default: null },
      message: { type: String, default: "" },
      checkedAt: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export const CitizenEvidenceModel: Model<ICitizenEvidenceDocument> =
  mongoose.models.CitizenEvidence ||
  mongoose.model<ICitizenEvidenceDocument>("CitizenEvidence", CitizenEvidenceSchema);
