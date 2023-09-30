const { errorMessage, status } = require("../../helpers/status")
// Send a response based on the type of error occured
const catchError = function (
  message,
  errorType,
  res,
  error = { message: null }
) {
  errorMessage.message = message
  console.log("_____________Err_____________")
  // console.log("res is: ", res)
  console.log("err msg parsed: ", message)
  error.message
    ? console.log("err msg default: ", error.message)
    : console.log("err (with no message) is: ", error)
  // console.log("err itself: ", error)
  console.log("__________End_Of_Err__________")
  return res.status(status[errorType]).send(errorMessage)
}

module.exports = {
  catchError,
}
