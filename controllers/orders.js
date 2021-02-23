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
  const order = await Order.findById(req.params.id)

  order.status = 'cancelled'
  order.save()
  
  res
    .status(200)
    .json({
      status: 'success',
      data: order
    })
})
