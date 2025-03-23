import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  root: 'src',
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
});
