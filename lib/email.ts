import nodemailer from "nodemailer";

// ── Transporter ───────────────────────────────────────────────
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("[Email] SMTP not configured — skipping email send.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

// ── Base HTML layout ──────────────────────────────────────────
function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>NhanHien Fine Furniture</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
        style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07);">

        <!-- Header -->
        <tr>
          <td style="background:#1c1917;padding:28px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#ffffff;letter-spacing:-0.3px;">
                    NhanHien
                  </span>
                  <span style="display:block;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#a85e2e;margin-top:2px;">
                    Fine Furniture
                  </span>
                </td>
                <td align="right">
                  <span style="font-size:11px;color:#78716c;">Est. 1994 · Ahmedabad</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 28px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f3ef;padding:20px 36px;border-top:1px solid #e7e5e4;">
            <p style="margin:0;font-size:12px;color:#a8a29e;text-align:center;">
              NhanHien Fine Furniture · Plot 42, GIDC Industrial Estate, Ahmedabad, Gujarat 380025
            </p>
            <p style="margin:6px 0 0;font-size:12px;color:#a8a29e;text-align:center;">
              +91 98765 43210 · info@craftura.com
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Reusable row block ────────────────────────────────────────
function infoRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid #f0ece7;">
      <span style="font-size:12px;color:#78716c;text-transform:uppercase;letter-spacing:0.05em;">${label}</span><br/>
      <span style="font-size:14px;color:#1c1917;font-weight:500;">${value}</span>
    </td>
  </tr>`;
}

// ── Template: Admin — New Order ───────────────────────────────
export function adminNewOrderEmail(order: {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  orderType: string;
  notes?: string | null;
  items: { productName: string; quantity: number }[];
}): { subject: string; html: string } {
  const itemRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0ece7;">
        <span style="font-size:14px;color:#1c1917;">${item.productName}</span>
        <span style="font-size:13px;color:#78716c;margin-left:8px;">× ${item.quantity}</span>
      </td>
    </tr>`,
    )
    .join("");

  const html = baseTemplate(`
    <div style="background:#fef3c7;border-radius:8px;padding:12px 16px;margin-bottom:24px;border-left:4px solid #a85e2e;">
      <p style="margin:0;font-size:13px;font-weight:600;color:#92400e;">
        🛒 New ${order.orderType === "B2B" ? "Bulk / B2B" : "Customer"} Order Received
      </p>
    </div>

    <h2 style="margin:0 0 4px;font-family:Georgia,serif;font-size:22px;color:#1c1917;">
      Order ${order.orderNumber}
    </h2>
    <p style="margin:0 0 24px;font-size:13px;color:#78716c;">
      Received on ${new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
    </p>

    <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#78716c;">
      Customer Details
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${infoRow("Name", order.customerName)}
      ${infoRow("Email", order.email)}
      ${infoRow("Phone", order.phone)}
      ${infoRow("Address", order.address)}
      ${infoRow("Type", order.orderType === "B2B" ? "Bulk / Business (B2B)" : "Individual (B2C)")}
      ${order.notes ? infoRow("Notes", order.notes) : ""}
    </table>

    <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#78716c;">
      Items Ordered
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${itemRows}
    </table>

    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/orders"
      style="display:inline-block;background:#a85e2e;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;">
      View in Admin Panel →
    </a>
  `);

  return {
    subject: `[NhanHien] New ${order.orderType} Order — ${order.orderNumber}`,
    html,
  };
}

// ── Template: Customer — Order Confirmation ───────────────────
export function customerOrderConfirmationEmail(order: {
  orderNumber: string;
  customerName: string;
  orderType: string;
  items: { productName: string; quantity: number }[];
}): { subject: string; html: string } {
  const itemRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0ece7;">
        <span style="font-size:14px;color:#1c1917;">${item.productName}</span>
        <span style="font-size:13px;color:#78716c;margin-left:8px;">× ${item.quantity}</span>
      </td>
    </tr>`,
    )
    .join("");

  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:56px;height:56px;background:#d1fae5;border-radius:50%;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:24px;">✓</span>
      </div>
      <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;color:#1c1917;">
        Thank you, ${order.customerName.split(" ")[0]}!
      </h2>
      <p style="margin:0;font-size:15px;color:#78716c;">
        Your inquiry has been received. Our team will contact you shortly to confirm your order.
      </p>
    </div>

    <div style="background:#fdf8f1;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;font-size:12px;color:#78716c;text-transform:uppercase;letter-spacing:0.08em;">
        Order Reference
      </p>
      <p style="margin:0;font-size:20px;font-family:Georgia,serif;color:#a85e2e;font-weight:600;">
        ${order.orderNumber}
      </p>
      <p style="margin:4px 0 0;font-size:12px;color:#a8a29e;">
        Keep this number to track your order
      </p>
    </div>

    <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#78716c;">
      Items in Your Inquiry
    </h3>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${itemRows}
    </table>

    <div style="background:#f5f3ef;border-radius:8px;padding:16px 20px;margin-bottom:8px;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1c1917;">What happens next?</p>
      <p style="margin:0;font-size:13px;color:#78716c;line-height:1.6;">
        Our team will call or WhatsApp you within 24 hours to confirm availability, discuss pricing, and arrange delivery.
      </p>
    </div>
  `);

  return {
    subject: `[NhanHien] Order Received — ${order.orderNumber}`,
    html,
  };
}

// ── Template: Admin — New Inquiry ─────────────────────────────
export function adminNewInquiryEmail(inquiry: {
  name: string;
  email: string;
  phone: string;
  subject?: string | null;
  message: string;
}): { subject: string; html: string } {
  const html = baseTemplate(`
    <div style="background:#dbeafe;border-radius:8px;padding:12px 16px;margin-bottom:24px;border-left:4px solid #1e40af;">
      <p style="margin:0;font-size:13px;font-weight:600;color:#1e40af;">
        💬 New Contact Inquiry
      </p>
    </div>

    <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:22px;color:#1c1917;">
      From ${inquiry.name}
    </h2>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${infoRow("Name", inquiry.name)}
      ${infoRow("Email", inquiry.email)}
      ${infoRow("Phone", inquiry.phone)}
      ${inquiry.subject ? infoRow("Subject", inquiry.subject) : ""}
    </table>

    <h3 style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#78716c;">
      Message
    </h3>
    <div style="background:#f5f3ef;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;font-size:14px;color:#44403c;line-height:1.7;white-space:pre-wrap;">${inquiry.message}</p>
    </div>

    <div style="display:flex;gap:12px;">
      <a href="mailto:${inquiry.email}?subject=Re: ${inquiry.subject || "Your Inquiry"}"
        style="display:inline-block;background:#a85e2e;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:13px;font-weight:500;margin-right:10px;">
        Reply by Email
      </a>
      <a href="https://wa.me/${inquiry.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${inquiry.name}, thank you for contacting NhanHien Furniture. `)}"
        style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:13px;font-weight:500;">
        Reply on WhatsApp
      </a>
    </div>
  `);

  return {
    subject: `[NhanHien] New Inquiry — ${inquiry.subject || inquiry.name}`,
    html,
  };
}

// ── Core send function ────────────────────────────────────────
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from: `"NhanHien Furniture" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    });
    console.log(`[Email] Sent: "${subject}" → ${to}`);
    return true;
  } catch (err) {
    // Log but never crash the API — email failure should not block order creation
    console.error("[Email] Failed to send:", err);
    return false;
  }
}
