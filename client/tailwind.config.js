// tailwind.config.js
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: 'media',
    theme: {
      extend: {
        opacity: ['disabled'],
      },
    },
    plugins: [
      require('tailwind-scrollbar-hide')
    ],
  }
  