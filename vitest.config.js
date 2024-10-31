import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      globals: true,
      setupFiles: './src/__tests__/setup.js',
      coverage: {
        all: true,
        provider: 'istanbul',
        reporter: ['text', 'json-summary', 'html'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{vue,js,ts}'],
        exclude: ['src/main.js', '**/__tests__/**'],
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  }),
);
