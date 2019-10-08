/**
 * @(#)pgisadapter.js
 * 
 * @description: PGIS Adapter
 * @author: 张添 2016/1/13
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
/**
 * 取出pgis的分辨率数组
 *
 * */
function fetchPgisResolutions(){
	
	var pMapMaxLevel = $('#pgis_MapMaxLevel').val(); 
	if(pMapMaxLevel){
		pMapMaxLevel = parseInt(pMapMaxLevel);
	} 
	
	var reso=[2,1,0.5,0.25,0.125,0.0625,0.03125,0.015625,0.0078125,
	          0.00390625,0.001953125,0.0009765625,0.00048828125,
	          0.000244140625,0.0001220703125,0.00006103515625,
	          0.000030517578125,0.0000152587890625,
	          0.00000762939453125,0.000003814697265625,
	          0.0000019073486328125,9.5367431640625e-7,4.76837158203125e-7];
	reso.splice(pMapMaxLevel,reso.length-pMapMaxLevel);
	//提取合适级别 约等于0.00003051534423828125附近
	properZoomLevel = 16;
	if(pMapMaxLevel<properZoomLevel){
		properZoomLevel = pMapMaxLevel;
	}
	
	return reso;
}
/**
 * 配置加载pgis图层
 *
 * */
function configLoadPgisLayers(mainMap){
	
	//见config.properties
	var pslurl= $('#pgis_sl_url').val();
	var pyxurl= $('#pgis_yx_url').val();
	var psydjurl= $('#pgis_sydj_url').val();
	var pdemurl= $('#pgis_dem_url').val();
	
	var pMapFullExtent = $('#pgis_MapFullExtent').val(); 
	var pMapInitLevel = $('#pgis_MapInitLevel').val(); 
	var pgis_MapMaxLevel = $('#pgis_MapMaxLevel').val();
	
	if(pMapInitLevel){
		pMapInitLevel = parseInt(pMapInitLevel);
	}

	var fullExtentArr = eval(pMapFullExtent);
	var centerX = (fullExtentArr[0]+fullExtentArr[2])/2;
	var centerY = (fullExtentArr[1]+fullExtentArr[3])/2;
	 
	var projection = ol.proj.get('EPSG:4326');

	var pGisLayer = new ol.layer.Tile({
		source: new ol.source.XYZ({
			url: pslurl + "/EzMap?Service=getImage&Type=RGB&ZoomOffset=0&Col={x}&Row={y}&Zoom={z}&v=0.3",//&key=8ab0816e4d503995014d51b8f0d503ec",
			projection:projection
			
		})
	});
	
	map.addLayer(pGisLayer);
	
	var view = new ol.View({
		projection: 'EPSG:4326',
		center: [centerX, centerY],
		zoom: pMapInitLevel,
		minZoom: pMapInitLevel,
		maxZoom: pgis_MapMaxLevel*1
	});
	
	map.setView(view);
	
	

}











