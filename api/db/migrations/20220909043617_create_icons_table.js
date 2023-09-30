module.exports.up = async function (knex) {
  await knex.schema.createTable("icons", (table) => {
    table.increments("id").unique()
    table.integer("pack_id")
    table.text("name").notNullable()
    table.text("raw_name").notNullable()
    table.specificType("keywords", "text ARRAY")
    table.text("name_en")
    table.text("thumbnail_url")
    table.text("watermark_url")
    table.text("status")
    table.timestamp("created_at")
    table.integer("created_by").notNullable()
    table.timestamp("updated_at")
    table.integer("updated_by")
    table.integer("download_count").defaultTo(0)
    table.timestamp("last_download_at")
    table.boolean("is_temp").defaultTo(true)
    table.specificType("meta", "text ARRAY")
    table.foreign("pack_id").references("packs.id")
    table.foreign("created_by").references("users.id")
  })
}

module.exports.down = async function down(knex) {
  await knex.schema.dropTable("icons")
}
