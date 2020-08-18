const router = require('express').Router()
const mongoose = require('mongoose')
const Challenge = mongoose.model('Challenge')
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

  // query mongodb for challenges
  Challenge.find().populate('author').limit(limit).exec().then((challenges) => {
    if (!challenges) {
      console.log("No challenges came back")
      return res.sendStatus(404)
    }

    challenges.forEach((challenge) => {
      console.log(challenge.toChallengeJSON())
    })

    //res.json({"challenges": challenges.map(challenge => challenge.toJSON())})
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

  res.json(newChallenge.toChallengeJSON())
})

module.exports = router