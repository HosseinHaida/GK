<template>
  <q-card
    class="payment-details-card g-rounded-borders bg-dark border-primary"
    bordered
    flat
  >
    <div class="row q-pa-lg justify-between text-center q-pb-sm">
      <div class="col-auto q-pl-sm">
        <span class="close-button">
          <q-spinner-dots v-if="fetchPending" size="md" color="primary" />
          <q-icon
            v-else
            name="close"
            size="md"
            color="grey-5"
            class="cursor-pointer"
            @click="onCloseDialog()"
          />
        </span>
      </div>

      <div class="col-auto q-pl-lg">
        <q-btn
          class="text-primary q-mr-sm col-auto font-regular q-px-sm bg-dark-grey"
          dense
          outline
          unelevated
        >
          <span class="text-light"> {{ months[selectedMonth] }} </span>
          <q-icon class="text-light" name="expand_more" size="xs" />
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
          class="text-primary q-mr-sm col-auto font-regular q-px-sm bg-dark-grey"
          dense
          outline
          unelevated
        >
          <span class="text-light"> {{ e2p(selectedYear) }} </span>
          <q-icon class="text-light" name="expand_more" size="xs" />
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

    <div class="row q-px-lg q-pb-lg justify-between q-gutter-md">
      <div v-if="details.username" class="col-auto">
        <div
          class="rounded-borders q-px-md q-py-sm text-light bg-dark-grey"
          style="border: 1px solid #ff0249"
        >
          {{ details.username }}
          <q-img
            width="20px"
            class="q-ml-sm"
            alt="User Account Logo"
            src="~assets/ui/account-gradient.svg"
          />
        </div>
      </div>
      <div class="col-auto">
        <div
          class="rounded-borders q-px-md q-py-sm text-light bg-dark-grey"
          style="border: 1px solid #ff0249"
        >
          {{ details.phone }}
        </div>
      </div>
      <div class="col text-center">
        <div
          class="rounded-borders q-px-md q-py-sm text-light bg-dark-grey"
          style="border: 1px solid #ff0249"
        >
          {{ details.email }}
        </div>
      </div>
      <div class="col text-center">
        <div
          class="rounded-borders q-px-md q-py-sm text-light bg-dark-grey"
          style="border: 1px solid #ff0249"
        >
          {{ details.sheba }}
        </div>
      </div>
    </div>

    <div class="row q-px-lg q-pb-lg justify-center">
      <q-table
        class="payment-details-table bg-dark text-light q-mx-xl full-width border-primary"
        table-header-class="bg-dark-grey"
        virtual-scroll
        flat
        bordered
        :rows-per-page-options="[0]"
        :virtual-scroll-sticky-size-start="48"
        v-model:pagination="pagination"
        row-key="id"
        :rows="rows"
        :columns="columns"
        :visible-columns="visibleColumns"
        :loading="updatePending || fetchPending"
      >
        <template v-slot:body-cell-ref_id="props">
          <q-td :props="props">
            <q-input
              dense
              v-model="props.row.ref_id"
              filled
              class="bg-dark-grey rounded-borders no-bottom-border-radius"
              input-class="text-light text-center"
            />
          </q-td>
        </template>

        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-btn
              class="text-primary col-auto shadow-1 font-regular q-pl-md q-pr-sm"
              :label="statuses[props.row.status]"
              unelevated
              dense
              :color="statusesColors[props.row.status]"
              icon-right="expand_more"
            >
              <q-menu>
                <q-list class="font-light" dense style="min-width: 100px">
                  <q-item
                    v-for="(label, value, i) in statuses"
                    :key="i"
                    clickable
                    @click="props.row.status = value"
                    v-close-popup
                  >
                    <q-item-section>{{ label }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <div class="row q-px-lg q-pb-lg justify-end">
      <q-btn color="primary" :loading="updatePending" @click="onSaveDetails()">
        ثبت
      </q-btn>
    </div>
  </q-card>
</template>

<script>
import { e2p } from "src/stores/helpers";
import { messages } from "src/stores/messages";
import { usePaymentsStore } from "src/stores/payments-store";
import { rialPerDownload } from "src/stores/variables";
import { notifError, notifPrimary } from "src/util/notify";
import { defineComponent, computed, ref, onBeforeMount, watch } from "vue";

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
  name: "AdminPanelPaymentDetails",
  emits: ["onCloseDialog"],
  props: {
    detailsBound: {
      type: Object,
      default: () => {},
    },
    selectedMonthBound: { type: String, default: "" },
    selectedYearBound: { type: String, default: "" },
  },
  setup(props, ctx) {
    const paymentsStore = usePaymentsStore();
    const statuses = ref({
      pending: "پرداخت نشده",
      paid: "پرداخت شده",
    });
    const statusesColors = ref({
      pending: "negative",
      paid: "positive",
    });

    const details = ref(null);

    const selectedMonth = ref(props.selectedMonthBound);
    const selectedYear = ref(props.selectedYearBound);

    const rows = ref([]);
    const columns = [
      {
        name: "id",
        label: "شناسه",
        field: "id",
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
      {
        name: "ref_id",
        label: "کد ارجاع",
        field: "ref_id",
        sortable: true,
        align: "center",
      },
      {
        name: "status",
        label: "وضعیت",
        field: "status",
        sortable: true,
        align: "center",
      },
    ];

    const updatePending = computed(() => paymentsStore.updatePaymentPending);
    const fetchPending = computed(() => paymentsStore.fetchPaymentPending);

    const visibleColumns = ref([
      "download_counts",
      "rate_rial",
      "total_rial",
      "ref_id",
      "status",
    ]);

    const onCloseDialog = () => {
      ctx.emit("onCloseDialog");
    };

    const onSaveDetails = async () => {
      if (rows.value.length < 1)
        return notifError(messages.nothingToUpdate, "warning");
      await paymentsStore
        .updatePayment({
          status: rows.value[0].status,
          ref_id: rows.value[0].ref_id,
          id: rows.value[0].id,
        })
        .then(async ({ status, message }) => {
          if (status === "error") {
            notifError(message, "warning");
          } else if (status === "success") {
            notifPrimary(message, "cloud_done");
          }
        });
    };

    const fetchPayment = async () => {
      await paymentsStore
        .fetchPayment({
          year: selectedYear.value,
          month:
            selectedMonth.value < 10
              ? "0" + selectedMonth.value
              : selectedMonth.value, // 0 for all months
          user_id: props.detailsBound.user_id,
        })
        .then(async ({ status, message, load }) => {
          if (status === "error") {
            notifError(message, "message");
          } else if (status === "success") {
            rows.value.pop();
            if (load) rows.value.push(load);
          }
        });
    };

    watch(selectedYear, async () => {
      await fetchPayment();
    });
    watch(selectedMonth, async () => {
      await fetchPayment();
    });

    onBeforeMount(() => {
      details.value = props.detailsBound;
      rows.value.push(details.value);
      // there are extra [key, value] pairs in details.value than we need tho
    });

    return {
      statuses,
      statusesColors,
      details,
      selectedMonth,
      selectedYear,
      rows,
      columns,
      updatePending,
      fetchPending,
      visibleColumns,
      onCloseDialog,
      onSaveDetails,
      fetchPayment,
      pagination: ref({
        rowsPerPage: 0,
      }),
      months,
      years,
      messages,
      e2p,
    };
  },
});
</script>

<style lang="sass" scoped>
.payment-details-card
  min-width: 65vw!important
.payment-details-card .close-button
  margin-left: -8px
  margin-top: -8px

.payment-details-table
  /* height or max-height is important */
  height: 250px

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
