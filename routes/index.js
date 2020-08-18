const router = require('express').Router()
const cookieParser = require('cookie-parser')
const njwt = require('njwt')

router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.header("Origin"))
  res.header("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, OPTIONS, DELETE")
  res.header("Access-Control-Allow-Credentials", true)

  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

  next()
})

router.use(cookieParser())

const unwrapCookie = function(req, res, next) {
  //console.log(JSON.stringify(req.cookies["jwt"]))
  next()
}

router.use(unwrapCookie);

// This will be important for when we call from non-browsers with auth bearer token
// router.use(require('./auth'))

router.use('/api', require('./api'))

module.exports = router