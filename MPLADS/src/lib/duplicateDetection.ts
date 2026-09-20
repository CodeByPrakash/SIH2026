import {
  calculateSha256,
  calculatePerceptualHash,
  calculatePerceptualSimilarity,
} from "./imageHash";
import { getAllEvidence } from "@/services/citizenEvidence.service";
import { getProjectById } from "@/services/project.service";

export type DuplicateStatus =
  | "NO_MATCH"
  | "EXACT_DUPLICATE"
  | "LIKELY_REUSED"
  | "SIMILAR_IMAGE"
  | "UNAVAILABLE";

export interface DuplicateCheckInput {
  buffer?: Buffer | Uint8Array | ArrayBuffer | null;
  currentEvidenceId?: string;
  projectId?: string;
  currentProjectId?: string;
  historicalEvidence?: any[];
}

export interface DuplicateCheckResult {
  status: DuplicateStatus;
  similarityScore: number | null;
  matchedEvidenceId: string | null;
  matchedProjectId: string | null;
  matchedProjectName: string | null;
  matchType: "SHA256" | "PERCEPTUAL_HASH" | null;
  isCrossProject: boolean;
  sha256: string | null;
  perceptualHash: string | null;
  message: string;
  checkedAt: string;
}

/**
 * Performs cryptographic SHA-256 exact match and perceptual image hash similarity analysis
 * across all historical submitted evidence records.
 */
export async function checkImageReuse(
  input: DuplicateCheckInput
): Promise<DuplicateCheckResult> {
  const nowISO = new Date().toISOString();

  const buf = input.buffer;
  if (!buf || (buf instanceof Buffer && buf.length === 0)) {
    return {
      status: "UNAVAILABLE",
      similarityScore: null,
      matchedEvidenceId: null,
      matchedProjectId: null,
      matchedProjectName: null,
      matchType: null,
      isCrossProject: false,
      sha256: null,
      perceptualHash: null,
      message:
        "Image reuse verification is unavailable because no image payload was provided.",
      checkedAt: nowISO,
    };
  }

  try {
    const currentProjId = input.projectId || input.currentProjectId;

    // 1. Calculate Hashes
    const sha256 = calculateSha256(buf);
    const perceptualHash = calculatePerceptualHash(buf);

    // 2. Fetch all historical evidence records
    const rawHistorical = input.historicalEvidence || (await getAllEvidence());
    const candidates = rawHistorical.filter(
      (e: any) => !input.currentEvidenceId || e.evidenceId !== input.currentEvidenceId
    );

    // 3. Exact Duplicate Search (SHA-256)
    const exactMatch = candidates.find((h: any) => {
      const storedSha =
        (typeof h.duplicateCheck === "object" && h.duplicateCheck?.sha256)
          ? h.duplicateCheck.sha256
          : (typeof h.imageHash === "object" && h.imageHash?.sha256)
          ? h.imageHash.sha256
          : (typeof h.imageHash === "string")
          ? h.imageHash
          : "";
      return storedSha && storedSha === sha256;
    });

    if (exactMatch) {
      const isCrossProject = Boolean(
        currentProjId &&
          exactMatch.projectId &&
          exactMatch.projectId !== currentProjId
      );

      let matchedProjName = exactMatch.projectName;
      if (!matchedProjName || matchedProjName === exactMatch.projectId) {
        const proj = await getProjectById(exactMatch.projectId);
        if (proj?.name) matchedProjName = proj.name;
      }

      return {
        status: "EXACT_DUPLICATE",
        similarityScore: 100,
        matchedEvidenceId: exactMatch.evidenceId,
        matchedProjectId: exactMatch.projectId,
        matchedProjectName: matchedProjName || exactMatch.projectId,
        matchType: "SHA256",
        isCrossProject,
        sha256,
        perceptualHash,
        message: isCrossProject
          ? `Exact duplicate image previously submitted under another project (${
              matchedProjName || exactMatch.projectId
            }).`
          : "Exact duplicate image previously submitted under this project.",
        checkedAt: nowISO,
      };
    }

    // 4. Perceptual Similarity Search
    let maxSimilarity = 0;
    let bestCandidate: (typeof candidates)[0] | null = null;

    for (const h of candidates) {
      const storedPHash =
        (typeof h.duplicateCheck === "object" && h.duplicateCheck?.perceptualHash)
          ? h.duplicateCheck.perceptualHash
          : (typeof h.perceptualHash === "string")
          ? h.perceptualHash
          : (typeof h.imageHash === "object" && h.imageHash?.perceptualHash)
          ? h.imageHash.perceptualHash
          : "";

      if (storedPHash) {
        const similarity = calculatePerceptualSimilarity(
          perceptualHash,
          storedPHash
        );
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          bestCandidate = h;
        }
      }
    }

    if (bestCandidate && maxSimilarity >= 90) {
      const isCrossProject = Boolean(
        currentProjId &&
          bestCandidate.projectId &&
          bestCandidate.projectId !== currentProjId
      );

      let matchedProjName = bestCandidate.projectName;
      if (!matchedProjName || matchedProjName === bestCandidate.projectId) {
        const proj = await getProjectById(bestCandidate.projectId);
        if (proj?.name) matchedProjName = proj.name;
      }

      return {
        status: "LIKELY_REUSED",
        similarityScore: maxSimilarity,
        matchedEvidenceId: bestCandidate.evidenceId,
        matchedProjectId: bestCandidate.projectId,
        matchedProjectName: matchedProjName || bestCandidate.projectId,
        matchType: "PERCEPTUAL_HASH",
        isCrossProject,
        sha256,
        perceptualHash,
        message: isCrossProject
          ? `Potential evidence reuse detected from another project (${
              matchedProjName || bestCandidate.projectId
            }) (${maxSimilarity}% visual match).`
          : `Potential evidence reuse detected from a previous submission under this project (${maxSimilarity}% visual match).`,
        checkedAt: nowISO,
      };
    }

    if (bestCandidate && maxSimilarity >= 75) {
      const isCrossProject = Boolean(
        currentProjId &&
          bestCandidate.projectId &&
          bestCandidate.projectId !== currentProjId
      );

      let matchedProjName = bestCandidate.projectName;
      if (!matchedProjName || matchedProjName === bestCandidate.projectId) {
        const proj = await getProjectById(bestCandidate.projectId);
        if (proj?.name) matchedProjName = proj.name;
      }

      return {
        status: "SIMILAR_IMAGE",
        similarityScore: maxSimilarity,
        matchedEvidenceId: bestCandidate.evidenceId,
        matchedProjectId: bestCandidate.projectId,
        matchedProjectName: matchedProjName || bestCandidate.projectId,
        matchType: "PERCEPTUAL_HASH",
        isCrossProject,
        sha256,
        perceptualHash,
        message: `Visually similar evidence photo found (${maxSimilarity}% visual match).`,
        checkedAt: nowISO,
      };
    }

    // 5. No Match
    return {
      status: "NO_MATCH",
      similarityScore: null,
      matchedEvidenceId: null,
      matchedProjectId: null,
      matchedProjectName: null,
      matchType: null,
      isCrossProject: false,
      sha256,
      perceptualHash,
      message: "No previously submitted evidence image matched this photo.",
      checkedAt: nowISO,
    };
  } catch (err) {
    console.error("[duplicateDetection] Error running duplicate check:", err);
    return {
      status: "UNAVAILABLE",
      similarityScore: null,
      matchedEvidenceId: null,
      matchedProjectId: null,
      matchedProjectName: null,
      matchType: null,
      isCrossProject: false,
      sha256: null,
      perceptualHash: null,
      message: "Image reuse verification is temporarily unavailable.",
      checkedAt: nowISO,
    };
  }
}
