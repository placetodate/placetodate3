/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": "#f4259d",
                "background-light": "#fcf8fa",
                "background-dark": "#1c0d16",
                "accent-pastel": "#fdf2f8",
                "sky-pastel": "#f0f9ff",
                "background-soft": "#fcfcfd",
                "text-main": "#374151",
                "text-muted": "#6b7280",
                "border-light": "#e5e7eb"
            },
            fontFamily: {
                "display": ["Plus Jakarta Sans", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "1rem",
                "lg": "1.5rem",
                "xl": "2rem",
                "full": "9999px"
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
            }
        },
    },
    plugins: [],
}
