module.exports.up = async function (knex) {
  await knex.schema.createTable("payments", (table) => {
    table.increments("id")
    table.integer("user_id")
    table.string("month", 2)
    table.string("year", 4)
    table.integer("download_counts")
    table.string("status")
    table.string("ref_id")
    table.integer("rate_rial")
    table.integer("total_rial")
    table.timestamp("created_at")
    table.timestamp("updated_at")
    table.foreign("user_id").references("users.id")
    table.index(["year", "month"], "idx_year_month", "btree")
  })
}

module.exports.down = async function down(knex) {
  await knex.schema.dropTable("payments")
}
