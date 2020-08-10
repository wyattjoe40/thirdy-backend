const mongoose = require('mongoose')

const challengeSchema = new mongoose.Schema({
  slug: {type:String, lowercase: true, unique: true},
  title: String,
  description: String,
  createdAt: String
}, {timestamps: true});

challengeSchema.methods.toJSON = function() {
  return {
    "slug": this.slug,
    "title": this.title,
    "description": this.description,
    "createdAt": this.createdAt
  }
}

mongoose.model('Challenge', challengeSchema);