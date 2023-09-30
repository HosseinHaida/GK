const express = require("express")

const {
  signup,
  signin,
  fetchUser,
  googleSignin,
  updateUser,
  checkUsernameDuplicate,
  agreeOnTerms,
  saveSheba,
  fetchSubsMeta,
  startPayment,
  verifyPayment,
  fetchFinances,
  // setPhoto,
} = require("../controllers/usersController.js")

const verifyAuth = require("../middlewares/verifyAuth.js")

const router = express.Router()

// GET
router.get("/fetch", verifyAuth, fetchUser)
router.get("/check/:username?", verifyAuth, checkUsernameDuplicate)
router.get("/fetch/subs/meta", verifyAuth, fetchSubsMeta)
router.get("/fetch/finances/:type", verifyAuth, fetchFinances)

// POST
router.post("/signup", signup)
router.post("/signin", signin)
router.post("/g_signin", googleSignin)
router.post("/agree/on/terms", verifyAuth, agreeOnTerms)
router.post("/save/sheba", verifyAuth, saveSheba)
router.post("/subscribe", verifyAuth, startPayment)
router.post("/payment/check", verifyPayment)

// PUT
router.put("/update", verifyAuth, updateUser)

module.exports = router
