import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 서버 액션 요청 본문의 기본 한도는 1MB라, 배너 사진 한 장에도 쉽게 걸린다.
      // (초과 시 액션이 실행되기 전에 500 이 나서 코드에서 잡을 수 없다)
      // Vercel 서버리스 함수의 요청 본문 상한이 4.5MB 이므로 그 아래로 잡는다.
      // lib/blob.ts 의 MAX_BYTES 와 같은 값을 유지할 것.
      bodySizeLimit: '4mb',
    },
  },
  images: {
    // 업로드 이미지는 Cloudinary 가 변환한다(lib/cloudinary-loader.ts).
    // Vercel Blob·이미지 최적화 무료 한도 초과로 옮겼다.
    loader: 'custom',
    loaderFile: './lib/cloudinary-loader.ts',
  },
}

export default nextConfig
