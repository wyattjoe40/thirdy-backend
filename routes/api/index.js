const router = require('express').Router()

router.use('/challenges', require('./challenges'))
// TODO wydavis: if signup and login have similar tasks then put them in one
router.use('/signup', require('./signup'))

module.exports = router