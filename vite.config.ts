import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import federation from '@originjs/vite-plugin-federation';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'app_shell',
      remotes: {
        spiceTracker:
          'https://spice-tracker.dajohnston.co.uk/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', '@auth0/auth0-react'],
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
