const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema(
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

CategorySchema.index({name: 1})

module.exports = mongoose.model('Category', CategorySchema)
