/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-in-left': 'slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
        'message-enter': 'messageEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'typing-bounce': 'typingBounce 1.4s infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'bubble-in': 'bubbleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'track-move': 'trackMove 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInRight: {
          'from': {
            opacity: '0',
            transform: 'translateX(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        slideInLeft: {
          'from': {
            opacity: '0',
            transform: 'translateX(-20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        gradientShift: {
          '0%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
          '100%': {
            'background-position': '0% 50%',
          },
        },
        messageEnter: {
          'from': {
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        typingBounce: {
          '0%, 60%, 100%': {
            transform: 'translateY(0)',
          },
          '30%': {
            transform: 'translateY(-10px)',
          },
        },
        shimmer: {
          '0%': {
            left: '-100%',
          },
          '100%': {
            left: '100%',
          },
        },
        bubbleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.3) translateY(20px)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.05) translateY(-5px)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
        },
        trackMove: {
          '0%': {
            transform: 'translateX(0)',
          },
          '100%': {
            transform: 'translateX(40px)',
          },
        },
      },
    },
  },
  plugins: [],
} 