export const apiUrl = "http://localhost:3060/api/v1";
// export const apiUrl = "https://vecthor.ir/api/v1";
export const serverUrl = "https://vecthor.ir";

export const rialPerDownload = 3274;

export const perPageResults = 44;
export const perPagePacksResults = 5;

export const packStates = {
  pending: {
    action_label: "در حال بررسی",
    label: "در حال بررسی",
    color: "grey-5",
    icon: "hourglass_top",
    value: "pending",
  },
  rejected: {
    action_label: "رد کردن",
    label: "رد شده",
    color: "negative",
    icon: "thumb_down_alt",
    value: "rejected",
  },
  approved: {
    action_label: "تایید",
    label: "تایید شده",
    color: "positive",
    icon: "done_all",
    value: "approved",
  },
  revisable: {
    action_label: "نیاز به اصلاح",
    label: "نیاز به اصلاح",
    color: "warning",
    icon: "edit_calendar",
    value: "revisable",
  },
};

export const paymentStates = {
  pending: {
    label: "پرداخت نشده",
    color: "negative",
    value: "pending",
  },
  paid: {
    label: "پرداخت شده",
    color: "positive",
    value: "paid",
  },
};

export const iconStyles = {
  flat: "تخت",
  filled: "توپُر",
  outlined: "دورخط",
  handwritten: "دست‌خط",
  hollow: "توخالی",
};

export const iconColors = {
  black: "مشکی",
  multiple: "رنگی",
};

export const subscriptions = {
  none: "بدون اشتراک",
  wheat: "گندم",
  bud: "جوانه",
  seed: "بذر",
};
