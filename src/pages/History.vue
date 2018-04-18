
<template>
  <div class="history-main">
    <div>
        <div class="his-lay-search">
            <div class="his-search-form">
                <div class="form-item" v-if="0"><input v-model="keyword" type="text" v-bind:placeholder="$t('地址')"></div>
                <i-select v-model="address" slot="append" class="form-item" v-bind:placeholder="$t('选择钱包')" @on-change="onWalletChange">
                    <Option v-for="item in wallet_list" :value="item.address" :key="item.address">{{ item.address+(item.alias.length>0?"("+item.alias+")":"") }}</Option>
                </i-select>
                </div>
            </div>
            <div class="his-search-btn">
                <a href="javascript:;" class="js_search" @click="search">{{$t('搜索')}}</a><a href="javascript:;" @click="filter(keyword)" v-if="0">{{$t('在结果中搜索')}}</a>
                <a href="javascript:;" @click="openExternal(explorer_address_link)" v-if="explorer_address_link.length > 0">{{$t('浏览器')}}</a>
            </div>
            <div class="his-search-btn" v-if="pageCount > 1">
                <MultiPage :total="total" @on-change="refreshSearch" simple size="small" pageSize="25"></MultiPage>
            </div>
        </div>
        <ul class="his-lay-list">
            <li class="list-item" v-for="transaction in filter_list" v-bind:key="transaction.hash">
                <div class="item-hash">
                    <div>{{transaction.hash}}</div>
                    <div class="item-hash-flow">
                        <p @click="openAddress(transaction.from)">{{transaction.from}}</p>
                        <p class="flow-arrow">=></p>
                        <p @click="openAddress(transaction.realto)">{{transaction.to?transaction.realto:$t('创建合约')+'('+transaction.contractAddress+')'}}</p>
                    </div>
                </div>
                <div class="item-info">
                    <div class="item-amount">{{transaction.amount}}&nbsp;{{transaction.symbol}}</div>
                    <div class="item-time">{{transaction.timeStamp | formatDate}}</div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import axios from "axios";
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import MainLayout from "../layouts/MainLayout.vue";
import MultiPage from "../components/MultiPage.vue"
import web3Utils from "../web3Utils";
const {shell} = require('electron');

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
      filter_list:[],
      page: 0,
      pageCount:0,
      total:0,
    };
  },
  mounted() {
    this.wallet_list = this.$root.globalData.wallet_list;
  },
  filters: {
    formatDate: function(timestamp) {
      let newDate = new Date();
      newDate.setTime(timestamp);
      var locale = window.i18n.locale;
      if(locale == 'EN'){
          locale = 'en-US';
      }else if(locale == 'TW'){
          locale = 'zh-TW';
      }else if(locale == 'CN'){
          locale = 'zh-CN';
      }
      return newDate.toLocaleString(locale);
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
        bodyFormData.set('pageIndex', _this.page);

      
      axios({
            method: 'post',
                url: requestUrl,
                data: bodyFormData,
                config: { headers: {'Content-Type': 'multipart/form-data' }}
        })
        .then(response => {
          _this.transaction_list = response.data && response.data.data?response.data.data.list:[];
          if (_this.transaction_list && _this.transaction_list.length > 0){
            if (_this.transaction_list[0].bcTransferDOList){
                _this.transaction_list = _this.transaction_list[0].bcTransferDOList;
                _this.pageCount = response.data.data.pageCount;
                _this.total = response.data.data.size;
            }
          }

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
     refreshSearch(page){
        var _this = this;
       _this.page = page;
       _this.loadHistory(_this.address);

     },
    onWalletChange(address) {
      let _this = this,
        web3 = web3Utils.getWeb3(),
        current_wallet = _.find(this.$root.globalData.wallet_list, ["address", address]);
        _this.explorer_address_link = "https://explorer.cpscoin.org/address/"+address;
      web3Utils.setWebProvider(current_wallet.keystore);
    },
    search(){
      this.page = 0;
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
        shell.openExternal(explorer_address_link)
    },
    openTransaction(txHash){
        var link = "https://explorer.cpscoin.org/tx/"+txHash;
        shell.openExternal(link);
    },
    openAddress(address){
        if(!address || address.length == 0)return;
        var link = "https://explorer.cpscoin.org/address/"+address;
        shell.openExternal(link);
     }
  }
};
</script>

<style lang="less" scoped>
    .his-search-btn{
        line-height: 16px;
    }
</style>
