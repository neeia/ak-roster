/** @type {import('next').NextConfig} */
const nextConfig = {
  //reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
  async redirects() {
    return [
      {
        source: "/u/:user*",
        destination: "/network/lookup/:user*",
        permanent: false,
      },
      {
        source: "/planner/goals",
        destination: "/data/planner",
        permanent: false,
      },
      {
        source: "/account/profile",
        destination: "/data/profile",
        permanent: false,
      },
      {
        source: "/account/settings",
        destination: "/settings",
        permanent: false,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd3gqz3mx7fd4v.cloudfront.net',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

module.exports = nextConfig;
