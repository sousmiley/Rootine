/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'perenual.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;