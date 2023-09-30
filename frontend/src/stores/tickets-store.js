import { defineStore } from "pinia";
import { apiUrl } from "./variables";
import { messages } from "./messages";
import { useUserStore } from "./users-store";

import { catchError, sendMessage } from "./action-helpers";
import axios from "axios";

export const useTicketsStore = defineStore("ticketsStore", {
  state: () => ({
    sendingTicket: false,
    fetchTicketsPending: false,
    tickets: null,
    auth: useUserStore(),
  }),
  actions: {
    async addTicket(ticket) {
      this.sendingTicket = true;
      return await axios
        .post(apiUrl + "/tickets/add", ticket, {
          headers: { token: this.auth.t },
        })
        .then(
          (res) => {
            this.sendingTicket = false;
            return sendMessage("success", messages.ticketSent);
          },
          (error) => {
            this.sendingTicket = false;
            return catchError(error);
          }
        );
    },
    async fetchTickets() {
      this.fetchTicketsPending = true;
      return await axios
        .get(apiUrl + "/tickets/fetch", {
          headers: { token: this.auth.t },
        })
        .then(
          (res) => {
            this.fetchTicketsPending = false;
            this.tickets = res.data.records;
            return sendMessage("success", messages.success);
          },
          (error) => {
            this.fetchTicketsPending = false;
            return catchError(error);
          }
        );
    },
  },
});
