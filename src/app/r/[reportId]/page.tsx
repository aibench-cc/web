import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SponsorFooter from "@/components/SponsorFooter";
import ReportView from "@/components/report/ReportView";
import { seedReport } from "@/lib/report";
import { fetchReport } from "@/lib/api";

// CF Pages (next-on-pages) 要求动态 SSR 路由显式声明 edge runtime,否则构建失败
export const runtime = "edge";

// 按 reportId 从后端 /api/report/{id} 拉取报告;后端 404 或不可达时
// 回退种子样本,保证分享链接与 demo 永远可渲染。组件与类型保持不变。
async function loadReport(reportId: string) {
  return (await fetchReport(reportId)) ?? seedReport;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reportId: string }>;
}): Promise<Metadata> {
  const { reportId } = await params;
  const report = await loadReport(reportId);
  const title = `检测报告 r/${report.reportId} · ${report.meta.model} · AIBench.cc`;
  return {
    title,
    description: `${report.verdictTitle}。${report.verdictDetail}`,
    robots: { index: false, follow: false }, // 单次检测快照,默认不收录
  };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = await loadReport(reportId);

  return (
    <>
      <div className="print:hidden">
        <SiteHeader />
      </div>
      <ReportView report={report} />
      <div className="print:hidden">
        <SponsorFooter />
      </div>
    </>
  );
}
