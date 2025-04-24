/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        'primary-hover': '#45a049',
        secondary: '#2196F3',
        danger: '#f44336',
        success: '#4CAF50',
        warning: '#FFC107',
        info: '#2196F3',
        light: '#f4f4f4',
        dark: '#333',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        rise: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        buildRotate: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(10deg)' },
        },
        moveUp: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        moveDown: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(10px)' },
        },
        workflowStretch: {
          '0%, 100%': { transform: 'scaleX(1)' },
          '50%': { transform: 'scaleX(1.2)' },
        },
        trophyRise: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(5deg)' },
        },
        trophyRotate: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(10deg)' },
        }
      },
      ripple: {
        '0%': { transform: 'scale(0)', opacity: '0.4' },
        '100%': { transform: 'scale(1)', opacity: '0' },
      },
      animation: {
        float: 'float linear infinite',
        rise: 'rise 2s ease-in-out infinite',
        'rise-slow': 'rise 3s ease-in-out infinite',
        'rise-fast': 'rise 1.5s ease-in-out infinite',
        'build-rotate': 'buildRotate 2s ease-in-out infinite',
        'move-up': 'moveUp 2s ease-in-out infinite',
        'move-down': 'moveDown 2s ease-in-out infinite',
        'workflow-stretch': 'workflowStretch 2s ease-in-out infinite',
        'trophy-rise': 'trophyRise 2s ease-in-out infinite',
        'trophy-rotate': 'trophyRotate 2s ease-in-out infinite'
      }
    }
  },
  plugins: [],
}