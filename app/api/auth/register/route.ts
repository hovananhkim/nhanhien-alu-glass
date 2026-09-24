import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

// ── Validation helpers ────────────────────────────────────────
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string) {
  // At least 8 chars, one uppercase, one lowercase, one number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, confirmPassword, reason } = body;

    // ── Input validation ──────────────────────────────────────
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 },
      );
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 },
      );
    }
    if (!password || !isStrongPassword(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters with uppercase, lowercase, and a number.",
        },
        { status: 400 },
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 },
      );
    }
    if (!reason?.trim() || reason.trim().length < 20) {
      return NextResponse.json(
        {
          error: "Please provide a reason for access (at least 20 characters).",
        },
        { status: 400 },
      );
    }

    // ── Check duplicate email ─────────────────────────────────
    const existing = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      // Same message whether active or inactive — don't leak account status
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Contact the super admin if you need access.",
        },
        { status: 409 },
      );
    }

    // ── Create inactive account ───────────────────────────────
    const hashed = await hashPassword(password);
    const newAdmin = await prisma.admin.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        role: "admin",
        isActive: false, // ← blocked until super admin approves
        isSuperAdmin: false,
      },
    });

    // ── Notify all super admins by email ─────────────────────
    const superAdmins = await prisma.admin.findMany({
      where: { isSuperAdmin: true, isActive: true },
      select: { email: true, name: true },
    });

    const SITE_URL =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    for (const sa of superAdmins) {
      sendEmail({
        to: sa.email,
        subject: `[NhanHien] New Admin Registration — ${newAdmin.name}`,
        html: `
          <!DOCTYPE html>
          <html><body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f5f3ef;">
          <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0"
            style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">
            <tr><td style="background:#1c1917;padding:28px 36px;">
              <span style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#fff;">NhanHien</span>
              <span style="display:block;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#a85e2e;margin-top:2px;">Admin Panel</span>
            </td></tr>
            <tr><td style="padding:36px;">
              <div style="background:#fef3c7;border-left:4px solid #a85e2e;padding:12px 16px;border-radius:4px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;font-weight:600;color:#92400e;">🔔 New Admin Account Pending Approval</p>
              </div>
              <p style="color:#1c1917;font-size:14px;">Hi ${sa.name},</p>
              <p style="color:#44403c;font-size:14px;line-height:1.6;">
                A new admin account has been registered and is awaiting your approval before they can log in.
              </p>
              <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f5f3ef;border-radius:8px;overflow:hidden;">
                <tr><td style="padding:10px 16px;font-size:12px;color:#78716c;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;border-bottom:1px solid #e7e5e4;">Name</td>
                    <td style="padding:10px 16px;font-size:14px;font-weight:500;color:#1c1917;border-bottom:1px solid #e7e5e4;">${newAdmin.name}</td></tr>
                <tr><td style="padding:10px 16px;font-size:12px;color:#78716c;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;border-bottom:1px solid #e7e5e4;">Email</td>
                    <td style="padding:10px 16px;font-size:14px;font-weight:500;color:#1c1917;border-bottom:1px solid #e7e5e4;">${newAdmin.email}</td></tr>
                <tr><td style="padding:10px 16px;font-size:12px;color:#78716c;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Reason</td>
                    <td style="padding:10px 16px;font-size:14px;color:#44403c;">${reason.trim()}</td></tr>
              </table>
              <p style="color:#44403c;font-size:14px;">To approve or reject this request, visit the Admin Users page:</p>
              <a href="${SITE_URL}/admin/users"
                style="display:inline-block;background:#a85e2e;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;margin-top:8px;">
                Review Registration →
              </a>
              <p style="color:#a8a29e;font-size:12px;margin-top:24px;">
                If you did not expect this registration, you can safely ignore this email or delete the account from the Admin Users page.
              </p>
            </td></tr>
          </table>
          </td></tr></table>
          </body></html>
        `,
      }).catch((err) =>
        console.error("[Email] Registration notify failed:", err),
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Registration submitted. A super admin will review and activate your account.",
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[Register]", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
