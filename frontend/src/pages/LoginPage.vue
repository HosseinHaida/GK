<template>
  <q-page class="items-center items-center justify-center row">
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <q-card class="login-card q-pa-none bg-dark" flat>
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          v-if="signingIn"
          duration="2500"
        >
          <div class="row full-height items-center justify-center">
            <q-img
              style="max-width: 120px"
              src="~assets/ui/login-successful.gif"
            />
          </div>
        </transition>
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          v-else
        >
          <div class="row full-height items-center">
            <q-form class="col-12">
              <q-card-section class="row justify-center">
                <q-img
                  alt="Account logo"
                  src="~assets/ui/account-gradient.svg"
                  width="100px"
                />
              </q-card-section>

              <q-card-section class="q-pa-sm q-gutter-sm q-mb-sm">
                <div class="row justify-center q-mb-lg">
                  <div class="col-xs-12 col-sm-7">
                    <div class="row justify-around">
                      <q-btn
                        :outline="which === 'signup'"
                        dense
                        color="primary"
                        class="q-px-md q-py-none"
                        label="ورود"
                        @click="which = 'login'"
                      />
                      <q-btn
                        dense
                        :outline="which === 'login'"
                        color="primary"
                        class="q-px-md q-py-none"
                        label="ثبت نام"
                        @click="which = 'signup'"
                      />
                    </div>
                  </div>
                </div>

                <div class="row justify-center">
                  <div class="col-xs-12 col-sm-7">
                    <q-input
                      dark
                      dense
                      outlined
                      class="g-input"
                      bg-color="grey-10"
                      input-class="text-center"
                      color="primary"
                      v-model="username"
                      :placeholder="
                        which === 'login' ? 'ایمیل / نام کاربری' : 'ایمیل'
                      "
                    />
                  </div>
                </div>

                <div class="row justify-center">
                  <div class="col-xs-12 col-sm-7">
                    <q-input
                      dark
                      dense
                      outlined
                      class="g-input"
                      bg-color="grey-10"
                      input-class="text-center"
                      color="primary"
                      v-model="pass"
                      type="password"
                      placeholder="کلمه عبور"
                    />
                  </div>
                </div>

                <div v-if="which === 'signup'" class="row justify-center">
                  <div class="col-xs-12 col-sm-7">
                    <q-input
                      dark
                      dense
                      outlined
                      class="g-input"
                      bg-color="grey-10"
                      input-class="text-center"
                      color="primary"
                      v-model="passConfirm"
                      type="password"
                      placeholder="تکرار کلمه عبور"
                    />
                  </div>
                </div>

                <div class="row justify-center">
                  <div class="col-xs-12 col-sm-7">
                    <q-btn
                      v-if="which === 'login'"
                      :loading="signinPending"
                      color="primary"
                      type="submit"
                      @click.prevent="onSignin"
                      class="full-width"
                      label="ورود"
                    />

                    <q-btn
                      v-if="which === 'signup'"
                      :loading="signupPending"
                      color="primary"
                      type="submit"
                      @click.prevent="onSignup"
                      class="full-width"
                      label="ثبت نام"
                    />
                  </div>
                </div>

                <div class="row justify-center q-mt-md">
                  <div class="col-xs-12 col-sm-7 q-pr-none q-pl-xs">
                    <div class="row">
                      <div class="col-6">
                        <div v-if="errMessage" class="text-caption text-light">
                          * {{ errMessage }}
                        </div>
                      </div>
                      <div class="col-12">
                        <div
                          v-if="which === 'login'"
                          class="row justify-end text-negative cursor-pointer"
                        >
                          کلمه عبور را فراموش کردی؟
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row justify-center q-mt-md">
                  <GoogleLogin
                    @click.prevent
                    :callback="handleGoogleAuth"
                    prompt
                  >
                    <q-btn
                      @click.stop
                      class="q-py-md"
                      flat
                      icon="img:/ui/google-login-logo.svg"
                    >
                      <!-- <q-tooltip :delay="500"> ورود با گوگل </q-tooltip> -->
                    </q-btn>
                  </GoogleLogin>
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
import { notifPrimary } from "src/util/notify";
import { defineComponent, ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "../stores/users-store";
// import { decodeCredential } from "vue3-google-login";

export default defineComponent({
  name: "LoginPage",

  setup() {
    const userStore = useUserStore();

    const signinPending = computed(() => userStore.signinPending);
    const signupPending = computed(() => userStore.signupPending);
    const signingIn = ref(false);

    const router = useRouter();
    const route = useRoute();

    const which = ref("signup");
    const username = ref("");
    const pass = ref("");
    const passConfirm = ref("");
    const errMessage = ref("");

    const isThereEmptyFields = () => {
      if (!username.value) errMessage.value = messages.pleaseEnterUsername;
      else if (!pass.value) errMessage.value = messages.pleaseEnterPassword;
      else if (which.value === "signup" && !passConfirm.value)
        errMessage.value = messages.pleaseEnterPasswordConfirm;

      if (
        !username.value ||
        !pass.value ||
        (which.value === "signup" && !passConfirm.value)
      )
        return true;
    };

    const timeout = (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };

    const handleGoogleAuth = async (response) => {
      // This callback will be triggered when the user selects or login to
      // his Google account from the popup

      // const userData = decodeCredential(response.credential);
      // console.log("Handle the userData", userData);

      await userStore
        .googleSignin(response.credential)
        .then(async ({ status, message }) => {
          if (status === "error") {
            errMessage.value = message;
          } else if (status === "success") {
            notifPrimary(message, "login");
            signingIn.value = true;
            await timeout(2500);
            router.push("/");
          }
        });
    };

    const onSignin = async () => {
      if (isThereEmptyFields()) return;

      errMessage.value = null;

      await userStore
        .signin({
          username: username.value,
          password: pass.value,
        })
        .then(async ({ status, message }) => {
          if (status === "error") {
            errMessage.value = message;
          } else if (status === "success") {
            notifPrimary(message, "login");
            signingIn.value = true;
            await timeout(2500);
            router.push("/");
          }
        });
    };

    const onSignup = async () => {
      if (isThereEmptyFields()) return;

      errMessage.value = null;

      await userStore
        .signup({
          email: username.value,
          password: pass.value,
          password_confirm: passConfirm.value,
        })
        .then(async ({ status, message }) => {
          if (status === "error") {
            errMessage.value = message;
          } else if (status === "success") {
            notifPrimary(message, "login");
            signingIn.value = true;
            await timeout(2500);
            router.push("/");
          }
        });
    };

    watch(
      route,
      () => {
        which.value =
          route.fullPath === "/login"
            ? "login"
            : route.fullPath === "/signup"
            ? "signup"
            : null;
      },
      { immediate: true }
    );

    return {
      which,
      username,
      pass,
      passConfirm,
      errMessage,
      handleGoogleAuth,
      isThereEmptyFields,
      signinPending,
      signupPending,
      timeout,
      signingIn,
      onSignup,
      onSignin,
    };
  },
});
</script>

<style lang="sass" scoped>
.login-card
  height: 77vh
  max-width: 60vw
  width: 85vw
  min-height: 40vh
@media only screen and (max-width: 600px)
  .login-card
    max-width: 100vw
</style>
