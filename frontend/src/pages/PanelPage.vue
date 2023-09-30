<template>
  <q-page class="flex items-center justify-center">
    <div
      class="row items-center full-width"
      :class="!$isMobile() ? 'q-px-xl' : 'q-px-xs'"
    >
      <div
        class="col-xs-12 col-sm-12 col-md-3 side-bar-container"
        v-if="!$isMobile()"
      >
        <q-card class="bg-light side-bar shadow-15">
          <div class="q-pa-md">
            <q-list class="font-light">
              <q-item
                @click="goTo('profile')"
                class="side-bar_list-item"
                clickable
                v-ripple
              >
                <q-item-section>مشخصات</q-item-section>
              </q-item>

              <q-item
                @click="goTo('myicons')"
                class="side-bar_list-item"
                clickable
                v-ripple
              >
                <q-item-section>
                  <q-item-label>آیکون‌های من</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                @click="goTo('finances')"
                class="side-bar_list-item"
                clickable
                v-ripple
              >
                <q-item-section>
                  <q-item-label>مالی</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                @click="goTo('support')"
                class="side-bar_list-item"
                clickable
                v-ripple
              >
                <q-item-section>
                  <q-item-label>پشتیبانی</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                @click="goTo('messages')"
                class="side-bar_list-item"
                clickable
                v-ripple
              >
                <q-item-section>
                  <q-item-label>پیام‌ها</q-item-label>
                </q-item-section>
              </q-item>
              <template v-if="user.is_admin">
                <q-separator class="q-mt-lg" />
                <div class="text-caption text-center q-mb-sm text-grey">
                  پنل ادمین‌
                </div>
                <q-item
                  @click="goTo('packs')"
                  class="side-bar_list-item"
                  clickable
                  v-ripple
                >
                  <q-item-section>
                    <q-item-label>پک‌ها</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  @click="goTo('tickets')"
                  class="side-bar_list-item"
                  clickable
                  v-ripple
                >
                  <q-item-section>
                    <q-item-label>تیکت‌ها</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  @click="goTo('payments')"
                  class="side-bar_list-item"
                  clickable
                  v-ripple
                >
                  <q-item-section>
                    <q-item-label>مالی</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </div>

          <q-img
            class="absolute-bottom-left"
            alt="Panel Side Bar Background"
            src="~assets/backgrounds/panel-side-fg-1.png"
          />
          <q-img
            class="absolute-bottom-right"
            alt="Panel Side Bar Background"
            src="~assets/backgrounds/panel-side-fg-2.png"
          />
        </q-card>
      </div>
      <div class="col-xs-12 col-sm-12 col-md-9 main-bar-container q-py-sm">
        <q-card
          class="bg-light main-bar shadow-15"
          :class="{
            'q-py-xl': tab !== 'profile' && !$isMobile(),
            'q-pl-xl': !$isMobile(),
          }"
        >
          <div
            v-if="(tab === 'profile' && user) || $isMobile()"
            class="row q-mb-none"
            :class="$isMobile() ? 'justify-between' : 'justify-end'"
          >
            <div v-if="$isMobile()">
              <q-btn
                size="1.1rem"
                icon="menu"
                class="g-rounded-borders"
                style="
                  border-top-left-radius: 0 !important;
                  border-bottom-right-radius: 0 !important;
                "
              >
                <q-menu
                  v-model="showPanelMenu"
                  class="g-rounded-6"
                  :offset="[-10, 5]"
                >
                  <div class="column">
                    <q-list class="font-light">
                      <q-item
                        @click="goTo('profile')"
                        class="side-bar_list-item"
                        clickable
                        v-ripple
                      >
                        <q-item-section>مشخصات</q-item-section>
                      </q-item>

                      <q-item
                        @click="goTo('myicons')"
                        class="side-bar_list-item"
                        clickable
                        v-ripple
                      >
                        <q-item-section>
                          <q-item-label>آیکون‌های من</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item
                        @click="goTo('finances')"
                        class="side-bar_list-item"
                        clickable
                        v-ripple
                      >
                        <q-item-section>
                          <q-item-label>مالی</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item
                        @click="goTo('support')"
                        class="side-bar_list-item"
                        clickable
                        v-ripple
                      >
                        <q-item-section>
                          <q-item-label>پشتیبانی</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item
                        @click="goTo('messages')"
                        class="side-bar_list-item"
                        clickable
                        v-ripple
                      >
                        <q-item-section>
                          <q-item-label>پیام‌ها</q-item-label>
                        </q-item-section>
                      </q-item>
                      <template v-if="user.is_admin">
                        <q-separator class="q-mt-lg" />
                        <div class="text-caption text-center q-mb-sm text-grey">
                          پنل ادمین‌
                        </div>
                        <q-item
                          @click="goTo('packs')"
                          class="side-bar_list-item"
                          clickable
                          v-ripple
                        >
                          <q-item-section>
                            <q-item-label>پک‌ها</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item
                          @click="goTo('tickets')"
                          class="side-bar_list-item"
                          clickable
                          v-ripple
                        >
                          <q-item-section>
                            <q-item-label>تیکت‌ها</q-item-label>
                          </q-item-section>
                        </q-item>

                        <q-item
                          @click="goTo('payments')"
                          class="side-bar_list-item"
                          clickable
                          v-ripple
                        >
                          <q-item-section>
                            <q-item-label>مالی</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-list>
                  </div>
                </q-menu>
              </q-btn>
            </div>

            <div v-if="tab === 'profile'" class="column">
              <div
                class="text-light text-center q-px-md q-py-sm g-rounded-borders bg-primary"
                style="
                  border-top-right-radius: 0 !important;
                  border-bottom-left-radius: 0 !important;
                "
              >
                <div v-if="fetchSubsMetaPending">
                  <q-spinner-rings size="2em" color="light" />
                  <q-spinner-rings size="2em" color="light" />
                  <q-spinner-rings size="2em" color="light" />
                </div>

                <div v-else>
                  اشتراک :
                  <span class="font-bold" style="font-size: 1.1rem">
                    {{ subscriptions[user.subscription] }}
                  </span>
                </div>
              </div>

              <div
                v-if="!fetchSubsMetaPending && user.subscription !== 'none'"
                class="text-primary text-caption text-center q-px-md q-mt-xs q-py-xs last_sub_dls"
              >
                # دانلود باقی مانده :
                <span class="font-bold q-ml-sm">
                  {{ e2p(user.last_sub_dls) }}
                </span>
              </div>
            </div>
          </div>
          <div class="q-pa-md" v-if="user && user.email">
            <PanelProfile v-if="tab === 'profile'" :user="user" />
            <PanelFinances v-if="tab === 'finances'" :user="user" />
            <PanelMessages v-if="tab === 'messages'" />
            <PanelSupport v-if="tab === 'support'" />
            <PanelMyIcons v-if="tab === 'myicons'" :user="user" />
            <AdminPanelTickets v-if="tab === 'tickets'" />
            <AdminPanelPacks v-if="tab === 'packs'" />
            <AdminPanelPayments v-if="tab === 'payments'" />
          </div>
          <!-- <q-img
            class="absolute-bottom-right"
            alt="Main Panel Background"
            src="~assets/backgrounds/panel-main-fg.png"
          /> -->
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, computed, ref, watch, onMounted } from "vue";
import PanelProfile from "../components/panel/PanelProfile.vue";
import PanelFinances from "../components/panel/PanelFinances.vue";
import PanelMessages from "../components/panel/PanelMessages.vue";
import PanelSupport from "src/components/panel/PanelSupport.vue";
import PanelMyIcons from "src/components/panel/PanelMyIcons.vue";
import AdminPanelTickets from "src/components/panel/admin/AdminPanelTickets.vue";
import AdminPanelPayments from "src/components/panel/admin/AdminPanelPayments.vue";
import AdminPanelPacks from "src/components/panel/admin/AdminPanelPacks.vue";
import { useUserStore } from "src/stores/users-store";
import { subscriptions } from "src/stores/variables";
import { useRoute, useRouter } from "vue-router";
import { e2p } from "src/stores/helpers";

export default defineComponent({
  name: "PanelPage",
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const route = useRoute();

    const user = computed(() => userStore.data);
    const fetchSubsMetaPending = computed(() => userStore.fetchSubsMetaPending);
    const tab = ref("profile");

    const showPanelMenu = ref(false);

    watch(
      route,
      () => {
        tab.value =
          route.fullPath === "/panel/profile"
            ? "profile"
            : route.fullPath === "/panel/myicons"
            ? "myicons"
            : route.fullPath === "/panel/finances"
            ? "finances"
            : route.fullPath === "/panel/support"
            ? "support"
            : route.fullPath === "/panel/messages"
            ? "messages"
            : route.fullPath === "/panel/tickets"
            ? "tickets"
            : route.fullPath === "/panel/packs"
            ? "packs"
            : route.fullPath === "/panel/payments"
            ? "payments"
            : "profile";
      },
      { immediate: true }
    );

    const goTo = (component) => {
      router.push(`/panel/${component}`);
      tab.value = component;
    };

    onMounted(async () => {
      if (!user.value || !user.value.email) await userStore.fetchUserData();
      if (!user.value || !user.value.email) return router.push("/login");
      else await userStore.fetchSubsMeta();
    });

    return {
      subscriptions,
      user,
      fetchSubsMetaPending,
      tab,
      showPanelMenu,
      goTo,
      e2p,
    };
  },

  components: {
    PanelProfile,
    PanelFinances,
    PanelMessages,
    PanelSupport,
    PanelMyIcons,
    AdminPanelTickets,
    AdminPanelPacks,
    AdminPanelPayments,
  },
});
</script>

<style lang="sass" scoped>
.main-bar-container
  z-index: 1
  margin-left: -20px
.side-bar-container
  z-index: 2
  margin-right: -20px
.main-bar,
.side-bar
  border-radius: 30px
  -webkit-border-radius: 30px
  -moz-border-radius: 30px
  border-radius: 30px
.main-bar
  min-height: 85vh
  max-height: 85vh
  background: url(../assets/backgrounds/panel-main-fg.png) no-repeat
  background-position: left bottom
  background-color: $light
.side-bar
  min-height: 80vh
.side-bar_list-item
  border-radius: 6px
// .side-bar_list-item:hover
//   box-shadow: 0 1px 8px $elevation-umbra, 0 3px 4px $elevation-penumbra, 0 3px 3px -2px $elevation-ambient
.last_sub_dls
  border-bottom: 1px dashed red !important

@media only screen and (max-width: 600px)
  .main-bar-container
    margin-left: 0
</style>
