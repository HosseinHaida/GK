<template>
  <div class="container">
    <div class="row q-pb-md text-subtitle1 font-medium q-px-xl">ارسال تیکت</div>

    <div class="row q-px-xl">
      <div class="col-6 q-mb-md">
        <q-input rounded filled dense v-model="title" input-class="q-px-md">
          <template v-slot:before>
            <span class="q-mr-sm text-body2 font-regular">موضوع</span>
          </template>
        </q-input>
      </div>

      <div class="col-12">
        <q-input classs="rounded-borders" v-model="text" filled type="textarea">
          <template v-slot:before>
            <span class="q-mr-sm text-body2 font-regular"> متن </span>
          </template>
        </q-input>
      </div>
    </div>

    <div class="row justify-end q-px-xl q-mt-md font-medium">
      <q-btn
        class="shadow-9"
        color="primary"
        @click="sendTicket"
        :loading="pending"
      >
        ارسال
      </q-btn>
    </div>
  </div>
</template>

<script>
import { useTicketsStore } from "src/stores/tickets-store";
import { notifError, notifPrimary } from "src/util/notify";
import { computed, defineComponent, ref } from "vue";

export default defineComponent({
  name: "PanelSupport",
  setup() {
    const ticketsStore = useTicketsStore();

    const text = ref("");
    const title = ref("");

    const pending = computed(() => ticketsStore.sendingTicket);

    const sendTicket = async () => {
      await ticketsStore
        .addTicket({
          text: text.value,
          title: title.value,
        })
        .then(async ({ status, message }) => {
          if (status === "error") {
            notifError(message, "warning");
          } else if (status === "success") {
            notifPrimary(message, "message");
            text.value = "";
            title.value = "";
          }
        });
    };

    return {
      text,
      title,
      pending,
      sendTicket,
    };
  },
});
</script>
