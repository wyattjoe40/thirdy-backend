const router = require('express').Router()
const mongoose = require('mongoose')
const Challenge = mongoose.model('Challenge')
const { mongooseCatchHandler } = require('./mongooseHelper')

router.param('challenge', (req, res, next, slug) => {
  Challenge.findOne({slug: slug}).then( (challenge) => {
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
  Challenge.find().limit(limit).exec().then((challenges) => {
    if (!challenges) {
      console.log("No challenges came back")
      return res.sendStatus(404)
    }

    res.json({"challenges": challenges.map(challenge => challenge.toJSON())})
  }).catch(mongooseCatchHandler(() => { res.sendStatus(500) }))
})

router.get('/:challenge', (req, res) => {
  // read the slug from the url
  // find a challenge with that slug
  // if no challenge is found then return 404
  const challenge = req.challenge

  // if challenge is found, create JSON from it
  // send back response with the JSON
  res.json(challenge.toJSON())
})

module.exports = router