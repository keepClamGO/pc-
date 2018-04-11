/**
 * Created on 2017/10/17.
 */
//返回键
/*$('#backBtn').on('click',function(){
    wapUtil.backHistory();
});*/
/**
 * 安全中心 数据
 */
function setSafeInfo(){
    //var info = shopUtil.getPersonInfo();
    $.when(shopUtil.getPersonInfo()).done(function(info) {
        console.log("移动端个人信息111.......");
        console.log(info);
        var nameDom = $("#m-linkOff .m-valBox .m-infoVal").find("input[name='petName']");
        if(info.ischg){
            $(nameDom).attr("readonly","readonly").css({"color":"#bcbdbf"});
            $("#m-linkOff .m-valBox").find(".m_sign").remove();
            $("#m-linkOff .m-valBox").css({"padding-right":"12px"});
            $("#m-linkOff").attr("href","javascript:void(0);");
        }
        $(nameDom).val(info.cstacc);
        var userPhone = info.cstmb;
        userPhone = userPhone.split("");
        userPhone.splice(3,4,"****");
        var phoneNum = userPhone.join("");
        $(".memSafe-box .m-valBox .m-infoVal").find("input[name='safe-phone']").val(phoneNum);
    })

}
setSafeInfo();

//提交按钮判断内容
function checkCont(cls,callhtml){
    var result = true;
    if($.trim(cls.val()) == ''){
        wapUtil.showTip(callhtml,2,"cancel");
        //$.toast(callhtml);
        result = false;
    }
    return result;
}
//错误error_tip提示内容
function errorCont(cls,cls1,html){
    cls.siblings(cls1).html(html)
}
//密码公共js
function checkPsw(cls,html1){
    if( $.trim(cls.val()) != ''){
        html1(cls);
    }
}

/*
 *修改密码
 */
function updatePwd(){
    var oldPwd = $("#oldPwd");
    var newPwd = $("#newPwd");
    var newPwdCon = $("#newPwdConfirm");
    var setoff = false;
    //旧密码判断
    var checkOldPwd = checkCont(oldPwd,langUtil.safeCenter_showOldPwd);
    if(checkOldPwd){
        checkPsw(oldPwd,function(n){
            var data = {"cstpsw":n.val()};
            $.ajax({
                type:'POST',
                async : false,
                url:'/w/cst/checkPSW.do',
                data:data,
                success:function(data){
                    if(!data.data){
                        wapUtil.showTip("旧密码错误",2,"cancel");
                        n.val('');
                    }else{
                        setoff= true;
                    }
                },
                error:function(){
                    wapUtil.showTip(langUtil.safeCenter_showError,1.5,"cancel");
                }
            });
        });
    }
    if(setoff){
        //新密码判断
        if(checkCont(newPwd,langUtil.safeCenter_showNewPwd)){
            checkPsw(newPwd,function(n){
                if(n.val().length < 6 || n.val().length > 20){
                    wapUtil.showTip("新密码不能小于6位数字，大于20位数字！",2,"cancel");
                    n.val('');
                    setoff = false;
                    console.log(setoff)
                }
            });
        }else{
            setoff = false;
        }
    }
    if(setoff){
        //确认密码判断
        console.log(setoff)
        if(checkCont(newPwdCon,langUtil.safeCenter_showSurePwd)){
            checkPsw(newPwdCon,function(n){
                if(n.val() != newPwd.val()){
                    wapUtil.showTip("两次密码不一致",2,"cancel");
                    n.val('');
                    setoff = false;
                }
            });
        }else{
            setoff = false;
        }
    }
    if(setoff){
        var data = {
            oldPsw:oldPwd.val(),
            newPsw:newPwd.val()
        };
        $.ajax({
            type:"POST",
            url:"/w/cst/savePSW.do",
            data:data,
            dataType:'json',
            success:function(json){
                if(json.result == "SUCCESS"){
                    console.log("修改密码成功");
                    console.log(json);
                    $("#content").find(".setPsw_box").css({"display":"none"});
                    $("#content").find(".updatePswSucc_box").css({"display":"block"});
                    $("#content").find("header span").text("完成");
                }
            },
            error:function(json){
                console.log(json.errorMsg);
                console.log("修改密码失败");
            }
        });
    }
}

/**
 * 修改手机号码
 */
function updateUserPhone(){
    var phone = $(".setPhone-box .m-phoneVal").find("input[name='newPhone']").val();
    var reg = /^((13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8})$/;
    var result = reg.test(phone);
    if (result) {
        result = true;
    } else {
        result = false;
    }
    if (phone === '') {
        wapUtil.showTip("手机号码不能为空",1.5,"cancel");
        return false
    } else if (phone !== '' && !result) {
        wapUtil.showTip("手机号码格式不正确",1.5,"cancel");
        return false
    }else{
        //发送验证码到手机 并下一步
        if(dataUtil.checkAccount('#newPhone')) {
            $("#content").find(".setPhone_section").css({"display": "none"});
            $("#content").find(".setCode_section").css({"display": "block"});
            setCountDown("#regainCode", phone);
        }else{
            return false;
        }

    }
}
/**
 * 发送验证码、倒计时
 */
function setCountDown(obj,num){
    $(".setCode-box .m-codeTxt").find(".m-codeNum").attr("data-num",num);
    num = num.split("");
    num.splice(0,7,"*******");
    var phoneNum = num.join("");
    $(".setCode-box .m-codeTxt").find(".m-codeNum").text(phoneNum);
    dataUtil.sendSmsCode("#newPhone","#regainCode","reset","setRegCol");
}
/**
 * 提交绑定手机及验证码
 */
function checkPhoneCode(){
    var phoneNum = $(".setCode-box .m-codeTxt").find(".m-codeNum").data("num");
    var code = $(".setCode-box .m-codeValBox .m-codeCon").find("input[name='phoneCode']").val();
    if(code){
        $.ajax({
            type:"POST",
            url:"/w/cst/savePhone.do",
            data:{"phoneNum":phoneNum,"code":code},
            cache:false,
            async:false,
            dataType:'json',
            success:function(json){
                if(json.result == "SUCCESS"){
                    console.log("绑定手机号码成功");
                    console.log(json);
                    $("#content").find(".setPhone_section").css({"display":"none"});
                    $("#content").find(".setCode_section").css({"display":"none"});
                    $("#content").find(".setCode_complete").css({"display":"block"});
                    $("#content").find("header span").text("完成");
                }else{
                    wapUtil.showTip(json.errorMsg.msg,1.5);
                }
            },
            error:function(json){
                console.log(json.errorMsg);
                console.log("绑定手机号码失败");
            }
        })
    }else{
        wapUtil.showTip("校验码不能为空",1.5,"cancel");
    }
}

/**
 * 设置返回键的链接地址
 */
function setJumpLink(){
    var link = window.location.href;
    var i =link.indexOf("?");
    if(i != "-1"){
        link = link.substring(i+1,i+8);
        console.log(link);
        if(link == "setsafe"){
            $("#phone-jumpLink").attr("href","/member/myinfo.html");
        }
    }
}