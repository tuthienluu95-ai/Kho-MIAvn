import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { buildNavTree, type Page } from "@/lib/pages";
import WikiShell from "@/components/WikiShell";

// Cập nhật lại tối đa mỗi 30s (ISR) — quản lý sửa xong nội dung mới hiện nhanh
export const revalidate = 30;

export default async function WikiPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: pages } = await supabase
    .from("pages")
    .select("id, slug, title, content, parent_slug, sort_order, updated_at")
    .order("sort_order", { ascending: true });

  if (!pages) {
    return (
      <div className="content">
        <p>Chưa kết nối được cơ sở dữ liệu. Kiểm tra biến môi trường Supabase.</p>
      </div>
    );
  }

  const current = (pages as Page[]).find((p) => p.slug === params.slug);
  if (!current) notFound();

  const tree = buildNavTree(pages as Page[]);

  // Tìm mục cha để hiện breadcrumb
  const parent = current.parent_slug
    ? (pages as Page[]).find((p) => p.slug === current.parent_slug)
    : null;

  const updated = new Date(current.updated_at).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <WikiShell tree={tree} activeSlug={current.slug}>
      {parent && <div className="crumb">{parent.title} /</div>}
      <h1 className="page-title">{current.title}</h1>
      <div className="updated">Cập nhật: {updated}</div>
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: current.content }}
      />
    </WikiShell>
  );
}
