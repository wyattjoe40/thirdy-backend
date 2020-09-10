const SALT_WORK_FACTOR = 10
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/thirdy-dev', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', function () {
  console.error.bind(console, 'connection error:')
})
db.once('open', function () {
  console.log("Mongoose is connected!")
});

require('./models/User')

const User = mongoose.model('User')
User.find({ username: 'wyatt' }, (err, users) => {
  if (err) {
    console.log(err)
    return
  }

  users.forEach((user) => {
    user.password = "myPassword"
    user.save((err, savedUser) => {
      if (err) {
        return console.log(err)
      }

      console.log('newPass: ' + savedUser.password)
    })

    /*
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
      if (err) {
        return console.log(err)
      }

      // hash the password along with our new salt
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) {
          return console.log(err)
        }

        // override the cleartext password with the hashed one
        user.password = hash;
        user.timezone = "America/New_York"
        user.save((err, savedUser) => {
          if (err) {
            return console.log(err)
          }

          console.log('newPass: ' + savedUser.password)
        })
      });
    })
    */
  })
})
// hash their passwords
// save the users