import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rule34video.com",
        port: "",
        pathname: "/contents/videos_screenshots/**",
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 hours
  },
  // External packages for server components
  serverExternalPackages: ['cheerio'],
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Output file tracing root to fix warning
  outputFileTracingRoot: __dirname,
};

export default nextConfig;