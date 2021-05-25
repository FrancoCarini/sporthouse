
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
    items: {
      type: [
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
      validate: {
        validator: function(v) {
          return Array.isArray(v) && v.length > 0
        },
        message: 'Please provide items array'
      }
    },
    totalPriceCents: Number,
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    },
    storeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Store',
      required: [true, 'Please provide the store']
    }
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

  let totalPriceCents = 0
  for (const item of this.items) {
    const product = dbProducts.find(p => p._id.toString() === item.product.toString())

    // Complete product info
    item.image = product.image
    item.name = product.name
    item.slug = product.slug
    item.priceCents = product.priceCents * item.quantity
    totalPriceCents += item.priceCents
      
    // Filter inside variants with color and size
    const variant = product.variants.find(v => v.color === item.color && v.size === item.size)

    // Substract stock to product
    variant.stock -= item.quantity  

    await product.save()
  }
  
  this.totalPriceCents = totalPriceCents
  next()
})

OrderSchema.pre('findOneAndUpdate', async function(next) {
  const orderToUpdate = await this.model.findOne(this.getQuery());

  // Check if the order is already in cancelled status
  if (!orderToUpdate) {
    return next(new AppError(`No order with id ${this.getFilter()._id}`, 422))
  }

  // Check if the order is already in cancelled status
  if (orderToUpdate.status === 'cancelled') {
    return next(new AppError(`Order ${orderToUpdate._id} is already cancelled`, 422))
  }

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
  next()
})

module.exports = mongoose.model('Order', OrderSchema)
