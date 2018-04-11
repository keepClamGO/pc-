
$(function(){
    //选项卡下划线长度调整
    function changeNav_line(){
        var tabLineNum=$('.myOrder_nav>li');
        for(var i=0,len=tabLineNum.length; i<len; i++){
            $('.myOrder_nav_line>li').eq(i).css('width',parseInt(tabLineNum.eq(i).css('width'))-1);
        };
    }
    //公共模块tHeader,tFooter,norder
    function PublicNodes(){
        this.tHeader='<table class="myOrder_tab">'+
            '<thead>' +
            '      <tr>' +
            '          <th>'+langUtil.orderlist_goods+'</th>' +
            '          <th>'+langUtil.orderlist_unit_price+'</th>' +
            '          <th>'+langUtil.orderlist_quantity+'</th>' +
            '          <th>'+langUtil.orderlist_total_price+'</th>' +
            '          <th>'+langUtil.orderlist_order_status+'</th>' +
            '          <th>'+langUtil.orderlist_operation+'</th>' +
            '      </tr>' +
            '  </thead>';
        this.tFooter='<tfoot>' +
            '      <tr class="myOrder_sep_row">' +
            '          <td colspan="6"></td>' +
            '      </tr>' +
            '      <tr>' +
            '          <td colspan="6" >' +
            '              <ul  class="pagination"></ul>' +
            '          </td>' +
            '      </tr>' +
            '  </tfoot>' +
            '</table>';
        this.norder='<div style="width:1082px">'+
            '           <div class="empty_box">' +
            '             <i class="empty_icon"></i>' +
            '             <div class="empty_txt">' +
            // '               '+langUtil.orderlist_noGoodsTip+'<a href="'+realpath+'index.html">'+langUtil.orderlist_toBuy+' >></a>' +
                           langUtil.indexC_nAboutOrder+
            '             </div>' +
            '           </div>'+
            '        </div>'
    }
    var publicNodes=new PublicNodes();
    //数据加载函数
    function loadOrderList(index){
        var $dom = $("#myOrder_content");//生成列表容器ID,id如果是唯一可以直接写个数字就行
        var $nav = $("#myOrder_nav_"+index);
        var pageNo = $nav.data("page");//当前页码，需要先在容器ID添加一个data-page="1"，默认第一页
        var pageMax = $nav.data("max");//一页请求多少条数据，方法同上
        var params=	{};
        params['pageIndex']= pageNo;
        params['pageMax']= pageMax;
        //筛选不同状态的参数，全部订单index=0，只需要pageIndex和pageMax；其余index为1,2,3传入不同的订单状态参数
        switch(index){
            case 0: params['ordssts']= 1;params['ismb']= 0;break;//全部
            case 1: params['ordssts']= 3;params['ismb']= 0;break;//待付款
            case 2: params['ordssts']= 4;params['ismb']= 0;break;//待发货
            case 3: params['ordssts']= 5;params['ismb']= 0;break;//待收货
            case 4: params['ordssts']= 2;params['ismb']= 0;break;//已完成
            case 5: params['ordssts']= 0;params['ismb']= 0;break;//已取消
        }
        /* 参数依次是 分页页码，分页大小，订单状态，支付状态，发货状态，收货状态 ，是否移动端订单 */
        $.when(shopUtil.loadOrderData(pageNo,pageMax,params.ordssts)).done(function(orderData){
            if(orderData){
                getColOrderNum(orderData);/*各栏目订单数量*/
                function loadListData(){
                    if(orderData.rows.length){//有订单的情况
                        row=orderData.rows;
                        //读取数据，并渲染
                        var content='';
                        $.each(row, function(k, v){
                            //筛选订单状态，添加status标识符，用于处理 订单状态栏和对应的操作
                            var myOrder_current_status = '';
                            var myOrder_handle1 = '';
                            var myOrder_handle2 = '<p class="myOrder_handle2" onclick="cancelOrder('+ v.wcoid+','+4 +')">'+langUtil.orderlist_drawback+'</p>';//申请退款
                            var myOrder_delete = '';
                            var myOrder_detail = '<a href=orderdetail.html?wcoid='+v.wcoid + ' class="myOrder_detail" >'+langUtil.orderlist_order_detail+'</a>';
                            var wcodList =JSON.stringify(v.wcodList.slice()) ;
                            switch(index){
                                case 0 :
                                    //筛选订单状态，添加status标识符，用于处理 订单状态栏和对应的操作
                                    switch(''+v.ordssts+v.wptid+v.paysts+v.ogsts+v.recsts){
                                        case '12000': myOrder_current_status = '<p class="myOrder_current_status">'+ langUtil.orderlist_order_status1+'</p>';
                                            myOrder_handle1 = '<a href="payment.html?wcoid='+v.wcoid+'" class="myOrder_handle1">'+langUtil.orderlist_order_operation1+'</a>';//付款
                                            myOrder_handle2 = '<p class="myOrder_handle2"  onclick="cancelOrder('+ v.wcoid+','+3 +')">'+langUtil.orderlist_cancel_order+'</p>'; /*取消订单*/
                                            myOrder_delete='';
                                            break;//待付款
                                        case '11000': myOrder_current_status= '<p class="myOrder_current_status">'+ langUtil.orderlist_order_status1+'</p>';
                                            myOrder_handle1 = '<a href="javascript:;" onclick="delOrder('+ v.wcoid+','+4 +')" data-wcoid="'+v.wcoid+'" data-rdct="'+v.rdct+'" class="myOrder_handle1 remindSend">'+langUtil.orderlist_order_operation3+'</a>';//提醒发货
                                            myOrder_handle2 = '<p class="myOrder_handle2" onclick="cancelOrder('+ v.wcoid+','+3 +')">'+langUtil.orderlist_cancel_order+'</p>';/*货到付款未发货，取消订单*/
                                            myOrder_delete='';
                                            break;//待发货-->货到付款
                                        case '12100': myOrder_current_status = '<p class="myOrder_current_status">'+ langUtil.orderlist_order_status3+'</p>';
                                            myOrder_handle1 = '<a href="javascript:;"  onclick="delOrder('+ v.wcoid+','+4 +')" data-wcoid="'+v.wcoid+'" data-rdct="'+v.rdct+'" class="myOrder_handle1 remindSend">'+langUtil.orderlist_order_operation3+'</a>';//提醒发货
                                            myOrder_handle2 = '';/*---------售后功能屏蔽 ----------*/
                                            myOrder_delete='';
                                            break;//待发货
                                        case '12110': myOrder_current_status = '<p class="myOrder_current_status">'+ langUtil.orderlist_order_status4+'</p>';
                                            myOrder_handle1 = '<a href="javascript:;"  onclick="delOrder('+ v.wcoid+','+5 +')" data-wcoid="'+v.wcoid+'" class="myOrder_handle1 ">'+langUtil.orderlist_order_operation4+'</a>';//确定收货
                                            myOrder_handle2 = '';/*---------售后功能屏蔽 ----------*/
                                            myOrder_delete='';
                                            break;//待收货
                                        case '11010': myOrder_current_status='<p class="myOrder_current_status">'+ langUtil.orderlist_order_status4+'</p>';
                                            myOrder_handle1 = '<a href="javascript:;"  onclick="delOrder('+ v.wcoid+','+5 +')" data-wcoid="'+v.wcoid+'" class="myOrder_handle1 ">'+langUtil.orderlist_order_operation4+'</a>';//确定收货
                                            myOrder_handle2 = '<p class="myOrder_handle2" onclick="cancelOrder('+ v.wcoid+','+4 +')">'+langUtil.orderlist_returnPur+'</p>';/*申请退货*/
                                            myOrder_handle2 = '';/*---------售后功能屏蔽 ----------*/
                                            myOrder_delete='';
                                            break;//待收货-->货到付款
                                        case '21111':myOrder_current_status = '<p class="myOrder_current_status">'+ langUtil.orderlist_completed+'</p>';
                                            myOrder_handle1 = '<a href="javascript:;" data-wcoid="'+v.wcoid+'" data-buyagain='+wcodList+' class="myOrder_handle1 buyAgain">'+langUtil.orderlist_buyAgain+'</a>';//再次购买
                                            myOrder_handle2 = '<p class="myOrder_handle2"  onclick="delOrder('+ v.wcoid+','+2 +')">'+langUtil.indexC_del+'</p>'; /*移到回收站*/
                                            myOrder_delete='';
                                            break;//已完成
                                        default: myOrder_delete='<i onclick="delOrder('+ v.wcoid+','+0 +')" class="myOrder_delete iconfontt icon-p-delet"></i>';
                                            myOrder_current_status='<p class="myOrder_current_status">'+ langUtil.orderlist_order_status5+'</p>';
                                            myOrder_handle1 = '<a href="javascript:;" data-wcoid="'+v.wcoid+'" data-buyagain='+wcodList+' class="myOrder_handle1 buyAgain">'+langUtil.orderlist_buyAgain+'</a>';//再次购买
                                            myOrder_handle2 = '';
                                            myOrder_detail = '';
                                        //已取消
                                    };break;
                                case 1 : myOrder_current_status = '<p class="myOrder_current_status">'+ langUtil.orderlist_order_status1+'</p>';
                                    myOrder_handle1 = '<a href="payment.html?wcoid='+v.wcoid+'" class="myOrder_handle1">'+langUtil.orderlist_order_operation1+'</a>';//付款
                                    myOrder_handle2 = '<p class="myOrder_handle2"  onclick="cancelOrder('+ v.wcoid+','+3 +')">'+langUtil.orderlist_cancel_order+'</p>'; /*取消订单*/
                                    break;//待付款
                                case 2 :
                                    switch(''+v.ordssts+v.wptid+v.paysts+v.ogsts+v.recsts){
                                        case '12100': myOrder_current_status= '<p class="myOrder_current_status">' + langUtil.orderlist_order_status3 + '</p>';
                                            myOrder_handle1 = '<a href="javascript:;" onclick="delOrder(' + v.wcoid + ',' + 4 + ')" data-wcoid="' + v.wcoid + '" data-rdct="' + v.rdct + '" class="myOrder_handle1 remindSend">' + langUtil.orderlist_order_operation3 + '</a>';//提醒发货
                                            myOrder_handle2 = '';/*---------售后功能屏蔽，删除本行取消屏蔽----------*/
                                            break;//待发货;
                                        case '11000': myOrder_current_status= '<p class="myOrder_current_status">'+ langUtil.orderlist_order_status1+'</p>';
                                            myOrder_handle1 = '<a href="javascript:;" onclick="delOrder('+ v.wcoid+','+4 +')" data-wcoid="'+v.wcoid+'" data-rdct="'+v.rdct+'" class="myOrder_handle1 remindSend">'+langUtil.orderlist_order_operation3+'</a>';//提醒发货
                                            myOrder_handle2 = '<p class="myOrder_handle2" onclick="cancelOrder('+ v.wcoid+','+3 +')">'+langUtil.orderlist_cancel_order+'</p>';/*货到付款未发货，取消订单*/
                                            myOrder_delete='';
                                            break;//待发货-->货到付款
                                    };break;
                                case 3 :
                                    switch(''+v.ordssts+v.wptid+v.paysts+v.ogsts+v.recsts){
                                        case '12110':myOrder_current_status= '<p class="myOrder_current_status">' + langUtil.orderlist_order_status4 + '</p>';
                                            myOrder_handle1 = '<a href="javascript:;" onclick="delOrder(' + v.wcoid + ',' + 5 + ')" data-wcoid="' + v.wcoid + '" class="myOrder_handle1 ">' + langUtil.orderlist_order_operation4 + '</a>';//确定收货
                                            myOrder_handle2 = '';/*---------售后功能屏蔽，删除本行取消屏蔽----------*/
                                            break;//待收货
                                        case '11010':myOrder_current_status='<p class="myOrder_current_status">'+ langUtil.orderlist_order_status4+'</p>';
                                            myOrder_handle1 = '<a href="javascript:;"  onclick="delOrder('+ v.wcoid+','+5 +')" data-wcoid="'+v.wcoid+'" class="myOrder_handle1 ">'+langUtil.orderlist_order_operation4+'</a>';//确定收货
                                            myOrder_handle2 = '<p class="myOrder_handle2" onclick="cancelOrder('+ v.wcoid+','+4 +')">'+langUtil.orderlist_returnPur+'</p>';//申请退货
                                            myOrder_handle2 = '';/*---------售后功能屏蔽，删除本行取消屏蔽----------*/
                                            myOrder_delete='';
                                            break;//待收货-->货到付款
                                    };break;
                                case 4 : myOrder_current_status = '<p class="myOrder_current_status">'+ langUtil.orderlist_completed+'</p>';
                                    myOrder_handle1 = '<a href="javascript:;" data-wcoid="'+v.wcoid+'" data-buyagain='+wcodList+' class="myOrder_handle1 buyAgain">'+langUtil.orderlist_buyAgain+'</a>';//再次购买
                                    myOrder_handle2 = '<p class="myOrder_handle2"  onclick="delOrder('+ v.wcoid+','+2 +')">'+langUtil.indexC_del+'</p>'; /*移到回收站*/
                                    myOrder_delete='';
                                    break;//已完成
                                case 5 : myOrder_delete='<i onclick="delOrder('+ v.wcoid+','+0 +')" class="myOrder_delete iconfontt icon-p-delet"></i>';
                                    myOrder_current_status='<p class="myOrder_current_status">'+ langUtil.orderlist_order_status5+'</p>';
                                    myOrder_handle1 = '<a href="javascript:;" data-wcoid="'+v.wcoid+'" data-buyagain='+wcodList+' class="myOrder_handle1 buyAgain" >'+langUtil.orderlist_buyAgain+'</a>';//再次购买
                                    myOrder_handle2 = '';
                                    myOrder_detail = '';
                                    break;
                                //已取消
                            }

                            //生成对应的节点tHeader,content=node1+node2+node3,tFooter
                            var node1_top = ' <tbody class="myOrder_list"  data-wcoid="'+v.wcoid+'" data-cstid="'+v.cstid+'" data-status="'+v.status+'" >' +
                                '    <tr class="myOrder_sep_row">' +
                                '        <td colspan="6"></td>' +
                                '    </tr>' +
                                '    <tr class="myOrder_num">' +
                                '        <td colspan="6">' +
                                '  '+langUtil.orderlist_order_num+langUtil.Global_symbol+'<span>'+v.wcono+'</span>'+langUtil.orderlist_order_date+langUtil.Global_symbol+'<span>'+v.crdt+'</span>' ;
                            var node1_bottom ='</td>' +
                                '    </tr>' +
                                '    <tr>' +
                                '        <td class="myOrder_infos" colspan="3">';
                            var node1=node1_top+myOrder_delete+node1_bottom;
                            //保留2位小数
                            var ota = parseFloat(v.ota).toFixed(2);
                            var stp = parseFloat(v.stp).toFixed(2);
                            var node3_top = ' </td>' +
                                '         <td>' +
                                '              <span class="orderPrice">'+langUtil.Global_Amount+ota+'</span>' +
                                '              <p  class="otherPrice">'+langUtil.orderlist_order_price1+'<span>'+langUtil.Global_Amount+stp+'</span>'+langUtil.orderlist_order_price2+'</p>' +
                                '          </td>' +
                                '          <td>' ;
                            var node3_center = myOrder_detail +
                                '          </td>' +
                                '          <td>' ;
                            var node3_bottom ='</td>' +
                                '      </tr>' +
                                '  </tbody>';
                            var node3 =node3_top + myOrder_current_status + node3_center + myOrder_handle1 + myOrder_handle2 + node3_bottom;

                            var node2 = '';
                            $.each(v.wcodList,function(k,v){
                                //保留2位小数
                                var slpic = parseFloat(v.slpic).toFixed(2);
                                var mktpic = parseFloat(v.mktpic).toFixed(2);
                                var node2_top= '  <div class="myOrder_info clearfix">' +
                                    '<div class="myOrder_goods">';
                                if(v.furl){/*添加默认图片*/
                                    node2_top += '<img src="'+v.furl+'" alt=""/>';
                                }else{
                                    node2_top += '<img src="'+imgPath+'/images/nopic.jpg" alt="暂无图片"/>';
                                }
                                node2_top += ' <div class="myOrder_intro" ><span>'+v.pdn+'</span></div>' +
                                    '      </div>' +
                                    '      <div class="myOrder_price"><p>' ;
                                var node2_bottom= '<span class="myOrder_nowPrice">'+langUtil.Global_Amount+slpic+'</span></p>' +
                                    '      </div>' +
                                    '      <div class="myOrder_count">' +
                                    '          <p>'+v.ct+'</p>' +
                                    '      </div>' +
                                    '  </div>' ;
                                var if_oldPrice=v.mktpic?'<span class="myOrder_oldPrice">'+langUtil.Global_Amount+mktpic+'</span><br/>':'';
                                node2+=node2_top+if_oldPrice+node2_bottom;
                            });

                            content+=node1+node2+node3
                        });
                        content=publicNodes.tHeader+content+publicNodes.tFooter;
                        $dom.html(content);
                    }else { //无订单情况
                        var  content=publicNodes.tHeader+'</table>'+publicNodes.norder;
                        $dom.html(content);
                    }
                    var $this=$('.remindSend');
                    if($this.length>0){
                        for(var i=0,len=$this.length; i<len; i++){
                            removeRemindSend($($this[i]));
                        }
                    }
                }
                loadListData();
                function page(){
                    //分页dataUtil.page('分页容器对象','第几页','数据总数','一页显示几条','总页数')
                    var $page = $(".pagination");
                    dataUtil.page($page,orderData.pageIndex,orderData.totalRecord,orderData.pageMax,orderData.pageNum);
                    //清除之前的绑定事件
                    $page.undelegate("a", "click");
                    //绑定分页事件
                    $page.delegate("a", "click", function(e){
                        e.stopPropagation();
                        e.preventDefault();
                        dataUtil.loadPageInfo(index, $(this), $(this).data("page"), "#myOrder_nav_");
                        loadOrderList(index);
                    });
                }
                page();
            }
        });
    }
    var currentCol=0;//当前栏目
    //各栏目订单数量
    function getColOrderNum(listNumber){
        var allOrder_orderNum=listNumber.num1;
        var noPay_orderNum=listNumber.num3;
        var noSend_orderNum=listNumber.num4;
        var noTake_orderNum=listNumber.num5;
        var finish_orderNum=listNumber.num2;
        var canceled_orderNum=listNumber.num0;
        var nav=$('.myOrder_nav>li');
        nav.eq(0).find('span').html(allOrder_orderNum);
        nav.eq(1).find('span').html(noPay_orderNum);
        nav.eq(2).find('span').html(noSend_orderNum);
        nav.eq(3).find('span').html(noTake_orderNum);
        nav.eq(4).find('span').html(finish_orderNum);
        nav.eq(5).find('span').html(canceled_orderNum);
        changeNav_line()
    }
    //初始化函数
    function initDta(index){
            currentCol = index;
            tab_on(index);
            loadOrderList(index);
    }
    //是否由index跳转过来
    var ifLink=dataUtil.GetQueryString('currentCol');
    if(ifLink)currentCol=parseInt(ifLink);//设置当期栏目
    //初始化

    initDta(currentCol);
    //选项卡
    $('.myOrder_nav>li').on('click', function(){
        var index = $(this).index();
        if(index==currentCol)return;
        initDta(index);
    });
    //栏目切换
    function tab_on(index){
        $('.myOrder_nav>li').eq(index).addClass('on').siblings().removeClass('on');
        $('.myOrder_nav_line>li').eq(index).addClass('on').siblings().removeClass('on');
    }
    //“二次确认” 确认事件
    $(document).on('click','.del_confirm',function(e){
        var e=e||window.event;
        var _this=e.currentTarget,
            $this=$(_this);
        var wcoid=[];
        wcoid.push($this.data('wcoid').toString());
        var flag=false;
        var _data=$this.data('ordssts');
        var ifReturnPage1 = function (flag){
            if(_data!=4 &&flag){
                $("#myOrder_nav_"+currentCol).data('page',1);
                webUtil.showTip(langUtil.ordercart_operate+langUtil.complete,1.5);
            }
            closeDialog();
            initDta(currentCol)
        }
        if(_data==0){/*回收站，彻底删除*/
            $.when(shopUtil.delOrderData(wcoid)).done(function(flag){
                ifReturnPage1(flag)
            })
        }else if(_data==2){/*已完成订单，移到回收站*/
            $.when(shopUtil.disOrderStatus(wcoid)).done(function(flag){
                ifReturnPage1(flag)
            })
        }else if(_data==4){/*提醒发货*/
            $.when(shopUtil.remindSend(wcoid)).done(function(flag){
                ifReturnPage1(flag)
            })
        }else if(_data==5){/*确认收货*/
            $.when(shopUtil.updateReceivedStatus(wcoid)).done(function(flag){
                ifReturnPage1(flag)
            })
        }


    });
    //“意见提交” 确认事件
    $(document).on('click','.btn_confirm',function(e){
        var e=e||window.event;
        var _this=e.currentTarget,
            $this=$(_this);
        if(!$this.hasClass('btn_disabled')){
            var canrm=$('.reason.selected ').text();
            var wocids=[];
            wocids.push($this.data('wcoid').toString());
            var flag=false;
            var _data=$this.data('ordssts');
            if(_data==3){/*未付款订单，取消订单*/
                $.when(shopUtil.cancelOrderData(wocids,canrm)).done(function(flag){
                    if(flag){
                        webUtil.showTip(langUtil.ordercart_operate+langUtil.complete,1.5);
                    }
                });
            }else if( _data == 4 || _data == 5 ){/*已付款，申请退款*/
                webUtil.showTip('正在建设中。。。',1.5);
            }
            closeCancelDialog();
            initDta(currentCol)
        }

    });
    //“再次购买”批量添加商品到购物车，并跳转至购物车
    $(document).on('click','.buyAgain',function(e){
        var e=e||window.event;
        var _this=e.currentTarget,
            $this=$(_this);
        var wcodList={};
            wcodList.pds=[];
        var arr =$this.data('buyagain');
        $.each(arr,function(k,v){
            wcodList.pds.push({"ct":v.ct.toString(),"pdid":v.pdid.toString()})
        });
        var param=JSON.stringify(wcodList);
        $.when(shopUtil.batchSetCart(param)).done(function(flag){
            if(flag){
                location.href=realpath+'mycart.html';
            }
        });
    });
    //已经提醒过发货
    function removeRemindSend($this){
        if($this.data('rdct')>=1){
            $this.html(langUtil.orderlist_remind);
            $this.css('background','#f7f7f7').css('borderColor','#555555').css('color','#555555');
            $this.removeAttr('onclick')
        };
    }
});
//“二次确认”对话框
function delOrder(wcoid,ordssts){
    var visualH = $(window).height()/2-150;
    var visualW = $(window).width()/2-250;
    var tip1=langUtil.orderlist_dialog_delTip1,
        tip2=langUtil.orderlist_dialog_delTip2;//默认，回收站删除tip
        if(ordssts==2){//已完成，移到回收站
            tip2=langUtil.orderlist_dialog_delTip3;
        }else if(ordssts==4){//提醒发货
            tip1=langUtil.orderlist_dialog_delTip4;
            tip2='';
        }else if(ordssts==5){//确认收货
            tip1=langUtil.orderlist_dialog_delTip5;
            tip2='';
        }
    var delStr = '<div class="del_dialog" style="position:fixed;left:'+visualW+'px;top:'+visualH+'px;">' +
    '   <div class="dialog_title">' +
    '       <span>'+langUtil.orderlist_dialog_delTip+'</span>' +
    '       <a class="dialog_close" onclick="closeDialog()"></a>' +
    '   </div>' +
    '   <div class="dialog_content">' +
    '      <div class="tip_box">' +
    '         <i class="tip_icon"></i>' +
    '         <div class="tip_item">' +
    '            <div class="tip_txt1">'+tip1+'</div>' +
    '            <div class="tip_txt2">'+tip2+'</div>' +
    '            <div class="tip_btn">' +
    '                <a class="btn_1 del_confirm"  data-ordssts='+ordssts+' data-wcoid='+wcoid+' >'+langUtil.orderlist_dialog_delConfirm+'</a>' +
    '                <a class="btn_2 del_cancel" onclick="closeDialog()">'+langUtil.orderlist_dialog_delCancel+'</a>' +
    '            </div>' +
    '         </div>' +
    '      </div>' +
    '   </div>' +
    '</div>' +
    '<div class="dialog_mask"></div>';
    $("body").append(delStr);
}
function closeDialog(){
    $(".del_dialog").remove();
    $(".dialog_mask").remove();
}
//“意见提交” 对话框
function cancelOrder(wcoid,ordssts){
    var visualH = $(window).height()/2-150;
    var visualW = $(window).width()/2-250;
    var cancelStr = '<div class="cancel_dialog" style="position:fixed;left:'+visualW+'px;top:'+visualH+'px;">' +
        '<div class="dialog_title">' +
        '<span>'+langUtil.ordercart_tip+'</span>' +
        '<a class="dialog_close" onclick="closeCancelDialog()"></a>' +
        '</div>' +
        '<div class="cancel_content">' +
        '<div class="cancelReason_list">' +
        '   <div class="reason">'+langUtil.orderlist_dialog_cancelReason1+'<i></i></div>' +
        '   <div class="reason">'+langUtil.orderlist_dialog_cancelReason2+'<i></i></div>' +
        '   <div class="reason">'+langUtil.orderlist_dialog_cancelReason3+'<i></i></div>' +
        '   <div class="reason">'+langUtil.orderlist_dialog_cancelReason4+'<i></i></div>' +
        '   <div class="reason">'+langUtil.orderlist_dialog_cancelReason5+'<i></i></div>' +
        '   <div class="reason">'+langUtil.orderlist_dialog_cancelReason6+'<i></i></div>' +
        '</div>' +
        '<div class="btn_item">' +
        '<a href="javascript:;" class="btn_cancel" onclick="closeCancelDialog()">'+langUtil.ordercart_think+'</a>' +
        '<a href="javascript:;" data-ordssts='+ordssts+' data-wcoid='+wcoid+' class="btn_disabled btn_confirm">'+langUtil.Global_submit+'</a>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="dialog_mask"></div>';
        $("body").append(cancelStr);
        $(".cancel_dialog .cancel_content .reason").bind("click",function(){
            $(this).addClass("selected").siblings().removeClass("selected");
            if($(".cancel_dialog .cancel_content .reason").hasClass("selected")){
                $(".cancel_dialog .cancel_content .btn_item").find(".btn_confirm").removeClass("btn_disabled").attr('data-reason',$(this).index()+1);
            }
        });
        $(".cancel_dialog .cancel_content .reason").hover(function(){
            $(this).addClass("reasonHover");
        },function(){
            $(this).removeClass("reasonHover");
        });
}
function closeCancelDialog(){
    $(".cancel_dialog").remove();
    $(".dialog_mask").remove();
};



