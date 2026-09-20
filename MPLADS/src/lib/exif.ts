import exifr from "exifr";

export interface ExtractedPhotoMetadata {
  latitude: number | null;
  longitude: number | null;
  capturedAt: string | null;
  hasGps: boolean;
  hasTimestamp: boolean;
}

/**
 * Parses EXIF metadata from an image file/buffer using exifr.
 * Prioritizes GPS latitude/longitude and DateTimeOriginal -> CreateDate -> ModifyDate timestamps.
 * Does NOT generate synthetic or default values when metadata is absent.
 */
export async function extractPhotoMetadata(
  input: File | Blob | ArrayBuffer | Uint8Array | Buffer
): Promise<ExtractedPhotoMetadata> {
  const result: ExtractedPhotoMetadata = {
    latitude: null,
    longitude: null,
    capturedAt: null,
    hasGps: false,
    hasTimestamp: false,
  };

  try {
    let dataBuffer: ArrayBuffer | Uint8Array | Buffer = input as any;

    if (typeof File !== "undefined" && input instanceof File) {
      dataBuffer = await input.arrayBuffer();
    } else if (typeof Blob !== "undefined" && input instanceof Blob) {
      dataBuffer = await input.arrayBuffer();
    }

    // Parse EXIF using exifr with GPS and Exif segment enabled
    const parsed = await exifr.parse(dataBuffer, {
      gps: true,
      exif: true,
      tiff: true,
      reviveValues: true,
      pick: [
        "latitude",
        "longitude",
        "GPSLatitude",
        "GPSLongitude",
        "DateTimeOriginal",
        "CreateDate",
        "ModifyDate",
      ],
    });

    if (parsed) {
      // 1. GPS Extraction
      let lat: number | null = null;
      let lng: number | null = null;

      if (
        typeof parsed.latitude === "number" &&
        typeof parsed.longitude === "number" &&
        !isNaN(parsed.latitude) &&
        !isNaN(parsed.longitude)
      ) {
        lat = parsed.latitude;
        lng = parsed.longitude;
      }

      if (lat !== null && lng !== null) {
        result.latitude = Number(lat.toFixed(6));
        result.longitude = Number(lng.toFixed(6));
        result.hasGps = true;
      }

      // 2. Timestamp Extraction (Priority: DateTimeOriginal -> CreateDate -> ModifyDate)
      const rawTimestamp =
        parsed.DateTimeOriginal || parsed.CreateDate || parsed.ModifyDate;

      if (rawTimestamp) {
        const isoString = formatToIsoString(rawTimestamp);
        if (isoString) {
          result.capturedAt = isoString;
          result.hasTimestamp = true;
        }
      }
    }
  } catch (err) {
    console.warn("[EXIF Service] EXIF parsing error or no EXIF present:", err);
  }

  return result;
}

function formatToIsoString(val: any): string | null {
  if (!val) return null;

  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString();
  }

  if (typeof val === "string") {
    const trimmed = val.trim();
    // Check standard EXIF format: YYYY:MM:DD HH:MM:SS
    const exifRegex = /^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/;
    const match = trimmed.match(exifRegex);

    if (match) {
      const [_, year, month, day, hour, min, sec] = match;
      const date = new Date(
        Date.UTC(
          parseInt(year, 10),
          parseInt(month, 10) - 1,
          parseInt(day, 10),
          parseInt(hour, 10),
          parseInt(min, 10),
          parseInt(sec, 10)
        )
      );
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    const parsedDate = new Date(trimmed);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  }

  return null;
}
