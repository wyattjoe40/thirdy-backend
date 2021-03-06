const router = require('express').Router()
const auth = require('../auth')
const mongoose = require('mongoose')
const User = mongoose.model('User')
const Challenge = mongoose.model('Challenge')
const ChallengeParticipation = mongoose.model('ChallengeParticipation')
//const DailyFeedback = mongoose.model('DailyFeedback')

router.param('participationId', (req, res, next, id) => {
  // get the participation
  ChallengeParticipation.findById(id).populate('challenge').exec((err, part) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }

    if (!part) {
      return res.sendStatus(404)
    }

    req.challengeParticipation = part
    next()
  })
})

function verifyUserIsAllowedAccess(req, res, next) {
  if (req.challengeParticipation.user.toString() !== req.authUser.id) {
    return res.sendStatus(403)
  }

  next()
}

router.get('/:participationId', auth.required, verifyUserIsAllowedAccess, (req, res) => {
  // we should have the participation in the request
  // check if the participation is for the current user
  return res.json(req.challengeParticipation.toJSON())
})

router.put('/:participationId', auth.required, verifyUserIsAllowedAccess, (req, res) => {
  const challengeParticipation = req.challengeParticipation

  const status = req.body.status
  if (status) {
    challengeParticipation.status = status;
  }

  const preChallengeComment = req.body.preChallengeComment
  if (preChallengeComment) {
    challengeParticipation.preChallengeComment = preChallengeComment
  }

  const postChallengeComment = req.body.postChallengeComment
  if (postChallengeComment) {
    challengeParticipation.postChallengeComment = postChallengeComment
  }

  const dailyFeedbacks = req.body.dailyFeedback
  if (dailyFeedbacks && dailyFeedbacks.length) {
    // create the objects and add them to the DB
    dailyFeedbacks.forEach((dailyFeedback) => {
      if (!dailyFeedback.day || !dailyFeedback.status) {
        // invalid dailyFeedback object
        return res.sendStatus(400)
      }

      const newDailyFeedback = {}
      newDailyFeedback.day = dailyFeedback.day
      newDailyFeedback.status = dailyFeedback.status

      if (dailyFeedback.feedbackText) {
        newDailyFeedback.feedbackText = dailyFeedback.feedbackText
      }

      challengeParticipation.dailyFeedback.push(newDailyFeedback)
    })
  }

  challengeParticipation.save().then((savedChallengePart) => {
    return res.json(savedChallengePart.toJSON())
  }).catch((err) => {
    console.log("Error saving challenge part")
    console.log(err)
    return res.sendStatus(500)
  })
})

router.post('/', auth.required, (req, res) => {
  // check that the body has the challenge...
  const challenge = req.body.challenge
  if (!challenge || !challenge.slug) {
    // incorrect data so send back an error
    return res.sendStatus(404)
  }

  User.findOne({username: req.authUser.username}, (err, user) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }

    if (!user) {
      return res.status(404).send("No user")
    }

    // we have the user, get the challenge
    Challenge.findOne({slug: challenge.slug}, (err, challenge) => {
      if (err) {
        console.log(err)
        return res.sendStatus(500)
      }

      if (!challenge) {
        return res.status(404).send("No challenge")
      }

      // create a new challenge-participation
      const newChallengeParticipation = new ChallengeParticipation({
        user: user,
        challenge: challenge,
        status: 'active',
        timezone: user.timezone,
        dailyFeedback: [],
      })
      newChallengeParticipation.save((err, savedObject) => {
        if (err) {
          console.log(err)
          return res.status(500)
        }

        return res.json(savedObject)
      })
    })
  })
})

module.exports = router