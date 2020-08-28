const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment-timezone')

const dailyFeedbackSchema = new Schema({
  day: { type: Number, required: true},
  feedbackText: String,
  status: {
    type: String,
    enum: ["completed", "skipped"],
    required: true
  },
}, {timestamps: true});

const challengeParticipationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true},
  challenge: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true},
  preChallengeComment: String,
  postChallengeComment: String,
  timezone: { type: String, required: true},
  status: {
    type: String,
    enum: ["active", "complete", "abandoned"],
    required: true
  },
  dailyFeedback: [dailyFeedbackSchema],
}, {timestamps: true})

challengeParticipationSchema.methods.toJSON = function() {
  return {
    id: this._id,
    challenge: this.challenge.toMinimalJSON(),
    status: this.status,
    preChallengeComment: this.preChallengeComment,
    postChallengeComment: this.postChallengeComment,
    dayOfChallenge: this.calculateDayOfChallenge(),
    dailyFeedback: this.dailyFeedback,
  }
}

challengeParticipationSchema.methods.toProfileJSON = function() {
  return {
    id: this._id,
    challenge: this.challenge.toMinimalJSON(),
    status: this.status,
    dayOfChallenge: this.calculateDayOfChallenge()
  }
}

// Actual timezone: PDT (-7)
// created: 16:00 1/1 now: 17:30 1/1, diff: 0 days
// created: 23:00 - 7:00 1/1 now: 00:30 - 7:00 1/2
// (00:30 1/2 => 00:00 1/2) - (23:00 1/1 => 00:00 1/1) = 1
challengeParticipationSchema.methods.calculateDayOfChallenge = function() {
  return (moment().tz(this.timezone).startOf('day').diff(moment(this.createdAt).tz(this.timezone).startOf('day'), 'day') + 1)
}

challengeParticipationSchema.methods.addDailyFeedback = function(dailyFeedbackArray) {
  // for each daily feedback loop through and replace any that exist, add any that don't
  this.dailyFeedback.push(dailyFeedbackArray)
}

mongoose.model('ChallengeParticipation', challengeParticipationSchema)