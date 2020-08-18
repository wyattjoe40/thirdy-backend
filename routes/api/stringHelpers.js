function isEmptyOrUndefined(string) {
  return (string === undefined) || (string.length == 0)
}

module.exports = {
  isEmptyOrUndefined: isEmptyOrUndefined
}