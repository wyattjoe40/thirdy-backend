"use strict";

// Use dotenv to read .env vars into Node
require("dotenv").config();

const ENV_VARS = [
  "PORT",
  "JWT_SECRET",
  "AZURE_STORAGE_ACCOUNT_NAME",
  "AZURE_STORAGE_ACCOUNT_ACCESS_KEY",
];

module.exports = {
  port : process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET,
  azureStorageAccountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  azureStorageAccountAccessKey: process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY,

  checkEnvVariables: function() {
    ENV_VARS.forEach(function(key) {
      if (!process.env[key]) {
        console.log("WARNING: Missing the environment variable " + key);
      }
    });
  }
}
