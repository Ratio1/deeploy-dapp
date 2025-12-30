import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: 'e2e',
    timeout: 60_000,
    expect: {
        timeout: 10_000,
    },
    use: {
        baseURL: 'http://localhost:3005',
        trace: 'retain-on-failure',
    },
    webServer: {
        command: 'node .next/standalone/server.js',
        url: 'http://localhost:3005',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
            PORT: '3005',
        },
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
