/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#ff69b4",
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
                "lg": "2rem",
                "xl": "3rem",
                "full": "9999px"
            },
        },
    },
    plugins: [],
}
