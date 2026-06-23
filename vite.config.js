import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    react({ include: /\.(jsx?|tsx?)$/ }),
    svgr({
      svgrOptions: {
        svgo: false,
      },
    }),
  ],
})
