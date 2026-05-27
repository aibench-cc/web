# AIBench.cc — Web 前端

公开、中立的多厂商 LLM API 健康检测站点。

线上:**[https://aibench.cc](https://aibench.cc)** · 后端仓库:[aibench-cc/api](https://github.com/aibench-cc/api)(私有)

## 技术栈

- **Next.js 15** App Router + TypeScript
- **Tailwind CSS v4** + shadcn/ui
- **Recharts** 报告页图表
- **lucide-react** 图标
- **Cloudflare Turnstile** 防刷
- 部署目标:**Vercel**

## 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量
cp .env.example .env.local
# 然后填:
#   NEXT_PUBLIC_API_BASE_URL=https://api-production-f3c4.up.railway.app
#   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAA...        # 可选,不填则本地跳过验证

# 3. 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

## 脚本

- `npm run dev` — 本地开发
- `npm run build` — 生产构建
- `npm run start` — 启动生产服务
- `npm run lint` — ESLint 检查
- `npx tsc --noEmit` — TypeScript 类型检查

## 环境变量

| 变量 | 必填 | 说明 |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | ✓ | 后端 API 基址,例 `https://api-production-f3c4.up.railway.app` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | 可选 | Cloudflare Turnstile site key。未配则前端不渲染验证组件 |

## 目录结构

```
src/
  app/                  # App Router
    layout.tsx          # 根布局 + TopStatusBar + 元数据
    page.tsx            # 首页(Hero + 快检 + 维度 + 厂商 + 榜单预览)
    leaderboard/        # 行业榜
    r/[reportId]/       # 单次检测报告页(支持分享链接)
    about/ privacy/ terms/
    sitemap.ts robots.ts
  components/
    QuickCheckForm.tsx  # 快检表单(协议 chips + 模型 chips + Turnstile)
    TopStatusBar.tsx    # 顶部上游状态条(60s 轮询 /api/status)
    TurnstileWidget.tsx # Cloudflare Turnstile 集成
    SiteHeader.tsx SponsorFooter.tsx
    report/             # 报告页组件(ReportHeader 大圆 + 各维度卡片)
  lib/
    api.ts              # 后端数据获取 + 失败回退种子
    leaderboard.ts report.ts seed*
public/                 # logo / OG 图
```

## 部署到 Vercel

1. 推送到 GitHub
2. Vercel Dashboard → Import → 选 web 仓库
3. 环境变量填上面两条
4. 构建命令 `npm run build`(默认即可)
5. 域名:Vercel Settings → Domains 加 `aibench.cc` 和 `www.aibench.cc`

## 品牌

- 主色 `#1E5FFF`
- 信号色 OK `#16A34A` · WARN `#F59E0B` · ERR `#DC2626`
- 中文回退:思源黑体 / PingFang SC / Microsoft YaHei

## 协议

MIT License。检测算法、评分规则、UI 实现全部公开,任何人可自由复制、自部署。

## 赞助

本检测站由 [模盒 modelboxs.com](https://modelboxs.com/) 赞助运营,检测算法保持中立、开源、可审计。
