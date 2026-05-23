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
  ArrowRight,
  ArrowUpRight,
  KeyRound,
  Radar,
  FileCheck2,
} from "lucide-react";
import SponsorFooter from "@/components/SponsorFooter";
import QuickCheckForm from "@/components/QuickCheckForm";
import VendorMarquee, { type Vendor } from "@/components/VendorMarquee";

type Dimension = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
};

const dimensions: Dimension[] = [
  {
    icon: Gauge,
    title: "延迟分布",
    desc: "P50 / P95 / P99 全量采样，首包 TTFT 与端到端分开看，渠道是真快还是抖动一目了然。",
  },
  {
    icon: Database,
    title: "缓存命中",
    desc: "核对 cache_read_input_tokens 与 cache_creation，看渠道是否真的走了原生 prompt 缓存，还是替你白付钱。",
  },
  {
    icon: ShieldCheck,
    title: "限流策略",
    desc: "并发探测 429 / RPM / TPM 边界，给出可用并发与排队行为，免得上线才发现限流。",
  },
  {
    icon: Activity,
    title: "模型纯度",
    desc: "同一个 model id 背后未必是同一个模型。指纹问题 + tokenizer 行为双重比对，揪出被静默降级、量化或换成小模型的渠道。",
  },
  {
    icon: Coins,
    title: "真实成本",
    desc: "按官方价目还原 prompt / completion / cache token，算出每千 token 实际单价 —— 标称便宜不等于真便宜。",
  },
  {
    icon: Zap,
    title: "流式 TTFT",
    desc: "测 SSE 首字节与 token 间隔，直接对应对话应用的体感流畅度。",
  },
];

// 海内外厂商统一为一组,顺序经过编排使三行跑马灯的色彩与品牌来源更均衡
const vendors: Vendor[] = [
  { name: "OpenAI", accent: "#10A37F" },
  { name: "DeepSeek", accent: "#4D6BFE" },
  { name: "智谱 GLM", accent: "#3859FF" },
  { name: "Anthropic Claude", accent: "#D97757" },
  { name: "Kimi (Moonshot)", accent: "#16C2A3" },
  { name: "通义千问", accent: "#615CED" },
  { name: "Google Gemini", accent: "#4285F4" },
  { name: "豆包 (Doubao)", accent: "#3B7BFF" },
  { name: "百度文心", accent: "#2932E1" },
  { name: "MiniMax", accent: "#E1473B" },
  { name: "阶跃星辰 Step", accent: "#0E7CFF" },
  { name: "讯飞星火", accent: "#0A57FF" },
  { name: "腾讯混元", accent: "#1296DB" },
];

type LeaderRow = {
  rank: number;
  channel: string;
  model: string;
  p95: string;
  hit: string;
  purity: "通过" | "降级" | "存疑";
  cost: string;
  grade: "A" | "B" | "C";
};

const heroStats = {
  channels: 1248,
  grades: { A: 316, B: 540, C: 392 },
  verdict: "参差不齐",
};

const leaderboard: LeaderRow[] = [
  { rank: 1, channel: "官方直连", model: "claude-sonnet-4-5", p95: "0.82s", hit: "94%", purity: "通过", cost: "1.00x", grade: "A" },
  { rank: 2, channel: "channel-7x", model: "gpt-4o", p95: "0.91s", hit: "88%", purity: "通过", cost: "1.03x", grade: "A" },
  { rank: 3, channel: "官方直连", model: "deepseek-chat", p95: "1.04s", hit: "91%", purity: "通过", cost: "1.00x", grade: "A" },
  { rank: 4, channel: "relay-cn-2", model: "gemini-2.5-flash", p95: "1.22s", hit: "73%", purity: "通过", cost: "1.08x", grade: "B" },
  { rank: 5, channel: "fast-proxy", model: "glm-4.6", p95: "1.35s", hit: "65%", purity: "通过", cost: "1.12x", grade: "B" },
  { rank: 6, channel: "channel-3a", model: "claude-sonnet-4-5", p95: "1.58s", hit: "41%", purity: "存疑", cost: "1.31x", grade: "C" },
  { rank: 7, channel: "cheap-relay", model: "gpt-4o", p95: "2.04s", hit: "12%", purity: "降级", cost: "1.74x", grade: "C" },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <StatBand />
        <LeaderboardPreview />
        <HowItWorks />
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
          <Link href="#check" className="btn-glow !px-4 !py-2 !text-xs">
            开始检测
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      id="check"
      className="mx-auto max-w-6xl px-6 pt-20 pb-16 lg:pt-28 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start"
    >
      <div className="lg:col-span-5 flex flex-col gap-7 animate-fade-up">
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-brand/25 bg-brand/[0.08] px-3.5 py-1.5 text-xs font-medium text-brand-bright">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-bright animate-pulse-dot" />
          开源 · 中立 · 多厂商
        </span>
        <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
          <span className="text-hi">你拿到的，</span>
          <br />
          <span className="text-hi">真的是</span>
          <span className="num-gradient text-glow">那个模型</span>
          <span className="text-hi">吗？</span>
        </h1>
        <p className="max-w-md text-base lg:text-lg text-mid leading-relaxed">
          粘贴一个 key，30 秒验明渠道有没有偷偷降级、限流、加价 —— 延迟、缓存、纯度、真实成本，一次看清。
        </p>
        <HomeStatsPanel />
      </div>
      <div className="lg:col-span-7 animate-fade-up [animation-delay:120ms]">
        <QuickCheckForm />
      </div>
    </section>
  );
}

function HomeStatsPanel() {
  const { A, B, C } = heroStats.grades;
  const sum = A + B + C || 1;
  const grades = [
    { g: "A", n: A, label: "优秀", dot: "bg-ok", text: "text-ok", bar: "bg-ok" },
    { g: "B", n: B, label: "合格", dot: "bg-warn", text: "text-warn", bar: "bg-warn" },
    { g: "C", n: C, label: "存疑", dot: "bg-err", text: "text-err", bar: "bg-err" },
  ];
  return (
    <div className="glass-card relative p-5 flex flex-col gap-4 max-w-md">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-mid">
          <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse-dot" />
          公测数据 · 持续累积中
        </span>
        <Link
          href="/leaderboard"
          className="text-xs text-brand-bright transition-colors hover:text-hi"
        >
          详情 →
        </Link>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="num-gradient text-glow font-mono text-4xl font-semibold tracking-tight">
            {heroStats.channels.toLocaleString()}
          </div>
          <div className="mt-1 text-sm text-mid">已检测 API 渠道</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-lo">整体行业质量</div>
          <div className="mt-1 text-base font-semibold text-warn">
            {heroStats.verdict}
          </div>
        </div>
      </div>

      <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.05]">
        {grades.map((x) => (
          <span
            key={x.g}
            className={x.bar}
            style={{ width: `${(x.n / sum) * 100}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {grades.map((x) => (
          <div key={x.g} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${x.dot}`} />
            <span className={`font-mono text-sm font-semibold ${x.text}`}>
              {x.n}
            </span>
            <span className="text-xs text-lo">
              {x.g}·{x.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBand() {
  const stats = [
    { value: "~30s", label: "平均检测耗时", sub: "快检模式" },
    { value: "13+", label: "覆盖厂商", sub: "海内外持续扩展" },
    { value: "6", label: "检测维度", sub: "延迟 / 纯度 / 成本 …" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.05]">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group bg-card/60 px-8 py-10 text-center transition-colors hover:bg-card"
          >
            <div className="num-gradient text-glow font-mono text-5xl lg:text-6xl font-semibold tracking-tight">
              {s.value}
            </div>
            <div className="mt-3 text-sm font-medium text-hi">{s.label}</div>
            <div className="mt-1 text-xs text-lo">{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LeaderboardPreview() {
  const gradeColor: Record<LeaderRow["grade"], string> = {
    A: "text-ok",
    B: "text-warn",
    C: "text-err",
  };
  const purityColor: Record<LeaderRow["purity"], string> = {
    通过: "text-ok",
    存疑: "text-warn",
    降级: "text-err",
  };
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-3 rounded-full border border-ok/25 bg-ok/[0.08] px-3 py-1 text-xs font-medium text-ok">
            <span className="h-1.5 w-1.5 rounded-full bg-ok animate-pulse-dot" />
            公测榜单 · 早期数据
          </div>
          <h2 className="text-2xl lg:text-3xl font-semibold text-hi">
            谁家渠道真的稳？
          </h2>
          <p className="text-mid mt-2 max-w-xl">
            匿名聚合真实检测结果，按纯度、延迟、缓存与实测成本排名 —— 不收钱，只认数据。
          </p>
        </div>
        <Link
          href="/leaderboard"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-brand-bright transition-colors hover:text-hi"
        >
          查看完整榜单
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[48px_1.4fr_1fr_88px_88px_88px_72px] gap-2 px-5 py-3 border-b border-white/[0.06] text-xs font-medium uppercase tracking-wider text-lo">
          <div>#</div>
          <div>渠道 / 模型</div>
          <div></div>
          <div className="text-right">P95</div>
          <div className="text-right">缓存命中</div>
          <div className="text-center">纯度</div>
          <div className="text-center">评级</div>
        </div>
        {leaderboard.map((r) => (
          <div
            key={r.rank}
            className="grid grid-cols-2 md:grid-cols-[48px_1.4fr_1fr_88px_88px_88px_72px] gap-2 px-5 py-3.5 border-b border-white/[0.04] last:border-0 text-sm transition-colors hover:bg-white/[0.025]"
          >
            <div className="font-mono text-lo md:self-center">
              {String(r.rank).padStart(2, "0")}
            </div>
            <div className="font-medium text-hi md:self-center">{r.channel}</div>
            <div className="font-mono text-xs text-mid md:self-center">
              {r.model}
            </div>
            <div className="font-mono text-right text-hi md:self-center">
              {r.p95}
            </div>
            <div className="font-mono text-right text-mid md:self-center">
              {r.hit}
            </div>
            <div
              className={`text-center md:self-center font-medium ${purityColor[r.purity]}`}
            >
              {r.purity}
            </div>
            <div className="text-center md:self-center">
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] font-mono text-xs font-bold ${gradeColor[r.grade]}`}
              >
                {r.grade}
              </span>
            </div>
          </div>
        ))}
        <Link
          href="/leaderboard"
          className="sm:hidden flex items-center justify-center gap-1.5 px-5 py-4 text-sm font-medium text-brand-bright"
        >
          查看完整榜单
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

type Step = {
  icon: React.ComponentType<{ className?: string }>;
  step: string;
  title: string;
  desc: string;
};

const howSteps: Step[] = [
  {
    icon: KeyRound,
    step: "01",
    title: "粘贴 key",
    desc: "填入渠道的 base_url、api_key 与 model。key 仅在本次检测中转发，不落库、不记录日志。",
  },
  {
    icon: Radar,
    step: "02",
    title: "并发探针采样",
    desc: "约 30 秒内发起多轮并发请求，实测延迟分布、缓存命中、限流边界，并用指纹问题比对模型纯度。",
  },
  {
    icon: FileCheck2,
    step: "03",
    title: "生成可分享报告",
    desc: "输出 SLA 评级与逐项结论，一键分享；匿名结果可聚合进公开行业榜。",
  },
];

function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10">
        <h2 className="text-2xl lg:text-3xl font-semibold text-hi">工作原理</h2>
        <p className="text-mid mt-2 max-w-xl leading-relaxed">
          没有黑箱、不靠猜。三步，把渠道的真实表现摆出来。
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {howSteps.map((s, i) => (
          <div key={s.step} className="relative">
            <div className="glass-card h-full p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl border border-brand/20 bg-brand/[0.1] text-brand-bright flex items-center justify-center">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="num-gradient font-mono text-2xl font-semibold tracking-tight">
                  {s.step}
                </span>
              </div>
              <h3 className="text-base font-semibold text-hi">{s.title}</h3>
              <p className="text-sm text-mid leading-relaxed">{s.desc}</p>
            </div>
            {i < howSteps.length - 1 && (
              <ArrowRight className="hidden md:block absolute top-1/2 -right-3 z-10 h-5 w-5 -translate-y-1/2 text-lo" />
            )}
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-lo">
        想看完整检测方法学？
        <Link
          href="/about#methodology"
          className="ml-1 text-brand-bright transition-colors hover:text-hi"
        >
          查看检测原理 →
        </Link>
      </p>
    </section>
  );
}

function DimensionsSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10">
        <h2 className="text-2xl lg:text-3xl font-semibold text-hi">检测维度</h2>
        <p className="text-mid mt-2 max-w-xl leading-relaxed">
          六个维度，每一项都对应你日常调用 API 时真实会踩到的坑。
        </p>
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
    <div className="group glass-card p-6 flex flex-col gap-4 transition-all duration-200 ease-spring hover:-translate-y-1 hover:border-brand/40 hover:shadow-glow-sm">
      <div className="h-10 w-10 rounded-xl border border-brand/20 bg-brand/[0.1] text-brand-bright flex items-center justify-center transition-colors group-hover:bg-brand/20">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-hi">{title}</h3>
      <p className="text-sm text-mid leading-relaxed">{desc}</p>
    </div>
  );
}

function VendorsSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10">
        <h2 className="text-2xl lg:text-3xl font-semibold text-hi">厂商覆盖</h2>
        <p className="text-mid mt-2 max-w-xl leading-relaxed">
          海内外 13+ 主流大模型原生适配，官方端点与中转站一视同仁。
        </p>
      </div>
      <VendorMarquee vendors={vendors} />
    </section>
  );
}

function CTASection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="relative overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/[0.12] via-card/40 to-transparent p-8 lg:p-14">
        <div
          className="pointer-events-none absolute -top-24 right-0 h-64 w-64 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.35), transparent 70%)" }}
        />
        <div className="relative flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl lg:text-3xl font-semibold text-hi">
              把渠道质量摆到台面上
            </h2>
            <p className="text-mid mt-3 max-w-xl leading-relaxed">
              报告可一键分享。匿名结果聚合进公开榜单，让真正稳的渠道被看见，把偷工减料的晾出来。
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="#check" className="btn-glow">
              立即检测
            </Link>
            <Link href="/leaderboard" className="btn-ghost">
              查看行业榜
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
