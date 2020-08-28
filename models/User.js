const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  timezone: { type: String, required: true },
  newsletterOptIn: { type: Boolean, default: false },
  profilePictureUrl: String,
  challengeParticipations: [{type:Schema.Types.ObjectId, ref: 'ChallengeParticipation'}],
}, {timestamps: true});

userSchema.methods.toJSON = function() {
  return {
    "id": this._id,
    "username": this.username,
    "email": this.email,
    "timezone": this.timezone,
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