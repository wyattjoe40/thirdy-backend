const router = require('express').Router()
const auth = require('../auth')
const mongoose = require('mongoose')
const config = require('../../config')
const intoStream = require('into-stream')
const User = mongoose.model('User')
const ChallengeParticipation = mongoose.model('ChallengeParticipation')
const { isEmptyOrUndefined } = require('./stringHelpers')
const { setJwtForUser } = require('./jwt')
const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob')
const multer = require('multer')
const upload = multer()

const azureCredentials = new StorageSharedKeyCredential(config.azureStorageAccountName, config.azureStorageAccountAccessKey)
const baseAzureUrl = `https://${config.azureStorageAccountName}.blob.core.windows.net`
const blobServiceClient = new BlobServiceClient(baseAzureUrl, azureCredentials)

router.param('username', (req, res, next, username) => {
  // grab user object, put it on the request
  User.findOne({ username: username }, (err, user) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }

    if (!user) {
      return res.sendStatus(404)
    }

    req.user = user
    next()
  })
})

router.get('/users', auth.required, (req, res) => {
  User.findOne({ username: req.authUser.username }, (err, user) => {
    if (err) {
      console.log('users findOne err: ' + JSON.stringify(err))
      return res.status(500).send("Could not query for the user")
    }

    if (!user) {
      return res.status(404)
    }

    res.json(user.toJSON())
  })
})

router.get('/users/:username', auth.optional, (req, res) => {
  res.json(req.user.toProfileJSON())
})

router.get('/users/:username/participating-challenges', auth.optional, (req, res) => {
  ChallengeParticipation.find({ user: req.user }, (err, results) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500);
    }

    if (!results) {
      return res.json([])
    }

    return res.json(results.map(part => part.toProfileJSON()))
  }).populate('challenge');
})

router.post('/user/login', auth.optional, (req, res) => {
  // get the email and password
  const email = req.body.email;
  const password = req.body.password;

  // validate input (if bad, send back 401)
  if (isEmptyOrUndefined(email)) {
    return res.status(401).json({ field: "email", error: "Email cannot be empty" })
  }

  if (isEmptyOrUndefined(password)) {
    return res.status(401).json({ field: "password", error: "Password cannot be empty" })
  }

  // check if it exists
  User.findOne({ email: email }, (err, user) => {
    if (err) {
      return res.sendStatus(500)
    }

    // if not exists, send back 401 with error
    if (!user) {
      return res.status(401).json({ error: "Incorrect email or password" })
    }

    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        console.log(err)
        return res.sendStatus(500)
      }

      if (isMatch) {
        // if exists, get the body and send back
        setJwtForUser(user, res)
        return res.json(user.toJSON())
      } else {
        return res.status(401).json({ error: "Incorrect email or password" })
      }
    })
  })
})

router.post('/user/profile-picture', auth.required, upload.single('profile-picture'), (req, res) => {
  User.findOne({ username: req.authUser.username }, (err, user) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500)
    }

    // get the file from the request
    const profilePicture = req.file

    if (!profilePicture) {
      return res.status(400).send("No profile picture in form data")
    }

    const pictureData = intoStream(profilePicture.buffer)

    function getBlobName(filename) {
      const id = Math.random().toString().replace(/0\./, '') + '-' + (new Date()).getTime()
      return `${id}-${filename}`
    }

    // get a connection to our azure blob storage
    const containerName = 'images'
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = getBlobName(profilePicture.originalname) // TODO is this the right property name?
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // TODO wydavis: Delete the old photo for the user

    // upload the picture to the storage
    blockBlobClient.uploadStream(pictureData).then((response) => {
      console.log(response)

      // delete the old profile picture if it exists
      if (user.profilePictureUrl) {
        const blobName = user.profilePictureUrl.replace(`${baseAzureUrl}/${containerName}/`, '')
        if (blobName) {
          const oldBlobClient = containerClient.getBlockBlobClient(blobName)
          oldBlobClient.delete().then((response) => {
            console.log("Deleted the old blob.")
          }).catch((err) => {
            console.log("Could not delete old blob. Error: ")
            console.log(err)
          })
        } else {
          console.log("Could not get the old blob name.")
        }
      }

      // store the image URL inside of our user
      user.profilePictureUrl = `${baseAzureUrl}/${containerName}/${blobName}`
      user.save({}, (err, savedUser) => {
        if (err) {
          // TODO wydavis: Add deletion of azure image if anything fails after uploading
          console.log(err)
          return res.sendStatus(500)
        }

        return res.json({ profilePictureUrl: savedUser.profilePictureUrl })
      })
    }).catch(err => {
      console.log("Error uploading blob: ")
      console.log(err)
      return res.sendStatus(500)
    })
  })
})

router.post('/user/logout', (req, res) => {
  res.clearCookie('jwt').sendStatus(200)
})

router.get('/user/participating-challenges', auth.required, (req, res) => {
  // check the params for status param
  console.log(req.query)
  var statusForDatabaseQuery
  const statusParameter = req.query["challenge-status"]
  if (statusParameter) {
    switch (statusParameter) {
      case 'active':
        statusForDatabaseQuery = 'active'
        break;
      case 'complete':
        statusForDatabaseQuery = 'complete'
        break;
      case 'abandoned':
        statusForDatabaseQuery = 'abandoned'
        break;
      default:
        // throw an error
        res.status(400).send('Invalid status')
        break;
    }
  }

  var query = { user: req.authUser.id }
  if (statusParameter) {
    query.status = statusForDatabaseQuery
  }

  // if no status param then return all
  // query challenge participations by current user and by status open
  ChallengeParticipation.find(query, (err, results) => {
    if (err) {
      console.log(err)
      return res.sendStatus(500);
    }

    if (!results) {
      return res.json([])
    }

    return res.json(results)
  }).populate('challenge');
})

module.exports = router