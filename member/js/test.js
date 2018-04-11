require(["Vue", "axios" ], function(Vue, axios) {
	Vue.prototype.$ajax = axios;
	new Vue({
		el: '.orderInfo',
		data: {
			addressList: [],
			goodsList: [],
			addrIndex: 0,
			payList: 0,
			showNum: 2,
			add_more: '展示更多地址',
			isModAddress: false,
			flag: true,
			modName: '',
			modStreetAddress: '',
			modTel: '',
			postscript: '', //备注信息
			isInvoice: false,
			isPreferential: false,
			isCoupon: false,
			deposit: 450, //预存款总价格
			inputDeposit: 0, //输入的预存款
			inputShow: false,
			inputShowOver: false,
			totalMoney: 0, //总价格
			carriage: 5, //运费
			isPrepaid: false,
			send: { //收货人的信息
				sendPeople: '', //寄送人
				consignee: '', //收获人
				sendTel: '' //收货人电话	
			},
			jsPath: '//js.iyongkf.kenfor.com',
			paylist: [{
					img: imgPath + 'member/images/pay_list01.png',
					title: '支付宝'
				},
				{
					img: imgPath + 'member/images/pay_list02.png',
					title: '微信支付'
				},
				{
					img: imgPath + 'member/images/pay_list03.png',
					title: '银联支付'
				},
				{
					img: imgPath + 'member/images/pay_list04.png',
					title: ''
				}
			]
		},
		filters: {
			partFilter: function(value, type) {
				return '￥' + Number(value).toFixed(2) + type;
			}
		},
		//计算属性
		computed: {
			filterAddList: function() {
				return this.addressList.slice(0, this.showNum);
			}
		},
		//一加载就运行这个
		mounted: function() {
			this.$nextTick(function() {
				this.getAddressList();
			})
		},
		methods: {
			//提取地址数据数据
			getAddressList: function() {
				this.$ajax.post('/w/shop/listConsigneeAddress.do', { 
					"pageIndex": 1,
					"pageMax": 5,
				}).then(function(res) {
					console.log(res);
					console.log(res.data.result);
				}).catch(function(error) {
					console.log(error);
				})
			},
			addAddress: function() {
				this.isModAddress = !this.isModAddress;
			},
			//控制展示数量
			showAdderNum: function() {
				if(this.flag) {
					this.showNum = this.addressList.length;
					this.add_more = '收起更多地址';
					this.flag = !this.flag;
				} else {
					this.showNum = 2;
					this.add_more = '展示更多地址';
					this.flag = !this.flag;
				}
			},
			setInvoice() {
				this.isInvoice = !this.isInvoice;
			},
			setPreferential() {
				this.isPreferential = !this.isPreferential;
			},
			setCoupon() {
				this.isCoupon = !this.isCoupon;
			},
			setPrepaid() {
				this.isPrepaid = !this.isPrepaid;
			},
			//计算总金额
			calTotalMoney: function() {
				this.totalMoney = 0;
				this.goodsList.forEach((item, index) => {
					this.totalMoney += item.productPrice * item.productQuantity;
				})
			},
			//向后台添加数据，待完善
			addAddrelist() {
					  
			},
			addrIndexof(index) {
				this.addrIndex = index;
				this.send.sendPeople = this.addressList[index].streetName;
				this.send.consignee = this.addressList[index].userName;
				this.send.sendTel = this.addressList[index].tel;
			},
			payListIndex(index) {
				this.payList = index;
			},
			submitOrder() {
				console.log('提交成功');
				window.location.href = 'payment.html';
			},
			userDeposit() {
				this.inputDeposit = this.deposit;
			},
			inputDep() {

				if(this.inputDeposit > this.deposit) {
					this.inputShow = true;
				} else {
					this.inputShow = false
				}
				if(this.inputDeposit - this.totalMoney - this.carriage > 0) {
					this.inputShowOver = true;
				} else {
					this.inputShowOver = false;
				}
			},
			postInfo() {
				console.log(this.postscript)
			}

		}
	});

})