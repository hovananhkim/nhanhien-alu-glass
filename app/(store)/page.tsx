import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { localBusinessJsonLd } from "@/lib/seo";
import { t } from "@/lib/translations";

export const metadata: Metadata = {
  title: "NhanHien Fine Furniture – Nội thất cao cấp thủ công từ năm 1994",
  description:
    "Nội thất thủ công cao cấp cho ngôi nhà, khách sạn và văn phòng tại Ấn Độ. Đặt hàng số lượng lớn B2B, nội thất gỗ teak, oak và sheesham. Địa điểm ở Ahmedabad, Gujarat.",
  keywords: [
    "nội thất thủ công Ấn Độ",
    "nội thất gỗ Ahmedabad",
    "nhà cung cấp nội thất số lượng lớn Gujarat",
    "nhà sản xuất nội thất tùy chỉnh Ấn Độ",
    "nhà cung cấp nội thất khách sạn",
  ],
  openGraph: {
    title: "NhanHien Fine Furniture – Thủ công từ năm 1994",
    description:
      "Nội thất thủ công cao cấp cho ngôi nhà, khách sạn và văn phòng. Chào đón đơn hàng số lượng lớn B2B.",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
};

async function getHomeData() {
  const [featuredProducts, categories, testimonials, blogPosts] =
    await Promise.all([
      prisma.product.findMany({
        where: { featured: true },
        include: { images: { where: { isPrimary: true } }, category: true },
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({ take: 6, orderBy: { name: "asc" } }),
      prisma.testimonial.findMany({
        where: { featured: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: 3,
      }),
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: {
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          category: true,
          readTime: true,
          publishedAt: true,
        },
      }),
    ]);
  return { featuredProducts, categories, testimonials, blogPosts };
}

export default async function HomePage() {
  const { featuredProducts, categories, testimonials, blogPosts } =
    await getHomeData();
  const jsonLd = localBusinessJsonLd();
  const spotlightCategories = categories.slice(0, 4);
  const latestStory = blogPosts[0];
  const highlightedTestimonial = testimonials[0];
  const locale = "vi" as const;
  const homeT = (key: string) => t(key, locale);

  return (
    <div style={{ background: "var(--bg-base)" }}>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO: STUDIO DASHBOARD ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "var(--hero-bg)" }}
        >
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80"
            alt="NhanHien premium furniture showroom"
            fill
            className="object-cover drift-soft"
            style={{ opacity: "var(--hero-image-opacity)" }}
            priority
          />
          <div
            className="absolute inset-0"
            style={{ background: "var(--hero-overlay)" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-end">
            <div className="max-w-2xl">
              <p
                className="text-sm tracking-[0.3em] uppercase font-medium mb-6 animate-fade-in"
                style={{ color: "var(--color-wood-300)" }}
              >
                {homeT("home.hero.badge")}
              </p>
              <h1
                className="font-display text-6xl sm:text-7xl lg:text-8xl font-semibold text-white leading-[0.95] mb-6 animate-slide-up"
                style={{ fontSize: "clamp(2.8rem, 4vw, 5.6rem)" }}
              >
                {homeT("home.hero.design")}
                <br />
                <em className="italic font-light">
                  {homeT("home.hero.build")}
                </em>
                <br />
                {homeT("home.hero.liveBetter")}
              </h1>
              <p
                className="text-lg sm:text-xl leading-relaxed mb-10 max-w-lg animate-slide-up stagger-2"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {homeT("home.hero.description")}
              </p>
              <div className="flex flex-wrap gap-4 animate-fade-in stagger-3">
                <Link href="/products" className="btn-wood">
                  {homeT("home.hero.enterStudio")}
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md text-sm font-medium transition-all text-white"
                  style={{
                    border: "1.5px solid rgba(255,255,255,0.35)",
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  {homeT("home.hero.startProject")}
                </Link>
              </div>
            </div>

            <div
              className="rounded-2xl p-6 border animate-fade-in stagger-4 float-slow hover-depth"
              style={{
                borderColor: "rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
              }}
            >
              <p
                className="text-xs tracking-[0.25em] uppercase mb-5"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                {homeT("home.metrics.liveSignals")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    value: `${featuredProducts.length}`,
                    label: homeT("home.metrics.freshPicks"),
                  },
                  {
                    value: `${categories.length}`,
                    label: homeT("home.metrics.moodCategories"),
                  },
                  {
                    value: "48h",
                    label: homeT("home.metrics.conceptTurnaround"),
                  },
                  {
                    value: "30+",
                    label: homeT("home.metrics.yearsStudioCraft"),
                  },
                ].map((signal) => (
                  <div
                    key={signal.label}
                    className="rounded-xl p-4"
                    style={{ background: "rgba(0,0,0,0.2)" }}
                  >
                    <div className="font-display text-3xl text-white">
                      {signal.value}
                    </div>
                    <div
                      className="text-xs tracking-wider uppercase mt-1"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      {signal.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          <span className="text-xs tracking-widest uppercase">
            {homeT("common.scroll")}
          </span>
          <div
            className="w-px h-12 animate-pulse"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.35), transparent)",
            }}
          />
        </div>
      </section>

      {/* ── CURATED MOODS ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div>
            <p
              className="text-xs tracking-[0.3em] uppercase font-medium mb-3"
              style={{ color: "var(--accent-text)" }}
            >
              {homeT("home.moods.badge")}
            </p>
            <h2
              className="font-display text-4xl sm:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              {homeT("home.moods.title")}
            </h2>
          </div>
          <p
            className="max-w-lg text-sm sm:text-base"
            style={{ color: "var(--text-muted)" }}
          >
            {homeT("home.moods.description")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {spotlightCategories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={`group relative overflow-hidden rounded-2xl img-zoom card-hover animate-fade-in stagger-${Math.min(i + 1, 5)}`}
              style={{ aspectRatio: "4/5" }}
            >
              <Image
                src={
                  cat.imageUrl ||
                  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600"
                }
                alt={`${cat.name} furniture`}
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(12,10,9,0.8) 0%, rgba(12,10,9,0.15) 60%, transparent 100%)",
                }}
              />
              <div className="absolute bottom-0 left-0 p-5 sm:p-7">
                <h3 className="font-display text-white text-xl sm:text-2xl font-semibold">
                  {cat.name}
                </h3>
                <p
                  className="text-sm mt-1 hidden sm:block"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {cat.description ||
                    "Handpicked compositions from the NhanHien studio board."}
                </p>
                <div
                  className="flex items-center gap-2 mt-3 text-sm font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500"
                  style={{ color: "var(--color-wood-300)" }}
                >
                  <span>{homeT("home.moods.view")}</span>
                  <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                    <path
                      d="M2 7h10M8 3l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div
        className="py-5 overflow-hidden"
        style={{ background: "var(--accent)" }}
      >
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          {Array(4)
            .fill([
              homeT("home.marquee.1"),
              homeT("home.marquee.2"),
              homeT("home.marquee.3"),
              homeT("home.marquee.4"),
              homeT("home.marquee.5"),
              homeT("home.marquee.6"),
            ])
            .flat()
            .map((text, i) => (
              <span
                key={i}
                className="text-sm font-medium tracking-widest uppercase shrink-0 text-white"
              >
                {text}
                <span
                  className="mx-3"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  ✦
                </span>
              </span>
            ))}
        </div>
      </div>

      {/* ── STUDIO PICKS ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <p
              className="text-xs tracking-[0.3em] uppercase font-medium mb-3"
              style={{ color: "var(--accent-text)" }}
            >
              {homeT("home.studioPicks.badge")}
            </p>
            <h2
              className="font-display text-4xl sm:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              {homeT("home.studioPicks.title")}
            </h2>
          </div>
          <Link
            href="/products"
            className="btn-outline text-sm shrink-0 self-start sm:self-auto"
          >
            {homeT("home.studioPicks.collection")}
            <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
              <path
                d="M2 7h10M8 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group card-hover hover-depth rounded-2xl overflow-hidden border animate-fade-in"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-base)",
              }}
            >
              <div className="relative aspect-[4/3] img-zoom">
                <Image
                  src={
                    product.images[0]?.url ||
                    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600"
                  }
                  alt={`${product.name} - ${product.category.name}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  {product.category && (
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.92)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {product.category.name}
                    </span>
                  )}
                  {product.moq && (
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
                      style={{ background: "var(--accent)" }}
                    >
                      MOQ: {product.moq}
                    </span>
                  )}
                </div>
              </div>
              <div className="p-5">
                <h3
                  className="font-display text-xl mb-1 transition-opacity group-hover:opacity-75"
                  style={{ color: "var(--text-primary)" }}
                >
                  {product.name}
                </h3>
                {product.material && (
                  <p
                    className="text-xs mb-2 tracking-wider uppercase"
                    style={{ color: "var(--text-faint)" }}
                  >
                    {product.material}
                  </p>
                )}
                <p
                  className="text-sm line-clamp-2 mb-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  {product.price ? (
                    <span
                      className="font-display text-lg"
                      style={{ color: "var(--accent-text)" }}
                    >
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                  ) : (
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {homeT("common.unknown")}
                    </span>
                  )}
                  <span
                    className="flex items-center gap-1.5 text-sm font-medium group-hover:gap-3 transition-all"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {homeT("home.studioPicks.viewDetails")}
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
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CRAFT TIMELINE ── */}
      <section className="py-24" style={{ background: "var(--bg-surface)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="relative float-slow">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
                  alt="NhanHien furniture workshop Ahmedabad"
                  fill
                  className="object-cover"
                />
              </div>
              <div
                className="absolute -bottom-5 -right-5 w-40 h-40 rounded-2xl -z-10 drift-soft"
                style={{ background: "var(--accent)" }}
              />
              <div
                className="absolute -top-5 -left-5 w-28 h-28 rounded-2xl -z-10 drift-soft"
                style={{ background: "var(--bg-subtle)" }}
              />
              <div
                className="absolute top-6 -right-6 text-white p-5 rounded-xl shadow-xl"
                style={{ background: "var(--accent)" }}
              >
                <div className="font-display text-4xl font-bold">30+</div>
                <div
                  className="text-xs tracking-wider uppercase mt-1"
                  style={{ opacity: 0.85 }}
                >
                  {homeT("common.years")}
                </div>
              </div>
            </div>
            <div>
              <p
                className="text-xs tracking-[0.3em] uppercase font-medium mb-5"
                style={{ color: "var(--accent-text)" }}
              >
                {homeT("home.craft.badge")}
              </p>
              <h2
                className="font-display text-4xl sm:text-5xl leading-tight mb-6"
                style={{ color: "var(--text-primary)" }}
              >
                {homeT("home.craft.title")}
                <br />
                <em
                  className="italic font-light"
                  style={{ color: "var(--accent-text)" }}
                >
                  {homeT("home.craft.titleHighlight")}
                </em>
              </h2>
              <p
                className="text-lg leading-relaxed mb-6"
                style={{ color: "var(--text-secondary)" }}
              >
                {homeT("home.craft.description")}
              </p>
              <div className="grid grid-cols-2 gap-6 mb-10">
                {[
                  {
                    icon: "01",
                    title: homeT("home.craft.step1.title"),
                    desc: homeT("home.craft.step1.desc"),
                  },
                  {
                    icon: "02",
                    title: homeT("home.craft.step2.title"),
                    desc: homeT("home.craft.step2.desc"),
                  },
                  {
                    icon: "03",
                    title: homeT("home.craft.step3.title"),
                    desc: homeT("home.craft.step3.desc"),
                  },
                  {
                    icon: "04",
                    title: homeT("home.craft.step4.title"),
                    desc: homeT("home.craft.step4.desc"),
                  },
                ].map((f) => (
                  <div key={f.title} className="flex gap-3">
                    <span
                      className="text-xl mt-0.5 font-display"
                      style={{ color: "var(--accent-text)" }}
                    >
                      {f.icon}
                    </span>
                    <div>
                      <div
                        className="font-semibold text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {f.title}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {f.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/about" className="btn-wood">
                {homeT("home.craft.process")}
                <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROJECT PLANNING HUB ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div
            className="relative overflow-hidden rounded-3xl px-8 sm:px-14 py-14 sm:py-16 hover-depth"
            style={{ background: "var(--accent)" }}
          >
            <div className="absolute inset-0 opacity-10">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="absolute border border-white rounded-full drift-soft"
                    style={{
                      width: (i + 1) * 200,
                      height: (i + 1) * 200,
                      top: "50%",
                      left: "60%",
                      transform: "translate(-50%,-50%)",
                    }}
                  />
                ))}
            </div>
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs tracking-[0.3em] uppercase font-medium mb-4 text-white opacity-80">
                  {homeT("home.project.badge")}
                </p>
                <h2 className="font-display text-4xl sm:text-5xl text-white font-semibold mb-5 leading-tight">
                  {homeT("home.project.title1")}
                  <br />
                  {homeT("home.project.title2")}
                </h2>
                <p
                  className="text-lg leading-relaxed mb-8"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {homeT("home.project.description")}
                </p>
                <Link
                  href="/bulk-orders"
                  className="inline-flex items-center gap-2 font-semibold px-7 py-3.5 rounded-lg transition-colors"
                  style={{
                    background: "var(--bg-surface)",
                    color: "var(--accent)",
                  }}
                >
                  {homeT("home.project.requestPlan")}
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    value: homeT("home.project.card1.value"),
                    label: homeT("home.project.card1.label"),
                    sub: homeT("home.project.card1.sub"),
                  },
                  {
                    value: homeT("home.project.card2.value"),
                    label: homeT("home.project.card2.label"),
                    sub: homeT("home.project.card2.sub"),
                  },
                  {
                    value: homeT("home.project.card3.value"),
                    label: homeT("home.project.card3.label"),
                    sub: homeT("home.project.card3.sub"),
                  },
                  {
                    value: homeT("home.project.card4.value"),
                    label: homeT("home.project.card4.label"),
                    sub: homeT("home.project.card4.sub"),
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl p-5"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div className="font-display text-2xl font-bold text-white">
                      {s.value}
                    </div>
                    <div className="font-semibold text-sm mt-1 text-white">
                      {s.label}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      {s.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF + STORY ── */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          <div
            className="rounded-3xl p-8 sm:p-10 border card-hover"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-base)",
            }}
          >
            <p
              className="text-xs tracking-[0.3em] uppercase font-medium mb-4"
              style={{ color: "var(--accent-text)" }}
            >
              {homeT("home.clientVoice.badge")}
            </p>
            {highlightedTestimonial ? (
              <>
                <div className="flex gap-1 mb-5">
                  {Array(highlightedTestimonial.rating)
                    .fill(0)
                    .map((_, j) => (
                      <svg
                        key={j}
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="var(--accent)"
                      >
                        <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z" />
                      </svg>
                    ))}
                </div>
                <p
                  className="font-display text-2xl sm:text-3xl italic leading-tight mb-6"
                  style={{ color: "var(--text-primary)" }}
                >
                  &ldquo;{highlightedTestimonial.quote}&rdquo;
                </p>
                <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {highlightedTestimonial.name} · {highlightedTestimonial.role}
                  {highlightedTestimonial.location
                    ? ` · ${highlightedTestimonial.location}`
                    : ""}
                </div>
              </>
            ) : (
              <p style={{ color: "var(--text-muted)" }}>
                {homeT("home.clientVoice.fallback")}
              </p>
            )}
          </div>
          <div
            className="rounded-3xl p-8 sm:p-10 border card-hover"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-base)",
            }}
          >
            <p
              className="text-xs tracking-[0.3em] uppercase font-medium mb-4"
              style={{ color: "var(--accent-text)" }}
            >
              {homeT("home.story.badge")}
            </p>
            {latestStory ? (
              <>
                <h3
                  className="font-display text-2xl sm:text-3xl leading-tight mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  {latestStory.title}
                </h3>
                <p
                  className="leading-relaxed mb-7"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {latestStory.excerpt}
                </p>
                <div
                  className="flex items-center gap-3 mb-8 text-xs"
                  style={{ color: "var(--text-faint)" }}
                >
                  <span>{latestStory.category}</span>
                  <span>•</span>
                  <span>
                    {latestStory.readTime} {homeT("common.readTime")}
                  </span>
                </div>
                <Link
                  href={`/blog/${latestStory.slug}`}
                  className="btn-outline"
                >
                  {homeT("home.story.read")}
                </Link>
              </>
            ) : (
              <p style={{ color: "var(--text-muted)" }}>
                Follow our design notes for practical furniture tips, material
                guidance and project inspiration.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── BLOG PREVIEW ── */}
      {blogPosts.length > 0 && (
        <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <p
                className="text-xs tracking-[0.3em] uppercase font-medium mb-3"
                style={{ color: "var(--accent-text)" }}
              >
                {homeT("home.workshop.badge")}
              </p>
              <h2
                className="font-display text-4xl sm:text-5xl"
                style={{ color: "var(--text-primary)" }}
              >
                {homeT("home.workshop.title")}
              </h2>
            </div>
            <Link
              href="/blog"
              className="btn-outline text-sm shrink-0 self-start sm:self-auto"
            >
              {homeT("home.workshop.allArticles")}
              <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
                <path
                  d="M2 7h10M8 3l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
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
                      {post.readTime} {homeT("common.readTime")}
                    </span>
                  </div>
                  <h3
                    className="font-display text-lg mb-2 flex-1 group-hover:opacity-75 transition-opacity"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {post.title}
                  </h3>
                  <p
                    className="text-sm line-clamp-2 mb-4"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {post.excerpt}
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-medium mt-auto"
                    style={{ color: "var(--accent-text)" }}
                  >
                    {homeT("common.readArticle")}
                    <svg width="12" height="12" fill="none" viewBox="0 0 14 14">
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
            ))}
          </div>
        </section>
      )}

      {/* ── FINAL CTA ── */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div
          className="rounded-3xl p-10 sm:p-16 text-center"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-base)",
          }}
        >
          <p
            className="text-xs tracking-[0.3em] uppercase font-medium mb-4"
            style={{ color: "var(--accent-text)" }}
          >
            {homeT("home.final.badge")}
          </p>
          <h2
            className="font-display text-4xl sm:text-5xl mb-5"
            style={{ color: "var(--text-primary)" }}
          >
            {homeT("home.final.title")}
          </h2>
          <p
            className="text-lg max-w-xl mx-auto mb-10"
            style={{ color: "var(--text-muted)" }}
          >
            {homeT("home.final.description")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-wood">
              {homeT("home.final.getInTouch")}
            </Link>
            <Link href="/products" className="btn-outline">
              {homeT("home.final.browseProducts")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
