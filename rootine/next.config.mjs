/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
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