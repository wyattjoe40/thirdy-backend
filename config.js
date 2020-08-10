"use strict";

// Use dotenv to read .env vars into Node
require("dotenv").config();

const ENV_VARS = [
  "JWT_SECRET",
];

module.exports = {
  port : process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET,

  checkEnvVariables: function() {
    ENV_VARS.forEach(function(key) {
      if (!process.env[key]) {
        console.log("WARNING: Missing the environment variable " + key);
      }
    });
  }
}
