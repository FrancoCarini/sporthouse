const express = require('express')
const { protect } = require('../middleware/auth')
const router = express.Router()

const orderController = require('../controllers/orders')

router
  .route('/')
  .post(protect, orderController.createOrder)

router
  .route('/:id')
  .get(protect, orderController.getOrder)
  .delete(protect, orderController.cancelOrder)

module.exports = router
