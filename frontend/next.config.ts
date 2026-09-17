import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5242",
        pathname: "/api/arquivos/**",
      },
    ],
  },
};

export default nextConfig;
