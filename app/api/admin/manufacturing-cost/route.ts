import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const CONSUMPTION_TYPES = new Set(['STOCK_OUT', 'DAMAGE', 'TRANSFER'])

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export async function GET(req: NextRequest) {
  const admin = await getAdminSession()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const rawMonths = Number(searchParams.get('months') || 6)
  const months = Number.isFinite(rawMonths) && rawMonths > 0 ? Math.min(12, rawMonths) : 6

  const since = new Date()
  since.setMonth(since.getMonth() - (months - 1))
  since.setDate(1)
  since.setHours(0, 0, 0, 0)

  const txns = await prisma.inventoryTransaction.findMany({
    where: { createdAt: { gte: since } },
    include: {
      inventory: { select: { id: true, name: true, category: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const monthlyBuckets: Record<string, { label: string; totalCost: number; rawMaterialCost: number }> = {}
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = monthKey(d)
    monthlyBuckets[key] = {
      label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      totalCost: 0,
      rawMaterialCost: 0,
    }
  }

  const categoryBreakdown: Record<string, number> = {}
  const materialCosts: Record<string, { name: string; amount: number }> = {}

  for (const txn of txns) {
    if (!CONSUMPTION_TYPES.has(txn.type)) continue
    if (!txn.inventory) continue

    const cost = Math.abs(txn.totalCost || 0)
    if (!cost) continue

    const key = monthKey(new Date(txn.createdAt))
    const bucket = monthlyBuckets[key]
    if (bucket) {
      bucket.totalCost += cost
      if (txn.inventory.category === 'RAW_MATERIAL') bucket.rawMaterialCost += cost
    }

    categoryBreakdown[txn.inventory.category] = (categoryBreakdown[txn.inventory.category] || 0) + cost

    const materialKey = txn.inventory.id
    if (!materialCosts[materialKey]) {
      materialCosts[materialKey] = { name: txn.inventory.name, amount: 0 }
    }
    materialCosts[materialKey].amount += cost
  }

  const trend = Object.values(monthlyBuckets)
  const totalConsumptionCost = trend.reduce((sum, row) => sum + row.totalCost, 0)
  const rawMaterialCost = trend.reduce((sum, row) => sum + row.rawMaterialCost, 0)
  const rawMaterialShare = totalConsumptionCost > 0
    ? Math.round((rawMaterialCost / totalConsumptionCost) * 100)
    : 0

  return NextResponse.json({
    summary: {
      totalConsumptionCost,
      rawMaterialCost,
      rawMaterialShare,
      monthCount: months,
    },
    trend,
    categoryBreakdown: Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
    topMaterials: Object.values(materialCosts)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5),
  })
}
