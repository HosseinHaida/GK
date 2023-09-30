<template>
  <div class="container">
    <div class="row q-mb-md text-subtitle1 text-bold q-px-xl items-center">
      <div class="col-auto q-pr-lg">پک‌ها</div>
      <div class="col">
        <q-input
          v-model="searchText"
          debounce="500"
          borderless
          dense
          label="جستجو"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-auto q-pl-sm">
        <div class="row justify-end">
          <q-btn
            v-for="(stat, i) in packStates"
            :key="i"
            dense
            push
            class="q-mr-sm q-py-none q-px-sm"
            :color="stat.value === selectedStatus ? stat.color : 'light'"
            @click="selectedStatus = stat.value"
          >
            <span
              :class="
                selectedStatus === stat.value ? 'text-white' : 'text-dark'
              "
            >
              {{ stat.label }}
            </span>
          </q-btn>
        </div>
      </div>
    </div>

    <q-list
      class="g-rounded-borders q-mx-xl q-pa-sm q-pr-md admin-panel-packs-container"
    >
      <div
        v-if="packs && Object.entries(packs).length < 1 && !fetchPacksPending"
      >
        <div class="note note__warning q-px-md q-py-sm rounded-borders">
          {{ messages.noPacksFound }}
        </div>
      </div>
      <div v-else>
        <div
          class="q-px-sm q-py-xs q-my-sm shadow-1 cursor-pointer admin-panel-pack-li rounded-borders"
          v-for="(pack, i) in packs"
          :key="i"
          @click="showPackDetails(pack)"
        >
          <div class="row">
            <div class="col-2">
              <div class="column">
                <span> {{ pack.name }} </span>
                <span class="text-caption"> {{ pack.name_en }} </span>
              </div>
            </div>
            <div class="col q-mx-md">
              <div class="row justify-center full-height items-center">
                <div
                  v-for="(icon, j) in packIcons[pack.id]"
                  :key="j"
                  style="width: 25px"
                  class="q-ma-xs"
                >
                  <q-img
                    no-spinner
                    :alt="icon.name_en"
                    :src="icon.thumbnail_url"
                    fit="contain"
                    ratio="1"
                  />
                </div>
              </div>
            </div>
            <div class="col-auto">
              <div class="column text-right text-caption text-grey-7">
                <span> {{ e2p(getTime(pack.created_at)) }} </span>
                <span> {{ getDate(pack.created_at) }} </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pack Dialog -->
        <q-dialog v-model="isPackDetailsVisible">
          <AdminPanelPack
            @on-close-dialog="closePackDetails"
            @on-fetch-packs="fetchPacks"
            :pack="selectedPack"
            :icons="packIcons[selectedPack.id]"
          />
        </q-dialog>
      </div>
      <q-inner-loading class="g-rounded-borders" :showing="fetchPacksPending">
        <q-spinner-hourglass size="50px" color="primary" />
      </q-inner-loading>
    </q-list>

    <div class="row justify-center items-center q-pb-md q-mt-xl">
      <q-btn
        v-if="currentPage !== 1"
        color="secondary"
        class="q-ma-xs q-py-none q-px-sm"
        label="صفحه قبل"
        dense
        @click="currentPage -= 1"
      />
      <q-btn
        color="secondary"
        class="q-ma-xs q-py-none q-px-sm"
        :label="e2p(currentPage)"
        dense
        :loading="fetchPacksPending"
      >
        <q-tooltip :delay="1000" :offset="[0, 30]" anchor="top middle">
          صفحه
        </q-tooltip>
      </q-btn>
      <q-btn
        color="secondary"
        class="q-ma-xs q-py-none q-px-sm"
        label="صفحه بعد"
        dense
        :disable="pagination.lastPage <= currentPage"
        @click="currentPage += 1"
      />
    </div>
  </div>
</template>

<script>
import { packStates, perPagePacksResults } from "src/stores/variables";
import { messages } from "src/stores/messages";
import { usePacksStore } from "src/stores/packs-store";
import { computed, defineComponent, onBeforeMount, ref, watch } from "vue";
import { notifError, notifPrimary } from "src/util/notify";
import AdminPanelPack from "./AdminPanelPack.vue";
import { e2p, getDate, getTime } from "src/stores/helpers";

export default defineComponent({
  name: "AdminPanelPacks",
  setup() {
    const packsStore = usePacksStore();

    const searchText = ref("");
    const fetchPacksPending = computed(() => packsStore.fetchPacksPending);
    const packs = computed(() => packsStore.packs);
    const packIcons = computed(() => packsStore.packIcons);
    const pagination = computed(() => packsStore.allPacksPagination);
    const currentPage = ref(1);
    const selectedStatus = ref("pending");
    // : 'pending', 'rejected', 'revisable', 'approved'
    const isPackDetailsVisible = ref(false);
    const selectedPack = ref(null);
    const fetchPacks = async () => {
      await packsStore
        .fetchPacks({
          status: selectedStatus.value,
          search_text: searchText.value ? searchText.value : "*",
          how_many: perPagePacksResults,
          page: currentPage.value,
        })
        .then(async ({ status, message }) => {
          if (status === "error") {
            notifError(message, "message");
          }
        });
    };
    watch(selectedStatus, async () => {
      await fetchPacks();
    });
    watch(searchText, async () => {
      await fetchPacks();
    });
    watch(currentPage, async () => {
      await fetchPacks();
    });
    const showPackDetails = async (pack) => {
      isPackDetailsVisible.value = true;
      selectedPack.value = pack;
    };
    const closePackDetails = () => {
      isPackDetailsVisible.value = false;
      selectedPack.value = null;
    };
    onBeforeMount(async () => {
      await fetchPacks();
    });
    return {
      searchText,
      fetchPacksPending,
      packs,
      packIcons,
      pagination,
      currentPage,
      selectedStatus,
      fetchPacks,
      messages,
      isPackDetailsVisible,
      selectedPack,
      showPackDetails,
      closePackDetails,
      packStates,
      e2p,
      getDate,
      getTime,
      perPagePacksResults,
    };
  },
  components: { AdminPanelPack },
});
</script>

<style lang="sass" scoped>
.admin-panel-pack-li:hover
  background-color: $grey-2
.admin-panel-packs-container
  min-height: 50vh
  max-height: 50vh
  overflow-y: auto
</style>
