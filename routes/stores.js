const express = require('express')
const { protect, restrictTo } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')
const Store = require('../models/Store')
const router = express.Router()

const storesController = require('../controllers/stores')

router
  .route('/')
  .get(advancedResults(Store), storesController.getStores)
  .post(protect, restrictTo('admin'), storesController.createStore)

router
  .route('/:id')
  .get(storesController.getStore)
  .delete(protect, restrictTo('admin'), storesController.deleteStore)
  .put(protect, restrictTo('admin'), storesController.updateStore)

router.route('/radius/:address/:distance').get(storesController.getStoresInRadius)
module.exports = router
