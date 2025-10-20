import { useState, useEffect } from 'react'
import { CartItem } from '@/types'
import { getCart, getCartCount, getCartTotal } from '@/lib/cart-utils'

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [count, setCount] = useState(0)
  const [total, setTotal] = useState(0)

  const updateCartState = () => {
    setCart(getCart())
    setCount(getCartCount())
    setTotal(getCartTotal())
  }

  useEffect(() => {
    updateCartState()

    const handleCartUpdate = () => {
      updateCartState()
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  return { cart, count, total }
}
