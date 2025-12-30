import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: 'jsdom',
        setupFiles: ['src/__tests__/setup.ts'],
        include: ['src/__tests__/**/*.test.{ts,tsx}'],
        css: true,
    },
});
