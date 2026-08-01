/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        porcelain: "#FFFBFD",
        rose: "#B98196",
        roseDark: "#8E4F68",
        petal: "#F891BB",
        blush: "#FFF5FB",
        cream: "#FBF4D7",
        mauve: "#DAB9C6",
        ink: "#493740",
        muted: "#806A74",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
      },
      boxShadow: {
        romantic: "0 8px 24px rgba(142, 79, 104, 0.06)",
        petal: "0 2px 8px rgba(142, 79, 104, 0.08)",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "70%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        softFloat: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(-4deg)" },
          "50%": { transform: "translate3d(0, -8px, 0) rotate(2deg)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.8s ease-out infinite",
        fadeUp: "fadeUp 0.7s ease-out both",
        softFloat: "softFloat 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
