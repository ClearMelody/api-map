/**
 * @(#)OfflineAdapter.js
 * 
 * @description: Offline Adapter
 * @author: 肖振亚 2016/07/19
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */

function configLoadOfflineLayers(map,from,initLevl){
	var offline_url = $('#offline_url').val();
	var offline_23D = $('#offline_23D').val();
	if(!offline_23D){
		offline_23D = '2';
	}
	var offline_center= $('#offline_center').val();
	var offline_min_level = $('#offline_min_level').val();
	var offline_max_level = $('#offline_max_level').val();
	var OfflineMapInitLevel;
	if($('#OfflineMapInitLevel').val()){
		 OfflineMapInitLevel = $('#OfflineMapInitLevel').val();
	}else{
		if(initLevl){
			OfflineMapInitLevel = initLevl;
		}else{
			 OfflineMapInitLevel = 15;
		}
	}

	if('addressMap' == from){//地址库
//		var center = ol.proj.transform([114.21596533125518,30.60113621779453],'EPSG:4326', 'EPSG:3857');
		var center = ol.proj.transform(eval(offline_center),'EPSG:4326', 'EPSG:3857');
		maxLevel = offline_max_level;
	}else{
		var center = ol.proj.transform(eval(offline_center),'EPSG:4326', 'EPSG:3857');
	}
	var prefix = window.location + "";
    var index = prefix.indexOf("/", 7);
    prefix = prefix.substring(0, index + 1);
	var offlineLayer2D =  new ol.layer.Tile({
		id: "offlineBaseLayer",
		// source: new ol.source.XYZ({
		// 	//urls: ['http://10.1.111.132:9090/mapabc/roadmap/{z}/{x}/{y}.png'],
		// 	// 瓦片路径函数
		// 	tileUrlFunction: function (tileCoord, pixelRatio, proj) {
		// 		// 缩放级别
		// 		var z = zeroPad(tileCoord[0], 2, 10);
		// 		// 瓦片行号
		// 		var x = zeroPad(tileCoord[1], 8, 16);
		// 		// 瓦片列号
		// 		var y = zeroPad(-tileCoord[2] - 1, 8, 16);
		// 		// 瓦片本地路径
		// 		return offline_url+"/" ".png";
		// 	},
		// 	projection: 'EPSG:3857',
		// 	minZoom: offline_min_level *1,
		// 	maxZoom: offline_max_level *1,
		// 	tilePixelRatio: 1
		//
		// })
		source: new ol.source.XYZ({
//			urls: [prefix+'mapabc/roadmap/{z}/{x}/{y}.png'],
			urls: [offline_url + '/{z}/{x}/{y}.png'],
			minZoom: offline_min_level *1,
			maxZoom: offline_max_level *1,
			tilePixelRatio: 1
		})
	});
	var offlineLayer3D =  new ol.layer.Tile({
		id: "offlineBaseLayer",
		source: new ol.source.XYZ({
			//urls: ['http://10.1.111.132:9090/mapabc/roadmap/{z}/{x}/{y}.png'],
			// 瓦片路径函数
			tileUrlFunction: function (tileCoord, pixelRatio, proj) {
				// 缩放级别
				var z = zeroPad(tileCoord[0], 2, 10);
				// 瓦片行号
				var x = zeroPad(tileCoord[1], 8, 16);
				// 瓦片列号
				var y = zeroPad(-tileCoord[2] - 1, 8, 16);
				// 瓦片本地路径
				return offline_url+"/"+"_alllayers3D"+"/" + "L" + z + "/" + "R" + y + "/" + "C" + x + ".png";
			},
			projection: 'EPSG:3857',
			minZoom: offline_min_level *1,
			maxZoom: offline_max_level *1,
			tilePixelRatio: 1
		})
	});
	
	window.offlineLayer2D = offlineLayer2D;
	window.offlineLayer3D = offlineLayer3D;
	map.addLayer(offlineLayer2D);
	map.addLayer(offlineLayer3D);
	
	if(offline_23D == 2){
		offlineLayer2D.setVisible(true);
		offlineLayer3D.setVisible(false);
	}else if(offline_23D == 3){
		offlineLayer2D.setVisible(false);
		offlineLayer3D.setVisible(true);
	}

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
	bind3DMapSwitch();
}

function bind3DMapSwitch(){
	var html = _get3DSwitcherHtmlTemplate();
	$("div[alias='mapOut']").append(html);
	$("#gis_switching_but").unbind("click").bind("click",function(){
    	var _this = $(this);
    	var v23D = _this.attr('v23D');
    	if(v23D == 2){
    		$('#offline_23D').val('3');
    		_this.attr('v23D','3');
    		_this.attr('title','平面');
    		_this.css("background-position","0px -42px");
    		window.offlineLayer2D.setVisible(false);
    		window.offlineLayer3D.setVisible(true);
    		
    	}else if(v23D == 3){
    		$('#offline_23D').val('2');
    		$(this).attr('v23D','2');
    		$(this).attr('title','三维');
    		_this.css("background-position","0px 0px");
    		window.offlineLayer2D.setVisible(true);
    		window.offlineLayer3D.setVisible(false);
    	}
    });
}

function _get3DSwitcherHtmlTemplate() {
	var v23D = $('#offline_23D').val();
	var title = "三维";
	var position = "0px 0px";
	if(!v23D){
		v23D = '2';
	}else if(v23D == '3'){
		title = "平面";
		position = "0px -42px";
	}
    var html = '<div id="3DSwitcherContainer" class="ol-control" style="position: absolute; top: 70px; right: 20px;width: 48px;height: 48px; display: block;">'
        + '			 <div id="gis_switching_but" v23D="'+v23D+'" title="'+title+'" style="cursor:pointer;margin: 2px;width:42px;height:42px; right:10px; z-index:100000;color: #FFFFFF;border: 1px solid #efeaea;background-image: url(resource/images/pageIcon/map_switching.png);background-position: '+position+';">   '
        + '				'
        +'			 </div>'
        + '</div>';
    return html;
}

 // 进制转换并补齐Arcgis Server目录和名称前面的0
function zeroPad(num, len, radix) {
	var str = num.toString(radix || 10);
	while (str.length < len) {
		str = "0" + str;
	}
	return str;
}



/**
 * 取出fhgis的分辨率数组
 *
 * */
function fetchOfflineResolutions(){

	var resArr = [
	              0.000001341104507446289,// 15
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
	      		0.0439453125, // 0
	      		0.08789062499442316,
	      		0.1757812499888463
	      		];
		return resArr;
}

