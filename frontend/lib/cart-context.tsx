'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from './auth-context'

export type CartMap = Record<string, number>
export type CartItemIds = Record<string, string>

interface BackendCartItem {
  id: string
  userId: string
  productId: string
  attribute: string
  quantity: number
}

interface CartContextType {
  cart: CartMap
  cartItemIds: CartItemIds
  count: number
  isSyncing: boolean
  toastMessage: string | null
  showToast: (msg: string) => void
  addToCart: (productId: string, quantity?: number) => Promise<boolean>
  changeQuantity: (productId: string, delta: number) => Promise<void>
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth()
  const [cart, setCart] = useState<CartMap>({})
  const [cartItemIds, setCartItemIds] = useState<CartItemIds>({})
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    const timer = setTimeout(() => setToastMessage(null), 2500)
    return () => clearTimeout(timer)
  }, [])

  // ── Clean up legacy guest cart key from browser storage if present ────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('lumora_guest_cart')
      } catch {}
    }
  }, [])

  // ── Fetch Cart from Database when User is Authenticated ───────────────────
  const fetchRemoteCart = useCallback(async (authToken: string) => {
    setIsSyncing(true)
    try {
      const res = await fetch(`${API_BASE_URL}/v1/carts?page=1&limit=100`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        throw new Error(`Failed to fetch cart: ${res.statusText}`)
      }

      const json = await res.json()
      const remoteItems: BackendCartItem[] = json.data ?? []

      const remoteCartMap: CartMap = {}
      const remoteIdMap: CartItemIds = {}

      remoteItems.forEach((item) => {
        remoteCartMap[item.productId] = item.quantity
        remoteIdMap[item.productId] = item.id
      })

      setCart(remoteCartMap)
      setCartItemIds(remoteIdMap)
    } catch (err) {
      console.error('[CartProvider] Error loading remote cart:', err)
    } finally {
      setIsSyncing(false)
    }
  }, [])

  // ── Sync when auth state changes ──────────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchRemoteCart(token)
    } else {
      // Unauthenticated: cart is strictly empty, no localStorage persistence
      setCart({})
      setCartItemIds({})
    }
  }, [isAuthenticated, token, fetchRemoteCart])

  // ── Add to Cart (Strictly requires authentication) ────────────────────────
  const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
    if (!isAuthenticated || !token) {
      showToast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!')
      return false
    }

    const currentQty = cart[productId] || 0
    const newQty = currentQty + quantity

    // Optimistic UI update
    setCart((prev) => ({ ...prev, [productId]: newQty }))
    showToast('Đã thêm sản phẩm vào giỏ hàng!')

    try {
      const res = await fetch(`${API_BASE_URL}/v1/carts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          attribute: 'default',
        }),
      })

      if (res.ok) {
        const json = await res.json()
        const cartItemId = json.data
        if (typeof cartItemId === 'string') {
          setCartItemIds((prev) => ({ ...prev, [productId]: cartItemId }))
        }
        return true
      } else {
        throw new Error('Failed to persist cart item')
      }
    } catch (err) {
      console.error('[CartProvider] Failed to save cart item to database:', err)
      // Rollback optimistic update on failure
      setCart((prev) => {
        const copy = { ...prev }
        if (currentQty > 0) {
          copy[productId] = currentQty
        } else {
          delete copy[productId]
        }
        return copy
      })
      showToast('Không thể thêm vào giỏ hàng. Vui lòng thử lại.')
      return false
    }
  }

  // ── Change Quantity (+ / -) ───────────────────────────────────────────────
  const changeQuantity = async (productId: string, delta: number) => {
    if (!isAuthenticated || !token) {
      showToast('Vui lòng đăng nhập để thao tác giỏ hàng!')
      return
    }

    const currentQty = cart[productId] || 0
    const nextQty = Math.max(0, currentQty + delta)
    const existingCartItemId = cartItemIds[productId]

    // Update local state
    setCart((prev) => {
      const copy = { ...prev }
      if (nextQty > 0) {
        copy[productId] = nextQty
      } else {
        delete copy[productId]
      }
      return copy
    })

    if (nextQty === 0) {
      setCartItemIds((prev) => {
        const copy = { ...prev }
        delete copy[productId]
        return copy
      })
    }

    // Persist to database
    try {
      if (nextQty === 0 && existingCartItemId) {
        // Delete from database
        await fetch(`${API_BASE_URL}/v1/carts/${existingCartItemId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } else if (nextQty > 0 && existingCartItemId) {
        // Update quantity in database
        await fetch(`${API_BASE_URL}/v1/carts/${existingCartItemId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: nextQty }),
        })
      } else if (nextQty > 0 && !existingCartItemId) {
        // Create new in database if missing id
        const res = await fetch(`${API_BASE_URL}/v1/carts`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId,
            quantity: nextQty,
            attribute: 'default',
          }),
        })
        if (res.ok) {
          const json = await res.json()
          if (typeof json.data === 'string') {
            setCartItemIds((prev) => ({ ...prev, [productId]: json.data }))
          }
        }
      }
    } catch (err) {
      console.error('[CartProvider] Failed to update cart item in database:', err)
    }
  }

  const clearCart = () => {
    setCart({})
    setCartItemIds({})
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('lumora_guest_cart')
      } catch {}
    }
  }

  const count = useMemo(() => {
    return Object.values(cart).reduce((a, b) => a + b, 0)
  }, [cart])

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItemIds,
        count,
        isSyncing,
        toastMessage,
        showToast,
        addToCart,
        changeQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
