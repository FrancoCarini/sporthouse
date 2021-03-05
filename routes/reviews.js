const express = require('express')
const reviewController = require('../controllers/reviews')

const Review = require('../models/Review')
const advancedResults = require('../middleware/advancedResults')

const router = express.Router({mergeParams: true})

//Protect Middleware
const { protect, restrictTo } = require('../middleware/auth')

router
  .route('/')
  .get(advancedResults(Review, {
    path: 'product',
    select: 'name brand'
  }), reviewController.getReviews)
  .post(protect, restrictTo('user'), reviewController.addReview)

router.route('/:id')
.get(reviewController.getReview)
.put(protect, restrictTo('user'), reviewController.updateReview)
.delete(protect, restrictTo('user'), reviewController.deleteReview)

module.exports = router
