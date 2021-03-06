const advancedResults = (model, populate, makePagination) => async (req, res, next) => {  
  let query
  
  //Copy req.query
  const reqQuery = {...req.query}

  //Fields to exclude 
  const removeFields = ['select', 'sort', 'page', 'limit']

  //Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param])

  // Iterate throgh query object and check if exists some in operator and replace string content with an array
  Object.keys(reqQuery).forEach(queryPart => { 
    if (typeof reqQuery[queryPart]['in'] !== 'undefined') {
      reqQuery[queryPart]['in'] = reqQuery[queryPart]['in'].split(',')
    }
  })

  //Create query string
  let queryStr = JSON.stringify(reqQuery)
  
  //create Operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

  //Finding resource 
  query = model.find(JSON.parse(queryStr))

  //Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ')
    query = query.select(fields)
  }

  // Sort By selected field or by default by created field in descending order
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ')
    query = query.sort(sortBy)
  } else {
    query = query.sort('-createdAt')
  }

  if (populate) {
    query = query.populate(populate)
  }

  const pagination = {}
  if (makePagination) {
    // Pagination
    const page = parseInt(req.query.page, 10)  || 1
    const limit = parseInt(req.query.limit, 10)  || 25
    const startIndex = (page -1) * limit
    const endIndex = page * limit
    const total = await model.countDocuments()

    query = query.skip(startIndex).limit(limit)
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      }
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page -1,
        limit
      }
    }
  }

  //Executing query
  const results = await query
  
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination: makePagination ? pagination : null,
    data: results
  }

  next()
}

module.exports = advancedResults
