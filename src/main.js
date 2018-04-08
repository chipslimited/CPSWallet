import Vue from "vue";
import VueI18n from 'vue-i18n'
import _ from "lodash";
import lightwallet from "eth-lightwallet-jh";
import iView from "iview";
import routes from "./routes";
import MainLayout from "./layouts/MainLayout.vue";
import dbUtils from "./dbUtils";

Vue.use(iView);
Vue.use(VueI18n);

if(location.href.startsWith("file://")) {
    require('electron-context-menu')({
        showInspectElement: false,
        labels: {"cut": "剪切", "copy": "复制", "save": "保存", "paste": "粘贴", "copyLink": "复制链接"}
    });
}

var locale = localStorage.getItem("cps-wallet-locale");
if(!locale){
    locale = 'CN';
    localStorage.setItem("cps-wallet-locale", locale);
}

if(locale != 'CN' && locale != 'TW' && locale != 'EN'){
    locale = 'CN';
    localStorage.setItem("cps-wallet-locale", locale);
}

const i18n = new VueI18n({
    locale: locale,    // 语言标识
    messages: {
        'CN': require('./assets/common/lang/cn.js'),   // 中文语言包
        'TW': require('./assets/common/lang/tw.js') ,   // 中文语言包
        'EN': require('./assets/common/lang/en.js')    // 英文语言包
    },
})


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
    mainLayout: MainLayout,
    home: routes.home,
    wallet: routes.wallet,
    transaction: routes.transaction,
      send: routes.send,
      sendr: routes.sendr,
      receive: routes.receive,
    history: routes.history
  },
  created() {
    let _this = this,
      address_list = _.uniq(_.trim(dbUtils.get("address_list")).split(" ")),
      wallet = {};

    _.each(address_list, function(address) {
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
          i18n.locale = type;
          localStorage.setItem("cps-wallet-locale", type);

          document.getElementById('header_create_wallet').innerText = i18n.t('创建新钱包');
          document.getElementById('header_restore_wallet').innerText = i18n.t('恢复钱包');
          document.getElementById('header_watch_wallet').innerText = i18n.t('只读钱包');
          document.getElementById('current_locale').innerText = window.i18n.locale;
      }
  }
});
