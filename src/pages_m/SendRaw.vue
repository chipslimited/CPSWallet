<template>
  <div style="width: 100%; height: 100%; margin: 0px; padding: 0px;">
      <Modal v-model="modal.show_info" width="600" :closable="false" :mask-closable="false">
          <div class="wallet_tips_main">
              <div class="tips_main_title">{{$t('提示')}}</div>
              <div class="tips_emphasis_tips">{{modal_info}}</div>
              <div class="tips_from">
              <div class="tips_form_btn">
                  <a href="javascript:;" class="js_tips_btn " @click="closeModal()">{{$t('关闭')}}</a>
              </div>
              </div>
          </div>
      </Modal>
      <nav class="nav">
          <div class="container nav-box">
              <div class="menu-btn" data-open="false" @click="openMenu">
                  <span class="menu-btn-bar st"></span>
                  <span class="menu-btn-bar ed"></span>
                  <span class="menu-btn-bar th"></span>
              </div>
              <a class="cps-logo" href="#"><img src="../../static_m/img/cps-logo.png" alt=""></a>
              <div class="language-btn">
                  <div class="language-text" id="current_locale">CN</div>
                  <ul class="language-list">
                      <li class="language-item" @click="changeLanguage('CN')">CN</li>
                      <li class="language-item" @click="changeLanguage('TW')">TW</li>
                      <li class="language-item" @click="changeLanguage('EN')">EN</li>
                  </ul>
              </div>
          </div>
      </nav>
      <section class="wallet-title">
          <span class="icon"></span>
          <span class="text">{{$t('已签名交易发送')}}</span>
      </section>
      <section class="content container">
          <div class="textarea">
              <textarea v-model="target_address" v-bind:placeholder="$t('请输入已签名交易数据')"></textarea>
          </div>
          <div class="prompt">{{$t('温馨提示：转账前请确保付款地址内拥有少量的ETH余额，这将用以缴纳以太坊的GAS手续费。您可以从任何钱包或交易所直接将ETH转入你的CPS地址，因为你的CPS地址同时也是一个以太坊地址，并支持所有基于以太坊协议的代币储存。')}}</div>
          <div class="btn-group">
              <button type="button" v-bind:class="{'right ':!modal_loading,'right ivu-btn-loading':modal_loading}"  @click="transfer">{{$t('确定')}}</button>
          </div>
      </section>
  </div>
</template>

<script>

import web3Utils from "../web3Utils";

export default {
  data() {
    return {
      method: "transfer",
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
        password_transaction:false,
        show_info: false,
        show_offline_txn: false,
      },
      modal_info:""
    };
  },
  computed: {

  },
  mounted() {

  },
  methods: {
      openMenu(){
          if ($('.menu-btn').attr('data-open') == "false") {
              $('.menu-btn').attr('data-open','true');
              $('.menu-btn').addClass('menu-btn-close');
              $('.menu').addClass('open');
              $('.wallet-wrapper').addClass('open');
          } else {
              $('.menu-btn').removeClass('menu-btn-close');
              $('.menu').removeClass('open');
              $('.wallet-wrapper').removeClass('open');
              $('.menu-btn').attr('data-open','false');
          }
      },
      changeLanguage(type){
          window.changeLanguage(type);
      },
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
    transfer() {
      var _this = this;

      _this.$Loading.start();
      _this.modal_loading = true;

      this.doTransfer()
        .then(txhash => {
          _this.$Loading.finish();
          _this.modal_loading = false;
          _this.closeModal();
          _this.$Message.success(_this.$root.$i18n.t('提交成功：')+`${txhash}`);
          _this.modal_info = _this.$root.$i18n.t('提交成功：')+`${txhash}`;
          _this.openModal('show_info');

        })
        .catch(err => {
          _this.$Loading.error();
          _this.modal_loading = false;
          _this.closeModal();
          _this.$Message.error(_this.$root.$i18n.t("提交失败"));
          _this.modal_info = _this.$root.$i18n.t('提交失败')+err.toString();
           _this.openModal('show_info');
        });
    },
    doTransfer(resolve, reject) {
      var _this = this;

      return new Promise((resolve, reject) => {
        let web3 = web3Utils.getWeb3(),
          rawTxData = this.target_address;

        try {
            web3.eth.sendRawTransaction(
              rawTxData,
              function(err, txhash) {
                if (err) {
                  reject && reject(err);
                } else {
                  resolve && resolve(txhash);
                }
              }
            );
        } catch (err) {
          reject && reject(err);
        }
      });
    },
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
    color: #222222;
    .receive-wallet-qrcode {
      margin-top: 30px;
      .qrcode {
        margin-left: 100px;
      }
    }
  }
    .round-corner-input{
        border-radius:10px;
        background: rgb(40,40,40);
    }
}
</style>
