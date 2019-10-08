/**
 * @(#)MobileSiteLayerControl.js
 * 
 * @description: 移动基站
 * @author: 张添 2015/12/07
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */

var MobileSiteLayerControl = function(){
	this.init.apply(this, arguments);
}
var xiao = [
            {cid:"173",jd:60,fwj:90},
            {cid:"35572",jd:60,fwj:0}
            ];
			//此处为演示设置基站方位角所用。jd为设置的扇形角度，fwj是指偏转x轴角度（右边界与x轴夹角）。
MobileSiteLayerControl.prototype ={
		map:null,
		mobileSiteLayerSource : null,
		vectorLayer : null,
		mobileSiteClusters : null,
		tempContent : "",
		init : function(map){
			this.map = map;
			this.mobileSiteLayerSource = new ol.source.Vector({});
            this.vectorLayer = new ol.layer.Vector({
				name : "mobileSiteClassLayer",
				source:this.mobileSiteLayerSource
			});
//            var clusterSource = new ol.source.Cluster({
//				distance: 50,
//				source: this.mobileSiteLayerSource
//			});
//            this.mobileSiteClusters = new ol.layer.Vector({
//				name : "mobileSiteClassLayer",
//				source: clusterSource,
//				style: function(feature, resolution){
//				var style;
//				var size = feature.get('features').length;
//				for(var i = 0 ; i <feature.get('features').length;i++ ) {
//					var tempfeature = feature.get('features')[i];
//					var pointStyle = getPointClassStype("resource/images/newtoolbar/jzh32.png");
//					feature.set("content",tempfeature);
//					feature.setStyle(tempfeature.getStyle());
//				}
//				return style;
//					}
//				});
//			map.addLayer(this.mobileSiteClusters);
			map.addLayer(this.vectorLayer);
			this.drawSourceXiao = new ol.source.Vector({features: this.features});
			var drawVectorLayer = new ol.layer.Vector({
				source: this.drawSourceXiao,
				style: new ol.style.Style({
					fill: new ol.style.Fill({
						color: 'rgba(255, 255, 255, 0.8)'
							//				color: '#ffcc33'
					}),
					stroke: new ol.style.Stroke({
						color: '#ffcc33',
						width: 2
					}),
					image: new ol.style.Circle({
						radius: 7,
						fill: new ol.style.Fill({
							color: '#ffcc33'
						})
					})
				})
			});
			map.addLayer(drawVectorLayer);
			//this.getMobileSiteLayer();
		},
		addpopUp : function(feature){
			var text ="";
			text+='<ul><li> ';
			text+=' <a class="SearchResult_but02" hidefocus="true"> ';
			text+='   <span onclick="mobileSiteLayerControl.showSelectPopUp(this)" cname="'+feature.get("name")+'"  LAC="'+feature.get("lac")+'" id="'+feature.get("id")+'" lon="'+feature.get("lon")+'"  lat="'+feature.get("lat")+'"  ';
			text+='    address="'+feature.get("address")+'" company="'+feature.get("company")+'" >'+feature.get("name")+'  ' +feature.get("company") + '</span> ';
			text+=' </a> ';
			text+='</li></ul> ';
			
			this.tempContent += text;
			
			popupControl.showPopUpWin(this.tempContent,[feature.get("lon"),feature.get("lat")]);
			

		},
		showSelectPopUp : function(feature){
			var text= document.getElementById("mobileSitePopUp").innerHTML;
			text = text.replace(/%name/g,feature.name);
			text = text.replace("%lon",feature.lon);
			text = text.replace("%lat",feature.lat);
			text = text.replace("%id",feature.cino);
			text = text.replace("%address",feature.address);
			text = text.replace("%company",feature.company);
			
			popupControl.showPopUpWin(text,[feature.lon,feature.lat]);
		},
		queryMobile : function(lac,cino){
//			if(map.getView().getZoom() <= 7){
//				map.getView().setZoom(8);
//			}
			$.each(parent.mobileSiteFeatures,function(i,item){
				  if(item.get("content").cino == cino&&item.get("content").lac == lac){
					  var lon = item.get("content").lon*1;
					  var lat = item.get("content").lat*1;
			    	if(clientGISKind==clientGISKinds.OFFLINEGIS){
						var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(lon*1,lat*1), 'EPSG:4326', 'EPSG:3857');
						lon = cor[0];
						lat = cor[1];
					}
				    map.getView().setCenter([lon*1,lat*1]);
					centerCrossEffect.startAnimate(lon*1,lat*1);
				   return false;
				 }
            })
		},
		/*
		 * 获取信息
		 */
		getMobileSiteLayer : function(extent){
			var _self = this;
			_self.mobileSiteLayerSource.clear();
			_self.drawSourceXiao.clear();
			//_showWait();
			var lonlat =[extent[0],extent[1]];
			var lonlat1 =[extent[2],extent[3]];
			if(clientGISKind == clientGISKinds.OFFLINEGIS){
				var cor = ol.proj.transform(eval(lonlat),'EPSG:3857','EPSG:4326');
				cor = ZT.Utils.gcj02_To_Gps84(cor[0],cor[1]);
				extent[0] = cor[0];
				extent[1] = cor[1];
				
				var cor1 = ol.proj.transform(eval(lonlat1),'EPSG:3857','EPSG:4326');
				cor1 = ZT.Utils.gcj02_To_Gps84(cor1[0],cor1[1]);
				extent[2] = cor1[0];
				extent[3] = cor1[1];
				
			}
			
			var url = "getBasicStationData.do?" + extent[0] + "&miny=" + extent[1] + "&maxx=" + extent[2] + "&maxy=" + extent[3];
			ZT.Utils.Ajax().request(url,{
					data : "",
					success : function(msg){
				        var resobj = eval("(" + msg.responseText + ")")
						if(!resobj || !resobj.errCode == 0){
							_hideWait();
							return;
						}
						var result = resobj.baseStationList;
						if(!result) return;
						var iconFeatures=[];
						for(var i=0;i<result.length;i++){
							var contentTemp = result[i];
							
							if(clientGISKind==clientGISKinds.OFFLINEGIS){
								var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(contentTemp.lon,contentTemp.lat), 'EPSG:4326', 'EPSG:3857');
							}else{
								var cor = [contentTemp.lon,  contentTemp.lat];
							}
							if(contentTemp.lat != null && contentTemp.lon != null){
								var iconFeature = new ol.Feature({
									geometry: new ol.geom.Point(cor),//new ol.geom.Point([contentTemp.lon, contentTemp.lat]),
									content : contentTemp
								});
								if(map.getView().getZoom() == 17){
								for(var j=0;j<xiao.length;j++){
									if(xiao[j].cid == contentTemp.cino){
											_self.addFans(cor,50,xiao[j].jd,xiao[j].fwj);	
									}
								  }
								}
								//var pointStyle = getPointClassStype("resource/images/newtoolbar/jzh32.png");
								if(contentTemp.company == '移动') {
									iconFeature.setStyle(mobileStyle_yidong);
					
								} else if(contentTemp.company == '联通') {
									iconFeature.setStyle(mobileStyle_liantong);
								} else {
									iconFeature.setStyle(mobileStyle_dianxin);
								}
								
								iconFeatures.push(iconFeature);
							}
						}
						_hideWait();
						parent.mobileSiteFeatures = iconFeatures;
						_self.mobileSiteLayerSource.addFeatures(iconFeatures);
					},
					failure : function(resobj){
						_hideWait();
						fadingTip("服务端异常,加载一类点失败!");	
					}
				});
		},
		//画扇形
		addFans : function(Coordinate,radius,view,angle,mobileSiteLayerSource){
			Coordinate[0] = Coordinate[0] * 1;
			Coordinate[1] = Coordinate[1] * 1;
			var circle = new ol.geom.Circle(Coordinate,radius);
			var lowpoly = ol.geom.Polygon.fromCircle(circle,360,0);
				
			if(angle + view > 360){
				var cor = lowpoly.getCoordinates()[0].slice(angle,360);
				cor = cor.concat(lowpoly.getCoordinates()[0].slice(0,view - (360-angle)));
			}else{
				var cor = lowpoly.getCoordinates()[0].slice(angle,angle + view);
			}
			cor.unshift(Coordinate);
			cor.push(Coordinate);
			
			var array = [];
			array.push(cor);
			var poly = new ol.geom.Polygon(array);
			this.drawSourceXiao.addFeature(new ol.Feature(poly));

		},
		CLASS_NAME : "MobileSiteLayerControl"
}