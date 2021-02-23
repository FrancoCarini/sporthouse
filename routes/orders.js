const express = require('express')
const { protect } = require('../middleware/auth')
const router = express.Router()

const orderController = require('../controllers/orders')

router
  .route('/')
  .post(protect, orderController.createOrder)

router
  .route('/:id')
  .delete(orderController.cancelOrder)

module.exports = router
