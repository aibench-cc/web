# AIBench.cc — Web 前端

公开、中立的多厂商 LLM API 健康检测站点。

## 技术栈

- **Next.js 15** App Router + TypeScript
- **Tailwind CSS v4** + shadcn/ui
- **Recharts** 用于报告页图表
- **lucide-react** 图标
- 部署目标：**Vercel**

## 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 初始化 shadcn/ui（首次）
npx shadcn@latest init
npx shadcn@latest add button input select card badge tabs

# 3. 复制环境变量
cp .env.example .env.local

# 4. 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

## 脚本

- `npm run dev` — 本地开发
- `npm run build` — 生产构建
- `npm run start` — 启动生产服务
- `npm run lint` — ESLint 检查

## 目录约定

```
src/
  app/                 # App Router 页面与 layout
    layout.tsx         # 根布局（Inter 字体、metadata）
    page.tsx           # 首页（Hero + 快检表单 + 维度 + 厂商）
    globals.css        # 全局样式 + brand CSS 变量
  components/
    SponsorFooter.tsx  # 模盒赞助页脚（复用）
    QuickCheckForm.tsx # 首页快检表单（client component）
    ui/                # shadcn/ui 生成的组件
public/
  aibench-icon.svg
  aibench-logo.svg
  modelboxs-logo.jpg
```

## 部署到 Vercel

1. 推送到 GitHub
2. 在 Vercel Dashboard 导入仓库，根目录指向 `web/`
3. 设置环境变量 `NEXT_PUBLIC_API_BASE_URL` 指向后端 API
4. 构建命令 `npm run build`，输出目录默认即可

## 品牌

- 主色 `#1E5FFF`
- 背景 `#FAFBFD`
- 文字 `#0E1525` / `#5B6478` / `#9AA3B2`
- 信号色 OK `#16A34A` · WARN `#F59E0B` · ERR `#DC2626`
- 中文回退字体：思源黑体 / PingFang SC / Microsoft YaHei

## 赞助

本检测站由 [模盒 modelboxs.com](https://modelboxs.com/) 赞助运营，检测算法保持中立、开源。
