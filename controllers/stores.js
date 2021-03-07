const asyncHandler = require('express-async-handler')
const Store = require('../models/Store')
const NodeGeocoder = require('node-geocoder')

exports.createStore = asyncHandler(async (req, res, next) => {
  const store = await Store.create(req.body)  

  res.status(200).json({
    status: 'success',
    data: store
  })
})

exports.getStores = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults)
})

exports.getStore = asyncHandler(async (req, res, next) => {
  const store = await Store.findById(req.params.id)
  if(!store) {
    return next(new ErrorResponse(`Store Not Found with id of ${req.params.id}`, 404))
  }
  res.status(200).json({
    success: true,
    data: store
  })
})

exports.deleteStore = asyncHandler(async (req, res, next) => {
  const store = await Store.findById(req.params.id)

  if(!store) {
    return next(new ErrorResponse(`Store Not Found with id of ${req.params.id}`, 404))
  }

  //Make sure if user is the owner
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this store`, 401))
  }

  store.remove()

  res.status(200).json({success: true, data: store})
})

exports.updateStore = asyncHandler(async (req, res, next) => {
  let store = await Store.findById(req.params.id)

  if(!store) {
    return next(new ErrorResponse(`Store Not Found with id of ${req.params.id}`, 404))
  }

  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this store`, 401))
  }

  store = await Store.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  res.status(200).json({
    success: true,
    data: store
  })
})

exports.getStoresInRadius = asyncHandler(async (req, res, next) => {
  const {address, distance} = req.params

  // Get lat/lang from geocoder
  const geocoder = NodeGeocoder({
    provider: process.env.GEOCODER_PROVIDER,
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
  })

  const loc = await geocoder.geocode(address)
  const lat = loc[0].latitude
  const lng = loc[0].longitude

  // Calc radius using radians
  // Divide distance by radius Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 6378

  const stores = await Store.find({
    location: {
      $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] }
    }
  })

  res.status(200).json({
    success: true,
    count: stores.length,
    data: stores
  })
})
