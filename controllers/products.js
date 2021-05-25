const fs = require('fs')
const path = require('path')
const asyncHandler = require('express-async-handler')
const Product = require('../models/Product')
const AppError = require('../utils/appError')
const s3 = require('../utils/s3')
const elasticsearch = require('elasticsearch')

// Elastic Search connect
const elasticClient = new elasticsearch.Client({
  host: 'localhost:9200'
});

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
  const product = await Product.create(req.body)

  // Guardar ID de mongo abajo
  // levehnstein distance

  elasticClient.index({
    index: 'products',
    body: req.body
  })

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
    s3.uploadFile(filePath)
    
    // Remove file from localDir
    fs.unlinkSync(filePath)

    await Product.findByIdAndUpdate(req.params.id, {image: file.name})
    res.status(200).json({
      success: true,
      data: file.name
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
