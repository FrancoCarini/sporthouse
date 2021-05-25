const express = require('express')
const router = express.Router()
const userController = require('../controllers/users')
const { protect, restrictTo } = require('../middleware/auth')

router.post('/signup', userController.signup)
router.post('/login', userController.login)
router.post('/forgotPassword', userController.forgotPassword)
router.patch('/resetPassword/:token', userController.resetPassword)

router.use(protect)

router.patch('/updatePassword', userController.updatePassword)
router.get('/me', userController.me)

router.use(restrictTo('admin'))

// router.get('/', getAllUsers)

// router
//   .route('/:id')
//   .get(getUser)
//   .delete(deleteUser)
//   .patch(updateUser)
  
module.exports = router
