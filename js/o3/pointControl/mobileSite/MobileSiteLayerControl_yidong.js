/**
 * @(#)MobileSiteLayerControl.js
 * 
 * @description: 移动基站
 * @author: 张添 2015/12/07
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */

var MobileSiteLayerControl_yidong = function(){
	this.init.apply(this, arguments);
}

MobileSiteLayerControl_yidong.prototype ={
		map:null,
		mobileSiteLayerSource : null,
		vectorLayer : null,
		
		tempContent : "",
		
		init : function(map){
			this.map = map;

			var esrijsonFormat = new ol.format.EsriJSON();

			var mobileSiteLayerSource = new ol.source.Vector({
				loader: function(extent, resolution, projection) {
					var _self = this;
					if(map.getView().getZoom() > 6){
						var url = 'http://100.16.3.40:6080/arcgis/rest/services/wuhands/MapServer/8/query/?f=json&' +
						'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
						encodeURIComponent('{"xmin":' + extent[0] + ',"ymin":' +
								extent[1] + ',"xmax":' + extent[2] + ',"ymax":' + extent[3] +
						',"}') +
						'&outFields=*';
						$.ajax({url: url, dataType: 'jsonp', success: function(response) {
							if (response.error) {
								alert(response.error.message + '\n' +
										response.error.details.join('\n'));
							} else {
								// dataProjection will be read from document
								var features = esrijsonFormat.readFeatures(response, {
									featureProjection: projection
								});
								if (features.length > 0) {
									for(var i = 0 ; i < features.length;i++){
//										if(features[i].get("COMPANY") == '移动'){
											features[i].setStyle(mobileStyle_yidong);
//										}else if(features[i].get("COMPANY") == '联通'){
//											features[i].setStyle(mobileStyle_liantong);
//										}else if(features[i].get("COMPANY") == '电信'){
//											features[i].setStyle(mobileStyle_dianxin);
//										}
									}
									mobileSiteLayerSource.addFeatures(features);
								}
							}
						}});
					}else{
//						if(this.mobileSiteLayerSource){
						mobileSiteLayerSource.clear();
//						}
					}
				},
				strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
					tileSize: 512
				}))
			});

			this.vectorLayer = new ol.layer.Vector({
				name : "mobileSiteLayer",
				source:mobileSiteLayerSource
			});
			map.addLayer(this.vectorLayer);
			$("#toolbarp5").show();
			$(".PSBMenu").css("width","391px");
			//this.vectorLayer.setVisible(false);
			//this.getMobileSiteLayer();
		},
		addpopUp : function(feature){
//			var text= document.getElementById("mobileSitePopUp").innerHTML;
//			text = text.replace(/%name/g,feature.get("CNAME"));
//			text = text.replace("%lon",feature.get("LON"));
//			text = text.replace("%lat",feature.get("LAT"));
//			text = text.replace("%lac",feature.get("LAC"));
//			text = text.replace("%cino",feature.get("CINO"));
//			text = text.replace("%address",feature.get("ADDRESS"));
//			text = text.replace("%company",feature.get("COMPANY"));
//
//			
//			this.tempContent += text;
//			
//			popupControl.showPopUpWin(this.tempContent,[feature.get("LON"),feature.get("LAT")]);
			
			var text ="";
			
			text+='<ul><li> ';
			text+=' <a class="SearchResult_but02" hidefocus="true"> ';
			text+='   <span onclick="mobileSiteLayerControl_yidong.showSelectPopUp(this)" cname="'+feature.get("中文名")+'"  LAC="'+feature.get("LAC")+'" CINO="'+feature.get("CI")+'" lon="'+feature.get("经度")+'"  lat="'+feature.get("纬度")+'"  ';
			text+='    address="'+feature.get("地址")+'" company="'+feature.get("运营商")+'" >'+feature.get("中文名")+'  ' +feature.get("运营商") + '</span> ';
			text+=' </a> ';
			text+='</li></ul> ';
			
			this.tempContent += text;
			
			popupControl.showPopUpWin(this.tempContent,[feature.get("经度"),feature.get("纬度")]);
			

		},
		showSelectPopUp : function(obj){
			//$(".list_box_1",$(obj)).css("display","block");
//			var content = $(".list_box_1",$(obj)).html();
			obj = $(obj);
			
			var text= document.getElementById("mobileSitePopUp").innerHTML;
			text = text.replace(/%name/g,obj.attr("cname"));
			text = text.replace("%lon",obj.attr("lon"));
			text = text.replace("%lat",obj.attr("lat"));
			text = text.replace("%lac",obj.attr("LAC"));
			text = text.replace("%cino",obj.attr("CINO"));
			text = text.replace("%address",obj.attr("address"));
			text = text.replace("%company",obj.attr("company"));
			
			popupControl.showPopUpWin(text,[obj.attr("lon"),obj.attr("lat")]);
		},
		queryMobileByArcgis : function(LAC,CINO,curPage,pageSize){
			
			var locateFeature = null;
			
			//移动基站
			var url = 'http://100.16.3.40:6080/arcgis/rest/services/wuhands/MapServer/8/query/?f=json&' +
			'where=LAC+%3D+' + LAC + "+and+CI+%3D+" + CINO + 
			'&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*';
			$.ajax({url: url, dataType: 'jsonp', success: function(response) {
				if (response.error) {
					alert(response.error.message + '\n' +
							response.error.details.join('\n'));
				} else {
							
					if(response.features.length > 0){

						locateFeature = response.features[0];
						
						if(map.getView().getZoom() <= 7){
							map.getView().setZoom(8);
						}
						map.getView().setCenter([response.features[0].attributes.经度*1,response.features[0].attributes.纬度*1]);
						centerCrossEffect.startAnimate(response.features[0].attributes.经度*1,response.features[0].attributes.纬度*1);
						return;
					}else{
						//联通基站
						var url = 'http://100.16.3.40:6080/arcgis/rest/services/wuhands/MapServer/7/query/?f=json&' +
						'where=LAC+%3D+' + LAC + "+and+CI+%3D+" + CINO + 
						'&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*';
						$.ajax({url: url, dataType: 'jsonp', success: function(response) {
							if (response.error) {
								alert(response.error.message + '\n' +
										response.error.details.join('\n'));
							} else {
										
								if(response.features.length > 0){

									locateFeature = response.features[0];
									
									if(map.getView().getZoom() <= 7){
										map.getView().setZoom(8);
									}
									map.getView().setCenter([response.features[0].attributes.经度*1,response.features[0].attributes.纬度*1]);
									centerCrossEffect.startAnimate(response.features[0].attributes.经度*1,response.features[0].attributes.纬度*1);
									
									return;
								}else{
									//电信基站
									var url = 'http://100.16.3.40:6080/arcgis/rest/services/wuhands/MapServer/6/query/?f=json&' +
									'where=LAC+%3D+' + LAC + "+and+CI+%3D+" + CINO + 
									'&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=*';
									$.ajax({url: url, dataType: 'jsonp', success: function(response) {
										if (response.error) {
											alert(response.error.message + '\n' +
													response.error.details.join('\n'));
										} else {
													
											if(response.features.length > 0){

												locateFeature = response.features[0];
												
												if(map.getView().getZoom() <= 7){
													map.getView().setZoom(8);
												}
												map.getView().setCenter([response.features[0].attributes.经度*1,response.features[0].attributes.纬度*1]);
												centerCrossEffect.startAnimate(response.features[0].attributes.经度*1,response.features[0].attributes.纬度*1);
												return;
											}else{
												if(locateFeature == null){
													showFadingTipDiv("没有搜索到该基站！");
												}
												
											}
										}
									}});
								}
							}
						}});
					}
				}
			}});
			
			
			
			
			
			
			
			
		},
		/*
		 * 获取信息
		 */
		getMobileSiteLayer : function(){
			var mobileSiteLayerStyle = new ol.style.Style({
				image: new ol.style.Icon(({
					opacity: 1,
					src: "resource/images/newtoolbar/jzh32.png"
				}))
			});
			var result = [
			              {
			            	  name : "移动基站1",
			            	  lon : 114.4074,
			            	  lat : 30.5250
			              },
			              {
			            	  name : "移动基站2",
			            	  lon : 114.4174,
			            	  lat : 30.5210
			              },
			              {
			            	  name : "移动基站3",
			            	  lon : 114.3581,
			            	  lat : 30.5176
			              },
			              {
			            	  name : "移动基站4",
			            	  lon : 114.3947,
			            	  lat : 30.4920
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
					iconFeature.setStyle(mobileSiteLayerStyle);
					iconFeatures.push(iconFeature);
				}
			}
			this.mobileSiteLayerSource.addFeatures(iconFeatures);
		},
		CLASS_NAME : "MobileSiteLayerControl_yidong"
}