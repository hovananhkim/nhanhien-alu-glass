import { prisma } from '@/lib/prisma'
import OrderStatusUpdater from '@/components/admin/OrderStatusUpdater'
import RepeatCustomerBadge from '@/components/admin/RepeatCustomerBadge'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Orders | Admin' }

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: 'status-pending', CONFIRMED: 'status-confirmed',
    IN_PRODUCTION: 'status-in_production', DELIVERED: 'status-delivered',
    CANCELLED: 'status-cancelled',
  }
  return `status-badge ${map[status] || 'status-pending'}`
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; type?: string }
}) {
  const orders = await prisma.order.findMany({
    where: {
      ...(searchParams.status ? { status: searchParams.status } : {}),
      ...(searchParams.type ? { orderType: searchParams.type } : {}),
    },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const [statusCounts, emailCounts] = await Promise.all([
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.order.groupBy({
      by: ['email'],
      _count: { email: true },
    }),
  ])
  const emailCountMap = new Map(emailCounts.map(row => [row.email, row._count.email]))

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-charcoal-800">Orders</h1>
        <p className="text-stone-400 text-sm mt-1">{orders.length} total orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: 'All', status: null },
          { label: 'Pending', status: 'PENDING' },
          { label: 'Confirmed', status: 'CONFIRMED' },
          { label: 'In Production', status: 'IN_PRODUCTION' },
          { label: 'Delivered', status: 'DELIVERED' },
        ].map(f => {
          const count = f.status
            ? statusCounts.find(s => s.status === f.status)?._count.status || 0
            : orders.length
          return (
            <a
              key={f.label}
              href={f.status ? `/admin/orders?status=${f.status}` : '/admin/orders'}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                (!searchParams.status && !f.status) || searchParams.status === f.status
                  ? 'bg-charcoal-800 text-white border-charcoal-800'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
              }`}
            >
              {f.label}
              <span className="ml-1.5 text-xs opacity-70">({count})</span>
            </a>
          )
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="py-20 text-center text-stone-400">
            <div className="text-4xl mb-3">📦</div>
            <p>No orders found</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {orders.map(order => (
              <div key={order.id} className="p-6 hover:bg-stone-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="font-display font-semibold text-charcoal-800">{order.orderNumber}</span>
                      <span className={statusBadge(order.status)}>{order.status.replace('_', ' ')}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        order.orderType === 'B2B' ? 'bg-purple-50 text-purple-600' : 'bg-stone-100 text-stone-500'
                      }`}>{order.orderType}</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-stone-400 mb-0.5">Customer</p>
                        <p className="font-medium text-charcoal-700">{order.customerName}</p>
                        <p className="text-stone-500 text-xs">{order.email}</p>
                        {(emailCountMap.get(order.email) || 0) > 1 && (
                          <div className="mt-1.5">
                            <RepeatCustomerBadge email={order.email} count={emailCountMap.get(order.email) || 0} />
                          </div>
                        )}
                        <p className="text-stone-500 text-xs">{order.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 mb-0.5">Address</p>
                        <p className="text-stone-600 text-xs">{order.address}</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="mt-4 space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 bg-stone-50 rounded-lg px-3 py-2">
                          {item.product.images[0] && (
                            <img src={item.product.images[0].url} alt={item.product.name}
                              className="w-8 h-8 rounded object-cover" />
                          )}
                          <span className="text-sm text-charcoal-700 font-medium">{item.product.name}</span>
                          <span className="text-xs text-stone-400 ml-auto">Qty: {item.quantity}</span>
                          {item.notes && <span className="text-xs text-stone-400 italic truncate max-w-xs">{item.notes}</span>}
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800">
                        <strong>Note:</strong> {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Status Updater + Date */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <p className="text-xs text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <OrderStatusUpdater
                      orderId={order.id}
                      currentStatus={order.status}
                      expectedDeliveryAt={order.expectedDeliveryAt}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
