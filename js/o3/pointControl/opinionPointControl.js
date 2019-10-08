/**
 * @(#)opinionPointControl.js
 * @description: 民意热力图
 */
var contants = {
    page: 1,
    rows: 1000
}

var GetPointControl = function () {
    this.init.apply(this, arguments);
}

GetPointControl.prototype = {
    map: null,
    caseId: null,
    casePointSource: null,
    vectorLayer: null,
    heatmapVector: null,
    //前后追
    trackevt: null,
    init: function (map, caseId) {
		window.jhpopupControl = new JhPopupControl(map);
        this.map = map;
        this.caseId = "289166452E9D8D76E050007F0100120B";
        this.casePointSource = new ol.source.Vector({});
        this.casePointSourceHeatMap = new ol.source.Vector({});
        var clusterSource = new ol.source.Cluster({
            distance: 50,
            source: this.casePointSource
        });

        this.vectorLayer = new ol.layer.Vector({
            name: "casePointLayer",
            source: clusterSource,
            style: function (feature, resolution) {
                var style;
                var size = feature.get('features').length;
                if (size > 1) {
                	var imgSrc = '';
            		if(size < 10)
            			imgSrc = 'resource/scienceLayout/images/layerIco/yq/default/02.png';
            		else if(size < 100)
            			imgSrc = 'resource/scienceLayout/images/layerIco/yq/default/03.png';
            		else
            			imgSrc = 'resource/scienceLayout/images/layerIco/yq/default/04.png';

                    style = [new ol.style.Style({
                        image: new ol.style.Icon(({
                            opacity: 1,
                            src: imgSrc
                        })),
                        text: new ol.style.Text({
                            font: '11px sans-serif',
                            text: size.toString(),
                            fill: textFill,
                            offsetX:'10',
                			offsetY:'-17',
                            stroke: textStroke
                        })
                    })];
                } else {
                    feature.set("content", feature.get('features')[0].get("content"));
                    var markImgUrl = getImageUrl();
                    var pointStyle = getPointClassStype(markImgUrl);
                    feature.setStyle(pointStyle);
                }
                return style;
            }
        });

        this.heatmapVector = new ol.layer.Heatmap({
            source: this.casePointSourceHeatMap,
            blur: 20,
            radius: 10
        });

        map.addLayer(this.heatmapVector);
        map.addLayer(this.vectorLayer);
        
        var currentYear = dateUtil.getCurrentYear();
        // 默认查询本年
        var data = {
    		poStartTime: getDateSecondFormat(currentYear[0]),
    		poEndTime: getDateSecondFormat(currentYear[1])
        }
        this.casePointInit(data);
        
        setTimeout(function () {
            //加载基础图层控件
            initialBasalResourcesLayerControl(this.map, this.vectorLayer, this.heatmapVector);
        }, 1000);
    },
    casePointInit: function (data) {
        var _self = this;
        if (popupControl && window.jhpopupControl) {
            popupControl.closePopUpwin();
            window.jhpopupControl.closePopUpwin();
        }
        if (window.jhpopupControl) {
            window.jhpopupControl.closePopUpwin();
        }
        this.casePointSource.clear();
        this.casePointSourceHeatMap.clear();
        var url = "findAllOpinionForList.do?rows=2147483647";
        _showWait();
        jQuery.ajax({
            url: url,
            data: data || {},
            type: "POST",
            success: function (res) {
                _hideWait();
                var content = eval("(" + res + ")");
                var result = content.rows;
                _self.clear();
                var lon = 0;
                var lat = 0;
                var iconFeatures = [];
                var iconFeaturesHeatMap = [];
                var countSize = 0;
                var countLon = 0;
                var countLat = 0;

                for (var i = 0, len = result.length; i < len; i++) {
                    lon = result[i].LONGITUDE * 1;
                    lat = result[i].LAUTITUDE * 1;
                    if (clientGISKind == clientGISKinds.OFFLINEGIS && result[i].LONGITUDE != "" && result[i].LAUTITUDE != undefined) {
                        var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(result[i].LONGITUDE * 1, result[i].LAUTITUDE * 1), 'EPSG:4326', 'EPSG:3857');
                        lon = cor[0];
                        lat = cor[1];
                    }
                    if (result[i].LONGITUDE * 1 && result[i].LAUTITUDE * 1) {
                        countSize++;
                        countLon += lon * 1;
                        countLat += lat * 1;
                        var iconFeature = new ol.Feature({
                            geometry: new ol.geom.Point([lon, lat]),
                            content: result[i]
                        });
                        iconFeature.setId(result[i].caseId);
                        var iconFeatureHeatMap = new ol.Feature({
                            geometry: new ol.geom.Point([lon, lat]),
                            weight: 0.3
                        });
                        iconFeature.setStyle(newJQStyle);
                        iconFeatures.push(iconFeature);
                        iconFeaturesHeatMap.push(iconFeatureHeatMap);
                    }
                }
                if (countLon != 0 && countLat != 0) {
                    //map.getView().setCenter([countLon/countSize,countLat/countSize]);
                }
                _self.casePointSource.addFeatures(iconFeatures);
                _self.casePointSourceHeatMap.addFeatures(iconFeaturesHeatMap);
            }
        })
    },
    addPointMarker: function (lon, lat) {
        this.delMakerById("mapMarkPoint");
        var feature = new ol.Feature({
            geometry: new ol.geom.Point([lon, lat]),
        });
        feature.setId("mapMarkPoint");
        feature.setStyle(newJQStyle);
        this.casePointSource.addFeature(feature);
    },
    addClusterPointListPop: function (features) {
        var lon = features[0].get("content").LONGITUDE;
        var lat = features[0].get("content").LAUTITUDE;
        var resambleHtml = '';
        for (var i = 0; i < features.length; i++) {
        	var tmpObj = features[i].get('content');
            var opinionContent = tmpObj.OPINION_CONTENT;
            var opinionType = opinionTypeMap.get(tmpObj.OPINION_TYPE) || '';
            var markImgUrl = getImageUrl();
            resambleHtml += '<a href="javascript:void(0);" class="GkkListNav" onclick="getPointControl.showClusterCase(this)"';
            resambleHtml +=	' title="'+opinionContent+'" source="'+tmpObj.SOURCE+'"';
            resambleHtml += ' lon="'+tmpObj.LONGITUDE+'" lat="'+tmpObj.LAUTITUDE+'" addr="'+tmpObj.ADDR+'" opinionOwnerPhone="'+tmpObj.OPINION_OWNER_PHONE+'"';
            resambleHtml += ' opinionOwner="'+tmpObj.OPINION_OWNER+'" opinionClass="'+tmpObj.OPINION_CLASS+'" opinionId="'+tmpObj.ID+'">';
            resambleHtml += '    <img src="' + markImgUrl + '" width="25" height="25" />';
            resambleHtml += '    <span style="margin-left:5px;">'+opinionType+'</span> ';
            resambleHtml += '</a >';
        }
        window.jhpopupControl.showPopUpWin(resambleHtml, [lon * 1, lat * 1], 1);
    },
    //删除临时点
    delMakerById: function (lid) {
        var feature = this.casePointSource.getFeatureById("mapMarkPoint");
        if (feature) {
            this.casePointSource.removeFeature(feature);
        }
    },
    showClusterCase: function (obj) {
        $("#jhclose").click();
        obj = $(obj);
        var content = {
        	'ID': obj.attr('opinionId') || '',
        	'SOURCE': obj.attr('source') || '',
        	'OPINION_CLASS': obj.attr('opinionClass'),
        	'OPINION_OWNER': obj.attr('opinionOwner') || '',
        	'OPINION_OWNER_PHONE': obj.attr('opinionOwnerPhone'),
        	'ADDR': obj.attr('addr') || '',
        	'OPINION_CONTENT': obj.attr('title') || '',
        	'LONGITUDE': obj.attr('lon'),
        	'LAUTITUDE': obj.attr('lat')
        }
        this.addpopUp(content);
    },
    clear: function () {

    },
    addpopUp: function (content) {
        var text = document.getElementById("newCasePopUp").innerHTML;
        text = text.replace(/%source/g, opinionSourceMap.get(content.SOURCE)||'');
        text = text.replace(/%opinionClass/g, opinionClassMap.get(content.OPINION_CLASS)||'');
        text = text.replace(/%opinionOwnerName/g, content.OPINION_OWNER);
        text = text.replace(/%opinionOwnerPhone/g, content.OPINION_OWNER_PHONE);
        text = text.replace(/%addr/g, content.ADDR || "");
        text = text.replace(/%opinionContent/g, content.OPINION_CONTENT || "");
        text = text.replace(/%opinionDetail/g, "toOpinionDetail('"+content.ID+"')");
        popupControl.showPopUpWin(text, [content.LONGITUDE * 1, content.LAUTITUDE * 1]);
//        popupControl.setCenter([content.LONGITUDE * 1, content.LAUTITUDE * 1]);
    },
    updateLocation: function (caseId, lon, lat) {
        var contents = null;
        if (getPointControl.casePointSource.getFeatureById(caseId)) {
            contents = getPointControl.casePointSource.getFeatureById(caseId).get("content");
            contents.caseLatitude = lat * 1;
            contents.caseLongitude = lon * 1;
            getPointControl.casePointSource.removeFeature(getPointControl.casePointSource.getFeatureById(caseId));
        } else {
            $.ajax({
                url: "getCaseById.do?caseId=" + caseId,
                async: false,
                success: function (res) {
                    res = eval("(" + res + ")");
                    var obj = res.resp;

                    if (clientGISKind == clientGISKinds.OFFLINEGIS && obj.caseLongitude != "" && obj.caseLatitude != undefined) {
                        var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(obj.caseLongitude * 1, obj.caseLatitude * 1), 'EPSG:4326', 'EPSG:3857');
                        obj.caseLongitude = cor[0];
                        obj.caseLatitude = cor[1];
                    }
                    contents = obj;
                    contents.leibieName = contents.leibie;
                }
            })
        }

        var _self = this;
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point([lon, lat]),
            content: contents
        });
        iconFeature.setId(contents.caseId);
        var iconFeatureHeatMap = new ol.Feature({
            geometry: new ol.geom.Point([lon, lat]),
            weight: 0.3
        });
        _self.casePointSource.addFeature(iconFeature);
        _self.casePointSourceHeatMap.addFeature(iconFeatureHeatMap);
    },
    
    CLASS_NAME: "GetPointControl"
}

function getImageUrl(bjlbdm){
	var markImgUrl = "resource/scienceLayout/images/layerIco/yq/default/44.png";
	return markImgUrl;
}

//加载基础图层控件，页面需要引用#parse("o3/popUp/yanpanPopups.vm")
//以及<script type="text/javascript" src="resource/js/o3/BasalResourcesLayerControl.js?version=1.01" ></script>
function initialBasalResourcesLayerControl(map, vectorLayer, heatmapLayer) {
    var style = {
        MenuSwitcherVisible: false,
        collapse: false,
        defualtShowLayerList: false,
        defualtDockAndAlign: true,
        top: 5,
        right: 5,
        JKD: false,
        JZ: false,
        JWT: false,
        DT: false,
        ZRQ: false,
        FocalDept: false,
        FocalMan: false,
        Hotel: false,
        Netbar: false,
        carKK : true,
        AJ: false,
        JQ: false,
        wifi: true,
        OPINION: true,
        ALARM: true,
        OPINION_Checked: true
    };
    basalResourcesLayerControl = new BasalResourcesLayerControl(map, style);
}

//打开舆情详情界面
function toOpinionDetail(opinionId){
	var url = "queryOpinionDetail?opinionid="+opinionId;
	window.opinionDetailDialog = $.fn.scienceDialog({
		url : url,
		zIndex: 999999999,
		width:'auto',
		height:'auto',
		close: function() {
			window.opinionDetailDialog=null;
		}
	});
}