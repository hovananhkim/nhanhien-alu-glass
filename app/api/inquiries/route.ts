import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, adminNewInquiryEmail } from '@/lib/email'

export async function GET() {
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(inquiries)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !phone || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        subject: subject?.trim() || null,
        message: message.trim(),
      },
    })

    // Notify admin — fire and forget, never block the response
    const adminEmail = process.env.ADMIN_EMAIL || ''
    if (adminEmail) {
      sendEmail({
        to: adminEmail,
        ...adminNewInquiryEmail({
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          subject: inquiry.subject,
          message: inquiry.message,
        }),
      }).catch(err => console.error('[Email] Inquiry notify failed:', err))
    }

    return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create inquiry' }, { status: 500 })
  }
}
// Creates a new inquiry after validating required fields.
