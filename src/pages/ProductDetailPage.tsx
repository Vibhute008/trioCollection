import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { blink } from '@/blink/client'
import { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { addToCart } from '@/lib/cart-utils' // Assumed import
import { toast } from 'sonner'
import { ArrowLeft, ShoppingCart } from 'lucide-react'

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const products = await blink.db.products.list({ where: { id } })
      if (products.length > 0) {
        setProduct(products[0])
      }
    } catch (error) {
      console.error('Failed to load product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    
    const sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes
    if (Array.isArray(sizes) && sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size')
      return
    }

    // ⭐ KEY CHANGE: Passing selectedSize to the cart utility
    addToCart(product, quantity, selectedSize)
    
    window.dispatchEvent(new Event('cartUpdated'))
    toast.success('Added to cart!', {
      description: `${product.name} (${quantity}x${selectedSize ? ', Size: ' + selectedSize : ''}) added to your cart`
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <p className="text-muted-foreground mb-4">Product not found</p>
        <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
      </div>
    )
  }

  const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
  const imageArray = Array.isArray(images) ? images : [images]
  const sizes = typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes
  const sizeArray = Array.isArray(sizes) ? sizes : []

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate('/shop')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Shop
      </Button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="sticky top-20">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
              <img
                src={imageArray[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {imageArray.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {imageArray.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div>
            <Badge variant="secondary" className="mb-3">{product.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-3xl font-bold">₹{product.price.toLocaleString('en-IN')}</p>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {/* Size Selection */}
          {sizeArray.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-3 block">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {sizeArray.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? 'default' : 'outline'}
                    onClick={() => setSelectedSize(size)}
                    className="min-w-[60px]"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium mb-3 block">Quantity</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Add to Cart */}
          <Button
            size="lg"
            onClick={handleAddToCart}
            className="w-full text-base"
            disabled={!Number(product.inStock)}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {Number(product.inStock) ? 'Add to Cart' : 'Out of Stock'}
          </Button>

          {/* Stock Status */}
          <div className="text-sm text-muted-foreground">
            {Number(product.inStock) ? (
              <span className="text-green-600 font-medium">✓ In Stock</span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}