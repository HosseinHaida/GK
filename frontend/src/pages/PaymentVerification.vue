<template>
  <q-layout>
    <q-page-container>
      <q-page class="items-center items-center justify-center row text-light">
        <q-card flat bordered class="bg-dark-grey q-py-md payment-verify-card">
          <q-card-section class="row justify-center q-mb-md">
            <q-spinner-rings size="9em" v-if="verifyPending"></q-spinner-rings>
            <q-icon v-if="refID" name="img:/ui/ws.tik_outline.svg" size="9em" />
            <q-icon
              v-if="!refID && !verifyPending"
              name="img:/ui/ws.cross_outline.svg"
              size="9em"
            />
          </q-card-section>

          <q-card-section
            style="border-radius: 0"
            class="q-py-sm row justify-center gradient"
          >
            <div class="font-bold" style="font-size: 16px">
              {{
                refID
                  ? "تراکنش موفق"
                  : verifyPending
                  ? "درحال دریافت تأییدیه از درگاه..."
                  : isFailed
                  ? "تراکنش ناموفق"
                  : "خطا"
              }}
            </div>
          </q-card-section>

          <q-card-section
            v-if="refID"
            class="q-py-sm row justify-center text-light items-center q-px-md"
          >
            <div style="font-size: 1em">شماره تراکنش :</div>

            <q-chip
              class="q-mx-md"
              outline
              @click="onCopyPhrase"
              text-color="light"
              clickable
            >
              <q-avatar>
                <q-icon name="content_copy" />
              </q-avatar>
              {{ refID }}
            </q-chip>
          </q-card-section>

          <q-card-section class="q-py-md text-center" v-if="errText">
            <div>{{ errText }}</div>
          </q-card-section>

          <q-card-section class="q-py-lg text-center primary-gradient">
            {{
              mainPageRedirectCountdown ? "درحال انتقال به صفحه اصلی..." : ""
            }}
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { onCopyPhrase } from "src/stores/helpers";
import { messages } from "src/stores/messages";
import { notifError, notifPrimary } from "src/util/notify";
import { defineComponent, ref, computed, watch, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "../stores/users-store";

export default defineComponent({
  name: "PaymentVerification",

  setup() {
    const userStore = useUserStore();
    const route = useRoute();
    const router = useRouter();

    const refID = ref("");

    const isFailed = ref(false);
    const errText = ref("");
    const mainPageRedirectCountdown = ref(false);

    const verifyPending = computed(() => userStore.paymentVerifyPending);

    const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    watch(
      route,
      async () => {
        if (route.query.Status === "NOK") {
          isFailed.value = true;
          errText.value = messages.ifWithdrawnWillReturn;
          mainPageRedirectCountdown.value = true;
          await timeout(8000);
          mainPageRedirectCountdown.value = false;
          errText.value = null;
          router.push("/panel");
        }

        if (route.query.Status === "OK" && route.query.Authority)
          await userStore
            .verifyPayment(route.query.Authority)
            .then(async ({ status, message, load }) => {
              mainPageRedirectCountdown.value = true;

              if (status === "error") {
                notifError(message);
                await timeout(6000);
              } else if (status === "success") {
                refID.value = load;
                isFailed.value = !load ? true : false;
                notifPrimary(messages.successfulPayment, "credit_score");
                await timeout(8000);
              }

              mainPageRedirectCountdown.value = false;
              router.push("/panel");
            });
      },
      { immediate: true }
    );

    onUnmounted(() => {
      mainPageRedirectCountdown.value = false;
    });

    return {
      refID,
      isFailed,
      errText,
      mainPageRedirectCountdown,
      verifyPending,
      timeout,
      onCopyPhrase,
    };
  },
});
</script>

<style scoped lang="sass">
.gradient
  background-color: $primary
  background-image: linear-gradient(to right, $secondary , $primary)
.payment-verify-card
  min-width: 35%
  background: linear-gradient($dark-grey 0 0) padding-box, linear-gradient(to right, $secondary, $primary) border-box
  border: 1px solid transparent
  border-radius: $generic-border-radius
  display: inline-block
</style>
