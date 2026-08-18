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
          fontSize: "14px",
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
          const frame = buildZoomFrame(svg);
          const target =
            block.tagName === "CODE" ? block.parentElement ?? block : block;
          target.replaceWith(frame);
        } catch {
          // Cú pháp sai: giữ text gốc để dễ sửa
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

// Tạo khung có zoom/pan cho 1 sơ đồ SVG
function buildZoomFrame(svg: string): HTMLElement {
  const frame = document.createElement("div");
  frame.className = "mmd-frame";

  const viewport = document.createElement("div");
  viewport.className = "mmd-viewport";

  const stage = document.createElement("div");
  stage.className = "mmd-stage";
  stage.innerHTML = svg;

  viewport.appendChild(stage);
  frame.appendChild(viewport);

  // Thanh nút
  const bar = document.createElement("div");
  bar.className = "mmd-toolbar";
  const btnIn = mkBtn("+", "Phóng to");
  const btnOut = mkBtn("−", "Thu nhỏ");
  const btnFit = mkBtn("⤢", "Vừa khung");
  bar.append(btnFit, btnOut, btnIn);
  frame.appendChild(bar);

  // Trạng thái zoom/pan
  let scale = 1;
  let baseScale = 1;
  let tx = 0;
  let ty = 0;

  const svgEl = stage.querySelector("svg");
  if (svgEl) {
    svgEl.removeAttribute("width");
    svgEl.removeAttribute("height");
    svgEl.style.width = "100%";
    svgEl.style.height = "100%";
  }

  function apply() {
    stage.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  }

  function fit() {
    // Thu toàn bộ sơ đồ vừa khung
    const vpRect = viewport.getBoundingClientRect();
    const g = stage.querySelector("svg");
    if (!g) return;
    const vb = (g as SVGSVGElement).viewBox.baseVal;
    const dw = vb && vb.width ? vb.width : g.getBoundingClientRect().width;
    const dh = vb && vb.height ? vb.height : g.getBoundingClientRect().height;
    const pad = 24;
    const sx = (vpRect.width - pad) / dw;
    const sy = (vpRect.height - pad) / dh;
    baseScale = Math.min(sx, sy);
    scale = baseScale;
    tx = (vpRect.width - dw * scale) / 2;
    ty = (vpRect.height - dh * scale) / 2;
    apply();
  }

  btnIn.onclick = () => {
    scale = Math.min(scale * 1.25, baseScale * 6);
    apply();
  };
  btnOut.onclick = () => {
    scale = Math.max(scale / 1.25, baseScale * 0.5);
    apply();
  };
  btnFit.onclick = () => fit();

  // Kéo di chuyển (pan)
  let dragging = false;
  let sx0 = 0;
  let sy0 = 0;
  viewport.addEventListener("pointerdown", (e) => {
    dragging = true;
    sx0 = e.clientX - tx;
    sy0 = e.clientY - ty;
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add("grabbing");
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    tx = e.clientX - sx0;
    ty = e.clientY - sy0;
    apply();
  });
  const stop = () => {
    dragging = false;
    viewport.classList.remove("grabbing");
  };
  viewport.addEventListener("pointerup", stop);
  viewport.addEventListener("pointercancel", stop);

  // Cuộn chuột để zoom
  viewport.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      scale = Math.min(Math.max(scale * factor, baseScale * 0.5), baseScale * 6);
      apply();
    },
    { passive: false }
  );

  // Fit sau khi đã gắn vào DOM (đo được kích thước)
  requestAnimationFrame(() => requestAnimationFrame(fit));

  return frame;
}

function mkBtn(label: string, title: string): HTMLButtonElement {
  const b = document.createElement("button");
  b.className = "mmd-btn";
  b.textContent = label;
  b.title = title;
  b.type = "button";
  return b;
}
