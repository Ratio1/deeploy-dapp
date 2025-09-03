import { heroui } from '@heroui/theme';
import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        './node_modules/@heroui/theme/dist/**/(alert|button|dropdown|checkbox|form|input|modal|pagination|select|skeleton|spinner|slider|switch|tabs|ripple|menu|divider|popover|listbox|scroll-shadow).js',
    ],
    darkMode: 'class',
    theme: {
        extend: {},
    },
    plugins: [heroui()],
};

export default config;
