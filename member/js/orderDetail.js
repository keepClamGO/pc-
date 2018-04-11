require(["vue.min", "axios.min","es6-promise"], function (Vue, axios) {
    Vue.prototype.$ajax = axios;
    new Vue({
        el: '.orderDetail',
        data: {
            orderList: [], //订单信息列表			
            orderNumber: '' //订单id号码                
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
                /*this.orderNumber = window.location.href.substring(window.location.href.indexOf('wcoid=') + 6);*/
                var reg = new RegExp("(^|&)wcoid=([^&]*)(&|$)");
                var r = window.location.search.substr(1).match(reg);
                this.orderNumber=unescape(r[2]);
                var _this = this;
                this.$ajax.post('/w/shop/infoCustomerOrders.do', $.param({
                    "wcoid": _this.orderNumber
                })).then(function (res) {
                    _this.orderList = res.data.data;
                }).catch(function (error) {
                    console.log(error);
                });
            },
            payMentTab: function () { //立即支付跳转
                window.location.href = 'payment.html?wcoid=' + this.orderNumber;
            },
            confirmReceipt: function () { //确认收货的事件
                var _this = this;
                var txt=  "确认已经收到商品";
                var option = {
                    title: '提示',
                    btn: parseInt("0011",2),
                    onOk: function(){
                        _this.$ajax.post('/w/shop/updateReceivedStatus.do', $.param({
                            "wcoid": _this.orderNumber
                        })).then(function (res) {
                            console.log(res);
                            if(res.data.result=="SUCCESS"){
                                if(res.data.data==1){
                                    _this.getOrderData();  
                                }
                            }
                        }).catch(function (error) {
                            console.log(error);
                        });
                       $('.xcConfirm').remove();
                    },
                    onCancel:function(){

                    },
                    onClose:function(){
 
                    }
                };
                window.wxc.xcConfirm(txt, "custom", option);
                $('.xcConfirm').addClass('bank');
                $('.sgBtn.ok').text('已收到货物');
                $('.sgBtn.cancel').text('未收到货物');
            }
        }
    });
});