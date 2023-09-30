const db = require("../db").Instance()
const moment = require("moment")
const fs = require("fs")
const sharp = require("sharp")

// const { isEmpty } = require("../helpers/validations")
const { catchError } = require("./tools/catchError")

const {
  isEmpty,
  containsPersian,
  isAllPersian,
} = require("../helpers/validations")
const { successMessage, status, error } = require("../helpers/status")
const { upload } = require("./iconUpload")
const multer = require("multer")
const { errMessages } = require("../helpers/errMessages")
const {
  whereClause,
  arrayWhereClause,
  fetchThisUser,
  checkIfAdmin,
} = require("../helpers/db")
const { fullSubLimits } = require("../helpers/variables")
const { p2e } = require("../helpers/strings")

/**
 * Main Search
 * @returns {object} icons objects array
 *
 */
const searchIcons = async (req, res) => {
  let { search_text, page, how_many } = req.params

  try {
    const selectQuery = db
      .select(
        "id",
        "pack_id",
        "name",
        db.raw(`REPLACE(name, 'آ', 'ا') as "name_simple_a"`),
        db.raw(`REPLACE(name, 'ا', 'آ') as "name_decorated_a"`),
        db.raw(`REPLACE(name, 'ی', 'ئ') as "name_hamze"`),
        db.raw(`REPLACE(name, 'ئ', 'ی') as "name_simple_ye"`),
        "keywords",
        "name_en",
        "thumbnail_url",
        "watermark_url",
        "download_count",
        "status",
        "created_at",
        "created_by",
        "updated_at",
        "updated_by",
        "is_temp",
        "meta"
      )
      .from("icons")
      .as("select_query")

    const query = db.select("*").from(selectQuery)

    if (!isEmpty(search_text)) {
      search_text = search_text.replace("ایکون", "")
      search_text = search_text.replace("آیکون", "")
      search_text = search_text.replace("لوگو", "")
    }

    if (!isEmpty(search_text)) {
      query.where(function () {
        this.whereRaw(whereClause("name", search_text))
          .orWhereRaw(whereClause("name_simple_a", search_text))
          .orWhereRaw(whereClause("name_decorated_a", search_text))
          .orWhereRaw(whereClause("name_hamze", search_text))
          .orWhereRaw(whereClause("name_simple_ye", search_text))
          .orWhereRaw(whereClause("name_en", search_text))
          .orWhereRaw(arrayWhereClause("keywords", search_text))
      })
    }
    query.andWhere({ status: "approved" })

    if (!isEmpty(search_text))
      query.orderByRaw(`
    CASE
      WHEN name = '${search_text}' THEN 0
      WHEN name = '${search_text}%' THEN 1
      WHEN name_simple_a = '${search_text}' THEN 2
      WHEN name_decorated_a = '${search_text}' THEN 3
      WHEN name_hamze = '${search_text}' THEN 4
      WHEN name_simple_ye = '${search_text}' THEN 5
      WHEN LOWER(name_en) = '${search_text.toLowerCase()}' THEN 6
      WHEN keywords @> ARRAY['${search_text}'] AND keywords <@ ARRAY['${search_text}'] THEN 7
      WHEN keywords @> ARRAY['${search_text}'] THEN 8
      WHEN LOWER(array_to_string(keywords, ', ')) LIKE '%${search_text.toLowerCase()}%' THEN 9
      ELSE 10
    END
    `)

    const icons = await query.paginate({
      perPage: Number(how_many),
      currentPage: Number(page),
    })

    successMessage.records = icons.data
    successMessage.pagination = icons.pagination
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Fetch Temporary Uploaded Icons For The Authed User
 * @returns {object} success msg
 */
const fetchTempIcons = async (req, res) => {
  const { user_id } = req.user

  try {
    const tempIcons = await db("icons")
      .select(
        "id",
        "thumbnail_url",
        "watermark_url",
        "name",
        "name_en",
        "keywords"
      )
      .where({ is_temp: true, created_by: user_id })

    successMessage.records = tempIcons
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Upload Icons
 * @returns {object} success msg
 */
const uploadIcon = async (req, res) => {
  const { user_id, email } = req.user
  const { pack_id } = req.params

  const thisUser = await fetchThisUser(email)
  if (
    isEmpty(thisUser.first_name) ||
    isEmpty(thisUser.last_name) ||
    isEmpty(thisUser.username) ||
    isEmpty(thisUser.phone)
  )
    return catchError(errMessages.fillYourProfileFirst, "bad", res)
  if (isEmpty(thisUser.sheba) || thisUser.sheba.length < 26)
    return catchError(errMessages.incorrectSheba, "bad", res)

  let thisPack
  try {
    if (pack_id && !isEmpty(pack_id))
      thisPack = await db("packs")
        .select("created_by", "status")
        .where({ id: pack_id })
        .first()

    if (!thisUser.is_admin && !isEmpty(pack_id))
      if (thisPack.created_by !== user_id)
        return catchError(errMessages.notAuthorized, "bad", res)

    req.pack_owner = isEmpty(pack_id) ? user_id : thisPack.created_by
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }

  // Upload the icon to ../svg/[pack_owner]
  upload(req, res, async (err) => {
    const { name, nameEN, keywords } = req.body

    if (isEmpty(name) || isEmpty(nameEN) || isEmpty(keywords))
      return catchError(errMessages.emptyFileds, "bad", res)

    if (!isAllPersian(name))
      return catchError(errMessages.onlyPersianForIconName, "bad", res)

    if (containsPersian(nameEN))
      return catchError(errMessages.iconNameENContainsPersian, "bad", res)

    if (err instanceof multer.MulterError) {
      return catchError(errMessages.uploadFailed, "error", res, err)
    } else if (err) {
      return catchError(errMessages.sysErrorWhenUploading, "error", res, err)
    }
    // Everything went fine with multer and uploading
    const iconGenericName = req.uploaded_icon_name

    if (!iconGenericName) {
      return catchError(errMessages.issuesSavingPhoto, "error", res)
    }
    try {
      // Generate URLs to be saved with user in DB
      const relativePathToUserIconsDir = `${process.env.UPLOAD_DIR}${process.env.UPLOAD_DIR_ICONS}${req.pack_owner}`
      const relativePathToSVGIcon = `${process.env.SVG_DIR}${req.pack_owner}/${iconGenericName}`
      const thumbnailName = `${String(iconGenericName.slice(0, 4))}${String(
        Math.floor(Math.random() * 100000000000)
      )}`

      const relativePathToBeThumbnail = `${relativePathToUserIconsDir}/${thumbnailName}`
      const relativePathToBeWatermark = relativePathToBeThumbnail + "_wm"

      const isThumbnailSuccess = createThumbnailImage(
        relativePathToSVGIcon,
        relativePathToBeThumbnail
      )

      if (!isThumbnailSuccess)
        return catchError(errMessages.iconResizeFailed, "error", res)

      const isWatermarkSuccess = await createWatermarkedImage(
        relativePathToSVGIcon,
        relativePathToBeWatermark
      )
      if (!isWatermarkSuccess)
        return catchError(errMessages.iconResizeFailed, "error", res)

      const thumbnail_url = `${process.env.SERVER_URL}:${process.env.PORT}/${process.env.UPLOAD_DIR_ICONS}${req.pack_owner}/${thumbnailName}.png`
      const watermark_url = `${process.env.SERVER_URL}:${process.env.PORT}/${process.env.UPLOAD_DIR_ICONS}${req.pack_owner}/${thumbnailName}_wm.png`

      // const thumbnail_url = `${process.env.SERVER_URL}/${process.env.UPLOAD_DIR_ICONS}${req.pack_owner}/${thumbnailName}.png`
      // const watermark_url = `${process.env.SERVER_URL}/${process.env.UPLOAD_DIR_ICONS}${req.pack_owner}/${thumbnailName}_wm.png`

      const created_at = moment(new Date())

      // Create an array of strings from a string containing commas (,)
      const keywords_array = keywords.split(",")

      await db("icons").insert({
        thumbnail_url,
        watermark_url,
        name,
        name_en: nameEN,
        keywords: keywords_array,
        raw_name: iconGenericName,
        created_by: req.pack_owner,
        created_at,
        status: isEmpty(pack_id) ? "pending" : thisPack.status,
        is_temp: isEmpty(pack_id) ? true : false,
        pack_id: isEmpty(pack_id) ? null : pack_id,
      })

      let tempIcons
      if (isEmpty(pack_id)) {
        tempIcons = await db("icons")
          .select(
            "id",
            "thumbnail_url",
            "watermark_url",
            "name",
            "name_en",
            "keywords"
          )
          .where({ is_temp: true, created_by: req.pack_owner })

        successMessage.records = tempIcons
      }

      return res.status(status.success).send(successMessage)
    } catch (error) {
      return catchError(errMessages.operationFailed, "error", res, error)
    }
  })
}

/**
 * Update TempIcon
 * @returns {object} success msg
 */
const updateIcon = async (req, res) => {
  const { user_id, email } = req.user
  const { id, name, name_en, keywords } = req.body

  if (isEmpty(id) || isEmpty(name) || isEmpty(name_en) || isEmpty(keywords))
    return catchError(errMessages.emptyFileds, "bad", res)

  if (!isAllPersian(name))
    return catchError(errMessages.onlyPersianForIconName, "bad", res)

  if (containsPersian(name_en))
    return catchError(errMessages.iconNameENContainsPersian, "bad", res)

  try {
    const thisIcon = await db("icons")
      .select("created_by")
      .where({ id })
      .first()

    const thisUser = await fetchThisUser(email)

    if (thisIcon.created_by !== user_id && !thisUser.is_admin)
      return catchError(errMessages.notAuthorized, "bad", res)

    await db("icons").update({ name, name_en, keywords }).where({ id })

    const tempIcons = await db("icons")
      .select(
        "id",
        "thumbnail_url",
        "watermark_url",
        "name",
        "name_en",
        "keywords"
      )
      .where({ is_temp: true, created_by: user_id })

    successMessage.records = tempIcons

    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Remove Temporarily Uploaded Icons
 * @returns {object} success msg
 */
const removeTempIcons = async (req, res) => {
  const { user_id } = req.user

  try {
    // Fetch temp icons belonging to this user
    const tempIcons = await db("icons")
      .select("id", "raw_name", "thumbnail_url", "watermark_url")
      .where({ created_by: user_id, is_temp: true })

    tempIcons.forEach((tempIcon) => {
      let success = true
      let relPathToUserSVGDir = process.env.SVG_DIR + user_id + "/"
      let relPathToUserDir =
        process.env.UPLOAD_DIR + process.env.UPLOAD_DIR_ICONS + user_id + "/"

      let relPathToTempSVG = relPathToUserSVGDir + tempIcon.raw_name
      let relPathToTempThumbnail =
        relPathToUserDir +
        tempIcon.thumbnail_url.substring(
          tempIcon.thumbnail_url.lastIndexOf("/") + 1,
          tempIcon.thumbnail_url.length
        )
      let relPathToTempWatermark =
        relPathToUserDir +
        tempIcon.watermark_url.substring(
          tempIcon.watermark_url.lastIndexOf("/") + 1,
          tempIcon.watermark_url.length
        )

      // Delete the tempIcon
      fs.unlink(relPathToTempSVG, function (err) {
        if (err) success = false
      })
      fs.unlink(relPathToTempThumbnail, function (err) {
        if (err) success = false
      })
      fs.unlink(relPathToTempWatermark, function (err) {
        if (err) success = false
      })

      if (!success)
        return catchError(
          errMessages.couldNotDeleteTempIcon + "_with_id_of_" + tempIcon.id,
          "error",
          res
        )
    })

    // Now also delete tempIcons from the db
    await db("icons").where({ created_by: user_id, is_temp: true }).del()
    return res.status(status.success).send()
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Remove An Icon
 * @returns {object} success msg
 */
const removeIcon = async (req, res) => {
  const { user_id } = req.user
  const { icon_id } = req.params

  try {
    const thisIcon = await db("icons")
      .select("id", "raw_name", "thumbnail_url", "watermark_url", "created_by")
      .where({ id: icon_id })
      .first()

    const isAdmin = checkIfAdmin(user_id, res)
    if (!isAdmin && user_id !== thisIcon.created_by) {
      error.message = "notAuthorized"
      return catchError(errMessages.notAuthorized, "bad", res, error)
    }

    let success = true
    let relPathToUserSVGDir = process.env.SVG_DIR + thisIcon.created_by + "/"
    let relPathToUserDir =
      process.env.UPLOAD_DIR +
      process.env.UPLOAD_DIR_ICONS +
      thisIcon.created_by +
      "/"

    let relPathToSVG = relPathToUserSVGDir + thisIcon.raw_name
    let relPathToThumbnail =
      relPathToUserDir +
      thisIcon.thumbnail_url.substring(
        thisIcon.thumbnail_url.lastIndexOf("/") + 1,
        thisIcon.thumbnail_url.length
      )
    let relPathToWatermark =
      relPathToUserDir +
      thisIcon.watermark_url.substring(
        thisIcon.watermark_url.lastIndexOf("/") + 1,
        thisIcon.watermark_url.length
      )

    // Delete the thisIcon
    fs.unlink(relPathToSVG, function (err) {
      if (err) success = false
    })
    fs.unlink(relPathToThumbnail, function (err) {
      if (err) success = false
    })
    fs.unlink(relPathToWatermark, function (err) {
      if (err) success = false
    })

    if (!success)
      return catchError(
        errMessages.couldNotDeleteTempIcon + "_with_id_of_" + tempIcon.id,
        "error",
        res
      )

    // Now also delete tempIcons from the db
    await db("icons").where({ id: icon_id }).del()
    return res.status(status.success).send()
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Fetch Meta(user & pack) for an Icon
 * @returns {object} success msg
 */
const fetchMeta = async (req, res) => {
  // const { user_id } = req.user
  const { id } = req.params
  const { name } = req.body

  try {
    const icon = await db("icons").select("*").where({ id }).first()

    let correctedName = ""
    if (icon.name.replace(/ /g, "_") !== name)
      correctedName = icon.name.replace(/ /g, "_")

    const user = await db("users")
      .select("username", "email", "photo", "first_name", "last_name")
      .where({ id: icon.created_by })
      .first()

    const pack = await db("packs")
      .select("name", "style", "name_en", "color", "keywords")
      .where({ id: icon.pack_id })
      .first()

    let record = { icon, user, pack }
    if (correctedName.length > 0) record.correctedName = correctedName
    successMessage.record = record
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

/**
 * Download an Icon based on user subscription
 * @returns {object} success msg
 */
const downloadIcon = async (req, res) => {
  const { id, resolution } = req.params

  // verify user
  const { token } = req.headers

  let user_id, email, thisUser
  if (!isEmpty(token))
    try {
      let jwt = require("jsonwebtoken")
      const decoded = jwt.verify(token, process.env.SECRET)
      user_id = decoded.user_id
      email = decoded.email
      thisUser = await fetchThisUser(email)
    } catch (error) {
      return catchError(errMessages.authFailed, "error", res, error)
    }

  let isPremium = false
  if (resolution === "svg" || resolution === "512" || resolution === "1024")
    isPremium = true
  if (isPremium && !user_id)
    return catchError(errMessages.needToSignInToDownload, "bad", res)
  if (isPremium && thisUser.subscription === "none")
    return catchError(errMessages.noActiveSubscriptionFound, "bad", res)

  try {
    const icon = await db("icons").select("*").where({ id }).first()
    const pack = await db("packs")
      .select("icons_download_count")
      .where({ id: icon.pack_id })
      .first()

    const relativePathToSVGIcon = `${process.env.SVG_DIR}${icon.created_by}/${icon.raw_name}`

    const now = moment(new Date())
    let filePath, b64

    if (thisUser && !thisUser.is_admin) {
      // Extract The Year from current date
      let yyyy = new Intl.DateTimeFormat("en-US-u-ca-persian", {
        year: "numeric",
      }).format(now)
      yyyy = yyyy.substring(0, 4)
      // Extract The Month from current date
      let mm = new Intl.DateTimeFormat("en-US-u-ca-persian", {
        month: "numeric",
      }).format(now)
      mm = mm < 10 ? "0" + mm : mm

      let simularDownloads = await db("monthly_downloads")
        .where({ user_id, icon_id: id })
        .count()
        .first()

      // const userSubDate = moment(thisUser.subscribed_at)
      const userPremiumDownloadsSinceLastSubscription = await db(
        "monthly_downloads"
      )
        .where("created_at", ">=", thisUser.subscribed_at)
        .where({ has_happened_before: false, user_id, is_premium: true })
        .count()
        .first()

      if (isPremium) {
        if (
          userPremiumDownloadsSinceLastSubscription.count >=
            fullSubLimits[thisUser.subscription] &&
          Number(simularDownloads.count) <= 0
        )
          return catchError(errMessages.subscriptionEnded, "bad", res)
      }

      if (user_id !== icon.created_by)
        await db("monthly_downloads").insert({
          user_id,
          icon_id: id,
          yyyy_mm: yyyy + "_" + mm,
          quality: resolution,
          is_premium: isPremium,
          created_at: now,
          has_happened_before: Number(simularDownloads.count) > 0,
          owner: icon.created_by,
        })

      if (isPremium && Number(simularDownloads.count) === 0) {
        let last_sub_dls =
          fullSubLimits[thisUser.subscription] -
          userPremiumDownloadsSinceLastSubscription.count -
          1

        await db("users").update({ last_sub_dls }).where({ id: user_id })

        // update payment record for the owner of the icon
        if (user_id !== icon.created_by) {
          const now = new Date().toLocaleDateString("fa-IR", {
            month: "2-digit",
            year: "numeric",
          })
          const yyyy = p2e(now.substring(0, now.indexOf("/")))
          const mm = p2e(now.substring(now.indexOf("/") + 1, now.length))
          let paymentRecord = await db("payments")
            .select("download_counts", "month", "year", "status", "user_id")
            .where({
              user_id: icon.created_by,
              status: "pending",
              year: yyyy,
              month: mm,
            })
            .first()
          if (!paymentRecord)
            await db("payments").insert({
              user_id: icon.created_by,
              month: mm,
              year: yyyy,
              download_counts: 1,
              status: "pending",
              created_at: moment(new Date()),
            })
          else {
            await db("payments")
              .update({
                download_counts: paymentRecord.download_counts + 1,
                updated_at: moment(new Date()),
              })
              .where({
                user_id: icon.created_by,
                status: "pending",
                year: yyyy,
                month: mm,
              })
          }
        }
        // update payment record done
      }
    }

    if (resolution === "svg") filePath = `${relativePathToSVGIcon}`
    else {
      b64 = await getIconPNGAtResolution(+resolution, relativePathToSVGIcon)
      if (!b64) return catchError(errMessages.iconDownloadFailed, "error", res)
    }

    if ((thisUser && !thisUser.is_admin) || !thisUser)
      await db
        .transaction(async function (trx) {
          await db("icons")
            .transacting(trx)
            .where({ id })
            .update({ download_count: icon.download_count + 1 })
            .then(
              async (resp) =>
                await db("packs")
                  .transacting(trx)
                  .where({ id: icon.pack_id })
                  .update({
                    icons_download_count: pack.icons_download_count + 1,
                  })
            )
            .then(trx.commit)
            .catch(trx.rollback)
        })
        .then(
          (resp) => resp // Transaction Complete
        )
        .catch(function (err) {
          return catchError(
            errMessages.downloadCountUpdateFailed,
            "error",
            res,
            err
          )
        })

    if (resolution === "svg")
      return res.status(status.success).download(filePath)
    else return res.status(status.success).send(b64)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

const fetchSimulars = async (req, res) => {
  const { id } = req.params

  try {
    const icon = await db("icons")
      .select("*")
      .where({ id: Number(id) })
      .first()

    let iconKeywords = `'${icon.keywords.join("','")}'`

    let simulars = await db("icons")
      .select("*")
      .where(function () {
        this.whereRaw(whereClause("name", icon.name)).orWhereRaw(
          whereClause("name_en", icon.name_en)
        )
      })
      .andWhereRaw(`id != ${icon.id}`)
      .andWhere({ status: "approved" })
      .orderByRaw(
        `
    CASE
      WHEN name = '${icon.name}' THEN 0
      WHEN name = '${icon.name}%' THEN 1
      WHEN name_en = '${icon.name_en}' THEN 2
      WHEN keywords @> ARRAY['${icon.name}'] AND keywords <@ ARRAY['${icon.name}'] THEN 3
      WHEN keywords @> ARRAY['${icon.name}'] THEN 4
      WHEN array_to_string(keywords, ', ') LIKE '%${icon.name}%' THEN 5
      ELSE 6
    END
    `
      )
      .limit(6)

    if (simulars.length < 6) {
      let simularsIds = []
      simulars.forEach((si) => simularsIds.push(si.id))
      simularsIds.push(icon.id)

      let otherSimulars = await db("icons")
        .select("*")
        .whereNotIn("id", simularsIds)
        .andWhereRaw(
          `keywords @> ARRAY['${icon.name}'] AND keywords <@ ARRAY['${icon.name}']`
        )
        // .andWhereRaw(`ARRAY[${iconKeywords}] && keywords`)
        .andWhere({ status: "approved" })

        .limit(6 - simulars.length)

      simulars = [...otherSimulars, ...simulars]
    }

    successMessage.records = simulars
    return res.status(status.success).send(successMessage)
  } catch (error) {
    return catchError(errMessages.operationFailed, "error", res, error)
  }
}

const getIconPNGAtResolution = async (resolution, relativePathToSVGIcon) => {
  return await sharp(relativePathToSVGIcon)
    .resize({ width: +resolution })
    .png()
    .withMetadata({
      exif: {
        IFD0: {
          Copyright: "VecThor",
        },
      },
    })
    .toBuffer({ resolveWithObject: true })
    .then(
      ({ data }) => Buffer.from(data).toString("base64") //Base64 encoded
    )
    .catch((err) => false)
}

const createThumbnailImage = (
  relativePathToSVGIcon,
  relativePathToBeThumbnail
) => {
  let ifSuccess = true
  try {
    sharp(relativePathToSVGIcon)
      .resize({ width: 128 })
      .png()
      .toFile(`${relativePathToBeThumbnail}.png`, function (err) {
        if (err) {
          console.log("createThumbnailImage Error: ", err)
          fs.unlink(relativePathToSVGIcon)
          ifSuccess = false
        }
      })
  } catch (error) {
    console.log("createThumbnailImage err: ", error)
    ifSuccess = false
  }
  return ifSuccess
}

const createWatermarkedImage = async (
  relativePathToSVGIcon,
  relativePathToBeWatermark
) => {
  let ifSuccess = true
  try {
    await sharp(relativePathToSVGIcon)
      .resize({ width: 512 })
      .png()
      .toBuffer({ resolveWithObject: true })
      .then(async ({ data, info }) => {
        let iconInfo = info
        let iconData = data
        return await sharp("../watermark.png")
          .resize({ width: 512, height: iconInfo.height })
          .toBuffer()
          .then((data) =>
            sharp(iconData)
              .composite([{ input: data }])
              .toFile(`${relativePathToBeWatermark}.png`, function (err) {
                if (err) fs.unlink(relativePathToSVGIcon)
              })
          )
      })
  } catch (error) {
    console.log("createWatermarkedImage err: ", error)
    ifSuccess = false
  }

  return ifSuccess
}

module.exports = {
  searchIcons,
  fetchTempIcons,
  uploadIcon,
  updateIcon,
  removeTempIcons,
  removeIcon,
  fetchMeta,
  downloadIcon,
  fetchSimulars,
}
