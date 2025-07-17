const { heroui } = require('@heroui/theme');

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@heroui/theme/dist/components/(alert|button|dropdown|form|input|modal|pagination|select|skeleton|spinner|tabs|ripple|menu|divider|popover|listbox|scroll-shadow).js',
    ],
    theme: {
        extend: {
            fontFamily: {
                mona: ['Mona Sans', 'sans-serif'],
                robotoMono: ['Roboto Mono', 'serif'],
            },
            flex: {
                0: '0',
                2: '2 1 0%',
                3: '3 1 0%',
                4: '4 1 0%',
            },
            colors: {
                body: '#0b0b47',
                light: '#fcfcfd',
                primary: '#1b47f7',
                slate: {
                    150: '#e9edf2',
                },
            },
            outlineWidth: {
                3: '3px',
                6: '6px',
            },
            boxShadow: {
                custom: '0 0 0 3px #e2e8f0',
            },
            width: {
                sider: '262px',
                'small-sider': '240px',
            },
            margin: {
                'sider-with-padding': 'calc(262px + 1rem)',
                'small-sider-with-padding': 'calc(240px + 1rem)',
            },
            backdropBlur: {
                xs: '1px',
            },
        },
        screens: {
            break: '900px', // Screens narrower than this won't be supported
            lg: '1024px',
            larger: '1200px',
            xl: '1320px',
        },
    },

    darkMode: 'class',
    plugins: [heroui()],
};
