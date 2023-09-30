import { Notify } from "quasar";

export const notifError = (message, icon) => {
  Notify.create({
    message,
    color: "negative",
    classes: "text-bold",
    icon,
    iconColor: "white",
    progress: true,
    actions: [
      {
        size: "sm",
        icon: "close",
        color: "white",
        handler: () => {
          /* ... */
        },
      },
    ],
  });
};

export const notifPrimary = (message, icon) => {
  Notify.create({
    message,
    color: "primary",
    classes: "text-bold",
    icon,
    iconColor: "white",
    progress: true,
    actions: [
      {
        size: "sm",
        icon: "close",
        color: "white",
        handler: () => {
          /* ... */
        },
      },
    ],
  });
};
