const mongoose = require('mongoose')

const Challenge = mongoose.model('Challenge')

const mockChallenge = new Challenge({"slug": "build-a-web-app-" + (new Date()).getTime(), "title": "Build a Web App", "description": "In thirty days build a web app using any technology.", "createdAt": (new Date()).toISOString() })

mockChallenge.save((err, challengeSaved) => {
  if (err) {
    return console.error(err)
  }
  console.log("Saved challenge: " + challengeSaved.slug)
})