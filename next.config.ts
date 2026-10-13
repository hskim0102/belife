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
    // srcset 폭 하나하나가 Cloudinary 변환 1회(무료 크레딧 차감)다. 원본은 업로드 때 긴 변 2000px 로
    // 줄여 두므로 기본값(…2048, 3840)은 같은 결과를 중복 생성할 뿐이라 단계를 줄인다.
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [256, 384],
  },
}

export default nextConfig
