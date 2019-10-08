/**
 * @(#)NetBarPositionControl.js
 *
 * @description: 在map上显示neBbar点位
 * @author: wangpin
 * @date 2016-4-28
 * @version: 1.0
 */

var NetBarPositionControl = function(){
	this.init.apply(this, arguments);
}

NetBarPositionControl.prototype = {
	map: null,
	netBarPositionSource: null,
    vectorLayer: null,
    
    init: function(map){
		this.map = map;
		this.netBarPositionSource = new ol.source.Vector({});
		var clusterSource = new ol.source.Cluster({
            distance: 50,
            source: this.netBarPositionSource
        });
		var styleCache = {};
		this.vectorLayer = new ol.layer.Vector({
			minResolution: 0,
			maxResolution: resolutionArray[8],
            name: "netBarPositionLayer",
            source: clusterSource,
            style: function (feature, resolution) {
                var style;
                var size = feature.get('features').length;
                if (size > 1) {
                    style = [new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                            opacity: 1,
                            src: 'resource/images/netBar.png'
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
                    var obj = {};
                    obj.netBarName = contentTemp.get("netBarName");
                    obj.netBarAddress = contentTemp.get("netBarAddress");
                    obj.contactName = contentTemp.get("contactName");
                    obj.telphone = contentTemp.get("telphone");
                    obj.lon = contentTemp.get("lon");
                    obj.lat = contentTemp.get("lat");
                    feature.set("content", obj);
                    feature.setStyle(netBarPositionStyle);
                }
                return style;
            }
        });
        map.addLayer(this.vectorLayer);
        this.getNetBarPosition();
	},
	getNetBarPosition: function () {
        $.post("getNetBarPostion.do",{},function (data) {
            if(data.value){
                var netBars=data.response;
                var iconFeatures = [];
                for (var i = 0,len=netBars.length; i < len; i++) {
                    var netBar = netBars[i];
                    if (clientGISKind == clientGISKinds.OFFLINEGIS) {
                        var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(netBar.LONGITUdE, netBar.LATITUDE), 'EPSG:4326', 'EPSG:3857');
                    } else {
                        var cor = [netBar.LONGITUDE * 1, netBar.LATITUDE * 1];
                    }
                    var iconFeature = new ol.Feature({
                        geometry: new ol.geom.Point(cor),
                        netBarName: netBar.NET_BAR_NAME,
                        netBarAddress: netBar.ADDRESS,
                        contactName: netBar.CONTACT_NAME,
                        telphone: netBar.TELPHONE,
                        lon: netBar.LONGITUDE,
                        lat: netBar.LATITUDE
                    });
                    var pointStyle = getPointClassStype("resource/images/netBar.png");
                    iconFeature.setStyle(pointStyle);
                    iconFeatures.push(iconFeature);
                }
                netBarPositionControl.clear();
                netBarPositionControl.netBarPositionSource.addFeatures(iconFeatures);
            }
        },"json");
    },
    addPopUp: function(content){
    	var popUpObj = document.getElementById("netBarInfoPopUp");
    	var listObj = popUpObj.children[1].children[0];
    	var textLength = (content.netBarAddress.length+5)*12;
    	var popUpWidth = 230;
    	if(textLength>230){
    		popUpWidth = textLength;
    	}
    	listObj.style.width= popUpWidth+'px';
    	var text= popUpObj.innerHTML;
			text = text.replace(/%netBarName/g,content.netBarName);
			text = text.replace(/%netBarAddress/g,content.netBarAddress);
			text = text.replace(/%contactName/g,content.contactName);
			text = text.replace(/%telphone/g,content.telphone);
			text = text.replace("%lon",content.lon);
			text = text.replace("%lat",content.lat);			

			popupControl.showPopUpWin(text,[content.lon,content.lat]);
    },
	clear: function () {
        this.netBarPositionSource.clear();
    },
    CLASS_NAME: "NetBarPostionControl"
}