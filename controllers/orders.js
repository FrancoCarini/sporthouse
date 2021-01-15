const asyncHandler = require('express-async-handler')
const Order = require('../models/Order')
const AppError = require('../utils/appError')

// @desc      Create order
// @route     POST /api/v1/orders
// @access    Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  req.body.user = req.user
  req.body.userId = req.user._id
  const order = await Order.create(req.body)

  res
    .status(201)
    .json({
      status: 'success',
      data: order
    })
})
