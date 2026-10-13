'use client'

import { cloudinaryUrl, isCloudinaryImage } from './cloudinary'

// next/image 커스텀 로더(next.config.ts images.loaderFile).
// Cloudinary 이미지는 Cloudinary 가 크기·포맷을 변환하고, 로컬 정적 파일(/logo.svg 등)은
// 그대로 쓴다. Vercel 이미지 최적화를 거치지 않으므로 그쪽 무료 한도를 쓰지 않는다.
export default function cloudinaryLoader({ src, width }: { src: string; width: number }): string {
  if (isCloudinaryImage(src)) return cloudinaryUrl(src, width)
  // 로더가 width 를 쓰지 않으면 Next 가 경고하므로 정적 파일에도 붙인다(서버는 무시).
  return `${src}${src.includes('?') ? '&' : '?'}w=${width}`
}
