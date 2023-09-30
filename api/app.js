var createError = require("http-errors")
const cors = require("cors")
var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")

var usersRouter = require("./routes/users")
var packsRouter = require("./routes/packs")
var iconsRouter = require("./routes/icons")
var ticketsRouter = require("./routes/tickets")
var messagesRouter = require("./routes/messages")
var paymentsRouter = require("./routes/payments")

var app = express()

app.use(cors())

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(express.static(path.join(__dirname, process.env.UPLOAD_DIR)))

app.use("/api/v1/auth", usersRouter)
app.use("/api/v1/icons", iconsRouter)
app.use("/api/v1/packs", packsRouter)
app.use("/api/v1/tickets", ticketsRouter)
app.use("/api/v1/messages", messagesRouter)
app.use("/api/v1/payments", paymentsRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "dev" ? err : {}

  // render the error page
  res.status(err.status || 500)
  // res.render("error")
})

module.exports = app
