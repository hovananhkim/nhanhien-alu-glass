"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false); // pending_approval state
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPending(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        // Special case: account exists but not yet approved
        if (data.error === "pending_approval") {
          setPending(true);
        } else {
          setError(
            data.error || "Login failed. Please check your credentials.",
          );
        }
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "#a85e2e" }}
          >
            <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
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
          <h1 className="font-display text-2xl text-white">NhanHien Admin</h1>
          <p className="text-stone-400 text-sm mt-1">
            Sign in to manage your store
          </p>
        </div>

        {/* Pending approval banner */}
        {pending && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#f59e0b"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-amber-400 text-sm font-semibold">
                  Account Pending Approval
                </p>
                <p className="text-amber-300/70 text-xs mt-1 leading-relaxed">
                  Your account has been registered but is awaiting super admin
                  approval. You will receive an email once your access is
                  activated.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-charcoal-800 rounded-2xl border border-white/8 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                className="admin-input"
                placeholder="admin@craftura.com"
                value={form.email}
                onChange={(e) => {
                  setForm((p) => ({ ...p, email: e.target.value }));
                  setError("");
                  setPending(false);
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  className="admin-input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, password: e.target.value }));
                    setError("");
                    setPending(false);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPass ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex items-center gap-2">
                <svg
                  width="15"
                  height="15"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-medium rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "#a85e2e" }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/5 space-y-2 text-center">
            <p className="text-stone-500 text-xs">
              Default: admin@craftura.com / admin123
            </p>
            <p className="text-stone-600 text-xs">
              Need access?{" "}
              <Link
                href="/admin/register"
                className="text-stone-400 hover:text-stone-200 transition-colors"
              >
                Request an account
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link
            href="/"
            className="text-stone-500 text-xs hover:text-stone-400 transition-colors"
          >
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
