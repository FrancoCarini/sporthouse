const asyncHandler = require('express-async-handler')
const Review = require('../models/Review')
const Product = require('../models/Product')
const AppError = require('../utils/appError')
const Order = require('../models/Order')


// @desc      Get Reviews
// @route     GET /api/v1/reviews
// @route     GET /api/v1/products/:productId/reviews
// @access    Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.productId) {
    const reviews = await Review.find({product: req.params.productId})
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    })
  } else {
    res.status(200).json(res.advancedResults)
  }
})

// @desc      Get a review
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review =  await Review.findById(req.params.id).populate({
    path: 'product',
    select: 'name brand'
  })

  if (!review) {
    return next(new AppError(`No review found with id ${req.params.id}`, 404))
  }

  res.status(200).json({
    success: true,
    data: review
  })
})

// @desc      Add review
// @route     POST /api/v1/products/:productId/reviews
// @access    Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.product = req.params.productId
  req.body.user = req.user.id

  const product = await Product.findById(req.params.productId)

  if (!product) {
    return next(new AppError(`No product found with id ${req.params.productId}`, 404))
  }

  const order = await Order.find({ "items.product": req.params.productId, userId:  req.user.id})

  if (!order.length) {
    return next(new AppError(`User can't create review since never bought the product`, 401))
  }

  const review = await Review.create(req.body)

  res.status(201).json({
    success: true,
    data: review
  })
})

// @desc      Update review
// @route     PUT /api/v1/reviews/:id
// @access    Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id)

  if (!review) {
    return next(new AppError(`No review found with id ${req.params.id}`, 404))
  }

  // Make sure review belongs to user
  if (review.user.toString() !== req.user.id) {
    return next(new AppError(`This review does not belong to user`, 401))
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    data: review
  })
})

// @desc      Delete review
// @route     DELETE /api/v1/reviews/:id
// @access    Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)

  if (!review) {
    return next(new AppError(`No review found with id ${req.params.id}`, 404))
  }

  // Make sure review belongs to user
  if (review.user.toString() !== req.user.id) {
    return next(new AppError(`This review does not belong to user`, 401))
  }

  await review.remove()

  res.status(200).json({
    success: true,
    data: {}
  })
})


exports.pendingReviews = asyncHandler(async (req, res, next) => {
  const products = await Order.aggregate([
    {
      $unwind: '$items'
    },
    {
      $match: {
        userId: req.user._id,
        status: 'handed'
      }
    },
    {
      $group: {
        _id:  "$items.product",
        name: { $first : "$items.name" },
        image: { $first : "$items.image" }
      }
    },
    { 
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "product",
        as: "review"
      }
    },
    {
      $match: {
        review: {$size: 0}
      }
    }
  ])

  res.status(200).json({
    success: true,
    data: {
      products
    }
  })
})