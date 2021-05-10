const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
// const elasticsearch = require('elasticsearch')
const connectDB = require('./utils/db')

//Load env vars
dotenv.config({path: './config/config.env'})

//Load Models
const Brand = require('./models/Brand')
const Category = require('./models/Category')
const Order = require('./models/Order')
const Product = require('./models/Product')
const Review = require('./models/Review')
const Store = require('./models/Store')

//Connect to DB
connectDB()

// //Import into DB
const importData = async () => {
  //Read JSON files
  const brands = JSON.parse(fs.readFileSync(`${__dirname}/data/brands.json`), 'utf-8')
  const categories = JSON.parse(fs.readFileSync(`${__dirname}/data/categories.json`), 'utf-8')
  const stores = JSON.parse(fs.readFileSync(`${__dirname}/data/stores.json`), 'utf-8')
  const products = JSON.parse(fs.readFileSync(`${__dirname}/data/products.json`), 'utf-8')

  try {
    await Brand.create(brands)
    await Category.create(categories)
    await Product.create(products)
    await Store.create(stores)

    // Elastic Search insert products
    console.log('Data imported ...')
    process.exit()
  } catch (err) {
    console.error(err)
  }
}

//Delete Data
const deleteData = async () => {
  try {
    await Order.deleteMany()
    await Review.deleteMany()
    await Product.deleteMany()
    await Category.deleteMany()
    await Brand.deleteMany()
    await Store.deleteMany()
    console.log('Data destroyed ...')
    process.exit()
  } catch (err) {
    console.error(err)
  }
}

if(process.argv[2] === '-i') {
  importData()
} else if(process.argv[2] === '-d') {
  deleteData()
}
