import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SponsorFooter from "@/components/SponsorFooter";
import LeaderboardTable from "@/components/LeaderboardTable";
import { fetchLeaderboard } from "@/lib/api";

export const metadata: Metadata = {
  title: "行业榜 · AIBench.cc",
  description:
    "海内外主流 LLM API 渠道质量行业榜:按模型纯度、延迟、缓存命中与实测成本匿名聚合排名。官方端点与中转站一视同仁,排名只认数据。",
};

export default async function LeaderboardPage() {
  const rows = await fetchLeaderboard("30d");
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pt-14 pb-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-3 rounded-full border border-ok/25 bg-ok/[0.08] px-3 py-1 text-xs font-medium text-ok">
            <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse-dot" />
            公测榜单 · 早期数据
          </div>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-hi">
            渠道质量行业榜
          </h1>
          <p className="mt-3 max-w-2xl text-mid leading-relaxed">
            按「模型 × 渠道」聚合海内外检测结果。纯度作为前置门槛,延迟、缓存、成本、成功率加权评分 ——
            真正稳的渠道排上来,偷工减料的晾出去。
          </p>
        </div>
        <LeaderboardTable rows={rows} />
      </main>
      <SponsorFooter />
    </>
  );
}
