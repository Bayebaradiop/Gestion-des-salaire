import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Activation des fonctionnalités avancées de React
      jsxRuntime: 'automatic',
      // Désactiver la vérification stricte temporairement pour résoudre les problèmes de rendu
      fastRefresh: true,
      // Meilleure gestion des erreurs
      include: '**/*.{jsx,tsx}',
    })
  ],
  server: {
    port: 3001,
    open: true,
    // Amélioration pour éviter les problèmes CORS
    cors: true,
  },
  build: {
    // Amélioration pour une meilleure compatibilité
    outDir: 'dist',
    sourcemap: true,
    // Éviter les erreurs de chunk
    chunkSizeWarningLimit: 1500,
  },
  // Améliorer la gestion de React
  resolve: {
    alias: {
      // S'assurer que React est correctement résolu
      'react': 'react',
      'react-dom': 'react-dom',
    }
  },
  // Débogage
  logLevel: 'info'
})