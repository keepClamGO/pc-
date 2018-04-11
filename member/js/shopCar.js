var $item_total = []; //当没有商品时初始化为空
function closebox() {
	$(".box_cart").remove();
	$(".cart_dialog_mask").remove();
}
closebox();
$(".try").click(function() {
	require(["jquery.cookie"], function() {
		var buf_use = [];
		var buf_nopdn = [];
		var buf_nouse = [];
		var CartData_use = [];
		var CartData_nopdn = [];
		var CartData_nouse = [];
		$.when(shopUtil.loadCartData()).done(function(CartData){
			var CartData = CartData ; 
			for(var i = 0; i < CartData.length; i++) {
				if(CartData[i].isshf && CartData[i].pdsts && (CartData[i].ct <= CartData[i].pdstc) && (CartData[i].ct > 0) ) {
					CartData_use.push(CartData[i].pdid); //正常商品
				} else if(CartData[i].ct > CartData[i].pdstc) {
					CartData_nopdn.push(CartData[i].pdid); // 库存不足商品
				} else if(!CartData[i] || !CartData[i].pdsts) {
					CartData_nouse.push(CartData[i].pdid) //失效商品
				}
			}
			$("input[type='checkbox'][id='check-one']:checked").each(function() {
				var pdid = $(this).siblings(".xiangqing").data("pdid");
				if(CartData_use.indexOf(pdid) > -1) {
					buf_use.push(pdid);//选中的正常商品
				} else if(CartData_nopdn.indexOf(pdid) > -1) {
					buf_nopdn.push(pdid);//选中的库存不足商品
				} else if(CartData_nouse.indexOf(pdid) > -1) {
					buf_nouse.push(pdid);//选中的失效商品
				}	
			});
			$.cookie('pdid', buf_use, { expires: 7 });
			//判断是购物车是否有物品
			if($("input[type='checkbox']:checked").length == 0) {
				webUtil.showTip(langUtil.ordercart_placeselect, 1.5);
				$(".try").attr("href", "#");
			} else if(buf_use.length == 0 && buf_nopdn.length == 0 && buf_nouse.length == 0) {
				webUtil.showTip("你没有选中的商品，请重新选择", 2.5);
			} else if(buf_nopdn.length != 0) {
				webUtil.showTip("你选中的商品库存不足，请按F5刷新后重新选择", 2.5);
			} else if(buf_nouse.length != 0) {
				webUtil.showTip("你选中的商品已下架，请按F5刷新后重新选择", 2.5);
			} else {
				newWindow = window.location.href.substring(0, window.location.href.indexOf('#'));
				var newUrl = newWindow + '#orderinfo';
				history.pushState(null, null, newUrl);
				// $(".try").attr("href", "orderinfo.html");
				var parentId = "#" + $('.try').parents('.view').first().attr("id");
				orderHtmlLoad(parentId);
			}
		});
	});
});
function orderHtmlLoad(parentId) {
	var htmlDate = "";
	$.ajax({
		type: "get",
		dataType: "html",
		async: false,
		url: "/member/orderinfo.html",
		success: function(data) {
			htmlDate = $(data).find(".orderInfo")[0].outerHTML;
			$(parentId).html(htmlDate);
			require([cssPath + "member/js/orderInfo.js"]);
		},
		error: function(error) {
			console.log(error);
		}
	});
}
require(["csspath/member/js/shopUtil"], function() {
	//选项卡焦点  暂时不用 二期会写
	$('.extra-l a').hover(function() {
		$(this).addClass("curr").siblings().removeClass("curr");
	})
	$(".extra-l .like").hover(function() {
		$(this).parent().parent().siblings('.c-panel-main').children('#guess-products').addClass("ui-switchable-panel-selected").siblings().removeClass("ui-switchable-panel-selected")
		$(this).parent().parent().siblings('.c-panel-main').children('#guess-products').css({ 'z-index': "1", 'opacity': "1" }).siblings().css({ 'z-index': "0", 'opacity': "0" })
	})
	$(".extra-l .shopwhere").hover(function() {
		$(this).parent().parent().siblings('.c-panel-main').children('#walkBuy-products').addClass("ui-switchable-panel-selected")
		$(this).parent().parent().siblings('.c-panel-main').children('#walkBuy-products').css({ 'z-index': "1", 'opacity': "1" }).siblings().css({ 'z-index': "0", 'opacity': "0" })
	})
	$("#guess-products .c-page .c-prev,.c-next").click(function() {
		var n = num($(".mc .c-panel-main .ui-switchable-panel-selected").attr("data-index"));
		if(n == 3) {
			n = 0;
		}
		$(".mc .c-panel-main .goods-list").eq(n).addClass("ui-switchable-panel-selected").siblings().removeClass("ui-switchable-panel-selected");
		$(".mc .c-panel-main .goods-list").eq(n).css({ 'z-index': "1", 'opacity': "1" }).siblings(".mc .c-panel").css({ 'z-index': "0", 'opacity': "0" });
		$("#guess-products .goods-list-tab .s-item").eq(n).addClass("curr").siblings().removeClass("curr");
	})
	//选项卡2
	$("#walkBuy-products .c-page .c-prev,.c-next").click(function() {
		var n = num($(".mc .s-panel-main .ui-switchable-panel-selected").attr("data-index"));
		if(n == 2) {
			n = 0;
		}
		$(".mc .s-panel-main .goods-list").eq(n).addClass("ui-switchable-panel-selected").siblings().removeClass("ui-switchable-panel-selected");
		$(".mc .s-panel-main .goods-list").eq(n).css({ 'z-index': "1", 'opacity': "1" }).siblings(".mc .s-panel").css({ 'z-index': "0", 'opacity': "0" });
		$("#walkBuy-products .goods-list-tab .s-item").eq(n).addClass("curr").siblings().removeClass("curr");
	})

	function num(n) {
		n = parseInt(n) + 1;
		return n;
	}

	function initMyInformation() {
		$.when(shopUtil.loadCartData()).done(function(CartData){
		if(CartData && CartData.length != 0) {
			$("#ordercart_info").data("cartinfo", CartData);
			var item = CartData;
			console.log(item)
			var item_total = []; //多条数据一次填充
			for(var i = 0; i < item.length; i++) {
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
				if(!furl){
					furl = imgPath+'/images/nopic.jpg'; 
				}
				var cart_use = "";
				if(!isshf || !pdsts){
				    	cart_use = '<div class = "cart_nouse">失效</div>';
				    	pdstc = "已下架"
				    }else{
				    	cart_use = '<input type="checkbox" class="check check-one  product" id="check-one" />' ;	
				    }
				var shop_item = '<div class="item item-1" id="cart_' + wsctid + '"  data-wsctid ="' + wsctid + '">' +
				   	cart_use +
					'<img src= "' + furl + '" class="product" />' +
					'<div class="product xiangqing" data-pdid="' + pdid + '">' +
					'<span>' + pdn + '</span>' + '<br>' +
					'<span>此商品库存为:&nbsp&nbsp'+'<span id= "cart_pdstc">' + pdstc + '</span></span>' +
//					'<span class="color-size">' + pdstc + '</span>' +
					'</div>' +
					'<span class="unit-price product">' + langUtil.ordercart_Amount + '<span class="single-price">' + slpic.toFixed(2) + '</span></span>' +
					'<div class="product jiajian">' +
					'<span class="cut">-</span>' +
					'<input class="num"  data-num ="' + ct + '" value =' + ct + '>' +
					'<span class="add">+</span>' +
					'</div>' +
					'<span class="goods-price product">' + langUtil.ordercart_Amount + '<span class="price">0.00</span></span>' +
					'<a class="delete product">' + langUtil.ordercart_delete + '</a>' +
					'</div>';
				item_total = item_total + shop_item;
				$item_total = $(item_total);
			}
			$(".goods").html($item_total);
			$(":checkbox").prop("checked", true);
			$(".cart_nouse").parent().css("background","#f7f7f7");
			$(".cart_nouse").siblings().css("color","#969696");
			$(".cart_nouse").siblings().find(".price").css("color","#969696");
			$(".cart_nouse").siblings().find("input").attr("disabled",true)
			selectTotal();
			priceTotal();
			$(".shoptitle").show();
			$(".center").show();
			$(".pay").show();
		} 
//		else if($("#ordercart_info").length == 0){  //放到shouutil 里面了
//			var nullCar = '<div class="orderBar order_comm orderBox_on" data-class="payment_box">' +
//				'<div class="empty_box">' +
//				' <i class="empty_icon"></i>' +
//				'<div class="empty_txt">' +
//				'' + langUtil.ordercart_none + '<a href="' + realpath + 'index.html">' + langUtil.ordercart_goshop + '>></a>' +
//				'</div>' +
//				' </div>' +
//				' </div>'
//			$("#ordercart_info").html(nullCar);
//		}
		//商品列表总数赋值
		function goodsnumber() {
			$(".shoptitle").find(".title-number").html($(".item:visible").length - $(".cart_nouse").length );
		}
		goodsnumber();
		//小计
		function priceTotalOne() {
			var s = 0;
			$(".item-1").each(function() {
				var itemnum = parseInt($(this).find('input[class*=num]').val());
				var itemprice = parseFloat($(this).find('span[class="single-price"]').text()).toFixed(2);
				if(parseInt(itemnum) == "" || undefined || null || isNaN(itemnum) || isNaN(parseInt(itemnum))) {
					itemnum = 0;
				}
				s = parseFloat(itemnum * itemprice).toFixed(2);
				$(this).find('span[class ="price"]').html(s);
			})
		}
		priceTotalOne();
		//全选操作
		var selectAll = $(".checkAll");
		$(".nav").on('click', '.checkAll', function() {
			if(this.checked) {
				$(":checkbox").prop("checked", true);
				selectTotal();
				priceTotal();
			} else {
				$(":checkbox").prop("checked", false);
				$(".subTotal").eq(0).text(0)
			}
			selectTotal();
			priceTotal();
		});
		//支付部分全选
		$(".pay").on('click', '.pay-checkAll', function() {
			if(this.checked) {
				$(":checkbox").prop("checked", true);
			} else {
				$(":checkbox").prop("checked", false);
			}
			selectTotal();
			priceTotal();
		});
		//单选操作
		$(".goods").on('click', ".check-one", function() {
			var _this = $(this);
			if(!$(".check-one").is(":checked")) {
				$(".checkAll").attr("checked", false);
				$(".pay-checkAll").attr("checked", false);
			}
			var chsub = $("input[type='checkbox'][id='check-one']").length; //获取subcheck的个数  
			var checkedsub = $("input[type='checkbox'][id='check-one']:checked").length; //获取选中的subcheck的个数  
			if(checkedsub == chsub) {
				$(".checkAll").prop("checked", true);
				$(".pay-checkAll").prop("checked", true);
			} else {
				$(".checkAll").prop("checked", false);
				$(".pay-checkAll").prop("checked", false);
			}
			selectTotal();
			priceTotal();
		});

		function cofirm1(wsctids_array) {
			var html = '<div class="del_dialog" style="position:fixed;left:710px;top:300.5px;">' +
				'<div class="dialog_title">' +
				'<span>' + langUtil.ordercart_tip + '</span>' +
				'<a class="dialog_close"></a>' +
				'</div>' +
				'<div class="dialog_content">' +
				'<div class="tip_box">' +
				'<i class="tip_icon"></i>' +
				'<div class="tip_item">' +
				'<div class="tip_txt1">' + langUtil.ordercart_confirm + '</div>' +
				'<div class="tip_txt2">' + langUtil.ordercart_norecovered + '</div>' +
				'<div class="tip_btn">' +
				'<a class="btn_1 del_confirm">' + langUtil.ordercart_sure + '</a>' +
				'<a class="btn_2 del_cancel" >' + langUtil.ordercart_think + '</a>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'</div>' +
				'<div class="dialog_mask"></div>';
			$("body").append(html);
			$(".del_confirm").on('click', function() {
				$(".del_dialog").remove();
				$(".dialog_mask").remove();
				var chsub = $("input[type='checkbox'][id='check-one']").length; //获取subcheck的个数
				if(wsctids_array.length == 1) { //删除一条
					$(".item").each(function() {
						if($(this).attr("data-wsctid") == wsctids_array) {
							$(this).remove();
							$(this).find('input[class*=num]').val(0);
							$(this).find('.goods-price').find('span[class="price"]').text(0);
							$.when(shopUtil.delCartData(wsctids_array)).done(function(flag){
								selectTotal();
								priceTotal();
								goodsnumber();
							})	
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
						initMyInformation();
					}
				} else { //删除多条
					var chsub = $("input[type='checkbox'][id='check-one']").length; //获取subcheck的个数  
					var checkedsub = $("input[type='checkbox'][id='check-one']:checked").length; //获取选中的subcheck的个数  
					if(chsub == checkedsub) {	
						$.when(shopUtil.delAllCartData()).done(function(flag){
								initMyInformation();
						});
					} else {
						$.when(shopUtil.delCartData(wsctids_array)).done(function(flag){});
					}
					$("input[type = checkbox]:checked").each(function() {
						n = $(this).parents(".item").index();
						$(this).attr("checked", false);
						$(".goods").find(".item:eq(" + n + ")").remove();
						$(".subTotal").html('0');
						$(".selectTotal").html('0');
						goodsnumber();
					})
				}
			})
			//取消
			$(".del_cancel").on('click', function() {
				$(".del_dialog").remove();
				$(".dialog_mask").remove();
			})
			//点击x 关闭提示窗
			$(".dialog_close").on('click', function() {
				$(".del_dialog").remove();
				$(".dialog_mask").remove();
			})
		}

		//点击删除一条，简化处理
		$(".goods").on('click', ".delete", function() {
			//ajax
			var wsctids = $(this).parent().data("wsctid");
			var wsctids_array = [];
			var chsub = $("input[type='checkbox'][id='check-one']").length; //获取subcheck的个数 
			wsctids_array.push(wsctids)
			cofirm1(wsctids_array);
		});
		//删除所选及清空  简化处理
		$(".deleteAll").click(function() {
			var wsctids_array = [];
			$("input[type = checkbox]:checked").each(function() {
				var wsctids = $(this).parent().data("wsctid");
				wsctids_array.push(wsctids);
			});
			var checkedsub = $("input[type='checkbox'][id='check-one']:checked").length; //获取选中的subcheck的个数  
			if(checkedsub == 0) {
				webUtil.showTip(langUtil.ordercart_placecheck, 3);
			} else {
				cofirm1(wsctids_array);
			}

		})
		//add  写到这++++++++++++++++++++++++
		$(".goods").on('click', ".add", function() {
			var _this = $(this);
			//判断是否失效商品
			if(_this.parent().parent().find(".check-one").length == 0) {
				console.log("产品已经失效 请重新选择")
			} else {
				//ajax 参数
				var wsctid = $(this).parent().parent().data("wsctid"); //"wsctid":"购物车主键id",
				var pdid = $(this).parent().siblings(".xiangqing").data("pdid"); //"pdid":"产品id(必填)",
				var data_num = $(this).siblings(".num").attr('data-num');
				var $inputVal = _this.siblings('.num').val();
				$(_this).prev().val(++$inputVal);
				$inputVal = $inputVal;
				var ct = $inputVal; //"ct":"数量(默认1)",
				$(this).prev().attr("data-num", ct); //给自定义属性data-num赋值ct
				var rn = 222; //非必选项
				$.when(shopUtil.setCart(pdid, wsctid, ct)).done(function(flag){
					var setCart = flag;
					var data_num = $(this).siblings(".num").attr('data-num');
					if(setCart) {
						if($(_this).parent().parent().find('span').hasClass("cart_nouse")) {
							$(_this).prev().val(0)
						} else {
							$(_this).parent().siblings(".check-one").prop("checked", true);
							var $price = $(_this).parent().prev().find('.single-price').text() * $inputVal;
							$price = parseFloat($price).toFixed(2);
							$(_this).parent().next().text(langUtil.ordercart_Amount + $price);
							selectTotal();
							priceTotal();
						}
					} else {
						$(_this).prev().val(data_num);
						$inputVal = data_num;
						var $price = parseFloat($(_this).parent().prev().find('.single-price').text()).toFixed(2) * $inputVal;
						$price = parseFloat($price).toFixed(2)
						$(_this).parent().next().text(langUtil.ordercart_Amount + $price);
					}
				})
			}
		});
		//cut 
		$(".goods").on('click', ".cut", function() {
			var _this = $(this);
			if(_this.parent().parent().find(".check-one").length == 0) {
				console.log("产品已经失效 请重新选择")
			} else {
				var wsctid = $(this).parent().parent().attr("data-wsctid"); //"wsctid":"购物车主键id",//ajax 参数
				var pdid = $(this).parent().siblings(".xiangqing").attr("data-pdid");     //"pdid":"产品id(必填)",
				var $inputVal = $(this).next().val();
				if($inputVal > 1) {
					$(_this).next().val(--$inputVal);
					$inputVal = $inputVal;
				}
				var ct = $inputVal;
				$.when(shopUtil.setCart(pdid, wsctid, ct)).done(function(flag){
					var setCart = flag;
					if(setCart) {
						if($(_this).parent().parent().find('span').hasClass("cart_nouse")) {
							$(_this).next().val(0);
						} else {
							$(_this).parent().siblings(".check-one").prop("checked", true);
							var $price = Number($(_this).parent().prev().find('.single-price').text()).toFixed(2) * $inputVal;
							$price = parseFloat($price).toFixed(2);
							$(_this).parent().next().text(langUtil.ordercart_Amount + $price);
						}
					} else {
						$(this).next().val(0);
					}
				})				
				priceTotal();
				selectTotal();
			}
		});
		//输入数量计算价格
		$(".goods").on('blur', ".num", function() {
			var re = /^[1-9]+[0-9]*]*$/
			var wsctid = $(this).parent().parent().data("wsctid"); //"wsctid":"购物车主键id",
			var pdid = $(this).parent().siblings(".xiangqing").data("pdid"); //"pdid":"产品id(必填)",	
			var _this = $(this);
			var $inputVal = $(this).val();
			var data_num = $(this).attr('data-num');
			if(re.test($inputVal)) {
				var ct = $inputVal;
				$(this).attr("data-num", ct); //给自定义属性data-num赋值ct
				$.when(shopUtil.setCart(pdid, wsctid, ct)).done(function(flag){
					var setCart = flag;
					if(setCart) {
						if($(_this).parent().parent().find('span').hasClass("no-use")) {
							$(_this).attr("disable", true);
							$(_this).val(0)
						} else {
							$(_this).parent().siblings(".check-one").prop("checked", true);
							var $price = parseFloat($(_this).parent().prev().find('.single-price').text()).toFixed(2) * $inputVal;
							$price = parseFloat($price).toFixed(2)
							if($inputVal > 0) {
								$(_this).parent().next().text(langUtil.ordercart_Amount + $price);
							} else {
								$(_this).parent().next().text(0);
							}
						}
						priceTotal();
						selectTotal();
					} else {
						$(_this).val(data_num);
						$inputVal = data_num;
						var $price = parseFloat($(_this).parent().prev().find('.single-price').text()).toFixed(2) * $inputVal;
						$price = parseFloat($price).toFixed(2)
						$(_this).parent().next().text(langUtil.ordercart_Amount + $price);
					}
				});
			} else if($inputVal == 0) {
				webUtil.showTip("商品数目必须大于0", 3); //暂时使用语句
			} else {
				webUtil.showTip(langUtil.ordercart_numbertip, 3);
			}
		});
		//计算总数
		function selectTotal() {
			var sum = 0;
			$(".check-one").each(function() {
				if(this.checked) {
					var subTotal = $(this).siblings('.jiajian').find('.num').val();
					sum = sum + parseInt(subTotal);
					$(".selectTotal").text(sum);
				} else {
					sum = sum;
					$(".selectTotal").text(sum);
				}
			})
		}
		//计算总价
		function priceTotal() {
			var s = 0;
			$(".check-one").each(function() {
				if($(this).is(":checked")) {
					var t = parseFloat($(this).parent().find('input[class*=num]').val()).toFixed(2);
					var p = parseFloat($(this).parent().find('span[class="single-price"]').text()).toFixed(2);
					if(parseInt(t) == "" || undefined || null || isNaN(t) || isNaN(parseInt(t))) {
						t = 0;
					}
					s += parseInt(t) * parseFloat(p).toFixed(2);
					$(".subTotal").text(parseFloat(s).toFixed(2));
				} else {
					s = s;
					$(".subTotal").text(parseFloat(s).toFixed(2));
				}
			})
		}
	});
		}
	initMyInformation();
});
