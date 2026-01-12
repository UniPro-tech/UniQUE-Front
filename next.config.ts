import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    webpackMemoryOptimizations: true,
    authInterrupts: true,
  },
};

export default nextConfig;
