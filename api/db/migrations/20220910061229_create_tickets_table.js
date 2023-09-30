module.exports.up = async function (knex) {
  await knex.schema.createTable("tickets", (table) => {
    table.increments("id")
    table.text("body")
    table.text("title")
    table.integer("created_by").notNullable()
    table.timestamp("created_at")
    table.boolean("is_replied").defaultTo(false)
    table.foreign("created_by").references("users.id")
  })
}

module.exports.down = async function down(knex) {
  await knex.schema.dropTable("tickets")
}
