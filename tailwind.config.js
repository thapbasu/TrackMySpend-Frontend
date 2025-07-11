/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5", // Modern purple-blue
        secondary: "#14B8A6", // Complementary teal
        accent: "#F97316", // Vibrant orange for buttons
        background: "#F5F7FA", // Light gray for background
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // A modern sans-serif font
      },
    },
  },
  plugins: [],
};
