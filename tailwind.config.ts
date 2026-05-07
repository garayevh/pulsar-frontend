import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          500: '#4f6ef7',
          600: '#3a56e8',
          700: '#2b42cc',
          900: '#1a2a7a',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f8f9fb',
          100: '#f1f3f7',
          200: '#e4e8f0',
          400: '#9099b0',
          500: '#6b7594',
          800: '#1e2130',
          900: '#141624',
          950: '#0d0f1a',
        },
      },
    },
  },
  plugins: [],
}
export default config