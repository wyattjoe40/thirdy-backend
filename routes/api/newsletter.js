const router = require('express').Router()
const newsletter = require('../../newsletter')

router.get('/', (req, res) => {
  var html = '<html><body>'
  html += `<form action="${req.baseUrl + "/test"}" method="post"><input type="submit" value="Test Connection" /></form>`
  html += `<form action="${req.baseUrl + "/test-add-user"}" method="post"><input type="email" name="email" /><input type="submit" value="Add User" /></form>`
  html += '</body></html>'

  res.send(html)
})

router.post('/test', (req, res) => {
  newsletter.api.test().then((response) => {
    console.log("newsletter response: ")
    console.log(response)
    if (response) {
      res.send("It works!")
    } else {
      res.send("It doesn't work...")
    }
  })
})

router.post('/test-add-user', (req, res) => {
  const email = req.body.email

  newsletter.api.addUser(email).then((result) => {
    console.log(result)
    res.send("Everything worked.")
  }).catch((err) => {
    console.log(err)
    res.send("Very wrong...")
  })
})

module.exports = router