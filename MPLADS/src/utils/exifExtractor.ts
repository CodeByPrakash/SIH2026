export interface ExtractedExifData {
  latitude?: number;
  longitude?: number;
  timestamp?: string;
  capturedAt?: string;
  hasGps: boolean;
  hasTimestamp: boolean;
  metadataSource: "EXIF" | "MANUAL" | "NONE";
  gpsSource: "Image EXIF" | "Manual override" | "Unavailable";
}

/**
 * Sends image file to `/api/evidence/metadata` server API route handler
 * to extract real photo EXIF metadata (GPS latitude, longitude, capture timestamp).
 */
export async function extractExifFromFile(file: File): Promise<ExtractedExifData> {
  try {
    const formData = new FormData();
    formData.append("photo", file);

    const res = await fetch("/api/evidence/metadata", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const { latitude, longitude, capturedAt, hasGps, hasTimestamp } = json.data;
        return {
          latitude: hasGps && typeof latitude === "number" ? latitude : undefined,
          longitude: hasGps && typeof longitude === "number" ? longitude : undefined,
          timestamp: capturedAt || undefined,
          capturedAt: capturedAt || undefined,
          hasGps: Boolean(hasGps),
          hasTimestamp: Boolean(hasTimestamp),
          metadataSource: hasGps ? "EXIF" : "NONE",
          gpsSource: hasGps ? "Image EXIF" : "Unavailable",
        };
      }
    }
  } catch (err) {
    console.warn("Failed to extract EXIF metadata via server API route:", err);
  }

  return {
    hasGps: false,
    hasTimestamp: false,
    metadataSource: "NONE",
    gpsSource: "Unavailable",
  };
}
