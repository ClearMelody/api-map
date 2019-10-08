var DtGpsControl = function () {
    this.init.apply(this, arguments);
};

DtGpsControl.prototype = {
    map: null,
    popupId: null,
    recordList: [],
    recordDic: [],
    DtGpsMarkerLayer: "DtGpsMarkerLayer",
    layerVisible: true,
    min_layerResolution:null,  //最小显示级别
    max_layerResolution:null,  //最大显示级别
    layerInfo:null,  //当前图层的级别显示设置信息
    _DtGpsControl : null,
    _dtInterval : null,//电台请求定时器
    init: function (map) {
        var _this = this;
        _DtGpsControl=this;
        _this.map = map;
        if (!window.map) {
            window.map = map;
        }
        _markerLocalFuns.createMarkerLayer(_this.DtGpsMarkerLayer);
        if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("电台")){
        	_this.layerInfo = top.gisLayerConfigMap.get("电台");
        	_this.min_layerResolution = _this.layerInfo.min_resolution;
        	_this.max_layerResolution = _this.layerInfo.max_resolution;
        }
        _this.map.getView().on('change:resolution', function () {
            _this._setLayerVisible();
        });
        _this._queryAllRecordList();
       	//console.log("开启电台定时器");
    	_DtGpsControl._dtInterval=setInterval(function(){
        	_DtGpsControl._queryAllRecordList.apply(_DtGpsControl);
        },30*1000);
    },
    showLayer: function (visible) {
        var _this = this;
        _this.layerVisible = visible;
        window.gisInteraction.setLayerVisible(_this.DtGpsMarkerLayer, visible);
        if (visible) {
            _this._setLayerVisible();
            if(!_DtGpsControl._dtInterval){
            	//console.log("开启电台定时器");
            	_DtGpsControl._dtInterval=setInterval(function(){
		        	_DtGpsControl._queryAllRecordList.apply(_DtGpsControl);
		        },30*1000);
            }
        }
        else{
        	//console.log("销毁电台定时器");
        	clearInterval(_DtGpsControl._dtInterval);
        	_DtGpsControl._dtInterval=null;
        }
    },
    zoom2Layer: function () {
        var _this = this;
        var pntList = [];
        for (var i = 0; i < _this.recordList.length; i++) {
            var item = _this.recordList[i];
            if (!item.longitude || !item.latitude) {
                continue;
            }
            var pnt = [item.longitude * 1.0, item.latitude * 1.0];
            pntList.push(pnt);
        }
        _this._zoom2PntList(pntList);
    },
    clear: function () {
        this.showLayer(false);
    },
    _queryAllRecordList: function () {
        var _this = this;
        $.ajax({
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            url: "queryDtGpsDevice.do",
            cache: false,
            async: true,
            type: 'GET',
            success: function (resobj) {
                if (!resobj || !resobj.resp ) {
                    return;
                }
                _this.recordList = (resobj.resp || []);
                window.top.dTRecords = _this.recordList;
                _this._showMarker2Map();
                _this._setLayerVisible();
            },
            error: function (resobj) {
                fadingTip("服务器端异常，查询电台信息失败!");
            }
        });
    },
    _showMarker2Map: function () {
        var _this = this;
        var makerList = [];
        var dtNum = 0;
        var carNum = 0;
        for (var i = 0; i < _this.recordList.length; i++) {
            var item = _this.recordList[i];
            if (!item.LON || !item.LAT) {
                continue;
            }
            var imgUrl = top.window.getDTImgIcons(item);
            if(item.TYPE == "1") {//巡逻车
            	dtNum++;
            } else {
            	carNum++;
            }
            var maker = {
                id: item.NAME,
                name: item.NAME,
                img: imgUrl,
                lon: item.LON * 1.0,
                lat: item.LAT * 1.0,
                att: item
            };
            makerList.push(maker);
            var maxTime = 0;
            var maxType = 0;
            var maxName = null;
	        if(maxTime == 0) {
            	maxTime = item.TIME;
            	maxType = item.TYPE;
            	maxName = item.NAME;
            } else if(item.TIME > maxTime){
            	maxTime = item.TIME;
            	maxType = item.TYPE;
            	maxName =item.NAME;
            }
	        var str = maxName + "的手台上线了";
        	if(maxType != 3){
        		str = maxName + "巡逻车上线了";
        	}
        	if(maxName) {
            	$(".RollText").html(str);
            	$('.RollText').liMarquee({
						direction: 'left',//滚动方向，可选 left / right / up / down
						scrollamount: 10,//滚动速度，越大越快
						scrolldelay: 1,//每次重复之前的延迟
						circular: true,//无缝滚动，如果为 false，则和 marquee 效果一样
						runshort: false,
				});
        	}
        }
        
        $("#stNum").html(dtNum);
        $("#xlcNum").html(carNum);
        //显示图标
        window.gisInteraction.clearMarkers(_this.DtGpsMarkerLayer);
        window.gisInteraction.addClusterMarkers(_this.DtGpsMarkerLayer, makerList, function (attList) {
        	//地图上点击时不居中不放大
            top.window.isZoom = false;
            top.window.isCenter = false;
            //点击显示气泡
            if (!attList || attList.length < 1)
                return;
            if (attList.length == 1) {
                var att = attList[0];
                _this._showMarkerPopup(att);
            } else if (attList.length < 100) {
                _this.showItemListClusterPopup(attList);
            }
        }, function (attList) {
            //双击
        });
    },
    showItemListClusterPopup : function(attList){
    	var _this = this;
    	$("#clusterPopUp").draggable({
			  handle : ".GPUHeader02"
		});
//    	$("#clusterPopUp").show();
//    	$("#clusterPopUpContent").html(_this.getClusterPopUpHtml(attList));
//    	_this.binClusterEven();
    	var html =_this.getClusterPopUpHtml(attList);
	   	window.gisInteraction.clearPopup();
	   	var id = "dt_" + attList[0].GPSID;
        var lon = attList[0].LON * 1.0;
        var lat = attList[0].LAT * 1.0;
	   	 window.gisInteraction.showPopup(id, lon, lat, html, false);
	   	 window.gisInteraction.setCenterLeft(lon,lat);
	   	 _this.binClusterEven();
    },
    getClusterPopUpHtml : function(attList){
    	var _this = this;
    	var resambleHtml = "";
    	resambleHtml+=' <div class="NPopUpBox02" style="width:350px;" id="dtclusterPopUps">';
        resambleHtml+='<a href="javascript:void(0);" class="NPopUpClose02" onclick=""></a>';
        resambleHtml+=' <div class="NPUTwoContent">';
        resambleHtml+='<div class="GPUHeader02"><h1>电台聚合列表</h1></div>';
        resambleHtml+='   <div class="GPUInnerBox">';
        resambleHtml+='   	<div class="GPUInnerBox_Border">';
        resambleHtml+='       	<div class="GkkListBox" style="height:200px;" id="dtclusterPopUpContents">';
    	$.each(attList,function(i,item){
    		var name = item.name || item.XM;
    		var imgUrl = top.window.getDTImgIcons(item); 
            resambleHtml += '<a href="javascript:void(0);" gpsid="'+item.GPSID+'" name="'+name+'" class="GkkListNav" style="height:32px;line-height:32px;"><img src="'+imgUrl+'" width="32" height="32">'+name+'</a>';
    	})
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
    binClusterEven : function(){
    	var _this = this;
    	$("#dtclusterPopUpContents a").bind('click',function(){
    		var gpsid = $(this).attr("gpsid");
    		var obj = new Object();
    		$.each(_this.recordList,function(i,item){
    			if(item.GPSID == gpsid){
    				obj = item;
    				_this._showMarkerPopup(obj);
    				return false;
    			}
    		})
    		
    	})
    	$("#dtclusterPopUps .NPopUpClose02").bind('click',function(){
    		$("#dtclusterPopUps").hide();
    	})
    },
    _showMarkerPopup: function (item) {
    	if(item == null)
    		return;
        var _this = this;
        var html = _this._getScienceMarkerPopupHtmlTemplate();
        html = html.replace(/%name/g, item.NAME || "");
        html = html.replace(/%xm/g, item.XM || "");
        html = html.replace(/%jh/g, item.JH || "");
        html = html.replace("%time", item.TIME || "");

        var id = "dtgps_" + item.GPSID;
        var lon = item.LON * 1.0;
        var lat = item.LAT * 1.0;
        if (_this.popupId) {
            window.gisInteraction.clearPopup(_this.popupId);
        }
        _this.popupId = id;
        var maxZoom =  top.window.getMapMaxZoom();
        window.gisInteraction.setZoom(maxZoom);
        window.gisInteraction.showPopup(id, lon, lat, html, false);
        window.gisInteraction.setCenterLeft(lon, lat);

        $("#btnCloseDtGpsPopup").unbind("click").click(function () {
            window.gisInteraction.clearPopup(_this.popupId);
        });
    },
    _getScienceMarkerPopupHtmlTemplateOne : function(){
    	var html = '<div class="NPopUpBox" style="left:0px;top:0px">'
                 + '<div class="NPopUpTitle">'
                 + '   <a href="javascript:void(0);" class="NPopUpClose" id="btnCloseDtGpsPopup"></a>'
                 + '   <div class="NPopUpTitlebg01"></div>'
                 + '   <div class="NPopUpTitlebg02">电台信息</div>'
                 + '   <div class="NPopUpTitlebg03"></div>'
                 + '   <div class="NPopUpTitle_j01"></div>'
                 + '   <div class="NPopUpTitle_j02"></div>'
                 + '</div>'
                 + '<div class="NPopUpContent">'
                 + '   <div class="NPopUpContentBorder">'
                 + '       <div class="NPTitle">%name</div>'
                 + '       <div class="NPopUpContent_c">'
                 + '            <p>名称：%name</p>'
                 + '            <p>姓名：%xm</p>'
                 + '            <p>警号：%jh</p>'
                 + '            <p>时间：%time</p>'
                 + '       </div>'
                 + '       <div class="NPopUpContent_j01"></div>'
                 + '       <div class="NPopUpContent_j02"></div>'
                 + '   </div>'
                 + '</div>'
                 + '<div class="NPopUpFooter">'
                 + '   <div class="NPopUpFooterbg01"></div>'
                 + '   <div class="NPopUpFooterbg02"></div>'
                 + '   <div class="NPopUpFooterbg03"></div>'
                 + '   <div class="NPopUpFooter_j01"></div>'
                 + '   <div class="NPopUpFooter_j02"></div>'
                 + ' </div>'
                 + '</div>'
        return html;         
    },
    _getScienceMarkerPopupHtmlTemplate : function(){
    	var html = '  	<div class="NPopUpBox02" style="width:350px;">'
	     + '   <a href="javascript:void(0);" class="NPopUpClose02" id="btnCloseDtGpsPopup"></a>'
	     + '   <div class="NPUTwoContent">'
	     + '   	<div class="GSDHeader">%name</div>'
	     + '       <div class="GPUInnerBox">'
	     + '       	<div class="GPUInnerBox_Border">'
	     + '               <div class="GStaffDetailsBox">'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">名称：</div>'
	     + '                       <div class="GStaffDetails_r">%name</div>'
	     + '                       <div class="clear"></div>'
	     + '                  </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">姓名：</div>'
	     + '                       <div class="GStaffDetails_r">%xm</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">警号：</div>'
	     + '                       <div class="GStaffDetails_r">%jh</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">时间：</div>'
	     + '                       <div class="GStaffDetails_r">%time</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '               </div>'
	     + '           	<div class="GPUInnerBox_Line01"></div>'
	     + '           	<div class="GPUInnerBox_Line02"></div>'
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
    _zoom2PntList: function (pntList) {
        if (!pntList || pntList.length < 1)
            return;
        if (pntList.length == 1) {
            var pnt = pntList[0];
            window.gisInteraction.setPosition(pnt[0], pnt[1]);
            return;
        }
        var extent = [180, 90, -180, -90];
        var east = -180;
        var west = 180;
        var north = -90;
        var south = 90;
        for (var i = 0; i < pntList.length; i++) {
            var pnt = pntList[i];
            var lon = pnt[0];
            var lat = pnt[1];
            if (lon < west)
                west = lon;
            if (lon > east)
                east = lon;
            if (lat < south)
                south = lat;
            if (lat > north)
                north = lat;
        }
        window.gisInteraction.zoom2Range(east, west, south, north);
    },
    _setLayerVisible: function () {
        var _this = this;
        if (!_this.layerVisible) {
            return;
        }
        var zoom = _this.map.getView().getZoom();
        if(_this.layerInfo){
            if (zoom >= _this.min_layerResolution && zoom <= _this.max_layerResolution) {
        		window.gisInteraction.setLayerVisible(_this.DtGpsMarkerLayer, true);
        	} else {
        		window.gisInteraction.setLayerVisible(_this.DtGpsMarkerLayer, false);
        	}
        }else{
        	if (zoom >13) {
        		window.gisInteraction.setLayerVisible(_this.DtGpsMarkerLayer, true);
        	} else {
        		window.gisInteraction.setLayerVisible(_this.DtGpsMarkerLayer, false);
        	}
        }
    },
     _showMarkerPopupById : function(xm){
    	var markerObject = null;
    	var _this = this;
    	$.each(_this.recordList,function(i,item){
    		var name = item.name || item.XM;
    		if(name == xm){
    			markerObject = item;
    			return true;
    		}
    	})
    	_this._showMarkerPopup(markerObject);
    },
    CLASS_NAME: "DtGpsControl"
};