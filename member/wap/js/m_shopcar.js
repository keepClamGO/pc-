    //返回键
    function backHistory() {
    	wapUtil.backHistory();
    }
    function Edit() {
    	if($(".edit").html() == "编辑") {
    		$(".edit").html("完成");
    		var bottom_del = '<div class="selectAllBtnWrap bottom_del">' +
    			'<i id="selectAllInMallCart" class="icon m_iconfont icon-round g_color pay-checkAll"></i><span class="mCartSelectAllText pay-checkAll">全选</span>' +
    			'</div>' +
    			'<a class="del_button">删除</a>'
    		var i = '<i class="icon m_iconfont icon-round check-one"></i>'
    		$(".bottom").html(bottom_del)
    		$(".cart_nouse").replaceWith('<i class="icon m_iconfont icon-round check-one"></i>'); //可删除无效商品
    		$("i[class*='icon-round']").parents(".mall_product").find(".num").val(99); //ct = 99 可被选中
    		$(".param_line").css("display", "none") //影藏编辑页
   			$("#m_shopcart_number").html(0) //重置选中个数
    		$("i[class*='icon-round']").removeClass("icon-roundcheckfill g_color").addClass("icon-round"); //移除单选按钮
    		$(".mall_product").removeClass("checked_product");
    	} else {
    		$(".edit").html("编辑");
    		m_initMyInformation();
    		var bottom_pay = '<div class="selectAllBtnWrap">' +
    			'<i id="selectAllInMallCart" class="icon m_iconfont icon-round  pay-checkAll"></i><span class="mCartSelectAllText pay-checkAll">全选</span>' +
    			'</div>' +
    			'<div class="payCount_line">' +
    			'<div class="totalTr">' +
    			'<span class="totalKey"> 合计：</span><span class="unit-price-pay">￥</span><span class="totalprice">0.00</span>' +
    			'</div>' +
    			'<div class="cutTr" style="display:none">' +
    			'<span class="subKey"> 总额：</span><span class="unit-price-pay">￥</span><span class="subprice">0.00</span>' +
    			'<span class="cutKey"> 立减：</span><span class="unit-price-pay">￥</span><span class="cutprice">0.00</span>' +
    			'</div>' +
    			'</div>' +
    			'<a class="g_button cartSettle">结算(0)</a>'
    		$(".bottom").html(bottom_pay)
    		goodsnumber();
    		$("i[class*='icon-round']").removeClass("icon-roundcheckfill g_color").addClass("icon-round");
    		$(".mall_product").removeClass("checked_product");
    	}
    }
    //判断是否全选
    function judge(){	
    	$("i[class*='check-one']").each(function(){
    		console.log($(this).parents(".mall_product").find(".num").val())
    		if ($(this).parents(".mall_product").find(".num").val() > 0){  			
    			 $(this).addClass("use"); // ct>0
    		}
    	})
		var chsub = $("i[class*='use']").length;
    	var checkedsub = $("i[class*='check-one icon-roundcheckfill g_color use']").length  //获取选中的subcheck的个数  
    	
    		if(checkedsub == chsub) {
	    		$("i[class*='use']").removeClass("icon-round").addClass("icon-roundcheckfill g_color");
	    		$("i[class*='checkAll']").removeClass("icon-round").addClass("icon-roundcheckfill g_color");
	    		return true;
	    	}else {
	    		$("i[class*='pay-checkAll']").removeClass("icon-roundcheckfill g_color").addClass("icon-round");
	    		$("i[class*='checkAll']").removeClass("icon-roundcheckfill").addClass("icon-round");
	    		$("i[class*='use']").removeClass("use")
	    		return false;
	    	}
    	
    	
    }
    //单选
    $(".goods").on('click', ".check-one", function() {
    	var _this = $(this);
    	if($(_this).parents(".mall_product").find(".num").val() == 0) {
    		webUtil.showTip("此商品暂缺货", 1);
    	} else {
    		if($(_this).hasClass("icon-round") && $(_this).parents(".mall_product").find(".num").val() > 0) {
    			$(_this).removeClass("icon-round use").addClass("icon-roundcheckfill g_color use");
    			$(_this).parent().parent().addClass("checked_product");
    			goodsnumber();
    			priceTotal();
    		} else {
    			$(_this).removeClass("icon-roundcheckfill g_color use").addClass("icon-round use");
    			$(_this).parent().parent().removeClass("checked_product");
    			goodsnumber();
    			priceTotal();
    		}
    		judge() ? $(_this).parent().parent().addClass("checked_product") : 0;
    	}

    })
    //支付部分全选
    $(".bottom").on('click', '.pay-checkAll', function() {
    	if($(this).parent().find("#selectAllInMallCart").hasClass("icon-round")){
    		$("i[class*='icon-round']").each(function(){
    			if ($(this).parents(".mall_product").find(".num").val() > 0){
    				$(this).removeClass("icon-round use").addClass("icon-roundcheckfill g_color use");
    				$(this).parents(".mall_product").addClass("checked_product");
    			}
    		})
    		$("#selectAllInMallCart").removeClass("icon-round").addClass("icon-roundcheckfill g_color ");
    		goodsnumber();
    		priceTotal();
    	} else {
    		$("i[class*='check-one icon-round']").removeClass("icon-roundcheckfill g_color use").addClass("icon-round use");
    		$("i[class*='check-one icon-round']").parents(".mall_product").removeClass("checked_product");
    		$("#selectAllInMallCart").removeClass("icon-roundcheckfill g_color").addClass("icon-round");
    		goodsnumber();
    		priceTotal();
    	}
    });

	//初始化
    function m_initMyInformation() {
    	$.when(shopUtil.loadCartData()).done(function(CartData){
    	if(CartData && CartData.length != 0) {
    		var item = CartData;
    		var item_total = []; //多条数据一次填充
    		for(var i = 0; i < item.length; i++) {
    			var state = "库存";
    			var ct = item[i].ct; //数量
    			var slpic = item[i].slpic; //产品价格
    			var pdid = item[i].pdid; //产品id
    			var pdn = item[i].pdn; //产品名称
    			var rm = item[i].rm; //说明
    			if(rm == null) {
    				rm = langUtil.ordercart_rm;
    			}
    			var wsctid = item[i].wsctid; //主键id
    			var furl = item[i].furl;
    			var isshf = item[i].isshf;
    			var pdsts = item[i].pdsts;
    			var pdstc = item[i].pdstc;
    			var mktpic = item[i].mktpic; //优惠价格
    			if(!furl) {
    				furl = imgPath + '/images/nopic.jpg';
    			}
    			if (pdstc == 0 ){
    				ct = 0 ;
    			}
    			var cart_use = "";
    			if(!isshf || !pdsts) {
    				cart_use = '<div id="selectBtn1"><span class = "cart_nouse">失效</span></div>';
    				pdstc = "已下架"
    				state = "状态"
    			} else {
    				cart_use = '<div id="selectBtn1">' +
    					'<i class="icon m_iconfont icon-round check-one"></i>' +
    					'</div>'
    			}
    			var shop_item = '<div class= "J_noSelect mall_product_con" id="cart_' + wsctid + '"  data-wsctid ="' + wsctid + '">' +
    				'<div class="discount" style="display:none">' +
    				'<span class="tip">满减</span>已购买20件，以减30元' +
    				'</div>' +
    				'<div class="mall_product clearfix">' +
    				cart_use +
    				'<div class="left">' +
    				'	<a href="#"><img class="imgClass" src="' + furl + '"></a>' +
    				'</div>' +
    				'<div class="right flex1">' +
    				'<div class="product_name" data-pdid="' + pdid + '">' +
    				'<a class="cart_message" href="#">' + pdn + '</a><br />' +
    				'<span class="cart_number">' + state + '：<span id= "cart_pdstc">' + pdstc + '</span></span>' +
    				//'<a class="cart_number" href="#">' + pdn + '</a>' 
    				'</div>' +
    				'<span class = "cart_mktpic" style="width: 100%; height: 2rem;display: none;">' + mktpic + '</span>' +
    				'<div class="product_param">' +
    				'<div class="mallPrice g_mainColor"><span class="unit-price product">' + langUtil.ordercart_Amount + '</span><span class="mallPrice_one g_mainColor">' + slpic.toFixed(2) + '</span></div>' +
    				'<div class="param_line">' +
    				'<span class="cut icon m_iconfont icon-move"></span>' +
    				'<input class="num" type="text" data-num ="' + ct + '" value =' + ct + '>' +
    				'<span class="add icon m_iconfont icon-add1"></span>' +
    				'</div>' +
    				'</div>' +
    				'</div>' +
    				'</div>' +
    				'</div>'
    			item_total = item_total + shop_item;
    			$item_total = $(item_total);	
    		}
    		$(".goods").html($item_total);
    		$(".cart_nouse").parents(".mall_product").css("background", "#f7f7f7");
    		$(".cart_nouse").parents(".mall_product").find(".num").attr("disabled", true);
    		$("#m_shopcart .public_navigation").hide();
    		priceTotal();
    	}
    	});
    }
    m_initMyInformation();

    $(".goods").on('click', ".add", function() {
    	var _this = $(this);
    	if(_this.parents(".mall_product").find(".check-one").length == 0) {
    		console.log("产品已经失效 请重新选择")
    	} else {
    		var wsctid = $(_this).parents(".mall_product_con").data("wsctid"); //"wsctid":"购物车主键id",
    		var pdid = $(_this).parent().parent().siblings(".product_name").data("pdid"); //"pdid":"产品id(必填)",
    		var data_num = $(_this).siblings(".num").attr('data-num');
    		var $inputVal = _this.siblings('.num').val();
    		$(_this).prev().val(++$inputVal);
    		$inputVal = $inputVal;
    		var ct = $inputVal; //"ct":"数量(默认1)",
    		$(_this).prev().attr("data-num", ct); //给自定义属性data-num赋值ct
    		var rn = 222; //非必选项
    		$.when(shopUtil.setCart(pdid, wsctid, ct)).done(function(flag){
				var setCart = flag;
	    		var data_num = $(_this).siblings(".num").attr('data-num');
	    		if(setCart) {
	    			if($(_this).parents(".flex1").siblings(".selectBtn1").find(".cart_nouse").length == 0) {
	    				$(_this).parents(".mall_product").find(".check-one").removeClass("icon-round use").addClass("icon-roundcheckfill g_color use");
	    				$(_this).parents(".mall_product").addClass("checked_product");
	    				judge();
	    				priceTotal();
	    				goodsnumber();
	    			} else {
	    				$(_this).prev().val(0)
	    			}
	    		} else {
	    			$(_this).prev().val(data_num);
	    			$inputVal = data_num;
	    		}
    		});
    	}
    });
    //cut 
    $(".goods").on('click', ".cut", function() {
    	var _this = $(this);
    	if(_this.parents(".mall_product").find(".check-one").length == 0) {
    		console.log("产品已经失效 请重新选择")
    	} else {
    		var wsctid = $(_this).parents(".mall_product_con").data("wsctid"); //"wsctid":"购物车主键id",
    		var pdid = $(_this).parent().parent().siblings(".product_name").data("pdid"); //"pdid":"产品id(必填)",
    		var $inputVal = $(_this).next().val();
    		if($inputVal > 1) {
    			$(_this).next().val(--$inputVal);
    			$inputVal = $inputVal;
    		}
    		var ct = $inputVal;
    		$.when(shopUtil.setCart(pdid, wsctid, ct)).done(function(flag){
				var setCart = flag;	    	
	    		if(setCart && ct>0) {
	    			if($(_this).parents(".flex1").siblings(".selectBtn1").find(".cart_nouse").length == 0) {
	    				$(_this).parents(".mall_product").find(".check-one").removeClass("icon-round use").addClass("icon-roundcheckfill g_color use");
	    				$(_this).parents(".mall_product").addClass("checked_product");
	    				judge();
	    				priceTotal();
	    				goodsnumber();
	    			} else {
	    				$(_this).prev().val(0)
	    			}
	    		} else {
	    			$(_this).next().val(0);
	    		}
    		});
    	}
    });
    //输入数量计算价格
    $(".goods").on('blur', ".num", function() {
    	var re = /^[1-9]+[0-9]*]*$/
    	var _this = $(this);
    	if(_this.parents(".mall_product").find(".check-one").length == 0) {
    		console.log("产品已经失效 请重新选择")
    	} else {
    		var wsctid = $(_this).parents(".mall_product_con").data("wsctid"); //"wsctid":"购物车主键id",
    		var pdid = $(_this).parent().parent().siblings(".product_name").data("pdid"); //"pdid":"产品id(必填)",
    		var $inputVal = $(_this).val();
    		var data_num = $(_this).attr('data-num');
    		if(re.test($inputVal)) {
    			var ct = $inputVal;
    			$(_this).attr("data-num", ct); //给自定义属性data-num赋值ct
    			$.when(shopUtil.setCart(pdid, wsctid, ct)).done(function(flag){
					var setCart = flag;
	    			if(setCart) {
	    				if($(_this).parents(".flex1").siblings(".selectBtn1").find(".cart_nouse").length == 0) {
	    					$(_this).parents(".mall_product ").find(".check-one").removeClass("icon-round use").addClass("icon-roundcheckfill g_color use");
	    					$(_this).parents(".mall_product").addClass("checked_product");
	    					judge();
	    					priceTotal();
	    					goodsnumber();
	    				} else {
	    					$(_this).prev().val(0)
	    				}
	    			} else {
	    				$(_this).val(data_num);
	    				$inputVal = data_num;
	    			}
    			});
    		} else if($inputVal == 0) {
    			webUtil.showTip("商品数目必须大于0", 3); //暂时使用语句
    		} else {
    			webUtil.showTip(langUtil.ordercart_numbertip, 3);
    		}
    	}
    });
    //删除商品
    function cofirm1(wsctids_array) {
    	$.confirm("确定要删除此商品吗?", "温馨提示", function() {
    		var chsub = $(".checked_product").length; //获取subcheck的个数
    		if(wsctids_array.length == 1) { //删除一条
    			$(".checked_product").each(function() {
    				console.log($(this))
    				if($(this).parent().attr("data-wsctid") == wsctids_array) {
    					$(this).parent().remove();
    					$.when(shopUtil.delCartData(wsctids_array)).done(function(flag){});
    					priceTotal();
    					goodsnumber();
    				}
    			})
    			$.when(shopUtil.loadCartData()).done(function(CartData){
					var CartData = CartData ; 
				});
    			var CartData_use = [];
    			for(var i = 0; i < CartData.length; i++) {
    				if(CartData[i].isshf && CartData[i].pdsts) {
    					CartData_use.push(CartData[i].pdid);
    				}
    			}
    			if(chsub == 1 || CartData_use.length == 0) {
    				m_initMyInformation();
    				priceTotal();
    				goodsnumber();
    			}
    		} else { //删除多条
    			var chsub = $("i[class*='check-one']").length; //获取subcheck的个数  
    			var checkedsub = $("i[class*='check-one']").parent().parent(".checked_product").length; //获取选中的subcheck的个数  
    			if(chsub == checkedsub) {
    				$.when(shopUtil.delAllCartData()).done(function(flag){
	    				m_initMyInformation();
	    				priceTotal();
	    				goodsnumber();
    				});
    			} else {
    				$.when(shopUtil.delCartData(wsctids_array)).done(function(flag){})
    				goodsnumber();
    			}
    			$(".checked_product").each(function() {
    				n = $(this).parents(".mall_product_con").index();
    				$(".goods").find(".mall_product_con:eq(" + n + ")").remove();
    				$(".subTotal").html('0');
    				$(".selectTotal").html('0');
    				goodsnumber();
    			})
    		}
    		$.toast("商品已删除");
    	}, function() {
    		//取消操作
    	});
    }
    //删除所选及清空  简化处理
    $(".bottom").on('click', '.del_button', function() {
    	var wsctids_array = [];
    	$(".checked_product").each(function() {
    		var wsctids = $(this).parent().data("wsctid");
    		wsctids_array.push(wsctids);
    	});
    	var checkedsub = $(".checked_product").length; //获取选中的subcheck的个数  
    	if(checkedsub == 0) {
    		webUtil.showTip(langUtil.ordercart_placecheck, 3);
    	} else {
    		cofirm1(wsctids_array);
    	}
    })
    //商品数量
    function goodsnumber() {
    	var i = $("i[class*='icon-roundcheckfill']").parents(".mall_product_con").find(".checked_product").length;
    	$(".cartSettle").html("结算(" + i + ")");
    	$("#m_shopcart_number").html(i);
    }
    //计算总价
    function priceTotal() {
    	var s = 0;
    	var a = 0;
    	$(".checked_product").each(function() {
    		if($(this).find(".icon-roundcheckfill")) {
    			var t = parseFloat($(this).parents(".mall_product_con").find('input[class*=num]').val()).toFixed(2); //数量
    			var p = parseFloat($(this).parents(".mall_product_con").find(".mallPrice_one").text()).toFixed(2); //价格
    			var q = parseFloat($(this).parents(".mall_product_con").find(".cart_mktpic").text()).toFixed(2); //原价
    			if(parseInt(t) == "" || undefined || null || isNaN(t) || isNaN(parseInt(t))) {
    				t = 0;
    			}
    			s += parseInt(t) * parseFloat(p).toFixed(2);
    			a += parseInt(t) * parseFloat(q).toFixed(2);
    		} else {
    			s = s;
    			a = a;
    		}
    	})
    	$(".totalprice").text(parseFloat(s).toFixed(2));
    	$(".subprice").text(parseFloat(a).toFixed(2));
    	$(".cutprice").text(parseFloat(a - s).toFixed(2));
    }
    //结算
	$(".bottom").on("click",".cartSettle",function(){
    	require(["jquery.cookie"], function() {
    		var buf_use = [];
    		var buf_nopdn = [];
    		var buf_nouse = [];
    		var CartData_use = [];
    		var CartData_nopdn = [];
    		var CartData_nouse = [];
    		$.when(shopUtil.loadCartData()).done(function(CartData){
    		for(var i = 0; i < CartData.length; i++) {
    			if(CartData[i].isshf && CartData[i].pdsts && (CartData[i].ct <= CartData[i].pdstc)) {
    				CartData_use.push(CartData[i].pdid); //正常商品
    			} else if(CartData[i].ct > CartData[i].pdstc) {
    				CartData_nopdn.push(CartData[i].pdid); // 库存不足商品
    			} else if(!CartData[i] || !CartData[i].pdsts) {
    				CartData_nouse.push(CartData[i].pdid) //失效商品
    			}
    		}
    		$("i[class*='icon-roundcheckfill']").each(function() {
    			var pdid = $(this).parents(".mall_product").find(".product_name").data("pdid");
    			console.log(pdid)
    			if(CartData_use.indexOf(pdid) > -1) {
    				buf_use.push(pdid); //选中的正常商品
    			} else if(CartData_nopdn.indexOf(pdid) > -1) {
    				buf_nopdn.push(pdid); //选中的库存不足商品
    			} else if(CartData_nouse.indexOf(pdid) > -1) {
    				buf_nouse.push(pdid); //选中的失效商品
    			}
    		});
    		$.cookie('pdid', buf_use, { expires: 7 });
    		//判断是购物车是否有物品
    		if($(".checked_product").length == 0) {
    			webUtil.showTip(langUtil.ordercart_placeselect, 1.5);
    		} else if(buf_use.length == 0 && buf_nopdn.length == 0 && buf_nouse.length == 0) {
    			webUtil.showTip("你没有选中有效的商品，请刷新后重新选择", 2.5);
    		} else if(buf_nopdn.length != 0) {
    			webUtil.showTip("你选中的商品库存不足，请刷新后重新选择", 2.5);
    		} else if(buf_nouse.length != 0) {
    			webUtil.showTip("你选中的商品已下架，请刷新后重新选择", 2.5);
    		} else {
    			location.href = realpath + 'member/orderinfo.html'
    		}
    		});
    	});
    });