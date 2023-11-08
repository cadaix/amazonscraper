/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    /* config options here */
    experimental: {
        serverActions: true,
        serverComponentsExternalPackages: ['mongoose']
      },
      images: {
        domains: ['m.media-amazon.com']
      }
  }
   
  module.exports = nextConfig