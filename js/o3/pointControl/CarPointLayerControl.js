var CarPointLayerControl = function () {
    this.init.apply(this, arguments);
};

CarPointLayerControl.prototype = {
    map: null,
    popupId: null,
//  recordList: [],
    recordDic: [],
    carMarkerLayer: "carPointMarkerLayer",
    layerVisible: true,
    init: function (map) {
        var _this = this;
        _this.map = map;
        if (!window.map) {
            window.map = map;
        }
        _markerLocalFuns.createMarkerLayer(_this.carMarkerLayer);
        _this.map.getView().on('change:resolution', function () {
            _this._setLayerVisible();
        });
        if(top.window.carRecordList.length > 0){ //如果缓存中有数据就直接从缓存中取
        	for (var i = 0; i < top.window.carRecordList.length; i++) {
               	var item = top.window.carRecordList[i];
                _this.recordDic[item.CHANNEL_NO] = item;
            }
            _this._showMarker2Map();
            _this._setLayerVisible();
        }else{
        	_this._queryCarPointList();
        }
    },
    showLayer: function (visible) {
        var _this = this;
        _this.layerVisible = visible;
        window.gisInteraction.setLayerVisible(_this.carMarkerLayer, visible);
        if (visible) {
            _this._setLayerVisible();
        }
    },
    zoom2Layer: function () {
        var _this = this;
        var pntList = [];
        for (var i = 0; i < top.window.carRecordList.length; i++) {
            var item = top.window.carRecordList[i];
            if (!item.LONGITUDE || !item.LATITUDE) {
                continue;
            }
            var pnt = [item.LONGITUDE * 1.0, item.LATITUDE * 1.0];
            pntList.push(pnt);
        }
        _this._zoom2PntList(pntList);
    },
    clear: function () {
        this.showLayer(false);
    },
    _queryCarPointList: function () {
        var _this = this;
        $.ajax({
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            url: "queryCarJKD.do",
            data: {},
            cache: false,
            async: true,
            type: 'GET',
            success: function (resobj) {
                if (!resobj || !resobj.response) {
                    return;
                }
                top.window.carRecordList = (resobj.response || []);
                for (var i = 0; i < top.window.carRecordList.length; i++) {
                    var item = top.window.carRecordList[i];
                    _this.recordDic[item.CHANNEL_NO] = item;
                }
                _this._showMarker2Map();
                _this._setLayerVisible();
            },
            error: function (resobj) {
                fadingTip("服务器端异常，查询宾馆酒店信息失败!");
            }
        });
    },
    _showMarker2Map: function () {
        var _this = this;
        var makerList = [];
        for (var i = 0; i < top.window.carRecordList.length; i++) {
            var item = top.window.carRecordList[i];
            if (!item.LONGITUDE || !item.LATITUDE) {
                continue;
            }
            var img = top.window.getCarIcon(item);
            var maker = {
                id: item.CHANNEL_NO,
                name: item.NAME,
                img: img,
                lon: item.LONGITUDE * 1.0,
                lat: item.LATITUDE * 1.0,
                att: item
            };
            makerList.push(maker);
        }
        //显示图标
        window.gisInteraction.clearMarkers(_this.carMarkerLayer);
        window.gisInteraction.addMarkers(_this.carMarkerLayer, makerList, function (attList) {
            //点击显示气泡
            if (!attList || attList.length < 1)
                return;
            //地图上点击时不居中不放大
            top.window.isZoom = false;
            top.window.isCenter = false;
            _this._showMarkerPopup(attList[0]);
        }, function (attList) {
            //双击
        });
    },
    _showMarkerPopup: function (item) {
        var _this = this;
        var html = _this._getScienceMarkerPopupHtmlTemplate();
        html = html.replace(/%kkName/g, item.NAME || "");
        html = html.replace(/%kkbh/g, item.CHANNEL_NO || "");
        html = html.replace(/%addr/g, item.ADDRESS || "");
        html = html.replace("%lon", item.LONGITUDE || "");
        html = html.replace("%lat", item.LATITUDE || "");

        var id = "car_" + item.CHANNEL_NO;
        var lon = item.LONGITUDE * 1.0;
        var lat = item.LATITUDE * 1.0;
        if (_this.popupId) {
            window.gisInteraction.clearPopup(_this.popupId);
        }
        _this.popupId = id;

        var maxZoom =  top.window.getMapMaxZoom();
        window.gisInteraction.setZoom(maxZoom);
        window.gisInteraction.showPopup(id, lon, lat, html, false);
        window.gisInteraction.setCenterLeft(lon, lat);

        $("#btnCloseFirstClassPopup").unbind("click").click(function () {
            window.gisInteraction.clearPopup(_this.popupId);
        });

    },
    _getScienceMarkerPopupHtmlTemplate : function(){
    	 var html = '  	<div class="NPopUpBox02" style="width:350px;">'
	     + '   <a href="javascript:void(0);" class="NPopUpClose02" id="btnCloseFirstClassPopup"></a>'
	     + '   <div class="NPUTwoContent">'
	     + '   	<div class="GSDHeader">%kkName</div>'
	     + '       <div class="GPUInnerBox">'
	     + '       	<div class="GPUInnerBox_Border">'
	     + '               <div class="GStaffDetailsBox">'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">卡口编号：</div>'
	     + '                       <div class="GStaffDetails_r">%kkbh</div>'
	     + '                       <div class="clear"></div>'
	     + '                  </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">卡口地址：</div>'
	     + '                       <div class="GStaffDetails_r">%addr</div>'
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
//	     + '       <div class="GPUBtnBox01">'
//	     + '           <div class="GPUBtnBox02">'
//	     + '           	<a href="javascript:void(0);" lon="%lon" lat="%lat" state="%state" puid="%puid" channel="%channel" name="%name" id="videoPreviewBtn" class="GPUBtn01">视频预览</a>'
//	     + '               <a href="javascript:void(0);" lon="%lon" lat="%lat" state="%state" puid="%puid" channel="%channel" name="%name" id="videoReplayBtn" class="GPUBtn01">视频回放</a>'
//	     + '           </div>'
//	     + '       </div>'
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
        if (zoom >= 12) {
            window.gisInteraction.setLayerVisible(_this.carMarkerLayer, true);
        } else {
            window.gisInteraction.setLayerVisible(_this.carMarkerLayer, false);
        }
    },
     _showMarkerPopupById : function(id){
    	var markerObject = null;
    	var _this = this;
    	$.each(top.window.carRecordList,function(i,item){
    		if(item.CHANNEL_NO == id){
    			markerObject = item;
    			return true;
    		}
    	})
    	_this._showMarkerPopup(markerObject);
    },
    CLASS_NAME: "CarPointLayerControl"
};