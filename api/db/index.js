const Knex = require("knex")
const DbConfig = require("../knexfile")
const { env } = require("../config")
const { attachPaginate } = require("knex-paginate")

let knexInstance
attachPaginate()

function Instance() {
  if (!knexInstance) {
    knexInstance = Knex(DbConfig[env])
  }
  return knexInstance
}

module.exports = {
  Instance,
}
