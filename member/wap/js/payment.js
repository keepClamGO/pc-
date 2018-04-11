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
			paynewsinfo:'',                 //支付方式信息阐述
			deviceType:'',               	//判断设备信息
			disabled:false,					//判断短息时间添加类名
			mPhone:'',						//会员接受短信手机号placeHolder
			Phone:'',						//会员接受短信手机号value
			status:0						//根据支付方式来判断按钮是否可点击
		},
		filters: {                          //商品价格过滤器
			partFilter: function (value, type) {
				return '￥' + Number(value).toFixed(2) + type;
			}
		},
		mounted: function () {
			this.$nextTick(function () {
				this.getMemberPhone();		//获取会员接收短信手机
				this.getDeviceType();       //判断设备浏览器
				this.getPayList();          //支付方式接口的获取
				this.getPaymentData();      //会员订单详情获取
				this.referPay();
			});
		},
		methods: {
			getFocus:function(){
				var el = document.getElementById('pay_phone');
				el.focus();
			},
			getMemberPhone:function(){      //获取会员手机
				var _this = this;
				this.$ajax.get('/w/customer/infoDisplayCustomer.do').then(function (res) {
					if(res.status == 200) {
						_this.mPhone = res.data.data.cstmb;
					}
				}).catch(function (error) {
					console.log(error);
				});
			},
			getPayList: function () {       //获得支付方式接口
				this.payMentWcoid = window.location.href.substring(window.location.href.indexOf('wcoid=') + 6);
				var _this = this;
				this.$ajax.get('/w/shop/infoWebPaytype.do', {
					params:{
						"wpmbt":_this.deviceType
						// "wpmbt":'wx'
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
						_this.paynewsinfo = _this.payList[1].paymodeList[0].wmpmname;
					} else {
							_this.payListID = _this.payList[0].paymodeList[0].wpmid;
						_this.paynewsinfo = _this.payList[0].paymodeList[0].wmpmname;
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
					if(_this.orderInfo==null || _this.orderInfo==undefined){
						window.location.href = "orderlist.html";
					}
				}).catch(function (error) {
					console.log(error);
				});
			},
			payListTab: function (index, wpmid,wmpmname) {   //选择支付的方式
				this.payListIndex = index;
                this.paynewsinfo = wmpmname;
				this.payListID = wpmid;
			},
			setorderinfo:function(){
				window.location.href = "orderdetail.html?wcoid=" + this.payMentWcoid;
			},
			getDeviceType:function(){
				var _this = this;
				if(window.__wxjs_environment === 'miniprogram'){
					_this.deviceType = 'xcx';
				}else{
					var nu = navigator.userAgent.toLowerCase();
					if(nu.indexOf('micromessenger') != -1){
						_this.deviceType = 'wx'
					} else if(nu.indexOf('alipay') != -1){
						_this.deviceType = 'alipay'
					}else if (nu.match(/Android/i) || nu.match(/webOS/i) || nu.match(/iPhone/i) || nu.match(/iPad/i) || nu.match(/iPod/i) || nu.match(/BlackBerry/i) || nu.match(/Windows Phone/i)) {
						_this.deviceType = 'wap';
					} else {
						_this.deviceType = 'pc';
					}
				}
				console.log(_this.deviceType);
			},
			sunbmitInfo: function (e) {             //提交支付数据
				var _this = this;
				if(_this.payListID == 6){
					var reg = /^((13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8})$/;
					if(_this.Phone == ""){
						_this.Phone = _this.mPhone;
					}else{
						var flag = reg.test(_this.Phone);
						if(flag == false){
							webUtil.showTip("手机号码格式有误，请确认后再次输入", 1.5);
							return false;
						}
					};
					_this.disabled = true;
					_this.$ajax.post('/sendSms/sendSMSToUser.do', $.param({
						"wcoid": _this.payMentWcoid,
						"mobile": _this.Phone
					})).then(function (res) {
						if(res.data.result == 'SUCCESS'){
							webUtil.showTip("支付短信已发送，请注意查收", 1.5);
							var i = 59,text = '秒后重新发送';
							e.target.innerText = '60秒后再发送短息';
							var intervalId = setInterval(function(){
								i >= 10 ? e.target.innerText = i+text : e.target.innerText = "0"+i+text;
								i--;
								if(i < 0 ){
									_this.disabled = false;
									e.target.innerText = '立即支付';
									clearInterval(intervalId);
								}
							},1000);
						}else{
							webUtil.showTip("支付短信发送失败，请联系管理员", 1.5);
							_this.disabled = false;
						}
					}).catch(function (error) {
						console.log(error);
					});
				}else {
					switch (_this.payListID) {
						case 1:
							url = "/paytype/alipay/kenfor_send.jsp";
							title = '支付宝支付';
							break;
						case 2:
							url = "/paytype/wxpay/kenfor_send.jsp";
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
					}
					var jumpUrl=encodeURI("/member/orderdetail.html?wcoid="+ _this.payMentWcoid);
					var url = url + "?wcoid=" + _this.payMentWcoid + "&wpmid=" + _this.payListID+"&cb="+jumpUrl;
					window.location.href=url;
				}
			},
			referPay:function(){
				var _this =this;
				_this.$ajax.post('/w/shop/getCustomerOrdersPayStatus.do', $.param({
					"wcoid": _this.payMentWcoid
				})).then(function (res) {
					if(res.data.result =='SUCCESS'){
						if(res.data.data ==1){
							  $.toast("支付成功","success");
							  window.location.href = 'orderdetail.html?wcoid='+ _this.payMentWcoid;							
						 }else{
							console.log('订单未支付，请确认后再试');
						 }
					 }
				}).catch(function (error) {
					console.log(error);
				});
			}
		}
	});
});