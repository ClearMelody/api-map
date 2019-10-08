var PersonKuLayerControl = function () {
    this.init.apply(this, arguments);
};
PersonKuLayerControl.prototype = {
	_PersonKuLayerControl : null,
   	baseMapLayerControl : null,
    popupId : null,
    pointArr : [],
    layerMark : "personKu",
    init: function (map,isFaceLayer) {
    	_PersonKuLayerControl = this;
    	_PersonKuLayerControl.initMustJsFile();
    	_PersonKuLayerControl.initMustHtml();
    	
        _PersonKuLayerControl.baseMapLayerControl=new BaseMapLayerControl({
            map : map,
            layerMark : _PersonKuLayerControl.layerMark,
            layerName : "人员库",
            layerVisible : true,
            setLayerVisibleZoom : 12,
            url : _PersonKuLayerControl.getPersonKuQueryUrl(),
            getSingleLayerMarker : _PersonKuLayerControl.getSingleLayerMarker,
            getClusterLayerMarker : _PersonKuLayerControl.getClusterLayerMarker,
            clusterLayerClick : _PersonKuLayerControl.clusterLayerClick,
            singleLayerClick : _PersonKuLayerControl.singleLayerClick,
            singleLayerDblClick : _PersonKuLayerControl.singleLayerDblClick
        });
    },
    queryPersonKuLayers : function(){
    	_PersonKuLayerControl.baseMapLayerControl.init({
            map : window.map,
            layerMark : _PersonKuLayerControl.layerMark,
            layerName : "人员库",
            layerVisible : true,
            setLayerVisibleZoom : 12,
            url : _PersonKuLayerControl.getPersonKuQueryUrl(),
            getSingleLayerMarker : _PersonKuLayerControl.getSingleLayerMarker,
            getClusterLayerMarker : _PersonKuLayerControl.getClusterLayerMarker,
            clusterLayerClick : _PersonKuLayerControl.clusterLayerClick,
            singleLayerClick : _PersonKuLayerControl.singleLayerClick,
            singleLayerDblClick : _PersonKuLayerControl.singleLayerDblClick
        });
    },
    getPersonKuQueryUrl : function(){
    	var url = "getPersonKuOlClusterView.do";
    	if(_PersonKuList){
    		url += "?pageFrom=personKu";
    		url += _PersonKuList.getQueryParam();
    	}
    	return url;
    },
    //1.必须方法之单个点图层双击事件
    singleLayerDblClick : function(arr){
    	showFocalmanOnMapMsg(arr[0]);
    },
    //2.必须方法之单个点图层单击事件
    singleLayerClick : function(arr){
    	showFocalmanOnMapMsg(arr[0]);
    },
    initMustHtml : function(){
    	//最新动态的
    	if($("#latestDynamic").html() && $("#latestDynamic").html().length>0){
    		return;
    	}
    	var html='';
    	html+='<input type="hidden" id="selectSfzh" value=""/>';
    	html+='<input type="hidden" id="selectXm" value=""/>';
    	html+='<div class="GPoliceListBox slantLineBg" id="latestDynamic" style="top:70px; right:auto; right:300px; width:415px;z-index:98;display:none;">';
    	html+='		<div class="GTitle01">';
    	html+='				<div class="GPoliceListCloseBox">';
    	html+='					<a href="javascript:void(0);" target="dynamicAdd" class="GPoliceListAdd" title="新增"></a>';
    	html+='					<a href="javascript:void(0);" target="dynamicClose" class="GPoliceListClose" title="关闭"></a> ';
    	html+='				</div>';
    	html+='		</div>';
    	html+='		<div target="dynamicContent" style="overflow: auto;">';
    	html+='				<div class="curbTimeLine" target="curbTimeLine">';
    	html+='				</div>';
    	html+='		</div>';
    	html+='		<div class="GPoliceListBox_j01"></div>';
    	html+='		<div class="GPoliceListBox_j02"></div>';
    	html+='		<div class="GPoliceListBox_j03"></div>';
    	html+='		<div class="GPoliceListBox_j04"></div>';
    	html+='		<div class="GPoliceListBox_Line"></div>';
    	html+='</div>';
    	html+='<div id="dynamic_images"></div>';
    	$("body").append(html);
    	$("#latestDynamic").height($(window).height()-61-40-20);
    	$("div[target='dynamicContent']").height($(window).height()-61-40-20-30);
    },
    //加载必须的js文件
    initMustJsFile : function(){
        var head = $("head").remove("script[role='reload']");
        var cssArray = [];
        cssArray.push("resource/vbds/comm/css/jquery.jqzoom.css");
        cssArray.push("resource/vbds/comm/css/jquery.carbox.css");
        for (var i = 0; i < cssArray.length; i++) {
            if (this._isIncludeCss(cssArray[i]) == false) {
            	var link = document.createElement("link");
            	link.type = "text/css";
            	link.href = cssArray[i];
            	link.rel = "stylesheet";
            	document.head.appendChild(link);
            }
        } 
        var jsArray = [];
        jsArray.push("resource/js/wwAnalyseNew/wwAnalyseNew_focalman2Map.js");
        jsArray.push("resource/js/tool/Sptj.js");
        jsArray.push("resource/js/tool/FocalmanBjgj.js");
        jsArray.push("resource/js/zdxlqy/commonInfo.js");
        jsArray.push("resource/js/zdxlqy/pointSpatialQuery.js");
        jsArray.push("resource/js/zdxlqy/popUps.js");
        jsArray.push("resource/vbds/comm/js/jquery.carbox.js");
        jsArray.push("resource/vbds/comm/js/jquery.jqzoom-core.js");
        jsArray.push("resource/vbds/js/common/carboxHandle.js");
        for (var i = 0; i < jsArray.length; i++) {
	        if (_PersonKuLayerControl._isIncludeJs(jsArray[i]) == false) {
	        	$('<script type="text/javascript" src="' + jsArray[i] + '"> <\/script>').appendTo(head);
	        }
        }
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
    },
    //3.必须方法之聚合图层单击事件,列表内容小于20
    clusterLayerClick : function(coordinate,arr){
    	_PersonKuLayerControl.pointArr=arr;
		var lon=0;
		var lat=0;
		var id;
		var html='<div mark="focalmanJH">';
		html+='<div class="NPopUpBox02" style="width:200px;">';
		html+='    <div class="GPUHeader">重点人员列表</div>';
		html+='    <a href="javascript:void(0);" class="NPopUpClose02"></a>';
		html+='    <div class="NPUTwoContent">';
		html+='        <div class="GPUInnerBox">';
		html+='        	<div class="GPUInnerBox_Border">';
		html+='            	<div class="GkkListBox" style="height:200px;">';
		for(var i=0;i<arr.length;i++){
			if(i==0){
				id = arr[i].id;
			   	lon = arr[i].longitude * 1.0;
			   	lat = arr[i].latitude * 1.0;
			}
			var imgSrc = top.window.getZdryIcon(arr[i]);
			html+='<a href="javascript:void(0);" class="GkkListNav" focalmanid="'+arr[i].id+'" lat="'+arr[i].latitude+'" lon="'+arr[i].longitude+'">';
			html+='  <img src="'+imgSrc+'" width="20" height="20">';
			html+=arr[i].xm;
			html+='</a>';
		}
		html+='                </div>';
		html+='            	<div class="GPUInnerBox_Line01"></div>';
		html+='            	<div class="GPUInnerBox_Line02"></div>';
		html+='            </div>';
		html+='        </div>';
		html+='    </div>';
		html+='    <div class="NPopUpBox02_line01"></div>';
		html+='    <div class="NPopUpBox02_line02"></div>';
		html+='    <div class="NPopUpBox02_j01"></div>';
		html+='    <div class="NPopUpBox02_j02"></div>';
		html+='    <div class="NPopUpBox02_j03"></div>';
		html+='    <div class="NPopUpBox02_j04"></div>';
		html+='    <div class="NPopUpBox02_j05"></div>';
		html+='    <div class="NPopUpBox02_j06"></div>';
		html+='</div>';
		html+='</div>';
		window.gisInteraction.clearPopup();
	    window.gisInteraction.showPopup(id, lon, lat, html, false);
	    window.gisInteraction.setCenterLeft(lon, lat);
	    $("div[mark='focalmanJH'] .NPopUpClose02").unbind("click").bind("click",function(e){
	    	$("div[mark='focalmanJH']").replaceWith("");
	    });
	    $(".GkkListNav[focalmanid]").unbind("click").bind("click",function(e){
	    	var focalmanid=$(this).attr("focalmanid");
	    	var lon=$(this).attr("lon");
	    	var lat=$(this).attr("lat");
	    	var focalman=_PersonKuLayerControl.getFocalmanById(focalmanid);
	    	setTimeout(function(){
	    		window.map.getView().setZoom(17);
	    		if(lon && lat){
	    			window.gisInteraction.setPosition(lon*1.0,lat*1.0);
	    		}
	    	},100);
	    	showFocalmanOnMapMsg(focalman);
	    	$("div[mark='focalmanJH']").replaceWith("");
	    });
    },
    getFocalmanById : function(id){
    	var obj={};
    	var arr=_PersonKuLayerControl.pointArr;
    	if(arr){
	    	for(var i=0;i<arr.length;i++){
	    		if(arr[i].id==id){
	    			obj=arr[i];
	    			break;
	    		}
	    	}
    	}
    	return obj;
    },
    //4.必须方法之获得聚合图层对象
    getClusterLayerMarker : function(obj,arr){
   		return {
            id: Math.random()+"",
            name: Math.random()+"",
            lon: obj.lon,
            lat: obj.lat,
            img: 'resource/images/m2.png',
            att: obj,
            clusterSize :obj.size
        };
    },
    getzdryPointStyle: function (number) {
    	var imgSrc = '';
		if(number >0 && number <10){
			imgSrc = 'resource/scienceLayout/images/layerIco/zdry/default/zdryJH_1.png';
		}
		else if(number >9 && number <100){
			imgSrc = 'resource/scienceLayout/images/layerIco/zdry/default/zdryJH_2.png';
		}
		else if(number >99){
			imgSrc = 'resource/scienceLayout/images/layerIco/zdry/default/zdryJH_3.png';
		}
    	return imgSrc;
    },
    //5.必须方法之获得单个点图层对象
    getSingleLayerMarker : function(obj){
    	return {
            id: obj.id,
            name: obj.xm,
            img: top.window.getZdryIcon(obj),
            lon: obj.longitude*1.0,
            lat: obj.latitude*1.0,
            imsi:obj.imsi,
            att: obj
        };
    },
    //6.必须方法之显示图层,固定写法
    showLayer : function(visible){
        _PersonKuLayerControl.baseMapLayerControl.showLayer(_PersonKuLayerControl.layerMark,visible);
    },
    //7.必须方法之设置图层的显示与隐藏,固定写法
    _setLayerVisible: function () {
        _PersonKuLayerControl.baseMapLayerControl._setLayerVisible(_PersonKuLayerControl.layerMark);
    },
    CLASS_NAME: "PersonKuLayerControl"
};