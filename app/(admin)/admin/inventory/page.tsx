import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import InventoryManager from '@/components/admin/InventoryManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Inventory | Admin' }

export default async function AdminInventoryPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  const items = await prisma.inventoryItem.findMany({
    where: { isDeleted: false },
    include: {
      createdBy: { select: { id: true, name: true } },
      updatedBy: { select: { id: true, name: true } },
      _count: { select: { transactions: true } },
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  const activeItems = items.filter(i => !i.isDeleted)

  const summary = {
    total:      activeItems.length,
    totalValue: activeItems.reduce((s, i) => s + (i.totalValue || 0), 0),
    lowStock:   activeItems.filter(i => i.status === 'LOW_STOCK').length,
    outOfStock: activeItems.filter(i => i.status === 'OUT_OF_STOCK').length,
    byCategory: {
      RAW_MATERIAL:  activeItems.filter(i => i.category === 'RAW_MATERIAL').length,
      WIP:           activeItems.filter(i => i.category === 'WIP').length,
      FINISHED_GOOD: activeItems.filter(i => i.category === 'FINISHED_GOOD').length,
      MRO:           activeItems.filter(i => i.category === 'MRO').length,
    },
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold text-charcoal-800">Inventory</h1>
        <p className="text-stone-400 text-sm mt-1">
          Track raw materials, work-in-progress, finished goods, and MRO supplies across your manufacturing operations.
        </p>
      </div>
      <InventoryManager
        initialItems={JSON.parse(JSON.stringify(items))}
        initialSummary={summary}
      />
    </div>
  )
}
