import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()]
  // root: 'src', // Set 'src' as the project root
  // build: {
  //   outDir: '../dist' // Output to a 'dist' folder in the project root
  // }
});