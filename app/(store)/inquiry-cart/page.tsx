import type { Metadata } from 'next'
import InquiryCartClient from '@/components/store/InquiryCartClient'

export const metadata: Metadata = {
  title: 'Inquiry Cart',
  robots: { index: false, follow: false }, // cart pages should not be indexed
}

export default function InquiryCartPage() {
  return <InquiryCartClient />
}
