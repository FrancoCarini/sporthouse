const express = require('express')
const { restrictTo, protect } = require('../middleware/auth')
const router = express.Router()


const brandController = require('../controllers/brands')

router
  .route('/')
  .get(brandController.getAllBrands)
  .post(protect, restrictTo('admin'), brandController.createBrand)

module.exports = router
