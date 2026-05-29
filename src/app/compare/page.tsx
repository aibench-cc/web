import SiteHeader from "@/components/SiteHeader";
import SponsorFooter from "@/components/SponsorFooter";
import CompareTable from "@/components/compare/CompareTable";
import { fetchReport } from "@/lib/api";
import { getDemoReport } from "@/lib/demoReports";

export const metadata = {
  title: "对比清单 · AIBench.cc",
  robots: { index: false, follow: false },
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams?: Promise<{ ids?: string | string[] }>;
}) {
  const query = searchParams ? await searchParams : {};
  const ids = parseIds(query.ids);
  const reports = await Promise.all(
    ids.map(async (id) => ({
      id,
      report: getDemoReport(id) ?? (await fetchReport(id)),
    })),
  );

  return (
    <>
      <div className="print:hidden">
        <SiteHeader />
      </div>
      <main className="mx-auto max-w-6xl px-6 pt-10 pb-12">
        <CompareTable initialIds={ids} initialReports={reports} />
      </main>
      <div className="print:hidden">
        <SponsorFooter />
      </div>
    </>
  );
}

function parseIds(ids: string | string[] | undefined) {
  const raw = Array.isArray(ids) ? ids.join(",") : ids ?? "";
  return Array.from(new Set(raw.split(",").map((id) => id.trim()).filter(Boolean))).slice(0, 4);
}
