var MgqyAreaLayerControl = function () {
    this.init.apply(this, arguments);
};

MgqyAreaLayerControl.prototype = {
    map: null,
    popupId: null,
    mgqyMarkerLayer: "mgqyMarkerLayer",
    layerVisible: true,
    allAddrMap : null,
    init: function (map) {
        var _this = this;
        _this.map = map;
        if (!window.map) {
            window.map = map;
        }
        _markerLocalFuns.createMarkerLayer(_this.mgqyMarkerLayer);
        _this.map.getView().on('change:resolution', function () {
           _this._setLayerVisible();
        });
        if(_this.allAddrMap){ //如果缓存中有数据就直接从缓存中取
            _this._showMarker2Map();
            _this._setLayerVisible();
        }else{
        	_this._queryAllRecordList();
        }
    },
    showLayer: function (visible) {
        var _this = this;
        _this.layerVisible = visible;
        window.gisInteraction.setLayerVisible(_this.mgqyMarkerLayer, visible);
        if (visible) {
            _this._setLayerVisible();
        }else{
        	window.gisInteraction.clearFeatures(_this.mgqyMarkerLayer+"_circle");
        }
    },
    clear: function () {
        this.showLayer(false);
    },
    _queryAllRecordList: function () {
        var _this = this;
        $.ajax({
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            url: "queryAllSensitiveAddrs.do",
            data: {
            },
            type: 'post',
            success: function (data) {
            	if(data && data.resp && data.resp.response){
            		_this.allAddrMap = new HashMap();
    				var result = data.resp.response;
    				for(var i=0;i<result.length;i++){
    					_this.allAddrMap.put(result[i].id,{
    						id : result[i].id,
    						name : result[i].saName,
    						distance : result[i].saDistance,
    						lon : result[i].saLongitude,
    						lat : result[i].saLatitude
    					});
    				}
                    _this._showMarker2Map();
                    _this._setLayerVisible();
                }
            },
            error: function (resobj) {
                fadingTip("服务器端异常，查询WIFI信息失败!");
            }
        });
    },
    _showMarker2Map : function(){
		var _this = this;
		var addrs = _this.allAddrMap.values();
		var arr = [];
		window.gisInteraction.clearFeatures(_this.mgqyMarkerLayer+"_circle");
		for(var i=0;i<addrs.length;i++){
			arr.push({
				id : addrs[i].id,
				name : addrs[i].name,
				lon : addrs[i].lon*1,
				lat : addrs[i].lat*1,
				img : 'resource/scienceLayout/images/layerIco/mgqy/warn.png',
				att : addrs[i]
			});
			window.gisInteraction.addCircle2Map(_this.mgqyMarkerLayer+"_circle",{
				pnt : [addrs[i].lon*1,addrs[i].lat*1],
				radius : addrs[i].distance*1,
				lineWidth : 1,
				fillColor : 'rgba(234,61,69,0.5)'
			});
		}
		window.gisInteraction.clearMarkers(_this.mgqyMarkerLayer);
		window.gisInteraction.addMarkers(_this.mgqyMarkerLayer, arr, function(attList){
			if (!attList || attList.length < 1){
            	return;
            }
			_this.showPopMakersOnMap(attList[0]);
		});
	},
	showPopMakersOnMap : function(obj){
		var html='<div mark="mgqyMakerPop">';
		html+='<div class="NPopUpBox02" style="width:300px;">';
		html+='    <div class="GPUHeader">'+obj.name+'</div>';
		html+='    <a href="javascript:void(0);" class="NPopUpClose02"></a>';
		html+='    <div class="NPUTwoContent">';
		html+='        <div class="GPUInnerBox">';
		html+='        		<div class="GPUInnerBox_Border">';
		html+=' 				<div class="GStaffDetailsBox">';
		html+='   					<div class="GStaffDetails">';
		html+='        					<div class="GStaffDetailsTitle" style="text-align:right;">距离范围：</div>';
		html+='       					<div class="GStaffDetails_r">'+obj.distance+'m&nbsp;</div>';
		html+='       	 				<div class="clear"></div>';
		html+='    					</div>';
		html+='    				</div>';
		html+='            		<div class="GPUInnerBox_Line01"></div>';
		html+='            		<div class="GPUInnerBox_Line02"></div>';
		html+='             </div>';
		html+='        </div>';
		html+='    </div>';
		html+='    <div class="NPopUpBox02_line01"></div>';
		html+='    <div class="NPopUpBox02_line02"></div>';
		html+='    <div class="NPopUpBox02_j01"></div>';
		html+='    <div class="NPopUpBox02_j02"></div>';
		html+='    <div class="NPopUpBox02_j03"></div>';
		html+='    <div class="NPopUpBox02_j04"></div>';
		html+='    <div class="NPopUpBox02_j05"></div>';
		html+='    <div class="NPopUpBox02_j06"></div>';
		html+='</div>';
		html+='</div>';
		window.gisInteraction.clearPopup();
	    window.gisInteraction.showTwinkle(obj.id, obj.lon*1, obj.lat*1, 2);
	    window.gisInteraction.showPopup(obj.id, obj.lon, obj.lat, html, false);
	    $("div[mark='mgqyMakerPop'] .NPopUpClose02").unbind("click").bind("click",function(e){
	    	$("div[mark='mgqyMakerPop']").replaceWith("");
	    });
	},
    _setLayerVisible: function () {
        var _this = this;
        if (!_this.layerVisible) {
            return;
        }
        var zoom = _this.map.getView().getZoom();
        if (zoom >= 12) {
        	_this._showMarker2Map();
            window.gisInteraction.setLayerVisible(_this.mgqyMarkerLayer, true);
        } else {
        	window.gisInteraction.clearFeatures(_this.mgqyMarkerLayer+"_circle");
            window.gisInteraction.setLayerVisible(_this.mgqyMarkerLayer, false);
        }
    },
    bindListEvents : function(){
    	var _this = this;
    	$(".wifiItemTitle").unbind("click").bind("click",function(){
    		var id = $(this).attr("id");
    		_this.showMarkLayerByPopId(id);
    	});
    },
    CLASS_NAME: "MgqyAreaLayerControl"
};