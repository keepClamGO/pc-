/**
 * Created on 2017/10/24.
 */
function setInfo(){
    //var info = shopUtil.getPersonInfo();
    $.when(shopUtil.getPersonInfo()).done(function(info) {
        $("#content .modifyName_box").attr("data-img",info.csthi);
        $("#m-modNameVal").attr("data-name",info.cstacc);
        $("#m-modNameVal").val(info.cstacc);
    })
}
setInfo();

/*
* 保存用户名data
*/
function saveMemName(){
    $("#m_saveNameBtn").click(function(){
        var csthi = $("#content .modifyName_box").data("img"),
            cstacc,
            dataName = $("#m-modNameVal").data("name"),
            csName = $("#m-modNameVal").val(),
            propertyList = [];
        var nameRes = true;
            cstacc = csName;
            if(dataName == cstacc){
                nameRes = true;
            }else{
                if(cstacc){
                    var numReg = /^[0-9]*$/;
                    var srtReg = /^[A-Za-z0-9]+$/;
                    if(numReg.test(cstacc)){
                        webUtil.showTip("会员账号不能为纯数字",1.5,"cancel");
                        nameRes = false;
                    }else{
                        if(srtReg.test(cstacc)){
                            if(dataUtil.checkAccount('#m-modNameVal',2,"cancel")){
                                nameRes = true;
                            }else{
                                /*webUtil.showTip("该会员账号已被注册",1.5,"cancel");*/
                                nameRes = false;
                            }
                        }else{
                            webUtil.showTip("仅支持数字和字母组合或者纯字母",1.5,"cancel");
                            nameRes = false;
                        }
                    }
                }else{
                    webUtil.showTip("会员账号不能为空",1.5,"cancel");
                    nameRes = false;
                }
            }

        var info={
            csthi:csthi,
            cstacc:cstacc
        }
        if(nameRes){
            $.ajax({
                type:"POST",
                url:"/w/customer/saveDisplayCustomer.do",
                data:info,
                dataType:'json',
                success:function(data){
                    wapUtil.showTip("保存成功",1.5,"success");
                    window.location.href = "setsafe.html";
                },
                error:function(){
                    wapUtil.showTip("保存失败",1.5,"cancel");
                }
            })
        }
    });
}
saveMemName();