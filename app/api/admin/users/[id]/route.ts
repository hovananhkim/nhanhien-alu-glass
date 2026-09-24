import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getAdminSession();
  if (!session?.isSuperAdmin) {
    return NextResponse.json(
      { error: "Super admin access required." },
      { status: 403 },
    );
  }

  const body = await req.json();
  const { action } = body; // 'approve' | 'deactivate' | 'promote' | 'demote'

  // Guard: super admin cannot deactivate themselves
  if (
    params.id === session.id &&
    (action === "deactivate" || action === "demote")
  ) {
    return NextResponse.json(
      { error: "You cannot deactivate or demote your own account." },
      { status: 400 },
    );
  }

  const target = await prisma.admin.findUnique({ where: { id: params.id } });
  if (!target)
    return NextResponse.json({ error: "Admin not found." }, { status: 404 });

  let updateData: Record<string, boolean | string> = {};
  let emailSubject = "";
  let emailBody = "";

  switch (action) {
    case "approve":
      updateData = { isActive: true };
      emailSubject = "[NhanHien] Your admin account has been approved!";
      emailBody = `
        <p style="color:#44403c;font-size:14px;">Hi ${target.name},</p>
        <p style="color:#44403c;font-size:14px;line-height:1.6;">
          Great news! Your NhanHien admin account has been approved. You can now log in to the admin panel.
        </p>
        <a href="${SITE_URL}/admin/login"
          style="display:inline-block;background:#a85e2e;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;margin-top:8px;">
          Log In Now →
        </a>
        <p style="color:#a8a29e;font-size:12px;margin-top:20px;">
          Login URL: ${SITE_URL}/admin/login
        </p>
      `;
      break;

    case "deactivate":
      updateData = { isActive: false };
      emailSubject = "[NhanHien] Your admin account has been deactivated";
      emailBody = `
        <p style="color:#44403c;font-size:14px;">Hi ${target.name},</p>
        <p style="color:#44403c;font-size:14px;line-height:1.6;">
          Your NhanHien admin account has been deactivated. You will no longer be able to log in.
          If you believe this is an error, please contact the super admin directly.
        </p>
      `;
      break;

    case "promote":
      updateData = { isSuperAdmin: true, role: "superadmin" };
      emailSubject = "[NhanHien] You have been promoted to Super Admin";
      emailBody = `
        <p style="color:#44403c;font-size:14px;">Hi ${target.name},</p>
        <p style="color:#44403c;font-size:14px;line-height:1.6;">
          You have been promoted to Super Admin on the NhanHien panel. 
          You can now manage other admin accounts, approve registrations, and access all settings.
        </p>
        <a href="${SITE_URL}/admin/users"
          style="display:inline-block;background:#a85e2e;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;margin-top:8px;">
          Go to Admin Users →
        </a>
      `;
      break;

    case "demote":
      updateData = { isSuperAdmin: false, role: "admin" };
      emailSubject = "[NhanHien] Your Super Admin access has been updated";
      emailBody = `
        <p style="color:#44403c;font-size:14px;">Hi ${target.name},</p>
        <p style="color:#44403c;font-size:14px;line-height:1.6;">
          Your Super Admin privileges on the NhanHien panel have been removed. 
          Your account remains active as a regular admin.
        </p>
      `;
      break;

    default:
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const updated = await prisma.admin.update({
    where: { id: params.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      isSuperAdmin: true,
      createdAt: true,
    },
  });

  // Send notification email (fire and forget)
  if (emailSubject && target.email) {
    const SITE_NAME = "NhanHien Fine Furniture";
    sendEmail({
      to: target.email,
      subject: emailSubject,
      html: `
        <!DOCTYPE html>
        <html><body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;background:#f5f3ef;">
        <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;">
          <tr><td style="background:#1c1917;padding:28px 36px;">
            <span style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#fff;">${SITE_NAME}</span>
          </td></tr>
          <tr><td style="padding:36px;">${emailBody}</td></tr>
          <tr><td style="background:#f5f3ef;padding:16px 36px;border-top:1px solid #e7e5e4;">
            <p style="margin:0;font-size:12px;color:#a8a29e;text-align:center;">
              ${SITE_NAME} · Ahmedabad, Gujarat
            </p>
          </td></tr>
        </table>
        </td></tr></table>
        </body></html>
      `,
    }).catch((err) => console.error("[Email] User action notify failed:", err));
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getAdminSession();
  if (!session?.isSuperAdmin) {
    return NextResponse.json(
      { error: "Super admin access required." },
      { status: 403 },
    );
  }
  if (params.id === session.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 },
    );
  }
  await prisma.admin.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
