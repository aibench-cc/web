import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Database,
  Gauge,
  ShieldCheck,
  Coins,
  Zap,
  Github,
} from "lucide-react";
import SponsorFooter from "@/components/SponsorFooter";
import QuickCheckForm from "@/components/QuickCheckForm";

type Dimension = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
};

const dimensions: Dimension[] = [
  {
    icon: Gauge,
    title: "延迟分布",
    desc: "P50 / P90 / P99 全采样，区分首包 TTFT 与端到端延迟，看清渠道真实速度。",
  },
  {
    icon: Database,
    title: "缓存命中",
    desc: "检测 cache_read_input_tokens 与 cache_creation 命中率，识别是否走了 Anthropic / OpenAI 原生缓存。",
  },
  {
    icon: ShieldCheck,
    title: "限流策略",
    desc: "并发探测 HTTP 429 / RPM / TPM 边界，得出可用并发与排队行为。",
  },
  {
    icon: Activity,
    title: "模型纯度",
    desc: "通过指纹问题与 tokenizer 行为比对，识别是否被静默降级或替换为小模型。",
  },
  {
    icon: Coins,
    title: "真实成本",
    desc: "按官方价目表换算 prompt / completion / cache token，给出每千 token 的实际单价。",
  },
  {
    icon: Zap,
    title: "流式 TTFT",
    desc: "测量 SSE 首字节时间与 token 间隔，评估对话式应用的体感流畅度。",
  },
];

const overseaVendors = ["OpenAI", "Anthropic Claude", "Google Gemini"];
const domesticVendors = [
  "DeepSeek",
  "Kimi (Moonshot)",
  "智谱 GLM",
  "通义千问",
  "豆包 (Doubao)",
  "百度文心",
  "MiniMax",
  "阶跃星辰 Step",
  "讯飞星火",
  "腾讯混元",
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-6">
        <Hero />
        <DimensionsSection />
        <VendorsSection />
        <CTASection />
      </main>
      <SponsorFooter />
    </>
  );
}

function Header() {
  return (
    <header className="border-b border-ink-300/20 bg-white/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/aibench-logo.svg"
            alt="AIBench.cc"
            width={120}
            height={24}
            priority
          />
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-500">
          <Link href="/leaderboard" className="hover:text-ink-900">
            行业榜
          </Link>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 hover:text-ink-900"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <Link href="/about" className="hover:text-ink-900">
            关于
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="pt-16 pb-20 grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-medium text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          开源 · 中立 · 多厂商
        </span>
        <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-ink-900 leading-tight">
          一次粘贴 key，
          <br />
          看清你的 LLM API 渠道
        </h1>
        <p className="text-base lg:text-lg text-ink-500 leading-relaxed">
          AIBench.cc 是一个公开、中立的多厂商 LLM API 健康检查站。从延迟、缓存命中、限流、模型纯度到 token 计费，全维度还原渠道的真实表现 ——
          覆盖海外 OpenAI / Claude / Gemini 与国产 DeepSeek / Kimi / 智谱 / 通义 / 豆包 等 10+ 厂商。
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-ink-500">
          <Stat label="平均检测耗时" value="~30s" />
          <Stat label="覆盖厂商" value="13+" />
          <Stat label="检测维度" value="6 维" />
        </div>
      </div>
      <div className="lg:col-span-3">
        <QuickCheckForm />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-300/20 bg-white px-3 py-2">
      <div className="text-ink-300">{label}</div>
      <div className="font-mono text-sm text-ink-900">{value}</div>
    </div>
  );
}

function DimensionsSection() {
  return (
    <section className="py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl lg:text-3xl font-semibold text-ink-900">
            检测维度
          </h2>
          <p className="text-ink-500 mt-2">
            六个维度，每一项都对应你日常调用 API 时真实会踩到的坑。
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {dimensions.map((d) => (
          <DimensionCard key={d.title} {...d} />
        ))}
      </div>
    </section>
  );
}

function DimensionCard({ icon: Icon, title, desc }: Dimension) {
  return (
    <div className="rounded-xl border border-ink-300/20 bg-white p-5 flex flex-col gap-3 hover:border-brand/40 hover:shadow-sm transition">
      <div className="h-9 w-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-ink-900">{title}</h3>
      <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function VendorsSection() {
  return (
    <section className="py-16">
      <div className="mb-8">
        <h2 className="text-2xl lg:text-3xl font-semibold text-ink-900">
          厂商覆盖
        </h2>
        <p className="text-ink-500 mt-2">
          覆盖海外三大主流 + 国产 10+ 厂商，持续扩展中。
        </p>
      </div>

      <div className="space-y-6">
        <VendorGroup label="海外" vendors={overseaVendors} tone="brand" />
        <VendorGroup label="国产" vendors={domesticVendors} tone="ink" />
      </div>
    </section>
  );
}

function VendorGroup({
  label,
  vendors,
  tone,
}: {
  label: string;
  vendors: string[];
  tone: "brand" | "ink";
}) {
  const chipClass =
    tone === "brand"
      ? "bg-brand/8 text-brand border-brand/20"
      : "bg-white text-ink-900 border-ink-300/30";
  return (
    <div>
      <div className="text-xs font-medium text-ink-300 uppercase tracking-wider mb-3">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {vendors.map((v) => (
          <span
            key={v}
            className={`rounded-full border px-3 py-1.5 text-sm ${chipClass}`}
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}

function CTASection() {
  return (
    <section className="py-16">
      <div className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/5 to-white p-8 lg:p-12 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink-900">
            把渠道质量摆到台面上
          </h2>
          <p className="text-ink-500 mt-2 max-w-xl">
            生成的报告可一键分享。我们也会把匿名结果聚合进公开行业榜，让真正稳的渠道被看见。
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="#top"
            className="rounded-lg bg-brand text-white px-5 py-3 text-sm font-semibold hover:opacity-90"
          >
            立即检测
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-lg border border-ink-300/30 bg-white px-5 py-3 text-sm font-semibold text-ink-900 hover:border-brand/40"
          >
            查看行业榜
          </Link>
        </div>
      </div>
    </section>
  );
}
