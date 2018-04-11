
require(["vue.min", "axios.min","es6-promise"], function(Vue, axios) {
	Vue.prototype.$ajax = axios;
	var vm3 = new Vue({
		el: '.orderInfo',
		data: {
			addressList: [],                            //地址列表
			goodsList: [],                              //商品列表
			addressAreaList:[],                         //配送区域有效列表(增加的)
			deliveryList:[],                            //配送方式的列表
			paylist: [],                                //支付方式的列表
			InvoiceList:[],                             //发票类型的列表	
			addrIndex: 0,                               //选择地址的index
			payListIndex: 0,                            //支付类型的index
			deliveListIndex:0,                          //邮寄方式的index
			pdid:[],                                    //选中产品的id
			showNum: 5,                                 //展示地址的数量
			flag: true,                                 //控制地址显示的开关
			payListId:'',                               //支付方式的id (1:货到付款2：网上支付)
			deliveryFlag:true,                          //控制配送方式的显示和隐藏
			postscript: '',                             //备注信息
			isInvoice: false,
			isPreferential: false,
			isCoupon: false,
			isModAddress: false,
			deposit: 450,                                //预存款总价格
			inputDeposit: 0,                             //输入的预存款
			inputShow: false,
			inputShowOver: false,
			totalMoney: 0,                               //总价格
			carriage: '',                                //运费
			totalVlat:0,                                 //优惠价格
			Totalgoods:0,                                //商品总数
			isPrepaid: false,
			send: {                                      //收货人的信息
				sendPeople: '',                          //寄送地址
				consignee: '',                           //收获人
				sendTel: ''                              //收货人电话	
			},
			invoice_isinvo:0,                            //是否开具发票(0不开,1开)
			invoice_info_index:0,                        //发票类别
			invoice_invotp:0,                            //发票类型
			invoice_invott:'个人',                        //发票抬头
			invoice_bankn:'',                            //发票银行
			invoice_bankacc:'',                          //发票银行账户
			invoice_rgsaddr:'',                          //注册地址
			invoice_rgsmb:'',                            //注册手机号	
			invoice_idc:'',                              //纳税人识别号
		},
		filters: {                                       //价格过滤器
			partFilter: function(value, type) {
				return '￥' + Number(value).toFixed(2) + type;
			}
		},
		computed: {                                     //计算属性
			filterAddList: function() {
				return this.addressList.slice(0, this.showNum);
			}
		},
		mounted: function() {                          //页面加载就运行这个
			this.$nextTick(function() {
				this.getAddressList();                 //查询收货地址数据
				this.getDelivery();                    //查询配送方式设置接口
				this.getGoodsList();                   //查询商品信息
				this.getPaylist();                     //查询支付类型
				this.getInvoiceType();                 //获取发票信息类型
				this.getInvoiceInfo();                 //发票配置信息接口
				this.getCookie('pdid');                //获取cookie
			});
		},
		methods: {
			 getCookie: function (cname) {             //获取购买产品的列表：
                var name = cname + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') c = c.substring(1);
                    if (c.indexOf(name) != -1) {
                     this.pdid = (unescape(c.substring(name.length, c.length))).split(',');
                    }
                }
                return "";
            },
           setCookie:function(cname, cvalue, exdays) {    //设置cookie
		    var d = new Date();  
		    d.setTime(d.getTime() + (exdays*24*60*60*1000));  
		    var expires = "expires="+d.toUTCString();  
		    document.cookie = cname + "=" + cvalue + "; " + expires;  
            },
           clearCookie:function(name) {                  //清楚cookie
                 this.setCookie(name, "", -1); 
            },
			getDelivery:function(){                      //获得配送方式
				var _this =this;
				this.$ajax.get('/w/shop/infoWebsiteShipConfig.do').then(function(res) {
					if(res.data.data.ons == 0)
					{
						_this.deliveryFlag = false;
					}else{
						_this.deliveryList = res.data.data.shipType;
						_this.carriage = _this.deliveryList[0].stp;
					}
				}).catch(function(error) {
					console.log(error);
				});
			},
			
			getAddressList: function() {                //查询收货地址数据
				var _this = this;
				this.$ajax.post('/w/shop/listConsigneeAddress.do', $.param({ 
					"pageIndex": 1,
					"pageMax": 10
				})).then(function(res) {
					_this.addressList = res.data.data.rows;
					_this.send.sendPeople = _this.addressList[_this.addrIndex].coearea + _this.addressList[_this.addrIndex].coeaddr;
					_this.invoice_rgsaddr = _this.addressList[_this.addrIndex].coeaddr;
				    _this.send.consignee = _this.addressList[_this.addrIndex].coen;
				    _this.send.sendTel = _this.addressList[_this.addrIndex].coemb;
				    _this.invoice_rgsmb = _this.addressList[_this.addrIndex].coemb;
				}).catch(function(error) {
					console.log(error);
				});
			},
			getPaylist:function(){                      //查询支付方式数据
				var _this =this;
				this.$ajax.get('/w/shop/infoWebPaytype.do').then(function(res) {
					_this.paylist = res.data.data;
					if(_this.paylist.length>1){
					  _this.payListId =_this.paylist[1].wptid;
					  _this.payListIndex = 1;	
					}else{
					 _this.payListId =_this.paylist[0].wptid; 
					}
				}).catch(function(error) {
					console.log(error);
				});
			},
		    getGoodsList: function() {                 //提取商品列表数据
					var _this =this;
					this.$ajax.post('/w/shop/listWebsiteCustomerCart.do',$.param({"sortPdid":[1, 0]})).then(function(res) {
						for(var i=0;i<res.data.data.length;i++){
							for(var t=0;t<_this.pdid.length;t++){
								if(_this.pdid[t] == res.data.data[i].pdid){
									_this.goodsList.push(res.data.data[i]); 
								}
							}
						}
						_this.calTotalMoney();
					}).catch(function(error){
						console.log(error);
					});
		    },
			setInvoice:function() {                               //发票的开启
				this.isInvoice = !this.isInvoice;
			},
			getInvoiceType:function(){                  //获取发票信息 类型
				var _this =this;
				this.$ajax.get('/w/shop/listWsInvoiceType.do').then(function(res) {
					_this.InvoiceList = res.data.data;
				}).catch(function(error) {
					console.log(error);
				});		
			},
			setInvoiceInfo:function(){                   //发票信息配置的接口    (保存事件)
				var _this =this;
				var setInvoiceData = {
					"bankn":this.invoice_bankn,                                               //开户银行
			        "rgsaddr":this.invoice_rgsaddr,                                           //注册地址
			        "rgsmb":this.invoice_rgsmb,                                               //注册手机号
			        "invotp":this.invoice_invotp,                                             //发票类型
			        "idc":this.invoice_idc,                                                   //纳税人识别号
			        "wsinvotpid":_this.InvoiceList[_this.invoice_info_index].wsinvotpid,      //发票类别id
			        "invott":this.invoice_invott,                                             //发票抬头
			        "bankacc":this.invoice_bankacc                                            //银行账户
				};
				this.$ajax.post('/w/shop/saveWsCstInvoiceInfo.do',$.param(setInvoiceData)).then(function(res) {  //保存发票的接口
				}).catch(function(error) {
					console.log(error);
				});
			},
			getInvoiceInfo:function(){           //发票配置信息接口  获取
				var _this = this;
				this.$ajax.get('/w/shop/infoWsCstInvoiceInfo.do').then(function(res) {
					console.log(res);            //目前为空
				}).catch(function(error) {
					console.log(error);
				});
			},
			showAdderNum: function() {          //控制地址展示数量
				if(this.flag) {
					this.showNum = this.addressList.length;
					this.flag = !this.flag;
				} else {
					this.showNum = 5;
					this.flag = !this.flag;
				}
			},
			calTotalMoney: function() {         //计算商品的总金额
				var _this = this;
				_this.totalMoney = 0;
				_this.totalVlat = 0;
				_this.Totalgoods = 0;
				_this.goodsList.forEach(function(item, index){
					_this.totalMoney += item.slpic*item.ct;
					_this.totalVlat +=item.vlat*item.ct;
					_this.Totalgoods+=item.ct;
				});
			},
			addAddrelist:function(){          //向后台添加地址数据,直接跳转到地址页面
				var addressUrl = window.location.href.substring(window.location.href.indexOf('.com')+4);
				window.location.href = '/member/address.html?order=1&url='+addressUrl;
			},
			addrIndexof:function(index) {       //点击地址更换函数
				_this=this;
				var indexnumber = index;
				_this.$ajax.post('/w/shop/listWebsiteShipArea.do').then(function(res) {         //查询收货配送区域的接口
					_this.addressAreaList =res.data.data;
					_this.addressAreaList.forEach(function(item,v){
                           if(_this.addressList[indexnumber].coeareaid == item.areano){
									_this.addrIndex = indexnumber;
									_this.send.sendPeople = _this.addressList[_this.addrIndex].coearea + _this.addressList[_this.addrIndex].coeaddr;
									_this.invoice_rgsaddr = _this.addressList[_this.addrIndex].coeaddr;
									_this.send.consignee = _this.addressList[indexnumber].coen;
									_this.send.sendTel = _this.addressList[indexnumber].coemb;
									_this.invoice_rgsmb = _this.addressList[_this.addrIndex].coemb;
						   }
					});
					if(_this.addrIndex != indexnumber){
							webUtil.showTip("请选择的区域已经不支持配送，请重新添加", 1.5);
							return false;
					}
				}).catch(function(error) {
					console.log(error);
				});
			},
			deliveListTab:function(index){       //点击邮寄的顺序
				this.deliveListIndex = index;
				this.carriage =this.deliveryList[this.deliveListIndex].stp;
			},
			payListIndextab:function(index,id) { //点击支付的顺序
				this.payListIndex = index;
				if(this.paylist.length>1)
				{
				 this.payListId = this.payListIndex+1;
				}else{
					this.payListId = this.payListId;
				}
			},
			invoice_key_index:function(index){   //点击是否开发票:
				this.invoice_isinvo = index;
			},
			invoice_InfoTab:function(index){     //发票类型的顺序
				this.invoice_info_index = index;
				if(index==2){
				 this.invoice_invott ='';
				 this.invoice_invotp =1;
				}
			},
			noInvoice:function(){                //发票开具方式:
				alert(1111111);
			},
			invoice_invotp_index:function(index){ //发票开具类型
				this.invoice_invotp = index;
				if(index==0){
				this.invoice_invott = '个人';	
				}else{
					this.invoice_invott ='';	
				}
			},
			submitOrder:function(){                       //提交订单的函数
				var _this = this;
			
				if(_this.goodsList.length==0){
					webUtil.showTip("请选择商品", 1.5);
					return false;
				}
				if(_this.addressList.length==0){
					webUtil.showTip("请添加地址", 1.5);
					return false;
				}
				if(_this.deliveryList.length==0){
					webUtil.showTip("请添加配送方式", 1.5);
					return false;
				}
				if(_this.paylist.length==0){
					webUtil.showTip("请添加支付方式", 1.5);
					return false;
				}
				if(_this.addrIndex ===0){
					_this.addrIndexof(_this.addrIndex);
				 }
				var submitData = {
					"wccaid":_this.addressList[_this.addrIndex].wccaid,                        //收货地址的id
					"wstid":_this.deliveryList[_this.deliveListIndex].wstid,                   //配送方式的id
					"wptid":_this.payListId,                                                   //支付类型的id
					"buymsg":_this.postscript,                                                 //留言信息
					"isinvo":_this.invoice_isinvo,                                             //是否开具发票
					"pdids":_this.pdid                                                         //支付的产品id          
				};
				_this.$ajax.post('/w/shop/listWebsiteCustomerCart.do',$.param({"sortPdid":[1, 0]})).then(function(res) {
					_this.goodsList =[];
					for(var s=0;s<res.data.data.length;s++){
						for(var t=0;t<_this.pdid.length;t++){
							if(_this.pdid[t] == res.data.data[s].pdid){
								_this.goodsList.push(res.data.data[s]); 
							}
						}
					}
					for(var k=0;k<_this.goodsList.length;k++){
							if((_this.goodsList[k].pdsts==0)||(_this.goodsList[k].isshf==0)){
								webUtil.showTip("你选中的部分产品已失效，请去购物车重新选择", 1.5);
								return false;
							}
					}
					_this.$ajax.post('/w/shop/addWSCstOrder.do', $.param(submitData)).then(function(res) {
						_this.clearCookie('pdid');                                                //删除cookie文件
						var wcoid =res.data.data;
						if(_this.payListId == 2){
							_this.$ajax.get("/member/payment.html").then(function(res){
							   newWindow = window.location.href.substring(0,window.location.href.indexOf('#'));
							   var newUrl=newWindow+'#payment&wcoid='+wcoid;
							   history.pushState(null,null,newUrl);
								 var data =res.data;
								var parentDom = $('.order_submit').parents('.view').first();
									parentDom.empty();
								var childContent = $(data).find('.payment')[0].outerHTML;
								 parentDom.html(childContent);
								 require([cssPath+"member/js/payment.js",cssPath+"member/js/xcConfirm.js"]);
							});
						}else{
							_this.$ajax.get("/member/orderdetail.html").then(function(res){
								  newWindow = window.location.href.substring(0,window.location.href.indexOf('#'));
								  var newUrl=newWindow+'#orderdetail&wcoid='+wcoid;
								  history.pushState(null,null,newUrl);
									var data =res.data;
								   var parentDom = $('.order_submit').parents('.view').first();
									   parentDom.empty();
								   var childContent = $(data).find('.orderDetail')[0].outerHTML;
									  parentDom.html(childContent);
									  require([cssPath+"member/js/orderDetail.js"]);
							 });
						}
				   }).catch(function(error) {
					   console.log(error);
				   });

				}).catch(function(error){
					console.log(error);
				});

				
			}
			
			//预存款的显示
//			inputDep() {
//
//				if(this.inputDeposit > this.deposit) {
//					this.inputShow = true;
//				} else {
//					this.inputShow = false
//				}
//				if(this.inputDeposit - this.totalMoney - this.carriage > 0) {
//					this.inputShowOver = true;
//				} else {
//					this.inputShowOver = false;
//				}
//			},
            //订单优惠
//			setPreferential() {
//				this.isPreferential = !this.isPreferential;
//			},
            //订单优惠券
//			setCoupon() {
//				this.isCoupon = !this.isCoupon;
//			},
            //订单预存款
//			setPrepaid() {
//				this.isPrepaid = !this.isPrepaid;
//			},
            //使用预存款
//          userDeposit() {
//				this.inputDeposit = this.deposit;
//			}

		}
		
	});

})