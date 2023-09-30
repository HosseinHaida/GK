import { defineStore } from "pinia";
import { apiUrl } from "./variables";
import { messages } from "./messages";
import { useUserStore } from "./users-store";

import { catchError, sendMessage } from "./action-helpers";
import axios from "axios";

export const useIconsStore = defineStore("iconsStore", {
  state: () => ({
    tempIconsFetchPending: false,
    tempIcons: [],
    resultsPending: false,
    results: [],
    pagination: {
      total: null,
      lastPage: 0,
      prevPage: null,
      nextPage: 2,
      currentPage: 1,
      perPage: null,
      from: 0,
      to: 0,
    },
    iconUploadPending: false,
    iconUpdatePending: false,
    iconDownloadPending: false,
    removeIconPending: false,
    iconMetaFetchPending: false,
    iconSimularsFetchPending: false,
    auth: useUserStore(),
  }),
  getters: {
    // doubleCount: (state) => this.counter * 2,
  },
  actions: {
    setTempicons(list) {
      this.tempIcons = list;
    },
    setResults(list) {
      this.results = list;
    },
    updatePagination(obj) {
      Object.entries(obj).forEach(([key, val]) => {
        this.pagination[key] = val;
      });
    },

    async searchIcons(conf) {
      this.resultsPending = true;
      this.results = [];
      return await axios
        .get(
          apiUrl + `/icons/fetch/${conf.page}/${conf.howMany}/${conf.text}`,
          {
            headers: { token: this.auth.t },
          }
        )
        .then(
          (res) => {
            this.resultsPending = false;
            this.setResults(res.data.records);
            this.updatePagination(res.data.pagination);
            return sendMessage("success", messages.iconsSearchResultsFetched);
          },
          (error) => {
            this.resultsPending = false;
            return catchError(error);
          }
        );
    },
    async uploadIcon({ formData, packId }) {
      this.iconUploadPending = true;
      let url = apiUrl + "/icons/upload";
      if (packId) url = url + "/" + packId;
      return await axios
        .post(url, formData, {
          headers: { token: this.auth.t },
        })
        .then(
          (res) => {
            this.iconUploadPending = false;
            this.setTempicons(res.data.records);
            return sendMessage("success", messages.iconUploaded);
          },
          (error) => {
            this.iconUploadPending = false;
            return catchError(error);
          }
        );
    },
    async updateIcon(updatedIcon) {
      this.iconUpdatePending = true;
      return await axios
        .post(apiUrl + "/icons/update", updatedIcon, {
          headers: { token: this.auth.t },
        })
        .then(
          (res) => {
            this.iconUpdatePending = false;
            this.setTempicons(res.data.records);
            return sendMessage("success", messages.iconUpdated);
          },
          (error) => {
            this.iconUpdatePending = false;
            return catchError(error);
          }
        );
    },
    async fetchTempIcons() {
      this.tempIconsFetchPending = true;
      return await axios
        .get(apiUrl + "/icons/temp", {
          headers: { token: this.auth.t },
        })
        .then(
          (res) => {
            this.tempIconsFetchPending = false;
            this.setTempicons(res.data.records);
            return sendMessage("success", messages.tempIconsFetched);
          },
          (error) => {
            this.tempIconsFetchPending = false;
            return catchError(error);
          }
        );
    },
    async removeTempIcons() {
      return await axios
        .delete(apiUrl + "/icons/temp", {
          headers: { token: this.auth.t },
        })
        .then(
          (res) => sendMessage("success", messages.iconUploaded),
          (error) => catchError(error)
        );
    },
    async removeIcon(iconId) {
      this.removeIconPending = true;
      return await axios
        .delete(apiUrl + `/icons/${iconId}`, {
          headers: { token: this.auth.t },
        })
        .then(
          (res) => {
            this.removeIconPending = false;
            return sendMessage("success", messages.iconDeleted);
          },
          (error) => {
            this.removeIconPending = false;
            return catchError(error);
          }
        );
    },
    async fetchMeta({ id, name }) {
      this.iconMetaFetchPending = true;
      return await axios
        .post(
          apiUrl + `/icons/meta/${id}`,
          { name },
          {
            headers: { token: this.auth.t },
          }
        )
        .then(
          (res) => {
            this.iconMetaFetchPending = false;
            return sendMessage(
              "success",
              messages.packFetched,
              res.data.record
            );
          },
          (error) => {
            this.iconMetaFetchPending = false;
            return catchError(error);
          }
        );
    },
    async downloadIcon({ id, resolution }) {
      this.iconDownloadPending = true;
      return await axios
        .get(apiUrl + `/icons/download/${id}/${resolution}`, {
          headers: { token: this.auth.t },
        })
        .then(
          (res) => {
            this.iconDownloadPending = false;
            return sendMessage("success", messages.iconDownloaded, res);
          },
          (error) => {
            this.iconDownloadPending = false;
            return catchError(error);
          }
        );
    },
    async fetchSimulars(id) {
      this.iconSimularsFetchPending = true;
      return await axios
        .get(apiUrl + `/icons/fetch_simulars/${id}`, {
          headers: { token: this.auth.t },
        })
        .then(
          (res) => {
            this.iconSimularsFetchPending = false;
            return sendMessage("success", "", res.data.records);
          },
          (error) => {
            this.iconSimularsFetchPending = false;
            return catchError(error);
          }
        );
    },
  },
});
