const db = require("../db").Instance()
const moment = require("moment")
const fs = require("fs")

// const { isEmpty } = require("../helpers/validations")
const { catchError } = require("./tools/catchError")

const { successMessage, status, error } = require("../helpers/status")
const { errMessages } = require("../helpers/errMessages")
const { checkIfAdmin, whereClause, arrayWhereClause } = require("../helpers/db")
const {
  isEmpty,
  isAllPersian,
  containsPersian,
} = require("../helpers/validations")

/**
 * Fetch Users Packs
 * @returns {object} user packs as records
 */
const fetchUserPacks = async (req, res) => {
  const { user_id } = req.user
  try {
    const packs = await db("packs").select("*").where({ created_by: user_id })

    successMessage.records = packs
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Fetch Packs
 * @returns {object} packs as records
 * statuses are: 'pending', 'rejected', 'approved', 'revisable'
 */
const fetchPacks = async (req, res) => {
  const { user_id } = req.user
  const { pack_status, search_text, how_many, page } = req.params

  try {
    const isAdmin = checkIfAdmin(user_id, res)
    if (!isAdmin) {
      error.message = "notAuthorized"
      return catchError(errMessages.notAuthorized, "bad", res, error)
    }

    const query = db
      .from("packs")
      .select("packs.*", "users.username", "users.email")
      .join("users", "created_by", "=", "users.id")

    if (!isEmpty(search_text) && search_text !== "*") {
      // Change query to fetch icons based on search_text
      query.where(function () {
        this.whereRaw(whereClause("name", search_text))
          .orWhereRaw(whereClause("name_en", search_text))
          .orWhereRaw(arrayWhereClause("keywords", search_text))
      })
    }
    query.andWhere({ status: pack_status })

    const packs = await query.orderBy("packs.id", "desc").paginate({
      perPage: Number(how_many),
      currentPage: Number(page),
    })
    const packIds = []
    packs.data.forEach((pack) => packIds.push(pack.id))

    let columnsToFetch = [
      "id",
      "pack_id",
      "name",
      "keywords",
      "name_en",
      "thumbnail_url",
      "watermark_url",
      "status",
      "created_at",
      "created_by",
      "download_count",
      "is_temp",
      "meta",
    ]

    const iconsRaw = await db("icons")
      .select(columnsToFetch)
      .whereIn("pack_id", packIds)

    let icons = {}
    // add icons of each pack to the appropriate pack_id index in icons{}
    // like: {[PACK_ID_1]: [ICONS], [PACK_ID_2]: [ICONS]}
    iconsRaw.forEach((icon) => {
      if (!icons[icon.pack_id]) icons[icon.pack_id] = []
      icons[icon.pack_id].push(icon)
    })
    successMessage.records = { packs: packs.data, icons }
    successMessage.pagination = packs.pagination

    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Fetch Pack icons
 * @returns {object} icons as records
 */
const fetchPackIcons = async (req, res) => {
  const { user_id } = req.user
  const { pack_id } = req.params

  try {
    let columnsToFetch = [
      "id",
      "pack_id",
      "name",
      "keywords",
      "name_en",
      "thumbnail_url",
      "watermark_url",
      "status",
      "created_at",
      "created_by",
      "download_count",
      "is_temp",
      "meta",
    ]

    const icons = await db("icons").select(columnsToFetch).where({ pack_id })

    successMessage.records = icons

    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Fetch a Pack based on pack_id param
 * @returns {object} pack as record
 */
const fetchPack = async (req, res) => {
  const { id } = req.params
  let integerId = Number(id)
  if (!integerId) return catchError(errMessages.invalidPackId, "bad", res)

  try {
    const pack = await db.from("packs").where({ id }).first()

    if (!pack) return catchError(errMessages.packNotFound, "notfound", res)

    let columnsToFetch = [
      "id",
      "pack_id",
      "name",
      "keywords",
      "name_en",
      "thumbnail_url",
      "watermark_url",
      "status",
      "created_at",
      "created_by",
      "download_count",
      "is_temp",
      "meta",
    ]

    const creator = await db("users")
      .select("username", "email")
      .where({ id: pack.created_by })
      .first()
    pack.creator = creator

    const icons = await db
      .from("icons")
      .select(columnsToFetch)
      .where({ pack_id: id })

    successMessage.record = { pack, icons }

    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Add Pack
 * @returns {object} success msg
 */
const addPack = async (req, res) => {
  const { user_id } = req.user
  const { name, nameEN, keywords, style, color } = req.body

  if (isEmpty(name) || isEmpty(nameEN) || isEmpty(keywords))
    return catchError(errMessages.emptyFileds, "bad", res)

  if (!isAllPersian(name))
    return catchError(errMessages.onlyPersianForPackName, "bad", res)

  if (containsPersian(nameEN))
    return catchError(errMessages.packNameENContainsPersian, "bad", res)

  try {
    const now = moment(new Date())
    // Create an array of strings from a string containing commas (,)
    const keywords_array = keywords.split(",")

    await db
      .transaction(async function (trx) {
        await db("packs")
          .transacting(trx)
          .insert(
            {
              name,
              name_en: nameEN,
              keywords: keywords_array,
              style,
              color,
              status: "pending",
              created_by: user_id,
              created_at: now,
            },
            "id"
          )
          .then(
            async (resp) =>
              // Update icons and set their new pack_id
              await db("icons")
                .transacting(trx)
                .where({ is_temp: true, created_by: user_id })
                .update({
                  is_temp: false,
                  updated_at: now,
                  pack_id: resp[0].id,
                })
          )
          .then(trx.commit)
          .catch(trx.rollback)
      })
      .then(async (resp) => {
        // Transaction Complete
        // Fetch user packs and send
        const userPacks = await db("packs")
          .select()
          .where({ created_by: user_id })
        successMessage.records = userPacks
        return res.status(status.success).send(successMessage)
      })
      .catch(function (err) {
        return catchError(errMessages.transactionFailed, "error", res, err)
      })
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Set pack status
 * @returns {object} success msg
 */
const setStatus = async (req, res) => {
  const { user_id } = req.user
  const { packId, state, message, name, name_en, keywords, color, style } =
    req.body

  try {
    const isAdmin = checkIfAdmin(user_id, res)
    if (!isAdmin) {
      error.message = "notAuthorized"
      return catchError(errMessages.notAuthorized, "bad", res, error)
    }

    if (
      isEmpty(name) ||
      isEmpty(name_en) ||
      isEmpty(keywords) ||
      isEmpty(status)
    )
      return catchError(errMessages.emptyFileds, "bad", res)

    if (!isAllPersian(name))
      return catchError(errMessages.onlyPersianForPackName, "bad", res)

    if (containsPersian(name_en))
      return catchError(errMessages.packNameENContainsPersian, "bad", res)

    const now = moment(new Date())

    await db
      .transaction(async function (trx) {
        await db("packs")
          .update({
            status: state,
            updated_at: now,
            status_message: message,
            name,
            name_en,
            keywords,
            color,
            style,
          })
          .where({ id: packId })
          .then(
            async (resp) =>
              // Update icons and set their new status
              await db("icons")
                .where({ pack_id: packId })
                .update({ status: state })
          )
          .then(trx.commit)
          .catch(trx.rollback)
      })
      .then(
        (resp) => resp // Transaction Complete
      )
      .catch(function (err) {
        return catchError(errMessages.transactionFailed, "error", res, err)
      })

    return res.status(status.success).send()
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Delete Pack
 * @returns {object} success msg
 */
const deletePack = async (req, res) => {
  const { user_id } = req.user
  const { id } = req.params

  try {
    const isAdmin = checkIfAdmin(user_id, res)

    const thisPack = await db("packs")
      .select("created_by")
      .where({ id })
      .first()
    if (!isAdmin)
      if (thisPack && thisPack.created_by !== user_id) {
        error.message = "notAuthorized"
        return catchError(errMessages.notAuthorized, "bad", res, error)
      }

    // Fetch icons belonging to this pack[id]
    const packIcons = await db("icons")
      .select("raw_name", "watermark_url", "thumbnail_url", "created_by", "id")
      .where({ created_by: user_id, pack_id: id })

    let packIconIds = []
    packIcons.forEach((tempIcon) => {
      let success = true
      packIconIds.push(tempIcon.id)

      let relPathToUserDir =
        process.env.UPLOAD_DIR +
        process.env.UPLOAD_DIR_ICONS +
        thisPack.created_by +
        "/"

      let relPathToTempSVG = relPathToUserDir + tempIcon.raw_name

      let thumb_url = tempIcon.thumbnail_url
      let relPathToTempThumbnail =
        relPathToUserDir +
        thumb_url.substring(thumb_url.lastIndexOf("/") + 1, thumb_url.length)

      let wm_url = tempIcon.watermark_url
      let relPathToTempWatermark =
        relPathToUserDir +
        wm_url.substring(wm_url.lastIndexOf("/") + 1, wm_url.length)

      // Delete the icons
      fs.unlink(relPathToTempSVG, (err) => {
        if (err) success = false
      })
      fs.unlink(relPathToTempThumbnail, (err) => {
        if (err) success = false
      })
      fs.unlink(relPathToTempWatermark, (err) => {
        if (err) success = false
      })

      if (!success)
        return catchError(
          errMessages.couldNotDeleteTempIcon + "_with_id_of_" + tempIcon.id,
          "error",
          res,
          res
        )
    })

    await db
      .transaction(async function (trx) {
        await db("monthly_downloads")
          .transacting(trx)
          .whereIn("icon_id", packIconIds)
          .del()
          .then(
            async (resp) =>
              // Now Delete pack icons
              await db("icons").transacting(trx).where({ pack_id: id }).del()
          )
          .then(
            async (resp) =>
              // Now Delete pack itself
              await db("packs").transacting(trx).where({ id }).del()
          )
          .then(trx.commit)
          .catch(trx.rollback)
      })
      .then(
        (resp) => resp // Transaction Complete
      )
      .catch(function (err) {
        return catchError(errMessages.transactionFailed, "error", res, err)
      })

    return res.status(status.success).send()
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

module.exports = {
  fetchUserPacks,
  fetchPacks,
  fetchPackIcons,
  fetchPack,
  addPack,
  setStatus,
  deletePack,
}
