import { Product } from './types'

export interface LocalCartItem {
  product: Product
  quantity: number
  // ⭐ KEY CHANGE 1: Added selectedSize to the item structure
  selectedSize?: string 
}

const CART_KEY = 'trio_cart'

export const getCartFromLocalStorage = (): LocalCartItem[] => {
  try {
    const cart = localStorage.getItem(CART_KEY)
    return cart ? JSON.parse(cart) : []
  } catch {
    return []
  }
}

export const saveCartToLocalStorage = (cart: LocalCartItem[]): void => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

// ⭐ KEY CHANGE 2: Added 'size' parameter and updated logic to match product AND size
export const addToCart = (product: Product, quantity: number = 1, size: string = ''): void => {
  const cart = getCartFromLocalStorage()
  
  // Find item by BOTH product ID and size. If a size is selected, they must match.
  const existingIndex = cart.findIndex(
    item => 
      item.product.id === product.id && 
      (item.selectedSize || '') === size
  )
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity
  } else {
    // Save the size with the item if it was provided
    const newItem: LocalCartItem = { 
        product, 
        quantity, 
        // Only add selectedSize if 'size' is not empty
        ...(size && { selectedSize: size }) 
    }
    cart.push(newItem)
  }
  
  saveCartToLocalStorage(cart)
}

// Updated updateCartQuantity to account for size if applicable
export const updateCartQuantity = (productId: string, quantity: number, size: string = ''): void => {
  const cart = getCartFromLocalStorage()
  
  // Find item by BOTH product ID and size
  const itemIndex = cart.findIndex(
    item => 
      item.product.id === productId && 
      (item.selectedSize || '') === size
  )
  
  if (itemIndex > -1) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1)
    } else {
      cart[itemIndex].quantity = quantity
    }
    saveCartToLocalStorage(cart)
  }
}

// Updated removeFromCart to account for size if applicable
export const removeFromCart = (productId: string, size: string = ''): void => {
  const cart = getCartFromLocalStorage()
  
  // Filter out items that match BOTH product ID and size
  const filtered = cart.filter(
    item => 
      !(item.product.id === productId && (item.selectedSize || '') === size)
  )
  
  saveCartToLocalStorage(filtered)
}

export const clearCart = (): void => {
  localStorage.removeItem(CART_KEY)
}

export const getCartTotal = (): number => {
  const cart = getCartFromLocalStorage()
  return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
}

export const getCartCount = (): number => {
  const cart = getCartFromLocalStorage()
  return cart.reduce((count, item) => count + item.quantity, 0)
}