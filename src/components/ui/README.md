# shadcn/ui 组件占位目录

此目录用于存放 shadcn/ui 生成的组件源码。

初始化（在 `web/` 目录下执行）：

```bash
npx shadcn@latest init
```

随后按需添加组件：

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add tabs
```

生成的文件将出现在本目录下（`button.tsx`、`input.tsx` 等），通过
`@/components/ui/button` 等路径引入。
