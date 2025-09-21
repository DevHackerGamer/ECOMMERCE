  /** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.nike.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        // Regional Firebase Storage custom domain form
        hostname: 'big-dawg-sneakers.firebasestorage.app',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
