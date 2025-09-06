import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          background: '#0a0a0f',    // Space black
          surface: '#121218',       // Card surface
          border: '#2a2a32',        // Subtle borders
          glow: '#00c2ff',          // Cyan glow
          primary: '#e0e0e0',       // Primary text
          secondary: '#a0a0a0',     // Secondary text
        },
        accent: {
          cyan: '#00c2ff',          // Primary accent
          purple: '#8b5cf6',        // Secondary accent
          green: '#10b981',         // Success accent
        },
        signal: {
          positive: '#10b981',      // Positive signals
          negative: '#ef4444',      // Negative signals
          neutral: '#6b7280',       // Neutral signals
        }
      },
      backgroundImage: {
        'aurora': 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(120,119,198,0.3), rgba(255,255,255,0))',
        'card-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0))',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
