/// <reference types="vitest/config" />
import federation from '@originjs/vite-plugin-federation';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
    target: 'esnext',
  },
  plugins: [
    react(),
    visualizer({
      filename: './reports/stats.html',
    }),
    ViteImageOptimizer(),
    federation({
      name: 'app_shell',
      remotes: {
        spiceTracker: 'https://spice-tracker.dajohnston.co.uk/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', '@auth0/auth0-react'],
    }),
  ],
  test: {
    clearMocks: true,
    coverage: {
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/remotes.d.ts',
        'src/i18n.ts',
        'src/client',
        'src/**/*.stories.*',
        'src/app/remotes',
        'src/mocks',
        'src/@types',
      ],
      include: ['src/**/*.@(js|jsx|mjs|ts|tsx)'],
      provider: 'v8',
      reporter: ['json', 'html', 'lcov', 'text'],
    },
    environment: 'jsdom',
    globals: true,
    logHeapUsage: true,
    mockReset: true,
    outputFile: {
      junit: './reports/junit-report.xml',
    },
    reporters: ['default', 'junit'],
    restoreMocks: true,
    setupFiles: ['./vitest-setup.ts'],
  },
});
