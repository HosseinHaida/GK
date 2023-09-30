<template>
  <div
    class="container q-px-lg q-pt-xl q-pb-sm bg-light g-rounded-borders"
    style="min-width: 64vw"
  >
    <div class="row">
      <div class="col-auto q-pb-sm q-pr-sm justify-between">
        <span class="close-button float-left">
          <q-icon
            name="close"
            size="md"
            color="grey-5"
            class="cursor-pointer"
            @click="onCloseDialog()"
          />
        </span>
        <span class="q-pl-xl text-subtitle1 font-medium"> ویرایش آیکون </span>
      </div>
    </div>

    <div class="q-mx-xl q-pt-sm q-pb-xl q-px-xs row">
      <div class="col-12">
        <div class="row justify-start items-center q-pb-md">
          <q-img width="80px" :src="thisIcon.thumbnail_url"></q-img>
          <div class="col"></div>
          <div v-if="showDownloadCount" class="col-auto q-mt-sm text-right">
            <div class="text-subtitle text-grey-5 q-py-sm q-pr-sm">
              تعداد دانلود
            </div>
            <q-chip dense square color="light">
              <div class="q-px-sm">
                {{ e2p(thisIcon.download_count) }}
              </div>
            </q-chip>
          </div>
        </div>

        <div class="row q-mt-sm">
          <div class="col-6">
            <q-input
              v-model="thisIcon.name"
              input-class="font-light"
              class="q-pr-md"
              filled
              dense
            >
              <template v-slot:before>
                <span class="q-mr-sm text-body2 font-regular"> نام آیکون </span>
              </template>
            </q-input>
          </div>

          <div class="col-6 q-pl-lg">
            <q-input
              v-model="thisIcon.name_en"
              input-class="font-light"
              class="q-pl-md"
              filled
              dense
            >
              <template v-slot:before>
                <span class="q-mr-sm text-body2 font-regular">
                  نام لاتین آیکون
                </span>
              </template>
            </q-input>
          </div>
        </div>
        <div class="row q-mt-sm">
          <div class="col-12">
            <div class="row">
              <div class="col-auto">
                <div class="text-subtitle text-grey-8 q-py-sm">
                  {{ e2p(thisIcon.keywords.length) }} کلیدواژه

                  <q-btn
                    icon="edit"
                    dense
                    round
                    flat
                    size="sm"
                    @click="isKeywordsEditable = !isKeywordsEditable"
                  />
                </div>
              </div>

              <div class="col-12" v-if="!isKeywordsEditable">
                <q-chip
                  v-for="(keyword, i) in thisIcon.keywords"
                  :key="i"
                  :label="keyword"
                  dense
                  clickable
                  @click="onCopyPhrase(keyword)"
                />
              </div>
              <q-select
                v-else
                class="col-12"
                filled
                dense
                v-model="thisIcon.keywords"
                use-input
                use-chips
                multiple
                hide-dropdown-icon
                input-class="font-light"
                input-debounce="0"
                @new-value="createIconKeyword"
              />
            </div>
          </div>
        </div>

        <div class="row q-mt-lg">
          <q-space />

          <div class="col-12">
            <div class="row">
              <div class="col">
                <q-btn
                  label="حذف"
                  color="negative"
                  icon="delete"
                  @click="removeIcon"
                  :loading="removePending"
                />
              </div>

              <q-btn
                class="col-auto q-mr-sm"
                color="primary"
                outline
                label="دانلود"
                @click="onDownload"
                :loading="downloadPending"
              />

              <q-btn
                class="col-auto"
                @click="onIconSaveEdit"
                label="ذخیره"
                :loading="pending"
                color="primary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { e2p, onCopyPhrase } from "src/stores/helpers";
import { useIconsStore } from "src/stores/icons-store";
import { messages } from "src/stores/messages";
import { notifError, notifPrimary } from "src/util/notify";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  name: "IconsEditCard",
  emits: ["onCloseDialog", "onUpdated"],
  setup(props, ctx) {
    const pending = computed(() => iconsStore.iconUpdatePending);
    const downloadPending = computed(() => iconsStore.iconDownloadPending);
    const removePending = computed(() => iconsStore.removeIconPending);
    const iconsStore = useIconsStore();
    const thisIcon = ref({ ...props.boundIcon });
    const isKeywordsEditable = ref(false);

    const createIconKeyword = (val, done) => {
      if (val.indexOf("'") > -1)
        return notifError(messages.noQuotationMarkPlease, "warning");
      done(val, "add-unique");
    };
    const onCloseDialog = () => {
      ctx.emit("onCloseDialog");
    };

    const onIconSaveEdit = async () => {
      if (!thisIcon.value.name || !thisIcon.value.name_en)
        return notifError(messages.nameRequired, "warning");
      if (thisIcon.value.name.length > 25 || thisIcon.value.name_en.length > 25)
        return notifError(messages.maxNameLength25, "warning");
      if (
        !thisIcon.value.keywords ||
        (thisIcon.value.keywords && thisIcon.value.keywords.length < 1)
      )
        return notifError(messages.keywordsRequired, "warning");
      if (thisIcon.value.keywords && thisIcon.value.keywords.length > 8)
        return notifError(messages.eightKeywordsTotal, "warning");
      if (thisIcon.value.name_en.indexOf("'") > -1)
        return notifError(messages.noQuotationMarkPlease, "warning");

      await iconsStore
        .updateIcon({
          id: thisIcon.value.id,
          name: thisIcon.value.name,
          name_en: thisIcon.value.name_en,
          keywords: thisIcon.value.keywords,
        })
        .then(async ({ status, message }) => {
          if (status === "error") {
            notifError(message, "close");
          } else if (status === "success") {
            notifPrimary(messages.iconUpdated, "cloud_done");
            ctx.emit("onUpdated");
          }
        });
    };

    const onDownload = async () => {
      await iconsStore
        .downloadIcon({ id: props.boundIcon.id, resolution: "svg" })
        .then(async ({ status, message, load }) => {
          if (status === "success") {
            let imgURL = window.URL.createObjectURL(new Blob([load.data]));
            let imgLink = document.createElement("a");
            imgLink.href = imgURL;
            imgLink.setAttribute(
              "download",
              props.boundIcon.name_en.replace(/ /g, "-") + ".svg"
            );
            document.body.appendChild(imgLink);
            imgLink.click();
            document.body.removeChild(imgLink);

            notifPrimary(messages.iconDownloaded, "file_download");
          }
          if (status === "error") notifError(message, "warning");
        });
    };

    const removeIcon = async () => {
      await iconsStore
        .removeIcon(thisIcon.value.id)
        .then(async ({ status, message }) => {
          if (status === "error") {
            notifError(message, "close");
          } else if (status === "success") {
            notifPrimary(message, "delete");
            ctx.emit("onUpdated");
          }
        });
    };

    return {
      pending,
      downloadPending,
      removePending,
      thisIcon,
      isKeywordsEditable,
      createIconKeyword,
      onCloseDialog,
      onIconSaveEdit,
      onDownload,
      removeIcon,
      e2p,
      onCopyPhrase,
    };
  },
  props: {
    boundIcon: {
      type: Object,
      required: true,
      default: () => {
        return {
          name: "",
          nameEN: "",
          keywords: "",
          thumbnail_url: "",
          watermark_url: "",
        };
      },
    },
    showDownloadCount: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="sass" scoped>
.close-button
  margin-left: -15px
  margin-top: -40px
</style>
