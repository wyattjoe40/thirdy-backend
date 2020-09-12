const config = require('../../config')
const jwt = require('njwt')

function setJwtForUser(user, res) {
  const claims = { iss: 'thirdy', sub: user.username, subId: user._id }
  const token = jwt.create(claims, config.jwtSecret)
  token.setExpiration(new Date().getTime() + 24*60*60*1000)
  var cookieOptions = {
    maxAge: 6 * 60 * 60 * 1000,
    httpOnly: true,
    //domain: "http://localhost:3001"
  }
  if (!config.testMode) {
    cookieOptions.sameSite = "None"
    cookieOptions.secure = true
  }
  res.cookie("jwt", token.compact(), cookieOptions)
}

module.exports = {
  setJwtForUser: setJwtForUser
}