/** @type {import('next').NextConfig} */
const nextConfig = {
  //reactStrictMode: true,
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
  },
};

module.exports = nextConfig;
