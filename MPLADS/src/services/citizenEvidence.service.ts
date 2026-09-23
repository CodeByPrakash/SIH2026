import { dbConnect } from "@/lib/mongodb";
import {
  CitizenEvidenceModel,
  ICitizenEvidenceDocument,
} from "@/models/CitizenEvidence";
import type { ICitizenEvidence, UserRole } from "@/types";
import { PROTOTYPE_SEED_EVIDENCE } from "@/data/prototypeEvidenceData";
import { getProjectById } from "./project.service";
import { runAICrossCheck } from "./evidenceVerification.service";
import { runEvidenceCrossCheck } from "./evidenceCrossCheck.service";
import { createAlert } from "./alert.service";
import { verifyPhotoLocation } from "@/lib/locationVerification";
import { evaluateCalculationInconsistency } from "@/utils/calculationInconsistencyEvaluator";

let memoryEvidenceStore: ICitizenEvidence[] = [...PROTOTYPE_SEED_EVIDENCE];

async function generateUniqueEvidenceId(conn: any): Promise<string> {
  let count = 1;

  if (conn) {
    try {
      const dbCount = await CitizenEvidenceModel.countDocuments({});
      count = dbCount + 1;
    } catch {
      count = memoryEvidenceStore.length + 1;
    }
  } else {
    count = memoryEvidenceStore.length + 1;
  }

  let candidateId = `CE-2026-${String(count).padStart(3, "0")}`;

  if (conn) {
    let exists = await CitizenEvidenceModel.exists({ evidenceId: candidateId });
    while (exists) {
      count++;
      candidateId = `CE-2026-${String(count).padStart(3, "0")}`;
      exists = await CitizenEvidenceModel.exists({ evidenceId: candidateId });
    }
  } else {
    while (memoryEvidenceStore.some((e) => e.evidenceId === candidateId)) {
      count++;
      candidateId = `CE-2026-${String(count).padStart(3, "0")}`;
    }
  }

  return candidateId;
}

export async function getAllEvidence(userRole?: UserRole): Promise<ICitizenEvidence[]> {
  try {
    const conn = await dbConnect();
    if (conn) {
      const docs = await CitizenEvidenceModel.find({})
        .sort({ createdAt: -1 })
        .lean<ICitizenEvidenceDocument[]>();
      if (docs && docs.length > 0) {
        const sanitized = docs.map((d) => sanitizePrivacy(d, userRole));
        memoryEvidenceStore = sanitized;
        return sanitized;
      }
    }
  } catch (err) {
    console.error("Error fetching evidence from DB:", err);
  }
  return memoryEvidenceStore.map((e) => sanitizePrivacy(e, userRole));
}

export async function getEvidenceById(id: string, userRole?: UserRole): Promise<ICitizenEvidence | null> {
  try {
    const conn = await dbConnect();
    if (conn) {
      const doc = await CitizenEvidenceModel.findOne({ evidenceId: id }).lean<ICitizenEvidenceDocument>();
      if (doc) {
        return sanitizePrivacy(doc, userRole);
      }
    }
  } catch (err) {
    console.error("Error fetching evidence by id from DB:", err);
  }
  const item = memoryEvidenceStore.find((e) => e.evidenceId === id);
  return item ? sanitizePrivacy(item, userRole) : null;
}

export async function createEvidence(input: {
  projectId: string;
  category: "Completion Discrepancy" | "Quality Defect" | "Fund Misuse" | "Location Issue" | "Delay" | "Other";
  description: string;
  location: string;
  evidenceType: "Photo" | "Document" | "Physical Observation" | "Inspection Report";
  photoUrl?: string;
  photoName?: string;
  photoLatitude?: number;
  photoLongitude?: number;
  photoTimestamp?: string;
  capturedAt?: string;
  gpsSource?: "Image EXIF" | "Manual override" | "Unavailable" | string;
  metadataSource?: "EXIF" | "MANUAL" | "NONE" | string;
  duplicateCheck?: any;
  submittedBy?: string;
  citizenContact?: string;
}): Promise<ICitizenEvidence> {
  const conn = await dbConnect();
  const project = await getProjectById(input.projectId);
  const projectName = project ? project.name : `Project ${input.projectId}`;
  const evidenceId = await generateUniqueEvidenceId(conn);
  const today = new Date().toISOString().split("T")[0];

  // Fetch all existing evidence for cross-project image & geo verification
  const historicalEvidence = await getAllEvidence();

  // 1. Run Geo-Tag, Image Reuse & Cross-Project Verification Engine
  let crossCheckResult;
  try {
    crossCheckResult = runEvidenceCrossCheck(
      {
        evidenceId,
        projectId: input.projectId,
        description: input.description,
        category: input.category,
        location: input.location,
        photoUrl: input.photoUrl,
        photoName: input.photoName,
        photoLatitude: input.photoLatitude,
        photoLongitude: input.photoLongitude,
        photoTimestamp: input.photoTimestamp,
        gpsSource: (input.gpsSource as any) || "Unavailable",
      },
      project,
      historicalEvidence
    );
  } catch (ccErr) {
    console.error("Evidence cross-check engine exception, fallback:", ccErr);
  }

  // 2. Run AI Verification Cross-Check Engine for text & record analysis
  let aiResult;
  try {
    aiResult = runAICrossCheck(project, input);
  } catch (aiErr) {
    console.error("AI cross-check failed for evidence, fallback to pending status:", aiErr);
    aiResult = {
      verificationCategory: "INSUFFICIENT_EVIDENCE" as const,
      observationSentiment: "NEUTRAL" as const,
      aiConfidence: 50,
      officialRecordClaim: project ? `Official Record: ${project.name}` : "Official Record pending",
      citizenObservation: `Citizen Evidence: ${input.description}`,
      fieldDiscrepancy: "AI Cross-check processing exception",
      explanation: "AI verification engine encountered a processing glitch. Ground evidence saved successfully.",
      recommendedAction: "Ground evidence saved. Retry AI verification.",
      additionalEvidenceRequired: ["Manual verification required"],
    };
  }

  const newRecord: ICitizenEvidence = {
    evidenceId,
    projectId: input.projectId,
    projectName,
    submittedBy: input.submittedBy || "Anonymized Citizen",
    citizenContact: input.citizenContact || "Protected (Consent Verified)",
    evidenceType: input.evidenceType || "Photo",
    category: input.category,
    description: input.description,
    location: input.location,
    evidenceDate: today,
    photoUrl: input.photoUrl || "",
    privacyStatus: "Protected",
    processingStatus: "Processed",
    aiStatus: "Cross-Checked",
    aiConfidence: crossCheckResult ? Math.min(aiResult.aiConfidence, crossCheckResult.confidence) : aiResult.aiConfidence,
    verificationCategory: aiResult.verificationCategory,
    observationSentiment: aiResult.observationSentiment,
    officialRecordClaim: aiResult.officialRecordClaim,
    citizenObservation: aiResult.citizenObservation,
    fieldDiscrepancy: aiResult.fieldDiscrepancy,
    explanation: aiResult.explanation,
    recommendedAction: aiResult.recommendedAction,
    additionalEvidenceRequired: aiResult.additionalEvidenceRequired,
    // Geo-Tag & Image Reuse Cross-Check Results
    imageHash: input.duplicateCheck?.sha256 || crossCheckResult?.imageHash || "",
    perceptualHash: input.duplicateCheck?.perceptualHash || crossCheckResult?.perceptualHash || "",
    photoLatitude: input.photoLatitude ?? crossCheckResult?.photoLatitude,
    photoLongitude: input.photoLongitude ?? crossCheckResult?.photoLongitude,
    photoTimestamp: input.capturedAt || input.photoTimestamp || crossCheckResult?.photoTimestamp || "",
    capturedAt: input.capturedAt || input.photoTimestamp || undefined,
    metadataSource: input.metadataSource || (input.gpsSource === "Image EXIF" ? "EXIF" : input.gpsSource === "Manual override" ? "MANUAL" : "NONE"),
    gpsSource: crossCheckResult?.gpsSource || input.gpsSource || "Unavailable",
    geoStatus: crossCheckResult?.geoStatus || "UNAVAILABLE",
    duplicateStatus: input.duplicateCheck?.status || crossCheckResult?.duplicateStatus || "NO_DUPLICATE_DETECTED",
    crossProjectReuse: Boolean(input.duplicateCheck?.isCrossProject || crossCheckResult?.crossProjectReuse),
    similarEvidenceId: input.duplicateCheck?.matchedEvidenceId || crossCheckResult?.similarEvidenceId || "",
    similarProjectId: input.duplicateCheck?.matchedProjectId || crossCheckResult?.similarProjectId || "",
    similarProjectName: input.duplicateCheck?.matchedProjectName || crossCheckResult?.similarProjectName || "",
    similarityScore: input.duplicateCheck?.similarityPercent ?? input.duplicateCheck?.similarityScore ?? crossCheckResult?.similarityScore ?? 0,
    locationDistanceKm: crossCheckResult?.locationDistanceKm,
    locationDescription: crossCheckResult?.locationDescription || "",
    duplicateDescription: crossCheckResult?.duplicateDescription || "",
    timestampStatus: crossCheckResult?.timestampStatus || "",
    visualConsistencyStatus: crossCheckResult?.visualConsistencyStatus || "",
    verificationResultStatus: crossCheckResult?.verificationResultStatus || "VERIFIED_CONSISTENT",
    verificationFlags: crossCheckResult?.verificationFlags || [],
    overallAssessment: crossCheckResult?.overallAssessment || aiResult.explanation,
    verificationProcessedAt: new Date().toISOString(),
    locationVerification: {
      status: verifyPhotoLocation({
        photoLocation: { latitude: input.photoLatitude, longitude: input.photoLongitude },
        projectLocation: { latitude: project?.geoLat, longitude: project?.geoLng },
      }).status,
      distanceMeters: verifyPhotoLocation({
        photoLocation: { latitude: input.photoLatitude, longitude: input.photoLongitude },
        projectLocation: { latitude: project?.geoLat, longitude: project?.geoLng },
      }).distanceMeters,
      allowedRadiusMeters: verifyPhotoLocation({
        photoLocation: { latitude: input.photoLatitude, longitude: input.photoLongitude },
        projectLocation: { latitude: project?.geoLat, longitude: project?.geoLng },
      }).allowedRadiusMeters,
      photoLocation: {
        latitude: input.photoLatitude ?? null,
        longitude: input.photoLongitude ?? null,
      },
      projectLocation: {
        latitude: project?.geoLat ?? null,
        longitude: project?.geoLng ?? null,
      },
      checkedAt: new Date().toISOString(),
    },
    duplicateCheck: input.duplicateCheck || undefined,
    calculationInconsistency: evaluateCalculationInconsistency(
      {
        description: input.description,
        category: input.category,
        verificationCategory: aiResult.verificationCategory,
      },
      project
    ),
  };

  // 2. Persist to MongoDB Atlas FIRST
  if (conn) {
    try {
      await CitizenEvidenceModel.create(newRecord);
      console.log(`Successfully persisted evidence document to MongoDB Atlas: ${evidenceId}`);
    } catch (dbErr: any) {
      console.error(`MongoDB Atlas save failed for ${evidenceId}:`, dbErr);
      throw new Error(`Database error saving evidence: ${dbErr?.message || dbErr}`);
    }
  } else {
    console.warn(`MongoDB unavailable, saved to transient memory store: ${evidenceId}`);
  }

  // 3. Keep memory store updated
  memoryEvidenceStore.unshift(newRecord);

  // 4. Trigger system alert if conflict detected or potential conflict
  if (
    aiResult.verificationCategory === "CONFLICT_DETECTED" ||
    aiResult.verificationCategory === "POTENTIAL_CONFLICT"
  ) {
    try {
      await createAlert({
        id: `ALT-EVD-${Date.now().toString().slice(-6)}`,
        title: `AI Evidence Cross-Check Discrepancy: ${evidenceId}`,
        description: `Citizen evidence for project ${input.projectId} in ${input.location} flagged as ${aiResult.verificationCategory}.`,
        type: "Compliance",
        severity: aiResult.verificationCategory === "CONFLICT_DETECTED" ? "High" : "Medium",
        projectId: input.projectId,
        district: input.location,
        createdAt: today,
        actionRequired: aiResult.recommendedAction,
        status: "Active",
      });
    } catch (alertErr) {
      console.error("Error creating alert for evidence conflict:", alertErr);
    }
  }

  return sanitizePrivacy(newRecord);
}

// Strip raw PII for privacy protection while preserving all analytical fields
function sanitizePrivacy(doc: any, userRole?: UserRole): ICitizenEvidence {
  return {
    evidenceId: doc.evidenceId || doc.id,
    projectId: doc.projectId,
    projectName: doc.projectName,
    submittedBy: userRole === "Citizen" && doc.rawSubmittedBy ? doc.rawSubmittedBy : "Anonymized Citizen (Protected)",
    citizenContact: "Protected (Privacy Compliant)",
    evidenceType: doc.evidenceType,
    category: doc.category,
    description: doc.description,
    location: doc.location,
    evidenceDate: doc.evidenceDate,
    photoUrl: doc.photoUrl || "",
    privacyStatus: "Protected",
    processingStatus: doc.processingStatus || "Processed",
    aiStatus: doc.aiStatus || "Cross-Checked",
    aiConfidence: doc.aiConfidence || 85,
    verificationCategory: doc.verificationCategory || "CONSISTENT",
    observationSentiment: doc.observationSentiment || "NEUTRAL",
    officialRecordClaim: doc.officialRecordClaim || "",
    citizenObservation: doc.citizenObservation || "",
    fieldDiscrepancy: doc.fieldDiscrepancy || "",
    explanation: doc.explanation || "",
    recommendedAction: doc.recommendedAction || "",
    additionalEvidenceRequired: doc.additionalEvidenceRequired || [],
    // Geo-Tag & Image Reuse Cross-Check USP fields
    imageHash: doc.imageHash || "",
    perceptualHash: doc.perceptualHash || "",
    photoLatitude: doc.photoLatitude,
    photoLongitude: doc.photoLongitude,
    photoTimestamp: doc.photoTimestamp || "",
    capturedAt: doc.capturedAt || doc.photoTimestamp || null,
    metadataSource: doc.metadataSource || (doc.gpsSource === "Image EXIF" ? "EXIF" : doc.gpsSource === "Manual override" ? "MANUAL" : "NONE"),
    gpsSource: doc.gpsSource || (typeof doc.photoLatitude === "number" ? "Image EXIF" : "Unavailable"),
    geoStatus: doc.geoStatus || "UNAVAILABLE",
    duplicateStatus: doc.duplicateStatus || "NO_DUPLICATE_DETECTED",
    crossProjectReuse: Boolean(doc.crossProjectReuse),
    similarEvidenceId: doc.similarEvidenceId || "",
    similarProjectId: doc.similarProjectId || "",
    similarProjectName: doc.similarProjectName || "",
    similarityScore: doc.similarityScore || 0,
    locationDistanceKm: doc.locationDistanceKm,
    locationDescription: doc.locationDescription || "",
    duplicateDescription: doc.duplicateDescription || "",
    timestampStatus: doc.timestampStatus || "",
    visualConsistencyStatus: doc.visualConsistencyStatus || "",
    verificationResultStatus: doc.verificationResultStatus || "VERIFIED_CONSISTENT",
    verificationFlags: doc.verificationFlags || [],
    overallAssessment: doc.overallAssessment || doc.explanation || "",
    verificationProcessedAt: doc.verificationProcessedAt || "",
    locationVerification: doc.locationVerification || undefined,
    duplicateCheck: doc.duplicateCheck || undefined,
    calculationInconsistency: doc.calculationInconsistency || evaluateCalculationInconsistency(doc, null),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
