const mongoose = require('mongoose')

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    deletedAt: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
)

BrandSchema.index({name: 1})

module.exports = mongoose.model('Brand', BrandSchema)
