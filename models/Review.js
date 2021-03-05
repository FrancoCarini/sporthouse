const mongoose = require('mongoose')
const Product = require('./Product')

const ReviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review can not be empty.']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Review must belong to a product']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must belong to a user']
  }
},
{
  timestamps: true
})

ReviewSchema.index({ product: 1, user: 1 }, { unique: true })

//Static method to avg rating and save
ReviewSchema.statics.calcAvgRating = async function(productId) {
  const obj = await this.aggregate([
    {
      $match: {product: productId}
    },
    {
      $group: {
        _id: '$product',
        ratingsAverage: {$avg: '$rating'},
        ratingsQuantity: {$sum: 1}
      }
    }
  ])

  try {
    await this.model('Product').findByIdAndUpdate(productId, {
      ratingsAverage : obj[0].ratingsAverage,
      ratingsQuantity : obj[0].ratingsQuantity
    })
  } catch (err) {
    console.log(err)
  }
}

//Call getAverageCost after save
ReviewSchema.post('save', function() {
  this.constructor.calcAvgRating(this.product)
})

//Call getAverageCost before remove
ReviewSchema.pre('remove', function() {
  this.constructor.calcAvgRating(this.product)
})

module.exports = mongoose.model('Review', ReviewSchema)
