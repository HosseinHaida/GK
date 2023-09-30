const express = require("express")

const {
  addTicket,
  fetchTickets,
} = require("../controllers/ticketsController.js")

const verifyAuth = require("../middlewares/verifyAuth.js")

const router = express.Router()

// Routes
router.post("/add", verifyAuth, addTicket)
router.get("/fetch", verifyAuth, fetchTickets)

module.exports = router
