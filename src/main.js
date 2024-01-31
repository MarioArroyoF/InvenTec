import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import 'animate.css';

import { initializeApp } from "firebase/app";
import 'firebase/auth'; 
import 'firebase/firestore';

var firebaseConfig = {
  apiKey: "AIzaSyBZcawyLYCai1kRp0rj9DqXw-MtfoOic7M",
  authDomain: "inventec-d598e.firebaseapp.com",
  databaseURL: "https://inventec-d598e.firebaseio.com",
  projectId: "inventec-d598e",
  storageBucket: "inventec-d598e.appspot.com",
  messagingSenderId: "202067907655",
  appId: "1:202067907655:web:2b40046fd5b4a7c52bbfd5"
};

initializeApp(firebaseConfig);

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: function (h) { return h(App) }
}).$mount('#app')
