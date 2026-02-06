import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-atool': {
        target: 'https://aion2tool.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-atool/, ''),
        // 💡 브라우저 대신 프록시 서버가 헤더를 붙여서 보냄 (보안 우회 핵심)
        headers: {
          'Referer': 'https://aion2tool.com/',
          'Origin': 'https://aion2tool.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        }
      }
    }
  }
})