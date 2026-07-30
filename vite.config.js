import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
 //base: '/etief-dashboard/',
  base: './',
  
  // To test with pinggy.net, you need to add the following configuration to your Vite config file:
  server: {
    allowedHosts: ['pvgbo-80-76-163-73.free.pinggy.net'],
  },
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ]
})
