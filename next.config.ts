import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // 禁用Edge运行时中的Node.js API
    serverComponentsExternalPackages: ["@prisma/client", "@auth/prisma-adapter"],
  },
};

export default nextConfig;
