<template>
  <div class="container">
    <div class="row q-pb-md text-subtitle1 font-medium q-px-xl">
      آیکون‌های من
      <div v-if="deletingPack || fetchUserPacksPending" class="q-mx-sm">
        <q-spinner-hourglass color="primary" size="1.1em" />
      </div>
    </div>
    <q-list
      class="rounded-borders q-mx-xl q-py-sm q-px-xs row"
      :class="
        packs.length > 0
          ? 'panel-user-packs-container'
          : 'panel-user-packs-empty-container'
      "
    >
      <template v-if="packs.length > 0">
        <div v-for="(pack, i) in packs" :key="i" class="col-6 q-px-xs">
          <q-item
            style="min-height: 20px"
            class="rounded-borders bg-light shadow-9 q-mb-sm q-py-xs q-pr-xs q-pl-sm g-rounded-6"
          >
            <q-item-section>
              <q-item-label class="font-regular" lines="1">
                {{ pack.name }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <div class="row">
                <q-icon
                  dense
                  size="1.2rem"
                  name="img:/ui/cg.trash.svg"
                  class="q-mr-sm cursor-pointer"
                  @click="onDeletePackConfirm(pack.id, pack.name)"
                />
                <q-chip
                  square
                  dense
                  :class="pack.status_message ? 'q-pr-lg' : ''"
                  :color="packStates[pack.status].color"
                  class="q-ma-none q-px-sm text-light font-medium pack-status-chip cursor-pointer g-rounded-6"
                >
                  <span> {{ packStates[pack.status].label }} </span>

                  <q-badge v-if="pack.status_message" color="light" floating>
                    <q-icon
                      :color="packStates[pack.status].color"
                      name="help_outline"
                    />
                  </q-badge>

                  <q-tooltip v-if="pack.status_message" style="font-size: 13px">
                    {{ pack.status_message }}
                  </q-tooltip>
                </q-chip>
              </div>
            </q-item-section>
          </q-item>
        </div>
      </template>
      <div v-else class="full-width text-grey row justify-center text-caption">
        {{ messages.uploadFirstPackUsingTheseFields }}
      </div>
    </q-list>
  </div>

  <div class="row q-mt-lg q-pb-xs text-subtitle1 font-medium q-px-xl">
    بارگذاری
  </div>

  <div class="q-mx-xl q-pt-sm q-pb-xl q-px-xs row">
    <div class="col-12">
      <div class="row">
        <div class="col-6">
          <q-input
            v-model="newPack.name"
            class="q-pr-md"
            input-class="font-light"
            filled
            dense
          >
            <template v-slot:before>
              <span class="q-mr-sm text-body2 font-regular"> نام پک </span>
            </template>
          </q-input>
        </div>

        <div class="col-6 q-pl-lg">
          <q-input
            v-model="newPack.nameEN"
            class="q-pl-md"
            input-class="font-light"
            filled
            dense
          >
            <template v-slot:before>
              <span class="q-mr-sm text-body2 font-regular">
                نام لاتین پک
              </span>
            </template>
          </q-input>
        </div>
      </div>

      <div class="row q-mt-sm items-center">
        <!-- icons preview -->
        <span class="q-mr-sm text-body2 font-regular"> آیکون‌ها</span>
        <div
          class="col rounded-borders q-mr-sm items-center"
          style="height: 40px"
        >
          <div class="row items-center full-height q-px-xs">
            <q-btn
              @click="showIconUploadDialog = true"
              dense
              icon="add"
              flat
              :loading="tempIconsPending"
              class="text-primary q-mr-md"
            />
            <div
              v-for="(tempIcon, i) in tempIcons"
              :key="i"
              class="q-mr-sm cursor-pointer"
              style="width: 20px"
              @click="onShowIconEditCard(tempIcon)"
            >
              <q-img
                :alt="tempIcon.name_en"
                :src="tempIcon.thumbnail_url"
                fit="contain"
                ratio="1"
              />
            </div>
          </div>
        </div>
        <q-btn
          class="text-primary q-mr-sm col-auto shadow-1 font-regular"
          style="width: 100px"
          :label="iconStyles[selectedStyle] || 'طرح'"
          dense
          unelevated
        >
          <q-menu>
            <q-list class="font-light" dense style="min-width: 100px">
              <q-item
                v-for="(label, value, i) in iconStyles"
                :key="i"
                clickable
                @click="selectedStyle = value"
                v-close-popup
              >
                <q-item-section>{{ label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn
          class="text-primary col-auto shadow-1 font-regular"
          style="width: 80px"
          :label="iconColors[selectedColor] || 'رنگ'"
          dense
          unelevated
        >
          <q-menu>
            <q-list class="font-light" dense style="min-width: 100px">
              <q-item
                v-for="(label, value, i) in iconColors"
                :key="i"
                clickable
                @click="selectedColor = value"
                v-close-popup
              >
                <q-item-section>{{ label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <div class="row q-mt-sm">
        <div class="col-12">
          <q-select
            filled
            dense
            v-model="newPack.keywords"
            use-input
            use-chips
            multiple
            input-class="font-light"
            hide-dropdown-icon
            input-debounce="0"
            @new-value="createPackKeyword"
          >
            <template v-slot:before>
              <span class="q-mr-xs text-body2 font-regular"> کلیدواژه </span>
            </template>
          </q-select>
        </div>
      </div>

      <div class="row q-mt-sm">
        <q-space />

        <div class="col-auto">
          <q-btn
            class="q-mr-md font-medium"
            outline
            @click="openHelpDoc"
            color="primary"
            label="راهنمای طراحی آیکون"
          />
          <q-btn
            @click="addPack()"
            label="ارسال"
            class="font-medium"
            color="primary"
            :loading="addingPack"
          />
        </div>
      </div>
    </div>
    <q-dialog v-model="showIconUploadDialog">
      <IconsUploadCard @on-close-dialog="showIconUploadDialog = false" />
    </q-dialog>
    <q-dialog v-model="showIconEditDialog">
      <IconsEditCard
        :bound-icon="selectedTempIcon"
        @on-close-dialog="showIconEditDialog = false"
        @on-updated="onTempIconsUpdated"
      />
    </q-dialog>

    <q-dialog
      v-model="showTerms"
      persistent
      transition-show="rotate"
      transition-hide="rotate"
    >
      <TermsDialog />
    </q-dialog>
  </div>
</template>

<script>
import { useQuasar } from "quasar";
import { notifError, notifPrimary } from "src/util/notify";
import { messages } from "src/stores/messages";
import {
  packStates,
  iconColors,
  iconStyles,
  serverUrl,
} from "src/stores/variables";
import { usePacksStore } from "src/stores/packs-store";
import { useIconsStore } from "src/stores/icons-store";
import {
  computed,
  defineComponent,
  ref,
  onBeforeUnmount,
  onMounted,
} from "vue";
import IconsUploadCard from "./IconsUploadCard.vue";
import IconsEditCard from "./IconsEditCard.vue";
import TermsDialog from "./TermsDialog.vue";

export default defineComponent({
  name: "PanelMyIcons",
  props: {
    user: {
      type: Object,
      default: () => {},
    },
  },
  setup(props, ctx) {
    const $q = useQuasar();

    const iconsStore = useIconsStore();
    const packsStore = usePacksStore();

    const showTerms = computed(() => !props.user.agreed);

    const packs = computed(() => packsStore.userPacks);
    const addingPack = computed(() => packsStore.addingPack);
    const deletingPack = computed(() => packsStore.deletingPack);
    const fetchUserPacksPending = computed(
      () => packsStore.fetchUserPacksPending
    );
    const tempIcons = computed(() => iconsStore.tempIcons);
    const tempIconsPending = computed(() => iconsStore.tempIconsFetchPending);

    const newPack = ref({
      name: null,
      nameEN: null,
      keywords: null,
    });
    const showIconUploadDialog = ref(false);
    const selectedTempIcon = ref(null);
    const showIconEditDialog = ref(false);

    const selectedStyle = ref();
    const selectedColor = ref();

    const createPackKeyword = (val, done) => {
      if (val.indexOf("'") > -1)
        return notifError(messages.noQuotationMarkPlease, "warning");
      done(val, "add-unique");
    };

    const fetchTempIcons = async () => {
      await iconsStore.fetchTempIcons().then(({ status, message }) => {
        if (status === "error") {
          notifPrimary(message, "warning");
        }
      });
    };

    const fetchUserPacks = async () => {
      await packsStore.fetchUserPacks().then(({ status, message }) => {
        if (status === "error") {
          notifError(message, "warning");
        }
      });
    };

    const resetForm = () => {
      newPack.value.name = null;
      newPack.value.nameEN = null;
      newPack.value.keywords = null;
      selectedStyle.value = "";
      selectedColor.value = "";
    };

    const addPack = async () => {
      if (!newPack.value.name || !newPack.value.nameEN)
        return notifError(messages.nameRequired, "warning");
      if (newPack.value.name.length > 25 || newPack.value.nameEN.length > 25)
        return notifError(messages.maxNameLength25, "warning");
      if (tempIcons.value.length < 15)
        return notifError(messages.min15IconsIsAMust, "warning");
      if (!selectedStyle.value)
        return notifError(messages.selectPackStyle, "warning");
      if (!selectedColor.value)
        return notifError(messages.selectPackColor, "warning");
      if (
        !newPack.value.keywords ||
        (newPack.value.keywords && newPack.value.keywords.length < 1)
      )
        return notifError(messages.keywordsRequired, "warning");
      if (newPack.value.keywords && newPack.value.keywords.length > 8)
        return notifError(messages.eightKeywordsTotal, "warning");

      if (
        newPack.value.name.indexOf("'") > -1 ||
        newPack.value.nameEN.indexOf("'") > -1
      )
        return notifError(messages.noQuotationMarkPlease, "warning");

      await packsStore
        .addPack({
          name: newPack.value.name,
          nameEN: newPack.value.nameEN,
          keywords: newPack.value.keywords.join(","),
          style: selectedStyle.value,
          color: selectedColor.value,
        })
        .then(async ({ status, message }) => {
          if (status === "error") {
            notifError(message, "warning");
          } else if (status === "success") {
            resetForm();
            notifPrimary(message, "done");
          }
        });
    };

    const removeTempIconsFromServer = async () => {
      if (tempIcons.value.length > 0)
        await iconsStore.removeTempIcons().then(async ({ status, message }) => {
          if (status === "error") {
            notifError(message, "warning");
          } else if (status === "success") {
            notifPrimary(messages.tempIconsDeleted, "delete");
            iconsStore.setTempicons([]);
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
      });
    };

    const onDeletePack = async (packId) => {
      await packsStore.deletePack(packId).then(async ({ status, message }) => {
        if (status === "error") {
          notifError(message, "warning");
        } else if (status === "success") {
          notifPrimary(message, "delete");
          await fetchUserPacks();
        }
      });
    };

    const onShowIconEditCard = (tempIcon) => {
      selectedTempIcon.value = tempIcon;
      showIconEditDialog.value = true;
    };

    const openHelpDoc = () =>
      window.open(serverUrl + "/public/VecThor.How-To.pdf", "_blank").focus();

    const onTempIconsUpdated = async () => {
      showIconEditDialog.value = false;
      await fetchTempIcons();
    };

    onMounted(async () => {
      await fetchUserPacks();
      await fetchTempIcons();
    });

    onBeforeUnmount(async () => {
      if (tempIcons.value.length > 0)
        $q.dialog({
          title: messages.warning,
          message: messages.tempIconsWillBeLost,
          cancel: true,
          ok: {
            label: "بله",
            flat: true,
          },
          cancel: {
            label: "لغو",
          },
          persistent: true,
        })
          .onOk(async () => {
            await removeTempIconsFromServer();
          })
          .onCancel(() => {})
          .onDismiss(() => {});
    });

    return {
      messages,
      packStates,
      showTerms,
      packs,
      tempIcons,
      tempIconsPending,
      addingPack,
      deletingPack,
      fetchUserPacksPending,
      newPack,
      showIconUploadDialog,
      selectedTempIcon,
      showIconEditDialog,
      iconStyles,
      selectedStyle,
      iconColors,
      selectedColor,
      fetchTempIcons,
      createPackKeyword,
      fetchUserPacks,
      resetForm,
      addPack,
      removeTempIconsFromServer,
      onDeletePackConfirm,
      onDeletePack,
      onShowIconEditCard,
      openHelpDoc,
      onTempIconsUpdated,
    };
  },
  components: {
    IconsUploadCard,
    IconsEditCard,
    TermsDialog,
  },
});
</script>
<style lang="sass" scoped>
.panel-user-packs-empty-container
  border: 1px dashed rgba(0, 0, 0, 0.2)
.panel-user-packs-container
  max-height: 19vh
  -moz-box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.2)
  -webkit-box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.2)
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.2)
  overflow-y: auto
.pack-status-chip span
  min-width: 80px
  text-align: center
</style>
