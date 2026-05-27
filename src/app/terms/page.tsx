import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SponsorFooter from "@/components/SponsorFooter";

export const metadata: Metadata = {
  title: "服务条款 · AIBench.cc",
  description:
    "AIBench.cc 服务条款:工具使用边界、用户责任、知识产权、免责声明与争议解决。",
};

const LAST_UPDATED = "2026 年 5 月 27 日";

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pt-14 pb-8">
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight text-hi">
          服务条款
        </h1>
        <p className="mt-3 text-sm text-lo">最近更新:{LAST_UPDATED}</p>
        <p className="mt-6 text-lg text-mid leading-relaxed">
          使用 AIBench.cc(以下称“本站”)即表示你同意以下条款。如果你不同意,请勿使用本站。
        </p>

        <Section title="一、服务说明">
          <p>
            本站提供一个免费的、开源的多厂商 LLM API 健康检测工具及行业排行榜。
            你可以粘贴一个 LLM API key,本站代为发起检测请求,返回延迟、缓存命中、限流、模型纯度、成本等指标。
          </p>
          <p>
            本站<strong className="text-hi">不</strong>提供 LLM 推理服务本身,所有上游推理请求由你填写的 base_url 指向的服务商完成。
          </p>
        </Section>

        <Section title="二、你的责任">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong className="text-hi">key 所有权</strong>:你保证检测时使用的 API key 是你本人合法持有,或你已获得 key 所有人的明确授权。
              <strong className="text-hi">禁止</strong>使用本站检测他人未经授权的 key。
            </li>
            <li>
              <strong className="text-hi">合规使用</strong>:你不得利用本站绕过任何上游服务商的服务条款、速率限制或安全机制;不得用本站发起 DoS、密码爆破、扫描或其他破坏性测试。
            </li>
            <li>
              <strong className="text-hi">真实信息</strong>:贡献到行业榜的渠道句柄、备注等信息应当真实可信。我们对明显恶意的虚假数据保留删除/封禁权利。
            </li>
            <li>
              <strong className="text-hi">合理负载</strong>:免费层默认每个 IP 每小时若干次检测。如需更高频请联系。请勿使用脚本批量调用本站。
            </li>
          </ul>
        </Section>

        <Section title="三、我们的承诺与边界">
          <p>本站致力于:</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>检测逻辑、评分规则、SLA 阈值完全公开可复现(见 <Link href="/about#methodology" className="text-brand-bright underline-offset-4 hover:underline">检测方法学</Link>)。</li>
            <li>对你的 api_key 仅做单次代理,不写日志、不入库(见 <Link href="/privacy" className="text-brand-bright underline-offset-4 hover:underline">隐私政策</Link>)。</li>
            <li>排名由匿名聚合数据决定,赞助方不影响任何检测结果。</li>
          </ul>
          <p className="mt-3">本站<strong className="text-hi">不</strong>保证:</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>检测结果绝对准确——单次检测受网络抖动、采样次数、上游瞬时状态影响,结果应作为参考而非法律依据。</li>
            <li>持续在线——本站可能因维护、第三方故障或政策原因临时下线。</li>
            <li>所有上游服务商都能正常被检测——某些服务商可能屏蔽本站 IP,或在响应字段上有特殊处理。</li>
          </ul>
        </Section>

        <Section title="四、知识产权">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              本站核心检测算法、SLA 评分规则、探针代码以开源协议发布在 <a href="https://github.com/aibench-cc" target="_blank" rel="noopener" className="text-brand-bright underline-offset-4 hover:underline">github.com/aibench-cc</a>,在协议允许范围内你可以自由复制、修改、自部署。
            </li>
            <li>
              “AIBench.cc”名称、logo、UI 设计、文案内容版权归本站运营方所有。
            </li>
            <li>
              你贡献到行业榜的脱敏度量,视同你授予本站非排他、永久、免费的使用权,用于公开展示与统计分析。你保留对原始数据的所有权。
            </li>
          </ul>
        </Section>

        <Section title="五、免责声明">
          <p>
            本站“按现状”提供,不附带任何明示或默示的担保,包括但不限于适销性、特定用途适用性、不侵权的担保。
          </p>
          <p>
            在法律允许的最大范围内,本站运营方<strong className="text-hi">不对</strong>因使用或无法使用本站而导致的任何直接、间接、附带、特殊、惩罚性或后果性损失承担责任,
            <strong className="text-hi">包括但不限于</strong>:因 key 泄露造成的费用损失、因结果不准确做出的商业决策、因下线造成的工作中断。
          </p>
          <p>
            如你对检测结果有重大商业依赖,请同时使用多个独立检测工具交叉验证。
          </p>
        </Section>

        <Section title="六、违规处理">
          <p>
            如发现以下情况,本站可不经通知立即采取限速、屏蔽或封禁措施:
          </p>
          <ul className="ml-5 list-disc space-y-2">
            <li>使用未授权的 key</li>
            <li>批量自动化调用以滥用免费层</li>
            <li>恶意污染行业榜数据</li>
            <li>试图攻击本站基础设施或绕过安全机制</li>
          </ul>
        </Section>

        <Section title="七、条款变更">
          <p>
            本站可不定期修订本条款。重大变更会在首页和此页面顶部公示至少 14 天。你在变更生效后继续使用本站即视为接受新版本。
          </p>
        </Section>

        <Section title="八、争议解决">
          <p>
            本条款的解释、效力与争议解决均适用中华人民共和国法律(不含冲突法规则)。
            如双方协商不成,提交本站运营方主要办公地有管辖权的法院。
          </p>
        </Section>

        <Section title="九、联系">
          <p>
            条款相关问询:<a href="mailto:zhuyiwen00@gmail.com" className="text-brand-bright underline-offset-4 hover:underline">zhuyiwen00@gmail.com</a>
          </p>
          <p>
            其他:<a href="https://github.com/aibench-cc" target="_blank" rel="noopener" className="text-brand-bright underline-offset-4 hover:underline">github.com/aibench-cc</a>
          </p>
        </Section>

        <div className="mt-12 flex gap-3">
          <Link href="/" className="btn-glow">开始检测</Link>
          <Link href="/privacy" className="btn-ghost">隐私政策</Link>
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
