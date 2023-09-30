<template>
  <div class="container q-px-xl">
    <!-- <div class="row q-pb-md text-subtitle1 text-bold">اطلاعات مالی</div> -->

    <div class="row q-mt-lg">
      <div class="col-12 q-px-lg">
        <q-input
          class="q-px-md font-light"
          filled
          dense
          v-model="shebaNo"
          hint="مثال IR020190000000xxxxxxx"
        >
          <template v-slot:before>
            <span class="q-mr-sm text-body2 font-regular"> شماره شبا </span>
          </template>

          <template v-slot:after>
            <q-btn
              class="q-ml-xs font-medium"
              color="primary"
              label="ثبت"
              :loading="shebaSavePending"
              @click="onSaveSheba()"
            />
          </template>
        </q-input>
      </div>
    </div>

    <div class="row q-pb-sm q-mt-xl">
      <div class="text-subtitle1 font-medium text-bold q-mr-md">درآمدزایی</div>
      <div class="font-regular text-subtitle2">
        <q-btn
          dense
          class="q-mr-sm q-py-none q-px-sm"
          @click="selectedType = 'monthly'"
          :color="selectedType === 'monthly' ? 'primary' : 'light'"
        >
          <span
            :class="selectedType === 'monthly' ? 'text-light' : 'text-dark'"
          >
            ماه
          </span>
        </q-btn>
        <q-btn
          dense
          class="q-mr-sm q-py-none q-px-sm"
          @click="selectedType = 'annual'"
          :color="selectedType === 'annual' ? 'primary' : 'light'"
        >
          <span :class="selectedType === 'annual' ? 'text-light' : 'text-dark'">
            سال
          </span>
        </q-btn>
        <q-btn
          dense
          class="q-mr-sm q-py-none q-px-sm"
          @click="selectedType = 'overall'"
          :color="selectedType === 'overall' ? 'primary' : 'light'"
        >
          <span
            :class="selectedType === 'overall' ? 'text-light' : 'text-dark'"
          >
            کل
          </span>
        </q-btn>
      </div>
    </div>

    <div class="row q-pb-md q-mt-md q-px-lg">
      <div class="col q-px-xs">
        <q-card class="bg-light">
          <q-card-section class="text-center q-px-none q-pb-xs">
            <div
              class="text-subtitle2 q-py-xs bg-gradient_r2l text-light font-regular"
            >
              تعداد دانلود
            </div>
          </q-card-section>

          <q-card-section class="text-center q-px-none q-py-xs text-primary">
            <div class="q-py-xs font-demibold">
              <q-spinner-dots v-if="fetchPending || !meta" size="1.4em" />
              <div v-else>
                {{ meta.downloadCounts ? e2p(meta.downloadCounts) : "۰" }}
              </div>
              <div>دانلود</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col q-px-xs">
        <q-card class="bg-light">
          <q-card-section class="text-center q-px-none q-pb-xs">
            <div
              class="text-subtitle2 q-py-xs bg-gradient_lAndr text-light font-regular"
            >
              نرخ هر دانلود
            </div>
          </q-card-section>

          <q-card-section class="text-center q-px-none q-py-xs text-primary">
            <div class="q-py-xs font-demibold">
              <q-spinner-dots v-if="fetchPending || !meta" size="1.4em" />
              <div v-else>
                {{ meta.hasPriceChanged ? "متغیر" : e2p(rialPerDownload) }}
              </div>
              <div v-if="fetchPending || !meta || !meta.hasPriceChanged">
                ریال
              </div>
              <div v-else>_</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col q-px-xs">
        <q-card class="bg-light">
          <q-card-section class="text-center q-px-none q-pb-xs">
            <div
              class="text-subtitle2 q-py-xs bg-gradient_l2r text-light font-regular"
            >
              درآمد کل
            </div>
          </q-card-section>

          <q-card-section class="text-center q-px-none q-py-xs text-primary">
            <div class="q-py-xs font-demibold">
              <q-spinner-dots v-if="fetchPending || !meta" size="1.4em" />
              <div v-else>
                {{ meta.totalIncome ? e2p(meta.totalIncome) : "۰" }}
              </div>
              <div>ریال</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- <div class="row justify-end q-px-xl q-mt-lg">
      <q-btn class="shadow-9" color="primary"> تایید </q-btn>
    </div> -->
  </div>
</template>

<script>
import { e2p } from "src/stores/helpers";
import { messages } from "src/stores/messages";
import { useUserStore } from "src/stores/users-store";
import { rialPerDownload } from "src/stores/variables";
import { notifError, notifPrimary } from "src/util/notify";
import { computed, defineComponent, onMounted, ref, watch } from "vue";

export default defineComponent({
  name: "PanelFinances",
  setup(props, ctx) {
    const userStore = useUserStore();
    const shebaNo = ref(props.user.sheba);
    const selectedType = ref("monthly");

    const onSaveSheba = async () => {
      if (props.user.sheba === shebaNo.value)
        return notifError(messages.noChangesDetected, "warning");
      await userStore
        .saveSheba(shebaNo.value)
        .then(async ({ status, message }) => {
          if (status === "error") {
            notifError(message, "warning");
          } else if (status === "success") {
            notifPrimary(message, "cloud_done");
          }
        });
    };

    const shebaSavePending = computed(() => userStore.shebaSavePending);
    const fetchPending = computed(() => userStore.fetchFinancesPending);

    const meta = computed(() => userStore.financesMeta);

    const fetchFinances = async () => {
      await userStore
        .fetchFinances(selectedType.value)
        .then(async ({ status, message }) => {
          if (status === "error") {
            notifError(message, "warning");
          }
        });
    };

    watch(selectedType, async () => {
      await fetchFinances();
    });

    onMounted(async () => {
      await fetchFinances();
    });

    return {
      shebaNo,
      selectedType,
      onSaveSheba,
      shebaSavePending,
      fetchPending,
      meta,
      fetchFinances,
      e2p,
      rialPerDownload,
    };
  },
  props: {
    user: {
      type: Object,
      required: true,
      default: () => {
        return {
          name: "",
          family: "",
          email: "",
          phone: "",
        };
      },
    },
  },
});
</script>
