import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'

const VALID_TYPES = ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'TRANSFER']

function computeStatus(quantity: number, minQty: number | null | undefined): string {
  if (quantity <= 0) return 'OUT_OF_STOCK'
  if (minQty !== null && minQty !== undefined && quantity <= minQty) return 'LOW_STOCK'
  return 'ACTIVE'
}

// Directions: IN types increase stock, OUT types decrease it
const OUT_TYPES = ['STOCK_OUT', 'DAMAGE', 'TRANSFER']
const IN_TYPES  = ['STOCK_IN', 'RETURN', 'ADJUSTMENT']

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const item = await prisma.inventoryItem.findUnique({ where: { id: params.id } })
  if (!item)         return NextResponse.json({ error: 'Item not found.' }, { status: 404 })
  if (item.isDeleted) return NextResponse.json({ error: 'Cannot add transactions to a deleted item.' }, { status: 400 })

  try {
    const body = await req.json()
    const { type, quantity, unitCost, reason, reference } = body

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 })
    }
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) {
      return NextResponse.json({ error: 'Quantity must be a positive number.' }, { status: 400 })
    }

    // Compute new stock level
    const isOut     = OUT_TYPES.includes(type)
    const qtyChange = isOut ? -qty : qty
    const newQty    = item.quantity + qtyChange

    // Guard: cannot go below zero
    if (newQty < 0) {
      return NextResponse.json({
        error: `Insufficient stock. Current: ${item.quantity} ${item.unit}. Requested: ${qty} ${item.unit}.`,
      }, { status: 400 })
    }

    const cost       = unitCost ? parseFloat(unitCost) : item.unitCost
    const totalCost  = cost !== null && cost !== undefined ? qty * cost : null
    const totalValue = cost !== null && cost !== undefined ? newQty * cost : null
    const newStatus  = computeStatus(newQty, item.minQuantity)

    // Create the transaction
    const txn = await prisma.inventoryTransaction.create({
      data: {
        inventoryId: params.id,
        type,
        quantity:  qty,
        unitCost:  cost,
        totalCost,
        reason:    reason?.trim() || null,
        reference: reference?.trim() || null,
        stockAfter: newQty,
        createdById: session.id,
      },
    })

    // Update the inventory item's quantity, cost, total value, and status
    await prisma.inventoryItem.update({
      where: { id: params.id },
      data: {
        quantity:    newQty,
        unitCost:    cost ?? item.unitCost,
        totalValue,
        status:      newStatus,
        updatedById: session.id,
      },
    })

    return NextResponse.json({ transaction: txn, newQuantity: newQty, newStatus }, { status: 201 })
  } catch (err) {
    console.error('[Inventory Transaction POST]', err)
    return NextResponse.json({ error: 'Failed to record transaction.' }, { status: 500 })
  }
}
