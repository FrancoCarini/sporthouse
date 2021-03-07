const asyncHandler = require('express-async-handler')
const Category = require('../models/Category')

// @desc      Get all categories
// @route     GET /api/v1/categories
// @access    Public
exports.getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find()

  res.status(200).json({
    success: true,
    data: categories
  })
})

// @desc      Create a category
// @route     POST /api/v1/categories
// @access    Private
exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body)

  res
    .status(201)
    .json({
      status: 'success',
      data: category
    })
})

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    data: category
  })
})

exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id)
  
  if(!category) {
    return next(new ErrorResponse(`Category Not Found with id of ${req.params.id}`, 404))
  }

  res.status(200).json({
    success: true,
    data: category
  })
})
