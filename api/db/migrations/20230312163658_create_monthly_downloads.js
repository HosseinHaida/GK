module.exports.up = async function (knex) {
  await knex.schema.createTable("monthly_downloads", (table) => {
    table.increments("id")
    table.integer("user_id")
    table.integer("icon_id")
    table.string("yyyy_mm", 7)
    table.text("quality")
    table.boolean("is_premium")
    table.timestamp("created_at")
    table.boolean("has_happened_before")
    table.integer("owner").references("users.id")
    table.foreign("user_id").references("users.id")
    table.foreign("icon_id").references("icons.id")
    table.index("yyyy_mm", "idx_yyy_mm", "btree")
    table.index("created_at", "idx_created_at", "btree")
    table.index("is_premium", "idx_is_premium", "btree")
    // table.specificType("counts", "text ARRAY").notNullable() // example: "{'64:35','128:45', '512:50', '1024:55', 'svg:20'}"
  })
}

module.exports.down = async function down(knex) {
  await knex.schema.dropTable("monthly_downloads")
}
