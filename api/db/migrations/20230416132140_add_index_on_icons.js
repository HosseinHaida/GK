module.exports.up = async function (knex) {
  return knex.schema.alterTable("icons", function (table) {
    table.index("name", "idx_name", "btree")
    table.index("name_en", "idx_name_en", "btree")
    table.index("keywords", "idx_keywords", "gin")
  })
}

module.exports.down = async function down(knex) {
  return knex.schema.alterTable("icons", function (table) {
    table.dropIndex("name", "idx_name")
    table.dropIndex("name_en", "idx_name_en")
    table.dropIndex("keywords", "idx_keywords")
  })
}
