"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COMPARE_EVENT, loadCompareIds } from "@/lib/compare";

export default function CompareNavLink() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(loadCompareIds().length);
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(COMPARE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(COMPARE_EVENT, sync);
    };
  }, []);

  const href = count > 0 ? `/compare?ids=${loadCompareIds().join(",")}` : "/compare";

  return (
    <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 transition-colors hover:text-hi">
      对比
      {count > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-brand/30 bg-brand/10 px-1.5 font-mono text-[11px] text-brand">
          {count}
        </span>
      )}
    </Link>
  );
}
