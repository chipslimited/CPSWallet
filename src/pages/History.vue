<template>
  <div>
    <!-- <div class="btn-wrapper">
      <Button class="button" @click="changeNet('TEST')" v-show="net==='PROD'">切换到测试网</Button>
      <Button class="button" @click="changeNet('PROD')" v-show="net==='TEST'">切换到正式网</Button>
    </div> -->
    <div class="filter-wrapper">
      <i-input v-model="keyword" class="keyword" placeholder="地址">
        <i-select v-model="address" slot="append" class="transfer-wallet-selector" placeholder="选择钱包" @on-change="onWalletChange">
            <Option v-for="item in wallet_list" :value="item.address" :key="item.address">{{ item.address }}</Option>
        </i-select>
      </i-input>
      <Button class="button filter-button" @click="search">搜索</Button>
      <Button class="button filter-button" @click="filter(keyword)" :disabled="filter_list.length>0?false:true">在结果中搜索</Button>
      <button class="button filter-button" @click="openExternal(explorer_address_link)" v-if="explorer_address_link.length > 0">浏览器</button>
    </div>
    <div class="content-wrapper">
      <ul class="transaction-list">
        <li class="transaction-item" v-for="transaction in filter_list" v-bind:key="transaction.hash">
          <div class="transaction-wrapper">
            <h3 class="transaction-title" v-text="transaction.hash" @click="openTransaction(transaction.hash)"></h3>
            <p class="transaction-sub">
              <span @click="openAddress(transaction.from)" v-text="transaction.from"></span> => <span @click="openAddress(transaction.realto)" v-text="transaction.to?transaction.realto:'创建合约('+transaction.contractAddress+')'"></span>
            </p>
          </div>
          <div class="transaction-token-wrapper">
            <span class="token-amount" v-text="transaction.amount"></span>
            <span class="token">{{transaction.symbol}}</span>
          </div>
          <div class="transaction-time-wrapper">{{transaction.timeStamp | formatDate}}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import MainLayout from "../layouts/MainLayout.vue";
import web3Utils from "../web3Utils";
//const {shell} = require('electron');

export default {
  data() {
    return {
      net:'PROD',
      wallet_list: [],
      current_wallet: {},
      keyword: "",
      address: "",
      explorer_address_link:"",
      transaction_list: [],
      filter_list:[]
    };
  },
  mounted() {
    this.wallet_list = this.$root.globalData.wallet_list;
  },
  filters: {
    formatDate: function(timestamp) {
      let newDate = new Date();
      newDate.setTime(timestamp);
      return newDate.toLocaleString();
    },
    translateAddressToToken: function(address) {
      if(!address) return 'ETH';
      let erc20token = _.find(web3Utils.getErc20Tokens(), {
          address: address
        });
      return erc20token?erc20token.symbol:'未知';
    }
  },
  methods: {
    changeNet(net){
      var _this = this;
      this.$Loading.start();
      setTimeout(()=>{
        _this.$Loading.finish();
        _this.net = net;
      },5);
    },
    toRealAmount : web3Utils.toRealAmount,
    loadHistory(address) {
      let _this = this,
          requestUrl = `${web3Utils.getHttpBaseUrl(this.net)}/getAccountTransactions`;
      this.$Loading.start();

        var bodyFormData = new FormData();
        bodyFormData.set('address', address);
        bodyFormData.set('cntPerPage', 25);
        bodyFormData.set('pageIndex', 0);

      
      axios({
            method: 'post',
                url: requestUrl,
                data: bodyFormData,
                config: { headers: {'Content-Type': 'multipart/form-data' }}
        })
        .then(response => {
          _this.transaction_list = response.data && response.data.data?response.data.data.list:[];
          if(_this.transaction_list && _this.transaction_list.length > 0){
              _this.transaction_list = _this.transaction_list.map(function (txn) {
                  txn.from = txn.fromAddr;
                  txn.to = txn.toAddr;
                  txn.realto = txn.toAddr;
                  txn.amount = _this.toRealAmount(txn.value, 8);
                  txn.symbol = 'CPS';
                  txn.timeStamp = txn.blockTimestamp;
                  return txn;
              });
          }
          _this.filter_list = _this.transaction_list;
          _this.$Loading.finish();
        })
        .catch(error => {
          _this.$Message.error(error);
          _this.$Loading.error();
        });
    },
    onWalletChange(address) {
      let _this = this,
        web3 = web3Utils.getWeb3(),
        current_wallet = _.find(this.$root.globalData.wallet_list, ["address", address]);
        _this.explorer_address_link = "https://explorer.cpscoin.org/address/"+address;
      web3Utils.setWebProvider(current_wallet.keystore);
    },
    search(){
      this.loadHistory(this.address);
      // this.loadHistory("0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a");
    },
    filter(keyword) {
      if(keyword){
        this.filter_list = this.transaction_list.filter(transaction => {
          return transaction.from === keyword || transaction.to === keyword;
        })
      }else{
        this.filter_list = [].concat(this.transaction_list);
      }
    },
    openExternal(explorer_address_link){
        //shell.openExternal(explorer_address_link)
        window.open(explorer_address_link, "_blank");
    },
    openTransaction(txHash){
        var link = "https://explorer.cpscoin.org/tx/"+txHash;
        //shell.openExternal(link);
        window.open(link, "_blank");
    },
    openAddress(address){
        if(!address || address.length == 0)return;
        var link = "https://explorer.cpscoin.org/address/"+address;
        //shell.openExternal(link);
        window.open(link, "_blank");
     }
  }
};
</script>

<style lang="less" scoped>
.filter-wrapper {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
}
.keyword {
  width: 620px;
}
.transfer-wallet-selector {
  width: 320px;
}
.filter-button {
  height: 34px;
  margin-left: 10px;
}
.transaction-list {
  display: flex;
  flex-direction: column;
  .transaction-item {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    height: 70px;
    margin-bottom: 10px;
    color: #ccc;
    border: 1px solid #999;
    border-left: 5px solid #ccc;
    background: rgb(90, 84, 110);
    padding: 0 10px;
    &:nth-child(2n) {
      background: rgb(177, 156, 171);
    }
    &:hover {
      border: 1px solid #fff;
      border-left: 5px solid #fff;
      color: #fff;
    }
    .transaction-wrapper {
      flex-grow: 1;
      .transaction-title {
        display: inline-flex;
        font-size: 14px;
      }
      .transaction-sub {
        color: #eee;
        font-size: 12px;
        margin-top: 10px;
      }
    }
    .transaction-token-wrapper {
      font-size: 14px;
      align-content: left;
    }
    .transaction-time-wrapper {
      width: 150px;
      font-size: 12px;
      padding: 0 0 0 10px;
    }
  }
}
</style>
