import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  async redirects() {
    return [
      { source: "/", destination: "/user", permanent: false },
    ];
  },
};

export default nextConfig;
