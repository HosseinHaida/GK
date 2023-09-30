import { defineStore } from "pinia";
import { apiUrl } from "./variables";
import { messages } from "./messages";
import { useUserStore } from "./users-store";

import { catchError, sendMessage } from "./action-helpers";
import axios from "axios";

export const usePaymentsStore = defineStore("paymentsStore", {
  state: () => ({
    fetchPaymentsPending: false,
    fetchPaymentPending: false,
    payments: [],
    updatePaymentPending: false,
    auth: useUserStore(),
  }),
  actions: {
    async fetchPayments({ status, year, month, search_text }) {
      this.fetchPaymentsPending = true;
      return await axios
        .get(
          `${apiUrl}/payments/fetch/${status}/${year}/${month}/${search_text}`,
          {
            headers: {
              token: this.auth.t,
            },
          }
        )
        .then(
          (res) => {
            this.fetchPaymentsPending = false;
            this.payments = res.data.records;
            return sendMessage("success", messages.paymentsFetched);
          },
          (error) => {
            this.fetchPaymentsPending = false;
            return catchError(error);
          }
        );
    },
    async fetchPayment({ year, month, user_id }) {
      this.fetchPaymentPending = true;
      return await axios
        .get(`${apiUrl}/payments/fetch/${year}/${month}/${user_id}`, {
          headers: {
            token: this.auth.t,
          },
        })
        .then(
          (res) => {
            this.fetchPaymentPending = false;
            return sendMessage(
              "success",
              messages.paymentsFetched,
              res.data.record
            );
          },
          (error) => {
            this.fetchPaymentPending = false;
            return catchError(error);
          }
        );
    },
    async updatePayment({ status, ref_id, id }) {
      this.updatePaymentPending = true;
      return await axios
        .post(
          `${apiUrl}/payments/update`,
          { p_status: status, ref_id, id },
          {
            headers: {
              token: this.auth.t,
            },
          }
        )
        .then(
          (res) => {
            this.updatePaymentPending = false;
            return sendMessage("success", messages.paymentUpdated);
          },
          (error) => {
            this.updatePaymentPending = false;
            return catchError(error);
          }
        );
    },
  },
});
