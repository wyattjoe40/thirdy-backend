const router = require('express').Router()
const auth = require('../auth')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const ChallengeParticipation = mongoose.model('ChallengeParticipation')
const { isEmptyOrUndefined } = require('./stringHelpers')
const { setJwtForUser } = require('./jwt')

router.get('/users', auth.required, (req, res) => {
  User.findOne({ username: req.jwt.body.sub }, (err, user) => {
    if (err) {
      console.log('users findOne err: ' + JSON.stringify(err))
      return res.status(500).send("Could not query for the user")
    }

    if (!user) {
      return res.status(404)
    }

    res.json(user.toProfileJSON())
  })
})

router.post('/user/login', auth.optional, (req, res) => {
  // get the email and password
  const email = req.body.email;
  const password = req.body.password;

  // validate input (if bad, send back 401)
  if (isEmptyOrUndefined(email)) {
    return res.status(401).json({ field: "email", error: "Email cannot be empty" })
  }

  if (isEmptyOrUndefined(password)) {
    return res.status(401).json({ field: "password", error: "Password cannot be empty" })
  }

  // check if it exists
  User.findOne({ email: email, password: password }, (err, user) => {
    if (err) {
      return res.sendStatus(500)
    }

    // if not exists, send back 401 with error
    if (!user) {
      return res.status(401).json({ error: "Incorrect email or password" })
    }

    // if exists, get the body and send back
    setJwtForUser(user, res)
    return res.json(user.toProfileJSON())
  })

})

router.post('/user/logout', auth.required, (req, res) => {
  res.clearCookie('jwt').sendStatus(200)
})

router.get('/user/participating-challenges', auth.required, (req, res) => {
  // check the params for status param
  console.log(req.query)
  var statusForDatabaseQuery
  const statusParameter = req.query["challenge-status"]
  if (statusParameter) {
    switch(statusParameter) {
      case 'active':
        statusForDatabaseQuery = 'active'
        break;
      case 'complete':
        // TODO wydavis
        break;
      case 'abandoned':
        break;
      default:
        break;
    }
  }

  var query = {user: req.user.id}
  if (statusParameter) {
    query.status = statusForDatabaseQuery
  }

  // if no status param then return all
  // query challenge participations by current user and by status open
  ChallengeParticipation.find(query, (err, results) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500);
    }

    if (!results) {
      return res.json([])
    }

    return res.json(results)
  }).populate('challenge');
})

module.exports = router