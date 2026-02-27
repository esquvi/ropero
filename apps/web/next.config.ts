import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@ropero/core', '@ropero/supabase', '@ropero/ui'],
};

export default nextConfig;
