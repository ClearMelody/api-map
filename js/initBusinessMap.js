/**
 * @(#)initMap.js
 * 
 * @description: 公用初始化地图
 * @author: 
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
 (function($){
	/**
	 * 基于Jquery对象 扩展
	 */
    $.fn.initMap = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(
                    arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.initMap');
        }
    };
    /**
     * 全局设置
     */
    $.fn.initMap._default = {
        initMapZoom : null,                         //不传默认读取数据库配置级别
		initCenter : null, //[114.256,30.2565],          //不传默认读取数据库配置中心点
		scaleLine : true,                        //是否显示比例尺   默认显示
		mousePosition : true,                    //是否显示鼠标所在经纬度位置   默认显示
		onLoadMapSuccess : function(map){},      //载入完地图执行的回调函数
		onBeforeLoad : function(){},             //加载地图之前执行的函数  可用于对地图的css初始化
		onClickMap : function(evt){},            //单击地图回调函数  也可通过返回o3的map对象自己重写方法
		onDblClickMap : function(evt){},         //双击地图回调函数也可通过返回o3的map对象自己重写方法
		mapMoveStart : function(map,bound){},    //地图开始拖动回调函数map 为o3地图对象 ，bound 为地图可见区域的边界
		mapMoveEnd : function(map,bound){}       //地图拖动,放大,缩小之后回调函数
	} 
    /**
     * 公有函数 供外部调用
     */
    var methods = {
    	targetDom : null,
    	options : null,
    	clientGISKind : null,
    	init : function(options){
    	   options = $.extend($.fn.initMap._default,options);
    	   methodsDefault.options = options;
    	   methodsDefault.extendProperty();
    	   methodsDefault.targetDom = $(this);
    	   methodsDefault.callBackFunction(options);
    	   methodsDefault.queryGisParams();
    	},
    	extendProperty : function(){
    		String.prototype.endWith=function(str){
				  if(str == null||str == "" || this.length == 0 || str.length > this.length)
				     return false;
				  if(this.substring(this.length - str.length) == str)
				     return true;
				  else
				     return false;
				  return true;
			}
    	},
    	callBackFunction : function(options){
    		if(options.onBeforeLoad && typeof(options.onBeforeLoad) == "function"){
    			options.onBeforeLoad.call();
    		}
    	},
    	initMapConfig :　function(options){
    		var _this = this;
    		window.arcgisDeltaZoom = 0;
    		var targetId = $(this.targetDom).attr("id","map"+Math.floor( Math.random()*1000000)).attr("id");
    		window.clientGISKind = $("#gisKindInput").val();
    		top.window.gisType = window.clientGISKind;
    		if (window.clientGISKind == window.clientGISKinds.PGIS) {
	            window.resolutionArray =window.fetchPgisResolutions();
	        } else if (window.clientGISKind == window.clientGISKinds.FHGIS) {
	            window.resolutionArray = window.fetchFHgisResolutions();
	        } else if (window.clientGISKind == window.clientGISKinds.ARCGIS) {
	            window.resolutionArray = window.fetchArcgisResolutions();
	        } else if (window.clientGISKind == window.clientGISKinds.OFFLINEGIS) {
	            window.resolutionArray = window.fetchOfflineResolutions();
	        }
	        window.map = new ol.Map({
	            target: targetId,
	            interactions: ol.interaction.defaults({ doubleClickZoom: false }),
	            controls: []
	        });
	        //配置地图
	        if (window.clientGISKind == window.clientGISKinds.PGIS) {
	            window.configLoadPgisLayers(window.map);
	        } else if (window.clientGISKind == window.clientGISKinds.ARCGIS) {
	            window.configLoadArcgisLayers(window.map)
	        } else if (clientGISKind == clientGISKinds.FHGIS) {
	            window.configLoadFHgisLayers(window.map);
	        } else if (clientGISKind == clientGISKinds.OFFLINEGIS) {
	            window.configLoadOfflineLayers(window.map);
	        }
	        if(_this.options.scaleLine){
		        var scaleLineControl = new ol.control.ScaleLine();
		        window.map.addControl(scaleLineControl);
	        }
		    if(_this.options.mousePosition){
		    	var mousePositionControl = new ol.control.MousePosition({
					coordinateFormat: function (coord) {
		                var coord = window.ZT.Utils.gcj02_To_Gps84(coord[0], coord[1]);
		                var stringifyFunc = ol.coordinate.createStringXY(4);
		                var out = stringifyFunc(coord);
		                return out;
		            },
		            projection: 'EPSG:4326',
		            className: 'custom-mouse-position',
		            target: document.getElementById('mouse-position'),
		            undefinedHTML: '&nbsp;'
				});	
			    map.addControl(mousePositionControl);
		    }
		    if(_this.options.initMapZoom){
		    	map.getView().setZoom(_this.options.initMapZoom);
		    }
		    window.map.on("dblclick",function(evt){
		    	if(options.onDblClickMap && typeof(options.onDblClickMap) == "function"){
		    		options.onDblClickMap.call(_this.map,evt);
		    	}
				var coordinate = evt.coordinate;
				var interactions = map.getInteractions();
				for (var i = 0; i < interactions.getLength(); i++) {
				    var interaction = interactions.item(i);                          
				    if (interaction instanceof ol.interaction.DoubleClickZoom) {
				       if(window.dbclicInteraction){
							map.removeInteraction(dbclicInteraction);
						}
				        break;
				    }
				}
				if(window.dbclicInteraction){
					window.map.addInteraction(dbclicInteraction);
				}
			});
		    window.map.on("moveend",function(evt){
				if(options.mapMoveEnd && typeof(options.mapMoveEnd) == "function"){
		    		options.mapMoveEnd.call(_this.map,evt);
		    	}
		    });
		    if(options.onLoadMapSuccess && typeof(options.onLoadMapSuccess) == "function"){
    			setTimeout(function(){
    				options.onLoadMapSuccess.call(this,window.map);
				},10);
    		}
    	},
    	queryGisParams : function(){
			window.clientGISKind = this.clientGISKind = "OFFLINEGIS";
			this.loadConfigHtml();
    		this.loadJSFile();
    	},
    	loadConfigHtml : function(res){
    		if(this.options.initCenter != null){
	    		res.offline_center = this.options.initCenter;
    		}
    		var html = "";
		    html += '<input type="hidden" id="gisKindInput" value="OFFLINEGIS" />';
		    html += '<input type="hidden" id="offline_url"  value="http://127.0.0.1:8080/roadmap" />';
		    html += '<input type="hidden" id="offline_center"  value="[114.2773,30.5555]" />';
		    html += '<input type="hidden" id="offline_max_level"  value="18" />';
		    html += '<input type="hidden" id="offline_min_level"  value="1" />';
		    html += '<input type="hidden" id="mapUrlPort" value="8080" />';
		    html += '<input type="hidden" id="lon" value="" />';
		    html += '<input type="hidden" id="lat" value="" />';
		    $("body").append(html);
    	},
        loadJSFile : function(){
    		var _this = this;
    		var head = $("head").remove("script[role='reload']");
	        var cssArray = [];
	        cssArray.push("../js/o3/v3.10.0/ol.css");
	        cssArray.push("../js/o3/v3.10.0/olPlus.css");
	        for (var i = 0; i < cssArray.length; i++) {
	            if (this._isIncludeCss(cssArray[i]) == false) {
	            	var link = document.createElement("link");
	            	link.type = "text/css";
	            	link.href = cssArray[i];
	            	link.rel = "stylesheet";
	            	document.head.appendChild(link);
	            }
	        }
	        window.clientGISKinds ={"PGIS":"PGIS","FHGIS":"FHGIS","YANPANNOGIS":"YANPANNOGIS","ARCGIS":"ARCGIS","OFFLINEGIS":"OFFLINEGIS"};
	        var jsArray = [];
	        jsArray.push("../js/o3/v3.10.0/ol.js");
			jsArray.push("../js/o3/v3.10.0/rbush.min.js");
	        jsArray.push("../js/o3/v3.10.0/gisInteraction.js");
        	jsArray.push("../js/o3/pointControl/BaseMapLayerControl.js");
        	jsArray.push("../js/o3/scienceBasalResourcesLayerControl.js");
	        jsArray.push("../js/o3/util/Util_new.js");
	        for (var i = 0; i < jsArray.length; i++) {
	            if (this._isIncludeJs(jsArray[i]) == false) {
	            	$('<script type="text/javascript" src="' + jsArray[i] + '"> <\/script>').appendTo(head);
	            }
	        }
	        jsArray = [];
		    if(this.clientGISKind == window.clientGISKinds.FHGIS){
				jsArray.push("../js/o3/adapter/fhgisadapter/FHgisAdapter.js");
			}
			//pgis
			else if(this.clientGISKind==window.clientGISKinds.PGIS){
				jsArray.push("../js/o3/adapter/pgisadapter/PgisAdapter.js");
			}  
		    //arcgis
			else if(this.clientGISKind==window.clientGISKinds.ARCGIS){
				jsArray.push("../js/o3/adapter/arcgisadapter/ArcgisRestAdapter.js");
			}else if(this.clientGISKind=='OFFLINEGIS'){
				jsArray.push("../js/o3/adapter/offlineadapter/OfflineAdapter_new.js");
			}
        	jQuery.getScript(jsArray[0], function(){
        		  _this.initMapConfig(_this.options);
			});
	    },
	 	_isIncludeCss: function (name) {
	        var es = document.getElementsByTagName('link');
	        for (var i = 0; i < es.length; i++)
	            if (es[i]['href'].endWith(name)) {
	                return true;
	            }
	        return false;
	    },
	    _isIncludeJs: function (name) {
	        var es = document.getElementsByTagName('script');
	        for (var i = 0; i < es.length; i++)
	            if (es[i]['src'].endWith(name)) {
	                return true;
	            }
	        return false;
	    }
   }
    var methodsDefault = methods;
 })(jQuery)


 	