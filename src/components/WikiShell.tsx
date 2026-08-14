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
          <img
            className="logo-mark"
            src="/logo-mark-white.png"
            alt="MIAvn"
            width={36}
            height={32}
          />
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
            <div key={node.slug}>
              <div className="group">
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

              {/* Danh bạ nhân viên đứng ngay sau Trang chủ */}
              {node.slug === "trang-chu" && (
                <div className="group">
                  <Link
                    href="/nhan-vien"
                    className={`root-link ${activeSlug === "__staff" ? "active" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    👥 Danh bạ nhân viên
                  </Link>
                </div>
              )}
            </div>
          ))}
        </nav>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
