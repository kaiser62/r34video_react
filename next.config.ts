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
  },
};

export default nextConfig;