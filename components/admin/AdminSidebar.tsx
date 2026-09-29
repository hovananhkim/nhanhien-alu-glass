"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { t } from "@/lib/translations";
import { usePathname, useRouter } from "next/navigation";

// ── Icons (extracted for readability) ────────────────────────
const Icon = {
  dashboard: (
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
        d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 11a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-8z"
      />
    </svg>
  ),
  analytics: (
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
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  catalogue: (
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
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  products: (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  categories: (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  ),
  gallery: (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  sales: (
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
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  orders: (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  inquiries: (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
  ),
  mfg: (
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
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  inventory: (
    <svg
      width="15"
      height="15"
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
  ),
  content: (
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
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  ),
  blog: (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
      />
    </svg>
  ),
  testimonials: (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  ),
  navSettings: (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
      />
    </svg>
  ),
  team: (
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
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  chevron: (
    <svg
      width="13"
      height="13"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  ),
  external: (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  ),
  logout: (
    <svg
      width="15"
      height="15"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    </svg>
  ),
};

// ── Nav structure ─────────────────────────────────────────────
type Child = { label: string; href: string; icon: React.ReactNode; exact?: boolean };
type Group = {
  key: string;
  label: string;
  icon: React.ReactNode;
  children: Child[];
};
type StandaloneItem = {
  type: "link";
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
};
type NavItem = StandaloneItem | ({ type: "group" } & Group);

const NAV: NavItem[] = [
  {
    type: "link",
    label: t("admin.nav.dashboard"),
    href: "/admin",
    icon: Icon.dashboard,
    exact: true,
  },
  {
    type: "link",
    label: t("admin.nav.analytics"),
    href: "/admin/analytics",
    icon: Icon.analytics,
  },
  {
    type: "group",
    key: "employees",
    label: t("admin.nav.employees"),
    icon: Icon.team,
    children: [
      { label: t("admin.nav.employeesAll"), href: "/admin/employees", icon: Icon.team, exact: true },
      { label: t("admin.nav.employeeAttendance"), href: "/admin/employees/attendance", icon: Icon.orders },
      { label: t("admin.nav.employeePayments"), href: "/admin/employees/payments", icon: Icon.analytics },
    ],
  },
  {
    type: "group",
    key: "catalogue",
    label: t("admin.nav.catalogue"),
    icon: Icon.catalogue,
    children: [
      { label: t("admin.nav.products"), href: "/admin/products", icon: Icon.products },
      { label: t("admin.nav.categories"), href: "/admin/categories", icon: Icon.categories },
      { label: t("admin.nav.gallery"), href: "/admin/gallery", icon: Icon.gallery },
    ],
  },
  {
    type: "group",
    key: "sales",
    label: t("admin.nav.sales"),
    icon: Icon.sales,
    children: [
      { label: t("admin.nav.orders"), href: "/admin/orders", icon: Icon.orders },
      { label: t("admin.nav.inquiries"), href: "/admin/inquiries", icon: Icon.inquiries },
    ],
  },
  {
    type: "group",
    key: "manufacturing",
    label: t("admin.nav.manufacturing"),
    icon: Icon.mfg,
    children: [
      { label: t("admin.nav.inventory"), href: "/admin/inventory", icon: Icon.inventory },
      {
        label: t("admin.nav.costReport"),
        href: "/admin/manufacturing-cost",
        icon: Icon.analytics,
      },
    ],
  },
  {
    type: "group",
    key: "content",
    label: t("admin.nav.content"),
    icon: Icon.content,
    children: [
      { label: t("admin.nav.blog"), href: "/admin/blog", icon: Icon.blog },
      {
        label: t("admin.nav.testimonials"),
        href: "/admin/testimonials",
        icon: Icon.testimonials,
      },
      {
        label: t("admin.nav.contentNav"),
        href: "/admin/content",
        icon: Icon.navSettings,
      },
    ],
  },
];

const SUPER_ADMIN_ITEMS: Child[] = [
  { label: t("admin.nav.team"), href: "/admin/users", icon: Icon.team },
];

// ── Helpers ───────────────────────────────────────────────────
function isChildActive(children: Child[], pathname: string) {
  return children.some((c) => c.exact ? pathname === c.href : pathname === c.href || pathname.startsWith(`${c.href}/`));
}

// ── Main component ────────────────────────────────────────────
export default function AdminSidebar({
  admin,
  isSuperAdmin,
}: {
  admin: { name: string; email: string; role?: string };
  isSuperAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Which groups are open — auto-open the group that contains current page
  const defaultOpen = () => {
    const open: Record<string, boolean> = {};
    NAV.forEach((item) => {
      if (item.type === "group" && isChildActive(item.children, pathname)) {
        open[item.key] = true;
      }
    });
    return open;
  };

  const [openGroups, setOpenGroups] =
    useState<Record<string, boolean>>(defaultOpen);

  // Auto-open on route change (e.g. direct navigation)
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      NAV.forEach((item) => {
        if (item.type === "group" && isChildActive(item.children, pathname)) {
          next[item.key] = true;
        }
      });
      return next;
    });
  }, [pathname]);

  const toggle = (key: string) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-56 bg-charcoal-900 border-r border-white/5 flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-wood-600 rounded flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="14" width="14" height="2" rx="1" fill="white" />
              <rect
                x="5"
                y="6"
                width="10"
                height="8"
                rx="1"
                fill="white"
                opacity="0.7"
              />
              <rect
                x="7"
                y="3"
                width="6"
                height="3"
                rx="1"
                fill="white"
                opacity="0.5"
              />
            </svg>
          </div>
          <div>
            <div className="text-white font-semibold text-sm font-display leading-none">
              {t("brand.name")}
            </div>
            <div className="text-stone-500 text-[10px] mt-0.5">{t("admin.nav.adminPanel")}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {NAV.map((item) => {
          // ── Standalone link ──
          if (item.type === "link") {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className={isActive ? "text-wood-400" : ""}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          }

          // ── Group with children ──
          const isOpen = !!openGroups[item.key];
          const hasActive = isChildActive(item.children, pathname);

          return (
            <div key={item.key}>
              {/* Group header — toggle button */}
              <button
                onClick={() => toggle(item.key)}
                aria-expanded={isOpen}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  hasActive
                    ? "text-white"
                    : "text-stone-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className={hasActive ? "text-wood-400" : ""}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                <span
                  className="transition-transform duration-200 shrink-0 text-stone-500"
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  {Icon.chevron}
                </span>
              </button>

              {/* Children */}
              {isOpen && (
                <div className="mt-0.5 ml-3 pl-3 border-l border-white/8 space-y-0.5">
                  {item.children.map((child) => {
                    const childActive = child.exact ? pathname === child.href : pathname === child.href || pathname.startsWith(`${child.href}/`);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        aria-current={childActive ? "page" : undefined}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                          childActive
                            ? "bg-white/10 text-white font-medium"
                            : "text-stone-500 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span className={childActive ? "text-wood-400" : ""}>
                          {child.icon}
                        </span>
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Super Admin section */}
        {isSuperAdmin && (
          <div className="pt-3 mt-1 border-t border-white/5">
            <p className="text-stone-600 text-[9px] uppercase tracking-widest font-semibold px-3 pb-1.5">
              {t("admin.nav.superAdmin")}
            </p>
            {SUPER_ADMIN_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-white/10 text-white font-medium"
                      : "text-stone-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className={isActive ? "text-wood-400" : ""}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-white/5 space-y-0.5">
        {/* User info */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="text-white text-xs font-medium truncate">
              {admin.name}
            </span>
            {isSuperAdmin && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                style={{ background: "rgba(168,94,46,0.3)", color: "#e0a87a" }}
              >
                ⭐
              </span>
            )}
          </div>
          <div className="text-stone-600 text-[10px] truncate mt-0.5">
            {admin.email}
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-stone-500 hover:text-white hover:bg-white/5 transition-all"
        >
          {Icon.external}
          {t("admin.nav.viewWebsite")}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          {Icon.logout}
          {t("admin.nav.logout")}
        </button>
      </div>
    </aside>
  );
}
