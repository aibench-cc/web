import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AIBench.cc — 多厂商 LLM API 健康检测";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse at top, #122140 0%, #0B1120 45%, #070B14 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          position: "relative",
          fontFamily: "Inter, sans-serif",
          color: "#EAEEF6",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 85% 20%, rgba(59,130,246,0.18) 0%, transparent 55%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "linear-gradient(135deg, #0F2A6B 0%, #1E5FFF 100%)",
              position: "relative",
              display: "flex",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 14,
                top: 17,
                width: 36,
                height: 7,
                borderRadius: 3.5,
                background: "rgba(255,255,255,0.95)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 14,
                top: 28.5,
                width: 24,
                height: 7,
                borderRadius: 3.5,
                background: "rgba(255,255,255,0.75)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 14,
                top: 40,
                width: 14,
                height: 7,
                borderRadius: 3.5,
                background: "#F59E0B",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 600,
              letterSpacing: -0.5,
              color: "#EAEEF6",
            }}
          >
            AIBench.cc
          </div>
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 78,
              fontWeight: 600,
              letterSpacing: -2,
              lineHeight: 1.05,
              color: "#EAEEF6",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>多厂商 LLM API</span>
            <span style={{ color: "#60A5FA" }}>健康检测</span>
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#97A2B8",
              lineHeight: 1.4,
              maxWidth: 980,
            }}
          >
            一次粘贴 key，看清延迟、缓存、限流、模型纯度与真实成本
          </div>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            {[
              "OpenAI",
              "Claude",
              "Gemini",
              "DeepSeek",
              "Kimi",
              "智谱",
              "通义",
              "豆包",
            ].map((name) => (
              <div
                key={name}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(96,165,250,0.25)",
                  background: "rgba(15,24,40,0.6)",
                  fontSize: 22,
                  color: "#EAEEF6",
                }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 80,
            fontSize: 20,
            color: "#5C6680",
          }}
        >
          aibench.cc · 开源 · 中立
        </div>
      </div>
    ),
    { ...size }
  );
}
