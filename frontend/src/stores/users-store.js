import { defineStore } from "pinia";
import { apiUrl } from "./variables";
import { messages } from "./messages";

import { catchError, sendMessage } from "./action-helpers";
import axios from "axios";

export const useUserStore = defineStore("userAuth", {
  state: () => ({
    signupPending: false,
    signinPending: false,
    userFetchPending: false,
    updatePending: false,
    photoUploadPending: false,
    checkUsernameDupPending: false,
    agreeOnTermsPending: false,
    shebaSavePending: false,
    fetchSubsMetaPending: false,
    paymentRedirectPending: false,
    paymentVerifyPending: false,
    fetchFinancesPending: false,
    financesMeta: null,
    userTCookieName: "t=",
    data: {},
    packs: [],
    t: null,
  }),
  getters: {
    doubleCount: (state) => this.counter * 2,
  },
  actions: {
    setCookie(token) {
      let d = new Date();
      d.setTime(d.getTime() + 14 * 24 * 60 * 60 * 1000);
      let expires = d.toUTCString();
      document.cookie = "t=" + token + ";expires=" + expires + ";path=/";
      this.t = token;
    },
    logout() {
      this.data = () => {};
      this.t = null;
      document.cookie = "t=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
    },
    async signup(newUser) {
      this.signupPending = true;
      return await axios.post(apiUrl + "/auth/signup", newUser).then(
        (res) => {
          this.signupPending = false;
          if (res.data.user) {
            this.data = res.data.user;
            this.setCookie(res.data.user.token);
          }
          return sendMessage("success", messages.accCreatedAndIn);
        },
        (error) => {
          this.signupPending = false;
          return catchError(error);
        }
      );
    },
    async signin(user) {
      this.signinPending = true;
      return await axios.post(apiUrl + "/auth/signin", user).then(
        (res) => {
          this.signinPending = false;
          if (res.data.user) {
            this.data = res.data.user;
            this.setCookie(res.data.user.token);
          }
          return sendMessage("success", messages.signedIn);
        },
        (error) => {
          this.signinPending = false;
          return catchError(error);
        }
      );
    },
    async googleSignin(creds) {
      this.signinPending = true;
      return await axios.post(apiUrl + "/auth/g_signin", { creds }).then(
        (res) => {
          this.signinPending = false;
          if (res.data.user) {
            this.data = res.data.user;
            this.setCookie(res.data.user.token);
          }
          return sendMessage("success", messages.signedIn);
        },
        (error) => {
          this.signinPending = false;
          return catchError(error);
        }
      );
    },
    async fetchUserData() {
      var name = this.userTCookieName;
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(";");
      var t = null;
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          t = c.substring(name.length, c.length);
        }
      }
      if (t) {
        return await axios
          .get(apiUrl + "/auth/fetch", {
            headers: {
              token: t,
            },
          })
          .then(
            (res) => {
              if (res.data && res.data.user) {
                this.data = res.data.user;
                this.t = t;
                // const username = res.data.user.username;
                return sendMessage("success", messages.fetchedMetaForUser);
              }
            },
            (error) => catchError(error)
          );
      } else return sendMessage("notfound", null);
    },
    async updateUser(editedFields) {
      this.updatePending = true;
      return await axios
        .put(
          apiUrl + "/auth/update",
          { data: editedFields },
          {
            headers: { token: this.t },
          }
        )
        .then(
          (res) => {
            this.updatePending = false;
            if (res.data.user) {
              this.data = res.data.user;
              this.setCookie(res.data.user.token);
            }
            return sendMessage("success", messages.userUpdated);
          },
          (error) => {
            this.updatePending = false;
            return catchError(error);
          }
        );
    },
    async onCheckUsernameDup(username) {
      this.checkUsernameDupPending = true;
      return await axios
        .get(`${apiUrl}/auth/check/${username}`, {
          headers: { token: this.t },
        })
        .then(
          (res) => {
            this.checkUsernameDupPending = false;
            return sendMessage(
              "success",
              messages.userUpdated,
              res.data.exists
            );
          },
          (error) => {
            this.checkUsernameDupPending = false;
            return catchError(error);
          }
        );
    },
    async agreeOnTerms() {
      this.agreeOnTermsPending = true;
      return await axios
        .post(
          `${apiUrl}/auth/agree/on/terms`,
          { version: 1 },
          {
            headers: { token: this.t },
          }
        )
        .then(
          (res) => {
            if (res.data.user) this.data = res.data.user;
            this.agreeOnTermsPending = false;
            return sendMessage("success", messages.success);
          },
          (error) => {
            this.agreeOnTermsPending = false;
            return catchError(error);
          }
        );
    },
    async saveSheba(newSheba) {
      this.shebaSavePending = true;
      return await axios
        .post(
          `${apiUrl}/auth/save/sheba`,
          { sheba: newSheba },
          {
            headers: { token: this.t },
          }
        )
        .then(
          (res) => {
            if (res.data.user) this.data = res.data.user;
            this.shebaSavePending = false;
            return sendMessage("success", messages.success);
          },
          (error) => {
            this.shebaSavePending = false;
            return catchError(error);
          }
        );
    },
    async fetchSubsMeta() {
      this.fetchSubsMetaPending = true;
      return await axios
        .get(apiUrl + "/auth/fetch/subs/meta", {
          headers: { token: this.t },
        })
        .then(
          (res) => {
            this.fetchSubsMetaPending = false;
            if (res.data.meta) {
              this.data.subscription = res.data.meta.subscription;
              this.data.last_sub_dls = res.data.meta.last_sub_dls;
            }
            return sendMessage("success");
          },
          (error) => {
            this.fetchSubsMetaPending = false;
            return catchError(error);
          }
        );
    },
    async startPayment(subscription) {
      this.paymentRedirectPending = true;
      return await axios
        .post(
          `${apiUrl}/auth/subscribe`,
          { subscription },
          {
            headers: { token: this.t },
          }
        )
        .then(
          (res) => {
            this.paymentRedirectPending = false;
            if (res.data.paymentUrl)
              return sendMessage(
                "success",
                messages.success,
                res.data.paymentUrl
              );
            else return sendMessage("error", messages.transactionFailed);
          },
          (error) => {
            this.paymentRedirectPending = false;
            return catchError(error);
          }
        );
    },
    async verifyPayment(authority) {
      this.paymentVerifyPending = true;
      return await axios
        .post(`${apiUrl}/auth/payment/check`, { authority })
        .then(
          (res) => {
            this.paymentVerifyPending = false;
            if (!res.data.refID)
              return sendMessage("error", messages.transactionFailed);
            return sendMessage("success", messages.success, res.data.refID);
          },
          (error) => {
            this.paymentVerifyPending = false;
            return catchError(error);
          }
        );
    },
    async fetchFinances(type) {
      this.fetchFinancesPending = true;
      return await axios
        .get(`${apiUrl}/auth/fetch/finances/${type}`, {
          headers: { token: this.t },
        })
        .then(
          (res) => {
            this.fetchFinancesPending = false;
            this.financesMeta = res.data.record;
            return sendMessage("success", messages.success);
          },
          (error) => {
            this.fetchFinancesPending = false;
            return catchError(error);
          }
        );
    },
  },
});
