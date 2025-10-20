import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { blink } from '@/blink/client'
import { Product, Order } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { LogOut, Plus, Package, ShoppingCart, Trash2, Home, Eye } from 'lucide-react' 
import { Skeleton } from '@/components/ui/skeleton'

// IMPORTS FOR DIALOG/MODAL
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog' 
import { ScrollArea } from '@/components/ui/scroll-area' 

// Define possible order statuses for the filter
const ORDER_STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [user, setUser] = useState<any>(null)
  
  const [productCategoryFilter, setProductCategoryFilter] = useState('All')
  const [orderStatusFilter, setOrderStatusFilter] = useState('All')

  // State for the Order Details Dialog/Popup
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Use useCallback to stabilize the data loading function
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [productsData, ordersData] = await Promise.all([
        blink.db.products.list({ orderBy: { createdAt: 'desc' } }),
        blink.db.orders.list({ orderBy: { createdAt: 'desc' } })
      ])
      setProducts(productsData)
      setOrders(ordersData)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, []) 

  // Use useCallback to stabilize the auth check function
  const checkAuth = useCallback(async () => {
    try {
      const isAdminAuth = localStorage.getItem('adminAuth')
      const adminEmail = localStorage.getItem('adminEmail')

      if (isAdminAuth === 'true' && adminEmail === 'rohankakde25@gmail.com') {
        setUser({ email: adminEmail })
        await loadData()
      } else {
        toast.error('Access denied')
        navigate('/admin')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      navigate('/admin')
    }
  }, [navigate, loadData])

  // Call checkAuth on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleLogout = async () => {
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('adminEmail')
    toast.success('Logged out successfully')
    navigate('/admin')
  }

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Delete "${productName}"?`)) return

    try {
      await blink.db.products.delete(productId)
      toast.success('Product deleted')
      loadData()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  // Handle Order Deletion
  const handleDeleteOrder = useCallback(async (orderId: string, orderName: string) => {
    if (!confirm(`Are you sure you want to permanently delete Order ID: ${orderName}? This action cannot be undone.`)) return

    try {
      await blink.db.orders.delete(orderId)
      toast.success('Order deleted successfully')
      await loadData() 
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null)
      }
    } catch (error) {
      console.error('Failed to delete order:', error)
      toast.error('Failed to delete order')
    }
  }, [loadData, selectedOrder])

  // Update Status function
  const handleUpdateOrderStatus = useCallback(async (orderId: string, newStatus: string) => {
    try {
      await blink.db.orders.update(orderId, { status: newStatus })
      toast.success('Order status updated')
      await loadData()
    } catch (error) {
      toast.error('Failed to update order')
    }
  }, [loadData])

  // Show Order Details in a Dialog/Panel
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
  }

  // COMPUTED VALUE: Get unique categories for product filter
  const productCategories = useMemo(() => {
    const categories = new Set(products.map(p => p.category).filter(Boolean))
    return ['All', ...Array.from(categories)]
  }, [products])

  // COMPUTED VALUE: Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (productCategoryFilter === 'All') {
      return products
    }
    return products.filter(p => p.category === productCategoryFilter)
  }, [products, productCategoryFilter])

  // COMPUTED VALUE: Filter orders based on selected status
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'All') {
      return orders
    }
    return orders.filter(o => o.status === orderStatusFilter)
  }, [orders, orderStatusFilter])
  
  // Helper for status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'default'
      case 'Shipped': return 'secondary'
      case 'Processing': return 'outline'
      case 'Cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  // Helper to format order items for the dialog
  const orderItemsFormatted = useMemo(() => {
    if (!selectedOrder) return []
    try {
        // Assuming order.items is a JSON string of item array
        const parsedItems = JSON.parse(selectedOrder.items);
        // Ensure it's an array before returning
        return Array.isArray(parsedItems) ? parsedItems : [];
    } catch (e) {
        console.error("Error parsing order items JSON:", e);
        return []
    }
  }, [selectedOrder])

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header (Navbar) */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Stats... (unchanged) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                <span className="text-xs">₹</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{orders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString('en-IN')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            {/* Products Tab (unchanged) */}
            <TabsContent value="products">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <CardTitle>Products</CardTitle>
                  <div className="flex space-x-3 items-center">
                    <Select
                      value={productCategoryFilter}
                      onValueChange={setProductCategoryFilter}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => navigate('/admin/add-product')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : filteredProducts.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>₹{product.price.toLocaleString('en-IN')}</TableCell>
                            <TableCell>
                              <Badge variant={Number(product.inStock) ? 'default' : 'secondary'}>
                                {Number(product.inStock) ? 'In Stock' : 'Out of Stock'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No products found for the selected category.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab (View/Delete buttons unchanged) */}
            <TabsContent value="orders">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Orders</CardTitle>
                  <Select
                    value={orderStatusFilter}
                    onValueChange={setOrderStatusFilter}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : filteredOrders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-sm">{order.orderId}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>₹{order.totalAmount.toLocaleString('en-IN')}</TableCell>
                            <TableCell>
                              <Select
                                defaultValue={order.status}
                                onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUSES.slice(1).map(status => ( 
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewOrderDetails(order)}
                                >
                                  <Eye className="h-4 w-4 text-primary" /> 
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteOrder(order.id, order.orderId)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" /> 
                                </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No orders found for status: {orderStatusFilter}.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* --- Order Details Panel/Dialog (FIXED ITEM DISPLAY) --- */}
      <Dialog 
        open={!!selectedOrder} 
        onOpenChange={(open) => !open && setSelectedOrder(null)}
      >
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.orderId}</DialogTitle>
            <DialogDescription>
              Customer and shipping information for this order.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <ScrollArea className="flex-grow p-4 -mx-4 border-t">
              <div className="grid gap-4">
                <h3 className="font-semibold text-lg border-b pb-1">Customer Information</h3>
                <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                <p><strong>Email:</strong> {selectedOrder.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {selectedOrder.phone}</p>
                <p>
                  <strong>Shipping Address:</strong> 
                  <br />
                  {selectedOrder.address.split(',').map((line, index) => (
                    <span key={index} className="block pl-4">{line.trim()}</span>
                  ))}
                </p>

                <h3 className="font-semibold text-lg border-b pb-1 mt-4">Order Items ({orderItemsFormatted.length})</h3>
                <Table>
                  <TableBody>
                    {orderItemsFormatted.map((item: any, index: number) => {
                      
                      // ⭐ FINAL, ROBUST CHECK: Look in all possible places for the size data
                      const size = 
                        item.selectedSize || // Catches the data from the updated CheckoutPage
                        item.product?.selectedSize || 
                        item.option || 
                        item.size || 
                        item.variant || 
                        null;
                      
                      // Determine the product name
                      const productName = item.productName || item.product?.name || item.name || 'Unknown Product';
                      
                      return (
                        <TableRow key={index} className="hover:bg-muted/50">
                          
                          {/* 1. PRODUCT NAME AND SIZE CELL */}
                          <TableCell className="font-medium p-2 pr-4 w-auto">
                              {/* Display Product Name */}
                              {productName} 
                              
                              {/* Display the Size (only if available) or 'N/A' */}
                              <span className={`ml-3 text-xs ${size ? 'text-primary font-semibold p-1 rounded-sm border border-primary/50' : 'text-muted-foreground'}`}>
                                  Size: {size || 'N/A'}
                              </span>
                          </TableCell>
                          
                          {/* 2. Quantity Cell */}
                          <TableCell className="p-2 w-20 text-center">x{item.quantity}</TableCell>
                          
                          {/* 3. Total Price Cell for that item */}
                          <TableCell className="p-2 text-right w-24">
                            {/* Use item.price for direct items, or item.product.price for nested items */}
                            ₹{((item.price || item.product?.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                {/* Fallback/debug message if orderItemsFormatted has issues */}
                {orderItemsFormatted.length === 0 && selectedOrder.items && (
                     <p className='text-sm text-muted-foreground italic mt-2'>
                        Note: Could not parse items. Raw items data: {selectedOrder.items}
                    </p>
                )}


                <div className="text-right pt-4 border-t">
                    <p className="text-lg font-bold">Total: ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</p>
                    <Badge variant={getStatusColor(selectedOrder.status)} className="mt-2 text-sm">
                        Status: {selectedOrder.status}
                    </Badge>
                </div>
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-end p-4 -mb-4 -mx-4 border-t">
              {/* Delete button inside the panel */}
              {selectedOrder && (
                  <Button 
                      variant="destructive"
                      onClick={() => handleDeleteOrder(selectedOrder.id, selectedOrder.orderId)}
                  >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Order Permanently
                  </Button>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}