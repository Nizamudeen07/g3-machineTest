/** @type {import('tailwindcss').Config} */
export default {
 content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
      },
      backgroundImage: {
        'loginBackground': "url('@assets/download 1.png')",
       
        
        
 
      },
    },
  },
  plugins: [],
}

