/**
 * @(#)DtGpsControl.js
 *
 * @description: 在map上显示
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */

var dtGpsControl = null;

var DtGpsControl = function () {
    this.init.apply(this, arguments);
}

DtGpsControl.prototype = {
    map: null,
    dtgpsClassSource: null,
    vectorLayer: null,
    firstclusters: null,
    userList:null,
	userLonLatMap : null,
	lastUserMap : null,
    init: function (map) {
        this.map = map;
        this.dtgpsClassSource = new ol.source.Vector({});
        this.vectorLayer = new ol.layer.Vector({
            name: "dtClassLayer",
            source: this.dtgpsClassSource
        });

        var clusterSource = new ol.source.Cluster({
            distance: 50,
            source: this.dtgpsClassSource
        });

        this.userLonLatMap = new HashMap();
        var styleCache = {};
        this.firstclusters = new ol.layer.Vector({
            name: "dtClassLayer",
            source: clusterSource,
            style: function (feature, resolution) {
                var style;
                var size = feature.get('features').length;
                if (size > 1) {
                    style = [new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                            opacity: 1,
                            src: 'resource/images/m0.png'
                        })),
                        text: new ol.style.Text({
                            font: '11px sans-serif',
                            text: size.toString(),
                            fill: textFill,
                            stroke: textStroke
                        })
                    })];
                } else {
                    var contentTemp = feature.get('features')[0];
                    var imgUrl = "resource/images/dtcar_gps.png";
                    if(contentTemp.get("type") == 3) {
                    	imgUrl = "resource/images/dt_gps.png";
                    }
                    var pointStyle = getPointClassStype(imgUrl);
                    var obj = new Object();
                    obj.time = contentTemp.get("time");
                    obj.name = contentTemp.get("name");
                    obj.lon = contentTemp.get("lon");
                    obj.lat = contentTemp.get("lat");
                    obj.xm = contentTemp.get("xm");
                    obj.jh = contentTemp.get("jh");
                    
                    feature.set("content", obj);
                    feature.setStyle(pointStyle);
                }
                return style;

            }

        });
        map.addLayer(this.firstclusters);
        this.getDtClassPoint();
        this.bindEvent();
    },
    getDtClassPoint: function () {
        $.post("queryDtGpsDevice.do",{},function (data) {
            var xHtml="";
            if(data && data.resp){
                var gpsInfo = data.resp;
                var iconFeatures = [];
                var dtNum = 0;
                var carNum = 0;
                var maxTime = 0;
                var maxType = 0;
                var maxName = null;
                for (var i = 0,len = gpsInfo.length; i < len; i++) {
                    var user = gpsInfo[i];
                    if(!user.LON) continue;
                    if (clientGISKind == clientGISKinds.OFFLINEGIS) {
                        var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(user.LON, user.LAT), 'EPSG:4326', 'EPSG:3857');
                    } else {
                        var cor = [user.LON * 1, user.LAT * 1];
                    }
                    if((new Date() - new Date(user.TIME)) > 30 * 60 * 1000) {
                    	continue;
                    }
                    var iconFeature = new ol.Feature({
                        geometry: new ol.geom.Point(cor),
                        time: user.TIME,
                        name: user.NAME,
                        lon: user.LON,
                        lat: user.LAT,
                        xm : user.XM,
                        jh : user.JH,
                        type : user.TYPE
                    });
                    iconFeature.setId(user.NAME);
                    var imgUrl = "resource/images/dtcar_gps.png";
                    if(user.TYPE == 3) {
                    	imgUrl = "resource/images/dt_gps.png";
                    	dtNum++;
                    } else {
                    	carNum++;
                    }
                    var pointStyle = getPointClassStype(imgUrl);
                    iconFeature.setStyle(pointStyle);
                    iconFeatures.push(iconFeature);
                    
                    var dtContent = {
                    	id:user.NAME,
                    	lon: user.LON,
                        lat: user.LAT,
                        xm : user.XM,
                        jh : user.JH,
                        name : user.NAME,
                        type : ('dt' + user.TYPE)
                    };
                    dataArray.push(dtContent);
                    
                    if(maxTime == 0) {
                    	maxTime = user.TIME;
                    	maxType = user.TYPE;
                    	maxName = user.NAME;
                    } else if(user.TIME > maxTime){
                    	maxTime = user.TIME;
                    	maxType = user.TYPE;
                    	maxName = user.NAME;
                    }
                    
                    dtGpsControl.userLonLatMap.put(dtContent.id,{lon:user.LON,lat:user.LAT});
                }
                $("#stNum").text(dtNum);
                $("#xlcNum").text(carNum);
                dtGpsControl.clear();
                dtGpsControl.dtgpsClassSource.addFeatures(iconFeatures);
                
                var str = maxName + "的手台上线了";
            	if(maxType != 3){
            		str = maxName + "巡逻车上线了";
            	}
            	if(maxName) {
					$(".PSBDopeTitle").html('<span id="titleTip" class="live-tile"></span>');
	            	$("#titleTip").html(str);
	            	createMarquee({
	                	duration : 10000,
	                	padding : -100,
				 		marquee_class:'.live-tile', 
				 		container_class: '.PSBDopeTitle', 
				 		hover: true
				 	});
            	}
            }
        },"json");

    },
    addPopUp: function (content) {
        var _self = this;
        var coordinate = new Array();
        coordinate.push(content.lon * 1);
        coordinate.push(content.lat * 1);
        var text = document.getElementById('dtClassPop').innerHTML;
        text = text.replace(/%name/g, content.name ? content.name : "");
        text = text.replace("%xm", content.xm ? content.xm : "");
        text = text.replace("%jh", content.jh ? content.jh : "");
        text = text.replace("%time", content.time ? content.time : "");
        popupControl.showPopUpWin(text, coordinate);
    },
    addPopUpWithParam : function(name,xm,jh,time,lon,lat){
    	var _self = this;
        var coordinate = new Array();
        coordinate.push(lon * 1);
        coordinate.push(lat * 1);
        var text = document.getElementById('dtClassPop').innerHTML;
        text = text.replace(/%name/g, name ? name : "");
        text = text.replace("%xm", xm ? xm : "");
        text = text.replace("%jh", jh ? jh : "");
        text = text.replace("%time", time ? time : "");
        popupControl.showPopUpWin(text, coordinate);
    },
    /*
     * 添加聚合列表
     */
    addClusterPointListPop: function (features) {
        var lon = features[0].get("lon");
        var lat = features[0].get("lat");

        var resambleHtml = '';
        resambleHtml += '<ul class="PSBPoliceList">';
        for (var i = 0; i < features.length; i++) {
            var tmpObj = features[i];
            var name = tmpObj.get("name");
            var xm = tmpObj.get("xm");
            var time = tmpObj.get("time");
            var jh =  tmpObj.get("jh") ?  tmpObj.get("jh")  : '';
            var type = tmpObj.get("type");
            var imgUrl = "resource/images/dtcar_gps.png";
            if(type == 3) {
            	imgUrl = "resource/images/dt_gps.png";
            }
			var tmp = name +( xm ?  ("-" + xm + "") : "");
            resambleHtml+='<li>';
            resambleHtml += '<a title="' + tmp + '" class="jhList"> ';
            resambleHtml += '<img src="'+ imgUrl +'" width="25" height="19" />';
            resambleHtml += '<span onclick="dtGpsControl.addPopUpWithParam(\''+name+'\',\''+ xm +'\',\''+ jh +'\',\''+ time +'\',\''+lon +'\',\''+ lat +'\')"  ';
            resambleHtml += '  name="' + tmp + '"  title="' + tmp + '" >' + tmp + '</span> ';
            resambleHtml+='</li>';
        }
        resambleHtml += '</ul>'
        dtPopupControl.showPopUpWin(resambleHtml, [lon, lat], 1);
    },
    
    clear: function () {
        this.dtgpsClassSource.clear();
    },
    bindEvent:function () {
        $(".j_mobile").live("mousedown",function (event) {
            if(event.button==0){//左键点击
                var mobileLi=event.target;
                var lon = mobileLi.dataset.lon;
                var lat = mobileLi.dataset.lat;
    			if(clientGISKind == clientGISKinds.OFFLINEGIS && lon!="" && lon!=undefined){	
    				var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(lon*1,lat*1), 'EPSG:4326', 'EPSG:3857');
    				lon = cor[0];
    				lat = cor[1];
    			}
                setTimeout(function () {
                    map.getView().setZoom(20);
                    map.getView().setCenter([lon, lat]);
                    centerCrossEffect.startAnimate(lon, lat);
                }, 300)
            }
        })
    },
    CLASS_NAME: "DtGpsControl"
}
;
