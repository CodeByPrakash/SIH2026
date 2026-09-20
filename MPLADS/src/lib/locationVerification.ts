import {
  Coordinates,
  calculateDistanceInMeters,
  formatDistanceDisplay,
} from "./geo";
import { DEFAULT_PROJECT_VERIFICATION_RADIUS_METERS } from "@/config/evidence";

export type LocationVerificationStatus = "MATCH" | "MISMATCH" | "UNAVAILABLE";

export interface LocationVerificationInput {
  photoLocation?: {
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  projectLocation?: {
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  allowedRadiusMeters?: number;
}

export interface LocationVerificationResult {
  status: LocationVerificationStatus;
  distanceMeters: number | null;
  distanceFormatted: string | null;
  allowedRadiusMeters: number;
  photoLocation: {
    latitude: number | null;
    longitude: number | null;
  };
  projectLocation: {
    latitude: number | null;
    longitude: number | null;
  };
  message: string;
}

function isValidCoordinate(
  lat: number | null | undefined,
  lng: number | null | undefined
): lat is number {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    (lat !== 0 || lng !== 0)
  );
}

/**
 * Deterministically verifies photo GPS coordinates against registered project coordinates
 * using Haversine distance.
 */
export function verifyPhotoLocation(
  input: LocationVerificationInput
): LocationVerificationResult {
  const allowedRadius =
    typeof input.allowedRadiusMeters === "number" &&
    input.allowedRadiusMeters > 0
      ? input.allowedRadiusMeters
      : DEFAULT_PROJECT_VERIFICATION_RADIUS_METERS;

  const photoLat = input.photoLocation?.latitude ?? null;
  const photoLng = input.photoLocation?.longitude ?? null;
  const projectLat = input.projectLocation?.latitude ?? null;
  const projectLng = input.projectLocation?.longitude ?? null;

  const hasPhotoGps = isValidCoordinate(photoLat, photoLng);
  const hasProjectGps = isValidCoordinate(projectLat, projectLng);

  const photoLocResult = {
    latitude: hasPhotoGps ? photoLat : null,
    longitude: hasPhotoGps ? photoLng : null,
  };

  const projectLocResult = {
    latitude: hasProjectGps ? projectLat : null,
    longitude: hasProjectGps ? projectLng : null,
  };

  if (!hasPhotoGps) {
    return {
      status: "UNAVAILABLE",
      distanceMeters: null,
      distanceFormatted: null,
      allowedRadiusMeters: allowedRadius,
      photoLocation: photoLocResult,
      projectLocation: projectLocResult,
      message:
        "Location verification is unavailable because the photo does not contain GPS metadata.",
    };
  }

  if (!hasProjectGps) {
    return {
      status: "UNAVAILABLE",
      distanceMeters: null,
      distanceFormatted: null,
      allowedRadiusMeters: allowedRadius,
      photoLocation: photoLocResult,
      projectLocation: projectLocResult,
      message:
        "Location verification is unavailable because registered project GPS coordinates are missing.",
    };
  }

  // Calculate distance in meters
  const rawDistance = calculateDistanceInMeters(
    { latitude: photoLat!, longitude: photoLng! },
    { latitude: projectLat!, longitude: projectLng! }
  );

  const distanceMeters = Number(rawDistance.toFixed(2));
  const distanceFormatted = formatDistanceDisplay(distanceMeters);

  const isMatch = distanceMeters <= allowedRadius;

  return {
    status: isMatch ? "MATCH" : "MISMATCH",
    distanceMeters,
    distanceFormatted,
    allowedRadiusMeters: allowedRadius,
    photoLocation: photoLocResult,
    projectLocation: projectLocResult,
    message: isMatch
      ? `Photo GPS is within the configured project verification radius (${formatDistanceDisplay(
          allowedRadius
        )}).`
      : `Photo GPS is outside the configured project verification radius (${formatDistanceDisplay(
          allowedRadius
        )}).`,
  };
}
