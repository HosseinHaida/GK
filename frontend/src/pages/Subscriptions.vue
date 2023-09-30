<template>
  <q-page class="items-center items-center justify-center row">
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <q-card class="subs-card q-pa-none bg-dark" flat>
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <div class="row full-height items-center">
            <q-form class="col-12 full-height">
              <q-card-section
                v-if="!this.$isMobile()"
                class="row justify-center q-pt-md q-pb-md"
                style="max-height: 90px"
              >
                <q-img
                  alt="VecThor logo"
                  src="ui/vecthor.svg"
                  width="250px"
                />
              </q-card-section>

              <q-card-section class="q-pa-sm q-gutter-sm q-mb-sm">
                <div class="row justify-center q-mb-lg">
                  <div class="col-xs-12 col-sm-7">
                    <div class="row justify-around">
                      <div class="col-md-4 col-xs-12 q-my-md q-px-sm">
                        <q-card
                          flat
                          class="bg-dark-grey cursor-pointer"
                          :class="selectedSub === 'wheat' ? 'selected-sub' : ''"
                          @click="selectedSub = 'wheat'"
                        >
                          <q-card-section class="q-pb-sm">
                            <div
                              class="full-width text-center text-primary font-medium sub-heading primary-gradient"
                            >
                              گندم
                            </div>
                          </q-card-section>
                          <q-card-section class="q-pt-sm q-pb-none">
                            <div
                              class="full-width text-center text-primary column font-medium primary-gradient"
                            >
                              <div class="sub-dl-count">
                                {{ e2p(subLimits["wheat"]) }}
                              </div>
                              <div class="sub-download">دانلود</div>
                            </div>
                          </q-card-section>
                          <q-card-section>
                            <div class="row text-light">
                              <div class="col-12 sub-list-item font-regular">
                                <div class="row">
                                  <q-icon
                                    name="img:/ui/gg.tik.svg"
                                    size="0.7rem"
                                    class="col-auto"
                                  />
                                  <div class="q-pl-sm col">
                                    دانلود با فرمت svg
                                  </div>
                                </div>
                              </div>
                              <div class="col-12 sub-list-item font-regular">
                                <div class="row">
                                  <q-icon
                                    name="img:/ui/gg.tik.svg"
                                    size="0.7rem"
                                    class="col-auto"
                                  />
                                  <div class="q-pl-sm col">
                                    دانلود png با کیفیت‌های بالا
                                  </div>
                                </div>
                              </div>
                              <div class="col-12 sub-list-item font-regular">
                                <div class="row">
                                  <q-icon
                                    name="img:/ui/gg.tik.svg"
                                    size="0.7rem"
                                    class="col-auto"
                                  />
                                  <div class="q-pl-sm col">
                                    تعداد
                                    {{ e2p(subLimits["wheat"]) }}
                                    دانلود ویژه
                                  </div>
                                </div>
                              </div>
                              <div class="col-12 sub-list-item font-regular">
                                <div class="row">
                                  <q-icon
                                    name="img:/ui/gg.tik.svg"
                                    size="0.7rem"
                                    class="col-auto"
                                  />
                                  <div class="q-pl-sm col">
                                    اشتراک بدون محدودیت زمانی
                                  </div>
                                </div>
                              </div>
                            </div>
                          </q-card-section>
                          <q-card-section class="q-pt-lg">
                            <div
                              class="full-width text-center font-medium sub-price text-light"
                            >
                              {{ subsFa["wheat"] }} تومان
                            </div>
                          </q-card-section>
                          <q-card-actions>
                            <q-btn
                              v-bind="$attrs"
                              class="full-width sub-select-btn font-medium"
                              color="primary"
                              :outline="selectedSub !== 'wheat'"
                              @click="selectedSub = 'wheat'"
                            >
                              <div v-if="selectedSub === 'wheat'">
                                انتخاب شده
                              </div>
                              <div v-else>انتخاب</div>
                            </q-btn>
                          </q-card-actions>
                        </q-card>
                      </div>
                      <div class="col-md-4 col-xs-12 q-my-md q-px-sm">
                        <q-card
                          flat
                          class="bg-dark-grey cursor-pointer"
                          :class="selectedSub === 'bud' ? 'selected-sub' : ''"
                          @click="selectedSub = 'bud'"
                        >
                          <q-card-section class="q-pb-sm">
                            <div
                              class="full-width text-center text-primary font-medium sub-heading primary-gradient"
                            >
                              جوانه
                            </div>
                          </q-card-section>
                          <q-card-section class="q-pt-sm q-pb-none">
                            <div
                              class="full-width text-center text-primary column font-medium primary-gradient"
                            >
                              <div class="sub-dl-count">
                                {{ e2p(subLimits["bud"]) }}
                              </div>
                              <div class="sub-download">دانلود</div>
                            </div>
                          </q-card-section>
                          <q-card-section>
                            <div class="row text-light">
                              <div class="col-12 sub-list-item font-regular">
                                <div class="row">
                                  <q-icon
                                    name="img:/ui/gg.tik.svg"
                                    size="0.7rem"
                                    class="col-auto"
                                  />
                                  <div class="q-pl-sm col">
                                    دانلود با فرمت svg
                                  </div>
                                </div>
                              </div>
                              <div class="col-12 sub-list-item font-regular">
                                <div class="row">
                                  <q-icon
                                    name="img:/ui/gg.tik.svg"
                                    size="0.7rem"
                                    class="col-auto"
                                  />
                                  <div class="q-pl-sm col">
                                    دانلود png با کیفیت‌های بالا
                                  </div>
                                </div>
                              </div>
                              <div class="col-12 sub-list-item font-regular">
                                <div class="row">
                                  <q-icon
                                    name="img:/ui/gg.tik.svg"
                                    size="0.7rem"
                                    class="col-auto"
                                  />
                                  <div class="q-pl-sm col">
                                    تعداد
                                    {{ e2p(subLimits["bud"]) }}
                                    دانلود ویژه
                                  </div>
                                </div>
                              </div>
                              <div class="col-12 sub-list-item font-regular">
                                <div class="row">
                                  <q-icon
                                    name="img:/ui/gg.tik.svg"
                                    size="0.7rem"
                                    class="col-auto"
                                  />
                                  <div class="q-pl-sm col">
                                    اشتراک بدون محدودیت زمانی
                                  </div>
                                </div>
                              </div>
                            </div>
                          </q-card-section>
                          <q-card-section class="q-pt-lg">
                            <div
                              class="full-width text-center font-medium sub-price text-light"
                            >
                              {{ subsFa["bud"] }} تومان
                            </div>
                          </q-card-section>
                          <q-card-actions>
                            <q-btn
                              v-bind="$attrs"
                              class="full-width sub-select-btn font-medium"
                              color="primary"
                              :outline="selectedSub !== 'bud'"
                              @click="selectedSub = 'bud'"
                            >
                              <div v-if="selectedSub === 'bud'">انتخاب شده</div>
                              <div v-else>انتخاب</div>
                            </q-btn>
                          </q-card-actions>
                        </q-card>
                      </div>
                      <div class="col-md-4 col-xs-12 q-my-md q-px-sm">
                        <q-card
                          flat
                          class="bg-dark-grey cursor-pointer"
                          :class="selectedSub === 'seed' ? 'selected-sub' : ''"
                          @click="selectedSub = 'seed'"
                        >
                          <q-card-section class="q-pb-sm">
                            <div
                              class="full-width text-center text-primary font-medium sub-heading primary-gradient"
                            >
                              بذر
                            </div>
                          </q-card-section>
                          <q-card-section class="q-pt-sm q-pb-none">
                            <div
                              class="full-width text-center text-primary column font-medium primary-gradient"
                            >
                              <div class="sub-dl-count">
                                {{ e2p(subLimits["seed"]) }}
                              </div>
                              <div class="sub-download">دانلود</div>
                            </div>
                          </q-card-section>
                          <q-card-section>
                            <div class="row text-light">
                              <div class="col-12 sub-list-item font-regular">
                                <div class="row">
                                  <q-icon
                                    name="img:/ui/gg.tik.svg"
                                    size="0.7rem"
                                    class="col-auto"
                                  />
                                  <div class="q-pl-sm col">
                                    دانلود با فرمت svg
                                  </div>
                                </div>
                              </div>
                              <div class="col-12 sub-list-item font-regular">
                                <div class="row">
                                  <q-icon
                                    name="img:/ui/gg.tik.svg"
                                    size="0.7rem"
                                    class="col-auto"
                                  />
                                  <div class="q-pl-sm col">
                                    دانلود png با کیفیت‌های بالا
                                  </div>
                                </div>
                              </div>
                              <div class="col-12 sub-list-item font-regular">
                                <div class="row">
                                  <q-icon
                                    name="img:/ui/gg.tik.svg"
                                    size="0.7rem"
                                    class="col-auto"
                                  />
                                  <div class="q-pl-sm col">
                                    تعداد
                                    {{ e2p(subLimits["seed"]) }}
                                    دانلود ویژه
                                  </div>
                                </div>
                              </div>
                              <div class="col-12 sub-list-item font-regular">
                                <div class="row">
                                  <q-icon
                                    name="img:/ui/gg.tik.svg"
                                    size="0.7rem"
                                    class="col-auto"
                                  />
                                  <div class="q-pl-sm col">
                                    اشتراک بدون محدودیت زمانی
                                  </div>
                                </div>
                              </div>
                            </div>
                          </q-card-section>
                          <q-card-section class="q-pt-lg">
                            <div
                              class="full-width text-center font-medium sub-price text-light"
                            >
                              {{ subsFa["seed"] }} تومان
                            </div>
                          </q-card-section>
                          <q-card-actions>
                            <q-btn
                              v-bind="$attrs"
                              class="full-width sub-select-btn font-medium"
                              color="primary"
                              :outline="selectedSub !== 'seed'"
                              @click="selectedSub = 'seed'"
                            >
                              <div v-if="selectedSub === 'seed'">
                                انتخاب شده
                              </div>
                              <div v-else>انتخاب</div>
                            </q-btn>
                          </q-card-actions>
                        </q-card>
                      </div>
                    </div>
                    <div
                      v-if="selectedSub"
                      class="row justify-center text-light full-width q-mt-xl q-px-sm"
                    >
                      <div class="col-xs-12 col-lg-6 q-mb-smß">
                        <div class="row items-center">
                          <div
                            class="col-auto q-pr-sm"
                            v-if="!this.$isMobile()"
                          >
                            کد تخفیف
                          </div>
                          <div class="col">
                            <q-input
                              v-model="discountInput"
                              outlined
                              dense
                              dark
                              color="primary"
                              :label="this.$isMobile() ? 'کد تخفیف' : ''"
                            >
                              <template v-slot:after>
                                <div>
                                  <q-btn
                                    class="q-ml-xs q-py-sm font-medium"
                                    outline
                                    color="primary"
                                  >
                                    اعمال
                                  </q-btn>
                                </div>
                              </template>
                            </q-input>
                          </div>
                        </div>
                      </div>
                      <div class="col-xs-12 col-lg-6">
                        <div class="row justify-center items-center">
                          <div class="col-auto q-pr-sm">
                            <div class="row">
                              <div
                                class="col-12"
                                :class="this.$isMobile() ? 'q-py-md' : ''"
                              >
                                <span class="font-medium">
                                  مبلغ قابل پرداخت :
                                </span>
                                <span class="font-regular">
                                  {{ e2p(subs[selectedSub]) }} تومان
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="col-auto">
                            <q-btn
                              class="q-ml-xs q-py-sm"
                              color="primary"
                              @click="onStartPayment"
                            >
                              <q-spinner-facebook
                                v-if="paymentRedirectPending"
                              />
                              <span v-else> پرداخت </span>
                            </q-btn>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-form>
          </div>
        </transition>
        <!-- Backgrounds -->
        <img
          v-if="!this.$isMobile()"
          class="absolute-top-left"
          style="height: 100%; width: auto"
          alt="Login Page Right  Background"
          src="~assets/backgrounds/login-fg-wave-right.png"
        />
        <img
          v-if="!this.$isMobile()"
          class="absolute-top-right"
          style="height: 100%; width: auto"
          alt="Login Page Left  Background"
          src="~assets/backgrounds/login-fg-wave-left.png"
        />
      </q-card>
    </transition>
  </q-page>
</template>

<script>
import { messages } from "src/stores/messages";
import { notifError, notifPrimary } from "src/util/notify";
import { defineComponent, ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/users-store";
import { e2p } from "src/stores/helpers";
// import { decodeCredential } from "vue3-google-login";

export default defineComponent({
  name: "SubscriptionsPage",

  setup() {
    const userStore = useUserStore();

    const paymentRedirectPending = computed(
      () => userStore.paymentRedirectPending
    );
    const user = computed(() => userStore.data);

    const router = useRouter();

    const selectedSub = ref("");
    const discountInput = ref("");
    const subs = ref({
      seed: "29000",
      bud: "59000",
      wheat: "79000",
    });
    const subsFa = ref({
      seed: "۲۹.۰۰۰",
      bud: "۵۹.۰۰۰",
      wheat: "۷۹.۰۰۰",
    });
    const subLimits = ref({
      seed: 30,
      bud: 75,
      wheat: 150,
    });

    const onStartPayment = async () => {
      if (!user.value.email) {
        router.push("/signup");
        return notifError(messages.pleaseSignupOrLogin, "login");
      }

      await userStore
        .startPayment(selectedSub.value)
        .then(async ({ status, message, load }) => {
          if (status === "error") {
            return notifError(message);
          } else if (status === "success") {
            window.location.replace(load);
          }
        });
    };

    return {
      selectedSub,
      subs,
      subsFa,
      subLimits,
      discountInput,
      paymentRedirectPending,
      user,
      onStartPayment,
      e2p,
    };
  },
});
</script>

<style lang="sass" scoped>
.sub-heading
  font-size: 20px
  line-height: 3rem
  border-bottom: 2px solid transparent
  border-image: linear-gradient(0.25turn, $primary, $secondary)
  border-image-slice: 1

.sub-dl-count
  font-size: 1.2rem
  line-height: 0.8rem

.sub-download
  font-size: .8rem

.sub-list-item
  font-size: 0.8rem

.sub-price
  font-size: 1.2rem

.selected-sub
  background: linear-gradient($dark-grey 0 0) padding-box, linear-gradient(to right, $secondary, $primary) border-box
  border: 1px solid transparent
  border-radius: $generic-border-radius
  display: inline-block

// .sub-select-btn-active
//   background: linear-gradient(45deg, $secondary, $primary) !important
//   color: $light !important

.subs-card
  min-height: 77vh
  max-width: 80vw
  width: 90vw
  // min-height: 40vh
</style>
