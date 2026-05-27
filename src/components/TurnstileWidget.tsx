"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile widget. 当 NEXT_PUBLIC_TURNSTILE_SITE_KEY 未配置时,
// 直接静默返回 null —— 开发环境无门槛、生产环境配上即生效。
//
// 配置:
//   web   Vercel 环境变量 NEXT_PUBLIC_TURNSTILE_SITE_KEY = <site key>
//   api   Railway 环境变量 TURNSTILE_SECRET_KEY = <secret>

declare global {
  interface Window {
    turnstile?: {
      render: (selector: string | HTMLElement, opts: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export default function TurnstileWidget({
  onToken,
}: {
  onToken: (token: string) => void;
}) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement | null>(null);
  const idRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !ref.current) return;

    const ensureScript = () =>
      new Promise<void>((resolve) => {
        if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = SCRIPT_SRC;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        document.head.appendChild(s);
      });

    let mounted = true;
    void (async () => {
      await ensureScript();
      const waitTs = () =>
        new Promise<void>((resolve) => {
          const tick = () => {
            if (window.turnstile) return resolve();
            setTimeout(tick, 50);
          };
          tick();
        });
      await waitTs();
      if (!mounted || !ref.current || !window.turnstile) return;
      idRef.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: "dark",
        appearance: "interaction-only",
        callback: (token: string) => onToken(token),
        "error-callback": () => onToken(""),
        "expired-callback": () => onToken(""),
      });
    })();

    return () => {
      mounted = false;
      if (idRef.current && window.turnstile) {
        try {
          window.turnstile.remove(idRef.current);
        } catch {
          // noop — widget can be removed by route change
        }
      }
    };
  }, [siteKey, onToken]);

  if (!siteKey) return null;
  return <div ref={ref} className="self-start" />;
}
