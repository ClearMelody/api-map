/**
 * @(#)KaKouLayerControl.js
 * 
 * @description: 卡口站点
 * @author: 张添 2015/12/16
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */

var KaKouLayerControl = function(){
	this.init.apply(this, arguments);
}

KaKouLayerControl.prototype ={
		map:null,
		kaKouLayerSource : null,
		vectorLayer : null,
		kaKouclusters:null,
		//卡口对象
		kakouObj : null,
		init : function(map){
			this.map = map;
			this.kaKouLayerSource = new ol.source.Vector({});
			this.vectorLayer = new ol.layer.Vector({
				name : "kaKouLayer",
				source:this.kaKouLayerSource
			});

			var clusterSource = new ol.source.Cluster({
				distance: 50,
				source: this.kaKouLayerSource
			});

			var styleCache = {};
			this.kaKouclusters = new ol.layer.Vector({
				name : "kaKouLayer",
				source: clusterSource,
				style: function(feature, resolution){
					var style;
					var size = feature.get('features').length;
					if (size > 1) {
						style = [new ol.style.Style({
							image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
								opacity: 1,
								src: 'resource/images/m3.png'
							})),
							text: new ol.style.Text({
								font: '11px sans-serif',
								text: size.toString(),
								fill: textFill,
								stroke: textStroke
							})
						})];
					}else{

						//feature.setStyle(kaKouStyle);

						var tempfeature = feature.get('features')[0];
						//var puId = tempfeature.get("puId");
						//var content = tempfeature.get("content");
//						var interSequence = tempfeature.get("interSequence");

//						if(!dealWithParam(deviceShape)) deviceShape = 3;
//						var pointKind = "1";
//						//if(dealWithParam(interSequence))pointKind = "2";
						
						var state = tempfeature.get("content").state;
						var device_type = tempfeature.get("content").device_type;
						
						
						var iconInfo = newDetermineEquipKindByInfo("MAP",state*1,true,device_type * 1,"LOCATED","");
						var pointStyle = getPointClassStype(iconInfo.markImgUrl);

						feature.set("puId",tempfeature.get("puId"));
						feature.set("content",tempfeature.get("content"));
						feature.setStyle(pointStyle);
					}
					return style;

				}

			});

			map.addLayer(this.kaKouclusters);
			this.getKaKouSiteLayer();
		},
		/*
		 * 获取信息
		 */
		getKaKouSiteLayer : function(){
			var _self = this;
			//更改为从内存获取数据
			var equipmentList = [];
			var kkxxList = parent.kkxxList;
			for(var obj in kkxxList){
				var item = kkxxList[obj]
				var content = item.content.split('#');
				var equipment = {
					puId : item.id,
					kkbh : content[5],
					ip_addr : "",
					lon :content[1]*1.0,
					lat : content[2]*1.0,
					state : content[4],
					device_name : content[0],
					pu_out_id : content[3],
				};
				equipmentList.push(equipment);
			}
			var iconFeatures=[];
			for(var i=0;i<equipmentList.length;i++){
				var contentTemp = equipmentList[i];
				var cor =[];
				if(clientGISKind==clientGISKinds.OFFLINEGIS){
					 cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(contentTemp.lon,contentTemp.lat), 'EPSG:4326', 'EPSG:3857');
//							var cor = ol.proj.transform([contentTemp.lon + 0.0060,  contentTemp.lat - 0.0027], 'EPSG:4326', 'EPSG:3857');
				}else{
					 cor = [contentTemp.lon,  contentTemp.lat+0.0001];
				}

				if(contentTemp.lat != null && contentTemp.lon != null){
					var iconFeature = new ol.Feature({
						geometry : new ol.geom.Point(cor),
						puId : contentTemp.puId,
						content: contentTemp
					});
					
					var iconInfo = newDetermineEquipKindByInfo("MAP",contentTemp.state*1,true,contentTemp.device_type*1,"LOCATED","");
					var pointStyle = getPointClassStype(iconInfo.markImgUrl);
					
					iconFeature.setStyle(pointStyle);
					
					//iconFeature.setStyle(kaKouStyle);
					iconFeatures.push(iconFeature);
				}
			}
			_self.kaKouLayerSource.addFeatures(iconFeatures);
			
//			ZT.Utils.Ajax().request("getKaKouPoint.do",{
//				data : "",
//				success : function(resobj){
//					_self.clear();
//					var content = eval("(" + resobj.response + ")");
//					if(!content || !content.resp){
//						return;
//					}
//					var result = content.resp;
//					var iconFeatures=[];
//					for(var i=0;i<result.length;i++){
//						var contentTemp = result[i];
//
//						if(clientGISKind==clientGISKinds.OFFLINEGIS){
//							var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(contentTemp.lon,contentTemp.lat), 'EPSG:4326', 'EPSG:3857');
////							var cor = ol.proj.transform([contentTemp.lon + 0.0060,  contentTemp.lat - 0.0027], 'EPSG:4326', 'EPSG:3857');
//						}else{
//							var cor = [contentTemp.lon,  contentTemp.lat+0.0001];
//						}
//
//						if(contentTemp.lat != null && contentTemp.lon != null){
//							var iconFeature = new ol.Feature({
//								geometry : new ol.geom.Point(cor),
//								puId : contentTemp.puId,
//								content: contentTemp
//							});
//							
//							var iconInfo = newDetermineEquipKindByInfo("MAP",contentTemp.state*1,true,contentTemp.device_type*1,"LOCATED","");
//							var pointStyle = getPointClassStype(iconInfo.markImgUrl);
//							
//							iconFeature.setStyle(pointStyle);
//							
//							//iconFeature.setStyle(kaKouStyle);
//							iconFeatures.push(iconFeature);
//						}
//					}
//					_self.kaKouLayerSource.addFeatures(iconFeatures);
//				},
//				failure : function(resobj){
//					alert("服务端异常,加载卡口站点失败!");	
//				}
//			});
		},

		addClusterPointListPop : function(features){
			
			var lon = features[0].get("content").lon * 1;
			var lat = features[0].get("content").lat * 1;
			var resambleHtml = '';
			resambleHtml += '<div><div class="jhTitle"></div><div class="jh">';
			for(var i=0;i<features.length;i++){
				var feature = features[i];
				var state = feature.get("content").state;
				var device_type = feature.get("content").device_type;
				var iconInfo = newDetermineEquipKindByInfo("MAP",state*1,true,device_type * 1,"LOCATED","");
				resambleHtml+='<a class="jhList" title="' + feature.get("content").device_name + '"> ';
				resambleHtml+='<img src="' + iconInfo.markImgUrl  + '" width="31" height="19" />';
				resambleHtml+='<span onclick="kaKouLayerControl.showSelectPopUp(this)" puId="'+feature.get("content").pu_out_id+'" cname="'+feature.get("content").device_name+'" kkbh="' + feature.get("content").kkbh + '" ipdz="'+ feature.get("content").ip_addr + '" ';
				resambleHtml+=' lon="'+ feature.get("content").lon + '" lat="'+ feature.get("content").lat + '">'+feature.get("content").device_name + '</span> ';
			}
			
			resambleHtml += '</div></div>';
			
//			var resambleHtml = '';
//				resambleHtml +='<ul style="overflow:auto;position:relative;max-height:300px;">';
//			for(var i=0;i<features.length;i++){
//				var feature = features[i];
//
////				text+='   <span onclick="mobileSiteLayerControl.showSelectPopUp(this)" cname="'+feature.get("CNAME")+'"  LAC="'+feature.get("LAC")+'" CINO="'+feature.get("CINO")+'" lon="'+feature.get("LON")+'"  lat="'+feature.get("LAT")+'"  ';
////				text+='    address="'+feature.get("ADDRESS")+'" company="'+feature.get("COMPANY")+'" >'+feature.get("CNAME")+'  ' +feature.get("COMPANY") + '</span> ';
//				
//				resambleHtml+='<li> ';
//				resambleHtml+=' <a class="SearchResult_but02" hidefocus="true"> ';
//				resambleHtml+='   <span onclick="kaKouLayerControl.showSelectPopUp(this)" puId="'+feature.get("content").pu_out_id+'" cname="'+feature.get("content").device_name+'" kkbh="' + feature.get("content").kkbh + '" ipdz="'+ feature.get("content").ip_addr + '" ';
//				resambleHtml+=' lon="'+ feature.get("content").lon + '" lat="'+ feature.get("content").lat + '">'+feature.get("content").device_name + '</span> ';
//				resambleHtml+=' </a> ';
//				resambleHtml+='</li> ';
//			}
//			resambleHtml += '</ul>';
			popupControlCluster.showPopUpWin(resambleHtml,[lon,lat],1);
			
		},
		
		//聚合后单气泡
		showSelectPopUp : function(obj){
			obj = $(obj);
			
			var content = {};
			content.puId = obj.attr("puId");
			content.pu_out_id = obj.attr("puId");
			content.device_name = obj.attr("cname");
			content.lat = obj.attr("lat");
			content.lon = obj.attr("lon");
			
			var text= document.getElementById("kaKouPopUp").innerHTML
			text = text.replace(/%name/g,obj.attr("cname"));
			text = text.replace(/%puId/g,obj.attr("puId"));
			//text = text.replace(/%kkbh/g,obj.attr("kkbh"));
			text = text.replace(/%ipdz/g,obj.attr("ipdz"));
			text = text.replace("%lon",obj.attr("lon"));
			text = text.replace("%lat",obj.attr("lat"));			

			popupControl.showPopUpWin(text,[obj.attr("lon"),obj.attr("lat")]);
			
			this.kakouObj = new HashMap();
			this.kakouObj.put("obj", content);
			
			var obj = $('#popup-content');
		    obj.find("a[aliasid='queryPassCarInfoBtn']").click(function(){
		    	var url = 'url:vbdsPassCarInfoPage.do'; 
				var height = window.screen.availHeight - 100;
				var width = window.screen.availWidth;
				
				var passCarDialog = parent.jQuery.dialog({
					title:"过车信息查询",
					content:url,
					resize: false,
					lock: true,
					drag: true,
					width: width+'px',
					height: height+'px',
					top : '1px',
					max: false,
					min: false,
					close: function (){
						passCarDialog = null;
						this.kakouObj = null;
					}
				});
		    })
		},

		
		//单气泡
		addpopUp : function(content){
			var text= document.getElementById("kaKouPopUp").innerHTML
			text = text.replace(/%name/g,content.device_name);
			text = text.replace(/%puId/g,content.pu_out_id);
			//text = text.replace(/%kkbh/g,content.kkbh);
			text = text.replace(/%ipdz/g,content.ip_addr);
			text = text.replace("%lon",content.lon);
			text = text.replace("%lat",content.lat);			

			popupControl.showPopUpWin(text,[content.lon,content.lat]);
			
			//added by Cluo 20151218 for search jdctxDatas by puId Or kkbh
			this.kakouObj = new HashMap();
			this.kakouObj.put("obj", content);
			
			var obj = $('#popup-content');
		    obj.find("a[aliasid='queryPassCarInfoBtn']").click(function(){
		    	var url = 'url:vbdsPassCarInfoPage.do'; 
				var height = window.screen.availHeight - 100;
				var width = window.screen.availWidth;
				
				var passCarDialog = parent.jQuery.dialog({
					title:"过车信息查询",
					content:url,
					resize: false,
					lock: true,
					drag: true,
					width: width+'px',
					height: height+'px',
					top : '1px',
					max: false,
					min: false,
					close: function (){
						passCarDialog = null;
						this.kakouObj = null;
					}
				});
		    })
		},
		clear : function(){
			this.kaKouLayerSource.clear();
		},
		CLASS_NAME : "KaKouLayerControl"
}