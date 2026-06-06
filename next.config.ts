import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-d03583f1-3843-4b84-b909-6672ba280af2.space-z.ai",
    ".space-z.ai",
  ],
};

export default nextConfig;
