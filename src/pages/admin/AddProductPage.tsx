import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { blink } from '@/blink/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, X, Upload } from 'lucide-react'

export function AddProductPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Shirts',
    price: '',
    sizes: ['S', 'M', 'L', 'XL'],
    description: '',
    inStock: true
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const categories = ['Shirts', 'T-Shirts', 'Jackets', 'Jeans', 'Trousers', 'Accessories']
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    if (files.length + imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed')
      e.target.value = '' // Reset input
      return
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const invalidFiles = files.filter(f => !validTypes.includes(f.type))
    
    if (invalidFiles.length > 0) {
      toast.error('Only image files (JPG, PNG, WebP, GIF) are allowed')
      e.target.value = '' // Reset input
      return
    }

    // Validate file size (max 10MB per file)
    const largeFiles = files.filter(f => f.size > 10 * 1024 * 1024)
    if (largeFiles.length > 0) {
      toast.error('Each image must be less than 10MB')
      e.target.value = '' // Reset input
      return
    }

    setImageFiles(prev => [...prev, ...files])
    
    // Generate previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.onerror = () => {
        toast.error(`Failed to read file: ${file.name}`)
      }
      reader.readAsDataURL(file)
    })
    
    // Reset input so the same file can be selected again if needed
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const toggleSize = (size: string) => {
    if (formData.sizes.includes(size)) {
      setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size) })
    } else {
      setFormData({ ...formData, sizes: [...formData.sizes, size] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    if (imageFiles.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    try {
      setLoading(true)
      setUploadingImages(true)

      // Upload images
      const imageUrls: string[] = []
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const extension = file.name.split('.').pop() || 'jpg'
        const fileName = `products/${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.${extension}`
        
        try {
          const result = await blink.storage.upload(
            file,
            fileName,
            { upsert: true }
          )
          
          if (result && result.publicUrl) {
            imageUrls.push(result.publicUrl)
          } else {
            throw new Error('Upload failed - no URL returned')
          }
        } catch (uploadError) {
          console.error(`Failed to upload image ${i + 1}:`, uploadError)
          throw new Error(`Failed to upload image ${i + 1}: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
        }
      }
      
      if (imageUrls.length === 0) {
        throw new Error('No images were uploaded successfully')
      }

      setUploadingImages(false)

      // Create product
      await blink.db.products.create({
        id: `product_${Date.now()}`,
        name: formData.name,
        category: formData.category,
        price: parseInt(formData.price),
        sizes: JSON.stringify(formData.sizes),
        description: formData.description,
        images: JSON.stringify(imageUrls),
        inStock: formData.inStock ? 1 : 0
      })

      toast.success('Product added successfully!')
      navigate('/admin/dashboard')
    } catch (error) {
      console.error('Failed to add product:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add product'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setUploadingImages(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="Men's Denim Shirt"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="1299"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-2">
                  <Label>Available Sizes *</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => (
                      <Button
                        key={size}
                        type="button"
                        variant={formData.sizes.includes(size) ? 'default' : 'outline'}
                        onClick={() => toggleSize(size)}
                        className="min-w-[60px]"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Stylish denim shirt with button-down collar..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <Label>Product Images * (Up to 5 images)</Label>
                  
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {imageFiles.length >= 5 ? 'Maximum 5 images reached' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      PNG, JPG, WebP up to 10MB
                    </p>
                    <Input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                      disabled={imageFiles.length >= 5}
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer inline-block">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        disabled={imageFiles.length >= 5}
                        className="pointer-events-none"
                      >
                        Choose Files ({imageFiles.length}/5)
                      </Button>
                    </Label>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="inStock" className="cursor-pointer">In Stock</Label>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {uploadingImages ? 'Uploading Images...' : loading ? 'Adding Product...' : 'Add Product'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
