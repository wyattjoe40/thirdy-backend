const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment')

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
  user: { type: Schema.Types.ObjectId, ref: 'User'},
  challenge: { type: Schema.Types.ObjectId, ref: 'Challenge'},
  preChallengeComment: String,
  postChallengeComment: String,
  status: {
    type: String,
    enum: ["active", "complete", "abandoned"],
    required: true
  },
  //dailyFeedback: [{day: Number, completed: Boolean, feedbackText: String}],
  dailyFeedback: [dailyFeedbackSchema],//[{ type: Schema.Types.ObjectId, ref: 'DailyFeedback'}]
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

challengeParticipationSchema.methods.calculateDayOfChallenge = function() {
  return (moment().startOf('day').diff(moment(this.createdAt).startOf('day'), 'day') + 1)
}

challengeParticipationSchema.methods.addDailyFeedback = function(dailyFeedbackArray) {
  // for each daily feedback loop through and replace any that exist, add any that don't
  this.dailyFeedback.push(dailyFeedbackArray)
}

mongoose.model('ChallengeParticipation', challengeParticipationSchema)