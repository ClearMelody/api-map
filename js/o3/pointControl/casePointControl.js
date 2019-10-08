/**
 * @(#)GetPointControl.js
 * 
 * @description: 添加疑情管理
 * @author: 肖振亚 2015/11/3
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
var contants = {
		page : 1,
		rows : 1000
}
var GetPointControl = function(){
    this.init.apply(this, arguments);
}

var curentCaseCode = '';
var curentCaseName = '';
var curentCaseContent = '';

GetPointControl.prototype ={
	ajRecordList: [],
    ajRecordMap: new HashMap(),
    ajMarkerLayer: "ajMarkerLayer",
    ajHeatMarkerLayer: "ajHeatMarkerLayer",
    map:null,
    jqDisposeList: [],
    isPcs: '',
    xyryFocalmanMap : new HashMap(),
    elecFenceMap : new HashMap(),
    elecFenceList : [],
    elecHideFenceMap : new HashMap(),
    elecHideFenceList : [],
    curLon : '',
    curLat : '',

    //前后追
    trackevt : null,
    init : function(map){
	    this.map = map;
	    top.window.smxCaseMapCallBack = this.casePointInit; //案件地图刷新回调
	    
		this.casePointInit();
		this.initEvent();
		
	    setTimeout(function () {
	        //加载基础图层控件
	    	initialBasalResourcesLayerControl(this.map);
	    }, 1000);
    },
    
    initEvent : function () {
    	$('a[tar="xyrTimeSubmit"]').live('click', function () {
    		$(this).parent().hide();
    	});
    },
    
    casePointInit : function(data)
	{
			var _this = this;
	        if(!data && top.window.caseJudgementObject){
	        	var isMyCases = top.window.caseJudgementObject.isMyCases;
	        	if(isMyCases == 1){
	        		isMyCases = 0;
	        	}
	        	data = top.window.caseJudgementObject.getQueryParam()+"&isMyCases="+isMyCases+"&caseId="+top.window.caseJudgementObject.caseId;
	        }
	        
	        var url = "queryCaseLists.do?rows=0&isMap=1";
	        _showWait();
	        jQuery.ajax({
	        	url : url,
	        	data: data,
	        	type : "POST",
	        	success : function(res){
	        	     _hideWait();
		        	 var content = eval("("+res+")");
		             var result = content.rows;
//		             _self.clear();
		             var lon = 0;
		             var lat = 0;
		             var iconFeatures = [];
		             var iconFeaturesHeatMap = [];
		             var countSize = 0;
		             var countLon = 0;
		             var countLat = 0;
		             
		             for(var i=0,len=result.length;i<len;i++){
		            	//如果从字典里取不到则默认为空
		            	var leibieName = top.window.coreleibieMap.get(result[i].leibie) || "";
		            	if(result[i].caseCode && result[i].caseCode.substring(0,1) == 'Y'){
							leibieName = top.window.doubtCaseLeibie.get(result[i].leibie) || "";
						}
		                lon=result[i].caseLongitude*1;
		                lat=result[i].caseLatitude*1;
		                if(clientGISKind==clientGISKinds.OFFLINEGIS&&result[i].caseLongitude!=""&&result[i].caseLatitude!=undefined){  
		                    var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(result[i].caseLongitude*1,result[i].caseLatitude*1), 'EPSG:4326', 'EPSG:3857');
		                    lon = cor[0];
		                    lat = cor[1];
		                }
		                if(result[i].caseLongitude*1 && result[i].caseLatitude*1){
		                    countSize++;
		                    countLon += lon*1;
		                    countLat += lat*1;
		                    result[i].leibieName = leibieName;
		                }
		                _this.ajRecordMap.put(result[i].caseId, result[i]);
		            }
		            if(countLon != 0 && countLat!= 0 ){
		                //map.getView().setCenter([countLon/countSize,countLat/countSize]);
		            }
		            _this.ajRecordList = result;
		            _this._showMarkers();
//		            _this._showHeatMap();
		            
		            _this.jqDisposeList = content.xkryzp;
		            _this.isPcs = content.isPcs;
		            
		        	if(top.locateMapCallback){
		        		top.locateMapCallback();// 工作台进入案件定位回调
		        	}
		            }
	        })
	},
	_showMarkers:function(){
		var markerList = [];
    	var _this = this;
        for (var i = 0; i < _this.ajRecordList.length; i++) {
        	var item =  _this.ajRecordList[i];
        	if (!item.caseLongitude || !item.caseLatitude) {
        		continue;
        	}
        	var img = top.window.getCaseImgIcon(item);
        	var maker = {
	            id: item.caseId,
	            name: item.casename,
//	            innerHTML: _this._getCaseHtmlTemplate(),
	            lon: item.caseLongitude * 1.0,
	            lat: item.caseLatitude * 1.0,
	            att: item,
	            overlayId : "AJ_"+item.caseId,
	            weight: 1.0,
	            img : img
	        };
            markerList.push(maker);
        }
        window.gisInteraction.clearMarkers(_this.ajMarkerLayer);
    	window.gisInteraction.addClusterMarkers(_this.ajMarkerLayer, markerList, function (attList) {
    		//地图上点击时不居中不放大
            top.window.isZoom = false;
            top.window.isCenter = false;
            //点击图标显示气泡
            if (!attList || attList.length < 1)
                return;
            if (attList.length == 1) {
                var att = attList[0];
                _this.addpopUp(att);
            } else if (attList.length < 100) {
                _this.addClusterPointListPop(attList);
            }
        });
	},
	_showHeatMap : function(){
    	var markerList = [];
    	var _this = this;
        for (var i = 0; i < _this.ajRecordList.length; i++) {
        	var item =  _this.ajRecordList[i];
        	if (!item.caseLatitude || !item.caseLongitude) {
        		continue;
        	}
        	var maker = {
	            id: item.caseId,
	            name: item.casename,
	            lon: item.caseLongitude * 1.0,
	            lat: item.caseLatitude * 1.0,
	            att: item,
	            weight: 1.0
	        };
            markerList.push(maker);
        }
        window.gisInteraction.clearHeatmap(_this.ajHeatMarkerLayer);
    	window.gisInteraction.addHeatmap(_this.ajHeatMarkerLayer, markerList);
    },
    /**
     * 添加案件marker
     * 
     * @param 经度，纬度，设备id，气泡文本，是否定位到maker,icon图片
     * @return 无
     * @exception 无
     * @History: 无
     * 
     */
    addPointMarker : function(lon,lat) {
       this.delMakerById("mapMarkPoint");
       
       var feature = new ol.Feature({
        geometry: new ol.geom.Point([lon,lat]),
        });
       feature.setId("mapMarkPoint");
       feature.setStyle(newJQStyle);
    
       
      this.casePointSource.addFeature(feature);
    },
    addClusterPointListPop : function(attList){
            var lon = attList[0].caseLongitude*1;
            var lat = attList[0].caseLatitude*1;
            var resambleHtml = '';
            resambleHtml+=' <div class="NPopUpBox02" style="width:350px;" id="caseclusterPopUp">';
            resambleHtml+='<a href="javascript:void(0);" class="NPopUpClose02" onclick="top.window.gisInteraction.clearPopup();"></a>';
            resambleHtml+=' <div class="NPUTwoContent">';
            resambleHtml+='<div class="GPUHeader02"><h1>案件聚合列表</h1></div>';
            resambleHtml+='   <div class="GPUInnerBox">';
            resambleHtml+='   	<div class="GPUInnerBox_Border">';
            resambleHtml+='       	<div class="GkkListBox" style="height:200px;" id="caseclusterPopUpContent">';
            for(var i=0;i<attList.length;i++){
                var tmpObj = attList[i];
                var caseId = tmpObj.caseId||" ";
                var casename = tmpObj.casename||" ";
                var leibieName = tmpObj.leibieName||" ";
                var caseCode = tmpObj.caseCode||" ";
                var happenAddr = tmpObj.happenAddr||" ";
                var discoverTime = tmpObj.discoverTime||" ";
                var simpleCaseCondition = tmpObj.simpleCaseCondition || tmpObj.casename ||" ";
                var longitude = tmpObj.caseLongitude;
                var latitude = tmpObj.caseLatitude;
                var createUserid = tmpObj.createUserid;
                var rowNum = tmpObj.rowNum;
                var markImgUrl = top.window.getCaseImgIcon(tmpObj);
//                resambleHtml+='<li>';
//                resambleHtml+='<a class="jhList" style="line-height:25px; padding:4px 0;" > ';
//                resambleHtml+='<img src="' + markImgUrl  + '" width="23" height="25" style="float:left" />';
//                resambleHtml+='<span style="margin-left:5px;"  title="' + simpleCaseCondition + '" onclick="getPointControl.showClusterCase(this)" ';
//                resambleHtml+=' caseId="'+caseId+'" casename="'+casename+'" leibieName="'+leibieName+'" caseCode="'+caseCode+'" happenAddr="'+happenAddr+'"';
//                resambleHtml+=' discoverTime="'+discoverTime+'" longitude="'+longitude+'" latitude="'+latitude+'" createUserid="'+createUserid+'" rowNum="'+rowNum+'">';
//                resambleHtml+=simpleCaseCondition+'</span> ';
//                resambleHtml+='</li>';
                
                resambleHtml+='<a href="javascript:void(0);" class="GkkListNav" style="height:42px;line-height:30px;" onclick="getPointControl.showClusterCase(this)" ';
                resambleHtml+='      caseId="'+caseId+'" casename="'+casename+'" leibieName="'+leibieName+'" caseCode="'+caseCode+'" happenAddr="'+happenAddr+'"';
                resambleHtml+='      discoverTime="'+discoverTime+'" longitude="'+longitude+'" latitude="'+latitude+'" createUserid="'+createUserid+'" rowNum="'+rowNum+'">';
                resambleHtml+='    <img src="' + markImgUrl  + '" width="29" height="42" style="margin-top: -3px;"/>';
                resambleHtml+='    <span style="margin-left:5px;"  title="' + simpleCaseCondition + '" >';
                resambleHtml+=       simpleCaseCondition+'</span> ';
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
            
            window.gisInteraction.showPopup(attList[0].caseId, lon, lat, resambleHtml, false);
	        window.gisInteraction.setCenterLeft(lon,lat);
            	
//            jhpopupControl.showPopUpWin(resambleHtml,[lon*1,lat*1],1);
    },
    //删除临时点
    delMakerById : function(lid){
        var feature = this.casePointSource.getFeatureById("mapMarkPoint");
		if(feature){
			this.casePointSource.removeFeature(feature);
		}
    },
    showClusterCase : function(obj){
    	$("#jhclose").click();
        obj = $(obj);
        var content = {
        	caseId : obj.attr("caseId"),
        	casename : obj.attr("casename"),
            leibieName : obj.attr("leibieName"),
            caseCode : obj.attr("caseCode"),
            happenAddr : obj.attr("happenAddr"),
            discoverTime : obj.attr("discoverTime"),
            caseLongitude : obj.attr("longitude"),
            caseLatitude : obj.attr("latitude"),
            simpleCaseCondition: obj.attr("title"),
            createUserid: obj.attr("createUserid"),
            rowNum:obj.attr("rowNum")
        }
        this.addpopUp(content);
   
    },
    clear : function(){
    
    },
    addpopUp : function(content){
    	var _this = this;
    	var text = _this._getScienceMarkerPopupHtmlTemplate();
        var caseItem = null;
        $.ajax({
            url:"findFqyp.do?caseId="+content.caseId,
            async:false,
            success:function(res){
                var re = eval("("+res+")");
                var flag = re.flag;
                if("0" == flag){
                    text = text.replace(/%tqhcTitle/g,top.tqhcTitle);
                    text = text.replace(/%showTqhc/gi, "block");
                }else{
                	text = text.replace(/%showTqhc/gi, "none");
//                    text = text.replace(/%tqhcTitle/g,"补充申请"); //  璧山版本没有补充申请
                }
                caseItem = re.data;
            }
        })
        content = $.extend({},caseItem,content);
        
        text = text.replace(/%casename/g,content.casename);
        text = text.replace(/%leibieName/g,content.leibieName);
        text = text.replace(/%caseCode/g,content.caseCode);
        text = text.replace(/%happenAddr/g,content.happenAddr || "");
        text = text.replace(/%discoverTime/g, content.discoverTime||"");
        text = text.replace(/%simpleCaseCondition/g,content.simpleCaseCondition||"");
        
        text = text.replace(/%tqhc/g,"parent.caseJudgement.toFqyp('"+content.caseId+"')");
        text = text.replace(/%sl/g,"parent.caseJudgement.acceptCase('"+content.caseId+"')");
        text = text.replace(/%xxxx/g,"parent.caseJudgement.locateCaseForList('"+content.caseId+"','"+content.rowNum+"')");
        text = text.replace(/%xsaj/g,"caseMerge('"+content.caseId+"')");
        text = text.replace(/%zdry/g,"top.showCaseRefFocalManUI('"+content.caseLongitude*1+"','"+content.caseLatitude*1+"','ZDRY_"+ content.caseId +"','"+content.discoverTime+"');");
        text = text.replace(/%xgry/g,"top.showCaseRefFocalManUI('"+content.caseLongitude*1+"','"+content.caseLatitude*1+"','"+ content.caseId +"');");
        text = text.replace(/%xsry/g,"top.showRelativePersonUI('"+caseItem.caseLongitude*1+"','"+caseItem.caseLatitude*1+"','"+ content.caseId +"','"+ caseItem.leibie +"');");
        text = text.replace(/%secondLocation/g, content.caseId);
        if(content.discoverTime){
        	 text = text.replace(/%sptj/g,"top.videoRecommend('"+content.caseLongitude*1+"','"+content.caseLatitude*1+"','"+content.discoverTime+"')");
        	 text = text.replace(/%cltj/g,"top.carRecommend('"+content.caseLongitude*1+"','"+content.caseLatitude*1+"','"+content.discoverTime+"')");
        }else{
        	 text = text.replace(/%sptj/g,"top.videoRecommend('"+content.caseLongitude*1+"','"+content.caseLatitude*1+"','"+content.recordTime+"')");
//        	 text = text.replace(/%cltj/g,"top.carRecommend('"+content.caseLongitude*1+"','"+content.caseLatitude*1+"','"+content.recordTime+"')");
        }
//        text = text.replace(/%xyrtj/g,"getPointControl.queryElecFenceByCircleNew('"+content.caseId*1+"','"+content.caseLongitude*1+"','"+content.caseLatitude*1+"')");
        text = text.replace(/%xyrtj/g,"getPointControl.toElecFence('"+content.caseId+"','"+content.recordTime+"','"+content.caseLongitude*1+"','"+content.caseLatitude*1+"')");
        
        text = text.replace(/%cjfk/g,"toPcsCollectFk('"+content.caseCode+"');");
        text = text.replace(/%xkcj/g,"toXsjsCollectFk('"+content.caseCode+"');");
        text = text.replace(/%xkryzp/g,"toXkryPf('"+content.caseCode+"','','"+content.caseLongitude*1+"','"+content.caseLatitude*1+"');");
		//单点摸排
    	text = text.replace(/%ddmp/g,"top.toSinglePointScreen('"+content.caseCode+"','"+content.recordTime+"');");
    	//多点碰撞
    	text = text.replace(/%ddpz/g,"top.toMultiPointScreen('"+content.caseCode+"','"+content.recordTime+"');");
        
//        text = text.replace(/%sptj/g,"top.videoRecommend('"+content.caseLongitude*1+"','"+content.caseLatitude*1+"')");
//        popupControl.showPopUpWin(text,[content.caseLongitude*1,content.caseLatitude*1]);
//		popupControl.setCenter([content.caseLongitude*1,content.caseLatitude*1]);
        var id = "aj_" + content.caseId;
        var lon = content.caseLongitude * 1.0;
        var lat = content.caseLatitude * 1.0;
        _this.curLon = content.caseLongitude * 1.0;
        _this.curLat = content.caseLatitude * 1.0;
        
        curentCaseCode = content.caseCode;
        curentCaseName = content.casename;
        curentCaseContent = content.simpleCaseCondition;
        
        window.gisInteraction.clearPopup(id);
        var maxZoom =  top.window.getMapMaxZoom();
        window.gisInteraction.setZoom(maxZoom-3);
        window.gisInteraction.showPopup(id, lon, lat, text, false);
        window.gisInteraction.setCenterLeft(lon,lat);
        if (undefined!=content.createUserid && ""!=content.createUserid) {
            $("a[aliasid='acceptCase']").hide();
        }
        
        if(content.createUserid && content.createUserid == userInfo.custId){
        	$("#cjcjBut").show();
        }
        
    	for(var j=0; j < _this.jqDisposeList.length; j++){
    		var item = _this.jqDisposeList[j];
    		if(item && item.jjdbh == content.caseCode){
    			if(item.custId == userInfo.custId){
    				$("#xkcjBut").show();
    				break;
    			}
    		}
    	}
    	
    	if(window.orgName.indexOf('刑事侦查支队')>-1 || window.isLeader == '2'){
        	$("#xkryzpBut").show();
        }
        
        if(content.hcStatu){
        	if(content.hcStatu==0){
        		$("a[aliasid='fqyp']").html("提请合成");
        	}else if(content.hcStatu==2){
        		$("a[aliasid='fqyp']").html("还原合成");
        	}else{
        		$("a[aliasid='fqyp']").hide();
        	}
        }
        
    },
    _getScienceMarkerPopupHtmlTemplate : function(){
   	 var html = '  	<div class="NPopUpBox02" style="width:420px;">'
	     + '   <a href="javascript:void(0);" class="NPopUpClose02" id="btnCloseCasePopup" onclick="top.window.gisInteraction.clearPopup();"></a>'
	     + '   <div class="NPUTwoContent">'
	     + '   	<div class="GSDHeader">%casename</div>'
	     + '       <div class="GPUInnerBox">'
	     + '       	<div class="GPUInnerBox_Border">'
	     + '               <div class="GStaffDetailsBox">'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">案件类别：</div>'
	     + '                       <div class="GStaffDetails_r">%leibieName</div>'
	     + '                       <div class="clear"></div>'
	     + '                  </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">案件编号：</div>'
	     + '                       <div class="GStaffDetails_r">%caseCode</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">发现时间：</div>'
	     + '                       <div class="GStaffDetails_r">%discoverTime</div>'
	     + '                       <div class="clear"></div>'
	     + '                   </div>'
	     + '                   <div class="GStaffDetails">'
	     + '                       <div class="GStaffDetailsTitle">案发地址：</div>'
	     + '                       <div class="GStaffDetails_r">%happenAddr</div>'
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
	     + '       <div class="GPUBtnBox01" style="height:50px">'
	     + '           <div class="GPUBtnBox02">';
	     html += '<a href="javascript:void(0);" class="GPUBtn01" aliasid="expandDetailBtn" onclick="%xxxx" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;研判进展</a>';
	     html += '<a href="javascript:void(0);" class="GPUBtn01" alias="%secondLocation" style="cursor:pointer;margin-top:4px;"  onclick="parent.updateCaseLocation(this)" hidefocus="true">&nbsp;二次定位</a>';
	     html += '<a href="javascript:void(0);" class="GPUBtn01" aliasid="fqyp" style="cursor:pointer;margin-top:4px;display:%showTqhc;" onclick="%tqhc" hidefocus="true">&nbsp;%tqhcTitle</a>';
	     html += '<a href="javascript:void(0);" class="GPUBtn01" aliasid="relativeCase"  onclick="%xsaj" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;相似案件</a>';
	     html += '<a href="javascript:void(0);" class="GPUBtn01" aliasid="videoRecommend"  onclick="%sptj" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;视频推荐</a>';
//	     html += '<a href="javascript:void(0);" class="GPUBtn01" aliasid="carRecommend"  onclick="%cltj" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;嫌疑车辆推荐</a>';
	     if(window.xyrtjRight){ // vm中定义是否有嫌疑人推荐权限
	 		html += '<a href="javascript:void(0);" class="GPUBtn01" aliasid="xyrRecommend"  onclick="%xyrtj" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;嫌疑人筛选</a>';
	     }
	     html += '<a href="javascript:void(0);" class="GPUBtn01" aliasid="caseRefFocalMan" onclick="%zdry" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;重点人员筛查</a>';
	     html += '<a href="javascript:void(0);" class="GPUBtn01" aliasid="ddmp" onclick="%ddmp" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;单点摸排</a>';
	     html += '<a href="javascript:void(0);" class="GPUBtn01" aliasid="ddpz" onclick="%ddpz" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;多点碰撞</a>'
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
	     return html;
   },
    locateCaseOnMap: function(caseId,me){
    	$(".PUBox02").remove();
    	$(".NPopUpBox02").remove();
    	var _this = this;
    	var caseList = _this.ajRecordList;
    	var result = null,
    		i = 0;
    	
    	for(; i < caseList.length; i++){
    		var item = caseList[i];
    		if(item && item.caseId == caseId){
    			result = item;
    			break;
    		}
    	}
    	if(result == null){

			//2018.4.24无坐标的案件直接定位到璧山公安局
			window.gisInteraction.clearPopup();
			window.gisInteraction.setCenterLeft(106.1971,29.5785);
    		return;
    	}
    	top.window.isCenter = true;
    	top.window.isZoom = true;
    	this.map.getView().setZoom(13);
    	result.hcStatu = me.hcStatu;
    	this.addpopUp(result);
    },
    updateLocation : function (caseId,lon,lat){
    	var _this = this;
	    var contents = null;
	    if(_this.ajRecordMap.get(caseId)){
	    	contents = _this.ajRecordMap.get(caseId);
	    	contents.caseLatitude = lat*1;
		    contents.caseLongitude = lon*1;
		    _this.ajRecordMap.remove(caseId);
	    }else{
	    	$.ajax({
	    		url : "getCaseById.do?caseId="+caseId,
	    		async:false,
	    		success:function(res){
	    		    res = eval("("+res+")");
	    		    var obj = res.resp;
	    		    
	    		    if(clientGISKind==clientGISKinds.OFFLINEGIS&&obj.caseLongitude!=""&&obj.caseLatitude!=undefined){  
	                    var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(obj.caseLongitude*1,obj.caseLatitude*1), 'EPSG:4326', 'EPSG:3857');
	                    obj.caseLongitude = cor[0];
	                    obj.caseLatitude = cor[1];
	                }
	    		    contents = obj;
	    		    contents.leibieName =  contents.leibie;
	    	    }
	    	})
	    }
	    _this.ajRecordMap.put(caseId,contents);
	    _this._showMarkers();
	    _this._showHeatMap();
	    top.window.isRelocate = false;
//	    var _self = this;
//	    var iconFeature = new ol.Feature({
//	                        geometry: new ol.geom.Point([lon,lat]),
//	                        content : contents
//	    });
//	    iconFeature.setId(contents.caseId);
//	    var iconFeatureHeatMap = new ol.Feature({
//	                geometry: new ol.geom.Point([lon,lat]),
//	                weight: 0.3
//	            });
//	    _self.casePointSource.addFeature(iconFeature);
//	    _self.casePointSourceHeatMap.addFeature(iconFeatureHeatMap);
    },
    
    /**
     * 搜索警员派警
     * @param jjdbh
     * @param longitude
     * @param latitude
     */
    queryPolice : function (jjdbh, gxdwdm, longitude,latitude) {
    	var _this = this;
    	$('#queryPoliceList').html('');
//    	if ($('#policeSearchText').val()=='' || $('#policeSearchText').val()==undefined) {
//    		fadingTip("请输入警号或姓名！");
//    		return;
//    	}
    	var list = [];
    	jQuery.ajax({
            type: "POST",
            cache : false,
            async : false,
            url: "queryPoliceListForBs.do",
            data : {
            	jjdbh : jjdbh,
            	gxdwdm : gxdwdm,
            	searchText : $('#policeSearchText').val()
            },
            success: function(msg) {
                if(!msg) return;
                var data = eval("(" + msg + ")");
                if( data && data.errorCode=='0'){
                	list = data.resp;
                }else{
                	fadingTip("查询出错！");
                }
            }
        });
    	if (!list || list.length < 1) {
    		return;
    	}
    	var fjjyHtml = '';
    	//计算警员距离该警情的距离
    	for(var i=0; i<list.length; i++){
    		var value = list[i];
    		if (!value.longitude || !value.latitude) {
    			value.distance = 999999999;
    		} else {
    			var distance = Math.ceil(Math.sqrt((value.longitude - longitude)*(value.longitude - longitude)+
        				(value.latitude - latitude)*(value.latitude - latitude)) / 0.00000916);
    			value.distance = distance;
    		}
    	}
    	//根据距离正序排序
    	list.sort(function(obj1,obj2){
            if(obj1.distance<obj2.distance){
                return -1;
            }
            else if(obj1.distance==obj2.distance){
                return 0;
            }else{
                return 1;
            }
        });
    	//弹框中显示搜索到的警员列表
    	for(var i=0; i<list.length; i++){
    		var value = list[i];
			fjjyHtml += _this.getFjjyHtml(value, value.distance);
    	}
    	fjjyHtml = fjjyHtml.replace(/%jqLon/g, longitude);
    	fjjyHtml = fjjyHtml.replace(/%jqLat/g, latitude);
    	$('#queryPoliceList').html(fjjyHtml);
    },
    
  //获取附近警力弹框中的警员列表html
    getFjjyHtml : function (item, distance){
    	var html = '<div class="GPUPListNav" custId="%custId" custName="%custName" realName="%realName" orgName="%orgName" orgId="%orgId">'
    				+'    <div class="GPUPListNav_img">'
//    				+'        <div class="GPUPListBubble02" onclick="getPointControl.showPoliceJqList(%custId, %jqLon, %jqLat)">%unsolvedJQ</div>'
    				+'        <img src="resource/scienceLayout/images/GisNew/Police02_offline.png" width="32" height="32" />'
    				+'    </div>'
    				+'    <span class="GPUPListNav_Name" title="%realName(%custName)">%realName(%custName)</span>'
    				+'    <span class="GPUPListNav_Name" style="width:80px;" title="%orgName">%orgName</span>'
    				+'    <div class="GPUPListDrive">'
    				+'        <span class="GPUPListDistance">%distance</span>'
//    				+'        <a href="javascript:void(0);" class="GPUPListSound"></a>'
//    				+'        <a href="javascript:void(0);" class="GPUPListCommand"></a>'
    				+'        <a href="javascript:void(0);" class="GPUPListCheckBox" onclick="getPointControl.clickBtn(this);"></a>'
    				+'    </div>'
    				+'</div>';
    	if (distance > 10000000) {
    		html = html.replace('%distance', '未定位');
    	} else if (parseFloat(distance) > 1000){
    		html = html.replace('%distance', (parseFloat(distance)/1000).toFixed(2) + 'km');
    	} else {
    		html = html.replace('%distance', parseFloat(distance).toFixed(2) + 'm');
    	}
//    	if (item.unsolvedJQ > 2) {
//    		html = html.replace('GPUPListBubble02', 'GPUPListBubble01');
//    	}
    	if (item.mobileOnlineStatus == 1) {
    		html = html.replace('Police02_offline.png', 'Police02_online.png');
    	}
    	html = html.replace(/%custId/g, item.custId);
    	html = html.replace(/%custName/g, item.custName);
    	html = html.replace(/%realName/g, item.realName);
    	html = html.replace(/%orgName/g, item.orgName);
    	html = html.replace(/%orgId/g, item.orgId);
//    	html = html.replace(/%unsolvedJQ/g, item.unsolvedJQ);
    	
    	return html;
    },
    
    clickBtn : function (obj) {
    	if($(obj).hasClass("GPUPListCheckBox")){
    		$(obj).removeClass().addClass("GPUPListCheckBox_on");
    	}else{
    		$(obj).removeClass().addClass("GPUPListCheckBox");
    	}
    },
    
    /**
     * 确认调度
     */
    commitCommand : function () {
    	var _this = this;
    	var caseCode = curentCaseCode;
    	var custIds = [];
    	var content = [];
    	$('.GPUPListCheckBox_on').each(function (index, obj) {
    		var custId = $(obj).parent().parent().attr('custId');
    		var realName = $(obj).parent().parent().attr('realName');
    		var custName = $(obj).parent().parent().attr('custName');
    		var orgName = $(obj).parent().parent().attr('orgName');
    		var orgId = $(obj).parent().parent().attr('orgId');
    		var item = {
				custId:custId,
				realName:realName,
				custName:custName,
				orgName:orgName,
				orgId:orgId
    		};
    		content.push(item);
    		custIds.push(custId);
    	});
    	if (content.length < 1) {
    		fadingTip('请至少选择一个民警！');
    		return;
    	}
        var  userJsonStr = JSON.stringify(content)
        _this.saveCommit(caseCode ,userJsonStr);
        var msg = {
        	dataType : "2002",//2002：派警信息推送；
            id : caseCode,
            title : curentCaseName,
            name : curentCaseContent,
            userName : userInfo.realName,
            type:'case'
        };
        top.window.sendMsg(custIds,msg);
        $('#popup-closer').click();
//        _this.refreshPopup();
        //刷新右侧列表的出警状态
//        top.window.refreshJqState(jjdbh);
        fadingTip("调度成功！")
        
        var id = "aj_" + caseCode;
        window.gisInteraction.clearPopup(id);
    },
    
    //刷新警情弹框
    refreshPopup : function () {
    	jQuery.ajax({
            type: "POST",
            cache : false,
            async : false,
            url: "queryJqDetailByJjdbh.do?jjdbh="+curentJjdbh,
            success: function(msg) {
                if(!msg) return;
                var data = eval("(" + msg + ")");
                if( data && data.detail){
                	getPointControl.addpopUp(data.detail.jcjb);
                }
            }
        });
    },
    
    //保存调度信息
    saveCommit : function (caseCode, userJsonStr) {
    	jQuery.ajax({
            type: "POST",
            cache : false,
            async : false,
            url: "commitCommand.do",
            data : {
            	jjdbh : caseCode,
            	userJsonStr : userJsonStr
            },
            success: function(msg) {
                if(!msg) return;
                var data = eval("(" + msg + ")");
                if( data && data.errCode=='0'){
                	fadingTip("调度成功！");
                }else{
                    
                }
            }
        });
    },
    
    /**
     * 现勘人员指派
     */
    xkryPf : function (caseCode, gxdwdm, longitude, latitude){
    	//关闭弹框
    	$('#popup-closer').click();
    	var html = getManualCommandHtml(caseCode, gxdwdm, longitude, latitude);
    	
        var id = "aj_" + caseCode;
        window.gisInteraction.clearPopup(id);
        window.gisInteraction.showPopup(id, longitude*1, latitude*1, html, true);
        getPointControl.queryPolice(caseCode, gxdwdm, longitude, latitude);
    },
    
    //绘制圆形
    drawArea : function (caseId,lon,lat,radius){
    	var _this = this;
    	var curRadius = 0;
    	if(clientGISKind == clientGISKinds.FHGIS){
    		curRadius = radius * 0.000009178;
    	}else if(clientGISKind == clientGISKinds.OFFLINEGIS){
    		curRadius = radius;//360 * radius / (2 * Math.PI * 6378137);
    	}
        //在地图上绘制圆形
        var circle = {
            "radius": curRadius * 1.0,
            "lon": lon * 1.0,
            "lat": lat * 1.0
        };
        top.gisInteraction.addTrackCircle2Map(circle, function (newCircle) {
            if(clientGISKind == clientGISKinds.FHGIS){
            	curRadius = newCircle.radius/0.000009178;
            }else if(clientGISKind == clientGISKinds.OFFLINEGIS){
            	curRadius = newCircle.radius;
            }
            //重绘后查询范围内的民警
            _this.queryElecFenceByCircleNew(caseId, lon*1.0, lat*1.0, curRadius); 
        });
    },
    
    /**
     * 查询圆圈范围内电子围栏
     * @param condition
     */
    queryElecFenceByCircleNew : function (caseId,longitude,latitude,radius){
    	var _this = this;
    	_showWait();
    	if(radius == undefined || radius==""){
    		radius = 500;
    	}
    	if(clientGISKind == clientGISKinds.OFFLINEGIS && (longitude > 200 || latitude > 50)){
    		var cor = top.window.gisInteraction.map_to_gps84(longitude*1, latitude*1);
    		longitude = cor[0];
    		latitude = cor[1];
    	}
        _this.drawArea(caseId,longitude*1,latitude*1,radius*1);
    	var url = "queryElecFencePointList.do";
    	var extent = longitude*1 + "," +  latitude*1 + "," + radius*0.00000916;
    	var curPage = 1;
    	var pageSize = 10;
    	radius = radius*0.00000916;
    	
        $.ajax({
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            url: url,
            data: "&extent=" + extent + "&curPage=" + curPage + "&pageSize=" + pageSize,
            cache: false,
            async: true,
            type: 'GET',
            success: function (data) {
                _hideWait();
                var errorCode = data.errorCode;
                if (errorCode == "0" && data.resp) {
                	var list = data.resp;
                	var html = "";
                    html = _this.getNearestElecFencePopupHtmlNew(list,longitude,latitude,Math.ceil(radius/0.00000916));
//                    popupControl.showPopUpWin(html,[longitude*1,latitude*1],1);
                    window.gisInteraction.showPopup('aj_'+caseId, longitude*1, latitude*1, html, true);
                    _this.initXyrTime(list);
                }
                
//                if(type == 1){
//                	var zoom = map.getView().getZoom();
//                    if((zoom < 16) & (clientGISKind == clientGISKinds.OFFLINEGIS)){
//                    	map.getView().setZoom(16);
//                    }
//                    var l =  window.gisInteraction.gps84_to_map(longitude*1, latitude*1);
//                    map.getView().setCenter([l[0], l[1]]);
//                    centerCrossEffect.startAnimate(l[0], l[1]);
//                }else{
//                	var l =  window.gisInteraction.gps84_to_map(longitude*1, latitude*1);
//                    map.getView().setCenter([l[0], l[1]]);
//                    centerCrossEffect.startAnimate(l[0], l[1]);
//                }
                
                
            },
        	error: function (resobj) {
        		_hideWait();
        		fadingTip("服务器端异常，查询视频信息失败!");
        	}
        });
    },
    
    //获取附近电子围栏弹框html
    getNearestElecFencePopupHtmlNew : function (resultList,longitude,latitude,radius) {
    	var _this = this;
    	var html = _this.getDzwlHtml();
    	html = html.replace("%radius", radius);
    	var totalNum = 0;
    	var fjjyHtml = '';
    	$.each(resultList,function(index,value){
			var distance = Math.ceil(Math.sqrt((value.longitude - longitude)*(value.longitude - longitude)+
    				(value.latitude - latitude)*(value.latitude - latitude)) / 0.00000916);
			fjjyHtml += _this.getElecFenceHtml(value, distance);
			totalNum++;
    	});
    	fjjyHtml = fjjyHtml.replace(/%jqLon/g, longitude);
    	fjjyHtml = fjjyHtml.replace(/%jqLat/g, latitude);
    	html = html.replace("%fjjyList", fjjyHtml);
    	html = html.replace("%totalNum", totalNum);
    	return html;
    },

    //获取附近警力弹框中的警员列表html
    getElecFenceHtml : function (item, distance){
    	var html = '<div class="GPUPListNav" zdbh="%zdbh" zdmc="%zdmc">'
    				+'    <div class="GPUPListNav_img">'
//    				+'        <div class="GPUPListBubble02" onclick="getPointControl.showPoliceJqList(%custId, %jqLon, %jqLat)">%unsolvedJQ</div>'
    				+'        <img src="resource/scienceLayout/images/layerIco/elec/elec.png" width="32" height="32" />'
    				+'    </div>'
    				+'    <span class="GPUPListNav_Name" title="%zdmc">%zdmc</span>'
    				+'    <span class="GPUPListNav_Name" style="width:80px;" title="%zdbh">%zdbh</span>'
    				+'    <div class="GPUPListDrive">'
    				+'        <span class="GPUPListDistance">%distance</span>'
//    				+'        <a href="javascript:void(0);" class="GPUPListSound"></a>'
//    				+'        <a href="javascript:void(0);" class="GPUPListCommand"></a>'
    				+'        <a tar="timeSet" onclick="getPointControl.showTimeSet(this);" href="javascript:void(0);" class="PlateBtn_Time" title="时间设置" style="margin-top:7px;"></a>'
    				+'		  <div class="JAPlateTimeSetMenu"  style="display:none;right:7px;top:-8px;z-index:9;padding: 5px;">'
    				+'				<span class="JAPlateTimeSetText">时间段：</span>'
    				+'    			<input tar="xyrTime" id="xtrStartTime_%zdbh" name="xtrStartTime_%zdbh" type="text" class="JAPlateTimeSetInput"/>'
    				+'    			<span class="JAPlateTimeSetText02">-</span>'
    				+'    			<input tar="xyrTime" id="xtrEndTime_%zdbh" name="xtrEndTime_%zdbh" type="text" class="JAPlateTimeSetInput"/>'
    				+'    			<a href="javascript:void(0);" class="JAPlateTimeSetBtn" onclick="getPointControl.hideTimeSet(this);">确定</a>'
    				+'		   </div>'
    				+'        <a tar="selectElecFence" zdbh="%zdbh" href="javascript:void(0);" class="GPUPListCheckBox" onclick="getPointControl.clickBtn(this);"></a>'
    				+'    </div>'
    				+'</div>';
    	if (distance > 10000000) {
    		html = html.replace('%distance', '未定位');
    	} else if (parseFloat(distance) > 1000){
    		html = html.replace('%distance', (parseFloat(distance)/1000).toFixed(2) + 'km');
    	} else {
    		html = html.replace('%distance', parseFloat(distance).toFixed(2) + 'm');
    	}
    	if (item.unsolvedJQ > 2) {
    		html = html.replace('GPUPListBubble02', 'GPUPListBubble01');
    	}
    	if (item.mobileOnlineStatus == 1) {
    		html = html.replace('Police02_offline.png', 'Police02_online.png');
    	}
    	html = html.replace(/%zdbh/g, item.zdbh);
    	html = html.replace(/%zdmc/g, item.zdmc);
    	
    	return html;
    },
    
    getDzwlHtml : function () {
    	var html = '<div class="NPUTwoContent">'
    		+'    	<div class="GPUHeader02" style="margin-right:50px;"><h1>附近电子围栏列表（%radiusM）</h1><div class="GPUInnerCount">共<span>%totalNum</span>条</div></div>'
    		+'        <div class="GPUInnerBox">'
    		+'        	<div class="GPUInnerBox_Border">'
    		+'            	<div class="GPUCaseDetailBox">'
    		+'                    <div class="GPUPList" style="max-height:190px; overflow:auto; padding-top:5px;">'
    		+'    						%fjjyList'
    		+'                    </div>'
    		+'              </div>'
    		+'            	<div class="GPUInnerBox_Line01"></div>'
    		+'            	<div class="GPUInnerBox_Line02"></div>'
    		+'           </div>'
    		+'        </div>'
    		+'        <div class="GPUBtnBox01">'
    		+'            <div class="GPUBtnBox02">'
    		+'                <a href="javascript:void(0);" class="GPUBtn01" onClick="getPointControl.queryXyrListByElecFences(this)">查询</a>'
    		+'            </div>'
    		+'        </div>'
    		+'        </div>'
    		+'        <div class="NPopUpBox02_line01"></div>'
    		+'        <div class="NPopUpBox02_line02"></div>'
    		+'        <div class="NPopUpBox02_j01"></div>'
    		+'        <div class="NPopUpBox02_j02"></div>'
    		+'        <div class="NPopUpBox02_j03"></div>'
    		+'        <div class="NPopUpBox02_j04"></div>'
    		+'        <div class="NPopUpBox02_j05"></div>'
    		+'        <div class="NPopUpBox02_j06"></div>'
    		+'        <div class="NPopUpBox02_j07" style="display:none;"></div>'
    		+'        <div class="NPopUpBox02_j08" style="display:none;"></div>'
    		+'</div>';
    	return html;
    },

    clickBtn : function (obj) {
    	if($(obj).hasClass("GPUPListCheckBox")){
    		$(obj).removeClass().addClass("GPUPListCheckBox_on");
    	}else{
    		$(obj).removeClass().addClass("GPUPListCheckBox");
    	}
    },
    
    showTimeSet : function (obj) {
//    	$('.JAPlateTimeSetMenu').hide();
    	if($(obj).siblings().eq(1).css('display') == 'none'){
			$(obj).siblings().eq(1).show();
		}else{
			$(obj).siblings().eq(1).hide();
		}
    },
    
    hideTimeSet : function (obj) {
    	$(obj).parent().hide();
    },
    
    initXyrTime : function (list) {
    	$.each(list,function(index,value){
    		laydate({
	    		elem: '#xtrStartTime_'+value.zdbh, //需显示日期的元素选择器
		        format: 'YYYY-MM-DD hh:mm:ss', //日期格式 hh:mm:ss
		        event: 'click', //触发事件
				istime: true,
		        max: laydate.now() || '#xtrEndTime_'+value.zdbh, //最大日期
		        choose: function(dates){ //选择好日期的回调
		        	
		        }
        	});
    		laydate({
                elem: '#xtrEndTime_'+value.zdbh, //需显示日期的元素选择器
                format: 'YYYY-MM-DD hh:mm:ss', //日期格式
                event: 'click', //触发事件
        		istime: true,
                max: laydate.now(), //最大日期
                choose: function(dates){ //选择好日期的回调
        			
                }
        	});
    	});
    },
    
    queryXyrListByElecFences : function () {
    	var _this = this;
    	var list = [];
    	var hideList = [];
    	$('.GPUPListCheckBox_on[tar="selectElecFence"]').each(function (index, obj) {
    		var zdbh = $(this).attr('zdbh');
    		var startTime = $('#xtrStartTime_'+zdbh).val();
    		var endTime = $('#xtrEndTime_'+zdbh).val();
    		var content = {
    			zdbh : zdbh,
    			startTime : startTime,
    			endTime : endTime
    		};
    		list.push(content);
    	});
    	$('.GPUPListCheckBox[tar="selectElecFence"]').each(function (index, obj) {
    		var zdbh = $(this).attr('zdbh');
    		var startTime = $('#xtrStartTime_'+zdbh).val();
    		var endTime = $('#xtrEndTime_'+zdbh).val();
    		var content = {
    			zdbh : zdbh,
    			startTime : startTime,
    			endTime : endTime
    		};
    		hideList.push(content);
    	});
    	var jsonString = JSON.stringify(list);
    	var hideDataString = JSON.stringify(hideList);
    	jQuery.ajax({
            type: "POST",
            url: 'queryXyrListByElecFences.do?pageSize=99999999&pageIndex=0&dataString='+jsonString+'&hideDataString='+hideDataString,
//            data : {dataString : jsonString},
            success: function (msg) {
                var data = eval("(" + msg + ")");
                var errorCode = data.errorCode;
                if (errorCode == "0" && data.resp) {
                	var elecFenceList = data.resp.elecFenceList;
                	var elecHideFenceList = data.resp.elecHideFenceList;
                	var focalmanList = data.resp.focalmanList;
                	_this.initXyryFocalmanMap(focalmanList);
                	_this.initHideElecFenceList(elecHideFenceList);
                	_this.initElecFenceList(elecFenceList);
                } else {
                	
                }
            },
            erro: function(resobj) {
    			fadingTip("服务端异常");	
    		}
        });
    },
    
    initXyryFocalmanMap : function (focalmanList) {
    	var _this = this;
    	_this.xyryFocalmanMap.clear();
    	_this.elecFenceList = [];
    	$.each(focalmanList,function(index,value){
    		_this.xyryFocalmanMap.put(value.imsi, value);
    	});
    },
    
    initHideElecFenceList : function (resultList) {
    	var _this = this;
    	_this.elecHideFenceMap.clear();
    	$.each(resultList,function(index,value){
    		if (_this.elecHideFenceMap.containsKey(value.imsi)) {//多次出现
    			var list = _this.elecHideFenceMap.get(value.imsi);
    			list.push(value);
    			_this.elecHideFenceMap.put(value.imsi, list);
    		} else {//第一次出现
    			var list = [];
    			list.push(value);
    			_this.elecHideFenceMap.put(value.imsi, list);
    		}
    	});
    	_this.elecHideFenceMap.keys().forEach(function(item) {
    		var obj = _this.elecHideFenceMap.get(item);
			 var content = {
				imsi : item,
				num : obj.length,
				list : obj
			 };
			 if (_this.xyryFocalmanMap.containsKey(item)) {
				 content.focalman = _this.xyryFocalmanMap.get(item);
			 }
			 _this.elecHideFenceList.push(content);
        });
    	_this.elecHideFenceList.sort(function(obj1,obj2){
            if(obj1.num<obj2.num){
                return -1;
            }
            else if(obj1.num==obj2.num){
                return 0;
            }else{
                return 1;
            }
        });
    },
    
    initElecFenceList : function (resultList) {
    	var _this = this;
    	_this.elecFenceMap.clear();
    	$.each(resultList,function(index,value){
    		if (!_this.elecHideFenceMap.containsKey(value.imsi)) {
    			if (_this.elecFenceMap.containsKey(value.imsi)) {//多次出现
        			var list = _this.elecFenceMap.get(value.imsi);
        			list.push(value);
        			_this.elecFenceMap.put(value.imsi, list);
        		} else {//第一次出现
        			var list = [];
        			list.push(value);
        			_this.elecFenceMap.put(value.imsi, list);
        		}
    		}
    	});
    	_this.elecFenceMap.keys().forEach(function(item) {
    		var obj = _this.elecFenceMap.get(item);
			 var content = {
				imsi : item,
				num : obj.length,
				list : obj
			 };
			 if (_this.xyryFocalmanMap.containsKey(item)) {
				 content.focalman = _this.xyryFocalmanMap.get(item);
			 }
			 _this.elecFenceList.push(content);
        });
    	_this.elecFenceList.sort(function(obj1,obj2){
            if(obj1.num<obj2.num){
                return -1;
            }
            else if(obj1.num==obj2.num){
                return 0;
            }else{
                return 1;
            }
        });
    	_this.showElecFenceList(1,6);
    },
    
    showElecFenceList : function (pageIndex, pageSize) {
    	var _this = this;
    	var list = _this.elecFenceList.slice((pageIndex-1)*pageSize, pageIndex*pageSize);
    	var html = _this.getElecFenceListHtml();
    	var fjjyHtml = _this.getElecFenceListTitleHtml();
    	$.each(list,function(index,value){
			fjjyHtml += _this.getElecFenceItemHtml(value);
    	});
    	html = html.replace('%fjjyList', fjjyHtml);
    	window.gisInteraction.showPopupCover('elecFenceList', _this.curLon, _this.curLat, html, true, 9);
    	_this.bindElecFenceListClick();
    },
    
    bindElecFenceListClick : function () {
    	var _this = this;
    	$('#dzwlPageSize').html(Math.ceil(_this.elecFenceList.length/6));
    	//跳转
    	$('#dzwlToPageNo').live('click', function () {
    		var toPageNo = $('#dzwlToPageNum').val();
    		$('#dzwlPageNo').html(toPageNo);
    	});
    	
    	//下一页
    	$('#dzwlNextPageSearch').live('click', function () {
    		
    	});
    	
    	//上一页
    	$('#dzwlLastPageSearch').live('click', function () {
    		
    	});
    	
    },
    

    getElecFenceItemHtml : function (item){
    	var html = '<div class="GPUPListNav" imsi="%imsi">'
    				+'    <div class="GPUPListNav_img">'
    				+'        <div class="GPUPListBubble02" onclick="getPointControl.showMoreElecFence(%imsi)">%num</div>'
    				+'        <img src="resource/scienceLayout/images/layerIco/elec/elec.png" width="32" height="32" />'
    				+'    </div>'
    				+'    <span class="GPUPListNav_Name" title="%imsi" style="width:120px;">%imsi</span>'
    				+'    <span class="GPUPListNav_Name" style="width:60px;" title="%xm">%xm</span>'
    				+'    <span class="GPUPListNav_Name" style="width:130px;" title="%sfzh">%sfzh</span>'
    				+'    <div class="GPUPListDrive">'
//    				+'        <span class="GPUPListDistance">%distance</span>'
    				+'    </div>'
    				+'</div>';
    	if (item.num > 2) {
    		html = html.replace('GPUPListBubble02', 'GPUPListBubble01');
    	}
    	html = html.replace(/%num/g, item.num);
    	html = html.replace(/%imsi/g, item.imsi);
    	if (item.focalman) {
    		html = html.replace(/%xm/g, item.focalman.xm);
    		html = html.replace(/%sfzh/g, item.focalman.sfzh);
    	} else {
    		html = html.replace(/%xm/g, '');
    		html = html.replace(/%sfzh/g, '');
    	}
    	
    	return html;
    },
    
    getElecFenceListTitleHtml : function () {
    	var html = '	<div class="GPUPListNav" style="height: 20px;margin-top: -18px;">'
					+'    	<div class="GPUPListNav_img">'
					+'    	</div>'
					+'    	<span class="GPUPListNav_Name" style="width:120px;text-align: center;">IMSI</span>'
					+'    	<span class="GPUPListNav_Name" style="width:60px;">姓名</span>'
					+'    	<span class="GPUPListNav_Name" style="width:130px;text-align: center;">身份证号</span>'
					+'    	<div class="GPUPListDrive">'
					+'    	</div>'
					+'	</div>';
    	return html;
    },
    
    getElecFenceListHtml : function () {
    	var html = '<div class="NPUTwoContent">'
		    		+'	<div class="GPUHeader02"><h1>电子围栏数据</h1></div>'
		    		+'    <div class="GPUInnerBox">'
		    		+'    	<div class="GPUInnerBox_Border" style="height:250px;">'
		    		+'        	<div class="GPUCaseDetailBox" style="height: 236px;">'
		    		+'                <div class="GPUPList" style="max-height:236px; overflow:auto; padding-top:5px;">'
		    		+'    					%fjjyList'
		    		+'                </div>'
		    		+'          </div>'
		    		+'        	<div class="GPUInnerBox_Line01"></div>'
		    		+'        	<div class="GPUInnerBox_Line02"></div>'
		    		+'       </div>'
		    		+'    </div>'
//		    		+'    <div class="GPUBtnBox01">'
//		    		+'        <div class="GPUBtnBox02">'
//		    		+'            <a href="javascript:void(0);" class="GPUBtn01" onClick="getPointControl.commitCommand(this)">确认调度</a>'
//		    		+'        </div>'
//		    		+'    </div>'
		    		+'<div class="PSBGisPageBox02">'
		    		+'    <input name="" type="text" id="dzwlToPageNum">'
		    		+'    <a href="javascript:void(0)" class="PSBGisBut03" id="dzwlToPageNo" style="margin-right:10px;">跳转</a>'
		    		+'    <a href="javascript:void(0)" class="PSBGisBut03_no" id="dzwlLastPageSearch" >上一页</a>'
		    		+'    <div class="PSBGisPageBox02_number"><span id="dzwlPageNo">1</span><span>/</span><span id="dzwlPageSize">1</span></div>'
		    		+'    <a href="javascript:void(0)" class="PSBGisBut03" id="dzwlNextPageSearch">下一页</a>'
		    		+'    <div class="clear"></div>'
		    		+'</div>'
		    		+'    </div>'
		    		+'    <div class="NPopUpBox02_line01"></div>'
		    		+'    <div class="NPopUpBox02_line02"></div>'
		    		+'    <div class="NPopUpBox02_j01"></div>'
		    		+'    <div class="NPopUpBox02_j02"></div>'
		    		+'    <div class="NPopUpBox02_j03"></div>'
		    		+'    <div class="NPopUpBox02_j04"></div>'
		    		+'    <div class="NPopUpBox02_j05"></div>'
		    		+'    <div class="NPopUpBox02_j06"></div>'
		    		+'    <div class="NPopUpBox02_j07" style="display:none;"></div>'
		    		+'    <div class="NPopUpBox02_j08" style="display:none;"></div>'
		    		+'</div>';
    	
    	return html;
    },
    
    toElecFence : function (caseId, recordTime, lon, lat) {
    	top.oldShowCaseRefFocalManUI = top.showCaseRefFocalManUI;
    	top.xyrtjDialog = $.fn.scienceDialog({
			url : 'toXyrtj.do?caseId='+caseId+'&recordTime='+recordTime + '&lon=' + lon + '&lat=' + lat,
			width:'auto',
			height:'auto',
			logo : false,
			close: function() {
				top.xyrtjDialog=null;
				top.gisInteraction = window.gisInteraction;
				top.showCaseRefFocalManUI = top.oldShowCaseRefFocalManUI;
			}
		});
    },
    
    CLASS_NAME : "GetPointControl"
    
    }

function backToAddCasePage() {
    if(parent.bottomFrame.yqMap){
        parent.bottomFrame.yqMap.close();
    }else{
        parent.yqMap.close();
    }
}

//警情提请合成
function fqyp(jjdbh){
    $.ajax({
       url:"fqypByjjh.do?isYP=1&jjh="+jjdbh,
       success:function(res){
          var res = eval("("+res+")");
          var caseId = res.resp;
          if(max != ""){
            toFQYP(caseId);
          }else{
            parent.toFQYP(caseId);
          }
       }
    })
}

var jqypPop = null;
function toFQYP(caseId) {
         //先判断是否可以提请合成
        var repeat = true;
        jQuery.ajax({
            async:false,
            url:"checkRepeatYP?caseId="+caseId,
            success:function(res){
               res = eval("("+res+")");
               repeat = res.result;
            }
        })
        if(!repeat){
           fadingTip("您已对该案件发起过研判,请不要重复提交",3000);
           return;
        }
        var url = 'url:fqypDetail.do?caseId=' + caseId + "&isEdit=1";
        jqypPop = jQuery.dialog({
            title: top.tqhcTitle,
            content: url,
            resize: false,
            lock: true,
            drag: false,
            width: '1100px',
            height: window.screen.availHeight-(40*2)-40,
            top: '43px',
            max: false,
            min: false,
            close: function () {
                jqypPop = null;
            }
        });
}

function dealCaseEvent(caseId){
        parent.sendMsgToClient(533, "案件侦办@caseInvestigation.do?caseId="+caseId, "disposeAlarm");
        parent.sendMsgToClient(444,caseId, "disposeAlarm");
}

//处理警情
function dealJQ(jjdbh){
    $.ajax({
       url:"fqypByjjh.do?jjh="+jjdbh,
       success:function(res){
          var res = eval("("+res+")");
          var caseId = res.resp;
          if(max != ""){
              dealCaseEvent(caseId);
          }else{
              parent.dealCaseEvent(caseId);
          }
       }
    })
}

//警情定位
function locateJQ(jjdbh){
    popupControl.closePopUpwin();
    jhpopupControl.closePopUpwin();
    window.top.curJJH = jjdbh;
    clickType = 12;
	mshp(10);
	showFadingTipDiv("点击地图取点");
}

function caseMerge(caseId){
	var url = 'toRecommendCasePage.do?caseId='+caseId+'&time=' + new Date();
	var top=100;
	
	caseRecommendDialog = jQuery.fn.scienceDialog({
	    url : url,
	    zIndex : 999999,
		width:'auto',
		height:'auto',
	    top:'1',
	    close:function(){
	    	caseRecommendDialog = null;
        }
	});
}

/**
 * 派出所现场 采集反馈
 */
function toPcsCollectFk(caseCode){
    top.pcsCollectFk = jQuery.fn.scienceDialog({
	    url : 'toPcsCollectFk.do?jjdbh='+caseCode+'&type=case',
	    zIndex : 999999,
		width:'auto',
		height:'auto',
	    close:function(){
           top.pcsCollectFk = null;
       }
	});
}

/**
 * 刑事技术现场 采集反馈
 */
function toXsjsCollectFk(caseCode){
    top.xsjsCollectFk = jQuery.fn.scienceDialog({
	    url : 'toXsjsCollectFk.do?jjdbh='+caseCode+'&type=case',
	    zIndex : 999999,
		width:'auto',
		height:'auto',
	    close:function(){
	    	parent.window.queryCaseBoard();
            top.xsjsCollectFk = null;
       }
	});
}

/**
 * 现勘人员指派
 */
function toXkryPf(caseCode, gxdwdm, longitude, latitude){
	//关闭弹框
	$('#popup-closer').click();
	var html = getManualCommandHtml(caseCode, gxdwdm, longitude, latitude);
	
    var id = "aj_" + caseCode;
    window.gisInteraction.clearPopup(id);
    window.gisInteraction.showPopup(id, longitude*1, latitude*1, html, true);
    
    getPointControl.queryPolice(caseCode, gxdwdm, longitude, latitude);
}

function getManualCommandHtml(caseCode, gxdwdm, longitude, latitude){
	var html = $('#policeSearchhtml').html();
	html = html.replace('%id', 'queryPoliceList');
	html = html.replace(/%jjdbh/g, caseCode);
	html = html.replace(/%gxdwdm/g, "''");
	html = html.replace(/%longitude/g, longitude);
	html = html.replace(/%latitude/g, latitude);
	return html;
}

//加载基础图层控件，页面需要引用#parse("o3/popUp/yanpanPopups.vm")
//以及<script type="text/javascript" src="resource/js/o3/BasalResourcesLayerControl.js?version=1.01" ></script>
function initialBasalResourcesLayerControl(map){
	var style = {
	    MenuSwitcherVisible: true,
	    collapse: false,
	    defualtShowLayerList: false,
	    defualtDockAndAlign: true,
	    top: 5,
	    right: 5,
		JKD: true,
//	    JZ: true,
//	    JWT: true,
//	    DT: true,
	    ZRQ: true,
//	    FocalDept: true,
		FACE_JKD: true,
//      FocalMan: true,
        Hotel: true,
        Netbar: true,
        carKK : true,
        AJ: false,
        JQ: false,
        wifi: true,
        elecFence: true,
//      keyArea:true,
        carKK_Checked: true,
        JKD_Checked: true,
        elecFence_Checked: true
	};
	basalResourcesLayerControl = new BasalResourcesLayerControl(map, style);
	basalResourcesLayerControl.addLayerNode("案件分布", true, function (checked) {
		top.window.jqPointControl.vectorLayer.setVisible(checked);
		top.window.jqPointControl.heatmapLayer.setVisible(checked);
	});
}