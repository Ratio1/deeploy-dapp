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
            },
            outlineWidth: {
                3: '3px',
                6: '6px',
            },
            boxShadow: {
                round: '0 0px 2px 0 rgb(0 0 0 / 0.05)',
            },
        },
        screens: {
            xs: '400px',
            sm: '480px',
            md: '768px',
            layoutBreak: '836px',
            lg: '1024px',
            larger: '1232px',
            xl: '1410px',
        },
    },

    darkMode: 'class',
    plugins: [heroui()],
};
