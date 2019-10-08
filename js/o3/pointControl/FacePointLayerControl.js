//人脸卡口图层控制器
var FacePointLayerControl = function () {
    this.init.apply(this, arguments);
};

FacePointLayerControl.prototype = {
	_FacePointLayerControl : null,
    baseMapLayerControl : null,
    popupId : null,
    pointArr : [],
    layerMark : "face",
    init: function (map) {
       	_FacePointLayerControl = this;
       	_FacePointLayerControl.baseMapLayerControl=new BaseMapLayerControl({
			map : map,
			layerMark : _FacePointLayerControl.layerMark,
			layerName : "人脸卡口",
			layerVisible : true,
			url : "getFacePointOlClusterView.do?deviceType=119",
			getSingleLayerMarker : _FacePointLayerControl.getSingleLayerMarker,
			getClusterLayerMarker : _FacePointLayerControl.getClusterLayerMarker,
			clusterLayerClick : _FacePointLayerControl.clusterLayerClick,
			singleLayerClick : _FacePointLayerControl.singleLayerClick,
			singleLayerDblClick : _FacePointLayerControl.singleLayerDblClick
       	});
    },
    //1.必须方法之单个点图层双击事件
    singleLayerDblClick : function(arr){
    	if(arr && arr.length>0){
	    	_FacePointLayerControl.pointArr=arr;
	    	_FacePointLayerControl._playVideo(arr[0]);
    	}
    },
    //2.必须方法之单个点图层单击事件
    singleLayerClick : function(arr){
    	if(arr && arr.length>0){
	    	_FacePointLayerControl.pointArr=arr;
			_FacePointLayerControl._showMarkerPopupByPuId(arr[0].puid);
		}
    },
    //3.必须方法之聚合图层单击事件,列表内容小于20
    clusterLayerClick : function(coordinate,features){
    	_FacePointLayerControl.pointArr=features;
		var lon = coordinate[0] * 1.0;
		var lat = coordinate[1] * 1.0;
		//无坐标时
        if(lon==null || lon==0 || isNaN(lon) || lat==null || lat==0 || isNaN(lat)){
        	fadingTip("没有坐标");
        	return;
        }
		var html = _FacePointLayerControl.getClusterPopUpHtml(features);
		//聚合气泡
		var id = "deviceCluster"+features[0].puid;
		window.gisInteraction.showPopup(id, lon, lat, html, false);
		
    	_FacePointLayerControl.binClusterEven();
    },
    binClusterEven : function(){
    	$("#firstclusterPopUpContent a").bind('click',function(){
    		var puid = $(this).attr("puid");
    		_FacePointLayerControl._showMarkerPopupByPuId(puid);
    	})
    	
    	$("#firstclusterPopUp .NPopUpClose02").bind('click',function(){
    		$("#firstclusterPopUp").hide();
    	})
    },
    _showMarkerPopupByPuId: function (puid) {
   		var obj = null;
    	$.each(_FacePointLayerControl.pointArr,function(i,item){
    		if(item.puid == puid){
    			obj = item;
    			return true;
    		}
    	})
		_FacePointLayerControl._showFaceMarkerPopup(obj);
  	},
   	_showFaceMarkerPopup: function (item) {
   		var html = _FacePointLayerControl._getScienceFaceMarkerPopupHtmlTemplate();
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

        var id = "faceClass_" + item.puId;
        var lon = item.lon * 1.0;
        var lat = item.lat * 1.0;
        if (_FacePointLayerControl.popupId) {
            window.gisInteraction.clearPopup(_FacePointLayerControl.popupId);
        }
        _FacePointLayerControl.popupId = id;

        window.gisInteraction.showPopup(id, lon, lat, html, false);
      	//放大到最大级别
        var maxZoom = _FirstClassLayerControl.baseMapLayerControl.getMapMaxZoom();
        window.gisInteraction.setZoom(maxZoom);
        window.gisInteraction.setCenterLeft(lon, lat);

        $("#btnCloseFirstClassPopup").unbind("click").click(function () {
            window.gisInteraction.clearPopup(_FacePointLayerControl.popupId);
        });
        
        $("#sskk").unbind("click").click(function(){  //实时卡口
        	 var content = new Object();
        	 content.lon = $(this).attr("lon");
        	 content.lat = $(this).attr("lat");
        	 content.state = ($(this).attr("state")=="在线")?1:0;
        	 content.puid = $(this).attr("puid");
        	 content.channel = $(this).attr("channel");
        	 content.name = $(this).attr("name");
        	 var content_list=new Array();
        	 content_list.push(content);
        	 sskk(content_list);
        })
        
        $("#rljs").unbind("click").click(function(){   //人脸检索
 			top.faceSearch = jQuery.fn.scienceDialog({
			    url : "faceSearchQuery.do?puid="+$(this).attr("puid"),
			    zIndex : 999999,
				width:'auto',
				height:'auto',
			    top:0,
			    close:function(){
			    	top.faceSearch=null;
			    }
			});
        })
    },
    _getScienceFaceMarkerPopupHtmlTemplate : function(){
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
	     + '           	<a href="javascript:void(0);" lon="%lon" lat="%lat" state="%state" puid="%puid" channel="%channel" name="%name" id="sskk" class="GPUBtn01">实时卡口</a>'
	     + '               <a href="javascript:void(0);" lon="%lon" lat="%lat" state="%state" puid="%puid" channel="%channel" name="%name" id="rljs" class="GPUBtn01">人脸检索</a>'
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
	//4.必须方法之获得聚合图层对象
    getClusterLayerMarker : function(obj,arr){
		return {
            id: Math.random()+"",
            name: Math.random()+"",
            lon: obj.lon,
            lat: obj.lat,
            img: 'resource/images/m3.png',
            att: obj,
            clusterSize :obj.size
        };
	},
	//5.必须方法之获得单个点图层对象
    getSingleLayerMarker : function(obj){
		var imgUrl = top.window.getRlkkIcon(obj);
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
    	_FacePointLayerControl.baseMapLayerControl.showLayer(_FacePointLayerControl.layerMark,visible);
    },
    //7.必须方法之设置图层的显示与隐藏
    _setLayerVisible: function () {
        _FacePointLayerControl.baseMapLayerControl._setLayerVisible(_FacePointLayerControl.layerMark);
    },
    CLASS_NAME: "FacePointLayerControl"
};