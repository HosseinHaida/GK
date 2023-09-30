const express = require("express")

const {
  fetchPayments,
  fetchPayment,
  updatePayment,
} = require("../controllers/paymentsController.js")

const verifyAuth = require("../middlewares/verifyAuth.js")

const router = express.Router()

// Routes
router.get(
  "/fetch/:payment_status/:year/:month/:search_text",
  verifyAuth,
  fetchPayments
)
router.get("/fetch/:year/:month/:user_id", verifyAuth, fetchPayment)
router.post("/update", verifyAuth, updatePayment)

module.exports = router
