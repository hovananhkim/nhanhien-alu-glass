import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Craft Stories & Buying Guides",
  description:
    "Articles about furniture craftsmanship, material sourcing, and buying guides from NhanHien — Ahmedabad's premium furniture manufacturer since 1994.",
  path: "/blog",
  keywords: [
    "furniture blog India",
    "teak wood guide",
    "furniture buying tips",
    "craft stories",
    "furniture manufacturer blog",
  ],
});

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where: {
        published: true,
        ...(searchParams.category ? { category: searchParams.category } : {}),
      },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        tags: true,
        readTime: true,
        views: true,
        publishedAt: true,
      },
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  const uniqueCategories = ["All", ...categories.map((c) => c.category)];
  const featured = posts.find((p) => p.coverImage);
  const rest = posts.filter((p) => p !== featured);

  return (
    <div
      className="pt-20 min-h-screen"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Header */}
      <div
        className="py-16 border-b"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-xs tracking-[0.3em] uppercase font-medium mb-3"
            style={{ color: "var(--accent-text)" }}
          >
            From Our Workshop
          </p>
          <h1
            className="font-display text-4xl sm:text-5xl mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Craft Stories
          </h1>
          <p
            className="text-lg max-w-xl"
            style={{ color: "var(--text-muted)" }}
          >
            Behind-the-scenes stories, material guides, and advice from three
            decades of furniture making.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category filter */}
        {uniqueCategories.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {uniqueCategories.map((cat) => (
              <Link
                key={cat}
                href={
                  cat === "All"
                    ? "/blog"
                    : `/blog?category=${encodeURIComponent(cat)}`
                }
                className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                style={
                  (!searchParams.category && cat === "All") ||
                  searchParams.category === cat
                    ? {
                        background: "var(--accent)",
                        color: "#fff",
                        borderColor: "var(--accent)",
                      }
                    : {
                        background: "var(--bg-surface)",
                        color: "var(--text-secondary)",
                        borderColor: "var(--border-base)",
                      }
                }
              >
                {cat}
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">✍️</div>
            <h3
              className="font-display text-2xl mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No posts yet
            </h3>
            <p style={{ color: "var(--text-muted)" }}>
              Check back soon for craft stories and guides.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured post */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden border card-hover"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border-base)",
                }}
              >
                <div className="relative aspect-[16/9] md:aspect-auto img-zoom">
                  <Image
                    src={featured.coverImage!}
                    alt={featured.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
                      style={{ background: "var(--accent)" }}
                    >
                      {featured.category}
                    </span>
                  </div>
                </div>
                <div className="p-8 lg:p-10 flex flex-col justify-center">
                  <div
                    className="flex items-center gap-3 text-xs mb-4"
                    style={{ color: "var(--text-faint)" }}
                  >
                    <span>{featured.readTime} min read</span>
                    <span>·</span>
                    <span>
                      {featured.publishedAt
                        ? new Date(featured.publishedAt).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "long", year: "numeric" },
                          )
                        : ""}
                    </span>
                  </div>
                  <h2
                    className="font-display text-2xl lg:text-3xl mb-4 group-hover:opacity-80 transition-opacity"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {featured.title}
                  </h2>
                  <p
                    className="text-sm leading-relaxed mb-6"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {featured.excerpt}
                  </p>
                  <span
                    className="inline-flex items-center gap-2 text-sm font-medium"
                    style={{ color: "var(--accent-text)" }}
                  >
                    Read article
                    <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                      <path
                        d="M2 7h10M8 3l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            )}

            {/* Rest of posts grid */}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group rounded-2xl overflow-hidden border card-hover flex flex-col"
                    style={{
                      background: "var(--bg-surface)",
                      borderColor: "var(--border-base)",
                    }}
                  >
                    {post.coverImage && (
                      <div className="relative aspect-[16/9] img-zoom">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--accent-text)",
                          }}
                        >
                          {post.category}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-faint)" }}
                        >
                          {post.readTime} min
                        </span>
                      </div>
                      <h3
                        className="font-display text-lg mb-2 flex-1 group-hover:opacity-80 transition-opacity"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {post.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed mb-4 line-clamp-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {post.excerpt}
                      </p>
                      <div
                        className="flex items-center justify-between mt-auto pt-4"
                        style={{ borderTop: "1px solid var(--border-subtle)" }}
                      >
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-faint)" }}
                        >
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString(
                                "en-IN",
                                { day: "numeric", month: "short" },
                              )
                            : ""}
                        </span>
                        <span
                          className="flex items-center gap-1 text-xs font-medium"
                          style={{ color: "var(--accent-text)" }}
                        >
                          Read
                          <svg
                            width="12"
                            height="12"
                            fill="none"
                            viewBox="0 0 14 14"
                          >
                            <path
                              d="M2 7h10M8 3l4 4-4 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
