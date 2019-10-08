//@ sourceURL=scienceJQPointControl.js
var jqLayerControl = function () {
    this.init.apply(this, arguments);
};

jqLayerControl.prototype = {
    _jqLayerControl : null,
    baseMapLayerControl : null,
    popupId : null,
    pointArr : [],
	curOPJQObject : null,
	curReLocationJjdbh : '',
	isQuery : false,//避免重复查询
    layerMark : "jqPoint",
    init: function (map,isFaceLayer) {
		var url = 'queryJqList.do?time=' + new Date();
		if (top.window.getJqQueryParam) {
			url += top.window.getJqQueryParam();
		}
        _jqLayerControl = this;
        _jqLayerControl.baseMapLayerControl=new BaseMapLayerControl({
            map : map,
            layerMark : _jqLayerControl.layerMark,
            layerName : "警情",
            setLayerVisibleZoom : 10,
            layerVisible : true,
            url : url,
            getSingleLayerMarker : _jqLayerControl.getSingleLayerMarker,
            getClusterLayerMarker : _jqLayerControl.getClusterLayerMarker,
            clusterLayerClick : _jqLayerControl.clusterLayerClick,
            singleLayerClick : _jqLayerControl.singleLayerClick,
            singleLayerDblClick : _jqLayerControl.singleLayerDblClick
        });
    },
    //1.必须方法之单个点图层双击事件
    singleLayerDblClick : function(arr){
    	return;
    },
    //2.必须方法之单个点图层单击事件
    singleLayerClick : function(arr){
    	var item=arr[0];
		_jqLayerControl._showMarkerPopup(item.jjdbh);
    },
    //3.必须方法之聚合图层单击事件,列表内容小于20
    clusterLayerClick : function(coordinate,features){
		_jqLayerControl.pointArr=features;
		_jqLayerControl.showItemListClusterPopup(features);
    },
    //4.必须方法之获得聚合图层对象
    getClusterLayerMarker : function(obj,arr){
		var number = arr.size;
		var imgUrl = '';
		if(number >0 && number <10){
			imgUrl = 'resource/scienceLayout/images/layerIco/jq/default/jqJH_1.png';
		}
		else if(number >9 && number < 100){
			imgUrl = 'resource/scienceLayout/images/layerIco/jq/default/jqJH_2.png';
		}
		else if(number > 99){
			imgUrl = 'resource/scienceLayout/images/layerIco/jq/default/jqJH_3.png';
		}
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
            id: item.jjdbh,
			jjdbh : item.jjdbh,
            name: item.bjnr,
            lon: item.longitude * 1.0,
            lat: item.latitude * 1.0,
            img: top.window.getJQIcoTemplate(item),
			att : item
        };
        return maker;
    },
    //6.必须方法之显示图层,固定写法
    showLayer : function(visible){
        _jqLayerControl.baseMapLayerControl.showLayer(_jqLayerControl.layerMark,visible);
    },
    //7.必须方法之设置图层的显示与隐藏,固定写法
    _setLayerVisible: function () {
        _jqLayerControl.baseMapLayerControl._setLayerVisible(_jqLayerControl.layerMark);
    },
	
	_queryAllRecordList : function () {
		var _this = this;
		var options = _this.baseMapLayerControl.optionsMap.get(_this.layerMark);
		var url = 'queryJqList.do?time=' + new Date();
		if (top.window.getJqQueryParam) {
			url += top.window.getJqQueryParam();
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
    	 var id = "jq_" + attList[0].jjdbh;
         var lon = attList[0].longitude * 1.0;
         var lat = attList[0].latitude * 1.0;
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
        resambleHtml+='<div class="GPUHeader02"><h1>警情聚合列表</h1></div>';
        resambleHtml+='   <div class="GPUInnerBox">';
        resambleHtml+='   	<div class="GPUInnerBox_Border">';
        resambleHtml+='       	<div class="GkkListBox" style="height:200px;" id="clusterPopUpContents">';
    	$.each(attList,function(i,item){
    		 var imgSrc = top.window.getJQIcoTemplate(item);
    		 resambleHtml+='<a href="javascript:void(0);" class="GkkListNav" jjdbh="'+item.jjdbh+'" style="height:42px;line-height:30px;"> ';
             resambleHtml+='    <img src="'+imgSrc+'" width="29" height="42" style="margin-top: -3px;"/>';
             resambleHtml+='    <span style="margin-left:5px;" title="' +item.bjnr + '"  rn ="'+item.rn+'" jjdbh="'+item.jjdbh+'" afdd="'+item.afdd+'"  bjnr="'+item.bjnr+'" lon="'+item.longitude+'"  lat="'+item.latitude+'" ';
             resambleHtml+='       >'+item.bjnr+'</span> ';
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
    		var jjdbh = $(this).attr("jjdbh");
    		_this._showMarkerPopup(jjdbh);
    	})
    	
    	$("#clusterPopUps .NPopUpClose02").bind('click',function(){
    		$("#clusterPopUps").hide();
    	})
    },
	
	_showMarkerPopup: function (jjdbh) {
        var _this = this;
    	
        //查看该警情是否被受理
    	$.ajax({
    		url : 'queryJqDetailByJjdbh.do?jjdbh='+jjdbh,
    		success:function(res){
    		   res = eval("("+res+")");
    		   if (!res.detail || !res.detail.jcjb) {
			   		return;
			   }
			   var jcjb = res.detail.jcjb
			   _this.curOPJQObject = jcjb;
    		   var html =_this._getJqMarkerPopupHtmlTemplate(jcjb, res.hcStatu);
    	        
    	        var id = "jq_" + jcjb.jjdbh;
    	        var lon = jcjb.longitude * 1.0;
    	        var lat = jcjb.latitude * 1.0;
	            
    	        window.gisInteraction.clearPopup(id);
				var currentZoom = window.map.getView().getZoom();
    	        var maxZoom =  top.window.getMapMaxZoom();
				if (currentZoom < maxZoom-3) {
					window.gisInteraction.setZoom(maxZoom-3);
				}
    	        window.gisInteraction.showPopup(id, lon, lat, html, false);
    	        window.gisInteraction.setCenterLeft(lon,lat);
    	        window.gisInteraction.showTwinkle(id,lon,lat,2);
    	        curentJjdbh = jcjb.jjdbh;
    	        currentBjnr = jcjb.bjnr;
    	        
				//20180119屏蔽合成研判'补充申请'按钮
		        if($("#jqMarkerHtml .GPUBtn01[aliasid='fqyp']").text().indexOf("补充申请")>-1){
		        	//$("#jqMarkerHtml .GPUBtn01[aliasid='fqyp']").hide();
		        	//此处修改了补充申请按钮点击事件20180120
		        	$("#jqMarkerHtml .GPUBtn01[aliasid='fqyp']").attr("onclick","").attr("jjdbh",jcjb.jjdbh);
			        $("#jqMarkerHtml .GPUBtn01[aliasid='fqyp']").unbind("click").bind("click",function(e){
						var event = window.event || arguments.callee.caller.arguments[0];
						event.stopPropagation();
			        	var jjdbh=$(this).attr("jjdbh");
			        	//打开警情-合成研判-补充申请界面
			        	top.jqHcypBctjDialog = jQuery.fn.scienceDialog({
							url : "toJqHcypBctj.do?jjdbh="+jjdbh,
							width:'auto',
							height:'auto',
							close: function() {
							}
						});
			        });
		        }
		        
		        var box = $('#jqMarkerHtml div.GPUBtnBox01');
	    		var boxMargin = box.outerHeight(true) - box.outerHeight();
	    		box.height(boxMargin+$('#jqMarkerHtml div.GPUBtnBox02').height());
	    		caseGuijiOnJqMap.queryCaseGuijiDatas(false, jjdbh);
    		}
    	});
    },
	
	/**
	 * 获取警情弹框html模板
	 * @param {Object} jcjb
	 */
     _getJqMarkerPopupHtmlTemplate: function (jcjb, hcStatu) {
		var html = '  	<div class="NPopUpBox02" id="jqMarkerHtml" style="width:425px;">'
				  	     + '   <a href="javascript:void(0);" class="NPopUpClose02" id="btnCloseJQPopup" onclick="top.window.gisInteraction.clearPopup();"></a>'
				  	     + '   <div class="NPUTwoContent">'
				  	     + '   	<div class="GSDHeader" title="%bjnr">&nbsp;&nbsp;&nbsp;&nbsp;%bjnr</div>'
				  	     + '       <div class="GPUInnerBox">'
				  	     + '       	<div class="GPUInnerBox_Border">'
				  	     + '               <div class="GStaffDetailsBox">'
				  	     + '                   <div class="GStaffDetails">'
				  	     + '                       <div class="GStaffDetailsTitle">报警时间：</div>'
				  	     + '                       <div class="GStaffDetails_r">%bjsj</div>'
				  	     + '                       <div class="clear"></div>'
				  	     + '                  </div>'
				  	     + '                   <div class="GStaffDetails">'
				  	     + '                       <div class="GStaffDetailsTitle">报警地址：</div>'
				  	     + '                       <div class="GStaffDetails_r" title="%afdd">%afdd</div>'
				  	     + '                       <div class="clear"></div>'
				  	     + '                   </div>'
				  	     + '                   <div class="GStaffDetails">'
				  	     + '                       <div class="GStaffDetailsTitle">警情类别：</div>'
				  	     + '                       <div class="GStaffDetails_r">%jqType</div>'
				  	     + '                       <div class="clear"></div>'
				  	     + '                   </div>'
				  	     + '               </div>'
				  	     + '           	<div class="GPUInnerBox_Line01"></div>'
				  	     + '           	<div class="GPUInnerBox_Line02"></div>'
				  	     + '           </div>'
				  	     + '       </div>'
				  	     + '       <div class="GPUBtnBox01" style="height:52px;">'
				  	     + '           <div class="GPUBtnBox02">'
				  	     + '				<a href="javascript:void(0);" class="GPUBtn01" aliasid="expandDetailBtn" onclick="parent.window.openJqDetailForMap(\'%jjdbh\')" style="cursor:pointer;margin-top:4px;" hidefocus="true">&nbsp;研判进展</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="relativeCase"  onclick="caseMerge(\'%jjdbh\')" style="cursor:pointer;margin-top:4px;display:none;"  hidefocus="true">&nbsp;相似案件</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="fqyp" style="cursor:pointer;margin-top:4px;display:%showTqhc" onclick="parent.window.toTqhc(\'%jjdbh\',%hcStatu)"  hidefocus="true">%tqhcNR</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" jjdbh="%jjdbh" style="cursor:pointer;margin-top:4px;"  onclick="top.updateJQLocation(this)" hidefocus="true">&nbsp;二次定位</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="videoRecommend"  onclick="top.videoRecommend(\'%longitude\',\'%latitude\',\'%bjsj\')" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;视频推荐</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="ddmp" onclick="top.toSinglePointScreen(\'%jjdbh\',\'%bjsj\')" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;单点摸排</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="carRecommend"  onclick="top.carRecommend(\'%longitude\',\'%latitude\',\'%bjsj\')" style="cursor:pointer;margin-top:4px;display:none;"  hidefocus="true">&nbsp;嫌疑车辆推荐</a>'
				  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="caseRefFocalMan" onclick="top.showCaseRefFocalManUI(\'%longitude\',\'%latitude\',\'ZDRY_%jjdbh\',\'%bjsj\')" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;重点人员筛查</a>'
				  		 + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="ddpz" onclick="top.toMultiPointScreen(\'%jjdbh\',\'%bjsj\')" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;多点碰撞</a>'
				  		 + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="zysc" onclick="_jqLayerControl.toResourceUpload(\'%jjdbh\')" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;资源上传</a>'
						 + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="kshyp" onclick="_jqLayerControl.toCaseGuijiDlg(\'%jjdbh\')" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;可视化研判</a>'
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
        html = html.replace(/%bjnr/g, dealWithParam(jcjb.bjnr));
		html = html.replace(/%jjdbh/g, dealWithParam(jcjb.jjdbh));
		html = html.replace(/%bjsj/g, getDateString(jcjb.bjsj).nowTime);
		html = html.replace(/%afdd/g, dealWithParam(jcjb.afdd));
		if (dealWithParam(jcjb.jqType) && top.window.jqTypeMap && top.window.jqTypeMap.containsKey(jcjb.jqType)) {
			html = html.replace(/%jqType/g, top.window.jqTypeMap.get(jcjb.jqType).name);
		} else {
			html = html.replace(/%jqType/g, '');
		}
		html = html.replace(/%longitude/g, dealWithParam(jcjb.longitude));
		html = html.replace(/%latitude/g, dealWithParam(jcjb.latitude));
		html = html.replace(/%hcStatu/g, dealWithParam(hcStatu));                   
		if (hcStatu == 0) {
		   html = html.replace(/%tqhcNR/g, top.tqhcTitle || "提请合成");
		   html = html.replace(/%showTqhc/g, "block");
		} else if (hcStatu == 2) {
		       html = html.replace(/%tqhcNR/g, "还原合成");
		       html = html.replace(/%showTqhc/g, "block");
		} else {
		   html = html.replace(/%showTqhc/g, "none");
		}
		return html;
	},
	refreshCaseGuiji : function(jjdbh){
		caseGuijiOnJqMap.queryCaseGuijiDatas(false, jjdbh);
	},
	toResourceUpload : function(jjdbh){
		window.gisInteraction.getPointForResetPosition(function(coordinate){
			var url = 'toUploadResourceDlgForBS.do?fileDes=jqResource'+'&caseId='+jjdbh+'&lon='+coordinate[0]+'&lat='+coordinate[1];
			top.uploadResourceDlg = jQuery.fn.scienceDialog({
				url : url,
			    zIndex : 99,
				width:'860',
				height:'568',
				close: function() {
					top.uploadResourceDlg = null;
					_jqLayerControl.refreshCaseGuiji(jjdbh);
				}
			});
		})
	},
	toCaseGuijiDlg : function(jjdbh){
		top.window.caseGuijiDlg = jQuery.fn.scienceDialog({
		    url : 'caseGuijiOnMap.do?objId='+jjdbh+"&type=jq",
		    zIndex : 999,
			width:'auto',
			height:'auto',
		    close:function(){
	           top.window.caseGuijiDlg = null;
	       }
		});
	},
	openPopWin : function(jjdbh){
    	var _this = this;
        if (!dealWithParam(jjdbh)) {
			return;
		}
        _this._showMarkerPopup(jjdbh);
    },
	
    updateJQLocation : function(coordinate){
		var _this = this;
		if (!dealWithParam(_this.curReLocationJjdbh)) {
			fadingTip("警情定位失败。");
			top.clickType = null;
		}
	    coordinate = _prjFuns.map_to_gps84(coordinate[0], coordinate[1]);
		var url = "updateJQLocation.do?time="+new Date().getTime();
		var data = "jjh="+_this.curReLocationJjdbh + "&jqLongitude=" + coordinate[0] + "&jqLatitude=" + coordinate[1];
		jQuery.ajax({
			type:'POST',
			url:url,
			cache:false,
			data:data,
			success:function(msg) {
				if(!msg) return;
				var rs = eval("(" + msg + ")");
				if(rs.errorCode == "0") {
					if(window.gisInteraction.existMarkerForLayer(_this.layerMark+'SingleLayer',_this.curReLocationJjdbh)){
						window.gisInteraction.updateMarkerPosition(_this.layerMark+'SingleLayer',_this.curReLocationJjdbh,coordinate);
					}else{
						_this.curOPJQObject.longitude = coordinate[0];
						_this.curOPJQObject.latitude = coordinate[1];
						_this._addMarker(_this.curOPJQObject);
					}
					fadingTip("警情定位成功。");
					top.clickType = null;
					top.window.isRelocate = false;
				}else {
					fadingTip("警情定位失败。");
				}
			}
		});
    },
	
	getCurOPObject : function(jjdbh){
    	
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
        if (!item.longitude || !item.latitude) {
            return [];
        }
        var maker = {
            id: item.jjdbh,
            name: item.bjnr,
            lon: item.longitude * 1.0,
            lat: item.latitude * 1.0,
            att: item,
            overlayId : 'JQ_'+ item.jjdbh,
            weight: 1.0,
            img:  top.window.getJQIcoTemplate(item)
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
	
	
    CLASS_NAME: "jqLayerControl"
};


