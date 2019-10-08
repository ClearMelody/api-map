/**
 * @(#)PoliceMapControl.js
 * 
 * @description: 警力分布
 * @author: 肖振亚 2015/11/3
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
var PoliceMapControl = function(){
	this.init.apply(this, arguments);
}

PoliceMapControl.prototype ={

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
		name : "policeMapLayer",
		source:this.surveyMapSource,
	});

	map.addLayer(this.vectorLayer);

	this.getSets();



},


getSets : function(){
	var _self = this;
	ZT.Utils.Ajax().request("queryPoliceMapPoint.do?",{
		data : "caseId="+this.caseId,
		success : function(resobj){

		var content = eval("(" + resobj.response + ")");
		var result = content.resp;
		var xHtml="";
		_self.clear();	

		if (result == null || result.length  < 1) {
			// //'查询不到设备列表，请检查数据库连接是否配置正确'; 
			//没有也要把上次结果清除掉
			return;
		}else{
			var iconFeatures=[];

			for(var i=0;i<result.length;i++){
				if(result[i].latitude != null && result[i].longitude != null){
					
					if(clientGISKind==clientGISKinds.OFFLINEGIS){
						var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(result[i].longitude,result[i].latitude), 'EPSG:4326', 'EPSG:3857');
//						var cor = ol.proj.transform([result[i].longitude, result[i].latitude], 'EPSG:4326', 'EPSG:3857');
					}else{
						var cor = [result[i].longitude, result[i].latitude];
					}
					var iconFeature = new ol.Feature({
						geometry: new ol.geom.Point(cor),
						content : result[i],

					});
					xHtml+='<li><a id=police_'+i +' lon="'+result[i].longitude +'" lat="'+result[i].latitude+'"><img src="resource/images/pls_01.png" width="16" height="16" />'+result[i].realName+'</a></li>';
					iconFeature.setStyle(policeMapStyle);
				
					iconFeatures.push(iconFeature);
				}
			}
//			$("#policeDistruList").html(xHtml);
			_self.surveyMapSource.addFeatures(iconFeatures);
			//线下警力定位闪烁
			for(var i=0;i<result.length;i++){
				$('#police_'+i).click(function(){
					var tmp_self = $(this);
					var tmpLon = tmp_self.attr("lon");
					var tmpLat = tmp_self.attr("lat");
					if(tmpLon!=null && tmpLon!=0 && tmpLon!= "undefined"
						&& tmpLat!=null && tmpLat!=0 && tmpLat!= "undefined"){
						timeId = setTimeout(function(){
						if(map.getView().getZoom() < propertyZoom){
							map.getView().setZoom(propertyZoom);
							map.getView().setCenter([tmpLon*1,tmpLat*1]);
						}else{
							map.getView().setCenter([tmpLon*1,tmpLat*1]);
						}
						
						centerCrossEffect.startAnimate(tmpLon*1,tmpLat*1);
						},300);	
					}
				});
			}
			// 关闭图层选择框
			f1 = function() {
				$("#policeDistru").hide();
			};
			$("#PSBClosePolice").bind("click", f1);
		}

	},
	failure : function(resobj){
		alert("服务端异常,加载地图标记失败!");	
	}
	});
},

//添加现勘图标记点
addSurveyTempMarker : function (lon,lat){

	this.delMakerById("policeMapPoint");
	var feature = new ol.Feature({
		geometry: new ol.geom.Point([lon,lat]),
	});
	feature.setId("policeMapPoint");
	feature.setStyle(policeMapStyle);
	

	this.surveyMapSource.addFeature(feature);
},

//删除临时点
delMakerById : function(lid){
	var feature = this.surveyMapSource.getFeatureById("policeMapPoint");
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
	var text= document.getElementById("policeMapPopUp").innerHTML
		var prefixStr = "yanpanSocialResPointPopup_"; 
		var uniqueId = new Date().getTime();	
	   var containerDivId = prefixStr+"containerDiv_"+uniqueId;

	text = text.replace(/%name/g,content.realName);
	text = text.replace("%lon",content.longitude);
	text = text.replace("%lat",content.latitude);			
	text = text.replace("%desc",content.remark);

	popupControl.showPopUpWin(text,[content.longitude,content.latitude]);
	
	var _self = this;
	var obj = $('#popup-content');

	//删除
	obj.find("a[aliasid='delSurveyBtn']").click(function(){
		        popupControl.closePopUpwin();
		jQuery.dialog.confirm("确认删除现勘图？", function(){
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

CLASS_NAME : "PoliceMapControl"

}