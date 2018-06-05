var wallet={
  tips:{
    timer:null,
    buildDom:function (opt) {
    var  tpl=[];
    var  len=opt.buttonList.length;
    tpl.push('<div class="wallet_tips_cover" id="'+opt.id+'"><div class="wallet_tips_main">');
    if(opt.title){
      tpl.push('<div class="tips_main_title">'+opt.title+'</div>');
    }
    if(opt.emphasis_title){
      tpl.push('<div class="tips_lower_tit">'+opt.emphasis_title+'</div>');
    }
    if(opt.emphasis_msg){
      tpl.push('<div class="tips_emphasis_tips">'+opt.emphasis_msg+'</div>');
    }
    if(opt.lower_title){
      tpl.push('<div class="tips_lower_tit">'+opt.lower_title+'</div>');
    }
    if(opt.msg){
      tpl.push('<div class="tips_main_tips">'+opt.msg+'</div>');
    }
    if(opt.mnemonic||opt.downTips||opt.downHref){
      tpl.push('<div class="tips_main_mnemonic">');
      if(opt.mnemonic){
        tpl.push('<div class="tips_mnemonic">'+opt.mnemonic+'</div>');
      }
      if(opt.downTips){
        tpl.push('<div class="tips_downTips">'+opt.downTips+'</div>');
      }
      if(opt.downHref){
        tpl.push('<div class="tips_downbtn"><a href="'+opt.downHref+'" class="downbtn"'+(opt.downName?"download="+opt.downName:"")+'>'+opt.downText+'</a></div>');
      }
      tpl.push('</div>');
    }

    if(opt.internalTips||opt.hasInput){
      tpl.push('<div class="tips_form has_input">');
      if(opt.internalTips){
        tpl.push('<div class="tips_internal">'+opt.internalTips+'</div>');
      }
      if(opt.hasInput) {
        tpl.push('<div class="tips_input"><input type="' + opt.inputType + '" placeholder="' + opt.inputPlaceholder + '" value="' + opt.inputValue + '" id="wallet_input" maxlength="' + opt.maxLength + '" ></div>');
      }
    }
    else{
      tpl.push('<div class="tips_form">');
    }

    if(len>0){
      tpl.push('<div class="tips_form_btn'+(len>1?" btn-flex":"")+(len>2?" more_btn":"")+'">');
      for(var i=0;i<len;i++){
        tpl.push('<a href="'+(opt.buttonList[i].btnHref?opt.buttonList[i].btnHref:"javascript:;")+'" class="js_tips_btn '+(opt.buttonList[i].btnHref?"hasdownload":"")+'"'+(opt.buttonList[i].btnDownName?"download="+opt.buttonList[i].btnDownName:"")+'>'+opt.buttonList[i].btnTxt+'</a>');
      }
      tpl.push('</div>');
    }
      tpl.push('</div></div></div>');
      return tpl.join("");
    },
    toastDom:function (opt) {
        var tpl=[];
        if(opt.msg){
          tpl.push('<div class="wallet_tips_toast">'+opt.msg+'</div>')
        }
        return tpl.join("");
    },
    showToast:function (opt) {
      var _this=this;
        var defaultOpt={
            msg:"",//提示信息
            autoClose : true,//是否有自动关闭功能
            autoCount : 3//倒计时时间
        };
      var opt=$.extend(true,defaultOpt,opt||{});
      var target=$(".wallet_tips_toast");
      if(target.length>0){
        target.remove();
        if(_this.timer) {
          clearInterval(_this.timer);
          _this.timer=null;
        }
      }
      $("body").append(_this.toastDom(opt));
      target=$(".wallet_tips_toast");
      if(opt.autoClose) {
        _this.timer = window.setInterval(function() {
          opt.autoCount--;
          if(opt.autoCount == 1) {
            clearInterval(_this.timer);
            target.remove();
          }
        },1000);
      }
    },
    showMsg:function (opt){
      var _this=this;
      var defaultOpt={
        animation : '',
        id : "wallet_tips",
        title : '标题',
        emphasis_title : '重要提示标题',
        emphasis_msg : '重要提示信息',
        lower_title : '提示标题',
        msg : '提示信息',
        mnemonic : '',//删除钱包时的助记词
        downTips : '',//删除钱包时的下载提示
        downHref : '',//删除钱包时的下载链接
        hasInput : true,//是否有输入框
        internalTips:"",//输入框上方提示
        inputType : "text",//输入框类型
        inputPlaceholder : "",//输入框占位符
        inputValue : "",//输入框值
        maxLength : "",//输入框最大长度
        buttonList:[]//按钮数组

      };
      var opt=$.extend(true,defaultOpt,opt||{});
      var target=$(".wallet_tips_cover");
      if(target.length>0){
        target.remove();
      }
      $("body").append(_this.buildDom(opt));
      var buttonList=opt.buttonList;
      var len=buttonList.length;
      if(len>0){
        $(".js_tips_btn").each(function (index) {
            $(this).click(function () {
              if(buttonList[index].btnFn&&typeof buttonList[index].btnFn=="function"){
                buttonList[index].btnFn();
              }
            })
        })
      }

    },
    /*
    * 错误信息提示弹窗
    * @param msg 提示信息
    * */

    toast:function(opt){
      this.showToast({
          msg:opt.msg?opt.msg:""
      })
    },
    /*
    * 提示弹窗
    * @param title 提示标题
    * @param emphasis_msg 提示内容
    * @param btnTxt 按钮文本
    * */

    alert:function (opt) {
      var _this=this;
      _this.showMsg({
        title:opt.title?opt.title:"",
        emphasis_title:"",
        emphasis_msg:opt.emphasis_msg?opt.emphasis_msg:"",
        lower_title:"",
        msg:"",
        hasInput:false,
        buttonList:[{btnTxt:opt.btnTxt?opt.btnTxt:"",btnFn:function () {
            _this.close();
          }}]
      })
    },
    /*
   * 询问弹窗
   * @param title 标题
   * @param emphasis_msg 提示内容
   * @param buttonList[{btnTxt:按钮文本,btnFn:按钮点击事件}]
   * */
    confirm:function (opt) {
      this.showMsg({
        title:opt.title?opt.title:"",
        emphasis_title:"",
        emphasis_msg:opt.emphasis_msg?opt.emphasis_msg:"",
        lower_title:"",
        msg:"",
        hasInput:false,
        buttonList:opt.buttonList
      })
    },
      /*
      * 输入弹窗
      * @param title 主标题
      * @param emphasis_title 重要提示内容标题
      * @param emphasis_msg 重要提示内容
      * @param lower_title 次级提示内容标题
      * @param msg 次级提示内容
      * @param internalTips 输入框上方提示
      * @param inputType 输入框类型
      * @param inputPlaceholder 输入框占位符
      * @param inputValue 输入框值
      * @param maxLength 输入框最大输入长度
      * @param buttonList[{btnTxt:按钮文本,btnFn:按钮点击事件}]
      * */
    prompt:function (opt) {
      this.showMsg({
        title:opt.title?opt.title:"",
        emphasis_title:opt.emphasis_title?opt.emphasis_title:"",
        emphasis_msg:opt.emphasis_msg?opt.emphasis_msg:"",
        lower_title:opt.lower_title?opt.lower_title:"",
        msg:opt.msg?opt.msg:"",
        hasInput:true,
        internalTips:opt.internalTips?opt.internalTips:"",
        inputType :opt.inputType?opt.inputType:"text",
        inputPlaceholder :opt.inputPlaceholder?opt.inputPlaceholder:"",
        inputValue :opt.inputValue?opt.inputValue:"",
        maxLength:opt.maxLength?opt.maxLength:"",
        buttonList:opt.buttonList
      })
    },
    /*
    *  下载询问弹窗
    * @param title 主标题
    * @param internalTips 输入框上方提示
    * @param downText 下载按钮文案
    * @param downHref 下载链接
    * @param downName 下载名称
    * @param btnTxt 关闭按钮文案
    * */
    downLoadConfirm:function (opt) {
      var _this=this;
      _this.showMsg({
        title:opt.title?opt.title:"",
        emphasis_title:"",
        emphasis_msg:"",
        lower_title:"",
        msg:"",
        hasInput:false,
        internalTips:opt.internalTips?opt.internalTips:"",
        buttonList:[{btnTxt:opt.downText?opt.downText:"",
          btnHref:opt.downHref?opt.downHref:"",
          btnDownName:opt.downName?opt.downName:""
        },{btnTxt:opt.btnTxt?opt.btnTxt:"",btnFn:function () {
            _this.close();
          }}]
      })
    },
    /*
   *  删除询问弹窗
   * @param title 主标题
   * @param msg 删除提示
   * @param mnemonic 助记词
   * @param downTips 下载提示
   * @param downText 下载按钮文案
   * @param downHref 下载链接
   * @param downName 下载名称
   * @param buttonList[{btnTxt:按钮文本,btnFn:按钮点击事件}]
   * */
    deleteDownLoad:function (opt) {
      this.showMsg({
        title:opt.title?opt.title:"",
        emphasis_title:"",
        emphasis_msg:"",
        lower_title:"",
        msg:opt.msg?opt.msg:"",
        mnemonic:opt.mnemonic?opt.mnemonic:"",
        downTips:opt.downTips?opt.downTips:"",
        downText:opt.downText?opt.downText:"",
        downHref:opt.downHref?opt.downHref:"",
        downName:opt.downName?opt.downName:"",
        hasInput:false,
        buttonList:opt.buttonList
      })
    },
    getPromptVal:function () {
      var val=$("#wallet_input").val();
      return val
    },
    close:function () {
      if( $('.wallet_tips_cover').length> 0) {
        $('.wallet_tips_cover').remove();
      }
    }
  },
  /*
  * 下拉框
  * @param {
  *     selectObj:下拉框创建节点
  *     selectPlaceholder:下拉框占位符
  *     selectData:下拉框数据
  *     selectFn:下拉框选择后执行事件
  *   }
  * */
  select:function (opt) {
    this._value="";
    this._text="";
    this.defaultOpt={
        selectObj:"",
        selectPlaceholder:"",
        selectData:"",
        selectFn:""
    };
    this.opt=$.extend(true,this.defaultOpt,opt||{});
    this.init=function () {
        var obj=$(this.opt.selectObj);
        if(obj.length>0){
         var dom=this.buildDom(this.opt.selectData);
          obj.empty().append(dom);
          this.eventBind();
        }
    };
    this.buildDom=function () {
      var _this=this;
      var selectData=_this.opt.selectData||[];
      var len=selectData.length;
      var tpl=[];
      tpl.push('<div class="wallet_select">');
       if(len>0){
         if(_this.opt.selectPlaceholder){
           tpl.push('<div class="now_select " data-value="">'+_this.opt.selectPlaceholder+'</div>');
         }
         else{
           this._value=selectData[0].value;
           this._text=selectData[0].text;
           tpl.push('<div class="now_select '+(len==1?"no_arrow":"")+'" data-value="'+(selectData[0].value?selectData[0].value:"")+'">'+selectData[0].text+'</div>');
         }

         tpl.push('<div class="wallet_menu">');
         for(var i=0;i<len;i++){
           tpl.push('<li class="item" data-value="'+(selectData[i].value?selectData[i].value:"")+'">'+selectData[i].text+'</li>');
         }
         tpl.push('</ul>');
       }
      tpl.push('</div>');
      return tpl.join("")
    };

    this.eventBind=function () {
      var _self=this;
      $(_self.opt.selectObj).on("click",".wallet_select",function (e) {
            e.stopPropagation();
            $(".wallet_select").not($(this)).removeClass("open");
           var flag=$(this).hasClass("open");
           if(flag){
             $(this).removeClass("open");
           }
           else{
             $(this).addClass("open");
           }

      });
      $(_self.opt.selectObj).on('click', '.item', function(e) {
        e.stopPropagation();
        var _this=$(e.currentTarget);
        var itemVal =_this.attr("data-value");
        var itemTxt = _this.html();
        _self._value=itemVal;
        _self._text=itemTxt;
        var now_select=$(this).parent().siblings(".now_select");
        now_select.html(itemTxt).attr("data-value",itemVal);
        $(this).parents(".wallet_select").removeClass("open");
        var selectFn=_self.opt.selectFn;
          if(selectFn&&typeof selectFn=="function"){
              selectFn();
          }
      });
      $(document).on("click",function () {
        $(".wallet_select").removeClass("open");
      })
    };
    this.getValue=function () {
      return this._value;
    };
    this.getText=function () {
      return this._text;
    };

    this.init();
  }
};
