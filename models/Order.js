const mongoose = require('mongoose')

const OrderSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
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
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        priceCents: { type: Number, required: true },
        product: {
          type: mongoose.Schema.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    totalPriceCents: Number
  }
)

module.exports = mongoose.model('Order', OrderSchema)
