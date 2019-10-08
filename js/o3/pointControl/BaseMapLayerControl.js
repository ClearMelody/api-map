//地图图层控制提取类(后台数据聚合后的展示,皆可用此类,例子在最后
var BaseMapLayerControl=function(){
	this.init.apply(this,arguments);
}
BaseMapLayerControl.prototype={
	_BaseMapLayerControl : null,
	optionsMap : new HashMap(),
	moveFuncMap : new HashMap(),
    /**
     * 初始化,全部参数说明
     * options.map						地图对象
     * options.layerMark				图层标记,如监控点:firstCls,电子围栏:elecFence
     * options.layerName				图层名称,要与工具栏名称一致,如监控点,电子围栏
     * options.setLayerVisibleZoom		设置隐藏图层,小于此图层则不显示k
     * options.layerVisible				图层默认显示与隐藏参数
     * options.url						查询图层数据的url,其返回结果一定要是new Result(List<ClusterFeatureEle<? extends MapPoint>>)
     * options.getSingleLayerMarker		获得没有参与聚合的点的对象,用于添加图层
     * options.getClusterLayerMarker	获得聚合点的对象,用于添加图层
     * options.clusterLayerClick		聚合图层的单击事件
     * options.singleLayerClick			没有参与聚合点的单击事件
     * options.singleLayerDblClick		没有参与聚合点的双击事件
     */
	init : function(options){
		if(!options || !options.map || !options.layerMark || !options.layerName){
			return;
		}
		//初始化参数
		_BaseMapLayerControl=this;
        if (!window.map) {
            window.map = options.map;
        }
		options.clusterLayer=options.layerMark+"ClusterLayer";
		options.singleLayer=options.layerMark+"SingleLayer";
        if(top.gisLayerConfigMap.get(options.layerName)){
	    	options.layerInfo = top.gisLayerConfigMap.get(options.layerName);
	    	options.min_layerResolution = layerInfo.min_resolution;
	    	options.max_layerResolution = layerInfo.max_resolution;
        }
        if(!options.setLayerVisibleZoom){
        	options.setLayerVisibleZoom=12;
        }
        _BaseMapLayerControl.optionsMap.put(options.layerMark,options);
        var moveFunc = null;
        if(_BaseMapLayerControl.moveFuncMap.get(options.layerMark)){
        	moveFunc = _BaseMapLayerControl.moveFuncMap.get(options.layerMark);
        	options.map.un("moveend",moveFunc);
        }
        moveFunc = function(evt){
        	setTimeout(function(){
        		_BaseMapLayerControl.showPointsOnMap(options);
        	},100);
        }
        _BaseMapLayerControl.moveFuncMap.put(options.layerMark,moveFunc);
	    options.map.on("moveend",moveFunc);
    	setTimeout(function(){
    		_BaseMapLayerControl.showPointsOnMap(options);
    	},100);
	},
    //在地图上显示数据信息
    showPointsOnMap : function(options){
    	if(_BaseMapLayerControl.canShowLayer(options)==false){
    		//不显示图层时,清除当前图层
			window.gisInteraction.clearMarkers(options.clusterLayer);
			window.gisInteraction.clearMarkers(options.singleLayer);
    		return;
    	}
		jQuery.ajax({
			type : "post",
			url : options.url,
			data : _BaseMapLayerControl.getOlClusterParam(options),
			success:function(data){
				var content=JSON.parse(data);
				if(!content || content == "undefined" || content.status == 1){
					return;
				}
				window.gisInteraction.clearMarkers(options.clusterLayer);
				window.gisInteraction.clearMarkers(options.singleLayer);
				var jsobj = content.resp;
				var singleFeatureList = [];//单个点的集合
				var clusterFeatureList = [];//聚合点集合
				for(var i=0;i<jsobj.length;i++){
					if(jsobj[i].size<2){//单个
						var obj = jsobj[i].oneFeature;
						var maker=options.getSingleLayerMarker(obj);
						singleFeatureList.push(maker);
					}else{
						var arr = jsobj[i].includeFeatures;
						var maker=options.getClusterLayerMarker(jsobj[i],arr);
						clusterFeatureList.push(maker);
					}
				}
	 			window.gisInteraction.addMarkers(options.singleLayer, singleFeatureList,function(arr){
	 				if(options.singleLayerClick){
		 				options.singleLayerClick(arr);
		 			}
	 			},function(arr){
	 				if(options.singleLayerDblClick){
	 					options.singleLayerDblClick(arr);
	 				}
	 			});
	 			window.gisInteraction.addBSMarkers(options.clusterLayer, clusterFeatureList,function(arr){
	 				_BaseMapLayerControl.clickCluster(arr,options);
	 			});
			}
		});
    },
    /**
	 * 聚合点点击事件
	 */
	clickCluster : function(arr,options){
		if(!arr || arr.length==0){
			return;
		}
		if(arr[0].size>20){
			options.map.getView().setZoom(options.map.getView().getZoom()+1);
			window.gisInteraction.clearPopup();
		}else{
			if(options.clusterLayerClick){
				var obj=arr[0].includeFeatures;
				var cor = [obj.centerLon ,obj.centerLat];
				options.clusterLayerClick(cor,obj.features);
			}
		}
	},
    //获得地图参数(左上角经纬度,右下角经纬度,及是否最大图层,聚合距离)
    getOlClusterParam : function (options){
    	var mapSize=options.map.getSize();
		var extent = options.map.getView().calculateExtent(mapSize);
    	var leftTopPos = _prjFuns.map_to_gps84(extent[0], extent[1]);
    	var rightBottom = _prjFuns.map_to_gps84(extent[2], extent[3]);
		var currentExtent = options.map.getView().calculateExtent(mapSize);
		var pos1 = [currentExtent[0],currentExtent[1]];
		var pos2 = [currentExtent[2],currentExtent[3]];
		pos1 = ZT.Utils.transformOffToESPG(pos1);
		pos2 = ZT.Utils.transformOffToESPG(pos2);
		currentExtent[0] =  pos1[0];
		currentExtent[1] =  pos1[1];
		currentExtent[2] =  pos2[0];
		currentExtent[3] =  pos2[1];
		
		var width = currentExtent[3] - currentExtent[1];
		var height = currentExtent[0] - currentExtent[2];
		var minx = currentExtent[0];// - width * 2;
		var maxx = currentExtent[2];// + width * 2;
		var miny = currentExtent[1];// - height * 2;
		var maxy = currentExtent[3];// + height * 2;
		var currentZoom = 18 - options.map.getView().getZoom(); //离线地图分辨率
		if(clientGISKind==clientGISKinds.ARCGIS){  //ARCGIS分辨率
			currentZoom = options.map.getView().getZoom();
		}
		var distance = 500*resolutionArray[currentZoom];
		if(clientGISKind==clientGISKinds.ARCGIS){
			if(options.map.getView().getZoom() >= 18){  //ARCGIS最大级别是让所有点都散开
				distance = 5 * resolutionArray[currentZoom];
			}
		} else{
			if(options.map.getView().getZoom() == 18){  //其他地图（离线地图）最大级别是让所有点都散开
				distance = 5　* resolutionArray[currentZoom];
			}
		}
		var ismaxzoom=2;
		var maxZoom=_BaseMapLayerControl.getMapMaxZoom();
		if(options.map.getView().getZoom()==maxZoom){
			ismaxzoom=1;
		}
		return {
			"minx":minx,
			"maxx":maxx,
			"miny":miny,
			"maxy":maxy,
			"currentZoom":currentZoom,
			"distance":distance,
			"ismaxzoom":ismaxzoom
		};
	},
	//获得地图最大图层
	getMapMaxZoom : function(){
		var maxZoom=$("#pgis_MapMaxLevel").val()*1;
		if(!maxZoom){
			maxZoom=$("#arcgis_MapMaxLevel").val()*1;
		}
		if(!maxZoom){
			maxZoom=$("#offline_max_level").val()*1;
		}
		return maxZoom ;
	},
	//此为图例中勾选事件调用
    showLayer : function(layerMark,visible){
    	var options=_BaseMapLayerControl.optionsMap.get(layerMark);
    	if(options.clusterLayer){
    		window.gisInteraction.setLayerVisible(options.clusterLayer, visible);
    		window.gisInteraction.setLayerVisible(options.singleLayer, visible);
		}
        _BaseMapLayerControl.optionsMap.get(layerMark).layerVisible = visible;
        if (visible) {
            _BaseMapLayerControl._setLayerVisible(layerMark);
        }
    },
    _setLayerVisible: function (layerMark) {
    	var options=_BaseMapLayerControl.optionsMap.get(layerMark);
        if(options.layerVisible){
			window.gisInteraction.setLayerVisible(options.clusterLayer, true);
			window.gisInteraction.setLayerVisible(options.singleLayer, true);
    	} else {
    		window.gisInteraction.setLayerVisible(options.clusterLayer, false);
    		window.gisInteraction.setLayerVisible(options.singleLayer, false);
    	}
    },
    //判断是否显示图层,true:显示,false:不显示
    canShowLayer : function(options){
    	var res=false;
        var zoom = options.map.getView().getZoom();
        //如果有全局配置
    	if(options.layerInfo){
    		//在显示范围内
        	if (zoom >= options.min_layerResolution && zoom <= options.max_layerResolution && options.layerVisible) {
    			res=true;
        	} else {
        		res=false;
        	}
        }else{
        	//图层号小于设置的zoom值,不显示图层
        	if (zoom >= options.setLayerVisibleZoom && options.layerVisible) {
				res=true;
        	} else {
        		res=false;
        	}
        }
        return res;
    },
	CLASS_NAME : "BaseMapLayerControl"
};

//例子:
//var FirstClassLayerControl = function () {
//    this.init.apply(this, arguments);
//};
//
//FirstClassLayerControl.prototype = {
//    _FirstClassLayerControl : null,
//    baseMapLayerControl : null,
//    popupId : null,
//    pointArr : [],
//    layerMark : "firstCls",
//    init: function (map,isFaceLayer) {
//        _FirstClassLayerControl = this;
//        _FirstClassLayerControl.baseMapLayerControl=new BaseMapLayerControl({
//            map : map,
//            layerMark : _FirstClassLayerControl.layerMark,
//            layerName : "监控点",
//            setLayerVisibleZoom : 11,
//            layerVisible : true,
//            url : "getFirstClassPointOlClusterView.do",
//            getSingleLayerMarker : _FirstClassLayerControl.getSingleLayerMarker,
//            getClusterLayerMarker : _FirstClassLayerControl.getClusterLayerMarker,
//            clusterLayerClick : _FirstClassLayerControl.clusterLayerClick,
//            singleLayerClick : _FirstClassLayerControl.singleLayerClick,
//            singleLayerDblClick : _FirstClassLayerControl.singleLayerDblClick
//        });
//    },
//    //1.必须方法之单个点图层双击事件
//    singleLayerDblClick : function(arr){
//    
//    },
//    //2.必须方法之单个点图层单击事件
//    singleLayerClick : function(arr){
//    
//    },
//    //3.必须方法之聚合图层单击事件,列表内容小于20
//    clusterLayerClick : function(coordinate,features){
//    
//    },
//    //4.必须方法之获得聚合图层对象
//    getClusterLayerMarker : function(obj,arr){
//    
//    },
//    //5.必须方法之获得单个点图层对象
//    getSingleLayerMarker : function(obj){
//    
//    },
//    //6.必须方法之显示图层,固定写法
//    showLayer : function(visible){
//        _FirstClassLayerControl.baseMapLayerControl.showLayer(_FirstClassLayerControl.layerMark,visible);
//    },
//    //7.必须方法之设置图层的显示与隐藏,固定写法
//    _setLayerVisible: function () {
//        _FirstClassLayerControl.baseMapLayerControl._setLayerVisible(_FirstClassLayerControl.layerMark);
//    },
//    CLASS_NAME: "FirstClassLayerControl"
//};