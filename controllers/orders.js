const asyncHandler = require('express-async-handler')
const Order = require('../models/Order')
const AppError = require('../utils/appError')

// @desc      Create order
// @route     POST /api/v1/orders
// @access    Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  req.body.user = req.user
  req.body.userId = req.user._id
  req.body.status = 'confirmed'

  const order = await Order.create(req.body)

  res
    .status(201)
    .json({
      status: 'success',
      data: order
    })
})

// @desc      Cancel order
// @route     DELETE /api/v1/orders
// @access    Private
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(req.params.id, {status: 'cancelled'}, {
    new: true
  })

  res.status(200).json({
    status: 'success',
    data: order
  })
})

exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate({
    path: 'storeId',
    select: 'address city'
  })

  if (!order) {
    return next(new AppError(`No order found with id ${req.params.id}`, 404))
  }

  if (req.user._id.toString() !== order.userId.toString()) {
    return next(new AppError(`Not allowed to access this order`, 401))
  }

  res.status(200).json({
    status: 'success',
    data: order
  })
})
