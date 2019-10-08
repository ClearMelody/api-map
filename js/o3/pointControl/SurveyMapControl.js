/**
 * @(#)SurveyMapControl.js
 * 
 * @description: 现勘图管理
 * @author: 肖振亚 2015/11/3
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
var SurveyMapControl = function(){
	this.init.apply(this, arguments);
}

SurveyMapControl.prototype ={

	map:null,

	caseId : null,
    imgBig : null,
	surveyMapSource : null,
	vectorLayer:null,
	id : null,
	file_id : null,

	init : function(map,caseId){

	this.map = map;
	this.caseId = caseId;


	this.surveyMapSource = new ol.source.Vector({});

	this.vectorLayer = new ol.layer.Vector({
		name : "surveyMapLayer",
		source:this.surveyMapSource,
	});

	map.addLayer(this.vectorLayer);

	this.getSets();



},


getSets : function(){
	var _self = this;
	ZT.Utils.Ajax().request("querySurveyMapUploadPoint.do?",{
		data : "caseId="+this.caseId,
		success : function(resobj){

		var content = eval("(" + resobj.response + ")");
		var result = content.resp;

		_self.clear();	

		if (result == null || result.length  < 1) {
			// //'查询不到设备列表，请检查数据库连接是否配置正确'; 
			//没有也要把上次结果清除掉
			return;
		}else{
			var iconFeatures=[];

			for(var i=0;i<result.length;i++){
				if(result[i].lat != null && result[i].lon != null){
					
					if(clientGISKind==clientGISKinds.OFFLINEGIS){
						var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(result[i].lon,result[i].lat), 'EPSG:4326', 'EPSG:3857');
//						var cor = ol.proj.transform([result[i].longitude, result[i].latitude], 'EPSG:4326', 'EPSG:3857');
					}else{
						var cor = [result[i].lon, result[i].lat];
					}
					var iconFeature = new ol.Feature({
						geometry: new ol.geom.Point(cor),
						content : result[i],

					});

					
					iconFeature.setStyle(surveyMapStyle);
				
					iconFeatures.push(iconFeature);
				}
			}

			_self.surveyMapSource.addFeatures(iconFeatures);

		}

	},
	failure : function(resobj){
		alert("服务端异常,加载地图标记失败!");	
	}
	});
},

//添加现勘图标记点
addSurveyTempMarker : function (lon,lat){

	this.delMakerById("surveyMapPoint");
	var feature = new ol.Feature({
		geometry: new ol.geom.Point([lon,lat]),
	});
	feature.setId("surveyMapPoint");
	feature.setStyle(surveyMapStyle);
	

	this.surveyMapSource.addFeature(feature);
},

//删除临时点
delMakerById : function(lid){
	var feature = this.surveyMapSource.getFeatureById("surveyMapPoint");
	if(feature){
		this.surveyMapSource.removeFeature(feature);
	}
},

addpopUp : function(content){
		var _self = this;
		_self.id=content.id;
		_self.file_id=content.file_id;
		var imgBig;
		var desc=content.file_id;
		var url="queryOriginalResourceByFileIdx.do?fileIds=" + desc + "&time=" + new Date();
	var text= document.getElementById("surveyMapPopUp").innerHTML
		var prefixStr = "yanpanSocialResPointPopup_"; 
		var uniqueId = new Date().getTime();	
	   var containerDivId = prefixStr+"containerDiv_"+uniqueId;

	text = text.replace(/%name/g,content.name);
	text = text.replace("%lon",content.lon);
	text = text.replace("%lat",content.lat);			
	   jQuery.ajax({
		type:'POST',
		url:url,
		cache:false,
		success:function(response) {
					    var objlist = eval("(" + response + ")");
					    objlist = objlist.resp;
					    if(objlist == null || objlist.length < 1) {
					    	var idSliderStr = "";
					    	var idNumStr = "";
					    	idSliderStr = '<div style="POSITION: relative"><a ><img src="resource/images/img_bg.png" width="160" height="120" style="margin-left: -58px;"></a></div>';
					    	idNumStr = '<li><img src="resource/images/img_bg.png" width="30" height="24"></li>';
					    	$("#idSlider").html(idSliderStr);
					    	$("#idNum").html(idNumStr);
					    	var jsStr = " <script language=javascript>showPic('idNum','idTransformView','idSlider',120,1,true,2000,5,true,'onmouseover');//按钮容器aa，滚动容器bb，滚动内容cc，滚动宽度dd，滚动数量ee，滚动方向ff，延时gg，滚动速度hh，自动滚动ii，</script>";
					    	$("#yanpanSocialResPointPopupTemplateContainerx").append(jsStr);
					    	return;
					    }
					    _self.imgBig=objlist;
					    var list = objlist;
					    var idSliderStr = "";
					    var idNumStr = "";
					    var ImgUrl = "resource/images/newtoolbar/kct32.png"
					    for(var i=0; i<list.length; i++) {
					    	var obj = list[i];
					    	if(obj != null) {
					    		idSliderStr += '<div style="POSITION: relative"><a><img src= "'+objlist+'" width="160" height="120" style="margin-left: -58px;"></a></div>';
					    		//idNumStr += '<li><img src= "'+objlist+'" width="30" height="24"></li>';
					    	}
					    }
					    $("#idSlider").html(idSliderStr);
					    $("#idNum").html(idNumStr);
					    var jsStr = " <script language=javascript>showPic('idNum','idTransformView','idSlider',120,"+list.length+",true,2000,5,true,'onmouseover');//按钮容器aa，滚动容器bb，滚动内容cc，滚动宽度dd，滚动数量ee，滚动方向ff，延时gg，滚动速度hh，自动滚动ii，</script>";
					    $("#yanpanSocialResPointPopupTemplateContainerx").append(jsStr);
					    //为图片注册看大图事件
					    $("#idTransformView").find('img').each(function(index, domEle) { 
					    	$(domEle).click(function(){
					    			//alert($(this).attr('src'));
							    	gisInterfaceInMap.imgPreview($(this).attr('src'));
							 }) 
					    });
			}
		});
	   

	popupControl.showPopUpWin(text,[content.lon,content.lat]);
	
	var _self = this;
	var obj = $('#popup-content');

	//删除
	obj.find("a[aliasid='delSurveyBtn']").click(function(){
		        popupControl.closePopUpwin();
		        new ConfirmDialog("确认删除现勘图？", function(){
				gisInterfaceInMap.deleteSurveyMapCatalogDialog(content.id);
		        			 //	_self.getSets();
			});
	})

	//编辑
	obj.find("a[aliasid='editSurveyBtn']").click(function(){
		popupControl.closePopUpwin();
		parent.parent.sendMsgToClient(451,content.id+"@"+content.file_id+"@"+content.lon+"@"+content.lat);
		return;

	})
	//定位
	 obj.find("a[aliasid='surveyLocation']").click(function(){
		popupControl.closePopUpwin();
		mshp(10);
        window.clickType = 7;
		return;
		}) 
	
	//查看
	obj.find("a[aliasid='surveyLook']").click(function(){
         gisInterfaceInMap.imgPreview(_self.imgBig);
        });

},

clear : function(){
	this.surveyMapSource.clear();
},

CLASS_NAME : "SurveyMapControl"

}