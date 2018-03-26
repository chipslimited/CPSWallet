<template>
  <div>

    <div class="filter-wrapper">
    </div>

    <div class="result-wrapper">
      <div class="form-item">
        <div class="form-item">
          <i-input v-model="target_address" placeholder="请输入已签名的交易数据" class="wallet-target"></i-input>
      </div>
      </div>

    <div class="form-item">
        <div class="form-item">
            <span>&nbsp;</span>
        </div>
    </div>

      <div class="result-wrapper">
        <div class="form-item">
          <i-button class="button ready-to-transfer" size="large" @click="transfer">确定</i-button>
        </div>
      </div>
      <div class="content-wrapper">
          <div class="gap clearfix"></div>
        <div class="content-wrapper token-amount">
            <p>（温馨提示：转帐前请确保付款地址内拥有少量的ETH余额，这将用以缴纳以太坊网络的GAS手续费。您可以从任何钱包或交易所直接将ETH转入您的CPS地址，因为您的CPS地址同时也是一个以太坊地址，并支持所有基于以太坊协议的代币存储。 ）</p>
        </div>
      </div>

        <Modal v-model="modal.show_info" width="600" :closable="false" :mask-closable="false">
            <p slot="header" style="text-align:center">
                <span>提示</span>
            </p>
            <div style="text-align:center"><span>{{modal_info}}</span></div>
            <div slot="footer" style="text-align:center;">
                <i-button class="button" @click="closeModal()">关闭</i-button>
            </div>
        </Modal>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import async from "async";
import BigNumber from "bignumber.js";
import reportUtils from "../reportUtils";
import web3Utils from "../web3Utils";
import kjua from "kjua";

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
          _this.$Message.success(`提交成功：${txhash}`);
          _this.modal_info = `提交成功：${txhash}`;
          _this.openModal('show_info');

        })
        .catch(err => {
          _this.$Loading.error();
          _this.modal_loading = false;
          _this.closeModal();
          _this.$Message.error("提交失败");
          _this.modal_info = '提交失败'+err.toString();
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
