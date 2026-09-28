"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ui/ThemeToggle";
import CartIcon from "@/components/ui/CartIcon";
import { t } from "@/lib/translations";

interface NavSettings {
  nav_show_gallery: boolean;
  nav_show_bulk_orders: boolean;
  nav_show_blog: boolean;
  nav_show_about: boolean;
  nav_show_contact: boolean;
}

interface Props {
  navSettings: NavSettings;
}

// Logo SVG — extracted to keep JSX clean
const Logo = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="14" width="14" height="2" rx="1" fill="white" />
    <rect x="5" y="6" width="10" height="8" rx="1" fill="white" opacity="0.7" />
    <rect x="7" y="3" width="6" height="3" rx="1" fill="white" opacity="0.5" />
  </svg>
);

export default function Navbar({ navSettings }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [orderDropOpen, setOrderDropOpen] = useState(false); // desktop dropdown
  const [orderMobOpen, setOrderMobOpen] = useState(false); // mobile accordion
  const dropRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const solid = scrolled || !isHome;

  // Parent "Order Details" auto-hides when ALL its children are hidden.
  // Order Tracking is always visible (not admin-togglable) so parent always shows
  // if bulk_orders OR order tracking exists.
  const showOrderDetails = navSettings.nav_show_bulk_orders || true; // track-order always active

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOrderDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOrderDropOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Derived: is any "Order Details" child active?
  const orderChildActive =
    pathname.startsWith("/bulk-orders") || pathname.startsWith("/track-order");

  // Shared link style helper
  const linkStyle = (active: boolean) => ({
    color: active
      ? solid
        ? "var(--accent-text)"
        : "var(--color-wood-200)"
      : solid
        ? "var(--text-secondary)"
        : "rgba(255,255,255,0.8)",
  });

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: solid ? "var(--nav-bg)" : "transparent",
        backdropFilter: solid ? "blur(12px)" : "none",
        borderBottom: solid ? "1px solid var(--border-subtle)" : "none",
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <Logo />
            </div>
            <div>
              <span
                className="font-display font-semibold text-xl tracking-tight"
                style={{ color: solid ? "var(--text-primary)" : "white" }}
              >
                {t("brand.name")}
              </span>
              <span
                className="block text-[10px] tracking-[0.2em] uppercase"
                style={{
                  color: solid
                    ? "var(--accent-text)"
                    : "rgba(255,255,255,0.65)",
                }}
              >
                {t("brand.tagline")}
              </span>
            </div>
          </Link>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {/* Home — always visible */}
            <Link
              href="/"
              className="px-4 py-2 rounded-md text-sm font-medium animated-underline transition-colors"
              style={linkStyle(pathname === "/")}
            >
              {t("nav.home")}
            </Link>

            {/* Products — always visible */}
            <Link
              href="/products"
              className="px-4 py-2 rounded-md text-sm font-medium animated-underline transition-colors"
              style={linkStyle(
                pathname === "/products" || pathname.startsWith("/products/"),
              )}
            >
              {t("nav.products")}
            </Link>

            {/* Gallery — toggleable */}
            {navSettings.nav_show_gallery && (
              <Link
                href="/gallery"
                className="px-4 py-2 rounded-md text-sm font-medium animated-underline transition-colors"
                style={linkStyle(pathname === "/gallery")}
              >
                {t("nav.gallery")}
              </Link>
            )}

            {/* Blog — toggleable */}
            {navSettings.nav_show_blog && (
              <Link
                href="/blog"
                className="px-4 py-2 rounded-md text-sm font-medium animated-underline transition-colors"
                style={linkStyle(
                  pathname === "/blog" || pathname.startsWith("/blog/"),
                )}
              >
                {t("nav.blog")}
              </Link>
            )}

            {/* Order Details — parent auto-hides when ALL children are hidden */}
            {showOrderDetails && (
              <div ref={dropRef} className="relative">
                <button
                  onClick={() => setOrderDropOpen((p) => !p)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{
                    color: orderChildActive
                      ? solid
                        ? "var(--accent-text)"
                        : "var(--color-wood-200)"
                      : solid
                        ? "var(--text-secondary)"
                        : "rgba(255,255,255,0.8)",
                  }}
                >
                  {t("nav.orderDetails")}
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="transition-transform duration-200"
                    style={{
                      transform: orderDropOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown panel */}
                {orderDropOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-52 rounded-xl shadow-lg overflow-hidden z-50"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-base)",
                      boxShadow: "var(--shadow-hover)",
                    }}
                  >
                    {/* Bulk Orders */}
                    {navSettings.nav_show_bulk_orders && (
                      <Link
                        href="/bulk-orders"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
                        style={{
                          color:
                            pathname === "/bulk-orders"
                              ? "var(--accent-text)"
                              : "var(--text-secondary)",
                          background:
                            pathname === "/bulk-orders"
                              ? "var(--accent-soft)"
                              : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (pathname !== "/bulk-orders")
                            e.currentTarget.style.background =
                              "var(--bg-subtle)";
                        }}
                        onMouseLeave={(e) => {
                          if (pathname !== "/bulk-orders")
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                        {t("nav.bulkOrders")}
                      </Link>
                    )}

                    {/* Order Tracking — live */}
                    <Link
                      href="/track-order"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
                      style={{
                        color:
                          pathname === "/track-order"
                            ? "var(--accent-text)"
                            : "var(--text-secondary)",
                        background:
                          pathname === "/track-order"
                            ? "var(--accent-soft)"
                            : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (pathname !== "/track-order")
                          e.currentTarget.style.background = "var(--bg-subtle)";
                      }}
                      onMouseLeave={(e) => {
                        if (pathname !== "/track-order")
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        />
                      </svg>
                      {t("nav.trackOrder")}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* About — toggleable */}
            {navSettings.nav_show_about && (
              <Link
                href="/about"
                className="px-4 py-2 rounded-md text-sm font-medium animated-underline transition-colors"
                style={linkStyle(pathname === "/about")}
              >
                {t("nav.about")}
              </Link>
            )}

            {/* Contact — toggleable */}
            {navSettings.nav_show_contact && (
              <Link
                href="/contact"
                className="px-4 py-2 rounded-md text-sm font-medium animated-underline transition-colors"
                style={linkStyle(pathname === "/contact")}
              >
                {t("nav.contact")}
              </Link>
            )}
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2">
            <div
              className="hidden sm:flex items-center"
              style={{
                color: solid ? "var(--text-muted)" : "rgba(255,255,255,0.7)",
              }}
            >
              <ThemeToggle />
            </div>
            <CartIcon scrolled={scrolled} isHome={isHome} />
            <Link
              href="/inquiry-cart"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-all"
              style={
                solid
                  ? {
                      background: "var(--text-primary)",
                      color: "var(--bg-base)",
                    }
                  : {
                      background: "rgba(255,255,255,0.15)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.3)",
                    }
              }
            >
              {t("nav.getQuote")}
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
            <button
              className="md:hidden p-2 rounded-md"
              style={{ color: solid ? "var(--text-primary)" : "white" }}
              onClick={() => setMenuOpen((p) => !p)}
            >
              {menuOpen ? (
                <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
                  <path
                    d="M5 5l12 12M17 5L5 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="22" height="22" fill="none" viewBox="0 0 22 22">
                  <path
                    d="M3 6h16M3 11h16M3 16h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {menuOpen && (
          <div
            className="md:hidden py-3 border-t space-y-0.5"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-base)",
            }}
          >
            {/* Home */}
            <MobileLink
              href="/"
              label={t("nav.home")}
              active={pathname === "/"}
              onClose={() => setMenuOpen(false)}
            />

            {/* Products */}
            <MobileLink
              href="/products"
              label={t("nav.products")}
              active={
                pathname === "/products" || pathname.startsWith("/products/")
              }
              onClose={() => setMenuOpen(false)}
            />

            {/* Gallery */}
            {navSettings.nav_show_gallery && (
              <MobileLink
                href="/gallery"
                label={t("nav.gallery")}
                active={pathname === "/gallery"}
                onClose={() => setMenuOpen(false)}
              />
            )}

            {/* Blog */}
            {navSettings.nav_show_blog && (
              <MobileLink
                href="/blog"
                label={t("nav.blog")}
                active={pathname === "/blog" || pathname.startsWith("/blog/")}
                onClose={() => setMenuOpen(false)}
              />
            )}

            {/* Order Details — accordion, auto-hides when ALL children are hidden */}
            {showOrderDetails && (
              <div>
                <button
                  onClick={() => setOrderMobOpen((p) => !p)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-colors"
                  style={{
                    color: orderChildActive
                      ? "var(--accent-text)"
                      : "var(--text-secondary)",
                    background: orderChildActive
                      ? "var(--accent-soft)"
                      : "transparent",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    {t("nav.orderDetails")}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="transition-transform duration-200"
                    style={{
                      transform: orderMobOpen ? "rotate(180deg)" : "rotate(0)",
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {orderMobOpen && (
                  <div
                    className="ml-4 border-l pl-4 space-y-0.5 mt-1"
                    style={{ borderColor: "var(--border-base)" }}
                  >
                    {navSettings.nav_show_bulk_orders && (
                      <MobileLink
                        href="/bulk-orders"
                        label={t("nav.bulkOrders")}
                        active={pathname === "/bulk-orders"}
                        onClose={() => setMenuOpen(false)}
                        indent
                      />
                    )}
                    {/* Order Tracking — live */}
                    <MobileLink
                      href="/track-order"
                      label={t("nav.trackOrder")}
                      active={pathname === "/track-order"}
                      onClose={() => setMenuOpen(false)}
                      indent
                    />
                  </div>
                )}
              </div>
            )}

            {/* About */}
            {navSettings.nav_show_about && (
              <MobileLink
                href="/about"
                label={t("nav.about")}
                active={pathname === "/about"}
                onClose={() => setMenuOpen(false)}
              />
            )}

            {/* Contact */}
            {navSettings.nav_show_contact && (
              <MobileLink
                href="/contact"
                label={t("nav.contact")}
                active={pathname === "/contact"}
                onClose={() => setMenuOpen(false)}
              />
            )}

            {/* Inquiry List */}
            <MobileLink
              href="/inquiry-cart"
              label={t("nav.inquiryList")}
              active={pathname === "/inquiry-cart"}
              onClose={() => setMenuOpen(false)}
              accent
            />

            {/* Theme toggle */}
            <div
              className="flex items-center justify-between px-4 py-3 mt-1"
              style={{
                borderTop: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
              }}
            >
              <span className="text-sm">{t("nav.darkMode")}</span>
              <ThemeToggle />
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

// ── Small helper sub-component for mobile links ──────────────
function MobileLink({
  href,
  label,
  active,
  onClose,
  indent = false,
  accent = false,
}: {
  href: string;
  label: string;
  active: boolean;
  onClose: () => void;
  indent?: boolean;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${indent ? "text-sm" : ""}`}
      style={{
        color:
          active || accent ? "var(--accent-text)" : "var(--text-secondary)",
        background: active || accent ? "var(--accent-soft)" : "transparent",
      }}
    >
      {label}
    </Link>
  );
}
