import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ✅ Progressive Web App optimizations
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
      ],
    },
    {
      source: '/manifest.json',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],

  // ✅ Image optimization for better mobile performance
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },

  // ✅ Performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // ✅ Webpack optimizations
  webpack: (config: any, { dev, isServer }) => {
    // ✅ Ensure Yjs is only loaded once to prevent collaboration issues
    config.resolve.alias = {
      ...config.resolve.alias,
      yjs: require.resolve('yjs'),
    };

    // ✅ Optimize for collaboration libraries
    config.resolve.fallback = {
      ...config.resolve.fallback,
      yjs: require.resolve('yjs'),
    };

    // ✅ Bundle analyzer (optional - uncomment to analyze)
    // if (!dev && !isServer) {
    //   const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
    //   config.plugins.push(
    //     new BundleAnalyzerPlugin({
    //       analyzerMode: 'static',
    //       reportFilename: 'bundle-analyzer.html',
    //       openAnalyzer: false,
    //     })
    //   );
    // }

    // ✅ Optimize chunks for better caching
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            enforce: true,
          },
          liveblocks: {
            test: /[\\/]node_modules[\\/]@liveblocks[\\/]/,
            name: 'liveblocks',
            priority: 20,
            enforce: true,
          },
          tiptap: {
            test: /[\\/]node_modules[\\/]@tiptap[\\/]/,
            name: 'tiptap',
            priority: 20,
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // ✅ Experimental features for performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@tiptap/react'],
  },

  // ✅ Ignore lint/type errors during build (for Vercel deploys)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
