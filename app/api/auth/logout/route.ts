import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_token')
  return response
}
// Clears the admin auth cookie and returns a logout confirmation.
