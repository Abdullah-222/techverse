import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration for module aliasing
  turbopack: {
    resolveAlias: {
      // Replace @mediapipe/selfie_segmentation with dummy module
      "@mediapipe/selfie_segmentation": "./lib/dummy-mediapipe.js",
    },
  },

  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // --- Ignore the broken 100ms virtual background module globally ---
    config.resolve.alias["@100mslive/hms-virtual-background"] = false;

    // --- Replace @mediapipe/selfie_segmentation with dummy module ---
    // This prevents build errors when the feature is disabled in 100ms dashboard
    // but the SDK still tries to import it
    const path = require("path");
    config.resolve.alias["@mediapipe/selfie_segmentation"] = path.resolve(
      __dirname,
      "lib/dummy-mediapipe.js"
    );

    // --- Handle Mediapipe only on server side (fallback) ---
    if (isServer) {
      // Keep external for server-side if needed
      if (!config.externals) {
        config.externals = [];
      }
      // Don't externalize if we're using the dummy module
    }

    // --- Handle client-side fallbacks for missing Node modules ---
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };

      // --- Improve chunk loading (helps with dynamic imports) ---
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            default: false,
            vendors: false,
            vendor: {
              name: "vendor",
              chunks: "all",
              test: /node_modules/,
              priority: 20,
            },
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;
