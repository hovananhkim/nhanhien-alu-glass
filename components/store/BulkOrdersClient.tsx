"use client";
import { useState } from "react";
import Image from "next/image";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { whatsappBulkOrderLink } from "@/lib/whatsapp";

export default function BulkOrdersPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `Bulk Order Inquiry – ${form.company}`,
          message: `Company: ${form.company}\nAddress: ${form.address}\n\nRequirements:\n${form.notes}`,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="pt-20" style={{ background: "var(--bg-base)" }}>
      {/* Hero */}
      <div
        className="relative py-24"
        style={{ background: "var(--bg-surface)" }}
      >
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920"
          alt="Office furniture"
          fill
          className="object-cover opacity-15"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span
              className="inline-block text-white text-xs tracking-widest uppercase px-4 py-1.5 rounded-full mb-6"
              style={{ background: "var(--accent)" }}
            >
              B2B · Bulk Orders
            </span>
            <h1
              className="font-display text-5xl sm:text-6xl mb-5 leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Furniture at Scale
              <br />
              <em
                className="italic font-light"
                style={{ color: "var(--accent-text)" }}
              >
                Without Compromise
              </em>
            </h1>
            <p
              className="text-xl leading-relaxed mb-8"
              style={{ color: "var(--text-secondary)" }}
            >
              We supply hotels, corporate offices, educational institutions, and
              retailers with premium furniture.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#quote-form" className="btn-wood">
                Request a Quote
              </a>
              <WhatsAppButton
                href={whatsappBulkOrderLink()}
                label="Chat on WhatsApp"
                size="lg"
                variant="outline"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Client types */}
      <section
        className="py-16 border-b"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p
            className="text-center text-sm uppercase tracking-widest mb-8"
            style={{ color: "var(--text-muted)" }}
          >
            Who We Serve
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: "🏨",
                title: "Hotels & Resorts",
                desc: "Room furniture, lobby, restaurants",
              },
              {
                icon: "🏢",
                title: "Corporate Offices",
                desc: "Desks, cabinets, meeting rooms",
              },
              {
                icon: "🎓",
                title: "Schools & Colleges",
                desc: "Library, classroom, admin",
              },
              {
                icon: "🏥",
                title: "Healthcare",
                desc: "Ward furniture, reception, staff",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="text-center p-6 rounded-xl border"
                style={{
                  background: "var(--bg-subtle)",
                  borderColor: "var(--border-base)",
                }}
              >
                <div className="text-4xl mb-3">{c.icon}</div>
                <h3
                  className="font-semibold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {c.title}
                </h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why NhanHien */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p
              className="text-xs tracking-[0.3em] uppercase font-medium mb-4"
              style={{ color: "var(--accent-text)" }}
            >
              Why NhanHien for Bulk
            </p>
            <h2
              className="font-display text-4xl mb-8"
              style={{ color: "var(--text-primary)" }}
            >
              Your Ideal Manufacturing Partner
            </h2>
            <div className="space-y-6">
              {[
                {
                  title: "Consistent Quality at Scale",
                  desc: "Every unit in a 500-piece order is identical to the sample you approved.",
                },
                {
                  title: "Competitive Bulk Pricing",
                  desc: "Volume discounts from 20 units. Transparent quote, no hidden charges.",
                },
                {
                  title: "Custom Specifications",
                  desc: "Exact dimensions, material choices, and brand colors — your vision.",
                },
                {
                  title: "Dedicated Project Manager",
                  desc: "Single point of contact from design approval to last-mile delivery.",
                },
                {
                  title: "Phased Delivery Available",
                  desc: "Large projects delivered in phases to match your construction timeline.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "var(--accent)" }}
                  >
                    <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3
                      className="font-semibold mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
              alt="Bulk furniture"
              fill
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
              }}
            />
            <div className="absolute bottom-8 left-8 right-8 grid grid-cols-2 gap-4">
              {[
                { v: "MOQ 20", l: "Minimum Order" },
                { v: "60 Days", l: "Lead Time" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-xl p-4 text-white"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div className="font-display text-2xl font-bold">{s.v}</div>
                  <div
                    className="text-xs tracking-wider uppercase mt-1"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20" style={{ background: "var(--bg-surface)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="font-display text-4xl text-center mb-14"
            style={{ color: "var(--text-primary)" }}
          >
            How It Works
          </h2>
          <div className="grid md:grid-cols-5 gap-6">
            {[
              {
                step: "01",
                title: "Submit Inquiry",
                desc: "Fill the form below with your requirements",
              },
              {
                step: "02",
                title: "Consultation Call",
                desc: "We discuss specs, timeline, and budget",
              },
              {
                step: "03",
                title: "Sample & Approval",
                desc: "Review and approve a physical sample",
              },
              {
                step: "04",
                title: "Production",
                desc: "Manufacturing with regular progress updates",
              },
              {
                step: "05",
                title: "Delivery",
                desc: "White-glove delivery and installation",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "var(--accent)" }}
                >
                  <span className="font-display text-white font-bold text-sm">
                    {s.step}
                  </span>
                </div>
                <h3
                  className="font-semibold text-sm mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {s.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Form */}
      <section
        id="quote-form"
        className="py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center mb-10">
          <p
            className="text-xs tracking-[0.3em] uppercase font-medium mb-3"
            style={{ color: "var(--accent-text)" }}
          >
            Get Started
          </p>
          <h2
            className="font-display text-4xl"
            style={{ color: "var(--text-primary)" }}
          >
            Request a Bulk Quote
          </h2>
        </div>

        {submitted ? (
          <div
            className="rounded-2xl border p-14 text-center"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-base)",
            }}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" fill="none" viewBox="0 0 28 28">
                <path
                  d="M5 14l6 6 12-12"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3
              className="font-display text-2xl mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              Inquiry Submitted!
            </h3>
            <p style={{ color: "var(--text-muted)" }}>
              Our bulk orders team will contact you within 24 hours.
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl border p-8"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-base)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Your name"
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
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Hotel Grand, TechCorp..."
                    value={form.company}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, company: e.target.value }))
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
                    placeholder="procurement@company.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Delivery Address
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Project / delivery location"
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
                  Project Requirements *
                </label>
                <textarea
                  required
                  rows={6}
                  className="form-input resize-none"
                  placeholder="Types of furniture, quantities, materials, timeline, budget range, special requirements..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-wood w-full text-base py-4"
              >
                {submitting ? "Submitting..." : "Submit Bulk Inquiry"}
              </button>
              <p
                className="text-center text-xs"
                style={{ color: "var(--text-faint)" }}
              >
                We'll respond within 24 hours with a detailed quote
              </p>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
