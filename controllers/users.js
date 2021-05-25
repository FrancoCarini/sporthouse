const asyncHandler = require('express-async-handler')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const AppError = require('../utils/appError')
const Email = require('../utils/email')
const Order = require('../models/Order')

// Generate token
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRES_IN
  })
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  // Since user is returned set password undefined in user object
  user.password = undefined

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  // In production mode add secure field to true
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

  res.cookie('jwt', token, cookieOptions)

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user
    }
  })  
}

// @desc      Add user
// @route     POST /api/v1/users/signup
// @access    Public
exports.signup = asyncHandler(async (req, res, next) => {
  const {name, email, password, passwordConfirm} = req.body

  // Create user in DB
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm
  })

  // Welcome Email
  const url = `${req.protocol}://${req.get('host')}/me`
  await new Email(newUser, url).sendWelcome()

  // Generate JWT Token and send
  createSendToken(newUser, 201, res)
})

// @desc      Login user
// @route     POST /api/v1/users/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const {email, password} = req.body

  // Check if email and password are in request
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400))
  }

  // Check if exists user with that email
  const user = await User.findOne({email}).select('+password')
  if (!user) return next(new AppError('Incorrect email or passowrd', 401))

  // Check if password match
  const isCorrectPassword = await user.correctPassword(password, user.password)
  if (!isCorrectPassword) return next(new AppError('Incorrect email or passowrd', 401))

  createSendToken(user, 200, res)
})

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // Find User
  const user = await User.findOne({email: req.body.email})
  if (!user) return next(new AppError('User does not exists', 404))

  // Generate random token
  const resetToken = user.createPasswordResetToken()

  // Save User after generating reset token
  await user.save({
    validateBeforeSave: false
  })

  // Send it as an email
  try {
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
    await new Email(user, resetUrl).sendResetPassword()
    
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    })
  } catch (err) {
    // Since we have an error we need to go back changes
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({
      validateBeforeSave: false
    })
    return next(new AppError('There was an error sending the email. Try again!', 500))
  }
})

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get user based on token
  const hashedToken = crypto.createHash('sha256')
  .update(req.params.token)
  .digest('hex')

  // If token has not expired and theres a user set new password
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {$gte: Date.now()}
  })

  if (!user) {
    return next(new AppError('No user with that token or token has expired', 400))
  }

  // Update changedPassword Property for the current user
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  // Log the user in
  createSendToken(user, 200, res)
})

exports.updatePassword = asyncHandler(async (req, res, next) => {
  // Get the user id from req, but we need password
  const user = await User.findById(req.user.id).select('+password')

  if (!user) {
    return next(new AppError('No user', 400)) 
  }

  // Check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401)) 
  }

  // Update password
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()

  // Log user in
  createSendToken(user, 200, res)
})

exports.me = asyncHandler(async (req, res, next) => {
  // Get client orders
  const orders = await Order.find({ userId: req.user._id })

  res.status(200).json({
    success: true,
    user: req.user,
    orders
  })    
})
