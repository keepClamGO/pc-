require(["vue.min", "axios.min", "es6-promise"], function (Vue, axios) {
    Vue.prototype.$ajax = axios;
    new Vue({
        el: '.orderdetail',
        data: {
            orderList: [],           //订单信息列表			
            orderNumber: '',         //订单id号码           
        },
        filters: { //商品价格过滤器
            partFilter: function (value, type) {
                return '￥' + Number(value).toFixed(2) + type;
            }
        },
        mounted: function () {
            this.$nextTick(function () {
                this.getOrderData(); //订单详情接口
            });
        },
        methods: {
            getOrderData: function () { //查询会员订单详情接口
                //this.orderNumber = window.location.href.substring(window.location.href.indexOf('wcoid=') + 6);
                var reg = new RegExp("(^|&)wcoid=([^&]*)(&|$)");
                var r = window.location.search.substr(1).match(reg);
                this.orderNumber=unescape(r[2]);
                var _this = this;
                this.$ajax.post('/w/shop/infoCustomerOrders.do', $.param({
                    "wcoid": _this.orderNumber
                })).then(function (res) {
                    _this.orderList = res.data.data;
                    if(_this.orderList==null || _this.orderList==undefined){
                      window.location.href = "index.html";
                    }
                }).catch(function (error) {
                    console.log(error);
                });
            },
            payMentTab: function () { //立即支付跳转
                window.location.href = 'payment.html?wcoid=' + this.orderNumber;
            },
            m_confirmReceipt: function () { //确认收货的事件
                var _this = this;
                $.confirm("","确认收货",function(){
                    _this.$ajax.post('/w/shop/updateReceivedStatus.do', $.param({
                        "wcoid": _this.orderNumber
                    })).then(function (res) {
                        console.log(res);
                        if (res.data.result == "SUCCESS") {
                            if (res.data.data == 1) {
                                _this.getOrderData();
                            }
                        }
                    }).catch(function (error) {
                        console.log(error);
                    });
                });
            },
            deleteOrderCancel:function(){ //订单取消下，删除订单
                var _this = this;
                $.confirm("","确认删除订单",function(){
                    _this.$ajax.post('/w/shop/delWSCstOrder.do', $.param({
                        "wcoid": _this.orderNumber
                    })).then(function (res) {
                        $.toast("删除成功", "text");
                        console.log(res);
                    }).catch(function (error) {
                        console.log(error);
                    });
                }); 
            },

            deleteOrder:function(){  //完成收货时，删除订单  (实际为取消订单)
                var _this = this;
                $.confirm("","确认删除订单",function(){
                    _this.$ajax.post('/w/shop/disOrderStatus.do', $.param({
                        "wcoid": _this.orderNumber
                    })).then(function (res) {
                        $.toast("删除成功", "text");
                    }).catch(function (error) {
                        console.log(error);
                    });
                });
            },
            remindOutgoing:function(){   //提醒发货  
                var _this = this;
                if(_this.orderList.rdct>0){
                    return false;
                }else{

                    $.confirm("","提醒发货",function(){
                        _this.$ajax.post('/w/shop/remindOutgoing.do', $.param({
                            "wcoid": _this.orderNumber
                        })).then(function (res) {
                            $.toast("提醒成功","text");
                            _this.getOrderData();
                        }).catch(function (error) {
                            console.log(error);
                        });
                    }); 

                }
            },
            expressInfo:function(){
                window.open("http://m.kuaidi100.com/index.jsp");
            }
        }

    });
});