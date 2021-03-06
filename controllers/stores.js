const asyncHandler = require('express-async-handler')
const Store = require('../models/Store')

exports.createStore = asyncHandler(async (req, res, next) => {
  const store = await Store.create(req.body)  

  res.status(200).json({
    status: 'success',
    data: store
  })
})

exports.getStore = asyncHandler(async (req, res, next) => {

})

exports.deleteStore = asyncHandler(async (req, res, next) => {

})

exports.updateStore = asyncHandler(async (req, res, next) => {

})
