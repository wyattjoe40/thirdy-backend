const router = require('express').Router()
const mongoose = require('mongoose')
const User = mongoose.model('User')
const { mongooseCatchHandler }= require('./mongooseHelper')

router.param('username', (req, res, next, username) => {
  User.findOne({username: username}, (err, user) => {
    if (err) {
      console.log('username param err: ' + err)
      res.sendStatus(500);
    }

    if (!user) {
      res.sendStatus(404);
    }

    req.user = user;
    next()
  });
})

router.get('/:username', (req, res) => {
  res.json(req.user.toProfileJSON())
})

module.exports = router