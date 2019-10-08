//@ sourceURL=sciencePersonClassControl.js
var PersonLayerControl = function () {
    this.init.apply(this, arguments);
};

PersonLayerControl.prototype = {
    map: null,
    popupId: null,
    recordList: [],
    recordDic: [],
    personMarkerLayer: "personMarkerLayer",
    min_layerResolution:null,  //最小显示级别
    max_layerResolution:null,  //最大显示级别
    layerInfo:null,  //当前图层的级别显示设置信息
    layerVisible: true,
    personInterval : null,
    init: function (map) {
        var _this = this;
        _this.map = map;
        if (!window.map) {
            window.map = map;
        }
        _markerLocalFuns.createMarkerLayer(_this.personMarkerLayer);
        if(top.gisLayerConfigMap.get("警务通")){
        	_this.layerInfo = top.gisLayerConfigMap.get("警务通");
        	_this.min_layerResolution = _this.layerInfo.min_resolution;
        	_this.max_layerResolution = _this.layerInfo.max_resolution;
        }
        _this.map.getView().on('change:resolution', function () {
            _this._setLayerVisible();
        });
        _this._queryAllRecordList();
        
        _this.personInterval = setInterval(function(){
        	_this._queryAllRecordList.apply(_this);
        },30*1000);
    },
    showLayer: function (visible) {
        var _this = this;
        _this.layerVisible = visible;
        window.gisInteraction.setLayerVisible(_this.personMarkerLayer, visible);
        if (visible) {
            _this._setLayerVisible();
            if(!_this.personInterval){
            	 _this.personInterval = setInterval(function(){
		        	_this._queryAllRecordList.apply(_this);
		        },30*1000);
            }
        }else{
        	clearInterval(_this.personInterval);
        	_this.personInterval=null;
        }
    },
    zoom2Layer: function () {
        var _this = this;
        var pntList = [];
        for (var i = 0; i < _this.recordList.length; i++) {
            var item = _this.recordList[i];
            if (!item.lat || !item.lon) {
                continue;
            }
            var pnt = [item.lon * 1.0, item.lat * 1.0];
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
            url: "getPersonClassPoint.do",
            cache: false,
            async: true,
            type: 'GET',
            success: function (resobj) {
                if (!resobj || !resobj.response) {
                    return;
                }
                _this.recordList = (resobj.response|| []);
                window.top.policeRecords = _this.recordList;
                _this._showMarker2Map();
                _this._setLayerVisible();
            },
            error: function (resobj) {
                fadingTip("服务器端异常，查询警务通失败!");
            }
        });
    },
    _showMarker2Map: function () {
        var _this = this;
        var makerList = [];
        $("#jwtNum").html(_this.recordList.length);
        for (var i = 0; i < _this.recordList.length; i++) {
            var item = _this.recordList[i];
            if (!item.LONGITUDE || !item.LATITUDE) {
                continue;
            }
            var img = top.window.getJwtIcon(item);
            var maker = {
                id: item.CUST_ID,
                name: item.REAL_NAME,
                img: img,
                lon: item.LONGITUDE * 1.0,
                lat: item.LATITUDE * 1.0,
                att: item
            };
            makerList.push(maker);
        }
        //显示图标
        window.gisInteraction.clearMarkers(_this.personMarkerLayer);
        window.gisInteraction.addClusterMarkers(_this.personMarkerLayer, makerList, function (attList) {
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
	   	var id = "jwt_" + attList[0].CUST_CODE;
        var lon = attList[0].LONGITUDE * 1.0;
        var lat = attList[0].LATITUDE * 1.0;
	   	 window.gisInteraction.showPopup(id, lon, lat, html, false);
	   	 window.gisInteraction.setCenterLeft(lon,lat);
	   	 _this.binClusterEven();
    },
    binClusterEven : function(){
    	var _this = this;
    	$("#jwtclusterPopUpContents a").bind('click',function(){
    		var custid = $(this).attr("custid");
    		var obj = new Object();
    		$.each(_this.recordList,function(i,item){
    			if(item.CUST_ID == custid){
    				obj = item;
    				_this._showMarkerPopup(obj);
    				return false;
    			}
    		})
    	})
    	
    	$("#jwtclusterPopUps .NPopUpClose02").bind('click',function(){
    		$("#jwtclusterPopUps").hide();
    	})
    },
    getClusterPopUpHtml : function(attList){
    	var _this = this;
    	var resambleHtml = "";
    	resambleHtml+=' <div class="NPopUpBox02" style="width:350px;" id="jwtclusterPopUps">';
        resambleHtml+='<a href="javascript:void(0);" class="NPopUpClose02" onclick=""></a>';
        resambleHtml+=' <div class="NPUTwoContent">';
        resambleHtml+='<div class="GPUHeader02"><h1>警务通聚合列表</h1></div>';
        resambleHtml+='   <div class="GPUInnerBox">';
        resambleHtml+='   	<div class="GPUInnerBox_Border">';
        resambleHtml+='       	<div class="GkkListBox" style="height:200px;" id="jwtclusterPopUpContents">';
    	$.each(attList,function(i,item){
    		var imgSrc = top.window.getJwtIcon(item);
    		resambleHtml += '<a title="'+item.REAL_NAME+'" href="javascript:void(0);" custid="'+item.CUST_ID+'" class="GkkListNav" style="height:32px;line-height:32px;"><img src="'+imgSrc+'" width="32" height="32">'+item.REAL_NAME+'</a>';
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
    _showMarkerPopup: function (item) {
        var _this = this;
        var html = _this._getScienceMarkerPopupHtmlTemplate();
        html = html.replace(/%REAL_NAME/g, item.REAL_NAME || "");
        html = html.replace(/%CUST_ID/g, item.CUST_ID || "");
        html = html.replace(/%CUST_GENDER/g, item.CUST_GENDER == '1' ? '男' : '女');
        html = html.replace(/%CUST_PHONE/g, item.CUST_PHONE || "");
        html = html.replace(/%ORG_NAME/g, item.ORG_NAME || "");
        html = html.replace(/%LONGITUDE/g, item.LONGITUDE || "");
        html = html.replace(/%LATITUDE/g, item.LATITUDE || "");

        var id = "person_" + item.CUST_ID;
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
        
        $("#videoPreviewBtn").unbind("click").click(function(){
        	var custId = $(this).attr("custId");
        	var realName = $(this).attr("realName");
        	var custIds = custId + "," + top.window.chatFrame.userInfo.custId;
            var names = realName + "," + top.window.chatFrame.userInfo.realName;
            try {
                chatWithUser(names, custIds);
            } catch (e) {
            }
        })
    },
    _getScienceMarkerPopupHtmlTemplateOne : function(){
    	var html = '<div class="NPopUpBox">'
                 + '<div class="NPopUpTitle">'
                 + '   <a href="javascript:void(0);" class="NPopUpClose" id="btnCloseFirstClassPopup"></a>'
                 + '   <div class="NPopUpTitlebg01"></div>'
                 + '   <div class="NPopUpTitlebg02">警务通信息</div>'
                 + '   <div class="NPopUpTitlebg03"></div>'
                 + '   <div class="NPopUpTitle_j01"></div>'
                 + '   <div class="NPopUpTitle_j02"></div>'
                 + '</div>'
                 + '<div class="NPopUpContent">'
                 + '   <div class="NPopUpContentBorder">'
                 + '       <div class="NPTitle">%REAL_NAME</div>'
                 + '       <div class="NPopUpContent_c">'
                 + '            <p>性别：%CUST_GENDER</p>'
                 + '            <p>电话号码：%CUST_PHONE</p>'
                 + '            <p>所属机构：%ORG_NAME</p>'
                 + '            <p>经度：%LONGITUDE</p>'
                 + '            <p>纬度：%LATITUDE</p>'
                 + '       </div>'
                 + '       <div class="NPopUpBtnBox">'
                 + '            <a href="javascript:void(0);" custId="%CUST_ID" realName="%REAL_NAME" id="videoPreviewBtn" class="NPopUpBtn01">发送消息</a>'
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
	     + '   <a href="javascript:void(0);" class="NPopUpClose02" id="btnCloseFirstClassPopup"></a>'
	     + '   <div class="NPUTwoContent">'
	     + '   	<div class="GSDHeader">%REAL_NAME</div>'
	     + '       <div class="GPUInnerBox">'
	     + '       	<div class="GPUInnerBox_Border">'
	     + '               <div class="GStaffDetailsBox">'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">性别：</div>'
	     + '                       <div class="GStaffDetails_r">%CUST_GENDER</div>'
	     + '                       <div class="clear"></div>'
	     + '                  </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">电话号码：</div>'
	     + '                       <div class="GStaffDetails_r">%CUST_PHONE</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">所属机构：</div>'
	     + '                       <div class="GStaffDetails_r">%ORG_NAME</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">经度：</div>'
	     + '                       <div class="GStaffDetails_r">%LONGITUDE</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">纬度：</div>'
	     + '                       <div class="GStaffDetails_r">%LATITUDE</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '               </div>'
	     + '           	<div class="GPUInnerBox_Line01"></div>'
	     + '           	<div class="GPUInnerBox_Line02"></div>'
	     + '           </div>'
	     + '       </div>'
	     + '       <div class="GPUBtnBox01">'
	     + '           <div class="GPUBtnBox02">'
	     + '           	<a href="javascript:void(0);" custId="%CUST_ID" realName="%REAL_NAME" id="videoPreviewBtn" class="GPUBtn01">发送消息</a>'
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
        	if (zoom >= _this.min_layerResolution && zoom <=_this.max_layerResolution) {
        		window.gisInteraction.setLayerVisible(_this.personMarkerLayer, true);
        	} else {
        		window.gisInteraction.setLayerVisible(_this.personMarkerLayer, false);
        	}
        }else{
        	if (zoom > 13) {
        		window.gisInteraction.setLayerVisible(_this.personMarkerLayer, true);
        	} else {
        		window.gisInteraction.setLayerVisible(_this.personMarkerLayer, false);
        	}
        }
        
    },
     _showMarkerPopupById : function(custId){
    	var markerObject = null;
    	var _this = this;
    	$.each(_this.recordList,function(i,item){
    		if(item.CUST_ID == custId){
    			markerObject = item;
    			return true;
    		}
    	})
    	_this._showMarkerPopup(markerObject);
    },
    CLASS_NAME: "PersonLayerControl"
};