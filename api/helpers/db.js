const db = require("../db").Instance()

/**
 * Where clause for DB queries
 * @param {integer} id
 * @returns {object} string [where clause]
 */
const whereClause = (col, srch_txt) =>
  `LOWER(${col}) LIKE '%${srch_txt.toLowerCase()}%'`
const arrayWhereClause = (col, srch_txt) =>
  `LOWER(array_to_string(${col}, ', ')) LIKE '%${srch_txt.toLowerCase()}%'`

/**
 * Fetch user from DB
 * @param {integer} id
 * @returns {object} user object
 */
const fetchThisUser = async (value) =>
  await db
    .select("*")
    .from({ u: "users" })
    .where(function () {
      this.where("u.email", value).orWhere("u.username", value)
    })
    .first()

/**
 * Check if user is_admin
 * @param {integer} id
 * @returns {object} boolean
 */
const checkIfAdmin = async (id, res) => {
  const ifAdmin = await db("users")
    .select("email", "username")
    .where({ id, is_admin: true })

  return ifAdmin.length < 1 ? false : true
}

module.exports = {
  whereClause,
  arrayWhereClause,
  fetchThisUser,
  checkIfAdmin,
}
