const express = require('express')

const router = express.Router({mergeParams: true})

const reviewController = require('../controllers/reviews')

const { protect } = require('../middleware/auth')

router.use(protect)

router
  .route('/')
  .get(getAllReviews)
  .post(createReview)

router
  .route('/:id')
  .get(getReview)
  .delete(deleteReview)
  .patch(updateReview)

module.exports = router
