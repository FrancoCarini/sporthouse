const express = require('express')
const { restrictTo, protect } = require('../middleware/auth')
const Product = require('../models/Product')
const router = express.Router()

const productController = require('../controllers/products')
const advancedResults = require('../middleware/advancedResults')

router
  .route('/')
  .get(advancedResults(Product), productController.getAllProducts)
  .post(protect, restrictTo('admin'), productController.createProduct)

router.route('/:id/photo').put(protect, restrictTo('admin'), productController.productPhotoUpload)

module.exports = router
