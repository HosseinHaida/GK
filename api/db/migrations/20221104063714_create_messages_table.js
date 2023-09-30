module.exports.up = async function (knex) {
  await knex.schema.createTable("messages", (table) => {
    table.increments("id")
    table.integer("for")
    table.integer("reply_to") // which ticket is it answering
    table.text("body")
    table.text("title")
    table.integer("created_by").notNullable()
    table.timestamp("created_at")
    table.foreign("created_by").references("users.id")
  })
}

module.exports.down = async function down(knex) {
  await knex.schema.dropTable("messages")
}
