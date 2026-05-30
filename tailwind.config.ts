import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 商业报告风 design tokens
        base: "#EEF2F6", // 页面最底
        surface: "#F6F8FB", // 区块底
        card: "#FFFFFF", // 卡片底
        brand: {
          DEFAULT: "#1457D9",
          bright: "#2563EB",
          deep: "#133C8B",
        },
        hi: "#101828", // 主文字
        mid: "#475467", // 次文字
        lo: "#667085", // 弱文字
        ok: "#079455",
        warn: "#DC8A00",
        err: "#D92D20",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "Source Han Sans SC",
          "思源黑体",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif",
        ],
        mono: [
          "var(--font-jbmono)",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(20,87,217,0.20), 0 12px 34px -16px rgba(20,87,217,0.45)",
        "glow-sm": "0 18px 40px -24px rgba(20,87,217,0.35)",
        card: "0 16px 44px -28px rgba(16,24,40,0.32)",
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(16,24,40,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,24,40,0.035) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(60% 60% at 50% 0%, rgba(20,87,217,0.12) 0%, rgba(20,87,217,0.04) 35%, transparent 70%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.85)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [],
};

export default config;
