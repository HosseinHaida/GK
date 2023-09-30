const express = require("express")

const {
  uploadIcon,
  fetchTempIcons,
  searchIcons,
  fetchMeta,
  fetchSimulars,
  downloadIcon,
  updateIcon,
  removeTempIcons,
  removeIcon,
} = require("../controllers/iconsController.js")

const verifyAuth = require("../middlewares/verifyAuth.js")

const router = express.Router()

// GET
router.get("/fetch/:page/:how_many/:search_text?", searchIcons)
router.get("/temp", verifyAuth, fetchTempIcons)
router.get("/fetch_simulars/:id", fetchSimulars)
router.get("/download/:id/:resolution", downloadIcon)

// POST
router.post("/meta/:id", fetchMeta)
router.post("/upload/:pack_id?", verifyAuth, uploadIcon)
router.post("/update", verifyAuth, updateIcon)

// DELETE
router.delete("/temp", verifyAuth, removeTempIcons)
router.delete("/:icon_id", verifyAuth, removeIcon)

module.exports = router
