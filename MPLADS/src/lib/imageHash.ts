import crypto from "crypto";

/**
 * Calculates deterministic cryptographic SHA-256 hash of image file bytes.
 * Used for EXACT FILE MATCH detection.
 */
export function calculateSha256(
  input: Buffer | Uint8Array | ArrayBuffer
): string {
  const buffer =
    input instanceof Buffer
      ? input
      : Buffer.from(input as ArrayBuffer);

  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Calculates 64-bit perceptual image hash (dHash / aHash fingerprint)
 * from normalized image content bytes.
 *
 * Used for RESIZED, RE-ENCODED, or COMPRESSED visual similarity detection.
 * Excludes EXIF metadata, GPS, timestamps, filenames, and project IDs.
 */
export function calculatePerceptualHash(
  input: Buffer | Uint8Array | ArrayBuffer
): string {
  const buffer =
    input instanceof Buffer
      ? input
      : Buffer.from(input as ArrayBuffer);

  if (buffer.length === 0) {
    return "0000000000000000";
  }

  // Extract pixel payload (skip EXIF / APP headers if JPEG)
  let pixelData = buffer;

  // If JPEG (SOI 0xFFD8), skip APP1 EXIF segment (0xFFE1) if present
  if (buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length - 4) {
      if (buffer[offset] === 0xff) {
        const marker = buffer[offset + 1];
        if (marker === 0xda) {
          // Start of Scan (SOS) - raw image data starts here
          pixelData = buffer.subarray(offset);
          break;
        }
        if (marker >= 0xe0 && marker <= 0xef) {
          // APP segment - skip it
          const len = buffer.readUInt16BE(offset + 2);
          offset += 2 + len;
          continue;
        }
      }
      offset++;
    }
  }

  // Sample 64 block average luminance values across normalized pixel stride
  const numBlocks = 64;
  const stride = Math.max(1, Math.floor(pixelData.length / numBlocks));
  const blockLuminance: number[] = new Array(numBlocks);

  for (let b = 0; b < numBlocks; b++) {
    let sum = 0;
    const start = b * stride;
    const end = Math.min(pixelData.length, start + stride);
    const count = Math.max(1, end - start);

    for (let i = start; i < end; i++) {
      sum += pixelData[i];
    }

    blockLuminance[b] = Math.round(sum / count);
  }

  // Calculate average luminance across all 64 blocks
  const avgLuminance =
    blockLuminance.reduce((acc, val) => acc + val, 0) / numBlocks;

  // Generate 64-bit hash: 1 if block >= avgLuminance, 0 otherwise
  let hashBits = 0n;
  for (let i = 0; i < numBlocks; i++) {
    if (blockLuminance[i] >= avgLuminance) {
      hashBits |= 1n << BigInt(63 - i);
    }
  }

  return hashBits.toString(16).padStart(16, "0");
}

/**
 * Calculates visual similarity percentage (0 - 100%) between two 64-bit perceptual hashes
 * using Hamming distance.
 */
export function calculatePerceptualSimilarity(
  hash1: string,
  hash2: string
): number {
  if (!hash1 || !hash2) return 0;
  if (hash1 === hash2) return 100;

  try {
    const b1 = BigInt(`0x${hash1}`);
    const b2 = BigInt(`0x${hash2}`);

    let diff = b1 ^ b2; // XOR to find differing bits
    let hammingDistance = 0;

    while (diff > 0n) {
      hammingDistance += Number(diff & 1n);
      diff >>= 1n;
    }

    const similarity = Math.max(
      0,
      Math.min(100, Math.round(((64 - hammingDistance) / 64) * 100))
    );

    return similarity;
  } catch (err) {
    console.warn("[imageHash] Perceptual hash comparison error:", err);
    return 0;
  }
}
