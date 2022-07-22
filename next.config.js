/* Modified as per https://melvingeorge.me/blog/nextjs-pwa */
const withOffline = require("next-offline");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}


module.exports = withOffline(nextConfig);