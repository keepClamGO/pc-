$(function () {
    var pageIndex = 1;
    var pageMax = 10;

    //初始化地址信息
    loadAddress(pageIndex, pageMax);
    // shopUtil.getAddlist("#show_addlist .add_prov", 0);
    //新增地址信息
    $(".add_message").click(function () {
        var addressNum = parseInt($("#addressNum").text());
        if (addressNum == 10) {
            webUtil.showTip("亲，最多可以创建10条地址哦！！！", 1.5);
            return;
        }
        openAddressDialog();

        //保存
        $(".add_box ").off().on("click", ".saveInfoBtn", function () {
            if (checkConsigneeName() || checkArea() || checkConsigneeAddress() || checkEmail() || checkMobile()) {
                return;
            }
            var addId = $("#show_addlist").find("select.onadd:last").val();
            var name = $(".add_name input").val();
            var local = $(".add_local input").val();
            var mobile = $(".add_mobile input").val();
            var phone = $(".add_kdmobile input").val();
            var email = $(".add_email input").val();
            var data = {};
            data["coen"] = name;
            data["coeareaid"] = addId;
            data["coearea"] = addHtml;
            data["coeaddr"] = local;
            data["coemb"] = mobile;
            data["coep"] = phone;
            data["coeemail"] = email;

            safeAjax("post", "/w/shop/saveConsigneeAddress.do", data, "json",
                function (data) {
                    if (data.result == "SUCCESS") {
                        //关闭增加地址框
                        closeAddressDialog();
                        loadAddress(pageIndex, pageMax);
                        //修改页面的显示数量
                        if (addressNum < 10) {
                            addressNum++;
                            $("#addressNum").text(addressNum);
                        }
                    }
                },
                function () {
                    webUtil.showTip("增加地址失败", 1.5);
                });
        });
        $(".add_box").on("click", ".closeDialogBtn", closeAddressDialog);
    });

    //编辑(更新)地址数据
    $(".local_add").on("click", ".update_address", function () {
        var this_update = this;
        var wccaid = $(this_update).closest(".add_content").data("wccaid");
        openAddressDialog(wccaid, this_update);

        //编辑保存
        $(".add_box").off().on("click", ".saveInfoBtn", function () {
            if (checkConsigneeName() || checkArea() || checkConsigneeAddress() || checkEmail() || checkMobile()) {
                return;
            }
            var addId = $("#show_addlist").find("select.onadd:last").val();
            var name = $(".add_name input").val();
            var local = $(".add_local input").val();
            var mobile = $(".add_mobile input").val();
            var phone = $(".add_kdmobile input").val();
            var email = $(".add_email input").val();
            var isdfs = $(".get_default").data("isdfs");
            var data = {};
            data["wccaid"] = wccaid;
            data["coen"] = name;
            data["coeareaid"] = addId;
            data["coearea"] = addHtml;
            data["coeaddr"] = local;
            data["coemb"] = mobile;
            data["coep"] = phone;
            data["coeemail"] = email;
            safeAjax("post", "/w/shop/updateConsigneeAddress.do", data, "json",
                function (data) {
                    if (data.result == "SUCCESS") {
                        //关闭增加地址框
                        closeAddressDialog();
                        loadAddress(pageIndex, pageMax);
                    }
                },
                function () {
                    webUtil.showTip("编辑地址失败", 1.5);
                });
        });
        $(".add_box").on("click", ".closeDialogBtn", closeAddressDialog);
    });

    //删除地址
    $(".local_add").on("click", ".add_extra", function () {
        $("#dialogBg").show();
        $(".div_dailog").show();
        var wccaid = $(this).closest('.add_content').data("wccaid");
        var this_del = this;
        $(".div_dailog .btn_span:first-child").on("click", function () {
            var data = {
                "wccaid": wccaid
            };
            safeAjax("post", "/w/shop/deleteConsigneeAddress.do", data, "json",
                function (data) {
                    if (data.result == "SUCCESS") {
                        $(this_del).closest(".add_content").remove();
                        // if(addressNum == 1){
                        //     $("#add_plus").show();
                        // }
                        webUtil.showTip("删除成功");
                        loadAddress(pageIndex, pageMax);
                        //修改页面的显示数量
                        addressNum = parseInt($("#addressNum").text());
                        if (addressNum > 0) {
                            addressNum--;
                        }
                        $("#addressNum").text(addressNum);
                        // if($('.set_back').length>=2){
                        //     $('.set_back').first().css('display', 'none');
                        // }else{
                        //     $('.set_back').first().css('display', 'inline-block');
                        // }
                    }
                },
                function () {
                    webUtil.showTip("删除地址失败", 1.5);
                });
            closeAddressDialog();
        });
        $(".div_dailog .btn_span").on("click", function () {
            closeAddressDialog();
        });
    });

    //设置默认地址
    $(".local_add").on("click", ".set_default", function () {
        var this_default = this;
        var wccaid = $(this_default).closest(".add_content").data("wccaid");
        var isdfs = $(this_default).closest(".add_content").find(".get_default").data("isdfs");
        // // var areaid = $(this_default).closest(".add_content").find(".local_area").data("areaid");
        // safeAjax("post", "/w/shop/listWebsiteShipArea.do", {}, "json",
        //     function (data) {
        //         var areas = data.data;
        //         if (data.result == "SUCCESS") {
        //             $.each(areas, function (i, item) {
        //                 var areasts = item.areasts;
        //                 if(areasts == 0){
        //                     webUtil.showTip(langUtil.shopUtil_dissupport, 1.5);
        //                     return;
        //                 }
        //             });
        //         }
        //     },
        //     function () {
        //         webUtil.showTip("获取区域失败", 1.5);
        //     });
        $(this_default).closest(".add_content").find(".get_default").attr("data-isdfs", 1).siblings('.add_content').find(".get_default").attr("data-isdfs", 0);
        safeAjax("post", "/w/shop/setDefaultConsigneeAddress.do", {
                "wccaid": wccaid
            }, "json",
            function (data) {
                if (data.result == "SUCCESS") {
                    loadAddress(pageIndex, pageMax);
                }
            },
            function () {
                webUtil.showTip("设置默认地址失败", 1.5);
            });

    });

    //ajax封装
    function safeAjax(method, url, data, dataType, successFn, errorFn) {
        $.ajax({
            type: method,
            url: url,
            data: data,
            dataType: dataType,
            success: function (json) {
                successFn(json);
            },
            error: function () {
                errorFn();
            }
        });
    }

    //地址数据加载
    function loadAddress(pageIndex, pageMax) {
        var data = {
            "pageIndex": pageIndex,
            "pageMax": pageMax
        };
        safeAjax("post", "/w/shop/listConsigneeAddress.do", data, "json",
            function (data) {
                if (data.result == "SUCCESS") {
                    var addressNum = data.data.totalRecord;
                    // if(addressNum > 0){
                    // $("#add_plus").hide();
                    var address = data.data.rows;
                    $("#addressNum").text(addressNum);
                    var html = '';
                    $.each(address, function (i, item) {
                        var wccaid = item.wccaid;
                        var name = item.coen;
                        var areaid = item.coeareaid;
                        var area = item.coearea.replace(/[ ]/g,"");
                        var local = item.coeaddr;
                        var mobile = item.coemb;
                        var phone = item.coep;
                        var email = item.coeemail;
                        var isdfs = item.isdfs;
                        if (phone == null) {
                            phone = "";
                        }
                        if (mobile == null) {
                            mobile = "";
                        }
                        if (email == null) {
                            email = "";
                        }
                        var div = '<div class="add_content" data-wccaid = "' + wccaid + '">' +
                            '            <div clsss="item_title">' +
                            '                <div class="t_default"><span class="">' + name + ' </span><span class="get_default" data-isdfs=' + isdfs + '>'+langUtil.dialog_mrAddress+'</span></div>' +
                            '                <div class="add_extra ">' +
                            '                    <span title="'+langUtil.Shop_delete+'" id="close_btn">×</span>' +
                            '                </div>' +
                            '            </div>' +
                            '            <div class="item_lcol">' +
                            '                <div class="item">' +
                            '                    <span class="">'+langUtil.dialog_name+'</span>' +
                            '                    <div class="fl">' + name +
                            '                    </div>' +
                            '                </div>' +
                            '                <div class="item">' +
                            '                    <span class="local_area" data-areaid = "' + areaid + '">'+langUtil.dialog_area+'</span>' +
                            '                    <div class="fl">' + area +
                            '                    </div>' +
                            '                </div>' +
                            '                <div class="item">' +
                            '                    <span class="">'+langUtil.dialog_address+'</span>' +
                            '                    <div class="fl">' + local +
                            '                    </div>' +
                            '                </div>' +
                            '                <div class="item">' +
                            '                    <span class="">'+langUtil.dialog_mobile+'</span>' +
                            '                    <div class="fl">' + mobile +
                            '                    </div>' +
                            '                </div>' +
                            '                <div class="item">' +
                            '                    <span class="">'+langUtil.dialog_phone+'</span>' +
                            '                    <div class="fl">' + phone +
                            '                    </div>' +
                            '                </div>' +
                            '                <div class="item">' +
                            '                    <span class="">'+langUtil.dialog_email+'</span>' +
                            '                    <div class="fl">' + email +
                            '                    </div>' +
                            '                </div>' +
                            '            </div>' +
                            '            <div class="item_rcol">' +
                            '                <div class="address_edit">' +
                            '                    <a class="ml10 set_back" href="javascript:;" >'+langUtil.dialog_choose+'</a>' +
                            '                    <a class="ml10 set_default" href="javascript:;" >'+langUtil.dialog_setDefault +'</a>' +
                            '                    <a class="update_address" href="javascript:;">'+langUtil.dialog_updateAddress+'</a>' +
                            '                </div>' +
                            '            </div>' +
                            '        </div>';
                        html += div;
                        $(".local_add").html(html);
                    });
                    $(".get_default[data-isdfs='1']").css("display", "inline").closest(".add_content").find(".set_default").css("display", "none");

                    var orderID = dataUtil.GetQueryString("order");
                    if (orderID == 1) {
                        $(".set_back").css("display", "inline-block");
                        // if($('.set_back').length>=2){
                        //     $('.set_back').first().css('display', 'none');
                        // }
                        $('.set_default').css('display', 'none');
                        $(".set_back").on("click", function () {
                            var this_default = this;
                            var wccaid = $(this_default).closest(".add_content").data("wccaid");
                            var isdfs = $(this_default).closest(".add_content").find(".get_default").data("isdfs");
                            $(this_default).closest(".add_content").find(".get_default").attr("data-isdfs", 1).siblings('.add_content').find(".get_default").attr("data-isdfs", 0);
                            safeAjax("post", "/w/shop/setDefaultConsigneeAddress.do", {
                                    "wccaid": wccaid
                                }, "json",
                                function (data) {
                                    if (data.result == "SUCCESS") {
                                        return;
                                    }
                                },
                                function () {
                                    webUtil.showTip("设置默认地址失败", 1.5);
                                });
                            var orderUrl = dataUtil.GetQueryString("url");
                            if (orderUrl.indexOf('?') ==-1) {
                                window.location.href = orderUrl + "?cfrom=address";
                            }else{
                                window.location.href = orderUrl;
                            }
                        });
                    }
                    // }
                }
            },
            function () {
                webUtil.showTip("加载数据失败", 1.5);
            });
    }

    //打开
    function openAddressDialog(wccaid, this_update) {
        $.ajax({
            url: "dialog.html?pageurl=address",
            type: "GET",
            success: function (data) {
                $("#dialogBg").show();
                $(".add_box").append(data);
                var title = wccaid ? langUtil.address_editAddress : langUtil.address_addAddress;
                $(".add_box .dialog_title").text(title);
                if (wccaid) {
                    var $fl = $(this_update).closest(".add_content").find(".fl");
                    var infoArr = [];
                    $.each($fl, function (i, item) {
                        infoArr.push($(item).text().trim());
                    });
                    var areaid = $(this_update).closest(".add_content").find(".local_area").data("areaid");
                    shopUtil.setAddlist("#show_addlist", areaid);
                    $(".add_name input").val(infoArr[0]); //填充内容
                    $(".add_local input").val(infoArr[2]);
                    $(".add_mobile input").val(infoArr[3]);
                    $(".add_kdmobile input").val(infoArr[4]);
                    $(".add_email input").val(infoArr[5]);
                } else {
                      shopUtil.getAddlist("#show_addlist .add_prov", 0);
                }
            },
            error: function () {

            },
            cache: false
        });
    }

    //关闭
    function closeAddressDialog() {
        $(".add_box #dialog").remove();
        $("#dialogBg").hide();
        $(".div_dailog").hide();
    }
});

/*信息验证--start*/
/**
 * 判断是否是空
 * @param value
 */
function isEmpty(value) {
    if (value == null || value == "" || value == "undefined" || value == undefined || value == "null") {
        return true;
    } else {
        value = (value + "").replace(/\s/g, '');
        if (value == "") {
            return true;
        }
        return false;
    }
}

/**
 * 检查是否含有非法字符
 * @param temp_str
 * @returns {Boolean}
 */
function is_forbid(temp_str) {
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
    for (i = 0; i < forbid_array.length; i++) {
        if (temp_str.search(new RegExp(forbid_array[i])) != -1)
            return false;
    }
    return true;
}

//名字
function checkConsigneeName() {
    var errorFlag = false;
    var errorMessage = "";
    var value = $("#consigneeName").val();
    if (isEmpty(value)) {
        errorFlag = true;
        errorMessage = langUtil.address_editNameMessage;
    } else {
        if (value.length > 25) {
            errorFlag = true;
            errorMessage = langUtil.address_editNameMessageNumber;
        }
        if (!is_forbid(value)) {
            errorFlag = true;
            errorMessage = langUtil.address_editNameMessageForbid;
        }
    }
    var el = $("#consigneeNameNote");
    if (errorFlag) {
        el.text(errorMessage);
        el.show();
    } else {
        el.hide();
    }
    return errorFlag;
}

//地区
function checkArea() {
    var flag = false;
    var $addbox = $("#show_addlist").find("select.onadd");
    addHtml = "";
    var test
    $.each($addbox, function (i, item) {
        if ($(item).find("option:selected").data("areasts") == "0") {
            webUtil.showTip("此区域暂不支持配送", 1.5);
            flag = true;
            return false;
        } else if ($(item).val() == "0" || $(item).val()==""){
            webUtil.showTip("请选择配送区域", 1.5);
            flag = true;
            return false;
        }
        addHtml += $(item).find("option:selected").text()+' ';
    });
    if (flag) {
        return flag;
    }
}

//详细地址
function checkConsigneeAddress() {
    var errorFlag = false;
    var errorMessage = "";
    var value = $("#consigneeAddress").val();
    if (isEmpty(value)) {
        errorFlag = true;
        errorMessage = langUtil.address_localMessage;
    }
    if (!is_forbid(value)) {
        errorFlag = true;
        errorMessage = langUtil.address_localMessageForbid;
    }
    if (value.length > 50) {
        errorFlag = true;
        errorMessage = langUtil.address_localMessageOutLength;
    }
    var el = $("#consigneeAddressNote");
    if (errorFlag) {
        el.text(errorMessage);
        el.show();
    } else {
        el.hide();
    }
}

//手机
function checkMobile() {
    var el = $("#consigneeMobileNote");
    var errorFlag = false;
    var errorMessage = "";
    var value = $("#consigneeMobile").val();
    if (isEmpty(value)) {
        errorFlag = true;
        errorMessage = langUtil.address_phoneMessage;
    } else {
        // var regu = /^((1(3[4-9]|5[012789]|8[23478]|4[7]|7[78])|1(3[0-2]|5[56]|8[56]|4[5]|7[6])|1(3[3])|(8[019]))+\d{8})$/;
        var regu = /^((1(33|53|77|8[019])|1(3[0-2]|4[5]|5[56]|7[6]|8[56])|1(3[4-9]|4[7]|5[0-27-9]|7[8]|8[2-478]))+\d{8})|(1700+\d{7})|(^1709+\d{7})|(^1705+\d{7})$/;
        var re = new RegExp(regu);
        if(!(re.test(value))){
            errorFlag = true;
            errorMessage = langUtil.formatError;
        }
    }
    if (!errorFlag) {
        value = $("#consigneePhone").val();
        if ($("#consigneeMobile").val() == $("#consigneePhone").val()) {
            el.hide();
            return false;
        }
        if (!isEmpty(value)) {
            if (!is_forbid(value)) {
                errorFlag = true;
                errorMessage = langUtil.address_phoneMessageForbid;
            }
            if (value.length > 20) {
                errorFlag = true;
                errorMessage = langUtil.address_phoneMessageOutLength;
            }
            var strlength = value.length;
            var patternStr = "(0123456789-*)";
            for (var i = 0; i < strlength; i++) {
                var tempchar = value.substring(i, i + 1);
                if (patternStr.indexOf(tempchar) < 0) {
                    errorFlag = true;
                    errorMessage = langUtil.address_phoneMessageError;
                    break;
                }
            }
            if (strlength >= 4 && value.indexOf("*") > -1) {
                if (!((new RegExp(/.+\*\*\*\*$/).test(value) && (strlength - value.indexOf("*")) < 5) || (new RegExp(/^\d{11}$/).test(value) || new RegExp(/^\d{3}\*\*\*\*\d{4}$/).test(value)))) {
                    errorFlag = true;
                    errorMessage = langUtil.address_phoneMessageError;
                }
            }
        }
    }

    if (errorFlag) {
        el.text(errorMessage);
        el.show();
    } else {
        el.hide();
    }
    return errorFlag;
}

// 校验邮箱
function checkEmail() {
    var errorFlag = false;
    var errorMessage = "";
    var value = $("#consigneeEmail").val();
    if (!isEmpty(value)) {
        if (value.length > 50) {
            errorFlag = true;
            errorMessage = langUtil.address_emailMessageOutLength;
        }
        var myReg = /(^\s*)\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*(\s*$)/;
        if (!myReg.test(value)) {
            errorFlag = true;
            errorMessage = langUtil.address_emailMessageError;
        }
    }
    var el = $("#emailNote");
    if (errorFlag) {
        el.text(errorMessage);
        el.show();
    } else {
        el.hide();
    }
    return errorFlag;
}

/*信息验证--end*/