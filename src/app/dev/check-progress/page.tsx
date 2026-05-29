import CheckProgress from "@/components/CheckProgress";
import SiteHeader from "@/components/SiteHeader";

export default function CheckProgressDevPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pt-10 pb-12">
        <CheckProgress />
      </main>
    </>
  );
}
