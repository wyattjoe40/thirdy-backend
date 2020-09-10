const mailchimp = require('@mailchimp/mailchimp_marketing')
const config = require('./config')

function setupNewsletter() {
  mailchimp.setConfig({
    apiKey: config.mailchimpApiKey,
    server: config.mailchimpDomainPrefix,
  });
}

// return a promise that returns a boolean - true is success
function test() {
  return mailchimp.ping.get().then((response) => {
    if (!response) {
      return false
    }

    return (response["health_status"] === "Everything's Chimpy!")
  }).catch((reason) => {
    console.log("Test failed: ")
    console.log(reason)
    return Promise.resolve(false)
  })
}

function addUser(email) {
  return mailchimp.lists.addListMember(config.mailchimpAudienceId, {
    email_address: email,
    status: "subscribed"
  }).then((result) => {
    console.log('result')
    console.log(result)
    return
  }).catch((err) => {
    console.log('err')
    console.log(err)
    return Promise.reject(new Error(err.title))
  })
}

module.exports = {
  setupNewsletter: setupNewsletter,
  api: {
    test: test,
    addUser: addUser
  }
}