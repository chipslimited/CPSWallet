<template>
  <div style="width: 100%; height: 100%; margin: 0px; padding: 0px;">
      <nav class="nav">
          <div class="container nav-box">
              <div class="menu-btn" data-open="false" @click="openMenu">
                  <span class="menu-btn-bar st"></span>
                  <span class="menu-btn-bar ed"></span>
                  <span class="menu-btn-bar th"></span>
              </div>
              <a class="cps-logo" href="javascript:void(0)"><img src="../../static_m/img/cps-logo.png" alt=""></a>
              <div class="language-btn">
                  <div class="language-text" id="current_locale"  @click="changeLanguage">CN</div>
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
          <span class="text">{{$t('发送')}}</span>
      </section>
      <section class="main-content" v-bind:style="{'display':modal.show_offline_txn?'none':''}">
          <section class="send-form">
              <div class="container">
                  <div class="input-group">
                      <div class="text">{{$t('从')}}</div>
                      <i-select v-model="current_wallet.address" :not-found-text="$t('无匹配数据')" class="dropdown-box" v-bind:placeholder="$t('选择钱包')" @on-change="changeTransferWallet">
                          <Option v-for="item in wallet_list.filter(function(x){return x.keystore})" :value="item.address" :key="item.address">{{ item.address+(item.alias.length>0?"("+item.alias+")":"") }}</Option>
                      </i-select>
                  </div>
                  <div class="input-group">
                      <div class="text">{{$t('付给')}}</div>
                      <input class="num-input" type="text" v-model="target_address" v-bind:placeholder="$t('转入地址')">
                  </div>
                  <div class="input-group">
                      <div class="text">{{$t('数量M')}}</div>
                      <input v-model="transfer_token" v-bind:type="input_num_type" pattern="[\d\.]*" step="any" v-on:change="transferTokenChange" v-on:keyup="transferTokenChange" :disabled="!token_address || token_address.length == 0">
                      <div class="dropdown-box type">
                      <i-select v-model="token_address" :not-found-text="$t('无匹配数据')" slot="append" class="type-dropdown" v-bind:placeholder="$t('币种')" @on-change="onTokenChange">
                          <Option v-for="item in current_wallet.balances" :value="item.address" :key="item.address">{{ item.symbol }}</Option>
                      </i-select>
                      </div>
                  </div>
                  <div class="balance">{{$t('持有:')}}<span class="num" v-if="bal">{{bal}}</span> <span class="num" v-if="!bal">({{$t('选择钱包')+"&nbsp;"+$t('币种')}})</span> {{token}}</div>
                  <br/>
                  <div class="slider-group">
                      <div class="text">{{$t('燃料上限')}}</div>
                      <VSlider v-model="gas" :step="1" show-input :min="21000" :max="1000000" class="slider" :pattern="'\\d*'"></VSlider>
                  </div>
                  <div class="slider-group">
                      <div class="text">{{$t('燃料价格(Gwei)M')}}</div>
                      <VSlider v-model="gasPrice" :step="1" show-input :min="1" :max="100" class="slider" :pattern="'\\d*'"></VSlider>
                  </div>
                  <div class="miner-cost">
                      <div class="text">{{$t('矿工费用')}}</div>
                      <div class="val">{{parseFloat(gas)*parseFloat(gasPrice)/1e9}}  ETH
                      </div>
                      <div class="prompt-btn" @click="showMinerFeeTip"></div>
                  </div>
              </div>
          </section>
          <section class="send-total">
              <div class="container">
                  <div class="send-total-box">
                      <div class="total-num">{{$t('共计：')}}<span class="va">{{transfer_token}}</span>&nbsp;{{token}}</div>
                      <div class="msg">{{$t('（温馨提示：转帐前请确保付款地址内拥有少量的ETH余额，这将用以缴纳以太坊网络的GAS手续费。您可以从任何钱包或交易所直接将\nETH转入您的CPS地址，因为您的CPS地址同时也是一个以太坊地址，并支持所有基于以太坊协议的代币存储。）')}}</div>
                      <div class="btn-group">
                          <button type="button" class="sure" @click="proceedTranfer">{{$t('确定')}}</button>
                      </div>
                  </div>
              </div>
          </section>
      </section>

      <Modal v-model="modal.password_transaction" width="100%" :closable="false" :mask-closable="false">
          <div class="wallet_tips_main">
              <div class="tips_main_title">{{$t('身份验证')}}</div>
              <div class="tips_form has_input">
                  <div class="tips_input">
                      <input type="password" v-bind:placeholder="$t('请输入密码')" value="" v-model="user_password"  maxlength=""></div>
                  <div class="tips_form_btn btn-flex more_btn">
                      <a href="javascript:" class="js_tips_btn " @click="transferOffline" :loading="modal_loading">{{$t('离线交易M')}}</a>
                      <a href="javascript:" v-bind:class="{'js_tips_btn ':!modal_loading,'js_tips_btn ivu-btn-loading':modal_loading}" @click="transfer" :loading="modal_loading">{{$t('现在发送M')}}</a>
                      <a href="javascript:" class="js_tips_btn " @click="closeModal()">{{$t('关闭')}}</a>
                  </div>
              </div>
          </div>
      </Modal>
      <Modal v-model="modal.input_nonce" width="100%" :closable="false" :mask-closable="false">
          <div class="wallet_tips_main">
              <div class="tips_main_title">{{$t('请输入nonce')}}</div>
              <div class="tips_main_tips">{{$t('nonce应该等于转出地址的累计交易数，如果你已联网，应用将自动获取nonce')}}</div>
              <div class="tips_form has_input">
                  <div class="tips_input"><input type="text" v-model="current_wallet.custom_nonce"  v-bind:placeholder="$t('请输入nonce')" value="0" id="wallet_input" maxlength=""></div>
                  <div class="tips_form_btn btn-flex">
                      <a href="javascript:" class="js_tips_btn " @click="transferOffline2">{{$t('确定')}}</a>
                      <a href="javascript:" class="js_tips_btn " @click="closeModal()">{{$t('关闭')}}</a>
                  </div>
              </div>
          </div>
      </Modal>
      <Modal v-model="modal.show_info" width="100%" :closable="false" :mask-closable="false">
          <div class="wallet_tips_main">
              <div class="tips_main_title">{{$t('提示')}}</div>
              <div class="tips_main_tips">{{modal_info}}</div>
              <div class="tips_form_btn">
                  <a href="javascript:" class="js_tips_btn " @click="closeModal()">{{$t('关闭')}}</a>
              </div>
          </div>
      </Modal>

      <section class="transData" v-bind:style="{'display':modal.show_offline_txn?'block':'none'}">
          <div class="container">
              <div class="title">{{$t('交易数据')}}</div>
              <div class="text">{{qrcode}}</div>
              <div class="prompt">{{$t('请保留上面的签名，在互联网的设备下，粘贴至已签名交易发送功能处，即可完成一笔交易。')}}</div>
              <div class="qr-transData">
                  <div class="line"></div>
                  <div class="title">{{$t('交易数据')}}</div>
                  <div class="img-group">
                      <p class="qrcode" id="qrcode"></p>
                  </div>
                  <div class="line"></div>
              </div>
              <div class="btn-group">
                  <button class="close-transData" @click="closeModal('show_offline_txn')">{{$t('关闭')}}</button>
              </div>
          </div>
      </section>
      <div class="model">
          <div class="close" @click="hideMinerFeeTip()"></div>
          <p class="text">
              <span>{{$t('“燃料上限” -> 燃料数量上限')}}</span><br/>
              <span>{{$t('“燃料价格” -> 燃料单价上限')}}</span><br/><br/>
              <span>{{$t('矿工费用＝实际燃料数量*实际燃料单价。实际燃料数 量和单价不会高于用户指定的上述两个上限，多余的会 退回。较低的燃料单价和数量可以节省矿工费用，但是\n    也会降低交易到账的速度。在联网设备发送时，会自动 获取燃料上限，在离线设备发送时，需手动设定燃料上 限。如果矿工费用不足以完成打包，或者当前交易的燃 料数量超过了区块的限制，这笔交易将失败。')}}
              </span><br/><br/>
          </p>
      </div>
  </div>
</template>

<script>
import _ from "lodash";
import BigNumber from "bignumber.js";
import web3Utils from "../web3Utils";
import kjua from "kjua";
import translateError from '../translate_error'

export default {
  data() {
    return {
      method: "transfer",
      token_address: "",
      transfer_token: "0",
      wallet_list: [],
      current_wallet: {
        balances:[]
      },
      gas:80000,
      gasPrice:20,
      target_address: "",
      qrcode: "",
      user_password: "",
      modal_loading:false,
      modal:{
        password_transaction:false,
        show_info: false,
        show_offline_txn: false,
          prompt_minerfee: false,
      },
      modal_info:"",
        input_num_type:"number",
    };
  },
  computed: {
    token: function() {
      let _this = this,
        //_token = _.find(this.current_wallet.balances, { address: _this.token_address });
        _token = this.current_wallet && this.current_wallet.balances?this.current_wallet.balances.filter(x=>{return x.address == _this.token_address;})[0]:undefined;
      return _token ? _token.symbol : "";
    },
    max: function() {
        let _this = this,
            //_token = _.find(this.current_wallet.balances, { value: _this.token_address });
            _token = this.current_wallet && this.current_wallet.balances?this.current_wallet.balances.filter(x=>{return x.address == _this.token_address;})[0]:undefined;
        return _token && _token.balance > 0 ? _token.balance : 9999999999;
    },
    bal:  function() {
        let _this = this,
            //_token = _.find(this.current_wallet.balances, { value: _this.token_address });
            _token = this.current_wallet && this.current_wallet.balances?this.current_wallet.balances.filter(x=>{return x.address == _this.token_address;})[0]:undefined;
        return _token && _token.balance ? _token.balance : null;
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
    this.input_num_type = window.navigator.userAgent.match(/Android/i)?'number':'text'
  },
    updated(){
        this.modal.show_offline_txn = false;
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
    showMinerFeeTip(e){
        if ($('.prompt-btn').attr('data-open') == "false") {
            e.stopPropagation();
            $('.model').fadeIn();
            $('.model').click(function(e){
              e.stopPropagation();
            });
            $('.prompt-btn').attr('data-open', 'true');
        } else {
            $('.model').fadeOut();
            $('.prompt-btn').attr('data-open', 'false');
        }
    },
    hideMinerFeeTip(){
        $('.model').fadeOut();
        $('.prompt-btn').attr('data-open', 'false');
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
          web3 = web3Utils.getWeb3(),
          text = [];

      if (!_this.current_wallet || !_this.current_wallet.address) {
        text.push(_this.$root.$i18n.t("未选择钱包"));
      }
      if (!_this.target_address) {
        text.push(_this.$root.$i18n.t("未填写转入地址"));
      }
      if (!web3.isAddress(this.target_address)) {
         text.push(_this.$root.$i18n.t("转入地址不正确"));
      }

      if((_this.transfer_token+"").endsWith('.')){
          _this.transfer_token = _this.transfer_token+".0";
      }

      if(!_this.transfer_token || (_this.transfer_token+"").length == 0){
        text.push(_this.$root.$i18n.t("转入数量小于等于0"))
      }

      if(!_this.token_address || _this.token_address.length == 0){
        text.push(_this.$root.$i18n.t("未选择币种"))
      }

      if (text.length) {
        text.unshift(_this.$root.$i18n.t("错误："));
          _this.$Message.error(text.join(" "));
        return;
      }
        _this.openModal('password_transaction')
    },
    transfer() {
      var _this = this;

      if(_this.modal_loading)return;

      _this.$Loading.start();
      _this.modal_loading = true;

      this.doTransfer()
        .then(txhash => {
          _this.$Loading.finish();
          _this.modal_loading = false;
          _this.closeModal();
          //_this.$Message.success(_this.$root.$i18n.t('提交成功：')+`${txhash}`);
          _this.modal_info = _this.$root.$i18n.t('提交成功：')+`${txhash}`;
          _this.openModal('show_info');
          _this.getBalance(this.current_wallet);

        })
        .catch(err => {
          _this.$Loading.error();
          _this.modal_loading = false;
          _this.closeModal();
          //_this.$Message.error(_this.$root.$i18n.t("提交失败"));
          _this.modal_info = _this.$root.$i18n.t('提交失败')+" "+translateError.translate(err.toString());
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

              let
                  //_token = _.find(this.current_wallet.balances, { value: _this.token_address });
                  _token = _this.current_wallet && _this.current_wallet.balances?_this.current_wallet.balances.filter(x=>{return x.address == _this.token_address;})[0]:undefined;
              var bal = _token && _token.balance ? _token.balance : null;
              if(bal != null && typeof(bal) != 'undefined'){
                  if(parseFloat(bal) < parseFloat(valueEth)){
                      //余额不足
                      _this.$Message.error(_this.$root.$i18n.t('余额不足'));
                      _this.closeModal();
                      return;
                  }
              }

            value = new BigNumber(valueEth + "e+" + "18");
            gasPrice = parseFloat(_this.gasPrice)*1e9;
            gas = _this.gas;
            var txn = {
                from: fromAddr,
                to: toAddr,
                value: value,
                gasPrice: gasPrice,
                gas: gas
            };

            gas = web3.eth.estimateGas(txn);
            txn = {
                  from: fromAddr,
                  to: toAddr,
                  value: value,
                  gasPrice: gasPrice,
                  gas: gas
              };

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

              let
                  //_token = _.find(this.current_wallet.balances, { value: _this.token_address });
                  _token = _this.current_wallet && _this.current_wallet.balances?_this.current_wallet.balances.filter(x=>{return x.address == _this.token_address;})[0]:undefined;
              var bal = _token && _token.balance ? _token.balance : null;
              if(bal != null && typeof(bal) != 'undefined'){
                  if(parseFloat(bal) < parseFloat(valueEth)){
                      //余额不足
                      _this.$Message.error(_this.$root.$i18n.t('余额不足'));
                      _this.closeModal();
                      return;
                  }
              }

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
          if(_this.modal_loading)return;
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
              //_this.openModal('show_offline_txn');
              _this.modal.show_offline_txn = true;
          })
          .catch(err => {
              _this.$Loading.error();
              _this.modal_loading = false;
              _this.closeModal();
              _this.$Message.error(_this.$root.$i18n.t("提交失败")+ translateError.translate(err.toString()));
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
                      value = new BigNumber(valueEth + "e+" + "18");
                      gasPrice = parseFloat(_this.gasPrice)*1e9;
                      gas = _this.gas;
                      var txn = {
                          nonce: _this.current_wallet.custom_nonce,
                          from: fromAddr,
                          to: toAddr,
                          value: value.toString(),
                          gasPrice: gasPrice,
                          gas: gas
                      };

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
                      };

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
      this.transfer_token = 0;

    },
    transferTokenChange(){
      var amount = this.transfer_token + "";

      if(amount == "")return;

      var prev_amount = this.transfer_token + "";
      if(prev_amount.startsWith('.')){
          amount = "0"+prev_amount;
      }

      var _this = this;

      try{
          var amountValid = /[0-9]+\.*[0-9]*/g.exec(amount)[0];
          while(amountValid.startsWith("00")){
              amountValid = amountValid.substring(1);
          }

          if(amountValid.startsWith("0") && !amountValid.startsWith("0.") && amountValid.length > 1){
              amountValid = amountValid.substring(1);
          }

          var decimals = 18;
          if (this.token_address === "ETH") {

          }
          else{
              let erc20tokens = web3Utils.getErc20Tokens();

              let erc20token = _.find(erc20tokens, {
                      address: this.token_address
                  });

              decimals = erc20token.decimals;
          }
          var amount_decimals = /\.[0-9]+/.exec(amountValid);
          if(amount_decimals){
              amount_decimals = amount_decimals[0];
          }
          if(amount_decimals && amount_decimals.length > decimals+1){
              amountValid = amountValid.substring(0, amountValid.length-(amount_decimals.length-decimals-1));
          }

          debugger;
          if(prev_amount != amountValid){
              setTimeout(function(){
                  _this.transfer_token = amountValid;
              },0);
          }
      }catch(err){
          setTimeout(function(){
              _this.transfer_token = "0";
          },0);
      }

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
    color: #fff;
    .ready-to-transfer {
      flex-grow: 0;
    }
    .form-item {
      width: 90%;
      color: #fff;
      font-size: 16px;
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

    /* Source: http://snipplr.com/view/10979/css-cross-browser-word-wrap */
    .wordwrap {
        white-space: pre-wrap;      /* CSS3 */
        white-space: -moz-pre-wrap; /* Firefox */
        white-space: -pre-wrap;     /* Opera <7 */
        white-space: -o-pre-wrap;   /* Opera 7 */
        word-wrap: break-word;      /* IE */
    }
}
</style>
