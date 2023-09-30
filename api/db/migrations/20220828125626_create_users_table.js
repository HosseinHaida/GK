module.exports.up = async function (knex) {
  await knex.schema.createTable("users", (table) => {
    table.increments("id")
    // Auth
    table.text("email").notNullable().unique()
    table.text("username").unique()
    table.text("password_hash")
    table.boolean("is_g_auth").defaultTo(false)
    table.boolean("verified").defaultTo(false)
    table.boolean("is_admin").defaultTo(false)
    table.boolean("agreed").defaultTo(false)
    // General
    table.text("phone")
    table.text("first_name")
    table.text("last_name")
    table.text("photo")
    // Subscription
    table.text("subscription").defaultTo("none")
    table.text("sheba")
    // Meta
    table.text("bio")
    table.text("gender")
    table.text("city")
    // Times
    table.timestamp("subscribed_at")
    table.timestamp("created_at")
    table.timestamp("updated_at")
    table.integer("updated_by")
  })
}

module.exports.down = async function down(knex) {
  await knex.schema.dropTable("users")
}

//   table.integer('height').notNullable()
//   table.specificType('sports', 'text ARRAY').notNullable()
//   table.specificType('friends', 'integer ARRAY')
