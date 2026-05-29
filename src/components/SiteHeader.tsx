import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";
import CompareNavLink from "./CompareNavLink";

export default function SiteHeader() {
  return (
    <header className="sticky top-9 z-50 border-b border-white/[0.06] bg-base/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/aibench-logo.svg"
            alt="AIBench.cc"
            width={132}
            height={28}
            priority
            className="h-auto w-[96px] sm:w-[132px]"
          />
        </Link>
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-4 overflow-x-auto whitespace-nowrap text-xs text-mid [scrollbar-width:none] sm:gap-7 sm:text-sm [&::-webkit-scrollbar]:hidden">
          <Link href="/leaderboard" className="shrink-0 transition-colors hover:text-hi">
            行业榜
          </Link>
          <CompareNavLink />
          <Link href="/history" className="hidden shrink-0 transition-colors hover:text-hi sm:inline">
            我的记录
          </Link>
          <a
            href="https://github.com/aibench-cc"
            target="_blank"
            rel="noopener"
            className="hidden shrink-0 items-center gap-1.5 transition-colors hover:text-hi md:inline-flex"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <Link href="/about" className="hidden shrink-0 transition-colors hover:text-hi md:inline">
            关于
          </Link>
          <Link href="/#check" className="btn-glow shrink-0 !px-3 !py-2 !text-xs sm:!px-4">
            开始检测
          </Link>
        </nav>
      </div>
    </header>
  );
}
