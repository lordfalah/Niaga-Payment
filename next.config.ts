import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "robohash.org",
      },
      {
        protocol: "https",
        hostname: "c9eruzymfc.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  allowedDevOrigins: [
    "local-origin.dev",
    "*.local-origin.dev",
    "http://10.126.231.190:3000",
  ],
};

export default nextConfig;
