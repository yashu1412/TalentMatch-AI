import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050816",
        surface: "#0B1120",
        card: "#111827",
        border: "rgba(96,165,250,0.18)",
        primary: {
          DEFAULT: "#2563EB",
          glow: "#38BDF8",
          light: "#60A5FA",
          dark: "#1D4ED8",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      backgroundImage: {
        "blue-radial":
          "radial-gradient(circle at center, rgba(56,189,248,0.20), transparent 55%)",
        "hero-glow":
          "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(56,189,248,0.05), transparent)",
        "grid-pattern":
          "linear-gradient(rgba(96,165,250,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.08) 1px, transparent 1px)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(2,6,23,0.45)",
        blue: "0 0 30px rgba(37,99,235,0.22)",
        glow: "0 0 45px rgba(56,189,248,0.28)",
        soft: "0 10px 40px rgba(15,23,42,0.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      perspective: {
        1000: "1000px",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.6", filter: "blur(18px)" },
          "50%": { opacity: "1", filter: "blur(24px)" },
        },
        shine: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(120%)" },
        },
        gridMove: {
          "0%": { transform: "translateY(0px)" },
          "100%": { transform: "translateY(40px)" },
        },
        orbSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.95)", opacity: "0.6" },
          "70%": { transform: "scale(1.05)", opacity: "0.2" },
          "100%": { transform: "scale(1.12)", opacity: "0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        glowPulse: "glowPulse 4s ease-in-out infinite",
        shine: "shine 2.5s linear infinite",
        gridMove: "gridMove 8s linear infinite",
        orbSpin: "orbSpin 20s linear infinite",
        fadeUp: "fadeUp 0.7s ease-out forwards",
        pulseRing: "pulseRing 2.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
