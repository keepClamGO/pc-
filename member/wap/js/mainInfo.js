function setPersonInfo(){
    //var info = shopUtil.getPersonInfo();
    $.when(shopUtil.getPersonInfo()).done(function(info) {
        console.log("移动端个人信息111.......");
        console.log(info);
        var mPic = info.csthi;
        if(mPic){
        $(".memCenter-box .mem-userInfo .m-pic").find("img").attr("src",mPic)
        }
        $(".m-nameTxt").html("账号："+info.cstacc);
    })
}
setPersonInfo();

//监听滚动
function setScroll(){
    var hHeader = $('#content .memCenter-box .mem-header');
    $(document).scroll(function(){
        /*var scrollTop = $(document).scrollTop();*/
        var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        var opcaity=(scrollTop/100>1)?1:scrollTop/100;
        if( scrollTop >48){
            $(hHeader).css({"background":"rgba(255,255,255,"+opcaity+")","border-bottom":+opcaity+"px solid rgba(221,221,221,"+opcaity+")"});
            $(hHeader).find("a").css({"color":"rgba(51,51,51,"+opcaity+")"});
            $(hHeader).find("i").css({"color":"rgba(51,51,51,"+opcaity+")"});
            $(hHeader).find("span").css({"color":"rgba(51,51,51,"+opcaity+")"});
        }else {
            $(hHeader).css({"background-color":"rgba(255,255,255,0)","border-bottom":"0"});
            $(hHeader).find("a").css({"color":"#fff"});
            $(hHeader).find("i").css({"color":"#fff"});
            $(hHeader).find("span").css({"color":"#fff"});
        }
    });
}
setScroll();

/**
 * 退出登录
 */
function memLogout(){
    $("#mem-logOut").click(function(){
        $.confirm("您确定要退出登录吗?", function() {
            //点击确认后的回调函数
            wapUtil.delAutoLgInfo();
        }, function() {
            //点击取消后的回调函数
            return false;
        });
    });
}
memLogout();

/**
 * 购物车数量
 */
function setShopNum(){
    var data = {
        sortPdid : [1,0]
    }
    $.ajax({
        url: "/w/shop/listWebsiteCustomerCart.do",
        data: data,
        async:false,
        type : "POST",
        success: function (data) {
            if(data.result=="SUCCESS"){
                var cartData=data.data;
                if(cartData.length >0){
                   var numStr = "<b class='m-shopCartNum'>"+cartData.length+"</b>";
                    $("#content .memCenter-box .m-shopCart").find(".m-shopCartPos").append(numStr);
                }
            }
        }
    });
}
setShopNum();

/**
 * 待付款、待发货、待收货、已收货 数量
 */
function getOrderNum(){
    var orderNum;
    var info={};
    info["pageIndex"] = 1;
    info["pageMax"]   = 5;
    info["ordssts"] = 1;
    $.ajax({
        url: "/w/shop/listCustomerOrdersWeb.do",
        data: info,
        async:false,
        type : "POST",
        success: function (data) {
            if(data.result=="SUCCESS"){
                orderNum=data.data;
                console.log(orderNum)
                //待付款
                var notPaymentNum = orderNum.num3;
                var notPayStr='',
                    notDeliverStr='',
                    notReceiptStr='',
                    notReceivedStr='';
                if(notPaymentNum){
                    notPayStr += '<div class="m-orderNum m-notPayment">'+notPaymentNum+'</div>';
                }
                $(".mem-myOrder .m-orderCon .notPayment").find(".m-payment").append(notPayStr);
                //待发货
                var notDeliverNum = orderNum.num4;
                if(notDeliverNum){
                    notDeliverStr += '<div class="m-orderNum m-notDeliver">'+notDeliverNum+'</div>';
                }
                $(".mem-myOrder .m-orderCon .notDeliver").find(".m-deliver").append(notDeliverStr);
                //待收货
                var notReceiptNum = orderNum.num5;
                if(notReceiptNum){
                    notReceiptStr += '<div class="m-orderNum m-notReceipt">'+notReceiptNum+'</div>';
                }
                $(".mem-myOrder .m-orderCon .notReceipt").find(".m-noReceive").append(notReceiptStr);
                //已收货
                var receivedNum = orderNum.num2;
                if(receivedNum){
                    notReceivedStr += '<div class="m-orderNum m-Received">'+receivedNum+'</div>';
                }
                $(".mem-myOrder .m-orderCon .Received").find(".m-received").append(notReceivedStr);
            }else{
                wapUtil.showTip(data.errorMsg.msg,1.5);
            }
        }
    });
}
getOrderNum();
