<template>
  <div class="main-bg">
    <router-view />
  </div>
</template>

<script>
import { defineComponent, onBeforeMount } from "vue";
import { useUserStore } from "./stores/users-store";
import { notifError } from "./util/notify";

export default defineComponent({
  name: "App",
  setup() {
    const userStore = useUserStore();

    onBeforeMount(() => {
      userStore.fetchUserData().then(({ status, message }) => {
        if (status === "error") {
          notifError(message, "warning");
        }
      });
    });
  },
});
</script>
<style lang="sass" scoped>
.main-bg
  background: url(./assets/backgrounds/icons_bg.svg) center center/cover no-repeat
  background-color: $dark
</style>
