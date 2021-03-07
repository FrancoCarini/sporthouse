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

exports.updateBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    data: brand
  })
})

exports.getBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id)
  
  if(!brand) {
    return next(new ErrorResponse(`Brand Not Found with id of ${req.params.id}`, 404))
  }

  res.status(200).json({
    success: true,
    data: brand
  })
})
