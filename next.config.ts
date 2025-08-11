import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
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
    return config;
  },
};

export default nextConfig;
