import Image from "next/image";
import Link from "next/link";

export default function SponsorFooter() {
  return (
    <footer className="border-t border-ink-300/20 bg-white/60 mt-24">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl text-sm leading-relaxed text-ink-500">
          <p>
            AIBench.cc 由{" "}
            <a
              href="https://modelboxs.com/"
              target="_blank"
              rel="noopener"
              className="font-semibold text-ink-900 hover:text-brand"
            >
              模盒
            </a>{" "}
            赞助。模盒为开发者提供 OpenAI / Claude / Gemini /
            国产大模型一站式中转，本检测站的运营成本由其承担，检测逻辑保持中立。
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm text-ink-500 md:items-end">
          <a
            href="https://modelboxs.com/"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 hover:text-ink-900"
          >
            <Image
              src="/modelboxs-logo.jpg"
              alt="模盒 modelboxs"
              width={20}
              height={20}
              className="rounded"
            />
            <span>访问 modelboxs.com</span>
          </a>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-ink-900">
              首页
            </Link>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener"
              className="hover:text-ink-900"
            >
              GitHub
            </a>
            <Link href="/about" className="hover:text-ink-900">
              关于
            </Link>
          </div>
          <p className="text-xs text-ink-300">
            &copy; {new Date().getFullYear()} AIBench.cc · 开源 · 中立
          </p>
        </div>
      </div>
    </footer>
  );
}
