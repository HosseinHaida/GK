<template>
  <div class="container">
    <div class="row q-mb-md text-subtitle1 text-bold q-px-xl items-center">
      <div class="col-auto q-pr-lg">مالی</div>
      <div class="col">
        <q-input
          v-model="searchText"
          debounce="500"
          borderless
          dense
          label="جستجو"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-auto q-pl-sm">
        <div class="row justify-end">
          <q-btn
            v-for="(stat, i) in paymentStates"
            :key="i"
            dense
            push
            class="q-mr-sm q-py-none q-px-sm"
            :color="stat.value === selectedState ? stat.color : 'light'"
            @click="selectedState = stat.value"
          >
            <span
              :class="selectedState === stat.value ? 'text-white' : 'text-dark'"
            >
              {{ stat.label }}
            </span>
          </q-btn>

          <div class="q-pl-lg">
            <q-btn
              class="text-primary q-mr-sm col-auto font-regular q-px-sm"
              :label="months[selectedMonth]"
              dense
              outline
              unelevated
            >
              <q-icon name="expand_more" size="xs" />
              <q-menu>
                <q-list class="font-light" dense>
                  <q-item
                    v-for="(value, i) in months.slice(1, months.length)"
                    :key="i"
                    clickable
                    @click="selectedMonth = i + 1"
                    v-close-popup
                  >
                    <q-item-section>{{ value }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>

            <q-btn
              class="text-primary q-mr-sm col-auto font-regular q-px-sm"
              :label="e2p(selectedYear)"
              dense
              outline
              unelevated
            >
              <q-icon name="expand_more" size="xs" />
              <q-menu>
                <q-list class="font-light" dense>
                  <q-item
                    v-for="(value, i) in years"
                    :key="i"
                    clickable
                    @click="selectedYear = value"
                    v-close-popup
                  >
                    <q-item-section>{{ e2p(value) }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
      </div>
    </div>
    <q-table
      class="payments-table bg-light q-mx-xl"
      virtual-scroll
      flat
      bordered
      :rows-per-page-options="[0]"
      :virtual-scroll-sticky-size-start="48"
      v-model:pagination="pagination"
      row-key="id"
      @row-click="onPaymentClicked"
      :rows="rows"
      :columns="columns"
      :loading="fetchPaymentsPending"
      :visible-columns="visibleColumns"
    />
    <q-dialog v-model="isPaymentDetailsVisible">
      <AdminPanelPaymentDetails
        @on-close-dialog="onClosePaymentDetails"
        :detailsBound="selectedPayment"
        :selectedMonthBound="selectedMonth"
        :selectedYearBound="selectedYear"
      />
    </q-dialog>
  </div>
</template>

<script>
import { paymentStates, rialPerDownload } from "src/stores/variables";
import { messages } from "src/stores/messages";
import { usePaymentsStore } from "src/stores/payments-store";
import { computed, defineComponent, onBeforeMount, ref, watch } from "vue";
import { notifError } from "src/util/notify";
import { e2p, p2e } from "src/stores/helpers";
import AdminPanelPaymentDetails from "./AdminPanelPaymentDetails.vue";

const months = [
  "",
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const years = ["1402", "1403", "1404", "1405"];

export default defineComponent({
  name: "AdminPanelPayments",
  components: {
    AdminPanelPaymentDetails,
  },
  setup() {
    const paymentsStore = usePaymentsStore();

    const searchText = ref("");
    const fetchPaymentsPending = computed(
      () => paymentsStore.fetchPaymentsPending
    );
    const rows = computed(() => paymentsStore.payments);
    const columns = [
      {
        name: "id",
        label: "شناسه",
        field: "id",
        align: "center",
      },
      {
        name: "username",
        label: "نام کاربری",
        field: "username",
        align: "center",
      },
      {
        name: "download_counts",
        label: "تعداد دانلود",
        field: "download_counts",
        format: (val) => `${e2p(val)}`,
        sortable: true,
        align: "center",
      },
      {
        name: "rate_rial",
        label: "نرخ (ریال)",
        field: "rate_rial",
        format: (val) => (val ? `${e2p(val)}` : `${e2p(rialPerDownload)}`),
        sortable: true,
        align: "center",
      },
      {
        name: "total_rial",
        label: "درآمد (ریال)",
        field: "total_rial",
        format: (val, row) =>
          val ? `${e2p(val)}` : `${e2p(rialPerDownload * row.download_counts)}`,
        sortable: true,
        align: "center",
      },
      { name: "status", label: "وضعیت", field: "status", sortable: true },
    ];
    const visibleColumns = ref([
      "username",
      "download_counts",
      "rate_rial",
      "total_rial",
    ]);
    // : 'pending', 'paid'
    const selectedState = ref("paid");
    const selectedMonth = ref("");
    const selectedYear = ref("");
    const isPaymentDetailsVisible = ref(false);
    const selectedPayment = ref(null);

    const fetchPayments = async () => {
      await paymentsStore
        .fetchPayments({
          status: selectedState.value,
          year: selectedYear.value,
          month:
            selectedMonth.value < 10
              ? "0" + selectedMonth.value
              : selectedMonth.value, // 0 for all months
          search_text: searchText.value ? searchText.value : "*",
        })
        .then(async ({ status, message }) => {
          if (status === "error") {
            notifError(message, "message");
          }
        });
    };
    watch(selectedState, async () => {
      await fetchPayments();
    });
    watch(searchText, async () => {
      await fetchPayments();
    });
    watch(selectedYear, async () => {
      await fetchPayments();
    });
    watch(selectedMonth, async () => {
      await fetchPayments();
    });
    const onPaymentClicked = async (evt, row, index) => {
      isPaymentDetailsVisible.value = true;
      selectedPayment.value = row;
    };
    const onClosePaymentDetails = () => {
      isPaymentDetailsVisible.value = false;
      selectedPayment.value = null;
    };
    onBeforeMount(async () => {
      const now = new Date();
      selectedMonth.value = p2e(
        now.toLocaleDateString("fa-IR", {
          month: "numeric",
        })
      );
      selectedYear.value = p2e(
        now.toLocaleDateString("fa-IR", {
          year: "numeric",
        })
      );

      await fetchPayments();
    });
    return {
      searchText,
      fetchPaymentsPending,
      rows,
      columns,
      visibleColumns,
      pagination: ref({
        rowsPerPage: 0,
      }),
      selectedState,
      months,
      years,
      selectedMonth,
      selectedYear,
      fetchPayments,
      messages,
      paymentStates,
      isPaymentDetailsVisible,
      selectedPayment,
      onPaymentClicked,
      onClosePaymentDetails,
      e2p,
      p2e,
    };
  },
});
</script>

<style lang="sass" scoped>
.admin-panel-payment-li:hover
  background-color: $grey-2
.admin-panel-payments-container
  min-height: 50vh
  max-height: 50vh
  overflow-y: auto

.payments-table
  /* height or max-height is important */
  height: 410px

thead tr th
  position: sticky
  z-index: 1
  /* this will be the loading indicator */
thead tr:last-child th
  /* height of all previous header rows */
  top: 48px
thead tr:first-child th
  top: 0

  /* prevent scrolling behind sticky top row on focus */
tbody
  /* height of all previous header rows */
  scroll-margin-top: 48px
</style>
