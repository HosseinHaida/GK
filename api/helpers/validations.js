const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

/**
 * Hash Password Method
 * @param {string} password
 * @returns {string} returns hashed password
 */
const saltRounds = 10
const salt = bcrypt.genSaltSync(saltRounds)
const hashString = (password) => bcrypt.hashSync(password, salt)

/**
 * comparePassword
 * @param {string} hashedPassword
 * @param {string} password
 * @returns {Boolean} return True or False
 */
const comparePassword = (hashedPassword, password) => {
  return bcrypt.compareSync(password, hashedPassword)
}

/**
 * isValidEmail helper method
 * @param {string} email
 * @returns {Boolean} True or False
 */
const isValidEmail = (email) => {
  const regEx = /\S+@\S+\.\S+/
  return regEx.test(email)
}

/**
 * isShortPassword helper method
 * @param {string} password
 * @returns {Boolean} True or False
 */
const isShortPassword = (password) => {
  if (password.length <= 8 || password === "") {
    return false
  }
  return true
}

/**
 * containsPersian helper method
 * @param {string} password
 * @returns {Boolean} True or False
 */
const containsPersian = (s) => {
  let arrayOfWordsSeparatedWithSpaces = s.split(" ")
  var p = /[\u0600-\u06FF\s]/

  let hasPersian = false
  arrayOfWordsSeparatedWithSpaces.forEach((loopS) => {
    if (p.test(loopS)) hasPersian = true
  })
  return hasPersian
}

const isAllPersian = (s) => {
  var p = /^[\u0600-\u06FF\‌\u0028\u0029\s]+$/
  if (String(s).match(p)) return true
  else return false
}

/**
 * isEmpty helper method
 * @param {string, integer} input
 * @returns {Boolean} True or False
 */
const isEmpty = (input) => {
  if (
    input === undefined ||
    input === "" ||
    input === null ||
    input === "null"
  ) {
    return true
  } else {
    return false
  }
}

/**
 * empty helper method
 * @param {string, integer} input
 * @returns {Boolean} True or False
 */
const empty = (input) => {
  if (input === undefined || input === "") {
    return true
  }
}

/**
 *
 * @param {array, array} input
 * @returns {Boolean} True or False
 */
const doArraysContainTheSame = (arrayOne, arrayTwo) =>
  arrayOne.sort().join(",") === arrayTwo.sort().join(",")

/**
 * Generate Token
 * @param {string} id
 * @returns {string} token
 */
const generateUserToken = (id, email) => {
  const token = jwt.sign(
    {
      user_id: id,
      email,
    },
    process.env.SECRET,
    { expiresIn: "14d" }
  )
  return token
}

module.exports = {
  isValidEmail,
  isShortPassword,
  containsPersian,
  isAllPersian,
  isEmpty,
  empty,
  hashString,
  comparePassword,
  generateUserToken,
  doArraysContainTheSame,
}
