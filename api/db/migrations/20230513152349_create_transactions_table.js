module.exports.up = async function (knex) {
  await knex.schema.createTable("transactions", (table) => {
    table.increments("id")
    table.integer("user_id")
    table.string("authority")
    table.string("sub")
    table.integer("price")
    table.string("ref")
    table.timestamp("created_at")
    table.foreign("user_id").references("users.id")
  })
}

module.exports.down = async function down(knex) {
  await knex.schema.dropTable("transactions")
}
