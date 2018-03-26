<template>
  <div>
    <div class="btn-wrapper">
      <i-button class="button" :class="{'active':method=='transfer'}" @click="changMethod('transfer')">发送</i-button>
      <i-button class="button" :class="{'active':method=='receive'}" @click="changMethod('receive')">收款</i-button>
    </div>
    <div class="filter-wrapper">
    </div>
    <div class="content-wrapper" v-show="method=='receive'">
      <div class="receive-wallet-wrapper">
        <div class="receive-wallet-selector">
          当前钱包：
          <i-select v-model="current_wallet.address" class="wallet-source" placeholder="选择钱包" @on-change="changeReceiveWallet">
            <Option v-for="item in wallet_list" :value="item.address" :key="item.address">{{ item.address }}</Option>
          </i-select>
        </div>
        <div class="receive-wallet-qrcode">
          收款二维码：<p class="qrcode" id="qrcode"></p>
        </div>
      </div>
    </div>
    <div class="content-wrapper" v-show="method=='transfer'">
      <div class="form-item">
        从<i-select v-model="current_wallet.address" class="wallet-source" placeholder="选择钱包" @on-change="changeTransferWallet">
            <Option v-for="item in wallet_list" :value="item.address" :key="item.address">{{ item.address }}</Option>
        </i-select>
      </div>
      <div class="form-item">
        转入<i-input v-model="target_address" placeholder="转入地址" class="wallet-target"></i-input>
      </div>
      <div class="gap clearfix"></div>
      <div class="form-item">
        数量
        <div class="transfer">
          <i-input-number v-model="transfer_token" class="transfer-token" :max="max" :min="min" :step="step">
          </i-input-number>
            <i-select v-model="token_address" slot="append" class="transfer-token-selector" placeholder="币种">
                <Option v-for="item in current_wallet.balances" :value="item.address" :key="item.address">{{ item.symbol }}</Option>
            </i-select>
        </div>
      </div>
      <div class="form-item" v-show="token_address && current_wallet">
        持有
        <div class="have-token-group">
            <span class="have-token" v-text="max"></span><span class="token" v-text="token"></span>
        </div>
      </div>
      <div class="result-wrapper">
        <div class="form-item">
          共计<span class="transfer-amount" v-text="transfer_token"  v-if="token"></span><span class="token"  v-text="token"></span>
          <i-button class="button ready-to-transfer" size="large" @click="proceedTranfer">确定</i-button>
        </div>
      </div>
      <Modal v-model="modal.password_transaction" width="360" :closable="false" :mask-closable="false">
        <p slot="header" style="text-align:center">
            <span>输入密码</span>
        </p>
        <div style="text-align:center">
            <i-input type="password" v-model="user_password" placeholder="Type your password" style="width: 100%"></i-input>
        </div>
        <div slot="footer" style="text-align:center;">
            <i-button class="button" @click="transfer" :loading="modal_loading" >确定</i-button>
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
      _qrcode.appendChild(kjua({ text: text }));
    },
    changeReceiveWallet(address) {
      let _this = this,
        current_wallet = _.cloneDeep(
          _.find(this.$root.globalData.wallet_list, ["address", address])
        );
      this.current_wallet = current_wallet;
      this.generateQRCode(address);
    },
    changeTransferWallet(address) {
      let _this = this,
        web3 = web3Utils.getWeb3(),
        current_wallet = _.cloneDeep(
          _.find(this.$root.globalData.wallet_list, ["address", address])
        );
      this.$Loading.start();

      current_wallet.keystore.passwordProvider = function(callback) {
        callback(null,_this.user_password);
      };

      web3Utils.setWebProvider(current_wallet.keystore);
      this.current_wallet = current_wallet;
      this.getBalance(this.current_wallet);
      this.$Loading.finish();
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
    changMethod(method) {
      this.method = method;
      this.current_wallet = {};
    },
    proceedTranfer(){
      var _this = this,
        text = [];
      if (!this.current_wallet || !this.current_wallet.address) {
        text.push("未选择钱包");
      }
      if (!this.target_address) {
        text.push("未填写转入地址");
      }
      if(!this.transfer_token){
        text.push("转入数量小于等于0")
      }
      if (text.length) {
        text.unshift("错误：");
        this.$Message.error(text.join(" "));
        return;
      }
      this.openModal('password_transaction')
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
        })
        .catch(err => {
          _this.$Loading.error();
          _this.modal_loading = false;
          _this.closeModal();
          _this.$Message.error("提交失败");
        });
    },
    doTransfer(resolve, reject) {
      var _this = this;
      return new Promise((resolve, reject) => {
        let web3 = web3Utils.getWeb3(),
          erc20tokens = web3Utils.getErc20Tokens(),
          fromAddr = this.current_wallet.address,
          toAddr = this.target_address,
          valueEth = this.transfer_token,
          value,
          gasPrice,
          gas,
          args = [];

        try {
          if (this.token_address === "ETH") {
            value = parseFloat(valueEth) * 1.0e18;
            gasPrice = 18000000000;
            gas = 50000;
            web3.eth.sendTransaction(
              {
                from: fromAddr,
                to: toAddr,
                value: value,
                gasPrice: gasPrice,
                gas: gas
              },
              function(err, txhash) {
                if (err) {
                  reject && reject(err);
                } else {
                  resolve && resolve(txhash);
                }
              }
            );
          } else {
            let erc20token = _.find(erc20tokens, {
                address: this.token_address
              }),
              contract = erc20token.contract,
              decimals = erc20token.decimals;

            value = new BigNumber(valueEth + "e+" + decimals);
            gasPrice = 21000000000;

            web3.eth.defaultAccount = fromAddr;

            gas = contract.transfer.estimateGas(toAddr, value.toString());

            contract.transfer(
              toAddr,
              value.toString(),
              {
                from: fromAddr,
                value: "0",
                gasPrice: gasPrice,
                gas: gas
              },
              function(err, result) {
                debugger;
                if (err) {
                  reject && reject(err);
                } else {
                  resolve && resolve(result);
                }
              }
            );
          }
        } catch (err) {
          reject && reject(err);
        }
      });
    },
    onWalletChange() {},
    onTokenChange(value) {
      this.token = value;
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
