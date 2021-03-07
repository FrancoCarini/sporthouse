const express = require('express')
const { restrictTo, protect } = require('../middleware/auth')
const router = express.Router()


const categoryController = require('../controllers/categories')

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(protect, restrictTo('admin'), categoryController.createCategory)

router
  .route('/:id')
  .get(categoryController.getCategory)
  .put(protect, restrictTo('admin'), categoryController.updateCategory)

module.exports = router
