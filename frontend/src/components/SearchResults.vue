<template>
  <transition
    appear
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
  >
    <div
      class="container rounded-borders results-panel q-mx-lg q-px-md q-pt-md q-mb-lg"
    >
      <div
        class="full-height full-width row q-pt-md justify-center"
        v-if="searchPending"
      >
        <q-spinner-grid color="primary" size="64px" />
      </div>
      <div
        class="row justify-center q-pt-lg"
        v-if="!searchPending && results.length < 1"
      >
        <span
          class="font-regular text-primary border-primary"
          style="border-bottom: 1px solid"
        >
          {{ messages.noResults }}
        </span>
      </div>
      <div v-else class="column content-between" style="min-height: 100%">
        <div class="col full-width">
          <div
            class="row justify-center results-page-icon-img-container q-gutter-lg q-pt-md"
          >
            <div
              class="shadow-9 search-result-element cursor-pointer rounded-borders q-pa-sm bg-white row items-center"
              v-for="(icon, i) in results"
              style="width: 100px"
              :key="i"
              @click="showDownloadDialog(icon)"
            >
              <q-img
                no-spinner
                spinner-color="light"
                spinner-size="50px"
                class="self-center result-icon-img"
                :src="icon.thumbnail_url"
                :alt="icon.name_en"
                fit="contain"
                ratio="1"
              />
            </div>

            <!-- Download dialog -->
            <q-dialog persistent v-model="isIconSelected">
              <DownloadDialog
                @on-close-dialog="closeDownloadDialog"
                :icon="selectedIcon"
                @onSimularIconClicked="showDownloadDialog"
              />
            </q-dialog>
          </div>
        </div>
        <div class="col" />
        <div class="row">
          <div class="col-12">
            <div class="row justify-center items-center q-pb-md q-mt-xl">
              <q-btn
                v-if="currentPage !== 1"
                color="primary"
                class="q-ma-xs q-py-none q-px-sm"
                label="صفحه قبل"
                dense
                @click="currentPage -= 1"
              />
              <q-btn
                color="primary"
                class="q-ma-xs q-py-none q-px-sm"
                :label="e2p(currentPage)"
                dense
                outline
                style="min-width: 40px"
                :loading="searchPending"
              >
                <q-tooltip :delay="1000" :offset="[0, 30]" anchor="top middle">
                  صفحه
                </q-tooltip>
              </q-btn>
              <q-btn
                color="primary"
                class="q-ma-xs q-py-none q-px-sm"
                label="صفحه بعد"
                dense
                :disable="pagination.lastPage <= currentPage"
                @click="currentPage += 1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { messages } from "src/stores/messages";
import { defineComponent, computed, ref, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useIconsStore } from "../stores/icons-store";
import DownloadDialog from "./DownloadDialog.vue";
import { e2p } from "src/stores/helpers";
import { perPageResults } from "src/stores/variables";

export default defineComponent({
  name: "SearchResults",
  emits: ["onShowInlineDownloadDialog", "onKeepSearchResults", "onGoToPage"],

  setup(props, ctx) {
    const router = useRouter();
    const iconsStore = useIconsStore();
    const selectedIcon = ref(null);
    const isIconSelected = ref(false);
    const results = computed(() => iconsStore.results);
    const pagination = computed(() => iconsStore.pagination);
    const perPage = ref(perPageResults);
    const currentPage = ref(1);

    const showDownloadDialog = async (icon) => {
      isIconSelected.value = true;
      selectedIcon.value = icon;
      let name = icon.name.replace(/ /g, "_");
      router.push(`/icon/${icon.id}&آیکون_${name}`);
      ctx.emit("onShowInlineDownloadDialog");
    };
    const closeDownloadDialog = () => {
      isIconSelected.value = false;
      selectedIcon.value = null;
      router.push("/");
      ctx.emit("onKeepSearchResults");
    };

    watch(currentPage, () => {
      ctx.emit("onGoToPage", currentPage.value);
    });

    onUnmounted(() => {
      iconsStore.results = [];
    });

    return {
      selectedIcon,
      isIconSelected,
      results,
      pagination,
      perPage,
      currentPage,
      showDownloadDialog,
      closeDownloadDialog,
      messages,
      e2p,
    };
  },
  props: {
    searchPending: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object,
      default: () => {},
    },
  },
  components: { DownloadDialog },
});
</script>
<style lang="sass" scoped>
.results-panel
  height: 80vh
  overflow-y: auto
  background: $light
.results-page-icon-img-container > .search-result-element > .result-icon-img
  pointer-events: none
.search-result-element
  text-align: center
  max-height: 100px
</style>
