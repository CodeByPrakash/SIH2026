"use client";

import React, { useState } from "react";

interface MetadataResult {
  fileName: string;
  fileType: string;
  fileSize: number;
  latitude: number | null;
  longitude: number | null;
  capturedAt: string | null;
  hasGps: boolean;
  hasTimestamp: boolean;
}

export default function TestExifPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MetadataResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setError(null);
    }
  };

  const handleExtractMetadata = async () => {
    if (!selectedFile) {
      setError("Please select an image file first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("photo", selectedFile);

      const res = await fetch("/api/evidence/metadata", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to extract EXIF metadata.");
      } else {
        setResult(json.data);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px", fontFamily: "sans-serif", maxWidth: "650px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
        EXIF Metadata Extraction Test Page
      </h1>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>
        Development tool to test Phase 1 real photo EXIF metadata extraction via <code>/api/evidence/metadata</code>.
      </p>

      <div style={{ background: "#f8f9fa", border: "1px border #ccc", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontWeight: "600", fontSize: "14px", marginBottom: "8px" }}>
            Select Evidence Image (JPG, PNG, WEBP):
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ fontSize: "14px" }}
          />
        </div>

        <button
          onClick={handleExtractMetadata}
          disabled={!selectedFile || loading}
          style={{
            backgroundColor: !selectedFile || loading ? "#94a3b8" : "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "10px 20px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: !selectedFile || loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Extracting Metadata..." : "Extract Metadata"}
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: "6px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px", color: "#1e293b" }}>
            Extracted Metadata Results
          </h2>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 0", color: "#64748b", fontWeight: "600" }}>File Name:</td>
                <td style={{ padding: "8px 0", color: "#0f172a", fontFamily: "monospace" }}>{result.fileName}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 0", color: "#64748b", fontWeight: "600" }}>File Type:</td>
                <td style={{ padding: "8px 0", color: "#0f172a" }}>{result.fileType}</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 0", color: "#64748b", fontWeight: "600" }}>File Size:</td>
                <td style={{ padding: "8px 0", color: "#0f172a" }}>{(result.fileSize / 1024).toFixed(1)} KB ({result.fileSize} bytes)</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 0", color: "#64748b", fontWeight: "600" }}>GPS Metadata:</td>
                <td style={{ padding: "8px 0" }}>
                  {result.hasGps ? (
                    <span style={{ color: "#16a34a", fontWeight: "bold" }}>Available</span>
                  ) : (
                    <span style={{ color: "#dc2626", fontWeight: "bold" }}>Not Available</span>
                  )}
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 0", color: "#64748b", fontWeight: "600" }}>Photo Latitude (GPS):</td>
                <td style={{ padding: "8px 0", color: "#0f172a", fontFamily: "monospace" }}>
                  {result.latitude !== null ? result.latitude : "N/A"}
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 0", color: "#64748b", fontWeight: "600" }}>Photo Longitude (GPS):</td>
                <td style={{ padding: "8px 0", color: "#0f172a", fontFamily: "monospace" }}>
                  {result.longitude !== null ? result.longitude : "N/A"}
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 0", color: "#64748b", fontWeight: "600" }}>EXIF Capture Timestamp:</td>
                <td style={{ padding: "8px 0", color: "#0f172a" }}>
                  {result.capturedAt ? (
                    <span>{new Date(result.capturedAt).toLocaleString()} ({result.capturedAt})</span>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>EXIF capture timestamp not available</span>
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", color: "#64748b", fontWeight: "600" }}>Timestamp Status:</td>
                <td style={{ padding: "8px 0" }}>
                  {result.hasTimestamp ? (
                    <span style={{ color: "#16a34a", fontWeight: "bold" }}>Available</span>
                  ) : (
                    <span style={{ color: "#dc2626", fontWeight: "bold" }}>Not Available</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
