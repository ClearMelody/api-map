/**
 * @(#)OfflineAdapter.js
 * 
 * @description: Offline Adapter
 * @author: 肖振亚 2016/07/19
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */

function configLoadOfflineLayers(map,from){
	
	var offline_url = $('#offline_url').val();
	var offline_center= $('#offline_center').val();
	var offline_min_level = $('#offline_min_level').val();
	var offline_max_level = $('#offline_max_level').val();
	var OfflineMapInitLevel;
	if($('#OfflineMapInitLevel').val()){
		 OfflineMapInitLevel = $('#OfflineMapInitLevel').val();
	}else{
		 OfflineMapInitLevel = 15;
	}
	if('addressMap' == from){//地址库
		var center = ol.proj.transform([114.21596533125518,30.60113621779453],'EPSG:4326', 'EPSG:3857');
		maxLevel = offline_max_level;
	}else{
		var center = ol.proj.transform(eval(offline_center),'EPSG:4326', 'EPSG:3857');
	}
	var prefix = window.location + "";
    var index = prefix.indexOf("/", 7);
    prefix = prefix.substring(0, index + 1);
	var layer =  new ol.layer.Tile({
		id: "offlineBaseLayer",
		source: new ol.source.XYZ({
//			urls: [prefix+'mapabc/roadmap/{z}/{x}/{y}.png'],
			urls: [offline_url + '/{z}/{x}/{y}.png'],
			minZoom: offline_min_level *1,
			maxZoom: offline_max_level *1,
			tilePixelRatio: 1
		})
	});

	map.addLayer(layer);

	var zoom = OfflineMapInitLevel - 1;
	if('addressMap' == from){
		zoom = OfflineMapInitLevel + 1;
	}
	var view = new ol.View({
		minZoom : offline_min_level*1,
		maxZoom : offline_max_level*1,
		zoom: zoom,
		projection: 'EPSG:3857',
		center: center
	})
	map.setView(view);

}

/**
 * 取出fhgis的分辨率数组
 *
 * */
function fetchOfflineResolutions(){

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
