import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ads.txt",
        destination: "/api/ads-txt",
      },
    ];
  },
};

export default nextConfig;