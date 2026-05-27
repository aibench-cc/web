import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";

export default function SponsorFooter() {
  return (
    <footer className="relative mt-16 border-t border-white/[0.06] bg-surface/40">
      <div className="mx-auto max-w-6xl px-6 py-12 flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl flex flex-col gap-4">
          <Image
            src="/aibench-logo.svg"
            alt="AIBench.cc"
            width={132}
            height={28}
          />
          <p className="text-sm leading-relaxed text-mid">
            AIBench.cc 由{" "}
            <a
              href="https://modelboxs.com/"
              target="_blank"
              rel="noopener"
              className="font-semibold text-hi underline-offset-4 hover:text-brand-bright hover:underline"
            >
              模盒
            </a>{" "}
            赞助。模盒为开发者提供 OpenAI / Claude / Gemini /
            国产大模型一站式中转，本检测站的运营成本由其承担 —— 而检测逻辑、评分标准、行业榜排名始终保持中立、公开、可审计。
          </p>
        </div>

        <div className="flex flex-col gap-4 text-sm text-mid md:items-end">
          <a
            href="https://modelboxs.com/"
            target="_blank"
            rel="noopener"
            className="group inline-flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-card/60 px-4 py-2.5 transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:border-brand/40"
          >
            <Image
              src="/modelboxs-logo.jpg"
              alt="模盒 modelboxs"
              width={22}
              height={22}
              className="rounded"
            />
            <span className="text-hi">访问 modelboxs.com</span>
          </a>
          <div className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
            <Link href="/" className="transition-colors hover:text-hi">
              首页
            </Link>
            <Link href="/leaderboard" className="transition-colors hover:text-hi">
              行业榜
            </Link>
            <a
              href="https://github.com/aibench-cc"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-hi"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <Link href="/about" className="transition-colors hover:text-hi">
              关于
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-hi">
              隐私
            </Link>
            <Link href="/terms" className="transition-colors hover:text-hi">
              条款
            </Link>
            <a
              href="mailto:zhuyiwen00@gmail.com"
              className="transition-colors hover:text-hi"
            >
              联系
            </a>
          </div>
          <p className="text-xs text-lo">
            &copy; {new Date().getFullYear()} AIBench.cc · 开源 · 中立 · 多厂商
          </p>
        </div>
      </div>
    </footer>
  );
}
