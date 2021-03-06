
const mongoose = require('mongoose')
const AppError = require('../utils/appError')
const Product = require('./Product')

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
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    },
  },
  {
    timestamps: true
  }
)

OrderSchema.pre('save', async function(next) {
  // Get products ids from JSON
  const orderProductsIds = this.items.map(item => item.product)

  // Find into DB all products with the ids
  const dbProducts = await this.model('Product').find({_id: { $in: orderProductsIds }})

  let totalPriceCents = 0
  let confirm = true
  const lastMessage = {}

  // Iterate over order items
  this.items.forEach(async item => {
    // Find into products array the product with id
    let product = dbProducts.find(p => p._id.toString() === item.product.toString())

    if (!product) {
      lastMessage.message = `No product with id ${item.product}`
      lastMessage.code = 422
      confirm = false
      return
    }

    // Filter inside variants with color and size
    let variant = product.variants.find(v => v.color === item.color && v.size === item.size)

    // Check if variant exists
    if (!variant) {
      lastMessage.message = `No product with color ${item.color} and size ${item.size}`
      lastMessage.code = 422
      confirm = false
      return
    }

    // Check variant stock
    if (item.quantity > variant.stock) {
      lastMessage.message = `No stock available`
      lastMessage.code = 422
      confirm = false
      return
    }
  })

  if (!confirm) {
    return next(new AppError(lastMessage.message, lastMessage.code))
  }

  for (const item of this.items) {
    const product = dbProducts.find(p => p._id.toString() === item.product.toString())

    // Complete product info
    item.image = product.image
    item.name = product.name
    item.priceCents = product.priceCents * item.quantity
    totalPriceCents += item.priceCents
      
    // Filter inside variants with color and size
    const variant = product.variants.find(v => v.color === item.color && v.size === item.size)

    // Substract stock to product
    variant.stock -= item.quantity  

    await product.save()
  }
  next()
})

OrderSchema.pre('findOneAndUpdate', async function(next) {
  const orderToUpdate = await this.model.findOne(this.getQuery());

  const orderProductsIds = orderToUpdate.items.map(item => item.product)

  // Find into DB all products with the ids
  const dbProducts = await Product.find({_id: { $in: orderProductsIds }})

  for (const item of orderToUpdate.items) {
    const product = dbProducts.find(p => p._id.toString() === item.product.toString())

    // Filter inside variants with color and size
    const variant = product.variants.find(v => v.color === item.color && v.size === item.size)

    // Substract stock to product
    variant.stock += item.quantity  

    await product.save()
  }
})

module.exports = mongoose.model('Order', OrderSchema)
