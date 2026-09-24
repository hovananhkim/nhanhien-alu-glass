import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard | Admin' }

async function getDashboardData() {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const monthEnd = new Date(monthStart)
  monthEnd.setMonth(monthEnd.getMonth() + 1)

  const [totalOrders, totalInquiries, totalProducts, totalCategories,
    pendingOrders, recentOrders, recentInquiries, unreadInquiries, inProductionThisMonth] = await Promise.all([
    prisma.order.count(),
    prisma.inquiry.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      take: 6, orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true }, take: 1 } },
    }),
    prisma.inquiry.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    prisma.inquiry.count({ where: { isRead: false } }),
    prisma.order.findMany({
      where: {
        status: 'IN_PRODUCTION',
        expectedDeliveryAt: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
      include: {
        items: { include: { product: { select: { price: true } } } },
      },
    }),
  ])
  const revenueForecast = inProductionThisMonth.reduce((sum, order) => {
    return sum + order.items.reduce((acc, item) => acc + (item.product.price || 0) * item.quantity, 0)
  }, 0)

  return {
    totalOrders, totalInquiries, totalProducts, totalCategories, pendingOrders,
    recentOrders, recentInquiries, unreadInquiries, revenueForecast, forecastOrderCount: inProductionThisMonth.length,
  }
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'status-pending', CONFIRMED: 'status-confirmed',
    IN_PRODUCTION: 'status-in_production', DELIVERED: 'status-delivered',
  }
  return `status-badge ${map[status] || 'status-pending'}`
}

function timeAgo(date: Date | string) {
  const d = new Date(date)
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

export default async function AdminDashboard() {
  const { totalOrders, totalInquiries, totalProducts, totalCategories,
    pendingOrders, recentOrders, recentInquiries, unreadInquiries, revenueForecast, forecastOrderCount } = await getDashboardData()

  const stats = [
    { label: 'Total Orders', value: totalOrders, sub: `${pendingOrders} pending`, href: '/admin/orders', color: 'text-blue-600', bg: 'bg-blue-50',
      icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg> },
    { label: 'Inquiries', value: totalInquiries, sub: `${unreadInquiries} unread`, href: '/admin/inquiries', color: 'text-amber-600', bg: 'bg-amber-50',
      icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg> },
    { label: 'Products', value: totalProducts, sub: 'In catalogue', href: '/admin/products', color: 'text-wood-600', bg: 'bg-wood-50',
      icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg> },
    { label: 'Categories', value: totalCategories, sub: 'Product groups', href: '/admin/categories', color: 'text-purple-600', bg: 'bg-purple-50',
      icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg> },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-charcoal-800">Dashboard</h1>
        <p className="text-stone-400 text-sm mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center`}>
                {s.icon}
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-stone-300 group-hover:text-stone-500 transition-colors mt-1">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="font-display text-3xl font-semibold text-charcoal-800 mb-1">{s.value}</div>
            <div className="text-sm text-stone-500">{s.label}</div>
            <div className={`text-xs ${s.color} font-medium mt-1`}>{s.sub}</div>
          </Link>
        ))}
      </div>

      <div className="mb-8 bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <p className="text-xs text-stone-400 mb-1">Revenue Forecast (this month)</p>
        <p className="text-2xl font-display font-semibold text-charcoal-800">₹{revenueForecast.toLocaleString('en-IN')}</p>
        <p className="text-sm text-stone-500 mt-1">
          IN_PRODUCTION orders expected this month: <span className="font-medium text-charcoal-700">{forecastOrderCount}</span>
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
            <h2 className="font-semibold text-charcoal-700">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-wood-600 hover:text-wood-700 font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-stone-50">
            {recentOrders.length === 0 ? (
              <div className="px-6 py-10 text-center text-stone-400 text-sm">No orders yet</div>
            ) : recentOrders.map(order => (
              <Link key={order.id} href={`/admin/orders?highlight=${order.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-charcoal-700 truncate">{order.orderNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.orderType === 'B2B' ? 'bg-purple-50 text-purple-600' : 'bg-stone-100 text-stone-500'
                    }`}>{order.orderType}</span>
                  </div>
                  <div className="text-xs text-stone-400 truncate">{order.customerName} · {order.items[0]?.product?.name}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className={statusBadge(order.status)}>{order.status.replace('_', ' ')}</span>
                  <div className="text-xs text-stone-400 mt-1">{timeAgo(order.createdAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
            <h2 className="font-semibold text-charcoal-700">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="text-xs text-wood-600 hover:text-wood-700 font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-stone-50">
            {recentInquiries.length === 0 ? (
              <div className="px-6 py-10 text-center text-stone-400 text-sm">No inquiries yet</div>
            ) : recentInquiries.map(inquiry => (
              <div key={inquiry.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-medium text-sm text-charcoal-700 truncate">{inquiry.name}</span>
                  {!inquiry.isRead && <span className="w-2 h-2 rounded-full bg-wood-500 shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-stone-400 truncate mb-1">{inquiry.subject || inquiry.message}</p>
                <p className="text-xs text-stone-300">{timeAgo(inquiry.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h2 className="font-semibold text-charcoal-700 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: '/admin/analytics',   label: '📊 Analytics & Export' },
            { href: '/admin/manufacturing-cost', label: '🏭 Manufacturing Cost Report' },
            { href: '/admin/products/new', label: '+ Add Product' },
            { href: '/admin/categories',  label: 'Manage Categories' },
            { href: '/admin/orders',      label: 'View All Orders' },
            { href: '/admin/inquiries',   label: 'Read Inquiries' },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-charcoal-700 text-sm font-medium rounded-lg transition-colors">
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
