import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Product } from '@/lib/types'
import { Card, CardContent } from './ui/card'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
  const mainImage = Array.isArray(images) ? images[0] : images

  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="aspect-[3/4] overflow-hidden bg-muted">
            <motion.img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {product.category}
            </p>
            <h3 className="font-semibold mb-2 line-clamp-1">{product.name}</h3>
            <p className="text-lg font-bold">₹{product.price.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}
