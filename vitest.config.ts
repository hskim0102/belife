// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      // 서버 전용 가드 모듈은 테스트에서 로드할 수 없으므로 빈 모듈로 대체한다.
      'server-only': path.resolve(__dirname, '__tests__/stubs/server-only.ts'),
    },
  },
})
