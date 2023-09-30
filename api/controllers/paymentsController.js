const db = require("../db").Instance()
const moment = require("moment")

const { isEmpty } = require("../helpers/validations")
const { catchError } = require("./tools/catchError")

const { successMessage, status, error } = require("../helpers/status")
const { errMessages } = require("../helpers/errMessages")
const { whereClause, fetchThisUser } = require("../helpers/db")

/**
 * Fetch payments
 * @returns {object} success msg
 */
const fetchPayments = async (req, res) => {
  const { user_id, email } = req.user
  const { payment_status, search_text, year, month } = req.params

  try {
    const thisUser = await fetchThisUser(email)
    if (!thisUser.is_admin)
      return catchError(errMessages.notAuthorized, "bad", res)

    let query = null
    query = db
      .from("payments")
      .select(
        "payments.*",
        "users.username",
        "users.email",
        "users.phone",
        "users.sheba"
      )
      .where({ status: payment_status, year, month })
      .join("users", "user_id", "=", "users.id")
      .orderBy("payments.updated_at", "desc", "first")

    if (!isEmpty(search_text) && search_text !== "*") {
      // Change query to fetch icons based on search_text
      query.andWhere(function () {
        this.whereRaw(whereClause("users.username", search_text)).orWhereRaw(
          whereClause("users.email", search_text)
        )
      })
    }

    const payments = await query

    successMessage.records = payments
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Fetch payment
 * @returns {object} success msg
 */
const fetchPayment = async (req, res) => {
  const { email } = req.user
  const { year, month, user_id } = req.params

  try {
    const thisUser = await fetchThisUser(email)
    if (!thisUser.is_admin)
      return catchError(errMessages.notAuthorized, "bad", res)

    const payment = await db
      .from("payments")
      .select("*")
      .where({ year, month, user_id })
      .first()

    successMessage.record = payment
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Update payment record
 * @returns {object} success msg
 */
const updatePayment = async (req, res) => {
  const { email } = req.user
  const { p_status, ref_id, id } = req.body

  try {
    const thisUser = await fetchThisUser(email)
    if (!thisUser.is_admin)
      return catchError(errMessages.notAuthorized, "bad", res)

    let updated_at = moment(new Date())
    await db("payments")
      .update({ status: p_status, ref_id, updated_at })
      .where({ id })

    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

module.exports = {
  fetchPayments,
  fetchPayment,
  updatePayment,
}
