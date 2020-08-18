const router = require('express').Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const jwt = require('njwt')
const { mongooseCatchHandler }= require('./mongooseHelper')
const config = require('../../config')
const { isEmptyOrUndefined } = require('./stringHelpers')
const { setJwtForUser } = require('./jwt')

router.get('/test', (req, res) => {
  console.log(JSON.stringify(req.jwt))
  res.send(res.jwt)
})

router.post('/', (req, res) => {
  // read the body
  // TODO wydavis: hide PPI info
  console.log("Signup Body: " + JSON.stringify(req.body))

  const username = req.body.username
  const email = req.body.email
  const password = req.body.password
  const newsletterOptIn = req.body.newsletterOptIn

  // validate the fields are good 
  // TODO wydavis: Verify email is valid format, validate password is valid format, verify all have valid characters
  if (isEmptyOrUndefined(username)) {
    return res.status(401).json({field: "username", error: "Username cannot be empty."})
  }

  if (isEmptyOrUndefined(email)) {
    return res.status(401).json({field: "email", error: "Email cannot be empty."})
  }

  if (isEmptyOrUndefined(password)) {
    return res.status(401).json({field: "password", error: "Password cannot be empty."})
  }

  function sendBackJWT(user) {
    const claims = { iss: 'thirdy', sub: user.username, subId: user._id }
    const token = jwt.create(claims, config.jwtSecret)
    token.setExpiration(new Date().getTime() + 24*60*60*1000)
    res.cookie("jwt", token.compact(), { 
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      //domain: "http://localhost:3001"
      //sameSite: true
    })
    res.json(user.toProfileJSON())
  }

  function addToDatabase() {
    const newUser = new User({
      username: username,
      email: email,
      password, password,
      newsletterOptIn: newsletterOptIn
    })

    newUser.save((err, userSaved) => {
      if (err) {
        console.error(err)
        return res.status(500).send("Could not save the new user.")
      }

      console.log("Saved user: " + userSaved.username)
      setJwtForUser(user, res)
      res.json(user.toProfileJSON())
    })
  }

  function checkEmailUniqueness() {
    User.findOne({email: email}).then((user) => {
      if (!user) {
        // good, now add to the database
        addToDatabase();
      } else {
        return res.status(401).json({field: "email", error: "That email is already taken."})
      }
    }).catch(mongooseCatchHandler(() => {
      return res.status(500).json({field: "email", error: "Could not verify the email is unique. Please try again."});
    }))
  }

  // validate the username and email fields are unique (else return error)
  User.findOne({username: username}).then((user) => {
    if (!user) {
      // good, now check email
      return checkEmailUniqueness()
    } else {
      return res.status(401).json({field: "username", error: "That username is already taken."})
    }
  }).catch(mongooseCatchHandler(() => {
    // send back an error
    return res.status(500).json({field: "username", error: "Could not verify the username is unique. Please try again."});
  }))
  
  // insert values into DB
  // create JWT and insert into DB
  // return JWT
})

module.exports = router