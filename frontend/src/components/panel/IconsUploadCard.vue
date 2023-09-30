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
        <span class="q-pl-xl text-subtitle1 font-medium"> بارگذاری آیکون </span>
      </div>
    </div>

    <div class="q-mx-xl q-pt-sm q-pb-xl q-px-xs row">
      <div class="col-12">
        <div class="row items-center">
          <span
            class="col-auto q-mr-md text-body2 font-regular"
            style="color: rgba(0, 0, 0, 0.54)"
          >
            فایل
          </span>
          <div class="col">
            <div
              v-if="!pending"
              class="q-py-sm text-center rounded-borders cursor-pointer bg-gradient_l2r"
              @click="onIconPickClick"
            >
              <q-icon v-if="!iconFile" name="add" size="sm" color="light" />
              <span class="text-light" v-else>
                {{ iconFile.name }}
              </span>
              <q-file
                style="display: none"
                ref="iconFilePicker"
                v-model="iconFile"
                filled
                dense
                input-class="text-center"
                accept=".svg"
              />
            </div>
            <q-linear-progress
              v-else
              style="padding: 18px 0"
              indeterminate
              rounded
              color="primary"
            />
          </div>
        </div>

        <div class="row q-mt-sm">
          <div class="col-6">
            <q-input
              v-model="newIcon.name"
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
              v-model="newIcon.nameEN"
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
            <q-select
              filled
              dense
              v-model="newIcon.keywords"
              use-input
              use-chips
              multiple
              hide-dropdown-icon
              input-class="font-light"
              input-debounce="0"
              @new-value="createIconKeyword"
            >
              <template v-slot:before>
                <span class="q-mr-xs text-body2 font-regular"> کلیدواژه </span>
              </template>
            </q-select>
          </div>
        </div>

        <div class="row q-mt-lg">
          <q-space />

          <div class="col-auto">
            <q-btn
              @click="onIconUpload"
              label="افزودن"
              :loading="pending"
              color="primary"
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
import { notifError, notifPrimary } from "src/util/notify";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  name: "IconsUploadCard",
  emits: ["onCloseDialog"],
  setup(props, ctx) {
    const pending = computed(() => iconsStore.iconUploadPending);
    const iconsStore = useIconsStore();
    const iconFilePicker = ref(null);
    const iconFile = ref(null);
    const newIcon = ref({
      name: null,
      nameEN: null,
      keywords: null,
    });

    const createIconKeyword = (val, done) => {
      if (val.indexOf("'") > -1)
        return notifError(messages.noQuotationMarkPlease, "warning");
      done(val, "add-unique");
    };

    const onIconPickClick = () => {
      iconFilePicker.value.pickFiles();
    };

    const onCloseDialog = () => {
      ctx.emit("onCloseDialog");
    };

    const onIconUpload = async () => {
      if (!iconFile.value)
        return notifError(messages.chooseIconFile, "warning");
      if (!newIcon.value.name || !newIcon.value.nameEN)
        return notifError(messages.nameRequired, "warning");
      if (newIcon.value.name.length > 25 || newIcon.value.nameEN.length > 25)
        return notifError(messages.maxNameLength25, "warning");
      if (
        !newIcon.value.keywords ||
        (newIcon.value.keywords && newIcon.value.keywords.length < 1)
      )
        return notifError(messages.keywordsRequired, "warning");
      if (newIcon.value.keywords && newIcon.value.keywords.length > 8)
        return notifError(messages.eightKeywordsTotal, "warning");

      if (
        newIcon.value.name.indexOf("'") > -1 ||
        newIcon.value.nameEN.indexOf("'") > -1
      )
        return notifError(messages.noQuotationMarkPlease, "warning");

      const formData = new FormData();
      formData.append("icon", iconFile.value);
      formData.append("name", newIcon.value.name);
      formData.append("nameEN", newIcon.value.nameEN);
      formData.append("keywords", newIcon.value.keywords);

      await iconsStore
        .uploadIcon({ formData, packId: props.packId })
        .then(async ({ status, message }) => {
          if (status === "error") {
            notifError(message, "close");
          } else if (status === "success") {
            notifPrimary(messages.iconUploaded, "cloud_done");
            ctx.emit("onCloseDialog");
          }
        });
    };

    return {
      pending,
      iconFilePicker,
      iconFile,
      newIcon,
      createIconKeyword,
      onIconPickClick,
      onCloseDialog,
      onIconUpload,
    };
  },
  props: {
    packId: {
      type: Number,
      default: null,
    },
  },
});
</script>

<style lang="sass" scoped>
.close-button
  margin-left: -15px
  margin-top: -40px
</style>
