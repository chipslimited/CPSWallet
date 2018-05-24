var translateError = {
    translate: function(err){
        if(err == null || typeof(err) == 'undefined'){
            return "";
        }

        if(err.toString().indexOf("EOF") > 0){
            return window.i18n.t('内容为空');
        }

        if(err.toString().indexOf("cannot unmarshal hex string") > 0){
            return window.i18n.t('输入内容非法');
        }

        if(err.toString().indexOf("expected input list for types.txdata") > 0){
            return window.i18n.t('输入内容非法');
        }

        if(err.toString().indexOf("Invalid JSON RPC response") > 0){
            return window.i18n.t('输入内容非法或密码错误');
        }

        if(err.toString().indexOf("insufficient funds for gas * price + value") > 0){
            return window.i18n.t('余额不足');
        }

        if(err.toString().indexOf("derived key") > 0){
            return window.i18n.t('密码错误');
        }

        return err.toString();
    }
}

export default translateError;