/**
 * @(#)GetPointControl.js
 * 
 * @description: 添加疑情管理
 * @author: 肖振亚 2015/11/3
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
var GetPointControl = function(){
	this.init.apply(this, arguments);
}

GetPointControl.prototype ={

	map:null,

	caseId : null,

	casePointSource : null,
	vectorLayer:null,
	//前后追
	trackevt : null,

	init : function(map,caseId){

	this.map = map;
	this.caseId = caseId;


	this.casePointSource = new ol.source.Vector({});

	this.vectorLayer = new ol.layer.Vector({
		name : "casePointLayer",
		source:this.casePointSource,
	});

	map.addLayer(this.vectorLayer);

	this.caseInvestigationInit(caseId);



},
caseInvestigationInit : function(caseId)
{
		gisInterfaceInMap = new fhGisInterfaceInMapClass();
		var yqgetpoint =  $('#yqgetpoint').val();
		this.casePointSource.clear();
	//新建案件时在地图上取点获取经纬度
	if(yqgetpoint == 1) {
		$("#gisBackBtn").show();
		mshp(10);
		//取点图层
	    window.clickType = 4;
		//getPointLyer = new OpenLayers.GetPointLayer(map);
		//在地图上添加已经选择的点
	    //var lon = parent.datamap.get("caseLongitude");
	    //var lat = parent.datamap.get("caseLatitude");
	    
	    var lon = $(top.yqDialog.iframe.contentDocument.getElementById("caseLongitude")).val();
	    var lat = $(top.yqDialog.iframe.contentDocument.getElementById("caseLatitude")).val();
	    
	    //var lon =  parent.$('#caseLongitude').val();
	    //var lat =  parent.$('#caseLatitude').val();
	    
	    if(lon != "" && lat != ""){
	    	
	    	if(clientGISKind==clientGISKinds.OFFLINEGIS){
				var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(lon*1,lat*1), 'EPSG:4326', 'EPSG:3857');
//				var cor = ol.proj.transform([lon*1,lat*1], 'EPSG:4326', 'EPSG:3857');
				lon = cor[0];
				lat = cor[1];
				propertyZoom = propertyZoom+3;
			}
	    	
	    	this.addPointMarker(lon,lat);
			map.getView().setCenter([lon,lat]);
	        map.getView().setZoom(propertyZoom);
	    }
	}
	else {
	var _self = this;
	ZT.Utils.Ajax().request("getCaseById.do?",{
		data : "caseId="+this.caseId,
		success : function(resobj){

		var content = eval("(" + resobj.response + ")");
		var result = content.resp;

		_self.clear();	
		var lon=result.caseLongitude;
		var lat=result.caseLatitude;
		//_self.addPointMarker(lon,lat);
		
		if(clientGISKind==clientGISKinds.OFFLINEGIS&&lon!=""){	
			var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(lon*1,lat*1), 'EPSG:4326', 'EPSG:3857');
//			var cor = ol.proj.transform([lon*1 + 0.0060 ,lat*1 - 0.0027], 'EPSG:4326', 'EPSG:3857');
			lon = cor[0];
			lat = cor[1];
		}
		
		var iconFeature = new ol.Feature(
			{
				geometry: new ol.geom.Point([lon,lat]),
				content : result
			}
		);
		
		iconFeature.setStyle(newCaseStyle);		
		//iconFeatures.push(iconFeature);
		_self.casePointSource.addFeature(iconFeature);
//		map.getView().setCenter([lon,lat]);
//        map.getView().setZoom(propertyZoom);
	},
	failure : function(resobj){
		alert("服务端异常,加载地图标记失败!");	
	}
	});
		}
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
	   feature.setStyle(newCaseStyle);
	
	   
	  this.casePointSource.addFeature(feature);
	},

//删除临时点
delMakerById : function(lid){
	var feature = this.casePointSource.getFeatureById("mapMarkPoint");
	if(feature){
		this.casePointSource.removeFeature(feature);
	}
},

clear : function(){
	this.casePointSource.clear();
},
addpopUp : function(content){
	var caseCode = content.caseCode.substring(0,1);
	var text= document.getElementById("casePopUp").innerHTML
	text = text.replace(/%casename/g,content.casename);
	text = text.replace(/%caseId/g,content.caseCode);
	text = text.replace(/%leibie/g,content.leibie);
	text = text.replace(/%caseOrigin/g,content.caseOrigin);
	text = text.replace(/%caseStatus/g,content.caseStatus);
	text = text.replace(/%happenTimeUpder/g,dealWithParam(getDateString(content.discoverTime)).nowTime);
	text = text.replace(/%happenAddr/g,content.happenAddr);
	text = text.replace("%caseLongitude",content.caseLongitude);
	text = text.replace("%caseLongitude",content.caseLatitude);
	text = text.replace(/%simpleCaseCondition/g,content.simpleCaseCondition);


	popupControl.showPopUpWin(text,[content.caseLongitude,content.caseLatitude]);
	if(content.isSuspect == 1){
		$(".isSuspect").hide();
	}
	var _self = this;
	var obj = $('#popup-content');
	if(caseCode == 'Q'){
		obj.find("a[aliasid='caseRelationMan']").hide();
	}else{
	    obj.find("a[aliasid='caseRelationMan']").show();
	}
	var coor = [content.caseLongitude,content.caseLatitude];
		        //展开详细按钮
	         obj.find("a[aliasid='expandDetailBtn']").click(function(){
	        	 var tmpObj = obj.find("div[aliasid='detailDiv']");
	        	//展开
	        	 if(tmpObj.css('display')=='none'){
	        	   tmpObj.show();
	        	   $(this).find("img").attr("src","resource/images/pageIcon/popupup.png");
	        	   var mapHei = $('#map').height();
	        	   var mapWid = $('#map').width();
	        	   //弹窗被遮盖的处理
	        	   var overlayYdiff = mapHei-obj.height()-obj.css('top').replace("px","")*1.0;
	        	   var overlayXdiff = mapWid-obj.width()-obj.css('left').replace("px","")*1.0;
	        	   if(overlayYdiff<0){
	        	     obj.css('top',(mapHei-obj.height()-4)+'px');
	        	   }
	        	   /*if(overlayXdiff<0){
	        	     obj.css('left',(mapHei-obj.width()-2)+'px');
	        	   }*/
	        	 }else{
	        	  tmpObj.hide();
	        	   $(this).find("img").attr("src","resource/images/pageIcon/popupdown.png");
	        	 }
	        });
	                //关闭按钮
	        obj.find("a[aliasid='closeBtn']").click(function(){
	        	 obj.fadeOut("slow");
		    	 obj.remove();
	        });
	        	                //智能搜索按钮
	        obj.find("a[aliasid='seachFirstPoint']").click(function(){
	        	 lineTrackControl.trackCaseWin(coor,1);
	        });
	         
	        obj.find("a[aliasid='caseRefFocalMan']").click(function(){
	        	 var lon = content.caseLongitude * 1.0;
	             var lat = content.caseLatitude * 1.0;
	        	 top.showCaseRefFocalManUI(lon,lat);
	        });
	        
	        obj.find("a[aliasid='relativePerson']").click(function(){ // 打处人员 
	        	 var lon = content.caseLongitude * 1.0;
	             var lat = content.caseLatitude * 1.0;
	             top.showRelativePersonUI(lon, lat, content.caesId, content.leibie);
	        });
	        
	        obj.find("a[aliasid='caseRelationMan']").click(function(){ // 涉案人员
	        	 var lon = content.caseLongitude * 1.0;
	             var lat = content.caseLatitude * 1.0;
	        	 top.showCaseRefFocalManUI(lon, lat, content.caseId);
	        });

},
CLASS_NAME : "GetPointControl"

}

function backToAddCasePage() {
	if(top.frames&&top.frames.yqMap){
		top.frames.yqMap.close();
	}else{
		top.window.yqMap.close();
	}
}
