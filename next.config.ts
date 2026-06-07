import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob public URLs (uploaded hero slide images).
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
}

export default nextConfig
