var arcgisDeltaZoom = 0 ;
var clientGISKinds ={"PGIS":"PGIS","FHGIS":"FHGIS","YANPANNOGIS":"YANPANNOGIS","ARCGIS":"ARCGIS","OFFLINEGIS":"OFFLINEGIS"};
//获取gisKind
var clientGISKind = $('#gisKindInput').val();

//clientGISKind = clientGISKinds.OFFLINEGIS;

//arcgis para
var arcgislurl;
var arcgisyxurl;
var searchFields = "";
var arcgisRoadLayerIndex;
var arcGisLayer;
var arcGisLayerImage;
var propertyZoom = 10;
//路网服务地址，地址写死了，
var arcgisroadurl = "http://100.16.3.40:6080/arcgis/rest/services/whroad/MapServer";
var arcGisRoadLayer;
var arcgisMapFullExtent;

//老版 2015.10.10立德地图只有10个级别，现在又20个级别
var arcgisDeltaZoom = 0;

//FHgis para
var fhgisurl;


//是否显示工具条  1 显示   -1 不显示
var toolbarFlag = getParameter("toolbar");
//线索缩略图zindex
var labelPicZIndex = 1;

//摄像头类型
var QUERY_SHOT_POINT_KINDS = {"FIRSTCLASS":"FIRSTCLASS","SECONDCLASS":"SECONDCLASS",
		"THIRDCLASS":"THIRDCLASS","KAKOUSITE":"KAKOUSITE"};