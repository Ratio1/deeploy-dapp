import { heroui } from '@heroui/theme';
import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        './node_modules/@heroui/theme/dist/**/(alert|button|checkbox|date-picker|dropdown|form|input|modal|pagination|select|skeleton|slider|spinner|toggle|tabs|ripple|calendar|date-input|popover|menu|divider|listbox|scroll-shadow).js',
    ],
    darkMode: 'class',
    theme: {
        extend: {},
    },
    plugins: [heroui()],
};

export default config;
