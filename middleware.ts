import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Pass pathname to layouts via header — used by admin layout
  // to skip the auth redirect for public pages (login, register)
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', pathname)

  // Public admin routes — allowed without token
  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/register')
  ) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // All other /admin routes need the cookie
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('admin_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/admin/:path*'],
}
