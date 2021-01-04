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
