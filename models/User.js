const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  username: String,
  email: String,
  password: String,
  newsletterOptIn: Boolean,
  profilePictureUrl: String,
  challengeParticipations: [{type:Schema.Types.ObjectId, ref: 'ChallengeParticipation'}]
}, {timestamps: true});

userSchema.methods.toJSON = function() {
  return {
    "id": this._id,
    "username": this.username,
    "email": this.email,
    "newsletterOptIn": this.newsletterOptIn,
    "profilePictureUrl": this.profilePictureUrl,
  }
}

userSchema.methods.toProfileJSON = function() {
  return {
    "id": this._id,
    "username": this.username,
    "challengeParticipations": this.challengeParticipations,
    "profilePictureUrl": this.profilePictureUrl,
  }
}

mongoose.model('User', userSchema);