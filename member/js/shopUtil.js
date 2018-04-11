if (typeof shopUtil == "undefined") {
	shopUtil = {};
}(shopUtil);
//加入购物车，更新购物车
shopUtil.setCart=function(pdid,wsctid,ct,rn){
	var defer = $.Deferred();
	var flag=false;
	var josnData={};
	josnData["pdid"]=pdid;
	ct?ct=ct:ct=1;
	josnData["ct"]=ct;//更新数量
	if(wsctid){//更新购物车，需传购物车ID
		josnData["wsctid"]=wsctid;//购物车ID
		josnData["rn"]=rn;//备注
	}	
	$.ajax({
		url: "/w/shop/saveWebsiteCustomerCart.do",
		data: josnData,
//		async:false,
		type : "POST",
		success: function (data) {
			if(data.result=="SUCCESS"){
                flag=true;
                defer.resolve(flag);
                webUtil.UpdataCartNum();
			}else if(data.result =="MOREAMOUNT"){
                if(wsctid){
                    var cartIndex=$("#cart_"+wsctid).index();
                    var CartData=$("#ordercart_info").data("cartinfo");
                    //rn = cartInfo.rn;
                    var josnData=CartData[cartIndex];
                    $("#cart_"+wsctid).find("#cart_pdstc").html(data.errorMsg.pdstc)//更新库存
                    $("#cart_"+wsctid).find(".num").attr("data-num",data.errorMsg.pdstc)//库存不足的数量
                    //库存不足提示框
                    var pro_text =langUtil.shopUtil_intro;
                    if(josnData.rm){
                        pro_text=josnData.rm;
                    }
                    var errorMessage =	'<div class="box_cart">'+
                                '<div class="dialog_title">'+
                                    '<span class="tip">'+langUtil.shopUtil_tip+'</span>'+
                                    '<a class="dialog_close" onclick="closebox()"></a>'+
                                '</div>'+
                                '<img id="box-title" src="' + imgPath + '/member/images/tip.png" alt = " " />'+
                                '<span class="choose">'+langUtil.shopUtil_chose+'</span>'+
                                '<span class="introduction">' + josnData.pdn + '<br>' + pro_text + '</span>' +
                                '<span>（'+langUtil.shopUtil_inventory+data.errorMsg.pdstc +'）</span>'+
                                '<button onclick="closebox()">'+langUtil.shopUtil_sure+'</button>'+
                            '</div>'+
                            '<div class="cart_dialog_mask"></div>';
                    $errorMessage = $(errorMessage);
                    $(".goods").append($errorMessage);
                }else{
                    webUtil.showTip(data.errorMsg.msg,1.5);
                }
                flag = false;
            }else if(data.result =="NETWORKERROR" && data.errorMsg.msg=="session已过期"){
                webUtil.showTip(langUtil.shopUtil_login,1.5);
                 setTimeout(function(){
                     window.location.href="login.html?urlType="+window.location.href;
                 },1500)
			}else{
				webUtil.showTip(data.errorMsg.msg,1.5);
			}
		}
	});
	return defer.promise();
}
shopUtil.loadDataList = function(id){
	var $dom = $("#list_info_"+id);//生成列表容器ID,id如果是唯一可以直接写个数字就行
	var pageNo = $dom.data("page");//当前页码，需要先在容器ID添加一个data-page="1"，默认第一页
	var pageMax = $dom.data("max");//一页请求多少条数据，方法同上
    var jstr={};//生成josn数据
        jstr["page"]=pageNo;//建议此种方式拼接数据，不要直接用{"page":1},后期不好维护
        jstr["pageMax"]=pageMax;
    var content;
    $.ajax({
        url : "",//接口地址
        type : "POST",
        data : jstr,
        success : function(data){
            console.log(data.data.rows)
            if(data.result=="SUCCESS"){
                $dom.html("");//先清空上一页的内容
                $.each(data.data.rows,function(i,item){
                    content='<li>'+item+'</li>';
                    $dom.append(content);//分条追加数据
                });
                //加载分页功能
                //dataUtil.page('分页容器对象','第几页','数据总数','一页显示几条','总页数')
                var $page=$("#pagenum");
                dataUtil.page($page,data.data.pageIndex,data.data.totalRecord,data.data.pageMax,data.data.pageNum);
                //清除之前的绑定事件
                $page.undelegate("a","click");
                //绑定分页事件
                $page.delegate("a","click",function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    dataUtil.loadPageInfo(id,$(this),$(this).data("page"),"#list_info_");
                    shopUtil.loadDataList(id);
                });
            }else{
                alert(langUtil.shopUtil_error);
            }
        }
    });
};
shopUtil.loadCartData=function(){
    var CartData;
    if($("#web_customer").length > 0){
        var defer = $.Deferred();
        var josnData={};
        josnData["sortPdid"]=[1,0];
        $.ajax({
            url: "/w/shop/listWebsiteCustomerCart.do",
            data: josnData,
            // async:false,
            type : "POST",
            success: function (data) {
                if(data.result=="SUCCESS"){
                    CartData=data.data;
                    defer.resolve(CartData);
                    if (CartData.length == 0 ){
                    	var nullCar = '<div class="orderBar order_comm orderBox_on" data-class="payment_box">' +
						'<div class="empty_box">' +
						' <i class="empty_icon"></i>' +
						'<div class="empty_txt">' +
						'' + langUtil.ordercart_none + '<a href="index.html">' + langUtil.ordercart_goshop + '>></a>' +
						'</div>' +
						' </div>' +
						' </div>'
					    $("#ordercart_info").html(nullCar);
                    }
                }else{
                    webUtil.showTip(data.errorMsg.msg,1.5);
                }
            }
        });
        return defer.promise();
    }else{
        if(!realpath){
            var realpath="";
        }
        var cart_nologin = '<div class="cart-empty">'
        cart_nologin += '<div class="message">'
        cart_nologin += '<ul>'
        cart_nologin += '<li class="txt">'
        cart_nologin += langUtil.shopUtil_nocommodity
        cart_nologin += '</li>'
        cart_nologin += '<li>'
        cart_nologin +=    '<a href="' + realpath + 'login.html" class="btn-1 login-btn mr10">'+langUtil.shopUtil_log+'</a>'
        cart_nologin +=    '<a href="' + realpath + 'index.html" class="ftx-05">'+langUtil.shopUtil_goshop+'&gt;'
        cart_nologin += '</a>'
        cart_nologin += '</li>'
        cart_nologin += '</ul>'
        cart_nologin += '</div>'
        cart_nologin += '</div>'
        $("#ordercart_info").html(cart_nologin);
        return CartData;
    }
}
//删除购物车商品
shopUtil.delCartData=function(delJson){//需要提供数组形式过来
    var flag=false;
    var defer = $.Deferred();
    if(delJson){
        var josnData={};
        josnData["wsctids"]=delJson;
        $.ajax({
            url: "/w/shop/deleteWSCustomerCartProduct.do",
            data: josnData,
//          async:false,
            type : "POST",
            success: function (data) {
                if(data.result=="SUCCESS"){
                    flag=true;
                    defer.resolve(flag);
                    webUtil.UpdataCartNum();
                }else{
                    webUtil.showTip(data.errorMsg.msg,1.5);
                }
            }
        });
    }else{
        webUtil.showTip(langUtil.shopUtil_checkplace,1.5);
    }
    return defer.promise();
}
//清空购物车商品
shopUtil.delAllCartData=function(){
    var flag=false;
    var defer = $.Deferred();
    $.ajax({
        url: "/w/shop/deleteWSCustomerCart.do",
        data:"",
//      async:false,
        type : "POST",
        success: function (data) {
            if(data.result=="SUCCESS"){
                flag=true;
                defer.resolve(flag);
                webUtil.UpdataCartNum();
            }else{
                webUtil.showTip(data.errorMsg.msg,1.5);
            }
        }
    });
    return defer.promise();
}
//获取可购买区域数据
shopUtil.getAddress=function(){
    var defer = $.Deferred();
	if(!window.AddressJson){
        $.ajax({
            url: "/w/shop/listWebsiteShipArea.do",
            //async:false,
            type : "GET",
            success: function (data) {
                if(data.result=="SUCCESS"){
                    var num=num2=num3=0;
                    var addJson=[];
                    var addObj={};
                    var addObj2={};
                    var addObj3={};
                    var max_length=data.data.length-1;
                    $.each(data.data, function(i,item) {
                        var list=item.areano;
                        if(list.length == 3){
                            num++;
                            num2=num3=0;
                            if(num > 1){
                               addJson.push(addObj); 
                            }
                            addObj={};
                            addObj["arean"]=item.arean;
                            addObj["areano"]=item.areano;
                            addObj["areasts"]=item.areasts;
                            addObj["wsaid"]=item.wsaid;
                            addObj["value"]=[];
                        }else if(list.length == 6){
                            num2++;
                            addObj2={};
                            addObj2["arean"]=item.arean;
                            addObj2["areano"]=item.areano;
                            addObj2["areasts"]=item.areasts;
                            addObj2["wsaid"]=item.wsaid;
                            addObj2["value"]=[];
                            addObj["value"].push(addObj2); 
                        }else if(list.length == 9){
                            num3++;
                            addObj3={};
                            addObj3["arean"]=item.arean;
                            addObj3["areano"]=item.areano;
                            addObj3["areasts"]=item.areasts;
                            addObj3["wsaid"]=item.wsaid;
                            addObj2["value"].push(addObj3); 
                        }
                        if(max_length==i){
                            addJson.push(addObj);
                        }    
                    });
                    window.AddressJson=addJson;
                    defer.resolve(window.AddressJson);
                }else{
                    webUtil.showTip(data.errorMsg.msg,1.5);
                }
            }
        });
        return defer.promise();
    }else{
        return defer.resolve(window.AddressJson)
    }  
}
shopUtil.getAddlist=function(thiz,status){
    var $thiz=$(thiz);
    var addval=$thiz.val();
    var flag=true;
    var $addbox=$thiz.parents(".addlist");
    var type=$thiz.data("type");
    var num=num2=num3=0;
    var html='<option value="0">'+langUtil.shopUtil_check+'</option>';
    var $dom=$thiz;
    var $add_prov=$addbox.find(".add_prov");
    var $add_ctiy=$addbox.find(".add_ctiy");
    var $add_area=$addbox.find(".add_area");
    var $province=$add_prov.children("option:selected");
    var $ctiy=$add_ctiy.children("option:selected");
    var $area=$add_area.children("option:selected");
    var areasts=$thiz.children("option:selected").attr("data-areasts");
    if(areasts==0){
        webUtil.showTip(langUtil.shopUtil_dissupport,1.5);
        $thiz.nextAll("select").html("").hide().removeClass("onadd");
        return false;
    }else if(addval=="0" || addval==""){
        webUtil.showTip(langUtil.shopUtil_delivery,1.5);
        $thiz.nextAll("select").html("").hide().removeClass("onadd");
        return false;
    }else{
        //var addJson=shopUtil.getAddress();
        $.when(shopUtil.getAddress()).done(function(data){
            var addJson=data;
            if(status==0){
                addList=addJson;
            }else{
                var child=$thiz.attr("data-child");
                $dom=$addbox.find("."+child);
                if(type==0){
                    num=$province.attr("data-num");
                    addList=addJson[num].value;
                    $add_ctiy.hide().html("");
                    $add_area.hide().html(html).removeClass("onadd");
                }else if(type==1){
                    num=$province.attr("data-num");
                    num2=$ctiy.attr("data-num");
                    addList=addJson[num].value[num2].value;
                    $add_area.hide().html(html);
                }   
            }
            if(type!==2){
                if(addList.length > 0){
                    $.each(addList, function (i, item) { 
                        html+='<option value="'+item.areano+'" data-num="'+i+'" data-areasts="'+item.areasts+'" data-wsaid="'+item.wsaid+'">'+item.arean+'</option>' ;
                    });
                    $dom.html(html).show().addClass("onadd");  
                }else{
                    $dom.html("").hide().removeClass("onadd");  
                } 
            }
        })
    }
}
shopUtil.setAddlist=function(thiz,status){
    var $addbox=$(thiz);
    var num=num2=num3=0;
    var status=String(status);
    var html_tpl='<option value="0">'+langUtil.shopUtil_check+'</option>';
    var $add_prov=$addbox.find(".add_prov");
    var $add_ctiy=$addbox.find(".add_ctiy");
    var $add_area=$addbox.find(".add_area");
    var prov_id=status.substring(0,3);
    html=html_tpl;
    //var addList=shopUtil.getAddress();
    $.when(shopUtil.getAddress()).done(function(data){
        addList=data;
        $.each(addList, function (i, item) {
            var selected="";
            if(item.areano==prov_id){
                selected="selected";
                num=i;
            }
            html+='<option '+selected+' value="'+item.areano+'" data-num="'+i+'" data-areasts="'+item.areasts+'" data-wsaid="'+item.wsaid+'">'+item.arean+'</option>' ;
        });
        $add_prov.html(html).show().addClass("onadd");
        var ctiy_id=status.substring(0,6);
        var ctiyList=addList[num].value;
        html=html_tpl;
        $.each(ctiyList, function (i, item) { 
            var selected="";
            if(item.areano==ctiy_id){
                selected="selected";
                num2=i;
            }
            html+='<option '+selected+' value="'+item.areano+'" data-num="'+i+'" data-areasts="'+item.areasts+'" data-wsaid="'+item.wsaid+'">'+item.arean+'</option>' ;
        });
        $add_ctiy.html(html).show().addClass("onadd");  
        if(status.length > 6){
            html=html_tpl;
            var areaList=ctiyList[num2].value;
            $.each(areaList, function (i, item) { 
                var selected="";
                if(item.areano==status){
                    selected="selected";
                }
                html+='<option '+selected+' value="'+item.areano+'" data-num="'+i+'" data-areasts="'+item.areasts+'" data-wsaid="'+item.wsaid+'">'+item.arean+'</option>' ;
            });
            $add_area.html(html).show().addClass("onadd");  
        }
    })
}
/*会员订单列表*/
/* 参数一次是 分页页码，分页大小，订单状态，支付状态，发货状态，收货状态 ，是否移动端订单 */
shopUtil.loadOrderData=function(pIndex,pMax,ordssts){
    var defer = $.Deferred();
    var orderData;
    var info={};
    info["pageIndex"] = pIndex;
    info["pageMax"]   = pMax;
    info["ordssts"] = ordssts;
    $.ajax({
        url: "/w/shop/listCustomerOrdersWeb.do",
        data: info,
        async:true,
        type : "POST",
        success: function (data) {
            if(data.result=="SUCCESS"){
                orderData=data.data;
                defer.resolve(orderData);
            }else{
                webUtil.showTip(data.errorMsg.msg,1.5);
            }
        }
    });
    return defer.promise();
}
/*获取个人信息*/
shopUtil.getPersonInfo = function(){
    var defer = $.Deferred();
    var manInfo;
    $.ajax({
        url: '/w/customer/infoDisplayCustomer.do',
        type: 'GET',
        //async:false,
        success: function(data){
            if(data.result=="SUCCESS"){
                manInfo=data.data;
                defer.resolve(manInfo);
            }else{
                webUtil.showTip(data.errorMsg.msg,1.5);
            }
        }
    });
    return defer.promise();
}
//取消订单(发货前取消订单要还库存)
shopUtil.cancelOrderData=function(delJson,canrm){//需要提供数组形式过来
    if(delJson){
        var defer = $.Deferred();
        var jsonData={};
        jsonData["wcoids"]=delJson;
        jsonData["canrm"]=canrm;
        $.ajax({
            url: "/w/shop/disWSCstOrder.do",
            data: jsonData,
            async:true,
            type : "POST",
            success: function (data) {
                if(data.result=="SUCCESS"){
                    defer.resolve(true);
                }else{
                    webUtil.showTip(data.errorMsg.msg,1.5);
                }
            }
        });
        return defer.promise();
    }else{
        webUtil.showTip(langUtil.shopUtil_cancelorder,1.5);
    }

}
//取消订单(完成订单取消不用还库存)
shopUtil.disOrderStatus=function(delJson){//需要提供数组形式过来
    if(delJson){
        var defer = $.Deferred();
        var jsonData={};
        jsonData["wcoid"]=delJson;
        $.ajax({
            url: "/w/shop/disOrderStatus.do",
            data: jsonData,
            async:true,
            type : "POST",
            success: function (data) {
                if(data.result=="SUCCESS"){
                    defer.resolve(true)
                }else{
                    webUtil.showTip(data.errorMsg.msg,1.5);
                }
            }
        });
        return defer.promise();
    }else{
        webUtil.showTip(langUtil.shopUtil_cancelorder,1.5);
    }
}
//删除订单
shopUtil.delOrderData=function(delJson){//需要提供数组形式过来
    if(delJson){
        var defer = $.Deferred();
        var jsonData={};
        jsonData["wcoid"]=delJson;
        $.ajax({
            url: "/w/shop/delWSCstOrder.do",
            data: jsonData,
            async:true,
            type : "POST",
            success: function (data) {
                if(data.result=="SUCCESS"){
                    defer.resolve(true)
                }else{
                    webUtil.showTip(data.errorMsg.msg,1.5);
                }
            }
        });
        return defer.promise();
    }else{
        webUtil.showTip(langUtil.shopUtil_deleteorder,1.5);
    }
    return delFlag;
}
//批量添加商品
shopUtil.batchSetCart=function(key){
    var jsonData={};
    jsonData["key"]=key;
    var defer = $.Deferred();
    $.ajax({
        url: "/w/shop/saveCookieWsCstCart.do",
        data: jsonData,
        async:true,
        type : "POST",
        success: function (data) {
            if(data.result=="SUCCESS"){
                defer.resolve(true)
            }else{
                webUtil.showTip(data.errorMsg.msg,1.5);
            }
        }
    });
    return defer.promise();
}
//提醒发货
shopUtil.remindSend=function(wcoid){
    var jsonData={};
        jsonData["wcoid"]=wcoid;
    var defer = $.Deferred();
    $.ajax({
        url: "/w/shop/remindOutgoing.do",
        data: jsonData,
        async:true,
        type : "POST",
        success: function (data) {
            if(data.result=="SUCCESS"){
                defer.resolve(true)
            }else{
                webUtil.showTip(data.errorMsg.msg,1.5);
            }
        }
    });
    return defer.promise();
}
//确认收货
shopUtil.updateReceivedStatus=function(wcoid){
    if(wcoid){
        var jsonData={};
        var defer = $.Deferred();
        jsonData["wcoid"]=wcoid;
        $.ajax({
            url: "/w/shop/updateReceivedStatus.do",
            data: jsonData,
            async:true,
            type : "POST",
            success: function (data) {
                if(data.result=="SUCCESS"){
                    defer.resolve(true)
                }else{
                    webUtil.showTip(data.errorMsg.msg,1.5);
                }
            }
        });
        return defer.promise()
    }else{
        webUtil.showTip(langUtil.shopUtil_ordererror,1.5);
    }
}