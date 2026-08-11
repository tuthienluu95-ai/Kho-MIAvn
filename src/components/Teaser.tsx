"use client";

import { useState, useEffect } from "react";

export default function Teaser() {
  const [phase, setPhase] = useState<"letters" | "logo" | "done">("letters");

  useEffect(() => {
    // letters slide in (0-1.6s) → logo reveal (1.6s) → fade out (3.2s) → done (3.9s)
    const toLogo = setTimeout(() => setPhase("logo"), 1600);
    const toDone = setTimeout(() => setPhase("done"), 3900);
    return () => {
      clearTimeout(toLogo);
      clearTimeout(toDone);
    };
  }, []);

  if (phase === "done") return null;

  const letters = ["M", "I", "A", "v", "n"];

  return (
    <div className={`teaser ${phase === "logo" ? "teaser-logo-phase" : ""}`}>
      <div className="teaser-inner">
        <div className="teaser-letters" aria-hidden="true">
          {letters.map((ch, i) => (
            <span
              key={i}
              className="teaser-letter"
              style={{
                animationDelay: `${i * 0.18}s`,
                // chữ chạy xen kẽ từ trái/phải vào
                ["--from" as string]: i % 2 === 0 ? "-60px" : "60px",
              }}
            >
              {ch}
            </span>
          ))}
        </div>
        <img
          src="/logo-miavn-white.png"
          alt="MIAvn"
          className="teaser-logo"
        />
      </div>
    </div>
  );
}
