const express = require('express')
const { restrictTo, protect } = require('../middleware/auth')
const router = express.Router()


const brandController = require('../controllers/brands')

router
  .route('/')
  .get(brandController.getAllBrands)
  .post(protect, restrictTo('admin'), brandController.createBrand)

router
  .route('/:id')
  .get(brandController.getBrand)
  .put(protect, restrictTo('admin'), brandController.updateBrand)

  module.exports = router
