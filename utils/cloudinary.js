const cloudinary = require('cloudinary').v2
const AppError = require('./appError')

exports.uploadFile = async (fileName, folderDestination) => {
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true
  })

  try {
    const result = await cloudinary.uploader.upload(fileName, {
      folder: folderDestination,
      use_filename: true,
      unique_filename: false
    })
    return result
  } catch (err) {
    return new AppError('Error uploading file', 500)
  }
}