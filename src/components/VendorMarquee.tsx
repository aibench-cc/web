"use client";

import type { CSSProperties } from "react";

export type Vendor = { name: string; accent: string };

/**
 * 厂商 logo 墙:多行无限横向跑马灯。
 * - 第 1、3 行向左滚动,第 2 行向右滚动,营造灵动的自动滚动 logo 墙。
 * - 纯 CSS 实现(每行内容复制两份 + translateX 关键帧),性能稳健。
 * - hover 整条暂停滚动,单个 chip 提亮/上浮/发光。
 * - 两侧渐隐遮罩(mask-image)柔化边缘;尊重 prefers-reduced-motion(不自动滚动)。
 */

function VendorChip({ vendor }: { vendor: Vendor }) {
  return (
    <span
      className="group inline-flex shrink-0 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-mid transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:border-brand/40 hover:bg-brand/5 hover:text-hi hover:shadow-glow-sm"
    >
      <span
        className="h-2 w-2 rounded-full shadow-[0_0_10px_var(--dot)] transition-transform group-hover:scale-125"
        style={
          {
            background: vendor.accent,
            ["--dot" as string]: vendor.accent,
          } as CSSProperties
        }
      />
      {vendor.name}
    </span>
  );
}

function MarqueeRow({
  vendors,
  direction,
}: {
  vendors: Vendor[];
  direction: "left" | "right";
}) {
  const trackClass =
    direction === "left" ? "vendor-track--left" : "vendor-track--right";
  return (
    <div className="vendor-marquee overflow-hidden py-1">
      <div className={`vendor-track gap-2.5 ${trackClass}`}>
        {/* 复制两份内容,实现无缝循环;副本 aria-hidden 避免重复朗读 */}
        <div className="flex shrink-0 gap-2.5 pr-2.5">
          {vendors.map((v) => (
            <VendorChip key={v.name} vendor={v} />
          ))}
        </div>
        <div className="flex shrink-0 gap-2.5 pr-2.5" aria-hidden>
          {vendors.map((v) => (
            <VendorChip key={`${v.name}-dup`} vendor={v} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VendorMarquee({ vendors }: { vendors: Vendor[] }) {
  // 均匀分成三行,逐项轮流分配,保证各行长度与色彩均衡
  const rows: Vendor[][] = [[], [], []];
  vendors.forEach((v, i) => {
    rows[i % 3].push(v);
  });

  return (
    <div className="flex flex-col gap-3">
      <MarqueeRow vendors={rows[0]} direction="left" />
      <MarqueeRow vendors={rows[1]} direction="right" />
      <MarqueeRow vendors={rows[2]} direction="left" />
    </div>
  );
}
