const fullSubLimits = {
  none: 0,
  wheat: 150,
  bud: 75,
  seed: 30,
}

const subLabels = {
  wheat: "گندم",
  bud: "جوانه",
  seed: "بذر",
}

const subPrices = {
  wheat: 79000,
  bud: 59000,
  seed: 29000,
}

const rialPerDownload = 3274 // rial

const zarinpalMerchantID = "b943acda-7406-4acd-b86b-8e70447c24c7"
const zarinpalAccessToken = "b943acda-7406-4acd-b86b-8e70447c24c7"

const zarinpalStartPaymentURL =
  process.env.SERVER_URL.indexOf("localhost") > -1
    ? "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentRequest.json"
    : "https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json"

const zarinpalPaymentPrefixURL =
  process.env.SERVER_URL.indexOf("localhost") > -1
    ? "https://sandbox.zarinpal.com/pg/StartPay/"
    : "https://www.zarinpal.com/pg/StartPay/"

const zarinpalVerifyPaymentURL =
  process.env.SERVER_URL.indexOf("localhost") > -1
    ? "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentVerification.json"
    : "https://www.zarinpal.com/pg/rest/WebGate/PaymentVerification.json"

const successfulPurchaseURL = `${process.env.SERVER_URL}${
  process.env.SERVER_URL.indexOf("localhost") > -1
    ? ":" + process.env.QUASAR_DEV_PORT
    : ""
}/payment/verify`

module.exports = {
  fullSubLimits,
  subLabels,
  subPrices,
  rialPerDownload,
  zarinpalMerchantID,
  zarinpalAccessToken,
  zarinpalStartPaymentURL,
  zarinpalPaymentPrefixURL,
  zarinpalVerifyPaymentURL,
  successfulPurchaseURL,
}
