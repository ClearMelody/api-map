//@ sourceURL=SpecialSiteControl.js
var SpecialSiteControl = function () {
    this.init.apply(this, arguments);
};

SpecialSiteControl.prototype = {
    _specialSiteControl : null,
    baseMapLayerControl : null,
    popupId : null,
    pointArr : [],
	curOPJQObject : null,
	curReLocationId : '',
	isQuery : false,//避免重复查询
    layerMark : "specialSitePoint",
    init: function (map,isFaceLayer) {
		var url = 'querySpecialSiteInMap.do?time=' + new Date();
		if (window.getMapDataParam) {
			url += window.getMapDataParam();
		}
        _specialSiteControl = this;
        _specialSiteControl.baseMapLayerControl=new BaseMapLayerControl({
            map : map,
            layerMark : _specialSiteControl.layerMark,
            layerName : "特种场所",
            setLayerVisibleZoom : 10,
            layerVisible : true,
            url : url,
            getSingleLayerMarker : _specialSiteControl.getSingleLayerMarker,
            getClusterLayerMarker : _specialSiteControl.getClusterLayerMarker,
            clusterLayerClick : _specialSiteControl.clusterLayerClick,
            singleLayerClick : _specialSiteControl.singleLayerClick,
            singleLayerDblClick : _specialSiteControl.singleLayerDblClick
        });
    },
    //1.必须方法之单个点图层双击事件
    singleLayerDblClick : function(arr){
    	return;
    },
    //2.必须方法之单个点图层单击事件
    singleLayerClick : function(arr){
    	var item = arr[0];
		_specialSiteControl._showMarkerPopup(item);
    },
    //3.必须方法之聚合图层单击事件,列表内容小于20
    clusterLayerClick : function(coordinate,features){
		_specialSiteControl.pointArr=features;
		_specialSiteControl.showItemListClusterPopup(features);
    },
    //4.必须方法之获得聚合图层对象
    getClusterLayerMarker : function(obj,arr){
		var number = arr.size;
    	return {
            id: Math.random()+"",
            name: Math.random()+"",
            lon: obj.lon,
            lat: obj.lat,
            img: 'resource/images/m4.png',
            att: obj,
            clusterSize :obj.size
        };
    },
    //5.必须方法之获得单个点图层对象
    getSingleLayerMarker : function(item){
		var maker = {
            id: item.id,
			type : item.type,
            chargeName: item.chargeName,
			chargePhone : item.chargePhone,
			businessState : item.businessState,
			gxdwdm : item.gxdwdm,
			addressDetail : item.addressDetail,
            lon: item.lon * 1.0,
            lat: item.lat * 1.0,
            img: _specialSiteControl.getTzcsIcon(),
			att : item
        };
        return maker;
    },
    //6.必须方法之显示图层,固定写法
    showLayer : function(visible){
        _specialSiteControl.baseMapLayerControl.showLayer(_specialSiteControl.layerMark,visible);
    },
    //7.必须方法之设置图层的显示与隐藏,固定写法
    _setLayerVisible: function () {
        _specialSiteControl.baseMapLayerControl._setLayerVisible(_specialSiteControl.layerMark);
    },
	
	_queryAllRecordList : function () {
		var _this = this;
		window.gisInteraction.clearPopup();
		var options = _this.baseMapLayerControl.optionsMap.get(_this.layerMark);
		var url = 'querySpecialSiteInMap.do?time=' + new Date();
		if (window.getMapDataParam) {
			url += window.getMapDataParam();
		}
		options.url = url;
		_this.baseMapLayerControl.showPointsOnMap(options);
	},
	
	showItemListClusterPopup :function(attList){
    	var _this = this;
    	$("#clusterPopUps").draggable({
			  handle : ".GPUHeader02"
		});
    	 var html =_this.getClusterPopUpHtml(attList);
    	 window.gisInteraction.clearPopup();
    	 var id = "tzcs_" + attList[0].jjdbh;
         var lon = attList[0].lon * 1.0;
         var lat = attList[0].lat * 1.0;
    	 window.gisInteraction.showPopup(id, lon, lat, html, false);
    	 window.gisInteraction.setCenterLeft(lon,lat);
    	 _this.binClusterEven();
    },
    getClusterPopUpHtml : function(attList){
    	var _this = this;
    	var resambleHtml = "";
    	resambleHtml+=' <div class="NPopUpBox02" style="width:350px;" id="clusterPopUps">';
        resambleHtml+='<a href="javascript:void(0);" class="NPopUpClose02"></a>';
        resambleHtml+=' <div class="NPUTwoContent">';
        resambleHtml+='<div class="GPUHeader02"><h1>特种场所聚合列表</h1></div>';
        resambleHtml+='   <div class="GPUInnerBox">';
        resambleHtml+='   	<div class="GPUInnerBox_Border">';
        resambleHtml+='       	<div class="GkkListBox" style="height:200px;" id="clusterPopUpContents">';
    	$.each(attList,function(i,item){
    		 var imgSrc = _specialSiteControl.getTzcsIcon();
    		 resambleHtml+='<a href="javascript:void(0);" class="GkkListNav" id="'+item.id+'" style="height:42px;line-height:30px;"> ';
             resambleHtml+='    <img src="'+imgSrc+'" width="29" height="42" style="margin-top: -3px;"/>';
             resambleHtml+='    <span style="margin-left:5px;" title="' +item.siteName + '"  rn ="'+item.rn+'" id="'+item.id+'" type="'+item.type+'" lon="'+item.longitude+'"  lat="'+item.latitude+'" ';
             resambleHtml+='       >'+item.siteName+'</span> ';
             resambleHtml+='</a>';
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
	
    binClusterEven : function(){
    	var _this = this;
    	$("#clusterPopUpContents a").bind('click',function(){
    		var id = $(this).attr("id");
    		_this._showMarkerPopupById(id);
    	})
    	
    	$("#clusterPopUps .NPopUpClose02").bind('click',function(){
    		$("#clusterPopUps").hide();
    	})
    },
	
	_showMarkerPopupById : function(id) {
		var _this = this;
		var obj = null;
    	$.each(_this.pointArr,function(i,item){
    		if(item.id||item.id == id){
    			obj = item;
    			return true;
    		}
    	});
		_this._showMarkerPopup(obj);
	},
	
	_showMarkerPopup: function (item) {
        var _this = this;
    	
        _this.curOPJQObject = item;
		var html =_this._getJqMarkerPopupHtmlTemplate(item);
		
		var id = "tzcs_" + item.id;
		var lon = item.lon * 1.0;
		var lat = item.lat * 1.0;
		
		window.gisInteraction.clearPopup(id);
		var currentZoom = window.map.getView().getZoom();
		var maxZoom =  top.window.getMapMaxZoom();
		if (currentZoom < maxZoom-3) {
			window.gisInteraction.setZoom(maxZoom-3);
		}
		window.gisInteraction.showPopup(id, lon, lat, html, false);
		window.gisInteraction.setCenterLeft(lon,lat);
    },
	
	/**
	 * 获取警情弹框html模板
	 * @param {Object} jcjb
	 */
     _getJqMarkerPopupHtmlTemplate: function (item) {
	 	var _this = this;
		var html = '  	<div class="NPopUpBox02" id="jqMarkerHtml" style="width:420px;">'
				  	     + '   <a href="javascript:void(0);" class="NPopUpClose02" id="btnCloseJQPopup" onclick="top.window.gisInteraction.clearPopup();"></a>'
				  	     + '   <div class="NPUTwoContent">'
				  	     + '   	<div class="GSDHeader" title="%siteName">&nbsp;&nbsp;&nbsp;&nbsp;%siteName</div>'
				  	     + '       <div class="GPUInnerBox">'
				  	     + '       	<div class="GPUInnerBox_Border">'
				  	     + '               <div class="GStaffDetailsBox">'
				  	     + '                   <div class="GStaffDetails">'
				  	     + '                       <div class="GStaffDetailsTitle">场所类型：</div>'
				  	     + '                       <div class="GStaffDetails_r">%type</div>'
				  	     + '                       <div class="clear"></div>'
				  	     + '                  </div>'
				  	     + '                   <div class="GStaffDetails">'
				  	     + '                       <div class="GStaffDetailsTitle">负责人：</div>'
				  	     + '                       <div class="GStaffDetails_r">%chargeName</div>'
				  	     + '                       <div class="clear"></div>'
				  	     + '                   </div>'
				  	     + '                   <div class="GStaffDetails">'
				  	     + '                       <div class="GStaffDetailsTitle">联系方式：</div>'
				  	     + '                       <div class="GStaffDetails_r">%chargePhone</div>'
				  	     + '                       <div class="clear"></div>'
				  	     + '                   </div>'
						 + '                   <div class="GStaffDetails">'
				  	     + '                       <div class="GStaffDetailsTitle">营业状态：</div>'
				  	     + '                       <div class="GStaffDetails_r">%businessState</div>'
				  	     + '                       <div class="clear"></div>'
				  	     + '                   </div>'
						 + '                   <div class="GStaffDetails">'
				  	     + '                       <div class="GStaffDetailsTitle">管辖单位：</div>'
				  	     + '                       <div class="GStaffDetails_r">%gxdwdm</div>'
				  	     + '                       <div class="clear"></div>'
				  	     + '                   </div>'
						 + '                   <div class="GStaffDetails">'
				  	     + '                       <div class="GStaffDetailsTitle">地址：</div>'
				  	     + '                       <div class="GStaffDetails_r">%addressDetail</div>'
				  	     + '                       <div class="clear"></div>'
				  	     + '                   </div>'
				  	     + '               </div>'
				  	     + '           	<div class="GPUInnerBox_Line01"></div>'
				  	     + '           	<div class="GPUInnerBox_Line02"></div>'
				  	     + '           </div>'
				  	     + '       </div>'
				  	     + '       <div class="GPUBtnBox01" style="height:30px;">'
				  	     + '           <div class="GPUBtnBox02">'
				  	     + '				<a href="javascript:void(0);" class="GPUBtn01" aliasid="expandDetailBtn" onclick="window.toAddSpecialSite(\'%id\')" style="cursor:pointer;margin-top:4px;" hidefocus="true">&nbsp;编辑</a>'
				  		 + '				<a href="javascript:void(0);" class="GPUBtn01" aliasid="expandDetailBtn" onclick="window.toAddSpecialSite(\'%id\',\'1\')" style="cursor:pointer;margin-top:4px;" hidefocus="true">&nbsp;详情</a>'
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
				  	     + '</div>';
        html = html.replace(/%id/g, dealWithParam(item.id));
		html = html.replace(/%siteName/g, dealWithParam(item.siteName));
		html = html.replace(/%type/g, _this.getSiteType(item.type));
		html = html.replace(/%chargeName/g, dealWithParam(item.chargeName));
		html = html.replace(/%chargePhone/g, dealWithParam(item.chargePhone));
		html = html.replace(/%businessState/g, dealWithParam(item.businessState));
		html = html.replace(/%gxdwdm/g, dealWithParam(item.gxdwdm));
		html = html.replace(/%addressDetail/g, dealWithParam(item.addressDetail));
		html = html.replace(/%longitude/g, dealWithParam(item.lon));
		html = html.replace(/%latitude/g, dealWithParam(item.lat));
		html = html.replace(/%createTime/g, getDateString(item.createTime).nowTime);
		return html;
	},
	
	/**
	 * 获取场所类型
	 * @param {Object} type
	 */
	getSiteType : function(type) {
		var typeName = '';
		switch (type) {
			case '1' :
				typeName = '典当行';
				break;
			case '2' :
				typeName = '旅馆';
				break;
			case '3' :
				typeName = '游艺场所';
				break;
			case '4' :
				typeName = '印章业';
				break;
			case '5' :
				typeName = '洗浴业';
				break;
			case '6' :
				typeName = '歌舞娱乐';
				break;
			default :
				break;
		}
		return typeName;
	},
	
    updateSiteLocation : function(coordinate){
		var _this = this;
		if (!dealWithParam(_this.curReLocationId) || !dealWithParam(coordinate) || !dealWithParam(coordinate[0]) ||!dealWithParam(coordinate[1])) {
			fadingTip("特种场所定位失败。");
			top.clickType = null;
		}
	    coordinate = _prjFuns.map_to_gps84(coordinate[0], coordinate[1]);
		var url = "updateTzcsLocation.do?time="+new Date().getTime();
		var data = "id="+_this.curReLocationId + "&lon=" + coordinate[0] + "&lat=" + coordinate[1];
		jQuery.ajax({
			type:'POST',
			url:url,
			cache:false,
			data:data,
			success:function(msg) {
				if(!msg) return;
				var rs = eval("(" + msg + ")");
				if(rs.errorCode == "0") {
					if(window.gisInteraction.existMarkerForLayer(_this.layerMark+'SingleLayer',_this.curReLocationId)){
						window.gisInteraction.updateMarkerPosition(_this.layerMark+'SingleLayer',_this.curReLocationId,coordinate);
						$('div[mark="typeDataItemDiv"][siteId="'+_this.curReLocationId+'"]').attr('lon', coordinate[0]).attr('lat', coordinate[1]);
					} else if (_this.curOPJQObject) {
						_this.curOPJQObject.lon = coordinate[0];
						_this.curOPJQObject.lat = coordinate[1];
						_this._addMarker(_this.curOPJQObject);
						$('div[mark="typeDataItemDiv"][siteId="'+_this.curReLocationId+'"]').attr('lon', coordinate[0]).attr('lat', coordinate[1]);
					} else {
						_this._queryAllRecordList();
					}
					if (window.refreshDataMap) {
						window.refreshDataMap(siteId, coordinate[0], coordinate[1]);
					}
					fadingTip("特种场所定位成功。");
					top.clickType = null;
					top.window.isRelocate = false;
				}else {
					fadingTip("特种场所定位失败。");
				}
			}
		});
    },
	
	getCurOPObject : function(id){
    	
    },
	
     showLocationLonlatHtml : function(id, submitFunc){
		var html = "";
		html+='<link rel="stylesheet" type="text/css" href="resource/scienceLayout/css/PopUp.css"/>'
		html+='	<div class="ClarityBg">'
		html+='		<div class="PUBox02" style="left:50px; margin-top:50px;">'
		html+='            <a mark="closeBtn" href="javascript:void(0);" class="PUClose02"></a>'
		html+='            <div>'
		html+='					<div class="PUBoxTwoTitle">提示信息</div>'
		html+='            		<div class="PUBoxTwoContent">'
		html+='                		<div class="PUBoxTwoContent_Border">'
		html+='                			<div class="PUTipBox">'
		html+='                			    <p class="PUTipImg"><img src="resource/scienceLayout/images/PopUp_New/TipIcon.png" width="58" height="58"></p>'
		html+='                    			<p class="PUTipText">该警情暂无坐标,是否进行定位?</p>'
		html+='                    		</div>'
		html+='                			<div class="PUBoxTwoContent_Line01"></div>'
		html+='                			<div class="PUBoxTwoContent_Line02"></div>'
		html+='                		</div>        '
		html+='            		</div>'
		html+='            		<div class="PUBox02_BtnBox" style="left:96px;">'
		html+='                 <div class="PUTwoBtnBox">'
		html+='                    <a mark="okBtn" href="javascript:void(0);" class="PUTwoBtn01">确定</a>'
		html+='                    <a mark="cancelBtn" href="javascript:void(0);" class="PUTwoBtn03">取消</a>'
		html+='                </div>'
		html+='                <div class="PUBox02_BtnBoxBg01"></div>'
		html+='                <div class="PUBox02_BtnBoxBg02"></div>'
		html+='                <div class="PUBox02_BtnBoxBg03"></div>'
		html+='            </div>'
		html+='			</div>'
		html+='            <div class="PUBox02_line01"></div>'
		html+='            <div class="PUBox02_line02"></div>'
		html+='            <div class="PUBox02_j01"></div>'
		html+='            <div class="PUBox02_j02"></div>'
		html+='            <div class="PUBox02_j03"></div>'
		html+='            <div class="PUBox02_j04"></div>'
		html+='            <div class="PUBox02_j05"></div>'
		html+='            <div class="PUBox02_j06"></div>'
		html+='            <div class="PUBox02_j07"></div>'
		html+='            <div class="PUBox02_j08"></div>'
		html+='        </div>'
		html+='	</div>'
		var $ele = $(id);
		$ele.html(html);
		var height = ($(window).height() - 300) / 2;
		var width = ($(window).width() - 400) / 2;
		$ele.css("left",width);
		$ele.css("top",height);
		$ele.show();
		$ele.find('a[mark="closeBtn"]').on('click', function (e) {
			$ele.hide();
		});
		$ele.find('a[mark="cancelBtn"]').on('click', function (e) {
			$ele.hide();
		});
		$ele.find('a[mark="okBtn"]').on('click', function (e) {
			$ele.hide();
			submitFunc();
		});
	},
	
	_addMarker : function(item){
    	var _this = this;
        if (!item.lon || !item.lat) {
            return [];
        }
        var maker = {
            id: item.id,
            name: item.siteName,
            lon: item.lon * 1.0,
            lat: item.lat * 1.0,
            att: item,
            overlayId : 'TZCS_'+ item.jjdbh,
            weight: 1.0,
            img:  _specialSiteControl.getTzcsIcon()
        };
        //解决fhgis定位异常问题
        window.gisInteraction.addMarker(_this.layerMark+'SingleLayer', maker, function (attList) {
        	window.gisInteraction.addMarker(_this.layerMark+'SingleLayer', maker, function (attList) {
        		//点击显示气泡
        		if (!attList || attList.length < 1)
        			return;
        		_this._showMarkerPopup(attList[0]);
        	}, function (attList) {
        		//双击
        	});
        });
    },
	
	getTzcsIcon : function () {
		return 'resource/scienceLayout/images/layerIco/tzcs/tzcs.png';
	},
	
	
    CLASS_NAME: "SpecialSiteControl"
};


