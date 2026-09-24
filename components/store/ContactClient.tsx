"use client";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const infoCards = [
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      ),
      title: "Factory & Showroom",
      content: "Plot 42, GIDC Industrial Estate,\nAhmedabad, Gujarat 380025",
      sub: "Mon–Sat: 9am – 6pm",
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      ),
      title: "Phone",
      content: "+91 98765 43210\n+91 79 2345 6789",
      sub: "Available during business hours",
    },
    {
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      ),
      title: "Email",
      content: "info@craftura.com\nsales@craftura.com",
      sub: "Reply within 24 hours",
    },
  ];

  return (
    <div className="pt-20" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <div
        className="py-20"
        style={{
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p
            className="text-xs tracking-[0.3em] uppercase font-medium mb-3"
            style={{ color: "var(--accent-text)" }}
          >
            Let's Talk
          </p>
          <h1
            className="font-display text-5xl mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Contact Us
          </h1>
          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: "var(--text-muted)" }}
          >
            Have a question or ready to place an order? We'd love to hear from
            you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Info */}
          <div className="space-y-5">
            {infoCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl p-6 border"
                style={{
                  background: "var(--bg-surface)",
                  borderColor: "var(--border-base)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: "var(--accent-soft)",
                    color: "var(--accent-text)",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {card.icon}
                  </svg>
                </div>
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-sm whitespace-pre-line leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {card.content}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-faint)" }}
                >
                  {card.sub}
                </p>
              </div>
            ))}

            {/* WhatsApp */}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl p-5 transition-opacity hover:opacity-90"
              style={{ background: "#25D366", color: "white" }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 2.5C7.649 2.5 2.5 7.649 2.5 14c0 2.034.535 3.944 1.47 5.6L2.5 25.5l6.1-1.447A11.43 11.43 0 0014 25.5c6.351 0 11.5-5.149 11.5-11.5S20.351 2.5 14 2.5z"
                  fill="rgba(255,255,255,0.2)"
                />
                <path
                  d="M20.3 17.15c-.3-.15-1.77-.873-2.044-.972-.274-.1-.474-.15-.673.15-.2.298-.773.972-.948 1.172-.174.2-.349.224-.648.075-.3-.15-1.265-.466-2.41-1.483-.89-.793-1.492-1.773-1.666-2.072-.174-.3-.018-.462.13-.611.134-.134.3-.349.448-.524.15-.174.2-.299.3-.498.1-.2.05-.374-.025-.524-.075-.15-.673-1.621-.922-2.22-.243-.583-.49-.504-.673-.513l-.573-.01c-.2 0-.524.075-.798.374-.274.3-1.047 1.023-1.047 2.494 0 1.472 1.072 2.894 1.222 3.093.15.2 2.11 3.22 5.113 4.514.714.309 1.272.493 1.707.63.717.228 1.37.196 1.886.119.575-.085 1.77-.724 2.02-1.423.25-.7.25-1.298.174-1.423z"
                  fill="white"
                />
              </svg>
              <div>
                <div className="font-semibold">Chat on WhatsApp</div>
                <div
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.8)" }}
                >
                  Usually replies in minutes
                </div>
              </div>
            </a>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div
                className="rounded-2xl border p-12 text-center"
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
                  className="font-display text-2xl mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Message Sent!
                </h3>
                <p style={{ color: "var(--text-muted)" }}>
                  We'll get back to you within 24 hours.
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
                <h2
                  className="font-display text-2xl mb-7"
                  style={{ color: "var(--text-primary)" }}
                >
                  Send a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
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
                      Subject
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="How can we help?"
                      value={form.subject}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, subject: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      className="form-input resize-none"
                      placeholder="Tell us about your requirements..."
                      value={form.message}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, message: e.target.value }))
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-wood w-full"
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div
          className="mt-12 rounded-2xl overflow-hidden border"
          style={{ height: "320px", borderColor: "var(--border-base)" }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.9044285565543!2d72.5713!3d23.0225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDAxJzIxLjAiTiA3MsKwMzQnMTYuNyJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="NhanHien Location"
          />
        </div>
      </div>
    </div>
  );
}
