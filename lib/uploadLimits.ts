/**
 * 업로드 용량 상한. 서버(lib/blob.ts)와 클라이언트 폼이 같은 값을 쓰도록 따로 뺀 상수다.
 * (lib/blob.ts 는 'server-only' 라 클라이언트 컴포넌트에서 import 할 수 없다)
 *
 * 이 값은 다음 두 가지보다 작아야 한다:
 *   - next.config.ts 의 experimental.serverActions.bodySizeLimit
 *   - Vercel 서버리스 함수의 요청 본문 상한(4.5MB)
 * 넘어서면 서버 액션이 실행되기 전에 500 이 나서 코드로 안내할 수 없다.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
export const MAX_UPLOAD_LABEL = '4MB'

/** 사람이 읽는 파일 크기 표기 (예: 5.2MB) */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}
