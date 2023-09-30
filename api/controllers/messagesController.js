const db = require("../db").Instance()
const moment = require("moment")
// const fs = require("fs")

// const { isEmpty } = require("../helpers/validations")
const { catchError } = require("./tools/catchError")

const { successMessage, status, error } = require("../helpers/status")
const { errMessages } = require("../helpers/errMessages")
const { fetchThisUser } = require("../helpers/db")

/**
 * Fetch messages intended for a user
 * @returns {object} success msg
 */
const fetchMessages = async (req, res) => {
  const { user_id } = req.user

  try {
    const records = await db
      .from("messages")
      .select(
        "tickets.id",
        "for",
        "reply_to",
        "messages.body",
        "messages.title",
        "messages.created_by",
        "messages.created_at",
        "users.username as message_from"
      )
      // if this message was intentionally for this user_id
      .where({ for: user_id })
      // or if this message replies a ticket that was initially created by this user_id
      .orWhere({ "tickets.created_by": user_id })
      .join("tickets", "tickets.id", "=", "messages.reply_to")
      .join("users", "users.id", "=", "messages.created_by")

    successMessage.records = records
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Send a messages to a user (reply a ticket) [by an admin]
 * @returns {object} success msg
 */
const addMessage = async (req, res) => {
  const { user_id, email } = req.user
  const { ticketId, message } = req.body

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

    const created_at = moment(new Date())

    const thisTicket = await db("tickets")
      .select("title")
      .where({ id: +ticketId })
      .first()

    await db
      .transaction(async function (trx) {
        await db("messages")
          .transacting(trx)
          .insert({
            body: message,
            reply_to: ticketId,
            created_by: user_id,
            created_at,
            title: thisTicket.title,
          })
          .then(
            async (resp) =>
              // Update icons and set their new pack_id
              await db("tickets")
                .transacting(trx)
                .where({ id: ticketId })
                .update({ is_replied: true })
          )
          .then(trx.commit)
          .catch(trx.rollback)
      })
      .then(
        (resp) => resp // Transaction Complete
      )
      .catch(function (err) {
        return catchError(errMessages.transactionFailed, "error", res, err)
      })

    return res.status(status.success).send()
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

module.exports = {
  fetchMessages,
  addMessage,
}
