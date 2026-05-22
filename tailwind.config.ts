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
        brand: {
          DEFAULT: "#1E5FFF",
          primary: "#1E5FFF",
        },
        bg: {
          DEFAULT: "#FAFBFD",
        },
        ink: {
          900: "#0E1525",
          500: "#5B6478",
          300: "#9AA3B2",
        },
        signal: {
          ok: "#16A34A",
          warn: "#F59E0B",
          err: "#DC2626",
        },
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
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
