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
 
 var pGISPslUrl="";
 
function fetchPgisResolutions(){
	var pMapMaxLevel = $('#pgis_MapMaxLevel').val(); 
	if(pMapMaxLevel){
		pMapMaxLevel = parseInt(pMapMaxLevel);
	} 
	var reso=[
						2.0,
						1.0,
						0.5,
						0.25,
						0.125,
						0.0625,
						0.03125,
						0.015625,
						0.0078125,
						0.00390625,
						0.001953125,
						0.0009765625,
						0.00048828125,
						0.000244140625,
						0.0001220703125,
						0.00006103515625,
						0.000030517578125,
						0.0000152587890625,
						0.00000762939453125,
						0.000003814697265625,
						0.0000019073486328125,
						0.00000095367431640625,
						0.000000476837158203125];
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
	pGISPslUrl=pslurl;
	
	var pMapFullExtent = $('#pgis_MapFullExtent').val(); 
	var pMapInitLevel = $('#pgis_MapInitLevel').val(); 
	var pgis_MapMaxLevel = $('#pgis_MapMaxLevel').val()*1+1;
	
	if(pMapInitLevel){
		pMapInitLevel = parseInt(pMapInitLevel);
	}

	var fullExtentArr = eval(pMapFullExtent);
	var centerX = (fullExtentArr[0]+fullExtentArr[2])/2;
	var centerY = (fullExtentArr[1]+fullExtentArr[3])/2;
	 
	var projection = ol.proj.get('EPSG:4326');	
	var resolutions=fetchPgisResolutions();
	var tileSize=256;
	var lyr = new ol.layer.Tile({
		source: new ol.source.XYZ({
			// url: pslurl+"/EzMap?Service=getImage&Type=RGB&Col=226&Row=69&Zoom=10&V=0.3",
			tileSize: tileSize,
            tileUrlFunction: _tileUrlFunctionCallBack,
            projection: 'EPSG:4326',
            tileGrid: new ol.tilegrid.TileGrid({
                resolutions: resolutions,
                tileSize: tileSize,
                origin:[0,0]
		    })
		})
	});
	
	// var pGisLayer = new ol.layer.Tile({
		// source: new ol.source.XYZ({
			// url: pslurl + "/EzMap?Service=getImage&Type=RGB&Col={x}&Row={y}&Zoom={z}&v=0.3",
			// projection: 'EPSG:4326'
		// })
	// });
	
	map.addLayer(lyr);
	var view = new ol.View({		
		center: [centerX,centerY],
		//center: [114.2987,30.6057],
		zoom: pMapInitLevel*1,
		minZoom: 0,
		maxZoom: pgis_MapMaxLevel*1,
		projection: 'EPSG:4326',
		resolutions: resolutions
	});	
	map.setView(view);
}

function _tileUrlFunctionCallBack(tileCoord, pixelRatio, projection) {
        var z = tileCoord[0];
        var x = tileCoord[1];
        var y = tileCoord[2];
		var urlTemplate=pGISPslUrl+"/EzMap?Service=getImage&Type=RGB&Col={x}&Row={y}&Zoom={z}&V=0.3";
        var url = urlTemplate.replace('{z}', z.toString());
        url=url.replace('{x}', x.toString());
	    url=url.replace('{y}', y.toString());
        return url
    }











