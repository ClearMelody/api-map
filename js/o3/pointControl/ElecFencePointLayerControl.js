//电子围栏图层控制器
var ElecFencePointLayerControl = function () {
    this.init.apply(this, arguments);
};

ElecFencePointLayerControl.prototype = {
    _ElecFencePointLayerControl : null,
    elecBaseMapLayerControl : null,
    popupId : null,
    pointArr : [],
    layerMark : "elecFence",
    init: function (map,isFaceLayer) {
        _ElecFencePointLayerControl = this;
        _ElecFencePointLayerControl.elecBaseMapLayerControl=new BaseMapLayerControl({
            map : map,
            layerMark : _ElecFencePointLayerControl.layerMark,
            layerName : "电子围栏",
            layerVisible : true,
            setLayerVisibleZoom : 12,
            url : "getElecFencePointOlClusterView.do",
            getSingleLayerMarker : _ElecFencePointLayerControl.getSingleLayerMarker,
            getClusterLayerMarker : _ElecFencePointLayerControl.getClusterLayerMarker,
            clusterLayerClick : _ElecFencePointLayerControl.clusterLayerClick,
            singleLayerClick : _ElecFencePointLayerControl.singleLayerClick,
            singleLayerDblClick : _ElecFencePointLayerControl.singleLayerDblClick
        });
    },
    //1.必须方法之单个点图层双击事件
    singleLayerDblClick : function(arr){
    	return;
    },
    //2.必须方法之单个点图层单击事件
    singleLayerClick : function(arr){
    	var item=arr[0];
		_ElecFencePointLayerControl._showMarkerPopup(item);
    },
	_getScienceMarkerPopupHtmlTemplate : function() {
		var html = '  	<div class="NPopUpBox02" style="width:350px;">'
				+ '   <a href="javascript:void(0);" class="NPopUpClose02" id="btnCloseFirstClassPopup"></a>'
				+ '   <div class="NPUTwoContent">'
				+ '   	<div class="GSDHeader">%name</div>'
				+ '       <div class="GPUInnerBox">'
				+ '       	<div class="GPUInnerBox_Border">'
				+ '               <div class="GStaffDetailsBox">'
				+ '                   <div class="GStaffDetails">'
				+ '                       <div class="GStaffDetailsTitle">编号：</div>'
				+ '                       <div class="GStaffDetails_r">%bh</div>'
				+ '                       <div class="clear"></div>'
				+ '                  </div>'
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
				+ '   </div>' + '   <div class="NPopUpBox02_line01"></div>'
				+ '   <div class="NPopUpBox02_line02"></div>'
				+ '   <div class="NPopUpBox02_j01"></div>'
				+ '   <div class="NPopUpBox02_j02"></div>'
				+ '   <div class="NPopUpBox02_j03"></div>'
				+ '   <div class="NPopUpBox02_j04"></div>'
				+ '   <div class="NPopUpBox02_j05"></div>'
				+ '   <div class="NPopUpBox02_j06"></div>' + '</div>'

		return html;
	},
    //3.必须方法之聚合图层单击事件,列表内容小于20
    clusterLayerClick : function(coordinate,features){
    	_ElecFencePointLayerControl.pointArr=features;
		var lon = coordinate[0] * 1.0;
		var lat = coordinate[1] * 1.0;
		var resambleHtml = '';
		resambleHtml += ' <div class="NPopUpBox02" style="width:350px;" id="clusterPopUp">';
		resambleHtml += '<a href="javascript:void(0);" class="NPopUpClose02" onclick="window.gisInteraction.clearPopup();"></a>';
		resambleHtml += ' <div class="NPUTwoContent">';
		resambleHtml += '<div class="GPUHeader02"><h1>电子围栏列表</h1></div>';
		resambleHtml += '   <div class="GPUInnerBox">';
		resambleHtml += '   	<div class="GPUInnerBox_Border">';
		resambleHtml += '       	<div class="GkkListBox" style="height:200px;" id="clusterPopUpContent">';
		for ( var i = 0; i < features.length; i++) {
			var tmpObj = features[i];
			var zdmc = tmpObj.zdmc;
			var zdbh = tmpObj.zdbh;
			var longitude = tmpObj.longitude * 1.0;
			var latitude = tmpObj.latitude * 1.0;
			var markImgUrl = top.window.getElecFenceIcon(tmpObj.point);

			resambleHtml += '<a href="javascript:void(0);" class="GkkListNav" style="height:30px;line-height:30px;"> ';
			resambleHtml += '    <img src="' + markImgUrl + '" width="32" height="32" />';
			resambleHtml += '    <span class="elecItemTitle" style="margin-left:5px;" title="' + zdmc + '" id="' + zdbh + '"  zdmc="' + zdmc + '"  lon="' + longitude + '"  lat="' + latitude + '" ';
			resambleHtml += '       >' + zdmc + '</span> ';
			resambleHtml += '</a>';
		}
		resambleHtml += '           </div>';
		resambleHtml += '       	<div class="GPUInnerBox_Line01"></div>';
		resambleHtml += '   	<div class="GPUInnerBox_Line02"></div>';
		resambleHtml += '    </div>';
		resambleHtml += '  </div>';
		resambleHtml += ' </div>';
		resambleHtml += '<div class="NPopUpBox02_line01"></div>';
		resambleHtml += '<div class="NPopUpBox02_line02"></div>';
		resambleHtml += ' <div class="NPopUpBox02_j01"></div>';
		resambleHtml += ' <div class="NPopUpBox02_j02"></div>';
		resambleHtml += ' <div class="NPopUpBox02_j03"></div>';
		resambleHtml += '<div class="NPopUpBox02_j04"></div>';
		resambleHtml += '<div class="NPopUpBox02_j05"></div>';
		resambleHtml += '<div class="NPopUpBox02_j06"></div>';
		resambleHtml += ' </div>';

		window.gisInteraction.showPopup(features[0].id, lon, lat, resambleHtml, false);
		window.gisInteraction.setCenterLeft(lon, lat);
		_ElecFencePointLayerControl.bindListEvents();
    },
	bindListEvents : function() {
		$(".elecItemTitle").unbind("click").bind("click", function() {
			var id = $(this).attr("id");
			_ElecFencePointLayerControl._showMarkerPopupById(id);
		});
	},
	_showMarkerPopupById : function(id) {
		var obj = null;
    	$.each(_ElecFencePointLayerControl.pointArr,function(i,item){
    		if(item.zdbh||item.ZDBH == id){
    			obj = item;
    			return true;
    		}
    	});
		_ElecFencePointLayerControl._showMarkerPopup(obj);
	},
	_showMarkerPopup : function(item) {
		var html = _ElecFencePointLayerControl._getScienceMarkerPopupHtmlTemplate();
		html = html.replace(/%name/g, item.zdmc || item.ZDMC || "");
		html = html.replace(/%bh/g, item.zdbh || item.ZDBH || "");
		html = html.replace("%lon", item.longitude || item.LONGITUDE || "");
		html = html.replace("%lat", item.latitude || item.LATITUDE || "");

		var id = "elecFence_" + (item.zdbh||item.ZDBH);
		var lon = item.longitude * 1.0 || item.LONGITUDE * 1.0;
		var lat = item.latitude * 1.0 || item.LATITUDE * 1.0;
		if (_ElecFencePointLayerControl.popupId) {
			window.gisInteraction.clearPopup(_ElecFencePointLayerControl.popupId);
		}
		_ElecFencePointLayerControl.popupId = id;
		window.gisInteraction.showPopup(id, lon, lat, html, false);
		window.gisInteraction.setCenterLeft(lon, lat);
		$("#btnCloseFirstClassPopup").unbind("click").click(function() {
			window.gisInteraction.clearPopup(_ElecFencePointLayerControl.popupId);
		});
	},
    //4.必须方法之获得聚合图层对象
    getClusterLayerMarker : function(obj,arr){
    	return {
            id: Math.random()+"",
            name: Math.random()+"",
            lon: obj.lon,
            lat: obj.lat,
            img: 'resource/images/m2.png',
            att: obj,
            clusterSize :obj.size
        };
    },
    //5.必须方法之获得单个点图层对象
    getSingleLayerMarker : function(obj){
    	var imgUrl = top.window.getElecFenceIcon(obj);
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
    //6.必须方法之显示图层,固定写法
    showLayer : function(visible){
        _ElecFencePointLayerControl.elecBaseMapLayerControl.showLayer(_ElecFencePointLayerControl.layerMark,visible);
    },
    //7.必须方法之设置图层的显示与隐藏,固定写法
    _setLayerVisible: function () {
        _ElecFencePointLayerControl.elecBaseMapLayerControl._setLayerVisible(_ElecFencePointLayerControl.layerMark);
    },
    CLASS_NAME: "ElecFencePointLayerControl"
};