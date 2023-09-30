const express = require("express")

const {
  fetchUserPacks,
  fetchPacks,
  fetchPack,
  addPack,
  setStatus,
  deletePack,
  fetchPackIcons,
} = require("../controllers/packsController.js")

const verifyAuth = require("../middlewares/verifyAuth.js")

const router = express.Router()

// GET
router.get("/list", verifyAuth, fetchUserPacks)
router.get(
  "/list/:pack_status/:how_many/:page/:search_text",
  verifyAuth,
  fetchPacks
)
router.get("/:pack_id/icons", verifyAuth, fetchPackIcons)
router.get("/:id", fetchPack)

// POST
router.post("/add", verifyAuth, addPack)
router.post("/set", verifyAuth, setStatus)

// DELETE
router.delete("/:id", verifyAuth, deletePack)

module.exports = router
