"use client";

import { useEffect, useRef } from "react";

/**
 * 深空动态背景:在 <canvas> 上绘制缓慢漂移的星点 + 鼠标附近的星座连线。
 * - 颜色取自品牌色板(蓝/青/紫,近黑底),克制不喧宾夺主。
 * - 尊重 prefers-reduced-motion:reduce(冻结动画,只画静态星图)。
 * - 限制粒子数量、按视口面积自适应、按 DPR 渲染、页面隐藏时暂停。
 * - pointer-events:none + 低 z-index,绝不挡点击、永远在内容之下。
 */

type Star = {
  x: number;
  y: number;
  z: number; // 视差深度 0.3~1,越大越近、越亮、漂得越快
  r: number; // 半径
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  vx: number; // 漂移速度
  vy: number;
  hue: number; // 0=蓝, 1=青, 2=紫
};

// 品牌色板(RGB)
const PALETTE: Array<[number, number, number]> = [
  [96, 165, 250], // brand-bright 蓝
  [34, 211, 238], // 青
  [124, 58, 237], // 紫
];

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const context = canvasEl.getContext("2d", { alpha: true });
    if (!context) return;
    // 经过空值守卫后,固定为非空局部量,供下方闭包安全捕获(避免 TS 在闭包内丢失收窄)
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = context;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];

    // 鼠标位置(用于近邻连线高亮)。平滑跟随,避免抖动。
    const pointer = { x: -9999, y: -9999, active: false };
    const smooth = { x: -9999, y: -9999 };

    // 视差:跟随滚动轻微偏移整层
    let scrollY = window.scrollY;

    function buildStars() {
      // 按视口面积控制密度,并设上限,保证性能
      const area = width * height;
      const target = Math.min(200, Math.max(64, Math.round(area / 9500)));
      stars = new Array(target).fill(0).map(() => {
        const z = 0.3 + Math.random() * 0.7;
        // 少量"主角"近星更大更亮,作为视觉焦点
        const hero = Math.random() < 0.1;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          r: ((Math.random() * 1.3 + 0.55) * z) * (hero ? 1.8 : 1),
          baseAlpha: (0.4 + Math.random() * 0.55) * (hero ? 1.15 : 1),
          twinkleSpeed: 0.4 + Math.random() * 1.2,
          twinklePhase: Math.random() * Math.PI * 2,
          // 缓慢且方向各异的漂移,近处的星稍快
          vx: (Math.random() - 0.5) * 0.06 * z,
          vy: (Math.random() - 0.5) * 0.06 * z,
          hue: Math.random() < 0.7 ? 0 : Math.random() < 0.6 ? 1 : 2,
        };
      });
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    }

    function colorOf(hue: number, alpha: number) {
      const [r, g, b] = PALETTE[hue] ?? PALETTE[0];
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    let raf = 0;
    let last = performance.now();
    let t = 0;

    function draw(now: number) {
      const dt = Math.min(now - last, 50); // 限制单帧步长,切回标签页不跳变
      last = now;
      t += dt;

      ctx.clearRect(0, 0, width, height);

      // 平滑鼠标跟随
      if (pointer.active) {
        smooth.x += (pointer.x - smooth.x) * 0.08;
        smooth.y += (pointer.y - smooth.y) * 0.08;
      }

      // 视差偏移:滚动越多,星层相对向上轻移(近处更明显)
      const parallax = scrollY * 0.06;

      // 先更新位置
      for (const s of stars) {
        if (!reduceMotion) {
          s.x += s.vx * dt * 0.06;
          s.y += s.vy * dt * 0.06;
          // 环绕回卷
          if (s.x < -2) s.x = width + 2;
          else if (s.x > width + 2) s.x = -2;
          if (s.y < -2) s.y = height + 2;
          else if (s.y > height + 2) s.y = -2;
        }
      }

      // 鼠标附近的星座连线(只在交互且非 reduce 时)
      const linkDist = 150;
      const linkDistSq = linkDist * linkDist;
      if (pointer.active && !reduceMotion) {
        // 鼠标处于视口坐标系,直接与星点的渲染坐标比较
        const px = smooth.x;
        const py = smooth.y;
        for (let i = 0; i < stars.length; i++) {
          const a = stars[i];
          const ay = a.y - parallax * a.z; // 渲染后的 y
          // 星与鼠标连线
          const dxm = a.x - px;
          const dym = ay - py;
          const dm = dxm * dxm + dym * dym;
          if (dm < linkDistSq) {
            const k = 1 - dm / linkDistSq;
            ctx.strokeStyle = colorOf(a.hue, 0.38 * k);
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, ay);
            ctx.lineTo(px, py);
            ctx.stroke();
          }
          // 邻近星之间的连线(只查后面的,避免重复)
          for (let j = i + 1; j < stars.length; j++) {
            const b = stars[j];
            const by = b.y - parallax * b.z;
            const dx = a.x - b.x;
            const dy = ay - by;
            const d = dx * dx + dy * dy;
            if (d < linkDistSq) {
              // 只在两端中至少一端靠近鼠标时点亮,保持克制
              const dmB = (b.x - px) * (b.x - px) + (by - py) * (by - py);
              const near = dm < linkDistSq * 1.6 || dmB < linkDistSq * 1.6;
              if (near) {
                const k = (1 - d / linkDistSq) * 0.24;
                ctx.strokeStyle = colorOf(a.hue, k);
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(a.x, ay);
                ctx.lineTo(b.x, by);
                ctx.stroke();
              }
            }
          }
        }
      }

      // 画星点(带闪烁)
      for (const s of stars) {
        const tw = reduceMotion
          ? 1
          : 0.72 + 0.28 * Math.sin(t * 0.001 * s.twinkleSpeed + s.twinklePhase);
        const alpha = Math.min(1, s.baseAlpha * tw);
        const ry = s.y - parallax * s.z;
        ctx.beginPath();
        ctx.fillStyle = colorOf(s.hue, alpha);
        ctx.arc(s.x, ry, s.r, 0, Math.PI * 2);
        ctx.fill();
        // 较亮的近星加一圈柔光,作为"主角"星的辉光
        if (s.z > 0.78 && alpha > 0.4) {
          ctx.beginPath();
          ctx.fillStyle = colorOf(s.hue, alpha * 0.18);
          ctx.arc(s.x, ry, s.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    function onPointerMove(e: PointerEvent) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!pointer.active) {
        // 首次进入时先把平滑点对齐,避免从屏外飞入
        smooth.x = e.clientX;
        smooth.y = e.clientY;
      }
      pointer.active = true;
    }
    function onPointerLeave() {
      pointer.active = false;
    }
    function onScroll() {
      scrollY = window.scrollY;
    }
    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf && !reduceMotion) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    }

    resize();

    if (reduceMotion) {
      // 只画一帧静态星图,不进入循环
      draw(performance.now());
      cancelAnimationFrame(raf);
      raf = 0;
    } else {
      raf = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerout", onPointerLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 print:hidden"
      style={{ zIndex: -3 }}
    />
  );
}
