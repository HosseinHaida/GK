<template>
  <q-page class="justify-center row">
    <div class="col-12 q-pa-lg">
      <q-card class="icon-pack_card full-height">
        <div>
          <div class="row items-center" v-if="pack && pack.creator">
            <div
              v-if="!this.$isMobile()"
              class="col-2 q-ma-xs q-ml-md rounded-borders row items-center justify-center bordered border-primary"
            >
              <span class="q-mr-xs">
                {{
                  pack.creator.username
                    ? pack.creator.username
                    : pack.creator.email
                }}
              </span>
              <q-img
                width="35px"
                alt="User Account Logo"
                src="~assets/ui/account-gradient.svg"
              />
            </div>
            <div class="col text-center font-regular">
              <div class="row justify-center">
                <div
                  class="col-auto q-px-xl q-pb-lg pack-page-pack_name q-pt-md"
                >
                  {{ pack.name }}
                </div>
              </div>
            </div>
            <div v-if="!this.$isMobile()" class="col-2 q-pr-md full-height">
              <div
                class="rounded-borders justify-between pack-page-pack_style row q-px-xs bordered border-primary"
              >
                <div class="col-6 q-pr-xs">
                  <q-chip
                    class="full-width"
                    text-color="light"
                    square
                    color="primary"
                  >
                    <div class="full-width text-center">
                      {{ iconStyles[pack.style] }}
                    </div>
                  </q-chip>
                </div>
                <div class="col-6">
                  <q-chip
                    class="full-width"
                    text-color="light"
                    square
                    color="primary"
                  >
                    <div class="full-width text-center">
                      {{ iconColors[pack.color] }}
                    </div>
                  </q-chip>
                </div>
              </div>
            </div>
          </div>

          <div class="row justify-center q-gutter-lg q-py-md">
            <div
              class="row justify-center results-page-icon-img-container q-py-md"
            >
              <div
                class="shadow-9 search-result-element cursor-pointer rounded-borders bg-white row items-center q-ma-md"
                v-for="(icon, i) in icons"
                style="width: 100px"
                :key="i"
                @click="showDownloadDialog(icon)"
              >
                <q-img
                  spinner-color="light"
                  spinner-size="50px"
                  class="self-center"
                  img-class="q-pa-sm"
                  :src="icon.thumbnail_url"
                  :alt="icon.name_en"
                  fit="contain"
                  ratio="1"
                  @mouseover="isCaptionVisible = i"
                  @mouseleave="isCaptionVisible = null"
                >
                  <div
                    v-show="isCaptionVisible === i"
                    class="absolute-center full-width full-height rounded-borders text-subtitle1 text-center row items-center justify-center bg-dimmed-grey"
                  >
                    {{ icon.name }}
                  </div>
                </q-img>
              </div>

              <!-- Download dialog -->
              <q-dialog v-model="isIconSelected">
                <DownloadDialog
                  @on-close-dialog="closeDownloadDialog"
                  :icon="selectedIcon"
                  :user="pack.creator"
                />
              </q-dialog>
            </div>
          </div>
        </div>
        <q-inner-loading class="g-rounded-borders" :showing="fetchPending">
          <q-spinner-grid size="64px" color="primary" />
        </q-inner-loading>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { usePacksStore } from "src/stores/packs-store";
import { notifError } from "src/util/notify";
import { defineComponent, ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { iconColors, iconStyles } from "src/stores/variables";
import DownloadDialog from "../components/DownloadDialog.vue";
export default defineComponent({
  name: "PackPage",
  setup() {
    const route = useRoute();
    const packsStore = usePacksStore();

    const pack = ref({});
    const icons = ref([]);

    const isCaptionVisible = ref(null);
    const selectedIcon = ref(null);
    const isIconSelected = ref(false);

    const noResults = ref(false);

    const fetchPending = computed(() => packsStore.fetchPackPending);

    const fetchPack = async (id) => {
      await packsStore.fetchPack(id).then(async ({ status, message, load }) => {
        if (status === "error") {
          notifError(message, "warning");
          noResults.value = true;
        } else if (status === "success") {
          pack.value = load.pack;
          icons.value = load.icons;
        }
      });
    };

    const showDownloadDialog = async (icon) => {
      isIconSelected.value = true;
      selectedIcon.value = icon;
    };

    const closeDownloadDialog = () => {
      isIconSelected.value = false;
      selectedIcon.value = null;
    };

    watch(
      route,
      async () => {
        if (route.params.packId) await fetchPack(route.params.packId);
      },
      { immediate: true }
    );

    return {
      route,
      isCaptionVisible,
      selectedIcon,
      isIconSelected,
      noResults,
      fetchPending,
      fetchPack,
      showDownloadDialog,
      closeDownloadDialog,
      pack,
      icons,
      iconStyles,
      iconColors,
    };
  },
  components: { DownloadDialog },
});
</script>
<style lang="sass">
// .pack-page-pack_username, .pack-page-pack_style
//   border: 1px solid $primary
.pack-page-pack_name
  font-size: 1rem
  border-bottom: 1px solid $primary
.icon-pack_card
  overflow-y: auto
</style>
