// convert Persian numbers to English
const p2e = (s) => String(s).replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))

// convert English numbers to Persian
const e2p = (s) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d])

module.exports = {
  p2e,
  e2p,
}
