import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-base/70 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/aibench-logo.svg"
            alt="AIBench.cc"
            width={132}
            height={28}
            priority
          />
        </Link>
        <nav className="flex items-center gap-7 text-sm text-mid">
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
          <Link href="/#check" className="btn-glow !px-4 !py-2 !text-xs">
            开始检测
          </Link>
        </nav>
      </div>
    </header>
  );
}
