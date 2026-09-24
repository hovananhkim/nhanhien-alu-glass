import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { orderNumber, email } = await req.json();

    if (!orderNumber || !email) {
      return NextResponse.json(
        { error: "Order number and email are required." },
        { status: 400 },
      );
    }

    // Find order — must match BOTH order number AND email for security
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber.toUpperCase().trim(),
        email: email.toLowerCase().trim(),
      },
      include: {
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found. Please check your order number and email." },
        { status: 404 },
      );
    }

    // Only PENDING orders can be cancelled by customers
    if (order.status !== "PENDING") {
      const msg: Record<string, string> = {
        CONFIRMED:
          "This order has already been confirmed and cannot be cancelled online. Please call us directly.",
        IN_PRODUCTION:
          "This order is already in production and cannot be cancelled online. Please call us directly.",
        DELIVERED:
          "This order has already been delivered and cannot be cancelled.",
        CANCELLED: "This order has already been cancelled.",
      };
      return NextResponse.json(
        {
          error:
            msg[order.status] ||
            "This order cannot be cancelled at this stage.",
        },
        { status: 409 },
      );
    }

    // Cancel the order
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL || "";
    if (adminEmail) {
      const itemList = order.items
        .map((i) => `${i.product.name} × ${i.quantity}`)
        .join(", ");

      sendEmail({
        to: adminEmail,
        subject: `[NhanHien] Order Cancelled by Customer — ${order.orderNumber}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#1c1917;">Order Cancelled</h2>
            <p style="background:#fef2f2;border-left:4px solid #ef4444;padding:12px 16px;border-radius:4px;color:#7f1d1d;">
              A customer has cancelled their order.
            </p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
              <tr><td style="padding:8px 0;color:#78716c;font-size:13px;">Order Number</td>
                  <td style="padding:8px 0;font-weight:600;">${order.orderNumber}</td></tr>
              <tr><td style="padding:8px 0;color:#78716c;font-size:13px;">Customer</td>
                  <td style="padding:8px 0;">${order.customerName}</td></tr>
              <tr><td style="padding:8px 0;color:#78716c;font-size:13px;">Email</td>
                  <td style="padding:8px 0;">${order.email}</td></tr>
              <tr><td style="padding:8px 0;color:#78716c;font-size:13px;">Phone</td>
                  <td style="padding:8px 0;">${order.phone}</td></tr>
              <tr><td style="padding:8px 0;color:#78716c;font-size:13px;">Items</td>
                  <td style="padding:8px 0;">${itemList}</td></tr>
            </table>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/orders"
              style="display:inline-block;background:#a85e2e;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;">
              View in Admin →
            </a>
          </div>
        `,
      }).catch((err) => console.error("[Email] Cancel notify failed:", err));
    }

    return NextResponse.json({ success: true, orderNumber: order.orderNumber });
  } catch (err) {
    console.error("[Cancel Order]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
