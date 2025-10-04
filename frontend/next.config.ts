import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config: any) => {
    // Ensure Yjs is only loaded once to prevent collaboration issues
    config.resolve.alias = {
      ...config.resolve.alias,
      'yjs': require.resolve('yjs')
    };
    
    // Optimize for collaboration libraries
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'yjs': require.resolve('yjs')
    };
    
    return config;
  },
};

export default nextConfig;
