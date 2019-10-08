/**
 * @(#)PositionSearchControl.js
 * 
 * @description: 地址信息搜索-单点摸排
 * @author: 肖振亚 2016/7/15
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
var PositionSearchControl = function(){
	this.init.apply(this, arguments);
}

PositionSearchControl.prototype ={

	map:null,

	caseId : null,
	positionSearchSource : null,
	vectorLayer:null,
	id : null,
	file_id : null,

	init : function(map,caseId){

	this.map = map;
	this.caseId = caseId;


	this.positionSearchSource = new ol.source.Vector({});

	this.vectorLayer = new ol.layer.Vector({
		name : "positionSearchLayer",
		source:this.positionSearchSource,
	});

	map.addLayer(this.vectorLayer);

	this.getSets();



},


getSets : function(){
	var _self = this;
	ZT.Utils.Ajax().request("queryPositionSearch.do?",{
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
					}else{
						var cor = [result[i].longitude, result[i].latitude];
					}
					var iconFeature = new ol.Feature({
						geometry: new ol.geom.Point(cor),
						content : result[i],

					});
					if(result[i].topicType==1){
						iconFeature.setStyle(jiudianStyle);
					}else if(result[i].topicType==2){
						iconFeature.setStyle(netBarStyle);
					}else{
						iconFeature.setStyle(wifiStyle);
					}
					iconFeatures.push(iconFeature);
				}
			}			_self.positionSearchSource.addFeatures(iconFeatures);
		}

	},
	failure : function(resobj){
		alert("服务端异常,加载地图标记失败!");	
	}
	});
},


addpopUp : function(content){
		var _self = this;
		_self.id=content.id;
		_self.file_id=content.file_id;
		var desc=content.file_id;
	var text= document.getElementById("positionSearchPopUp").innerHTML
		var prefixStr = "yanpanSocialResPointPopup_"; 
		var uniqueId = new Date().getTime();	
	   var containerDivId = prefixStr+"containerDiv_"+uniqueId;

	text = text.replace(/%name/g,content.topicName);
	text = text.replace("%lon",content.longitude);
	text = text.replace("%lat",content.latitude);
	text = text.replace("%addr",content.topicAddr);
	text = text.replace("%lxrName",content.lxrName);
	text = text.replace("%lxrTel",content.lxrTel);
	if(content.topicType=="1"){
		text = text.replace("%desc","酒店");
	}else if(content.topicType=="1"){
		text = text.replace("%desc","网吧");
	}else{
		text = text.replace("%desc","wifi");
	}


	popupControl.showPopUpWin(text,[content.longitude,content.latitude]);

},

clear : function(){
	this.positionSearchSource.clear();
},

CLASS_NAME : "PositionSearchControl"

}