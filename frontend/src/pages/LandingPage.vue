<template>
  <transition
    appear
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
  >
    <q-page class="text-light landing-page-bgs">
      <div
        v-if="!showDownloadPage"
        class="row justify-center"
        :class="isInputEmpty ? ($isMobile() ? 'q-pt-lg' : 'q-pt-xl') : ''"
      >
        <div v-if="isInputEmpty" class="col-12 text-center q-pt-xl font-light">
          <h4 class="q-mb-lg">دنبال چی می‌گردی؟</h4>
        </div>

        <div
          class="col-xs-10 col-sm-6 col-md-5"
          :class="
            $isMobile() && isInputEmpty && !showDownloadPage ? 'q-pb-xl' : ''
          "
        >
          <q-input
            class="index-page-input"
            dark
            outlined
            v-model="searchText"
            debounce="1500"
          >
            <template v-slot:append>
              <q-btn
                style="margin-left: -8px"
                class="shadow-9 shadow-up-9 landing-search-btn"
                color="primary"
                size="md"
                @click="onInputIconClick()"
              >
                <q-icon
                  v-if="searchText && searchText.length > 0"
                  name="img:/ui/ws.cross.svg"
                />
                <q-icon v-else name="img:/ui/ws.search.svg" />
              </q-btn>
            </template>
          </q-input>

          <div
            v-if="isInputEmpty"
            class="col-12 text-center q-pt-lg font-light"
          >
            کامل ترین و با کیفیت ترین منبع آیکون برای ایرانیان
          </div>
        </div>
      </div>
      <!-- Search Results -->
      <SearchResults
        v-if="!isInputEmpty"
        :searchPending="searchPending"
        :user="user"
        @on-show-inline-download-dialog="showDownloadPage = false"
        @on-keep-search-results="keepSearchResults = true"
        @on-go-to-page="searchIcons"
      />
      <div v-if="showDownloadPage" class="q-mt-lg">
        <DownloadPage />
      </div>
      <div
        class="row justify-between q-pt-xl"
        :class="isInputEmpty && !showDownloadPage ? 'fixed-bottom' : ''"
      >
        <div class="col-auto q-px-md q-pb-md">
          <div class="row">
            <div class="column">
              <q-list dense padding class="text-subtitle1">
                <q-item
                  @click="goHome"
                  active-class="text-light"
                  class="rounded-borders"
                  clickable
                  v-ripple
                >
                  <q-item-section> صفحه اصلی </q-item-section>
                </q-item>

                <q-item class="rounded-borders" clickable v-ripple>
                  <q-item-section> درباره گندم کیت </q-item-section>
                </q-item>

                <q-item class="rounded-borders" clickable v-ripple>
                  <q-item-section>
                    <a
                      style="text-decoration: none; color: inherit"
                      href="mailto:contact.vecthor@gmail.com"
                    >
                      پشتیبانی
                    </a>
                  </q-item-section>
                </q-item>
              </q-list>

              <div
                class="row q-pb-xs q-pt-md"
                :class="$isMobile() && isInputEmpty ? 'q-pt-lg' : ' q-pt-md'"
              >
                <q-btn class="q-px-none" dense flat>
                  <q-icon
                    class="q-px-xs cursor-pointer"
                    name="img:/ui/telegram.svg"
                    size="20px"
                    @click="goTo('telegram')"
                  />
                </q-btn>
                <q-btn class="q-px-none" dense flat>
                  <q-icon
                    class="q-px-xs cursor-pointer"
                    name="img:/ui/youtube.svg"
                    size="20px"
                    @click="goTo('youtube')"
                  />
                </q-btn>
                <q-btn class="q-px-none" dense flat>
                  <q-icon
                    class="q-px-xs cursor-pointer"
                    name="img:/ui/instagram.svg"
                    size="20px"
                    @click="goTo('instagram')"
                  />
                </q-btn>
                <q-btn class="q-px-none" dense flat>
                  <q-icon
                    class="q-px-xs cursor-pointer"
                    name="img:/ui/twitter.svg"
                    size="20px"
                    @click="goTo('twitter')"
                  />
                </q-btn>
              </div>
            </div>
          </div>
        </div>
        <div class="col-auto q-px-md q-pt-md">
          <div class="row">
            <div class="column">
              <q-btn color="light" class="q-mb-md" to="/subscriptions">
                <span class="text-primary font-medium"> خرید اشتراک </span>
              </q-btn>

              <q-btn color="light" outline>
                <span class="text-light font-medium"> هنرت رو بفروش </span>
              </q-btn>

              <div
                class="row items-center q-pb-xs"
                :class="$isMobile() && isInputEmpty ? 'q-pt-lg' : ' q-pt-md'"
              >
                <q-icon
                  class="q-px-xs"
                  name="img:/ui/kasb_o_kar_majazi.svg"
                  size="40px"
                >
                  <q-tooltip> کسب‌و‌کار مجازی </q-tooltip>
                </q-icon>
                <a
                  referrerpolicy="origin"
                  target="_blank"
                  href="https://trustseal.enamad.ir/?id=325966&amp;Code=kIgMBmnVW20AnNbLF5kl"
                >
                  <q-icon
                    class="q-px-xs"
                    name="img:/ui/e-namad.svg"
                    size="40px"
                  />
                </a>
                <q-icon class="q-px-xs" name="img:/ui/zarinpal.svg" size="28px">
                  <q-tooltip> زرین پال </q-tooltip>
                </q-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
      <q-dialog :model-value="this.$isMobile()">
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="engineering" color="primary" text-color="light" />
            <span class="q-ml-sm q-mt-lg">
              {{ messages.youAreOnMobile }}
            </span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="بسیار خوب" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-ajax-bar
        ref="bar"
        position="bottom"
        color="primary"
        size="10px"
        skip-hijack
      />
    </q-page>
  </transition>
</template>

<script>
import { defineComponent, ref, watch, computed, onMounted } from "vue";
import { useIconsStore } from "../stores/icons-store";
import SearchResults from "../components/SearchResults.vue";
import DownloadPage from "../components/DownloadPage.vue";
import { notifError } from "src/util/notify";
import { useUserStore } from "src/stores/users-store";
import { useRoute, useRouter } from "vue-router";
import { messages } from "src/stores/messages";
import { perPageResults } from "src/stores/variables";

export default defineComponent({
  name: "LandingPage",

  setup() {
    const iconsStore = useIconsStore();
    const userStore = useUserStore();
    const router = useRouter();
    const route = useRoute();

    const bar = ref(null);
    const searchText = ref(null);

    const showDownloadPage = ref(true);
    const keepSearchResults = ref(false);

    const searchPending = computed(() => iconsStore.resultsPending);
    const isInputEmpty = computed(
      () =>
        !searchText.value || (searchText.value && searchText.value.length < 1)
    );
    const results = computed(() => iconsStore.results);

    const user = computed(() => userStore.data);

    const searchIcons = async (page) => {
      const barRef = bar.value;
      barRef.start();

      await iconsStore
        .searchIcons({
          page: page ? Number(page) : 1,
          howMany: perPageResults,
          text: searchText.value,
        })
        .then(async ({ status, message }) => {
          if (status === "error") {
            notifError(message, "close");
          }
          const barRef = bar.value;
          if (barRef) {
            barRef.stop();
          }
        });
    };

    const onInputIconClick = () => {
      if (searchText.value && searchText.value.length > 0)
        searchText.value = "";
    };

    const goHome = () => {
      searchText.value = "";
      router.push("/");
    };

    const goTo = (app) => {
      let link = "";
      switch (app) {
        case "telegram":
          link = "https://t.me/vecthor";
          break;
        case "youtube":
          link = "https://www.youtube.com/@vecthor";
          break;
        case "instagram":
          link = "https://www.instagram.com/vecthor.ir/";
          break;
        case "twitter":
          link = "https://twitter.com/vecthor";
          break;
      }
      window.open(link, "_blank").focus();
    };

    watch(searchText, async () => {
      await searchIcons();
    });

    watch(
      route,
      () => {
        if (
          route.params.iconId &&
          !keepSearchResults.value &&
          isInputEmpty.value
        )
          showDownloadPage.value = true;
        else if (!route.params.iconId) {
          showDownloadPage.value = false;
          if (!keepSearchResults.value) searchText.value = null;
        }
      },
      { immediate: true }
    );

    const checkRouteForIconId = () => {
      if (route.fullPath === "/") searchText.value = null;
      if (route.params.iconId) {
        searchText.value = null;
        showDownloadPage.value = true;
      }
    };

    onMounted(() => {
      window.onpopstate = (event) => {
        checkRouteForIconId();
      };
    });

    return {
      messages,
      route,
      bar,
      searchText,
      showDownloadPage,
      keepSearchResults,
      searchPending,
      isInputEmpty,
      results,
      user,
      searchIcons,
      onInputIconClick,
      goHome,
      goTo,
      checkRouteForIconId,
      perPageResults,
    };
  },

  components: {
    SearchResults,
    DownloadPage,
  },
});
</script>
<style lang="sass" scoped>

.landing-search-btn
  padding: 12px 30px
.landing-page-bgs
  background: url(../assets/backgrounds/strings.png) no-repeat center bottom, url(../assets/backgrounds/bottom_art.png) no-repeat center bottom
.index-page-input
  padding: 10px !important
  background-color: $dark
@media only screen and (max-width: 600px)
  .landing-page-bgs
    background: url(../assets/backgrounds/panel-main-fg.png) no-repeat right bottom
</style>
