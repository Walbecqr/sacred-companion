import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Webpack configuration (used when NOT using Turbopack)
  webpack: (config, { isServer, dev }) => {
    // Only apply webpack config when not using Turbopack
    if (!process.env.TURBOPACK) {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
          module: /@supabase[\\/]realtime-js[\\/]dist[\\/]module[\\/]lib[\\/]websocket-factory\.js/,
          message: /Critical dependency: the request of a dependency is an expression/,
        },
        {
          module: /@supabase[\\/]realtime-js[\\/]dist[\\/]module[\\/]lib[\\/]websocket-factory\.js/,
          message: /A Node\.js API is used .* Edge Runtime/,
        },
        {
          module: /@supabase[\\/]supabase-js[\\/]dist[\\/]module[\\/]index\.js/,
          message: /A Node\.js API is used .* Edge Runtime/,
        },
      ];
    }
    return config;
  },

  // Turbopack-specific configuration
  experimental: {
    // Note: Turbopack handles many warnings automatically
    // These Supabase warnings are typically handled by Turbopack's built-in optimizations
    turbo: {
      // Turbopack configuration is simpler and many webpack configs are not needed
      resolveAlias: {
        // Add any necessary alias configurations here if needed
      },
    },
  },
};

export default nextConfig;
