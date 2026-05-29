import type { Metadata } from "next";
import Link from "next/link";
import { Clock, RefreshCw } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SponsorFooter from "@/components/SponsorFooter";
import ReportView from "@/components/report/ReportView";
import { fetchReport } from "@/lib/api";
import { getDemoReport } from "@/lib/demoReports";

// 单次检测快照 · 7 天 TTL · 内存丢失或 Railway 重启都会让报告不可达。
// 此时不再静默回退到 demo seed(用户曾误以为「报告被篡改」),改为显式提示。
// demo 样本仍可通过 /r/sample-green、/r/sample-yellow、/r/sample-red 访问。
async function loadReport(reportId: string) {
  const demoReport = getDemoReport(reportId);
  if (demoReport) return demoReport;
  return await fetchReport(reportId);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reportId: string }>;
}): Promise<Metadata> {
  const { reportId } = await params;
  const report = await loadReport(reportId);
  if (!report) {
    return {
      title: `报告已过期 · r/${reportId} · AIBench.cc`,
      description: "本检测快照已过 7 天 TTL 或后端进程重启后丢失,请重新发起检测。",
      robots: { index: false, follow: false },
    };
  }
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

  if (!report) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-6 pt-16 pb-12">
          <div className="rounded-2xl border border-warn/25 bg-warn/[0.06] px-6 py-10 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-warn/30 bg-warn/[0.1]">
              <Clock className="h-5 w-5 text-warn" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-hi">
              这份报告已经不可达
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-mid">
              单次检测快照只保留 7 天,且后端进程重启时未持久化的报告会丢失。
              报告 id 是 <span className="font-mono text-hi">{reportId}</span>。
            </p>
            <p className="mt-2 text-xs leading-relaxed text-lo">
              如果你之前是从「我的记录」点进来的,该条本机记录的 id 仍在 localStorage 里,
              但服务器侧的快照已经不在,需要重新发起一次检测才能再生成。
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href="/#check" className="btn-glow inline-flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4" />
                重新检测
              </Link>
              <Link
                href="/history"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-mid transition-colors hover:border-white/20 hover:text-hi"
              >
                我的记录
              </Link>
              <Link
                href="/r/sample-yellow"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-mid transition-colors hover:border-white/20 hover:text-hi"
              >
                看一份示例报告
              </Link>
            </div>
          </div>
        </main>
        <SponsorFooter />
      </>
    );
  }

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
