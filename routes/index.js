const router = require('express').Router()

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  next()
})

//router.use(require('./auth'))

router.use('/api', require('./api'))

module.exports = router