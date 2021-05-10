const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const connectDB = require('./utils/db')
const AppError =  require('./utils/appError')
const errorHandler = require('./middleware/errors')
const fileupload = require('express-fileupload')


const userRouter = require('./routes/users')
const categoryRouter = require('./routes/categories')
const brandRouter = require('./routes/brands')
const productRouter = require('./routes/products')
const orderRouter = require('./routes/orders')
const reviewRouter = require('./routes/reviews')
const storesRouter = require('./routes/stores')

// Dotenv Config
dotenv.config({path: './config/config.env'})

// Express init
const app = express()

// Body Parser
app.use(express.json({limit: '10kb'}))

// DB Connect
connectDB()

//File Upload
app.use(fileupload())

// Mount routes
app.use('/api/v1/users', userRouter)
app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/brands', brandRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/orders', orderRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/stores', storesRouter)

// Not Found Route
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404))
})

app.use(errorHandler)

// Launch Server
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message)
  console.log('UNHANDLED REJECTION! Shutting down ...')
  server.close(() => {
    process.exit(1)
  })
})
