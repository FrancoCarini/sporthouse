const Review = require('../models/Review')

exports.createReview = factory.createOne(Review)

exports.getAllReviews = factory.getAll(Review)

exports.getReview = factory.getOne(Review)

exports.deleteReview = factory.deleteOne(Review)

exports.updateReview = factory.updateOne(Review)
