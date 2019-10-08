var BasalResourcesLayerControl = function () {
    this.init.apply(this, arguments);
};

var featureGis = null;  //抓拍检索对象
var alarm = null;       //人脸预警对象
var dbclicInteraction = null;  //地图双击交互
BasalResourcesLayerControl.prototype = {
    map: null,
    mapEleId: "map",
    popupControl: null,
    elecFenceLayerControl: null,
    wifiLayerControl: null,
    communityLayerControl: null,
    carLayerControl: null,
    personKuLayerControl: null,
    firstClassControl: null,
    facePointLayerControl : null,
    hotelLayerControl: null,
    netbarLayerControl: null,
    focalDeptLayerControl: null,
    keyAreaLayerControl: null,
    policeDutyLayerControl: null,
    policeStationFocalManControl: null,
    personClassControl: null,
    personPopupControl: null,
    casePointControl:null,
    jqPointControl:null,
    dzkPointControl:null,
	specialSiteControl:null,
	mgqyAreaControl:null,
    dtGpsControl: null,
    measureControl:null,  //地图工具
    curSearchLayerType : "",
    checkedJKD: new HashMap(),
    checkedWifi : new HashMap(),
    checkedCommunity : new HashMap(),
    checkedCarkk : new HashMap(),
    checkedDZWL : new HashMap(),
    checkedFACE_JKD: new HashMap(),
    txType:"", //作为电子围栏同行分析的标识
    dzwlChecked:"",//以选择的电子围栏数据
    count:0,  //多点碰撞新增一个时间设置行
    pageSize : 10,
    curPage : 1,
    ckxxPageIndex : 1, //常口信息的pageIndex
    ckxxPageSize : 10,
    ckxxExtent : "",
    ckxxSearchType : "",
    dtPopupControl: null,
    recordList : null,   //搜索原始结果数据
    recordTotal : 0,     //搜索结果总条数
    searchRecord : null, //页面加工之后的数据
    mobileSiteLayerControl: null,
    singleInvestigation: null,
    multiInvestigation: null,
    style: {
        MenuSwitcherVisible: true,
        collapse: false,
        defualtShowLayerList: false,
        defualtDockAndAlign: true,
        top: 5,
        right: 5,
        JKD: true,
        carKK: true,
        FACE_JKD : true,
        elecFence: true,
        wifi : true,
        Hotel: true,
        Netbar: true,
        community : true,
        FocalMan: true,
        JZ: false,
        JWT: false,
        Jqcommand_JWT: false,
        DT: false,
        ZRQ: false,
        FocalDept: false,
        keyArea: false,
        AJ : false,
        JQ : false,
		TZCS : false,
        CKXX : false,
        PersonKu : false,
        Jqcommand_JQ : false,
        MGQY : true,
        
        JKD_Checked: true,
        carKK_Checked: true,
        FACE_JKD_Checked: true,
        elecFence_Checked: true,
        wifi_Checked : true,
        Hotel_Checked: false,
        Netbar_Checked: false,
        community_Check : false,
        FocalMan_Checked: false,
        JZ_Checked: false,
        JWT_Checked: false,
        DT_Checked: false,
        ZRQ_Checked: false,
        FocalDept_Checked: false,
        keyArea_Checked: false,
        AJ_Checked : false,
        JQ_Checked : false,
		TZCS_Checked : false,
        Jqcommand_JQ_Checked: false,
        Jqcommand_JWT_Checked: false,
        PersonKu_Checked : false,
        DZK : true,
        DZK_Checked : true,
        MGQY_Checked : false
    },
    layerIds:[],
    checkHandlerDic: {},
    init: function (map, style, txType, dzwlChecked) {
    	top.window.count = this.count;
    	dbclicInteraction = new ol.interaction.DoubleClickZoom();
    	map_singleclick(map);
        this.map = map;
        this.mapEleId = this.map.getTargetElement().id;
        if (style) {
        	//将设置的参数与默认参数进行合并,这样就不需要每个地方都将配置写一次,只用添加自己的,或者屏蔽不用的就可以了
            this.style = $.extend(this.style,style);
        }
        console.log(this.style);
        this.txType = txType;
        this.dzwlChecked = dzwlChecked;
        this._initialOrderLayers();
        this._loadDependentResources();
        var id = "#" + this.mapEleId;
        var topHeight = $(id).offset().top;
        var right = $(window).width() - $(id).width() - $(id).offset().left;
        if (!this.style.defualtDockAndAlign) {
            topHeight += this.style.top;
            right += this.style.right;
        }

        var html = this._getMenuContainerHtmlTemplate();
        if (this.style.collapse) {
            html = html.replace(/display: block/g, "display: none");
        } else {
        	html = html.replace(/top:30px/g, "top: " + (topHeight + 30) + "px");
        }
        $("body").append(html);
//        html = this._getToolListContainerHtmlTemplate();
//        $("body").append(html);
        
        html = this._getFaceToolListContainerHtmlTemplate();
        $("body").append(html);

        html = this._getSearchToolListContainerHtmlTemplate();
        $("body").append(html);
        
        html = this._getLayerListContainerHtmlTemplate();
        if (this.style.defualtShowLayerList) {
            html = html.replace(/display: none/g, "display: block");
        }
        var layerList = ["JKD", "JWT","Jqcommand_JWT", "DT", "ZRQ", "FocalDept", ,"keyArea","FocalMan","FACE_JKD","Hotel", "Netbar", "AJ", "JQ", 'Jqcommand_JQ','wifi','carKK','elecFence','community',"PersonKu","TZCS","CKXX","DZK","MGQY"];
        for (var i = 0; i < layerList.length; i++) {
            var layerId = layerList[i];
            if (!this.style[layerId]) {
                var reg = eval("/display: " + layerId + "/g");
                html = html.replace(reg, "display: none");
                //初始化搜索类型
                $("."+layerId+"_LI").hide();
            }else {
            	this.layerIds.push(layerId);
            }
        }
        //在这里统一加上常口信息，免得要在每个有地图的页面都要加
        this.layerIds.push("CKXX");
        $("body").append(html);

        html = this._getMenuSwitcherContainerHtmlTemplate();
        if (!this.style.MenuSwitcherVisible) {
            html = html.replace(/display: block/g, "display: none");
        }
        if (this.style.collapse) {
            html = html.replace(/»/g, "«");
        }
        html = html.replace(/top: 10px/g, "top: " + (topHeight + 10) + "px");
        html = html.replace(/right: 10px/g, "right: " + (right + 10) + "px");
        $("#menuContainer").append(html);
        
        if ($("#popup").length < 1) {
            html = this._getPopupContainerHtmlTemplate();
            $("body").append(html);
        }

        html = this._getAppToolListContainerHtmlTemplate();
        $("body").append(html);
        
        html = this._getRLZFToolListContainerHtmlTemplate();
        $("body").append(html);

        html = this._getMultiInvestGuidBarHtmlTemplate();
        html = html.replace(/top: 70px/g, "top: " + (topHeight + 70) + "px");
        html = html.replace(/right: 70px/g, "right: " + (right + 70) + "px");
        $("body").append(html);

        html = this._getSingleInvestResultHtmlTemplate();
        $("body").append(html);
        
        html = this._getSingleInvestSelectHtmlTemplate();
        $("body").append(html);

        this._bindEventHandler();

 		if (this.style.carKK_Checked) {
            $("#layerListContainer a[value='carKK']").click();
        }
 		if (this.style.PersonKu_Checked) {
            $("#layerListContainer a[value='PersonKu']").click();
        }
        if (this.style.elecFence_Checked) {
            $("#layerListContainer a[value='elecFence']").click();
        }
        if (this.style.JKD_Checked) {
            $("#layerListContainer a[value='JKD']").click();
        }
        if (this.style.JZ_Checked) {
            $("#layerListContainer a[value='JZ']").click();
        }
        if (this.style.FACE_JKD_Checked) {
        	$("#layerListContainer a[value='FACE_JKD']").click();
        }
        if (this.style.JWT_Checked) {
            $("#layerListContainer a[value='JWT']").click();
        }
        if (this.style.Jqcommand_JWT_Checked) {
            $("#layerListContainer a[value='Jqcommand_JWT']").click();
        }
        if (this.style.DT_Checked) {
            $("#layerListContainer a[value='DT']").click();
        }
        if (this.style.ZRQ_Checked) {
            $("#layerListContainer a[value='ZRQ']").click();
        }
        if (this.style.FocalDept_Checked) {
            $("#layerListContainer a[value='FocalDept']").click();
        }
        if (this.style.keyArea_Checked) {
        	$("#layerListContainer a[value='keyArea']").click();
        }
        if (this.style.FocalMan_Checked) {
            $("#layerListContainer a[value='FocalMan']").click();
        }
        if (this.style.AJ_Checked) {
            $("#layerListContainer a[value='AJ']").click();
        }
        if (this.style.JQ_Checked) {
            $("#layerListContainer a[value='JQ']").click();
        }
		if (this.style.TZCS_Checked) {
            $("#layerListContainer a[value='TZCS']").click();
        }
        if (this.style.Jqcommand_JQ_Checked) {
            $("#layerListContainer a[value='Jqcommand_JQ']").click();
        }
        if (this.style.wifi_Checked) {
            $("#layerListContainer a[value='wifi']").click();
        }
        if (this.style.community_Checked) {
        	$("#layerListContainer a[value='community']").click();
        }
        if (this.style.MGQY_Checked) {
        	$("#layerListContainer a[value='MGQY']").click();
        }
        top.gisInteraction = window.gisInteraction;
        
        //设置搜索框的搜索后弹出的下拉长度
        //解决了BUG编号008433：1366*768屏幕警情研判/案件研判页面全部监控点位列表下方的【实时视频】和【录像回放】按钮显示不全
        $("#searchResultDiv .AssociateList").css("height", $("#map").height()*9/20 + "px");
    },
    showMenuContainer: function (visible) {
        if (visible) {
            $("#menuContainer").show();
        } else {
            $("#menuContainer").hide();
        }
    },
    showMenuSwitcher: function (visible) {
        if (visible) {
            $("#menuSwitcherContainer").show();
        } else {
            $("#menuSwitcherContainer").hide();
        }
    },
    showToolListContainer: function (visible) {
        if (visible) {
            $("#mapToolListContainer").show();
        } else {
            $("#mapToolListContainer").hide();
        }
    },
    showLayerListContainer: function (visible) {
        if (visible) {
            $("#layerListContainer").show();
        } else {
            $("#layerListContainer").hide();
        }
    },
    addLayerNode: function (layerName, checked, checkHandler) {
        var _this = this;
        this.checkHandlerDic[layerName] = checkHandler;
        $("#layerListContainer a[tag='layerNode']").unbind("click").bind("click", function () {
            var value = $(this).attr("value");
            var state = $(this).is(':checked');
            if (_this.checkHandlerDic[value]) {
                _this.checkHandlerDic[value](state);
            }
        });
    },
    updateLayerNodeCheckState: function (layerName, checked) {
        if (checked) {
            $("#layerListContainer a[value='" + layerName + "']").attr("checked", "true");
        } else {
            $("#layerListContainer a[value='" + layerName + "']").removeAttr("checked");
        }
    },
    _resize: function () {
        
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
    _loadDependentResources: function () {
        var _this = this;
        var version = (new Date()).getTime();
        var head = $("head").remove("script[role='reload']");
        var cssArray = [];
        cssArray.push("resource"+top.window.theme+"/js/o3/v3.10.0/ol.css");
        cssArray.push("resource"+top.window.theme+"/js/o3/v3.10.0/olPlus.css");
        cssArray.push("resource"+top.window.theme+"/scienceLayout/css/h5.css");
        cssArray.push("resource"+top.window.theme+"/comm/css/jquery.pagination.css");
        cssArray.push("resource"+top.window.theme+"/comm/css/jquery.datagrid.css");
        cssArray.push("resource"+top.window.theme+"/scienceLayout/css/GisNew.css");
        cssArray.push("resource"+top.window.theme+"/scienceLayout/css/PSBGis.css");
        cssArray.push("resource"+top.window.theme+"/comm/bigpage/css/jquery.bigpage.css");
        for (var i = 0; i < cssArray.length; i++) {
            if (_this._isIncludeCss(cssArray[i]) == false) {
            	var link = document.createElement("link");
            	link.type = "text/css";
            	link.href = cssArray[i];
            	link.rel = "stylesheet";
            	document.body.appendChild(link);
//                $('<link rel="stylesheet" type="text/css" href="' + cssArray[i] + '"\/>').appendTo(head);
            }
        }

        var jsArray = [];
        jsArray.push(["resource/comm/js/util.js",false]);
        jsArray.push(["resource/comm/js/JHashMap.js",false]);
        jsArray.push(["resource/comm/js/fadingTip.js",false]);
        jsArray.push(["resource/js/o3/v3.10.0/gisInteraction.js",false]);
        jsArray.push(["resource/js/gis/lrtk.js",false]);
        jsArray.push(["resource/comm/laydate/laydate.js",false]);
        jsArray.push(["resource/js/o3/util/Util_new.js",false]);
        jsArray.push(["resource/comm/bigpage/js/jquery.bigpage.case.js",true]);
        jsArray.push(["resource/js/o3/draw/MeasureControl.js",false]);
        jsArray.push(["resource/js/o3/draw/centerCrossEffect.js",false]);
        jsArray.push(["resource/js/o3/draw/SelectEffectControl.js",false]);
        jsArray.push(["resource/js/o3/pointControl/scienceFirstClassControl.js",_this.style["JKD"]]);
        jsArray.push(["resource/js/o3/pointControl/FacePointLayerControl.js",_this.style["FACE_JKD"]]);
        jsArray.push(["resource/js/o3/pointControl/sciencePersonClassControl.js",_this.style["JWT"]]);
        jsArray.push(["resource/js/jqCommand/PersonClassControl.js",_this.style["Jqcommand_JWT"]]);
        jsArray.push(["resource/js/o3/pointControl/MobileSiteLayerControl.js",false]);
        jsArray.push(["resource/js/o3/mapEvent/mapClick.js",true]);
        jsArray.push(["resource/js/o3/mapStyle/mapStyle.js",true]);
        jsArray.push(["resource/js/o3/util/util.js",false]);
        jsArray.push(["resource/js/policeDuty/FocalDeptLayerControl.js",_this.style["FocalDept"]]);
        jsArray.push(["resource/js/zdxlqy/KeyAreaLayerControl.js",false]);
        jsArray.push(["resource/js/o3/toolbar/toolbar.js",false]);
        jsArray.push(["resource/js/o3/pointControl/CarPointLayerControl.js",_this.style["carKK"]]);
        jsArray.push(["resource/js/o3/pointControl/PersonKuLayerControl.js",_this.style["PersonKu"]]);
        jsArray.push(["resource/js/o3/pointControl/ElecFencePointLayerControl.js",_this.style["elecFence"]]);
        jsArray.push(["resource/js/o3/pointControl/WifiPointLayerControl.js",_this.style["wifi"]]);
        jsArray.push(["resource/js/o3/pointControl/DzkPointLayerControl.js",_this.style["dzk"]]);
        jsArray.push(["resource/js/o3/pointControl/CommunityPointLayerControl.js",_this.style["community"]]);
        jsArray.push(["resource/js/policeDuty/PoliceDutyLayerControl.js",_this.style["ZRQ"]]);
        jsArray.push(["resource/js/o3/pointControl/HotelLayerControl.js",_this.style["Hotel"]]);
        jsArray.push(["resource/js/o3/pointControl/NetbarLayerControl.js",_this.style["Netbar"]]);
        jsArray.push(["resource/js/o3/pointControl/PoliceStationFocalManControl.js",_this.style["FocalMan"]]);
        jsArray.push(["resource/js/o3/pointControl/dtgps/scienceDtGpsControl.js",_this.style["DT"]]);
        jsArray.push(["resource/js/o3/quickMenu.js",false]);
        jsArray.push(["resource/comm/js/jquery.pagination.js",false]);
        jsArray.push(["resource/comm/js/jquery.datagrid.js",false]);
        jsArray.push(["resource/js/assistInvestigate/singleInvestigation.js",false]);
        jsArray.push(["resource/js/assistInvestigate/multiInvestigation.js",false]);
        jsArray.push(["resource/js/o3/pointControl/scienceCasePointControl.js",_this.style["AJ"]]);
        jsArray.push(["resource/js/o3/pointControl/scienceJQPointControl.js",_this.style["JQ"]]);
		jsArray.push(["resource/js/o3/pointControl/SpecialSiteControl.js",_this.style["TZCS"]]);
		jsArray.push(["resource/js/o3/pointControl/mgqyAreaControl.js",_this.style["MGQY"]]);
        jsArray.push(["resource/js/jqCommand/map/jqCommandPointControl.js",_this.style["Jqcommand_JQ"]]);
        jsArray.push(["resource/js/caseInvestigation/caseRelativePerson.js",false]);
        if(!window.isCaseGuiji){
        	jsArray.push(["resource/js/caseInvestigation/caseRefFocalMan.js",false]);
        }
        //jsArray.push(["resource/scienceLayout/js/jqPushMenu.js",false]);   //疑情推送js
        //jsArray.push(["resource/comm/editSelect/caseLeibieSelect.js",true]);
        for (var i = 0; i < jsArray.length; i++) {
            if (_this._isIncludeJs(jsArray[i][0]) == false) {
            	if(jsArray[i][1]){
            		$('<script type="text/javascript" src="' + jsArray[i][0] + '"> <\/script>').appendTo(head);
            	}else{
            		var script = document.createElement("script");
	            	script.type = "text/javascript";
	            	script.src = jsArray[i][0];
	            	document.body.appendChild(script);
            	}
            }
        }
    },
    _initialOrderLayers: function () {
        var featureLayers = ["districtAreaLayerName", "countyAreaBoundLayerName", "townAreaBoundLayerName", "dutyAreaLayerName", "highLightAreaLayerName"];
        var markerLayers = ["policeMarkerLayer", "regionMarkerLayer", "dutyAreaMarkerLayer"];
        for (var i = 0; i < featureLayers.length; i++) {
            var lyrInfo = _featureLocalFuns.getLayer(featureLayers[i]);
            if (!lyrInfo) {
                _featureLocalFuns.createLayer(featureLayers[i]);
            }
        }
        for (var i = 0; i < markerLayers.length; i++) {
            var lyrInfo = _markerLocalFuns.getMarkerLayer(markerLayers[i]);
            if (!lyrInfo) {
                _markerLocalFuns.createMarkerLayer(markerLayers[i]);
            }
        }
    },
    _bindEventHandler: function () {
        var _this = this;

        registerMapClick(_this.map);
        registerMapZoom(_this.map);

        $(window).resize(function () {
            setTimeout(function () {
                _this._resize();
            }, 200);
        });

        //单点摸排多选点击事件
        $(".PSBTouchcheckbox").unbind().bind('click',function(){
        	var text = $(this).context.nextSibling.data;
        	if(text == "全部"){
        		 if($(this).parent().hasClass("PSBTouchListNav_on")){
//        			 $(this).parent().parent().child().removeClass("PSBTouchListNav_on").addClass("PSBTouchListNav");
        			 $(".PSBTouchList >a").removeClass("PSBTouchListNav_on").addClass("PSBTouchListNav");
        		 }else{
        			 $(".PSBTouchList >a").removeClass("PSBTouchListNav").addClass("PSBTouchListNav_on");
//        			 $(this).parent().parent().child().removeClass("PSBTouchListNav").addClass("PSBTouchListNav_on");
        			 
        		 }
        	}else{
        		if($(this).parent().hasClass("PSBTouchListNav_on")){
        			$(this).parent().removeClass("PSBTouchListNav_on").addClass("PSBTouchListNav");
        		}else{
        			$(this).parent().removeClass("PSBTouchListNav").addClass("PSBTouchListNav_on");
        		}
        	}
	   	});
        
        /**
         * 被点击的对象框不被覆盖
         * 解决了BUG编号008248：武昌-活动安保界面，搜索框被遮挡
         */
        $("#searchBar").click(function () {
        	$("#activityMapList").css('z-index', 1);
    		$("#searchBar").css('z-index', 2);
        });
        $("#activityMapList").click(function () {
    		$("#searchBar").css('z-index', 1);
    		$("#activityMapList").css('z-index', 2);
        });
        
        $("#menuContainer a").click(function () {
        	event.stopPropagation();
            var name = $(this).attr("name");
            var leftPx = $(this).offset().left;
            var topPx = $(this).offset().top+31;
            switch (name) {
                case "mapToolControl":
                    var dispaly = $("#mapToolListContainer").css("display");
                    $("#mapToolListContainer").css({left:leftPx,top:topPx});
                    if (dispaly == "none") {
                        $(this).find(".PSBMenu_Down").removeClass("PSBMenu_Down").addClass("PSBMenu_Up");
                    } else {
                        $(this).find(".PSBMenu_Up").removeClass("PSBMenu_Up").addClass("PSBMenu_Down");
                    }
                    $("#layerListContainer").hide();
                    $("#appToolListContainer").hide();
                    $("#searchToolListContainer").hide();
                    $("#rlzfToolListContainer").hide();
                    $("#faceToolListContainer").hide();
                    $("#mapToolListContainer").toggle(200);
                    break;
                
                case "rljs":
                    var dispaly = $("#faceToolListContainer").css("display");
                    $("#faceToolListContainer").css({left:leftPx,top:topPx});
                    if (dispaly == "none") {
                        $(this).find(".PSBMenu_Down").removeClass("PSBMenu_Down").addClass("PSBMenu_Up");
                    } else {
                        $(this).find(".PSBMenu_Up").removeClass("PSBMenu_Up").addClass("PSBMenu_Down");
                    }
                    $("#layerListContainer").hide();
                    $("#appToolListContainer").hide();
                    $("#searchToolListContainer").hide();
                    $("#rlzfToolListContainer").hide();
                    $("#mapToolListContainer").hide();
                    $("#faceToolListContainer").toggle(200);
                    break;    
                    
                case "appToolControl":
                	if(!_this.measureControl)
                		_this.measureControl = new MeasureControl(_this.map);
                    var dispaly = $("#appToolListContainer").css("display");
                    if (dispaly == "none") {
                        $(this).find(".PSBMenu_Down").removeClass("PSBMenu_Down").addClass("PSBMenu_Up");
                    } else {
                        $(this).find(".PSBMenu_Up").removeClass("PSBMenu_Up").addClass("PSBMenu_Down");
                    }
                    $("#appToolListContainer").css({left:leftPx,top:topPx});
                    $("#layerListContainer").hide();
                    $("#mapToolListContainer").hide();
                    $("#searchToolListContainer").hide();
                    $("#rlzfToolListContainer").hide();
                    $("#faceToolListContainer").hide();
                    $("#appToolListContainer").toggle(200);
                    break;
                case "layerControl":
                	$("#layerListContainer").css({left:leftPx,top:topPx});
                    $("#mapToolListContainer").hide();
                    $("#appToolListContainer").hide();
                    $("#searchToolListContainer").hide();
                    $("#rlzfToolListContainer").hide();
                    $("#faceToolListContainer").hide();
                    $("#layerListContainer").toggle(200);
                    break;
                case "searchToolControl":
                	$("#searchToolListContainer").css({left:leftPx,top:topPx});
                    $("#mapToolListContainer").hide();
                    $("#appToolListContainer").hide();
                    $("#layerListContainer").hide();
                    $("#rlzfToolListContainer").hide();
                    $("#faceToolListContainer").hide();
                    $("#searchToolListContainer").toggle(200);
                	break;
            	case "rlzfToolControl":
		            $("#rlzfToolListContainer").css({left:leftPx,top:topPx});
		            $("#layerListContainer").hide();
		            $("#mapToolListContainer").hide();
		            $("#appToolListContainer").hide();
		            $("#searchToolListContainer").hide();
		            $("#faceToolListContainer").hide();
		            $("#rlzfToolListContainer").toggle(200);
		            break;
                default:
                    break;
            }
        });

        $("#appToolListContainer a").click(function () {
        	event.stopPropagation();
            var name = $(this).attr("name");
            $("#menuContainer a[name='mapToolControl']").click();
            if(!_this.measureControl)
        		_this.measureControl = new MeasureControl(_this.map);
            switch (name) {
                case "fullView":
                	//配置地图
    				if(clientGISKind==clientGISKinds.PGIS){
    					if(arcgisMapFullExtent){
    						map.getView().fit(eval(arcgisMapFullExtent),map.getSize()); 	
    					}
    				}else if(clientGISKind==clientGISKinds.ARCGIS){
    					map.getView().fit(eval(arcgisMapFullExtent),map.getSize());
    				}else if(clientGISKind==clientGISKinds.FHGIS){
    					if(gisParameter && gisParameter.fullMapLon && gisParameter.fullMapLon != 0){
    						if((gisParameter.fullMapZoom*1) < 10)gisParameter.fullMapZoom = 10;
    						map.getView().setZoom(gisParameter.fullMapZoom);
     						map.getView().setCenter([gisParameter.fullMapLon*1,gisParameter.fullMapLat*1]);
    					}
    				}else if(clientGISKind==clientGISKinds.OFFLINEGIS){
    					map.getView().setZoom(10);
    					var lonlat = $("#offline_center").val().replace('[','').replace(']','').split(',');
    					var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(lonlat[0]*1,lonlat[1]*1), 'EPSG:4326', 'EPSG:3857');
    					lon = cor[0];
    					lat = cor[1];
    					map.getView().setCenter([lon*1,lat*1]);
    				}
//                    window.gisInteraction.setPosition(gisParameter.fullMapLon, gisParameter.fullMapLat, gisParameter.initCenterZoom);
                    break;
                case "disMeasure":
                    window.gisInteraction.clearMeaure();
//                    window.gisInteraction.meaureLine();
                   _this.measureControl.addInteraction("LineString");
                    break;
                case "areaMeasure":
                    window.gisInteraction.clearMeaure();
//                    window.gisInteraction.meaureArea();
                    _this. measureControl.addInteraction("Polygon");
                    break;
                case "clear":
                	_this.measureControl.clear();
                	window.gisInteraction.clearFeatures();
//                    window.gisInteraction.clearMeaure();
                    break;
                default:
                    break;
            }
        });
        
        $("#faceToolListContainer a").click(function () {
        	event.stopPropagation();
        	var name = $(this).attr("name");
            $("#menuContainer a[name='rljs']").click();
            
        	var href = window.location.href;
        	if(href.indexOf("sciencePoliceDutyMap")>-1){//如果是首页打开
                top.menuContent.hide();
                top.closeMenu.hide();
                top.openMenu.show();
        	}
        	
            $("#appToolListContainer").hide();
            switch (name) {
                case "zpjs":
                    $("#captureSearchWin").show();
                    
                	featureGis = new FeatureQueryGis();
                	featureGis.faceQuery();
                    break;
                case "rlsb":
                	$("#faceQueryWin").show();
                	faceQueryRLSB();
                	
                    break;
                default:
                    break;
            }
        });

        $("#searchToolListContainer a").click(function () {
        	_this.dzwlChecked = "";
        	_this.checkedDZWL = new HashMap();
            var name = $(this).attr("name");
            $("#searchToolListContainer a[name='searchToolControl']").click();
            switch (name) {
                case "circleSelect":
                    _this._circleSelectFn();
                    break;
                case "squareSelect":
                    _this._squareSelectFn();
                    break;
                case "freeDomSelect":
                    _this._freeDomSelect();
                    break;
                case "xzbSelect":
                    _this._xzbSelectFn();
                    break;
                default:
                    break;
            }
        });
        //单点摸排地图画圈事件
        $("#singleSelectCircle").click(function () {
        	fadingTip("请在地图上开始画圆");
        	_this.singleInvest();
        });
        
        //显示与隐藏
		$("#singleInvestDiv a[mark='showOrHide']").unbind("click").bind("click",function(e){
			var id=$(this).attr("controlDiv");
			if($(this).hasClass("PUDetailTitle_close")){
				$(this).removeClass("PUDetailTitle_close").addClass("PUDetailTitle_open");
				$("#"+id+"Table").hide();
			}
			else{
				$(this).removeClass("PUDetailTitle_open").addClass("PUDetailTitle_close");
				$("#"+id+"Table").show();
			}
		});
        
        //多点碰撞画圈点击事件
        $("#multiInvestGuidBar a[name='finishConfig']").click(function () {
        	if(_this.multiInvestigation == null){
            	_this.multiInvestigation = new MultiInvestigation(_this.map);
        	}
        	var id = $(this).attr("id");
            _this.multiInvestigation.trackMultiInvestCircle(id);
        });
        
        //多点碰撞新增一行点击事件
        $("#multiInvestGuidBar a[name='addNext']").click(function () {
        	_this.count +=1;
        	var html = ' 		<div class="PSBTimeSet">'
	          + '      				<span class="TimeChooseBoxInputBox"><a class="TSInputDate" style="display:none;"></a><input onclick="basalResourcesLayerControl.multiInvestigation.initTime(\'startTime_duodianPZ'+_this.count+'\')" id="startTime_duodianPZ'+_this.count+'" name="startTime_duodianPZ" type="text"  class="TSInput" onfocus="if(value==defaultValue){value=\'\';this.style.color="#fff"}" onblur="if (value==\'\') {value=defaultValue;this.style.color="#fff"}" style="color:#fff" value="开始时间"  /></span>'
	          + '      				<span class="TimeChooseLine">-</span>'
	          + '      				<span class="TimeChooseBoxInputBox"><a class="TSInputDate" style="display:none;"></a><input onclick="basalResourcesLayerControl.multiInvestigation.initTime(\'endTime_duodianPZ'+_this.count+'\')" id="endTime_duodianPZ'+_this.count+'" name="endTime_duodianPZ" type="text"  class="TSInput" onfocus="if(value==defaultValue){value=\'\';this.style.color="#fff"}" onblur="if (value==\'\') {value=defaultValue;this.style.color="#fff"}" style="color:#fff" value="结束时间"  /></span>'
	          + '      				<a name="finishConfig" id="finishConfig'+_this.count+'"  href="javascript:void(0);" class="PSBGisBut03 PSBGisButMg">圈选</a>'
	          + '      				<a name="delThis" href="javascript:void(0);" class="PSBDel" title="删除"></a>'
	          + '       			<div class="clear"></div>'
	          + '  				</div>';
			$("#multiInvestGuidBar .PSBTimeSetBox").append(html);
			$("#startTime_duodianPZ"+_this.count).val(getLastDateString(-10) + " 00:00:00");
            $("#endTime_duodianPZ"+_this.count).val(getLastDateString(0) + " 23:59:59");
            
            //注册画圈点击事件
            $("#multiInvestGuidBar a[name='finishConfig']").click(function () {
            	if(_this.multiInvestigation == null){
                	_this.multiInvestigation = new MultiInvestigation(_this.map);
            	}
            	var id = $(this).attr("id");
                _this.multiInvestigation.trackMultiInvestCircle(id);
            });
            
            //注册减一行点击事件
            $("#multiInvestGuidBar a[name='delThis']").click(function () {
//            	_this.count -=1;
            	$(this).parent().remove();  //移除该行
//            	console.log($(this).prev().attr("id"));
            	var count = $(this).prev().attr("id").substr(12,$(this).prev().attr("id").length);
            	if(_this.multiInvestigation.circleMap.get(count)){
            		_this.multiInvestigation.circleMap.remove(count);//将相应的记录（地图上的圆）移除
            	}
//            	console.log(count+":"+_this.multiInvestigation.circleMap.get(count));
//            	console.log(_this.multiInvestigation.circleMap.values());
            	_this.multiInvestigation.addCircle2Map();
            	
            });
        });
        
       //多点碰撞点击事件
        $("#startPZ").click(function () {
        	if (_this.multiInvestigation.circleMap.size() < 2) {
                fadingTip("多点碰撞至少需要绘制两个范围!");
                return;
            }
            //开始多点碰撞分析
            $("#multiInvestGuidBar").hide();
            _this.multiInvestigation.openMultiInvestDialog();
        });
        
        $("#rlzfToolListContainer a").click(function () {
        	
        	var href = window.location.href;
        	if(href.indexOf("sciencePoliceDutyMap")>-1){//如果是首页打开
                top.menuContent.hide();
                top.closeMenu.hide();
                top.openMenu.show();
        	}
            var name = $(this).attr("title");
            var value = $(this).attr("value");

            /**
             * 人脸战法下拉菜单点击事件
             */
            $("#alarmQueryWin").show();
            
            $("#AlarmTitle").html(name);
            $("#rlzfToolListContainer").hide();
            $("#clickValue").val(value);
            
            if(alarm != null){
            	alarm.closeAlarmSpecialWin2();
            }
            
            alarm = new AlarmQueryGis();
            alarm.alarmQuery();
            
        });

        $("#menuSwitcherContainer button").click(function () {
            var dispaly = $("#menuContainer").css("display");
            if (dispaly == "none") {
                $(this).find("span").html("»");
            } else {
                $(this).find("span").html("«");
            }
            $("#menuContainer a").toggle(200);
            $("#mapToolListContainer").hide();
            $("#appToolListContainer").hide();
            $("#layerListContainer").hide();
        });
        
        $("#layerListContainer a").click(function (event) {
        	try{        		
        		event.stopPropagation();
        	}catch (err) {
                console.log(err.message);
            }
            var value = $(this).attr("value");
            if("allSelect" == value){
            	var state = true;
            	if($(this).find("img").length > 0){   //已勾选
	            	$("#layerListContainer a").removeAttr('checked');
	            	$("#layerListContainer a").find("img").remove();
	            	state = false;
            	}else{
            		$("#layerListContainer a").attr('checked',"checked");
	            	$("#layerListContainer a").find(".GisPullDownMenuNav_Img").html('<img src="resource/scienceLayout/images/web/GisChoice.png" width="20" height="20">');
            	}
            	$.each(_this.layerIds,function(i,item){
            		_this._showLayer(item, state);
            	})
            }else{
            	if($(this).find("img").length > 0){   //已勾选
	            	$(this).removeAttr('checked');
	            	$(this).find("img").remove();
	            }else{                   //未勾选
	            	$(this).attr('checked',"checked");
	            	$(this).find(".GisPullDownMenuNav_Img").eq(0).html('<img src="resource/scienceLayout/images/web/GisChoice.png" width="20" height="20">');
	            }
	            var state = $(this).attr('checked');
	            _this._showLayer(value, state);
            }
        });
        
        //监控点全选点击事件
        $("#selectAllEquip").bind("click",function(){
        	if($("#selectAllEquip").attr("checked") == "checked"){
        		$(".jdkCheckBox").attr("checked","checked");
        	}else{
        		$(".jdkCheckBox").attr("checked",false);
        	}
        });
        
        $(".SearchClose").click(function(){
        	_this.clearLayerCount();
        	window.gisInteraction.clearTrackFeatures();
            window.gisInteraction.clearTrack();
            $("#selectAllEquip").attr("checked",false);
        	$("#searchPopup,#JKDEquipmentState,#searchPopup").hide();
        	$("#searchSortDiv").hide();
        	$("#loadSearchLayer").hide();
        	$("#JKDEquipmentState").hide();
        	$("#searchLabel").html("");
        	$("#searchLabel").attr("layerType","");
        	$(".SearchBarInput").css({"padding-left": "10px"});
        	$(".SearchBarInput").val("");
        	if(window.drawControl){
	            window.drawControl.clear();
            }
        	_this.ckxxPageIndex = 1;
        	_this.ckxxExtent = "";
    		_this.ckxxSearchType = "";
        })
        
        $(".InputClear").click(function(){
        	$(".SearchBarInput").val("");
        })
        
        $(".SearchBarInput").focus(function(){
         	$("#searchSortDiv").show();
         	$(".SearchClose").show();
         	if(_this.txType == "elecFence"){
         		_this.querySearchLayer('ELECFENCE');
         	}
        })
        
        
        $(".SearchBarInput").die().bind("keyup",function(e){
	    	if(e.keyCode==13){
	    		$(".SearchBarBtn").click();
	    	}
	    });
        
        $('input:radio[name="equipmentState"]').bind("click",function(){
        	var type = $("#searchLabel").attr("layerType");
        	if(dealWithParam(type) == ""){
        		type = "JKD";
        	}
        	var searchParmas = new Object();
        	searchParmas.layerType = type;
        	searchParmas.state = $('input:radio[name="equipmentState"]:checked').val();
        	searchParmas.searchKey = $(".SearchBarInput").val();
//        	if($("#searchSortDiv").css("display") == "none"){
//        		_this.loadSearchLayer(type);
//        	}else{        		
        		_this._queryLayerResource(searchParmas,type);
//        	}
        });
        
        $(".SearchBarBtn").click(function(){
        	$("#selectAllEquip").attr("checked",false);
        	var type = $("#searchLabel").attr("layerType");
        	var searchParmas = new Object();
        	if(dealWithParam(type) != ""){
        		searchParmas.layerType = type;
        	}else{        		
        		type = "JKD";
        		searchParmas.layerType = "JKD";
        	}
        	searchParmas.state = $('input:radio[name="equipmentState"]:checked').val();
        	searchParmas.searchKey = $(".SearchBarInput").val();
        	$("#searchSortDiv").hide();
            $("#loadSearchLayer").show();
        	_this._queryLayerResource(searchParmas,type);
        });
        
        $(".FoldAreaShrink_b02").click(function(){  //隐藏
        	 $("#searchResultDiv").hide();
        	 $(this).hide();
        	 $(".FoldAreaShrink_b01").show();
        });
        
        $(".FoldAreaShrink_b01").click(function(){  //显示
        	$("#searchResultDiv").show();
        	$(this).hide();
        	$(".FoldAreaShrink_b02").show();
        });
        
        function bindMouserOver(){
        	$("html").unbind("mouseover").bind("mouseover",function(ee){
                if(ee.target.id != "mapToolControl" && ee.target.id != "appToolListContainer" && $(ee.target).parents("#mapToolListContainer").length == 0){
					$("#mapToolListContainer").hide();
					$("html").unbind('mouseover');
				}
        	})
        }
        
        $("#mapToolControl").unbind().bind('mouseover',function(e){
        	 var left = $(this).offset().left + $(this).width();
        	 var top = $(this).offset().top;
        	 $("#faceToolListContainer").hide();
        	 $("#mapToolListContainer").css({left:left + 21 ,top:top});
        	 $("#mapToolListContainer").show();
        	 bindMouserOver();
        })
        
        function bindMouserOver2(){
        	$("html").unbind("mouseover").bind("mouseover",function(ee){
                if(ee.target.id != "rljs" && ee.target.id != "appToolListContainer" && $(ee.target).parents("#faceToolListContainer").length == 0){
					$("#faceToolListContainer").hide();
					$("html").unbind('mouseover');
				}
        	})
        }
        
        $("#rljs").unbind().bind('mouseover',function(e){
        	 var left = $(this).offset().left + $(this).width();
        	 var top = $(this).offset().top;
        	 $("#mapToolListContainer").hide();
        	 $("#faceToolListContainer").css({left:left + 21,top:top});
        	 $("#faceToolListContainer").show();
        	 bindMouserOver2();
        })
        
        
    },
    clearLayerCount : function(){
    	$(".caseCount").html("");
    	$(".dtCount").html("");
    	$(".faceJKDCount").html("");
    	$(".hotelCount").html("");
    	$(".jkdCount").html("");
    	$(".alarmCount").html("");
    	$(".jwtCount").html("");
    	$(".netBarCount").html("");
    	$(".zdqyCount").html("");
    	$(".pkCount").html("");
		$(".WIFICount").html("");
		$(".ELECFENCECount").html("");
		$(".CARKKCount").html("");
		$(".ckxxCount").html("");
		$(".dzkCount").html("");
    },
    _showLayer: function (value, state) {
        var _this = this;
        switch (value) {
            case "JKD":
                if (!_this.firstClassControl) {
                    _this.firstClassControl = new FirstClassLayerControl(_this.map);
                } else {
                    _this.firstClassControl.showLayer(state);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
                break;
            case "carKK":
                if (!_this.carLayerControl) {
                    _this.carLayerControl = new CarPointLayerControl(_this.map);
                } else {
                    _this.carLayerControl.showLayer(state);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
                break;
            case "PersonKu":
                if (!_this.personKuLayerControl) {
                    _this.personKuLayerControl = new PersonKuLayerControl(_this.map);
                } else {
                    _this.personKuLayerControl.showLayer(state);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
                break;
            case "elecFence":
                if (!_this.elecFenceLayerControl) {
                    _this.elecFenceLayerControl = new ElecFencePointLayerControl(_this.map);
                } else {
                    _this.elecFenceLayerControl.showLayer(state);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
                break;
            case "FACE_JKD":
            	if (!_this.facePointLayerControl) {
                    _this.facePointLayerControl = new FacePointLayerControl(_this.map);
                } else {
                    _this.facePointLayerControl.showLayer(state,true);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
                break;
            case "JZ":
                if (!_this.popupControl) {
                    window.popupControl = _this.popupControl = new PopupControl(_this.map);
                }
                if (!_this.mobileSiteLayerControl) {
                    window.mobileSiteLayerControl = _this.mobileSiteLayerControl = new MobileSiteLayerControl(_this.map);
                    var currentZoom = _this.map.getView().getZoom();
                    if (currentZoom > 16 && state) {
                        var extent = _this.map.getView().calculateExtent(map.getSize());
                        if (extent[0]) {
                            _this.mobileSiteLayerControl.getMobileSiteLayer(extent);
                        }
                    } else {
                        _this.mobileSiteLayerControl.mobileSiteLayerSource.clear();
                        _this.mobileSiteLayerControl.drawSourceXiao.clear();
                    }
                }
                if (state) {
                    _this.mobileSiteLayerControl.vectorLayer.setVisible(true);
                } else {
                    _this.mobileSiteLayerControl.vectorLayer.setVisible(false);
                    _this.popupControl.closePopUpwin();
                }
                break;
            case "JWT":
              
                if (!_this.personClassControl) {
                    _this.personClassControl = new PersonLayerControl(_this.map);
                } else {
                    _this.personClassControl.showLayer(state);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
                break;
            case "Jqcommand_JWT":
                if (!_this.personClassControl) {
                    _this.personClassControl = new PersonClassControl(_this.map);
                    if (!window.personClassControl) {
                    	window.personClassControl = _this.personClassControl;
                    }
                } else {
                    _this.personClassControl.showLayer(state);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
                break;
            case "DT":
                if (!_this.dtGpsControl) {
                    window.dtGpsControl = _this.dtGpsControl = new DtGpsControl(_this.map);
                } else {
                    _this.dtGpsControl.showLayer(state);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
                break;
            case "FocalDept":
                if (!_this.focalDeptLayerControl) {
                    _this.focalDeptLayerControl = new FocalDeptLayerControl(_this.map);
                } else {
                    _this.focalDeptLayerControl.showLayer(state);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
                break;
            case "keyArea":
            	if (!_this.keyAreaLayerControl) {
            		_this.keyAreaLayerControl = new KeyAreaLayerControl(_this.map);
            	} else {
            		_this.keyAreaLayerControl.showLayer(state);
            		if (!state) {
            			window.gisInteraction.clearPopup();
            		}
            	}
            	break;
            case "ZRQ":
                if (!_this.policeDutyLayerControl) {
                    _this.policeDutyLayerControl = new PoliceDutyLayerControl(_this.map,function(){});
                } else {
                    _this.policeDutyLayerControl.showLayer(state);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
                break;
            case "FocalMan":
                if (!_this.policeStationFocalManControl) {
                    _this.policeStationFocalManControl = new PoliceStationFocalManControl(_this.map);
                } else {
                    _this.policeStationFocalManControl.showLayer(state);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
                
                break;
            case "Hotel":
                if (!_this.hotelLayerControl) {
                    _this.hotelLayerControl = new HotelLayerControl(_this.map);
                } else {
                    _this.hotelLayerControl.showLayer(state);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
                break;
            case "Netbar":
                if (!_this.netbarLayerControl) {
                    _this.netbarLayerControl = new NetbarLayerControl(_this.map);
                } else {
                    _this.netbarLayerControl.showLayer(state);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
                break;
             case "JQ" :
            	if (!_this.jqPointControl) {
                    _this.jqPointControl = new jqLayerControl(_this.map);
					if (!top.window.jqPointControl) {
                    	top.window.jqPointControl = _this.jqPointControl;
                    }
                }else {
                    _this.jqPointControl.showLayer(state);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
            	break;
             case "Jqcommand_JQ" :
             	if (!_this.jqPointControl) {
                     if (top.window.jqPointControl) {
                     	_this.jqPointControl = top.window.jqPointControl;
                     }else{
                     	 _this.jqPointControl = new GetPointControl(_this.map);
                     	 window.jqPointControl = _this.jqPointControl;
                     }
                 }else {
                     _this.jqPointControl.showLayer(state);
                     if (!state) {
                         window.gisInteraction.clearPopup();
                     }
                 }
             	break;
              case "AJ" :
            	if (!_this.casePointControl) {
					if (top.window.casePointControl) {
                     	_this.casePointControl = top.window.casePointControl;
                     }else{
                     	 _this.casePointControl = new caseLayerControl(_this.map);
                     	 top.window.casePointControl = _this.casePointControl;
                     }
                } else {
                    _this.casePointControl.showLayer(state);
                    if (!state) {
                        window.gisInteraction.clearPopup();
                    }
                }
                break;
              case "wifi" :
	              if (!_this.wifiPointControl) {
	                    _this.wifiPointControl = new WifiLayerControl(_this.map);
	                } else {
	                    _this.wifiPointControl.showLayer(state);
	                    if (!state) {
	                        window.gisInteraction.clearPopup();
	                    }
	              }
            	  break;
              case "community" :
            	  if (!_this.communityPointControl) {
            		  _this.communityPointControl = new CommunityPointLayerControl(_this.map);
            	  } else {
            		  _this.communityPointControl.showLayer(state);
            		  if (!state) {
            			  window.gisInteraction.clearPopup();
            		  }
            	  }
            	  break;
				case "TZCS" :
	            	if (!_this.specialSiteControl) {
	                    _this.specialSiteControl = new SpecialSiteControl(_this.map);
						if (!top.window.specialSiteControl) {
	                    	top.window.specialSiteControl = _this.specialSiteControl;
	                    }
	                }else {
	                    _this.jqPointControl.showLayer(state);
	                    if (!state) {
	                        window.gisInteraction.clearPopup();
	                    }
	                }
            	break;
			case "dzk" :
				if (!_this.dzkPointControl) {
					_this.dzkPointControl = new DzkLayerControl(_this.map);
		        } else {
		            _this.dzkPointControl.showLayer(state);
		            if (!state) {
		                window.gisInteraction.clearPopup();
		            }
		        }
	            break;
			case "MGQY" :
				if (!_this.mgqyAreaControl) {
					_this.mgqyAreaControl = new MgqyAreaLayerControl(_this.map);
				} else {
					_this.mgqyAreaControl.showLayer(state);
					if (!state) {
						window.gisInteraction.clearPopup();
					}
				}
				break;
            default:
                break;
        }
    },
    _getMenuContainerHtmlTemplate: function () {
    	var html = '<div class="IndexGisMenu" id="menuContainer" style="right:30px; top:30px;">'
		         //+ '<a href="javascript:void(0);" class="IndexGisMenuNav" name="rlzfToolControl">'
	             //+ '<span class="IndexGisMenuNavText">人脸预警</span>'
	             //+ '<span class="IndexGisMenuNav_xl"></span>'
		         + '</a>'
		         + '<a href="javascript:void(0);" class="IndexGisMenuNav" name="searchToolControl">'
	             + '<span class="IndexGisMenuNavText">选择查询</span>'
	             + '<span class="IndexGisMenuNav_xl"></span>'
		         + '</a>'
		         + '<a href="javascript:void(0);" class="IndexGisMenuNav" name="appToolControl" id="yygj">'
		         + '<span class="IndexGisMenuNavText">地图工具</span>'
		         + '<span class="IndexGisMenuNav_xl"></span>'
		         + '</a>'
		         + '<a href="javascript:void(0);" class="IndexGisMenuNav" name="layerControl">'
		         + '<span class="IndexGisMenuNavText">图层</span>'
		         + '<span class="IndexGisMenuNav_xl"></span>'
		         + '</a>'
		         + '</div>'
        return html;
    },
//    _getToolListContainerHtmlTemplate: function () {
//        var html = '<div class="GisPullDownMenu" style="display:none;" id="mapToolListContainer">'
//                 + '    <a href="javascript:void(0);" name="fullView" class="GisPullDownMenuNav">全图</a>'
//                 + '    <a href="javascript:void(0);" name="disMeasure" class="GisPullDownMenuNav">距离量算</a>'
//                 + '    <a href="javascript:void(0);" name="areaMeasure" class="GisPullDownMenuNav">面积量算</a>'
//                 + '    <a href="javascript:void(0);"  name="clear" class="GisPullDownMenuNav">清除图形</a>'
//                 + '</div>';
//        return html;
//    },
    
    _getFaceToolListContainerHtmlTemplate: function () {
        var html = '<div class="GisPullDownMenu" style="display:none;" id="faceToolListContainer">'
                 + '    <a href="javascript:void(0);" name="zpjs" class="GisPullDownMenuNav">抓拍检索</a>'
                 + '    <a href="javascript:void(0);" name="rlsb" class="GisPullDownMenuNav">人脸识别</a>'
                 + '</div>';
        return html;
    },
    
     _getSearchToolListContainerHtmlTemplate: function () {
        var html = '<div class="GisPullDownMenu" style="display:none;" id="searchToolListContainer">'
                 + '    <a href="javascript:void(0);" name="circleSelect" class="GisPullDownMenuNav">圆形选择</a>'
                 + '    <a href="javascript:void(0);" name="squareSelect" class="GisPullDownMenuNav">矩形选择</a>'
                // + '    <a href="javascript:void(0);" name="freeDomSelect" class="GisPullDownMenuNav">自由选择</a>'
                // + '    <a href="javascript:void(0);"  name="xzbSelect" class="GisPullDownMenuNav">线周边选择</a>'
                 + '</div>';
        return html;
    },
    _getLayerListContainerHtmlTemplate: function () {
        var html = '<div id="layerListContainer" class="GisPullDownMenu GisPullDownMenu02" style="display:none;">'
            + '<a href="javascript:void(0);" value="allSelect" style="display: block;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>全选</span></a>'
            + '<a href="javascript:void(0);" value="JKD" style="display: JKD;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>监控点位</span></a>'
            + '<a href="javascript:void(0);" value="carKK" style="display: carKK;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>卡口点位</span></a>'
            + '<a href="javascript:void(0);" value="FACE_JKD" style="display: FACE_JKD;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>人脸卡口</span></a>'
            + '<a href="javascript:void(0);" value="elecFence" style="display: elecFence;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>电子围栏</span></a>'
            + '<a href="javascript:void(0);" value="wifi" style="display: wifi;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>wifi探针</span></a>'
            + '<a href="javascript:void(0);" value="Hotel" style="display: Hotel;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>宾馆/酒店</span></a>'
            + '<a href="javascript:void(0);" value="Netbar" style="display: Netbar;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>网吧</span></a>'
            + '<a href="javascript:void(0);" value="community" style="display: community;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>社区楼栋</span></a>'
            + '<a href="javascript:void(0);" value="FocalDept" style="display: FocalDept;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>重点单位</span></a>'
            + '<a href="javascript:void(0);" value="FocalMan" style="display: FocalMan;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>重点人员</span></a>'
            + '<a href="javascript:void(0);" value="keyArea" style="display: keyArea;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>重点区域</span></a>'
            + '<a href="javascript:void(0);" value="ZRQ" style="display: ZRQ;"   class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>责任区</span></a>'
            + '<a href="javascript:void(0);" value="JWT" style="display: JWT;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>警务通</span></a>'
            + '<a href="javascript:void(0);" value="Jqcommand_JWT" style="display: Jqcommand_JWT;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>警务通</span></a>'
            + '<a href="javascript:void(0);" value="DT" style="display: DT;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>电台</span></a>'
            + '<a href="javascript:void(0);" value="AJ" style="display: AJ;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>案件</span></a>'
            + '<a href="javascript:void(0);" value="JQ" style="display: JQ;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>警情</span></a>'
            + '<a href="javascript:void(0);" value="Jqcommand_JQ" style="display: Jqcommand_JQ;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>警情</span></a>'
            + '<a href="javascript:void(0);" value="PersonKu" style="display: PersonKu;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>人员库</span></a>'
			+ '<a href="javascript:void(0);" value="TZCS" style="display: TZCS;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>特种场所</span></a>'
			+ '<a href="javascript:void(0);" value="MGQY" style="display: MGQY;" class="GisPullDownMenuNav"><span class="GisPullDownMenuNav_Img"></span><span>敏感区域</span></a>'
            + '</div>';
        return html;
    },
    _getMenuSwitcherContainerHtmlTemplate: function () {
        var html = '<div id="menuSwitcherContainer" class="ol-control" style="position: absolute; top: 0px; right: -20px; display: block;">'
                 + '    <button type="button" style="display: inline-block;"><span>»</span></button>'
                 + '</div>';
        return html;
    },
    _getPopupContainerHtmlTemplate: function () {
        var html = '<div id="popup" class="ol-popup" style="display : none;z-index : 100">'
                 + '    <a id="popup-closer" class="ol-popup-closer" style="color:#333"></a>'
                 + '    <div id="popup-content"></div>'
                 + '</div>'
                 + '<div id="firstClassPoint" style="display:none">'
                 + '</div>'
                 + '<div id="policePop" class="Popups01" style="width:300px;display : none;">'
                 + '    <div class="PopupsHeader">'
                 + '        <h1>警员列表</h1>'
                 + '        <a id="policeClose" href="javascript:void(0);" class="PUClose"></a>'
                 + '    </div>'
                 + '    <div class="PopupsContent">'
                 + '        <div id="policePopContent" class="PopupsContenta" style=" height:250px; overflow-x: hidden;verflow-y:auto;">'
                 + '        </div>'
                 + '    </div>'
                 + '</div>'
                 + '<div id="dtPop" class="Popups01" style="width:300px;display : none;">'
                 + '    <div class="PopupsHeader">'
                 + '        <h1>手台列表</h1>'
                 + '        <a id="dtClose" href="javascript:void(0);" class="PUClose"></a>'
                 + '    </div>'
                 + '    <div class="PopupsContent">'
                 + '        <div id="dtPopContent" class="PopupsContenta" style=" height:250px; overflow-x: hidden;verflow-y:auto;">'
                 + '        </div>'
                 + '    </div>'
                 + '</div>';
        return html;
    },
    _getAppToolListContainerHtmlTemplate: function () {
        var html = '<div class="GisPullDownMenu" style="display:none;" id="appToolListContainer">'
            + '    <a href="javascript:void(0);" name="fullView" class="GisPullDownMenuNav">全图</a>'
            + '    <a href="javascript:void(0);" name="disMeasure" class="GisPullDownMenuNav">距离量算</a>'
            + '    <a href="javascript:void(0);" name="areaMeasure" class="GisPullDownMenuNav">面积量算</a>'
            + '    <a href="javascript:void(0);"  name="clear" class="GisPullDownMenuNav">清除图形</a>'
            + '</div>';
        return html;
    },
    
    _getRLZFToolListContainerHtmlTemplate: function () {

/*        var html = '<div id="rlzfToolListContainer" class="GisPullDownMenu" style="display:none;">'
        		 + '   <a href="javascript:void(0);" name="pfz" id="pfz" class="GisPullDownMenuNav">票贩子分析</a>'
        		 + '   <a href="javascript:void(0);" name="zpz" id="zpz" class="GisPullDownMenuNav">招嫖者分析</a>'
        		 + '   <a href="javascript:void(0);" name="wlry" id="wlry" class="GisPullDownMenuNav">外来人员分析</a>'
        		 + '   <a href="javascript:void(0);" name="czry" id="czry" class="GisPullDownMenuNav">常住人员分析</a>'
        		 + '   <a href="javascript:void(0);" name="ps" id="ps" class="GisPullDownMenuNav">扒手分析</a>'
        		 + '   <a href="javascript:void(0);" name="dq" id="dq" class="GisPullDownMenuNav">盗窃分析</a>'
        		 + '</div>';
        return html;*/
        
        var html = '<div id="rlzfToolListContainer" class="GisPullDownMenu" style="display:none;">'
   		 + '   <a href="javascript:void(0);" name="psyj" id="psyj" title="扒手预警" value="0" class="GisPullDownMenuNav">扒手预警</a>'
   		 + '   <a href="javascript:void(0);" name="pfyj" id="pfyj" title="票贩预警" value="1" class="GisPullDownMenuNav">票贩预警</a>'
   		 + '   <a href="javascript:void(0);" name="zpyj" id="zpyj" title="招嫖预警" value="2" class="GisPullDownMenuNav">招嫖预警</a>'
   		 + '   <a href="javascript:void(0);" name="sfyj" id="sfyj" title="上访预警" value="3" class="GisPullDownMenuNav">上访预警</a>'
   		 + '   <a href="javascript:void(0);" name="dqyj" id="dqyj" title="盗窃预警" value="4" class="GisPullDownMenuNav">盗窃预警</a>'
   		 + '   <a href="javascript:void(0);" name="wlrk" id="wlrk" title="外来人口" value="5" class="GisPullDownMenuNav">外来人口</a>'
   		 + '   <a href="javascript:void(0);" name="qtyj" id="qtyj" title="其他预警" value="6" class="GisPullDownMenuNav">其他预警</a>'
   		 + '</div>';
   return html;
        
    },
    
    _getSingleInvestResultHtmlTemplate: function () {
    	var html = '<div class="PUBox" id="singleInvestDiv" style="display:none;width:800px; height:500px; position:absolute; left:50px;top:50px;z-index:1752;">'
    		+ '<div class="PUBox_Top">'
    		+ '	<a href="javascript:void(0);" class="PUBoxClose" id="closeSingleInvest"></a>'
    		+ '	<div class="PUBox_J01"></div>'
    		+ '	<div class="PUBox_J02"></div>'
    		+ '	<div class="PUBox_TopBg01"></div>'
    		+ '	<div class="PUBox_TopBg02">'
    		+ '		<div class="PUBox_TopBg02_Bg"></div>'
    		+ '	</div>'
    		+ '	<div class="PUBox_TopBg03"></div>'
    		+ '</div>'
    		+ '<div class="PUBox_Middle" >'
    		+ '	<div class="PUBox_MiddleBg01"></div>'
    		+ '	<div class="PUBox_MiddleBg02">'
    		+ '		<div class="PUBoxTitle">'
    		+ '			<span class="PUBoxTitleImg"></span>'
    		+ '			<div class="PUBoxTitleText">'
    		+ '				<span class="PUBoxTitleText_Bg">单点摸排</span>'
    		+ '			</div>'
    		+ '			<div class="PUBtnBox02" style="display:none;">'
    		+ '				<a href="javascript:void(0);" class="PUFilterBtn">确定</a>'
    		+ '				<a href="javascript:void(0);" class="PUFilterBtn PUFilterBtnMg">取消</a>'
    		+ '			</div>'
    		+ '			<div class="clear"></div>'
    		+ '		</div>'
    		+ '		<div class="PUDetail PUDetail02">'
    		+ '			<div class="PUDetail_Line01"></div>'
    		+ '			<div class="PUDetail_Line02"></div>'
    		//+ '			<!----**内容开始**--->'
    		+ '			<div class="PUContent02">'
    		+ '				 <div class="PUSearchBox01">'
    		+ '					<div class="PUFilter">'
    		+ '						<span class="PUFilterTitle">姓名：</span>'
    		+ '						<input type="text" class="PUFInput" />'
    		+ '					</div>'
    		+ '					<div class="PUFilter">'
    		+ '						<span class="PUFilterTitle">身份证号：</span>'
    		+ '						<input type="text" class="PUFInput" />'
    		+ '					</div>'
    		+ '					<a id="sameIn" href="javascript:void(0);" class="FFLNav02" style=" padding:2px 0;"><span class="FFLCheckbox02"></span>同时出现</a>'
    		+ '					<div class="PUFilter">'
    		+ '						<span class="PUFilterTitle">开始时间：</span>'
    		+ '						<input onclick="basalResourcesLayerControl.singleInvestigation.initTime(\'single_startTime\')" type="text" class="PUFInput" id="single_startTime" name="single_startTime" />'
    		+ '					</div>'
    		+ '					<div class="PUFilter">'
    		+ '						<span class="PUFilterTitle">结束时间：</span>'
    		+ '						<input onclick="basalResourcesLayerControl.singleInvestigation.initTime(\'single_endTime\')" type="text" class="PUFInput" id="single_endTime" name="single_endTime" />'
    		+ '					</div>'
    		+ '					<div class="PUBtnStyleBox05">'
    		+ '						<a href="javascript:void(0);" class="PUBtnStyle01" id="startSingleInvest" >'
    		+ '							<span class="PUBtnStyle01_Line"></span>'
    		+ '							<span class="PUBtnStyle01_Bg01"></span>'
    		+ '							<span class="PUBtnStyle01_Bg02">开始摸排</span>'
    		+ '							<span class="PUBtnStyle01_Bg03"></span>'
    		+ '						</a>'
    		+ '						<a href="javascript:void(0);" class="PUBtnStyle01" style="display:none;">'
    		+ '							<span class="PUBtnStyle01_Line"></span>'
    		+ '							<span class="PUBtnStyle01_Bg01"></span>'
    		+ '							<span class="PUBtnStyle01_Bg02">重置</span>'
    		+ '							<span class="PUBtnStyle01_Bg03"></span>'
    		+ '						</a>'
    		+ '					</div>'
    		+ '					<div class="clear"></div>'
    		+ '				</div>'
    		+ '				<div class="PUDetailBox" style="height:400px;overflow-y:auto;overflow-x:hidden;">'
    		+ '					<div class="PUDetailTitle">'
    		+ '						<h1>'
    		+ '							<div class="FileTableTitle_Text">住店信息</div>'
    		+ '							<div class="" id="hotelLoading"></div>'
    		+ '						</h1>'
    		+ '						<a href="javascript:void(0);" class="PUDetailTitle_open" style="display:none;"></a>'
    		+ '						<a href="javascript:void(0);" class="PUDetailTitle_close" mark="showOrHide" controlDiv="zdxx"></a>'
    		+ '					</div>'
    		+ '					<div  style="margin:5px 0 5px 0;" id="zdxxTable">'
    		+ '						<table name="hotelData" id="hotelData" class=" easyui-datagrid"   border="0" cellspacing="0" cellpadding="0" >'
    		+ '						</table>'
    		+ '					</div>'
    		+ ' 				<div class="PUNoData" id="zdxxTableNone" style="display:none;">暂无相关数据</div>'
    		+ '					<div class="PUDetailTitle">'
    		+ '						<h1>'
    		+ '							<div class="FileTableTitle_Text">网吧上网信息</div>'
    		+ '							<div class="" id="netBarLoading"></div>'
    		+ '						</h1>'
    		+ '						<a href="javascript:void(0);" class="PUDetailTitle_open" style="display:none;"></a>'
    		+ '						<a href="javascript:void(0);" class="PUDetailTitle_close" mark="showOrHide" controlDiv="wbswxx"></a>'
    		+ '					</div>'
    		+ '					<div  style="margin:5px 0 5px 0;" id="wbswxxTable">'
    		+ '						<table name="netBarData" id="netBarData" class=" easyui-datagrid"   border="0" cellspacing="0" cellpadding="0" >'
    		+ '						</table>'
    		+ '					</div>'	
    		+ ' 				<div class="PUNoData" id="wbswxxTableNone" style="display:none;">暂无相关数据</div>'
    		+ '					<div class="PUDetailTitle">'
    		+ '						<h1>'
    		+ '							<div class="FileTableTitle_Text">人像信息</div>'
    		+ '							<div class="" id="personImageLoading"></div>'
    		+ '						</h1>'
    		+ '						<a href="javascript:void(0);" class="PUDetailTitle_open" style="display:none;"></a>'
    		+ '						<a href="javascript:void(0);" class="PUDetailTitle_close" mark="showOrHide" controlDiv="rxxx"></a>'
    		+ '					</div>'
    		+ ' 				<div class="PUNoData" id="rxxxTable">暂无相关数据</div>'
//    		+ '					<div  style="margin:5px 0 5px 0;border:1px solid #C5C5C5;" id="rxxxTable">'
//    		+ '						<table name="personImageData" id="personImageData" class=" easyui-datagrid"   border="0" cellspacing="0" cellpadding="0" >'
//    		+ '						</table>'
//    		+ '					</div>'
//    		+ '					<div class="PUDetailTitle" style="display:none;">'
//    		+ '						<h1>'
//    		+ '							<div class="FileTableTitle_Text">视频信息</div>'
//    		+ '							<div class="PUDataLoad" id="videoLoading"></div>'
//    		+ '						</h1>'
//    		+ '						<a href="javascript:void(0);" class="PUDetailTitle_open" style="display:none;"></a>'
//    		+ '						<a href="javascript:void(0);" class="PUDetailTitle_close" mark="showOrHide" controlDiv="spxx"></a>'
//    		+ '					</div>'
//    		+ ' 				<div class="PUNoData" id="spxxTable">暂无相关数据</div>'
//    		+ '					<div  style="margin:5px 0 5px 0;border:1px solid #C5C5C5;" id="spxxTable">'
//    		+ '						<table name="videoData" id="videoData" class=" easyui-datagrid"   border="0" cellspacing="0" cellpadding="0" >'
//    		+ '						</table>'
//    		+ '					</div>'
//    		+ '					<div class="PUDetailTitle" style="display:none;">'
//    		+ '						<h1>'
//    		+ '							<div class="FileTableTitle_Text">卡口信息</div>'
//    		+ '							<div class="PUDataLoad" id="kakouLoading"></div>'
//    		+ '						</h1>'
//    		+ '						<a href="javascript:void(0);" class="PUDetailTitle_open" style="display:none;"></a>'
//    		+ '						<a href="javascript:void(0);" class="PUDetailTitle_close" mark="showOrHide" controlDiv="kkxx"></a>'
//    		+ '					</div>'
//    		+ ' 				<div class="PUNoData" id="kkxxTable">暂无相关数据</div>'
//    		+ '					<div  style="margin:5px 0 5px 0;border:1px solid #C5C5C5;" id="kkxxTable">'
//    		+ '						<table name="kakouData" id="kakouData" class=" easyui-datagrid"   border="0" cellspacing="0" cellpadding="0" >'
//    		+ '						</table>'
//    		+ '					</div>'
    		+ '					<div class="PUDetailTitle">'
    		+ '						<h1>'
    		+ '							<div class="FileTableTitle_Text">WIFI信息</div>'
    		+ '							<div class="" id="wifiLoading"></div>'
    		+ '						</h1>'
    		+ '						<a href="javascript:void(0);" class="PUDetailTitle_open" style="display:none;"></a>'
    		+ '						<a href="javascript:void(0);" class="PUDetailTitle_close" mark="showOrHide" controlDiv="wifixx"></a>'
    		+ '					</div>'
    		+ ' 				<div class="PUNoData" id="wifixxTable">暂无相关数据</div>'
//    		+ '					<div  style="margin:5px 0 5px 0;border:1px solid #C5C5C5;" id="wifixxTable">'
//    		+ '						<table name="wifiData" id="wifiData" class=" easyui-datagrid"   border="0" cellspacing="0" cellpadding="0" >'
//    		+ '						</table>'
//    		+ '					</div>'
    		+ '					<div class="PUDetailTitle">'
    		+ '						<h1>'
    		+ '							<div class="FileTableTitle_Text">热点信息</div>'
    		+ '							<div class="" id="hotLoading"></div>'
    		+ '						</h1>'
    		+ '						<a href="javascript:void(0);" class="PUDetailTitle_open" style="display:none;"></a>'
    		+ '						<a href="javascript:void(0);" class="PUDetailTitle_close" mark="showOrHide" controlDiv="rdxx"></a>'
    		+ '					</div>'
    		+ ' 				<div class="PUNoData" id="rdxxTable">暂无相关数据</div>'
//    		+ '					<div  style="margin:5px 0 5px 0;border:1px solid #C5C5C5;" id="rdxxTable">'
//    		+ '						<table name="hotData" id="hotData" class=" easyui-datagrid"   border="0" cellspacing="0" cellpadding="0" >'
//    		+ '						</table>'
//    		+ '					</div>'
    		+ '				</div> '                     
    		+ '			</div>'
//    		+ '			<!----**内容结束**--->
    		+ '		</div>'
    		+ '	</div>'
    		+ '	<div class="PUBox_MiddleBg03"></div>'
    		+ '</div>'
    		+ '<div class="PUBox_Bottom">'
    		+ '	<div class="PUBox_J03"></div>'
    		+ '	<div class="PUBox_J04"></div>'
    		+ '	<div class="PUBox_BottomBg01"></div>'
    		+ '	<div class="PUBox_BottomBg02">'
    		+ '		<div class="PUBox_BottomBg02_Bg"></div>'
    		+ '	</div>'
    		+ '	<div class="PUBox_BottomBg03"></div>'
    		+ '</div>'
    		+ '</div>';
    	return html;
    },
    
    
    _getSingleInvestSelectHtmlTemplate: function () {
    	var html = '<div class="PSBTouch" id="singleSelect" style="display:none;">'
    		+ '			<div class="PSBTouchTitle">'
    		+ '				 <h1>单点摸排</h1>'
    		+ ' 			 <a href="javascript:void(0);" class="PSBTouchClose" title="关闭" onclick="$(\'#singleSelect\').hide();"></a>'
    		+ '			</div>'
    		+ ' 		<div class="PSBTouchList">'
    		+ '				<a href="javascript:void(0);" class="PSBTouchListNav"><span class="PSBTouchcheckbox"></span>全部</a>'
//    		+ '				<a href="javascript:void(0);" class="PSBTouchListNav_on"><span class="PSBTouchcheckbox"></span>实有人口</a>'
    		+ '				<a href="javascript:void(0);" class="PSBTouchListNav_on"><span class="PSBTouchcheckbox"></span>住宿</a>'
    		+ '				<a href="javascript:void(0);" class="PSBTouchListNav_on"><span class="PSBTouchcheckbox"></span>上网</a>'
    		+ ' 			<a href="javascript:void(0);" class="PSBTouchListNav"><span class="PSBTouchcheckbox"></span>人像</a>'
//    		+ ' 			<a style="display:none;"  href="javascript:void(0);" class="PSBTouchListNav"><span class="PSBTouchcheckbox"></span>视频</a>'
//    		+ '				<a style="display:none;"  href="javascript:void(0);" class="PSBTouchListNav"><span class="PSBTouchcheckbox"></span>卡口</a>'
    		+ ' 			<a href="javascript:void(0);" class="PSBTouchListNav"><span class="PSBTouchcheckbox"></span>wifi</a>'
    		+ ' 			<a href="javascript:void(0);" class="PSBTouchListNav"><span class="PSBTouchcheckbox"></span>热点</a>'
    		+ '			</div>'
    		+ ' 		<div class="PSBBtnBox">'
    		+ ' 			<a id="singleSelectCircle">地图圈选</a>'
    		+ '			</div>'
    		+ '		</div>';
    	return html;
    },
    _getMultiInvestGuidBarHtmlTemplate: function () {
    	var _this = this;
        var html = '<div class="PSBElastic" id="multiInvestGuidBar" style="display:none; top:50px; left:50px; z-index:2; width:440px;">'
        + '				<div class="PSBElasticTitle">'
        + '					<h1>设置</h1>'
        + '   				<a href="javascript:void(0);" class="PSBElasticClose" onclick="$(\'#multiInvestGuidBar\').hide();"></a>'
        + ' 			</div>'
        + '				<div class="PSBTimeSetBox">'
        + '					<div class="PSBTimeSet">'
        + '      				<span class="TimeChooseBoxInputBox"><a class="TSInputDate" style="display:none;"></a><input onclick="basalResourcesLayerControl.multiInvestigation.initTime(\'startTime_duodianPZ'+_this.count+'\')" id="startTime_duodianPZ'+_this.count+'" name="startTime_duodianPZ" type="text" id="textfield" class="TSInput" onfocus="if(value==defaultValue){value=\'\';this.style.color="#fff"}" onblur="if (value==\'\') {value=defaultValue;this.style.color="#fff"}" style="color:#fff" value="开始时间"  /></span>'
        + '      				<span class="TimeChooseLine">-</span>'
        + '      				<span class="TimeChooseBoxInputBox"><a class="TSInputDate" style="display:none;"></a><input onclick="basalResourcesLayerControl.multiInvestigation.initTime(\'endTime_duodianPZ'+_this.count+'\')" id="endTime_duodianPZ'+_this.count+'" name="endTime_duodianPZ" type="text" id="textfield" class="TSInput" onfocus="if(value==defaultValue){value=\'\';this.style.color="#fff"}" onblur="if (value==\'\') {value=defaultValue;this.style.color="#fff"}" style="color:#fff" value="结束时间"  /></span>'
        + '      				<a name="finishConfig" id="finishConfig'+_this.count+'"  href="javascript:void(0);" class="PSBGisBut03 PSBGisButMg">圈选</a>'
        + '      				<a name="addNext" href="javascript:void(0);" class="PSBAdd" title="新增"></a>'
        + '     				<div class="clear"></div>'
        + '    				</div>'
        + ' 			</div>'
        + ' 			<div class="PSBBtnBox">'
        + '					<a href="javascript:void(0);" id="startPZ">多点碰撞</a>'
        + ' 			</div>'
        + ' 		</div>';
        return html;
    },
    
    singleInvest : function(){
    	var _this = this;
    	if(_this.singleInvestigation == null){
	 	   _this.singleInvestigation = new SingleInvestigation(_this.map);
	 	}
	    _this.singleInvestigation.trackSingleInvestCircle();
    },
    _circleSelectFn : function(){
    	var _this = this;
    	window.gisInteraction.clearTrackFeatures();
        window.gisInteraction.clearTrack();
        setTimeout(function(){
        	window.gisInteraction.trackCircle(function (geo) {
	            var searchParams = {};
	            searchParams.searchType = "circleSelect";
	            searchParams.state = $('input:radio[name="equipmentState"]:checked').val();
	            geo.radius = window.gisInteraction.getCircleDegreeRadius(geo);
	            searchParams.extent = geo.lon+","+geo.lat+","+geo.radius;
	            _this.ckxxExtent = searchParams.extent;
	            _this.ckxxSearchType = searchParams.searchType;
	            _this._queryLayerResource(searchParams);
	            window.gisInteraction.clearPointerMoveHelp();
	            $("#searchSortDiv").hide();
	            $("#JKDEquipmentState").hide();
	            $("#loadSearchLayer").show();
//	            var searchPopupTop = $("#loadSearchLayer").height() + 30 + 32 - 2;
//	            $("#searchPopup").css({top:searchPopupTop + "px"});
	            $("#searchPopup").css({top:$("#loadSearchLayer").height() + 31 + "px"});
	            $(".FoldAreaShrink_b01").click();
	        });
        },300);
    },
    _squareSelectFn : function(){
    	var _this = this;
    	window.gisInteraction.clearTrackFeatures();
        window.gisInteraction.clearTrack();
    	setTimeout(function(){
        	window.gisInteraction.trackRect(function (geo) {
	            var searchParams = {};
	            searchParams.searchType = "squareSelect";
	            searchParams.state = $('input:radio[name="equipmentState"]:checked').val();
	            searchParams.extent = geo.extent.join(",");
	            _this.ckxxExtent = searchParams.extent;
	            _this.ckxxSearchType = searchParams.searchType;
	            _this._queryLayerResource(searchParams);
	            window.gisInteraction.clearPointerMoveHelp();
	            $("#searchSortDiv").hide();
	            $("#loadSearchLayer").show();
	            $("#JKDEquipmentState").hide();
//	            var searchPopupTop = $("#loadSearchLayer").height() + 30 + 32 - 2;
//	            $("#searchPopup").css({top:searchPopupTop + "px"});
	            $("#searchPopup").css({top:$("#loadSearchLayer").height() + 31 + "px"});
	            $(".FoldAreaShrink_b01").click();
	        });
        },300);
    },
    _freeDomSelect : function(){
    	
    },
    _xzbSelectFn : function(){
    	
    },
    _queryLayerResource : function(searchParmas,searchType){
    	var _this = this;
    	if(dealWithParam(searchParmas.layerType) == ""){  //如果待搜索图层为""  默认搜索全部图层
    		searchParmas.layerType = this.layerIds.join(",").toUpperCase();
    	}
    	searchParmas.searchKey = $(".SearchBarInput").val();
		searchParmas.pageIndex = $("#toPageNum").val()||1;
		searchParmas.pageSize = _this.ckxxPageSize||10;
    	if(typeof(serverDate) == "undefined"){
    		serverDate = getDateString().dayDate;
    	}
    	var url="queryLayerResource.do?state=" + searchParmas.state;
    	//如果是查询常口信息就需要分页查询，因为常口的数据量过大会导致页面卡死
    	if(searchType == "CKXX"){
    		searchParmas.extent = _this.ckxxExtent;
    		searchParmas.searchType = _this.ckxxSearchType;
    		searchParmas.layerType = "CKXX";
    		searchParmas.pageIndex = _this.ckxxPageIndex;
    		searchParmas.pageSize = _this.ckxxPageSize;
    	}
    	else if(searchType == "PersonKu"){
    		searchParmas.layerType = "PersonKu";
    		searchParmas.pageIndex = $("#toPageNum").val()||1;
    		searchParmas.pageSize = _this.ckxxPageSize;
    		if(window.eal){
    			url+=window.eal.getQueryParam();
    		}
    	}
    	searchParmas.startTime = serverDate+" 00:00:00";
    	searchParmas.endTime = serverDate+" 23:59:59";
        $.ajax({
            url: url,
            cache: false,
            async: true,
            type: 'GET',
            data : searchParmas,
            success: function (resobj) {
        	    resobj = eval("("+resobj+")");
        	    if(searchType == "CKXX" && _this.recordList != null){
        	    	_this.recordList.CKXX = resobj.CKXX || [];
        	    }else{
	                _this.recordList = resobj || [];
				    _this.checkedFACE_JKD.clear();
        	    }
		        if(_this.txType == "elecFence"){
		        	searchType = 'ELECFENCE';
	         	}
        	    _this.pushCacheOfLayerSearch(searchType,resobj,_this);
		        _this._showSearchPop(_this.recordList,searchType);
            },
            error: function (resobj) {
                fadingTip("服务器端异常，查询基础图层数据信息失败!");
            }
        });
    },
    //地图搜索后,将对应图层的缓存数据设置进行控制工具中
    pushCacheOfLayerSearch : function(searchType,resobj,_this){
    	if(!searchType || searchType == "ELECFENCE"){
	    	var oldArr=_this.elecFenceLayerControl.pointArr;
	    	var newArr=resobj.ELECFENCE.rows;
	    	$.each(newArr,function(i,item){
	    		if(!oldArr.contains(item)){
	    			oldArr.push(item);
	    		}
	    	});
	    }
	    if(!searchType || searchType == "JKD"){
	    	var oldArr=_this.firstClassControl.pointArr;
	    	var newArr=resobj.JKD.rows;
	    	$.each(newArr,function(i,item){
	    		if(!oldArr.contains(item)){
	    			oldArr.push(item);
	    		}
	    	});
	    }
	    if(!searchType || searchType == "FACE_JKD"){
	    	var oldArr=_this.facePointLayerControl.pointArr;
	    	var newArr=resobj.FACE_JKD.rows;
	    	$.each(newArr,function(i,item){
	    		if(!oldArr.contains(item)){
	    			oldArr.push(item);
	    		}
	    	});
	    }
    },
    _showUtilPop : function(resobj,searchType){
    	var _this = this;
    	_this.recordList = resobj || [];
	    _this.checkedFACE_JKD.clear();
	    this.curPage = 1;
	    this.pageSize = 10;
        $("#searchSortDiv").hide();
        $("#loadSearchLayer").show();
        _this._showSearchPop(_this.recordList,searchType);
    },
    _showSearchPop : function(recordList,searchType){
    	$("#searchPopup").show();
    	$(".SearchClose").show();
    	this.initSearchPageNo(searchType);
    	

    	this._controlBtnBox(searchType);
    	var searchPopupTop = $("#searchSortDiv").height() + 30 - 2;
    	if(searchType == 'JKD' || searchType == 'FACE_JKD'){
    		$("#JKDEquipmentState").css({"margin-top":$("#searchSortDiv").height() + "px"});
    		$("#JKDEquipmentState").show();
    		searchPopupTop = $("#searchSortDiv").height() + 30 + 32 - 2;
    	}else{
    		$("#JKDEquipmentState").hide();
    	}
    	$("#searchPopup").css({top:searchPopupTop + "px"});
    	if(searchType){
    		if(searchType == "CKXX"){
    			this.showCkxxPageResult();
    		}else{
	    		this.showCurPageResult(searchType,this.curPage,this.pageSize);
    		}
    	    this.curSearchLayerType = searchType;
    	}else{
    		this.showCurPageResult('JKD',this.curPage,this.pageSize);
    	    this.curSearchLayerType = "JKD";
    	}
    	
    },
    initSearchPageNo : function(searchType){
    	var _this = this;
    	var recordList = _this.recordList;
    	var aj = recordList.AJ;
    	var dt = recordList.DT;
    	var faceJKD = recordList.FACE_JKD;
    	var hotel = recordList.HOTEL;
    	var jkd = recordList.JKD;
    	var jq = recordList.JQ;
    	var jwt = recordList.JWT;
    	var netBar = recordList.NETBAR;
    	var zdqy = recordList.ZDQY;
    	var pk = recordList.PersonKu;
    	var wifi = recordList.WIFI;
    	var elecFence = recordList.ELECFENCE;
    	var carKK = recordList.CARKK;
    	var ckxx = recordList.CKXX;
    	var dzk = recordList.DZK;
    	if(searchType){
    		_this.clearLayerCount();
    		if(searchType == "JKD"){
    			$(".jkdCount").html("("+jkd.total+")");
    		}else if(searchType == "FACE_JKD"){
    			$(".faceJKDCount").html("("+faceJKD.total+")");
    		}else if(searchType == "JWT"){
    			$(".jwtCount").html("("+jwt.total+")");
    		}else if(searchType == "AJ"){
    			$(".caseCount").html("("+aj.total+")");
    		}else if(searchType == "JQ"){
    			$(".alarmCount").html("("+jq.total+")");
    		}else if(searchType == "HOTEL"){
    			$(".hotelCount").html("("+hotel.total+")");
    		}else if(searchType == "NETBAR"){
    			$(".netBarCount").html("("+netBar.total+")");
    		}else if(searchType == "DT"){
    			$(".dtCount").html("("+dt.total+")");
    		}else if(searchType == "ZDQY"){
    			$(".zdqyCount").html("("+zdqy.total+")");
    		}else if(searchType == "PersonKu"){
    			$(".pkCount").html("("+pk.total+")");
    		}else if(searchType == "WIFI"){
    			$(".WIFICount").html("("+wifi.total+")");
    		}else if(searchType == "ELECFENCE"){
    			$(".ELECFENCECount").html("("+elecFence.total+")");
    		}else if(searchType == "CARKK"){
    			$(".CARKKCount").html("("+carKK.total+")");
    		}else if(searchType == "CKXX"){
    			$(".ckxxCount").html("("+ckxx.total+")");
    		}else if(searchType == "DZK"){
    			$(".dzkCount").html("("+dzk.total+")");
    		}
    	}else{
    		$(".caseCount").html("("+aj.total+")");
	    	$(".dtCount").html("("+dt.total+")");
	    	$(".faceJKDCount").html("("+faceJKD.total+")");
	    	$(".hotelCount").html("("+hotel.total+")");
	    	$(".jkdCount").html("("+jkd.total+")");
	    	$(".alarmCount").html("("+jq.total+")");
	    	$(".jwtCount").html("("+jwt.total+")");
	    	$(".netBarCount").html("("+netBar.total+")");
	    	$(".zdqyCount").html("("+zdqy.total+")");
	    	$(".pkCount").html("("+pk.total+")");
			$(".WIFICount").html("("+wifi.total+")");
			$(".ELECFENCECount").html("("+elecFence.total+")");
			$(".CARKKCount").html("("+carKK.total+")");
			$(".ckxxCount").html("("+ckxx.total+")");
			$(".dzkCount").html("("+dzk.total+")");
    	}
    	$("#pageNo").html(1);
    	this.recordTotal = aj.total*1 + dt.total*1 + faceJKD.total*1 + hotel.total*1 + jkd.total*1 + jq.total*1 + jwt.total*1 + netBar.total*1+pk.total*1;
    },
    getDataByLayeType : function(type){
    	var recordList = this.recordList;
    	var resultData = [];
    	if(type == "JKD"){
    		resultData = recordList.JKD.rows;
    	}else if(type == "FACE_JKD"){
    		resultData = recordList.FACE_JKD.rows;
    	}else if(type == "JWT"){
    		resultData = recordList.JWT.rows;
    	}else if(type == "Jqcommand_JWT"){
    		resultData = recordList.JWT.rows;
    	}else if(type == "HOTEL"){
    		resultData = recordList.HOTEL.rows;
    	}else if(type == "NETBAR"){
    		resultData = recordList.NETBAR.rows;
    	}else if(type == "DT"){
    		resultData = recordList.DT.rows;
    	}else if(type == "AJ"){
    		resultData = recordList.AJ.rows;
    	}else if(type == "JQ"){
    		resultData = recordList.JQ.rows;
    	}else if(type == "Jqcommand_JQ"){
    		resultData = recordList.JQ.rows;
    	}else if(type == "ZDQY"){
    		resultData = recordList.ZDQY.rows;
    	}else if(type == "ELECFENCE"){
    		resultData = recordList.ELECFENCE.rows;
    	}else if(type == "WIFI"){
    		resultData = recordList.WIFI.rows;
    	}else if(type == "CARKK"){
    		resultData = recordList.CARKK.rows;
    	}else if(type == "PersonKu"){
    		resultData = recordList.PersonKu.rows;
    	}else if(type == "DZK"){
    		resultData = recordList.DZK.rows;
    	}
    	return resultData;
    },
    //获得总数
    getTotalByLayeType : function(type){
    	var recordList = this.recordList;
    	var resultData = 0;
    	if(type == "JKD"){
    		resultData = recordList.JKD.total;
    	}else if(type == "FACE_JKD"){
    		resultData = recordList.FACE_JKD.total;
    	}else if(type == "JWT"){
    		resultData = recordList.JWT.total;
    	}else if(type == "Jqcommand_JWT"){
    		resultData = recordList.JWT.total;
    	}else if(type == "HOTEL"){
    		resultData = recordList.HOTEL.total;
    	}else if(type == "NETBAR"){
    		resultData = recordList.NETBAR.total;
    	}else if(type == "DT"){
    		resultData = recordList.DT.total;
    	}else if(type == "AJ"){
    		resultData = recordList.AJ.total;
    	}else if(type == "JQ"){
    		resultData = recordList.JQ.total;
    	}else if(type == "Jqcommand_JQ"){
    		resultData = recordList.JQ.total;
    	}else if(type == "ZDQY"){
    		resultData = recordList.ZDQY.total;
    	}else if(type == "ELECFENCE"){
    		resultData = recordList.ELECFENCE.total;
    	}else if(type == "WIFI"){
    		resultData = recordList.WIFI.total;
    	}else if(type == "CARKK"){
    		resultData = recordList.CARKK.total;
    	}else if(type == "PersonKu"){
    		resultData = recordList.PersonKu.total;
    	}else if(type == "DZK"){
    		resultData = recordList.DZK.total;
    	}
    	return resultData*1;
    },
    showCurPageResult : function(type,curPageNo,curPageSize){
    	var _this = this;
    	var resultData = this.getDataByLayeType(type);
    	var result = resultData.slice((curPageNo-1) * curPageSize , curPageNo * curPageSize);
    	if(_this.dzwlChecked){
    		result = resultData;
    	}
    	var html = "";
    	$.each(result,function(i,item){
    		if(item.jjdbh){    //警情
    			html += "";
    			html += '<li class="Type01">';
                html += '<p class="ExpName" title="'+item.bjnr+'" onclick="top.jqClickEven(null,\''+item.jjdbh+'\')" ><img src="resource/scienceLayout/images/Gis/jq_34.png" width="34" height="34" style="padding:0px;">'+item.bjnr+'</p>';
	            html += '</li>';
    		}
    		if(item.topicId && item.topicType == '2'){    //网吧
    			html += "";
    			html += '<li class="Type01">';
                html += '<p class="ExpName" title="'+item.topicName+'" onclick="top.locationWbOrNetBar(\'2\',\''+item.topicId+'\')"><img src="resource/scienceLayout/images/Gis/wb_34.png" width="34" height="34" style="padding:0px;">'+item.topicName+'</p>';
	            html += '</li>';
    		}
    		if(item.topicId && item.topicType == '1'){    //宾馆
    			html += "";
    			html += '<li class="Type01">';
                html += '<p class="ExpName" title="'+item.topicName+'" onclick="top.locationWbOrNetBar(\'1\',\''+item.topicId+'\')" ><img src="resource/scienceLayout/images/Gis/jd_34.png" width="34" height="34" style="padding:0px;">'+item.topicName+'</p>';
	            html += '</li>';
    		}
    		if(item.gpsId){    //电台
    			var name = item.name || item.xm;
    			html += "";
    			html += '<li class="Type01">';
                html += '<p class="ExpName" title="'+name+'" onclick="top.locationDT(\''+name+'\')" ><img src="resource/scienceLayout/images/Gis/dt_34.png" width="34" height="34" style="padding:0px;">'+name+'</p>';
	            html += '</li>';
    		}
    		if(item.caseId){    //案件
    			html += "";
    			html += '<li class="Type01">';
                html += '<p class="ExpName" title="'+item.casename+'" onclick="top.caseClickEven(null,\''+item.caseId+'\')" ><img src="resource/scienceLayout/images/Gis/aj_34.png" width="34" height="34" style="padding:0px;">'+item.casename+'</p>';
	            html += '</li>';
    		}
    		if(item.puid && item.deviceType == "119"){    //人脸卡口
    			html += "";
    			html += '<li class="Type01">';
                html += '<p class="ExpName" title="'+item.name+'" style="width: 95%;" onclick="top.locationFaceJKD(\''+item.puid+'\')"><img src="resource/scienceLayout/images/Gis/rlkk_34.png" width="34" height="34" style="padding:0px;">'+item.name+'</p>';
                html += '<input style="margin-right: 0px;float:right;margin-top:10px;" class="faceJKDCheckBox" type="checkbox" '+(_this.checkedFACE_JKD.get(item.puid) == null ? '' : 'checked') +'  point_id="'+item.pointId+'" state="'+item.state+'" pu_id="'+item.puid+'" deviceType="'+item.deviceType+'" name="'+item.name+'" lon="'+item.lon+'"  lat="'+item.lat+'" channel="'+item.channel+'"/>';
	            html += '</li>';
    		}
    		if(item.puid && item.deviceType != "119"){    //监控点
    			var data = JSON.stringify(item).replace(/\"/g,"'");
    			//用于区分设备在线与不在线
    			var src = "";
    			if(item.state==null||item.state==""||item.state==0||item.state==113)
    				src = "resource/scienceLayout/images/Gis/SIcon02.png";
    			else
    				src = "resource/scienceLayout/images/Gis/SIcon02_on.png";
    			html += "";
    			html += '<li class="Type01">';
                html += '<p class="ExpName" title="'+item.name+'" style="width: 95%;" ondblclick="top.viewBasalVideoJKD(this)" onclick="top.locationJKD(\''+item.puid+'\')" ><img src="'+src+'" style="margin-top: 5px;margin-right: 6px;" width="20" height="20">'+item.name+'</p>';
                html += '<input style="margin-right: 0px;float:right;margin-top:10px;"  data="'+data+'"  type="checkbox" '+(_this.checkedJKD.get(item.puid) == null ? '' : 'checked') +' class="jdkCheckBox" point_id="'+item.pointId+'" state="'+item.state+'" pu_id="'+item.puid+'" pointType="'+item.pointType+'" name="'+item.name+'" lon="'+item.lon+'"  lat="'+item.lat+'" channel="'+item.channel+'"/>';
	            html += '</li>';
    		}
    		if(item.REAL_NAME){    //警务通
    			html += "";
    			html += '<li class="Type01">';
                html += '<p class="ExpName" title="'+item.REAL_NAME+'" onclick="top.locationJWT(\''+item.CUST_ID+'\')" ><img src="resource/scienceLayout/images/Gis/jwt_34.png" width="34" height="34" style="padding:0px;">'+item.REAL_NAME+'</p>';
	            html += '</li>';
    		}
    		if(item.extent){    //警务通
    			html += "";
    			html += '<li class="Type01">';
    			html += '<p class="ExpName" title="'+item.name+'" onclick="top.locationZDQY(\''+item.id+'\')" ><img src="resource/scienceLayout/images/Gis/zdqy_34.png" width="34" height="34" style="padding:0px;">'+item.name+'</p>';
    			html += '</li>';
    		}
    		
    		if(item.DEVICE_NAME){    //卡口点位
    			var data = JSON.stringify(item).replace(/\"/g,"'");
    			html += "";
    			html += '<li class="Type01">';
    			html += '<p class="ExpName"  onclick="top.carkkEvent(\''+item.KKBH+'\')" title="'+item.DEVICE_NAME+'"  ><img src="resource/scienceLayout/images/Gis/zdqy_34.png" width="34" height="34" style="padding:0px;">'+item.DEVICE_NAME+'</p>';
    			html += '<input style="margin-right: 0px;float:right;margin-top:10px;"  data="'+data+'" type="checkbox"  '+(_this.checkedCarkk.get(item.KKBH) == null ? '' : 'checked') + ' class="carkkCheckBox" kkid="'+item.KKBH+'" />';
    			html += '</li>';
    		}
    		
    		if(item.ZDMC){    //电子围栏
    			html += "";
    			if(_this.dzwlChecked){
    				if(_this.dzwlChecked.indexOf(item.ZDBH) > -1){
    					var data = JSON.stringify(item).replace(/\"/g,"'");
    					_this.checkedDZWL.put(item.ZDBH,data);
    					html += '<li class="Type01">';
    					html += '<p class="ExpName" onclick="top.zdwlEvent(\''+item.ZDBH+'\')" title="'+item.ZDMC+'"  ><img src="resource/scienceLayout/images/Gis/zdqy_34.png" width="34" height="34" style="padding:0px;">'+item.ZDMC+'</p>';
    					html += '<input style="margin-right: 0px;float:right;margin-top:10px;"   data="'+data+'" type="checkbox" checked class="dzwlCheckBox" zdbh="'+item.ZDBH+'" />';
    					html += '</li>';
    				}
    			}else{
    				var data = JSON.stringify(item).replace(/\"/g,"'");
    				html += '<li class="Type01">';
    				html += '<p class="ExpName"  onclick="top.zdwlEvent(\''+item.ZDBH+'\')" title="'+item.ZDMC+'"  ><img src="resource/scienceLayout/images/Gis/zdqy_34.png" width="34" height="34" style="padding:0px;">'+item.ZDMC+'</p>';
    				html += '<input style="margin-right: 0px;float:right;margin-top:10px;"   data="'+data+'" type="checkbox" '+(_this.checkedDZWL.get(item.ZDBH) == null ? '' : 'checked') + ' class="dzwlCheckBox" zdbh="'+item.ZDBH+'" />';
    				html += '</li>';
    			}
    		}
    		
    		if(item.PLACE_NAME){    //wifi设备
    			var data = JSON.stringify(item).replace(/\"/g,"'");
    			html += "";
    			html += '<li class="Type01">';
    			html += '<p class="ExpName" title="'+item.PLACE_NAME+'" onclick="top.wifiEvent(\''+item.NETBAR_WACODE+'\')" ><img src="resource/scienceLayout/images/Gis/zdqy_34.png" width="34" height="34" style="padding:0px;">'+item.PLACE_NAME+'</p>';
    			html += '<input style="margin-right: 0px;float:right;margin-top:10px;" '+(_this.checkedWifi.get(item.NETBAR_WACODE) == null ? '' : 'checked') + '  type="checkbox"   data="'+data+'" class="wifiCheckBox" netbar="'+item.NETBAR_WACODE+'" placename="'+item.PLACE_NAME+'" />';
    			html += '</li>';
    		}
    		if(item.SFZH){//人员库信息
    			html += '<li>';
    			html += '<div class="GCourseList" style="border:none;margin:5px;padding:0px;" gid="'+(item.ID||item.id)+'">';
    			html += '  <div class="GCourseList_r GCourseList_r02">';
    			html += '    <div class="GPoliceListBtnBox02">';
    			html += '      <a href="javascript:void(0);" class="GPoliceListBtn01" mark="dingwei" gid="'+(item.ID||item.id)+'" title="定位"></a>';
    			if(item.ATTID){
					html+='     	<a href="javascript:void(0);" class="GPoliceListBtn02_on" mark="attention" gid="'+(item.ID||item.id)+'" fpapercode="'+(item.SFZH||item.sfzh)+'" custId="'+(item.CUST_ID||item.custId)+'" attId="'+(item.FOCALOBJID||item.focalobjid)+'" title="取消关注"></a>';
				}else{
					html+='     	<a href="javascript:void(0);" class="GPoliceListBtn02" mark="attention" gid="'+(item.ID||item.id)+'" fpapercode="'+(item.SFZH||item.sfzh)+'" custId="'+(item.CUST_ID||item.custId)+'" title="关注"></a>';
				}
    			html += '    </div>';
    			html += '    <div class="GCourseList_r_line" style="border:none;" gid="'+(item.ID||item.id)+'" lon="'+dealWithParam(item.LONGITUDE||item.longitude)+'" lat="'+dealWithParam(item.LATITUDE||item.latitude)+'">';
    			html += '      <div class="fl" style="width:62px;">';
    			html += '        <div class="GLocaleImg fn" style="width:60px;margin-bottom:2px;" id="'+(item.SFZH||item.sfzh)+'" objId="'+(item.ID||item.id)+'">';
    			html += '		   <img src="/personPics/'+(item.SFZH||item.sfzh)+'.jpg" onerror="this.src=\'resource/images/PopUp/User02.png\'" width="60" height="60">';
    			html += '        </div>';
    			html += '        <p class="subBtn01" style="width: 60px;padding:0px;margin-bottom:2px;" mark="bianji" gid="'+(item.ID||item.id)+'">编辑</p>';
    			html += '      </div>';
    			html += '      <div class="fl" style="margin-left:10px;width:240px;">';
    			html += '        <p class="GCourseListName">姓名：'+dealWithParam(item.XM)+'</p>';
    			html += '        <p>身份证号：<span class="PUFTableTitle02" camark="caSearch" zjtype="sfzh" xm="'+dealWithParam(item.XM)+'" sfzh="'+dealWithParam(item.SFZH)+'">'+dealWithParam((item.SFZH||item.sfzh))||""+'</span></p>';
				html += '        <p>人员类型：'+dealWithParam(getZdryxl(item.ZDRYXL))+'</p>';
				html += '        <p>户籍地：'+dealWithParam(item.HJDXZ||item.hjdxz)||""+'</p>';
				html += '  	     <p>现住地：'+dealWithParam(item.XZDXZ||item.xzdxz)||""+'</p>';
    			html += '      </div>';
    			html += '      <div class="clear"></div>';
    			html += '    </div>';
    			html += '  </div>';
    			html += '</div>';
    			html += '</li>';
    		}
    		if(item.POI_NAME){    //地址库
    			var data = JSON.stringify(item).replace(/\"/g,"'");
    			html += "";
    			html += '<li class="Type01">';
    			html += '<p class="ExpName" title="'+item.POI_NAME+'" onclick="top.dzkEvent(\''+item.POI_ID+'\',\''+item.POI_NAME+'\',\''+item.ADDRESS+'\',\''+item.LONGITUDE+'\',\''+item.LATITUDE+'\')" ><img src="resource/scienceLayout/images/Gis/zdqy_34.png" width="34" height="34" style="padding:0px;">'+item.POI_NAME+'</p>';
    			html += '<input style="margin-right: 0px;float:right;margin-top:10px;" '+(_this.checkedWifi.get(item.POI_NAME) == null ? '' : 'checked') + '  type="checkbox"   data="'+data+'" class="wifiCheckBox" netbar="'+item.POI_NAME+'" placename="'+item.POI_NAME+'" />';
    			html += '</li>';
    		}
    	})
    	var size = _this.getTotalByLayeType(type);
    	if(_this.dzwlChecked){
    		size = _this.dzwlChecked.split(",").length;
    	}
    	if($("#loadSearchLayer").is(":hidden")){
    		$("#gisSearchPage").hide();
	    	$("#gisSearchPage").bigPage({
	            data: size*1,//总记录条数
	            pageSize: curPageSize,//页面大小
	            toPage: $("#toPageNum").val()||1,//到指定页
	            position: "down",
	            isShort : true,
	            callback: function ($table) {
	                pageIndex = parseInt($table.config.toPage);
			    	$("#toPageNum").val(pageIndex);
	    			this.curSearchLayerType = type;
			        type=type.replace("elecFence","ELECFENCE");
	    			var param={
	    				layerType: type
	    			};
			    	_this._queryLayerResource(param,type);
	            }
	        });
	    	$("#showContent").html(html);
	    	$("#contentList").show();
	    	$("#ckxxContent").hide();
        }
        else{
    		$("#gisSearchPage").show();
    		$("#searchResultDiv .bigpage").remove();
	    	if((Math.floor((size - 1)  / curPageSize + 1 )) <= curPageNo){  //最大页码小于或等于 最大页数  下一页 置  灰
	    		$("#nextPageSearch").removeClass().addClass("PSBGisBut03_no");
	    	}else{
	    		$("#nextPageSearch").removeClass().addClass("PSBGisBut03");
	    	}
	    	if(curPageNo == 1){
	    		$("#lastPageSearch").removeClass().addClass("PSBGisBut03_no");
	    	}else{
	    		$("#lastPageSearch").removeClass().addClass("PSBGisBut03");
	    	}
	    	$("#showContent").html(html);
	    	$("#contentList").show();
	    	$("#ckxxContent").hide();
	    	if(size == 0){
	    		$("#pageSize").html("1");
	    	}else{
		    	$("#pageSize").html(Math.floor((size - 1)  / curPageSize + 1 ));
	    	}
		}
    	this.bindPageEven();
    	if(type.indexOf("PersonKu")>-1){
    		this.bindPersonKuEvent();
    	}
    },
    //人员库事件
    bindPersonKuEvent : function(){
		//bindSfzhEvents();
    	initCaEvent();
		//列表点击事件
		$("#showContent .GCourseList_r_line").unbind("click").bind("click",function(e){
			var event = window.event || arguments.callee.caller.arguments[0];
			event.stopPropagation();
			var id=$(this).attr("gid");
			//将选择的模块改成选中的样式
			$("#showContent .GCourseList_on").removeClass("GCourseList_on").addClass("GCourseList");
			$("#showContent .GCourseList[gid='"+id+"']").removeClass("GCourseList").addClass("GCourseList_on");
			var lon=$(this).attr("lon")*1;
			var lat=$(this).attr("lat")*1;
			window.gisInteraction.clearPopup();
			if(lon && lat){
				var obj= window.eal.personForMap.get(id);
				//取得最新的经纬度
				lon=$(".GCourseList_r_line[gid='"+id+"']").attr("lon")*1.0;
				lat=$(".GCourseList_r_line[gid='"+id+"']").attr("lat")*1.0;
				obj.LONGITUDE=lon;
				obj.LATITUDE=lat;
				showFocalmanOnMapMsg({
					"ID":obj.id||obj.ID,
					"LONGITUDE":obj.longitude||obj.LONGITUDE,
					"LATITUDE":obj.latitude||obj.LATITUDE,
					"XM":obj.xm||obj.XM,
					"EXT1":obj.ext1||obj.EXT1,
					"SFZH":obj.sfzh||obj.SFZH,
					"ZDRYXL":obj.zdryxl||obj.ZDRYXL,
					"XZDPCS":obj.xzdpcs||obj.XZDPCS,
					"ZRMJ":obj.zrmj||obj.ZRMJ,
					"XZDXZ":obj.xzdxz||obj.XZDXZ
				});
			}
			else{
				fadingTip("未定义坐标");
			}
		});
		//打开人员详情,点击人员头像
		$("#showContent .GLocaleImg").unbind("click").bind("click",function(e){
			var event = window.event || arguments.callee.caller.arguments[0];
			event.stopPropagation();
			showPersonDetail($(this).attr("objId"),null,$(this).attr("id"));
		});
		//编辑
		$("#showContent p[mark='bianji']").unbind("click").bind("click",function(e){
			var event = window.event || arguments.callee.caller.arguments[0];
			event.stopPropagation();
			var id=$(this).attr("gid");
			updatePersonInfo(id,"$!{type}");
		});
		//定位
		$("#showContent .GPoliceListBtn01[mark='dingwei']").unbind("click").bind("click",function(e){
			var event = window.event || arguments.callee.caller.arguments[0];
			event.stopPropagation();
	    	window.gisInteraction.clearPopup();
			var id=$(this).attr("gid");
			var lon=$(".GCourseList_r_line[gid='"+id+"']").attr("lon")*1.0;
			var lat=$(".GCourseList_r_line[gid='"+id+"']").attr("lat")*1.0;
			var obj=window.eal.personForMap.get(id);
			resetLonLat(id,lon,lat,obj,function(pos){
				//重定位后,将原始数据经纬度重置
				$(".GCourseList_r_line[gid='"+id+"']").attr("lon",pos[0]);
				$(".GCourseList_r_line[gid='"+id+"']").attr("lat",pos[1]);
				obj.LONGITUDE=pos[0];
				obj.LATITUDE=pos[1];
				obj.longitude=pos[0];
				obj.latitude=pos[1];
				window.eal.personForMap.put(id,obj);
			});
		});
		//关注
		$("#showContent .GPoliceListBtnBox02 a[mark='attention']").unbind("click").bind("click",function(e){
			var event = window.event || arguments.callee.caller.arguments[0];
			event.stopPropagation();
			var id=$(this).attr("gid");
			var obj=window.eal.personForMap.get(id);
			changeAttention(this,obj);
		});
    },
    showCkxxPageResult : function(){
    	var _this = this;
    	var curPageSize = _this.ckxxPageSize;
    	var curPageNo = _this.ckxxPageIndex;
    	var resultData = _this.recordList.CKXX.rows;
    	var size = _this.recordList.CKXX.total;
    	var html = '';
    	$.each(resultData,function(i,item){
    		html += '<div tar="ckxx" class="FCourseList" xm="'+item.XM+'" sfzh="'+item.SFZHM+'">';
    		html += '	<div class="FCourseList_r FCourseList_r02">';
    		html += '		<div class="FCourseList_r_line">';
    		html += '			<p>姓名：'+item.XM+'</p> ';
    		html += '			<p>身份证号：'+item.SFZHM+'</p>';
    		var xb = "";
    		if(item.XB == "1"){
    			xb = "男";
    		}else if(item.XB == "2"){
    			xb = "女";
    		}
    		html += '			<p>性别：'+xb+'</p>';
    		html += '			<p>户籍地详址：'+dealWithParam(item.HKSZDXZ)+'</p>';
    		html += '			<p>现住地详址：'+dealWithParam(item.SJJZXZ)+'</p>';
    		html += '		</div>';
    		html += '	</div>';
    		html += '	<div class="FCourseList_j01"></div>';
    		html += '	<div class="FCourseList_j02"></div>';
    		html += '	<div class="FCourseList_j03"></div>';
    		html += '	<div class="FCourseList_j04"></div>';
    		html += '</div>';
    	});
    	
    	if((Math.floor((size - 1)  / curPageSize + 1 )) <= curPageNo){  //最大页码小于或等于 最大页数  下一页 置  灰
    		$("#nextPageSearch").removeClass().addClass("PSBGisBut03_no");
    	}else{
    		$("#nextPageSearch").removeClass().addClass("PSBGisBut03");
    	}
    	if(curPageNo == 1){
    		$("#lastPageSearch").removeClass().addClass("PSBGisBut03_no");
    	}else{
    		$("#lastPageSearch").removeClass().addClass("PSBGisBut03");
    	}
    	$("#contentList").hide();
    	$("#ckxxContent").html(html);
    	$("#ckxxContent").show();
    	if(size == 0){
    		$("#pageSize").html("1");
    	}else{
	    	$("#pageSize").html(Math.floor((size - 1)  / curPageSize + 1 ));
    	}
    	$("#pageNo").html(_this.ckxxPageIndex);
    	this.bindPageEven();
    },
    //展示人员库信息
    showPersonKuPageResult : function(){
    	var _this = this;
    	var curPageSize = _this.ckxxPageSize;
    	var curPageNo = _this.ckxxPageIndex;
    	var resultData = _this.recordList.CKXX.rows;
    	var size = _this.recordList.CKXX.total;
    	var html = '';
    	$.each(resultData,function(i,item){
    		html += '<div tar="ckxx" class="FCourseList" xm="'+item.XM+'" sfzh="'+item.SFZHM+'">';
    		html += '	<div class="FCourseList_r FCourseList_r02">';
    		html += '		<div class="FCourseList_r_line">';
    		html += '			<p>姓名：'+item.XM+'</p> ';
    		html += '			<p>身份证号：'+item.SFZHM+'</p>';
    		var xb = "";
    		if(item.XB == "1"){
    			xb = "男";
    		}else if(item.XB == "2"){
    			xb = "女";
    		}
    		html += '			<p>性别：'+xb+'</p>';
    		html += '			<p>户籍地详址：'+dealWithParam(item.HKSZDXZ)+'</p>';
    		html += '			<p>现住地详址：'+dealWithParam(item.SJJZXZ)+'</p>';
    		html += '		</div>';
    		html += '	</div>';
    		html += '	<div class="FCourseList_j01"></div>';
    		html += '	<div class="FCourseList_j02"></div>';
    		html += '	<div class="FCourseList_j03"></div>';
    		html += '	<div class="FCourseList_j04"></div>';
    		html += '</div>';
    	});
    	
    	if((Math.floor((size - 1)  / curPageSize + 1 )) <= curPageNo){  //最大页码小于或等于 最大页数  下一页 置  灰
    		$("#nextPageSearch").removeClass().addClass("PSBGisBut03_no");
    	}else{
    		$("#nextPageSearch").removeClass().addClass("PSBGisBut03");
    	}
    	if(curPageNo == 1){
    		$("#lastPageSearch").removeClass().addClass("PSBGisBut03_no");
    	}else{
    		$("#lastPageSearch").removeClass().addClass("PSBGisBut03");
    	}
    	$("#contentList").hide();
    	$("#ckxxContent").html(html);
    	$("#ckxxContent").show();
    	if(size == 0){
    		$("#pageSize").html("1");
    	}else{
	    	$("#pageSize").html(Math.floor((size - 1)  / curPageSize + 1 ));
    	}
    	$("#pageNo").html(_this.ckxxPageIndex);
    	this.bindPageEven();
    },
    isInteger : function(obj){
    	var result = false
    	if(obj > 0 && Math.floor(obj) === obj){
    		result = true;
    	}
    	return result;
    },
    bindPageEven :　function(){  //绑定翻页事件
    	var _this = this ;
    	$("#nextPageSearch").unbind().bind('click',function(){
    		$("#selectAllEquip").attr("checked",false);
    		if($(this).hasClass("PSBGisBut03")){
    			if(_this.curSearchLayerType == "CKXX"){
    				_this.ckxxPageIndex ++;
    				var params = new Object();
    				_this._queryLayerResource(params,"CKXX");
    			}else{
    				_this.curPage ++;
    			 	_this.showCurPageResult(_this.curSearchLayerType,_this.curPage,_this.pageSize);
    			 	$("#pageNo").html(_this.curPage);
    			}
    		}
    	})
    	
    	$("#lastPageSearch").unbind().bind('click',function(){
    		$("#selectAllEquip").attr("checked",false);
    		if($(this).hasClass("PSBGisBut03")){
    			if(_this.curSearchLayerType == "CKXX"){
    				_this.ckxxPageIndex --;
    				var params = new Object();
    				_this._queryLayerResource(params,"CKXX");
    			}else{
	    			_this.curPage -- ;
	    			_this.showCurPageResult(_this.curSearchLayerType,_this.curPage,_this.pageSize);
	    			$("#pageNo").html(_this.curPage);
    			}
    		}
    	})
    	
    	$("#toPageNo").unbind().bind("click",function(){
    		var toPageNum = $("#toPageNum").val();
    		if(dealWithParam(toPageNum) == ""){
    			fadingTip("请输入需跳转的页号",2000);
    			return;
    		}
    		if(_this.isInteger(toPageNum)){
    			fadingTip("请输入正确的页号",2000);
    			return;
    		}
    		if( toPageNum *1 > $("#pageSize").html()*1){
    			fadingTip("您已超出最大页号",2000);
    			return;
    		}
    		$("#selectAllEquip").attr("checked",false);
    		if(_this.curSearchLayerType == "CKXX"){
				_this.ckxxPageIndex = toPageNum;
				var params = new Object();
				_this._queryLayerResource(params,"CKXX");
			}else{
	    		_this.curPage = toPageNum;
	    		$("#pageNo").html(toPageNum);
	    		 _this.showCurPageResult(_this.curSearchLayerType,toPageNum,_this.pageSize);
			}
    	})
    	
    	$("#videoPreviewBtn").unbind().bind("click",function(){
    		var tmpAllSavedObj = $(".jdkCheckBox:checked");
			if(tmpAllSavedObj.size()<1){
				fadingTip("请选择对应的监控点");
				return;
			};
			var tmpEquipArr = [];
			tmpAllSavedObj.each(function (index, domEle) { 
				var objTmp = $(domEle);
				var tmpObj = null;

				var tmpLon = (objTmp.attr("lon")=="null" ||objTmp.attr("lon")==null ||
						objTmp.attr("lon")=="")? 0:objTmp.attr("lon")*1;
				var tmpLat = (objTmp.attr("lat")=="null" ||objTmp.attr("lat")==null  ||
						objTmp.attr("lat")=="")? 0:objTmp.attr("lat")*1;

				tmpObj = {
						"point_id":objTmp.attr("point_id"),
						"pu_id": objTmp.attr("pu_id"),
						"channel":objTmp.attr("channel")*1,
						"name":objTmp.attr("name"),
						"lon":tmpLon,
						"lat":tmpLat,
						"pointType":objTmp.attr("pointType")*1,
						"state":objTmp.attr("state")*1
				};   

				tmpEquipArr.push(tmpObj);
			});
			var allObjTmpStr =JSON.stringify(tmpEquipArr);
			allObjTmpStr = '{"pointList":'+allObjTmpStr+'}';
			sendMsgToClient("484","");
			sendMsgToClient("105",allObjTmpStr);
    	})
    	
    	$("#videoReplayBtn").unbind().bind("click",function(){
    		var tmpAllSavedObj = $(".jdkCheckBox:checked");
			if(tmpAllSavedObj.size()<1){
				fadingTip("请选择对应的监控点");
				return;
			};
			var tmpEquipArr = [];
			tmpAllSavedObj.each(function (index, domEle) { 
				var objTmp = $(domEle);   
				var tmpObj = null;
				var tmpLon = (objTmp.attr("lon")=="null" ||objTmp.attr("lon")==null  ||
						objTmp.attr("lon")=="")? 0:objTmp.attr("lon")*1;
				var tmpLat = (objTmp.attr("lat")=="null" ||objTmp.attr("lat")==null  ||
						objTmp.attr("lat")=="")? 0:objTmp.attr("lat")*1;	
				tmpObj = {
						"point_id":objTmp.attr("point_id"),
						"pu_id": objTmp.attr("pu_id"),
						"channel":objTmp.attr("channel")*1,
						"name":objTmp.attr("name"),
						"lon":tmpLon,
						"lat":tmpLat,
						"pointType":objTmp.attr("pointType")*1,
						"state":objTmp.attr("state")*1
				};   
				tmpEquipArr.push(tmpObj);
			});
			var allObjTmpStr =JSON.stringify(tmpEquipArr);
			allObjTmpStr = '{"pointList":'+allObjTmpStr+'}';
			sendMsgToClient("106",allObjTmpStr);
    	})
    	
    	$("#sskkSearch").unbind().bind('click',function(){
    		 var keys = _this.checkedFACE_JKD.keys();
    		 if(keys == 0){
    			 fadingTip("至少选择一个卡口点位",2000);
    			 return;
    		 }
        	 sskk(_this.checkedFACE_JKD.values());
    	})
    	
    	$("#rljsSearch").unbind().bind('click',function(){
    		var keys = _this.checkedFACE_JKD.keys();
    		if(keys == 0){
    			fadingTip("至少选择一个卡口点位",2000);
    			return;
    		}
    		top.faceSearch = jQuery.fn.scienceDialog({
			    url : "faceSearchQuery.do?puid="+keys.join(","),
			    zIndex : 999999,
				width:'auto',
				height:'auto',
			    top:0,
			    close:function(){
			    	top.faceSearch=null;
			    }
			});
    	})
    	
    	$(".jdkCheckBox").unbind().bind('click',function(){
    		var puId = $(this).attr("pu_id");
    		if($(this).attr("checked") == "checked"){
    			_this.checkedJKD.put(puId,$(this).attr("data"));
    		}else{
    			_this.checkedJKD.remove(puId);
    		}
    	})
    	
    	$(".jdkCheckBox").unbind().bind('click',function(){
    		var puId = $(this).attr("pu_id");
    		if($(this).attr("checked") == "checked"){
    			_this.checkedJKD.put(puId,$(this).attr("data"));
    		}else{
    			_this.checkedJKD.remove(puId);
    		}
    	})
    	
    	
    	$(".carkkCheckBox").unbind().bind('click',function(){
    		var puId = $(this).attr("kkid");
    		if($(this).attr("checked") == "checked"){
    			_this.checkedCarkk.put(puId,$(this).attr("data"));
    		}else{
    			_this.checkedCarkk.remove(puId);
    		}
    	})
    	
    	$(".dzwlCheckBox").unbind().bind('click',function(){
    		var puId = $(this).attr("zdbh");
    		if($(this).attr("checked") == "checked"){
    			_this.checkedDZWL.put(puId,$(this).attr("data"));
    		}else{
    			_this.checkedDZWL.remove(puId);
    		}
    	})
    	
    	$(".wifiCheckBox").unbind().bind('click',function(){
    		var puId = $(this).attr("netbar");
    		if($(this).attr("checked") == "checked"){
    			_this.checkedWifi.put(puId,true);
    		}else{
    			_this.checkedWifi.remove(puId);
    		}
    	})
    	
    	$(".faceJKDCheckBox").unbind().bind('click',function(){
    		 var puid = $(this).attr("pu_id");
    		 var lon = $(this).attr("lon");
    		 var lat = $(this).attr("lat");
    		 var state = $(this).attr("state");
    		 var name = $(this).attr("name");
    		 var channel = $(this).attr("channel");
    		 var obj = new Object();
    		 obj.puid = puid;
    		 obj.lon = lon;
    		 obj.lat = lat;
    		 obj.state = state;
    		 obj.name = name;
    		 obj.channel = channel;
    		 if($(this).attr("checked") == "checked"){
    			 _this.checkedFACE_JKD.put(puid,obj);
    		 }else{
    			 _this.checkedFACE_JKD.remove(puId);
    		 }
    	})
    	
    	$("div[tar='ckxx']").unbind().bind('click',function(){
    		var url="toPersonDetail500227.do?xm="+$(this).attr("xm")+"&sfzh="+$(this).attr("sfzh");
			url=encodeURI(encodeURI(url));
			var title="人员详情";
			if($(this).attr("xm")){
				title+="("+$(this).attr("xm")+")";
			}
			top.editFocalmanBaseInfoDialog = jQuery.fn.scienceDialog({
		        url: url,
		        title : title,
				zIndex : 99999,
		        width: 'auto',
		        height: 'auto',
		        min : true,
		        close: function () {
		        	top.editFocalmanBaseInfoDialog=null;
		        }
		    });
    	})
    	
    },
    loadSearchLayer : function(type){   //假分页加载
//    	if(type == 'JKD' || type == 'FACE_JKD' || dealWithParam(type) == ""){
 //   		$("#JKDEquipmentState").show();
  //  		var searchPopupTop = $("#loadSearchLayer").height() + 30 + 32 - 2;
  //          $("#searchPopup").css({top:searchPopupTop + "px"});
   // 	}else{
    //		$("#JKDEquipmentState").hide();
    	//	var searchPopupTop = $("#loadSearchLayer").height() + 30 - 2;
    //        $("#searchPopup").css({top:searchPopupTop + "px"});
    //	}
    	
    	this._controlBtnBox(type);
    	$("#JKDEquipmentState").hide();
    	searchPopupTop = $("#searchSortDiv").height() + 32 - 2;
    	$("#searchPopup").css({top:searchPopupTop + "px"});
    	this.curPage = 1;  //重新加载
    	this.curSearchLayerType = type;
    	this.showCurPageResult(type,this.curPage,this.pageSize);
    	$("#searchLabel").html(this.getLableHtmlByLayeType(this.curSearchLayerType));
//    	$("#searchLabel").attr("layerType",type);
    	$(".SearchBarInput").css({"padding-left": "75px"});
    },
    _controlBtnBox : function(type){
    	$("#JKD_BtnBox,#FACE_JKD_BtnBox").hide();
    	if(type == "JKD"){
    		$("#JKD_BtnBox").show();
    		$("#JKDEquipmentState").show();
    		searchPopupTop = $("#searchSortDiv").height() + 30 + 32 - 2;
    		$("#searchPopup").css({top:searchPopupTop + "px"});
    		$("#JKDEquipmentState").css({'margin-top': '40'});
    	}else if(type == "FACE_JKD"){
    		$("#FACE_JKD_BtnBox").show();
    		$("#JKDEquipmentState").show();
    		searchPopupTop = $("#searchSortDiv").height() + 30 + 32 - 2;
    		$("#searchPopup").css({top:searchPopupTop + "px"});
    	}else{
    		$("#JKDEquipmentState").hide();
    		searchPopupTop = $("#searchSortDiv").height() + 32 - 2;
    		$("#searchPopup").css({top:searchPopupTop + "px"});
    	}
    },
    getLableHtmlByLayeType : function(type){
    	var html = "";
    	if(type == "JKD"){
    		html =  "监控点位";
    	}else if(type == "FACE_JKD"){
    		html =  "人脸卡口";
    	}else if(type == "JWT"){
    		html =  "警务通";
    	}else if(type == "HOTEL"){
    		html =  "宾馆";
    	}else if(type == "NETBAR"){
    		html =  "网吧";
    	}else if(type == "DT"){
            html =  "电台";    		
    	}else if(type == "AJ"){
    		html =  "案件";   
    	}else if(type == "JQ"){
    		html =  "警情";   
    	}else if(type == "ZDQY"){
    		html =  "重点区域";   
    	}else if(type == "WIFI"){
    		html =  "WIFI";   
    	}else if(type == "CKXX"){
    		html =  "常口信息";   
    	}else if(type == "PersonKu"){
    		html =  "人员库";   
    	}else if(type == "ELECFENCE"){
    		html =  "电子围栏";   
    	}else if(type == "CARKK"){
    		html =  "车辆卡口";   
    	}
    	return html;
    },
    querySearchLayer : function(type){  //请求查询
    	$("#selectAllEquip").attr("checked",false);
    	this._controlBtnBox(type);
    	this.curPage = 1;  //重新加载
    	$("#toPageNum").val(1);
    	this.curSearchLayerType = type;
    	var params = new Object();
    	params.layerType = type;
    	params.searchKey = $(".SearchBarInput").val();
    	params.state = $('input:radio[name="equipmentState"]:checked').val();
    	this._queryLayerResource(params,type);
    	$("#loadSearchLayer").hide();
    	$("#searchSortDiv").show();
    	$("#searchLabel").attr("layerType",type);
    	$("#searchLabel").html(this.getLableHtmlByLayeType(this.curSearchLayerType));    	
    	var searchPopupTop = $("#searchSortDiv").height() + 30 - 2;
    	
    	if(type == 'JKD' || type == 'FACE_JKD'){
    		$("#JKDEquipmentState").css({"margin-top":$("#searchSortDiv").height() + "px"});
    		$("#JKDEquipmentState").show();
    		searchPopupTop = $("#searchSortDiv").height() + 30 + 32 - 2;
    	}else{
    		$("#JKDEquipmentState").hide();
    	}
    	$("#searchPopup").css({top:searchPopupTop + "px"});
    	$("#pageNo").html(this.curPage);
    	$(".SearchBarInput").css({"padding-left": "75px"});
    },
    CLASS_NAME: "BasalResourcesLayerControl"
};

function loadSearchLayer(type){
	basalResourcesLayerControl.curSearchLayerType = type;
	basalResourcesLayerControl.loadSearchLayer(type);
}

function querySearchLayer(type){
	basalResourcesLayerControl.curSearchLayerType = type;
	basalResourcesLayerControl.querySearchLayer(type);
}

function queryCkxxLayer(type){
	basalResourcesLayerControl.ckxxPageIndex = 1;
	basalResourcesLayerControl.curSearchLayerType = type;
	basalResourcesLayerControl.showCkxxPageResult();
}

/**
 * 检索
 * @returns {Boolean}
 */
function faceQueryRLSB() {
	
	//移除结果列表
	if (!!window["resultListObj"]) {
		window["resultListObj"]._destroy();
	}

	var param = new FormData();
	param.append("page", 1);
	param.append("rows", 10);
	
	var ajaxParam = {
		async: true,
 		cache: false,
 		type: "POST",
 		data: param,
 		processData: false,
 		contentType: false
	};
	
	ajaxParam["url"] = "faceQueryData.do";
	ajaxParam["data"] = param;
	//请求成功处理函数
	ajaxParam["success"] = function(data) {
		$endTime = new Date().getTime();
		if (!!curPageData) {
			curPageData.rows = curPageData.rows(eval("(" + data + ")").rows);
		} else {
			curPageData = eval("(" + data + ")");
		}
		
		var respData = eval("(" + data + ")");
		
		var resp = eval("(" + respData.resp + ")");
		
		var rows = resp.rows;
		var total = resp.total;
		var loadData = [];
		for (var i in rows) {
			var sex = rows[i].SEX;
			var age = rows[i].AGE;
			loadData.push({
				"text1" : "姓名：" + (rows[i].name ==null ? "未知": rows[i].name),
				"pic" : rows[i].url
			});
		}
		
		window["resultListObj"]._loadData({"rows":loadData,"total":total,"orignalRows":rows});
		window["resultListObj"]._show();
		
		$faceQueryWin.find("#apply,#export").css({
			"opacity": "1",
	    	"pointer-events": "auto"
		});
	};
	
	window["resultListObj"]._showLoading();
	$.ajax(ajaxParam);
}

//function faceQuery(isPageQuery) {
//	var _self = this;
//	//showPageInfo("正在加载···", 1);
//	
//	//加载数据展示组件
//	_self.addElements();
//	
//	//加载动画 
//	_self.resultListObj._showLoading();
//	
//	var param = new FormData();
//	var param_bak = {};
//
//	var times = getDefaultTimes();
//	
//	var startTime = times.st;
//	var endTime = times.et;
//	
//	//添加通用条件
//	param.append("fromTime", startTime);
//	param.append("toTime", endTime);
//	param.append("page", 1);
//	param.append("rows", 60);
//	param.append("isSearchImg", "false");
//	_self.isSearchImg = false;
//	
//	var ajaxParam = {
//			async: true,
//	 		cache: false,
//	 		type: "POST",
//	 		data: param,
//	 		processData: false,
//	 		contentType: false
//		};
//	
//	ajaxParam["url"] = "queryFaceDataForRL.do";
//	ajaxParam["data"] = param;
//	_self.requestParam = param_bak;
//	
//	
//	//请求成功处理函数
//	ajaxParam["success"] = function(data) {
//		var respData = eval("(" + data + ")");
//		
//		var resp = eval("(" + respData.resp + ")");
//		
//		var rows = resp.rows;
//		var total = resp.total;
//		var loadData = [];
//		for (var i=0 ;i < rows.length ; i++) {
//			var sex = rows[i].SEX;
//			var age = rows[i].AGE;
//			var data = {
//				"text1" : rows[i].CATCHTIME.split(" ")[1],
//				"pic" : rows[i].APACHEPATH + rows[i].FACEPATH
//			}
//			
//			//频次排序
//			if (param_bak.orderField == "time") {
//				data["text2"] = rows[i].COUNT + "次"
//			} else if (param_bak.orderField == "similarity") {
//				data["text2"] = (rows[i].SIMILARITY + "").substring(0,4) + "%"
//			} else if (param_bak.orderField == "date") {
//				if(!!rows[i].SIMILARITY)
//					data["text2"] = (rows[i].SIMILARITY + "").substring(0,4) + "%"
//			}
//			
//			loadData.push(data);
//		}
//		
//		if (!!isPageQuery && !!isPageQuery.callBack && typeof isPageQuery.callBack == "function") {
//			isPageQuery.callBack.call(this, {"rows":loadData,"total":total,"orignalRows":rows});
//			_self.$capSearchWin.find("#apply,#order,#export").css({
//				"opacity": "1",
//		    	"pointer-events": "auto"
//			});
//			return;
//		}
//		_self.resultListObj._loadData({"rows":loadData,"total":total,"orignalRows":rows});
//		_self.resultListObj._show();
//		
//		_self.timeAxisObj._show();
//		
//	};
//	$.ajax(ajaxParam);
//}

top.updateCaseLocation = function(dom){
   var caseId = $(dom).attr("caseId");
   basalResourcesLayerControl.casePointControl.curReLocationCaseId = caseId;
   window.gisInteraction.clearPopup();
   top.clickType = '2';
   top.window.isRelocate = true;
   mshp(10);
}

top.updateJQLocation = function(dom){
   var jjdbh = $(dom).attr("jjdbh");	
   basalResourcesLayerControl.jqPointControl.curReLocationJjdbh = jjdbh;
   window.gisInteraction.clearPopup();//
   top.clickType = '1';
   top.window.isRelocate = true;
   mshp(10);
}

top.updateTzcsLocation = function(dom, id){
   basalResourcesLayerControl.specialSiteControl.curReLocationId = id;
   window.gisInteraction.clearPopup();//
   top.clickType = '3';
   top.window.isRelocate = true;
   mshp(10);
   event.stopPropagation();
}

top.jqClickEven = function(dom,jjdbh){
	if(dom){
		$(".FramePoliceListBox02").children("div").removeClass().addClass("GCourseList");
		$(dom).parent().removeClass().addClass("GCourseList_on");
	}
	if($("#layerListContainer a[value='JQ']").find("img").length == 0){
		$("#layerListContainer a[value='JQ']").click();
	}
	setTimeout(function(){
		top.window.isCenter = true;
		top.window.isZoom = true;
		basalResourcesLayerControl.jqPointControl.relationJQFromListToMap(jjdbh);
	},500)
}

top.caseClickEven = function (dom,caseId){
	if(dom){
		$(".FramePoliceListBox02").children("div").removeClass().addClass("GCourseList");
		$(dom).parent().removeClass().addClass("GCourseList_on");
	}
	if($("#layerListContainer a[value='AJ']").find("img").length == 0){
		$("#layerListContainer a[value='AJ']").click();
	}
	setTimeout(function(){
		top.window.isCenter = true;
		top.window.isZoom = true;
		basalResourcesLayerControl.casePointControl.relationCaseFromListToMap(caseId);
	},500)
}

top.locationWbOrNetBar = function (type,id){ //1宾馆 2网吧 
	if(type == "1"){
		if($("#layerListContainer a[value='Hotel']").find("img").length == 0){
			$("#layerListContainer a[value='Hotel']").click();
		}
		setTimeout(function(){
			top.window.isCenter = true;
			top.window.isZoom = true;
			basalResourcesLayerControl.hotelLayerControl._showMarkerPopupById(id);
		},500)
	}else if(type == "2"){
		if($("#layerListContainer a[value='Netbar']").find("img").length == 0){
			$("#layerListContainer a[value='Netbar']").click();
		}
		setTimeout(function(){
			top.window.isCenter = true;
			top.window.isZoom = true;
			basalResourcesLayerControl.netbarLayerControl._showMarkerPopupById(id);
		},500)
	}
}

top.locationDT = function(xm){
	if($("#layerListContainer a[value='DT']").find("img").length == 0){
		$("#layerListContainer a[value='DT']").click();
	}
	setTimeout(function(){
		top.window.isCenter = true;
		top.window.isZoom = true;
		basalResourcesLayerControl.dtGpsControl._showMarkerPopupById(xm);
	},500)
}

top.locationFaceJKD = function(pointId){
	if($("#layerListContainer a[value='FACE_JKD']").find("img").length == 0){
		$("#layerListContainer a[value='FACE_JKD']").click();
	}
	setTimeout(function(){
		top.window.isCenter = true;
		top.window.isZoom = true;
		basalResourcesLayerControl.facePointLayerControl._showMarkerPopupByPuId(pointId);
	},500)
}

top.locationJKD = function(pointId){
	if($("#layerListContainer a[value='JKD']").find("img").length == 0){
		$("#layerListContainer a[value='JKD']").click();
	}
	setTimeout(function(){
		top.window.isCenter = true;
		top.window.isZoom = true;
		basalResourcesLayerControl.firstClassControl._showMarkerPopupByPuId(pointId);
	},500)
}
top.viewBasalVideoJKD = function(obj){
	 var objTemp = $(obj).next("input");
	 var content = new Object();
	 content.lon = objTemp.attr("lon");
	 content.lat = objTemp.attr("lat");
	 content.state = objTemp.attr("state");
	 content.puid = objTemp.attr("pu_id");
	 content.channel = objTemp.attr("channel");
	 content.name = objTemp.attr("name");
     if(content.lon=="undefined"){
    	 content.lon = "";
     }
     if(content.lat=="undefined"){
    	 content.lat = "";
     }
	 //var tmpLL = _prjFuns.gps84_to_map(content.lon*1, content.lat*1);
	 //var tmpPix = map.getPixelFromCoordinate(tmpLL);
	 //var tmpPixStr = (Math.round(tmpPix[0]) + 10)+"@"+(Math.round(tmpPix[1])+65);
	 var tmpPixStr =  top.window.innerWidth/2 + "@" + top.window.innerHeight/2;
	 if(content.state==null||content.state==""||content.state==0||content.state == "113"){
		 fadingTip("设备不在线。");
		 return;
	 }else {
		 content.state = 114;
	 }
	 var msgString = content.puid+"@"+content.channel+"@"+content.name
	 +"@"+content.lon+"@"+content.lat + "@" + tmpPixStr + "@" + content.state;
	 sendMsgToClient(107, msgString);
}
top.locationZDQY = function(id){
	if($("#layerListContainer a[value='keyArea']").find("img").length == 0){
		$("#layerListContainer a[value='keyArea']").click();
	}
//	//查询区域相关信息
//	queryZdqyRefInfo();
	
	setTimeout(function(){
		basalResourcesLayerControl.keyAreaLayerControl._showMarkerPopupById(id);
	},500)
}

top.locationJWT = function(custId){
	if($("#layerListContainer a[value='JWT']").find("img").length == 0){
		$("#layerListContainer a[value='JWT']").click();
	}
	setTimeout(function(){
		basalResourcesLayerControl.personClassControl._showMarkerPopupById(custId);
	},500)
}

top.zdwlEvent = function(zdbh){
	if($("#layerListContainer a[value='elecFence']").find("img").length == 0){
		$("#layerListContainer a[value='elecFence']").click();
	}
	setTimeout(function(){
		basalResourcesLayerControl.elecFenceLayerControl._showMarkerPopupById(zdbh);
	},500)
}

top.wifiEvent = function(id){
	if($("#layerListContainer a[value='wifi']").find("img").length == 0){
		$("#layerListContainer a[value='wifi']").click();
	}
	setTimeout(function(){
		basalResourcesLayerControl.wifiPointControl.showMarkLayerByPopId(id);
	},500)
}

top.carkkEvent = function(kkbh){
	if($("#layerListContainer a[value='carKK']").find("img").length == 0){
		$("#layerListContainer a[value='carKK']").click();
	}
	setTimeout(function(){
		basalResourcesLayerControl.carLayerControl._showMarkerPopupById(kkbh);
	},500)
}

top.dzkEvent = function(id,name,address,lon,lat){
	if($("#layerListContainer a[value='dzk']").find("img").length == 0){
		$("#layerListContainer a[value='dzk']").click();
	}
	setTimeout(function(){
		if (!basalResourcesLayerControl.dzkPointControl) {
			basalResourcesLayerControl.dzkPointControl = new DzkLayerControl(basalResourcesLayerControl.map);
        }
		var item = new Object();
		item.POI_ID = id;
		item.POI_NAME = name;
		item.ADDRESS = address;
		item.LONGITUDE = lon;
		item.LATITUDE = lat;
		basalResourcesLayerControl.dzkPointControl.showMarkLayerByItem(item);
	},500)
}

top.attentionTitle = function(obj,type){
	var attentionId = $(obj).attr('alias');
	var attentionType = type;
	$.ajax({
	       url:"saveAttentionInfo.do?attentionId="+attentionId+"&attentionType="+attentionType,
	       success:function(res){
	    	  var data = eval("("+res+")");
	    	  fadingTip(data.info);
	    	  if(data.info == "取消关注成功"){
	    	      $(obj).attr("title","关注");
	    	      $(obj).removeClass().addClass("GPoliceListBtn02");
	    	  }else{
		    	  $(obj).attr("title","取消关注");
		    	  $(obj).removeClass().addClass("GPoliceListBtn02_on");
	    	  }
	       },
	       error : function() {
	    	  fadingTip("操作异常");
			}
	    });
	var event = window.event || arguments.callee.caller.arguments[0];
    if(event.preventDefault) {
       event.preventDefault();
       event.stopPropagation();
    }else{
       event.returnValue = false;
       event.cancelBubble = true;
    }
}

top.window.singleSelect = function(){
	$("#singleSelect").show();
	var e =window.event;
	var scollX = document.documentElement.scrollLeft || document.body.scrollLeft;
	var scollY = document.documentElement.scrollTop || document.body.scrollTop;
	var x = e.pageX || e.clientX+scollX;
	var y = e.pageY || e.clientY+scollY;
	$("#singleSelect").show();
	$('#singleSelect').css({
		'left' : (x-210) + 'px',
		'top' : y + 'px'
	});
	if(basalResourcesLayerControl.singleInvestigation == null){
		basalResourcesLayerControl.singleInvestigation = new SingleInvestigation(this.map);
 	}
	//注册拖拽事件
	basalResourcesLayerControl.singleInvestigation.addHeaderDivMoveEvent("#singleSelect .PSBTouchTitle");
    $('#singleSelect .PSBTouchTitle').css('cursor', 'move');
}
top.window.multiSelect = function(){	
//	var _this = this;
	$("#multiInvestGuidBar").show();
	$("#startTime_duodianPZ"+top.window.count).val(getLastDateString(-10) + " 00:00:00");
	$("#endTime_duodianPZ"+top.window.count).val(getLastDateString(0) + " 23:59:59");
}
top.window.captureSearch = function(){	
	
	var href = window.location.href;
	if(href.indexOf("sciencePoliceDutyMap")>-1){//如果是首页打开
        top.menuContent.hide();
        top.closeMenu.hide();
        top.openMenu.show();
	}
	
	$("#captureSearchWin").show();
    if(featureGis != null){
    	featureGis.closeCapSearchWin2();
    }
	featureGis = new FeatureQueryGis();
	featureGis.faceQuery();
	
	$("#techMenu").hide();
}
top.window.faceQuery = function(){
	
	var href = window.location.href;
	if(href.indexOf("sciencePoliceDutyMap")>-1){//如果是首页打开
        top.menuContent.hide();
        top.closeMenu.hide();
        top.openMenu.show();
	}
	
	$("#faceQueryWin").show();
	faceQueryRLSB();
	
	$("#techMenu").hide();
}

function map_singleclick(map){
	 map.on("singleclick",function(evt){
		var coordinate = evt.coordinate;
		if(top.clickType == "1"){  //警情重定位
			top.window.isRelocate = true;
			basalResourcesLayerControl.jqPointControl.updateJQLocation(coordinate);
			mshp(0);
		}
		else if(top.clickType == "2"){  //案件定位
			top.window.isRelocate = true;
			basalResourcesLayerControl.casePointControl.updateCaseLocation(coordinate);
			mshp(0);
		} else if(top.clickType == "3"){  //特种场所定位
			top.window.isRelocate = true;
			basalResourcesLayerControl.specialSiteControl.updateSiteLocation(coordinate);
			mshp(0);
		} else if(window.clickType ==0){   //一类点点击
			var selected= getFeatureAtPixel(evt.pixel);
			if(selected){
				var layer = selected.layer;
				var feature = selected.feature;
				if(layer.layerName == "firstClsClusterLayer"){
					if(feature.get("features")){
						//地图上点击时不居中不放大
		            	top.window.isZoom = false;
		           		top.window.isCenter = false;
						var featureList = feature.get("features");
						if(featureList.length ==1)
							basalResourcesLayerControl.firstClassControl._showMarkerPopup(featureList[0].att);
						else{
							var attList = [];
							for(var i=0;i<featureList.length;i++){
								attList.push(featureList[i].att);
							}
							basalResourcesLayerControl.firstClassControl.showListClusterPopup(attList);
						}
					}
				}
			}
		}
	});
	 
	//双击地图放大
	map.on("dblclick",function(evt){
		var coordinate = evt.coordinate;
		var interactions = map.getInteractions();
		for (var i = 0; i < interactions.getLength(); i++) {
		    var interaction = interactions.item(i);                          
		    if (interaction instanceof ol.interaction.DoubleClickZoom) {
		        map.removeInteraction(dbclicInteraction);
		        break;
		    }
		}
		map.addInteraction(dbclicInteraction);
		evt.map.forEachFeatureAtPixel(evt.pixel,callback,this);
		function callback(feature,layers){
				map.removeInteraction(dbclicInteraction);
		}
	});
	 
	$("#map").bind("mousedown",function(e){
		//鼠标右键事件 ：取消地图取点操作
	    if(e.button == 2){
	    	top.clickType = 0;
	    	top.window.isRelocate = false;
	    	mshp(0);
	    	window.gisInteraction.stopTrack();
	    	window.gisInteraction.clearTrack();
	    	if(basalResourcesLayerControl.measureControl){
	    		basalResourcesLayerControl.measureControl.hideHelpToolTip();
	    	}
	    }
	})
}
