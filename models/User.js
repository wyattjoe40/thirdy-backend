const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  newsletterOptIn: Boolean
}, {timestamps: true});

userSchema.methods.toJSON = function() {
  return {
    "username": this.username,
    "email": this.email,
    "newsletterOptIn": this.newsletterOptIn
  }
}

mongoose.model('User', userSchema);