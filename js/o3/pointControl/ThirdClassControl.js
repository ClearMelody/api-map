/**
 * @(#)ThirdClassControl.js
 * 
 * @description: 三类点管理
 * @author: 张添 2015/10/23
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */

var ThirdClassControl = function(){
	this.init.apply(this, arguments);
}

ThirdClassControl.prototype ={
	map : null,
	thirdClassSource : null,
	vectorLayer:null,
	radio : 20 * 0.224816/25009.068,

init : function(map){
	this.map = map;
	this.thirdClassSource = new ol.source.Vector({});
	this.vectorLayer = new ol.layer.Vector({
		name : "thirdClassLayer",
		source:this.thirdClassSource
	});
	map.addLayer(this.vectorLayer);
	this.getThirdClassPoint();
},
/*
 * 查询三类点
 */
getThirdClassPoint : function(){
	var _self = this;
	ZT.Utils.Ajax().request("getThirdClassPoint.do",{
		data : "",
		success : function(resobj){
			_self.clear();
			var content = eval("(" + resobj.response + ")");
			if(!content || !content.resp){
				return;
			}
			var result = content.resp;
			var iconFeatures=[];
			for(var i=0;i<result.length;i++){
				var contentTemp = result[i];
				//是否只显示与案件关联的三类点
				if(parent.caseInvestigation.isOnlyShowCaseRefPoint==true){
					var caseId=parent.caseId;
					var pntCaseId=contentTemp.caseId;
					if(caseId!=pntCaseId)
						continue;
				}
				if(clientGISKind==clientGISKinds.OFFLINEGIS){
					var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(contentTemp.lon,contentTemp.lat), 'EPSG:4326', 'EPSG:3857');
//					var cor = ol.proj.transform([contentTemp.lon + 0.0060,  contentTemp.lat - 0.0027], 'EPSG:4326', 'EPSG:3857');
					var radioNew = _self.radio*20037508.34 / 180;	
				}else{
					var cor = [contentTemp.lon,  contentTemp.lat];
				}
				
				if(contentTemp.lat != null && contentTemp.lon != null){
					var iconFeature = new ol.Feature({
						geometry : new ol.geom.Point(cor),
						pointId : contentTemp.pointId
					});
					iconFeature.setStyle(thirdtStyle);
					iconFeatures.push(iconFeature);
				}
				if((contentTemp.viewAngle && contentTemp.viewAngle > 0) || (contentTemp.horizontalIncludedAngle && contentTemp.horizontalIncludedAngle > 0) ){
					drawControl.addFans([contentTemp.lon, contentTemp.lat],_self.radio,contentTemp.viewAngle*1,contentTemp.horizontalIncludedAngle*1,_self.thirdClassSource);
				}
			}
			_self.thirdClassSource.addFeatures(iconFeatures);
		},
		failure : function(resobj){
			alert("服务端异常,加载三类点失败!");	
		}
	});
},
/*
 * 查看点位信息，或者双击查看实时视频
 * @param {Object} pointId
 * @param {Object} type 1：查看气泡信息 2：查看实时视频
 * @memberOf {TypeName} 
 * @return {TypeName} 
 */
getPointInfo : function(pointId){
	var _self = this;
	var url = "getPointCatalogByPointId.do?time="+new Date().getTime();
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
			fadingTip("查询三类点失败");	
		}
	});
},
addPopUp : function(content,coordinate){
	var _self = this;
	var url = "querySocialPointPicByPointId.do?time="+new Date().getTime();
	ZT.Utils.Ajax().request(url,{
		data : "pointId="+content.pointId+"&time=" + new Date().getTime(),
		success :function(resobj){
			if(!resobj) return;
		    var objlist = eval("(" + resobj.responseText + ")");
		    objlist = objlist.resp;
		    if(objlist == null || objlist.length < 1) {
		    	var idSliderStr = "";
		    	var idNumStr = "";
		    	idSliderStr = '<div style="POSITION: relative"><a ><img src="resource/images/img_bg.png" width="160" height="120"></a></div>';
		    	idNumStr = '<li><img src="resource/images/img_bg.png" width="30" height="24"></li>';
		    	$("#idSlider").html(idSliderStr);
		    	$("#idNum").html(idNumStr);
		    	var jsStr = " <script language=javascript>showPic('idNum','idTransformView','idSlider',120,1,true,2000,5,true,'onmouseover');//按钮容器aa，滚动容器bb，滚动内容cc，滚动宽度dd，滚动数量ee，滚动方向ff，延时gg，滚动速度hh，自动滚动ii，</script>";
		    	$("#yanpanSocialResPointPopupTemplateContainer").append(jsStr);
		    	return;
		    }
		    var list = objlist;
		    var idSliderStr = "";
		    var idNumStr = "";
		    for(var i=0; i<list.length; i++) {
		    	var obj = list[i];
		    	if(obj != null) {
		    		idSliderStr += '<div style="POSITION: relative"><a><img src= "'+obj.picUrl+'" width="160" height="120"></a></div>';
		    		idNumStr += '<li><img src= "'+obj.picUrl+'" width="30" height="24"></li>';
		    	}
		    }
		    $("#idSlider").html(idSliderStr);
		    $("#idNum").html(idNumStr);
		    var jsStr = " <script language=javascript>showPic('idNum','idTransformView','idSlider',120,"+list.length+",true,2000,5,true,'onmouseover');//按钮容器aa，滚动容器bb，滚动内容cc，滚动宽度dd，滚动数量ee，滚动方向ff，延时gg，滚动速度hh，自动滚动ii，</script>";
		    $("#yanpanSocialResPointPopupTemplateContainer").append(jsStr);
		    //为图片注册看大图事件
		    $("#idTransformView").find('img').each(function(index, domEle) { 
		    	$(domEle).click(function(){
				    	gisInterfaceInMap.imgPreview($(this).attr('src'));
				 }) 
		    });
		},
		failure : function(resobj){
			fadingTip("查询点位图片失败");	
		}
	});
	var text = document.getElementById('thirdClassPoint').innerHTML;
	text = text.replace(/%name/g,content.name);
    text = text.replace("%lon",content.lon);
    text = text.replace("%lat",content.lat);
    //安裝地址
	text = text.replace(/%addr/g,content.installaddress);
	text = text.replace("%contactperson", content.contactPerson);
	//生产厂商
	text = text.replace("%manufacturename",content.manufacturename);
	text = text.replace(/%tel/g, content.contactTelephone);
	//添加气泡
	popupControl.showPopUpWin(text,coordinate);
	var obj = $('#popup-content');
	var SelfcaseId=parent.caseId;
	var sqlcaseID=content.caseId;
	if(SelfcaseId==sqlcaseID){
    //视频回放
    obj.find("a[aliasid='videoReplayBtn']").click(function(){	        	
    	 var msgString = content.pointId+"@"+content.name+"@"+content.lon+"@"+content.lat;
	 	 parent.parent.sendMsgToClient(110, msgString);
    })
    //资源管理
    obj.find("a[aliasid='videoMangeBtn']").click(function(){
    	 var contentTemp = {
			"pointId" : content.pointId,//三类点的puid和pointId是相同的值
			"caseId" : "",
			"eventId" : "",
			"uploaduserId" : "",//此处无需发送用户id
			"resLongitude" : content.lon,
			"resLatitude" : content.lat,
			"name" : content.name
		}
    	window.top.sendMsgToClient(484,"资源管理");
    	parent.openVideoManagerDialog(contentTemp);
    })
    //关联资源
    obj.find("a[aliasid='relateCaseResourceBtn']").click(function(){
		parent.relateCaseResource(content.pointId);
    })
    //编辑社会资源点信息
    obj.find("a[aliasid='editPointBtn']").click(function() {
    	window.top.sendMsgToClient(484,"修改社会资源点");
    	popupControl.closePopUpwin();
    	gisInterfaceInMap.openUpdatePointCatalogDialog(content.pointId);
    });
    //删除
    obj.find("a[aliasid='delPointBtn']").click(function(){
    	new ConfirmDialog("删除点位会将关联视频、线索删除，也可选择编辑操作", function(){
    		popupControl.closePopUpwin();
			gisInterfaceInMap.deletePointCatalogDialog(content.pointId);
    	});
    })
	}else
	{
		obj.find("a[aliasid='videoMangeBtn']").hide();
		obj.find("a[aliasid='delPointBtn']").hide();
		obj.find("a[aliasid='relateCaseResourceBtn']").hide()
		obj.find("a[aliasid='editPointBtn']").hide();
		obj.find("a[aliasid='videoReplayBtn']").hide();
	}
},
/*
 * 添加临时三类点
 */
addTempThirdMarker : function (content){
	this.delMakerById("tempThirdMarker");
	var feature = new ol.Feature({
		geometry: new ol.geom.Point([content.lon,content.lat]),
	});
	feature.setId("tempThirdMarker");
	feature.setStyle(thirdtStyle);
	this.thirdClassSource.addFeature(feature);
},
/*
 * 删除临时点
 */
delMakerById : function(lid){
	var feature = this.thirdClassSource.getFeatureById("tempThirdMarker");
	if(feature){
		this.thirdClassSource.removeFeature(feature);
	}
},
/*
 * 清除图层要素
 */
clear : function(){
	this.thirdClassSource.clear();
},
	CLASS_NAME : "ThirdClassControl"

}
