import type { Metadata } from "next";
import Link from "next/link";
import {
  Gauge,
  Database,
  ShieldCheck,
  Activity,
  Coins,
  Zap,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SponsorFooter from "@/components/SponsorFooter";

export const metadata: Metadata = {
  title: "关于 · 检测方法学 · AIBench.cc",
  description:
    "AIBench.cc 是一个开源、中立的多厂商 LLM API 健康检测站。本页公开六维检测方法学、SLA 评级阈值、隐私政策与中立立场声明。",
};

type Method = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  how: string;
  caveat: string;
};

const methods: Method[] = [
  {
    icon: Gauge,
    title: "延迟分布 P50 / P95 / P99",
    how: "用顺序、并发、定速节拍三种方式发包,以 perf_counter 记录每次请求的端到端耗时,对排序后的样本做线性插值得出各分位数。",
    caveat: "非流式延迟包含完整生成时间;网络抖动会单独通过基线 RTT 估计扣除,但仍受测点网络环境影响。",
  },
  {
    icon: Database,
    title: "缓存命中",
    how: "发两次「相同长前缀 + 不同 nonce」的预热请求,核对各协议的缓存字段:Anthropic 的 cache_read_input_tokens / cache_creation_input_tokens、OpenAI 的 prompt_tokens_details.cached_tokens、Gemini 的 cachedContentTokenCount,以及网关 Redis 层的 cache_hit 标记。",
    caveat: "若第二次请求仍无缓存读取,会区分提示「可能被网关剥离缓存字段」或「多账号轮询导致各账号独立缓存」——这正是中转站常见的隐性扣费点。",
  },
  {
    icon: ShieldCheck,
    title: "限流策略",
    how: "解析 anthropic-ratelimit-* / x-ratelimit-* 余量响应头并统计 HTTP 429 出现情况;RPM / TPM 模式按目标节拍持续发包,探测真实可达上限与排队行为。",
    caveat: "Gemini 无标准限流头,只能由 429 出现推断;多账号网关可能让余量看起来恒定,需结合 429 模式判断。",
  },
  {
    icon: Activity,
    title: "模型纯度(核心)",
    how: "单次探针采集三路指纹并综合判定为 通过 / 存疑 / 降级:① 响应体里的 model / modelVersion 字段是否与所填一致;② 用极短 prompt 测得的 prompt token 数是否落在该模型 tokenizer 的基线区间(±30%);③ 要求模型自报身份,做模型「家族」关键字匹配。任一字段对不上即标记,多项不一致判为降级。",
    caveat: "诚实地说:自报身份可能被系统提示覆盖;多语言场景 tokenizer 计数会偏移;不在基线表中的模型该信号会跳过;单次探针无法发现请求中途被切换。因此纯度给出的是「强烈怀疑」而非法律结论,我们把判据一并公开供你复核。",
  },
  {
    icon: Coins,
    title: "真实成本",
    how: "内置 50+ 模型价目表(按子串最长匹配,未知模型回退 Sonnet 价位),按本次实际 token 用量(cache_read / cache_write / 未命中 input / output)逐项计费,并与「全程不命中缓存」的最坏情况对比,给出缓存节省比例与每千请求成本。",
    caveat: "国产模型多为人民币计价,换算为美元为近似值;若模型被静默降级,计费单价会与你以为的不符——这也是纯度检测的价值所在。",
  },
  {
    icon: Zap,
    title: "流式 TTFT",
    how: "在 SSE 流中记录第一个「有内容」的 chunk(剔除 usage / model 等控制帧)相对请求起点的时间作为 TTFT,并用输出 token 数 / 流式时长得到 token 间隔速度。",
    caveat: "首个 SSE 帧未必是首个内容 token;网络缓冲(gzip / TCP 窗口)可能抬高 TTFT。若渠道流式不返回 usage,会自动回退非流式以保证计费字段完整。",
  },
];

const slaRows = [
  { metric: "成功率", green: "≥ 99%", yellow: "95–99%", red: "< 95%" },
  { metric: "延迟 P95", green: "< 2s", yellow: "2–5s", red: "> 5s" },
  { metric: "TTFT P95", green: "< 800ms", yellow: "800–2000ms", red: "> 2000ms" },
  { metric: "缓存命中", green: "≥ 80%", yellow: "40–80%", red: "< 40%" },
  { metric: "429 限流", green: "0 次", yellow: "—", red: "≥ 1 次" },
];

const faqs = [
  {
    q: "你们怎么保证不偏袒赞助方?",
    a: "评分算法、阈值与排名规则全部开源,任何人都能用同一套代码复现。模盒只在页脚作为赞助方署名,不接触算法、不购买榜位。数据好则排名好,数据差则倒逼改进——包括赞助方自己。",
  },
  {
    q: "中转站能刷榜吗?",
    a: "我们做了多重防护:同一匿名贡献者对同一「模型 × 渠道」短时间内多次提交会被折算为一个有效样本(取中位数);上榜有最小样本门槛;单一来源占比过高会被标记为低可信度且不予 A 级;每个度量按 IQR 去尾防止刷极值。",
  },
  {
    q: "我的 API key 安全吗?",
    a: "key 只用于这一次检测请求的转发,转发后即从内存丢弃——不写数据库、不进日志、不做任何留存。前端代码开源,你可以自行审计;也可自托管后端。",
  },
  {
    q: "纯度是怎么测出来的?会误判吗?",
    a: "见上方「模型纯度」一节。它综合三路指纹给出判断,我们公开全部判据并标注局限,结论按「通过 / 存疑 / 降级」分级而非非黑即白,正是为了把误判风险透明化。",
  },
  {
    q: "数据多久更新?样本太少怎么办?",
    a: "榜单提供「近 24h / 近 30 天」两个时间窗。样本未达标的渠道不会上榜,而是进入「样本累积中」状态;每行都标注检测次数、贡献者数、最近检测时间与可信度,样本不足时请谨慎参考。",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pt-14 pb-8">
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-hi">
          关于 AIBench.cc
        </h1>
        <p className="mt-4 text-lg text-mid leading-relaxed">
          一个开源、中立的多厂商 LLM API 健康检测站。粘贴一个 key,30
          秒看清你的渠道在延迟、缓存、限流、模型纯度与真实成本上的表现。
        </p>

        <Section title="为什么做这个">
          <p>
            API 渠道质量极不透明。同一个 model id,不同渠道给你的可能是被降级、量化、甚至替换成小模型的版本;标称便宜的渠道,可能因为剥离缓存、计费虚高而实际更贵。买家被「中转站」的营销话术包围,却没有一把中立的尺子。
          </p>
          <p>
            AIBench.cc 把这把尺子开源出来:检测逻辑、评分标准、排名规则全部公开可复现,让渠道质量摆到台面上。
          </p>
        </Section>

        <Section id="methodology" title="检测方法学">
          <p>
            以下是六个维度的真实测量方式与各自的局限。我们认为,一个可信的检测工具应该把「怎么测的」和「测不准什么」都讲清楚。
          </p>
          <div className="mt-6 flex flex-col gap-4">
            {methods.map((m) => (
              <div key={m.title} className="glass-card p-5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-lg border border-brand/20 bg-brand/[0.1] text-brand-bright flex items-center justify-center">
                    <m.icon className="h-[18px] w-[18px]" />
                  </div>
                  <h3 className="text-base font-semibold text-hi">{m.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-mid">{m.how}</p>
                <p className="text-sm leading-relaxed text-lo">
                  <span className="text-warn">局限:</span> {m.caveat}
                </p>
              </div>
            ))}
          </div>

          <h3 className="mt-8 text-base font-semibold text-hi">SLA 评级阈值</h3>
          <p className="mt-2">
            每项指标分绿 / 黄 / 红三档,综合取最差档得出整体 SLA 徽章。阈值如下,完全公开:
          </p>
          <div className="mt-4 glass-card overflow-hidden">
            <div className="grid grid-cols-4 gap-2 border-b border-white/[0.06] px-4 py-3 text-xs font-medium uppercase tracking-wider text-lo">
              <div>指标</div>
              <div className="text-ok">绿 · 优</div>
              <div className="text-warn">黄 · 警告</div>
              <div className="text-err">红 · 异常</div>
            </div>
            {slaRows.map((r) => (
              <div
                key={r.metric}
                className="grid grid-cols-4 gap-2 border-b border-white/[0.04] px-4 py-3 text-sm last:border-0"
              >
                <div className="font-medium text-hi">{r.metric}</div>
                <div className="font-mono text-mid">{r.green}</div>
                <div className="font-mono text-mid">{r.yellow}</div>
                <div className="font-mono text-mid">{r.red}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-lo">
            行业榜的综合评分在此基础上加权:模型纯度为前置门槛(判为「降级」则无论延迟多快都封顶 C
            级),其余按延迟、成功率、缓存、成本比、限流余量加权得出 0–100 分,映射 A(≥82)/ B(60–81)/ C(&lt;60)。
          </p>
        </Section>

        <Section title="中立立场">
          <p>
            不接渠道付费、不卖榜位、不做定向优待。排名只由匿名聚合的真实数据决定。任何渠道——包括赞助方——都按同一套标准检测和排序。
          </p>
        </Section>

        <Section title="开源">
          <p>
            评分算法、SLA 阈值与探针核心开源在{" "}
            <a
              href="https://github.com/aibench-cc"
              target="_blank"
              rel="noopener"
              className="text-brand-bright underline-offset-4 hover:text-hi hover:underline"
            >
              GitHub
            </a>
            。任何人都能用同一套代码自行复现一次检测,验证我们的结论。
          </p>
        </Section>

        <Section title="隐私">
          <p>
            你的 api_key 只用于本次检测请求的转发,完成后立即从内存清除——不写入任何日志或数据库,也不存储请求 / 响应正文。聚合到行业榜的只有脱敏后的度量(协议、规范化模型、匿名渠道句柄、各项指标),默认不含渠道域名,需你显式勾选才公开。
          </p>
        </Section>

        <Section title="赞助披露">
          <p>
            本站运营成本由{" "}
            <a
              href="https://modelboxs.com/"
              target="_blank"
              rel="noopener"
              className="text-brand-bright underline-offset-4 hover:text-hi hover:underline"
            >
              模盒(modelboxs.com)
            </a>{" "}
            承担,模盒仅作为赞助方在页脚署名。赞助不影响任何检测逻辑、评分标准与排名结果。
          </p>
        </Section>

        <Section title="常见问题">
          <div className="flex flex-col gap-5">
            {faqs.map((f) => (
              <div key={f.q}>
                <h3 className="text-base font-semibold text-hi">{f.q}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mid">{f.a}</p>
              </div>
            ))}
          </div>
        </Section>

        <div className="mt-12 flex gap-3">
          <Link href="/#check" className="btn-glow">
            开始检测
          </Link>
          <Link href="/leaderboard" className="btn-ghost">
            查看行业榜
          </Link>
        </div>
      </main>
      <SponsorFooter />
    </>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-20">
      <h2 className="text-xl lg:text-2xl font-semibold text-hi">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-mid leading-relaxed [&_p]:text-mid">
        {children}
      </div>
    </section>
  );
}
