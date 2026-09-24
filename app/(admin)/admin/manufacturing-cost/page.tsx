import type { Metadata } from 'next'
import ManufacturingCostDashboard from '@/components/admin/ManufacturingCostDashboard'

export const metadata: Metadata = { title: 'Manufacturing Cost | Admin' }

export default function ManufacturingCostPage() {
  return <ManufacturingCostDashboard />
}
