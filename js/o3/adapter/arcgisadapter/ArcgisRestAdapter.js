/**
 * @(#)fhgisadapter.js
 * 
 * @description: Arcgis Adapter
 * @author: 张添 2015/9/24
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */


var arcgisMapInitLevel;
/**
 * 
 * 配置加载arcgis图层
 *
 * */
function configLoadArcgisLayers(mainMap){

	
	
	arcgislurl= $('#arcgis_sl_url').val();
	
//	searchFields = "ADMN_CLASS";
		
	arcgisyxurl= $('#arcgis_yx_url').val();
	
	arcgisMapFullExtent = $('#arcgis_MapFullExtent').val(); 
	arcgisMapInitLevel = $('#arcgis_MapInitLevel').val(); 
	
	arcgisRoadLayerIndex = $('#arcgis_LayerIdIndex').val();
	
	if(arcgisMapInitLevel){
		arcgisMapInitLevel = parseInt(arcgisMapInitLevel);
	}

	var fullExtentArr = eval(arcgisMapFullExtent);
	var centerX = (fullExtentArr[0]+fullExtentArr[2])/2;
	var centerY = (fullExtentArr[1]+fullExtentArr[3])/2;
	 
	
	// 定义2维图层
//	arcGisLayer = new ol.layer.Tile({
//		source: new ol.source.TileArcGISRest({
//			url: arcgislurl
//		})
//	});
	
	var projection = ol.proj.get('EPSG:4326');
	var m = [0,1,2,3,4,5,6,7,8,9];
	arcGisLayer = new ol.layer.Tile({
		source: new ol.source.WMTS({
			url: arcgislurl + "/WMTS",
			format: 'image/png',
			matrixSet: 'EPSG:4326',
			projection: projection,
			tileGrid: new ol.tilegrid.WMTS({
				origin: [-400,400],//ol.extent.getTopLeft(projectionExtent),
				resolutions: resolutionArray,
				matrixIds: m
			}),
			style: 'default',
			crossOrigin:'anonymous',
			wrapX: true
		})

	});

	map.addLayer(arcGisLayer);
	
	if(arcgisyxurl != "http://127.0.0.1/arcgis/rest/services/MapServer"){
		arcGisLayerImage = new ol.layer.Tile({
			source: new ol.source.TileArcGISRest({
				url: arcgisyxurl
			})
		});
//		arcGisLayerImage = new OpenLayers.Layer.ArcGIS93Rest( "ArcGisLayerImage",
//			arcgisyxurl + "/export", 
//			{layers: "show:0,1,2,3,4,5"});
//		//		{layers: "show:0,1,2,3,4,5"});
		map.addLayer(arcGisLayerImage);
		arcGisLayerImage.setVisible(false);
	}
	
	arcGisRoadLayer = new ol.layer.Tile({
		source: new ol.source.TileArcGISRest({
			url: arcgisroadurl
		})
	});
	map.addLayer(arcGisRoadLayer);
	arcGisRoadLayer.setVisible(false);
	
	var view = new ol.View({
		extent : [113.5,30.0,115.5,31.2],
		projection: 'EPSG:4326',
		resolutions:resolutionArray,
		center: [centerX, centerY],
		zoom: arcgisMapInitLevel
	})
	map.setView(view);
	
	map.getView().fit(eval(arcgisMapFullExtent),map.getSize())
	
	currentZoom = arcgisMapInitLevel;

}



/**
 * 取出fhgis的分辨率数组
 *
 * */
function fetchArcgisResolutions(){
	
//	var resArr = [0.000001341104507446289,// 15
//					0.000002682209014892578,   // 14
//					0.000003814418029785156,  // 13											
//					0.000007628536059570312, // 12											
//					0.000015257672119140625,// 11
//											
//					0.00003051534423828125,// 10 
//					0.0000610306884765625,//  9 
//					0.000121661376953125,//  8 
//					0.00024332275390625,// 7 
//					0.0004866455078125,//  6 
//					
//					0.000953291015625,//  5 
//					0.00174658203125,// 4 
//					0.0054931640625,// 3
//					0.010986328125,// 2 
//					0.02197265625,// 1 
//					0.0439453125 // 0
//			]
	
	//arcgis old
	var res = [0.0018310621693923973,
				9.155310846962366E-4,
				4.5776554234807406E-4,
				2.288827711740844E-4,
				1.144413855870422E-4,
				5.72206927935211E-5,
				2.861034639671392E-5,
				 1.430517319835696E-5,
				 7.152586599225016E-6,
				 3.5762932995659225E-6,
				 1.788142072141633E-6];
	
	//arcgis new 12.30
	var res =[0.0013732910156308094,
	          6.866455078154049E-4,
	          3.433227539077023E-4,
	          1.7166137695385117E-4,
	          8.583068847692559E-5,
	          4.2915344238462806E-5,
	          2.1457672119231403E-5,
	          1.0728836059615698E-5,
	          5.364418029807849E-6
//	          5.364418029807849E-6/2
	          ];
	
	return res;
	
}