module.exports.up = async function (knex) {
  await knex.schema.createTable("packs", (table) => {
    table.increments("id")
    table.text("name").notNullable()
    table.text("status").notNullable()
    table.text("status_message")
    table.specificType("keywords", "text ARRAY")
    table.text("name_en")
    table.text("style")
    table.text("color")
    table.timestamp("created_at")
    table.integer("created_by").notNullable()
    table.timestamp("updated_at")
    table.integer("updated_by")
    table.integer("icons_download_count").defaultTo(0)
    table.specificType("meta", "text ARRAY")
    table.foreign("created_by").references("users.id")
  })
}

module.exports.down = async function down(knex) {
  await knex.schema.dropTable("packs")
}
