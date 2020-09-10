const mongoose = require('mongoose')
const Schema = mongoose.Schema
const SALT_WORK_FACTOR = 10
const bcrypt = require('bcrypt')

const userSchema = new Schema({
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  timezone: { type: String, required: true },
  newsletterOptIn: { type: Boolean, default: false },
  profilePictureUrl: String,
  challengeParticipations: [{type:Schema.Types.ObjectId, ref: 'ChallengeParticipation'}],
}, {timestamps: true});

userSchema.pre('save', function(next) { 
  var user = this
  if (!user.isModified('password')) {
    return next();
  }

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) {
      return next(err);
    }

    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);

        // override the cleartext password with the hashed one
        user.password = hash;
        next();
    });
  })
})

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
  });
};

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