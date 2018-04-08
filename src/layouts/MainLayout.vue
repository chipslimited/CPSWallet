<template>
    <div class="wallet-body">
    <div class="lay-left">
        <ul class="menu-list">
            <li><v-link href="/wallet" v-bind:class="{'active': this.$root.currentView == 'wallet','': this.$root.currentView != 'wallet'}"><i class="icon-wallet"></i><span>钱包</span></v-link></li>
            <li><v-link href="/send"  v-bind:class="{'active': this.$root.currentView == 'send','': this.$root.currentView != 'send'}"><i class="icon-send"></i><span>发送</span></v-link></li>
            <li><v-link href="/receive" v-bind:class="{'active': this.$root.currentView == 'receive','': this.$root.currentView != 'receive'}"><i class="icon-receive"></i><span>收款</span></v-link></li>
            <li><v-link href="/history" v-bind:class="{'active': this.$root.currentView == 'history','': this.$root.currentView != 'history'}"><i class="icon-history"></i><span>交易历史</span></v-link></li>
            <li><v-link href="/sendr" v-bind:class="{'active': this.$root.currentView == 'sendr','': this.$root.currentView != 'sendr'}"><i class="icon-sign"></i><span>已签名交易发送</span></v-link></li>
        </ul>
    </div>
    <div class="lay-right">
        <div class="lay-right-main">
            <slot></slot>
        </div>
    </div>
    </div>
</template>

<script>
import VLink from "../components/VLink.vue";

export default {
  components: {
    VLink
  },
  data(){
    return {
      wallet_list:[]
    }
  },
  mounted(){
    this.wallet_list = this.$root.globalData.wallet_list;

  },
  updated(){
      var buttons = document.getElementsByClassName("wallet-buttons");
      for(var i=0;i<buttons.length;i++){
          buttons[i].style.display = this.$root.currentView == 'wallet'?"":"none";
      }
  }
};
</script>

<style lang="less">
@import url(../../node_modules/iview/dist/styles/iview.css);

body{font-family:"PingFang SC","microsoft yahei light","microsoft yahei","sans-serif";line-height:1;font-weight: bold; }

.ivu-modal-content{
    background-color: transparent;

}
.ivu-modal {
    top:40%;
}


.ivu-select-item-selected{
    background-color: #212121;
}

.ivu-modal-footer{
    display: none;
}

.ivu-select{
    font-family:"microsoft yahei light","microsoft yahei","sans-serif";line-height:54px;font-weight: bold;
    font-size: 12px;
    border-color: #212121;
}
.ivu-select-single .ivu-select-selection{
    height: 54px;
}
.ivu-select-selection:hover{border-color:#333333;}
.ivu-select-selection{
    background-color: #dcdcdc;
    border-radius: 4px;
    border:none;
    height: 54px;
    font-size: 16px;
    font-family:"microsoft yahei light","microsoft yahei","sans-serif";line-height:54px;font-weight: bold;
}
.ivu-select-visible .ivu-select-selection {
    border-color:#333333;
    height: 54px;
    font-size: 16px;
    font-family:"microsoft yahei light","microsoft yahei","sans-serif";line-height:54px;font-weight: bold;
}

.ivu-select-dropdown{
    margin:0px;
    padding: 0px;
}

.ivu-select-dropdown .ivu-select-dropdown-list .ivu-select-item {
    width: 100%;
    height: 35px;
    line-height: 35px;
    padding: 0 14px;
    box-sizing: border-box;
    font-size: 15px!important;
    color: #212121;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &:nth-child(odd) {
        background-color: #b2b2b2;
    }
    &:nth-child(even) {
        background-color: #ccc;
    }
    &:hover {
        background-color: #646464;
        color: #fff;
    }
}

.ivu-select-item {
    font-size: 15px!important;
}

.ivu-select-arrow {
    content: "";
    position: absolute;
    right: 14px;
    top:50% ;
    margin-top:-5px;
    border:10px solid transparent;
    border-top-color:#212121;
    transition: all 0.3s ease-in-out;
    -webkit-transition: all 0.3s ease-in-out;
    -moz-transition: all 0.3s ease-in-out;
}

.ivu-icon-arrow-down-b:before {
    content: "";
}

.ivu-select-single .ivu-select-selection .ivu-select-placeholder, .ivu-select-single .ivu-select-selection .ivu-select-selected-value{
    height: 54px;
    font-size: 16px;
    font-family:"microsoft yahei light","microsoft yahei","sans-serif";line-height:54px;font-weight: bold;

    position: relative;
    width:100%;
    padding:0 36px 0 14px;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;

}

.num-input .ivu-input-number-input-wrap{
    height: 54px;
}
.num-input .ivu-input-number-input{
    width: 100%;
    height: 54px;
    margin-right: 20px;
    padding-left: 10px;
    border-radius: 3px;
    background-color: #ffffff;
    font-size: 16px;
    color: #212121;
    box-sizing: border-box;
    vertical-align: middle;
}

.slider {
    width: 500px;
    background-color: transparent;
}

.ivu-slider-bar{
    background-color: #e9eaec;
}

.ivu-slider-button{
    top: 50%;
    transform: translateY(-25%);
    width: 30px;
    height: 30px;
    margin-left: -15px;
    border: none;
    border-radius: 50%;
    background-color: #aaaaaa;
    cursor: pointer;
    &:focus {
        border: none;
        outline: none;
    }
    &:hover{
        transform: translateY(-25%);
    }
}

.ivu-slider-wrap{
    margin-top: 0px;
}


.container {
  display: flex;
  margin: 0 auto;
  width: 1200px;
  min-height: 700px;
}
.sidebar {
  flex-direction: column;
  width: 200px;
  padding: 20px 0;
  background: #222222;
  color: #fff;
  .logobar {
    display:inline-flex;
    align-items: center;
    justify-content: center;
    width:100%;
    .logo {
      width: 265px;
      height: 70px;
    }
    .slogan {
      margin-left: 5px;
      font-size: 28px;
      font-family: "PTSans-NarrowBold", "PT Sans Narrow Bold", "PT Sans Narrow";
    }
  }
  .menu {
    margin: 60px 0 0 15px;
    font-size: 18px;
    .icon {
      font-size: 20px;
      margin: 0 5px;
    }
      .menu-item-link{
          display: inline-block;
          width:100%;
      }
      .menu-item-selected{
          background: rgb(5,139,200);
      }
      .menu-item-normal{
          background: rgb(42,42,42);
          a{
              color:rgb(170,170,170);
          }
          a:hover{
              color:rgb(68,69,69);
          }
          &:hover {
              a{
                  color:rgb(68,69,69);
              }
              background: rgb(197,208,208);
              color:rgb(68,69,69);
          }
      }
    .menu-item {
        margin-top:5px;
      height: 50px;
      color: #ccc;
        line-height: 50px;
      /*&:hover {*/
        /*color: #fff;*/
      /*}*/
      .tip {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        float: right;
        text-align: center;
        background: #ccc;
        font-size: 14px;
        color: #000;
        margin-right: 15px;
      }
    }
  }
}
.content {
  flex-grow: 1;
  background: #222222;
  padding: 30px;
  min-width: 650px;
}
.btn-wrapper {
  height: 36px;
  line-height: 36px;
}
.filter-wrapper {
  height: 70px;
}
.content-wrapper {

}
</style>
