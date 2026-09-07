/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#020617',
          surface: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          accent: '#0284c7'
        }
      }
    },
  },
  plugins: [],
}
