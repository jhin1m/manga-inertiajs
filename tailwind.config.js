import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
        colors: {
            'primary': {
                '50': '#fdf8ef',
                '100': '#fbefd9',
                '200': '#f6dcb2',
                '300': '#f1c380',
                '400': '#ecaa5f',
                '500': '#e5862a',
                '600': '#d66d20',
                '700': '#b2541c',
                '800': '#8e431e',
                '900': '#72391c',
                '950': '#3e1b0c',
            },
        }
    },

    plugins: [forms],
};
