$(function(){
    var pageIndex = 1;
    var pageMax = 10;

    //初始化地址信息
    loadAddress(pageIndex, pageMax);

    //监听滚动
    var FixedTop = $('#content .address-header');
    $(document).scroll(function(){
        console.log($(document).scrollTop());
        if( $(document).scrollTop()>0){
            if(FixedTop.hasClass('Fixed'))return;
            FixedTop.addClass('Fixed');
        }else {
            FixedTop.removeClass('Fixed');
        }
    });
    //下拉刷新
    function pullToRefreshData(){
        $(document.body).pullToRefresh().on("pull-to-refresh", function() {
            loadAddress(pageIndex, pageMax);
            setTimeout(function(){
                $(document.body).pullToRefreshDone();
            },500);
        });
    }
    require(['jquery','weuijs'],function(){
        pullToRefreshData();
        $.showLoading();//提示正在加载
    });
    //新增地址信息

    //编辑(更新)地址数据
    $(".address_load").on("click", ".update_address", function(){
        var this_update = this;
        var wccaid = $(this_update).closest(".address_iy").data("wccaid");
        var jumpLink=$(".m-jumpLink").attr("data-link");
        var orderinfo="";
        if(jumpLink=="orderinfo"){
            orderinfo="&orderInfo=1"
        }
        window.location.href = "dialog.html?id="+wccaid + orderinfo ;
    });

    //删除地址
    $(".address_load").on("click", ".add_extra", function(){
        var wccaid = $(this).closest('.address_iy').data("wccaid");
        var this_del = this;
        var data = {
            "wccaid" : wccaid
        };
        $.confirm("", "确定要删除该地址吗？", function(){
            //点击确认后的回调函数
            safeAjax("post", "/w/shop/deleteConsigneeAddress.do", data, "json",
                function(data){
                    if(data.result == "SUCCESS"){
                        $(this_del).closest(".address_iy").remove();
                        wapUtil.showTip('删除成功', '', 'success');
                        loadAddress(pageIndex, pageMax);
                    }
                },
                function(){
                    wapUtil.showTip('删除失败', '', 'error');

                });
        }, function(){
            //点击取消后的回调函数
        });

    });

    //设置默认地址
    $(".address_load").on("click", ".set_default", function(){
        var this_default = this;

        var wccaid = $(this_default).closest(".address_iy").data("wccaid");
        safeAjax("post", "/w/shop/setDefaultConsigneeAddress.do", {
                "wccaid" : wccaid
            }, "json",
            function(data){
                if(data.result == "SUCCESS"){
                    $(this_default).find("i").removeClass("icon-round").addClass("icon-roundcheckfill");
                    $(this_default).find("span").html("默认地址");
                    $(this_default).closest(".address_iy").siblings().find(".set_default>i").removeClass("icon-roundcheckfill").addClass("icon-round");
                    $(this_default).closest(".address_iy").siblings().find(".set_default>span").html("设为默认");
                    // $(this_default).find(".set_default").removeClass("set_default");
                    // $(this_default).closest(".address_iy").find(".set_default").attr("data-isdfs", 1).siblings('.address_iy').find(".set_default").attr("data-isdfs", 0);
                    wapUtil.showTip('设置成功', '', 'success');
                    // $(document).scrollTop(0);
                    // loadAddress(pageIndex, pageMax);
                }
            },
            function(){
                wapUtil.showTip('设置失败', '', 'error');
            });
    });

    //ajax封装
    function safeAjax(method, url, data, dataType, successFn, errorFn){
        $.ajax({
            type : method,
            url : url,
            data : data,
            dataType : dataType,
            success : function(json){
                successFn(json);
            },
            error : function(){
                errorFn();
            }
        });
    }

    //地址数据加载
    function loadAddress(pageIndex, pageMax){
        var data = {
            "pageIndex" : pageIndex,
            "pageMax" : pageMax
        };
        safeAjax("post", "/w/shop/listConsigneeAddress.do", data, "json",
            function(data){
                if(data.result == "SUCCESS"){
                    var addressNum = data.data.totalRecord;
                    if(addressNum > 0){
                        $(".hide_address").hide();
                    } else {
                        $(".hide_address").show();
                    }
                    var address = data.data.rows;
                    var html = '';
                    $.each(address, function(i, item){
                        var wccaid = item.wccaid;
                        var name = item.coen;
                        var areaid = item.coeareaid;
                        var area = item.coearea;
                        var local = item.coeaddr;
                        var mobile = item.coemb;
                        var isdfs = item.isdfs;
                        var div = '<section class="content_main  address_iy" data-wccaid = "' + wccaid + '">' +
                            '           <div class="ad_message">' +
                            '                <div class="ad_title">' +
                            '                    <div style="float:left" class="fl">' + name + '</div>' +
                            '                    <div style="float:right" class="fl">' + mobile + '</div>' +
                            '                </div>' +
                            '                <div class="ad_area" data-areaid = "' + areaid + '"><span class="fl">' + area + '</span><span class="fl" >' + local + '</span></div>' +
                            '            </div>' +
                            '            <div class="ad_setting">' +
                            '                <div style="float:left" class="set_default" data-isdfs="' + isdfs + '"><i class="m_iconfont icon-round"></i><span>设为默认</span></div>' +
                            '                <div style="float:right" class="set_edit_del">' +
                            '                    <a class="update_address"><i class="m_iconfont icon-edit"></i>编辑</a>' +
                            '                    <a class="add_extra"><i class="m_iconfont icon-delete"></i>删除</a>' +
                            '                </div>' +
                            '            </div>' +
                            '       </section>';
                        html += div;
                        $(".address_load").html(html);
                    });
                    $(".set_default[data-isdfs='1']>i").removeClass("icon-round").addClass("icon-roundcheckfill");
                    $(".set_default[data-isdfs='1']>span").html("默认地址");
                    require(['jquery','weuijs'],function(){
                        // setTimeout(function(){
                            $.hideLoading();//隐藏加载
                        // },500);

                    });
                }
            },
            function(){
                wapUtil.showTip('加载数据失败', '', 'error');
            });
    }
});