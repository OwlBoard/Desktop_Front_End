import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static generation - use server rendering
  output: 'standalone',
  
  // Transpile these ESM packages
  transpilePackages: ['konva', 'react-konva', 'react-konva-utils'],
  
  // Configure image optimization
  images: {
    unoptimized: true,
  },
  
  // Disable strict mode for compatibility
  reactStrictMode: true,
  
  // Disable ESLint during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during builds (only for initial migration)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimize production builds
  swcMinify: true,
  
  // Reduce build output
  productionBrowserSourceMaps: false,
  
  // Optimize webpack config
  webpack: (config, { isServer }) => {
    // Reduce webpack logging
    config.stats = 'errors-warnings';
    
    // Fix for react-konva and konva ESM modules
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas', 'konva', 'react-konva', 'react-konva-utils'];
    }
    
    // Optimize chunks for faster builds
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk for shared components
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;
