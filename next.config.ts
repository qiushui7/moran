import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // 用于Docker部署
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    domains: [
      'avatars.githubusercontent.com', // GitHub头像
      'lh3.googleusercontent.com',    // Google头像
    ]
  }
};

export default nextConfig;
