/**
 * 
 * @param {Object} param
 * server_url - 文件接收服务端地址(不允许为空),
 * urlparam - 参数对的json对象,
 * picker_id - 选择文件按钮ID,
 * opt - webuploader实例创建属性
 * 
 */
function initUploader(param) {
	var uploader = null;
	
	if(param) {
		var opt = param.opt;
		var defaultOpt = {
			// swf文件路径
			swf: './Uploader.swf',
			
			// 文件接收服务端。
			//server: '/w/editor/editor.do?action=uploadfile',
			
			// 选择文件的按钮。可选。
			// 内部根据当前运行是创建，可能是input元素，也可能是flash.
			//pick: '#picker',
			    
			//是否自动上传(默认false)
			auto: false,
			
			// 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
			resize: false,
			
			accept: {
				//extensions: 'gif,jpg,jpeg,bmp,png'
			}
		};
		if(!opt) {
			opt = defaultOpt;
		}
		
		//参数对的json对象
		var urlparam = param.urlparam;
		var server_url = param.server_url;
		if(urlparam) {
			var i=0;
			var urlparamstr = "";
			$.each(urlparam,function(key,value) {
				if(i==0) {
					urlparamstr += "?"+key+"="+value;
				}else {
					urlparamstr += "&"+key+"="+value;
				}
				i++;
			});
			if(server_url)
				server_url += urlparamstr;
		}
		console.info("server_url: "+server_url);

		//创建实例
		if(server_url) {
			opt.server = server_url;
		}
		//选择文件按钮ID
		var picker_id = param.picker_id;
		if(picker_id) {
			picker_id = "#"+picker_id;
			opt.pick = picker_id;
		}
		uploader = WebUploader.create(opt);
	}
	
	return uploader;
}
