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
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'gradient-scroll': 'gradient-scroll 8s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'glow-line': 'glow-line 2s ease-in-out infinite',
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
        'gradient-shift': {
          '0%, 100%': { 
            'background-position': '0% 50%'
          },
          '50%': {
            'background-position': '100% 50%'
          },
        },
        'gradient-scroll': {
          '0%': { 'background-position': '0% 50%' },
          '100%': { 'background-position': '300% 50%' },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'glow-line': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
};

export default config;
