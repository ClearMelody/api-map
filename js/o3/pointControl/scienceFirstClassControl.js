//监控点位图层控制器
var FirstClassLayerControl = function () {
    this.init.apply(this, arguments);
};

FirstClassLayerControl.prototype = {
	_FirstClassLayerControl : null,
    baseMapLayerControl : null,
    popupId : null,
    pointArr : [],
    layerMark : "firstCls",
    init: function (map) {
       	_FirstClassLayerControl = this;
       	_FirstClassLayerControl.baseMapLayerControl=new BaseMapLayerControl({
			map : map,
			layerMark : _FirstClassLayerControl.layerMark,
			layerName : "监控点",
			layerVisible : true,
			url : "getFirstClassPointOlClusterView.do",
			getSingleLayerMarker : _FirstClassLayerControl.getSingleLayerMarker,
			getClusterLayerMarker : _FirstClassLayerControl.getClusterLayerMarker,
			clusterLayerClick : _FirstClassLayerControl.clusterLayerClick,
			singleLayerClick : _FirstClassLayerControl.singleLayerClick,
			singleLayerDblClick : _FirstClassLayerControl.singleLayerDblClick
       	});
    },
    //1.必须方法之单个点图层双击事件
    singleLayerDblClick : function(arr){
    	if(arr && arr.length>0){
	    	_FirstClassLayerControl.pointArr=arr;
	    	_FirstClassLayerControl._playVideo(arr[0]);
    	}
    },
    //2.必须方法之单个点图层单击事件
    singleLayerClick : function(arr){
    	if(arr && arr.length>0){
	    	_FirstClassLayerControl.pointArr=arr;
			_FirstClassLayerControl._showMarkerPopupByPuId(arr[0].puid);
		}
    },
    //3.必须方法之聚合图层单击事件,列表内容小于20
    clusterLayerClick : function(coordinate,features){
    	_FirstClassLayerControl.pointArr=features;
		var lon = coordinate[0] * 1.0;
		var lat = coordinate[1] * 1.0;
		//无坐标时
        if(lon==null || lon==0 || isNaN(lon) || lat==null || lat==0 || isNaN(lat)){
        	fadingTip("没有坐标");
        	return;
        }
		var html = _FirstClassLayerControl.getClusterPopUpHtml(features);
		//聚合气泡
		var id = "deviceCluster"+features[0].puid;
		window.gisInteraction.showPopup(id, lon, lat, html, false);
		
    	_FirstClassLayerControl.binClusterEven();
    },
    binClusterEven : function(){
    	$("#firstclusterPopUpContent a").bind('click',function(){
    		var puid = $(this).attr("puid");
    		_FirstClassLayerControl._showMarkerPopupByPuId(puid);
    	})
    	
    	$("#firstclusterPopUp .NPopUpClose02").bind('click',function(){
    		$("#firstclusterPopUp").hide();
    	})
    },
    //必须方法,地图搜索时,列表点击事件会调用
    _showMarkerPopupByPuId: function (puid) {
   		var obj = null;
    	$.each(_FirstClassLayerControl.pointArr,function(i,item){
    		if(item.puid == puid){
    			obj = item;
    			return true;
    		}
    	})
		_FirstClassLayerControl._showMarkerPopup(obj);
  	},
    _showMarkerPopup: function (item) {
        var html = _FirstClassLayerControl._getScienceMarkerPopupHtmlTemplate();
        html = html.replace(/%deviceid/g, item.puid || "");
        html = html.replace(/%name/g, item.name || "");
        html = html.replace(/%channel/g, item.channel || "");
        html = html.replace(/%puid/g, item.puid || "");
        html = html.replace(/%ip/g, item.ip || "暂无数据");
        if(item.state==null||item.state==""||item.state==0||item.state==113){
			html = html.replace(/%state/g, "不在线");
		}else{
			html = html.replace(/%state/g, "在线");
		}
        html = html.replace(/%type/g, item.type || "");
        html = html.replace(/%ganhao/g, item.ganhao || "暂无数据");
        html = html.replace(/%xinghao/g, item.xinghao || "");
        html = html.replace(/%installaddress/g, item.installaddress || "");
        html = html.replace(/%lon/g, item.lon || "");
        html = html.replace(/%lat/g, item.lat || "");
        html = html.replace(/%manufacturename/g, item.manufacturename || "");
        html = html.replace(/%regionname/g, item.regionname || "");

        var id = "firstClass_" + item.puid;
        //过滤掉设备坐标不存在的
        if(item.lon==null || item.lon==0 || item.lon== "undefined"|| item.lat==null || item.lat==0 || item.lat== "undefined"){
        	fadingTip("该点位没有坐标");
        	return;
        }
        var lon = item.lon * 1.0;
        var lat = item.lat * 1.0;
        if (_FirstClassLayerControl.popupId) {
            window.gisInteraction.clearPopup(_FirstClassLayerControl.popupId);
        }
        _FirstClassLayerControl.popupId = id;

       //点击添加闪烁效果
        var maxZoom = _FirstClassLayerControl.baseMapLayerControl.getMapMaxZoom();
        window.gisInteraction.setZoom(maxZoom);
        window.gisInteraction.clearTwinkle();
		window.gisInteraction.showTwinkle(id, lon, lat, 3);
        window.gisInteraction.showPopup(id, lon, lat, html, false);
        window.gisInteraction.setCenterLeft(lon, lat);

        $("#btnCloseFirstClassPopup").unbind("click").click(function () {
            window.gisInteraction.clearPopup(_FirstClassLayerControl.popupId);
        });
        
        $("#videoPreviewBtn").unbind("click").click(function(e){
			 var event = window.event || arguments.callee.caller.arguments[0];
			 event.stopPropagation();
        	 var content = new Object();
        	 content.lon = $(this).attr("lon");
        	 content.lat = $(this).attr("lat");
        	 content.state = $(this).attr("state");
        	 content.puid = $(this).attr("puid");
        	 content.channel = $(this).attr("channel");
        	 content.name = $(this).attr("name");
        	 _FirstClassLayerControl._playVideo(content);
        })
        
        $("#videoReplayBtn").unbind("click").click(function(e){
			 var event = window.event || arguments.callee.caller.arguments[0];
			 event.stopPropagation();
        	 var content = new Object();
        	 content.lon = $(this).attr("lon");
        	 content.lat = $(this).attr("lat");
        	 content.state = $(this).attr("state");
        	 content.puid = $(this).attr("puid");
        	 content.channel = $(this).attr("channel");
        	 content.name = $(this).attr("name");
        	 var msgString = content.puid+"@"+content.channel+"@"+content.name
				+"@"+content.lon+"@"+content.lat + "@" + content.state;
			 sendMsgToClient(109, msgString);
        })
    },
    _playVideo : function(content){  //lon lat state puid  channel name 
		var tmpLL = _prjFuns.gps84_to_map(content.lon*1, content.lat*1);
		var tmpPix = map.getPixelFromCoordinate(tmpLL);
		var tmpPixStr = (Math.round(tmpPix[0]) + 10)+"@"+(Math.round(tmpPix[1])+65);
		if(content.state == "不在线"){
			fadingTip("设备不在线。");
			return;
		}else {
			content.state = 114;
		}
		var msgString = content.puid+"@"+content.channel+"@"+content.name
		+"@"+content.lon+"@"+content.lat + "@" + tmpPixStr + "@" + content.state;
		sendMsgToClient(107, msgString);
	},
    _getScienceMarkerPopupHtmlTemplate : function(){
    	 var html = '  	<div class="NPopUpBox02" style="width:350px;">'
	     + '   <a href="javascript:void(0);" class="NPopUpClose02" id="btnCloseFirstClassPopup"></a>'
	     + '   <div class="NPUTwoContent">'
	     + '   	<div class="GSDHeader">%name</div>'
	     + '       <div class="GPUInnerBox">'
	     + '       	<div class="GPUInnerBox_Border">'
	     + '               <div class="GStaffDetailsBox">'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">设备编号：</div>'
	     + '                       <div class="GStaffDetails_r">%deviceid</div>'
	     + '                       <div class="clear"></div>'
	     + '                  </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">设备IP：</div>'
	     + '                       <div class="GStaffDetails_r">%ip</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">立杆号：</div>'
	     + '                       <div class="GStaffDetails_r">%ganhao</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">设备状态：</div>'
	     + '                       <div class="GStaffDetails_r">%state</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">经度：</div>'
	     + '                       <div class="GStaffDetails_r">%lon</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">纬度：</div>'
	     + '                       <div class="GStaffDetails_r">%lat</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '               </div>'
	     + '           	<div class="GPUInnerBox_Line01"></div>'
	     + '           	<div class="GPUInnerBox_Line02"></div>'
	     + '           </div>'
	     + '       </div>'
	     + '       <div class="GPUBtnBox01">'
	     + '           <div class="GPUBtnBox02">'
	     + '           	<a href="javascript:void(0);" lon="%lon" lat="%lat" state="%state" puid="%puid" channel="%channel" name="%name" id="videoPreviewBtn" class="GPUBtn01">视频预览</a>'
	     + '               <a href="javascript:void(0);" lon="%lon" lat="%lat" state="%state" puid="%puid" channel="%channel" name="%name" id="videoReplayBtn" class="GPUBtn01">视频回放</a>'
	     + '           </div>'
	     + '       </div>'
	     + '   </div>'
	     + '   <div class="NPopUpBox02_line01"></div>'
	     + '   <div class="NPopUpBox02_line02"></div>'
	     + '   <div class="NPopUpBox02_j01"></div>'
	     + '   <div class="NPopUpBox02_j02"></div>'
	     + '   <div class="NPopUpBox02_j03"></div>'
	     + '   <div class="NPopUpBox02_j04"></div>'
	     + '   <div class="NPopUpBox02_j05"></div>'
	     + '   <div class="NPopUpBox02_j06"></div>'
	     + '</div>'

	     return html;           
    },
    /**
	 * 设备聚合气泡列表html模板
	 */
	getClusterPopUpHtml : function(features){
		var resambleHtml = "";
    	resambleHtml+=' <div class="NPopUpBox02" style="width:350px;" id="firstclusterPopUp">';
        resambleHtml+='<a href="javascript:void(0);" class="NPopUpClose02"></a>';
        resambleHtml+=' <div class="NPUTwoContent">';
        resambleHtml+='<div class="GPUHeader02"><h1>摄像头聚合列表</h1></div>';
        resambleHtml+='   <div class="GPUInnerBox">';
        resambleHtml+='   	<div class="GPUInnerBox_Border">';
        resambleHtml+='       	<div class="GkkListBox" style="height:200px;" id="firstclusterPopUpContent">';
    	$.each(features,function(i,item){
    		var src = top.window.getEquipKindByInfo("MAP",item.state,false,item.deviceShape,"LOCATED","01");
    		resambleHtml += '<a style="height:28px;line-height:28px;" title="'+item.name+'" href="javascript:void(0);" puid="'+item.puid+'" class="GkkListNav"><img src="'+src+'" width="28" height="28">'+item.name+'</a>';
    	});
    	resambleHtml+='           </div>';
    	resambleHtml+='       	<div class="GPUInnerBox_Line01"></div>';
    	resambleHtml+='   	<div class="GPUInnerBox_Line02"></div>';
    	resambleHtml+='    </div>';
    	resambleHtml+='  </div>';
    	resambleHtml+=' </div>';
    	resambleHtml+='<div class="NPopUpBox02_line01"></div>';
    	resambleHtml+='<div class="NPopUpBox02_line02"></div>';
    	resambleHtml+=' <div class="NPopUpBox02_j01"></div>';
    	resambleHtml+=' <div class="NPopUpBox02_j02"></div>';
    	resambleHtml+=' <div class="NPopUpBox02_j03"></div>';
    	resambleHtml+='<div class="NPopUpBox02_j04"></div>';
    	resambleHtml+='<div class="NPopUpBox02_j05"></div>';
    	resambleHtml+='<div class="NPopUpBox02_j06"></div>';
    	resambleHtml+=' </div>';
    	return resambleHtml;
	},
	//4.必须方法之获得聚合图层对象
    getClusterLayerMarker : function(obj,arr){
		return {
            id: Math.random()+"",
            name: Math.random()+"",
            lon: obj.lon,
            lat: obj.lat,
            img: 'resource/images/m0.png',
            att: obj,
            clusterSize :obj.size
        };
	},
	//5.必须方法之获得单个点图层对象
    getSingleLayerMarker : function(obj){
		var imgUrl = top.window.getEquipKindByInfo("MAP",obj.state,false,obj.deviceShape,"LOCATED","01");
		var state = obj.state;
		var deviceType = obj.deviceType;
		var maker = {
            id: obj.puid,
            name: obj.name,
            lon: obj.lon,
            lat: obj.lat,
            img: imgUrl,
            att: obj
        };
        return maker;
	},
	//6.必须方法之显示图层
    showLayer : function(visible){
    	_FirstClassLayerControl.baseMapLayerControl.showLayer(_FirstClassLayerControl.layerMark,visible);
    },
    //7.必须方法之设置图层的显示与隐藏
    _setLayerVisible: function () {
        _FirstClassLayerControl.baseMapLayerControl._setLayerVisible(_FirstClassLayerControl.layerMark);
    },
    CLASS_NAME: "FirstClassLayerControl"
};