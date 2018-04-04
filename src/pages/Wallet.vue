<template>
  <div>
    <div class="btn-wrapper">
      <Button class="button" @click="openModal('create_wallet')">创建新钱包</Button>
      <Modal v-model="modal.create_wallet" width="360" :closable="false" :mask-closable="false">
        <p slot="header" style="text-align:center">
            <span>创建新钱包</span>
        </p>
        <div style="text-align:center">
            <i-input v-model="user_entropy" placeholder="请输入一串随机的字符串，以随机生成助记词" style="width: 100%"></i-input>
            <br/>
            <div style="display:flex;">
            <div style="width:300px">
            <i-select v-model="hdpath" slot="append" placeholder="创建选项">
                <Option v-for="item in hdpaths" :value="item.value" :key="item.label">{{ item.label }}</Option>
            </i-select>
            </div>
            <Poptip placement="bottom-end" trigger="hover">
                <span style="line-height:36px; ">&nbsp;<img src="../assets/help_b.png" style="width:16px;height: 16px;"/></span>
                <div slot="content" style="color: #000; width: 300px; height: 100px; overflow: visible; white-space: normal; text-align: left;" class="wordwrap">
                    <p class="wordwrap">默认情况下，您应该选择 m/44'/60'/0'/0 (兼容MetaMask/imToken)，然而，其他钱包应用可能使用不同的选项，如果您需要和其他钱包应用兼容，您应该咨询其他钱包的开发者，以确保您在其他钱包应用中恢复的时候能恢复出正确的钱包。</p>
                </div>
            </Poptip>
        </div>
        </div>
        <div slot="footer" style="text-align:center;">
            <i-button class="button" @click="proceedCreateToPassword">创建</i-button>
            <i-button class="button" @click="closeModal()">关闭</i-button>
        </div>
      </Modal>
      <Modal v-model="modal.password_create" width="360" :closable="false" :mask-closable="false">
        <div style="text-align:center">
            <p style="text-align:left">你的新钱包助记词是： "<span class="danger" v-text="seed"></span>"。温馨提示：请写在纸上并妥善保管，您将需要它来访问钱包。不要让任何人看到这段助记词，否则将存在巨大的数字资产安全风险。确认您已经将助记词写在纸上并妥善保管，并在下方输入一个密码，完成新钱包的创建并牢记这个密码，它将用以保护您的私钥。
            </p>
            <i-input type="password" v-model="user_password" placeholder="请输入密码" style="width: 100%"></i-input>
        </div>
        <div slot="footer" style="text-align:center;">
            <i-button class="button" :loading="modal_loading" @click="createWallet">确定</i-button>
            <i-button class="button" @click="closeModal('password_create')">关闭</i-button>
        </div>
      </Modal>
      <Modal v-model="modal.restore_wallet" width="360" :closable="false" :mask-closable="false">
        <p slot="header" style="text-align:center">
            <span>恢复钱包</span>
        </p>
        <div style="text-align:center">
            <i-input v-model="seed" placeholder="请输入助记词或私钥" style="width: 100%"></i-input>
            <br/>
            <div style="display:flex;">
            <div style="width:300px">
            <i-select v-model="hdpath" slot="append" placeholder="恢复选项">
                <Option v-for="item in hdpaths" :value="item.value" :key="item.label">{{ item.label }}</Option>
            </i-select>
            </div>
            <Poptip placement="bottom-end" trigger="hover">
                <span style="line-height:36px; ">&nbsp;<img src="../assets/help_b.png" style="width:16px;height: 16px;"/></span>
                <div slot="content" style="color: #000;width:360px;height:100px; white-space: normal; text-align: left;" class="wordwrap">
                    <p class="wordwrap">默认情况下，您应该选择 m/44'/60'/0'/0 (兼容MetaMask/imToken)，然而，其他钱包应用可能使用不同的选项，如果您需要在其他钱包中恢复，请确保该选项与其他钱包应用中的值相兼容。</p>
                </div>
            </Poptip>
            </div>
        </div>
        <div slot="footer" style="text-align:center;">
            <i-button class="button" @click="proceedStoreToPassword">确定</i-button>
            <i-button class="button" @click="closeModal()">关闭</i-button>
        </div>
      </Modal>
        <Modal v-model="modal.edit_alias" width="360" :closable="false" :mask-closable="false">
            <p slot="header" style="text-align:center">
                <span>编辑钱包备注</span>
            </p>
            <div style="text-align:center">
                <i-input v-model="wallet_alias" placeholder="请输入钱包备注" style="width: 100%" :maxlength="5"></i-input>
            </div>
            <div slot="footer" style="text-align:center;">
                <i-button class="button" @click="confirmEditAlias">确定</i-button>
                <i-button class="button" @click="closeModal()">关闭</i-button>
            </div>
        </Modal>
        <Modal v-model="modal.watch_wallet" width="360" :closable="false" :mask-closable="false">
            <p slot="header" style="text-align:center">
                <span>只读钱包</span>
            </p>
            <div style="text-align:center">
                <span>您将只能查看余额，而无法向外转账</span>
                <i-input v-model="readonly_address" placeholder="请输入钱包地址" style="width: 100%"></i-input>
            </div>
            <div slot="footer" style="text-align:center;">
                <i-button class="button" @click="proceedStoreToAddress">确定</i-button>
                <i-button class="button" @click="closeModal()">关闭</i-button>
            </div>
        </Modal>
      <Modal v-model="modal.password_restore" width="360" :closable="false" :mask-closable="false">
        <p slot="header" style="text-align:center">
            <span>恢复钱包</span>
        </p>
        <div style="text-align:center">
            <i-input type="password" v-model="user_password" placeholder="请输入密码" style="width: 100%"></i-input>
        </div>
        <div slot="footer" style="text-align:center;">
            <i-button class="button" :loading="modal_loading" @click="restoreWallet">确定</i-button>
            <i-button class="button" @click="closeModal()">关闭</i-button>
        </div>
      </Modal>
        <Modal v-model="modal.delete_wallet" width="460" :closable="false" :mask-closable="false">
            <p slot="header" style="text-align:center">
                <span>删除钱包</span>
            </p>
            <div style="text-align:center" v-if="current_wallet && current_wallet.keystore && !(download_key_url && download_key_url.length > 0)">
                验证密码: <i-input type="password" v-model="user_password" placeholder="请输入密码" style="width: 100%"></i-input>
            </div>
            <div style="text-align:center" v-if="!current_wallet || !current_wallet.keystore">
                您确定要删除这个钱包吗？删除后您将无法在钱包应用内查看对应的地址的余额。
            </div>
            <p slot="header" style="text-align:center" v-if="seed && seed.length > 0">
                <span>删除钱包之前，请牢记您的助记词，写在纸上并妥善保管</span>
            </p>
            <div style="text-align:center">
                <p class="seed-export" v-if="seed && seed.length > 0">{{seed}}</p>
                <p v-if="!(seed && seed.length > 0) && download_key_url && download_key_url.length > 0">无法备份助记词，因为您之前通过私钥恢复了钱包。</p>
                <p v-if="download_key_url && download_key_url.length > 0"><a :href="download_key_url" download="privatekey.txt">请<span style="color:red">点击这里下载私钥文件</span>，妥善保存。</a></p>
            </div>
            <div slot="footer" style="text-align:center;">
                <i-button class="button" :loading="modal_loading" @click="confirmDeleteWallet()">确定删除</i-button>
                <i-button class="button" @click="closeModal()">关闭</i-button>
            </div>
        </Modal>
      <Modal v-model="modal.seed_export" width="360" :closable="false" :mask-closable="false">
        <p slot="header" style="text-align:center">
            <span v-if="!export_private_key">请牢记您的助记词，写在纸上并妥善保管</span>
            <span v-if="export_private_key">下载导出的私钥</span>
        </p>
        <div style="text-align:center">
          <p class="seed-export" v-if="!export_private_key">{{seed}}</p>
            <p class="" v-if="export_private_key"><a :href="download_key_url" download="privatekey.txt">点击这里下载私钥文件，妥善保存并请确保该文件的安全，泄露该文件会造成巨大财产损失</a></p>
        </div>
        <div slot="footer" style="text-align:center;">
            <i-button class="button" @click="closeModal()">关闭</i-button>
        </div>
      </Modal>
      <Modal v-model="modal.password_export" width="360" :closable="false" :mask-closable="false">
        <p slot="header" style="text-align:center">
            <span>备份钱包</span>
        </p>
        <div style="text-align:cente">
            <i-input type="password" v-model="user_password" placeholder="请输入密码" style="width: 100%"></i-input>
        </div>
        <div slot="footer" style="text-align:center;">
            <i-button class="button" :loading="modal_loading" @click="exportWallet">确定</i-button>
            <i-button class="button" @click="closeModal()">关闭</i-button>
        </div>
      </Modal>
      <i-button class="button" @click="openModal('restore_wallet')">恢复钱包</i-button>
      <i-button class="button" @click="openModal('watch_wallet')">只读钱包</i-button>
      <!-- <i-button class="button">帮助</i-button> -->
    </div>r
    <div class="filter-wrapper">
    </div>
    <div class="content-wrapper">
      <ul class="wallet-list">
        <li class="wallet-item" v-for="wallet in wallet_list" :key="wallet.address">
          <div class="wallet-wrapper">
            <h1 class="wallet-address">
              <i class="icon iconfont icon-key"></i>
              <span v-text="wallet.address"></span>
                <img src="../assets/copy.png" class="icon icon-address-copy"  @click="processTransaction(wallet)"/>
                <span style="font-size: 12px;">总交易数:{{wallet.nonce[0]}}</span>
              <p>
               <span class="token-wrapper">
                <span v-if="wallet.alias.length > 0">({{wallet.alias}})</span>
                <button class="token-wrapper-button" @click="editAlias(wallet)" v-if="wallet.alias.length == 0">添加地址别名</button>
                <button class="token-wrapper-button" @click="editAlias(wallet)" v-if="wallet.alias.length > 0">修改别名</button>
               </span>
              <span class="token-wrapper" v-for="(token, index) in wallet.balances" v-bind:key="index">
                <span>{{token.balance}} {{token.symbol}}</span>
              </span>
              </p>
            </h1>
          </div>
          <button class="button" v-if="wallet && wallet.keystore && wallet.keystore.encSeed && wallet.keystore.encSeed.encStr" @click="proceedExport(wallet)">导出助记词</button>
          <button class="button" v-if="wallet && wallet.keystore" @click="proceedExport(wallet, true)">导出私钥</button>
          <button class="button" @click="deleteWallet(wallet)">删除</button>
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
    setTimeout(this.updateBalances, 15000)
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
      if (!this.user_entropy) {
        this.$Message.error("输入字符先");
      } else {
        this.openModal("password_create");
        this.seed = lightwallet.keystore.generateRandomSeed(this.user_entropy);
      }
    },
    createWallet() {
      if (this.modal_loading) return;

      if (!this.user_password) {
        this.$Message.error("输入密码");
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
            this.$Message.error("创建失败");
            return;
          }
          try {
            _this.newAddresses(password, ks);
            web3Utils.setWebProvider(ks);
          } catch (err) {
            reportUtils.report(err);
            _this.$Message.error("创建失败");
          } finally {
            _this.closeModal();
          }
        }
      );
    },
    updateBalances(displayError){
        var _this = this;
        var web3 = web3Utils.getWeb3()
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
                            if(displayError)_this.$Message.error("获取余额失败");
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
                            if(displayError)_this.$Message.error("获取余额失败");
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

      _wallet.balances = [];
      _wallet.nonce = []

      try {

          web3.eth.getTransactionCount(_wallet.address, function (err, result){
              _wallet.nonce.push(result);
          });

          web3.eth.getBalance(_wallet.address, function (err, result) {
              if(err){
                  reportUtils.report(err);
                  _this.$Message.error("获取余额失败");
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
                          _this.$Message.error("获取余额失败");
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
          _this.$Message.error("获取余额失败");
      }
      return _.defaults({}, wallet, _wallet);
    },
    proceedStoreToPassword() {
      if (!this.seed) {
        this.$Message.error("输入seed");
      } else {
        this.openModal("password_restore");
      }
    },
      proceedStoreToAddress() {
        var web3 = web3Utils.getWeb3();
        var address = this.readonly_address;
        var _this = this;
        try {

            if (web3.isAddress(address)) {
                _this.updateWallet(
                    _this.getBalance({
                        address: "0x"+address,
                        keystore: null
                    })
                );
                _this.loadWallet();
                _this.closeModal();
                _this.readonly_address = "";
            }
            else {
                _this.$Message.error("错误的地址");
            }
        }catch(err){
            _this.$Message.error("错误的地址");
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
              _this.$Message.error("恢复失败");
            } finally {
              _this.closeModal();
            }
          }
        );
      } else {
        _this.$Message.error("无效的Seed");
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
          _this.$Message.error("导出失败");
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
                        _this.$Message.error("密码错误");
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

      var tooltip = document.createElement('div')
      tooltip.style.cssText =
          'position:absolute; background:black; color:white; padding:4px;z-index:10000;'
          + 'border-radius:2px; font-size:12px;box-shadow:3px 3px 3px rgba(0,0,0,.4);'
          + 'opacity:0;transition:opacity 0.3s'
      tooltip.innerHTML = tip || '已复制!'
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

        function selectElementText(el){
            var range = document.createRange() // create new range object
            range.selectNodeContents(el) // set range to encompass desired element text
            var selection = window.getSelection() // get Selection object from currently user selected text
            selection.removeAllRanges() // unselect any user selected text (if any)
            selection.addRange(range) // add range to Selection object to select it
        }

        selectElementText(event.target.parentElement.children[1]);
        document.execCommand("copy");

        this.showtooltip("复制成功!")
      //window.location.hash = "send";
    }
  }
};
</script>

<style lang="less" scoped>
.seed-export {
  font-size: 30px;
  color: red;
}

.token-wrapper {
  margin-right: 10px;
  font-size: 14px;
  color: #ffffff;
}
.token-wrapper-button{
    margin-right: 10px;
    font-size: 14px;
    color: #ffffff;
    background: transparent;
    border: none;
}
.wallet-list {
  display: flex;
  flex-direction: column;
  .wallet-item {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    height: 70px;
    padding: 0 20px;
    background: rgba(46, 46, 46, 1);
    margin-bottom: 10px;
    border: 1px solid rgb(204, 204, 204);
    .wallet-wrapper {
      flex-grow: 1;
      .wallet-address {
        color: #ccc;
        font-size: 20px;
      }
    }
      .icon-address-copy{
          width:20px;
          height:20px;
          margin-top:5px;
      }
    .export {
      text-align: right;
      width: 120px;
      flex-direction: row;
      font-size: 12px;
      color: #fff;
      //visibility: hidden;
      cursor: pointer;
    }
    &:hover,
    &.active {
      background: rgb(46, 46, 46);
      border: 1px solid #fff;
      .wallet-name {
        color: #efefef;
      }
      .wallet-address {
        color: #fff;
      }
    }
    &:hover {
      .export {
        visibility: visible;
        color: #fff;
      }
    }
  }
    /* Source: http://snipplr.com/view/10979/css-cross-browser-word-wrap */
    .wordwrap {
        white-space: pre-wrap;      /* CSS3 */
        white-space: -moz-pre-wrap; /* Firefox */
        white-space: -pre-wrap;     /* Opera <7 */
        white-space: -o-pre-wrap;   /* Opera 7 */
        word-wrap: break-word;      /* IE */
        white-space: normal;
        text-align: left;
    }
}
</style>
