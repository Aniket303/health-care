import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Experimental features that can help with CSS processing
  experimental: {
    // Optimize CSS imports for better performance
    optimizeCss: true,
  },

  // Enable Turbopack configuration (Next.js 16 default)
  turbopack: {},
};

export default nextConfig;
