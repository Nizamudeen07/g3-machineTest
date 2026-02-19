import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
 
// Resolve paths for assets, and configure base if needed
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
 
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Set up aliases for easier imports, especially for assets
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
  },
 
  build: {
    // Define the build output directory
    outDir: 'dist',
    assetsDir: 'assets',  // Place all assets inside the assets folder in dist
    // Additional optimization if needed for images and static assets
    rollupOptions: {
      output: {
        // Maintain file names (hashes added for cache busting)
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
 
