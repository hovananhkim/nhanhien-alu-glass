import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

// ── Helpers ───────────────────────────────────────────────────
function computeStatus(quantity: number, minQty: number | null | undefined): string {
  if (quantity <= 0) return 'OUT_OF_STOCK'
  if (minQty !== null && minQty !== undefined && quantity <= minQty) return 'LOW_STOCK'
  return 'ACTIVE'
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category    = searchParams.get('category')   // filter by category
  const includeDeleted = searchParams.get('deleted') === 'true'

  const items = await prisma.inventoryItem.findMany({
    where: {
      ...(category && category !== 'ALL' ? { category } : {}),
      ...(!includeDeleted ? { isDeleted: false } : {}),
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      updatedBy: { select: { id: true, name: true } },
      deletedBy: { select: { id: true, name: true } },
      _count: { select: { transactions: true } },
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  // Summary stats for dashboard cards
  const activeItems = items.filter(i => !i.isDeleted)
  const summary = {
    total:       activeItems.length,
    totalValue:  activeItems.reduce((s, i) => s + (i.totalValue || 0), 0),
    lowStock:    activeItems.filter(i => i.status === 'LOW_STOCK').length,
    outOfStock:  activeItems.filter(i => i.status === 'OUT_OF_STOCK').length,
    byCategory: {
      RAW_MATERIAL:  activeItems.filter(i => i.category === 'RAW_MATERIAL').length,
      WIP:           activeItems.filter(i => i.category === 'WIP').length,
      FINISHED_GOOD: activeItems.filter(i => i.category === 'FINISHED_GOOD').length,
      MRO:           activeItems.filter(i => i.category === 'MRO').length,
    },
  }

  return NextResponse.json({ items, summary })
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const {
      name, sku, description, category, subCategory,
      unit, quantity, minQuantity, maxQuantity,
      unitCost, supplier, supplierContact, location,
    } = body

    // Validation
    if (!name?.trim())     return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
    if (!category)         return NextResponse.json({ error: 'Category is required.' }, { status: 400 })
    if (!unit?.trim())     return NextResponse.json({ error: 'Unit is required.' }, { status: 400 })

    const validCategories = ['RAW_MATERIAL', 'WIP', 'FINISHED_GOOD', 'MRO']
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })
    }

    // SKU uniqueness check
    if (sku?.trim()) {
      const existing = await prisma.inventoryItem.findUnique({ where: { sku: sku.trim() } })
      if (existing) return NextResponse.json({ error: 'SKU already exists.' }, { status: 409 })
    }

    const qty        = parseFloat(quantity) || 0
    const minQty     = minQuantity ? parseFloat(minQuantity) : null
    const maxQty     = maxQuantity ? parseFloat(maxQuantity) : null
    const cost       = unitCost    ? parseFloat(unitCost)    : null
    const totalValue = cost !== null ? qty * cost : null
    const status     = computeStatus(qty, minQty)

    const item = await prisma.inventoryItem.create({
      data: {
        name:        name.trim(),
        sku:         sku?.trim() || null,
        description: description?.trim() || null,
        category,
        subCategory: subCategory?.trim() || null,
        unit:        unit.trim(),
        quantity:    qty,
        minQuantity: minQty,
        maxQuantity: maxQty,
        unitCost:    cost,
        totalValue,
        supplier:        supplier?.trim()        || null,
        supplierContact: supplierContact?.trim() || null,
        location:        location?.trim()        || null,
        status,
        createdById: session.id,
        updatedById: session.id,
      },
    })

    // Log the initial stock-in transaction
    if (qty > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: item.id,
          type:        'STOCK_IN',
          quantity:    qty,
          unitCost:    cost,
          totalCost:   totalValue,
          reason:      'Initial stock entry',
          stockAfter:  qty,
          createdById: session.id,
        },
      })
    }

    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    console.error('[Inventory POST]', err)
    return NextResponse.json({ error: 'Failed to create item.' }, { status: 500 })
  }
}
