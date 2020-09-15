const router = require('express').Router()
const mongoose = require('mongoose')
const Challenge = mongoose.model('Challenge')
const ChallengeParticipation = mongoose.model('ChallengeParticipation')
const { mongooseCatchHandler } = require('./mongooseHelper')
const auth = require('../auth')

router.param('challenge', (req, res, next, slug) => {
  Challenge.findOne({slug: slug}).populate('author').then( (challenge) => {
    if (!challenge) {
      console.log("Could not find challenge with slug: " + JSON.stringify(slug))
      return res.sendStatus(404);
    }

    req.challenge = challenge
    return next()
  }).catch(mongooseCatchHandler(next))
})

router.get('/', (req, res) => {
  // get the first 20 params. If nothing was passed or if 0 was passed in then use 20.
  var limit = (parseInt(req.query.limit) || 20)
  // right now the filter searches the title
  var filter = req.query.filter

  var queryOptions = {}
  if (filter) {
    const filterList = filter.split(' ').filter(word => word).map(word => new RegExp(`${word}`, 'i'))
    queryOptions = {
      title: { $in: filterList }
    }
  }

  // query mongodb for challenges
  Challenge.find(queryOptions).populate('author').limit(limit).exec().then((challenges) => {
    if (!challenges) {
      console.log("No challenges came back")
      return res.sendStatus(404)
    }

    res.json({"challenges": challenges.map(challenge => challenge.toJSON())})
  }).catch(mongooseCatchHandler(() => { res.sendStatus(500) }))
})

router.get('/:challenge', (req, res) => {
  const challenge = req.challenge

  // if challenge is found, create JSON from it
  // send back response with the JSON
  res.json(challenge.toJSON())
})

router.put('/', auth.required, (req, res) => {
  const newChallenge = new Challenge();
  newChallenge.slug = "a-challenge-title-here-" + (new Date()).getTime()
  newChallenge.title = "A challenge title here"
  newChallenge.description = "My description and stuff"
  newChallenge.author = new mongoose.Types.ObjectId(req.jwt.body.subId)
  newChallenge.save()

  res.json(newChallenge.toJSON())
})

router.get('/:challenge/users', auth.optional, (req, res) => {
  // get any query params (right now just 'status')
  var dbQueryConditions = {}
  const status = req.query.status
  if (status) {
    dbQueryConditions.status = status
  }

  dbQueryConditions.challenge = req.challenge._id
  // create query for ChallengeParticipation, where challengeId is equal to this challenge, and status is active
  ChallengeParticipation.find(dbQueryConditions, (err, parts) => {
    if (err) {
      console.log("Error getting challenge parts from DB, err: ")
      console.log(err)
      return res.sendStatus(500)
    }

    // grab users from ChallengeParticipation objects and return the users
    const users = parts.map((part) => (part.user)).filter((user, index, arr) => (arr.indexOf(user) === index))
    return res.json(users.map((user) => (user.toProfileJSON())))
  }).populate('user')
})

module.exports = router