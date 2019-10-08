/**
 * @(#)MobileSiteLayerControl.js
 * 
 * @description: 监控室图层
 * @author: 李小龙 2015/11/16
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */

var MonitorHouseLayerControl = function(){
	this.init.apply(this, arguments);
}

MonitorHouseLayerControl.prototype ={
		map:null,
		monitorHouseLayerSource : null,
		vectorLayer : null,
		init : function(map){
			this.map = map;
			this.monitorHouseLayerSource = new ol.source.Vector({});
			this.vectorLayer = new ol.layer.Vector({
				name : "monitorHouseLayer",
				source:this.monitorHouseLayerSource
			});
			map.addLayer(this.vectorLayer);
			this.getMobileSiteLayer();
		},
		/*
		 * 获取信息
		 */
		getMobileSiteLayer : function(){
			var monitorHouseLayerStyle = new ol.style.Style({
				image: new ol.style.Icon(({
					opacity: 1,
					src: "resource/images/newtoolbar/jks32.png"
				}))
			});
			var result = [
					{
						name : "监控室1",
						lon : 114.4013,
						lat : 30.5239
					},
					{
						name : "监控室2",
						lon : 114.4003,
						lat : 30.5078
					},
					{
						name : "监控室3",
						lon : 114.4171,
						lat : 30.5170
					},
					{
						name : "监控室4",
						lon : 114.3823,
						lat : 30.5078
					}
				];
			var iconFeatures=[];
			for(var i=0;i<result.length;i++){
				var contentTemp = result[i];
				if(contentTemp.lat != null && contentTemp.lon != null){
					var iconFeature = new ol.Feature({
						geometry: new ol.geom.Point([result[i].lon, result[i].lat]),
						content : result[i]
					});
					iconFeature.setStyle(monitorHouseLayerStyle);
					iconFeatures.push(iconFeature);
				}
			}
			this.monitorHouseLayerSource.addFeatures(iconFeatures);
		},
		CLASS_NAME : "MonitorHouseLayerControl"
}