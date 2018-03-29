<template>
  <div>

    <div class="filter-wrapper">
    </div>

    <div class="content-wrapper">
      <div class="form-item">
        从:<i-select v-model="current_wallet.address" class="wallet-source round-corner-input" placeholder="选择钱包" @on-change="changeTransferWallet">
            <Option v-for="item in wallet_list.filter(function(x){return x.keystore})" :value="item.address" :key="item.address">{{ item.address+(item.alias.length>0?"("+item.alias+")":"") }}</Option>
        </i-select>
      </div>
        <div class="gap clearfix"></div>
      <div class="form-item">
        付给:<i-input v-model="target_address" placeholder="转入地址" class="wallet-target"></i-input>
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
        <div class="gap clearfix"></div>
        <div class="form-item-slider">
            <span style="width: 20%; line-height:36px;">燃料上限: </span><div style="top: 30px; width:80%;"><Slider v-model="gas" :step="1" show-input :min="21000" :max="210000"></Slider></div>
        </div>
        <div class="clearfix"></div>
        <div class="form-item-slider">
            <span style="width: 20%; line-height:36px;">燃料价格(Gwei): </span><div style="top: 30px; width:80%;"><Slider v-model="gasPrice" :step="1" show-input :min="1" :max="50"></Slider></div>
        </div>
      <div class="result-wrapper">
        <div class="form-item">
          共计<span class="transfer-amount" v-text="transfer_token"  v-if="token"></span><span class="token"  v-text="token"></span>
          <i-button class="button ready-to-transfer" size="large" @click="proceedTranfer">确定</i-button>
        </div>
      </div>
      <div class="content-wrapper">
          <div class="gap clearfix"></div>
        <div class="content-wrapper token-amount">
            <p>（温馨提示：转帐前请确保付款地址内拥有少量的ETH余额，这将用以缴纳以太坊网络的GAS手续费。您可以从任何钱包或交易所直接将ETH转入您的CPS地址，因为您的CPS地址同时也是一个以太坊地址，并支持所有基于以太坊协议的代币存储。 ）</p>
        </div>
      </div>
      <Modal v-model="modal.password_transaction" width="360" :closable="false" :mask-closable="false">
        <p slot="header" style="text-align:center">
            <span>身份验证</span>
        </p>
        <div style="text-align:center">
            <i-input type="password" v-model="user_password" placeholder="请输入密码" style="width: 100%"></i-input>
        </div>
        <div slot="footer" style="text-align:center;">
            <i-button class="button" @click="transferOffline" :loading="modal_loading" >离线交易</i-button>
            <i-button class="button" @click="transfer" :loading="modal_loading" >现在发送</i-button>
            <i-button class="button" @click="closeModal()">关闭</i-button>
        </div>
      </Modal>
        <Modal v-model="modal.input_nonce" width="360" :closable="false" :mask-closable="false">
            <p slot="header" style="text-align:center">
                <span>请输入nonce:</span>
            </p>
            <div style="text-align:center">
                <span>nonce应该等于转出地址的累计交易数，如果您已联网，应用将自动获取nonce</span>
                <i-input type="text" v-model="current_wallet.custom_nonce" placeholder="请输入nonce" style="width: 100%"></i-input>
            </div>
            <div slot="footer" style="text-align:center;">
                <i-button class="button" @click="transferOffline2" :loading="modal_loading" >生成交易</i-button>
                <i-button class="button" @click="closeModal()">关闭</i-button>
            </div>
        </Modal>
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
      <Modal v-model="modal.show_offline_txn" width="900" :closable="false" :mask-closable="false">
      <div class="content-wrapper" v-show="qrcode.length > 0">
          <div class="receive-wallet-wrapper">
              <div>
                  <p>交易数据:</p>
                  <p style="word-break: break-all;margin: 15px; font-size: 14px;" v-text="qrcode"></p>
                  <p>请保存上面的签名，在联网的设备下，粘贴至已签名交易发送功能处，即可完成一次离线交易。</p>
              </div>
          </div>
          <div class="receive-wallet-wrapper">
              <div class="receive-wallet-qrcode">
                  交易数据：<p class="qrcode" id="qrcode"></p>
              </div>
          </div>
      </div>
      <div slot="footer">
          <Button type="info" size="medium" :loading="modal_loading" @click="closeModal();">好</Button>
      </div>
      </Modal>
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
      gas:80000,
      gasPrice:21,
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
    token: function() {
      let _this = this,
        //_token = _.find(this.current_wallet.balances, { address: _this.token_address });
        _token = this.current_wallet && this.current_wallet.balances?this.current_wallet.balances.filter(x=>{return x.address == _this.token_address;})[0]:undefined
      return _token ? _token.symbol : "";
    },
    max: function() {
      let _this = this,
        //_token = _.find(this.current_wallet.balances, { value: _this.token_address });
        _token = this.current_wallet && this.current_wallet.balances?this.current_wallet.balances.filter(x=>{return x.address == _this.token_address;})[0]:undefined
      return _token && _token.balance ? _token.balance : 9999999999;
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

      try{
          _token.balance = web3Utils.toRealAmount(
              web3.eth.getBalance(_wallet.address)
          );

      }
      catch(err){
          _token.balance = null;
      }

      _wallet.balances.push(_token);

      _.forEach(erc20tokens, token => {
        let balance = 0;
        try {
            balance = token.contract.balanceOf("" + _wallet.address);
        }catch(err){
            balance = null;
        }
        _token = {
          address: token.address,
          symbol: token.symbol,
          balance:web3Utils.toRealAmount(
            balance,
            token.decimals
          ),
          decimals: token.decimals,
        };
        _wallet.balances.push(_token);
      });    
      _this.current_wallet = _.defaults(wallet, _wallet);
      _this.wallet_list[
        _.findIndex(_this.wallet_list, { address: wallet.address })
      ] = _.cloneDeep(_this.current_wallet);

      _this.$root.globalData.wallet_list = _this.wallet_list;
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
          _this.modal_info = `提交成功：${txhash}`;
          _this.openModal('show_info');
          _this.getBalance(this.current_wallet);

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

      this.qrcode = "";

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
            gasPrice = parseFloat(_this.gasPrice)*1e9;
            gas = _this.gas;
            var txn = {
                from: fromAddr,
                to: toAddr,
                value: value,
                gasPrice: gasPrice,
                gas: gas
            }

            gas = web3.eth.estimateGas(txn);
            txn = {
                  from: fromAddr,
                  to: toAddr,
                  value: value,
                  gasPrice: gasPrice,
                  gas: gas
              }

            web3.eth.sendTransaction(
              txn,
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
            gasPrice = parseFloat(this.gasPrice)*1e9;

            web3.eth.defaultAccount = fromAddr;

            gas = contract.transfer.estimateGas(toAddr, value.toString());
            _this.gas = gas;

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
      transferOffline() {
          var _this = this;
          this.qrcode = "";

          _this.$Loading.start();
          _this.modal_loading = false;

          try{
              let web3 = web3Utils.getWeb3();
              _this.current_wallet.nonce = web3.eth.getTransactionCount(_this.current_wallet.address);
          }catch(err){}

          _this.current_wallet.custom_nonce = _this.current_wallet.nonce;

          _this.openModal("input_nonce");
      },
      transferOffline2(){
        var _this = this;
        _this.doTransferOffline()
          .then(txhash => {
              _this.$Loading.finish();
              _this.modal_loading = false;
              _this.closeModal();
              _this.qrcode = txhash;
              _this.generateQRCode(txhash);
              _this.openModal('show_offline_txn');
          })
          .catch(err => {
              _this.$Loading.error();
              _this.modal_loading = false;
              _this.closeModal();
              _this.$Message.error("提交失败"+err.toString());
              console.error(err)
          });
      },
      doTransferOffline(resolve, reject) {
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
                      gasPrice = parseFloat(_this.gasPrice)*1e9;
                      gas = _this.gas;
                      var txn = {
                          nonce: _this.current_wallet.custom_nonce,
                          from: fromAddr,
                          to: toAddr,
                          value: value,
                          gasPrice: gasPrice,
                          gas: gas
                      }

                      this.current_wallet.keystore.signTransaction(txn, function(err, result){
                          if (err) {
                              reject && reject(err);
                          } else {
                              resolve && resolve(result);
                          }
                      })

                  } else {
                      let erc20token = _.find(erc20tokens, {
                              address: this.token_address
                          }),
                          contract = erc20token.contract,
                          decimals = erc20token.decimals;

                      value = new BigNumber(valueEth + "e+" + decimals);
                      gasPrice = parseFloat(_this.gasPrice)*1e9;

                      web3.eth.defaultAccount = fromAddr;

                      gas = _this.gas;

                      var data = contract.transfer.getData(
                          toAddr,
                          value.toString());
                      var txn = {
                          nonce: _this.current_wallet.custom_nonce,
                          from: fromAddr,
                          to: contract.address,
                          value: "0",
                          gasPrice: gasPrice,
                          gas: gas,
                          data: data,
                      }

                      this.current_wallet.keystore.signTransaction(txn, function(err, result){
                          if (err) {
                              reject && reject(err);
                          } else {
                              resolve && resolve(result);
                          }
                      })
                  }
              } catch (err) {
                  reject && reject(err);
              }
          });
      },
      generateQRCode(text) {
          let img_path = "./assets/logo.png",
              _qrcode = document.querySelector("#qrcode");
          _qrcode.innerHTML = "";
          _qrcode.appendChild(kjua({ text: text }));
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
    .form-item-slider {
        display: inline-flex;
        align-items: flex-end;
        color: #ccc;
        font-size: 16px;
        width: 65%;
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
