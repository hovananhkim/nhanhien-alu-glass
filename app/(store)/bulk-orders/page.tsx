import type { Metadata } from 'next'
import { buildMetadata, faqJsonLd } from '@/lib/seo'
import BulkOrdersClient from '@/components/store/BulkOrdersClient'

export const metadata: Metadata = buildMetadata({
  title: 'Bulk Orders & B2B Furniture Supply',
  description: 'Bulk furniture orders for hotels, offices, schools and institutions. MOQ from 20 units. Custom specifications, competitive pricing, pan-India delivery.',
  path: '/bulk-orders',
  keywords: ['bulk furniture orders India', 'hotel furniture supplier', 'office furniture bulk', 'B2B furniture manufacturer Gujarat'],
})

const faqSchema = faqJsonLd([
  { q: 'What is the minimum order quantity for bulk furniture?', a: 'Our minimum order quantity (MOQ) starts from 20 units for most products. Contact us for specific product MOQ details.' },
  { q: 'Do you supply furniture to hotels?', a: 'Yes, we are a leading hotel furniture supplier in India. We supply room furniture, lobby pieces, restaurant sets and more to hotels across the country.' },
  { q: 'Can furniture be customized for bulk orders?', a: 'Absolutely. We offer full customization including dimensions, materials, finishes, and colors for all bulk orders.' },
  { q: 'What is the lead time for bulk furniture orders?', a: 'Standard lead time is 45-60 days for bulk orders, depending on quantity and complexity. Rush orders may be accommodated.' },
  { q: 'Do you deliver pan-India?', a: 'Yes, we deliver furniture across India including all major cities and tier-2 towns.' },
])

export default function BulkOrdersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}/>
      <BulkOrdersClient />
    </>
  )
}
