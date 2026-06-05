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
          dark: '#030712',       // deep dark gray
          slate: '#0b0f19',      // panel dark background
          card: 'rgba(17, 24, 39, 0.7)',
          primary: '#4f46e5',    // indigo accent
          secondary: '#06b6d4',  // cyan accent
          success: '#10b981',    // emerald
          danger: '#ef4444',     // red
          muted: '#9ca3af'       // gray text
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif']
      },
      boxShadow: {
        'neon-primary': '0 0 15px rgba(79, 70, 229, 0.4)',
        'neon-secondary': '0 0 15px rgba(6, 182, 212, 0.4)',
        'neon-success': '0 0 15px rgba(16, 185, 129, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
}
