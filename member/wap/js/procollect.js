require(["vue.min", "axios.min", "es6-promise", "weuijs"], function (Vue, axios) {
    Vue.prototype.$ajax = axios;
    vm4 = new Vue({
        el: '.procollect',
        data: {
            productList: [],                                    //产品收藏信息列表	
            producturl: "../displayproduct.html?id=",           //地址拼接需求
            pageIndex:1,
            flag:false                                          //开关
        },
        filters: { //商品价格过滤器
            partFilter: function (value, type) {
                return '￥' + Number(value).toFixed(2) + type;
            }
        },
        mounted: function () {
            this.$nextTick(function () {
                $.toast.prototype.defaults.duration=500;
                this.getProductData();
                $.showLoading();
            });
        },
        methods: {
            getProductData: function () { //查询产品收藏列表
                var _this = this;
                _this.$ajax.post('/w/product/listProductCollectionR.do', $.param({ 
                    "pageIndex":_this.pageIndex,
                     "pageMax": 10
                })).then(function (res) {
                    _this.productList =_this.productList.concat((res.data.data.rows));
                    $.hideLoading();
                    $(".weui-loadmore").css("display",""); 
                    if(_this.productList.length==0){
                        _this.flag = true;
                        $('.weui-loadmore').html('<span class="weui-loadmore__tips">你还没有收藏过产品</span>'); 
                    }else if(_this.productList.length<(_this.pageIndex)*10){
                        _this.flag =false;
                        $('.weui-loadmore').html('<span class="weui-loadmore__tips">已无更多产品</span>');
                        $(document.body).destroyInfinite();
                    }
                }).catch(function (error) {
                    console.log(error);
                });
            },
            getTitleHref:function(pdid,isshf){     //过滤a标签的链接地址
                var _this = this;
                if(isshf==0){
                    return "javascript:void(0);"
                }else{
                   return _this.producturl+pdid;
                }  
            }
        }

    });
});
require(['jquery', 'weuijs'], function () {
    $(function () {
        $(".weui-loadmore").hide();
        $(document.body).off("infinite");
        var loading = false;
        $(document.body).infinite().on("infinite", function() {
            if(loading) return;
            loading = true ;
            vm4.pageIndex++;
            console.log(vm4.pageIndex);
             vm4.getProductData();
             $(document.body).destroyInfinite();
            loading = false ;
        });
    })
});