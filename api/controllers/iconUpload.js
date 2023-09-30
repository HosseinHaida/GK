const multer = require("multer")
var fs = require("fs")

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userIconsFolder = process.env.SVG_DIR + req.pack_owner
    const userThumbsFolder =
      process.env.UPLOAD_DIR +
      process.env.UPLOAD_DIR_ICONS +
      "/" +
      req.pack_owner
    // Create folder for user icons if not already existing
    if (!fs.existsSync(userIconsFolder)) fs.mkdirSync(userIconsFolder)
    if (!fs.existsSync(userThumbsFolder)) fs.mkdirSync(userThumbsFolder)
    cb(null, userIconsFolder)
  },
  filename: function (req, file, cb) {
    const fileNameSplitedByDots = file.originalname.split(".")
    const fileFormat = fileNameSplitedByDots[fileNameSplitedByDots.length - 1]
    const fileNameToBeSaved =
      Math.floor(Math.random() * 1000000000000000) + "." + fileFormat
    cb(null, fileNameToBeSaved)
    req.uploaded_icon_name = fileNameToBeSaved
  },
})

const upload = multer({
  storage,
}).single("icon")

module.exports = {
  upload,
}
