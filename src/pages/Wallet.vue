<template>
  <div>
    <div class="btn-wrapper">
      <Modal v-model="modal.create_wallet" width="360" :closable="false" :mask-closable="false">
          <div class="wallet_tips_main">
              <div class="tips_main_title">{{$t('创建新钱包')}}</div>
              <div class="tips_form has_input">
                  <div class="tips_input">
                      <input type="text" v-bind:placeholder="$t('请输入一串随机的字符串，以随机生成助记词')" value="" v-model="user_entropy" maxlength=""/>
                      <i-select v-model="hdpath" slot="append" placeholder="{{$t('创建选项')}}">
                          <Option v-for="item in hdpaths" :value="item.value" :key="item.label">{{ $t(item.label) }}</Option>
                      </i-select>
                  </div>

                  <div class="tips_form_btn btn-flex"><a href="javascript:;" class="js_tips_btn " @click="proceedCreateToPassword">{{$t('创建')}}</a>
                  <a href="javascript:;" class="js_tips_btn " @click="closeModal()">{{$t('关闭')}}</a>
                  </div>
              </div>
          </div>
      </Modal>
      <Modal v-model="modal.password_create" width="360" :closable="false" :mask-closable="false">

          <div class="wallet_tips_main">
              <div class="tips_lower_tit">{{$t('你的新钱包助记词：')}}</div>
              <div class="tips_emphasis_tips">{{seed}}</div>
              <div class="tips_lower_tit">{{$t('温馨提示')}}</div>
              <div class="tips_main_tips">{{$t('请写在纸上并妥善保管，您将需要它来访问钱包。不要让任何人看到这段助记词，否则将存在巨大的数字资产安全风险。请在下方输入刚才的密码，确认您已经将助记词写在纸上并妥善保管，并完成新钱包的创建。')}}</div>
              <div class="tips_form has_input"><div class="tips_input"><input type="password" v-model="user_password"  placeholder="请输入密码" value="" maxlength=""></div>
                  <div class="tips_form_btn btn-flex"><a href="javascript:;" class="js_tips_btn ":loading="modal_loading" @click="createWallet">{{$t('确定')}}</a>
                      <a href="javascript:;" class="js_tips_btn " @click="closeModal('password_create')">{{$t('关闭')}}</a></div>
              </div>
          </div>
      </Modal>
      <Modal v-model="modal.restore_wallet" width="360" :closable="false" :mask-closable="false">
          <div class="wallet_tips_main">
              <div class="tips_main_title">{{$t('恢复钱包')}}</div>
              <div class="tips_form has_input">
                  <div class="tips_input">
                      <input type="text" v-model="seed" v-bind:placeholder="$t('请输入助记词或私钥')" value="" maxlength=""></div>
                  <div>
                      <i-select v-model="hdpath" slot="append" class="now_select" placeholder="恢复选项">
                          <Option v-for="item in hdpaths" :value="item.value" :key="item.label">{{ $t(item.label) }}</Option>
                      </i-select>
                  </div>
                  <div class="tips_form_btn btn-flex"><a href="javascript:;" class="js_tips_btn " @click="proceedStoreToPassword">{{$t('确定')}}</a>
                      <a href="javascript:;" class="js_tips_btn " @click="closeModal()">{{$t('关闭')}}</a>
                  </div>
              </div>
          </div>
      </Modal>
        <Modal v-model="modal.edit_alias" width="360" :closable="false" :mask-closable="false">
            <div class="wallet_tips_main">
                <div class="tips_main_title">{{$t('编辑钱包备注')}}</div>
                <div class="tips_form has_input">
                    <div class="tips_input">
                        <input type="text" v-model="wallet_alias" v-bind:placeholder="$t('请输入钱包备注')" value="" maxlength="5">
                    </div>
                    <div class="tips_form_btn btn-flex">
                        <a href="javascript:;" class="js_tips_btn " @click="confirmEditAlias">{{$t('确定')}}</a>
                        <a href="javascript:;" class="js_tips_btn " @click="closeModal()">{{$t('关闭')}}</a>
                    </div>
                </div>
            </div>
        </Modal>
        <Modal v-model="modal.watch_wallet" width="360" :closable="false" :mask-closable="false">
            <div class="wallet_tips_main">
                <div class="tips_main_title">{{$t('只读钱包')}}</div>
                <div class="tips_form has_input">
                    <div class="tips_internal">{{$t('您将只能查看余额，而无法向外转账')}}</div>
                    <div class="tips_input"><input type="text" v-model="readonly_address" v-bind:placeholder="$t('请输入钱包地址')" value="" maxlength=""></div>
                    <div class="tips_form_btn btn-flex">
                        <a href="javascript:;" class="js_tips_btn " @click="proceedStoreToAddress">{{$t('确定')}}</a>
                        <a href="javascript:;" class="js_tips_btn " @click="closeModal()">{{$t('关闭')}}</a>
                    </div>
                </div>
            </div>
        </Modal>
      <Modal v-model="modal.password_restore" width="360" :closable="false" :mask-closable="false">
          <div class="wallet_tips_main">
              <div class="tips_main_title">{{$t('恢复钱包')}}</div>
              <div class="tips_form has_input">
                  <div class="tips_input"><input type="password" v-model="user_password" v-bind:placeholder="$t('请输入密码')" value=""  maxlength=""></div>
                  <div class="tips_form_btn btn-flex"><a href="javascript:;" class="js_tips_btn " :loading="modal_loading" @click="restoreWallet">{{$t('确定')}}</a>
                      <a href="javascript:;" class="js_tips_btn " @click="closeModal()">{{$t('关闭')}}</a>
                  </div>
              </div>
          </div>
      </Modal>
        <Modal v-model="modal.delete_wallet" width="460" :closable="false" :mask-closable="false">

            <div class="wallet_tips_main">
                <div class="tips_main_title">{{$t('删除钱包')}}</div>
                <div style="text-align:center" v-if="!current_wallet || !current_wallet.keystore">
                    {{$t('您确定要删除这个钱包吗？删除后您将无法在钱包应用内查看对应的地址的余额。')}}
                </div>

                <div class="tips_main_tips" v-if="seed && seed.length > 0">{{$t('删除钱包之前，请牢记您的助记词，写在纸上并妥善保管')}}</div>
                <div class="tips_main_mnemonic" v-if="download_key_url && download_key_url.length > 0">
                    <div class="tips_mnemonic" v-if="seed && seed.length > 0">{{seed}}</div>
                    <div class="tips_downTips">{{$t('请下载私钥文件，妥善保存。')}}</div>
                    <div class="tips_downbtn">
                        <a :href="download_key_url" download="privatekey.txt" class="downbtn">DownLoad</a>
                    </div>
                </div>
                <div class="tips_form has_input">
                    <div class="tips_internal" v-if="current_wallet && current_wallet.keystore && !(download_key_url && download_key_url.length > 0)">{{$t('验证密码')}}</div>
                    <div class="tips_input" v-if="current_wallet && current_wallet.keystore && !(download_key_url && download_key_url.length > 0)">
                        <input type="password" v-model="user_password"  v-bind:placeholder="$t('请输入密码')" value="" id="wallet_input" maxlength="">
                    </div>
                    <div class="tips_form_btn btn-flex"><a href="javascript:;" class="js_tips_btn " :loading="modal_loading" @click="confirmDeleteWallet()">{{$t('删除')}}</a>
                        <a href="javascript:;" class="js_tips_btn " @click="closeModal()">{{$t('关闭')}}</a>
                    </div>
                </div>
            </div>
        </Modal>
      <Modal v-model="modal.seed_export" width="400" :closable="false" :mask-closable="false">
          <div class="wallet_tips_main">
              <div class="tips_main_title" v-if="!export_private_key">{{$t('请牢记您的助记词，写在纸上并妥善保管')}}</div>
              <div class="tips_emphasis_tips" v-if="!export_private_key">{{seed}}</div>
              <div class="tips_main_title" v-if="export_private_key">{{$t('下载导出的私钥')}}</div>
              <div class="tips_form has_input" v-if="export_private_key">
                <div class="tips_internal">{{$t('下载私钥文件，妥善保存并确保文件的安全，泄露该文件会造成巨大的财产损失')}}</div>
              </div>
              <div class="tips_form">
                  <div class="tips_form_btn btn-flex" v-if="export_private_key"><a :href="download_key_url" download="privatekey.txt" class="js_tips_btn hasdownload">DownLoad</a>
                      <a href="javascript:;" class="js_tips_btn " @click="closeModal()">{{$t('关闭')}}</a>
                  </div>
                  <div class="tips_form_btn" v-if="!export_private_key">
                      <a href="javascript:;" class="js_tips_btn " @click="closeModal()">{{$t('关闭')}}</a>
                  </div>
              </div>
          </div>
      </Modal>
      <Modal v-model="modal.password_export" width="360" :closable="false" :mask-closable="false">
          <!--
        <p slot="header" class="tips_main_title">
            <span>备份钱包</span>
        </p>
        <div class="tips_form has_input">
            <i-input type="password" v-model="user_password" placeholder="请输入密码" style="width: 100%"></i-input>
        </div>
        <div slot="footer" class="tips_form_btn btn-flex">
            <i-button class="js_tips_btn " :loading="modal_loading" @click="exportWallet">确定</i-button>
            <i-button class="js_tips_btn " @click="closeModal()">关闭</i-button>
        </div>-->
          <div class="wallet_tips_main">
              <div class="tips_main_title">{{$t('备份钱包')}}</div>
              <div class="tips_form has_input">
                  <div class="tips_input"><input type="password" v-bind:placeholder="$t('请输入密码')" v-model="user_password"  value="" maxlength=""></div>
                  <div class="tips_form_btn btn-flex">
                      <a href="javascript:;" class="js_tips_btn " :loading="modal_loading" @click="exportWallet">{{$t('确定')}}</a>
                      <a href="javascript:;" class="js_tips_btn " @click="closeModal()">{{$t('关闭')}}</a></div>
              </div>
          </div>
      </Modal>
      <!-- <i-button class="button">帮助</i-button> -->
    </div>

    <div>
      <ul class="wallet-list">
        <li v-for="wallet in wallet_list" :key="wallet.address">
            <div class="list-info">
                <div class="list-lay-info">
                    <div class="list-hash"><span>{{wallet.address}}</span></div>
                    <div class="list-total-transaction">
                        <i class="icon-copy" title="点击复制" @click="processTransaction(wallet)"></i>
                        <div class="total-num">{{$t('交易记录：')}} {{wallet.nonce[0]}}</div>
                    </div>
                </div>
                <div class="list-balance">
                    <span class="b-unit" v-if="wallet.alias.length > 0">({{wallet.alias}})</span>
                    <a href="javascript:;" class="js_addName" @click="editAlias(wallet)" v-if="wallet.alias.length == 0">{{$t('添加地址別名')}}</a>
                    <a href="javascript:;" class="js_addName" @click="editAlias(wallet)" v-if="wallet.alias.length > 0">{{$t('修改別名')}}</a>
                    <span class="token-wrapper" v-for="(token, index) in wallet.balances" v-bind:key="index">
                        <span class="b-num">{{token.balance}}</span><span  class="b-unit">{{token.symbol}}</span>
                    </span>
                </div>
            </div>
            <div class="list-lay-btn">
                <a href="javascript:;" class="js_btn_mnemonic" v-if="wallet && wallet.keystore && wallet.keystore.encSeed && wallet.keystore.encSeed.encStr" @click="proceedExport(wallet)">{{$t('导出助记词')}}</a>
                <a href="javascript:;" class="js_btn_key" v-if="wallet && wallet.keystore" @click="proceedExport(wallet, true)">{{$t('导出私钥')}}</a>
                <a href="javascript:;" class="js_btn_delete" @click="deleteWallet(wallet)">{{$t('删除')}}</a>
            </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import lightwallet from "eth-lightwallet-jh";
import HookedWeb3Provider from "hooked-web3-provider";
import _ from "lodash";
import dbUtils from "../dbUtils";
import reportUtils from "../reportUtils";
import web3Utils from "../web3Utils";

export default {
  data() {
    return {
      modal: {},
      modal_loading: false,
      export_private_key: false,
      download_key_url: "",
      edit_alias:false,
      wallet_alias:"",
      current_wallet: null,
      user_entropy: "",
      user_password: "",
      wallet_list: [],
      seed: "",
      readonly_address:"",
      hdpath:"m/44'/60'/0'/0",
        hdpaths:[
            {"label":"m/44'/60'/0'/0 (兼容MetaMask/imToken)", "value":"m/44'/60'/0'/0"},
            {"label":"m/0'/0'/0' (定制)", "value":"m/0'/0'/0'"},
            {"label":"m/44'/60'/1'/0/0 (imToken自定义)", "value":"m/44'/60'/1'/0/0"},
        ]
    };
  },
  mounted() {
    this.loadWallet();
    setTimeout(this.updateBalances, 15000);
    window.openModal = this.openModal;

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
      this.user_entropy = "";
      this.user_password = "";
      this.seed = "";
    },

    newAddresses(password, keystore) {
      let _this = this,
        address;
      keystore.keyFromPassword(password, function(err, pwDerivedKey) {
        if (err) {
          reportUtils.report(err);
          return;
        }
        keystore.generateNewAddress(pwDerivedKey, 1);
        _.each(keystore.getAddresses(), address => {
          _this.updateWallet(
            _this.getBalance({
              address: address,
              keystore: keystore
            })
          );
        });
      });
    },
    proceedCreateToPassword() {
        var $t = this.$root.$i18n.t;
      if (!this.user_entropy) {
        this.$Message.error($t("输入字符先"));
      } else {
        this.hdpath = "m/44'/60'/0'/0";
        this.openModal("password_create");
        this.seed = lightwallet.keystore.generateRandomSeed(this.user_entropy);
      }
    },
    createWallet() {
      if (this.modal_loading) return;

        var $t = this.$root.$i18n.t;

      if (!this.user_password) {
        this.$Message.error($t("输入密码"));
      }

      let _this = this,
        password = this.user_password;

      this.modal_loading = true;

      lightwallet.keystore.createVault(
        {
          password: password,
          seedPhrase: _this.seed,
          //random salt
          hdPathString: _this.hdpath //originally, this is "m/0'/0'/0'"
        },
        function(err, ks) {
          if (err) {
            reportUtils.report(err);
            this.$Message.error($t("创建失败"));
            return;
          }
          try {
            _this.newAddresses(password, ks);
            web3Utils.setWebProvider(ks);
            setTimeout(_this.loadWallet, 1000);
          } catch (err) {
            reportUtils.report(err);
            _this.$Message.error($t("创建失败"));
          } finally {
            _this.closeModal();
          }
        }
      );
    },
    updateBalances(displayError){
        var _this = this;
        var web3 = web3Utils.getWeb3()
        var $t = this.$root.$i18n.t;
        this.$root.currentView == 'wallet'  && _this.wallet_list && _this.wallet_list.map(function (_wallet) {

            var wallet = _wallet;

            web3.eth.getTransactionCount(wallet.address, function (err, result){
                wallet.nonce[0] = result;
            });

            wallet.balances && _wallet.balances.map(function (_token, i) {
                var token = _token;

                if(token == null || typeof(token) == 'undefined')return;

                if(token.address == "ETH"){
                    web3.eth.getBalance(_wallet.address, function (err, result) {
                        if (err) {
                            reportUtils.report(e);
                            if(displayError)_this.$Message.error($t("获取余额失败"));
                            return
                        }
                        //console.log(_wallet.address);
                        token.balance = web3Utils.toRealAmount(result);
                        wallet.balances[i] = token;
                    })
                }
                else{

                    let
                        erc20tokens = web3Utils.getErc20Tokens(),
                        erc20token = _.find(erc20tokens, {
                            address: token.address
                        });
                    var contract = erc20token.contract;
                    token.decimals = erc20token.decimals;

                    contract && contract.balanceOf("" + _wallet.address, function (err, balance) {
                        if(err){
                            reportUtils.report(e);
                            if(displayError)_this.$Message.error($t("获取余额失败"));
                            return
                        }
                        //console.log(_wallet.address+", "+balance.toString());
                        token.balance = web3Utils.toRealAmount(
                            balance,
                            token.decimals
                        )
                        wallet.balances[i] = token;
                    });
                }
            })
        });

        if(displayError){
            return
        }
        else{
            setTimeout(function() { _this.updateBalances() }, 10000);
        }
    }
    ,
    getBalance(wallet) {
      web3Utils.setWebProvider(wallet.keystore);

      var _this = this,
        web3 = web3Utils.getWeb3(),
        erc20tokens = web3Utils.getErc20Tokens(),
        _wallet = _.defaults({}, wallet),
        _token = {
          address: "ETH",
          symbol: "ETH"
        };
        var $t = this.$root.$i18n.t;

      _wallet.balances = [];
      _wallet.nonce = []

      try {

          web3.eth.getTransactionCount(_wallet.address, function (err, result){
              _wallet.nonce.push(result);
          });

          web3.eth.getBalance(_wallet.address, function (err, result) {
              if(err){
                  reportUtils.report(err);
                  _this.$Message.error($t("获取余额失败"));
                  return
              }
              _token.balance = web3Utils.toRealAmount(result);
              _wallet.balances.push(_token);

              _.forEach(erc20tokens, (token, index) => {
                  var _token = {
                      address: token.address,
                      symbol: token.symbol,
                      decimals: token.decimals,
                      balance: "...",
                      //contract: token.contract
                  };
                  _wallet.balances.push(_token);

                  token.contract.balanceOf("" + _wallet.address, function (err, balance) {
                      if(err){
                          reportUtils.report(err);
                          _this.$Message.error($t("获取余额失败"));
                          return
                      }

                      var _token = _wallet.balances[index+1];
                      _token.balance =web3Utils.toRealAmount(
                              balance,
                              token.decimals
                          );

                      _wallet.balances[index+1] = _token;
                  });
              });
          });

          this.updateWallet(wallet);
      }
      catch (e) {
          reportUtils.report(e);
          _this.$Message.error($t("获取余额失败"));
      }
      return _.defaults({}, wallet, _wallet);
    },
    proceedStoreToPassword() {
      if (!this.seed) {
        this.$Message.error("输入seed");
      } else {
          this.hdpath = "m/44'/60'/0'/0";
        this.openModal("password_restore");
      }
    },
      proceedStoreToAddress() {
        var web3 = web3Utils.getWeb3();
        var address = this.readonly_address;
        var _this = this;
          var $t = this.$root.$i18n.t;
        try {

            if (web3.isAddress(address)) {
                _this.updateWallet(
                    _this.getBalance({
                        address: address,
                        keystore: null
                    })
                );
                _this.loadWallet();
                _this.closeModal();
                _this.readonly_address = "";
            }
            else {
                _this.$Message.error($t("错误的地址"));
            }
        }catch(err){
            _this.$Message.error($t("错误的地址"));
        }
      },
      editAlias(wallet){
          this.current_wallet = wallet;
          this.wallet_alias = this.current_wallet.alias;
          this.openModal("edit_alias");
      },
      confirmEditAlias(){
          this.current_wallet.alias = this.wallet_alias;
          this.closeModal();
          this.updateWallet(this.current_wallet);
      },
    restoreWallet() {
      var _this = this,
        password = this.user_password,
        seed = this.seed;
        var $t = this.$root.$i18n.t;

      this.modal_loading = true;

      var seedValid = lightwallet.keystore.isSeedValid(seed);
      var privValid = lightwallet.keystore.isPrivateKeyValid(seed);
      if (seedValid || privValid) {
        lightwallet.keystore.createVault(
          {
            password: password,
            seedPhrase: seed,
            //random salt
            hdPathString: _this.hdpath
          },
          function(err, ks) {
            if (err) {
              window.location.reload();
            }
            try {
              _this.newAddresses(password, ks);
              web3Utils.setWebProvider(ks);
              setTimeout(_this.loadWallet, 1000);
            } catch (e) {
              reportUtils.report(e);
              _this.$Message.error($t("恢复失败"));
            } finally {
              _this.closeModal();
            }
          }
        );
      } else {
        _this.$Message.error($t("无效的Seed"));
        _this.closeModal();
      }
    },
    removeWallet(wallet){
        let index = _.findIndex(this.wallet_list, ["address", wallet.address]);
        if (index != -1) {
            this.wallet_list.splice(index, 1);

            var addresses = this.wallet_list.map(function(x) {
                return x.address;
            })
            dbUtils.set(
                "address_list",
                addresses.join(" ")
            );
        }
        dbUtils.remove(wallet.address);
        dbUtils.remove(wallet.address+"_alias");
        this.$root.globalData.wallet_list = this.wallet_list;
    },
    updateWallet(wallet) {
      let index = _.findIndex(this.wallet_list, ["address", wallet.address]);
      if (index != -1) {
        // lightwallet.keystore.upgradeOldSerialized(wallet.keystore, password, function(keystore){
        //   wallet.keystore = keystore;
        // })
          if(typeof(wallet.alias)=='undefined' && wallet.alias == null){
              wallet.alias = "";
          }
        this.wallet_list[index] = wallet;
        dbUtils.set(wallet.address+"_alias", wallet.alias);
      } else {
        this.wallet_list.push(wallet);
        var addresses = dbUtils.get("address_list");

        if(addresses.indexOf(wallet.address) < 0){
            dbUtils.set(
                "address_list",
                [addresses, wallet.address].join(" ")
            );
        }
        dbUtils.set(wallet.address+"_alias", wallet.alias);
      }
      if(wallet.keystore)
          dbUtils.set(wallet.address, wallet.keystore.serialize());
      this.$root.globalData.wallet_list = this.wallet_list;
    },
    loadWallet() {
      let _this = this;
      this.wallet_list = this.$root.globalData.wallet_list.map(wallet => {
        return _this.getBalance(wallet);
      });
    },
    proceedExport(wallet, exportPrivateKey) {
      this.export_private_key = exportPrivateKey;
      this.openModal("password_export");
      this.current_wallet = wallet;//_.cloneDeep(wallet);
    },
    exportWallet() {
      let _this = this,
        password = this.user_password,
        keystore = undefined

        var $t = this.$root.$i18n.t;
        //_.find(this.wallet_list, this.current_wallet).keystore; //_.find causes problems in offline mode
        var signingAddress = "";
        for(var i=0;i<this.wallet_list.length;i++){
          if(this.wallet_list[i].address == this.current_wallet.address){
              keystore = this.wallet_list[i].keystore
              signingAddress = this.wallet_list[i].address;
          }
        }

      keystore.keyFromPassword(password, function(err, pwDerivedKey) {
        if (err) {
          reportUtils.report(err);
          _this.$Message.error(err);
          return;
        }
        try {
          _this.seed = keystore.getSeed(pwDerivedKey);
          if(_this.export_private_key){
              var privKey = keystore.exportPrivateKey(signingAddress, pwDerivedKey);
              _this.download_key_url = "data:text/txt,"+privKey.toString();
          }
          _this.openModal("seed_export");
        } catch (e) {
          _this.$Message.error($t("导出失败"));
        }
      });
    },
      deleteWallet(wallet) {
        this.download_key_url = "";
        this.seed = "";
        this.openModal("delete_wallet");
        this.current_wallet = wallet;//_.cloneDeep(wallet);
      },
      confirmDeleteWallet(){
        var wallet = this.current_wallet;
        let _this = this,
             password = _this.user_password,
             keystore = _this.current_wallet.keystore,
             signingAddress = _this.current_wallet.address;

          var $t = this.$root.$i18n.t;

        if(wallet.keystore){

            if(_this.download_key_url && _this.download_key_url.length > 0){
                this.removeWallet(wallet);
                _this.closeModal();
            }
            else{
                _this.modal_loading = true;
                keystore.keyFromPassword(password, function(err, pwDerivedKey) {
                    _this.modal_loading = false;
                    if (err) {
                        reportUtils.report(err);
                        _this.$Message.error(err);
                        _this.closeModal();
                        return;
                    }
                    try {
                        _this.seed = keystore.getSeed(pwDerivedKey);
                        var privKey = keystore.exportPrivateKey(signingAddress, pwDerivedKey);
                        _this.download_key_url = "data:text/txt,"+privKey.toString();
                    } catch (e) {
                        _this.$Message.error($t("密码错误"));
                        _this.closeModal();
                    }
                });
            }
        }
        else{
            //只读钱包，直接删除
            this.removeWallet(wallet);
            _this.closeModal();
        }
      },
    showtooltip(tip, e){

        var $t = this.$root.$i18n.t;
      var tooltip = document.createElement('div')
      tooltip.style.cssText =
          'position:absolute; background:black; color:white; padding:4px;z-index:10000;'
          + 'border-radius:2px; font-size:12px;box-shadow:3px 3px 3px rgba(0,0,0,.4);'
          + 'opacity:0;transition:opacity 0.3s'
      tooltip.innerHTML = tip || $t('已复制!')
      document.body.appendChild(tooltip)

        var evt = e || event

        tooltip.style.left = evt.pageX - 10 + 'px'
        tooltip.style.top = evt.pageY + 15 + 'px'
        tooltip.style.opacity = 1
        setTimeout(function(){
            tooltip.style.opacity = 0
            document.body.removeChild(tooltip)
        }, 500)
    },
    processTransaction(wallet) {
      //this.$root.globalData.current_wallet = _.cloneDeep(wallet);

        var $t = this.$root.$i18n.t;

        function selectElementText(el){
            var range = document.createRange() // create new range object
            range.selectNodeContents(el) // set range to encompass desired element text
            var selection = window.getSelection() // get Selection object from currently user selected text
            selection.removeAllRanges() // unselect any user selected text (if any)
            selection.addRange(range) // add range to Selection object to select it
        }

        selectElementText(event.target.parentElement.parentElement.children[0]);
        document.execCommand("copy");

        this.showtooltip($t("复制成功!"))
        var selection = window.getSelection() // get Selection object from currently user selected text
        selection.removeAllRanges() // unselect any user selected text (if any)
      //window.location.hash = "send";
    }
  }
};
</script>

