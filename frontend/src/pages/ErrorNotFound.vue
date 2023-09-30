<template>
  <div
    class="fullscreen bg-secondary text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="opacity: 0.4">اینجا چیزی نیست ...</div>

      <q-btn class="q-mt-xl" to="/" label="صفحه اصلی" no-caps />
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "ErrorNotFound",
});
</script>
