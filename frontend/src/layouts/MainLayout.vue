<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn round flat @click="checkLoginAndRedirect()">
          <q-icon name="img:/ui/cg.account.svg" color="dark" size="md" />

          <q-menu v-model="showUserMenu" class="g-rounded-6">
            <div class="row no-wrap bg-primary">
              <div v-if="user && user.email" class="column">
                <q-chip
                  color="light"
                  class="q-ma-none text-primary shadow-3 g-rounded-6"
                  square
                  style="min-width: 200px"
                >
                  <div class="full-width text-center font-medium">
                    {{ "(:" }} {{ user.username ? user.username : user.email }}
                    {{ "@" }}
                  </div>
                  <!-- <q-space />
                  {{ user.remaining }} -->
                </q-chip>

                <q-list dense padding class="rounded-borders text-light">
                  <q-item
                    active-class="text-light"
                    :to="links.panel"
                    clickable
                    v-ripple
                  >
                    <q-item-section>
                      <div class="row items-center font-regular">
                        <q-icon
                          size="xs"
                          class="q-mr-sm"
                          name="img:/ui/ws.account_outline.svg"
                        />
                        پنل کاربری
                      </div>
                    </q-item-section>
                  </q-item>

                  <q-item
                    @click="onLogout"
                    active-class="text-light"
                    clickable
                    v-ripple
                  >
                    <q-item-section>
                      <div class="row items-center font-regular">
                        <q-icon
                          size="xs"
                          class="q-mr-sm"
                          name="img:/ui/ws.power_exit.svg"
                        />
                        خروج
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-menu>
        </q-btn>

        <q-btn
          class="q-ml-sm font-medium"
          color="dark"
          label="خرید اشتراک"
          to="/subscriptions"
        />
        <q-space />

        <div class="row items-center">
          <div class="col">
            <q-btn dense to="/" flat>
              <q-img
                style="max-height: 40px"
                no-spinner
                alt="VecThor logo"
                src="~assets/vecthor.ir_monochrome.svg"
                width="170px"
              />
            </q-btn>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { computed, defineComponent, ref } from "vue";
import { useUserStore } from "../stores/users-store";
import { useRouter } from "vue-router";
import { messages } from "src/stores/messages";
import { notifPrimary } from "src/util/notify";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const userStore = useUserStore();
    const router = useRouter();

    const showUserMenu = ref(false);

    const user = computed(() => userStore.data);
    const signinPending = computed(() => userStore.signinPending);

    const links = ref({ panel: "/panel" });

    const onSignup = async () => {
      router.push("/signup");
    };

    const onSignin = async () => {
      router.push("/login");
    };

    const onLogout = () => {
      userStore.logout();
      notifPrimary(messages.loggedOut, "logout");
      showUserMenu.value = false;
      router.push("/");
    };

    const checkLoginAndRedirect = () => {
      if (!user.value.email) router.push("/login");
      else return true;
    };

    return {
      showUserMenu,
      user,
      signinPending,
      links,
      onSignup,
      onSignin,
      onLogout,
      checkLoginAndRedirect,
    };
  },
});
</script>
