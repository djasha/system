/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0606',
        bone: '#F5F1EC',
        accent: '#E8462C',
        elevated: '#1A1210',
      },
      fontFamily: {
        sans: ['Geist Variable', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk Variable', 'Geist Variable', 'sans-serif'],
        mono: ['Geist Mono Variable', 'ui-monospace', 'monospace'],
      },
      maxWidth: { content: '840px' },
    },
  },
  plugins: [],
};
