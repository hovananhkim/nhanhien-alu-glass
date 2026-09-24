"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/ui/CartContext";
import { whatsappGeneralLink } from "@/lib/whatsapp";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

const ORDER_TYPES = [
  {
    value: "B2C",
    label: "🏠 Individual / Home",
    desc: "Ordering for personal use",
  },
  {
    value: "B2B",
    label: "🏢 Business / Bulk",
    desc: "Ordering for commercial use",
  },
];

export default function InquiryCartPage() {
  const { items, removeItem, updateItem, clearCart, count } = useCart();
  const [orderType, setOrderType] = useState<"B2C" | "B2B">("B2C");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    globalNotes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Your inquiry list is empty.");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          notes: form.globalNotes || null,
          orderType,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes || null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit inquiry. Please try again.");
      } else {
        setOrderNumber(data.orderNumber);
        setSubmitted(true);
        clearCart();
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setSubmitting(false);
  };

  // ── Success screen ──────────────────────────────────────────
  if (submitted) {
    return (
      <div
        className="pt-20 min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="max-w-md w-full text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" fill="none" viewBox="0 0 36 36">
              <path
                d="M7 18l7 7 15-15"
                stroke="#16a34a"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1
            className="font-display text-3xl mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Inquiry Submitted!
          </h1>
          <p
            className="text-lg mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Thank you for your interest in NhanHien.
          </p>
          <p className="mb-6" style={{ color: "var(--text-muted)" }}>
            Our team will contact you within 24 hours to discuss your
            requirements.
          </p>

          {/* Order number */}
          <div
            className="rounded-2xl p-5 mb-8"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-base)",
            }}
          >
            <p
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: "var(--text-faint)" }}
            >
              Your Reference Number
            </p>
            <p
              className="font-display text-2xl font-semibold"
              style={{ color: "var(--accent-text)" }}
            >
              {orderNumber}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>
              Save this to track your inquiry
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link
              href={`/track-order?q=${orderNumber}`}
              className="btn-primary"
            >
              Track This Order
            </Link>
            <Link href="/products" className="btn-outline">
              Continue Browsing
            </Link>
            <WhatsAppButton
              href={whatsappGeneralLink(
                `Hi! I just submitted inquiry ${orderNumber} on your website. Looking forward to hearing from you!`,
              )}
              label="Also WhatsApp us"
              variant="outline"
              size="md"
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div
        className="pt-20 min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="max-w-md w-full text-center py-16">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "var(--bg-muted)" }}
          >
            <svg
              width="36"
              height="36"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: "var(--text-faint)" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
                   M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h1
            className="font-display text-3xl mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Your inquiry list is empty
          </h1>
          <p className="mb-8" style={{ color: "var(--text-muted)" }}>
            Browse our products and add items you're interested in. Then submit
            one inquiry for everything at once.
          </p>
          <Link href="/products" className="btn-wood">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // ── Main cart page ──────────────────────────────────────────
  return (
    <div
      className="pt-20 min-h-screen"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Header */}
      <div
        className="py-12 border-b"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs tracking-[0.3em] uppercase font-medium mb-2"
                style={{ color: "var(--accent-text)" }}
              >
                Inquiry List
              </p>
              <h1
                className="font-display text-4xl"
                style={{ color: "var(--text-primary)" }}
              >
                Your Inquiry Cart
              </h1>
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {count} item{count !== 1 ? "s" : ""} · Submit once and our team
                will contact you for all
              </p>
            </div>
            <button
              onClick={clearCart}
              className="text-sm transition-colors flex items-center gap-1.5"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear all
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* ── LEFT: Item list ── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <div
                key={item.productId}
                className="rounded-2xl border p-5 transition-all"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border-base)",
                }}
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 img-zoom"
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="font-display text-lg leading-tight hover:opacity-75 transition-opacity"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.productName}
                        </Link>
                        {item.material && (
                          <p
                            className="text-xs tracking-wider uppercase mt-0.5"
                            style={{ color: "var(--text-faint)" }}
                          >
                            {item.material}
                          </p>
                        )}
                        {item.price && (
                          <p
                            className="text-sm font-medium mt-1"
                            style={{ color: "var(--accent-text)" }}
                          >
                            ₹{item.price.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 rounded-lg transition-all shrink-0"
                        style={{ color: "var(--text-faint)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#ef4444";
                          e.currentTarget.style.background = "#fef2f2";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--text-faint)";
                          e.currentTarget.style.background = "transparent";
                        }}
                        title="Remove"
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
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Quantity + Notes */}
                    <div className="mt-3 flex flex-col sm:flex-row gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-medium"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Qty:
                        </span>
                        <div
                          className="flex items-center border rounded-lg overflow-hidden"
                          style={{ borderColor: "var(--border-base)" }}
                        >
                          <button
                            onClick={() =>
                              updateItem(item.productId, {
                                quantity: Math.max(1, item.quantity - 1),
                              })
                            }
                            className="w-8 h-8 flex items-center justify-center text-lg font-medium transition-colors"
                            style={{
                              color: "var(--text-secondary)",
                              background: "var(--bg-subtle)",
                            }}
                          >
                            −
                          </button>
                          <span
                            className="w-10 text-center text-sm font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateItem(item.productId, {
                                quantity: item.quantity + 1,
                              })
                            }
                            className="w-8 h-8 flex items-center justify-center text-lg font-medium transition-colors"
                            style={{
                              color: "var(--text-secondary)",
                              background: "var(--bg-subtle)",
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        className="form-input text-sm flex-1 py-1.5"
                        placeholder="Special requirements for this item (optional)"
                        value={item.notes}
                        onChange={(e) =>
                          updateItem(item.productId, { notes: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add more products */}
            <Link
              href="/products"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed text-sm font-medium transition-all"
              style={{
                borderColor: "var(--border-base)",
                color: "var(--text-muted)",
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
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add More Products
            </Link>
          </div>

          {/* ── RIGHT: Contact form ── */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl border p-6 sticky top-28"
              style={{
                background: "var(--bg-surface)",
                borderColor: "var(--border-base)",
              }}
            >
              <h2
                className="font-display text-xl mb-5"
                style={{ color: "var(--text-primary)" }}
              >
                Your Details
              </h2>

              {error && (
                <div
                  className="rounded-xl px-4 py-3 mb-4 text-sm"
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    border: "1px solid #fecaca",
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Order type */}
                <div className="space-y-2">
                  {ORDER_TYPES.map((t) => (
                    <label
                      key={t.value}
                      className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                      style={
                        orderType === t.value
                          ? {
                              borderColor: "var(--accent)",
                              background: "var(--accent-soft)",
                            }
                          : {
                              borderColor: "var(--border-base)",
                              background: "var(--bg-subtle)",
                            }
                      }
                    >
                      <input
                        type="radio"
                        name="orderType"
                        value={t.value}
                        checked={orderType === t.value}
                        onChange={() => setOrderType(t.value as "B2C" | "B2B")}
                        className="mt-0.5 shrink-0"
                        style={{ accentColor: "var(--accent)" }}
                      />
                      <div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {t.label}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {t.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Raj Patel"
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="City, State"
                    value={form.address}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, address: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Additional Notes
                  </label>
                  <textarea
                    rows={3}
                    className="form-input resize-none text-sm"
                    placeholder="Budget range, timeline, special requirements..."
                    value={form.globalNotes}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, globalNotes: e.target.value }))
                    }
                  />
                </div>

                {/* Summary */}
                <div
                  className="rounded-xl p-4 space-y-1.5"
                  style={{
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Inquiry Summary
                  </p>
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex justify-between text-sm"
                    >
                      <span
                        className="truncate mr-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {item.productName}
                      </span>
                      <span
                        className="shrink-0 font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        × {item.quantity}
                      </span>
                    </div>
                  ))}
                  <div
                    className="pt-2 mt-2 flex justify-between text-sm font-semibold"
                    style={{
                      borderTop: "1px solid var(--border-base)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span>Total items</span>
                    <span>{count}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-wood w-full py-3.5"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    `Submit Inquiry (${count} item${count !== 1 ? "s" : ""})`
                  )}
                </button>

                <p
                  className="text-center text-xs"
                  style={{ color: "var(--text-faint)" }}
                >
                  No payment required · We'll contact you within 24 hours
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
