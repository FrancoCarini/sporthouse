const mongoose = require('mongoose')
const slugify = require('slugify')
const NodeGeocoder = require('node-geocoder')

const StoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description can not be more than 500 characters']
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number can not be longer than 20 characters']
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  }
})

//Create Store slug from the name
StoreSchema.pre('save', function(next) {
  this.slug = slugify(this.name, {lower: true})
  next()
})

//Geocode & create location field
StoreSchema.pre('save', async function(next) {
  const geocoder = NodeGeocoder({
    provider: process.env.GEOCODER_PROVIDER,
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
  })
  const loc = await geocoder.geocode(this.address)

  this.location = {
    type: 'Point',
    coordinates: [
      loc[0].longitude,
      loc[0].latitude
    ],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  }

  //Do not save address in db
  this.address = undefined
  next()
})

module.exports = mongoose.model('Store', StoreSchema)
