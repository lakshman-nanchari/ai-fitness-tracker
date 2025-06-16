/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  extend: {
    keyframes: {
    fadeInOut: {
      '0%, 100%': { opacity: 0 },
      '50%': { opacity: 1 }
    }
  },
  animation: {
    'fade-in-out': 'fadeInOut 5s ease-in-out infinite'
  }
  },
},
  plugins: [
  require('@tailwindcss/forms'),
  require('@tailwindcss/typography'),
  require('@tailwindcss/aspect-ratio'),
  require('@tailwindcss/line-clamp'),
]

}
