$(function(){
    var id = dataUtil.GetQueryString("id");
    if(id!=null){
        var wccaid = id;
        var data = {"wccaid":wccaid};
        $("#content >header > span").html("编辑地址");
        safeAjax("post", "/w/shop/infoConsigneeAddress.do", data, "json",
            function(data){
                if(data.result == "SUCCESS"){
                    var name = data.data.coen;
                    var areaid = data.data.coeareaid;
                    var area = data.data.coearea;
                    var local = data.data.coeaddr;
                    var mobile = data.data.coemb;
                    $(".add_name").val(name); //填充内容
                    $(".add_mobile").val(mobile);
                    $(".add_area").val(area);
                    $(".add_local").val(local);
                    $(".add_area").attr("data-areano",areaid);
                }
            },
            function(){
                wapUtil.showTip('加载失败','','error');
            });
    }
    //ajax封装
    function safeAjax(method, url, data, dataType, successFn, errorFn){
        $.ajax({
            type : method,
            url : url,
            data : data,
            dataType : dataType,
            success : function(json){
                successFn(json);
            },
            error : function(){
                errorFn();
            }
        });
    }

    //保存
    $(".area_content ").off().on("click", ".saveInfoBtn", function(){
        if(checkConsigneeName() || checkMobile() || checkArea() || checkConsigneeAddress()){
            return;
        }
        var url = wccaid ? "/w/shop/updateConsigneeAddress.do" : "/w/shop/saveConsigneeAddress.do";
        var addId = $(".add_area").data("areano");
        var name = $(".add_name").val();
        var local = $(".add_local").val();
        var mobile = $(".add_mobile").val();
        // addHtml =  $(".add_area").val();
        var data = {};
        if(wccaid){
            data["wccaid"] = wccaid;
        }
        data["coen"] = name;
        data["coeareaid"] = addId;
        data["coearea"] = addHtml;
        data["coeaddr"] = local;
        data["coemb"] = mobile;
        safeAjax("post", url, data, "json",
            function(data){
                if(data.result == "SUCCESS"){
                    wapUtil.showTip('保存成功','','success');
                    var jumpLink=""
                    if($(".m-jumpLink").attr("data-link")=="1"){
                        jumpLink="?orderInfo=1"
                    }
                    setTimeout(function(){
                        window.location.href = 'address.html'+jumpLink;
                    },1000);
                }
            },
            function(){
                wapUtil.showTip('保存失败','','error');
            });
    });
    /*--信息验证--*/
    //判断是否是空
    function isEmpty(value){
        if(value == null || value == "" || value == "undefined" || value == undefined || value == "null"){
            return true;
        } else {
            value = (value + "").replace(/\s/g, '');
            if(value == ""){
                return true;
            }
            return false;
        }
    }

    //检查是否含有非法字符
    function is_forbid(temp_str){
        temp_str = temp_str.replace(/(^\s*)|(\s*$)/g, "");
        temp_str = temp_str.replace('--', "@");
        temp_str = temp_str.replace('/', "@");
        temp_str = temp_str.replace('+', "@");
        temp_str = temp_str.replace('\'', "@");
        temp_str = temp_str.replace('\\', "@");
        temp_str = temp_str.replace('$', "@");
        temp_str = temp_str.replace('^', "@");
        temp_str = temp_str.replace('.', "@");
        temp_str = temp_str.replace(';', "@");
        temp_str = temp_str.replace('<', "@");
        temp_str = temp_str.replace('>', "@");
        temp_str = temp_str.replace('"', "@");
        temp_str = temp_str.replace('=', "@");
        temp_str = temp_str.replace('{', "@");
        temp_str = temp_str.replace('}', "@");
        var forbid_str = new String('@,%,~,&');
        var forbid_array = new Array();
        forbid_array = forbid_str.split(',');
        for(i = 0; i < forbid_array.length; i++){
            if(temp_str.search(new RegExp(forbid_array[i])) != -1)
                return false;
        }
        return true;
    }

    //校验名字
    function checkConsigneeName(){
        var errorFlag = false;
        var value = $("#uersNameId").val();
        console.log(value);
        if(isEmpty(value)){
            errorFlag = true;
            wapUtil.showTip("收货人不能为空","","forbidden");
        } else {
            if(value.length > 25){
                errorFlag = true;
                wapUtil.showTip("收货人不能超过25","","forbidden");
            }
            if(!is_forbid(value)){
                errorFlag = true;
                wapUtil.showTip("非法字符","","forbidden");
            }
        }
        return errorFlag;
    }

    //校验地区
    function checkArea(){
        var flag = false;
        // var $addbox = $("#city-picker").data("areasts");
        addHtml = "";
        // $.each($addbox, function (i, item){
            if($(".add_area").data("areasts") == "0"){
                console.log($(".add_area").data("areasts"));
                wapUtil.showTip('所在地区暂不支持配送', '', 'forbidden');
                flag = true;
            } else if($(".add_area").val() == ""){
                wapUtil.showTip('请选择所在地区', '', 'forbidden');
                flag = true;
            }
            addHtml = $(".add_area").val();

            return flag;

    }

    //校验详细地址
    function checkConsigneeAddress(){
        var errorFlag = false;
        var value = $("#detailedAddressId").val();
        if(isEmpty(value)){
            errorFlag = true;
            wapUtil.showTip("详细地址不能为空","","forbidden");
        }
        if(!is_forbid(value)){
            errorFlag = true;
            wapUtil.showTip("非法字符","","forbidden");
        }
        if(value.length > 50){
            errorFlag = true;
            wapUtil.showTip("详细地址过长","","forbidden");
        }
        return errorFlag;
    }

    //校验手机
    function checkMobile(){
        var errorFlag = false;
        var value = $("#mobilePhoneId").val();
        if(isEmpty(value)){
            errorFlag = true;
            wapUtil.showTip("手机号码不能为空","","forbidden");
        } else {
            // var regu = /^((1(3[4-9]|5[012789]|8[23478]|4[7]|7[78])|1(3[0-2]|5[56]|8[56]|4[5]|7[6])|1(3[3])|(8[019]))+\d{8})$/;
            var regu = /^((1(33|53|77|8[019])|1(3[0-2]|4[5]|5[56]|7[6]|8[56])|1(3[4-9]|4[7]|5[0-27-9]|7[8]|8[2-478]))+\d{8})|(1700+\d{7})|(^1709+\d{7})|(^1705+\d{7})$/;
            var re = new RegExp(regu);
            if(!(re.test(value))){
                errorFlag = true;
                wapUtil.showTip("手机号码格式错误","","forbidden");
            }
        }
        //        if (!errorFlag) {
        //            value = $("#consigneePhone").val();
        //            if ($("#consigneeMobile").val() == $("#consigneePhone").val()) {
        //                el.hide();
        //                return false;
        //            }
        //            if (!isEmpty(value)) {
        //                if (!is_forbid(value)) {
        //                    errorFlag = true;
        //                    errorMessage = langUtil.address_phoneMessageForbid;
        //                }
        //                if (value.length > 20) {
        //                    errorFlag = true;
        //                    errorMessage = langUtil.address_phoneMessageOutLength;
        //                }
        //                var strlength = value.length;
        //                var patternStr = "(0123456789-*)";
        //                for (var i = 0; i < strlength; i++) {
        //                    var tempchar = value.substring(i, i + 1);
        //                    if (patternStr.indexOf(tempchar) < 0) {
        //                        errorFlag = true;
        //                        errorMessage = langUtil.address_phoneMessageError;
        //                        break;
        //                    }
        //                }
        //                if (strlength >= 4 && value.indexOf("*") > -1) {
        //                    if (!((new RegExp(/.+\*\*\*\*$/).test(value) && (strlength - value.indexOf("*")) < 5) || (new RegExp(/^\d{11}$/).test(value) || new RegExp(/^\d{3}\*\*\*\*\d{4}$/).test(value)))) {
        //                        errorFlag = true;
        //                        errorMessage = langUtil.address_phoneMessageError;
        //                    }
        //                }
        //            }
        //        }
        //
        //        if (errorFlag) {
        //            el.text(errorMessage);
        //            el.show();
        //        } else {
        //            el.hide();
        //        }
        return errorFlag;
    }
});