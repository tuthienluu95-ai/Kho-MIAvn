"use client";

import { useEffect, useRef } from "react";

export default function ArticleContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const el = ref.current;
      if (!el) return;
      const blocks = el.querySelectorAll<HTMLElement>(
        "pre.mermaid, code.language-mermaid"
      );
      if (blocks.length === 0) return;

      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        securityLevel: "loose",
        flowchart: { curve: "basis", useMaxWidth: false, htmlLabels: true },
        themeVariables: {
          primaryColor: "#fff5ec",
          primaryBorderColor: "#d4501e",
          primaryTextColor: "#14213d",
          lineColor: "#c98200",
          fontSize: "15px",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        },
      });

      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const code = block.textContent || "";
        if (!code.trim()) continue;
        try {
          const id = `mmd-${Date.now()}-${i}`;
          const { svg } = await mermaid.render(id, code);
          if (cancelled) return;

          // Khung cuộn ngang, sơ đồ ở kích thước thật (đọc được)
          const scroller = document.createElement("div");
          scroller.className = "mmd-scroll";
          scroller.innerHTML = svg;

          const svgEl = scroller.querySelector("svg");
          if (svgEl) {
            // Giữ kích thước thật; không ép co
            svgEl.removeAttribute("style");
            svgEl.style.display = "block";
            svgEl.style.margin = "0 auto";
            svgEl.style.maxWidth = "none";
          }

          const target =
            block.tagName === "CODE" ? block.parentElement ?? block : block;
          target.replaceWith(scroller);
        } catch {
          // Cú pháp sai: giữ nguyên text để dễ sửa
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [html]);

  return (
    <article
      ref={ref}
      className="prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
