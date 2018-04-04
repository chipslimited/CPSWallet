import Vue from "vue";
import _ from "lodash";
import lightwallet from "eth-lightwallet-jh";
import iView from "iview";
import routes from "./routes";
import MainLayout from "./layouts/MainLayout.vue";
import dbUtils from "./dbUtils";

Vue.use(iView);

if(location.href.startsWith("file://")) {
    require('electron-context-menu')({
        showInspectElement: false,
        labels: {"cut": "剪切", "copy": "复制", "save": "保存", "paste": "粘贴", "copyLink": "复制链接"}
    });
}

const app = new Vue({
  el: "#app",
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
  methods: {
  }
});
