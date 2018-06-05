<template>
  <div style="height: 100%;">
      <div class="receive-top">
          <div class="wallet-wrapper">
              <div class="title">{{$t('当前钱包地址 :')}}</div>
              <div class="hash-wrapper">
                  <i-select v-model="current_wallet.address" class="wallet-source" v-bind:placeholder="$t('选择钱包')" @on-change="changeReceiveWallet">
                      <Option v-for="item in wallet_list" :value="item.address" :key="item.address">{{ item.address+(item.alias.length>0?"("+item.alias+")":"") }}</Option>
                  </i-select>
                  <span class="copy" @click="copyAddress()"></span>
              </div>
          </div>
      </div>
      <div class="receive-bottom">
          <div class="title">{{$t('收款二维码 : ')}}<span id="selected_address">{{current_wallet.address}}</span></div>
          <div class="img-group" v-bind:style="current_wallet && current_wallet.address && current_wallet.address.length > 0?'':'display:none'">
              <p class="qrcode" id="qrcode"></p><a id="qrcode_download" href="">
              <div class="download"></div>
              <div class="text">{{$t('点击下载')}}</div>
          </a>
          </div>
      </div>
  </div>
</template>

<script>
import _ from "lodash";
import web3Utils from "../web3Utils";
import kjua from "kjua";

export default {
  data() {
    return {
      token_address: "",
      transfer_token: 0,
      wallet_list: [],
      current_wallet: {
        balances:[]
      },
      target_address: "",
      qrcode: "",
      user_password: "",
      modal_loading:false,
      modal:{
        password_transaction:false
      }
    };
  },
  computed: {
    token: function() {
      let _this = this,
        _token = _.find(this.current_wallet.balances, { address: _this.token_address });
      return _token ? _token.symbol : "";
    },
    max: function() {
      let _this = this,
        _token = _.find(this.current_wallet.balances, { value: _this.token_address });
      return _token ? _token.balance : 0;
    },
    min: function() {
      return 0;
    },
    step: function() {
      return 0.0001;
    }
  },
  mounted() {
    this.wallet_list = this.$root.globalData.wallet_list;

    if (this.$root.globalData.current_wallet) {
      this.current_wallet = this.$root.globalData.current_wallet;
    }
      document.getElementById('current_locale').innerText = window.i18n.locale;
  },
    updated(){
        document.getElementById('current_locale').innerText = window.i18n.locale;
    },
  methods: {
    openModal(modalname) {
      this.modal = {};
      this.modal[modalname] = true;
    },
    closeModal(modalname) {
      let modal_map = JSON.parse(JSON.stringify(this.modal));
      modalname ? (modal_map[modalname] = false) : (modal_map = {});
      this.modal = modal_map;
      this.modal_loading = false;
      this.user_password = "";
    },
    generateQRCode(text) {
      let img_path = "./assets/logo.png",

      _qrcode = document.querySelector("#qrcode");
      _qrcode.innerHTML = "";
      _qrcode.appendChild(kjua({ text: text, size: 317 }));

      var _selectedAddress = document.querySelector('#selected_address');
      _selectedAddress.innerHTML = text;

      var _qrcode_download = document.querySelector("#qrcode_download");
      _qrcode_download.download = text+".png";
      _qrcode_download.href = document.querySelector('p img').src;//"data:text/txt,"+text;

      this.qrcode = text;

    },
    changeReceiveWallet(address) {
      let _this = this,
        current_wallet = _.cloneDeep(
          _.find(this.$root.globalData.wallet_list, ["address", address])
        );
      this.current_wallet = current_wallet;
      this.generateQRCode(address);
    },

    getBalance(wallet) {
      var _this = this,
        web3 = web3Utils.getWeb3(),
        erc20tokens = web3Utils.getErc20Tokens(),
        _wallet = _.defaults({}, wallet),
        _token = {
          address: "ETH",
          symbol: "ETH"
        };

      _wallet.balances = [];

      _token.balance = web3Utils.toRealAmount(
        web3.eth.getBalance(_wallet.address)
      );

      _wallet.balances.push(_token);

      _.forEach(erc20tokens, token => {
        let balance = token.contract.balanceOf("" + _wallet.address);
        _token = {
          address: token.address,
          symbol: token.symbol,
          balance:parseFloat(web3Utils.toRealAmount(
            balance,
            token.decimals
          ))
        };
        _wallet.balances.push(_token);
      });    
      _this.current_wallet = _.defaults(wallet, _wallet);
      _this.wallet_list[
        _.findIndex(_this.wallet_list, { address: wallet.address })
      ] = _.cloneDeep(_this.current_wallet);
    },
    onWalletChange() {},
    onTokenChange(value) {
      this.token = value;
    },
      showtooltip(tip, e){

        var _this = this;
          var tooltip = document.createElement('div');
          tooltip.style.cssText =
              'position:absolute; background:black; color:white; padding:4px;z-index:10000;'
              + 'border-radius:2px; font-size:12px;box-shadow:3px 3px 3px rgba(0,0,0,.4);'
              + 'opacity:0;transition:opacity 0.3s';
          tooltip.innerHTML = tip || _this.$root.$i18n.t('已复制!');
          document.body.appendChild(tooltip);

          var evt = e || event;

          tooltip.style.left = evt.pageX - 10 + 'px';
          tooltip.style.top = evt.pageY + 15 + 'px';
          tooltip.style.opacity = 1;
          setTimeout(function(){
              tooltip.style.opacity = 0;
              document.body.removeChild(tooltip)
          }, 500)
      },
      copyAddress(){

        if(document.querySelector('#selected_address').innerText == "")return;

          var _this = this;
          function selectElementText(el){
              var range = document.createRange(); // create new range object
              range.selectNodeContents(el); // set range to encompass desired element text
              var selection = window.getSelection(); // get Selection object from currently user selected text
              selection.removeAllRanges(); // unselect any user selected text (if any)
              selection.addRange(range) // add range to Selection object to select it
          }

          selectElementText(document.querySelector("#selected_address"));
          document.execCommand("copy");

          this.showtooltip(_this.$root.$i18n.t("复制成功!"))
      }
  }
};
</script>

<style lang="less" scoped>
.content-wrapper {
  color: #fff;
  .form-item {
    display: inline-flex;
    align-items: flex-end;
    color: #ccc;
    font-size: 16px;
    width: 45%;
  }

    .icon-address-copy{
        width:20px;
        height:20px;
        margin-top:15px;
        margin-left: 5px;
    }
  .wallet-source,
  .wallet-target,
  .transfer {
    font-size: 24px;
    color: #000;
  }
  .wallet-source,
  .wallet-target,
  .transfer,
  .token-amount {
    width: 80%;
  }
  .wallet-source {
    margin-left: 20px;
  }
  .wallet-target,
  .token-amount {
    margin-left: 5px;
  }
  .transfer {
    margin-left: 5px;
    .transfer-token {
      width: 248px;
    }
    .transfer-token-selector {
      width: 80px;
    }
  }
  .wallet-selector {
    font-size: 12px;
    text-decoration: underline;
    cursor: pointer;
  }
  .have-token-group {
    margin-left: 5px;
    color: #ccc;
    .have-token,
    .token {
      font-size: 16px;
      padding: 0 5px 0 0;
    }
  }
  .gap {
    clear: both;
    display: table;
    margin-top: 50px;
    width: 100%;
  }
  .result-wrapper {
    border-top: 1px solid rgba(110, 110, 110, 0.5);
    padding-top: 40px;
    margin-top: 50px;
    width: 100%;
    .ready-to-transfer {
      flex-grow: 0;
    }
    .form-item {
      width: 90%;
    }
    .transfer-amount,
    .amount-token {
      padding: 0 10px;
      font-size: 32px;
      color: #fff;
    }
    .token {
      flex-grow: 1;
    }
  }
  .receive-wallet-wrapper {
    font-size: 16px;
    color: #ccc;
    .receive-wallet-qrcode {
      margin-top: 30px;
      .qrcode {
        margin-left: 100px;
      }
    }
  }
}
</style>
