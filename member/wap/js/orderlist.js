$(function(){
    var currentCol=0;
    //监听滚动
    var FixedTop = $('#content .orderlist-header');
    var FixedNav = $('.orderlist-nav');
    $(document).scroll(function(){
        if( $(document).scrollTop()> 0 ){
            if(FixedTop.hasClass('Fixed'))return;
            FixedTop.addClass('Fixed');
            FixedNav.addClass('Fixed');
        }else {
            FixedTop.removeClass('Fixed');
            FixedNav.removeClass('Fixed');
        }
    });
    //公共模块
    function PublicNodes(){
        this.opera=['<button class="orderlist-btn btn0" data-btn="0" >确定收货</button>',
                    '<button class="orderlist-btn btn1" data-btn="1" >删除订单</button>',
                    '<button class="orderlist-btn btn2" data-btn="2" >追加评价</button>',
                    '<button class="orderlist-btn btn3" data-btn="3" >取消订单</button>',
                    '<button class="orderlist-btn btn4" data-btn="4" >付款</button>',
                    '<button class="orderlist-btn btn5" data-btn="5" >提醒发货</button>',
                    '<button class="orderlist-btn btn6" data-btn="6" >再次购买</button>',
                    '<button class="orderlist-btn btn7" data-btn="7" >彻底删除</button>'];
        this.reason=['我不想买了','信息填写错误','卖家缺货','同城见面交易','其他原因'];
        this.noMore='<p style="text-align:center;padding:1.8rem 0">已无更多订单</p>';
    }
    var publicNodes=new PublicNodes();
    //各模块的btn操作
    $(document).on("click", ".orderlist-btn", function(e) {
        var e = e || window.event;
        var $this = $(e.currentTarget);
        var wcoid=[];
            wcoid.push($this.parent().data('wcoid'));
        var btnClass = parseInt($this.data('btn'));
        var tip='',title='',opera=null;
        switch(btnClass){
            case 0 : tip='您确定收到宝贝？';title='确定收货' ;
                     confirmDialog(tip,title,function(){
                         $.when(shopUtil.updateReceivedStatus(wcoid)).done(function(flag){
                             if(flag){
                                 $.toast('成功');
                                 init(currentCol)
                             }
                         })
                     });break;

            case 1 : tip='订单将移至回收站？';title='删除订单' ;
                    confirmDialog(tip,title,function(){
                        $.when(shopUtil.disOrderStatus(wcoid)).done(function(flag){
                            if(flag){
                                $.toast('成功');
                                init(currentCol)
                            }
                        })
                    });break;

            case 2 : /*location.href=realpath+'评价.html' */;break;

            case 3 : radioDialog(wcoid);break;

            case 4 : location.href=realpath+'member/payment.html?wcoid='+$this.parent().data('wcoid');break;

            case 5 : tip='将提醒商家发货？';title='提醒发货' ;
                     confirmDialog(tip,title,function(){
                         $.when(shopUtil.remindSend(wcoid)).done(function(flag){
                             if(flag){
                                 removeRemindSend();
                                 $.toast('成功');
                                 init(currentCol)
                             }
                         });
                     });break;

            case 6 :var wcodList={};
                    wcodList.pds=[];
                    var arr =$this.parent().data('buyagain');
                    $.each(arr,function(k,v){
                        wcodList.pds.push({"ct":v.ct.toString(),"pdid":v.pdid.toString()})
                    });
                    var param=JSON.stringify(wcodList);
                    $.when(shopUtil.batchSetCart(param)).done(function(flag){
                        if(flag){
                            location.href=realpath+'member/ordercart.html';
                        }
                    });break;
            case 7 : tip='您确定要彻底删除该订单？';title='删除订单' ;
                    confirmDialog(tip,title,function(){
                        $.when(shopUtil.delOrderData(wcoid)).done(function(flag){
                            if(flag){
                                $.toast('成功');
                                init(currentCol)
                            }
                        });
                    });break;
        }
    });
    /*对话框*/
    function confirmDialog (tip,title,opera){
        $.confirm(tip, title, function() {
            opera()
        }, function() {
            //取消操作
        });
    }
    /*取消订单*/
    function radioDialog(wocid){
        $.actions({
            title:'请选择取消订单的原因',
            actions: [{
                text: publicNodes.reason[0],
                onClick: function(){
                    choseReason(this,wocid)
                }
            },{
                text: publicNodes.reason[1],
                onClick: function(){
                    choseReason(this,wocid)
                }
            },{
                text: publicNodes.reason[2],
                onClick: function(){
                    choseReason(this,wocid)
                }
            },{
                text: publicNodes.reason[3],
                onClick: function(){
                    choseReason(this,wocid)
                }
            },{
                text: publicNodes.reason[4],
                onClick: function(){
                    choseReason(this,wocid)
                }
            }]
        });
    }
    function choseReason(_this,wocid){
        var wocid =  wocid;
        var canrm =  _this.text;
        $.when(shopUtil.cancelOrderData(wocid,canrm)).done(function(flag){
            if(flag){
                $.toast('成功');
                init(currentCol)
            }
        });

    }
    /*提醒发货btn处理//已经提醒过发货*/
    function removeRemindSend(){
        var $this = $('.orderlist-footer');
        $.each($this,function(k,v){
            if($(v).data('rdct') >= 1){
                $(v).find('.btn5').removeClass('orderlist-btn').addClass('reminded');
            };
        })

    }
    //价格拆分
    function  splitOta(ota){
      var ota=parseFloat(ota).toFixed(2).split('.');
        intOta=ota[0],floatOta=ota[1];
        return {"intOta":intOta,"floatOta":floatOta}
    }
    //订单状态，与订单操作过滤
    function statusFilter (index,status){
        var currentStatus={};
        switch(index){
            case 0 :
                //筛选订单状态，添加status标识符，用于处理 订单状态栏和对应的操作
                switch(status){
                    case '12000':
                        currentStatus.status = '待付款';
                        currentStatus.opera = publicNodes.opera[3]+publicNodes.opera[4];
                        break;//待付款
                    case '11000':
                        currentStatus.status = '待发货';
                        currentStatus.opera = publicNodes.opera[3]+publicNodes.opera[5];
                        break;//待发货-->货到付款
                    case '12100':
                        currentStatus.status = '待发货';
                        currentStatus.opera = publicNodes.opera[5];
                        break;//待发货
                    case '12110':
                        currentStatus.status = '待收货';
                        currentStatus.opera = publicNodes.opera[0];
                        break;//待收货
                    case '11010':
                        currentStatus.status = '待收货';
                        currentStatus.opera = publicNodes.opera[0];
                        break;//待收货-->货到付款
                    case '21111':
                        currentStatus.status = '已完成';
                        currentStatus.opera = publicNodes.opera[1] + publicNodes.opera[6];
                        break;//已完成
                    default:
                        currentStatus.status = '回收站';
                        currentStatus.opera = publicNodes.opera[7] + publicNodes.opera[6];
                        break;
                    //已取消
                };break;
            case 1 :
                currentStatus.status = '待付款';
                currentStatus.opera = publicNodes.opera[3]+publicNodes.opera[4];
                break;//待付款
            case 2 :
                switch(status){
                    case '12100':
                        currentStatus.status = '待发货';
                        currentStatus.opera = publicNodes.opera[5];
                        break;//待发货;
                    case '11000':
                        currentStatus.status = '待发货';
                        currentStatus.opera = publicNodes.opera[3]+publicNodes.opera[5];
                        break;//待发货-->货到付款
                };break;
            case 3 :
                switch(status){
                    case '12110':
                        currentStatus.status = '待收货';
                        currentStatus.opera = publicNodes.opera[0];
                        break;//待收货
                    case '11010':
                        currentStatus.status = '待收货';
                        currentStatus.opera = publicNodes.opera[0];
                        break;//待收货-->货到付款
                };break;
            case 4 :
                currentStatus.status = '已完成';
                currentStatus.opera = publicNodes.opera[1] + publicNodes.opera[6];
                break;//已完成
            default:
                currentStatus.status = '回收站';
                currentStatus.opera = publicNodes.opera[7] + publicNodes.opera[6];
                break;
        };
        return currentStatus
    }
    //数据获取
    function loadData(index,pageIndex,pageMax,render){
        var params = {};
        params['pageIndex']= pageIndex;
        params['pageMax']= pageMax;
        switch(index){
            case 0: params['ordssts']= 1;break;//全部
            case 1: params['ordssts']= 3;break;//待付款
            case 2: params['ordssts']= 4;break;//待发货
            case 3: params['ordssts']= 5;break;//待收货
            case 4: params['ordssts']= 2;break;//已完成
        }
        $.when(shopUtil.loadOrderData(params.pageIndex,params.pageMax,params.ordssts)).done(function(orderData){
            var rows = orderData.rows;
            if(!rows.length) rows = [];
            render(getView(rows,currentCol,orderData.totalRecord),orderData.totalRecord);
        });
    }
    //视图创建
    function getView(rows,index,totalRecord){
        var content = '';
        if(rows.length){
            row=rows;
            $.each(row,function(k,v){
                var status = ''+v.ordssts+v.wptid+v.paysts+v.ogsts+v.recsts;
                var currentStatus = statusFilter(index,status);
                var state = currentStatus.status;
                var opera = currentStatus.opera;
                var wcodList =JSON.stringify(v.wcodList.slice()) ;
                /*订单号，订单状态*/
                var header='<div class="orderlist-order"><div class="orderlist-order-header"><span class="orderlist-orderNum">订单号：'+v.wcono+'</span><span class="order-list-orderStatus">【'+state+'】</span></div><div class="orderlist-order-body">';
                /*商品描述*/
                var body='';
                var allCt=0;
                $.each(v.wcodList,function(k,v){
                    var furl='',mktpic='';
                    allCt+=v.ct;
                    if(v.furl){furl=v.furl;}else {furl=imgPath+'images/nopic.jpg';}
                    if(v.mktpic){mktpic='<p class="orderlist-mktpic">￥'+parseFloat(v.mktpic).toFixed(2)+'</p>'}else {mktpic=''};
                    body+='<div class="orderlist-good clearfix"><div class="orderlist-goodImg"><img src='+furl+' /></div><div class="orderlist-goodDes"><p>'+v.pdn+'</p></div><div class="orderlist-goodPri"><p class="orderlist-slpic">￥'+parseFloat(v.slpic).toFixed(2)+'</p>'+mktpic+'<p class="orderlist-count">x'+v.ct+'</p></div></div>';
                });
                /*订单合计，订单操作*/
                var ota=splitOta(v.ota);
                var footer='<div class="orderlist-computed"><p>共'+allCt+'件商品 合计：￥<span>'+ota.intOta+'</span>.'+ota.floatOta+'（含运费￥'+parseFloat(v.stp).toFixed(2)+'）</p></div></div><div class="orderlist-footer" data-wcoid='+v.wcoid+' data-buyagain='+wcodList+' data-rdct='+v.rdct+' > '+opera+'</div></div> ';
                body = '<a href=orderdetail.html?wcoid='+v.wcoid+'>'+body+'</a>';
                content+=header+body+footer;
            });
            if(totalRecord<6)content+=publicNodes.noMore;
        }
        return content
    }
    //视图渲染
    function render(html){
        require(['jquery','weuijs'],function(){
            setTimeout(function(){
                $.hideLoading();//隐藏加载提示
                var emptyDom = $('.orderlist-empty');
                html?emptyDom.hide():emptyDom.show();
                var $dom = $('.orderlist-content');
                $dom.html(html);
                removeRemindSend();
            },500)

        })
    }
    //上拉加载，下拉刷新
    function updateData(){
        $(document.body).pullToRefresh().on("pull-to-refresh", function() {
            pageIndex = 1;
            loadData(currentCol,1,5,function(content,totalRecord){
                setTimeout(function(){
                    $(document.body).pullToRefreshDone();
                    render(content);
                    ifInfinite(totalRecord);
                },500)

            });
        });
    }
    function infiniteData(){
        $(document.body).off("infinite");
        // infinite
        $('.weui-loadmore').html('<i class="weui-loading"></i><span class="weui-loadmore__tips">正在加载</span>');
        var loading = false;
        $(document.body).infinite().on("infinite", function() {
            if(loading) return;
            loading = true ;
            pageIndex++;
            loadData(currentCol,pageIndex,5,function(content,totalRecord){
                if(!content) {
                    pageIndex--;
                    $('.weui-loadmore').html('<span class="weui-loadmore__tips">已无更多订单</span>');
                    $(document.body).destroyInfinite();
                }else {
                    $('.orderlist-content').append(content);
                }
            });
            loading = false ;
        });
    }
    require(['jquery','weuijs'],function(){
        updateData();
        $.showLoading();//提示正在加载}
    });
    //选项卡
    $('.orderlist-nav li').on('click',function(){
        var index=$(this).index();
        if(currentCol!=index){
            $('.orderlist-content').html('');//内容清空
            $('.orderlist-empty').hide();//空订单模块隐藏/内容清空
            $('.orderlist-nav li').eq(currentCol).find('span').removeClass('on');
            $(document).scrollTop(0);
            currentCol=index;
            $(this).find('span').addClass('on');
            require(['jquery','weuijs'],function(){
                $.showLoading();//提示正在加载}
            });
            init(currentCol)
        }
    });
    //初始化入口
    var pageIndex = 1;
    var ifLink = dataUtil.GetQueryString('currentCol');
    if(ifLink){
        var nav = $('.orderlist-nav li');
        currentCol = parseInt(ifLink);
        nav.eq(0).find('span').removeClass('on');
        nav.eq(currentCol).find('span').addClass('on');
        init(currentCol)
    }else {
        init(currentCol)
    }
    function init(currentCol){
          pageIndex = 1;
          loadData(currentCol,1,5,function(content,totalRecord){
              render(content);
              ifInfinite(totalRecord)
          });
    }
    //初始化判断是否有内容，无内容不提供滚动加载
    function ifInfinite(ifContent){
        require(['jquery','weuijs'],function(){
            $(document.body).destroyInfinite();
            $('.weui-loadmore').hide();
            if(ifContent>5){
                infiniteData();
                $('.weui-loadmore').show();
            }
        });
    }
})
