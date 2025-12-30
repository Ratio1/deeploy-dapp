/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],
};

export default nextConfig;
