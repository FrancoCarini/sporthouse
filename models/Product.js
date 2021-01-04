const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  brandId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Brand',
    required: [true, 'Brand is required']
  },
  brand: {
    _id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Brand'
    },
    name: String
  },
  categoryId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category'
  },
  category: {
    _id: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category'
    },
    name: String
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['male', 'female'],
      message: 'Gender must be: male, female'
    },
    default: 'male'
  },
  priceCents: {
    type: Number,
    required: [true, 'Price is required'],
    set: val => val * 100
  },
  season: {
    type: Number,
    required: [true, 'Season is required'],
    min: [new Date().getFullYear() - 3, `Season must be higher than ${new Date().getFullYear() - 3}`],
    max: [new Date().getFullYear() + 1, `Season must be lower than ${new Date().getFullYear() + 1}`],
  },
  image: {
    type: String,
    default: 'no-image.jpg'
  },
  sku: {
    type: String,
    required: [true, 'Sku is required']
  },
  variants: {
    type: [{
      size: {
        type: String,
        required: [true, 'Size is required']
      },
      color: {
        type: String,
        required: [true, 'Color is required']
      },
      stock: {
        type: Number,
        required: [true, 'Stock is required']
      }
    }],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0
      },
      message: 'Please provide variants array'
    }
  }
})

ProductSchema.index({name: 1})

ProductSchema.pre('save', async function(next) {
  if (this.isModified('categoryId')) {
    this.category =  await this.model('Category').findById(this.categoryId)
  }

  if (this.isModified('brandId')) {
    this.brand =  await this.model('Brand').findById(this.brandId)
  }
  next()
})

module.exports = mongoose.model('Product', ProductSchema)
