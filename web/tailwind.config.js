/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        neon: '#00FFFF',
        violet: '#8A2BE2'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 20px rgba(0,255,255,0.3)'
      },
      backgroundImage: {
        gridgrad: 'radial-gradient(1200px 600px at 50% -20%, rgba(0,255,255,0.08), transparent), radial-gradient(800px 400px at 80% 120%, rgba(138,43,226,0.08), transparent)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(0,255,255,0.0)' },
          '50%': { boxShadow: '0 0 24px rgba(0,255,255,0.35)' }
        }
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};


