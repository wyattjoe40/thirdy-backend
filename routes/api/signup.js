const router = require('express').Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const jwt = require('njwt')
const { mongooseCatchHandler }= require('./mongooseHelper')

router.get('/test', (req, res) => {
  console.log(JSON.stringify(req.jwt))
  res.send(res.jwt)
})

router.post('/', (req, res) => {
  // read the body
  console.log("Body: " + JSON.stringify(req.body))

  const username = req.body.username
  const email = req.body.email
  const password = req.body.password
  const newsletterOptIn = req.body.newsletterOptIn

  function isEmptyOrUnderfined(string) {
    return (string === undefined) || (string.length == 0)
  }

  // validate the fields are good 
  // TODO wydavis: Verify email is valid format, validate password is valid format, verify all have valid characters
  if (isEmptyOrUnderfined(username)) {
    return res.status(400).json({ error: {field: "username", error: "Username cannot be empty."}})
  }

  if (isEmptyOrUnderfined(email)) {
    return res.status(400).json({ error: {field: "email", error: "Email cannot be empty."}})
  }

  if (isEmptyOrUnderfined(password)) {
    return res.status(400).json({ error: {field: "password", error: "Password cannot be empty."}})
  }

  function sendBackJWT(user) {
    const claims = { iss: 'thirdy', sub: user.username }
    const token = jwt.create(claims, 'top-secret-phrase')
    token.setExpiration(new Date().getTime() + 24*60*60*1000)
    res.send(token.compact())
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
      sendBackJWT(userSaved)
    })
  }

  function checkEmailUniqueness() {
    User.findOne({email: email}).then((user) => {
      if (!user) {
        // good, now add to the database
        addToDatabase();
      } else {
        return res.status(400).json({ error: {field: "email", error: "That email is already taken."}})
      }
    }).catch(mongooseCatchHandler(() => {
      return res.status(500).json("Could not verify the email is unique. Please try again.");
    }))
  }

  // validate the username and email fields are unique (else return error)
  User.findOne({username: username}).then((user) => {
    if (!user) {
      // good, now check email
      return checkEmailUniqueness()
    } else {
      return res.status(400).json({ error: {field: "username", error: "That username is already taken."}})
    }
  }).catch(mongooseCatchHandler(() => {
    // send back an error
    return res.status(500).json("Could not verify the username is unique. Please try again.");
  }))
  
  // insert values into DB
  // create JWT and insert into DB
  // return JWT
})

module.exports = router