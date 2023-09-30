const express = require("express")

const {
  addMessage,
  fetchMessages,
} = require("../controllers/messagesController.js")

const verifyAuth = require("../middlewares/verifyAuth.js")

const router = express.Router()

// Routes
router.post("/add", verifyAuth, addMessage)
router.get("/fetch", verifyAuth, fetchMessages)

module.exports = router
