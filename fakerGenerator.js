const faker = require('faker')
const fs = require('fs')

const usedNames = []
const shoes = []

const brandIds = ["6010581f4485971841aacf99", "6010581f4485971841aacf9a", "6010581f4485971841aacf9b", "6010581f4485971841aacf9c", "6010581f4485971841aacf9d"]
const prices = [1000000, 1100000, 1200000, 1300000, 1400000, 1500000, 1600000, 1700000, 1800000, 1900000, 2000000]
const seasons = [2019, 2020, 2021]

// Mens Nike Shoes
for (let i = 0; i < 50; i++) {
  const productName = faker.name.findName()

  if (usedNames.includes(productName)) {
    continue;
  }

  usedNames.push(productName)

  shoes.push({
    "name": productName,
    "brandId": brandIds[Math.floor(Math.random() * brandIds.length)],
    "categoryId": "601058244485971841aacf9e",
    "gender": "male",
    "priceCents": prices[Math.floor(Math.random() * prices.length)],
    "season": seasons[Math.floor(Math.random() * seasons.length)],
    "sku": faker.random.uuid(),
    "variants": [
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
      }
    ]
  })
}

fs.writeFileSync('./data/products.json', JSON.stringify(shoes))
