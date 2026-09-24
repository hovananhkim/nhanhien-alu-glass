import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://craftura.com";
const SITE_NAME = "NhanHien Fine Furniture";
const DEFAULT_DESCRIPTION =
  "Premium handcrafted furniture for homes, hotels and offices. B2B bulk orders and custom manufacturing in Ahmedabad, Gujarat since 1994.";
const DEFAULT_IMAGE = `${BASE_URL}/og-default.jpg`;

// ── Page metadata generator ───────────────────────────────────
export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image,
  noIndex = false,
  keywords = [],
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
}): Metadata {
  const url = `${BASE_URL}${path}`;
  const ogImage = image || DEFAULT_IMAGE;

  return {
    title,
    description,
    keywords: [
      "furniture",
      "handcrafted furniture",
      "custom furniture",
      "furniture manufacturer",
      "Ahmedabad furniture",
      "Gujarat furniture",
      "bulk furniture",
      "B2B furniture",
      ...keywords,
    ],
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-image-preview": "large" },
  };
}

// ── JSON-LD: Local Business (homepage) ────────────────────────
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: BASE_URL,
    telephone: "+91-98765-43210",
    email: "info@craftura.com",
    foundingDate: "1994",
    priceRange: "₹₹₹",
    image: DEFAULT_IMAGE,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Plot 42, GIDC Industrial Estate",
      addressLocality: "Ahmedabad",
      addressRegion: "Gujarat",
      postalCode: "380025",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 23.0225,
      longitude: 72.5713,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    sameAs: [],
    hasMap: "https://maps.google.com/?q=23.0225,72.5713",
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };
}

// ── JSON-LD: Product ──────────────────────────────────────────
export function productJsonLd(product: {
  name: string;
  description: string;
  slug: string;
  price?: number | null;
  material?: string | null;
  dimensions?: string | null;
  imageUrl?: string;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: `${BASE_URL}/products/${product.slug}`,
    image: product.imageUrl || DEFAULT_IMAGE,
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    manufacturer: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    category: product.category,
    ...(product.material && { material: product.material }),
    ...(product.price && {
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        seller: {
          "@type": "Organization",
          name: SITE_NAME,
        },
      },
    }),
    ...(!product.price && {
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        priceCurrency: "INR",
        priceSpecification: {
          "@type": "PriceSpecification",
          description: "Price available on request",
        },
      },
    }),
  };
}

// ── JSON-LD: Breadcrumbs ──────────────────────────────────────
export function breadcrumbJsonLd(crumbs: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

// ── JSON-LD: FAQ (for bulk orders page) ──────────────────────
export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}
