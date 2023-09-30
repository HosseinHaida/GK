const db = require("../db").Instance()
const moment = require("moment")

const { catchError } = require("./tools/catchError")

const { successMessage, status, error } = require("../helpers/status")
const { errMessages } = require("../helpers/errMessages")
const { fetchThisUser } = require("../helpers/db")
const { isEmpty } = require("../helpers/validations")

/**
 * Create a ticket
 * @returns {object} success msg
 */
const addTicket = async (req, res) => {
  const { user_id } = req.user
  const { title, text } = req.body

  try {
    const created_at = moment(new Date())

    if (isEmpty(text) || isEmpty(title))
      return catchError(errMessages.emptyFileds, "bad", res)

    await db("tickets").insert({
      title,
      body: text,
      created_by: user_id,
      created_at,
    })

    return res.status(status.success).send()
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Fetch tickets
 * @returns {object} list of unanswered tickets
 */
const fetchTickets = async (req, res) => {
  const { email } = req.user

  try {
    const thisUser = await fetchThisUser(email)

    if (!thisUser) {
      error.message = "userNotFound"
      return catchError(errMessages.userNotFound, "notfound", res, error)
    }

    if (!thisUser.is_admin) {
      error.message = "notAuthorized"
      return catchError(errMessages.notAuthorized, "bad", res, error)
    }

    const records = await db
      .from("tickets")
      .select(
        "tickets.id",
        "is_replied",
        "title",
        "body",
        "created_by",
        "tickets.created_at",
        "users.id as uid",
        "username",
        "email",
        "photo"
      )
      .join("users", "created_by", "=", "users.id")
      .where({ is_replied: false })

    successMessage.records = records
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

module.exports = {
  addTicket,
  fetchTickets,
}
