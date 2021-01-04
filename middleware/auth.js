const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const AppError = require('../utils/appError')
const User = require('../models/User')


exports.protect = asyncHandler(async (req, res, next) => {
  // Check if token exists
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return next(new AppError('Your are not logged in. Please login to get access', 401))
  }

  // Verify Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  // Check if user exists
  const user = await User.findById(decoded.id)

  if (!user) {
    return next(new AppError('User does not exists'), 401)
  }

  // Check if user changes password after the token was issued
  if (user.changePasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password. Please login again.', 401))
  }

  // Grant access to protected route
  res.locals.user = user
  req.user = user
  next()
})

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an Array EX: ['admin', 'salesman', 'manager']
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You dont have permission to perform this action', 403))
    }
    next()
  }
}
