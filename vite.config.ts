import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [basicSsl(), react()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    https: true,
  },
})
