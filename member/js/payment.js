require(["vue.min", "axios.min","es6-promise"], function (Vue, axios) {
	Vue.prototype.$ajax = axios;
	var vm4 = new Vue({
		el: '.payment',
		data: {
			payList: [],                    //所有的支付方式
			payListIndex: 0,                //支付方式的index
			payListID: '',                  //支付方式的id  
			payMentWcoid: "",               //当前订单id			
			orderInfo: [],                  //订单详情的全部信息
			disabled:false,					//判断短息时间添加类名
			status:0						//根据支付方式来判断按钮是否可点击
		},
		filters: {                          //商品价格过滤器
			partFilter: function (value, type) {
				return '￥' + Number(value).toFixed(2) + type;
			}
		},
		mounted: function () {
			this.$nextTick(function () {
				this.getPayList();          //支付方式接口的获取
				this.getPaymentData();      //会员订单详情获取
			});
		},
		methods: {
			getPayList: function () {       //获得支付方式接口
				this.payMentWcoid = window.location.href.substring(window.location.href.indexOf('wcoid=') + 6);
				var _this = this;
				this.$ajax.get('/w/shop/infoWebPaytype.do',{
					params:{
						"wpmbt":'pc'
					}
				}).then(function (res) {
					_this.payList = res.data.data;
					$.each(_this.payList,function(i,item){
						if(item.wptid==2 && item.paymodeList){
							_this.status=1;
							return false
						}
					})
					_this.status==1?'':_this.disabled=true;
					if (_this.payList.length > 1) {
						_this.payListID = _this.payList[1].paymodeList[0].wpmid;
					} else {
						_this.payListID = _this.payList[0].paymodeList[0].wpmid;
					}
				}).catch(function (error) {
					console.log(error);
				});
			},
			getPaymentData: function () {   //获取订单详情
				var _this = this;
				this.$ajax.post('/w/shop/infoCustomerOrders.do', $.param({
					"wcoid": _this.payMentWcoid
				})).then(function (res) {
					_this.orderInfo = res.data.data;
				}).catch(function (error) {
					console.log(error);
				});
			},
			payListTab: function (index, wpmid) {   //选择支付的方式
				this.payListIndex = index;
				this.payListID = wpmid;
			},
			sunbmitInfo: function () {             //提交支付数据
				var _this = this;
				$('.payment_submit > button').attr('disabled',true).css({
					background:'#968b8b',
					cursor: "not-allowed"
				});
				switch (_this.payListID) {
					case 1:
						url = "/paytype/alipay/kenfor_send.jsp";
						title = '支付宝支付';
						break;
					case 2:
						url = "/paytype/wxpay/weixin_pay.jsp";
						title = '微信支付';
						break;
					case 3:
						url = "/paytype/allinpay/kenfor_send_native.jsp";
						title = '通联支付宝支付';
						break;
					case 4:
						url = "/paytype/allinpay/kenfor_send_native.jsp";
						title = '通联微信支付';
						break;
					case 5:
						url = "/paytype/allinpay_ebank/kenfor_send.jsp";
						title = '通联个人银行支付';
						break;
				};
				var jumpUrl=encodeURI("/member/orderdetail.html?wcoid="+ _this.payMentWcoid);
				var url = url + "?wcoid=" + _this.payMentWcoid + "&wpmid=" + _this.payListID+"&cb="+jumpUrl;
                if(_this.payListID==3 || _this.payListID==4){
					this.$ajax.get(url).then(function (res) {
						var txt = res.data;
						var option = {
							title: title,
							btn: parseInt("0011", 2),
							onOk: function () {
								//点击确定的时候，查询订单支付的状态
								_this.$ajax.post('/w/shop/getCustomerOrdersPayStatus.do',$.param({
									"wcoid": _this.payMentWcoida
								})).then(function (res) {
									if(res.data.result =='SUCCESS'){
										if(res.data.data == 1){
											$('.xcConfirm').remove();
											$('.payment_submit > button').attr('disabled',false).css({
												background: "#e45050",
												cursor: "pointer"
											});
											if(window.location.href.indexOf('/member/')==-1)
											{
												var newWindow = window.location.href.substring(0,window.location.href.indexOf('#'));
												var newUrl=newWindow+'#orderdetail&wcoid='+_this.payMentWcoid;
												history.pushState(null,null,newUrl);
												var parentDom = $('.payment_submit button').parents('.view').first();
												parentDom.empty();
												$.ajax({
													type: "get",
													dataType: "html",
													async: false,
													url: "/member/orderdetail.html",
													success: function (data) {
														htmlDate = $(data).find(".orderDetail")[0].outerHTML;
														parentDom.html(htmlDate);
														require([cssPath + "member/js/orderDetail.js"]);
													},
													error: function (error) {
														console.log(error);
													}
												});
											}else{
											  window.location.href = 'orderdetail.html?wcoid='+ _this.payMentWcoid;
											}
										}else{  
											webUtil.showTip("订单未支付，请确认后再试", 1.5);
										}
									}else{
										webUtil.showTip("请求数据出错", 1.5); 
									}
									
								}).catch(function(error){
                                   console.log(error);
								});	
							},
							onCancel:function(){
								$('.payment_submit > button').attr('disabled',false).css({
									background:  "#e45050",
									cursor: "pointer"
								});  
							},
							onClose:function(){
								$('.payment_submit > button').attr('disabled',false).css({
									background: "#e45050",
									cursor: "pointer"
								});  
							}
						};
						window.wxc.xcConfirm(txt, "custom", option);
						$('.txtBox').find('i').hide();	
					}).catch(function (error) {
						console.log(error);
						webUtil.showTip("请求出错", 1.5);
						$('.payment_submit > button').attr('disabled',false).css({
							background:  "#e45050",
							cursor: "pointer"
						});

					});
				}else{
					window.open(url);
					// 定时器轮询支付结果
					var payment_times = setInterval(function(){
						_this.$ajax.post('/w/shop/getCustomerOrdersPayStatus.do',$.param({
							"wcoid": _this.payMentWcoid
						})).then(function (res) {
							 if(res.data.result =='SUCCESS'){
								if(res.data.data ==1){
									clearInterval(payment_times);
									if(window.location.href.indexOf('/member/')==-1)
									{
										var newWindow = window.location.href.substring(0,window.location.href.indexOf('#'));
										var newUrl=newWindow+'#orderdetail&wcoid='+_this.payMentWcoid;
										history.pushState(null,null,newUrl);
										var parentDom = $('.payment_submit button').parents('.view').first();
										parentDom.empty();
										$.ajax({
											type: "get",
											dataType: "html",
											async: false,
											url: "/member/orderdetail.html",
											success: function (data) {
												htmlDate = $(data).find(".orderDetail")[0].outerHTML;
												parentDom.html(htmlDate);
												require([cssPath + "member/js/orderDetail.js"]);
											},
											error: function (error) {
												console.log(error);
											}
										});
									}else{
									  window.location.href = 'orderdetail.html?wcoid='+ _this.payMentWcoid;
									}								
								 }else{
								    console.log('订单未支付，请确认后再试');
								 }
							 }
							 
						}).catch(function(error){
							console.log(error);
						});	
					},3000);

					var txt=  "请您在新打开的支付页面进行支付";
					var option = {
						title: '提示',
						btn: parseInt("0011",2),
						onOk: function(){
							_this.$ajax.post('/w/shop/getCustomerOrdersPayStatus.do',$.param({
								"wcoid": _this.payMentWcoid
							})).then(function (res) {
								 if(res.data.result =='SUCCESS'){
									if(res.data.data ==1){
										$('.xcConfirm').remove();
										$('.payment_submit > button').attr('disabled',false).css({
											background: '#e45050',
											cursor: "pointer"
										});
										if(window.location.href.indexOf('/member/')==-1)
										{
											var newWindow = window.location.href.substring(0,window.location.href.indexOf('#'));
											var newUrl=newWindow+'#orderdetail&wcoid='+_this.payMentWcoid;
											history.pushState(null,null,newUrl);
											var parentDom = $('.payment_submit button').parents('.view').first();
											parentDom.empty();
											$.ajax({
												type: "get",
												dataType: "html",
												async: false,
												url: "/member/orderdetail.html",
												success: function (data) {
													htmlDate = $(data).find(".orderDetail")[0].outerHTML;
													parentDom.html(htmlDate);
													require([cssPath + "member/js/orderDetail.js"]);
												},
												error: function (error) {
													console.log(error);
												}
											});
										}else{
										  window.location.href = 'orderdetail.html?wcoid='+ _this.payMentWcoid;
										}								
									 }else{
										webUtil.showTip("订单未支付，请确认后再试", 1.5);
									 }
								 }else{
									webUtil.showTip("请求数据出错", 1.5); 
								 }
                                 
							}).catch(function(error){
                                console.log(error);
							});	
						},
						onCancel:function(){
							clearInterval(payment_times);
							$('.payment_submit > button').attr('disabled',false).css({
								background: "#e45050",
								cursor: "pointer"
							}); 
						},
						onClose:function(){
							clearInterval(payment_times);
							$('.payment_submit > button').attr('disabled',false).css({
								background: "#e45050",
								cursor: "pointer"
							});  
						}
					};
					window.wxc.xcConfirm(txt, "custom", option);
					$('.xcConfirm').addClass('bank');
				}	
			}
		}
	});
});