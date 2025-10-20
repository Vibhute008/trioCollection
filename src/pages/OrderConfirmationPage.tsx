import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export function OrderConfirmationPage() {
  const location = useLocation()
  const { orderId, total } = location.state || {}

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card>
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            </motion.div>

            <h1 className="text-2xl md:text-3xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your purchase. Your order has been placed successfully.
            </p>

            {orderId && (
              <div className="bg-muted p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                <p className="font-mono font-bold text-lg">{orderId}</p>
                {total && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                    <p className="font-bold text-xl">₹{total.toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground mb-6">
              You will receive a confirmation email shortly with your order details.
            </p>

            <div className="space-y-3">
              <Link to="/shop" className="block">
                <Button size="lg" className="w-full">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/" className="block">
                <Button variant="outline" size="lg" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
