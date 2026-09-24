import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.6"],
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["eartha-connectional-marlana.ngrok-free.dev"],
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_SERVER_URL || "http://localhost:3001"}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);