import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getAdminSession } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Login and register are public — render children directly, no auth wrap
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/register')) {
    return <>{children}</>
  }

  // All other admin pages require an active session
  const admin = await getAdminSession()
  if (!admin) redirect('/admin/login')

  return (
    <div className="flex h-screen bg-charcoal-900 overflow-hidden">
      <AdminSidebar admin={admin} isSuperAdmin={admin.isSuperAdmin} />
      <main className="flex-1 overflow-y-auto bg-stone-50">
        {children}
      </main>
    </div>
  )
}
