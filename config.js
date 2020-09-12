"use strict";

// Use dotenv to read .env vars into Node
require("dotenv").config();

const ENV_VARS = [
  "PORT",
  "JWT_SECRET",
  "AZURE_STORAGE_ACCOUNT_NAME",
  "AZURE_STORAGE_ACCOUNT_ACCESS_KEY",
  "MAILCHIMP_AUDIENCE_ID",
  "MAILCHIMP_API_KEY",
  "MAILCHIMP_DOMAIN_PREFIX",
  "MONGO_DOMAIN",
  "MONGO_DB_NAME",
  "MONGO_USERNAME",
  "MONGO_PASSWORD",
  "PRODUCTION",
];

module.exports = {
  port : process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET,
  azureStorageAccountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  azureStorageAccountAccessKey: process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY,
  mailchimpAudienceId: process.env.MAILCHIMP_AUDIENCE_ID,
  mailchimpApiKey: process.env.MAILCHIMP_API_KEY,
  mailchimpDomainPrefix: process.env.MAILCHIMP_DOMAIN_PREFIX,
  mongoDomain: process.env.MONGO_DOMAIN,
  mongoDbName: process.env.MONGO_DB_NAME,
  mongoUsername: process.env.MONGO_USERNAME,
  mongoPassword: process.env.MONGO_PASSWORD,
  production: process.env.PRODUCTION | false,

  checkEnvVariables: function() {
    ENV_VARS.forEach(function(key) {
      if (!process.env[key]) {
        console.log("WARNING: Missing the environment variable " + key);
      }
    });
  }
}
