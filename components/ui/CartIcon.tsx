'use client'
import Link from 'next/link'
import { useCart } from './CartContext'

export default function CartIcon({ scrolled, isHome }: { scrolled: boolean; isHome: boolean }) {
  const { count } = useCart()
  const solid = scrolled || !isHome

  return (
    <Link
      href="/inquiry-cart"
      className="relative p-2 rounded-lg transition-all"
      style={{ color: solid ? 'var(--text-secondary)' : 'rgba(255,255,255,0.8)' }}
      title={`Inquiry list (${count} items)`}
      aria-label={`Inquiry list, ${count} items`}
    >
      {/* Cart / clipboard icon */}
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
             M9 5a2 2 0 002 2h2a2 2 0 002-2
             M9 5a2 2 0 012-2h2a2 2 0 012 2
             M9 12h6M9 16h4"/>
      </svg>

      {/* Badge */}
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none"
          style={{ background: 'var(--accent)' }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
