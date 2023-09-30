<template>
  <q-card v-if="pack" class="pack-dialog-card g-rounded-borders" flat>
    <div class="row">
      <div class="col-md-7 col-xs-12 q-pa-md q-pr-lg justify-between">
        <div class="row justify-start text-center q-pb-sm">
          <span class="close-button float-left">
            <q-icon
              name="close"
              size="md"
              color="grey-5"
              class="cursor-pointer"
              @click="onCloseDialog()"
            />
          </span>
        </div>
        <div class="row">
          <div class="col-6 q-pr-xs">
            <div
              class="text-subtitle text-grey-6 q-py-sm q-pr-sm row justify-center"
            >
              نام
            </div>
            <q-input
              dense
              input-class="text-h6 text-center text-primary"
              v-model="clonedPack.name"
              filled
            ></q-input>
          </div>
          <div class="col-6 q-pl-xs">
            <div
              class="text-subtitle text-grey-6 q-py-sm q-pr-sm row justify-center"
            >
              نام لاتین
            </div>
            <q-input
              dense
              dir="ltr"
              input-class="text-h6 text-center text-primary"
              v-model="clonedPack.name_en"
              filled
            ></q-input>
          </div>
        </div>

        <div class="col-auto q-mt-md">
          <div class="q-pa-xs rounded-borders shadow-1 text-right">
            <span class="q-mr-sm">
              {{ pack ? username : "username" }}
            </span>
            <q-avatar
              class="text-center text-light"
              size="40px"
              color="primary"
            >
              {{ pack ? username.charAt(0) : "!" }}
            </q-avatar>
          </div>
        </div>

        <div class="col q-mt-sm">
          <div class="row">
            <div class="col-auto">
              <div class="text-subtitle text-grey-6 q-py-sm q-pr-sm row">
                طرح
              </div>
              <q-btn
                class="text-primary q-mr-sm col-auto shadow-1 font-regular"
                style="width: 100px"
                :label="iconStyles[clonedPack.style]"
                dense
                unelevated
              >
                <q-menu>
                  <q-list class="font-light" dense style="min-width: 100px">
                    <q-item
                      v-for="(label, value, i) in iconStyles"
                      :key="i"
                      clickable
                      @click="clonedPack.style = value"
                      v-close-popup
                    >
                      <q-item-section>{{ label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <div class="col-auto">
              <div class="text-subtitle text-grey-6 q-py-sm q-pr-sm row">
                رنگ
              </div>
              <q-btn
                class="text-primary col-auto shadow-1 font-regular"
                style="width: 80px"
                :label="iconColors[clonedPack.color]"
                dense
                unelevated
              >
                <q-menu>
                  <q-list class="font-light" dense style="min-width: 100px">
                    <q-item
                      v-for="(label, value, i) in iconColors"
                      :key="i"
                      clickable
                      @click="clonedPack.color = value"
                      v-close-popup
                    >
                      <q-item-section>{{ label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <div class="col text-right">
              <div class="text-subtitle text-grey-6 q-py-sm q-pr-sm">
                تعداد دانلود
              </div>
              <q-chip dense square color="light">
                <div class="q-px-sm">
                  {{ e2p(clonedPack.icons_download_count) }}
                </div>
              </q-chip>
            </div>
          </div>
        </div>

        <div class="col q-mt-sm">
          <div class="text-subtitle text-grey-6 q-py-sm">
            {{ e2p(clonedPack.keywords.length) }} کلیدواژه

            <q-btn
              icon="edit"
              dense
              round
              flat
              size="sm"
              @click="isKeywordsEditable = !isKeywordsEditable"
            />
          </div>
          <div class="row q-pl-sm">
            <div class="col-12" v-if="!isKeywordsEditable">
              <q-chip
                v-for="(keyword, i) in clonedPack.keywords"
                :key="i"
                :label="keyword"
                dense
                color="grey-3"
                clickable
                @click="onCopyPhrase(keyword)"
              />
            </div>
            <div class="col-12" v-else>
              <q-select
                filled
                dense
                v-model="clonedPack.keywords"
                use-input
                use-chips
                multiple
                hide-dropdown-icon
                input-class="font-light"
                input-debounce="0"
                @new-value="createKeyword"
              >
                <template v-slot:append>
                  <div>
                    <q-btn
                      v-if="
                        JSON.stringify(clonedPack.keywords) !==
                        JSON.stringify(pack.keywords)
                      "
                      dense
                      class="q-ml-sm q-py-none q-px-sm"
                      icon="sync"
                      color="secondary"
                      @click="onKeywordsReset"
                      flat
                    />
                  </div>
                </template>
              </q-select>
            </div>
          </div>
        </div>

        <div class="col q-mt-sm">
          <div class="text-subtitle text-grey-6 q-py-sm q-pr-sm row">وضعیت</div>

          <div class="row q-pl-sm">
            <q-chip
              outline
              square
              color="light"
              class="full-width"
              v-if="clonedPack.status_message"
            >
              <div class="text-grey-6">پیام فعلی :</div>

              <div class="text-black q-px-sm">
                {{ clonedPack.status_message }}
              </div>
            </q-chip>
          </div>

          <q-input
            dense
            class="full-width q-pl-sm"
            filled
            :label="clonedPack.status_message ? 'پیام جدید' : 'پیام ...'"
            v-model="message"
          />

          <q-tabs
            align="justify"
            class="full-width q-mt-sm q-pl-sm"
            v-model="packSelectedState"
          >
            <q-tab
              v-for="(availState, i) in packStates"
              :key="i"
              :name="i"
              class="rounded-borders"
              :class="'text-' + availState.color"
              :icon="availState.icon"
              :label="availState.action_label"
            >
              <q-icon
                v-if="clonedPack.status === availState.value"
                name="circle"
              />
            </q-tab>
          </q-tabs>
        </div>

        <div class="col-auto q-mt-lg">
          <q-btn
            @click="onDeletePackConfirm(clonedPack.id, clonedPack.name)"
            icon="delete"
            color="negative"
            label="حذف پک"
          >
            <q-tooltip> حذف پک </q-tooltip>
          </q-btn>

          <q-btn
            class="q-ma-sm"
            icon="save"
            color="positive"
            label="ثبت وضعیت"
            :loading="setStatusPending"
            @click="setStatus(clonedPack.id, clonedPack.status)"
          />
        </div>
      </div>

      <div class="col-md-5 col-xs-12 q-pa-md bg-grey-1 shadow-1">
        <div class="full-height row">
          <div class="column">
            <div class="text-subtitle text-grey-6 q-mb-sm">
              <q-spinner-dots color="primary" v-if="fetchPackIconsPending" />
              <span v-else> {{ e2p(icons.length) }} آیکون </span>
            </div>
            <div
              class="row items-center"
              style="overflow-y: auto; max-height: 80vh"
            >
              <div
                v-for="(icon, j) in icons"
                :key="j"
                class="row items-center rounded-borders bg-white shadow-4 q-ma-xs q-pa-sm cursor-pointer justify-center"
                @click="showIconDetails(icon)"
                style="width: 55px"
              >
                <q-img
                  :alt="icon.name_en"
                  :src="icon.thumbnail_url"
                  fit="contain"
                  ratio="1"
                />
              </div>

              <div
                class="row items-center rounded-borders bg-white q-ma-xs q-pa-sm cursor-pointer justify-center"
                style="width: 55px; height: 55px"
                @click="showIconUploadDialog = true"
              >
                <q-icon name="add" color="primary" size="1.8rem" />
              </div>
            </div>
            <q-dialog v-model="showIconUploadDialog">
              <IconsUploadCard
                :packId="pack.id"
                @on-close-dialog="closeIconUploadDialog"
              />
            </q-dialog>

            <q-dialog v-model="isIconDetailsVisible">
              <IconsEditCard
                :bound-icon="selectedIcon"
                :show-download-count="true"
                @on-updated="onIconsUpdated"
                @on-close-dialog="closeIconDetails"
              />
            </q-dialog>
          </div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import { e2p, onCopyPhrase } from "src/stores/helpers";
import { usePacksStore } from "src/stores/packs-store";
import { messages } from "src/stores/messages";
import { packStates, iconColors, iconStyles } from "src/stores/variables";
import { notifError, notifPrimary } from "src/util/notify";
import {
  defineComponent,
  computed,
  ref,
  onBeforeMount,
  // onUnmounted,
} from "vue";
import { useQuasar } from "quasar";
import IconsEditCard from "../IconsEditCard.vue";
import IconsUploadCard from "../IconsUploadCard.vue";

export default defineComponent({
  components: {
    IconsEditCard,
    IconsUploadCard,
  },
  name: "AdminPanelPack",
  emits: ["onCloseDialog", "onFetchPacks"],
  props: {
    pack: {
      type: Object,
      default: () => {},
    },
    icons: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, ctx) {
    const $q = useQuasar();

    const packsStore = usePacksStore();

    const message = ref("");
    const packSelectedState = ref("");

    const clonedPack = ref();

    const selectedIcon = ref(null);
    const isKeywordsEditable = ref(false);
    const isIconDetailsVisible = ref(false);
    const showIconUploadDialog = ref(false);

    const setStatusPending = computed(() => packsStore.setStatusPending);
    const fetchPackIconsPending = computed(
      () => packsStore.fetchPackIconsPending
    );

    const username = computed(() => {
      if (props.pack.username) return props.pack.username;
      else return props.pack.email.substring(0, props.pack.email.indexOf("@"));
    });

    const setStatus = async (packId, packStatus) => {
      await packsStore
        .setStatus({
          packId,
          state: packSelectedState.value ? packSelectedState.value : packStatus,
          message: message.value,
          name: clonedPack.value.name,
          name_en: clonedPack.value.name_en,
          keywords: clonedPack.value.keywords,
          color: clonedPack.value.color,
          style: clonedPack.value.style,
        })
        .then(async ({ status, message }) => {
          if (status === "error") {
            notifError(message, "message");
          } else if (status === "success") {
            notifPrimary(message, "cloud_done");
            ctx.emit("onFetchPacks");
            onCloseDialog();
          }
        });
    };

    const showIconDetails = async (icon) => {
      isIconDetailsVisible.value = true;
      selectedIcon.value = icon;
    };
    const closeIconDetails = async () => {
      isIconDetailsVisible.value = false;
      selectedIcon.value = null;
    };

    const onIconsUpdated = async () => {
      isIconDetailsVisible.value = false;
      selectedIcon.value = null;
      await fetchPackIcons();
    };

    const closeIconUploadDialog = async () => {
      showIconUploadDialog.value = false;
      await fetchPackIcons();
    };

    const fetchPackIcons = async () => {
      await packsStore
        .fetchPackIcons(props.pack.id)
        .then(async ({ status, message, load }) => {
          if (status === "error") {
            notifError(message, "message");
          }
        });
    };

    const onDeletePackConfirm = async (packId, packName) => {
      $q.dialog({
        title: "تأیید نهایی",
        message: `پک '${packName}' برای همیشه پاک خواهد شد!`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        await onDeletePack(packId);
        onCloseDialog();
      });
    };

    const onDeletePack = async (packId) => {
      await packsStore.deletePack(packId).then(async ({ status, message }) => {
        if (status === "error") {
          notifError(message, "warning");
        } else if (status === "success") {
          notifPrimary(message, "delete");
          ctx.emit("onFetchPacks");
        }
      });
    };

    const onKeywordsReset = () => {
      clonedPack.value.keywords = JSON.parse(
        JSON.stringify(props.pack.keywords)
      );
    };

    const createKeyword = (val, done) => {
      if (val.indexOf("'") > -1)
        return notifError(messages.noQuotationMarkPlease, "warning");
      done(val, "add-unique");
    };

    const onCloseDialog = () => {
      ctx.emit("onCloseDialog");
    };

    onBeforeMount(() => {
      clonedPack.value = JSON.parse(JSON.stringify(props.pack));
    });

    return {
      message,
      packSelectedState,
      clonedPack,
      selectedIcon,
      isKeywordsEditable,
      isIconDetailsVisible,
      showIconUploadDialog,
      fetchPackIconsPending,
      setStatusPending,
      username,
      setStatus,
      showIconDetails,
      closeIconDetails,
      onIconsUpdated,
      closeIconUploadDialog,
      onDeletePackConfirm,
      onDeletePack,
      onKeywordsReset,
      createKeyword,
      onCloseDialog,
      packStates,
      iconColors,
      iconStyles,
      e2p,
      onCopyPhrase,
    };
  },
});
</script>

<style lang="sass" scoped>
.pack-dialog-card
  min-width: 60vw!important
  max-height: 90vh
.pack-dialog-card .close-button
  margin-left: -8px
  margin-top: -8px
</style>
