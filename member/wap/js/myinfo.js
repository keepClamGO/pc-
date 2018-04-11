/**
 * Created on 2017/10/16.
 */
//返回键
/*$('#backBtn').on('click',function(){
    wapUtil.backHistory();
});*/
/*
 *初始化个人信息
 */
function jumpToPhone(){
    $(".memInfo-box .jumpToPhone").click(function(){
        $.confirm("您确定要修改手机号码吗?", function() {
            //点击确认后的回调函数
            window.location.href = "setphone.html?setsafe";
        }, function() {
            //点击取消后的回调函数
            return false;
        });
    });
}
jumpToPhone();

/*
*初始化个人信息
*/
function setPersonInfo(){
    require(["uploadfile"],function(){
        //var info = shopUtil.getPersonInfo();
        $.when(shopUtil.getPersonInfo()).done(function(info) {
            console.log("个人信息.......");
            console.log(info);
            if(info.csthi) {
                $(".memInfo-box .m-infoImg").find("img").attr("src", info.csthi);
            }
            $("#m-userName").val(info.cstacc);
            $("#m-userName").attr("data-name",info.cstacc);
            $("#m-userPhone").val(info.cstmb);
            var proList = info.propcfList;
            var proStr="";
            var proListLen = proList.length;
            if(proListLen>0){
                $.each(proList,function(i,item){
                    var mBorder = (i == proListLen-1)?"":"m-infoBorder";
                    proStr+='<a class="public_labelAct saveActVal '+mBorder+'" data-csid="'+item.cstpropcfgid+'">' +
                                '<div class="m_title m-actTxt">'+item.propn+'</div>';
                                if(item.propvList.length>0){
                            proStr+='<div class="m-valBox m-beforeIcon">' +
                                    '<select class="m-areaVal m-saveInfo">';
                                    $.each(item.propvList,function(k,v){
                                        var proCla = (item.propval==v.propv)?"selected":"";
                                        proStr+='<option value="'+v.propv+'" '+proCla+'>'+ v.propv + '</option>'
                                    });
                            proStr+='</select>';
                                }else {
                                    proStr +='<div class="m-valBox"><div class="m-infoVal">' +
                                                '<input class="m-userVal m-saveInfo" placeholder="请输入'+item.propn+'" value="' + item.propval + '">' +
                                            '</div>' ;
                                }

                    proStr+='</div></a>'
                });
                $(".memInfo-box").append(proStr);
            }
        });
    })
}
setPersonInfo();

/**
 * 图片自适应
 **/
function cutPic(){
    require(["imagefit"],function(){
        $("#m-infoImg").imagefit();
    });
}
cutPic();

/**
 *  保存个人资料
 */
function saveMyInfo(){
    $("#m_saveProfile").click(function(){
        var csthi = $("#m-infoImg").find("img").attr("src"),
            cstacc = $("#m-userName").val(),
            propertyList = [];
        var info={
            csthi:csthi,
            cstacc:cstacc
        }
        var saveDom = $(".memInfo-box .saveActVal");
        if(saveDom.length > 0){
            $.each(saveDom,function(i,item){
                var csid = $(item).data("csid"),
                    propval;
                var inputDom = $(item).find(".m-valBox");
                if($(inputDom).find("input").hasClass("m-saveInfo")){
                    propval = $(inputDom).find("input").val();
                }else{
                    propval = $(inputDom).find("select").val();
                }
                info[csid]=propval
            });
        }

        $.ajax({
            type:"POST",
            url:"/w/customer/saveDisplayCustomer.do",
            data:info,
            dataType:'json',
            success:function(data){
                wapUtil.showTip("保存成功",1.5,"success");
            },
            error:function(){
                wapUtil.showTip("保存失败",1.5,"cancel");
            }
        });
    });
}
saveMyInfo();
