var DzkLayerControl = function () {
    this.init.apply(this, arguments);
};

DzkLayerControl.prototype = {
    map: null,
    popupId: null,
//  recordList: [],
    recordDic: [],
    dzkMarkerLayer: "dzkMarkerLayer",
    layerVisible: true,
    init: function (map) {
        var _this = this;
        _this.map = map;
        if (!window.map) {
            window.map = map;
        }
        _markerLocalFuns.createMarkerLayer(_this.dzkMarkerLayer);
//        _this.map.getView().on('change:resolution', function () {
//           _this._setLayerVisible();
//        });
        if(top.window.dzkRecordList.length > 0){ //如果缓存中有数据就直接从缓存中取
        	for (var i = 0; i < top.window.dzkRecordList.length; i++) {
                var item = top.window.dzkRecordList[i];
                _this.recordDic[item.POI_ID] = item;
            }
            _this._showMarker2Map();
            _this._setLayerVisible();
        }else{
        	_this._queryAllRecordList();
        }
    },
    showLayer: function (visible) {
        var _this = this;
        _this.layerVisible = visible;
        window.gisInteraction.setLayerVisible(_this.dzkMarkerLayer, visible);
        if (visible) {
            _this._setLayerVisible();
        }
    },
    zoom2Layer: function () {
        var _this = this;
        var pntList = [];
        for (var i = 0; i < top.window.dzkRecordList.length; i++) {
            var item = top.window.dzkRecordList[i];
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
    _queryAllRecordList: function () {
        var _this = this;
        $.ajax({
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            url: "findAllDzkPointForList.do",
            data: {
            },
            cache: false,
            async: true,
            type: 'GET',
            success: function (resobj) {
                if (!resobj || !resobj.resp || !resobj.resp.response) {
                    return;
                }
                top.window.dzkRecordList = (resobj.resp.response || []);
                for (var i = 0; i < top.window.dzkRecordList.length; i++) {
                    var item = top.window.dzkRecordList[i];
                    _this.recordDic[item.POI_ID] = item;
                }
                _this._showMarker2Map();
                _this._setLayerVisible();
            },
            error: function (resobj) {
                fadingTip("服务器端异常，查询地址库信息失败!");
            }
        });
    },
    _showMarker2Map: function () {
        var _this = this;
        var makerList = [];
        for (var i = 0; i < top.window.dzkRecordList.length; i++) {
            var item = top.window.dzkRecordList[i];
            if (!item.LONGITUDE || !item.LATITUDE) {
                continue;
            }
            var img = "resource/scienceLayout/images/layerIco/bg/offline/jd.png";
            var maker = {
                id: item.POI_ID,
                name: item.POI_NAME,
                img: img,
                lon: item.LONGITUDE * 1.0,
                lat: item.LATITUDE * 1.0,
                att: item
            };
            makerList.push(maker);
        }
        //显示图标
        window.gisInteraction.clearMarkers(_this.dzkMarkerLayer);
        window.gisInteraction.addClusterMarkers(_this.dzkMarkerLayer, makerList, function (attList) {
            //点击显示气泡
            //if (!attList || attList.length < 1)
            //   return;
            //地图上点击时不居中不放大
            if(attList.length==1){
	            top.window.isZoom = false;
           		top.window.isCenter = false;
           		_this._showMarkerPopup(attList[0]);
            }else if (attList.length < 100) {
               _this._addClusterPointListPop(attList);
            }
        }, function (attList) {
            //双击
        });
        window.gisInteraction.setLayerVisible(_this.dzkMarkerLayer, true);
    },
    _showMarkerPopup: function (item) {
        var _this = this;
        var html = _this._getScienceMarkerPopupHtmlTemplate();
        html = html.replace(/%objId/g, item.POI_ID || "");
        html = html.replace(/%name/g, item.POI_NAME || "");
        html = html.replace(/%addr/g, item.ADDRESS || "");
        html = html.replace(/%lon/g, item.LONGITUDE || "");
        html = html.replace(/%lat/g, item.LATITUDE || "");

        var id = "dzk_" + item.POI_ID;
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

        $("#btnCloseDzkPopup").unbind("click").click(function () {
            window.gisInteraction.clearPopup(_this.popupId);
        });

    },
    _getMarkerPopupHtmlTemplate: function () {
        var html = '<div class="PSBUnitBox" style="width:250px;height:200px;top:0px;right:0px;left:0px;">'
                 + '    <div class="PSBUnitTitle">地址库点位<a id="btnCloseDzkPopup" href="javascript:void(0);" class="PSBUnitClose"></a></div>'
                 + '    <div class="PSBUnitContent" style="height:200px;">'
                 + '        <div class="PSBUnitList">'
                 + '            <p><div title="%name" style="width:230px;overflow: hidden;text-overflow: ellipsis; white-space: nowrap;"><b>%name</b></div></p>'
                 + '            <p><div title="%addr" style="width:230px;overflow: hidden;text-overflow: ellipsis; white-space: nowrap;">单位地址：%addr</div></p>'
                 + '            <p>经度：%lon</p>'
                 + '            <p>纬度：%lat</p>'
                 + '        </div>'
                 + '    </div>'
                 + '</div>';
        return html;
    },
    _getScienceMarkerPopupHtmlTemplateOne : function(){
    	var html = '<div class="NPopUpBox" style="left:0px;top:0px">'
                 + '<div class="NPopUpTitle">'
                 + '   <a href="javascript:void(0);" class="NPopUpClose" id="btnCloseDzkPopup"></a>'
                 + '   <div class="NPopUpTitlebg01"></div>'
                 + '   <div class="NPopUpTitlebg02">地址库点位信息</div>'
                 + '   <div class="NPopUpTitlebg03"></div>'
                 + '   <div class="NPopUpTitle_j01"></div>'
                 + '   <div class="NPopUpTitle_j02"></div>'
                 + '</div>'
                 + '<div class="NPopUpContent">'
                 + '   <div class="NPopUpContentBorder">'
                 + '       <div class="NPTitle">%name</div>'
                 + '       <div class="NPopUpContent_c">'
                 + '            <p><div title="%addr" style="color: #FF0;width:340px;overflow: hidden;text-overflow: ellipsis; white-space: nowrap;">单位地址：%addr</div></p>'
                 + '            <p>经度：%lon</p>'
                 + '            <p>纬度：%lat</p>'
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
	     + '   <a href="javascript:void(0);" class="NPopUpClose02" id="btnCloseDzkPopup"></a>'
	     + '   <div class="NPUTwoContent">'
	     + '   	<div class="GSDHeader">%name</div>'
	     + '       <div class="GPUInnerBox">'
	     + '       	<div class="GPUInnerBox_Border">'
	     + '               <div class="GStaffDetailsBox">'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">地址：</div>'
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
            window.gisInteraction.setLayerVisible(_this.dzkMarkerLayer, true);
        } else {
            window.gisInteraction.setLayerVisible(_this.dzkMarkerLayer, false);
        }
    },
    _addClusterPointListPop :function  (attList, lon, lat) {
    	var _this = this;
    	if (!lon) {
    		lon = attList[0].LONGITUDE*1.0;
    	}
    	if (!lat) {
    		lat = attList[0].LATITUDE*1.0;
    	}
        var resambleHtml = '';
        resambleHtml+=' <div class="NPopUpBox02" style="width:350px;" id="clusterPopUp">';
        resambleHtml+='<a href="javascript:void(0);" class="NPopUpClose02" onclick="window.gisInteraction.clearPopup();"></a>';
        resambleHtml+=' <div class="NPUTwoContent">';
        resambleHtml+='<div class="GPUHeader02"><h1>地址库列表</h1></div>';
        resambleHtml+='   <div class="GPUInnerBox">';
        resambleHtml+='   	<div class="GPUInnerBox_Border">';
        resambleHtml+='       	<div class="GkkListBox" style="height:200px;" id="clusterPopUpContent">';
        for(var i=0;i<attList.length;i++){
            var tmpObj = attList[i];
            var id = tmpObj.POI_ID;
            var name = tmpObj.POI_NAME;
            var longitude = tmpObj.LONGITUDE * 1.0;
            var latitude = tmpObj.LATITUDE * 1.0;
            var markImgUrl = "resource/scienceLayout/images/layerIco/dzk/offline/dzk.png";
            var rn = tmpObj.rn;
            
            resambleHtml+='<a href="javascript:void(0);" class="GkkListNav" style="height:30px;line-height:30px;"> ';
            resambleHtml+='    <img src="' + markImgUrl  + '" width="32" height="32" />';
            resambleHtml+='    <span class="dzkItemTitle" style="margin-left:5px;" title="' + name + '" id="'+id+'" ';
            resambleHtml+='       >'+name+'</span> ';
            resambleHtml+='</a>';
        }      	
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
        
        window.gisInteraction.showPopup(attList[0].id, lon, lat, resambleHtml, false);
        window.gisInteraction.setCenterLeft(lon,lat);
        _this.bindListEvents();
    },
    bindListEvents : function(){
    	var _this = this;
    	$(".dzkItemTitle").unbind("click").bind("click",function(){
    		var id = $(this).attr("id");
    		_this.showMarkLayerByPopId(id);
    	});
    },
    showMarkLayerByPopId : function(id){
    	var _this = this;
    	var item = _this.recordDic[id];
    	_this._showMarkerPopup(item);
    },
    showMarkLayerByItem : function(item){
    	var _this = this;
    	_this._showMarkerPopup(item);
    },
    CLASS_NAME: "DzkLayerControl"
};