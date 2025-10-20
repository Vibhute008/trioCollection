export interface Product {
  id: string
  name: string
  category: string
  price: number
  sizes: string[] // Stored as JSON string in DB
  description: string
  images: string[] // Stored as JSON string in DB
  inStock: boolean // Stored as "0" or "1" in SQLite
  stockQuantity: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  product: Product
  quantity: number
  selectedSize: string
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
  items: OrderItem[] // Stored as JSON string in DB
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  selectedSize: string
}
