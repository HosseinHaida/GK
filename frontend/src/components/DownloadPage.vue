<template>
  <transition appear enter-active-class="animated slideInUp">
    <div
      :class="isIconVisible ? '' : 'q-pt-lg'"
      class="rounded-borders justify-center items-center column q-mx-lg q-pa-md q-mb-lg"
    >
      <div class="dl-self-container">
        <DownloadDialog
          v-if="isIconVisible"
          :idExtractedFromUrl="parsedId"
          :nameExtractedFromUrl="parsedName"
          @onCloseDialog="goHome"
          @nameNeedsCorrection="onReplaceNameInUrl"
          @onSimularIconClicked="onSimularIconClicked"
          @onComponentReady="onSelectedIconsMetaReady"
        />
      </div>
    </div>
  </transition>
</template>

<script>
import { useQuasar } from "quasar";
import { messages } from "src/stores/messages";
import { defineComponent, watch, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import DownloadDialog from "./DownloadDialog.vue";
import QSpinnerGrid from "quasar/src/components/spinner/QSpinnerGrid.js";

export default defineComponent({
  name: "DownloadPage",
  setup(props, ctx) {
    const router = useRouter();
    const route = useRoute();
    const $q = useQuasar();

    const parsedId = ref("");
    const parsedName = ref("");
    const isIconVisible = ref(false);

    const goHome = () => {
      router.push("/");
    };

    const onReplaceNameInUrl = (correctedName) => {
      parsedName.value = correctedName;
      router.replace({
        params: {
          iconId: `${parsedId.value}&آیکون_${parsedName.value}`,
        },
      });
    };

    const onSimularIconClicked = (icon) => {
      let parsedName = icon.name.replace(/ /g, "_");
      router.push(`/icon/${icon.id}&آیکون_${parsedName}`);
      isIconVisible.value = true;
    };

    const onSelectedIconsMetaReady = () => {
      $q.loading.hide();
    };

    watch(
      route,
      async () => {
        if (route.params.iconId) {
          let iconId = route.params.iconId;
          if (iconId.indexOf("&") < 0) return router.push("/");
          $q.loading.show({
            spinner: QSpinnerGrid,
            spinnerColor: "light",
            spinnerSize: 64,
            backgroundColor: "primary",
            messageColor: "white",
          });
          parsedId.value = iconId.substring(0, iconId.indexOf("&"));
          parsedName.value = iconId.substring(
            iconId.indexOf("_") + 1,
            iconId.length
          );
          // if the 'آیکون' keyword in url has been manipulated
          if (
            iconId.substring(iconId.indexOf("&") + 1, iconId.indexOf("_")) !==
            "آیکون"
          )
            router.push(`/icon/${parsedId.value}&آیکون_${parsedName.value}`);

          isIconVisible.value = true;
        }
      },
      { immediate: true }
    );

    onUnmounted(() => {
      parsedId.value = "";
      parsedName.value = "";
      isIconVisible.value = false;
    });

    return {
      parsedId,
      parsedName,
      isIconVisible,
      goHome,
      onReplaceNameInUrl,
      onSimularIconClicked,
      onSelectedIconsMetaReady,
      messages,
    };
  },
  components: { DownloadDialog },
});
</script>
<style lang="sass" scoped>
.dl-self-container
  overflow: hidden
  min-height: 100vh
</style>
