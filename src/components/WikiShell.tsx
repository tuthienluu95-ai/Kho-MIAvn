"use client";

import { useState } from "react";
import Link from "next/link";
import type { NavNode } from "@/lib/pages";

export default function WikiShell({
  tree,
  activeSlug,
  children,
}: {
  tree: NavNode[];
  activeSlug: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="shell">
      <header className="topbar">
        <button
          className="menu-btn"
          aria-label="Mở menu"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
        <Link href="/" className="brand">
          <svg
            className="logo-mark"
            width="34"
            height="34"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fill="#ffffff"
              d="M24 3.5l3.9 6.2 7.1-1.9-1.9 7.1 6.2 3.9-6.2 3.9 1.9 7.1-7.1-1.9L24 41.2l-3.9-6.2-7.1 1.9 1.9-7.1L8.7 26l6.2-3.9-1.9-7.1 7.1 1.9L24 3.5z"
            />
            <circle cx="24" cy="22.3" r="5.6" fill="#d4501e" />
          </svg>
          <span className="brand-text">
            <span className="brand-title">
              WIKI KHO VẬN <span>MIAvn</span>
            </span>
            <span className="brand-sub">Wiki nội bộ cho bộ phận kho MIA</span>
          </span>
        </Link>
        <div className="spacer" />
        <Link href="/admin" className="admin-link">
          Quản lý
        </Link>
      </header>

      <div className="body">
        <div
          className={`overlay ${open ? "show" : ""}`}
          onClick={() => setOpen(false)}
        />
        <nav className={`nav ${open ? "open" : ""}`}>
          {tree.map((node) => (
            <div className="group" key={node.slug}>
              <Link
                href={`/wiki/${node.slug}`}
                className={`root-link ${activeSlug === node.slug ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {node.title}
              </Link>
              {node.children.map((child) => (
                <Link
                  key={child.slug}
                  href={`/wiki/${child.slug}`}
                  className={`child-link ${
                    activeSlug === child.slug ? "active-child" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {child.title}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
