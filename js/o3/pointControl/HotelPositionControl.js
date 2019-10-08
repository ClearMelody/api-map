/**
 * @(#)HotelPositionControl.js
 *
 * @description: 在map上显示hotel点位
 * @author: wangpin
 * @date 2016-4-27
 * @version: 1.0
 */

var HotelPositionControl = function(){
	this.init.apply(this, arguments);
}

HotelPositionControl.prototype = {
	map: null,
	hotelPositionSource: null,
    vectorLayer: null,
    
    init: function(map){
		this.map = map;
		this.hotelPositionSource = new ol.source.Vector({});
		var clusterSource = new ol.source.Cluster({
            distance: 50,
            source: this.hotelPositionSource
        });
		var styleCache = {};
		this.vectorLayer = new ol.layer.Vector({
            name: "hotelPositionLayer",
            source: clusterSource,
            minResolution: 0,
			maxResolution: resolutionArray[8],
            style: function (feature, resolution) {
                var style;
                var size = feature.get('features').length;
                if (size > 1) {
                    style = [new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
                            opacity: 1,
                            src: 'resource/images/xingjijiudian.png'
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
                    var obj = new Object();
                    obj.hotelSeq = contentTemp.get("hotelSeq");
                    obj.hotelName = contentTemp.get("hotelName");
                    obj.hotelAddress = contentTemp.get("hotelAddress");
                    obj.contactName = contentTemp.get("contactName");
                    obj.contactIdentity = contentTemp.get("contactIdentity");
                    obj.telphone = contentTemp.get("telphone");
                    obj.lon = contentTemp.get("lon");
                    obj.lat = contentTemp.get("lat");
                    feature.set("content", obj);
                    feature.setStyle(hotelPositionStyle);
                }
                return style;
            }
        });
        map.addLayer(this.vectorLayer);
        this.getHotelPosition();
	},
	getHotelPosition: function () {
        $.post("getHotelPostion.do",{},function (data) {
            if(data.value){
                var hotels=data.response;
                var iconFeatures = [];
                for (var i = 0,len=hotels.length; i < len; i++) {
                    var hotel = hotels[i];
                    if (clientGISKind == clientGISKinds.OFFLINEGIS) {
                        var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(hotel.LONGITUdE, hotel.LATITUDE), 'EPSG:4326', 'EPSG:3857');
                    } else {
                        var cor = [hotel.LONGITUDE * 1, hotel.LATITUDE * 1];
                    }
                    var iconFeature = new ol.Feature({
                        geometry: new ol.geom.Point(cor),
                        hotelSeq: hotel.HOTEL_SEQ,
                        hotelName: hotel.HOTEL_NAME,
                        hotelAddress: hotel.ADDRESS,
                        contactName: hotel.CONTACT_NAME,
                        contactIdentity: hotel.CONTACT_IDENTITY,
                        telphone: hotel.TELPHONE,
                        lon: hotel.LONGITUDE,
                        lat: hotel.LATITUDE
                    });
                    var pointStyle = getPointClassStype("resource/images/xingjijiudian.png");
                    iconFeature.setStyle(pointStyle);
                    iconFeatures.push(iconFeature);
                }
                hotelPositionControl.clear();
                hotelPositionControl.hotelPositionSource.addFeatures(iconFeatures);
            }
        },"json");
    },
    addPopUp: function(content){
    	var popUpObj = document.getElementById("hotelInfoPopUp");
    	var listObj = popUpObj.children[1].children[0];
    	var textLength = (content.hotelAddress.length+5)*12;
    	var popUpWidth = 230;
    	if(textLength>230){
    		popUpWidth = textLength;
    	}
    	listObj.style.width= popUpWidth+'px';
    	var text= popUpObj.innerHTML;
			text = text.replace(/%hotelName/g,content.hotelName);
			text = text.replace(/%hotelAddress/g,content.hotelAddress);
			text = text.replace(/%contactName/g,content.contactName);
			text = text.replace(/%contactIdentity/g,content.contactIdentity);
			text = text.replace(/%telphone/g,content.telphone);
			text = text.replace("%lon",content.lon);
			text = text.replace("%lat",content.lat);			

			popupControl.showPopUpWin(text,[content.lon,content.lat]);
    },
	clear: function () {
        this.hotelPositionSource.clear();
    },
    CLASS_NAME: "HotelPostionControl"
}