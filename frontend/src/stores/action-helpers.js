import { messages } from "./messages";

export const catchError = (error) => {
  if (!error.response)
    return {
      status: "error",
      message: messages.noConn,
    };
  if (error.response.data.message)
    return {
      status: "error",
      message: error.response.data.message,
    };
  else
    return {
      status: "error",
      message: messages.default,
    };
};

export const sendMessage = (status, message, load = null) => {
  return { status, message, load };
};
