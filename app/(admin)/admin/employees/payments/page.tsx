import type { Metadata } from 'next'
import EmployeeSection from '@/components/admin/EmployeeSection'

export const metadata: Metadata = { title: 'Thanh toán | Nhân viên' }

export default function Page() {
  return <EmployeeSection view="payments" />
}
