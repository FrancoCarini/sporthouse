const asyncHandler = require('express-async-handler')
const Brand = require('../models/Brand')

// @desc      Get all brands
// @route     GET /api/v1/brands
// @access    Public
exports.getAllBrands = asyncHandler(async (req, res, next) => {
  const brands = await Brand.find()

  res.status(200).json({
    success: true,
    data: brands
  })
})

// @desc      Create a brand
// @route     POST /api/v1/brands
// @access    Private
exports.createBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.create(req.body)

  res
    .status(201)
    .json({
      status: 'success',
      data: brand
    })
})
