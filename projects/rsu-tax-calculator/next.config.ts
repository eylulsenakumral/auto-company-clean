import type { NextConfig } from "next";

const nextConfig: NextConfig ***REMOVED*** {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
