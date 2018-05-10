<template>
    <div v-bind:class="wrapper">
        <slot></slot>
    <div id="nav_menu" v-bind:class="nav_menu">
        <div class="header-logo">
            <img src="../../static_m/img/menu-logo.png" alt="">
        </div>
        <div v-bind:class="{'link-item active': this.$root.currentView == 'wallet','link-item': this.$root.currentView != 'wallet'}">
            <a v-on:click="closeNavMenu" href="/wallet" class="text"><span class="wallet-icon"></span>{{$t('钱包')}}</a>
        </div>
        <div v-bind:class="{'link-item active': this.$root.currentView == 'send','link-item': this.$root.currentView != 'send'}">
            <a v-on:click="closeNavMenu" href="/send" class="text"><span class="send-icon"></span>{{$t('发送')}}</a >
        </div>
        <div v-bind:class="{'link-item active': this.$root.currentView == 'receive','link-item': this.$root.currentView != 'receive'}">
            <a v-on:click="closeNavMenu" href="/receive" class="text"><span class="receive-icon"></span>{{$t('收款')}}</a>
        </div>
        <div v-bind:class="{'link-item active': this.$root.currentView == 'history','link-item': this.$root.currentView != 'history'}">
            <a v-on:click="closeNavMenu" href="/history" class="text"><span class="transLog-icon"></span>{{$t('交易历史')}}</a>
        </div>
        <div v-bind:class="{'link-item active': this.$root.currentView == 'sendr','link-item': this.$root.currentView != 'sendr'}">
            <a v-on:click="closeNavMenu" href="/sendr" class="text"><span class="transSend-icon"    ></span>{{$t('已签名交易发送')}}</a>
        </div>
    </div>
    </div>
</template>
<script>

    import routes from '../routes_m'
    export default {
        components: {
        },
        data() {
            return {nav_menu:'menu', wrapper:this.$root.currentView == 'wallet'?'index-wrapper wallet-wrapper':
            (this.$root.currentView == 'send'?'send-wrapper wallet-wrapper':
                (this.$root.currentView == 'receive'?'receive-wrapper wallet-wrapper':
                        (this.$root.currentView == 'history'?'transLog-wrapper wallet-wrapper':
                                (this.$root.currentView == 'sendr'?'transSend-wrapper wallet-wrapper':'')
                        )
                ))}
        },
        methods: {
            closeNavMenu(event) {
                event.preventDefault();
                var view = event.target.href.substring(event.target.href.lastIndexOf("/")+1);
                this.$root.currentView = view;
                window.history.pushState(
                    null,
                    routes[event.target.href],
                    `#${view}`
                )
                var _this = this;
                _this.nav_menu = 'menu';
                _this.wrapper = _this.$root.currentView == 'wallet' ? 'index-wrapper wallet-wrapper' :
                    (_this.$root.currentView == 'send' ? 'send-wrapper wallet-wrapper' :
                        (_this.$root.currentView == 'receive' ? 'receive-wrapper wallet-wrapper' :
                                (_this.$root.currentView == 'history' ? 'transLog-wrapper wallet-wrapper' :
                                        (_this.$root.currentView == 'sendr' ? 'transSend-wrapper wallet-wrapper' : '')
                                )
                        ));

                $('.menu-btn').removeClass('menu-btn-close');
                $('.menu').removeClass('open');
                $('.nav').removeClass('open');
                $('.menu-btn').attr('data-open','false');

                console.log("nav_menu closeNavMenu");
            }
        }
    };
</script>

<style lang="less">
    @import url(../../node_modules/iview/dist/styles/iview.css);

    body{font-family:"PingFang SC","microsoft yahei light","microsoft yahei","sans-serif";line-height:1;font-weight: bold; background-color:#272727;}

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
        font-family:"microsoft yahei light","microsoft yahei","sans-serif";line-height:20px;font-weight: bold;
        font-size: 12px;
        border-color: #212121;
    }
    .ivu-select-single .ivu-select-selection{
        height: 24px;
    }
    .ivu-select-selection:hover{border-color:#333333;}
    .ivu-select-selection{
        background-color: #dcdcdc;
        border-radius: 4px;
        border:none;
        height: 24px;
        font-size: 12px;
        font-family:"microsoft yahei light","microsoft yahei","sans-serif";line-height:20px;font-weight: bold;
    }
    .ivu-select-visible .ivu-select-selection {
        border-color:#333333;
        height: 24px;
        font-size: 12px;
        font-family:"microsoft yahei light","microsoft yahei","sans-serif";line-height:20px;font-weight: bold;
    }

    .ivu-select-dropdown{
        margin:0px;
        padding: 0px;
    }

    .ivu-select-dropdown .ivu-select-dropdown-list .ivu-select-item {
        width: 100%;
        height: 24px;
        line-height: 24px;
        padding: 0 14px;
        box-sizing: border-box;
        font-size: 15px;
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

    .ivu-select-visible .ivu-select-arrow:nth-of-type(2){
        margin-top: -15px;
        transform: rotate(180deg);
        -webkit-transform: rotate(180deg);
        -moz-transform: rotate(180deg);
    }

    .ivu-icon-arrow-down-b:before {
        content: "";
    }

    .ivu-select-single .ivu-select-selection .ivu-select-placeholder, .ivu-select-single .ivu-select-selection .ivu-select-selected-value{
        height: 24px;
        font-size: 12px;
        font-family:"microsoft yahei light","microsoft yahei","sans-serif";line-height:20px;font-weight: bold;

        position: relative;
        width:100%;
        padding:0 36px 0 14px;
        box-sizing: border-box;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 12px;
        cursor: pointer;

    }

    .ivu-btn-loading {
        pointer-events: none;
    }

    .num-input .ivu-input-number-input-wrap{
        height: 24px;
    }
    .num-input .ivu-input-number-input{
        width: 100%;
        height: 24px;
        margin-right: 20px;
        border-radius: 3px;
        background-color: #ffffff;
        font-size: 12px;
        color: #212121;
        box-sizing: border-box;
        vertical-align: middle;
    }

    .num-input .ivu-input-wrap{
        height: 24px;
    }
    .num-input .ivu-input{
        width: 100%;
        height: 24px;
        margin-right: 20px;
        border-radius: 3px;
        background-color: #ffffff;
        font-size: 12px;
        color: #212121;
        box-sizing: border-box;
        vertical-align: middle;
        border: none;
        &:active{
            border: none;
        }
    }

    .ivu-input:focus {
        -webkit-box-shadow: none;
        -moz-box-shadow: none;
        box-shadow: none;
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


    .ivu-page-item a {
        font-size: 12px;
        line-height: 12px;
        height: 16px;
    }

    .ivu-page-prev a {
        font-size: 12px;
        line-height: 12px;
        height: 16px;
    }

    .ivu-page-next a {
        font-size: 12px;
        line-height: 12px;
        height: 16px;
    }

    .ivu-page-item-active {
        color: #495060;
    }

    .ivu-page-simple-pager {
        color: #ffffff;
    }

    .ivu-page-simple .ivu-page-simple-pager input {
        width: auto;
    }

    #app{
        height:calc(100% - 88px);
    }
</style>
