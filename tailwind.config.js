/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FFC72C", // McDonald's yellow
          light: "#FFD45C",
          dark: "#FFBA00",
        },
        secondary: {
          DEFAULT: "#000000", // Pure black
          light: "#333333", 
          dark: "#000000",
        },
        accent: "#D92B2B", // McDonald's red
        background: "var(--background)",
        foreground: "var(--foreground)",
        neutral: {
          50: '#f9f9f9',
          100: '#ebebeb',
          200: '#d6d6d6',
          300: '#b3b3b3',
          400: '#8c8c8c',
          500: '#666666',
          600: '#4d4d4d',
          700: '#333333',
          800: '#1f1f1f',
          900: '#0f0f0f', // Very dark text
          950: '#050505',
        },
        button: {
          bg: "var(--button-bg)",
          text: "var(--button-text)",
          hover: "var(--button-hover)",
        },
        heading: {
          DEFAULT: "var(--heading-color)",
          sub: "var(--subheading-color)",
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundColor: {
        'yellow-gradient': 'linear-gradient(135deg, #FFC72C, #FFBA00)',
        'dark-gradient': 'linear-gradient(135deg, #1a1a1a, #121212)',
      },
      // Add custom button styles
      button: {
        primary: {
          DEFAULT: {
            backgroundColor: '#FFC72C',
            color: '#000000',
            fontWeight: '600',
          },
          hover: {
            backgroundColor: '#FFBA00',
          },
        },
        secondary: {
          DEFAULT: {
            backgroundColor: '#000000',
            color: '#FFC72C',
            fontWeight: '600',
          },
          hover: {
            backgroundColor: '#333333',
          },
        },
      },
    },
  },
  plugins: [],
}; 