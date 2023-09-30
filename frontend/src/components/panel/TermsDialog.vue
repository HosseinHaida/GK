<template>
  <q-card>
    <q-card-section>
      <div class="row">
        <div class="text-h6 col">توافقنامه کاربری گندم‌کیت</div>
        <div class="col-auto">
          <q-icon color="primary" size="xl" name="handshake" />
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none q-px-lg scroll" style="max-height: 50vh">
      <div class="text-caption text-bold">
        کاربر
        <span class="text-primary">=</span>
        خریدار اشتراک برای دانلود از گندم‌کیت
      </div>
      <div class="text-caption text-bold">
        طراح <span class="text-primary">=</span> شخص سازنده و آپلود کننده آیکون
      </div>
      <div class="q-mb-md text-caption text-bold">
        گندم کیت <span class="text-primary">=</span> پلتفرم ارائه آیکون ها
      </div>

      <ul>
        <li
          style="text-align: justify"
          class="q-py-xs text-caption"
          v-for="(term, i) in terms"
          :key="i"
        >
          {{ term }}
        </li>
      </ul>
    </q-card-section>

    <q-separator />

    <q-card-actions class="row">
      <div class="col-12">
        <div class="row q-gutter-sm">
          <q-btn
            :loading="pending"
            class="col"
            label="بله، می‌پذیرم"
            color="primary"
            @click="onAgree"
          />
          <q-btn class="col" to="/" label="نه، نمی‌پذیرم" color="dark" />
        </div>
      </div>
    </q-card-actions>
  </q-card>
</template>

<script>
import { useUserStore } from "src/stores/users-store";
import { notifError, notifPrimary } from "src/util/notify";
import { defineComponent, computed } from "vue";
import { terms } from "src/stores/terms";

export default defineComponent({
  name: "TermsDialog",
  setup() {
    const usersStore = useUserStore();
    const pending = computed(() => usersStore.agreeOnTermsPending);

    const onAgree = async () => {
      await usersStore.agreeOnTerms().then(async ({ status, message }) => {
        if (status === "success") {
          notifPrimary(message, "handshake");
        }
        if (status === "error") {
          notifError(message, "warning");
        }
      });
    };
    return {
      terms,
      pending,
      onAgree,
    };
  },
});
</script>
