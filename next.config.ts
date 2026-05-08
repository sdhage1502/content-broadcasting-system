import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev HMR when accessed via the IDE browser preview proxy.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
