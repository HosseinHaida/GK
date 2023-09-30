import Landing from "src/pages/LandingPage.vue";
import Login from "src/pages/LoginPage.vue";
import Subscriptions from "src/pages/Subscriptions.vue";
import Panel from "src/pages/PanelPage.vue";
import PackPage from "src/pages/PackPage.vue";
const routes = [
  {
    path: "/payment/verify",
    component: () => import("src/pages/PaymentVerification.vue"),
  },
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: Landing },
      { path: "/login", component: Login },
      { path: "/signup", component: Login },
      { path: "/subscriptions", component: Subscriptions },
      { path: "/pack/:packId", component: PackPage },
      { path: "/icon/:iconId", component: Landing },
      {
        path: "/panel",
        component: Panel,
        children: [
          { path: "profile", component: Panel },
          { path: "myicons", component: Panel },
          { path: "finances", component: Panel },
          { path: "support", component: Panel },
          { path: "messages", component: Panel },
          { path: "tickets", component: Panel },
          { path: "packs", component: Panel },
          { path: "payments", component: Panel },
        ],
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
