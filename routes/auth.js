const njwt = require('njwt')

function jwt(req, res, next) {
  // read the jwt
  const auth = req.header("Authorization")
  if (!auth) {
    console.log("No JWT")
    return next()
  }

  const splitJwt = auth.split(" ");

  if (splitJwt.count != 2) {
    console.log("Wrong number of JWT parts. Count: " + splitJwt.count)
    return next()
  }

  const jwt = splitJwt[1];

  console.log(auth)
  res.jwt = auth
  next()
}

module.exports = jwt