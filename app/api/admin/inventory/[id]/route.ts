import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

function computeStatus(quantity: number, minQty: number | null | undefined): string {
  if (quantity <= 0) return 'OUT_OF_STOCK'
  if (minQty !== null && minQty !== undefined && quantity <= minQty) return 'LOW_STOCK'
  return 'ACTIVE'
}

// ── GET single item with full transaction history ─────────────
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const item = await prisma.inventoryItem.findUnique({
    where: { id: params.id },
    include: {
      createdBy: { select: { id: true, name: true } },
      updatedBy: { select: { id: true, name: true } },
      deletedBy: { select: { id: true, name: true } },
      // ✅ _count must be included so component can read _count.transactions
      _count: { select: { transactions: true } },
      transactions: {
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  })

  if (!item) return NextResponse.json({ error: 'Item not found.' }, { status: 404 })
  return NextResponse.json(item)
}

// ── PATCH — update item fields ────────────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.inventoryItem.findUnique({ where: { id: params.id } })
  if (!existing)         return NextResponse.json({ error: 'Item not found.' }, { status: 404 })
  if (existing.isDeleted) return NextResponse.json({ error: 'Cannot update a deleted item.' }, { status: 400 })

  try {
    const body = await req.json()
    const {
      name, sku, description, category, subCategory,
      unit, quantity, minQuantity, maxQuantity,
      unitCost, supplier, supplierContact, location, status,
    } = body

    // SKU uniqueness check (exclude self)
    if (sku !== undefined && sku?.trim() && sku.trim() !== existing.sku) {
      const dupe = await prisma.inventoryItem.findUnique({ where: { sku: sku.trim() } })
      if (dupe && dupe.id !== params.id) {
        return NextResponse.json({ error: 'SKU already exists.' }, { status: 409 })
      }
    }

    const qty    = quantity    !== undefined ? parseFloat(quantity)    : existing.quantity
    const minQty = minQuantity !== undefined ? (minQuantity ? parseFloat(minQuantity) : null) : existing.minQuantity
    const cost   = unitCost    !== undefined ? (unitCost    ? parseFloat(unitCost)    : null) : existing.unitCost
    const totalValue = cost !== null ? qty * cost : null

    const newStatus = status || computeStatus(qty, minQty)

    const updated = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: {
        ...(name        !== undefined && { name:        name.trim() }),
        ...(sku         !== undefined && { sku:         sku?.trim() || null }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(category    !== undefined && { category }),
        ...(subCategory !== undefined && { subCategory: subCategory?.trim() || null }),
        ...(unit        !== undefined && { unit:        unit.trim() }),
        quantity:    qty,
        minQuantity: minQty,
        ...(maxQuantity !== undefined && { maxQuantity: maxQuantity ? parseFloat(maxQuantity) : null }),
        unitCost:    cost,
        totalValue,
        ...(supplier        !== undefined && { supplier:        supplier?.trim()        || null }),
        ...(supplierContact !== undefined && { supplierContact: supplierContact?.trim() || null }),
        ...(location        !== undefined && { location:        location?.trim()        || null }),
        status: newStatus,
        updatedById: session.id,
      },
    })

    // If quantity changed, log an ADJUSTMENT transaction
    if (quantity !== undefined && qty !== existing.quantity) {
      const diff = qty - existing.quantity
      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: params.id,
          type:        'ADJUSTMENT',
          quantity:    Math.abs(diff),
          unitCost:    cost,
          totalCost:   cost !== null ? Math.abs(diff) * cost : null,
          reason:      diff > 0 ? `Manual increase (+${diff})` : `Manual decrease (${diff})`,
          stockAfter:  qty,
          createdById: session.id,
        },
      })
    }

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[Inventory PATCH]', err)
    return NextResponse.json({ error: 'Failed to update item.' }, { status: 500 })
  }
}

// ── DELETE — soft delete only, never hard delete ──────────────
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.inventoryItem.findUnique({ where: { id: params.id } })
  if (!existing)          return NextResponse.json({ error: 'Item not found.' }, { status: 404 })
  if (existing.isDeleted) return NextResponse.json({ error: 'Item already deleted.' }, { status: 400 })

  const body = await req.json().catch(() => ({}))
  const reason = body.reason?.trim() || 'No reason provided'

  await prisma.inventoryItem.update({
    where: { id: params.id },
    data: {
      isDeleted:      true,
      deletedAt:      new Date(),
      deletedById:    session.id,
      deletionReason: reason,
      status:         'DISCONTINUED',
      updatedById:    session.id,
    },
  })

  await prisma.inventoryTransaction.create({
    data: {
      inventoryId: params.id,
      type:        'STOCK_OUT',
      quantity:    existing.quantity,
      unitCost:    existing.unitCost,
      totalCost:   existing.totalValue,
      reason:      `Item deleted: ${reason}`,
      stockAfter:  0,
      createdById: session.id,
    },
  })

  return NextResponse.json({ success: true })
}
