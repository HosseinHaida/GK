const db = require("../db").Instance()
// var fs = require("fs")
const moment = require("moment")
const axios = require("axios")
const {
  hashString,
  isShortPassword,
  containsPersian,
  isEmpty,
  generateUserToken,
  comparePassword,
  doArraysContainTheSame,
  isValidEmail,
  isAllPersian,
} = require("../helpers/validations")
const { catchError } = require("./tools/catchError")

const { successMessage, status, error } = require("../helpers/status")
// const { upload } = require("./usersPhotoUpload")
// const multer = require("multer")
const { errMessages } = require("../helpers/errMessages")

// Google OAuth2 Setup
const { OAuth2Client } = require("google-auth-library")
const { fetchThisUser } = require("../helpers/db")
const {
  fullSubLimits,
  subPrices,
  successfulPurchaseURL,
  subLabels,
  zarinpalMerchantID,
  zarinpalAccessToken,
  zarinpalPaymentPrefixURL,
  zarinpalStartPaymentURL,
  zarinpalVerifyPaymentURL,
  rialPerDownload,
} = require("../helpers/variables")
const { p2e } = require("../helpers/strings")
const gAuthClient = new OAuth2Client(process.env.G_AUTH_CLIENT_ID)
const verify = async (creds) => {
  const ticket = await gAuthClient.verifyIdToken({
    idToken: creds,
    audience: process.env.G_AUTH_CLIENT_ID,
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  })
  const payload = ticket.getPayload()
  // const userid = payload['sub']
  return payload
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
}

/**
 * Signup
 * @param {object} req
 * @param {object} res
 * @returns {object} reflection object
 */
const signup = async (req, res) => {
  const { email, password, password_confirm } = req.body
  // Check if email is valid
  if (!isValidEmail(email)) {
    error.message = "notValidEmail"
    return catchError(errMessages.notValidEmail, "bad", res, error)
  }

  if (password !== password_confirm) {
    error.message = "passDonotMatch"
    return catchError(errMessages.passDonotMatch, "bad", res, error)
  }

  // Insertion created_at
  const created_at = moment(new Date())

  // Check if emtpy fields
  if (isEmpty(email) || isEmpty(password)) {
    error.message = "emptyFields"
    return catchError(errMessages.emptyFileds, "bad", res, error)
  }

  // Check if there are Persian characters
  if (containsPersian(password)) {
    error.message = "persianDetected"
    return catchError(errMessages.noPersianPlease, "bad", res, error)
  }

  // Check if password is short
  if (!isShortPassword(password)) {
    error.message = "shortPassword"
    return catchError(errMessages.shortPassword, "bad", res, error)
  }

  const password_hash = hashString(password)
  const userPayload = {
    email,
    password_hash,
    created_at,
  }
  try {
    // Insert user to DB
    const r = await db("users").insert(userPayload)
    // Select the same user from DB
    const thisUser = await db
      .select("id", "email", "agreed")
      .from({ u: "users" })
      .where("u.email", userPayload.email)
      .first()
    // Generate token for the user
    const token = generateUserToken(thisUser.id, thisUser.email)

    // Create user obj with token && send to client
    successMessage.user = thisUser
    successMessage.user.token = token
    return res.status(status.created).send(successMessage)
  } catch (error) {
    if (error.routine === "_bt_check_unique") {
      return catchError(errMessages.usernameExists, "conflict", res, error)
    } else {
      return catchError(errMessages.operationFailed, "error", res, error)
    }
  }
}

/**
 * Signin
 * @param {object} req
 * @param {object} res
 * @returns {object} user object
 */
const signin = async (req, res) => {
  const { username, password } = req.body

  if (isEmpty(username) || isEmpty(password)) {
    error.message = "noInput"
    return catchError(errMessages.noInput, "bad", res, error)
  }

  try {
    // Find user in DB
    const thisUser = await fetchThisUser(username)

    // If user email not found
    if (!thisUser) {
      error.message = "userNotFound"
      return catchError(errMessages.userNotFound, "notfound", res, error)
    }

    // Check if is account is connected to google
    if (thisUser.is_g_auth && isEmpty(thisUser.password_hash)) {
      error.message = "signinWithGoogle"
      return catchError(errMessages.signinWithGoogle, "bad", res, error)
    }

    // Check if the right password
    if (!comparePassword(thisUser.password_hash, password)) {
      error.message = "wrongPass"
      return catchError(errMessages.wrongPass, "bad", res, error)
    }
    // Generate token for user
    const token = generateUserToken(thisUser.id, thisUser.email)
    delete thisUser.password_hash
    // Create user obj with token && send to client
    successMessage.user = thisUser
    successMessage.user.token = token
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Google Auth Signin
 * @param {object} req
 * @param {object} res
 * @returns {object} user object
 */
const googleSignin = async (req, res) => {
  const { creds } = req.body

  if (isEmpty(creds)) {
    error.message = "credsMissing"
    return catchError(errMessages.credsMissing, "bad", res, error)
  }

  let user
  try {
    // Fetch user meta from google OAuth2 api
    user = await verify(creds)
  } catch (error) {
    return catchError(errMessages.gAuthFetchFailed, "error", res, error)
  }

  try {
    // Find user in DB
    let thisUser = await fetchThisUser(user.email)
    // If user email not found
    if (!thisUser) {
      const created_at = moment(new Date())
      await db("users").insert({
        email: user.email,
        first_name: user.given_name,
        last_name: user.family_name,
        is_g_auth: true,
        created_at,
      })
      thisUser = await fetchThisUser(user.email)
    }

    // Generate token for user
    const token = generateUserToken(thisUser.id, thisUser.email)
    delete thisUser.password_hash
    // Create user obj with token && send to client
    successMessage.user = thisUser
    successMessage.user.token = token
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Fetch User
 * @param {object} req
 * @param {object} res
 * @returns {object} user object
 */
const fetchUser = async (req, res) => {
  const { email } = req.user
  try {
    // Find user in DB
    const thisUser = await fetchThisUser(email)
    // Check if no one was found
    if (!thisUser) {
      error.message = "userNotFound"
      return catchError(errMessages.userNotFound, "notfound", res, error)
    }
    delete thisUser.password_hash
    // Create user obj with token && send to client
    successMessage.user = thisUser
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Update User
 * @param {object} req
 * @param {object} res
 * @returns {object} user object
 */
const updateUser = async (req, res) => {
  const { user_id, email } = req.user
  const { data } = req.body

  if (Object.entries(data).length <= 0) {
    error.message = "noChanges"
    return catchError(errMessages.noChanges, "bad", res, error)
  }

  const updated_at = moment(new Date())

  const allowedFields = ["first_name", "last_name", "phone"]

  if (
    (!isEmpty(data.first_name) && !isAllPersian(data.first_name)) ||
    (!isEmpty(data.last_name) && !isAllPersian(data.last_name))
  )
    return catchError(errMessages.onlyPersianForName, "bad", res)

  const columnsToBeUpdated = {}
  Object.entries(data).forEach(([k, v]) => {
    if (allowedFields.indexOf(k) >= 0) columnsToBeUpdated[k] = v
  })

  if (!isEmpty(data.username)) {
    if (containsPersian(data.username))
      return catchError(errMessages.usernameContainsPersian, "bad", res)
    columnsToBeUpdated["username"] = data.username
  }

  if (!isEmpty(data.phone)) {
    let numRegEX = /^[0-9]+$/
    if (
      data.phone.substring(0, 2) !== "09" ||
      data.phone.length < 11 ||
      data.phone.length > 11 ||
      !data.phone.match(numRegEX)
    )
      return catchError(errMessages.phoneShouldBeLike, "bad", res)
  }

  columnsToBeUpdated.updated_at = updated_at

  const updateQuery = db("users").where({ email })

  let thisUser
  if (!isEmpty(data.new_pass) || !isEmpty(data.username)) {
    try {
      thisUser = await db
        .select("password_hash", "username")
        .from({ u: "users" })
        .where("u.email", email)
        .first()
    } catch (error) {
      return catchError(errMessages.couldNotFetchUser, "error", res, error)
    }
  }
  if (!isEmpty(data.new_pass)) {
    // Check if old password is empty
    if (isEmpty(data.old_pass)) {
      error.message = "oldPassMissing"
      return catchError(errMessages.oldPassMissing, "bad", res, error)
    }
    // Check if there are Persian characters
    if (containsPersian(data.new_pass)) {
      error.message = "persianDetected"
      return catchError(errMessages.noPersianPlease, "bad", res, error)
    }
    // Check if passwords are short
    if (!isShortPassword(data.new_pass)) {
      error.message = "shortPassword"
      return catchError(errMessages.shortPassword, "bad", res, error)
    }
    // Check if the right password
    if (!comparePassword(thisUser.password_hash, data.old_pass)) {
      error.message = "incorrectPass"
      return catchError(errMessages.incorrectPass, "bad", res, error)
    }
    columnsToBeUpdated["password_hash"] = hashString(data.new_pass)
  }
  try {
    // Actually do the update query
    await updateQuery.update(columnsToBeUpdated)
    // Fetch the same user after the update
    const user = await fetchThisUser(email)
    // Generate token for user
    const token = generateUserToken(user.id, user.email)
    delete user.password_hash
    // Create user obj with token && send to client
    successMessage.user = user
    successMessage.user.token = token
    return res.status(status.success).send(successMessage)
  } catch (error) {
    if (error.routine === "_bt_check_unique") {
      return catchError(errMessages.usernameAlreadyExists, "conflict", res)
    } else {
      return catchError(errMessages.operationFailed, "error", res, error)
    }
  }
}

/**
 * Check if username already exists in DB
 * @param {object} req
 * @param {object} res
 * @returns {object} boolean
 */
const checkUsernameDuplicate = async (req, res) => {
  const { user_id, email } = req.user
  const { username } = req.params

  if (!username) {
    error.message = "pleaseInsertUsername"
    return catchError(errMessages.pleaseInsertUsername, "bad", res, error)
  }

  try {
    // See if i can find a user with the requested username
    const userWithThisUsername = await fetchThisUser(username)

    successMessage.exists =
      userWithThisUsername && userWithThisUsername.email ? true : false
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Save reference to if user has agreed on terms of use
 * @param {object} req
 * @param {object} res
 * @returns {object} user
 */
const agreeOnTerms = async (req, res) => {
  const { user_id, email } = req.user
  const { version } = req.body

  try {
    await db("users").where({ email }).update({ agreed: true })
    const thisUser = await fetchThisUser(email)

    successMessage.user = thisUser
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Save sheba number for the user
 * @param {object} req
 * @param {object} res
 * @returns {object} user
 */
const saveSheba = async (req, res) => {
  const { email } = req.user
  const { sheba } = req.body

  if (sheba.length < 26 || sheba.length > 26)
    return catchError(errMessages.wrongSheba, "bad", res)

  try {
    await db("users").where({ email }).update({ sheba })
    const thisUser = await fetchThisUser(email)

    successMessage.user = thisUser
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Fetch Users subscription meta data
 * @param {object} req
 * @param {object} res
 * @returns {object} subscription && last_sub_dls
 */
const fetchSubsMeta = async (req, res) => {
  const { email } = req.user

  try {
    let meta = await db("users")
      .where({ email })
      .select("subscription", "last_sub_dls")
      .first()

    if (isEmpty(meta.last_sub_dls))
      meta.last_sub_dls = fullSubLimits[meta.subscription]

    successMessage.meta = meta
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Start Payment Sequence for a subscription
 * @param {object} req
 * @param {object} res
 * @returns {object} paymentURL or returns error
 */
const startPayment = async (req, res) => {
  const { user_id, email } = req.user
  const { subscription } = req.body

  try {
    const thisUser = await fetchThisUser(email)
    if (isEmpty(thisUser.phone))
      return catchError(errMessages.phoneIsEmpty, "bad", res)

    if (thisUser.subscription !== "none" && thisUser.last_sub_dls > 0)
      return catchError(
        errMessages.alreadyHaveSubscription(subLabels[thisUser.subscription]),
        "bad",
        res
      )

    await axios
      .post(zarinpalStartPaymentURL, {
        MerchantID: zarinpalMerchantID,
        Amount: subPrices[subscription],
        CallbackURL: successfulPurchaseURL,
        Description: `اشتراک ${subLabels[subscription]} - گندم کیت`,
        Email: thisUser.email,
        Mobile: thisUser.phone,
      })
      .then(async (res) => {
        if (res.data.Status !== 100)
          return catchError(errMessages.paymentReqFailed, "error", res)
        if (res.data.Status === 100) {
          const authorityCode = res.data.Authority
          if (authorityCode.length !== 36)
            return catchError(errMessages.transactionFailed, "error", bad)
          const paymentUrl = zarinpalPaymentPrefixURL + authorityCode
          // Will be redirecting the user to the paymentUrl
          await db("transactions").insert({
            user_id,
            authority: authorityCode,
            sub: subscription,
            price: subPrices[subscription],
            created_at: moment(new Date()),
          })
          successMessage.paymentUrl = paymentUrl
        }
      })

    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Verify Payment for a subscription
 * @param {object} req
 * @param {object} res
 * @returns {object} zarinpal transaction refID or returns error
 */
const verifyPayment = async (req, res) => {
  const { authority } = req.body
  try {
    const thisTrx = await db("transactions")
      .select("id", "sub", "price", "user_id")
      .where({ authority })
      .first()

    if (!thisTrx) return catchError(errMessages.trxNotFound, "notfound", res)

    await axios
      .post(zarinpalVerifyPaymentURL, {
        MerchantID: zarinpalMerchantID,
        Amount: thisTrx.price,
        Authority: authority,
      })
      .then(async (zarinpalRes) => {
        if (zarinpalRes.data.Status === 100) {
          // Payment was successful, update database
          await db
            .transaction(async function (trx) {
              await db("transactions")
                .transacting(trx)
                .where({ id: thisTrx.id })
                .update({ ref: zarinpalRes.data.RefID })
                .then(async (resp) => {
                  // Now Delete pack itself
                  return await db("users")
                    .transacting(trx)
                    .where({ id: thisTrx.user_id })
                    .update({
                      subscription: thisTrx.sub,
                      subscribed_at: moment(new Date()),
                      last_sub_dls: fullSubLimits[thisTrx.sub],
                    })
                })
                .then(trx.commit)
                .catch(trx.rollback)
            })
            .then(
              (resp) => resp // Transaction Complete
            )
            .catch(function (err) {
              return catchError(
                errMessages.transactionFailed,
                "error",
                res,
                err
              )
            })
          successMessage.refID = zarinpalRes.data.RefID
        } else {
          // Payment failed, handle error
          successMessage.status = zarinpalRes.data.Status
          successMessage.refID = null
        }
      })

    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Fetch Users Download Counts and Income based on [type]
 * @param {object} req
 * @param {object} res
 * @returns {object} counts and income
 */
const fetchFinances = async (req, res) => {
  const { user_id } = req.user
  const { type } = req.params

  try {
    // const thisUser = await fetchThisUser(email)

    const query = db.from("payments").select("*").where({ user_id })
    const yyyy_mm = new Date().toLocaleDateString("fa-IR", {
      month: "2-digit",
      year: "numeric",
    })
    const yyyy = p2e(yyyy_mm.substring(0, yyyy_mm.indexOf("/")))
    const mm = p2e(yyyy_mm.substring(yyyy_mm.indexOf("/") + 1, yyyy_mm.length))

    if (type === "annual") query.andWhere({ year: yyyy })
    if (type === "monthly") query.andWhere({ year: yyyy, month: mm })

    const result = await query

    let downloadCounts = null
    let totalIncome = null
    let hasPriceChanged = false

    result.forEach((row) => {
      if (row.rate_rial && row.rate_rial !== rialPerDownload)
        hasPriceChanged = true
      downloadCounts = downloadCounts + row.download_counts
      totalIncome += row.rate_rial
        ? row.download_counts * row.rate_rial
        : row.download_counts * rialPerDownload
    })

    successMessage.record = { downloadCounts, totalIncome, hasPriceChanged }
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Set photo for user
 * @param {object} req
 * @param {object} res
 * @returns {object} updated user
 */
// const setPhoto = async (req, res) => {
//   const { username } = req.user
//   try {
//     // Fetch user photo column from users to see
//     // if the user already has a photo assigned
//     const thisUser = await db("users")
//       .select("photo")
//       .where("username", username)
//       .first()
//     if (!isEmpty(thisUser.photo)) {
//       // Pick photo name from the end of the previous photo URL
//       const prevPhotoName = /[^/]*$/.exec(thisUser.photo)[0]
//       const relativePathToPrevPhoto =
//         process.env.UPLOAD_DIR + process.env.UPLOAD_DIR_USER + prevPhotoName
//       fs.unlink(relativePathToPrevPhoto, function (err) {
//         if (err) console.log("Could not find and delete previous photo")
//       })
//     }
//   } catch (error) {
//     return catchError("Error looking for previous photo", "error", res)
//   }
//   // Actually do the upload
//   upload(req, res, async (err) => {
//     if (err instanceof multer.MulterError) {
//       return catchError("Upload was not successful", "error", res)
//     } else if (err) {
//       return catchError("An error occured when uploading", "error", res)
//     }
//     // Everything went fine with multer and uploading
//     const photoName = req.uploaded_photo_name
//     if (!photoName) {
//       return catchError("Faced issues saving photo", "error", res)
//     }
//     try {
//       // Generate photo URL to be saved with user in DB
//       const path =
//         process.env.SERVER_URL +
//         // ':' +
//         // process.env.PORT +
//         "/static/" +
//         process.env.UPLOAD_DIR_USER +
//         photoName
//       const updated_at = moment(new Date())
//       await db("users")
//         .where({ username: username })
//         .update({ photo: path, updated_at: updated_at })
//       successMessage.photo_path = path
//       return res.status(status.success).send(successMessage)
//     } catch (error) {
//       return catchError(errMessages.operationFailed, "error", res, error)
//     }
//   })
// }

module.exports = {
  signup,
  signin,
  googleSignin,
  fetchUser,
  updateUser,
  checkUsernameDuplicate,
  agreeOnTerms,
  saveSheba,
  fetchSubsMeta,
  startPayment,
  verifyPayment,
  fetchFinances,
  // setPhoto,
}
