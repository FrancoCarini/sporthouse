const express = require('express')
const { protect, restrictTo } = require('../middleware/auth')
const router = express.Router()

const storesController = require('../controllers/stores')

router
  .route('/')
  // .get(advancedResults(Bootcamp, 'courses'), storeController.getStores)
  .post(protect, restrictTo('admin'), storesController.createStore)

router
  .route('/:id')
  .get(storesController.getStore)
  .delete(protect, restrictTo('admin'), storesController.deleteStore)
  .put(protect, restrictTo('admin'), storesController.updateStore)

module.exports = router
