/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  extend: {
    colors: {
      primary: '#FACC15', // yellow-400
      darkPrimary: '#9333EA', // purple-600
    },
  },
},
  plugins: [
  require('@tailwindcss/forms'),
  require('@tailwindcss/typography'),
  require('@tailwindcss/aspect-ratio'),
  require('@tailwindcss/line-clamp'),
]

}
