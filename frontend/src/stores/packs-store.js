import { defineStore } from "pinia";
import { apiUrl } from "./variables";
import { messages } from "./messages";
import { useUserStore } from "./users-store";

import { catchError, sendMessage } from "./action-helpers";
import axios from "axios";
import { useIconsStore } from "./icons-store";

export const usePacksStore = defineStore("packsStore", {
  state: () => ({
    fetchUserPacksPending: false,
    fetchPacksPending: false,
    fetchPackPending: false,
    addingPack: false,
    deletingPack: false,
    userPacks: [],
    fetchPackIconsPending: false,
    setStatusPending: false,
    packs: [],
    packIcons: [],
    allPacksPagination: {
      total: null,
      lastPage: 0,
      prevPage: null,
      nextPage: 2,
      currentPage: 1,
      perPage: null,
      from: 0,
      to: 0,
    },
    auth: useUserStore(),
  }),
  getters: {
    // doubleCount: (state) => this.counter * 2,
  },
  actions: {
    setTempicons(list) {
      this.tempIcons = list;
    },
    updatePagination(obj) {
      Object.entries(obj).forEach(([key, val]) => {
        this.allPacksPagination[key] = val;
      });
    },
    async fetchUserPacks() {
      this.fetchUserPacksPending = true;
      return await axios
        .get(apiUrl + "/packs/list", {
          headers: {
            token: this.auth.t,
          },
        })
        .then(
          (res) => {
            this.fetchUserPacksPending = false;
            this.userPacks = res.data.records;
            return sendMessage("success", messages.packsFetched);
          },
          (error) => {
            this.fetchUserPacksPending = false;
            return catchError(error);
          }
        );
    },
    async fetchPacks({ status, search_text, how_many, page }) {
      this.packs = [];
      this.packIcons = [];
      this.fetchPacksPending = true;
      return await axios
        .get(
          `${apiUrl}/packs/list/${status}/${how_many}/${page}/${search_text}`,
          {
            headers: {
              token: this.auth.t,
            },
          }
        )
        .then(
          (res) => {
            this.fetchPacksPending = false;
            this.updatePagination(res.data.pagination);
            this.packs = res.data.records.packs;
            this.packIcons = res.data.records.icons;
            return sendMessage("success", messages.packsFetched);
          },
          (error) => {
            this.fetchPacksPending = false;
            return catchError(error);
          }
        );
    },
    async fetchPack(id) {
      this.fetchPackPending = true;
      return await axios
        .get(`${apiUrl}/packs/${id}`, {
          headers: {
            token: this.auth.t,
          },
        })
        .then(
          (res) => {
            this.fetchPackPending = false;
            return sendMessage(
              "success",
              messages.packFetched,
              res.data.record
            );
          },
          (error) => {
            this.fetchPackPending = false;
            return catchError(error);
          }
        );
    },
    async setStatus(load) {
      this.setStatusPending = true;
      return await axios
        .post(apiUrl + "/packs/set", load, {
          headers: { token: this.auth.t },
        })
        .then(
          (res) => {
            this.setStatusPending = false;
            return sendMessage("success", messages.statusSet);
          },
          (error) => {
            this.setStatusPending = false;
            return catchError(error);
          }
        );
    },
    async addPack(pack) {
      const iconsStore = useIconsStore();
      this.addingPack = true;
      return await axios
        .post(apiUrl + "/packs/add", pack, {
          headers: { token: this.auth.t },
        })
        .then(
          (res) => {
            this.addingPack = false;
            this.userPacks = res.data.records;
            iconsStore.setTempicons([]);
            return sendMessage("success", messages.packAdded);
          },
          (error) => {
            this.addingPack = false;
            return catchError(error);
          }
        );
    },
    async deletePack(packId) {
      this.deletingPack = true;
      return await axios
        .delete(apiUrl + `/packs/${packId}`, {
          headers: { token: this.auth.t },
        })
        .then(
          (res) => {
            this.deletingPack = false;
            return sendMessage("success", messages.packDeleted);
          },
          (error) => {
            this.deletingPack = false;
            return catchError(error);
          }
        );
    },
    async fetchPackIcons(packId) {
      this.fetchPackIconsPending = true;
      return await axios
        .get(`${apiUrl}/packs/${packId}/icons/`, {
          headers: {
            token: this.auth.t,
          },
        })
        .then(
          (res) => {
            this.fetchPackIconsPending = false;
            this.packIcons[packId] = res.data.records;
            return sendMessage("success", messages.packsFetched);
          },
          (error) => {
            this.fetchPackIconsPending = false;
            return catchError(error);
          }
        );
    },
  },
});
