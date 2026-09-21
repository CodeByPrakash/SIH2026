import type { NextConfig } from "next";

const MODEL_API_URL = process.env.MODEL_API_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["mongoose", "mongodb"],
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${MODEL_API_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
