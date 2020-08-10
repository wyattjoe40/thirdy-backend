exports.mongooseCatchHandler = function(next) {
  return function(err) {
    console.log("Mongoose catch handler: " + JSON.stringify(err))
    if (next) {
      return next();
    }
  }
}
