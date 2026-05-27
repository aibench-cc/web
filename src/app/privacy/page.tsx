import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SponsorFooter from "@/components/SponsorFooter";

export const metadata: Metadata = {
  title: "隐私政策 · AIBench.cc",
  description:
    "AIBench.cc 如何处理你的 API key、检测数据、IP、Cookie，以及哪些信息会被脱敏聚合到行业榜。",
};

const LAST_UPDATED = "2026 年 5 月 27 日";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pt-14 pb-8">
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-hi">
          隐私政策
        </h1>
        <p className="mt-3 text-sm text-lo">最近更新:{LAST_UPDATED}</p>
        <p className="mt-6 text-lg text-mid leading-relaxed">
          AIBench.cc 是一个 API 健康检测站,我们清楚地知道你输入的是工作中真实在用的 api_key。
          下面把“它去了哪里、被谁看到、会停留多久”讲到底。
        </p>

        <Section title="一、API key 的处理">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              你的 <code className="text-brand-bright">api_key</code> 经 HTTPS 提交到 AIBench.cc 后端,仅用于本次检测发起对上游(OpenAI / Anthropic / Google / 你填的网关)的请求。
            </li>
            <li>
              检测过程中 key 只存在于内存里,本次请求完成后立即丢弃。
              <strong className="text-hi"> 不写日志、不入数据库、不缓存。</strong>
            </li>
            <li>
              前端检测逻辑在 <a href="https://github.com/aibench-cc/web" target="_blank" rel="noopener" className="text-brand-bright underline-offset-4 hover:underline">aibench-cc/web</a> 开源,你可以亲自检查 key 是如何被收集、转发与丢弃的。
            </li>
            <li>
              即便如此,key 一旦经过第三方网络就有暴露风险。强烈建议:
              <strong className="text-hi"> 测试用专门生成的临时 key,测完吊销。</strong>
            </li>
          </ul>
        </Section>

        <Section title="二、检测结果的去向">
          <p>每次检测会产生两类数据,分开看待:</p>
          <h3 className="mt-4 text-base font-semibold text-hi">2.1 报告本身(只属于你)</h3>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              报告页 <code>/r/[reportId]</code> 含完整指标、请求样本统计。该页通过随机不可枚举的 reportId 访问。
            </li>
            <li>
              报告里<strong className="text-hi">不含</strong> api_key 和请求/响应正文,只含聚合后的度量(P50/P95/缓存命中率/成本估算等)。
            </li>
            <li>
              你可以选择不分享该链接;一旦你把链接发出去,看到链接的人就能看到报告。
            </li>
          </ul>

          <h3 className="mt-6 text-base font-semibold text-hi">2.2 上行业榜(默认不开启,需勾选)</h3>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              如果你在表单里勾选“贡献到行业榜”,我们会把以下脱敏度量加入榜单聚合:协议、规范化模型名(如 <code>claude-sonnet-4-5</code>)、匿名渠道句柄(默认从你的 <code>base_url</code> 哈希得到,不含原始域名)、各项性能指标。
            </li>
            <li>
              不勾选则只有你能看到本次报告,且不会上榜。
            </li>
            <li>
              即使勾选,你可以填一个自定义的展示句柄替代哈希,但不要填可识别身份的信息。
            </li>
          </ul>
        </Section>

        <Section title="三、我们记录的非敏感数据">
          <p>为了让站点能稳定运行、防滥用,我们记录:</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong className="text-hi">请求级元数据</strong>:时间戳、来源 IP(用于速率限制,不长期保留)、User-Agent、所选协议/模型名(<em>不</em>含 key)。
            </li>
            <li>
              <strong className="text-hi">错误堆栈</strong>:如发生服务端异常,会记录错误类型与堆栈以排查,不包含请求正文或 key。
            </li>
            <li>
              <strong className="text-hi">Vercel / Railway 平台日志</strong>:前端托管在 Vercel,后端托管在 Railway,这两个平台会按其自身策略保留访问日志(通常 30 天)。
            </li>
          </ul>
        </Section>

        <Section title="四、Cookie 与跟踪">
          <ul className="ml-5 list-disc space-y-2">
            <li>本站不设置任何第三方跟踪 Cookie。</li>
            <li>未集成 Google Analytics、Facebook Pixel 等第三方分析。</li>
            <li>仅可能使用必要的会话/偏好 Cookie(如暗黑主题记忆),你可以拒绝。</li>
          </ul>
        </Section>

        <Section title="五、第三方服务">
          <p>你的检测请求会触达以下方:</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong className="text-hi">Vercel</strong>(前端 CDN/边缘) — 美国公司,服务我们前端页面。
            </li>
            <li>
              <strong className="text-hi">Railway</strong>(后端) — 美国公司,运行 AIBench.cc 的 API 服务。
            </li>
            <li>
              <strong className="text-hi">你填写的 base_url 指向方</strong>(OpenAI / Anthropic / Google 或某网关) — 真正接收你 key 的目的地。
            </li>
          </ul>
          <p className="mt-3">
            AIBench.cc 不与上述任何一方共享额外信息。请求穿过我们时携带你的 key,完成后立即丢弃。
          </p>
        </Section>

        <Section title="六、儿童">
          <p>
            本站面向 LLM 开发者与企业用户,不针对 14 岁以下儿童设计。如果你不到所在地区的法定成年年龄,请在家长指导下使用。
          </p>
        </Section>

        <Section title="七、你的权利">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong className="text-hi">删除某次报告</strong>:发邮件到 <a href="mailto:zhuyiwen00@gmail.com" className="text-brand-bright underline-offset-4 hover:underline">zhuyiwen00@gmail.com</a> 并附上 reportId,我们会在 7 个工作日内删除该报告及对应榜单条目。
            </li>
            <li>
              <strong className="text-hi">导出你的数据</strong>:同上邮箱,我们会以 JSON 形式发回与该 reportId 相关的全部聚合数据。
            </li>
            <li>
              <strong className="text-hi">退出榜单聚合</strong>:你之后所有的检测都不会上榜,只要不勾选“贡献到行业榜”即可;已经上榜的条目可按上述方式请求删除。
            </li>
          </ul>
        </Section>

        <Section title="八、政策变更">
          <p>
            本政策可能随产品演进调整。重大变更会在首页和此页面顶部公示至少 14 天。你继续使用即视为接受新版本。
          </p>
        </Section>

        <Section title="九、联系">
          <p>
            隐私相关问题:<a href="mailto:zhuyiwen00@gmail.com" className="text-brand-bright underline-offset-4 hover:underline">zhuyiwen00@gmail.com</a>
          </p>
          <p>
            其他问题或 issue:<a href="https://github.com/aibench-cc" target="_blank" rel="noopener" className="text-brand-bright underline-offset-4 hover:underline">github.com/aibench-cc</a>
          </p>
        </Section>

        <div className="mt-12 flex gap-3">
          <Link href="/" className="btn-glow">开始检测</Link>
          <Link href="/terms" className="btn-ghost">服务条款</Link>
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
    <section id={id} className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight text-hi">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-mid space-y-3">
        {children}
      </div>
    </section>
  );
}
