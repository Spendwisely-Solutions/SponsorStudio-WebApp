import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The old "How we work" route moved to a dedicated page; 308 keeps its search ranking.
      { source: "/how-we-work", destination: "/how-it-works", permanent: true },
    ];
  },
};

export default nextConfig;
