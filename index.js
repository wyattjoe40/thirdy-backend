const express = require('express')
const app = express()
const port = 3001
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
const moment = require('moment')
const config = require('./config')
const mailchimp = require('@mailchimp/mailchimp_marketing')
const { setupNewsletter } = require('./newsletter')

config.checkEnvVariables()

if (config.testMode) {
  console.log("Running in test mode...")
}

setupNewsletter()

/**
 * Body parsers
 */

app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

/**
 * Mongoose setup
 */

 // TODO wydavis: add conditional for DB for prod vs dev
mongoose.connect(`mongodb+srv://${config.mongoUsername}:${encodeURI(config.mongoPassword)}@${config.mongoDomain}/${config.mongoDbName}?w=majority`, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', function() {
  console.error.bind(console, 'connection error:')
})
db.once('open', function() {
  console.log("Mongoose is connected!")
});

require('./models/Challenge')
require('./models/User')
require('./models/ChallengeParticipation')
//require('./models/DailyFeedback')
//require('./mock/mockChallenges')

app.use((req, res, next) => {
  console.log(`${req.method} ${JSON.stringify(req.url)} was called`)
  next()
})

/**
 * Setup the API endpoint router
 */

app.use(require('./routes'))

app.get("/", (req, res) => {
  res.send("Hello world")
})

app.listen(port, () => {
  console.log(`Thirdy backend is listening`)
})
