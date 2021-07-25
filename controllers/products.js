const fs = require('fs')
const path = require('path')
const asyncHandler = require('express-async-handler')
const Product = require('../models/Product')
const AppError = require('../utils/appError')
const { uploadFile } = require('../utils/cloudinary')

// @desc      Get all products
// @route     GET /api/v1/products
// @access    Public
exports.getAllProducts = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

// @desc      Create product
// @route     POST /api/v1/products
// @access    Private
exports.createProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  res
    .status(200)
    .json({
      status: 'success',
      data: product
    })
})

exports.editProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.create(req.body)

  res
    .status(201)
    .json({
      status: 'success',
      data: product
    })
})

// @desc      Upload photo for product
// @route     PUT /api/v1/products/:id/photo
// @access    Private
exports.productPhotoUpload = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if(!product) {
    return next(new AppError(`No product with id ${req.params.id}`, 404))
  }

  if (!req.files) {
    return next(new AppError(`Please upload a file`, 400))
  }

  const file = req.files.file

  //Validation
  //Check if is an image
  if (!file.mimetype.startsWith('image')) {
    return next(new AppError(`Please upload an image file`, 400))
  }

  //check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new AppError(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
  }

  //Create custom file name
  file.name = `${product._id}${path.parse(file.name).ext}`
  const filePath = `${process.env.FILE_UPLOAD_PATH}/${file.name}`

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      return next(new AppError(`Problem with file upload`, 500))
    }

    // Upload to S3
    const imageRes = await uploadFile(filePath, process.env.CLOUDINARY_PRODUCTS_PATH)
    if (imageRes.error) {
      return next(new AppError(`Problem with file upload`, 500))
    }

    // Remove file from localDir
    fs.unlinkSync(filePath)

    await Product.findByIdAndUpdate(req.params.id, {image: imageRes.secure_url})
    res.status(200).json({
      success: true,
      image: imageRes.secure_url
    })
  })
})

exports.getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug })
  
  res
    .status(200)
    .json({
      success: true,
      product
    })  
})

exports.getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
  
  res
    .status(200)
    .json({
      success: true,
      product
    })  
})

exports.search = asyncHandler(async (req, res, next) => {
  const searchParam = decodeURI(req.params.search)

  const products = await Product.find({ 
    $or: [ {name: { $regex: searchParam }}, {'brand.name': { $regex: searchParam }}  ]
  }).limit(5).select('name slug brand.name image')

  res
    .status(200)
    .json({
      success: true,
      products
    })  
})

exports.filters = asyncHandler(async (req, res, next) => {
  const products = res.advancedResults.data

  const filters = {
    'Category': new Set(),
    'Gender': new Set(),
    'Brand': new Set(),
    'Size': new Set()
  }

  products.forEach(product => {
    filters.Category.add(product.category.name)
    filters.Gender.add(product.gender)
    filters.Brand.add(product.brand.name)
    // Get sizes
    product.variants.map(variant => filters.Size.add(variant.size))
  })

  filters.Category = [...filters.Category]
  filters.Gender = [...filters.Gender]
  filters.Brand = [...filters.Brand]
  filters.Size = [...filters.Size]

  res
    .status(200)
    .json({
      success: true,
      filters
    })  
}) 