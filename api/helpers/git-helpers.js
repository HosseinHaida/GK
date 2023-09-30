const { execSync } = require("child_process")

const getBranch = () => {
  return execSync("git rev-parse --abbrev-ref HEAD")
    .toString("utf8")
    .replace(/[\n\r\s]+$/, "")
}

module.exports = { getBranch }
