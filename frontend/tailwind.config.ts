// import { type Config } from "tailwindcss";

// const config: Config = {
//   content: ["./index.html", "./src/**/*.{ts,tsx}"],
//   theme: {
//     extend: {
//       colors: {
//         primary: "#0F172A",
//         accent: "#FACC15",
//         correct: "#22C55E",
//         error: "#EF4444",
//       },
//       fontFamily: {
//         sans: ["Inter", "sans-serif"],
//       },
//     },
//   },
//   plugins: [],
// };

// export default config;


import { type Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'background': '#161B22', // A dark, professional navy/charcoal
        'surface': '#0D1117',   // A slightly darker shade for cards
        'border': '#30363d',    // Subtle border color
        'text-primary': '#e6edf3', // White/light-grey for primary text
        'text-secondary': '#7d8590', // Muted grey for secondary text
        'accent-blue': '#2f81f7',  // For tags or active links
        'positive': '#238636',
        'negative': '#da3633',
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;