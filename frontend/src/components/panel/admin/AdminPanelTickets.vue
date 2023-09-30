<template>
  <div class="container">
    <div class="row q-pb-md text-subtitle1 text-bold q-px-xl">
      تیکت‌های کاربران
    </div>
    <q-list class="g-rounded-borders q-mx-xl q-pa-sm panel-tickets-container">
      <div v-if="tickets && tickets.length < 1">
        <div class="note note__warning q-px-md q-py-sm rounded-borders">
          {{ messages.noTicketsFound }}
        </div>
      </div>
      <q-expansion-item
        group="somegroup"
        :default-opened="i === 0"
        v-for="(ticket, i) in tickets"
        :key="i"
        class="rounded-borders bg-light shadow-4 q-mb-sm"
      >
        <!-- <q-item-section avatar>
          <q-avatar>
            <img :src="ticket.avatar" />
          </q-avatar>
        </q-item-section> -->

        <template v-slot:header>
          <!-- <q-item-section avatar>
            <q-avatar icon="bluetooth" color="primary" text-color="white" />
          </q-item-section> -->

          <q-item-section>
            <q-item-label lines="1">{{ ticket.title }}</q-item-label>
            <q-item-label caption lines="2">
              <span class="text-weight-bold">
                {{ ticket.username ? ticket.username : ticket.email }} -
              </span>
              {{ ticket.body }}
            </q-item-label>
          </q-item-section>

          <q-space></q-space>

          <q-item-section side top class="text-caption">
            <div class="column text-right">
              {{ getDate(ticket.created_at) }}
              <br />
              {{ e2p(getTime(ticket.created_at)) }}
            </div>
          </q-item-section>
        </template>

        <q-item-section>
          <q-input
            class="q-ma-sm"
            type="textarea"
            filled
            label="پاسخ ..."
            v-model="message"
          >
            <template v-slot:prepend>
              <q-btn
                dense
                icon="send"
                color="primary"
                flat
                @click="sendMessage(ticket.id)"
                :loading="sendMessagePending"
              >
                <q-tooltip>ارسال پیام</q-tooltip>
              </q-btn>
            </template>
          </q-input>
        </q-item-section>
      </q-expansion-item>
      <q-inner-loading class="g-rounded-borders" :showing="fetchTicketsPending">
        <q-spinner-comment size="50px" color="primary" />
      </q-inner-loading>
    </q-list>
  </div>
</template>

<script>
import { e2p, getDate, getTime } from "src/stores/helpers";
import { messages } from "src/stores/messages";
import { useMessagesStore } from "src/stores/messages-store";
import { useTicketsStore } from "src/stores/tickets-store";
import { notifError, notifPrimary } from "src/util/notify";
import { computed, defineComponent, onBeforeMount, ref } from "vue";

export default defineComponent({
  name: "AdminPanelTickets",
  setup() {
    const ticketsStore = useTicketsStore();
    const messagesStore = useMessagesStore();

    const message = ref("");
    const sendMessagePending = computed(() => messagesStore.sendMessagePending);
    const fetchTicketsPending = computed(
      () => ticketsStore.fetchTicketsPending
    );
    const tickets = computed(() => ticketsStore.tickets);

    const fetchTickets = async () => {
      await ticketsStore.fetchTickets().then(async ({ status, message }) => {
        if (status === "error") {
          notifError(message, "message");
        }
      });
    };

    const sendMessage = async (ticketId) => {
      if (!message.value)
        return notifError(messages.pleaseTypeAMessage, "warning");

      await messagesStore
        .sendMessage({
          ticketId,
          message: message.value,
        })
        .then(async ({ status, message: resMsg }) => {
          if (status === "error") {
            notifError(resMsg, "message");
          } else if (status === "success") {
            notifPrimary(resMsg, "mark_chat_read");
            await fetchTickets();
          }
          message.value = "";
        });
    };

    onBeforeMount(async () => {
      await fetchTickets();
    });

    return {
      message,
      sendMessagePending,
      fetchTicketsPending,
      tickets,
      fetchTickets,
      sendMessage,
      messages,
      e2p,
      getDate,
      getTime,
    };
  },
});
</script>
<style lang="sass" scoped>
.panel-tickets-container
  min-height: 50vh
  max-height: 50vh
  overflow-y: auto
</style>
