'use client'
import { useState } from 'react'
import { useCart, CartItem } from './CartContext'

interface Props {
  product: Omit<CartItem, 'quantity' | 'notes'>
  variant?: 'icon' | 'full' | 'outline'
  className?: string
}

export default function AddToCartButton({ product, variant = 'full', className = '' }: Props) {
  const { addItem, isInCart } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const inCart = isInCart(product.productId)

  const handle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handle}
        title={inCart ? 'Already in inquiry list' : 'Add to inquiry list'}
        className={`relative p-2 rounded-lg transition-all ${
          inCart
            ? 'text-white'
            : 'hover:scale-110'
        } ${className}`}
        style={{
          background: inCart ? 'var(--accent)' : 'var(--bg-surface)',
          color: inCart ? '#fff' : 'var(--text-muted)',
          border: '1px solid var(--border-base)',
        }}
      >
        {inCart ? (
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        ) : (
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4v16m8-8H4"/>
          </svg>
        )}
      </button>
    )
  }

  if (variant === 'outline') {
    return (
      <button
        onClick={handle}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${className}`}
        style={inCart
          ? { borderColor: 'var(--accent)', color: 'var(--accent-text)', background: 'var(--accent-soft)' }
          : { borderColor: 'var(--border-base)', color: 'var(--text-secondary)', background: 'transparent' }
        }
      >
        {justAdded ? (
          <>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
            Added!
          </>
        ) : inCart ? (
          <>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
            In List
          </>
        ) : (
          <>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            Add to Inquiry List
          </>
        )}
      </button>
    )
  }

  // full variant (default)
  return (
    <button
      onClick={handle}
      className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-all ${className}`}
      style={inCart
        ? { background: 'var(--accent-soft)', color: 'var(--accent-text)', border: '2px solid var(--accent)' }
        : { background: 'var(--bg-muted)', color: 'var(--text-primary)', border: '2px solid var(--border-base)' }
      }
    >
      {justAdded ? (
        <>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
          Added to Inquiry List!
        </>
      ) : inCart ? (
        <>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
          Already in Inquiry List
        </>
      ) : (
        <>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          Add to Inquiry List
        </>
      )}
    </button>
  )
}
