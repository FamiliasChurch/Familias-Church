/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Smooch Sans', 'sans-serif'], // Títulos
        body: ['Raleway', 'sans-serif'],      // Textos
      },
      colors: {
        primaria: "#163a30", // Seu verde original
        destaque: "#d4a373", // Seu dourado original
        background: "#060e0c", // Fundo dark
      },
    },
  },
  plugins: [],
}