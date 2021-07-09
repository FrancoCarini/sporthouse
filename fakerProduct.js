const faker = require('faker')
const fs = require('fs')
const dotenv = require('dotenv')

//Load env vars
dotenv.config({path: './config/config.env'})

// Remove Previous file
if (fs.existsSync('./data/products.json')) {
  fs.unlinkSync('./data/products.json')
}

const usedNames = []
const shoes = []

const brands = JSON.parse(fs.readFileSync(`${__dirname}/data/brands.json`), 'utf-8')
const categories = JSON.parse(fs.readFileSync(`${__dirname}/data/categories.json`), 'utf-8')

const brandIds = brands.map(brand => brand._id)
const shoesCategory = categories.filter(cat => cat.name === 'Shoes')[0]
const prices = [10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000]
const seasons = [2019, 2020, 2021]
const gender = ['male', 'female']


// Mens Nike Shoes
for (let i = 0; i < 50; i++) {
  const productName = faker.name.findName()

  if (usedNames.includes(productName)) {
    continue;
  }

  usedNames.push(productName)

  const genderAux = gender[Math.floor(Math.random() * gender.length)]
  
  let variant = []
  if (genderAux === 'male') {
    variant = [
      {
        "size": "38",
        "color": "black",
        "stock": 100
      },
      {
        "size": "39",
        "color": "black",
        "stock": 100
      },
      {
        "size": "40",
        "color": "black",
        "stock": 100
      },
      {
        "size": "41",
        "color": "black",
        "stock": 100
      },
      {
        "size": "42",
        "color": "black",
        "stock": 100
      },
      {
        "size": "43",
        "color": "black",
        "stock": 100
      },
      {
        "size": "38",
        "color": "white",
        "stock": 100
      },
      {
        "size": "39",
        "color": "white",
        "stock": 100
      },
      {
        "size": "40",
        "color": "white",
        "stock": 100
      },
      {
        "size": "41",
        "color": "white",
        "stock": 100
      },
      {
        "size": "42",
        "color": "white",
        "stock": 100
      },
      {
        "size": "43",
        "color": "white",
        "stock": 100
      }
    ]
  } else {
    variant = variant = [
      {
        "size": "34",
        "color": "black",
        "stock": 100
      },
      {
        "size": "35",
        "color": "black",
        "stock": 100
      },
      {
        "size": "36",
        "color": "black",
        "stock": 100
      },
      {
        "size": "37",
        "color": "black",
        "stock": 100
      },
      {
        "size": "38",
        "color": "black",
        "stock": 100
      },
      {
        "size": "39",
        "color": "black",
        "stock": 100
      },
      {
        "size": "34",
        "color": "white",
        "stock": 100
      },
      {
        "size": "35",
        "color": "white",
        "stock": 100
      },
      {
        "size": "36",
        "color": "white",
        "stock": 100
      },
      {
        "size": "37",
        "color": "white",
        "stock": 100
      },
      {
        "size": "38",
        "color": "white",
        "stock": 100
      },
      {
        "size": "39",
        "color": "white",
        "stock": 100
      }
    ]
  }


  shoes.push({
    "name": productName,
    "description": faker.lorem.sentences(),
    "brandId": brandIds[Math.floor(Math.random() * brandIds.length)],
    "categoryId": shoesCategory._id,
    "category": shoesCategory,
    "gender": gender[Math.floor(Math.random() * gender.length)],
    "priceCents": prices[Math.floor(Math.random() * prices.length)],
    "season": seasons[Math.floor(Math.random() * seasons.length)],
    "sku": faker.random.uuid(),
    "variants": variant
  })
}

fs.writeFileSync('./data/products.json', JSON.stringify(shoes))
