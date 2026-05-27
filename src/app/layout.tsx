import type { Metadata } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SpaceBackground from "@/components/SpaceBackground";
import TopStatusBar from "@/components/TopStatusBar";

const CF_ANALYTICS_TOKEN = "d2209cdd00e247378bf74ddf8658e9a0";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
});

const siteUrl = "https://aibench.cc";
const siteTitle = "AIBench.cc — 多厂商 LLM API 健康检测";
const siteDescription =
  "一次粘贴 key，看清你的 API 渠道在延迟、缓存、限流、模型纯度、token 计费上的真实表现。覆盖 OpenAI / Claude / Gemini + 国产 DeepSeek / Kimi / 智谱 / 通义 / 豆包 等 10+ 厂商。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    type: "website",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName: "AIBench.cc",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  icons: {
    icon: "/aibench-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${jbmono.variable}`}>
      <body className="space-bg font-sans antialiased min-h-screen bg-base text-hi selection:bg-brand/40">
        <SpaceBackground />
        <div className="aurora" aria-hidden>
          <span className="aurora__orb aurora__orb--1" />
          <span className="aurora__orb aurora__orb--2" />
          <span className="aurora__orb aurora__orb--3" />
        </div>
        <TopStatusBar />
        {children}
        {process.env.NODE_ENV === "production" && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="lazyOnload"
            data-cf-beacon={`{"token": "${CF_ANALYTICS_TOKEN}"}`}
          />
        )}
      </body>
    </html>
  );
}
