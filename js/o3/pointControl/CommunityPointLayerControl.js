var CommunityPointLayerControl = function () {
    this.init.apply(this, arguments);
};
CommunityPointLayerControl.prototype = {
	map: null,
	popupId: null,
	fwMarkerLayer: "fwMarkerLayer",	
	layerVisible: true,
	fwLayerIcon : "resource/scienceLayout/images/layerIco/community/ld.png",
	init: function (map) {
		var _this = this;
        _this.map = map;
        if (!window.map) {
            window.map = map;
        }
        _markerLocalFuns.createMarkerLayer(_this.fwMarkerLayer);
        if(_this.map.getView().getZoom()==17){
        	_this.queryMphxxForGis(_this.map);
        }
        _this.map.getView().on('change:resolution', function () {
           _this._setLayerVisible();
        });
        _this.bindMapMoveEvent();
	},
	showLayer: function (visible) {
        var _this = this;
        _this.layerVisible = visible;
        window.gisInteraction.setLayerVisible(_this.fwMarkerLayer, visible);
        if (visible) {
            _this._setLayerVisible();
        }
    },
	_setLayerVisible: function () {
	    var _this = this;
	    if (!_this.layerVisible) {
	        return;
	    }
	    var zoom = _this.map.getView().getZoom();
	    if (zoom > 16) {
	    	_this.queryMphxxForGis(_this.map);
	    } else {
	        window.gisInteraction.setLayerVisible(_this.fwMarkerLayer, false);
	    }
	},
	bindMapMoveEvent : function(){
		var _this = this;
		_this.map.on('moveend',function(evt){
			_this.queryMphxxForGis(evt.map);
		});
	},
	
	queryMphxxForGis : function(map){
		var _this = this;
		if(map.getView().getZoom()>16){
			var extent =  window.gisInteraction.getBottomLeftAndTopRightPoint(map);//获取左下角和右上角坐标
			var param = {
				sLon : extent[0][0],
				sLat : extent[0][1],
				eLon : extent[1][0],
				eLat : extent[1][1]
			};
			var url = "queryComMphxxForGis.do";
			_this.sendAjax(url,param,function(data){
				if(data && data.resp && data.resp.response){
					var result = data.resp.response;
					_this._showBuildingMarker2Map(result);
					result = null;
				}
			});
		}
	},
	_showBuildingMarker2Map: function (arr) {
	    var _this = this;
	    var makerList = [];
	    _this.mlpDic = [];
	    for (var i = 0; i < arr.length; i++) {
	        var item = arr[i];
	        _this.mlpDic[item.MLPHBM] = item;
	        if (!item.X || !item.Y) {
	            continue;
	        }
	        var maker = {
	            id: item.MLPHBM,
	            name: item.MLPHXX,
	            img: _this.fwLayerIcon,
	            lon: item.X * 1.0,
	            lat: item.Y * 1.0,
	            att: item
	        };
	        makerList.push(maker);
	    }
	    //显示图标
	    window.gisInteraction.clearMarkers(_this.fwMarkerLayer);
	    window.gisInteraction.addClusterMarkers(_this.fwMarkerLayer, makerList, function (attList) {
	        //地图上点击时不居中不放大
	        if(attList.length==1){
		        top.window.isZoom = false;
	       		top.window.isCenter = false;
	       		_this.initConstructureInfo(attList[0]);
	        }else if (attList.length < 100) {
	        	_this._addClusterPointListPop(attList);
	        }
	    }, function (attList) {
	    });
	    window.gisInteraction.setLayerVisible(_this.fwMarkerLayer, true);
	},
	initConstructureInfo : function(item){
		var _this = this;
		var url = "queryFwjbxxByMlphbm.do?mlphbm="+item.MLPHBM;
		_this.showFwConstructurePop(item,_this.getFwLoadingContructureHtml(item.MLPHBM));
		_this.sendAjax(url,null,function(data){
			if(data && data.resp && data.resp.response){
				var result = data.resp.response;
				var html = '';
				if(result && result.length > 0){
					 html += _this.filterFwConstructure(result);
				}else{
					html += '<span style="padding:10px;display:inline-block;">无相关房屋信息！</span>';
				}
				$("#fw_content_"+item.MLPHBM).html(html);
				$("a[mark='fwInfo']").unbind("click").bind("click",function(){
					var fwid = $(this).attr("fwid");
					_this.openFwResidentInfoDlg(fwid);
				});
			}
		});
	},
	getFwLoadingContructureHtml : function(id){
		var html = '<div class="Track_Box" style="width:auto;min-width:100px;left:-86px;bottom:18px;padding:0px;">';
			html += '	 <a class="PSBClose01" id="btnCloseFwPopup" href="javascript:void(0);" style="z-index:0;"></a>';
			html += '	 <div class="FPLoading" style="padding-top:10px;padding-bottom:0px;" id="fw_content_'+id+'"><img src="./resource/scienceLayout/images/web/loading.gif" width="20" height="20"></div>';
			html += '	 <div class="PSBBubble_j01"></div>';
			html += '</div>';
			return html;
	},
	filterFwConstructure : function(result){
		var _this = this;
		var szcArr = new Array();
		for(var i=0;i<result.length;i++){
			var flag = false;
			for(var j=0;j<szcArr.length;j++){
				if(szcArr[j]==result[i].SZC){
					flag = true;break;
				}
			}
			if(!flag){
				szcArr.push(result[i].SZC);
			}
		}
		var maxSh = _this.getMaxShOfResult(result);
		var default_font_size = 18;
		if(maxSh<3){
			default_font_size = 12;
		}
		var html = '';
			html += '	 <div style="text-align:center;font-size:'+default_font_size+'px;">'+dealWithParam(result[0].JLHXX)+dealWithParam(result[0].MLPHXX)+'</div>';
			html += '	 <div style="padding:10px;max-height:300px;overflow:auto;width:'+(maxSh*80+20+1)+'px;">';
			html += '	 <div style="margin:2px;border-top:1px solid #73cfff;border-right:1px solid #73cfff;">'
		for(var i=szcArr.length-1;i>=0;i--){
			html += '<ul style="display:block;">';
			for(var j=0;j<result.length;j++){
				if(result[j].SZC == szcArr[i]){
					html += '<li style="background-color:'+_this.formatDictCode('jzlxColor',result[j].JZLX)+';float:left;width:80px;height:30px;line-height:30px;text-align:center;color:#fff;border-bottom:1px solid #73cfff;border-left:1px solid #73cfff;"><a href="javascript:void(0)" mark="fwInfo" fwid="'+result[j].FWBM+'" style="display:block;">'+_this.formatDictCode('jzlx',result[j].JZLX)+dealWithParam(result[j].FWMS)+'</a></li>';
				}
			}
			html += '<div class="clear"></div>';
			html += '</ul>';
		}
		html += '</div>';
		html += '</div>';
		return html;
	},
	getMaxShOfResult : function(result){
		var maxSh = 0;
		for(var i=0;i<result.length;i++){
			if(result[i].SH > 0){
				maxSh = result[i].SH;
			}
		}
		return maxSh;
	},
	showFwConstructurePop : function(item,html){
		var _this = this;
	    var id = "fw_" + item.MLPHBM;
	    var lon = item.X * 1.0;
	    var lat = item.Y * 1.0;
	    if (_this.popupId) {
	        window.gisInteraction.clearPopup(_this.popupId);
	    }
	    _this.popupId = id;
	    var maxZoom =  top.window.getMapMaxZoom();
	    window.gisInteraction.setZoom(maxZoom);
	    window.gisInteraction.showPopup(id, lon, lat, html, false);
	    window.gisInteraction.setCenterLeft(lon, lat);
	    window.gisInteraction.showTwinkle(id, lon*1, lat*1,2);
	    $("#btnCloseFwPopup").unbind("click").click(function () {
	        window.gisInteraction.clearPopup(_this.popupId);
	    });
	},
	_addClusterPointListPop :function  (attList, lon, lat) {
    	var _this = this;
    	if (!lon) {
    		lon = attList[0].X*1.0;
    	}
    	if (!lat) {
    		lat = attList[0].Y*1.0;
    	}
        var resambleHtml = '';
        resambleHtml+=' <div class="NPopUpBox02" style="width:350px;" id="clusterPopUp">';
        resambleHtml+='<a href="javascript:void(0);" class="NPopUpClose02" onclick="window.gisInteraction.clearPopup();"></a>';
        resambleHtml+=' <div class="NPUTwoContent">';
        resambleHtml+='<div class="GPUHeader02"><h1>房屋列表</h1></div>';
        resambleHtml+='   <div class="GPUInnerBox">';
        resambleHtml+='   	<div class="GPUInnerBox_Border">';
        resambleHtml+='       	<div class="GkkListBox" style="height:200px;" id="clusterPopUpContent">';
        for(var i=0;i<attList.length;i++){
            var tmpObj = attList[i];
            var id = tmpObj.MLPHBM;
            var name = dealWithParam(tmpObj.JLHXX) + dealWithParam(tmpObj.MLPHXX);
            var longitude = tmpObj.X * 1.0;
            var latitude = tmpObj.Y * 1.0;
            var markImgUrl = _this.fwLayerIcon;
            
            resambleHtml+='<a alias="fwItemTitle" id="'+id+'" lon="'+longitude+'" lat="'+latitude+'" href="javascript:void(0);" class="GkkListNav" style="height:30px;line-height:30px;"> ';
            resambleHtml+='    <img src="' + markImgUrl  + '" width="32" height="32" />';
            resambleHtml+='    <span style="margin-left:5px;" title="' + name + '" ';
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
    	$("a[alias='fwItemTitle']").unbind("click").bind("click",function(){
    		var _thisDom = $(this);
    		var id = $(this).attr("id");
    		var item = {
    			MLPHBM:_thisDom.attr("id"),
    			X:_thisDom.attr("lon"),
    			Y:_thisDom.attr("lat")
    		};
    		_this.initConstructureInfo(item);
    	});
    },
	openFwResidentInfoDlg : function(fwid){
		top.openFwResidentInfoDlg = jQuery.fn.scienceDialog({
			url : "toFwResidentInfoDetail.do?fwid="+fwid,
			zIndex : 999,
			width:'auto',
			height:'auto',
			top:0,
			close: function() {
				top.openFwResidentInfoDlg = null;
			}
		});
	},
	sendAjax : function(url,param,callback){
		$.ajax({
			url : url,
			data : param,
			cache: false,
	        async: true,
	        dataType : 'json',
	        success :　function(data){
	        	callback(data);
	        },
	        error:function(){
	        	fadingTip("服务端异常！");
	        }
		});
	},
	formatDictCode : function(type,code){
		if(type == "jzlx"){//居住类型
			switch(code){
				case "01" : return "租";break;
				case "02" : return "闲";break;
				case "03" : return "住";break;
				case "04" : return "集";break;
				case "05" : return "工";break;
				case "06" : return "虚";break;
				case "07" : return "公";break;
				case "09" : return "";break;
				default : return "";break;
			}
		}else if(type == "jzlxColor"){
			switch(code){
				case "01" : return "#afcc3d";break;
				case "02" : return "#494f60";break;
				case "03" : return "green";break;
				case "04" : return "#0784ea";break;
				case "05" : return "#1cdadc";break;
				case "06" : return "#251010";break;
				case "07" : return "#fe9108";break;
				case "09" : return "";break;
				default : return "";break;
			}
		}
	}
}