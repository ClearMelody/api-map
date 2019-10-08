/**
 * @(#)ThirdClassControl.js
 * 
 * @description: 联网设备点管理
 * @author: 张添 2015/10/24
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
var clickType = null;
function registerMapClick(map){
	
	$(map.getViewport()).on("contextmenu", function(e){
		rightMouseClickType  = 0;
		$("#gisRightMenu").css("display","none");
		e.preventDefault();//取消右键默认行为
		var checkedXlPolyMap = top.window.checkedXlPolyGeo;
		var checkedQyPolyMap = top.window.checkedQyPolyGeo;
		var records = [];
		var record = {
			lon : map.getEventCoordinate(event)[0],
			lat : map.getEventCoordinate(event)[1]
		};
		if (clientGISKind == clientGISKinds.OFFLINEGIS){
			var pnt = [map.getEventCoordinate(event)[0]*1,map.getEventCoordinate(event)[1]*1]
			pnt = ZT.Utils.transformOffToESPG(pnt);
			record = {
				lon : pnt[0],
				lat : pnt[1]
			};
		}
		records.push(record);
		var isLine = false;   // 如果线路和区域重叠，优先选择线路
		if(top.window.isZdqy){
			if (!isLine && null != checkedQyPolyMap && checkedQyPolyMap.keys().length > 0) {
				// 区域右键事件
				var xlId = null;
				for(var j = 0;j < checkedQyPolyMap.keys().length; j++){
					var qyId = checkedQyPolyMap.keys()[j];
					var poly = checkedQyPolyMap.get(qyId);
					var type = poly.extent.split("(")[0];
					var extent = poly.extent.substring(poly.extent.lastIndexOf('((') + 2, poly.extent.length-2);
					var isInQy = 0;
					if(type=="Circle"){
						var arr = extent.split(",");
						var geo = {
					       lon: arr[0],
				           lat: arr[1],
				           radius: arr[2]
						};
						isInQy = top.window.getFilterRecordByCircle(geo, records);
						xlId = qyId;
					} else if(type=="Box"){
						var arr = extent.split(",");
						var geo = {
							extent: arr
						};
						isInQy = top.window.queryPointByRect(geo, records);
						xlId = qyId;
					} else if(type=="POLYGON"){
						var pntList = [];
						var arr = extent.split(",");
						for(var i=0; i<arr.length; i++){
							var pntArr = arr[i].split(" ");
							var pnt = [pntArr[0]*1,pntArr[1]*1];
							pntList.push(pnt);
						}
						var geo = {
							pntList: pntList,
							extent: getPointsExtent(pntList)
						};
					    var rect = {
					            left: geo.extent[0],
					            bottom: geo.extent[1],
					            right: geo.extent[2],
					            top: geo.extent[3]
				        };
					    isInQy = top.window.getFilterRecordByPolygon(rect, pntList, records);
						xlId = qyId;
					}
					if (null != isInQy && 1 == isInQy.length) {
						window.top.rightMenuXlId = xlId;
						var menu_overlay = new ol.Overlay({
							element: document.getElementById("gisRightMenu"),
							positioning: 'center-center'
						});
						menu_overlay.setMap(map);
						menu_overlay.setPosition(map.getEventCoordinate(event));
						$("#gisRightMenu").css("display","block");
						break;
					}
				}
			}
		}else{
			if (null != checkedXlPolyMap && checkedXlPolyMap.keys().length > 0) {
				// 线路右键事件
				for(var i=0;i<checkedXlPolyMap.keys().length;i++){
					var xlId = checkedXlPolyMap.keys()[i];
					var poly = checkedXlPolyMap.get(xlId);
					var inLineRecord = top.window.queryPointByPolygon(poly, records);
				if(inLineRecord.length ==1){
					window.top.rightMenuXlId = xlId;
					var menu_overlay = new ol.Overlay({
						element: document.getElementById("gisRightMenu"),
						positioning: 'center-center'
					});
					menu_overlay.setMap(map);
					menu_overlay.setPosition(map.getEventCoordinate(event));
					$("#gisRightMenu").css("display","block");
					isLine = true;
					break;
				}
				}
			}
		}
		
		clickType = 0;
		mshp(0);
	});
	
	map.on("singleclick",function(evt){
		$("#gisRightMenu").css("display","none");
		if(window.popupControl){
//			window.popupControl.closePopUpwin();//鼠标点击地图非气泡位置时，关闭气泡
		}
	
		var coordinate = evt.coordinate;
		
		var searchObj = document.getElementById("keyWord");
		
		if (searchObj && searchObj.value=='' && $("#yanpanUnionResultWin_equipment").css("display") == "none") {
			searchObj.value=searchObj.defaultValue;
			searchObj.style.color='#999';
			$("#searchSortDiv").hide();
		}
		
	
		switch (window.clickType){
		//clickType不能为1
		//地图气泡
		case 0:
			
			if(window.mobileSiteLayerControl_yidong){
				window.mobileSiteLayerControl_yidong.tempContent = "";
			}else if(window.mobileSiteLayerControl_liantong){
				window.mobileSiteLayerControl_liantong.tempContent = "";
			}else if(window.mobileSiteLayerControl_dianxin){
				window.mobileSiteLayerControl_dianxin.tempContent = "";
			}
			
			var selected= getFeatureAtPixel(evt.pixel);
			if(selected){
				callback(selected.feature,selected.layer);
			}
			function callback(feature,layers){
				if(layers.get("name") == "dtClassLayer"){ 
					if(feature.get("content")){
						dtGpsControl.addPopUp(feature.get("content"));
					}else if(feature.get("features") && feature.get("features").length > 1 && feature.get("features").length < 10){
						var features = feature.get("features");
						dtGpsControl.addClusterPointListPop(features);
					}
				}
				if(layers.get("name") == "firstClassLayer"){
					if(feature.get("pointId")){
						firstClassControl.getPointInfo(feature.get("pointId"),1);
					}else if(feature.get("features") && feature.get("features").length > 1 && feature.get("features").length < 10){
						var features = feature.get("features");
						firstClassControl.addClusterPointListPop(features);
					}
				}else if(layers.get("name") == "thirdClassLayer"){
					if(feature.get("pointId")){
						thirdClassControl.getPointInfo(feature.get("pointId"));
					}
				}else if(layers.get("name") == "mapMarkLayer"){
					if(feature.get("content")){
						mapMarkControl.addpopUp(feature.get("content"));
					}
				}else if(layers.get("name") == "surveyMapLayer"){
					if(feature.get("content")){
						surveyMapControl.addpopUp(feature.get("content"));
					}
				}else if(layers.get("name") == "unmannedPlaneLayer"){
						if(feature.get("content")){
							unmannedPlaneControl.addpopUp(feature.get("content"));
						}
				}else if(layers.get("name") == "casePointLayer" || layers.get("name") == "jqPointLayer"){
						if(feature.get("content")){
							getPointControl.addpopUp(feature.get("content"));
						}else if(feature.get("features") && feature.get("features").length > 1 && feature.get("features").length < 50){
							var features = feature.get("features");
							getPointControl.addClusterPointListPop(features);
					    }
				}else if(layers.get("name") == "policeMapLayer"){
					if(feature.get("content")){
						policeMapControl.addpopUp(feature.get("content"));
					}
				}else if(layers.get("name") == "positionSearchLayer"){
					if(feature.get("content")){
						positionSearchControl.addpopUp(feature.get("content"));
					}
				}else if(layers.get("name") == "lineTrackLayer"){
						if(isShowImportantActivity!=1&&feature.get("name")){
							lineTrackControl.getTrackResult(feature);
						}
				}else if(layers.get("name") == "mobileSiteLayer"){
					if(feature.get("运营商")){
						mobileSiteLayerControl_yidong.addpopUp(feature);
					}
				}else if(layers.get("name") == "kaKouLayer"){
					if(feature.get("puId")){
						kaKouLayerControl.addpopUp(feature.get("content"));
					}else if(feature.get("features") && feature.get("features").length > 1 && feature.get("features").length < 50){
						var features = feature.get("features");
						kaKouLayerControl.addClusterPointListPop(features);
					}
				}else if(layers.get("name") == "personClassLayer"){
				/*	if(feature.get("content")){
						   personClassControl.addPopUp(feature.get("content"));
					}*/
					if(feature.get("content")){
						personClassControl.addPopUp(feature.get("content"));
					}else if(feature.get("features") && feature.get("features").length > 1 && feature.get("features").length < 50){
						var features = feature.get("features");
						personClassControl.addClusterPointListPop(features);
					}
				}else if(layers.get("name") == "mobileSiteClassLayer"){
					if(feature.get("content")){
						  mobileSiteLayerControl.showSelectPopUp(feature.get("content"));
					}
				}
			}
			break;
			
		//地图标记点	
		case 2:
			var lonlat =[coordinate[0],coordinate[1]];
			if(clientGISKind == clientGISKinds.OFFLINEGIS){
				var coordinate = ol.proj.transform(eval(lonlat),'EPSG:3857','EPSG:4326');
				coordinate = ZT.Utils.gcj02_To_Gps84(coordinate[0],coordinate[1]);
			}
			gisInterfaceInMap.openAddPhonePointDialog(mapMarkType,coordinate[0],coordinate[1]);
			
			mapMarkControl.addMapMarkMarker(mapMarkType,coordinate[0],coordinate[1]);
			
			clickType = 0;
			
			mshp(0);
			window.top.sendMsgToClient(484,"地图标记");
			break;
			
			//线索上传	
		case 3:
			var lon = coordinate[0];
			var lat = coordinate[1];
		    if(clientGISKind==clientGISKinds.OFFLINEGIS){
				var cor = ol.proj.transform([lon, lat], 'EPSG:3857', 'EPSG:4326');
				cor = ZT.Utils.gcj02_To_Gps84(cor[0],cor[1]);
				lon = cor[0];
				lat = cor[1];
		    }
			parent.caseInvestigation.openUploadLabel(lon,lat);
			clickType = 0;
			mshp(0);
			break;
		//新增疑情	
		case 4:
			var lon = coordinate[0];
			var lat = coordinate[1]; 	    

	        getPointControl.addPointMarker(lon,lat);
		    lon = Math.round(lon*10000000)/10000000;
		    lat = Math.round(lat*10000000)/10000000;

		    if(clientGISKind==clientGISKinds.OFFLINEGIS){
				var cor = ol.proj.transform([lon, lat], 'EPSG:3857', 'EPSG:4326');
				cor = ZT.Utils.gcj02_To_Gps84(cor[0],cor[1]);
				lon = cor[0];
				lat = cor[1];
				
		    }  
//		    parent.pop.content.$("#caseLongitude").val(lon);
//		    parent.pop.content.$("#caseLatitude").val(lat);
		    $(top.yqDialog.iframe.contentDocument.getElementById("caseLongitude")).val(lon)
		    $(top.yqDialog.iframe.contentDocument.getElementById("caseLatitude")).val(lat);
		   //parent.$("#caseLongitude").val(lon);
		    
		    
		   //parent.$("#caseLatitude").val(lat);
			break;
			
		//无人机	
		case 5:
			
			gisInterfaceInMap.openAddUnmannedPlaneImageLayerDialog(coordinate[0],coordinate[1]);
			
			unmannedPlaneControl.addPlaneTempMarker(coordinate[0],coordinate[1]);
			
			clickType = 0;
			
			mshp(0);
			
			break;
			
	   //添加现勘图	
		case 6:
			
			lon = Math.round(coordinate[0]*10000000)/10000000;
		    lat = Math.round(coordinate[1]*10000000)/10000000;
		    if(surveyType ==1){
			    if(clientGISKind==clientGISKinds.OFFLINEGIS){
					var cor = ol.proj.transform([lon, lat], 'EPSG:3857', 'EPSG:4326');
					cor = ZT.Utils.gcj02_To_Gps84(cor[0],cor[1]);
					lon = cor[0];
					lat = cor[1];
			    }
				parent.parent.sendMsgToClient(449,lon+"@"+lat);
		    }else{
		    	window.top.sendMsgToClient(484,"勘测图");
		    	gisInterfaceInMap.opensurveyMapDialog(lon,lat);
		    }
			//parent.parent.sendMsgToClient(449,lon+"@"+lat);
			//parent.parent.sendMsgToGis(450,"F20150930094151831579002"+"@"+lon+"@"+lat);
			//surveyMapControl.addSurveyTempMarker(coordinate[0],coordinate[1]);
			
			clickType = 0;
			
			mshp(0);
			break;
		//现勘图定位
		case 7:
			
			var id=surveyMapControl.id;
			var file_id=surveyMapControl.file_id;
			var name='';
		    if(clientGISKind==clientGISKinds.OFFLINEGIS){
				var cor = ol.proj.transform([coordinate[0], coordinate[1]], 'EPSG:3857', 'EPSG:4326');
				cor = ZT.Utils.gcj02_To_Gps84(cor[0],cor[1]);
				coordinate[0] = cor[0];
				coordinate[1] = cor[1];
		    }
			gisInterfaceInMap.UpdateSurveyMap(id,name,coordinate[0],coordinate[1],file_id);
			
			surveyMapControl.addSurveyTempMarker(coordinate[0],coordinate[1]);
			
			clickType = 0;
			
			mshp(0);
			
			break;
		//新增社会点位时定位
		case 8:
			var lon = coordinate[0];
			var lat = coordinate[1];
		    if(clientGISKind==clientGISKinds.OFFLINEGIS){
				var cor = ol.proj.transform([lon, lat], 'EPSG:3857', 'EPSG:4326');
				cor = ZT.Utils.gcj02_To_Gps84(cor[0],cor[1]);
				lon = cor[0];
				lat = cor[1];
		    }
			if((lon + "").length > 10)lon = (lon + "").substring(0,10) * 1;
			if((lat + "").length > 9)lat = (lat + "").substring(0,9) * 1;
			gisInterfaceInMap.openAddPointCatalogDialog(null,lon,lat,null);
			var content = {
				lon : lon,
				lat : lat
			}
			thirdClassControl.addTempThirdMarker(content);
			window.selectCaseStorePointId = null;
			clickType = 0;
			mshp(0);
			window.top.sendMsgToClient(484,"点位添加");
			break;
		//修改社会点位定位
		case 9:
			var lon = coordinate[0];
			var lat = coordinate[1];
		    if(clientGISKind==clientGISKinds.OFFLINEGIS){
				var cor = ol.proj.transform([lon, lat], 'EPSG:3857', 'EPSG:4326');
				cor = ZT.Utils.gcj02_To_Gps84(cor[0],cor[1]);
				lon = cor[0];
				lat = cor[1];
		    }
			if((lon + "").length > 10)lon = (lon + "").substring(0,10) * 1;
			if((lat + "").length > 9)lat = (lat + "").substring(0,9) * 1;
			gisInterfaceInMap.openUpdatePointCatalogDialog(window.selectCaseStorePointId,null,lon,lat);
			var content = {
				lon : lon,
				lat : lat
			}
			thirdClassControl.addTempThirdMarker(content);
			window.selectCaseStorePointId = null;
			clickType = 0;
			mshp(0);
			window.top.sendMsgToClient(484,"点位修改");
			break;
		//案件定位
		case 10:
			parent.$(".RightMenu").hide();
			var lon = coordinate[0];
			var lat = coordinate[1];
		    if(clientGISKind==clientGISKinds.OFFLINEGIS){
			//	var cor = ol.proj.transform([lon, lat], 'EPSG:3857', 'EPSG:4326');
				var cor = ol.proj.transform([lon, lat], 'EPSG:3857', 'EPSG:4326');
				cor = ZT.Utils.gcj02_To_Gps84(cor[0],cor[1]);
				lon = cor[0];
				lat = cor[1];
		    }
		    lon = Math.round(lon*10000000)/10000000;
		    lat = Math.round(lat*10000000)/10000000;
			var url = "saveOrUpdateDoubtCase.do?time="+new Date().getTime();
			var data = "caseId="+(window.top.curCaseId ? window.top.curCaseId:window.top.caseId) + "&caseLongitude=" + lon + "&caseLatitude=" + lat;
			jQuery.ajax({
				type:'POST',
				url:url,
				cache:false,
				data:data,
				success:function(msg) {
					if(!msg) return;
					var rs = eval("(" + msg + ")");
					if(rs.errorCode == "0") {
						if(clientGISKind==clientGISKinds.OFFLINEGIS&&lon!=""){	
							var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(lon*1,lat*1), 'EPSG:4326', 'EPSG:3857');
							lon = cor[0];
							lat = cor[1];
						}
					    if(getPointControl.updateLocation){
					       getPointControl.updateLocation(window.top.curCaseId,lon,lat);
					    }else{
					       window.top.rsContent.caseLongitude = lon;
					       window.top.rsContent.caseLatitude = lat;
					       getPointControl.caseInvestigationInit(window.top.caseId);
					    }
					    if(top.updateCaseClass){
					    	top.updateCaseClass(window.top.curCaseId);
					    }
						fadingTip("案件定位成功。");
					}else {
						fadingTip("案件定位失败。");
					}
				}
			});
			clickType = 0;
			mshp(0);
			window.top.isRelocate = false;
			break;
			//线索定位
			case 11:
				parent.$("#locateLabelLi").hide();
				parent.$(".RightMenu").hide();
				var lon = coordinate[0];
				var lat = coordinate[1];
				lon = Math.round(lon*10000000)/10000000;
				lat = Math.round(lat*10000000)/10000000;
			    if(clientGISKind==clientGISKinds.OFFLINEGIS){
						var cor = ol.proj.transform([lon, lat], 'EPSG:3857', 'EPSG:4326');
						cor = ZT.Utils.gcj02_To_Gps84(cor[0],cor[1]);
						lon = cor[0];
						lat = cor[1];
				    }
				var url = "updateLabelLonLat.do?time="+new Date().getTime();
				var data = "labId="+parent.label.selectLabelId + "&longitude=" + lon + "&latitude=" + lat;
				jQuery.ajax({
					type:'POST',
					url:url,
					cache:false,
					data:data,
					success:function(msg) {
						if(!msg) return;
						var rs = eval("(" + msg + ")");
						if(rs.errorCode == "0") {
//						var lab = {
//							"labId" : parent.label.selectLabelId,
//							"longitude" : lon,
//							"latitude" : lat
//						}
//						parent.label.queryAllMobileSiteByLabel(lab,window.top.mobileSiteDistance.distance1);
							parent.label.queryLabelPath(window.top.caseId);
							fadingTip("定位成功。");
						}else {
							fadingTip("定位失败。");
						}
					}
				});
				clickType = 0;
				mshp(0);
				//更新完以后刷新一下地图上标注的手机和汽车信息
				top.gisFrame.mapMarkControl.getSets();

				break;				
			case 12:  //警情定位
				var lon = coordinate[0];
				var lat = coordinate[1];
			    if(clientGISKind==clientGISKinds.OFFLINEGIS){
					var cor = ol.proj.transform([lon, lat], 'EPSG:3857', 'EPSG:4326');
					cor = ZT.Utils.gcj02_To_Gps84(cor[0],cor[1]);
					lon = cor[0];
					lat = cor[1];
			    }
			    lon = Math.round(lon*10000000)/10000000;
			    lat = Math.round(lat*10000000)/10000000;
			    top.window.jqPointControl.updateJQLocation(top.window.curJJH,lon,lat);
				clickType = 0;
				mshp(0);
				//警情定位后的点击事件added by zcp 20180123
				if(top.dealAfterUpdateLonLat){
					top.dealAfterUpdateLonLat();
				}
				top.window.isRelocate = false;
			break;
		case 13:
				var lonlat =[coordinate[0],coordinate[1]];
				if(clientGISKind == clientGISKinds.OFFLINEGIS){
					var coordinate = ol.proj.transform(eval(lonlat),'EPSG:3857','EPSG:4326');
					coordinate = ZT.Utils.gcj02_To_Gps84(coordinate[0],coordinate[1]);
				}
				gisInterfaceInMap.openAddLabelDialog(coordinate[0],coordinate[1]);
				
				//mapMarkControl.addMapMarkMarker(mapMarkType,coordinate[0],coordinate[1]);
				
				clickType = 0;
				
				mshp(0);
				window.top.sendMsgToClient(484,"添加线索");
				break;
		case 14:
				var lonlat =[coordinate[0],coordinate[1]];
				if(clientGISKind == clientGISKinds.OFFLINEGIS){
					var coordinate = ol.proj.transform(eval(lonlat),'EPSG:3857','EPSG:4326');
					coordinate = ZT.Utils.gcj02_To_Gps84(coordinate[0],coordinate[1]);
				}
				gisInterfaceInMap.openAddLabelDialog(coordinate[0],coordinate[1]);
				
				mapMarkControl.addMapMarkMarker(mapMarkType,coordinate[0],coordinate[1]);
				
				clickType = 0;
				
				mshp(0);
				window.top.sendMsgToClient(484,"添加线索");
				break;
		case 15://地址定位 
			var lonlat =[coordinate[0],coordinate[1]];
			if(clientGISKind == clientGISKinds.OFFLINEGIS){
				var coordinate = ol.proj.transform(eval(lonlat),'EPSG:3857','EPSG:4326');
				coordinate = ZT.Utils.gcj02_To_Gps84(coordinate[0],coordinate[1]);
			}
			popAddAddressDialog(coordinate[0],coordinate[1]);
			
			
			clickType = 0;
			
			mshp(0);
			break;
		case 16://地址库地址重定位 
			var lonlat =[coordinate[0],coordinate[1]];
			if(clientGISKind == clientGISKinds.OFFLINEGIS){
				var coordinate = ol.proj.transform(eval(lonlat),'EPSG:3857','EPSG:4326');
				coordinate = ZT.Utils.gcj02_To_Gps84(coordinate[0],coordinate[1]);
			}
			popAddAddressDialog(coordinate[0],coordinate[1],poiId);
			
			
			clickType = 0;
			
			mshp(0);
			break;

			case 17://重点单位定位
                var lonlat =[coordinate[0],coordinate[1]];
                if(clientGISKind == clientGISKinds.OFFLINEGIS){
                    var coordinate = ol.proj.transform(eval(lonlat),'EPSG:3857','EPSG:4326');
                    coordinate = ZT.Utils.gcj02_To_Gps84(coordinate[0],coordinate[1]);
                }
                popAddZddwDialog(coordinate[0],coordinate[1]);
                clickType = 0;
                mshp(0);
                break;

			case 18://重点单位 重定位
                var lonlat =[coordinate[0],coordinate[1]];
                if(clientGISKind == clientGISKinds.OFFLINEGIS){
                    var coordinate = ol.proj.transform(eval(lonlat),'EPSG:3857','EPSG:4326');
                    coordinate = ZT.Utils.gcj02_To_Gps84(coordinate[0],coordinate[1]);
                }
                popReloadZdDialog(coordinate[0],coordinate[1]);
                clickType = 0;
                mshp(0);
                break;

            case 19://重点场所
                var lonlat =[coordinate[0],coordinate[1]];
                if(clientGISKind == clientGISKinds.OFFLINEGIS){
                    var coordinate = ol.proj.transform(eval(lonlat),'EPSG:3857','EPSG:4326');
                    coordinate = ZT.Utils.gcj02_To_Gps84(coordinate[0],coordinate[1]);
                }
                popAddZdcsDialog(coordinate[0],coordinate[1]);
                clickType = 0;
                mshp(0);
                break;

            case 20://重点场所重定位
                var lonlat =[coordinate[0],coordinate[1]];
                if(clientGISKind == clientGISKinds.OFFLINEGIS){
                    var coordinate = ol.proj.transform(eval(lonlat),'EPSG:3857','EPSG:4326');
                    coordinate = ZT.Utils.gcj02_To_Gps84(coordinate[0],coordinate[1]);
                }
                popReloadZdDialog(coordinate[0],coordinate[1]);
                clickType = 0;
                mshp(0);
                break;
            case 21:
            	var lon = coordinate[0];
				var lat = coordinate[1];
			    if(clientGISKind==clientGISKinds.OFFLINEGIS){
					var cor = ol.proj.transform([lon, lat], 'EPSG:3857', 'EPSG:4326');
					cor = ZT.Utils.gcj02_To_Gps84(cor[0],cor[1]);
					lon = cor[0];
					lat = cor[1];
			    }
			    lon = Math.round(lon*10000000)/10000000;
			    lat = Math.round(lat*10000000)/10000000;
			    top.window.changeShlocation(window.top.xxzjbh,lon,lat);
				clickType = 0;
				mshp(0);
            	break;
            case 22://电子围栏 重定位
                var lonlat =[coordinate[0],coordinate[1]];
                if(clientGISKind == clientGISKinds.OFFLINEGIS){
                    var coordinate = ol.proj.transform(eval(lonlat),'EPSG:3857','EPSG:4326');
                    coordinate = ZT.Utils.gcj02_To_Gps84(coordinate[0],coordinate[1]);
                }
                pointLayerList.setMarkPoint(coordinate[0],coordinate[1]);
                clickType = 0;
                mshp(0);
                break;	
		default:
			break;
		}
		
		
		
		
//		if(clickType == 0 ){
//			
//			evt.map.forEachFeatureAtPixel(evt.pixel,callback,this);
//			function callback(feature,layers){
//				if(feature.get("pointId")){
//					if(layers.get("name") == "firstClassLayer"){
//						firstClassControl.getPointInfo(feature.get("pointId"),coordinate);
//					}else if(layers.get("name") == "thirdClassLayer"){
//						thirdClassControl.getPointInfo(feature.get("pointId"),coordinate);
//					}
//				}
//			}
//		}
	});
	map.on("dblclick",function(evt){
		$("#gisRightMenu").css("display","none");
		var coordinate = evt.coordinate;
		var interactions = map.getInteractions();
		for (var i = 0; i < interactions.getLength(); i++) {
		    var interaction = interactions.item(i);                          
		    if (interaction instanceof ol.interaction.DoubleClickZoom) {
		        map.removeInteraction(dbclicInteraction);
		        break;
		    }
		}
		if(window.dbclicInteraction){
			map.addInteraction(dbclicInteraction);
		}
		var selected= getFeatureAtPixel(evt.pixel);
		if(selected){
			callback(selected.feature,selected.layer);
		}
		
		function callback(feature,layers){
			if(layers.get("name") == "firstClassLayer"){
				if(feature.get("pointId")){
					if(window.dbclicInteraction){
						map.removeInteraction(dbclicInteraction);
					}
					firstClassControl.getPointInfo(feature.get("pointId"),2);
				}
			}else if(layers.get("name") == "thirdClassLayer"){
				if(feature.get("pointId")){
					if(window.dbclicInteraction){
						map.removeInteraction(dbclicInteraction);
					}
					thirdClassControl.getPointInfo(feature.get("pointId"));
				}
			}else if(layers.get("name") == "personClassLayer"){
					if(feature.get("content")){
						   personClassControl.addPopUp(feature.get("content"));
					}
			}else if(layers.get("name") == "casePointLayer"){
					if(feature.get("content")){
						 getPointControl.addpopUp(feature.get("content"));
					}
			}else if(typeof(layers.get("name")) == "undefined"){
				
			}else if(window.dbclicInteraction){
				map.removeInteraction(dbclicInteraction);
			}
		}
	});
}

function getFeatureAtPixel (pixel) {
    var pixels = [];
    var x = pixel[0];
    var y = pixel[1];
    var tolerate = 8;
    for (var i = x - tolerate; i <= x + tolerate; i++) {
        for (var j = y - tolerate; j <= y + tolerate; j++) {
            var p = [i, j];
            pixels.push(p);
        }
    }
    //按照离鼠标点击位置的距离排序
    pixels.sort(function (p1, p2) {
        var dis1 = Math.sqrt(Math.pow(p1[0] - x, 2) + Math.pow(p1[1] - y, 2));
        var dis2 = Math.sqrt(Math.pow(p2[0] - x, 2) + Math.pow(p2[1] - y, 2));
        if (dis1 < dis2) {
            return -1;
        }
        else if (dis1 == dis2) {
            return 0;
        }
        else {
            return 1;
        }
    });
    for (var i = 0; i < pixels.length; i++) {
    	var lyr = null;
        var feature = map.forEachFeatureAtPixel(pixels[i], function (feature, layer) {
            if (feature){
            	lyr = layer;
            	return feature;
            }
        });
        if (feature) {
        	var data={
        		layer:lyr,
        		feature:feature
        	};
            return data;
        }
    }
    return null;
}

//鼠标滚轮时间
function registerMapZoom(map){
//	var zoomInteraction = new ol.interaction.MouseWheelZoom();
//	map.addInteraction(zoomInteraction);
//	
//	zoomInteraction.on("change:resolution",function(evt) {
//		var a = evt;
//	}, this);
	
	map.on("moveend",function(e){
		if(window.mobileSiteLayerControl && window.mobileSiteLayerControl.mobileSiteLayerSource) {
			currentZoom = map.getView().getZoom();
			if(currentZoom > 16) {
				var extent =map.getView().calculateExtent(map.getSize());
				if(extent[0]){
					mobileSiteLayerControl.getMobileSiteLayer(extent);
				}
			}else {
				mobileSiteLayerControl.mobileSiteLayerSource.clear();
				mobileSiteLayerControl.drawSourceXiao.clear();
			}
		}
	});
	map.getView().on('change:resolution', function(evt){
	    //layerFeatures is a reference of a ol.layer.Vector
		currentZoom = evt.target.getZoom();
//		lineTrackControl.radio = (0.02 * 0.224816/25009.068) * currentZoom * currentZoom; 
		try{
			if(currentZoom < 5 && lineTrackControl){
				lineTrackControl.lineTrackSource.clear();
			}	
		}catch(e){
			
		}
		if(window.mobileSiteLayerControl && window.mobileSiteLayerControl.mobileSiteLayerSource) {
			if(currentZoom > 16) {
				var extent =map.getView().calculateExtent(map.getSize());
				if(extent[0]){
					mobileSiteLayerControl.getMobileSiteLayer(extent);
				}
			}else {
				mobileSiteLayerControl.mobileSiteLayerSource.clear();
				mobileSiteLayerControl.drawSourceXiao.clear();
			}
		}
		
//		//加载路网
//		try{
//			if(arcGisLayerImage && currentZoom > 5){
//				arcGisRoadLayer.setVisible(true);
//			}else {
//				arcGisRoadLayer.setVisible(false);
//			}
//		}catch(e){
//			
//		}
		if(clientGISKind==clientGISKinds.OFFLINEGIS){
			if( currentZoom ==11 || currentZoom ==12|| currentZoom ==14 || currentZoom == 16 ){
				if(parent.label && parent.label.queryLabelPath){
					parent.label.queryLabelPath(parent.caseId);
				}
			}
		}else{
			if(currentZoom == 7 || currentZoom ==10|| currentZoom ==14 || currentZoom == 16 || currentZoom ==17){
				if(parent.label && parent.label.queryLabelPath){
					parent.label.queryLabelPath(parent.caseId);
				}
			}
		}
		//线索轴，线路根据地图级别重绘
		var lineWidth = 6;
		if(clientGISKind==clientGISKinds.FHGIS){
			if (map.getView().getZoom() >= 14) {
				lineWidth = 6;
			} else if (map.getView().getZoom() >= 12) {
				lineWidth = 4;
			} else {
				lineWidth = 2;
			}		
			if(parent.label && parent.label.reDrawLabelGroupPath){
				parent.label.reDrawLabelGroupPath(lineWidth);
			}
		} else{
			if (map.getView().getZoom() >= 5 + arcgisDeltaZoom) {
				lineWidth = 6;
			} else if (map.getView().getZoom() >= 2 + arcgisDeltaZoom) {
				lineWidth = 4;
			}else {
				lineWidth = 2;
			}	
			if(parent.label && parent.label.reDrawLabelGroupPath){
				parent.label.reDrawLabelGroupPath(lineWidth);
			}
		}
	});
//	
//	zoomslider.on("change",function(evt){
//		var a = evt;
//	});
	
	$("#map").bind("mousedown",function(e){
		if(e.button == 2){
			top.window.isRelocate = false;
			if(rightMouseClickType == 1){
				
				ol.Observable.unByKey(drawControl.ptmove);
				drawControl.sketch = null;
				if(null != drawControl.helpTooltip)
				map.removeOverlay(drawControl.helpTooltip);
				drawControl.drawSource.clear();
				map.removeInteraction(drawControl.draw);
				clickType = 0;
				rightMouseClickType = 0;
				if(isCreateTask == 3){
					$("#" + lineTrackControl.savedId).css("display","block");
					lineTrackControl.savedId = null;
				}else if(isCreateTask == 2){
					parent.smartTrackDialog.show();
				}
			}else if(rightMouseClickType ==2){
				lineTrackControl.lineTrackSource.clear();
				$("#" + lineTrackControl.savedId).css("display","block");
				lineTrackControl.savedId = null;
				rightMouseClickType = 0;
				
			}else{
				clickType = 0;
				mshp(0);
			}
			
			
		}

	});
	
	//鼠标移动到Feature改变样式
    map.on('pointermove', function(evt) {
        map.getTargetElement().style.cursor =
            map.hasFeatureAtPixel(evt.pixel) ? 'pointer' : '';    
    });
    if(clientGISKind==clientGISKinds.OFFLINEGIS){
    $("#map").bind("mousemove",function(e){	
    	if($('.custom-mouse-position').length<1){
    		return;
    	}
		var cor =$('.custom-mouse-position').html().split(",");
		cor = ZT.Utils.gcj02_To_Gps84(cor[0]*1.0,cor[1]*1.0);
//		cor[0] = cor[0]*1-0.0053;
//		cor[1] = cor[1]*1+0.0023;
//		cor[0] = Math.round(cor[0]*10000)/10000;
//		cor[1] = Math.round(cor[1]*10000)/10000;
		var corNew = cor[0] + ", " + cor[1];
		$('#mouse-positionOff').html('<div class="custom-mouse-position">'+corNew+'</div>');
		if(clickType == 13 || clickType == 4 || clickType == 3 || clickType == 12 || clickType == 10 || clickType == 8 || clickType == 9 || clickType == 21){
			 map.getTargetElement().style.cursor =
            'crosshair' ;
		}
	});
    }else{
    	$("#map").bind("mousemove",function(e){	
		if(clickType == 13 || clickType == 4 || clickType == 3 || clickType == 12 || clickType == 10 || clickType == 8 || clickType == 9 || clickType == 21){
			 map.getTargetElement().style.cursor =
            'crosshair' ;
		}
	});
    }
//	//地图双击放大显示
//	$("#map").bind("dblclick",function(e){
//		if(dbclickFlag == 0){
//			map.getView().setZoom(currentZoom + 1);
//		}
//	});
}

top.setClickType = function(type){
	if(type || type==0){
		clickType = type;
	}
}

top.getClickType = function(){
	return clickType;
}
