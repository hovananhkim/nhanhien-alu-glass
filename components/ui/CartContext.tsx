'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export interface CartItem {
  productId: string
  productName: string
  productSlug: string
  imageUrl: string
  material?: string
  price?: number
  quantity: number
  notes: string
}

interface CartContextValue {
  items: CartItem[]
  count: number
  addItem: (item: Omit<CartItem, 'quantity' | 'notes'>) => void
  removeItem: (productId: string) => void
  updateItem: (productId: string, patch: Partial<Pick<CartItem, 'quantity' | 'notes'>>) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
}

const CartContext = createContext<CartContextValue>({
  items: [], count: 0,
  addItem: () => {}, removeItem: () => {},
  updateItem: () => {}, clearCart: () => {},
  isInCart: () => false,
})

const STORAGE_KEY = 'craftura-inquiry-cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    setMounted(true)
  }, [])

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, mounted])

  const addItem = useCallback((product: Omit<CartItem, 'quantity' | 'notes'>) => {
    setItems(prev => {
      // If already in cart, just bump quantity
      const exists = prev.find(i => i.productId === product.productId)
      if (exists) {
        return prev.map(i =>
          i.productId === product.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...product, quantity: 1, notes: '' }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }, [])

  const updateItem = useCallback((
    productId: string,
    patch: Partial<Pick<CartItem, 'quantity' | 'notes'>>
  ) => {
    setItems(prev =>
      prev.map(i => i.productId === productId ? { ...i, ...patch } : i)
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const isInCart = useCallback(
    (productId: string) => items.some(i => i.productId === productId),
    [items]
  )

  return (
    <CartContext.Provider value={{
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      addItem, removeItem, updateItem, clearCart, isInCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
