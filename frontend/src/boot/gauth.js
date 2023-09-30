import { boot } from "quasar/wrappers";
import vue3GoogleLogin from "vue3-google-login";

export default boot(({ app }) => {
  const config = {
    clientId:
      "928346348981-867qa8u3enbu1gthbnuqfdqvnd5bimvs.apps.googleusercontent.com",
  };

  app.use(vue3GoogleLogin, config);
});
