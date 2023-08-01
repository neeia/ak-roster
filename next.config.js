/** @type {import('next').NextConfig} */
const nextConfig = {
  //reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/u/:user*',
        destination: '/network/lookup/:user*',
        permanent: false,
      },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 604800,
  }
}

export default nextConfig;