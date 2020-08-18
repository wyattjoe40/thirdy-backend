const mongoose = require('mongoose')
const Schema = mongoose.Schema

const dailyFeedback = new Schema({
  day: { type: Number, required: true},
  feedbackText: String,
  status: {
    type: String,
    enum: ["completed", "skipped"],
    required: true
  },
}, {timestamps: true});

mongoose.model('DailyFeedback', dailyFeedback)