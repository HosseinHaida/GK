<template>
  <div class="download-dialog-card">
    <q-card flat class="g-rounded-borders bg-light">
      <div
        v-if="isMetaFetched || metaFetchPending"
        class="row"
        style="overflow-x: hidden"
      >
        <div
          class="col-md-6 col-xs-12 q-pa-lg q-pr-lg column justify-between download-dialog-icon-meta-container"
        >
          <div class="col-auto text-center q-pb-sm">
            <span class="close-button float-left">
              <q-icon
                name="close"
                size="md"
                color="grey-5"
                class="cursor-pointer"
                @click="onCloseDialog()"
              />
            </span>
            <span
              class="text-h5 q-pb-xs text-primary font-medium"
              style="border-bottom: 1px solid"
            >
              <span v-if="iconName">
                {{ iconName }}
              </span>
              <div v-else-if="metaFetchPending" class="row justify-center">
                <q-skeleton type="text" width="100px" height="25px" square />
              </div>
            </span>
          </div>

          <div class="col-auto q-pt-md">
            <q-skeleton
              type="text"
              width="100px"
              height="25px"
              square
              v-if="metaFetchPending"
            />
            <div
              v-else-if="isMetaFetched"
              class="cursor-pointer"
              @click="goToPackPage(iconPackId)"
            >
              <span class="text-dark"> برگرفته از پک آیکون </span>
              <span class="text-primary text-underline">
                {{ meta.pack.name }}
              </span>
            </div>

            <div class="q-mt-md q-pa-xs rounded-borders shadow-1 text-right">
              <div
                class="row items-center q-gutter-sm justify-end"
                v-if="metaFetchPending"
              >
                <q-skeleton square height="25px" type="text" width="100px" />
                <q-skeleton type="QAvatar" size="40px" />
              </div>
              <div v-else-if="isMetaFetched">
                <span class="q-mr-sm font-demibold text-dark">
                  {{ meta && username }}
                </span>
                <q-icon size="40px" name="img:/ui/gg.account.svg" />
              </div>
            </div>
          </div>

          <div @click="goToSubs()" class="col q-pb-md cursor-pointer">
            <div
              class="q-mt-md q-pt-xs rounded-borders shadow-1 text-right bg-primary q-pb-md"
            >
              <div
                class="text-center full-width text-light font-light q-py-md"
                style="font-size: 16px"
              >
                خرید اشتراک و دانلود با فرمت SVG
              </div>

              <div
                v-for="(feature, i) in features"
                :key="i"
                class="q-mt-xs full-width bg-white q-py-xs text-center text-primary"
              >
                {{ feature }}
              </div>
            </div>
          </div>

          <div class="col-auto row q-mt-sm">
            <div class="row justify-center full-width q-gutter-sm">
              <q-btn
                :disable="!isMetaFetched"
                @click="onDownload(64)"
                class="col-2 g-rounded-10 font-medium"
                no-caps
                :loading="downloadPending && dlBtnIndex === 64"
              >
                <div class="column dl-btn-container text-primary">
                  <div class="first-row">۶۴</div>
                  <div class="second-row">png</div>
                </div>
              </q-btn>
              <q-btn
                :disable="!isMetaFetched"
                @click="onDownload(128)"
                class="col-2 g-rounded-10 font-medium"
                no-caps
                :loading="downloadPending && dlBtnIndex === 128"
              >
                <div class="column dl-btn-container text-primary">
                  <div class="first-row">۱۲۸</div>
                  <div class="second-row">png</div>
                </div>
              </q-btn>
              <q-btn
                :disable="!isMetaFetched"
                @click="onDownload(512)"
                class="col-2 q-py-md q-px-lg g-rounded-10 font-medium"
                no-caps
                color="primary"
                :loading="downloadPending && dlBtnIndex === 512"
              >
                <div class="column dl-btn-container">
                  <div class="first-row">۵۱۲</div>
                  <div class="second-row">png</div>
                </div>

                <q-icon
                  name="img:/ui/light.star.svg"
                  size="0.9rem"
                  class="absolute-top-right q-pr-xs q-pt-xs"
                />
              </q-btn>
              <q-btn
                :disable="!isMetaFetched"
                @click="onDownload(1024)"
                class="col-2 q-py-md q-px-lg g-rounded-10 font-medium"
                no-caps
                color="primary"
                :loading="downloadPending && dlBtnIndex === 1024"
              >
                <div class="column dl-btn-container">
                  <div class="first-row">۱۰۲۴</div>
                  <div class="second-row">png</div>
                </div>

                <q-icon
                  name="img:/ui/light.star.svg"
                  size="0.9rem"
                  class="absolute-top-right q-pr-xs q-pt-xs"
                />
              </q-btn>

              <q-btn
                :disable="!isMetaFetched"
                @click="onDownload('svg')"
                size="lg"
                class="col-2 q-pt-sm g-rounded-10 font-medium"
                color="primary"
                label="svg"
                :loading="downloadPending && dlBtnIndex === 'svg'"
              >
                <q-icon
                  name="img:/ui/light.star.svg"
                  size="0.9rem"
                  class="absolute-top-right q-pr-xs q-pt-xs"
                />
              </q-btn>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xs-12 q-pa-lg download-dialog-icon-container">
          <div
            style="overflow-x: hidden"
            :class="!metaFetchPending ? 'q-pa-xl' : ''"
            class="shadow-9 g-rounded-borders full-height items-center bg-white row items-center"
          >
            <q-skeleton
              class="g-rounded-borders full-height full-width"
              square
              v-if="metaFetchPending"
              animation="wave"
            />
            <q-img
              v-if="isMetaFetched"
              :alt="meta.icon.name_en"
              class="col download-dialog-icon-img"
              fit="contain"
              ratio="1"
              :src="meta.icon.watermark_url"
              style="overflow: visible"
            >
            </q-img>
            <q-icon
              class="absolute all-pointer-events cursor-pointer"
              size="32px"
              name="info"
              color="primary"
              style="top: 30px; left: 30px"
            >
              <q-tooltip anchor="top right" self="center left" :offset="[8, 8]">
                <div style="font-size: 13px">
                  {{ messages.watermarkWillBeDeleted }}
                </div>
              </q-tooltip>
            </q-icon>
          </div>
        </div>
      </div>
    </q-card>
    <div
      v-if="(simulars && simulars.length > 0) || simularsFetchPending"
      class="q-pt-md dl-page-simulars-container"
    >
      <div class="g-rounded-borders bg-light q-pa-sm text-dark">
        <div class="row justify-between">
          <div class="col-auto row items-center q-pl-md">
            آیکون‌های مشابه
            <span class="text-primary q-ml-xs"> {{ iconName }}</span>
          </div>
          <div class="col-auto">
            <q-btn @click="backToSearch()" class="g-rounded-borders" flat>
              صفحه جستجو
              <q-icon
                name="keyboard_backspace"
                class="q-ml-sm"
                color="primary"
                size="sm"
              />
            </q-btn>
          </div>
        </div>

        <div
          v-if="simularsFetchPending"
          class="row q-pt-lg justify-center q-pb-md"
        >
          <q-spinner-grid color="primary" size="64px" />
        </div>

        <div v-else class="row q-pt-lg justify-center q-pb-md q-gutter-lg">
          <div
            class="simular-icon-container cursor-pointer rounded-borders q-pa-sm bg-white row items-center"
            v-for="(simularIcon, i) in simulars.slice(0, 6)"
            style="width: 100px"
            :key="i"
            @click="goToIcon(simularIcon)"
          >
            <q-img
              spinner-color="light"
              spinner-size="50px"
              class="self-center simular-icon-img"
              :src="simularIcon.thumbnail_url"
              :alt="simularIcon.name_en"
              fit="contain"
              ratio="1"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useIconsStore } from "src/stores/icons-store";
import { messages } from "src/stores/messages";
import { useUserStore } from "src/stores/users-store";
import { notifError, notifPrimary } from "src/util/notify";
import { defineComponent, computed, ref, onBeforeMount } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "DownloadDialog",
  emits: [
    "onCloseDialog",
    "nameNeedsCorrection",
    "onSimularIconClicked",
    "onComponentReady",
  ],
  props: {
    icon: {
      type: Object,
      default: () => {
        return {
          id: null,
          name: "",
        };
      },
    },
    nameExtractedFromUrl: {
      type: String,
      default: "",
    },
    idExtractedFromUrl: {
      type: String,
      default: "",
    },
  },
  setup(props, ctx) {
    const iconsStore = useIconsStore();
    const userStore = useUserStore();
    const router = useRouter();

    const features = ref({
      1: "قابلیت ویرایش و تغییر رنگ",
      2: "کیفیت بی‌نهایت (عدم کاهش کیفیت با زوم)",
      3: "دسترسی به تمامی آیکون‌های ویژه",
    });

    const user = computed(() => userStore.data);
    const meta = ref({ icon: null, user: null, pack: null });
    const simulars = ref([]);
    const downloadPending = computed(() => iconsStore.iconDownloadPending);
    const metaFetchPending = computed(() => iconsStore.iconMetaFetchPending);
    const simularsFetchPending = computed(
      () => iconsStore.iconSimularsFetchPending
    );
    const dlBtnIndex = ref(null);

    const isMetaFetched = computed(() => {
      return meta.value && meta.value.icon && meta.value.icon.id ? true : false;
    });

    const iconName = computed(() => {
      return props.icon && props.icon.name
        ? props.icon.name
        : props.nameExtractedFromUrl
        ? props.nameExtractedFromUrl
        : null;
    });

    const iconId = computed(() => {
      return props.icon && props.icon.id
        ? props.icon.id
        : props.idExtractedFromUrl
        ? props.idExtractedFromUrl
        : null;
    });

    const iconPackId = computed(() => {
      return props.icon && props.icon.pack_id
        ? props.icon.pack_id
        : meta.value.icon.pack_id
        ? meta.value.icon.pack_id
        : null;
    });

    const fetchMeta = async (id, name) => {
      await iconsStore
        .fetchMeta({
          id: id
            ? id
            : props.icon && props.icon.id
            ? props.icon.id
            : props.idExtractedFromUrl,
          name: name
            ? name
            : props.nameExtractedFromUrl
            ? props.nameExtractedFromUrl
            : props.icon.name,
        })
        .then(async ({ status, message, load }) => {
          if (status === "error") notifError(message, "warning");
          if (status === "success" && load) {
            if (load.correctedName)
              ctx.emit("nameNeedsCorrection", load.correctedName);
            meta.value = load;
            await fetchSimulars(load.icon.id);
          }
        });
    };

    const fetchSimulars = async (id) => {
      await iconsStore
        .fetchSimulars(id)
        .then(async ({ status, message, load }) => {
          if (status === "error") return notifError(message, "warning");
          simulars.value = load;
          ctx.emit("onComponentReady");
        });
    };

    const username = computed(() => {
      if (meta.value.user.username) return meta.value.user.username;
      else
        return meta.value.user.email.substring(
          0,
          meta.value.user.email.indexOf("@")
        );
    });

    const onDownload = async (resolution) => {
      dlBtnIndex.value = resolution;
      if (resolution === 512 || resolution === 1024 || resolution === "svg")
        if (!user.value.id)
          return notifError(messages.needToSignInToDownload, "badge");
      await iconsStore
        .downloadIcon({ id: iconId.value, resolution })
        .then(async ({ status, message, load }) => {
          if (status === "success") {
            let blob;
            if (resolution === "svg") blob = load.data;
            else {
              let b64 = await fetch(`data:image/png;base64,${load.data}`);
              blob = await b64.blob();
            }

            let imgURL = window.URL.createObjectURL(new Blob([blob]));
            let imgLink = document.createElement("a");
            imgLink.href = imgURL;
            let imgFormat = resolution === "svg" ? ".svg" : ".png";
            imgLink.setAttribute(
              "download",
              meta.value.icon.name_en.replace(/ /g, "-") + imgFormat
            );
            document.body.appendChild(imgLink);
            imgLink.click();
            document.body.removeChild(imgLink);

            notifPrimary(messages.iconDownloaded, "file_download");
          }
          if (status === "error") {
            notifError(message, "warning");
          }
        });
    };

    const onCloseDialog = () => {
      ctx.emit("onCloseDialog");
    };

    const backToSearch = () => {
      if (props.icon) return onCloseDialog();
      ctx.emit("onCloseDialog");
    };

    const goToSubs = () => {
      router.push("/subscriptions");
    };

    const goToPackPage = (pack_id) => {
      router.push(`/pack/${pack_id}`);
    };

    const goToIcon = async (icon) => {
      meta.value = { icon: null, user: null, pack: null };
      simulars.value = [];
      ctx.emit("onSimularIconClicked", icon);
      await fetchMeta(icon.id, icon.name);
    };

    onBeforeMount(async () => {
      await fetchMeta();
    });

    return {
      messages,
      features,
      user,
      meta,
      simulars,
      downloadPending,
      metaFetchPending,
      simularsFetchPending,
      dlBtnIndex,
      isMetaFetched,
      iconName,
      iconId,
      iconPackId,
      fetchMeta,
      fetchSimulars,
      username,
      onDownload,
      onCloseDialog,
      backToSearch,
      goToSubs,
      goToPackPage,
      goToIcon,
    };
  },
});
</script>

<style lang="sass" scoped>
.download-dialog-icon-container
  background: url(../assets/backgrounds/download-page-fg.png) no-repeat
  background-position: left top
  order: 1
.download-dialog-icon-img
  pointer-events: none
.icon-meta-container
  order: 0
.download-dialog-card
  min-width: 64vw!important
  max-height: max-content
.download-dialog-card .close-button
  margin-left: -8px
  margin-top: -8px
.dl-btn-container > .first-row
  line-height: 1.4rem
  font-size: large
.dl-btn-container > .second-row
  line-height: 1rem
  font-size: large

.dl-page-simulars-container
  min-width: 64vw !important
.simular-icon-container > .simular-icon-img
  pointer-events: none
.simular-icon-container
  border: 1px solid $primary
  text-align: center
  min-height: 100px
@media (max-width: $breakpoint-xs-max)
  .download-dialog-icon-container
    order: 0
  .download-dialog-icon-meta-container
    order: 1
</style>
