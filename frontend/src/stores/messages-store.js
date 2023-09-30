import { defineStore } from "pinia";
import { apiUrl } from "./variables";
import { messages } from "./messages";
import { useUserStore } from "./users-store";

import { catchError, sendMessage } from "./action-helpers";
import axios from "axios";

export const useMessagesStore = defineStore("messagesStore", {
  state: () => ({
    fetchMessagesPending: false,
    sendMessagePending: false,
    messages: [],
    auth: useUserStore(),
  }),
  actions: {
    // Logic needs testing
    async fetchMessages() {
      this.fetchMessagesPending = true;
      return await axios
        .get(apiUrl + "/messages/fetch", {
          headers: {
            token: this.auth.t,
          },
        })
        .then(
          (res) => {
            this.fetchMessagesPending = false;
            this.messages = res.data.records;
            return sendMessage("success", messages.messagesFetched);
          },
          (error) => {
            this.fetchMessagesPending = false;
            return catchError(error);
          }
        );
    },
    async sendMessage(load) {
      this.sendMessagePending = true;
      return await axios
        .post(apiUrl + "/messages/add", load, {
          headers: {
            token: this.auth.t,
          },
        })
        .then(
          (res) => {
            this.sendMessagePending = false;
            return sendMessage("success", messages.messageSent);
          },
          (error) => {
            this.sendMessagePending = false;
            return catchError(error);
          }
        );
    },
  },
});
