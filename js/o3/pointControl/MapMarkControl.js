/**
 * @(#)MapMarkControl.js
 * 
 * @description: 地图标记管理
 * @author: 张添 2015/11/2
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
var MapMarkControl = function(){
	this.init.apply(this, arguments);
}

MapMarkControl.prototype ={

	map:null,

	caseId : null,

	mapMarkSource : null,
	vectorLayer:null,


	init : function(map,caseId){

	this.map = map;
	this.caseId = caseId;


	this.mapMarkSource = new ol.source.Vector({});

	this.vectorLayer = new ol.layer.Vector({
		name : "mapMarkLayer",
		source:this.mapMarkSource
	});

	map.addLayer(this.vectorLayer);

	this.getSets();



},


getSets : function(){
	var _self = this;
	ZT.Utils.Ajax().request("queryPhonePoint.do?",{
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
				if(result[i].latitude != null && result[i].longitude != null){
					
					if(clientGISKind==clientGISKinds.OFFLINEGIS){
						var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(result[i].longitude,result[i].latitude), 'EPSG:4326', 'EPSG:3857');
						//var cor = ol.proj.transform([result[i].longitude, result[i].latitude], 'EPSG:4326', 'EPSG:3857');
					}else{
						var cor = [result[i].longitude, result[i].latitude];
					}
					
					/*var iconFeature = new ol.Feature({
						geometry: new ol.geom.Point(cor),
						content : result[i]

					});

					if(result[i].type == 1){
						iconFeature.setStyle(mapMarkStyle_Phone);
					}
					else if(result[i].type == 2){
						iconFeature.setStyle(mapMarkStyle_Car);
					}else if(result[i].type == 3){
						iconFeature.setStyle(mapMarkStyle_YHK);
					}else if(result[i].type == 4){
						iconFeature.setStyle(mapMarkStyle_ZW);
					}else if(result[i].type == 5){
						iconFeature.setStyle(mapMarkStyle_DNA);
					}
					iconFeatures.push(iconFeature);*/
				}
			}

			_self.mapMarkSource.addFeatures(iconFeatures);

		}

	},
	failure : function(resobj){
		alert("服务端异常,加载地图标记失败!");	
	}
	});
},

//添加地图标记点
addMapMarkMarker : function (pointType,lon,lat){
	this.delMakerById("mapMarkPoint");
	var feature = new ol.Feature({
		geometry: new ol.geom.Point([lon,lat]),
	});
	feature.setId("mapMarkPoint");
	/*if(mapMarkType == 1){
		feature.setStyle(mapMarkStyle_Phone);
	}else if(mapMarkType == 2){
		feature.setStyle(mapMarkStyle_Car);
	}else if(mapMarkType == 3){
		feature.setStyle(mapMarkStyle_YHK);
	}else if(mapMarkType == 4){
		feature.setStyle(mapMarkStyle_ZW);
	}else if(mapMarkType == 5){
		feature.setStyle(mapMarkStyle_DNA);
	}*/

	this.mapMarkSource.addFeature(feature);
},

//删除临时点
delMakerById : function(lid){
	var feature = this.mapMarkSource.getFeatureById("mapMarkPoint");
	if(feature){
		this.mapMarkSource.removeFeature(feature);
	}
},

addpopUp : function(content){
	var text= document.getElementById("mapMarkPopUp").innerHTML;
	text = text.replace(/%name/g,content.name);
	text = text.replace("%createtime",getDateString(content.createtime*1).nowTime);
	text = text.replace("%lon",content.longitude);
	text = text.replace("%lat",content.latitude);
	text = text.replace("%desc",content.labelDesc);

	popupControl.showPopUpWin(text,[content.longitude,content.latitude]);
	
	var obj = $('#popup-content');
	var yqgetpoint =  $('#yqgetpoint').val();
	//研判报告初始化图层 侦查报告中显示的气泡，不需要编辑和删除操作
	if(yqgetpoint==2){
		//删除
		obj.find(".btns_box_1").eq(0).hide();
	//案件侦办页面
	}else{
		//删除
		obj.find("a[aliasid='delPointBtn']").click(function(){
			popupControl.closePopUpwin();
			jQuery.dialog.confirm("确认删除地图标记点？", function(){
				gisInterfaceInMap.deletePhonePointDialog(content.labelId);
				return;
	
			});
		});
		//编辑
		obj.find("a[aliasid='modifyLonLatBtn']").click(function(){
			popupControl.closePopUpwin();
			gisInterfaceInMap.openUpdatePhonePointDialog(content.labelId,content.name,content.longitude,content.latitude,content.labelDesc);
			return;
	
		});
	}
},
clear : function(){
	this.mapMarkSource.clear();
},

CLASS_NAME : "MapMarkControl"

}