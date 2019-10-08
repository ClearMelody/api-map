/**
 * @(#)fhgisadapter.js
 * 
 * @description: 自研FHGIS Adapter
 * @author: 杨朝晖 2013/11/14
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */

//GIS自定义参数配置-201408.07 by 王佳
var gisParameter = null;


/**
 * 取出fhgis的分辨率数组
 *
 * */
function fetchFHgisResolutions(){

	var resArr = [0.000001341104507446289,// 15
		0.000002682209014892578,   // 14
		0.000003814418029785156,  // 13											
		0.000007628536059570312, // 12											
		0.000015257672119140625,// 11

		0.00003051534423828125,// 10 
		0.0000610306884765625,//  9 
		0.000121661376953125,//  8 
		0.00024332275390625,// 7 
		0.0004866455078125,//  6 

		0.000953291015625,//  5 
		0.00174658203125,// 4 
		0.0054931640625,// 3
		0.010986328125,// 2 
		0.02197265625,// 1 
		0.0439453125 // 0
		]
		return resArr;
}

/**
startLev from 0
makeFhgisResolutions(7,20);
endLev 最大为21
 */
function makeFhgisResolutions(startLev,endLev){

	if(startLev<0){
		startLev=0;
	}

	var rsArr = [];
	//# 新余 guifanhua  360/250=0  0--21 levels
	var fhgisResArr  = [0.04394531250000000000,0.02197265625000000000 ,0.01098632812500000000 ,0.00549316406250000000, 
		0.00274658203125000000, 0.00137329101562500000, 0.00068664550781250000,0.00034332275390625000, 
		0.00017166137695312500, 0.00008583068847656250, 0.00004291534423828120, 0.00002145767211914060, 
		0.00001072883605957030, 0.00000536441802978516, 0.00000268220901489258, 0.00000134110450744629];

	if(endLev>fhgisResArr.length-1){
		endLev=fhgisResArr.length-1;
	}

	for(var i= startLev;i<=endLev;i++){
		rsArr.push(fhgisResArr[i]);

	}
	return rsArr;
	// console.log(rsArr);
}

/**
 * 配置fhgis数据参数
 *
 * */
function configFHgisDataParam(){
	//GIS引擎参数配置
	var gisEngineParam = $('#gisEngine').html();
	var gisParameObj = eval("(" + gisEngineParam + ")");
	gisParameter = gisParameObj;
	var host = window.location.host;
	//如果gis地图服务器和6000 v5网管不在一台服务器上，请修改以下语句为地图服务器的IP，
	if(host.indexOf("8080")){
		host =  host.replace("8080", "8090");
	}
	var mapUrlFromServer;
	//主页面加载param.js
	if(document.getElementById("internetMapUrlFromServer") && document.getElementById("intranetmapUrlFromServer") &&document.getElementById("mapUrlPort")) {
		var internetMapUrlFromServer = document.getElementById("internetMapUrlFromServer").value;
		var intranetmapUrlFromServer = document.getElementById("intranetmapUrlFromServer").value;
		var mapUrlPort = document.getElementById("mapUrlPort").value;
		//如果获取到内网ip和外网ip
		if(internetMapUrlFromServer && intranetmapUrlFromServer) {
			//如果内网ip和网管访问ip在同一个网段
			if(host.split(".")[0] == intranetmapUrlFromServer.split(".")[0]) {
				mapUrlFromServer = intranetmapUrlFromServer +":"+mapUrlPort;
			}
			//如果外网ip和网管访问ip在同一个网段
			else if(host.split(".")[0] == internetMapUrlFromServer.split(".")[0]) {
				mapUrlFromServer = internetMapUrlFromServer +":"+mapUrlPort;
			}
			//如果配置的内网和外网ip与gis引擎ip不在同一个ip网段
			else {
				alert("配置的ip地址与gis引擎ip不在同一个网段,请在网管-系统配置中的GIS地图参数设置中配置");
			}
			//只有外网ip
		}else if(internetMapUrlFromServer) {
			mapUrlFromServer = internetMapUrlFromServer +":"+mapUrlPort;
		}
		//只获取到内网ip
		else if(intranetmapUrlFromServer) {
			mapUrlFromServer = intranetmapUrlFromServer +":"+mapUrlPort;
		}
		//内网和外网ip都没有配置
		else {
			alert("gis引擎内网和外网ip都没有配置,请在网管-系统配置中的GIS地图参数设置中配置");
		}
	}
	if(mapUrlFromServer){
		host = mapUrlFromServer;
	}
	//2D数据访问url
	window.mapurl = "http://"+host+"/TCE/";
	//3D数据访问url
	window.hturl = "http://"+host+"/ht/";
	if(gisParameter&&gisParameter.initCenterLon&&gisParameter.initCenterLat&&gisParameter.initCenterZoom){
		G_FULLSCREEN_BOUNDS = {"center":new OpenLayers.LonLat(gisParameter.fullMapLon, gisParameter.fullMapLat), "z":gisParameter.fullMapZoom};
	}else {
		G_FULLSCREEN_BOUNDS = {"center":new OpenLayers.LonLat(114.91009, 27.82437), "z":1};

	}
	//gis自定义参数配置，用于控制页面元素显、隐
	//configPage();

}

/**
 * 
 * 配置加载fhgis图层
 *
 * */
function configLoadFHgisLayers(mainMap){

	//GIS引擎参数配置
	var gisEngineParam = $('#gisEngine').html();
	var gisParameObj = eval("(" + gisEngineParam + ")");
	gisParameter = gisParameObj;

	var internetMapUrlFromServer = document.getElementById("internetMapUrlFromServer").value;
	var intranetmapUrlFromServer = document.getElementById("intranetmapUrlFromServer").value;
	var mapUrlPort = document.getElementById("mapUrlPort").value;
	
	
	tilecached = 
		new ol.layer.Tile({
			//			extent: [-13884991, 2870341, -7455066, 6338219],
			source: new ol.source.TileWMS({
				url: 'http://' + intranetmapUrlFromServer + ':' + mapUrlPort + '/geoserver/wms',  //'http://10.1.112.205:8090/geoserver/wms',
				params: {'LAYERS': 'nation'},
				serverType: 'geoserver'
			})
		});

	map.addLayer(tilecached);


	// 定义3维图层 gisParameter&&gisParameter.threeD是用来控制2 3维切换器的
	//if(gisParameter&&gisParameter.threeD){
	//	httils = new OpenLayers.fhHalfTripleTiles(map, window.hturl, gisParameter.threeD);
	//}else {
	//		httils = new OpenLayers.fhHalfTripleTiles(map, window.hturl, false);
	//}


	//初始化放大到的级别
	initMapZoom = 12;
	var resolutionArrayFh = fetchFHgisResolutions();
	var view = new ol.View({
		projection: 'EPSG:4326',
		center: [gisParameObj.initCenterLon, gisParameter.initCenterLat],
		zoom: gisParameObj.initCenterZoom,
		maxZoom : 20,
		minZoom : 5,
		extent : [73,18,135.2,53.8]
	})
	map.setView(view);




}

//gis自定义参数配置，用于控制页面元素显、隐
function configPage(){
	//区域定位
	if(gisParameter&&gisParameter.regionLocate){
		//正常显示
	}else{//隐藏
		$("#tbItem12").hide();
	}
	//出警分析起始点、终点
	if(gisParameter&&gisParameter.policeActionStartDefault&&gisParameter.policeActionEndDefault){
		$("#startRoad").val(gisParameter.policeActionStartDefault);
		$("#endRoad").val(gisParameter.policeActionEndDefault);
	}else {
		$("#startRoad").val('徐东');
		$("#endRoad").val('雄楚');
	}
}

