const mongoose = require('mongoose')
const AppError = require('../utils/appError')

const OrderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    user: {
      _id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      name: String
    },
    items: [
      {
        name: { type: String},
        quantity: { type: Number, required: true },
        color: { type: String, required: true },
        size: { type: String, required: true },
        image: { type: String},
        priceCents: { type: Number},
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product'
        },
      },
    ],
    totalPriceCents: Number,
    status: {
      type: String,
      enum: ['cart', 'confirmed', 'cancelled'],
      default: 'cart'
    }
  }
)

OrderSchema.pre('save', async function(next) {
  if (this.status === 'confirmed') {
    // Get products ids from JSON
    const orderProductsIds = this.items.map(item => item.product)

    // Find into DB all products with the ids
    const dbProducts = await this.model('Product').find({_id: { $in: orderProductsIds }})

    this.totalPriceCents = 0

    // Iterate over order items
    this.items.forEach(async item => {
        // Find into products array the product with id
        const product = dbProducts.find(p => p._id.toString() === item.product.toString())

        if (!product) {
          return next(new AppError(`No product with id ${item.product}`, 422))
        }

        // Filter inside variants with color and size
        const variant = product.variants.find(v => v.color === item.color && v.size === item.size)

        // Check if variant exists
        if (!variant) {
          return next(new AppError(`No product with color ${item.color} and size ${item.size}`, 422))
        }

        // Check variant stock
        if (item.quantity > variant.stock) {
          return next(new AppError(`No stock available`, 422))
        }
      
        // Complete product info
        item.image = product.image
        item.name = product.name
        item.priceCents = product.priceCents * item.quantity
        this.totalPriceCents += item.priceCents
      
        // Substract stock to product
        variant.stock -= item.quantity  
        await product.save()
    })
  } else if (this.status === 'cancelled') {
    // Sum stock to product

  }
  next()
})

module.exports = mongoose.model('Order', OrderSchema)
