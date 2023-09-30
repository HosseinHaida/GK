<template>
  <div class="container">
    <div class="row q-pb-md text-subtitle1 font-medium q-px-xl">پیام‌ها</div>
    <q-list class="rounded-borders q-mx-xl q-pa-sm panel-msgs-container">
      <div v-if="records && records.length < 1" class="q-ma-sm">
        <div class="note q-px-md q-py-sm rounded-borders">
          {{ messages.noTicketsFound }}
        </div>
      </div>
      <q-item
        v-for="(rec, i) in records"
        :key="i"
        class="rounded-borders bg-light shadow-10 q-mb-sm"
      >
        <!-- <q-item-section avatar>
          <q-avatar>
            <img src="https://cdn.quasar.dev/img/avatar4.jpg" />
          </q-avatar>
        </q-item-section> -->

        <!-- CONTINUE here -connect to messages store -->

        <q-item-section>
          <q-item-label lines="1">
            <span class="text-weight-bold">{{ rec.message_from }} - </span>
            <q-chip square class="text-caption font-regular">
              موضوع‌ پیام :
              <span class="text-bold">
                {{ rec.title }}
              </span>
            </q-chip>
          </q-item-label>
          <q-item-label class="font-light" caption lines="2">
            {{ rec.body }}
          </q-item-label>
        </q-item-section>

        <q-item-section side top class="text-caption">
          <div class="column text-right">
            {{ getDate(rec.created_at) }}
            <br />
            {{ e2p(getTime(rec.created_at)) }}
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { e2p, getDate, getTime } from "src/stores/helpers";
import { messages } from "src/stores/messages";
import { useMessagesStore } from "src/stores/messages-store";
import { notifError } from "src/util/notify";
import { computed, defineComponent, onBeforeMount } from "vue";

export default defineComponent({
  name: "PanelMessages",
  setup() {
    const messagesStore = useMessagesStore();

    const pending = computed(() => messagesStore.fetchMessagesPending);
    const records = computed(() => messagesStore.messages);

    const fetchMessages = async () => {
      await messagesStore.fetchMessages().then(async ({ status, message }) => {
        if (status === "error") {
          notifError(message, "message");
        }
      });
    };

    onBeforeMount(async () => {
      await fetchMessages();
    });

    return {
      pending,
      records,
      fetchMessages,
      messages,
      e2p,
      getDate,
      getTime,
    };
  },
});
</script>
<style lang="sass" scoped>
.panel-msgs-container
  min-height: 40vh
  -moz-box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.2)
  -webkit-box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.2)
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.2)
</style>
