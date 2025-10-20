export interface Product {
  id: string
  name: string
  category: string
  price: number
  sizes: string[] | string
  description: string
  images: string[] | string
  inStock: boolean | string
  createdAt?: string
}

export interface Order {
  id: string
  orderId: string
  customerName: string
  email: string
  phone: string
  address: string
  totalAmount: number
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  items: OrderItem[] | string
  createdAt?: string
}

export interface OrderItem {
  productId: string
  quantity: number
  name?: string
  price?: number
}

export interface CartItem {
  id: string
  sessionId: string
  productId: string
  quantity: number
  product?: Product
}
