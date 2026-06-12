/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // DevQuest palette — bright but not babyish (audience: 10–15).
        primary: {
          DEFAULT: '#6D5DF6',
          dark: '#4F3FD8',
          light: '#9C90FA',
        },
        accent: {
          DEFAULT: '#FFB020', // XP / energy gold
          dark: '#E8950A',
        },
        success: '#2DCE76',
        danger: '#F4504D',
        surface: {
          DEFAULT: '#FFFFFF',
          dim: '#F4F4F8',
          dark: '#17152B',
        },
        ink: {
          DEFAULT: '#1F1B3A',
          muted: '#6E6A8A',
        },
      },
    },
  },
  plugins: [],
};
