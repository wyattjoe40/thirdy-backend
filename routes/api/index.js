const router = require('express').Router()

router.use('/challenges', require('./challenges'))
router.use('/challenge-participation', require('./challengeParticipation'))
// TODO wydavis: if signup and login have similar tasks then put them in one
router.use('/signup', require('./signup'))
router.use('/profiles', require('./profiles'))
router.use('/', require('./users'))

module.exports = router