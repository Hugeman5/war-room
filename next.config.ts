
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [
      'firebase',
      'rss-parser',
      'openai',
      '@opentelemetry/api',
      '@opentelemetry/sdk-trace-base',
      '@opentelemetry/resources',
      '@opentelemetry/sdk-node',
      '@opentelemetry/instrumentation',
    ],
  },
};

export default nextConfig;
