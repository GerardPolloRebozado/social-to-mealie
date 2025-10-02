import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@opentelemetry/auto-instrumentations-node'],
};

export default nextConfig;
