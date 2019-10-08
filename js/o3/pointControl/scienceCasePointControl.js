//@ sourceURL=scienceCasePointControl.js
var caseLayerControl = function () {
    this.init.apply(this, arguments);
};

caseLayerControl.prototype = {
    _caseLayerControl : null,
    baseMapLayerControl : null,
    popupId : null,
    pointArr : [],
	curOPCaseObject : null,
	curReLocationCaseId: '',
	isQuery : false,//避免重复查询
    layerMark : "casePoint",
    init: function (map,isFaceLayer) {
		var url = 'queryCaseList.do?time=' + new Date();
		if (top.window.getCaseQueryParam) {
			url += top.window.getCaseQueryParam();
		}
        _caseLayerControl = this;
        _caseLayerControl.baseMapLayerControl=new BaseMapLayerControl({
            map : map,
            layerMark : _caseLayerControl.layerMark,
            layerName : "案件",
            setLayerVisibleZoom : 10,
            layerVisible : true,
            url : url,
            getSingleLayerMarker : _caseLayerControl.getSingleLayerMarker,
            getClusterLayerMarker : _caseLayerControl.getClusterLayerMarker,
            clusterLayerClick : _caseLayerControl.clusterLayerClick,
            singleLayerClick : _caseLayerControl.singleLayerClick,
            singleLayerDblClick : _caseLayerControl.singleLayerDblClick
        });
    },
    //1.必须方法之单个点图层双击事件
    singleLayerDblClick : function(arr){
    	return;
    },
    //2.必须方法之单个点图层单击事件
    singleLayerClick : function(arr){
    	var item=arr[0];
		_caseLayerControl._showMarkerPopup(item.caseId);
    },
    //3.必须方法之聚合图层单击事件,列表内容小于20
    clusterLayerClick : function(coordinate,features){
		_caseLayerControl.pointArr=features;
		_caseLayerControl.showItemListClusterPopup(features);
    },
    //4.必须方法之获得聚合图层对象
    getClusterLayerMarker : function(obj,arr){
		var number = arr.size;
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
    getSingleLayerMarker : function(item){
		var maker = {
            id: item.caseId,
			caseId: item.caseId,
            name: item.casename,
            lon: item.longitude * 1.0,
            lat: item.latitude * 1.0,
            img: top.window.getCaseImgIcon(item),
			att : item
        };
        return maker;
    },
    //6.必须方法之显示图层,固定写法
    showLayer : function(visible){
        _caseLayerControl.baseMapLayerControl.showLayer(_caseLayerControl.layerMark,visible);
    },
    //7.必须方法之设置图层的显示与隐藏,固定写法
    _setLayerVisible: function () {
        _caseLayerControl.baseMapLayerControl._setLayerVisible(_caseLayerControl.layerMark);
    },
	
	_queryAllRecordList : function () {
		var _this = this;
		var options = _this.baseMapLayerControl.optionsMap.get(_this.layerMark);
		var url = 'queryCaseList.do?time=' + new Date();
		if (top.window.getCaseQueryParam) {
			url += top.window.getCaseQueryParam();
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
    	 var id = "case_" + attList[0].caseId;
         var lon = attList[0].longitude * 1.0;
         var lat = attList[0].latitude * 1.0;
    	 window.gisInteraction.showPopup(id, lon, lat, html, false);
    	 window.gisInteraction.setCenterLeft(lon,lat);
    	 window.gisInteraction.showTwinkle(id,lon,lat,2);
    	 _this.binClusterEven();
    },
    getClusterPopUpHtml : function(attList){
    	var _this = this;
    	var resambleHtml = "";
    	resambleHtml+=' <div class="NPopUpBox02" style="width:350px;" id="clusterPopUps">';
        resambleHtml+='<a href="javascript:void(0);" class="NPopUpClose02"></a>';
        resambleHtml+=' <div class="NPUTwoContent">';
        resambleHtml+='<div class="GPUHeader02"><h1>案件聚合列表</h1></div>';
        resambleHtml+='   <div class="GPUInnerBox">';
        resambleHtml+='   	<div class="GPUInnerBox_Border">';
        resambleHtml+='       	<div class="GkkListBox" style="height:200px;" id="clusterPopUpContents">';
    	$.each(attList,function(i,item){
    		 var imgSrc = top.window.getCaseImgIcon(item);
    		 resambleHtml+='<a href="javascript:void(0);" class="GkkListNav" caseId="'+item.caseId+'" style="height:42px;line-height:30px;"> ';
             resambleHtml+='    <img src="'+imgSrc+'" width="29" height="42" style="margin-top: -3px;"/>';
             resambleHtml+='    <span style="margin-left:5px;" title="' +item.casename + '"  rn ="'+item.rn+'" caseId="'+item.caseId+'" afdd="'+item.afdd+'"  casename="'+item.casename+'" lon="'+item.longitude+'"  lat="'+item.latitude+'" ';
             resambleHtml+='       >'+item.casename+'</span> ';
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
    		var caseId= $(this).attr("caseId");
    		_this._showMarkerPopup(caseId);
    	})
    	
    	$("#clusterPopUps .NPopUpClose02").bind('click',function(){
    		$("#clusterPopUps").hide();
    	})
    },
	
	_showMarkerPopup: function (caseId) {
        var _this = this;
    	
        //查看该案件是否被受理
    	$.ajax({
    		url : 'queryCaseDetailByCaseId.do?caseId='+caseId,
    		success:function(res){
    		   res = eval("("+res+")");
    		   if (!res.detail || !res.detail.caseVO) {
			   		return;
			   }
    		   var hcStatu = res.hcStatu;
			   var caseVO = res.detail.caseVO
			   caseVO.hcStatu = hcStatu;
			   _this.curOPCaseObject = caseVO;
    		   var html =_this._getCaseMarkerPopupHtmlTemplate(caseVO);
    	        
    	        var id = "case_" + caseVO.caseId;
    	        var lon = caseVO.caseLongitude * 1.0;
    	        var lat = caseVO.caseLatitude * 1.0;
				
				if (!dealWithParam(lon) || !dealWithParam(lat)) {
					fadingTip('该案件暂无经纬度');
					return;
				}
	            
    	        window.gisInteraction.clearPopup(id);
				var currentZoom = window.map.getView().getZoom();
    	        var maxZoom =  top.window.getMapMaxZoom();
				if (currentZoom < maxZoom-3) {
					window.gisInteraction.setZoom(maxZoom-3);
				}
    	        window.gisInteraction.showPopup(id, lon, lat, html, false);
    	        window.gisInteraction.setCenterLeft(lon,lat);
    	        window.gisInteraction.showTwinkle(id,lon,lat,2);
    		}
    	});
    },
	
	/**
	 * 获取案件弹框html模板
	 * @param {Object} caseVO
	 */
     _getCaseMarkerPopupHtmlTemplate: function (caseVO) {
		var html = '  	<div class="NPopUpBox02" id="caseMarkerHtml" style="width:425px;">'
				  	     + '   <a href="javascript:void(0);" class="NPopUpClose02" id="btnCloseCasePopup" onclick="top.window.gisInteraction.clearPopup();"></a>'
				  	     + '   <div class="NPUTwoContent">'
				  	     + '   	<div class="GSDHeader" title="%casename">&nbsp;&nbsp;&nbsp;&nbsp;%casename</div>'
				  	     + '       <div class="GPUInnerBox">'
				  	     + '       	<div class="GPUInnerBox_Border">'
				  	     + '               <div class="GStaffDetailsBox">'
				  	     + '                   <div class="GStaffDetails">'
				  	     + '                       <div class="GStaffDetailsTitle">案件类别：</div>'
				  	     + '                       <div class="GStaffDetails_r">%leibie</div>'
				  	     + '                       <div class="clear"></div>'
				  	     + '                  </div>'
						 + '                   <div class="GStaffDetails">'
				  	     + '                       <div class="GStaffDetailsTitle">案件编号：</div>'
				  	     + '                       <div class="GStaffDetails_r">%caseCode</div>'
				  	     + '                       <div class="clear"></div>'
				  	     + '                  </div>'
						 + '                   <div class="GStaffDetails">'
				  	     + '                       <div class="GStaffDetailsTitle">发现时间：</div>'
				  	     + '                       <div class="GStaffDetails_r">%recordTime</div>'
				  	     + '                       <div class="clear"></div>'
				  	     + '                  </div>'
				  	     + '                   <div class="GStaffDetails">'
				  	     + '                       <div class="GStaffDetailsTitle">案发地址：</div>'
				  	     + '                       <div class="GStaffDetails_r" title="%happenAddr">%happenAddr</div>'
				  	     + '                       <div class="clear"></div>'
				  	     + '                   </div>'
				  	     + '                   <div class="GStaffDetails">'
				  	     + '                       <div class="GStaffDetailsTitle">简要案情：</div>'
				  	     + '                       <div class="GStaffDetails_r" title="%simpleCaseCondition">%simpleCaseCondition</div>'
				  	     + '                       <div class="clear"></div>'
				  	     + '                   </div>'
				  	     + '               </div>'
				  	     + '           	<div class="GPUInnerBox_Line01"></div>'
				  	     + '           	<div class="GPUInnerBox_Line02"></div>'
				  	     + '           </div>'
				  	     + '       </div>'
				  	     + '       <div class="GPUBtnBox01" style="height:85px;">'
				  	     + '           <div class="GPUBtnBox02">'
				  	     + '				<a href="javascript:void(0);" class="GPUBtn01" aliasid="expandDetailBtn" onclick="parent.window.openCaseDetailForMap(\'%caseId\')" style="cursor:pointer;margin-top:4px;" hidefocus="true">&nbsp;研判进展</a>'
						 + ' 				<a href="javascript:void(0);" class="GPUBtn01" caseId="%caseId" style="cursor:pointer;margin-top:4px;"  onclick="top.updateCaseLocation(this)" hidefocus="true">&nbsp;二次定位</a>'
						 + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="fqyp" style="cursor:pointer;margin-top:4px;display:%showTqhc" onclick="parent.window.toTqhc(\'%caseId\',%hcStatu)"  hidefocus="true">%tqhcNR</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="relativeCase"  onclick="top.caseMerge(\'%caseId\')" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;相似案件</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="videoRecommend"  onclick="top.videoRecommend(\'%longitude\',\'%latitude\',\'%recordTime\')" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;视频推荐</a>'
//				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="carRecommend"  onclick="top.carRecommend(\'%longitude\',\'%latitude\',\'%recordTime\')" style="cursor:pointer;margin-top:4px;display:none;"  hidefocus="true">&nbsp;嫌疑车辆推荐</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="ddmp" onclick="top.toSinglePointScreen(\'%caseId\',\'%recordTime\')" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;单点摸排</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="ddpz" onclick="top.toMultiPointScreen(\'%caseId\',\'%recordTime\')" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;多点碰撞</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="carRecommend"  onclick="parent.window.toElecFence(\'%caseId\',\'%recordTime\',\'%longitude\',\'%latitude\')" style="cursor:pointer;margin-top:4px;display:%showXyrtj;"  hidefocus="true">&nbsp;嫌疑人筛选</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="caseRefFocalMan" onclick="top.showCaseRefFocalManUI(\'%longitude\',\'%latitude\',\'ZDRY_%caseId\',\'%recordTime\')" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;重点人员筛查</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="zysc" onclick="_caseLayerControl.toResourceUpload(\'%caseId\')" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;资源上传</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="kshyp" onclick="_caseLayerControl.toCaseGuijiDlg(\'%caseId\')" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;可视化研判</a>'
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
        html = html.replace(/%casename/g, dealWithParam(caseVO.casename));
		html = html.replace(/%caseId/g, dealWithParam(caseVO.caseId));
		html = html.replace(/%caseCode/g, dealWithParam(caseVO.caseCode));
		html = html.replace(/%recordTime/g, getDateString(caseVO.recordTime).nowTime);
		html = html.replace(/%happenAddr/g, dealWithParam(caseVO.happenAddr));
		html = html.replace(/%simpleCaseCondition/g, dealWithParam(caseVO.simpleCaseCondition));
		if (dealWithParam(caseVO.leibie) && top.window.coreleibieMap && top.window.coreleibieMap.containsKey(caseVO.leibie)) {
			html = html.replace(/%leibie/g, top.window.coreleibieMap.get(caseVO.leibie));
		} else {
			html = html.replace(/%leibie/g, '');
		}
		html = html.replace(/%longitude/g, dealWithParam(caseVO.caseLongitude));
		html = html.replace(/%latitude/g, dealWithParam(caseVO.caseLatitude));
		html = html.replace(/%hcStatu/g, dealWithParam(caseVO.hcStatu));
		if (caseVO.hcStatu == 0) {
		   html = html.replace(/%tqhcNR/g, "提请合成");
		   html = html.replace(/%showTqhc/g, "block");
		} else if (caseVO.hcStatu == 2) {
		       html = html.replace(/%tqhcNR/g, "还原合成");
		       html = html.replace(/%showTqhc/g, "block");
		} else {
		   html = html.replace(/%showTqhc/g, "none");
		}
		if (window.xyrtjRight) {
			html = html.replace(/%showXyrtj/g, "block");
		} else {
			html = html.replace(/%showXyrtj/g, "none");
		}

		return html;
	},
	refreshCaseGuiji : function(caseId){
		caseGuijiOnCaseMap.queryCaseGuijiDatas(false, caseId);
	},
	toResourceUpload : function(caseId){
		window.gisInteraction.getPointForResetPosition(function(coordinate){
			var url = 'toUploadResourceDlgForBS.do?fileDes=jqResource'+'&caseId='+caseId+'&lon='+coordinate[0]+'&lat='+coordinate[1];
			top.uploadResourceDlg = jQuery.fn.scienceDialog({
				url : url,
			    zIndex : 99,
				width:'860',
				height:'568',
				close: function() {
					top.uploadResourceDlg = null;
					_caseLayerControl.refreshCaseGuiji(caseId);
				}
			});
		})
	},
	toCaseGuijiDlg : function(caseId){
		top.window.caseGuijiDlg = jQuery.fn.scienceDialog({
		    url : 'caseGuijiOnMap.do?objId='+caseId+"&type=aj",
		    zIndex : 999,
			width:'auto',
			height:'auto',
			lockMask:true,
		    close:function(){
	           top.window.caseGuijiDlg = null;
	       }
		});
	},
	openPopWin : function(caseId){
    	var _this = this;
        if (!dealWithParam(caseId)) {
			return;
		}
        _this._showMarkerPopup(caseId);
    },
    updateCaseLocation : function(coordinate){
		var _this = this;
		if (!dealWithParam(_this.curReLocationCaseId)) {
			fadingTip("案件定位失败。");
			top.clickType = null;
		}
	    coordinate = _prjFuns.map_to_gps84(coordinate[0], coordinate[1]);
		var url = "updateCaseLocation.do?time="+new Date().getTime();
		var data = "caseId="+_this.curReLocationCaseId+ "&lon=" + coordinate[0] + "&lat=" + coordinate[1];
		jQuery.ajax({
			type:'POST',
			url:url,
			cache:false,
			data:data,
			success:function(msg) {
				if(!msg) return;
				var rs = eval("(" + msg + ")");
				if(rs.errorCode == "0") {
					if(window.gisInteraction.existMarkerForLayer(_this.layerMark+'SingleLayer',_this.curReLocationCaseId)){
						window.gisInteraction.updateMarkerPosition(_this.layerMark+'SingleLayer',_this.curReLocationCaseId,coordinate);
					}else{
						_this.curOPCaseObject.longitude = coordinate[0];
						_this.curOPCaseObject.latitude = coordinate[1];
						_this._addMarker(_this.curOPCaseObject);
					}
					fadingTip("案件定位成功。");
					top.clickType = null;
					top.window.isRelocate = false;
				}else {
					fadingTip("案件定位失败。");
				}
			}
		});
    },
	
	getCurOPObject : function(caseId){
    	
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
		html+='                    			<p class="PUTipText">该案件暂无坐标,是否进行定位?</p>'
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
        if (!item.longitude || !item.latitude) {
            return [];
        }
        var maker = {
            id: item.caseId,
            name: item.casename,
            lon: item.longitude * 1.0,
            lat: item.latitude * 1.0,
            att: item,
            overlayId : 'Case_'+ item.caseId,
            weight: 1.0,
            img:  top.window.getCaseImgIcon(item)
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
	
	
    CLASS_NAME: "caseLayerControl"
};


