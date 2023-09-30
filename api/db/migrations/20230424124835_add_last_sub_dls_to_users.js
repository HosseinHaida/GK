module.exports.up = async function (knex) {
  return knex.schema.alterTable("users", function (table) {
    table.integer("last_sub_dls")
  })
}

module.exports.down = async function down(knex) {
  return knex.schema.alterTable("users", function (table) {
    table.dropColumn("last_sub_dls")
  })
}
