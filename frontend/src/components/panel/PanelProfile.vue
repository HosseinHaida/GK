<template>
  <div class="container" v-if="user && user.email">
    <div class="row justify-center q-pb-md">
      <!-- <q-avatar class="text-center text-light" size="80px" color="primary"> -->
      <!-- {{ user.first_name ? user.first_name.charAt(0) : user.email.charAt(0) }} -->
      <q-icon
        :size="$isMobile() ? '70px' : '100px'"
        name="img:/ui/gg.account.svg"
      />
      <!-- </q-avatar> -->
    </div>
    <!-- CONTINUE here - connect to the store - complete editing of profile info -->
    <div class="row" :class="$isMobile() ? 'q-gutter-md' : 'q-mt-md'">
      <div
        class="col-xs-12 col-sm-6"
        :class="!$isMobile() && 'q-pr-sm q-pl-lg'"
      >
        <q-input
          class="q-px-md"
          filled
          dense
          dir="ltr"
          :placeholder="placeholders.username"
          v-model="form.username"
          input-class="font-light"
          debounce="500"
        >
          <template v-slot:before>
            <span class="q-mr-sm text-body2 font-regular">
              {{ labels.username }}
            </span>
          </template>

          <template v-slot:append>
            <q-icon
              size="1em"
              name="check"
              color="positive"
              v-if="isUsernameDup === true"
            />
            <q-icon
              size="1em"
              name="close"
              color="primary"
              v-if="isUsernameDup === false"
            />
            <q-spinner-rings
              color="primary"
              size="1.5em"
              v-if="checkUsernameDupPending"
            />
          </template>
        </q-input>
      </div>

      <div
        class="col-xs-12 col-sm-6"
        :class="!$isMobile() && 'q-pr-lg q-pl-sm'"
      >
        <q-input
          dir="ltr"
          class="q-px-md"
          filled
          dense
          :model-value="user.email"
          disable
        >
          <template v-slot:before>
            <span class="q-mr-sm text-body2 font-regular">
              {{ labels.email }}
            </span>
          </template>
        </q-input>
      </div>
    </div>

    <div class="row q-mt-lg" :class="$isMobile() && 'q-gutter-md'">
      <div
        class="col-xs-12 col-sm-6"
        :class="!$isMobile() && 'q-pl-lg q-pr-sm'"
      >
        <q-input
          class="q-px-md"
          filled
          dense
          :placeholder="placeholders.first_name"
          v-model="form.first_name"
          input-class="font-light"
        >
          <template v-slot:before>
            <span class="q-mr-sm text-body2 font-regular">
              {{ labels.first_name }}
            </span>
          </template>
        </q-input>
      </div>

      <div
        class="col-xs-12 col-sm-6"
        :class="!$isMobile() && 'q-pr-lg q-pl-sm'"
      >
        <q-input
          class="q-px-md"
          filled
          dense
          :placeholder="placeholders.last_name"
          v-model="form.last_name"
          input-class="font-light"
        >
          <template v-slot:before>
            <span class="q-mr-sm text-body2 font-regular">
              {{ labels.last_name }}
            </span>
          </template>
        </q-input>
      </div>
    </div>

    <div class="row q-mt-lg q-mb-lg">
      <div
        class="col-xs-12 col-sm-6"
        :class="!$isMobile() && 'q-pr-sm q-pl-lg'"
      >
        <q-input
          class="q-pl-md"
          :class="!$isMobile() && 'q-pr-md'"
          filled
          dir="ltr"
          dense
          :placeholder="placeholders.phone"
          v-model="form.phone"
          input-class="font-light"
        >
          <template v-slot:before>
            <span class="q-mr-sm text-body2 font-regular">
              {{ labels.phone }}
            </span>
          </template>
        </q-input>
      </div>
    </div>

    <!-- <div class="row q-mt-xl">
      <div class="col-xs-12 col-sm-6 q-pr-sm q-pl-lg">
        <q-input
          class="q-px-md"
          filled
          dense
          type="password"
          v-model="old_pass"
          input-class="font-light"
        >
          <template v-slot:before>
            <span class="q-mr-sm text-body2 font-regular">
              {{ labels.old_pass }}
            </span>
          </template>
        </q-input>
      </div>

      <div class="col-xs-12 col-sm-6 q-pr-lg q-pl-sm">
        <q-input
          class="q-px-md"
          filled
          dense
          type="password"
          v-model="new_pass"
          input-class="font-light"
        >
          <template v-slot:before>
            <span class="q-mr-sm text-body2 font-regular">
              {{ labels.new_pass }}
            </span>
          </template>
        </q-input>
      </div>
    </div> -->

    <div class="row justify-end q-px-xl">
      <q-btn
        class="shadow-9 font-medium"
        color="primary"
        :loading="updatePending"
        @click="onSaveProfile()"
      >
        ذخیره
      </q-btn>
    </div>
  </div>
</template>

<script>
import { messages } from "src/stores/messages";
import { useUserStore } from "src/stores/users-store";
import { notifError, notifPrimary } from "src/util/notify";
import { computed, defineComponent, reactive, ref, watch } from "vue";

export default defineComponent({
  name: "PanelProfile",
  setup(props, ctx) {
    const userStore = useUserStore();

    const isUsernameDup = ref("");

    const form = reactive({
      username: props.user.username,
      first_name: props.user.first_name,
      last_name: props.user.last_name,
      phone: props.user.phone,
    });

    // const old_pass = ref("");
    // const new_pass = ref("");

    const placeholders = ref({
      username: "نام کاربری شما",
      first_name: "نام خود را وارد کنید",
      last_name: "نام خوانوادگی خود را وارد کنید",
      phone: "شماره همراه خود را وارد کنید",
    });

    const labels = ref({
      username: "نام کاربری",
      email: "ایمیل",
      first_name: "نام",
      last_name: "نام خانوادگی",
      phone: "تماس",
      // old_pass: "کلمه عبور قبلی",
      // new_pass: "کلمه عبور جدید",
    });

    const onSaveProfile = async () => {
      // Extract edited fields from the form
      let editedFields = {};
      if (form)
        Object.entries(form).forEach(([k, v]) => {
          if (v && v !== props.user[k]) editedFields[k] = v;
        });

      if (Object.entries(editedFields).length <= 0)
        return notifError(messages.noChangesDetected, "warning");

      // Add old and new pass if entered
      // if (new_pass.value && old_pass.value) {
      //   editedFields.old_pass = old_pass.value;
      //   editedFields.new_pass = new_pass.value;
      // }

      await userStore
        .updateUser(editedFields)
        .then(async ({ status, message }) => {
          if (status === "error") {
            notifError(message, "warning");
          } else if (status === "success") {
            notifPrimary(message, "cloud_done");
          }
        });
    };

    const onCheckUsernameDup = async () => {
      await userStore
        .onCheckUsernameDup(form.username)
        .then(async ({ status, message, load }) => {
          // load === exists
          if (status === "error") {
            notifError(message, "warning");
          } else if (status === "success")
            isUsernameDup.value = load ? false : true;
        });
    };

    const updatePending = computed(() => userStore.updatePending);
    const checkUsernameDupPending = computed(
      () => userStore.checkUsernameDupPending
    );

    // watch for username change and check it's availability
    watch(
      () => form.username,
      async () => {
        if (!form.username || form.username === props.user.username)
          isUsernameDup.value = "";
        else await onCheckUsernameDup();
      }
    );

    return {
      isUsernameDup,
      form,
      // old_pass,
      // new_pass,
      placeholders,
      labels,
      updatePending,
      checkUsernameDupPending,
      onSaveProfile,
      onCheckUsernameDup,
    };
  },
  props: {
    user: {
      type: Object,
      required: true,
      default: () => {
        return {
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          username: "",
        };
      },
    },
  },
});
</script>
