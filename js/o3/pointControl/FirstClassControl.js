/**
 * @(#)FirstClassControl.js
 * 
 * @description: 联网设备点管理
 * @author: 张添 2015/10/21
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */

var FirstClassControl = function(){
	this.init.apply(this, arguments);
}

FirstClassControl.prototype ={
		map:null,
		firstClassSource : null,
		vectorLayer:null,
		firstclusters:null,
		deviceMap : null,
		init : function(map){
			this.map = map;
			this.firstClassSource = new ol.source.Vector({});
			this.vectorLayer = new ol.layer.Vector({
				name : "firstClassLayer",
				source:this.firstClassSource
			});

			var clusterSource = new ol.source.Cluster({
				distance: 50,
				source: this.firstClassSource
			});

			var styleCache = {};
			this.firstclusters = new ol.layer.Vector({
				name : "firstClassLayer",
				source: clusterSource,
				style: function(feature, resolution){
					var style;
					var size = feature.get('features').length;
					if (size > 1) {
						style = [new ol.style.Style({
							image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
								opacity: 1,
								src: 'resource/images/m2.png'
							})),
							text: new ol.style.Text({
								font: '11px sans-serif',
								text: size.toString(),
								fill: textFill,
								stroke: textStroke
							})
						})];
					}else{

						var tempfeature = feature.get('features')[0];
						var deviceShape = tempfeature.get("deviceShape");
						var state = tempfeature.get("state");
						var interSequence = tempfeature.get("interSequence");

						if(!dealWithParam(deviceShape)) deviceShape = 3;
						var pointKind = "1";
						if(interSequence == 1){//interSequence:0：一类点 1：二类点
							pointKind = "2";
						}
						var iconInfo = newDetermineEquipKindByInfo("MAP",state,false,deviceShape,"LOCATED",pointKind);
						var pointStyle = getPointClassStype(iconInfo.markImgUrl);
						feature.set("pointId",tempfeature.get("pointId"));
						feature.setStyle(pointStyle);
					}
					return style;

				}

			});

			map.addLayer(this.firstclusters);
			this.getFirstClassPoint();
		},
		/*
		 * 获取一类点信息
		 */
		getFirstClassPoint : function(){
			var _self = this;
			if(isImportantActivity!=1&&parent.parent.firstClassFeatures&&parent.parent.firstClassFeatures.length> 0){
				_self.firstClassSource.addFeatures(parent.parent.firstClassFeatures);
			}else{
				_showWait();
				ZT.Utils.Ajax().request("getFirstClassPoint.do",{
					data : "",
					success : function(resobj){
						var content = eval("(" + resobj.response + ")");
						if(!content || !content.resp){
							_hideWait();
							return;
						}
						var result = content.resp;
						window.top.firstClassRecords = result;
						var iconFeatures=[];
						firstClassControl.deviceMap = new HashMap();
						for(var i=0;i<result.length;i++){
							var contentTemp = result[i];
							
							if(clientGISKind==clientGISKinds.OFFLINEGIS){
								var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(contentTemp.lon,contentTemp.lat), 'EPSG:4326', 'EPSG:3857');
								//var cor = ol.proj.transform([contentTemp.lon+ 0.0060,  contentTemp.lat- 0.0027], 'EPSG:4326', 'EPSG:3857');
							}else{
								var cor = [contentTemp.lon,  contentTemp.lat];
							}

							if(contentTemp.lat != null && contentTemp.lon != null){
								var iconFeature = new ol.Feature({
									geometry: new ol.geom.Point(cor),//new ol.geom.Point([contentTemp.lon, contentTemp.lat]),
									pointId : contentTemp.pointId,
									deviceShape : contentTemp.deviceShape,
									state : contentTemp.state,
									interSequence : contentTemp.interSequence,
									name : contentTemp.name,
									lon : contentTemp.lon,
									lat : contentTemp.lat
								});
								if(!dealWithParam(contentTemp.deviceShape))contentTemp.deviceShape = 3;
								var pointKind = "1";
								//if(dealWithParam(contentTemp.interSequence))pointKind = "2";
								var iconInfo = newDetermineEquipKindByInfo("MAP",contentTemp.state,contentTemp.isKaKou,contentTemp.deviceShape,"LOCATED",pointKind);
								var pointStyle = getPointClassStype(iconInfo.markImgUrl);
								iconFeature.setStyle(pointStyle);
								iconFeatures.push(iconFeature);
								
								var content = {
									id : contentTemp.pointId,
									type : contentTemp.deviceShape,
									state : contentTemp.state,
									interSequence : contentTemp.interSequence,
									xm : contentTemp.name,
									lon : contentTemp.lon,
									lat : contentTemp.lat
								};
								//dataArray.push(content);
								firstClassControl.deviceMap.put(contentTemp.pointId,content);
							}
						}
						_hideWait();
						parent.parent.firstClassFeatures = iconFeatures;
						_self.firstClassSource.addFeatures(iconFeatures);
					},
					failure : function(resobj){
						_hideWait();
						fadingTip("服务端异常,加载一类点失败!");	
					}
				});
			}
		},
		/*
		 * 查看点位信息，或者双击查看实时视频
		 * @param {Object} pointId
		 * @param {Object} type 1：查看气泡信息 2：查看实时视频
		 * @memberOf {TypeName} 
		 * @return {TypeName} 
		 */
		getPointInfo : function(pointId,type){
			var _self = this;
			//如果查看一类点视频，则不请求后台
			if(2 == type){
				for(var i=0,len=parent.parent.firstClassFeatures.length;i<len;i++){
					var con = parent.parent.firstClassFeatures[i];
					if(pointId == con.get("pointId")){
						var puid = pointId.split("_")[0];
						var channel = 1;
						if(pointId.split("_").length > 1){
							channel = pointId.split("_")[1];
						}
						var content = {
							"puid" : puid,
							"channel" : channel,
							"state" : con.get("state"),
							"lon" : con.get("lon"),
							"lat" : con.get("lat"),
							"name" : con.get("name")
						}
						_self.playVideo(content);
						break;
					}
				}
			}else if(1 == type){
				var url = "getEquipmentByPointId.do?time="+new Date().getTime();
				ZT.Utils.Ajax().request(url,{
					data : "pointId="+pointId,
					success :function(resobj){
						if(!resobj) return;
						var content = eval("(" + resobj.response + ")");
						if(content.errorCode == "0" && dealWithParam(content.resp)) {
							_self.addPopUp(content.resp,[content.resp.lon,content.resp.lat]);
						}
					},
					failure : function(resobj){
						fadingTip("查询一类点失败");	
					}
				});
			}
		},
		addPopUp : function(content,coordinate){
			var _self = this;
			var text = document.getElementById('firstClassPoint').innerHTML;
			text = text.replace(/%channel_name/g,content.name);
			text = text.replace("%deviceid", content.deviceid);
			text = text.replace("%ip",content.ip);
			if(content.state==null||content.state==""||content.state==0||content.state==113){
				text = text.replace("%state","不在线");
			}else{
				text = text.replace("%state","在线");
			}
			//杆号
			text = text.replace("%ganhao", content.ganhao);
			//生产厂商
			text = text.replace(/%manufactory/g,content.manufacturename);
			//类型
			text = text.replace("%type", content.type);
			//型号
			text = text.replace("%xinghao", content.xinghao);
			//安装地点
			text = text.replace(/%installaddress/g, content.installaddress);
			text = text.replace("%lon", content.lon);
			text = text.replace("%lat", content.lat);
			//区域
			text = text.replace(/%regionname/g, content.regionname);
			popupControl.showPopUpWin(text,coordinate);
			var obj = $('#popup-content');
			//展开详细按钮
			obj.find("a[aliasid='expandDetailBtn']").click(function(){
				var tmpObj = obj.find("div[aliasid='detailDiv']");
				//展开
				if(tmpObj.css('display')=='none'){
					tmpObj.show();
					$(this).find("img").attr("src","resource/images/pageIcon/popupup.png");
				}else{
					tmpObj.hide();
					$(this).find("img").attr("src","resource/images/pageIcon/popupdown.png");
				}
			});
			//视频预览
			obj.find("a[aliasid='videoPreviewBtn']").click(function(){	        	
				_self.playVideo(content);
			})
			//视频回放
			obj.find("a[aliasid='videoReplayBtn']").click(function(){
				var msgString = content.puid+"@"+content.channel+"@"+content.name
				+"@"+content.lon+"@"+content.lat + "@" + content.state;
				sendMsgToClient(109, msgString);
			}) 
		},
		/*
		 * 双击查看实时视频
		 */
		playVideo : function(content,source){
			var tmpLL = [content.lon,content.lat];
	    	if(clientGISKind==clientGISKinds.OFFLINEGIS){
				var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(tmpLL[0]*1,tmpLL[1]*1), 'EPSG:4326', 'EPSG:3857');
//				var cor = ol.proj.transform([lon*1,lat*1], 'EPSG:4326', 'EPSG:3857');
				tmpLL[0] = cor[0];
				tmpLL[1] = cor[1];
			}
			var tmpPix = map.getPixelFromCoordinate(tmpLL);
			//300是gis地图的水平距左距离，60是CS工具栏高度，24是gis导航栏高度
			var tmpPixStr = (Math.round(tmpPix[0]) + 10)+"@"+(Math.round(tmpPix[1])+65);
			if(typeof(pageConstant) != "undefined" && pageConstant.curActivitySeq){   //重大活动安保界面一类点
				tmpPixStr = (Math.round(tmpPix[0]) + 10)+"@"+(Math.round(tmpPix[1])+137);
			}
			if(content.state == 0 || content.state == 113 || content.state == ""){
				content.state = 113;
				fadingTip("设备不在线。");
				return;
			}else {
				content.state = 114;
			}
			var msgString = content.puid+"@"+content.channel+"@"+content.name
			+"@"+content.lon+"@"+content.lat + "@" + tmpPixStr + "@" + content.state;
			if(undefined == source){
				sendMsgToClient(107, msgString);
			}else if("ACTIVITY" == source){
				sendMsgToClient(515, source + "@" + msgString);
			}
		},
		/*
		 * 添加聚合的设备列表
		 */
		addClusterPointListPop : function(features){
			var lon = features[0].get("lon");
			var lat = features[0].get("lat");
			
			var resambleHtml = '';
			//resambleHtml += '<div><div class="jhTitle">设备列表</div><div class="jh">';
			resambleHtml += '						<ul>';
			for(var i=0;i<features.length;i++){
				var tmpObj = features[i];
				var pointId = tmpObj.get("pointId");
				var puid = pointId.split("_")[0];
				var channel = 1;
				
				var deviceShape = tmpObj.get("deviceShape");
				var state = tmpObj.get("state");
				var interSequence = tmpObj.get("interSequence");

				if(!dealWithParam(deviceShape)) deviceShape = 3;
				var pointKind = "1";
				if(interSequence == 1){//interSequence:0：一类点 1：二类点
					pointKind = "2";
				}
				var iconInfo = newDetermineEquipKindByInfo("MAP",state,false,deviceShape,"LOCATED",pointKind);
				
				if(pointId.split("_").length > 1)channel = pointId.split("_")[1] * 1;
				var name = tmpObj.get("name");
				var state = tmpObj.get("state");
				
//				var iconInfo = newDetermineEquipKindByInfo("MAP",contentTemp.state,contentTemp.isKaKou,contentTemp.deviceShape,"LOCATED",pointKind);
//				var pointStyle = getPointClassStype(iconInfo.markImgUrl);
				resambleHtml+='<li>';
				resambleHtml+='<a class="jhList" title="' + name + '"> ';
				resambleHtml+='<img src="' + iconInfo.markImgUrl  + '" width="47" height="33" />';
				resambleHtml+='<span ondblclick="firstClassControl.playClusterPointVideo(this)" id="equipListItem_'+i+'" pointId="'+pointId+'"  puid="'+puid+'" channel="'+channel+'" lon="'+lon+'"  lat="'+lat+'"  ';
				resambleHtml+='    state="'+state+'" name="'+name+'" pointKind="3" title="'+name+'"  indentyDbl="false"  >'+name+'</span> ';
				resambleHtml+='</li>';
			}
			
			resambleHtml += '</ul>'
			
//			var resambleHtml = '';
//				resambleHtml +='<ul style="overflow:auto;position:relative;max-height:300px;">';
//			for(var i=0;i<features.length;i++){
//				var tmpObj = features[i];
//				var pointId = tmpObj.get("pointId");
//				var puid = pointId.split("_")[0];
//				var channel = 1;
//				if(pointId.split("_").length > 1)channel = pointId.split("_")[1] * 1;
//				var name = tmpObj.get("name");
//				var state = tmpObj.get("state");
//				resambleHtml+='<li> ';
//				resambleHtml+=' <a class="SearchResult_but02" hidefocus="true"> ';
//				resambleHtml+='   <span ondblclick="firstClassControl.playClusterPointVideo(this)" id="equipListItem_'+i+'" pointId="'+pointId+'"  puid="'+puid+'" channel="'+channel+'" lon="'+lon+'"  lat="'+lat+'"  ';
//				resambleHtml+='    state="'+state+'" name="'+name+'" pointKind="3" title="'+name+'"  indentyDbl="false"  >'+name+'</span> ';
//				resambleHtml+=' </a> ';
//				resambleHtml+='</li> ';
//			}
//			resambleHtml += '</ul>';
			jhpopupControl.showPopUpWin(resambleHtml,[lon,lat],1);
		},
		/*
		 * 播放聚合中的设备
		 */
		playClusterPointVideo : function(obj){
			obj = $(obj);
			var content = {
				name : obj.attr("name"),
				pointId : obj.attr("pointId"),
				lon : obj.attr("lon"),
				lat : obj.attr("lat"),
				puid : obj.attr("puid"),
				channel : obj.attr("channel"),
				state : obj.attr("state")
			}
			firstClassControl.playVideo(content);
		},
		clear : function(){
			this.firstClassSource.clear();
		},
		CLASS_NAME : "FirstClassControl"
}