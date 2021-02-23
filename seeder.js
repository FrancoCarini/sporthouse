const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const elasticsearch = require('elasticsearch')

//Load env vars
dotenv.config({path: './config/config.env'})

//Load Models
const Brand = require('./models/Brand')
const Category = require('./models/Category')
const Order = require('./models/Order')
const Product = require('./models/Product')
const Review = require('./models/Review')

//Connect to DB
mongoose.connect(process.env.DATABASE, { 
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB'))

// Elastic search connect
const elasticClient = new elasticsearch.Client({
  host: 'localhost:9200'
});

// elasticClient.index({  
//   index: 'products',
//   body: {
//     "nombre": "Marcos",
//     "apellido": "Nestor",
//     "edad": 50,
//     "pais": "Argentina",
//     "sexo": "Hombre"
//   }
// },function(err,resp,status) {
//     console.log(resp);
// });

//Import into DB
const importData = async () => {
  //Read JSON files
  // const brands = JSON.parse(fs.readFileSync(`${__dirname}/data/brands.json`), 'utf-8')
  // const categories = JSON.parse(fs.readFileSync(`${__dirname}/data/categories.json`), 'utf-8')
  const products = JSON.parse(fs.readFileSync(`${__dirname}/data/products.json`), 'utf-8')

  products.forEach(product => {
    console.log('entro')
    elasticClient.index({   
      index: 'products',
      body: {product}
    } ,function(err,resp,status) {
        console.log(resp);
    });
  })
  

  // try {
  //   // await Brand.create(brands)
  //   // await Category.create(categories)
  //   // await Product.create(products)

  //   // Elastic Search insert products
  //   console.log('Data imported ...')
  //   process.exit()
  // } catch (err) {
  //   console.error(err)
  // }
}

//Delete Data
const deleteData = async () => {
  try {
    // await Order.deleteMany()
    // await Review.deleteMany()
    await Product.deleteMany()
    // await Category.deleteMany()
    // await Brand.deleteMany()
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
