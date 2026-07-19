const nativewindPreset = require('nativewind/preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  presets: [nativewindPreset],
  theme: {
    extend: {},
  },
  plugins: [],
};
