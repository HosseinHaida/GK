import { notifPrimary } from "src/util/notify";
import { messages } from "./messages";

// convert Persian numbers to English
export const p2e = (s) =>
  String(s).replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));

// convert English numbers to Persian
export const e2p = (s) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);

// get Persian date yyyy full_month dd
export const getDate = (moment) =>
  new Date(moment).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

// get time
export const getTime = (moment) => {
  const d = new Date(moment);
  const mm = d.getMinutes();
  const hh = d.getHours();
  return `${hh < 10 ? "0" + hh : hh}:${mm < 10 ? "0" + mm : mm}`;
};

export const onCopyPhrase = (val) => {
  navigator.clipboard.writeText(val);
  notifPrimary(messages.copiedToClipboard, "content_copy");
};
