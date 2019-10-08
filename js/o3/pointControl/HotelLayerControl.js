var HotelLayerControl = function () {
    this.init.apply(this, arguments);
};

HotelLayerControl.prototype = {
    map: null,
    popupId: null,
//  recordList: [],
    recordDic: [],
    hotelMarkerLayer: "hotelMarkerLayer",
    layerVisible: true,
    init: function (map) {
        var _this = this;
        _this.map = map;
        if (!window.map) {
            window.map = map;
        }
        _markerLocalFuns.createMarkerLayer(_this.hotelMarkerLayer);
        _this.map.getView().on('change:resolution', function () {
            _this._setLayerVisible();
        });
        if(top.window.hotelRecordList.length > 0){
        	for (var i = 0; i < top.window.hotelRecordList.length; i++) {
                var item = top.window.hotelRecordList[i];
                _this.recordDic[item.xxzjbh] = item;
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
        window.gisInteraction.setLayerVisible(_this.hotelMarkerLayer, visible);
        if (visible) {
            _this._setLayerVisible();
        }
    },
    zoom2Layer: function () {
        var _this = this;
        var pntList = [];
        for (var i = 0; i < top.window.hotelRecordList.length; i++) {
            var item = top.window.hotelRecordList[i];
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
            url: "findAllGaDzztxx.do",
            data: {
                "topicType": 1
            },
            cache: false,
            async: true,
            type: 'GET',
            success: function (resobj) {
                if (!resobj || !resobj.resp || !resobj.resp.response) {
                    return;
                }
                top.window.hotelRecordList = (resobj.resp.response || []);
                window.top.hotelRecords = top.window.hotelRecordList;
                for (var i = 0; i < top.window.hotelRecordList.length; i++) {
                    var item = top.window.hotelRecordList[i];
                    _this.recordDic[item.xxzjbh] = item;
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
        for (var i = 0; i < top.window.hotelRecordList.length; i++) {
            var item = top.window.hotelRecordList[i];
            if (!item.longitude || !item.latitude) {
                continue;
            }
            var img = top.window.getHotelIcon(item);
            var maker = {
                id: item.xxzjbh,
                name: item.topicName,
                img: img,
                lon: item.longitude * 1.0,
                lat: item.latitude * 1.0,
                att: item
            };
            makerList.push(maker);
        }
        //显示图标
        window.gisInteraction.clearMarkers(_this.hotelMarkerLayer);
        window.gisInteraction.addMarkers(_this.hotelMarkerLayer, makerList, function (attList) {
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
        html = html.replace(/%objId/g, item.xxzjbh || "");
        html = html.replace(/%name/g, item.topicName || "");
        html = html.replace(/%addr/g, item.topicAddr || "");
        html = html.replace("%lxrName", item.lxrName || "");
        html = html.replace("%lxrTel", item.lxrTel || "");
        html = html.replace("%desc", "宾馆酒店");

        var id = "hotel_" + item.xxzjbh;
        var lon = item.longitude * 1.0;
        var lat = item.latitude * 1.0;
        if (_this.popupId) {
            window.gisInteraction.clearPopup(_this.popupId);
        }
        _this.popupId = id;

        var maxZoom =  top.window.getMapMaxZoom();
        window.gisInteraction.setZoom(maxZoom);
        window.gisInteraction.showPopup(id, lon, lat, html, false);
        window.gisInteraction.setCenterLeft(lon, lat);

        $("#btnCloseHotelPopup").unbind("click").click(function () {
            window.gisInteraction.clearPopup(_this.popupId);
        });

        $("#btnShowHotelDetail").unbind("click").click(function () {
        	var objId = $(this).attr("objId");
            var item = _this.recordDic[objId];
            //打开详情页面
            top.hotelDetailDlg = $.fn.scienceDialog({
				title:item.topicName+"-住宿信息",
				url:"toHotelHis.do?lgdm="+item.topicId+"&lgmc="+encodeURI(encodeURI(item.topicName)),
				width: '1200',
				height: '600',
				close: function (){
					top.hotelDetailDlg = null;
				}
			});		
        });
    },
    _getMarkerPopupHtmlTemplate: function () {
        var html = '<div class="PSBUnitBox" style="width:250px;height:200px;top:0px;right:0px;left:0px;">'
                 + '    <div class="PSBUnitTitle">宾馆酒店<a id="btnCloseHotelPopup" href="javascript:void(0);" class="PSBUnitClose"></a></div>'
                 + '    <div class="PSBUnitContent" style="height:200px;">'
                 + '        <div class="PSBUnitList">'
                 + '            <p><div title="%name" style="width:230px;overflow: hidden;text-overflow: ellipsis; white-space: nowrap;"><b>%name</b></div></p>'
                 + '            <p>单位类型：%desc</p>'
                 + '            <p><div title="%addr" style="width:230px;overflow: hidden;text-overflow: ellipsis; white-space: nowrap;">单位地址：%addr</div></p>'
                 + '            <p>联系人：%lxrName</p>'
                 + '            <p>联系电话：%lxrTel</p>'
                 + '            <p objId="%objId" id="btnShowHotelDetail" style="display:nonel;text-decoration:underline;margin-left:170px;margin-top:20px;cursor:pointer;">入住信息</p>'
                 + '        </div>'
                 + '    </div>'
                 + '</div>';
        return html;
    },
    _getScienceMarkerPopupHtmlTemplateOne : function(){
    	var html = '<div class="NPopUpBox" style="left:0px;top:0px">'
                 + '<div class="NPopUpTitle">'
                 + '   <a href="javascript:void(0);" class="NPopUpClose" id="btnCloseHotelPopup"></a>'
                 + '   <div class="NPopUpTitlebg01"></div>'
                 + '   <div class="NPopUpTitlebg02">宾馆/酒店信息</div>'
                 + '   <div class="NPopUpTitlebg03"></div>'
                 + '   <div class="NPopUpTitle_j01"></div>'
                 + '   <div class="NPopUpTitle_j02"></div>'
                 + '</div>'
                 + '<div class="NPopUpContent">'
                 + '   <div class="NPopUpContentBorder">'
                 + '       <div class="NPTitle">%name</div>'
                 + '       <div class="NPopUpContent_c">'
                 + '            <p>单位类型：%desc</p>'
                 + '            <p><div title="%addr" style="color: #FF0;width:340px;overflow: hidden;text-overflow: ellipsis; white-space: nowrap;">单位地址：%addr</div></p>'
                 + '            <p>联系人：%lxrName</p>'
                 + '            <p>联系电话：%lxrTel</p>'
                 + '       </div>'
                 + '       <div class="NPopUpBtnBox">'
                // + '            <a href="javascript:void(0);" objId="%objId" id="btnShowHotelDetail"  class="NPopUpBtn01">入住信息</a>'
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
	     + '   <a href="javascript:void(0);" class="NPopUpClose02" id="btnCloseHotelPopup"></a>'
	     + '   <div class="NPUTwoContent">'
	     + '   	<div class="GSDHeader">%name</div>'
	     + '       <div class="GPUInnerBox">'
	     + '       	<div class="GPUInnerBox_Border">'
	     + '               <div class="GStaffDetailsBox">'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">单位类型：</div>'
	     + '                       <div class="GStaffDetails_r">%desc</div>'
	     + '                       <div class="clear"></div>'
	     + '                  </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">单位地址：</div>'
	     + '                       <div class="GStaffDetails_r">%addr</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">联系人：</div>'
	     + '                       <div class="GStaffDetails_r">%lxrName</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">联系电话：</div>'
	     + '                       <div class="GStaffDetails_r">%lxrTel</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '               </div>'
	     + '           	<div class="GPUInnerBox_Line01"></div>'
	     + '           	<div class="GPUInnerBox_Line02"></div>'
	     + '           </div>'
	     + '       </div>'
	     + '       <div class="GPUBtnBox01">'
	     + '           <div class="GPUBtnBox02">'
	     //+ '           	<a href="javascript:void(0);" objId="%objId" id="btnShowHotelDetail"  class="GPUBtn01">入住信息</a>'
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
            window.gisInteraction.setLayerVisible(_this.hotelMarkerLayer, true);
        } else {
            window.gisInteraction.setLayerVisible(_this.hotelMarkerLayer, false);
        }
    },
     _showMarkerPopupById : function(id){
    	var markerObject = null;
    	var _this = this;
    	$.each(top.window.hotelRecordList,function(i,item){
    		if(item.topicId == id){
    			markerObject = item;
    			return true;
    		}
    	})
    	_this._showMarkerPopup(markerObject);
    },
    CLASS_NAME: "HotelLayerControl"
};