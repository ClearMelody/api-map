/**
 * @(#)UnmannedPlaneControl.js
 * 
 * @description: 无人机管理
 * @author: 肖振亚 2015/11/3
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
var UnmannedPlaneControl = function(){
	this.init.apply(this, arguments);
}

UnmannedPlaneControl.prototype ={

	map:null,

	caseId : null,

	unmannedPlaneSource : null,
	vectorLayer:null,


	init : function(map,caseId){

	this.map = map;
	this.caseId = caseId;


	this.unmannedPlaneSource = new ol.source.Vector({});

	this.vectorLayer = new ol.layer.Vector({
		name : "unmannedPlaneLayer",
		source:this.unmannedPlaneSource
	});

	map.addLayer(this.vectorLayer);

	this.getSets();

},


getSets : function(){
	var _self = this;
	ZT.Utils.Ajax().request("queryUnmannedPlaneImage.do?",{
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
						//var cor = ol.proj.transform([result[i].longitude+ 0.0060, result[i].latitude- 0.0027], 'EPSG:4326', 'EPSG:3857');
					}else{
						var cor = [result[i].lon, result[i].lat];
					}
					
					var iconFeature = new ol.Feature({
						geometry: new ol.geom.Point(cor),
						content : result[i]

					});

					
					iconFeature.setStyle(unmannedPlaneStyle);
				
					iconFeatures.push(iconFeature);
				}
			}

			_self.unmannedPlaneSource.addFeatures(iconFeatures);

		}

	},
	failure : function(resobj){
		alert("服务端异常,加载地图标记失败!");	
	}
	});
},

//添加无人机标记点
addPlaneTempMarker : function (lon,lat){

	this.delMakerById("unmannedPlanePoint");
	var feature = new ol.Feature({
		geometry: new ol.geom.Point([lon,lat]),
	});
	feature.setId("unmannedPlanePoint");
	feature.setStyle(unmannedPlaneStyle);
	

	this.unmannedPlaneSource.addFeature(feature);
},

//删除临时点
delMakerById : function(lid){
	var feature = this.unmannedPlaneSource.getFeatureById("unmannedPlanePoint");
	if(feature){
		this.unmannedPlaneSource.removeFeature(feature);
	}
},

addpopUp : function(content){
	var text= document.getElementById("unPlanePopUp").innerHTML
	text = text.replace(/%name/g,content.name);
	text = text.replace(/%addr/g,content.addr);
	text = text.replace(/%madeBy/g,content.madeby);
	text = text.replace(/%contactTelephone/g,content.contact_telephone);
	text = text.replace(/%description/g,content.description);
	text = text.replace(/%fileName/g,content.file_name);
	text = text.replace("%lon",content.lon);
	text = text.replace("%lat",content.lat);			


	popupControl.showPopUpWin(text,[content.lon,content.lat]);
	
	var _self = this;
	var obj = $('#popup-content');

	//删除
	obj.find("a[aliasid='delUnmannedPlaneImageLayerPointBtn']").click(function(){
		        popupControl.closePopUpwin();
				jQuery.dialog.confirm("是否删除无人机航拍图？",function(){
						if(content.id){
							_self.delMakerById(content.id);
							//参数：操作类型，标记类型，id
							var msgString = content.id;
                            var imgArrDelStr=content.url;
							var url = "deleteUnmannedPlaneImageLayerById.do?"
								+"id=" + content.id+"&imgArrDelStr=" + imgArrDelStr
								+"&time="+new Date().getTime();
			                jQuery.ajax({
			                type:'POST',
			                url:url,
			                cache:false,
			                success:function(msg) {
				            if(!msg) return;
				            var rs = eval("(" + msg + ")");
				            if(rs.errorCode == "0") {
					        _self.getSets();
					//fadingTip("删除成功。");
				}else if(rs.errorCode == "1") {
					fadingTip("有关联的线索，不能删除。");
				}else {
					fadingTip("删除失败！");
				}
				caseInvestigation.submitFlg = 0;
			}
		});
						}
					});
	})

	//编辑
	obj.find("a[aliasid='modifyUnmannedPlaneImageLayerLonLatBtn']").click(function(){
		popupControl.closePopUpwin();
		gisInterfaceInMap.openUpdateUnmannedPlaneImageLayerDialog(content.id,content.name,content.longitude,content.latitude,content.labelDesc);
		return;

	})
	
	//查看
	obj.find("a[aliasid='openFileBtn']").click(function(){
		var host = window.location.host;
		var url = "http://"+host+ content.url;
        parent.parent.sendMsgToClient(461,url);});

},

clear : function(){
	this.unmannedPlaneSource.clear();
},

CLASS_NAME : "UnmannedPlaneControl"

}