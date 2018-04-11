//ajax封装
function safeAjax(method,url,data,dataType,successfn,errorfn){
	$.ajax({
		type:method,
		url:url,
		data:data,
		dataType:dataType,
		success:function(json){
			successfn(json);
		},
		error:function(){
			errorfn();
		}
	});
}

//提交按钮判断内容
function checkCont(cls,callhtml){
	var result = true;
	if($.trim(cls.val()) == ''){
		webUtil.showTip(callhtml,2);
		result = false;
	}
	return result;
}
//错误error_tip提示内容
function errorCont(cls,cls1,html){
	cls.siblings(cls1).html(html)
}
//密码公共js
function checkPsw(cls,html1){
	if( $.trim(cls.val()) != ''){
		 html1(cls);
	}	
}

//输入不能出现空格
function keySpace(){
	$("input[type=password]").keyup(function(even){
		if(even.keyCode == '32' ||even.which == '32'){
			webUtil.showTip("密码不能出现空格",2);
			$(this).val('');
			return false;
		}
	});
}

//跳转后页面的效果
function jumpDisplay(){
	var url = window.location.href;
	if(url.lastIndexOf("?") != '-1'){
		if((url.substring(url.lastIndexOf("?") + 1)) == 'success'){
			$(".progressBar li").addClass('on');
			$(".formMsg").hide();
			$(".safeSuccess").show();
		}
	}
}

//进度条js
$("#myInformation .item .input-200").keyup(function(){
	progessBar();	
});
function progessBar(){
	var picL = $("#myInformation .pic").attr("data-value");
	var allL = 100 - parseFloat(picL);
	var l = parseFloat(allL) / parseFloat($("#myInformation .show").length);
	var num = parseFloat(picL);
	$.each($("#myInformation .show"),function(){
		if($(this).children('input').hasClass('input-200') ){
			if($(this).find('input').val() != ''){
				$(this).attr('data-value',l);
			}else{
				$(this).attr('data-value','0');
			}
		}else{
			$(this).attr('data-value',l);
		}
		num = parseFloat(num) + parseFloat($(this).attr('data-value'));
	});
	$(".MsgTitle .title em").html(parseInt(num));
	$('.safe i.slideBar > i').css({'width': parseInt(num)});
}

//绑定手机号
function bindPhone(){
	$(".js-bindPhone").on('click',function(){
		var phone = $("input[name=phone]"),
			code = $("input[name=verifyCode]");
		if(dataUtil.checkAccount('#setphone') && checkCont(code,langUtil.safeCenter_fillCode)){
			var data = {"phoneNum":phone.val(),"code":code.val()};
			safeAjax('POST','/w/cst/savePhone.do',data,'json',function(json){
				console.log(json);
				if(json.result == 'SUCCESS'){
					window.location.href = 'setphone.html?success';
					jumpDisplay();
				}else{
					webUtil.showTip(json.errorMsg.msg,2);
				}				
			},function(){
                webUtil.showTip("接口出现错误",2);
			});
		}
	});
}

//图片的宽高
function cutPic(){
	require(["imagefit"],function(){
		$("#memberPic").imagefit();
	});
}
//检验数字
function regNum(cls){
	var result = true;
	var reg = /^[0-9]*$/;
	if(reg.test(cls.val())){
		webUtil.showTip("会员账号不能为纯数字",2);
	}else{
		result = false;
	}
	return result;
}
//检验数字和字母
function regNumStr(cls){
	var result = true;
	var reg = /^[A-Za-z0-9]+$/;
	if(!reg.test(cls.val())){
		webUtil.showTip("仅支持数字和字母组合或者纯字母",2);
		result = false;
	}
	return result;
}
//会员账号判断
function idCard(){
	var result = true;
	var disabled = $("input[name=idCard]").attr('disabled');
	if($.trim($("input[name=idCard]").val()) == ''){
		webUtil.showTip("会员账号不能为空",2);
		$(this).focus();
		result = false;
	}else if(disabled != 'disabled'){
		if($("input[name=idCard]").attr('data-id') == $("input[name=idCard]").val()){
			if(regNum($("input[name=idCard]"))){
				result = false;
			}else if(!regNumStr($("input[name=idCard]"))){
				result = false;
			}
		}else{
			if(!dataUtil.checkAccount('input[name=idCard]',2)){
				webUtil.showTip("该会员账号已被注册",2);
				$("input[name=idCard]").focus();
				result = false;
			}else{
				if(regNum($("input[name=idCard]"))){
					result = false;
				}else if(!regNumStr($("input[name=idCard]"))){
					result = false;
				}
			}
		}
	}
	return result;
}
//短信提示
function tip(){
	if(dataUtil.checkAccount('#setphone')){
		$("#getValidateCode").siblings('.tip').removeClass('hide').find('em').html($("#setphone").val());
	}else{
		$("#getValidateCode").siblings('.tip').addClass('hide');
	}
}
//我的资料页面初始化js
function initMyInformation(){
	require(["uploadfile"],function(){
        $.when(shopUtil.getPersonInfo()).done(function(data) {
            var proL = data.propcfList;
            var html='';
            //用户头像
            if(data.csthi){
                $("#myInformation .pic img").attr('src',data.csthi);
            }
            //用户名、邮箱、手机号码
            $("#myInformation .title>span:first-of-type").html(data.cstacc);
            $("input[name=idCard]").val(data.cstacc).attr('data-id',data.cstacc);
            if(data.cstemail != ''){
                if(data.cstemail != null || data.cstemail == 'undefined'){
                    $("input[name=email]").parents('.item').removeClass('hide');
                    $("input[name=email]").val(data.cstemail);
                }else{
                    $("input[name=email]").parents('.item').addClass('hide');
                }
            }else{
                $("input[name=email]").parents('.item').addClass('hide');
            }
            $("input[name=phone]").val(data.cstmb);
            if(data.ischg != '0'){
                $("input[name=idCard]").attr('disabled','disabled');
                $("input[name=idCard]").siblings('.error_tip').html('');
            }
            //自定义属性
            if( proL.length > 0){
                for(var i=0;i<proL.length;i++){
                    var proLl = proL[i].propvList;
                    html += "<div class='item show clearfix' data-id='"+proL[i].cstpropcfgid+"'><label class='input-110'>"+proL[i].propn+langUtil.Global_symbol+"</label>";
                    if(proLl.length > 0){
                        html += "<select>";
                        for( var j=0;j<proLl.length;j++){
                            if(proL[i].propval == proLl[j].propv){
                                html += "<option value="+proLl[j].propv+" selected>"+proLl[j].propv+"</option>"
                            }else{
                                html += "<option value="+proLl[j].propv+" >"+proLl[j].propv+"</option>"
                            }
                        }
                        html += "</select></div>";
                    }else{
                        html += "<input type='text' name='' class='input-200' value='"+proL[i].propval+"' onkeyup='progessBar()'></div>";
                    }
                }
                $(".addContent").append(html);
            }
            //进度条
            progessBar();
            cutPic();
        });
    });
}

//我的资料页面保存
function saveMyInformation(){
	$(".saveBtn").on('click',function(){
		var csthi = $("#myInformation .pic img").attr('src'),
			cstacc = $("#myInformation input[name=idCard]").val();
		var data = {'csthi':csthi,'cstacc':cstacc}; 
		var propertyList=[],propval;
		if($(".addContent .item").length > 0){
			$(".addContent .item").each(function(){
				var dataId = $(this).attr('data-id');
				if($(this).children('input').hasClass('input-200')){
					propval = $(this).find('input').val();
				}else{
					propval = $(this).find('select').val();
				}
				data[dataId]=propval;
			});
		}
		if( idCard()){
			safeAjax("POST",'/w/customer/saveDisplayCustomer.do',data,'json',function(data){
				webUtil.showTip("保存成功！",1);
				console.log(9)
				if($("input[name=idCard]").attr('data-id') != $("input[name=idCard]").val()){
					$("input[name=idCard]").attr('disabled','disabled');
					$("input[name=idCard]").siblings('.error_tip').html('');
				}
			},function(){
				alert("接口出现错误")
			});
		}
	});
}

//修改登录密码提交按钮
function editPassword(){
	$(".editBtn").on('click',function(){
		var oPsw = $("input[name=odd-password]"),
			newPsw = $("input[name=new-password]"),
			rePsw = $("input[name=re-password]");
		var setoff = false;
		//旧密码判断
		if(checkCont(oPsw,langUtil.safeCenter_showOldPwd)){
			checkPsw(oPsw,function(n){
				var data = {"cstpsw":n.val()};
				$.ajax({
					type:'POST',
					async : false,
					url:'/w/cst/checkPSW.do',
					data:data,
					success:function(data){
						if(!data.data){
							webUtil.showTip("旧密码错误",2);
							n.val('');
						}else{
							setoff= true;
							if(setoff){
								//新密码判断
								if(checkCont(newPsw,langUtil.safeCenter_showNewPwd)){
									checkPsw(newPsw,function(n){
										if(n.val().length < 6 || n.val().length > 20){
											webUtil.showTip("新密码不能小于6位数字，大于20位数字！",2);
											n.val('');
											setoff = false;
											console.log(setoff)
										}
									});
								}else{
									setoff = false;
								}
							}
							if(setoff){
								//确认密码判断
								console.log(setoff)
								if(checkCont(rePsw,langUtil.safeCenter_showSurePwd)){
									checkPsw(rePsw,function(n){
										if(n.val() != newPsw.val()){
											webUtil.showTip("两次密码不一致",2);
											n.val('');
											setoff = false;
										}
									});
								}else{
									setoff = false;
								}
							}
							if(setoff){
								var data = {'oldPsw':oPsw.val(),"newPsw":newPsw.val()};
								safeAjax("POST","/w/cst/savePSW.do",data,"json",function(json){
									if(json.data == 1){
										window.location.href = 'setpsw.html?success';
										jumpDisplay();
									}
								},function(){
									alert("接口出现错误");
								})
							} 
						}
					},
					error:function(){
						alert(langUtil.safeCenter_showError);
					}
				});
			 });
		}	
	});
}

//安全中心初始化
function initSafecenter(){
	$.ajax({
		type:"GET",
		url:"/w/customer/infoDisplayCustomer.do",
		success:function(data){
			var data = data.data;
			if(data.cstemail != ''){
				$(".c-list li:nth-of-type(2) .cont").html(data.cstemail);
			}else{
				$(".c-list li:nth-of-type(2) .cont").html(langUtil.safeCenter_showNoBindEmail);
			}
			if(data.cstmb != ''){
				$(".c-list li:nth-of-type(3) .cont").html(langUtil.safeCenter_showHasBindPhone+data.cstmb+langUtil.safeCenter_showFindBindPhonePwd);
			}else{
				$(".c-list li:nth-of-type(3) .cont").html(langUtil.isEmpty);
			}
		},
		error:function(){
			alert("接口出现错误");
		}
	})
}
/*一下代码请勿删除*/

//我的资料上传图片
/*function setPic(){
	var timer = '';
	timer = setInterval(function(){
		if( $('.webuploader-pick').html() == '上传出错'){
			clearInterval(timer);
		}else{
			if($('.webuploader-pick').html() == '上传成功'){
				clearInterval(timer);
				$("#myInformation .pic img").attr('src',$(".saveinput").val());
				cutPic();
				$('.webuploader-pick').html('重新选择');
			}else{
				setPic();
			}
		}
	},1000);
}*/

//失去焦点判断手机号，此段代码可用，请勿删除
/*BlurCls($("input[name=phone]"),"请填写手机号码",/^1\d{10}$/,'手机号码格式错误，请重新输入');*/

//失去焦点判断邮箱
//BlurCls($("input[name=email]"),"请填写邮箱",/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/,'请填写正确的邮箱');

//失去焦点判断验证码
/*$("input[name=verifyCode]").blur(function(){
	var _this = $(this);
	checkCont(_this,'请填写验证码');
});*/

//失去焦点公共js
/*function BlurCls(cls,html1,re1,html2){
	cls.blur(function(){
		var _this = $(this);
		checkCont(_this,html1);
		if($.trim(_this.val()) != ''){
			var re = re1;
			if(re != ''){
				if( !re.test(_this.val())){
					webUtil.showTip(html2,3);
				}
			}
		}
	});
}
function blurPsw(cls,html1,html2){
	cls.blur(function(){
		var _this = $(this);
		checkCont(_this,html1);
		if( $.trim(_this.val()) != ''){
			html2(_this);
		}
	});
}
*/
