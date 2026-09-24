import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required.' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    const valid = await verifyPassword(password, admin.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    // Block inactive accounts — pending super admin approval
    if (!admin.isActive) {
      return NextResponse.json({
        error: 'pending_approval',
        message: 'Your account is pending approval from the super admin. You will be notified once activated.',
      }, { status: 403 })
    }

    const token = generateToken({ adminId: admin.id, email: admin.email })
    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, name: admin.name, email: admin.email, isSuperAdmin: admin.isSuperAdmin },
    })

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 12, // 12 hours.
      path: '/',
    })

    return response
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}
// Authenticates admin credentials and issues a signed cookie token.
