const mongoose = require('mongoose')
const Schema = mongoose.Schema

const challengeSchema = new Schema({
  slug: { type: String, lowercase: true, unique: true },
  title: String,
  description: String,
  createdAt: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  completedCount: { type: Number, default: 0 },
}, { timestamps: true });

challengeSchema.methods.createSlug = function () {
  // TODO wydavis: Implement and hookup
}

challengeSchema.methods.toJSON = function () {
  return {
    "slug": this.slug,
    "title": this.title,
    "description": this.description,
    "createdAt": this.createdAt,
    "author": this.author.toProfileJSON(),
    "completedCount": this.completedCount,
  }
}

challengeSchema.methods.toMinimalJSON = function () {
  return {
    "slug": this.slug,
    "title": this.title,
    "completedCount": this.completedCount,
  }
}

mongoose.model('Challenge', challengeSchema);