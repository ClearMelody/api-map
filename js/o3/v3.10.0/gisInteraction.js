﻿﻿﻿//地图交互相关方法
window.gisInteraction = {};

//拾取坐标，回调函数：success([lon,lat])
window.gisInteraction.trackPoint = function (success) {
    _trackLocalFuns.track("Point", success);
};

//track圆，回调函数：success({lon,lat,radius})
window.gisInteraction.trackCircle = function (success) {
    _trackLocalFuns.track("Circle", success);
};

//track矩形,回调函数：success({extent,pntList,wkt})
window.gisInteraction.trackRect = function (success) {
    _trackLocalFuns.track("Box", success);
};

//track多边形,回调函数：success({extent,pntList,wkt})
window.gisInteraction.trackPolygon = function (success) {
    _trackLocalFuns.track("Polygon", success);
};

//track折线,回调函数：success({extent,pntList,wkt})
window.gisInteraction.trackPolyLine = function (success) {
    _trackLocalFuns.track("LineString", success);
};

//停止track
window.gisInteraction.stopTrack = function () {
    _trackLocalFuns.stop();
};

//清理track的几何图形
window.gisInteraction.clearTrack = function () {
    _trackLocalFuns.clear();
    setTimeout(function () {
        _trackLocalFuns.clearFeatures();
    }, 200);
};
//清除track鼠标提示信息
window.gisInteraction.clearPointerMoveHelp = function(){
	 setTimeout(function () {
		 _trackLocalFuns.clearPointerMoveHelp();
	 },200);
}
//清理track的几何图形
window.gisInteraction.clearTrackFeatures = function () {
    setTimeout(function () {
        _trackLocalFuns.clearFeatures();
    }, 200);
};
//动画平移到中心点  added by wyk 20190219
window.gisInteraction.panToCenter = function(lon, lat, speed, isGps84){
    var view = window.map.getView();
    if(!speed){
    	speed = 1000;
    }
    var pan = ol.animation.pan({
        duration: 1000,
        source: (view.getCenter())
    });
    window.map.beforeRender(pan);
    if(isGps84){
    	view.setCenter(_prjFuns.gps84_to_map(lon, lat));
    }else{
    	view.setCenter([lon, lat]);
    }
    window.map.render();
};
//动画旋转地图  added by wyk 20190219
window.gisInteraction.routateMap = function(lon, lat, speed, rotation){
	var view = window.map.getView();
	if(!speed){
		speed = 1000;
	}
	var roateCenter = [lon, lat];
	var rotate = ol.animation.rotate({
		rotation : rotation,
		duration: speed
	});
	view.setRotation(Math.PI-rotation);
	window.map.beforeRender(rotate);
};
window.gisInteraction.zoomIn = function(zoom, speed){
	var zoom = ol.animation.zoom({resolution:map.getView().getResolution()});
	window.map.beforeRender(zoom);
	window.map.getView().setZoom(18);
	window.map.render();
}
window.gisInteraction.flyToCenter = function(lon, lat, speed){
	var view = window.map.getView();
	var pan = ol.animation.pan({
        duration: speed,
        source: (view.getCenter())
    });
    var bounce = ol.animation.bounce({
        duration: speed,
        resolution: 4 * view.getResolution()
    });
    var zoom = ol.animation.zoom({resolution:map.getView().getResolution()});
    map.beforeRender(pan, bounce, zoom);
    view.setCenter(_prjFuns.gps84_to_map(lon, lat));
    view.setZoom(18);
    map.render();
}
//获取左下角和右上角坐标,返回[左下角坐标,右上角坐标]  added by wyk 20180716
window.gisInteraction.getBottomLeftAndTopRightPoint = function(map){
	var extent = map.getView().calculateExtent(map.getSize());
	var pnt1 = _prjFuns.map_to_gps84(extent[0], extent[1]);
	var pnt2 = _prjFuns.map_to_gps84(extent[2], extent[3]);
	return [pnt1,pnt2];
}

//获取外包矩形,返回值：[west,south,east,north]  add by  chenxq
window.gisInteraction.getPointsExtent = function(pntList){
	 var extent = [180, 90, -180, -90];
	    for (var i = 0; i < pntList.length; i++) {
	        var pnt = pntList[i];
	        var lon = pnt[0];
	        var lat = pnt[1];
	        if (lon == 11 || lat == 11)
	            continue;
	        if (lon < extent[0])
	            extent[0] = lon;
	        if (lon > extent[2])
	            extent[2] = lon;
	        if (lat < extent[1])
	            extent[1] = lat;
	        if (lat > extent[3])
	            extent[3] = lat;
	    }
	    return extent;
}

//添加POI，参数依次为：图层名称（没有会自动创建）、POI（json对象，包括id、name、img、lon、lat、popupContentHTML、att）
//POI点击事件回调函数（参数为POI数组）
window.gisInteraction.addMarker = function (layerName, marker, featureClicked, featureDblClicked) {
    var map = window.map ;
    map.un('click', _markerLocalFuns.mapFeatureClicked);
    map.un('dblclick', _markerLocalFuns.mapFeatureDblClicked);
    //初始化marker图层
    var lyrInfo = _markerLocalFuns.getMarkerLayer(layerName);
    if (lyrInfo == null || lyrInfo == "") {
        lyrInfo = _markerLocalFuns.createMarkerLayer(layerName);
    }
    var pos = _prjFuns.gps84_to_map(marker.lon, marker.lat);
    var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(pos),
        name: marker.name,
        id: marker.id
    });
    var att = marker.att;
    att = (att == null ? {} : att);
    att.layerName = layerName;
    att.id = marker.id;
    att.name = marker.name;
    att.lon = marker.lon;
    att.lat = marker.lat;
    att.img = marker.img;
    att.popupContentHTML = marker.popupContentHTML;
    att.featureClicked = featureClicked;
    att.featureDblClicked = featureDblClicked;

    iconFeature.att = att;
    iconFeature.set('radius', 12);
    var style = {};
    if (att.iconLabelStr) {
        style = _markerLocalFuns.getImageFontStyle(att.img, att.iconLabelStr, att.fillColor, att.strokeColor, att.font);
    }else{
        style = _markerLocalFuns.getImageStyle(att.img, att.size);
    }

    iconFeature.setStyle(style);
    lyrInfo.vectorSource.addFeature(iconFeature);

    //重新绑定事件
    map.on('click', _markerLocalFuns.mapFeatureClicked);
    map.on('dblclick', _markerLocalFuns.mapFeatureDblClicked);
};

//批量添加POI，参数依次为：图层名称、POI数组（POI为json对象，包括id、name、img、lon、lat、popupContentHTML、att）、
//POI点击事件回调函数（参数为POI数组）
window.gisInteraction.addMarkers = function (layerName, markers, featureClicked, featureDblClicked) {
    if (markers == null || markers.length < 1)
        return;
    var map = window.map ;
    map.un('click', _markerLocalFuns.mapFeatureClicked);
    map.un('dblclick', _markerLocalFuns.mapFeatureDblClicked);

    //初始化marker图层
    var lyrInfo = _markerLocalFuns.getMarkerLayer(layerName);
    if (lyrInfo == null || lyrInfo == "") {
        lyrInfo = _markerLocalFuns.createMarkerLayer(layerName);
        lyrInfo.markerLayer.setZIndex(10);  //设置图层的zIndex属性
        map.addLayer(lyrInfo.markerLayer);
    }
    for (var i = 0; i < markers.length; i++) {
        var pos = _prjFuns.gps84_to_map(markers[i].lon, markers[i].lat);
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(pos),
            name: markers[i].name,
            id: markers[i].id
        });
        var att = (markers[i].att || {});
        att.layerName = layerName;
        att = (att == null ? {} : att);
        att.id = markers[i].id;
        att.name = markers[i].name;
        att.lon = markers[i].lon;
        att.lat = markers[i].lat;
        att.img = markers[i].img;
        att.anchor = markers[i].anchor;
        att.popupContentHTML = markers[i].popupContentHTML;
        att.featureClicked = featureClicked;
        att.featureDblClicked = featureDblClicked;

        iconFeature.att = att;
        iconFeature.set('radius', 12);
        var style = {};
        if (att.iconLabelStr) {
        	if(att.offsetX && att.offsetY) {
        		style = _markerLocalFuns.getImageFontOffsetStyle(att.img, att.iconLabelStr, att.fillColor, att.strokeColor, att.font, att.offsetX, att.offsetY);
        	} else {
        		style = _markerLocalFuns.getImageFontStyle(att.img, att.iconLabelStr, att.fillColor, att.strokeColor, att.font);
        	}
        } else {
            style = _markerLocalFuns.getImageStyle(att.img, att.size, att.anchor);
        }
        iconFeature.setStyle(style);
        lyrInfo.vectorSource.addFeature(iconFeature);
    }
    //重新绑定事件
    map.on('click', _markerLocalFuns.mapFeatureClicked);
    map.on('dblclick', _markerLocalFuns.mapFeatureDblClicked);
};


//批量添加POI，参数依次为：图层名称、POI数组（POI为json对象，包括id、name、innserHtml、lon、lat、att）、
//POI点击事件回调函数（参数为POI数组）
window.gisInteraction.addMarkerForHtml = function (marker, featureClicked, featureDblClicked,useDefualtStyle) {
	 var map = window.map ;
     var _this = _popupLocalFuns;
	 var id = marker.id || '';
	 var overlayId = marker.overlayId || '';
	 var content = document.createElement('div');
     content.setAttribute('id', overlayId);
     content.setAttribute('seq', marker.id);
     content.style.cssText = "white-space:nowrap;display:block;";
	 var innerHTML = marker.innerHTML;
	 var positioning = marker.positioning;
	 if(!positioning){
		  positioning = 'center-center';
	 }
     $(content).html(innerHTML);
     var overlay = new ol.Overlay({
         element: content,
         positioning: positioning
     });
     overlay.id = id;
     var att = (marker.att || {});
     att.id = marker.id;
     att.name = marker.name;
     att.lon = marker.lon;
     att.lat = marker.lat;
     att.featureClicked = featureClicked;
     att.featureDblClicked = featureDblClicked;
     var pos = _prjFuns.gps84_to_map(att.lon*1,  att.lat*1);
     att.lon = pos[0];
     att.lat = pos[1];    
     overlay.setPosition([att.lon, att.lat]);
     overlay.setOffset([0,0]);
     overlay.set("mark",marker.mark);//用来批量删除,added by zcp
     map.addOverlay(overlay);
     //重新绑定事件
     $(content).unbind().bind('click',featureClicked);
};

//批量添加POI(自动聚合)，参数依次为：图层名称、POI数组（POI为json对象，包括id、name、img、lon、lat、att等属性）、
//POI点击事件回调函数（参数为POI数组，为了提高加载速度，显示popup的方法放到回调里）
window.gisInteraction.addClusterMarkers = function (layerName, markers, featureClicked, featureDblClicked) {
    if (markers == null || markers.length < 1)
        return;
    var map = window.map ;
    map.un('click', _markerLocalFuns.mapFeatureClicked);
    map.un('dblclick', _markerLocalFuns.mapFeatureDblClicked);
    //初始化marker图层
    var lyrInfo = null;
    if (markers[0].att && markers[0].att.distance) {
        lyrInfo = _markerLocalFuns.createClusterMarkerLayer(layerName, markers[0].att.distance);
    } else {
        lyrInfo = _markerLocalFuns.createClusterMarkerLayer(layerName);
    }
    for (var i = 0; i < markers.length; i++) {
        var pos = _prjFuns.gps84_to_map(markers[i].lon, markers[i].lat);
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(pos),
            name: markers[i].name,
            id: markers[i].id
        });
        var att = (markers[i].att || {});
        att.layerName = layerName;
        att = (att == null ? {} : att);
        att.id = markers[i].id;
        att.name = markers[i].name;
        att.lon = markers[i].lon;
        att.lat = markers[i].lat;
        att.img = markers[i].img;
        att.anchor = markers[i].anchor;
        att.popupContentHTML = markers[i].popupContentHTML;
        att.iconLabelStr = markers[i].iconLabelStr;
        att.fillColor = markers[i].fillColor;
        att.strokeColor = markers[i].strokeColor;
        att.offsetX = markers[i].offsetX;
        att.offsetY = markers[i].offsetY;
        att.featureClicked = featureClicked;
        att.featureDblClicked = featureDblClicked;

        iconFeature.att = att;
        iconFeature.set('radius', 12);
        var style = {};
        if (att.iconLabelStr) {
        	if(att.offsetX && att.offsetY){
        		style = _markerLocalFuns.getImageFontOffsetStyle(att.img, att.iconLabelStr, att.fillColor, att.strokeColor, att.font, att.offsetX, att.offsetY);
        	}else{
        		style = _markerLocalFuns.getImageFontStyle(att.img, att.iconLabelStr, att.fillColor, att.strokeColor, att.font);
        	}
        }else {
            style = _markerLocalFuns.getImageStyle(att.img, att.size, att.anchor);
        }
        iconFeature.setStyle(style);
        try{
	        lyrInfo.vectorSource.addFeature(iconFeature);
        }catch(e){
        	console.error("id为["+att.id+"]的经纬度异常！")
        }
    }
    //添加完点之后再添加图层到地图
    map.addLayer(lyrInfo.markerLayer);
    //重新绑定事件
    map.on('click', _markerLocalFuns.mapFeatureClicked);
    map.on('dblclick', _markerLocalFuns.mapFeatureDblClicked);
};

window.gisInteraction.addGuijiMarkers = function (layerName, markers, featureClicked, featureDblClicked) {
	if (markers == null || markers.length < 1)
        return;
    var map = window.map ;
    map.un('click', _markerLocalFuns.mapFeatureClicked);
    map.un('dblclick', _markerLocalFuns.mapFeatureDblClicked);

    //初始化marker图层
    var lyrInfo = _markerLocalFuns.getMarkerLayer(layerName);
    if (lyrInfo == null || lyrInfo == "") {
        lyrInfo = _markerLocalFuns.createMarkerLayer(layerName);
        lyrInfo.markerLayer.setZIndex(10);  //设置图层的zIndex属性
        map.addLayer(lyrInfo.markerLayer);
    }
    for (var i = 0; i < markers.length; i++) {
        var pos = _prjFuns.gps84_to_map(markers[i].lon, markers[i].lat);
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(pos),
            name: markers[i].name,
            id: markers[i].id
        });
        var att = (markers[i].att || {});
        att.layerName = layerName;
        att = (att == null ? {} : att);
        att.id = markers[i].id;
        att.name = markers[i].name;
        att.lon = markers[i].lon;
        att.lat = markers[i].lat;
        att.img = markers[i].img;
        att.style = markers[i].style;
        att.popupContentHTML = markers[i].popupContentHTML;
        att.featureClicked = featureClicked;
        att.featureDblClicked = featureDblClicked;

        iconFeature.att = att;
        iconFeature.set('radius', 12);
        var style = att.style;
        iconFeature.setStyle(style);
        lyrInfo.vectorSource.addFeature(iconFeature);
    }
    //重新绑定事件
    map.on('click', _markerLocalFuns.mapFeatureClicked);
    map.on('dblclick', _markerLocalFuns.mapFeatureDblClicked);
};

window.gisInteraction.addBSMarkers = function (layerName, markers, featureClicked, featureDblClicked) {
    if (markers == null || markers.length < 1)
        return;
    var map = window.map ;
    map.un('click', _markerLocalFuns.mapFeatureClicked);
    map.un('dblclick', _markerLocalFuns.mapFeatureDblClicked);

    //初始化marker图层
    var lyrInfo = _markerLocalFuns.getMarkerLayer(layerName);
    if (lyrInfo == null || lyrInfo == "") {
        lyrInfo = _markerLocalFuns.createMarkerLayer(layerName);
        lyrInfo.markerLayer.setZIndex(10);  //设置图层的zIndex属性
        map.addLayer(lyrInfo.markerLayer);
    }
    for (var i = 0; i < markers.length; i++) {
        var pos = _prjFuns.gps84_to_map(markers[i].lon, markers[i].lat);
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(pos),
            name: markers[i].name,
            id: markers[i].id
        });
        var att = (markers[i].att || {});
        att.layerName = layerName;
        att = (att == null ? {} : att);
        att.id = markers[i].id;
        att.name = markers[i].name;
        att.lon = markers[i].lon;
        att.lat = markers[i].lat;
        att.img = markers[i].img;
        att.anchor = markers[i].anchor;
        att.popupContentHTML = markers[i].popupContentHTML;
        att.featureClicked = featureClicked;
        att.featureDblClicked = featureDblClicked;

        iconFeature.att = att;
        iconFeature.set('radius', 12);
        var style = {};
        style = _markerLocalFuns.getBSImageStyleByLayerName(layerName, att.size);
        iconFeature.setStyle(style);
        lyrInfo.vectorSource.addFeature(iconFeature);
    }
    //重新绑定事件
    map.on('click', _markerLocalFuns.mapFeatureClicked);
    map.on('dblclick', _markerLocalFuns.mapFeatureDblClicked);
}

//清理POI图层，不传递layerName则清理所有POI图层
window.gisInteraction.clearMarkers = function (layerName) {
    var lyrInfo = _markerLocalFuns.getMarkerLayer(layerName);
    if (lyrInfo == null || lyrInfo == '')
        return;
    lyrInfo.vectorSource.clear();
};

//移除POI
window.gisInteraction.removeMarker = function (layerName, id) {
    var lyrInfo = _markerLocalFuns.getMarkerLayer(layerName);
    if (lyrInfo == null || lyrInfo == "") {
        return;
    }
    var features = lyrInfo.vectorSource.getFeatures();
    for (var i = 0; i < features.length; i++) {
        if (features[i].att != null && features[i].att.id == id) {
            lyrInfo.vectorSource.removeFeature(features[i]);
            break;
        }
    }
};

//移除feature
window.gisInteraction.removeFeature = function (layerName, id) {
    var lyrInfo = _markerLocalFuns.getMarkerLayer(layerName);
    if (lyrInfo) {
        var features = lyrInfo.vectorSource.getFeatures();
        for (var i = 0; i < features.length; i++) {
            if (features[i].att != null && features[i].att.id == id) {
                lyrInfo.vectorSource.removeFeature(features[i]);
                break;
            }
        }
    }
    lyrInfo = _featureLocalFuns.getLayer(layerName);
    if (lyrInfo) {
        var features = lyrInfo.vectorSource.getFeatures();
        for (var i = 0; i < features.length; i++) {
            if (features[i].att != null && features[i].att.id == id) {
                lyrInfo.vectorSource.removeFeature(features[i]);
                break;
            }
        }
    }
};

//移除feature
window.gisInteraction.removeFeatureByRange = function (layerName, range) {
    var leftBottom = _prjFuns.gps84_to_map(range[0], range[1]);
    var rightTop = _prjFuns.gps84_to_map(range[2], range[3]);
    var rect = [];
    rect[0] = leftBottom[0];
    rect[1] = leftBottom[1];
    rect[2] = rightTop[0];
    rect[3] = rightTop[1];
    var lyrInfo = _markerLocalFuns.getMarkerLayer(layerName);
    if (lyrInfo) {
        var features = lyrInfo.vectorSource.getFeatures();
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            if (!feature)
                continue;
            var geom = feature.getGeometry();
            var pnt = geom.getCoordinates();
            if (_commonFuns.isPointInRange(rect, pnt)) {
                lyrInfo.vectorSource.removeFeature(feature);
            }
        }
    }
    lyrInfo = _featureLocalFuns.getLayer(layerName);
    if (lyrInfo) {
        var features = lyrInfo.vectorSource.getFeatures();
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            if (!feature)
                continue;
            var geom = feature.getGeometry();
            if (geom.getCenter) {
                var pnt = geom.getCenter();
                if (pnt && _commonFuns.isPointInRange(rect, pnt)) {
                    lyrInfo.vectorSource.removeFeature(feature);
                }
            } else {
                var pntList = geom.getCoordinates();
                if (!pntList || pntList.length < 1)
                    return;
                if (pntList.length == 1)
                    pntList = pntList[0];
                for (var j = 0; j < pntList.length; j++) {
                    var pnt = pntList[j];
                    if (_commonFuns.isPointInRange(rect, pnt)) {
                        lyrInfo.vectorSource.removeFeature(feature);
                        break;
                    }
                }
            }
        }
    }
};

//获取marker图层，返回值为json对象，包括vectorLayer,vectorSource,layerName三个属性;
window.gisInteraction.getMarkerLayer = function (layerName) {
    return _markerLocalFuns.getMarkerLayer(layerName);
};

//添加热力图，参数依次为：图层名称、pntList点数组（pntList为json对象，包括id、lon、lat、weight、att等属性）
window.gisInteraction.addHeatmap = function (layerName, pntList) {
    if (!layerName || !pntList || pntList.length < 1)
        return;
    for (var i = 0; i < pntList.length; i++) {
        var pos = _prjFuns.gps84_to_map(pntList[i].lon, pntList[i].lat);
        pntList[i].lon = pos[0];
        pntList[i].lat = pos[1];
    }
    _heatmapLocalFuns.addFeatures(layerName, pntList);
};

//清理heatmap图层，不传递layerName则清理所有heatmap图层
window.gisInteraction.clearHeatmap = function (layerName) {
    if (!layerName) {
        _heatmapLocalFuns.clearAll();
    } else {
        var lyrInfo = _heatmapLocalFuns.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == '')
            return;
        lyrInfo.vectorSource.clear();
    }
};

//设置图层可见性
window.gisInteraction.setLayerVisible = function (layerName, visible) {
    var lyrInfo = _markerLocalFuns.getMarkerLayer(layerName);
    if (lyrInfo != null && lyrInfo != '')
        lyrInfo.markerLayer.setVisible(visible);
    var lyrInfo = _featureLocalFuns.getLayer(layerName);
    if (lyrInfo != null && lyrInfo != '')
        lyrInfo.vectorLayer.setVisible(visible);
    var lyrInfo = _heatmapLocalFuns.getLayer(layerName);
    if (lyrInfo != null && lyrInfo != '')
        lyrInfo.vectorLayer.setVisible(visible);
};

//显示popup，参数依次为：经度、纬度、popup里的html内容
window.gisInteraction.showPopup = function (id, lon, lat, innerHTML, useDefualtStyle) {
    _popupLocalFuns.clear();
    var pos = _prjFuns.gps84_to_map(lon, lat);
    _popupLocalFuns.addPupup(id, pos[0], pos[1], innerHTML, useDefualtStyle);
};

//显示popup，参数依次为：经度、纬度、popup里的html内容
window.gisInteraction.showPopupCover = function (id, lon, lat, innerHTML, useDefualtStyle, zIndex) {
//    _popupLocalFuns.clear();
    var pos = _prjFuns.gps84_to_map(lon, lat);
    _popupLocalFuns.addPupup(id, pos[0], pos[1], innerHTML, useDefualtStyle, zIndex);
};

//清除popup,id为空则清除所有
window.gisInteraction.clearPopup = function (id) {
    _popupLocalFuns.clear(id);
};

//闪烁，参数依次为：id、经度、纬度、闪烁次数（可空，默认为5次）
window.gisInteraction.showTwinkle = function (id, lon, lat, flashNum) {
    var pos = _prjFuns.gps84_to_map(lon, lat);
    _twinkleLocalFuns.addTwinkle(id, pos[0], pos[1], flashNum);
};

//闪烁，twinkleList数组，每一项的属性包括：id、lon经度、lat纬度、flashNum闪烁次数（可空，默认为5次）
window.gisInteraction.showTwinkleList = function (twinkleList) {
    for (var i = 0; i < twinkleList.length; i++) {
        var pos = _prjFuns.gps84_to_map(twinkleList[i].lon, twinkleList[i].lat);
        twinkleList[i].lon = pos[0];
        twinkleList[i].lat = pos[1];
    }
    _twinkleLocalFuns.addTwinkleList(twinkleList);
};

//清除闪烁
window.gisInteraction.clearTwinkle = function () {
    _twinkleLocalFuns.clear();
};

//更新图标样式，参数依次为：图层名称、图标id、新图标地址、缩放比例、旋转角度
window.gisInteraction.updateMarkerStyle = function (layerName, id, scale, rotation, img) {
    var layerInfo = _markerLocalFuns.getMarkerLayer(layerName);
    if (layerInfo == null || layerInfo == undefined || layerInfo.vectorSource == null)
        return;
    var markers = layerInfo.vectorSource.getFeatures();
    if (markers == null || markers.length < 1)
        return;
    for (var i = 0; i < markers.length; i++) {
        var feature = markers[i];
        if (feature.att == null || feature.att == undefined)
            continue;
        if (feature.att.id != id)
            continue;
        var style = feature.getStyle();
        if (img) {
            feature.att.OldImg = feature.att.img;
            feature.att.img = img;
            style = new ol.style.Style({
                image: new ol.style.Icon(({
                    opacity: 0.75,
                    src: img
                }))
            });
        }
        if (Number(scale) > 0) {
            style.getImage().setScale(scale);
        }
        if (Number(rotation) > 0) {
            style.getImage().setRotation(rotation);
        }
        feature.setStyle(style);
    }
};


window.gisInteraction.existMarkerForLayer = function (layerName,id) {
    var result = false;
    var layerInfo = _markerLocalFuns.getMarkerLayer(layerName);
    if (layerInfo == null || layerInfo == undefined || layerInfo.vectorSource == null)
        return false ;
    var markers = layerInfo.vectorSource.getFeatures();
    if (markers == null || markers.length < 1)
        return false;
    for (var i = 0; i < markers.length; i++) {
        var feature = markers[i];
        if(feature.att.id == id){
        	return true;
        }
    }
    return false;
};


window.gisInteraction.existMarkerForHtmlPosition = function (id) {
    var overlays = map.getOverlays();
    var result = false;
    if (overlays == null || overlays.length < 1)
            return false;
    for (var i = 0; i < overlays.getLength() ; i++) {
        var item = overlays.item(i);
        if (item.id == id) {
            result = true;
        }
    }
    return result;
};

//更新图标位置，参数依次为：图层名称、图标id、图标位置
window.gisInteraction.updateMarkerForHtmlPosition = function (id, pos) {
    var pnt = _prjFuns.gps84_to_map(pos[0], pos[1]);
    var overlays = map.getOverlays();
    if (overlays == null || overlays.length < 1)
            return;
    for (var i = 0; i < overlays.getLength() ; i++) {
        var item = overlays.item(i);
        if (item.id == id) {
            item.setPosition(pnt);
        }
    }
};

//更新图标位置，参数依次为：图层名称、图标id、图标位置
window.gisInteraction.updateMarkerPosition = function (layerName, id, pos) {
    var pnt = _prjFuns.gps84_to_map(pos[0], pos[1]);
    var layerInfo = _markerLocalFuns.getMarkerLayer(layerName);
    if (layerInfo == null || layerInfo == undefined || layerInfo.vectorSource == null)
        return;
    var markers = layerInfo.vectorSource.getFeatures();
    if (markers == null || markers.length < 1)
        return;
    for (var i = 0; i < markers.length; i++) {
        var feature = markers[i];
        if (feature.att == null || feature.att == undefined)
            continue;
        if (feature.att.id != id)
            continue;
        if(feature.att.LONGITUDE){
        	feature.att.LONGITUDE=pos[0];
        }
        if(feature.att.LATITUDE){
        	feature.att.LATITUDE=pos[1];
        }
        feature.getGeometry().setCoordinates(pnt);
    }
};

//定位，参数依次为：经度、纬度、级数（可空）、offsetX（单位像素,以左上角为坐标原点）, offsetY（单位像素）
window.gisInteraction.setPosition = function (lon, lat, zoom, offsetX, offsetY) {
    var pos = _prjFuns.gps84_to_map(lon, lat);
    var map = window.map ;
    if (zoom == null || zoom == "") {
        if ((offsetX || offsetX == 0) && (offsetY || offsetY == 0)) {
            var size = map.getSize();
            var extent = map.getView().calculateExtent(size);
            var dx = extent[2] - extent[0];
            var dy = extent[3] - extent[1];
            var offset_x = dx / size[0] * offsetX;
            var offset_y = dy / size[1] * offsetY;
            pos[0] = pos[0] - offset_x;
            pos[1] = pos[1] + offset_y;
            map.getView().setCenter(pos);
        } else {
            map.getView().setCenter(pos);
        }
    }
    else {
        map.getView().setZoom(zoom);
        map.getView().setCenter(pos);
    }
};


window.gisInteraction.setCenterLeft = function(lon,lat){
	var map = window.map ;
	if(top.window.isCenter)
		window.gisInteraction.setPosition(lon, lat,null,-70,-60);
	top.window.isCenter = true;
}
//定位，参数依次为：经度、纬度、级数（可空）
window.gisInteraction.setZoom = function (zoom) {
    var map = window.map ;
    if(top.window.isZoom)
    	map.getView().setZoom(zoom);
    top.window.isZoom = true;
};

//定位，参数依次为：经度、纬度、级数（可空）
window.gisInteraction.zoomIn = function () {
    var map = window.map ;
    var curZoom = map.getView().getZoom();
    map.getView().setZoom(curZoom + 1);
};

//定位，参数依次为：经度、纬度、级数（可空）
window.gisInteraction.zoomOut = function () {
    var map = window.map ;
    var curZoom = map.getView().getZoom();
    map.getView().setZoom(curZoom - 1);
};

//定位到POI图层范围
window.gisInteraction.zoom2MarkerLayer = function (layerName) {
    var map = window.map ;
    var layerInfo = _markerLocalFuns.getMarkerLayer(layerName);
    if (layerInfo == null || layerInfo == undefined || layerInfo.vectorSource == null)
        return;
    var markers = layerInfo.vectorSource.getFeatures();
    if (markers == null || markers.length < 1)
        return;
    if (markers.length == 1) {
        var pos = markers[0].getGeometry().getCoordinates();
        map.getView().setCenter(pos);
        return;
    }
    var extent = [180, 90, -180, -90];
    for (var i = 0; i < markers.length; i++) {
        var pnt = markers[i].getGeometry().getCoordinates();
        pnt = _prjFuns.map_to_gps84(pnt[0], pnt[1]);
        var lon = pnt[0];
        var lat = pnt[1];
        if (lon == 11 || lat == 11)
            continue;
        if (lon < extent[0])
            extent[0] = lon;
        if (lon > extent[2])
            extent[2] = lon;
        if (lat < extent[1])
            extent[1] = lat;
        if (lat > extent[3])
            extent[3] = lat;
    }
    window.gisInteraction.zoom2Range(extent[2], extent[0], extent[1], extent[3]);
};

//定位到指定的空间范围
window.gisInteraction.zoom2Range = function (east, west, south, north) {
    var map = window.map ;
    var size = map.getSize();

    var lBottom = _prjFuns.gps84_to_map(west, south);
    var rTop = _prjFuns.gps84_to_map(east, north);

    var extent = [lBottom[0], lBottom[1], rTop[0], rTop[1]];
    map.getView().fit(extent, size);

    setTimeout(function () {
        var zoom = map.getView().getZoom();
        if (zoom > 22) {
            map.getView().setZoom(22);
        }
    }, 200);
};

//WGS84经纬度坐标转地图坐标（默认为EPSG:3857）
window.gisInteraction.gps84_to_map = function (lon, lat) {
    var pos = _prjFuns.gps84_to_map(lon, lat);
    return pos;
};

//地图坐标（默认为EPSG:3857）转WGS84经纬度坐标
window.gisInteraction.map_to_gps84 = function (x, y) {
    var pos = _prjFuns.map_to_gps84(x, y);
    return pos;
};

//测量长度
window.gisInteraction.meaureLine = function (callback) {
    _measureLocalFuns.measureLine(callback);
};

//测量面积
window.gisInteraction.meaureArea = function (callback) {
    _measureLocalFuns.measureArea(callback);
};

//停止并清除测量结果
window.gisInteraction.clearMeaure = function () {
    _measureLocalFuns.clear();
};

//停止测量
window.gisInteraction.stopMeasure = function () {
    _measureLocalFuns.stop();
};

/*
 * 计算两点之间的距离,精确到米
 */
window.gisInteraction.calculatePointDistance = function (start, end) {
    var wgs84Sphere = new ol.Sphere(6378137);
    length = parseInt(wgs84Sphere.haversineDistance(start, end));
    var output = Math.round(length * 100) / 100;
    return output;
};

//计算折线距离,精确到米
window.gisInteraction.calculatePolylineDistance = function (coordinates) {
    var length = 0;
    var wgs84Sphere = new ol.Sphere(6378137);
    for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        var c1 = coordinates[i];
        var c2 = coordinates[i + 1];
        length += wgs84Sphere.haversineDistance(c1, c2);
    }
    var output = Math.round(length * 100) / 100;
    return output;
};

//计算圆的半径（以度为单位）
window.gisInteraction.getCircleDegreeRadius = function (circle) {
    var radius = circle.radius;
    var map = window.map ;
    var mapPrj = map.getView().getProjection().getCode();
    if (mapPrj == "EPSG:4326") {
        return radius;
    }
    if (!mapPrj)
        mapPrj = 'EPSG:3857';
    var r = 6378137;
    var degree = 360 * radius / (2 * Math.PI * r);
    return degree;
};

//添加扇形到地图。layerName图层名称；fan对象包括几个属性：pnt圆心、radius半径、view扇形夹角、angle扇形起始角度（东为0，逆时针旋转）、fillColor填充颜色、lineColor边框线颜色、lineWidth边框线宽度、att属性等。
//att其他信息
window.gisInteraction.addFan2Map = function (layerName, fans) {
    fans.pnt = _prjFuns.gps84_to_map(fans.pnt[0], fans.pnt[1]);
    _featureLocalFuns.addFans(layerName, fans);
};

//添加圆到地图。layerName图层名称；circle对象包括：lon、lat、radius半径。
//att其他信息
window.gisInteraction.addTrackCircle2Map = function (circle, callback) {
    _trackLocalFuns.clear();
    _trackLocalFuns.addTrackCircle(circle);
    _trackLocalFuns.addCircleResizeMaker(circle);
    _trackLocalFuns.callback = callback;
};

//添加圆到地图。layerName图层名称；circle对象包括：pnt圆心、radius半径、fillColor填充颜色、lineColor边框线颜色、lineWidth边框线宽度、att属性等。
//att其他信息
window.gisInteraction.addCircle2Map = function (layerName, circle) {
    circle.pnt = _prjFuns.gps84_to_map(circle.pnt[0], circle.pnt[1]);
    _featureLocalFuns.addCircle(layerName, circle);
};

//添加多边形到地图。layerName图层名称；polygon对象包括：pntList坐标、fillColor填充颜色、lineColor边框线颜色、lineWidth边框线宽度、att属性等。
//att其他信息
window.gisInteraction.addPolygon2Map = function (layerName, polygon) {
    for (var i = 0; i < polygon.pntList.length; i++) {
        var pnt = polygon.pntList[i];
        polygon.pntList[i] = _prjFuns.gps84_to_map(pnt[0], pnt[1]);
    }
    _featureLocalFuns.addPolygon(layerName, polygon);
};

//添加遮挡多边形以外的区域到地图。layerName图层名称；polygon对象包括：pntList坐标、fillColor填充颜色、lineColor边框线颜色、lineWidth边框线宽度、att属性等。
//att其他信息
window.gisInteraction.addPolygonOuterAreaOverlay2Map = function (layerName, polygon) {
    var pntList = polygon.pntList;
    for (var i = 0; i < pntList.length; i++) {
        var pnt = pntList[i];
        pntList[i] = _prjFuns.gps84_to_map(pnt[0], pnt[1]);
    }
    var outerList = [[180, 85.05], [180, -85.05], [-180, -85.05], [-180, 85.05], [180, 85.05]];
    for (var i = 0; i < outerList.length; i++) {
        var pnt = outerList[i];
        outerList[i] = _prjFuns.gps84_to_map(pnt[0], pnt[1]);
    }
    var wkt = "POLYGON ((outer),(inner))";
    var outer = "";
    var inner = "";
    for (var i = 0; i < pntList.length; i++) {
        var pnt = pntList[i];
        if (i == 0)
            inner = pnt[0] + " " + pnt[1];
        else
            inner += "," + pnt[0] + " " + pnt[1];
    }
    for (var i = 0; i < outerList.length; i++) {
        var pnt = outerList[i];
        if (i == 0)
            outer = pnt[0] + " " + pnt[1];
        else
            outer += "," + pnt[0] + " " + pnt[1];
    }
    wkt = wkt.replace("outer", outer);
    wkt = wkt.replace("inner", inner);
    polygon.wkt = wkt;
    _featureLocalFuns.addPolygonByWkt(layerName, polygon);
}

//添加多边形到地图。layerName图层名称；wktPolygon对象包括：wkt坐标、fillColor填充颜色、lineColor边框线颜色、lineWidth边框线宽度、att属性等。
//att其他信息
window.gisInteraction.addPolygonByWkt2Map = function (layerName, wktPolygon,featureClicked) {
    if (wktPolygon.wkt.startWith("MULTIPOLYGON")) {
        var polyList = _wktLocalFuns.getPointListFromPolyWkt(wktPolygon.wkt).pntList;
        for (var j = 0; j < polyList.length; j++) {
            var pntList = polyList[j];
            for (var i = 0; i < pntList.length; i++) {
                var pnt = pntList[i];
                pntList[i] = _prjFuns.gps84_to_map(pnt[0], pnt[1]);
            }
            wktPolygon.pntList = pntList;
            _featureLocalFuns.addPolygon(layerName, wktPolygon,featureClicked);
        }
    } else {
        var pntList = _wktLocalFuns.getPointListFromPolyWkt(wktPolygon.wkt).pntList;
        for (var i = 0; i < pntList.length; i++) {
            var pnt = pntList[i];
            pntList[i] = _prjFuns.gps84_to_map(pnt[0], pnt[1]);
        }
        wktPolygon.pntList = pntList;
        _featureLocalFuns.addPolygon(layerName, wktPolygon,featureClicked);
    }
};

//添加折线到地图。layerName图层名称；line对象包括：pntList坐标、lineColor边框线颜色、lineWidth边框线宽度、att属性等。
//att其他信息
window.gisInteraction.addPolyLine2Map = function (layerName, line) {
    for (var i = 0; i < line.pntList.length; i++) {
        var pnt = line.pntList[i];
        line.pntList[i] = _prjFuns.gps84_to_map(pnt[0]*1, pnt[1]*1);
    }
    _featureLocalFuns.addPolyLine(layerName, line);
};

//添加虚线到地图。layerName图层名称；line对象包括：pntList坐标、lineColor边框线颜色、lineWidth边框线宽度、att属性等。
//att其他信息
window.gisInteraction.addDashLine2Map = function (layerName, line) {
    for (var i = 0; i < line.pntList.length; i++) {
        var pnt = line.pntList[i];
        line.pntList[i] = _prjFuns.gps84_to_map(pnt[0], pnt[1]);
    }
    _featureLocalFuns.addDashLine(layerName, line);
};

//添加实箭头到地图。layerName图层名称；line对象包括：pntList坐标、lineColor边框线颜色、lineWidth边框线宽度、att属性等。
//att其他信息
window.gisInteraction.addSolidLineArrow2Map = function (layerName, line) {
    for (var i = 0; i < line.pntList.length; i++) {
        var pnt = line.pntList[i];
        line.pntList[i] = _prjFuns.gps84_to_map(pnt[0], pnt[1]);
    }
    _featureLocalFuns.addSolidLineArrow(layerName, line);
};

//添加虚箭头到地图。layerName图层名称；line对象包括：pntList坐标、lineColor边框线颜色、lineWidth边框线宽度、att属性等。
//att其他信息
window.gisInteraction.addDashLineArrow2Map = function (layerName, line) {
    for (var i = 0; i < line.pntList.length; i++) {
        var pnt = line.pntList[i];
        line.pntList[i] = _prjFuns.gps84_to_map(pnt[0], pnt[1]);
    }
    _featureLocalFuns.addDashLineArrow(layerName, line);
};

//添加两头有短直线帽子的实线到地图。layerName图层名称；line对象包括：pntList坐标、lineColor边框线颜色、lineWidth边框线宽度、att属性等。
//att其他信息
window.gisInteraction.addSolidLineOfEndCap2Map = function (layerName, line) {
    for (var i = 0; i < line.pntList.length; i++) {
        var pnt = line.pntList[i];
        line.pntList[i] = _prjFuns.gps84_to_map(pnt[0], pnt[1]);
    }
    _featureLocalFuns.addSolidLineOfEndCap(layerName, line);
};

//添加两端带箭头和带帽的实线到地图。layerName图层名称；line对象包括：pntList坐标、lineColor边框线颜色、lineWidth边框线宽度、att属性等。
//att其他信息
window.gisInteraction.addSolidLineCapArrow2Map = function (layerName, line) {
    for (var i = 0; i < line.pntList.length; i++) {
        var pnt = line.pntList[i];
        line.pntList[i] = _prjFuns.gps84_to_map(pnt[0], pnt[1]);
    }
    _featureLocalFuns.addSolidLineCapArrow(layerName, line);
};

//添加安检口到地图。layerName图层名称；line对象包括：pntList坐标、lineColor边框线颜色、lineWidth边框线宽度、att属性等。
//att其他信息
window.gisInteraction.addAjkLine2Map = function (layerName, line) {
    for (var i = 0; i < line.pntList.length; i++) {
        var pnt = line.pntList[i];
        line.pntList[i] = _prjFuns.gps84_to_map(pnt[0], pnt[1]);
    }
    _featureLocalFuns.addAjkLine(layerName, line);
};


//绘制向前后追。layerName图层名称；pntList坐标；textString文字；
//styleInfo为json对象，包括arrowIcon, fontColor,fontOuterColor,fontOuterSize几个属性；
//att其他信息
window.gisInteraction.addTrackArrow2Map = function (layerName, pntList, textString, styleInfo, att) {
    for (var i = 0; i < pntList.length; i++) {
        var pnt = pntList[i];
        pntList[i] = _prjFuns.gps84_to_map(pnt[0], pnt[1]);
    }
    _featureLocalFuns.addTrackArrow(layerName, pntList, textString, styleInfo, att);
};

//绘制直线箭头。layerName图层名称；pntList坐标；
//styleInfo为json对象，包括arrowIcon, lineColor, lineWidth, fontColor,fontOuterColor,fontOuterSize几个属性；
//att其他信息
window.gisInteraction.addLineArrow2Map = function (layerName, pntList, styleInfo, att) {
    for (var i = 0; i < pntList.length; i++) {
        var pnt = pntList[i];
        pntList[i] = _prjFuns.gps84_to_map(pnt[0], pnt[1]);
    }
    _featureLocalFuns.addLineArrow(layerName, pntList, styleInfo, att);
};

//画线索轨迹线，箭头居中显示。layerName图层名称；pntList坐标；
//styleInfo为json对象，包括arrowIcon, lineColor, lineWidth, fontColor, fontOuterColor,fontOuterSize,labTransport等属性；
//att其他信息
window.gisInteraction.addLineTrackArrow2Map = function (layerName, pntList, styleInfo, att) {
    for (var i = 0; i < pntList.length; i++) {
        var pnt = pntList[i];
        pntList[i] = _prjFuns.gps84_to_map(pnt[0], pnt[1]);
    }
    _featureLocalFuns.addLineTrackArrow(layerName, pntList, styleInfo, att);
};

//画线索轨迹线，箭头居中显示。layerName图层名称；pntList坐标；
//styleInfo为json对象，包括arrowIcon, lineColor, lineWidth, fontColor, fontOuterColor,fontOuterSize,labTransport等属性；
//att其他信息
window.gisInteraction.addFontLable2Map = function (layerName, pos, textString, styleInfo, att) {
    pos = _prjFuns.gps84_to_map(pos[0], pos[1]);
    _featureLocalFuns.addFontLable(layerName, pos, textString, styleInfo, att);
};

//清除features
window.gisInteraction.clearFeatures = function (layerName) {
    if (layerName == null || layerName == '')
        _featureLocalFuns.clearAll();
    else
        _featureLocalFuns.clear(layerName);
};

//获取，返回值为json对象，包括vectorLayer,vectorSource,layerName三个属性;
window.gisInteraction.getFeatureLayer = function (layerName) {
    return _featureLocalFuns.getLayer(layerName);
};

//获取扇形的多边形wkt窜
window.gisInteraction.getFanPolyWkt = function (pnt, radius, view, angle) {
    var circle = new ol.geom.Circle(pnt, radius);
    var lowpoly = ol.geom.Polygon.fromCircle(circle, 360, 0);
    var pntList = [];
    if (angle + view > 360) {
        pntList = lowpoly.getCoordinates()[0].slice(angle, 360);
        pntList = pntList.concat(lowpoly.getCoordinates()[0].slice(0, view - (360 - angle)));
    } else {
        pntList = lowpoly.getCoordinates()[0].slice(angle, angle + view);
    }
    pntList.unshift(pnt);
    pntList.push(pnt);
    var wkt = _wktLocalFuns.getPolygonWkt(pntList);
    return wkt;
};

var _markerLocalFuns = {
    markerLayers: {},
    styleCache: {},
    clickTimer: null,
    getMarkerLayer: function (layerName) {
        var _this = _markerLocalFuns;
        return _this.markerLayers[layerName];
    },
    createMarkerLayer: function (layerName) {
        var map = window.map ;
        var _this = _markerLocalFuns;
        var lyrInfo = _this.getMarkerLayer(layerName);
        if (lyrInfo != null) {
            lyrInfo.vectorSource.clear();
            return lyrInfo;
        }
        var vectorSource = new ol.source.Vector({ wrapX: false });
        var markerLayer = new ol.layer.Vector({
            source: vectorSource
        });
        markerLayer.layerName = layerName;
        map.addLayer(markerLayer);
        var lyrInfo = {
            'markerLayer': markerLayer,
            'vectorSource': vectorSource,
            'layerName': layerName
        };
        _this.markerLayers[layerName] = lyrInfo;
        return lyrInfo;
    },
    createClusterMarkerLayer: function (layerName, distance) {
        var map = window.map ;
        var _this = _markerLocalFuns;
        try {
            var lyrInfo = _this.getMarkerLayer(layerName);
            if (lyrInfo != null) {
                map.removeLayer(lyrInfo.markerLayer);
                map.un('click', _this.mapFeatureClicked);
            }
        } catch (err) {
            var msg = err;
        }
        if (!distance)
            distance = 50;
        var vectorSource = new ol.source.Vector({ wrapX: false });
        var clusterSource = new ol.source.Cluster({ wrapX: false, distance: distance, source: vectorSource });
        
        var markerLayer =_this.createMarkerLayerByLayerName(layerName,clusterSource);
        
        var lyrInfo = {
            'markerLayer': markerLayer,
            'vectorSource': vectorSource,
            'clusterSource': clusterSource,
            'layerName': layerName
        };
        _this.markerLayers[layerName] = lyrInfo;
        return lyrInfo;
    },
    getBSImageStyleByLayerName : function(layerName, size){
    	var _this = _markerLocalFuns;
    	if(layerName == "elecFenceClusterLayer"){
    		return _this.getElecPointStyle(size);
    	}else if(layerName == "firstClsClusterLayer"){
    		return _this.getFirstPointStyle(size);
    	}else if(layerName == "personKuClusterLayer"){
    		return _this.getzdryPointStyle(size);
    	}else if(layerName == "focalmanClusterLayer"){
    		return _this.getzdryPointStyle(size);
    	}else if(layerName == "jqPointClusterLayer"){
    		return _this.getjqPointStyle(size);
    	}else if(layerName == "casePointClusterLayer"){
    		return _this.getajPointStyle(size);
    	}
    },
    createMarkerLayerByLayerName:function(layerName,clusterSource){
    	var _this = _markerLocalFuns;
    	var markerLayer = null;
    	if(layerName == "firstClassMarkerLayer" || layerName == "firstClsViewAndClusterLayer" || layerName == "firstClsClusterLayer"){//监控点
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.firstPointStyleFunction
        	});
        }else if(layerName == "hotelMarkerLayer"){//宾馆酒店
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.hotelPointStyleFunction
        	});
        }else if(layerName == "netbarMarkerLayer"){//网吧
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.netbarPointStyleFunction
        	});
        }else if(layerName == "faceMarkerLayer" ){//人脸卡口
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.rlkkPointStyleFunction
        	});
        }else if(layerName == "jqMarkerLayer" || layerName == "jqypMarkerLayer" || layerName =='jqCommandMarkerLayer'){  //警情
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.jqStyleFunction
        	});
        }else if(layerName == "caseMarkerLayer" || layerName == "ajMarkerLayer"){  //案件
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.ajStyleFunction
        	});
        }else if(layerName == "fkwwFocalGroupEvent" ){  //反馈维稳中的事件
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.sjStyleFunction
        	});
        }else if(layerName == "fkwwFocalman" || layerName == "hdabFocalman"){  //反馈维稳中的重点人员
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.zdryStyleFunction
        	});
        }else if(layerName == "focalmanClusterLayer"){  //反馈维稳中的重点人员
            markerLayer = new ol.layer.Vector({
                source: clusterSource,
                style: _this.zdryStyleFunction
            });
        }else if(layerName == "personMarkerLayer" || layerName == "jqCommandPersonMarkerLayer"){  //警务通
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.jwtStyleFunction
        	});
        }else if(layerName == "DtGpsMarkerLayer" ){  //电台
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.dtStyleFunction
        	});
        }else if(layerName == "focalDeptMarkerLayer" ){  //重点单位
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.zddwStyleFunction
        	});
        }else if(layerName == "elecFencePointMarkerLayer" || layerName == "elecFencePointMarkerLayerXyr" ){  //电子围栏
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.elecStyleFunction
        	});
        }else if(layerName == "wifiMarkerLayer"){  //wifi
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.wifiStyleFunction
        	});
        }else if(layerName == "fwMarkerLayer"){  //房屋楼栋
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.fwStyleFunction
        	});//xzdStyleFunction
        }else if(layerName == "fkwwFocalmanXzd"){  //重点人员现住地
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.xzdStyleFunction
        	});
        }else{
        	markerLayer = new ol.layer.Vector({
        		source: clusterSource,
        		style: _this.styleFunction
        	});
        }
    	markerLayer.setZIndex(10);//设置图层的zIndex属性
        markerLayer.layerName = layerName;
        return markerLayer;
    },
    mapFeatureClicked: function (evt) {
        if (_trackLocalFuns.drawTool != null || _measureLocalFuns.drawTool != null) {
            return;
        }
        var xy = evt.coordinate;
        var lonLat = _prjFuns.map_to_gps84(xy[0], xy[1]);
        //console.log(JSON.stringify(lonLat));
        var _this = _markerLocalFuns;
        clearTimeout(_this.clickTimer);
        _this.clickTimer = setTimeout(function () {
            var map = window.map ;
            var layerInfo = null;
            var feature = _this.getFeatureAtPixel(evt.pixel);
            if (!feature)
                return;
            if (feature.get('features') == null || feature.get('features') == undefined) {
                var att = feature.att;
                if (att == null)
                    return;
                //打开popup
                var innerHTML = att.popupContentHTML;
                if (innerHTML != null && innerHTML != '') {
                    window.gisInteraction.showPopup(att.id, att.lon, att.lat, innerHTML);
                }
                //执行回调函数
                if (att.featureClicked != null && att.featureClicked != '') {
                    att.feature = feature;
                    att.featureClicked([att]);
                }
            } else {
                var size = feature.get('features').length;
                var firstFeature = feature.get('features')[0];
                var att = firstFeature.att;
                if (att == null)
                    return;
                att.feature = firstFeature;
                if (size > 1) {
                    var attList = [];
                    for (var i = 0; i < size ; i++) {
                        var temp = feature.get('features')[i].att;
                        if (temp != null) {
                            temp.feature = feature;
                            attList.push(temp);
                        }
                    }
                    //执行回调函数
                    if (attList.length > 0 && att.featureClicked != null && att.featureClicked != '') {
                        att.featureClicked(attList);
                    }
                } else {
                    var innerHTML = att.popupContentHTML;
                    if (innerHTML != null && innerHTML != '') {
                        window.gisInteraction.showPopup(att.id, att.lon, att.lat, innerHTML);
                    }
                    //执行回调函数
                    if (att.featureClicked != null && att.featureClicked != '') {
                        att.featureClicked([att]);
                    }
                }
            }
        }, 200);
    },
    mapFeatureDblClicked: function (evt) {
        if (_trackLocalFuns.drawTool != null || _measureLocalFuns.drawTool != null) {
            return;
        }
        var _this = _markerLocalFuns;
        clearTimeout(_this.clickTimer);
        var map = window.map ;
        var layerInfo = null;
        var feature = _this.getFeatureAtPixel(evt.pixel);
        if (!feature)
            return;
        if (feature.get('features') == null || feature.get('features') == undefined) {
            var att = feature.att;
            if (att == null)
                return;
            //执行回调函数
            if (att.featureDblClicked != null && att.featureDblClicked != '') {
                att.feature = feature;
                att.featureDblClicked([att]);
            }
        } else {
            var size = feature.get('features').length;
            var firstFeature = feature.get('features')[0];
            if (size == 1) {
                var att = firstFeature.att;
                if (att == null)
                    return;
                //执行回调函数
                if (att.featureDblClicked != null && att.featureDblClicked != '') {
                    att.feature = firstFeature;
                    att.featureDblClicked([att]);
                }
            }
        }
    },
    getFeatureAtPixel: function (pixel) {
        var _this = _markerLocalFuns;
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
            var feature = map.forEachFeatureAtPixel(pixels[i], function (feature, layer) {
                layerInfo = _this.getMarkerLayer(layer.layerName);
                if (layerInfo && feature)
                    return feature;
            });
            if (feature) {
                return feature;
            }
        }
        return null;
    },
    styleFunction: function (feature, resolution) {
    	var map = window.map ;
    	var _this = _markerLocalFuns;
    	var features = feature.get('features');
    	var firstFeature = features[0];
    	var size = features.length;
    	var styleList = [];
    	var style = null;
    	if (firstFeature.att && firstFeature.att.iconLabelStr) {
    		var att = firstFeature.att;
    		var key = "iconLabelStr" + att.iconLabelStr;
    		if (!style) {
    			//解决聚合图层图表内容偏移不生效的问题  modify by:yangshu  date:2019-01-18
    			if(att.offsetX && att.offsetY){
    				style = _this.getOffsetImageFontStyle(att.img, att.iconLabelStr, att.fillColor, att.strokeColor, att.font, att.offsetX, att.offsetY);
    			}else{
    				style = _this.getImageFontStyle(att.img, att.iconLabelStr, att.fillColor, att.strokeColor, att.font);
    			}
    		}
    	}
    	else if (!style && size > 1 ) {
    		style = _this.getCircleStyle(size);
    	}
    	else if (size == 1) {
    		var originalFeature = features[0];
    		var att = originalFeature.att;
    		var img = att.img;
    		if (!style) {
    			style = _this.getImageStyle(img, att.size);
    		}
    	}
    	if (styleList.length > 0)
    		return styleList;
    	else
    		return [style];
    },
    jwtStyleFunction: function (feature, resolution) {
    	var map = window.map ;
    	var _this = _markerLocalFuns;
    	var features = feature.get('features');
    	var firstFeature = features[0];
    	var size = features.length;
    	var styleList = [];
    	var style = null;
    	if (!style && size > 1 ) {
    		style = _this.getjwtPointStyle(size);
    	}
    	else if (size == 1) {
    		var originalFeature = features[0];
    		var att = originalFeature.att;
    		var img = att.img;
    		if (!style) {
    			style = _this.getImageStyle(img, att.size);
    		}
    	}
    	if (styleList.length > 0)
    		return styleList;
    	else
    		return [style];
    },
    hotelPointStyleFunction: function (feature, resolution) {
    	var map = window.map ;
    	var _this = _markerLocalFuns;
    	var features = feature.get('features');
    	var firstFeature = features[0];
    	var size = features.length;
    	var styleList = [];
    	var style = null;
    	if (!style && size > 1 ) {
    		style = _this.getHotelPointStyle(size);
    	}
    	else if (size == 1) {
    		var originalFeature = features[0];
    		var att = originalFeature.att;
    		var img = att.img;
    		if (!style) {
    			style = _this.getImageStyle(img, att.size);
    		}
    	}
    	if (styleList.length > 0)
    		return styleList;
    	else
    		return [style];
    },
    netbarPointStyleFunction: function (feature, resolution) {
    	var map = window.map ;
    	var _this = _markerLocalFuns;
    	var features = feature.get('features');
    	var firstFeature = features[0];
    	var size = features.length;
    	var styleList = [];
    	var style = null;
    	if (!style && size > 1 ) {
    		style = _this.getNetbarPointStyle(size);
    	}
    	else if (size == 1) {
    		var originalFeature = features[0];
    		var att = originalFeature.att;
    		var img = att.img;
    		if (!style) {
    			style = _this.getImageStyle(img, att.size);
    		}
    	}
    	if (styleList.length > 0)
    		return styleList;
    	else
    		return [style];
    },
    dtStyleFunction: function (feature, resolution) {
    	var map = window.map ;
    	var _this = _markerLocalFuns;
    	var features = feature.get('features');
    	var firstFeature = features[0];
    	var size = features.length;
    	var styleList = [];
    	var style = null;
    	if (!style && size > 1 ) {
    		style = _this.getdtPointStyle(size);
    	}
    	else if (size == 1) {
    		var originalFeature = features[0];
    		var att = originalFeature.att;
    		var img = att.img;
    		if (!style) {
    			style = _this.getImageStyle(img, att.size);
    		}
    	}
    	if (styleList.length > 0)
    		return styleList;
    	else
    		return [style];
    },
    zdryStyleFunction: function (feature, resolution) {
    	var map = window.map ;
    	var _this = _markerLocalFuns;
    	var features = feature.get('features');
    	var firstFeature = features[0];
    	var size = features.length;
    	var styleList = [];
    	var style = null;
    	if (!style && size > 1 ) {
    		style = _this.getzdryPointStyle(size);
    	}
    	else if (size == 1) {
    		var originalFeature = features[0];
    		var att = originalFeature.att;
    		var img = att.img;
    		if (!style) {
    			style = _this.getImageStyle(img, att.size);
    		}
    	}
    	if (styleList.length > 0)
    		return styleList;
    	else
    		return [style];
    },
    sjStyleFunction: function (feature, resolution) {
    	var map = window.map ;
    	var _this = _markerLocalFuns;
    	var features = feature.get('features');
    	var firstFeature = features[0];
    	var size = features.length;
    	var styleList = [];
    	var style = null;
    	if (!style && size > 1 ) {
    		style = _this.getsjPointStyle(size);
    	}
    	else if (size == 1) {
    		var originalFeature = features[0];
    		var att = originalFeature.att;
    		var img = att.img;
    		if (!style) {
    			style = _this.getImageStyle(img, att.size);
    		}
    	}
    	if (styleList.length > 0)
    		return styleList;
    	else
    		return [style];
    },
    ajStyleFunction: function (feature, resolution) {
    	var map = window.map ;
    	var _this = _markerLocalFuns;
    	var features = feature.get('features');
    	var firstFeature = features[0];
    	var size = features.length;
    	var styleList = [];
    	var style = null;
    	if (!style && size > 1 ) {
    		style = _this.getajPointStyle(size);
    	}
    	else if (size == 1) {
    		var originalFeature = features[0];
    		var att = originalFeature.att;
    		var img = att.img;
    		if (!style) {
    			style = _this.getImageStyle(img, att.size);
    		}
    	}
    	if (styleList.length > 0)
    		return styleList;
    	else
    		return [style];
    },
    elecStyleFunction: function (feature, resolution) {
    	var map = window.map ;
    	var _this = _markerLocalFuns;
    	var features = feature.get('features');
    	var firstFeature = features[0];
    	var size = features.length;
    	var styleList = [];
    	var style = null;
    	if (!style && size > 1 ) {
    		style = _this.getElecPointStyle(size);
    	}
    	else if (size == 1) {
    		var originalFeature = features[0];
    		var att = originalFeature.att;
    		var img = att.img;
    		if (!style) {
    			style = _this.getImageStyle(img, att.size);
    		}
    	}
    	if (styleList.length > 0)
    		return styleList;
    	else
    		return [style];
    },
    wifiStyleFunction: function (feature, resolution) {
    	var map = window.map ;
    	var _this = _markerLocalFuns;
    	var features = feature.get('features');
    	var firstFeature = features[0];
    	var size = features.length;
    	var styleList = [];
    	var style = null;
    	if (!style && size > 1 ) {
    		style = _this.getWifiPointStyle(size);
    	}
    	else if (size == 1) {
    		var originalFeature = features[0];
    		var att = originalFeature.att;
    		var img = att.img;
    		if (!style) {
    			style = _this.getImageStyle(img, att.size);
    		}
    	}
    	if (styleList.length > 0)
    		return styleList;
    	else
    		return [style];
    },
    xzdStyleFunction: function (feature, resolution) {
    	var map = window.map ;
    	var _this = _markerLocalFuns;
    	var features = feature.get('features');
    	var firstFeature = features[0];
    	var size = features.length;
    	var styleList = [];
    	var style = null;
    	if (!style && size > 1 ) {
    		style = _this.getXzdPointStyle(size);
    	}
    	else if (size == 1) {
    		var originalFeature = features[0];
    		var att = originalFeature.att;
    		var img = att.img;
    		if (!style) {
    			style = _this.getImageStyle(img, att.size, [0.5,1]);
    		}
    	}
    	if (styleList.length > 0)
    		return styleList;
    	else
    		return [style];
    },
    fwStyleFunction : function(feature, resolution){
    	var map = window.map ;
    	var _this = _markerLocalFuns;
    	var features = feature.get('features');
    	var firstFeature = features[0];
    	var size = features.length;
    	var styleList = [];
    	var style = null;
    	if (!style && size > 1 ) {
    		style = _this.getFwPointStyle(size);
    	}
    	else if (size == 1) {
    		var originalFeature = features[0];
    		var att = originalFeature.att;
    		var img = att.img;
    		if (!style) {
    			style = _this.getImageStyle(img, att.size);
    		}
    	}
    	if (styleList.length > 0)
    		return styleList;
    	else
    		return [style];
    },
    jqStyleFunction: function (feature, resolution) {
    	var map = window.map ;
    	var _this = _markerLocalFuns;
    	var features = feature.get('features');
    	var firstFeature = features[0];
    	var size = features.length;
    	var styleList = [];
    	var style = null;
    	if (!style && size > 1 ) {
    		style = _this.getjqPointStyle(size);
    	}
    	else if (size == 1) {
    		var originalFeature = features[0];
    		var att = originalFeature.att;
    		var img = att.img;
    		if (!style) {
    			style = _this.getImageStyle(img, att.size);
    		}
    	}
    	if (styleList.length > 0)
    		return styleList;
    	else
    		return [style];
    },
    rlkkPointStyleFunction: function (feature, resolution) {
    	var map = window.map ;
    	var _this = _markerLocalFuns;
    	var features = feature.get('features');
    	var firstFeature = features[0];
    	var size = features.length;
    	var styleList = [];
    	var style = null;
    	if (firstFeature.att && firstFeature.att.iconLabelStr) {
    		var att = firstFeature.att;
    		var key = "iconLabelStr" + att.iconLabelStr;
    		style = _this.styleCache[key];
    		if (!style) {
    			style = _this.getImageFontStyle(att.img, att.iconLabelStr, att.fillColor, att.strokeColor, att.font);
    		}
    	}
    	else if (!style && size > 1 ) {
    		style = _this.getRlkkPointStyle(size);
    	}
    	else if (size == 1) {
    		var originalFeature = features[0];
    		var att = originalFeature.att;
    		var img = att.img;
    		if (!style) {
    			style = _this.getImageStyle(img, att.size);
    		}
    	}
    	if (styleList.length > 0)
    		return styleList;
    	else
    		return [style];
    },
    firstPointStyleFunction: function (feature, resolution) {
        var map = window.map ;
        var _this = _markerLocalFuns;
        var features = feature.get('features');
        var firstFeature = features[0];
        var size = features.length;
        var styleList = [];
        var style = null;
        if (firstFeature.att && firstFeature.att.iconLabelStr) {
            var att = firstFeature.att;
            var key = "iconLabelStr" + att.iconLabelStr;
            if (!style) {
                style = _this.getImageFontStyle(att.img, att.iconLabelStr, att.fillColor, att.strokeColor, att.font);
            }
        }
        else if (!style && size > 1 ) {
            style = _this.getFirstPointStyle(size);
        }
        else if (size == 1) {
            var originalFeature = features[0];
            var att = originalFeature.att;
            var img = att.img;
            if (!style) {
                style = _this.getImageStyle(img, att.size);
            }
        }
        if (styleList.length > 0)
            return styleList;
        else
            return [style];
    },
    getCircleStyle: function (number) {
    	var style = new ol.style.Style({
    		image: new ol.style.Icon(({
    			opacity: 1,
    			src: 'resource/images/m0.png'
    		})),
    		text: new ol.style.Text({
    			font: '11px sans-serif',
    			text: number.toString(),
    			fill: new ol.style.Fill({
    				color: '#333'
    			}),
    			stroke: new ol.style.Stroke({
    				color: "rgba(3, 3, 3, 0)",
    				width: 1
    			})
    		})
    	});
    	return style;
    },
    getjwtPointStyle: function (number) {
    	var imgSrc1 = '';
    	var imgSrc2 = '';
    	var imgSrc3 = '';
    	var imgSrc4 = '';
    	var imgSrc = '';
    	if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("警务通")){
    		var layerInfo = top.gisLayerConfigMap.get("警务通");
    		imgSrc1 =layerInfo.clusterIconSingle;
    		imgSrc2 =layerInfo.clusterIconDouble;
    		imgSrc3 =layerInfo.clusterIconThird;
    		imgSrc4 =layerInfo.clusterIconFourth;
    	}
		if(number >0 && number <10){
			if(imgSrc1)
				imgSrc = top.BASE_PATH + imgSrc1;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/jwt/default/jwtJH_1.png';
		}
		else if(number >9 && number <100){
			if(imgSrc2)
				imgSrc = top.BASE_PATH + imgSrc2;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/jwt/default/jwtJH_2.png';
		}
		else if(number >99){
			if(imgSrc3)
				imgSrc = top.BASE_PATH + imgSrc3;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/jwt/default/jwtJH_3.png';
		}
    	var style = new ol.style.Style({
    		image: new ol.style.Icon(({
    			opacity: 1,
    			src: imgSrc
    		})),
    		text: new ol.style.Text({
    			font: '11px sans-serif',
    			text: number.toString(),
    			fill: new ol.style.Fill({
    				color: '#fff'
    			}),
    			offsetX:'8',
    			offsetY:'10',
    			stroke: new ol.style.Stroke({
    				color: "rgba(3, 3, 3, 0)",
    				width: 1
    			})
    		})
    	});
    	return style;
    },
    getdtPointStyle: function (number) {
    	var imgSrc1 = '';
    	var imgSrc2 = '';
    	var imgSrc3 = '';
    	var imgSrc4 = '';
    	var imgSrc = '';
    	if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("电台")){
    		var layerInfo = top.gisLayerConfigMap.get("电台");
    		imgSrc1 =layerInfo.clusterIconSingle;
    		imgSrc2 =layerInfo.clusterIconDouble;
    		imgSrc3 =layerInfo.clusterIconThird;
    		imgSrc4 =layerInfo.clusterIconFourth;
    	}
		if(number >0 && number <10){
			if(imgSrc1)
				imgSrc = top.BASE_PATH + imgSrc1;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/dt/default/dtJH_1.png';
		}
		else if(number >9 && number <100){
			if(imgSrc2)
				imgSrc = top.BASE_PATH + imgSrc2;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/dt/default/dtJH_2.png';
		}
		else if(number >99){
			if(imgSrc3)
				imgSrc = top.BASE_PATH + imgSrc3;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/dt/default/dtJH_3.png';
		}
    	var style = new ol.style.Style({
    		image: new ol.style.Icon(({
    			opacity: 1,
    			src: imgSrc
    		})),
    		text: new ol.style.Text({
    			font: '11px sans-serif',
    			text: number.toString(),
    			fill: new ol.style.Fill({
    				color: '#fff'
    			}),
    			offsetX:'7',
    			offsetY:'10',
    			stroke: new ol.style.Stroke({
    				color: "rgba(3, 3, 3, 0)",
    				width: 1
    			})
    		})
    	});
    	return style;
    },
    getHotelPointStyle: function (number) {
    	var imgSrc1 = '';
    	var imgSrc2 = '';
    	var imgSrc3 = '';
    	var imgSrc4 = '';
    	var imgSrc = '';
    	if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("宾馆酒店")){
    		var layerInfo = top.gisLayerConfigMap.get("宾馆酒店");
    		imgSrc1 =layerInfo.clusterIconSingle;
    		imgSrc2 =layerInfo.clusterIconDouble;
    		imgSrc3 =layerInfo.clusterIconThird;
    		imgSrc4 =layerInfo.clusterIconFourth;
    	}
		if(number >0 && number <10){
			if(imgSrc1)
				imgSrc = top.BASE_PATH + imgSrc1;
			else
				imgSrc = 'resource/images/m0.png';
		}else if(number >9 && number <100){
			if(imgSrc2)
				imgSrc = top.BASE_PATH + imgSrc2;
			else
				imgSrc = 'resource/images/m0.png';
		}else if(number >99){
			if(imgSrc3)
				imgSrc = top.BASE_PATH + imgSrc3;
			else
				imgSrc = 'resource/images/m0.png';
		}
    	var style = new ol.style.Style({
    		image: new ol.style.Icon(({
    			opacity: 1,
    			src: imgSrc
    		})),
    		text: new ol.style.Text({
    			font: '11px sans-serif',
    			text: number.toString(),
    			fill: new ol.style.Fill({
    				color: '#fff'
    			}),
    			offsetX:'7',
    			offsetY:'10',
    			stroke: new ol.style.Stroke({
    				color: "rgba(3, 3, 3, 0)",
    				width: 1
    			})
    		})
    	});
    	return style;
    },
    getNetbarPointStyle: function (number) {
    	var imgSrc1 = '';
    	var imgSrc2 = '';
    	var imgSrc3 = '';
    	var imgSrc4 = '';
    	var imgSrc = '';
    	if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("网吧")){
    		var layerInfo = top.gisLayerConfigMap.get("网吧");
    		imgSrc1 =layerInfo.clusterIconSingle;
    		imgSrc2 =layerInfo.clusterIconDouble;
    		imgSrc3 =layerInfo.clusterIconThird;
    		imgSrc4 =layerInfo.clusterIconFourth;
    	}
		if(number >0 && number <10){
			if(imgSrc1)
				imgSrc = top.BASE_PATH + imgSrc1;
			else
				imgSrc = 'resource/images/m0.png';
		}else if(number >9 && number <100){
			if(imgSrc2)
				imgSrc = top.BASE_PATH + imgSrc2;
			else
				imgSrc = 'resource/images/m0.png';
		}else if(number >99){
			if(imgSrc3)
				imgSrc = top.BASE_PATH + imgSrc3;
			else
				imgSrc = 'resource/images/m0.png';
		}
    	var style = new ol.style.Style({
    		image: new ol.style.Icon(({
    			opacity: 1,
    			src: imgSrc
    		})),
    		text: new ol.style.Text({
    			font: '11px sans-serif',
    			text: number.toString(),
    			fill: new ol.style.Fill({
    				color: '#fff'
    			}),
    			offsetX:'7',
    			offsetY:'10',
    			stroke: new ol.style.Stroke({
    				color: "rgba(3, 3, 3, 0)",
    				width: 1
    			})
    		})
    	});
    	return style;
    },
    getzdryPointStyle: function (number) {
    	var imgSrc1 = '';
    	var imgSrc2 = '';
    	var imgSrc3 = '';
    	var imgSrc4 = '';
    	var imgSrc = '';
    	if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("重点人员")){
    		var layerInfo = top.gisLayerConfigMap.get("重点人员");
    		imgSrc1 =layerInfo.clusterIconSingle;
    		imgSrc2 =layerInfo.clusterIconDouble;
    		imgSrc3 =layerInfo.clusterIconThird;
    		imgSrc4 =layerInfo.clusterIconFourth;
    	}
    	console.log(number);
		if(number >0 && number <10){
			if(imgSrc1)
				imgSrc = top.BASE_PATH + imgSrc1;
			else
				imgSrc = '../img/layerIco/zdry/default/zdryJH_1.png';
		}
		else if(number >9 && number <100){
			if(imgSrc2)
				imgSrc = top.BASE_PATH + imgSrc2;
			else
				imgSrc = '../img/layerIco/zdry/default/zdryJH_2.png';
		}
		else if(number >99){
			if(imgSrc3)
				imgSrc = top.BASE_PATH + imgSrc3;
			else
				imgSrc = '../img/layerIco/zdry/default/zdryJH_3.png';
		}
    	var style = new ol.style.Style({
    		image: new ol.style.Icon(({
    			opacity: 1,
    			src: imgSrc
    		})),
    		text: new ol.style.Text({
    			font: '11px sans-serif',
    			text: number.toString(),
    			fill: new ol.style.Fill({
    				color: '#fff'
    			}),
    			offsetX:'9',
    			offsetY:'4',
    			stroke: new ol.style.Stroke({
    				color: "rgba(3, 3, 3, 0)",
    				width: 1
    			})
    		})
    	});
    	return style;
    },
    getsjPointStyle: function (number) {
    	var imgSrc1 = '';
    	var imgSrc2 = '';
    	var imgSrc3 = '';
    	var imgSrc4 = '';
    	var imgSrc = '';
    	if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("事件")){
    		var layerInfo = top.gisLayerConfigMap.get("事件");
    		imgSrc1 =layerInfo.clusterIconSingle;
    		imgSrc2 =layerInfo.clusterIconDouble;
    		imgSrc3 =layerInfo.clusterIconThird;
    		imgSrc4 =layerInfo.clusterIconFourth;
    	}
		if(number >0 && number <10){
			if(imgSrc1)
				imgSrc = top.BASE_PATH + imgSrc1;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/sj/default/sjJH_1.png';
		}
		else if(number >9 && number <100){
			if(imgSrc2)
				imgSrc = top.BASE_PATH + imgSrc2;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/sj/default/sjJH_2.png';
		}
		else if(number >99){
			if(imgSrc3)
				imgSrc = top.BASE_PATH + imgSrc3;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/sj/default/sjJH_3.png';
		}
    	var style = new ol.style.Style({
    		image: new ol.style.Icon(({
    			opacity: 1,
    			src: imgSrc
    		})),
    		text: new ol.style.Text({
    			font: '11px sans-serif',
    			text: number.toString(),
    			fill: new ol.style.Fill({
    				color: '#fff'
    			}),
    			offsetX:'10',
    			offsetY:'-17',
    			stroke: new ol.style.Stroke({
    				color: "rgba(3, 3, 3, 0)",
    				width: 1
    			})
    		})
    	});
    	return style;
    },
    getajPointStyle: function (number) {
    	var imgSrc1 = '';
    	var imgSrc2 = '';
    	var imgSrc3 = '';
    	var imgSrc4 = '';
    	var imgSrc = '';
    	if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("案件")){
    		var layerInfo = top.gisLayerConfigMap.get("案件");
    		imgSrc1 =layerInfo.clusterIconSingle;
    		imgSrc2 =layerInfo.clusterIconDouble;
    		imgSrc3 =layerInfo.clusterIconThird;
    		imgSrc4 =layerInfo.clusterIconFourth;
    	}
		if(number >0 && number <10){
			if(imgSrc1)
				imgSrc = top.BASE_PATH + imgSrc1;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/aj/default/ajJH_1.png';
		}
		else if(number >9 && number <100){
			if(imgSrc2)
				imgSrc = top.BASE_PATH + imgSrc2;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/aj/default/ajJH_2.png';
		}
		else if(number >99){
			if(imgSrc3)
				imgSrc = top.BASE_PATH + imgSrc3;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/aj/default/ajJH_3.png';
		}
    	var style = new ol.style.Style({
    		image: new ol.style.Icon(({
    			opacity: 1,
    			src: imgSrc
    		})),
    		text: new ol.style.Text({
    			font: '11px sans-serif',
    			text: number.toString(),
    			fill: new ol.style.Fill({
    				color: '#fff'
    			}),
    			offsetX:'10',
    			offsetY:'-17',
    			stroke: new ol.style.Stroke({
    				color: "rgba(3, 3, 3, 0)",
    				width: 1
    			})
    		})
    	});
    	return style;
    },
    getElecPointStyle: function (number) {
    	var imgSrc1 = 'resource/scienceLayout/images/layerIco/elec/elec_1.png';
    	var imgSrc2 = 'resource/scienceLayout/images/layerIco/elec/elec_2.png';
    	var imgSrc3 = 'resource/scienceLayout/images/layerIco/elec/elec_3.png';
    	var imgSrc4 = 'resource/scienceLayout/images/layerIco/elec/elec_3.png';
    	var imgSrc = 'resource/scienceLayout/images/layerIco/elec/elec.png';
    	if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("电子围栏")){
    		var layerInfo = top.gisLayerConfigMap.get("电子围栏");
    		imgSrc1 =layerInfo.clusterIconSingle;
    		imgSrc2 =layerInfo.clusterIconDouble;
    		imgSrc3 =layerInfo.clusterIconThird;
    		imgSrc4 =layerInfo.clusterIconFourth;
    	}
		if(number >0 && number <10){
			if(imgSrc1)
				imgSrc = window.location.origin + '/psop_web/' + imgSrc1;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/elec/elec_1.png';
		}
		else if(number >9 && number <100){
			if(imgSrc2)
				imgSrc = window.location.origin + '/psop_web/' + imgSrc2;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/elec/elec_2.png';
		}
		else if(number >99){
			if(imgSrc3)
				imgSrc = window.location.origin + '/psop_web/' + imgSrc3;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/elec/elec_3.png';
		}
    	var style = new ol.style.Style({
    		image: new ol.style.Icon(({
    			opacity: 1,
    			src: imgSrc
    		})),
    		text: new ol.style.Text({
    			font: '11px sans-serif',
    			text: number.toString(),
    			fill: new ol.style.Fill({
    				color: '#fff'
    			}),
    			offsetX:'8',
    			offsetY:'3',
    			stroke: new ol.style.Stroke({
    				color: "rgba(3, 3, 3, 0)",
    				width: 1
    			})
    		})
    	});
    	return style;
    },
    getWifiPointStyle: function (number) {
    	var imgSrc1 = 'resource/scienceLayout/images/layerIco/wifi/wifi_1.png';
    	var imgSrc2 = 'resource/scienceLayout/images/layerIco/wifi/wifi_2.png';
    	var imgSrc3 = 'resource/scienceLayout/images/layerIco/wifi/wifi_3.png';
    	var imgSrc = 'resource/scienceLayout/images/layerIco/wifi/wifi.png';
    	if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("WIFI探针")){
    		var layerInfo = top.gisLayerConfigMap.get("WIFI探针");
    		imgSrc1 =layerInfo.clusterIconSingle;
    		imgSrc2 =layerInfo.clusterIconDouble;
    		imgSrc3 =layerInfo.clusterIconThird;
    		imgSrc4 =layerInfo.clusterIconFourth;
    	}
		if(number >0 && number <10){
			if(imgSrc1)
				imgSrc = window.location.origin + '/psop_web/' + imgSrc1;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/wifi/wifi_1.png';
		}
		else if(number >9 && number <100){
			if(imgSrc2)
				imgSrc = window.location.origin + '/psop_web/' + imgSrc2;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/wifi/wifi_2.png';
		}
		else if(number >99){
			if(imgSrc3)
				imgSrc = window.location.origin + '/psop_web/' + imgSrc3;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/wifi/wifi_3.png';
		}
    	var style = new ol.style.Style({
    		image: new ol.style.Icon(({
    			opacity: 1,
    			src: imgSrc
    		})),
    		text: new ol.style.Text({
    			font: '11px sans-serif',
    			text: number.toString(),
    			fill: new ol.style.Fill({
    				color: '#fff'
    			}),
    			offsetX:'8',
    			offsetY:'3',
    			stroke: new ol.style.Stroke({
    				color: "rgba(3, 3, 3, 0)",
    				width: 1
    			})
    		})
    	});
    	return style;
    },
    getFwPointStyle : function (number) {
    	var imgSrc1 = 'resource/scienceLayout/images/layerIco/community/ld_1.png';
    	var imgSrc2 = 'resource/scienceLayout/images/layerIco/community/ld_2.png';
    	var imgSrc3 = 'resource/scienceLayout/images/layerIco/community/ld_3.png';
    	var imgSrc = 'resource/scienceLayout/images/layerIco/community/ld.png';
    	if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("房屋楼栋")){
    		var layerInfo = top.gisLayerConfigMap.get("房屋楼栋");
    		imgSrc1 =layerInfo.clusterIconSingle;
    		imgSrc2 =layerInfo.clusterIconDouble;
    		imgSrc3 =layerInfo.clusterIconThird;
    		imgSrc4 =layerInfo.clusterIconFourth;
    	}
		if(number >0 && number <10){
			if(imgSrc1)
				imgSrc = window.location.origin + '/psop_web/' + imgSrc1;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/community/ld_1.png';
		}
		else if(number >9 && number <100){
			if(imgSrc2)
				imgSrc = window.location.origin + '/psop_web/' + imgSrc2;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/community/ld_2.png';
		}
		else if(number >99){
			if(imgSrc3)
				imgSrc = window.location.origin + '/psop_web/' + imgSrc3;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/wifi/community/ld_3.png';
		}
    	var style = new ol.style.Style({
    		image: new ol.style.Icon(({
    			opacity: 1,
    			src: imgSrc
    		})),
    		text: new ol.style.Text({
    			font: '11px sans-serif',
    			text: number.toString(),
    			fill: new ol.style.Fill({
    				color: '#fff'
    			}),
    			offsetX:'8',
    			offsetY:'3',
    			stroke: new ol.style.Stroke({
    				color: "rgba(3, 3, 3, 0)",
    				width: 1
    			})
    		})
    	});
    	return style;
    },
    getjqPointStyle: function (number) {
    	var imgSrc1 = '';
    	var imgSrc2 = '';
    	var imgSrc3 = '';
    	var imgSrc4 = '';
    	var imgSrc = '';
    	if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("警情")){
    		var layerInfo = top.gisLayerConfigMap.get("警情");
    		imgSrc1 =layerInfo.clusterIconSingle;
    		imgSrc2 =layerInfo.clusterIconDouble;
    		imgSrc3 =layerInfo.clusterIconThird;
    		imgSrc4 =layerInfo.clusterIconFourth;
    	}
		if(number >0 && number <10){
			if(imgSrc1)
				imgSrc = top.BASE_PATH + imgSrc1;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/jq/default/jqJH_1.png';
		}
		else if(number >9 && number <100){
			if(imgSrc2)
				imgSrc = top.BASE_PATH + imgSrc2;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/jq/default/jqJH_2.png';
		}
		else if(number >99){
			if(imgSrc3)
				imgSrc = top.BASE_PATH + imgSrc3;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/jq/default/jqJH_3.png';
		}
    	var style = new ol.style.Style({
    		image: new ol.style.Icon(({
    			opacity: 1,
    			src: imgSrc
    		})),
    		text: new ol.style.Text({
    			font: '11px sans-serif',
    			text: number.toString(),
    			fill: new ol.style.Fill({
    				color: '#fff'
    			}),
    			offsetX:'10',
    			offsetY:'-17',
    			stroke: new ol.style.Stroke({
    				color: "rgba(3, 3, 3, 0)",
    				width: 1
    			})
    		})
    	});
    	return style;
    },
    getRlkkPointStyle: function (number) {
    	var imgSrc1 = '';
    	var imgSrc2 = '';
    	var imgSrc3 = '';
    	var imgSrc4 = '';
    	var imgSrc = '';
    	if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("人脸卡口")){
    		var layerInfo = top.gisLayerConfigMap.get("人脸卡口");
    		imgSrc1 =layerInfo.clusterIconSingle;
    		imgSrc2 =layerInfo.clusterIconDouble;
    		imgSrc3 =layerInfo.clusterIconThird;
    		imgSrc4 =layerInfo.clusterIconFourth;
    	}
		if(number >0 && number <10){
			if(imgSrc1)
				imgSrc = top.BASE_PATH + imgSrc1;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/rlkk/default/rlkkJH_1.png';
		}
		else if(number >9 && number <100){
			if(imgSrc2)
				imgSrc = top.BASE_PATH + imgSrc2;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/rlkk/default/rlkkJH_2.png';
		}
		else if(number >99){
			if(imgSrc3)
				imgSrc = top.BASE_PATH + imgSrc3;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/rlkk/default/rlkkJH_3.png';
		}
    	var style = new ol.style.Style({
    		image: new ol.style.Icon(({
    			opacity: 1,
    			src: imgSrc
    		})),
    		text: new ol.style.Text({
    			font: '11px sans-serif',
    			text: number.toString(),
    			fill: new ol.style.Fill({
    				color: '#fff'
    			}),
    			offsetX:'10',
    			offsetY:'5',
    			stroke: new ol.style.Stroke({
    				color: "rgba(3, 3, 3, 0)",
    				width: 1
    			})
    		})
    	});
    	return style;
    },
    getFirstPointStyle: function (number) {
    	var imgSrc1 = '';
    	var imgSrc2 = '';
    	var imgSrc3 = '';
    	var imgSrc4 = '';
    	var imgSrc = '';
    	if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("监控点")){
    		var layerInfo = top.gisLayerConfigMap.get("监控点");
    		imgSrc1 =layerInfo.clusterIconSingle;
    		imgSrc2 =layerInfo.clusterIconDouble;
    		imgSrc3 =layerInfo.clusterIconThird;
    		imgSrc4 =layerInfo.clusterIconFourth;
    	}
		if(number >0 && number <10){
			if(imgSrc1)
				imgSrc = top.BASE_PATH + imgSrc1;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/jkd/default/sxtJH_1.png';
		}
		else if(number >9 && number <100){
			if(imgSrc2)
				imgSrc = top.BASE_PATH + imgSrc2;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/jkd/default/sxtJH_2.png';
		}
		else if(number >99){
			if(imgSrc3)
				imgSrc = top.BASE_PATH + imgSrc3;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/jkd/default/sxtJH_3.png';
		}
        var style = new ol.style.Style({
            image: new ol.style.Icon(({
                opacity: 1,
                src: imgSrc
            })),
            text: new ol.style.Text({
                font: '11px sans-serif',
                text: number.toString(),
                fill: new ol.style.Fill({
                    color: '#fff'
                }),
                offsetX:'10',
                offsetY:'5',
                stroke: new ol.style.Stroke({
                    color: "rgba(3, 3, 3, 0)",
                    width: 1
                })
            })
        });
        return style;
    },
    getXzdPointStyle: function (number) {
    	var imgSrc1 = 'resource/scienceLayout/images/layerIco/zdry/xzd/xzd_1.png';
    	var imgSrc2 = 'resource/scienceLayout/images/layerIco/zdry/xzd/xzd_2.png';
    	var imgSrc3 = 'resource/scienceLayout/images/layerIco/zdry/xzd/xzd_3.png';
    	var imgSrc = 'resource/scienceLayout/images/layerIco/zdry/xzd/xzd.png';
    	if(top.gisLayerConfigMap && top.gisLayerConfigMap.get("XZD")){
    		var layerInfo = top.gisLayerConfigMap.get("XZD");
    		imgSrc1 =layerInfo.clusterIconSingle;
    		imgSrc2 =layerInfo.clusterIconDouble;
    		imgSrc3 =layerInfo.clusterIconThird;
    		imgSrc4 =layerInfo.clusterIconFourth;
    	}
		if(number >0 && number <10){
			if(imgSrc1)
				imgSrc = window.location.origin + '/psop_web/' + imgSrc1;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/zdry/xzd/xzd_1.png';
		}
		else if(number >9 && number <100){
			if(imgSrc2)
				imgSrc = window.location.origin + '/psop_web/' + imgSrc2;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/zdry/xzd/xzd_2.png';
		}
		else if(number >99){
			if(imgSrc3)
				imgSrc = window.location.origin + '/psop_web/' + imgSrc3;
			else
				imgSrc = 'resource/scienceLayout/images/layerIco/zdry/xzd/xzd_3.png';
		}
    	var style = new ol.style.Style({
    		image: new ol.style.Icon(({
    			opacity: 1,
    			src: imgSrc,
    			anchor : [0.5,1]
    		})),
    		text: new ol.style.Text({
    			font: '11px sans-serif',
    			text: number.toString(),
    			fill: new ol.style.Fill({
    				color: '#fff'
    			}),
    			offsetX:'5',
    			offsetY:'-28',
    			stroke: new ol.style.Stroke({
    				color: "rgba(3, 3, 3, 0)",
    				width: 1
    			})
    		})
    	});
    	return style;
    },
    getImageStyle: function (img, size, anchor) {
        var style = {};
        if(!anchor){
        	anchor = [0.5,0.5];
        }
    	if(dealWithParam(size) == ""){  
    		style = new ol.style.Style({
                image: new ol.style.Icon(({
                    opacity: 0.75,
                    src: img,
                    anchor : anchor
                })),
    		});
    	}else{
    		 style = new ol.style.Style({  //聚合图标
	            image: new ol.style.Icon(({
	                opacity: 0.75,
	                src: img,
                    anchor : anchor
	            })),
	            text: new ol.style.Text({
	                font: '11px sans-serif',
	                text: size.toString(),
	                fill: new ol.style.Fill({
	                    color: '#777'
	                }),
	                stroke: new ol.style.Stroke({
	                    color: "rgba(3, 3, 3, 0.7)",
	                    width: 1
	                })
	            })
	        });
    	}
        return style;
    },
    getImageFontStyle: function (img, str, fillColor, strokeColor, font) {
        if (!fillColor)
            fillColor = "#fff";
        if (!strokeColor)
            strokeColor = "rgba(3, 3, 3, 0)";
        if (!font)
            font = '11px sans-serif';
        var textStyle = new ol.style.Text({
            font: font,
            text: str,
            fill: new ol.style.Fill({
                color: fillColor
            }),
            stroke: new ol.style.Stroke({
                color: strokeColor,
                width: 1
            }),
            zIndex:20000,
        });
        if (img) {
            var style = new ol.style.Style({
                image: new ol.style.Icon(({
                    opacity: 0.75,
                    src: img
                })),
                text: textStyle,
                zIndex:20000,
            });
        } else {
            var style = new ol.style.Style({
                text: textStyle,
                zIndex:20000,
            });
        }
        return style;
    },
    getOffsetImageFontStyle: function (img, str, fillColor, strokeColor, font, offsetX, offsetY) {
        if (!fillColor)
            fillColor = "#fff";
        if (!strokeColor)
            strokeColor = "rgba(3, 3, 3, 0)";
        if (!font)
            font = '11px sans-serif';
        var textStyle = new ol.style.Text({
            font: font,
            text: str,
            fill: new ol.style.Fill({
                color: fillColor
            }),
            stroke: new ol.style.Stroke({
                color: strokeColor,
                width: 1
            }),
            offsetX:offsetX,
            offsetY:offsetY,
            zIndex:20000,
        });
        if (img) {
            var style = new ol.style.Style({
                image: new ol.style.Icon(({
                    opacity: 0.75,
                    src: img
                })),
                text: textStyle,
                zIndex:20000,
            });
        } else {
            var style = new ol.style.Style({
                text: textStyle,
                zIndex:20000,
            });
        }
        return style;
    },
    getImageFontOffsetStyle: function (img, str, fillColor, strokeColor, font, offsetX, offsetY) {
    	if (!fillColor)
    		fillColor = "#fff";
    	if (!strokeColor)
    		strokeColor = "rgba(3, 3, 3, 0)";
    	if (!font)
    		font = '12px sans-serif';
    	var textStyle = new ol.style.Text({
    		font: font,
    		text: str,
    		fill: new ol.style.Fill({
    			color: fillColor
    		}),
    		stroke: new ol.style.Stroke({
    			color: strokeColor,
    			width: 1
    		}),
    		offsetX : offsetX,
    		offsetY : offsetY,
    		zIndex:20000,
    	});
    	if (img) {
    		var style = new ol.style.Style({
    			image: new ol.style.Icon(({
    				opacity: 0.75,
    				src: img
    			})),
    			text: textStyle,
    			zIndex:20000,
    		});
    	} else {
    		var style = new ol.style.Style({
    			text: textStyle,
    			zIndex:20000,
    		});
    	}
    	return style;
    }
};

var _popupLocalFuns = {
    popups: [],
    addPupup: function (id, lon, lat, innerHTML, useDefualtStyle, zIndex) {
        var map = window.map ;
        var _this = _popupLocalFuns;
        var container = document.getElementById("popupContainer_" + id);
        var closer = document.getElementById("popupCloser_" + id);
        var content = document.getElementById("popupContent_" + id);
        if (container == null) {
            container = document.createElement('div');
            container.setAttribute('id', "popupContainer_" + id);
            if (useDefualtStyle != false) {
                container.setAttribute('class', 'NPopUpBox02');
            }
            container.setAttribute('href', 'javascript:void(0);');
        }
        if (closer == null) {
            closer = document.createElement('a');
            closer.setAttribute('id', "popupCloser_" + id);
            if (useDefualtStyle != false) {
                closer.setAttribute('class', 'NPopUpClose02');
            }
            container.setAttribute('href', 'javascript:void(0);');
            container.appendChild(closer);
        }
        if (content == null) {
            content = document.createElement('div');
            content.setAttribute('id', "popupContent_" + id);
            content.style.cssText = "white-space:nowrap;display:block;";
            container.appendChild(content);
        }
        var overlay = new ol.Overlay({
            element: container,
            autoPan: true,
            autoPanAnimation: { duration: 250 }
        });
        overlay.id = id;
        closer.onclick = function () {
        	window.gisInteraction.clearTrackFeatures();
            window.gisInteraction.clearTrack();
            overlay.setPosition(undefined);
            closer.blur();
            return false;
        };
        content.innerHTML = innerHTML;
        overlay.setPosition([lon, lat]);
        map.addOverlay(overlay);
        _this.popups.push(overlay);
    },
    clear: function (id) {
        var map = window.map ;
        var _this = _popupLocalFuns;
        var overlays = map.getOverlays();
        if (overlays == null || overlays.length < 1)
            return;
        if (id) {
            for (var i = 0; i < overlays.getLength() ; i++) {
                for (var j = 0; j < _this.popups.length; j++) {
                    var item = overlays.item(i);
                    if (item == _this.popups[j] && item.id == id) {
                        overlays.removeAt(i);
                        _this.popups.splice(i, 1);
                        i--;
                    }
                }
            }
        } else {
            for (var i = 0; i < overlays.getLength() ; i++) {
                for (var j = 0; j < _this.popups.length; j++) {
                    if (overlays.item(i) == _this.popups[j]) {
                        overlays.removeAt(i);
                        i--;
                    }
                }
            }
            _this.popups = [];
        }
    }
};

var _twinkleLocalFuns = {
    twinkles: [],
    clickTimer: null,
    addTwinkle: function (id, lon, lat, flashNum) {
        var map = window.map ;
        var _this = _twinkleLocalFuns;
        var pos = [lon, lat];
        map.getView().setCenter(map.getView().getCenter());
        var container = document.getElementById("twinkleOverlay_" + id);
        if (container == null) {
            container = document.createElement('div');
            container.setAttribute('id', "twinkleOverlay_" + id);
            container.setAttribute('class', 'animationDiv');
        }
        container.style.animationIterationCount = flashNum;
        container.style.webkitAnimationIterationCount = flashNum;
        //修改坐标
        overlay = new ol.Overlay({
            element: container,
            positioning: 'center-center',
            stopEvent: false
        });
        overlay.setPosition(pos);
        map.addOverlay(overlay);
        _this.twinkles.push(overlay);
        //如果cef浏览器不支持css3的一些动画效果，可通过计时器实现        
        //        var index = 1;
        //        var flashCount = flashNum * 10;
        //        clearTimeout(_this.clickTimer);
        //        _this.clickTimer = setInterval(function () {
        //            if (index < flashCount) {
        //                var subIndex = index - Math.floor(index / 10.0) * 10;
        //                var scale = subIndex * 2.0 / 10;
        //                var opacity = 0.9 - subIndex * 0.9 / 10;
        //                var transform = "translate(" + 0 + "," + 0 + ") " + "scale(" + scale + "," + scale + ") ";
        //                $(".animationDiv").css("transform", transform);
        //                var background = "rgba(255, 0, 0, " + opacity + ")";
        //                $(".animationDiv").css("background", background);
        //                index++;
        //            } else {
        //                _this.clear();
        //            }
        //        }, 200);
    },
    addTwinkleList: function (twinkleList) {
        var map = window.map ;
        var _this = _twinkleLocalFuns;
        map.getView().setCenter(map.getView().getCenter());
        for (var i = 0; i < twinkleList.length; i++) {
            var id = twinkleList[i].id;
            var lon = twinkleList[i].lon;
            var lat = twinkleList[i].lat;
            var flashNum = twinkleList[i].flashNum;
            var pos = [lon, lat];
            var container = document.getElementById("twinkleOverlay_" + id);
            if (container == null) {
                container = document.createElement('div');
                container.setAttribute('id', "twinkleOverlay_" + id);
                container.setAttribute('class', 'animationDiv');
            }
            container.style.animationIterationCount = flashNum;
            container.style.webkitAnimationIterationCount = flashNum;
            //修改坐标
            overlay = new ol.Overlay({
                element: container,
                positioning: 'center-center',
                stopEvent: false
            });
            overlay.setPosition(pos);
            map.addOverlay(overlay);
            _this.twinkles.push(overlay);
        }
    },
    clear: function () {
        var map = window.map ;
        var _this = _twinkleLocalFuns;
        var overlays = map.getOverlays();
        if (overlays == null || overlays.length < 1)
            return;
        for (var i = 0; i < overlays.getLength() ; i++) {
            for (var j = 0; j < _this.twinkles.length; j++) {
                if (overlays.item(i) == _this.twinkles[j]) {
                    overlays.removeAt(i);
                    i--;
                }
            }
        }
        _this.twinkles = [];

        clearTimeout(_this.clickTimer);
    }
};

var _trackLocalFuns = {
    vectlayer: null,
    vectorSource: null,
    features: null,
    drawType: "Box",
    callback: null,
    drawTool: null,
    modify: null,
    sketch: null,
    helpTooltipElement: null,
    helpTooltip: null,
    overlayList: [],
    trackDragControlAdded: false,
    trackedCircleLayerName: "trackedCircleLayer",
    circleResizeLayerName: "ResizeCircleIconLayer",
    clickTimer: null,
    initialLayer: function () {
        var map = window.map ;
        var _this = _trackLocalFuns;
        _this.features = new ol.Collection();
        _this.vectorSource = new ol.source.Vector({ wrapX: false, features: _this.features });
        _this.vectlayer = new ol.layer.Vector({
            source: _this.vectorSource,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
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
        map.addLayer(_this.vectlayer);
    },
    createHelpTooltip: function () {
        var map = window.map ;
        var _this = _trackLocalFuns;
        _this.helpTooltipElement = document.createElement('div');
        _this.helpTooltipElement.className = 'tooltip';
        _this.helpTooltip = new ol.Overlay({
            element: _this.helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        map.addOverlay(_this.helpTooltip);
        _this.overlayList.push(_this.helpTooltip);
    },
    track: function (drawType, callback) {
        var map = window.map ;
        var _this = _trackLocalFuns;

        if (drawType == "Circle" && _this.trackDragControlAdded == false) {
            _this.trackDragControlAdded = true;
            map.addInteraction(new trackDragControl.Drag());
        }

        _this.drawType = drawType;
        _this.callback = callback;
        if (_this.vectlayer == null) {
            _this.initialLayer();
        }
        _this.addInteraction(drawType);
        //绑定事件
        _this.drawTool.on('drawstart', _this.drawStartFun);
        _this.drawTool.on("drawend", _this.drawEndFun);
        map.on('pointermove', _this.pointerMoveHandler);
    },
    addInteraction: function (drawType) {
        if (drawType == 'None')
            return;
        var map = window.map ;
        var _this = _trackLocalFuns;
        if (_this.drawTool != null)
            map.removeInteraction(_this.drawTool);
        if (_this.modify != null)
            map.removeInteraction(_this.modify);
        _this.createHelpTooltip();
        var geometryFunction, maxPoints;
        if (drawType === 'Square') {
            drawType = 'Circle';
            geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
        } else if (drawType === 'Box') {
            drawType = 'LineString';
            maxPoints = 2;
            geometryFunction = function (coordinates, geometry) {
                if (!geometry) {
                    geometry = new ol.geom.Polygon(null);
                }
                var start = coordinates[0];
                var end = coordinates[1];
                geometry.setCoordinates([
                  [start, [start[0], end[1]], end, [end[0], start[1]], start]
                ]);
                return geometry;
            };
        }
        _this.drawTool = new ol.interaction.Draw({
            source: _this.vectorSource,
            type: drawType,
            geometryFunction: geometryFunction,
            maxPoints: maxPoints
        });
        map.addInteraction(_this.drawTool);
        //图形编辑
        _this.modify = new ol.interaction.Modify({
            features: _this.features,
            deleteCondition: function (event) {
                return ol.events.condition.shiftKeyOnly(event) &&
                    ol.events.condition.singleClick(event);
            }
        });
        //编辑完毕事件
        _this.modify.on('modifyend', function (evt) {
            _this.drawEndFun(evt);
        }, this);
        map.addInteraction(_this.modify);
    },
    drawStartFun: function (e) {
        _trackLocalFuns.sketch = e.feature;
    },
    drawEndFun: function (e) {
        var map = window.map ;
        var _this = _trackLocalFuns;
        _this.sketch = null;
        map.un('pointermove', _this.pointerMoveHandler);
        var overlays = map.getOverlays();
        if (overlays == null || overlays.length < 1)
            return;
        for (var i = 0; i < overlays.getLength() ; i++) {
            for (var j = 0; j < _this.overlayList.length; j++) {
                if (overlays.item(i) == _this.overlayList[j]) {
                    overlays.removeAt(i);
                }
            }
        }
        _this.overlayList = [];
        if (_this.callback == null)
            return;
        var geom = null;
        if (e.features)
            geom = e.features.item(0).getGeometry();
        else
            geom = e.feature.getGeometry();
        var geoType = geom.getType();
        var rlt = null;
        switch (geoType) {
            case "Circle":
                var pnt = geom.getCenter();
                pnt = _prjFuns.map_to_gps84(pnt[0], pnt[1]);
                rlt = {
                    radius: geom.getRadius(),
                    lon: pnt[0],
                    lat: pnt[1]
                };
                break;
            case "Polygon":
                var pntList = geom.getCoordinates();
                if (pntList.length == 1)
                    pntList = pntList[0];
                for (var i = 0; i < pntList.length; i++) {
                    var pnt = pntList[i];
                    pntList[i] = _prjFuns.map_to_gps84(pnt[0], pnt[1]);
                }
                var wkt = _wktLocalFuns.getPolygonWkt(pntList);
                var extent = geom.getExtent();
                var lBottom = _prjFuns.map_to_gps84(extent[0], extent[1]);
                var rTop = _prjFuns.map_to_gps84(extent[2], extent[3]);
                extent = [lBottom[0], lBottom[1], rTop[0], rTop[1]];
                rlt = {
                    extent: extent,
                    pntList: pntList,
                    wkt: wkt
                };
                break;
            default:
                if (_this.drawType == "Point") {
                    var pnt = geom.getCoordinates();
                    rlt = _prjFuns.map_to_gps84(pnt[0], pnt[1]);
                }
                else {
                    var pntList = geom.getCoordinates();
                    for (var i = 0; i < pntList.length; i++) {
                        var pnt = pntList[i];
                        pntList[i] = _prjFuns.map_to_gps84(pnt[0], pnt[1]);
                    }
                    var wkt = _wktLocalFuns.getPolyLineWkt(pntList);
                    var extent = geom.getExtent();
                    var lBottom = _prjFuns.map_to_gps84(extent[0], extent[1]);
                    var rTop = _prjFuns.map_to_gps84(extent[2], extent[3]);
                    extent = [lBottom[0], lBottom[1], rTop[0], rTop[1]];
                    rlt = {
                        extent: extent,
                        pntList: pntList,
                        wkt: wkt
                    };
                }
                break;
        }
        //if (_this.drawType == "Circle") {
        //    _this.addTrackCircle(rlt);
        //    _this.addCircleResizeMaker(rlt);
        //}
        _this.callback(rlt);
    },
    pointerMoveHandler: function (evt) {
        if (evt.dragging)
            return;
        var _this = _trackLocalFuns;
        var helpMsg = '点击开始';
        if (_this.sketch) {
            switch (_this.drawType) {
                case "Box":
                    helpMsg = '点击结束';
                    break;
                case "Polygon":
                    helpMsg = '双击结束';
                    break;
                case "LineString":
                    helpMsg = '双击结束';
                    break;
                case "Circle":
                    helpMsg = '点击结束';
                    break;
                case "Point":
                    helpMsg = '';
                    break;
                default:
                    break;
            }
        } else {
            switch (_this.drawType) {
                case "Box":
                    helpMsg = '点击开始';
                    break;
                case "Polygon":
                    helpMsg = '点击开始（至少3个点）';
                    break;
                case "LineString":
                    helpMsg = '点击开始';
                    break;
                case "Circle":
                    helpMsg = '点击开始';
                    break;
                case "Point":
                    helpMsg = '点击拾取坐标';
                    break;
                default:
                    break;
            }
        }
        _this.helpTooltipElement.innerHTML = helpMsg;
        _this.helpTooltip.setPosition(evt.coordinate);
    },
    addCircleResizeMaker: function (geo) {
        var map = window.map ;
        var _this = _trackLocalFuns;

        if (_this.trackDragControlAdded == false) {
            _this.trackDragControlAdded = true;
            map.addInteraction(new trackDragControl.Drag());
        }

        //添加resize图标
        var center = _prjFuns.gps84_to_map(geo.lon, geo.lat);
        var pnt = [center[0] + geo.radius, center[1]];
        pnt = _prjFuns.map_to_gps84(pnt[0], pnt[1]);
        var id = (new Date()).getTime()
        var maker = {
            id: id,
            name: "trackCircle",
            img: "resource/images/Gis/resize.png",
            lon: pnt[0],
            lat: pnt[1],
            att: {
                id: id,
                name: "trackCircle",
                circle: geo,
                pnt: pnt
            }
        };
        window.gisInteraction.clearMarkers(_this.circleResizeLayerName);
        window.gisInteraction.addMarker(_this.circleResizeLayerName, maker);
    },
    addTrackCircle: function (geo) {
        var map = window.map ;
        var _this = _trackLocalFuns;

        if (_this.trackDragControlAdded == false) {
            _this.trackDragControlAdded = true;
            map.addInteraction(new trackDragControl.Drag());
        }
        //添加圆
        var pnt = [geo.lon, geo.lat];
        var circle = {
            pnt: pnt,
            radius: geo.radius,
            fillColor: "rgba(255,0,0,0.2)",
            lineColor: "#ff0",
            lineWidth: 2,
            att: {
                id: "trackedCircle",
                name: "trackedCircle",
                pnt: pnt,
                radius: geo.radius,
                layerName: _this.trackedCircleLayerName
            }
        };
        window.gisInteraction.clearFeatures(_this.trackedCircleLayerName);
        window.gisInteraction.addCircle2Map(_this.trackedCircleLayerName, circle);

        //添加圆的半径提示
        _this.clearOverlays();
        _this.createHelpTooltip();
        var dis;
        var disRadius = 0;
        disRadius = geo.radius;
        var mapPrj = map.getView().getProjection().getCode();
	    if (mapPrj == "EPSG:4326") {
	    	disRadius = geo.radius * 109000;
	    }
        if (disRadius > 1000) {
            dis = (Math.round(disRadius / 1000 * 100) / 100) + ' ' + 'km';
        } else {
            dis = (Math.round(disRadius)) + ' ' + 'm';
        }
        _this.helpTooltipElement.innerHTML = dis;
        var pnt1 = _prjFuns.gps84_to_map(geo.lon, geo.lat);
        var pnt2 = [pnt1[0] + geo.radius, pnt1[1]];
        _this.helpTooltip.setPosition(pnt2);
    },
    clearOverlays: function () {
        var map = window.map ;
        var _this = _trackLocalFuns;
        var overlays = map.getOverlays();
        if (overlays == null || overlays.length < 1)
            return;
        for (var i = 0; i < overlays.getLength() ; i++) {
            for (var j = 0; j < _this.overlayList.length; j++) {
                if (overlays.item(i) == _this.overlayList[j]) {
                    overlays.removeAt(i);
                }
            }
        }
        _this.overlayList = [];
    },
    clearPointerMoveHelp : function(){
    	var map = window.map ;
        var _this = _trackLocalFuns;
        if (_this.modify != null)
            map.removeInteraction(_this.modify);
        if (_this.drawTool != null) {
            map.removeInteraction(_this.drawTool);
            map.un('pointermove', _this.pointerMoveHandler);
        }
        _this.drawTool = null;
    },
    stop: function () {
        var map = window.map ;
        var _this = _trackLocalFuns;

        if (_this.modify != null)
            map.removeInteraction(_this.modify);
        if (_this.drawTool != null) {
            map.removeInteraction(_this.drawTool);
            map.un('pointermove', _this.pointerMoveHandler);
        }
        if (_this.features != null)
            _this.features.clear();
        if (_this.vectorSource != null)
            _this.vectorSource.clear();
        _this.drawTool = null;
    },
    clear: function () {
        var map = window.map ;
        var _this = _trackLocalFuns;

        window.gisInteraction.clearFeatures(_this.trackedCircleLayerName);
        window.gisInteraction.clearMarkers(_this.circleResizeLayerName);

        if (_this.modify != null)
            map.removeInteraction(_this.modify);
        if (_this.drawTool != null) {
            map.removeInteraction(_this.drawTool);
            map.un('pointermove', _this.pointerMoveHandler);
        }
        if (_this.features != null)
            _this.features.clear();
        if (_this.vectorSource != null)
            _this.vectorSource.clear();
        _this.clearOverlays();
        _this.drawTool = null;
    },
    clearFeatures: function () {
        var map = window.map ;
        var _this = _trackLocalFuns;

        window.gisInteraction.clearFeatures(_this.trackedCircleLayerName);
        window.gisInteraction.clearMarkers(_this.circleResizeLayerName);

        if (_this.features != null)
            _this.features.clear();
        if (_this.vectorSource != null)
            _this.vectorSource.clear();
        _this.clearOverlays();
    }
};

var _measureLocalFuns = {
    vectlayer: null,
    vectorSource: null,
    measureType: "LineString",
    callback: null,
    drawTool: null,
    sketch: null,
    measureValue: '',
    wgs84Sphere: null,
    measureTooltipElement: null,
    measureTooltip: null,
    helpTooltipElement: null,
    helpTooltip: null,
    overlayList: [],
    initialLayer: function () {
        var map = window.map ;
        var _this = _measureLocalFuns;
        _this.wgs84Sphere = new ol.Sphere(6378137);
        _this.vectorSource = new ol.source.Vector({ wrapX: false });
        _this.vectlayer = new ol.layer.Vector({
            source: _this.vectorSource,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
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
        map.addLayer(_this.vectlayer);
    },
    addInteraction: function (drawType) {
        if (drawType == 'None')
            return;
        var map = window.map ;
        var _this = _measureLocalFuns;
        _this.createMeasureTooltip();
        _this.createHelpTooltip();
        if (_this.drawTool != null)
            map.removeInteraction(_this.drawTool);
        _this.drawTool = new ol.interaction.Draw({
            source: _this.vectorSource,
            type: drawType,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    })
                })
            })
        });
        map.addInteraction(_this.drawTool);
    },
    createMeasureTooltip: function () {
        var map = window.map ;
        var _this = _measureLocalFuns;
        var div = document.createElement('div');
        div.className = 'tooltip tooltip-measure';
        _this.measureTooltipElement = div;
        _this.measureTooltip = new ol.Overlay({
            element: _this.measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        })
        map.addOverlay(_this.measureTooltip);
        _this.overlayList.push(_this.measureTooltip);
    },
    createHelpTooltip: function () {
        var map = window.map ;
        var _this = _measureLocalFuns;
        _this.helpTooltipElement = document.createElement('div');
        _this.helpTooltipElement.className = 'tooltip';
        _this.helpTooltip = new ol.Overlay({
            element: _this.helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        map.addOverlay(_this.helpTooltip);
        _this.overlayList.push(_this.helpTooltip);
    },
    formatLength: function (line) {
        var map = window.map ;
        var _this = _measureLocalFuns;
        var coordinates = line.getCoordinates();
        var length = 0;
        var sourceProj = map.getView().getProjection();
        for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
            var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
            var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
            length += _this.wgs84Sphere.haversineDistance(c1, c2);
        }
        var output;
        if (length > 1000) {
            output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
        } else {
            output = (Math.round(length * 100) / 100) + ' ' + 'm';
        }
        return output;
    },
    calculateDis: function (pnt1, pnt2) {
        var map = window.map ;
        var _this = _measureLocalFuns;
        var length = 0;
        var coordinates = [pnt1, pnt2];
        var sourceProj = map.getView().getProjection();
        for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
            var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
            var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
            var wgs84Sphere = new ol.Sphere(6378137);
            length += wgs84Sphere.haversineDistance(c1, c2);
        }
        var output;
        if (length > 1000) {
            output = (Math.round(length / 1000 * 100) / 100) + ' ' + 'km';
        } else {
            output = (Math.round(length)) + ' ' + 'm';
        }
        return output;
    },
    formatArea: function (polygon) {
        var map = window.map ;
        var _this = _measureLocalFuns;
        var sourceProj = map.getView().getProjection();
        var geom = /** @type {ol.geom.Polygon} */(polygon.clone().transform(
            sourceProj, 'EPSG:4326'));
        var coordinates = geom.getLinearRing(0).getCoordinates();
        var area = Math.abs(_this.wgs84Sphere.geodesicArea(coordinates));
        var output;
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) +
                ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) +
                ' ' + 'm<sup>2</sup>';
        }
        return output;
    },
    measureLine: function (callback) {
        var map = window.map ;
        var _this = _measureLocalFuns;
        _this.measureType = "LineString";
        _this.callback = callback;
        if (_this.vectlayer == null) {
            _this.initialLayer();
        }
        _this.addInteraction(_this.measureType);
        //绑定事件
        _this.drawTool.on('drawstart', _this.drawStartFun);
        _this.drawTool.on("drawend", _this.drawEndFun);
        map.on('pointermove', _this.pointerMoveHandler);
    },
    measureArea: function (callback) {
        var map = window.map ;
        var _this = _measureLocalFuns;
        _this.measureType = "Polygon";
        _this.callback = callback;
        if (_this.vectlayer == null) {
            _this.initialLayer();
        }
        _this.addInteraction(_this.measureType);
        //绑定事件
        _this.drawTool.on('drawstart', _this.drawStartFun);
        _this.drawTool.on("drawend", _this.drawEndFun);
        map.on('pointermove', _this.pointerMoveHandler);
    },
    pointerMoveHandler: function (evt) {
        if (evt.dragging)
            return;
        var _this = _measureLocalFuns;
        var helpMsg = '点击开始测量';
        var tooltipCoord = evt.coordinate;
        if (_this.sketch) {
            _this.measureValue = '';
            var geom = (_this.sketch.getGeometry());
            if (geom instanceof ol.geom.Polygon) {
                _this.measureValue = _this.formatArea(geom);
                helpMsg = "双击结束测量";
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                _this.measureValue = _this.formatLength(geom);
                helpMsg = "双击结束测量";
                tooltipCoord = geom.getLastCoordinate();
            }
            _this.measureTooltipElement.innerHTML = _this.measureValue;
            _this.measureTooltip.setPosition(tooltipCoord);
        }
        _this.helpTooltipElement.innerHTML = helpMsg;
        _this.helpTooltip.setPosition(evt.coordinate);
    },
    drawStartFun: function (evt) {
        _measureLocalFuns.sketch = evt.feature;
    },
    drawEndFun: function (evt) {
        var _this = _measureLocalFuns;
        _this.measureTooltipElement.className = 'tooltip tooltip-static';
        _this.measureTooltip.setOffset([0, -7]);
        // unset sketch
        _this.sketch = null;
        // unset tooltip so that a new one can be created
        _this.measureTooltipElement = null;
        _this.createMeasureTooltip();
        if (_this.callback == null)
            return;
        _this.callback(_this.measureValue);
    },
    stop: function () {
        var map = window.map ;
        var _this = _measureLocalFuns;
        if (_this.drawTool != null) {
            map.removeInteraction(_this.drawTool);
            map.un('pointermove', _this.pointerMoveHandler);
        }
        var overlays = map.getOverlays();
        if (overlays == null || overlays.length < 1)
            return;
        for (var i = 0; i < overlays.getLength() ; i++) {
            for (var j = 0; j < _this.overlayList.length; j++) {
                if (overlays.item(i) == _this.overlayList[j]) {
                    overlays.removeAt(i);
                }
            }
        }
        _this.overlayList = [];
        _this.drawTool = null;
    },
    clear: function () {
        var map = window.map ;
        var _this = _measureLocalFuns;
        if (_this.vectorSource != null)
            _this.vectorSource.clear();
        if (_this.drawTool != null) {
            map.removeInteraction(_this.drawTool);
            map.un('pointermove', _this.pointerMoveHandler);
        }
        var overlays = map.getOverlays();
        if (overlays == null || overlays.length < 1)
            return;
        for (var i = 0; i < overlays.getLength() ; i++) {
            for (var j = 0; j < _this.overlayList.length; j++) {
                if (overlays.item(i) == _this.overlayList[j]) {
                    overlays.removeAt(i);
                }
            }
        }
        _this.overlayList = [];
        _this.drawTool = null;
    }
};

var _featureLocalFuns = {
    featureLayers: {},
    styleInfoDic: {},
    styleDic: {},
    unkeyDic: {},
    clickTimer: null,
    getLayer: function (layerName) {
        var _this = _featureLocalFuns;
        return _this.featureLayers[layerName];
    },
    createLayer: function (layerName, isBaseLayer) {
        var map = window.map ;
        var _this = _featureLocalFuns;
        if (isBaseLayer == null || isBaseLayer == undefined || isBaseLayer == "")
            isBaseLayer = false;
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo != null) {
            _this.clear(layerName);
            return lyrInfo;
        }
        var vectorSource = new ol.source.Vector({ wrapX: false });
        var vectorLayer = new ol.layer.Vector({
            source: vectorSource,
            isBaseLayer: isBaseLayer
        });
        vectorLayer.layerName = layerName;
        map.addLayer(vectorLayer);
        var lyrInfo = {
            'vectorLayer': vectorLayer,
            'vectorSource': vectorSource,
            'layerName': layerName
        };
        _this.featureLayers[layerName] = lyrInfo;
        return lyrInfo;
    },
    createHelpTooltip: function () {
        var map = window.map ;
        var _this = _featureLocalFuns;
        _this.helpTooltipElement = document.createElement('div');
        _this.helpTooltipElement.className = 'tooltip';
        _this.helpTooltip = new ol.Overlay({
            element: _this.helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        map.addOverlay(_this.helpTooltip);
        _this.overlayList.push(_this.helpTooltip);
    },
    //绘制扇形。pnt圆心；radius半径；view扇形夹角；angle扇形起始角度，东为0，逆时针旋转。
    addFans: function (layerName, fans) {
        var map = window.map ;
        var _this = _featureLocalFuns;

        var pnt = fans.pnt;
        var radius = fans.radius;
        var view = fans.view;
        var angle = fans.angle;
        var fillColor = fans.fillColor;
        var lineColor = fans.lineColor;
        var lineWidth = fans.lineWidth;
        var att = (fans.att || {});
        att.layerName = layerName;

        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
            map.un('click', _this.mapFeatureClicked);
        }
        pnt[0] = pnt[0] * 1;
        pnt[1] = pnt[1] * 1;
        var circle = new ol.geom.Circle(pnt, radius);
        var lowpoly = ol.geom.Polygon.fromCircle(circle, 360, 0);
        if (angle + view > 360) {
            var cor = lowpoly.getCoordinates()[0].slice(angle, 360);
            cor = cor.concat(lowpoly.getCoordinates()[0].slice(0, view - (360 - angle)));
        } else {
            var cor = lowpoly.getCoordinates()[0].slice(angle, angle + view);
        }
        cor.unshift(pnt);
        cor.push(pnt);
        var array = [];
        array.push(cor);
        var poly = new ol.geom.Polygon(array);
        var feature = new ol.Feature(poly);
        var style = _this.getPolygonStyle(fillColor, lineColor, lineWidth);
        feature.setStyle(style);
        feature.att = att;
        lyrInfo.vectorSource.addFeature(feature);
        map.on('click', _this.mapFeatureClicked);
    },
    addCircle: function (layerName, circle) {
        var map = window.map ;
        var _this = _featureLocalFuns;

        var pnt = circle.pnt;
        var radius = circle.radius;
        var fillColor = circle.fillColor;
        var lineColor = circle.lineColor;
        var lineWidth = circle.lineWidth;
        var att = (circle.att || {});
        att.layerName = layerName;

        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
            map.un('click', _this.mapFeatureClicked);
        }
        pnt[0] = pnt[0] * 1;
        pnt[1] = pnt[1] * 1;
        var feature = new ol.Feature(
            new ol.geom.Circle(pnt, radius * 1)
        );
        var style = _this.getPolygonStyle(fillColor, lineColor, lineWidth);
        feature.setStyle(style);
        feature.att = att;
        lyrInfo.vectorSource.addFeature(feature);
        map.on('click', _this.mapFeatureClicked);
    },
    addPolygon: function (layerName, polygon,featureClicked) {
    	var map = window.map ;
    	if(featureClicked){
	    	map.un('click', _markerLocalFuns.mapFeatureClicked);
    	}
        var _this = _featureLocalFuns;

        var pntList = polygon.pntList;
        if (!pntList || pntList.length < 3) {
            return;
        }
        var fillColor = polygon.fillColor;
        var lineColor = polygon.lineColor;
        var lineWidth = polygon.lineWidth;
        var att = (polygon.att || {});
        att.layerName = layerName;

        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
        	if(featureClicked){
	            map.un('click', _this.mapFeatureClicked);
        	}
        }
        var feature = new ol.Feature(
            new ol.geom.Polygon([pntList])
        );
        var style = _this.getPolygonStyle(fillColor, lineColor, lineWidth);
        feature.setStyle(style);
        feature.att = att;
        feature.featureClicked = featureClicked;
        feature.att.featureClicked = featureClicked;
        lyrInfo.vectorSource.addFeature(feature);
        if(featureClicked){
	        map.on('click', _this.mapFeatureClicked);
        }
    },
    addPolygonByWkt: function (layerName, wktPolygon) {
        var map = window.map ;
        var _this = _featureLocalFuns;

        var wkt = wktPolygon.wkt;
        var fillColor = wktPolygon.fillColor;
        var lineColor = wktPolygon.lineColor;
        var lineWidth = wktPolygon.lineWidth;
        var att = (wktPolygon.att || {});
        att.layerName = layerName;

        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
            map.un('click', _this.mapFeatureClicked);
        }
        var format = new ol.format.WKT();
        var feature = format.readFeature(wkt);
        var style = _this.getPolygonStyle(fillColor, lineColor, lineWidth);
        feature.setStyle(style);
        feature.att = att;
        lyrInfo.vectorSource.addFeature(feature);
        map.on('click', _this.mapFeatureClicked);
    },
    addPolyLine: function (layerName, line) {
        var map = window.map ;
        var _this = _featureLocalFuns;

        var pntList = line.pntList;
        var lineColor = line.lineColor;
        var lineWidth = line.lineWidth;
        var att = (line.att || {});
        att.layerName = layerName;

        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
            map.un('click', _this.mapFeatureClicked);
        }
        var feature = new ol.Feature(
            new ol.geom.LineString(pntList)
        );
        var style = _this.getPolyLineStyle(lineColor, lineWidth);
        feature.setStyle(style);
        feature.att = att;
        lyrInfo.vectorSource.addFeature(feature);
        map.on('click', _this.mapFeatureClicked);
    },
    addDashLine: function (layerName, line) {
        var map = window.map ;
        var _this = _featureLocalFuns;

        var pntList = line.pntList;
        var lineColor = line.lineColor;
        var lineWidth = line.lineWidth;
        var att = (line.att || {});
        att.layerName = layerName;

        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
            map.un('click', _this.mapFeatureClicked);
        }
        var feature = new ol.Feature(
            new ol.geom.LineString(pntList)
        );
        var style = _this.getDashLineStyle(lineColor, lineWidth);
        feature.setStyle(style);
        feature.att = att;
        lyrInfo.vectorSource.addFeature(feature);
        map.on('click', _this.mapFeatureClicked);
    },
    addSolidLineArrow: function (layerName, line) {
        var map = window.map ;
        var _this = _featureLocalFuns;

        var pntList = line.pntList;
        var lineColor = line.lineColor;
        var lineWidth = line.lineWidth;
        var arrowIcon = line.arrowIcon;
        var att = (line.att || {});
        att.layerName = layerName;

        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
            map.un('click', _this.mapFeatureClicked);
        }
        var feature = new ol.Feature(
            new ol.geom.LineString(pntList)
        );
        var styles = [];
        var style = _this.getPolyLineStyle(lineColor, lineWidth);
        styles.push(style);
        var geometry = feature.getGeometry();
        geometry.forEachSegment(function (start, end) {
            var dx = end[0] - start[0];
            var dy = end[1] - start[1];
            var rotation = Math.atan2(dy, dx);
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(end),
                image: new ol.style.Icon({
                    src: arrowIcon,
                    anchor: [0.75, 0.5],
                    rotateWithView: false,
                    rotation: -rotation
                })
            }));
        });

        feature.setStyle(styles);
        feature.att = att;
        lyrInfo.vectorSource.addFeature(feature);
        map.on('click', _this.mapFeatureClicked);
    },
    addSolidLineOfEndCap: function (layerName, line) {
        var map = window.map ;
        var _this = _featureLocalFuns;

        var pntList = line.pntList;
        var lineColor = line.lineColor;
        var lineWidth = line.lineWidth;
        var capIcon = line.capIcon;
        var att = (line.att || {});
        att.layerName = layerName;

        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
            map.un('click', _this.mapFeatureClicked);
        }
        var feature = new ol.Feature(
            new ol.geom.LineString(pntList)
        );
        var styles = [];
        var style = _this.getPolyLineStyle(lineColor, lineWidth);
        styles.push(style);
        var geometry = feature.getGeometry();
        geometry.forEachSegment(function (start, end) {
            var dx = end[0] - start[0];
            var dy = end[1] - start[1];
            var rotation = Math.atan2(dy, dx);
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(end),
                image: new ol.style.Icon({
                    src: capIcon,
                    anchor: [0.75, 0.5],
                    rotateWithView: false,
                    rotation: -rotation
                })
            }));
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(start),
                image: new ol.style.Icon({
                    src: capIcon,
                    anchor: [0.75, 0.5],
                    rotateWithView: false,
                    rotation: -rotation
                })
            }));
        });

        feature.setStyle(styles);
        feature.att = att;
        lyrInfo.vectorSource.addFeature(feature);
        map.on('click', _this.mapFeatureClicked);
    },
    addSolidLineCapArrow: function (layerName, line) {
        var map = window.map ;
        var _this = _featureLocalFuns;

        var pntList = line.pntList;
        var lineColor = line.lineColor;
        var lineWidth = line.lineWidth;
        var arrowIcon = line.arrowIcon;
        var capIcon = line.capIcon;
        var att = (line.att || {});
        att.layerName = layerName;

        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
            map.un('click', _this.mapFeatureClicked);
        }
        var feature = new ol.Feature(
            new ol.geom.LineString(pntList)
        );
        var styles = [];
        var style = _this.getPolyLineStyle(lineColor, lineWidth);
        styles.push(style);
        var geometry = feature.getGeometry();
        geometry.forEachSegment(function (start, end) {
            var dx = end[0] - start[0];
            var dy = end[1] - start[1];
            var rotation = Math.atan2(dy, dx);
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(end),
                image: new ol.style.Icon({
                    src: arrowIcon,
                    anchor: [0.75, 0.5],
                    rotateWithView: false,
                    rotation: -rotation
                })
            }));
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(start),
                image: new ol.style.Icon({
                    src: arrowIcon,
                    anchor: [0.75, 0.5],
                    rotateWithView: false,
                    rotation: -rotation + 180 / 360 * 2 * Math.PI
                })
            }));
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(end),
                image: new ol.style.Icon({
                    src: capIcon,
                    anchor: [0.75, 0.5],
                    rotateWithView: false,
                    rotation: -rotation
                })
            }));
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(start),
                image: new ol.style.Icon({
                    src: capIcon,
                    anchor: [0.75, 0.5],
                    rotateWithView: false,
                    rotation: -rotation + 180 / 360 * 2 * Math.PI
                })
            }));
        });

        feature.setStyle(styles);
        feature.att = att;
        lyrInfo.vectorSource.addFeature(feature);
        map.on('click', _this.mapFeatureClicked);
    },
    addAjkLine: function (layerName, line) {
        var map = window.map ;
        var _this = _featureLocalFuns;

        var pntList = line.pntList;
        var lineColor = line.lineColor;
        var lineWidth = line.lineWidth;
        var arrowIcon = line.arrowIcon;
        var att = (line.att || {});
        att.layerName = layerName;

        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
            map.un('click', _this.mapFeatureClicked);
        }
        var feature = new ol.Feature(
            new ol.geom.LineString(pntList)
        );
        var styles = [];
        var style = _this.getPolyLineStyle(lineColor, lineWidth);
        styles.push(style);
        var geometry = feature.getGeometry();
        geometry.forEachSegment(function (start, end) {
            var dx = end[0] - start[0];
            var dy = end[1] - start[1];
            var cx = (end[0] + start[0]) / 2;
            var cy = (end[1] + start[1]) / 2;
            var rotation = Math.atan2(dy, dx);
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point([cx, cy]),
                image: new ol.style.Icon({
                    src: arrowIcon,
                    anchor: [0.75, 0.5],
                    rotateWithView: false,
                    rotation: -rotation
                })
            }));
        });

        feature.setStyle(styles);
        feature.att = att;
        lyrInfo.vectorSource.addFeature(feature);
        map.on('click', _this.mapFeatureClicked);
    },
    addDashLineArrow: function (layerName, line) {
        var map = window.map ;
        var _this = _featureLocalFuns;

        var pntList = line.pntList;
        var lineColor = line.lineColor;
        var lineWidth = line.lineWidth;
        var arrowIcon = line.arrowIcon;
        var att = (line.att || {});
        att.layerName = layerName;

        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
            map.un('click', _this.mapFeatureClicked);
        }
        var feature = new ol.Feature(
            new ol.geom.LineString(pntList)
        );
        var styles = [];
        var style = _this.getDashLineStyle(lineColor, lineWidth);
        styles.push(style);
        var geometry = feature.getGeometry();
        geometry.forEachSegment(function (start, end) {
            var dx = end[0] - start[0];
            var dy = end[1] - start[1];
            var rotation = Math.atan2(dy, dx);
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(end),
                image: new ol.style.Icon({
                    src: arrowIcon,
                    anchor: [0.75, 0.5],
                    rotateWithView: false,
                    rotation: -rotation
                })
            }));
        });

        feature.setStyle(styles);
        feature.att = att;
        lyrInfo.vectorSource.addFeature(feature);
        map.on('click', _this.mapFeatureClicked);
    },
    //绘制向前后追
    addTrackArrow: function (layerName, pntList, textString, styleInfo, att) {
        var map = window.map ;
        var _this = _featureLocalFuns;
        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
            map.un('click', _this.mapFeatureClicked);
        }
        var feature = new ol.Feature({
            geometry: new ol.geom.LineString(pntList),
            name: 'LineTrackArrow',
            text: textString
        });
        var styles = [new ol.style.Style({})];
        var geometry = feature.getGeometry();
        geometry.forEachSegment(function (start, end) {
            var dx = end[0] - start[0];
            var dy = end[1] - start[1];
            var rotation = Math.atan2(dy, dx);
            // arrows
            var arrowInfo = {
                src: styleInfo.arrowIcon,
                rotateWithView: false,
                rotation: -rotation
            };
            var style = new ol.style.Style({
                geometry: new ol.geom.Point(end),
                image: new ol.style.Icon(arrowInfo),
                text: new ol.style.Text({
                    font: '11px sans-serif',
                    text: textString,
                    fill: new ol.style.Fill({
                        color: styleInfo.fontColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: styleInfo.fontOuterColor,
                        width: styleInfo.fontOuterSize
                    }),
                })
            });
            styles.push(style);
        });
        feature.setStyle(styles);
        feature.att = att;
        lyrInfo.vectorSource.addFeature(feature);
        map.on('click', _this.mapFeatureClicked);
    },
    //绘制直线箭头。styleInfo为json对象，包括arrowIcon, lineColor, lineWidth, fontColor，fontOuterColor,fontOuterSize几个属性
    addLineArrow: function (layerName, pntList, styleInfo, att) {
        var map = window.map ;
        var _this = _featureLocalFuns;
        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
            map.un('click', _this.mapFeatureClicked);
        }
        var feature = new ol.Feature({
            geometry: new ol.geom.LineString(pntList),
            name: 'LineArrow'
        });
        var styles = [
                      new ol.style.Style({
                          stroke: new ol.style.Stroke({
                              color: styleInfo.lineColor,
                              width: styleInfo.lineWidth
                          })
                      })
        ];
        var textFeature = new ol.Feature({
            geometry: new ol.geom.LineString(pntList),
            name: 'textLineArrow'
        });
        var textStyles = [];
        var geometry = feature.getGeometry();
        geometry.forEachSegment(function (start, end) {
            var dx = end[0] - start[0];
            var dy = end[1] - start[1];
            var rotation = Math.atan2(dy, dx);

            var wgs84Sphere = new ol.Sphere(6378137);
            var sourceProj = map.getView().getProjection();

            var c1 = ol.proj.transform([start[0], start[1]], sourceProj, 'EPSG:4326');
            var c2 = ol.proj.transform([end[0], end[1]], sourceProj, 'EPSG:4326');
            length = wgs84Sphere.haversineDistance(c1, c2);
            var output;
            if (length > 100) {
                output = (Math.round(length / 1000 * 100) / 100) +
                ' ' + 'km';
            } else {
                output = (Math.round(length * 100) / 100) +
                ' ' + 'm';
            }
            // arrows
            styles.push(new ol.style.Style({
                geometry: new ol.geom.Point(end),
                image: new ol.style.Icon({
                    src: styleInfo.arrowIcon,
                    anchor: [0.75, 0.5],
                    rotateWithView: false,
                    rotation: -rotation
                })
            }));
            var textRotation;
            if (rotation > -3.14 && rotation < -1.57) {
                textRotation = 3.1415926531 + rotation;
            } else if (rotation < 3.14 && rotation > 1.57) {
                textRotation = rotation - 3.1415926531;
            } else {
                textRotation = rotation;
            }
            textStyles.push(new ol.style.Style({
                geometry: new ol.geom.Point([(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]),
                text: new ol.style.Text({
                    font: '12px sans-serif',
                    text: output,
                    textBaseline: 'bottom',
                    fill: new ol.style.Fill({
                        color: styleInfo.fontColor
                    }),
                    stroke: new ol.style.Stroke({
                        color: styleInfo.fontOuterColor,
                        width: styleInfo.fontOuterSize
                    }),
                    rotation: -textRotation
                })
            }));
        });
        feature.setStyle(styles);
        feature.att = att;
        lyrInfo.vectorSource.addFeature(feature);

        textFeature.setStyle(textStyles);
        lyrInfo.vectorSource.addFeature(textFeature);

        map.on('click', _this.mapFeatureClicked);
    },
    //画线索轨迹线，箭头居中显示。styleInfo为json对象，包括arrowIcon, lineColor, lineWidth, fontColor,borderColor、borderWidth、fontOuterColor,fontOuterSize、labTransport几个属性
    addLineTrackArrow: function (layerName, pntList, styleInfo, att) {
        var map = window.map ;
        var _this = _featureLocalFuns;
        _this.styleInfoDic[att.id] = styleInfo;
        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
            map.un('click', _this.mapFeatureClicked);
        }
        if (pntList.length < 1) {
            return;
        }
        var feature = new ol.Feature({
            geometry: new ol.geom.LineString(pntList),
            name: 'LineArrow'
        });
        var styles = [];
        //轨迹线样式
        styles.push(new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: styleInfo.lineColor,
                width: styleInfo.lineWidth
            }),
            zIndex: 100
        }));
        //轨迹起点图标样式
        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(pntList[0])
        }));
        //轨迹终点图标样式
        styles.push(new ol.style.Style({
            geometry: new ol.geom.Point(pntList[pntList.length - 1])
        }));
        _this.styleDic[att.id] = styles;

        var geometry = feature.getGeometry();
        styles = _this.updateTrackArrowStyle(geometry, styleInfo);

        feature.att = att;
        feature.setStyle(styles);
        lyrInfo.vectorSource.addFeature(feature);

        map.on('click', _this.mapFeatureClicked);

        //先解绑再绑定，解决多条轨迹只有一条轨迹缩放时更新样式  modified by wyk 20190715
        var view = map.getView();
        if(_this.unkeyDic[layerName]){
        	view.unByKey(_this.unkeyDic[layerName]);
        }
        var unKey = view.on('change:resolution', function () {
            var featureList = lyrInfo.vectorSource.getFeatures();
            for (var i = 0; i < featureList.length; i++) {
                var feature1 = featureList[i];
                var att1 = feature1.att;
                if (!att1) {
                    continue;
                }
                var styleInfo1 = _this.styleInfoDic[att1.id];
                var geometry1 = feature1.getGeometry();
                feature1.setStyle(_this.updateTrackArrowStyle(geometry1, styleInfo1));
            }
        });
        _this.unkeyDic[layerName] = unKey;
    },
    /**
     * 使用btree索引计算轨迹箭头，降低计算时间复杂度  modified by wyk 20190706
     * 需引入rbush.min.js,ol版本需v3.13.0及以上，现有v3.10.0版本不支持getCoordinateAt方法
     */
    updateTrackArrowStyle: function (geometry, styleInfo) {
    	var _this = this;
    	var trackLine = geometry;
        var zoom = window.map.getView().getZoom();
        var lineWidth = styleInfo.lineWidth;
        if(lineWidth == "auto"){
        	lineWidth = 8;
        }
        var distance = 57*(19-zoom)*(19-zoom);
        var styles = [
           new ol.style.Style({
             stroke: new ol.style.Stroke({
               color: styleInfo.lineColor,
               width: lineWidth
             })
           })
        ];
        var length = _this.getLineLength(trackLine);
        if(length < 2 * distance){
	       	if(length < distance){
	       		distance = length / 3;
	       	}else{
	       		distance = length / 4;
	       	}
        }
        //对segments建立btree索引
        var tree = rbush();//路段数
        var max_num = 1;
        var geomLength = 0;
        trackLine.forEachSegment(function(start, end) {
            var dx = end[0] - start[0];
            var dy = end[1] - start[1];
            var rotation = Math.atan2(dy, dx);
            var geom = new ol.geom.LineString([start,end]);
            var extent = geom.getExtent();
            geomLength += _this.getLineLength(geom);
            var min_num = max_num;
            max_num = parseInt(geomLength / distance);
            var item = {
                minX: extent[0],
                minY: extent[1],
                maxX: extent[2],
                maxY: extent[3],
                geom: geom,
                min_num: min_num,
                max_num: max_num,
                rotation_o : null,
                rotation_n : null,
                rotation: rotation
            };
            tree.insert(item);
         });
         
         var recExtent = map.getView().calculateExtent(map.getSize());
         //箭头总数
         var arrowsNum = parseInt(length / distance);
         var isRepeat = true;
         for(var i = 1;i < arrowsNum;i++){
        	 var arrowIcon = styleInfo.arrowIcon;
        	 var arraw_coor = trackLine.getCoordinateAt(i*1.0/arrowsNum);
        	 var tol = 0.1;
        	 var arraw_coor_buffer = [arraw_coor[0]-tol,arraw_coor[1]-tol,arraw_coor[0]+tol,arraw_coor[1]+tol];
             //进行btree查询
             var treeSearch = tree.search({
               minX: arraw_coor_buffer[0],
               minY: arraw_coor_buffer[1],
               maxX: arraw_coor_buffer[2],
               maxY: arraw_coor_buffer[3]
             });
             var arrow_rotation;
             if(treeSearch.length == 1){
            	isRepeat = true;
            	arrow_rotation = treeSearch[0].rotation;
             }else if(treeSearch.length > 1){
            	 var results = treeSearch.filter(function(item){
            		 var _tol = 0.1;//消除精度误差的容差
                     if(item.geom.intersectsExtent([arraw_coor[0]-_tol, arraw_coor[1]-_tol, arraw_coor[0]+_tol, arraw_coor[1]+_tol]))
                    	 return true;
                 })
                 if(results.length > 0){
                	 for(var j = 0;j < results.length;j++){
                		 if(i >= results[j].min_num && i <= results[j].max_num){
                			 if(i == results[j].min_num + 1){
                				 if(!results[j].rotation_o){
                					 isRepeat = true;
                					 for(var k=0;k<results.length;k++){
                						 results[k].rotation_o = results[j].rotation;
                					 }
                				 }else if(results[j].rotation_o == results[j].rotation){
                					 isRepeat = false;
                				 }else if(!results[j].rotation_n){
                					 isRepeat = true;
                					 for(var k=0;k<results.length;k++){
                						 results[k].rotation_n = results[j].rotation;
                					 }
                				 }else if(results[j].rotation_n == results[j].rotation){
                					 isRepeat = false;
                				 }
                			 }
                			 arrow_rotation = results[j].rotation;
                			 break;
                		 }
                	 }
                 }
             }
             if(isRepeat){
            	 styles.push(new ol.style.Style({
            		 geometry: new ol.geom.Point(arraw_coor),
            		 image: new ol.style.Icon({
            			 src: arrowIcon,
            			 anchor: [0.75, 0.5],
            			 rotateWithView: false,
            			 rotation: -arrow_rotation
            		 })
            	 }));
             }
         }
         return styles;
    },
    getLineLength : function(line){
    	 var coordinates = line.getCoordinates();
         var length = 0;
         var sourceProj = map.getView().getProjection();
         for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
             var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
             var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
             length += new ol.Sphere(6378137).haversineDistance(c1, c2);
         }
         return (Math.round(length * 100) / 100);
    },
    //绘制向前后追
    addFontLable: function (layerName, pos, textString, styleInfo, att) {
        var map = window.map ;
        var _this = _featureLocalFuns;
        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == "") {
            lyrInfo = _this.createLayer(layerName);
        }
        else {
            map.un('click', _this.mapFeatureClicked);
        }
        var feature = new ol.Feature({
            geometry: new ol.geom.Point(pos)
        });
        var style = new ol.style.Style({
            geometry: new ol.geom.Point(pos),
            text: new ol.style.Text({
                font: (styleInfo.fontSize || "12") + 'px sans-serif',
                text: textString,
                fill: new ol.style.Fill({
                    color: styleInfo.fontColor
                }),
                stroke: new ol.style.Stroke({
                    color: styleInfo.fontOuterColor,
                    width: styleInfo.fontOuterSize
                }),
            })
        });
        feature.setStyle(style);
        feature.att = att;
        lyrInfo.vectorSource.addFeature(feature);
        map.on('click', _this.mapFeatureClicked);
    },
    mapFeatureClicked: function (evt) {
        if (_trackLocalFuns.drawTool != null || _measureLocalFuns.drawTool != null) {
            return;
        }
        var map = window.map ;
        var _this = _featureLocalFuns;
        var layerInfo = null;
        //如果点和多边形同时绑定了点击事件，避免同时触发两个事件
        var marker = _this.getPOIFeatureAtPixel(evt.pixel);
        if (marker)
            return;
        var feature = _this.getFeatureAtPixel(evt.pixel);
        if (!feature)
            return;
        if (feature.get('features') == null || feature.get('features') == undefined) {
            var att = feature.att;
            if (att == null || att == '')
                return;
            //执行回调函数
            if (att.featureClicked != null && att.featureClicked != '') {
                att.feature = feature;
                att.featureClicked([att]);
            }
        }
    },
    getFeatureAtPixel: function (pixel) {
        var _this = _featureLocalFuns;
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
            feature = map.forEachFeatureAtPixel(pixels[i], function (feature, layer) {
                layerInfo = _this.getLayer(layer.layerName);
                if (layerInfo != null && layer.layerName != "highLightAreaLayerName" && feature && feature.att && feature.att.featureClicked)
                    return feature;
            });
            if (feature) {
                return feature;
            }
        }
        return null;
    },
    getPOIFeatureAtPixel: function (pixel) {
        var _this = _featureLocalFuns;
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
            feature = map.forEachFeatureAtPixel(pixels[i], function (feature, layer) {
                if (!layer.layerName && feature) {
                    return feature;
                }
                layerInfo = _this.getLayer(layer.layerName);
                if (!layerInfo && layer.layerName != "highLightAreaLayerName" && feature)
                    return feature;
            });
            if (feature) {
                return feature;
            }
        }
        return null;
    },
    getPolygonStyle: function (fillColor, lineColor, lineWidth) {
        if (fillColor == null || fillColor == '')
            fillColor = 'rgba(255, 255, 255, 0.5)';
        if (lineColor == null || lineColor == '')
            lineColor = '#ffcc33';
        if (lineWidth == 0) {
            var style = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: fillColor
                }),
                zIndex:10000,
            });
            return style;
        } else {
            if (lineWidth == null || lineWidth == '')
                lineWidth = 2;
            var style = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: fillColor
                }),
                stroke: new ol.style.Stroke({
                    color: lineColor,
                    width: lineWidth
                }),
                zIndex:10000,
            });
            return style;
        }
    },
    getPolyLineStyle: function (lineColor, lineWidth) {
        if (lineColor == null || lineColor == '')
            lineColor = '#ffcc33';
        if (lineWidth == null || lineWidth == '')
            lineWidth = 2;
        var style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: lineColor,
                width: lineWidth
            })
        });
        return style;
    },
    getDashLineStyle: function (lineColor, lineWidth) {
        if (lineColor == null || lineColor == '')
            lineColor = '#ffcc33';
        if (lineWidth == null || lineWidth == '')
            lineWidth = 2;
        var style = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: lineColor,
                width: lineWidth,
                lineDash: [16, 12]
            })
        });
        return style;
    },
    clear: function (layerName) {
        var map = window.map ;
        var _this = _featureLocalFuns;
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == '')
            return;
        lyrInfo.vectorSource.clear();
    },
    clearAll: function () {
        var map = window.map ;
        var _this = _featureLocalFuns;
        for (var layerName in _this.featureLayers) {
            var lyrInfo = _this.featureLayers[layerName];
            if (lyrInfo == null || lyrInfo == '')
                return;
            lyrInfo.vectorSource.clear();
        }
    }
};

var _heatmapLocalFuns = {
    heatmapLayers: {},
    getLayer: function (layerName) {
        var _this = _heatmapLocalFuns;
        return _this.heatmapLayers[layerName];
    },
    createLayer: function (layerName) {
        var map = window.map ;
        var _this = _heatmapLocalFuns;
        try {
            var lyrInfo = _this.getLayer(layerName);
            if (lyrInfo != null) {
                map.removeLayer(lyrInfo.vectlayer);
            }
        } catch (err) {
            var msg = err;
        }
        var vectorSource = new ol.source.Vector({ wrapX: false });
        var vectorLayer = new ol.layer.Heatmap({
            source: vectorSource,
            blur: 20,
            radius: 10
        });
        vectorLayer.layerName = layerName;
        map.addLayer(vectorLayer);
        var lyrInfo = {
            'vectorLayer': vectorLayer,
            'vectorSource': vectorSource,
            'layerName': layerName
        };
        _this.heatmapLayers[layerName] = lyrInfo;
        return lyrInfo;
    },
    addFeatures: function (layerName, pntList) {
        var _this = _heatmapLocalFuns;
        //初始化图层
        var lyrInfo = _this.getLayer(layerName);
        if (!lyrInfo) {
            lyrInfo = _this.createLayer(layerName);
        }
        var featureList = [];
        for (var i = 0; i < pntList.length; i++) {
            lon = pntList[i].lon;
            lat = pntList[i].lat;
            if (!lon || !lat)
                continue;
            var weight = pntList[i].weight;
            if (!weight)
                weight = 1.0;
            var feature = new ol.Feature({
                geometry: new ol.geom.Point([lon * 1.0, lat * 1.0]),
                weight: weight * 1.0
            });
            feature.att = pntList[i].att;
            feature.id = (pntList[i].id ? pntList[i].id : i);
            featureList.push(feature);
        }
        lyrInfo.vectorSource.addFeatures(featureList);
    },
    clear: function (layerName) {
        var map = window.map ;
        var _this = _heatmapLocalFuns;
        var lyrInfo = _this.getLayer(layerName);
        if (lyrInfo == null || lyrInfo == '')
            return;
        lyrInfo.vectorSource.clear();
    },
    clearAll: function () {
        var map = window.map ;
        var _this = _heatmapLocalFuns;
        for (var layerName in _this.heatmapLayers) {
            var lyrInfo = _this.heatmapLayers[layerName];
            if (lyrInfo == null || lyrInfo == '')
                return;
            lyrInfo.vectorSource.clear();
        }
    }
};

var _wktLocalFuns = {
    getPolygonWkt: function (pntList) {
        var feature = new ol.Feature(
            new ol.geom.Polygon([pntList])
        );
        var format = new ol.format.WKT();
        var wkt = format.writeFeature(feature);
        return wkt;
    },
    getPolyLineWkt: function (pntList) {
        var feature = new ol.Feature(
            new ol.geom.LineString(pntList)
        );
        var format = new ol.format.WKT();
        var wkt = format.writeFeature(feature);
        return wkt;
    },
    getCicleWkt: function (point, radius) {
        var circle = new ol.geom.Circle(point, radius);
        var geom = ol.geom.Polygon.fromCircle(circle, 360, 0);
        var feature = new ol.Feature(
            geom
        );
        var format = new ol.format.WKT();
        var wkt = format.writeFeature(feature);
        return wkt;
    },
    getPointWkt: function (point) {
        var feature = new ol.Feature(
            new ol.geom.Point(point)
        );
        var format = new ol.format.WKT();
        var wkt = format.writeFeature(feature);
        return wkt;
    },
    getPointListFromPolyWkt: function (wkt) {
        var format = new ol.format.WKT();
        var feature = format.readFeature(wkt);
        var geom = feature.getGeometry();
        var temp = geom.getCoordinates();
        var rlt = {
            extent: geom.getExtent(),
            pntList: temp[0],
            wkt: wkt
        }
        if (wkt.startWith("MULTIPOLYGON")) {
            var arr = [];
            for (var i = 0; i < temp.length; i++) {
                for (var j = 0; j < temp[i].length; j++) {
                    var subArr = temp[i][j];
                    arr.push(subArr);
                }
            }
            rlt.pntList = arr;
        }
        return rlt;
    },
    getPointListFromLineWkt: function (wkt) {
        var format = new ol.format.WKT();
        var feature = format.readFeature(wkt);
        var geom = feature.getGeometry();
        var temp = geom.getCoordinates();
        var rlt = {
            extent: geom.getExtent(),
            pntList: temp,
            wkt: wkt
        }
        return rlt;
    }
};

var _prjFuns = {
    //wgs84转gcj02
    gps84_To_Gcj02: function (lon, lat) {
        var pi = 3.1415926535897932384626;
        var a = 6378245.0;
        var ee = 0.00669342162296594323;
        var dLat = transformLat(lon - 105.0, lat - 35.0);
        var dLon = transformLon(lon - 105.0, lat - 35.0);
        var radLat = lat / 180.0 * pi;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
        dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
        var mgLat = lat + dLat;
        var mgLon = lon + dLon;
        return [mgLon, mgLat];

        function transformLon(x, y) {
            var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
            ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
            ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0
                    * pi)) * 2.0 / 3.0;
            return ret;
        }

        function transformLat(x, y) {
            var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
            + 0.2 * Math.sqrt(Math.abs(x));
            ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
            ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
            return ret;
        }
    },
    //gcj02转wgs84
    gcj02_To_Gps84: function (lon, lat) {
        var pi = 3.1415926535897932384626;
        var a = 6378245.0;
        var ee = 0.00669342162296594323;

        var gps = transform(lon, lat);
        var lontitude = lon * 2 - gps[0];
        var latitude = lat * 2 - gps[1];
        return [lontitude, latitude];

        function transform(lon, lat) {
            var dLat = transformLat(lon - 105.0, lat - 35.0);
            var dLon = transformLon(lon - 105.0, lat - 35.0);
            var radLat = lat / 180.0 * pi;
            var magic = Math.sin(radLat);
            magic = 1 - ee * magic * magic;
            var sqrtMagic = Math.sqrt(magic);
            dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
            dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
            var mgLat = lat + dLat;
            var mgLon = lon + dLon;
            return [mgLon, mgLat];
        }

        function transformLon(x, y) {
            var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
            ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
            ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0
					* pi)) * 2.0 / 3.0;
            return ret;
        }

        function transformLat(x, y) {
            var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
			+ 0.2 * Math.sqrt(Math.abs(x));
            ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
            ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
            return ret;
        }
    },
    //WGS84经纬度坐标转地图坐标（默认为EPSG:3857）
    gps84_to_map: function (lon, lat) {
        var map = window.map ;
        var mapPrj = map.getView().getProjection().getCode();
        if (mapPrj == "EPSG:4326") {
            return [lon, lat];
        }
        if (!mapPrj)
            mapPrj = 'EPSG:3857';
        var pos = _prjFuns.gps84_To_Gcj02(lon, lat);
        pos = ol.proj.transform(pos, 'EPSG:4326', mapPrj);
        return pos;
    },
    //地图坐标（默认为EPSG:3857）转WGS84经纬度坐标
    map_to_gps84: function (x, y) {
        var map = window.map ;
        var mapPrj = map.getView().getProjection().getCode();
        if (mapPrj == "EPSG:4326") {
            return [x, y];
        }
        if (!mapPrj)
            mapPrj = 'EPSG:3857';
        var pos = [x, y];
        pos = ol.proj.transform(pos, mapPrj, 'EPSG:4326');
        pos = _prjFuns.gcj02_To_Gps84(pos[0], pos[1]);
        return pos;
    },
    //地图坐标（默认为EPSG:3857）转WGS84经纬度坐标
    map_to_gps84_array: function (pntList) {
        var lonLatList = [];
        for (var i = 0; i < pntList.length; i++) {
            var pnt = pntList[i];
            var lonLat = _prjFuns.map_to_gps84(pnt[0], pnt[1]);
            lonLatList.push(lonLat);
        }
        return lonLatList;
    }
};

var _commonFuns = {
    isPointInRange: function (range, pnt) {
        var west = range[0];
        var south = range[1];
        var east = range[2];
        var north = range[3];
        var x = pnt[0];
        var y = pnt[1];
        if (x >= west && x <= east && y >= south && y <= north) {
            return true;
        }
        return false;
    }
};

Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
String.prototype.startWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substr(0, str.length) == str)
        return true;
    else
        return false;
    return true;
};
String.prototype.endWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substring(this.length - str.length) == str)
        return true;
    else
        return false;
    return true;
};

/**
 * Define a namespace for the application.
 */
window.trackDragControl = {};
var trackDragControl = window.trackDragControl;
/**
 * @constructor
 * @extends {ol.interaction.Pointer}
 */
trackDragControl.Drag = function () {
    ol.interaction.Pointer.call(this, {
        handleDownEvent: trackDragControl.Drag.prototype.handleDownEvent,
        handleDragEvent: trackDragControl.Drag.prototype.handleDragEvent,
        handleMoveEvent: trackDragControl.Drag.prototype.handleMoveEvent,
        handleUpEvent: trackDragControl.Drag.prototype.handleUpEvent
    });

    /**
     * @type {ol.Pixel}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.cursor_ = 'pointer';

    /**
     * @type {ol.Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;

};
ol.inherits(trackDragControl.Drag, ol.interaction.Pointer);
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
trackDragControl.Drag.prototype.handleDownEvent = function (evt) {
    var map = evt.map;

    var feature = this.getFeatureAtPixel(evt.pixel);
    if (feature) {
        this.coordinate_ = evt.coordinate;
        this.feature_ = feature;
    }

    return !!feature;
};
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 */
trackDragControl.Drag.prototype.handleDragEvent = function (evt) {
    var map = evt.map;

    var feature = this.feature_;
    if (!feature)
        return;
    var circle = feature.att.circle;
    var c1 = [circle.lon, circle.lat];
    var c2 = _prjFuns.map_to_gps84(evt.coordinate[0], evt.coordinate[1]);
    if (c2[0] <= c1[0])
        return;
    var wgs84Sphere = new ol.Sphere(6378137);
    var length = wgs84Sphere.haversineDistance(c1, c2);

    var deltaX = evt.coordinate[0] - this.coordinate_[0];
    var deltaY = evt.coordinate[1] - this.coordinate_[1];
    circle.radius += deltaX;

    var geometry = this.feature_.getGeometry();
    geometry.translate(deltaX, 0);

    this.coordinate_[0] = evt.coordinate[0];
    this.coordinate_[1] = evt.coordinate[1];

    //重新加载圆
    _trackLocalFuns.addTrackCircle(circle);

    clearTimeout(_trackLocalFuns.clickTimer);
    _trackLocalFuns.clickTimer = setTimeout(function () {
        if (_trackLocalFuns.callback) {
            _trackLocalFuns.callback(circle);
        }
    }, 300);
};
/**
 * @param {ol.MapBrowserEvent} evt Event.
 */
trackDragControl.Drag.prototype.handleMoveEvent = function (evt) {
    if (this.cursor_) {
        var map = evt.map;
        var element = evt.map.getTargetElement();
        var feature = this.feature_;
        if (feature) {
            if (element.style.cursor != this.cursor_) {
                this.previousCursor_ = element.style.cursor;
                element.style.cursor = this.cursor_;
            }
        } else if (this.previousCursor_ !== undefined) {
            element.style.cursor = this.previousCursor_;
            this.previousCursor_ = undefined;
        }
    }
};
/**
 * @param {ol.MapBrowserEvent} evt Map browser event.
 * @return {boolean} `false` to stop the drag sequence.
 */
trackDragControl.Drag.prototype.handleUpEvent = function (evt) {
    this.coordinate_ = null;
    this.feature_ = null;
    return false;
};

trackDragControl.Drag.prototype.getFeatureAtPixel = function (pixel) {
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
        var feature = map.forEachFeatureAtPixel(pixels[i], function (feature, layer) {
            if (layer && layer.layerName == "ResizeCircleIconLayer") {
                if (feature && feature.att && feature.att.name == "trackCircle") {
                    return feature;
                }
            }
        });
        if (feature) {
            return feature;
        }
    }
    return null;
};
//清除以html形式加载的气泡,前提是在添加时有mark属性,added by zcp
window.gisInteraction.removeMarkerOfHtmlByMark = function (mark) {
	var overlays = map.getOverlays();
    if (overlays == null || overlays.length < 1){
    	return;
    }
    //每次overlays.getLength()会发生变化,故降序删除
    for (var i = overlays.getLength()-1; i >=0 ; i--) {
        var item = overlays.item(i);
        if(!item.get("mark")){
        	continue;
        }
        if (item.get("mark") == mark) {
            overlays.removeAt(i);
        }
    }
};
//重定位,回调中传参[lon,lat],前提是map没有绑定其它的单击事件
window.gisInteraction.getPointForResetPosition = function (callback) {
	var event = window.event || arguments.callee.caller.arguments[0];
	mshp(10);
	event.stopPropagation();
	var tempFlat=true;
    map.on("singleclick",function(evt){
		if(tempFlat && tempFlat==true){
			var coordinate = evt.coordinate;
			coordinate = _prjFuns.map_to_gps84(coordinate[0], coordinate[1]);
		    mshp(0);
		    tempFlat=false;
		    if(callback){
		    	callback(coordinate);
		    }
	    }
	});
	$("#map").bind("mousedown",function(e){//右键清除定位
	    if(e.button == 2){
	    	tempFlat=false;//将重定位状态切换回去
	    	top.window.isRelocate = false;
	    	mshp(0);
	    }
	});
};
/*
 * 已得到轨迹坐标集，相邻点间距离不超过20米则不显示后一个轨迹点
 * result: 包含用户轨迹点位信息的结果集合
 * 返回处理后的结果集
 */
window.gisInteraction.showPointResult = function(result){
	var distance = 20;
	var points = [];
	var temp = 0;
	if(result.length > 0){
		points.push(result[0]);
		for(var i = 1; i < result.length; i++){
			if(window.gisInteraction.calculateDistance(result[i], result[temp]) < distance)
				continue;
			points.push(result[i]);
			temp = i;
		}
	}
	return points;
};
//计算点位间距离
window.gisInteraction.calculateDistance = function(result1, result2){
	var lon1 = result1.longitude;
	var lat1 = result1.latitude;
	var lon2 = result2.longitude;
	var lat2 = result2.latitude;
	var point_Londis = lon1 - lon2;
	var point_Latdis = lat1 - lat2;
	//坐标经纬度转换为米
	var point_Distance = Math.sqrt(point_Londis * point_Londis + point_Latdis * point_Latdis) * 25009.068 / 0.224816;
	return point_Distance;
};