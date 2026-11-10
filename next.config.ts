import type { NextConfig } from "next";

// The 3D room's big files rarely change: let the browser keep them for an hour (instead of asking the server about every one on each visit).
const longCache = [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return ["/models/:path*", "/shop3d/:path*", "/draco/:path*", "/parties/:path*", "/intro/:path*"].map((source) => ({ source, headers: longCache }));
  },
};

export default nextConfig;
