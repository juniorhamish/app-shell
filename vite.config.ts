/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import federation from '@originjs/vite-plugin-federation';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer(),
    federation({
      name: 'app_shell',
      remotes: {
        spiceTracker: 'https://spice-tracker.dajohnston.co.uk/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', '@auth0/auth0-react'],
    }),
  ],
  build: {
    target: 'esnext',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['json', 'html', 'lcov', 'text'],
      include: ['src/**/*.@(js|jsx|mjs|ts|tsx)'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/remotes.d.ts', 'src/i18n.ts'],
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './reports/junit-report.xml',
    },
    logHeapUsage: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
});
