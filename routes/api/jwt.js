const config = require('../../config')
const jwt = require('njwt')

function setJwtForUser(user, res) {
  const claims = { iss: 'thirdy', sub: user.username, subId: user._id }
  const token = jwt.create(claims, config.jwtSecret)
  token.setExpiration(new Date().getTime() + 24*60*60*1000)
  res.cookie("jwt", token.compact(), { 
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    //domain: "http://localhost:3001"
    //sameSite: true
  })
}

module.exports = {
  setJwtForUser: setJwtForUser
}