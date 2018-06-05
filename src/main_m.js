import Vue from "vue";
import VueI18n from 'vue-i18n'
import uniq from "lodash/uniq";
import trim from "lodash/trim";
import each from "lodash/each";
import lightwallet from "eth-lightwallet-jh";
import iView from "iview";
import routes from "./routes_m";
import MobileLayout from "./layouts/MobileLayout.vue";
import MultiPage from "./components/MultiPage.vue"
import VSlider from "./components/slider.vue"
import dbUtils from "./dbUtils";


Vue.use(iView);
Vue.use(VueI18n);


var locale = localStorage.getItem("cps-wallet-locale");
if(!locale){
    locale = 'CN';
    localStorage.setItem("cps-wallet-locale", locale);
}

if(locale != 'CN' && locale != 'TW' && locale != 'EN'){
    locale = 'CN';
    localStorage.setItem("cps-wallet-locale", locale);
}

import zh from 'iview/dist/locale/zh-CN';
import en from 'iview/dist/locale/en-US';
import tw from 'iview/dist/locale/zh-TW';

import {default as cn_a} from './assets/common/lang/cn.js';
import {default as tw_a} from './assets/common/lang/tw.js';
import {default as en_a} from './assets/common/lang/en.js';

const i18n = new VueI18n({
    locale: locale,    // 语言标识
    messages: {
        'CN': Object.assign(cn_a, zh),   // 中文语言包
        'TW': Object.assign(tw_a , tw),   // 中文语言包
        'EN': Object.assign(en_a, en)    // 英文语言包
    },
});

if(locale == 'EN'){
    Vue.use(iView, { en });
}
else if(locale == 'CN'){
    Vue.use(iView, { zh });
}
else if(locale == 'TW'){
    Vue.use(iView, { tw });
}

Vue.component('MultiPage', MultiPage);
Vue.component('VSlider', VSlider);

const app = new Vue({
  el: "#app",
    i18n,
  data: {
    currentView: "wallet",
    globalData: {
      wallet_list: [],
      current_wallet: {}
    }
  },
  components: {
    mobileLayout: MobileLayout,
    wallet: routes.wallet,
      send: routes.send,
      sendr: routes.sendr,
      receive: routes.receive,
    history:  routes.history
  },
  created() {
    let _this = this,
      address_list = uniq(trim(dbUtils.get("address_list")).split(" ")),
      wallet = {};

    each(address_list, function(address) {
        if(!address || address == "")return;

      let serialized_keystore = dbUtils.get(address);

      var alias = dbUtils.get(address+"_alias");
      if(typeof(alias) == 'undefined' || alias == null)alias = "";

      if (serialized_keystore) {
          var ks = null;
          try{
              ks = lightwallet.keystore.deserialize(dbUtils.get(address))
          }catch(err){

          }
        wallet = {
          address: address,
          keystore: ks,
          alias: alias
        };
        _this.globalData.wallet_list.push(wallet);
      }
      else{
          wallet = {
              address: address,
              keystore: null,
              alias:alias
          };
          _this.globalData.wallet_list.push(wallet);
      }
    });

    dbUtils.set("address_list", address_list.join(" "));

    window.onhashchange = function(e) {
      _this.currentView = window.location.hash.replace("#", "");
    };
  },
    mounted(){
      window.changeLanguage = this.changeLanguage;
      window.i18n = i18n;
    },
  methods: {
      changeLanguage(type){
          if(type instanceof Event){
            type.stopPropagation();
            $('.language-list').css('display','block');
            return;
          }
          i18n.locale = type;
          localStorage.setItem("cps-wallet-locale", type);

          document.getElementById('current_locale').innerText = window.i18n.locale;

          if(type == 'EN'){
              Vue.use(iView, { en });
          }
          else if(type == 'CN'){
              Vue.use(iView, { zh });
          }
          else if(type == 'TW'){
              Vue.use(iView, { tw });
          }
          $('.language-list').css('display','none');
      }
  }
});
