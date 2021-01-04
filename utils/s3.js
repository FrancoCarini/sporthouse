const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')
const AppError = require('./appError')

exports.uploadFile = (fileName) => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET
  })

  // Read content from the file
  const fileContent = fs.readFileSync(fileName)

  // Setting up S3 upload parameters
  const params = {
      Bucket: process.env.S3_BUCKET,
      Key: `${process.env.S3_DIRECTORY}/${path.basename(fileName)}`,
      Body: fileContent
  }

  // Uploading files to the bucket
  s3.upload(params, function(err, data) {
    if (err) {
      return next(new AppError('Error uploading file', 500))
    }
  })
};
