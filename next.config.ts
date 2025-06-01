
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // experimental: {
  //   allowedDevOrigins: ['https://6000-firebase-studio-1748430656424.cluster-l6vkdperq5ebaqo3qy4ksvoqom.cloudworkstations.dev'],
  // },
};

export default nextConfig;
