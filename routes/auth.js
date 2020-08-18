const njwt = require('njwt')
const config = require('../config')

function setAuthInfoOnReq(req, verifiedJwt) {
  req.jwt = verifiedJwt
  req.user = { username: verifiedJwt.body.sub, id: verifiedJwt.body.subId }
}

function jwtRequired(req, res, next) {
  // grab the jwt token
  const jwt = req.cookies["jwt"];
  if (!jwt) {
    return res.status(401).send("No JWT found")
  }

  // verify it is valid
  njwt.verify(jwt, config.jwtSecret, (err, verifiedJwt) => {
    if (err) {
      console.log('jwt verify err: ' + err)
      return res.status(401).send("Invalid JWT")
    }

    setAuthInfoOnReq(req, verifiedJwt)
    next()
  })
}

function jwtOptional(req, res, next) {
  // grab the jwt token
  const jwt = req.cookies["jwt"];
  if (!jwt) {
    return next()
  }

  // verify it is valid
  njwt.verify(jwt, config.jwtSecret, (err, verifiedJwt) => {
    if (err) {
      console.log('jwt verify err: ' + err)
      return next()
    }

    setAuthInfoOnReq(req, verifiedJwt)
    next()
  })
}

const auth = {
  required: jwtRequired,
  optional: jwtOptional
}

module.exports = auth