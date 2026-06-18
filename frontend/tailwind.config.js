/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F19', // Darkest background
        surface: '#111827', // Card surface
        surfaceHover: '#1F2937',
        primary: '#3B82F6', // Blue
        primaryGlow: 'rgba(59, 130, 246, 0.5)',
        secondary: '#8B5CF6', // Purple
        accent: '#06B6D4', // Cyan
        accentGlow: 'rgba(6, 182, 212, 0.5)',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
    },
  },
  plugins: [],
}
