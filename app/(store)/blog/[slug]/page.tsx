import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });
  if (!post || !post.published) return { title: "Post Not Found" };
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage || undefined,
    keywords: post.tags ? post.tags.split(",").map((t) => t.trim()) : [],
  });
}

// Simple markdown → HTML for server rendering (no library)
function renderMarkdown(text: string): string {
  return text
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .split("\n\n")
    .map((block) => {
      if (block.startsWith("<h") || block.startsWith("<ul")) return block;
      if (block.trim() === "") return "";
      return `<p>${block.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });
  if (!post || !post.published) notFound();

  const [prev, next] = await Promise.all([
    prisma.blogPost.findFirst({
      where: {
        published: true,
        publishedAt: { lt: post.publishedAt || post.createdAt },
      },
      orderBy: { publishedAt: "desc" },
      select: { title: true, slug: true },
    }),
    prisma.blogPost.findFirst({
      where: {
        published: true,
        publishedAt: { gt: post.publishedAt || post.createdAt },
      },
      orderBy: { publishedAt: "asc" },
      select: { title: true, slug: true },
    }),
  ]);

  const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://craftura.com";
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", url: BASE },
    { name: "Craft Stories", url: `${BASE}/blog` },
    { name: post.title, url: `${BASE}/blog/${post.slug}` },
  ]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || "",
    datePublished:
      post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: "NhanHien Fine Furniture" },
    publisher: {
      "@type": "Organization",
      name: "NhanHien Fine Furniture",
      logo: { "@type": "ImageObject", url: `${BASE}/og-default.jpg` },
    },
  };

  const tags = post.tags
    ? post.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div
        className="pt-20 min-h-screen"
        style={{ background: "var(--bg-base)" }}
      >
        {/* Hero */}
        {post.coverImage && (
          <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6))",
              }}
            />
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-2 text-xs mb-8"
            style={{ color: "var(--text-faint)" }}
          >
            <Link
              href="/"
              className="hover:underline"
              style={{ color: "var(--text-muted)" }}
            >
              Home
            </Link>
            <span>/</span>
            <Link
              href="/blog"
              className="hover:underline"
              style={{ color: "var(--text-muted)" }}
            >
              Craft Stories
            </Link>
            <span>/</span>
            <span style={{ color: "var(--text-primary)" }}>
              {post.category}
            </span>
          </nav>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
              style={{ background: "var(--accent)" }}
            >
              {post.category}
            </span>
            <span className="text-xs" style={{ color: "var(--text-faint)" }}>
              {post.readTime} min read
            </span>
            <span className="text-xs" style={{ color: "var(--text-faint)" }}>
              ·
            </span>
            <span className="text-xs" style={{ color: "var(--text-faint)" }}>
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </span>
            {post.views > 0 && (
              <>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-faint)" }}
                >
                  ·
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-faint)" }}
                >
                  {post.views} views
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h1
            className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            {post.title}
          </h1>

          {/* Excerpt */}
          <p
            className="text-lg leading-relaxed mb-10 pb-10 font-medium"
            style={{
              color: "var(--text-secondary)",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            {post.excerpt}
          </p>

          {/* Article body */}
          <div
            className="blog-content"
            style={{ color: "var(--text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div
              className="flex flex-wrap gap-2 mt-12 pt-8"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1.5 rounded-full border"
                  style={{
                    background: "var(--bg-muted)",
                    color: "var(--text-muted)",
                    borderColor: "var(--border-base)",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA box */}
          <div
            className="mt-12 rounded-2xl p-7 text-center"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-base)",
            }}
          >
            <p
              className="text-xs uppercase tracking-widest mb-2 font-medium"
              style={{ color: "var(--accent-text)" }}
            >
              Interested in our furniture?
            </p>
            <h3
              className="font-display text-2xl mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Browse Our Collection
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
              See the craftsmanship we write about, in person or through our
              catalogue.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/products" className="btn-wood text-sm px-5 py-2.5">
                View Products
              </Link>
              <Link href="/contact" className="btn-outline text-sm px-5 py-2.5">
                Get in Touch
              </Link>
            </div>
          </div>

          {/* Prev / Next */}
          {(prev || next) && (
            <div className="grid sm:grid-cols-2 gap-4 mt-10">
              {prev ? (
                <Link
                  href={`/blog/${prev.slug}`}
                  className="rounded-xl border p-4 hover:shadow-md transition-all group"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border-base)",
                  }}
                >
                  <p
                    className="text-xs mb-1 font-medium"
                    style={{ color: "var(--text-faint)" }}
                  >
                    ← Previous
                  </p>
                  <p
                    className="text-sm font-semibold group-hover:opacity-75 transition-opacity"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {prev.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {next && (
                <Link
                  href={`/blog/${next.slug}`}
                  className="rounded-xl border p-4 hover:shadow-md transition-all group text-right"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border-base)",
                  }}
                >
                  <p
                    className="text-xs mb-1 font-medium"
                    style={{ color: "var(--text-faint)" }}
                  >
                    Next →
                  </p>
                  <p
                    className="text-sm font-semibold group-hover:opacity-75 transition-opacity"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {next.title}
                  </p>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
