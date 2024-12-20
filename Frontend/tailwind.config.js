/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      fontFamily: {
        body: ['Roboto']
      },
      colors: {
        primary: '#096B95', 
        secondary: '#134866', 
        accent: '#00A9DC',
        backgroundColor : '#f8fafc',

      },
      borderRadius: {
        primary : '60px',
      },
    },
  },
  plugins: [
  ],
}