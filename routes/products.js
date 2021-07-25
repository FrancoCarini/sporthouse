const express = require('express')
const { restrictTo, protect } = require('../middleware/auth')
const Product = require('../models/Product')

// Include other resource routers
const reviewRouter = require('./reviews')

const router = express.Router()

// Re route to review router
router.use('/:productId/reviews', reviewRouter)

const productController = require('../controllers/products')
const advancedResults = require('../middleware/advancedResults')

router
  .route('/')
  .get(advancedResults(Product, null, true), productController.getAllProducts)
  .post(protect, restrictTo('admin'), productController.createProduct)

router
  .route('/:id([0-9]{1}[0-9A-Za-z]+)')
  .get((protect, restrictTo('admin'), productController.getProductById))
  .put((protect, restrictTo('admin'), productController.editProduct))

router
  .route('/slug/:slug').get(productController.getProductBySlug)

router
  .route('/search/:search').get(productController.search)

router
  .route('/filters').get(advancedResults(Product, null, false), productController.filters)

router.route('/:id/photo').put(protect, restrictTo('admin'), productController.productPhotoUpload)

module.exports = router
