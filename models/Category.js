const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  }
})

CategorySchema.index({name: 1})

module.exports = mongoose.model('Category', CategorySchema)
