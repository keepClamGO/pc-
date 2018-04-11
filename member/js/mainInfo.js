var visualH = $(window).height()/2-150;
var visualW = $(window).width()/2-250;
/*选项卡*/
function setToggleTab(){
    $("#orderCon .myOrder_nav li").bind("click", function() {
        var num = $(this).data("class");
        var index = $(this).index();
        $(this).removeClass("on").addClass("on").siblings().removeClass("on");
        $('#orderCon .myOrder_nav_line li').eq(index).removeClass("on").addClass("on").siblings().removeClass("on");
        $(".orderBar").removeClass("orderBox_on");
        $(".orderBar[data-class=" + num + "]").addClass("orderBox_on");
    });
    (function changeNav_line(){
        var tabLineNum=$('#orderCon .myOrder_nav>li');
        for(var i=0,len=tabLineNum.length; i<len; i++){
            $('#orderCon .myOrder_nav_line>li').eq(i).css('width',parseInt(tabLineNum.eq(i).css('width'))-1);
        };
    })()
}
setToggleTab();

function setGreet(){
    var myDate = new Date();
    var h=myDate.getHours();
    var hello="";
    if(h < 6){hello=langUtil.indexC_dayTime1;}
    else if (h < 8){hello=langUtil.indexC_dayTime2;}
    else if (h < 12){hello=langUtil.indexC_dayTime3;}
    else if (h < 14){hello=langUtil.indexC_dayTime4;}
    else if (h < 18){hello=langUtil.indexC_dayTime5;}
    else if (h < 21){ hello=langUtil.indexC_dayTime6;}
    else if (h < 24){hello=langUtil.indexC_dayTime7;}
    else {hello=langUtil.indexC_dayTime8;}
    $("#content .order_left .nameContent").find(".greeting").html(hello+langUtil.indexC_good);
}
setGreet();

function setPersonInfo(){
    $.when(shopUtil.getPersonInfo()).done(function(data) {
        var info = data;
        console.log("个人信息.......");
        console.log(info);
        var memPic = info.csthi;
        if (memPic) {
            $(".memImg").find("img").attr("src", memPic)
        }
        $(".nameContent").find(".memName").html(info.cstacc);
    });
}
setPersonInfo();

/*购物车的产品数*/
function getShopCartNum(){
    $.when(shopUtil.loadCartData()).done(function(data) {
        //var jsonData = shopUtil.loadCartData();
        /* console.log("购物车数据.........");
         console.log(jsonData);*/
        /* var listNum=0;
         $.each(jsonData,function(key,item){
         listNum +=item.ct;
         });*/
        $("#shopCartNum").html(data.length);
    });
}
/*未支付,未收货订单数*/
function getShopWaitReceiveNum(listNumber){
    var waitOrderData = listNumber.num5;
    var unpayData = listNumber.num3;
    $("#waitPay").html(unpayData);
    $("#waitReceive").html(waitOrderData);
}

/*获取购物车列表*/
function getShopCartList() {
    getShopCartNum();
    $.when(shopUtil.loadCartData()).done(function(data){
        var jsonData =data.slice(0,6)
        var cartListStr = "";
        if (jsonData.length > 0) {
            console.log("购物车列表.....");
            console.log(jsonData);
            $.each(jsonData, function (key, item) {
                var totalPrice = item.slpic * item.ct;
                parseFloat(totalPrice).toFixed(2);
                parseFloat(item.slpic).toFixed(2);

                cartListStr += '<tr style="border-bottom: 1px solid #e8e8e8;" data-wsctid="' + item.wsctid + '">' +
                    '<td class="myOrder_infos" colspan="3" style="border-left: 1px solid #e8e8e8;">' +
                    '<div class="myOrder_info clearfix">' +
                    '<div class="myOrder_goods">' +
                    '<span class="myOrder_img">';
                if(item.furl){
                    cartListStr += '<img src="' + item.furl + '" alt="" />'
                }else{
                    cartListStr += '<img src="'+imgPath+'/images/nopic.jpg" alt="暂无图片" />'
                }
                cartListStr += '</span>' +
                    '<div class="myOrder_intro"><span>' + item.pdn + '</span></div>' +
                    '</div>' +
                    '<div class="myOrder_price">' +
                    '<p><span class="myOrder_nowPrice">' + langUtil.Global_Amount+item.slpic + '</span></p>' +
                    '</div>' +
                    '<div class="myOrder_count">' +
                    '<p>' + item.ct + '</p>' +
                    '</div>' +
                    '</div>' +
                    '</td>' +
                    '<td>' +
                    '<span class="orderPrice">' + langUtil.Global_Amount+totalPrice + '</span>' +
                    '</td>' +
                    '<td style="border-right: 1px solid #e8e8e8;">' +
                    '<p class="myOrder_handle2" onclick="delGood(this)">'+langUtil.indexC_del+'</p>' +
                    /*'<p class="myOrder_handle2">加入收藏夹</p>' +*/
                    '</td>' +
                    '</tr>'
            });
            $(".orderBar[data-class='shopCart_box']").find("tbody").append(cartListStr);
        } else {
            cartListStr += '<div class="empty_box goodEmpty_box">' +
                '<i class="empty_icon noGood_icon"></i>' +
                '<div class="empty_txt noGood_txt">' +
                ''+langUtil.orderlist_noGoodsTip+'<a href="'+realpath+'index.html">'+langUtil.orderlist_toBuy+' >></a>' +
                '</div>' +
                '</div>';
            $(".orderBar[data-class='shopCart_box']").append(cartListStr);
        }
    });
}
getShopCartList();

function delGood(e){
    $(e).parents("tr").addClass("edit_good");
    var delStr = '<div class="del_dialog" style="position:fixed;left:'+visualW+'px;top:'+visualH+'px;">' +
                    '<div class="dialog_title">' +
                        '<span>'+langUtil.orderlist_dialog_delTip+'</span>' +
                        '<a class="dialog_close" onclick="closeGoodDialog()"></a>' +
                    '</div>' +
                    '<div class="dialog_content">' +
                        '<div class="tip_box">' +
                            '<i class="tip_icon"></i>' +
                            '<div class="tip_item">' +
                                '<div class="tip_txt1">'+langUtil.indexC_delTip1+'</div>' +
                                '<div class="tip_txt2">'+langUtil.indexC_delTip2+'</div>' +
                                '<div class="tip_btn">' +
                                    '<a class="btn_1 del_confirm" onclick="delGoodConfirm()">'+langUtil.indexC_del+'</a>' +
                                    '<a class="btn_2 del_cancel" onclick="closeGoodDialog()">'+langUtil.ordercart_think+'</a>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="dialog_mask"></div>';
    $("body").append(delStr);
}

function delGoodConfirm(){
    var delArr = [];
    var goodId = $(".edit_good").data("wsctid");
    /*console.log("商品ID........");
    console.log(goodId);*/
    delArr.push(goodId);
    $.when(shopUtil.delCartData(delArr)).done(function(delFlag){
        if(delFlag){
            $(".edit_good").remove();
            closeGoodDialog();
            getShopCartNum();
        }
    })

}
function closeGoodDialog(){
    $(".del_dialog").remove();
    $(".dialog_mask").remove();
    $(".edit_good").removeClass("edit_good");
}

/*
* 订单列表   参数 0 -- 未支付订单   1 -- 未收货订单
* */
function getUnpayOrder(type){
    if(type){
        //未收货
        $.when(shopUtil.loadOrderData(1,5,5)).done(function(orderList){
            getShopWaitReceiveNum(orderList);
            renderList(orderList,type)
        });
    }else{
        //未支付
        $.when(shopUtil.loadOrderData(1,5,3)).done(function(orderList){
            getShopWaitReceiveNum(orderList);
            renderList(orderList,type)
        });
    }

}
function renderList(orderList,type){
    var dataRows = orderList.rows.slice(0,6);
    var unpayStr = "";
    if(dataRows.length > 0){
        $.each(dataRows,function(key,item){
            unpayStr += '<tbody data-wcoid="' + item.wcoid + '"><tr class="myOrder_sep_row"><td colspan="6"></td></tr>' +
                '<tr class="myOrder_num"><td colspan="6">' +
                ''+langUtil.orderlist_order_num+langUtil.Global_symbol+'<span>'+item.wcono+'</span>' +
                ''+langUtil.orderlist_order_date+langUtil.Global_symbol+'<span>'+item.crdt+'</span>' +
                '</td></tr>' +
                '<tr><td class="myOrder_infos" colspan="3">';
            $.each(item.wcodList,function(k,good){
                var slpic = parseFloat(good.slpic).toFixed(2);
                var mktpic = parseFloat(good.mktpic).toFixed(2);
                unpayStr +='<div class="myOrder_info clearfix">' +
                    '<div class="myOrder_goods">' +
                    '<span class="myOrder_img">';
                if(good.furl){
                    unpayStr += '<img src="'+good.furl+'" alt=""/>'
                }else{
                    unpayStr += '<img src="'+imgPath+'/images/nopic.jpg" alt="暂无图片"/>'
                }
                unpayStr += '</span>' +
                    '<div class="myOrder_intro"><span>'+good.pdn+'</span></div>' +
                    '</div>' +
                    '<div class="myOrder_price"><p>';
                if(good.mktpic){
                    unpayStr +='<span class="myOrder_oldPrice">'+langUtil.Global_Amount+mktpic+'</span><br/>';
                }
                unpayStr +='<span class="myOrder_nowPrice">'+langUtil.Global_Amount+slpic+'</span></p>'+
                    '</div>' +
                    '<div class="myOrder_count">' +
                    '<p>'+good.ct+'</p>' +
                    '</div>' +
                    '</div>';
            })
            var ota = parseFloat(item.ota).toFixed(2);
            var stp = parseFloat(item.stp).toFixed(2);
            unpayStr +=    '</td>' +
                '<td>' +
                '<span class="orderPrice">'+langUtil.Global_Amount+ota+'</span>' +
                '<p class="otherPrice">'+langUtil.orderlist_order_price1+'<span >'+langUtil.Global_Amount+stp+'</span>'+langUtil.orderlist_order_price2+'</p>' +
                '</td>' +
                '<td>' ;
            if(type){
                unpayStr += '<p>'+langUtil.orderlist_order_status4+'</p>';
            }else{
                var wpTxt;(item.wptid==1)?wpTxt=langUtil.orderlist_order_status2:wpTxt=langUtil.orderlist_order_status1;
                unpayStr += '<p>'+wpTxt+'</p>';
            }
            unpayStr += '<a href="orderdetail.html?wcoid='+item.wcoid+'" class="myOrder_detail">'+langUtil.orderlist_order_detail+'</a>' +
                '</td>' +
                '<td>';
            if(type){
                unpayStr += '<a class="myOrder_handle1" href="orderdetail.html?wcoid='+item.wcoid+'">'+langUtil.orderlist_order_operation4+'</a>';
                /*'<p class="myOrder_handle2 cancel_handle"">再次购买</p>';*/
            }else{
                if(item.wptid!=1){
                    unpayStr += '<a class="myOrder_handle1" href="payment.html?wcoid='+item.wcoid+'">'+langUtil.orderlist_order_operation1+'</a>';
                }
                unpayStr +=  '<p class="myOrder_handle2 cancel_handle" onclick="cancelOrder(this)">'+langUtil.orderlist_cancel_order+'</p>';
            }
            unpayStr+='</td>' +
                '</tr></tbody>';
        });
        /*var pageStr = '<tfoot>' +
                        '<tr class="myOrder_sep_row">' +
                            '<td colspan="6"></td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td colspan="6"><ul class="pagination "></ul></td>' +
                        '</tr>' +
                    '</tfoot>';*/
        if(type){
            $(".orderBar[data-class='receipt_box']").find("table").append(unpayStr);
            /* $(".orderBar[data-class='receipt_box']").find("table").append(pageStr);*/
        }else{
            $(".orderBar[data-class='payment_box']").find("table").append(unpayStr);
            /*$(".orderBar[data-class='payment_box']").find("table").append(pageStr);*/
        }
    } else {
        unpayStr += '<div class="empty_box orderEmpty_box">' +
            '<i class="empty_icon noOrder_icon"></i>' +
            '<div class="empty_txt noOrder_txt">' +
            langUtil.indexC_nAboutOrder +
            '</div>' +
            '</div>';
        if(type){
            $(".orderBar[data-class='receipt_box']").append(unpayStr);
        }else{
            $(".orderBar[data-class='payment_box']").append(unpayStr);
        }
    }
    /*function orderPage(){
        var $page = $(".pagination");
        var pIndex,pMax,pNum,totalRecord;
        pIndex = orderList.pageIndex;
        pMax = orderList.pageMax;
        pNum = orderList.pageNum;
        totalRecord = orderList.totalRecord;
        dataUtil.page($page, pIndex, pMax, pNum, totalRecord);
        //清除之前的绑定事件
        $page.undelegate("a","click");
        //绑定分页事件
        $page.delegate("a","click",function(e){
            e.stopPropagation();
            e.preventDefault();
            dataUtil.loadPageInfo(id,$(this),$(this).data("page"),".myOrder_box");
            orderPage();
        });
    }
    orderPage();*/
}
/*未支付*/
getUnpayOrder(0);
/*未收货*/
getUnpayOrder(1);

/*取消订单*/
function cancelOrder(e){
    $(e).parents("tbody").addClass("cancel_order");
    var cancelStr = '<div class="cancel_dialog" style="position:fixed;left:'+visualW+'px;top:'+visualH+'px;">' +
                        '<div class="dialog_title">' +
                            '<span>'+langUtil.orderlist_dialog_delTip+'</span>' +
                            '<a class="dialog_close" onclick="closeCancelDialog()"></a>' +
                        '</div>' +
                        '<div class="cancel_content">' +
                            '<div class="cancelReason_list">' +
                                '<div class="reason" data-reason="1">'+langUtil.orderlist_dialog_cancelReason1+'<i></i></div>' +
                                '<div class="reason" data-reason="2">'+langUtil.orderlist_dialog_cancelReason2+'<i></i></div>' +
                                '<div class="reason" data-reason="3">'+langUtil.orderlist_dialog_cancelReason3+'<i></i></div>' +
                                '<div class="reason" data-reason="4">'+langUtil.orderlist_dialog_cancelReason4+'<i></i></div>' +
                                '<div class="reason" data-reason="5">'+langUtil.orderlist_dialog_cancelReason5+'<i></i></div>' +
                                '<div class="reason" data-reason="6">'+langUtil.orderlist_dialog_cancelReason6+'<i></i></div>' +
                            '</div>' +
                            '<div class="btn_item">' +
                                '<a href="javascript:;" class="btn_cancel" onclick="closeCancelDialog()">'+langUtil.ordercart_think+'</a>' +
                                '<a href="javascript:;" class="btn_disabled btn_confirm">'+langUtil.Global_submit+'</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="dialog_mask"></div>';
    $("body").append(cancelStr);
    $(".cancel_dialog .cancel_content .reason").bind("click",function(){
        $(this).addClass("selected").siblings().removeClass("selected");
        if($(".cancel_dialog .cancel_content .reason").hasClass("selected")){
            $(".cancel_dialog .cancel_content .btn_item").find(".btn_confirm").attr("onclick","submitReason(this)").removeClass("btn_disabled");
        }
    });
    $(".cancel_dialog .cancel_content .reason").hover(function(){
        $(this).addClass("reasonHover");
    },function(){
        $(this).removeClass("reasonHover");
    });
}

function closeCancelDialog(){
    $(".cancel_dialog").remove();
    $(".dialog_mask").remove();
}
function submitReason(e){
    console.log("提交取消订单理由");
    var delReaNode = $(e).parents(".cancel_content").find(".cancelReason_list");
    var reasonNum = $(delReaNode).find(".selected").data("reason");
    console.log("选择的理由编号....");
    console.log(reasonNum);
    var canrm=$('.reason.selected ').text();
    var delArr = [];
    var wcoid = $(".cancel_order").data("wcoid");
    delArr.push(wcoid);
    $.when( shopUtil.cancelOrderData(delArr,canrm)).done(function(delData){
        if(delData){
            $(".cancel_order").remove();
            closeCancelDialog();
            getShopUnpayNum();
        }
    })
}