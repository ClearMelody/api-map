var BasalResourcesLayerControl = function () {
    this.init.apply(this, arguments);
};

BasalResourcesLayerControl.prototype = {
    map: null,
    mapEleId: "map",
    popupControl: null,
    firstClassControl: null,
    hotelLayerControl: null,
    netbarLayerControl: null,
    focalDeptLayerControl: null,
    keyAreaLayerControl: null,
    policeDutyLayerControl: null,
    policeStationFocalManControl: null,
    personClassControl: null,
    personPopupControl: null,
    dtGpsControl: null,
    dtPopupControl: null,
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
        JZ: true,
        JWT: true,
        DT: true,
        ZRQ: true,
        FocalDept: true,
        keyArea:true,
        FocalMan: true,
        Hotel: true,
        Netbar: true,
        JKD_Checked: true,
        JZ_Checked: false,
        JWT_Checked: false,
        DT_Checked: false,
        ZRQ_Checked: false,
        FocalDept_Checked: false,
        keyArea_Checked:true,
        FocalMan_Checked: false,
        Hotel_Checked: false,
        Netbar_Checked: false
    },
    checkHandlerDic: {},
    init: function (map, style) {
        this.map = map;
        this.mapEleId = this.map.getTargetElement().id;
        if (style) {
            this.style = style;
        }
        this._initialOrderLayers();
        this._loadDependentResources();

        var id = "#" + this.mapEleId;
        var top = $(id).offset().top;
        var right = $(window).width() - $(id).width() - $(id).offset().left;
        if (!this.style.defualtDockAndAlign) {
            top += this.style.top;
            right += this.style.right;
        }

        var html = this._getMenuContainerHtmlTemplate();
        if (this.style.collapse) {
            html = html.replace(/display: block/g, "display: none");
        }
        html = html.replace(/top: 10px/g, "top: " + (top + 10) + "px");
        html = html.replace(/right: 70px/g, "right: " + (right + 70) + "px");
        $("body").append(html);

        html = this._getToolListContainerHtmlTemplate();
        html = html.replace(/top: 50px/g, "top: " + (top + 50) + "px");
        html = html.replace(/right: 110px/g, "right: " + (right + 247) + "px");
        $("body").append(html);

        html = this._getLayerListContainerHtmlTemplate();
        if (this.style.defualtShowLayerList) {
            html = html.replace(/display: none/g, "display: block");
        }
        var layerList = ["JKD", "JZ", "JWT", "DT", "ZRQ", "FocalDept", "FocalMan","keyArea"];
        for (var i = 0; i < layerList.length; i++) {
            var layerId = layerList[i];
            if (!this.style[layerId]) {
                var reg = eval("/display: " + layerId + "/g");
                html = html.replace(reg, "display: none");
            }
        }
        html = html.replace(/top: 50px/g, "top: " + (top + 50) + "px");
        html = html.replace(/right: 15px/g, "right: " + (right + 15) + "px");
        $("body").append(html);

        html = this._getMenuSwitcherContainerHtmlTemplate();
        if (!this.style.MenuSwitcherVisible) {
            html = html.replace(/display: block/g, "display: none");
        }
        if (this.style.collapse) {
            html = html.replace(/»/g, "«");
        }
        html = html.replace(/top: 10px/g, "top: " + (top + 10) + "px");
        html = html.replace(/right: 10px/g, "right: " + (right + 10) + "px");
        $("body").append(html);

        if ($("#popup").length < 1) {
            html = this._getPopupContainerHtmlTemplate();
            $("body").append(html);
        }

        html = this._getAppToolListContainerHtmlTemplate();
        html = html.replace(/top: 50px/g, "top: " + (top + 50) + "px");
        html = html.replace(/right: 110px/g, "right: " + (right + 110) + "px");
        $("body").append(html);

        html = this._getMultiInvestGuidBarHtmlTemplate();
        html = html.replace(/top: 70px/g, "top: " + (top + 70) + "px");
        html = html.replace(/right: 70px/g, "right: " + (right + 70) + "px");
        $("body").append(html);

        html = this._getSingleInvestResultHtmlTemplate();
        $("body").append(html);

        this._bindEventHandler();

        if (this.style.JKD_Checked) {
            $("#layerListContainer input[value='JKD']").click();
        }
        if (this.style.JZ_Checked) {
            $("#layerListContainer input[value='JZ']").click();
        }
        if (this.style.JWT_Checked) {
            $("#layerListContainer input[value='JWT']").click();
        }
        if (this.style.DT_Checked) {
            $("#layerListContainer input[value='DT']").click();
        }
        if (this.style.ZRQ_Checked) {
            $("#layerListContainer input[value='ZRQ']").click();
        }
        if (this.style.FocalDept_Checked) {
            $("#layerListContainer input[value='FocalDept']").click();
        }
        if (this.style.FocalMan_Checked) {
            $("#layerListContainer input[value='FocalMan']").click();
        }
        if (this.style.keyArea_Checked) {
        	$("#layerListContainer input[value='keyArea']").click();
        }

        this.singleInvestigation = new SingleInvestigation(this.map);
        this.multiInvestigation = new MultiInvestigation(this.map);
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
        var html = '';
        if (checked) {
            html = '<tr>'
                 + '    <td width="20" align="center"><input type="checkbox" tag="layerNode" value="' + layerName + '" checked></td>'
                 + '    <td class="layerName">' + layerName + '</td>'
                 + '</tr>';
        } else {
            html = '<tr>'
                 + '    <td width="20" align="center"><input type="checkbox" tag="layerNode" value="' + layerName + '"></td>'
                 + '    <td class="layerName">' + layerName + '</td>'
                 + '</tr>';
        }
        $("#layerListContainer tbody").append(html);
        $("#layerListContainer input[tag='layerNode']").unbind("click").bind("click", function () {
            var value = $(this).attr("value");
            var state = $(this).is(':checked');
            if (_this.checkHandlerDic[value]) {
                _this.checkHandlerDic[value](state);
            }
        });
    },
    updateLayerNodeCheckState: function (layerName, checked) {
        if (checked) {
            $("#layerListContainer input[value='" + layerName + "']").attr("checked", "true");
        } else {
            $("#layerListContainer input[value='" + layerName + "']").removeAttr("checked");
        }
    },
    _resize: function () {
        var id = "#" + this.mapEleId;
        var top = $(id).offset().top;
        var right = $(window).width() - $(id).width() - $(id).offset().left;
        if (!this.style.defualtDockAndAlign) {
            top += this.style.top;
            right += this.style.right;
        }

        $("#menuContainer").css("top", (top + 10) + "px");
        $("#menuContainer").css("right", (right + 70) + "px");

        $("#mapToolListContainer").css("top", (top + 50) + "px");
        $("#mapToolListContainer").css("right", (right + 110) + "px");

        $("#layerListContainer").css("top", (top + 50) + "px");
        $("#layerListContainer").css("right", (right + 15) + "px");

        $("#menuSwitcherContainer").css("top", (top + 10) + "px");
        $("#menuSwitcherContainer").css("right", (right + 10) + "px");
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
        cssArray.push("resource/css/gis/menuNewStyle.css");
        cssArray.push("resource/css/gis/lrtk.css");
        cssArray.push("resource/css/gis/eazywin.css");
        cssArray.push("resource/js/o3/v3.10.0/ol.css");
        cssArray.push("resource/js/o3/v3.10.0/olPlus.css");
        cssArray.push("resource/js/o3/v3.10.0/popup.css");
        cssArray.push("resource/css/gis/newstylepopup.css");
        cssArray.push("resource/css/gis/gisAll.css");
        cssArray.push("resource/css/PSBGis.css");
        cssArray.push("resource/css/PopUp.css");
        cssArray.push("resource/css/alarmAnalyse/wl.css");
        cssArray.push("resource/comm/css/jquery.pagination.css");
        cssArray.push("resource/comm/css/jquery.datagrid.css");
        cssArray.push("resource/css/investigation.css");
        for (var i = 0; i < cssArray.length; i++) {
            if (_this._isIncludeCss(cssArray[i]) == false) {
                $('<link rel="stylesheet" type="text/css" href="' + cssArray[i] + '"\/>').appendTo(head);
            }
        }

        var jsArray = [];
        jsArray.push("resource/js/comm/jquery.liMarquee.js");
        jsArray.push("resource/js/comm/marquee.js");
        jsArray.push("resource/comm/js/util.js");
        jsArray.push("resource/comm/js/JHashMap.js");
        jsArray.push("resource/comm/js/fadingTip.js");
        jsArray.push("resource/js/o3/v3.10.0/gisInteraction.js");
        jsArray.push("resource/js/gis/lrtk.js");
        jsArray.push("resource/comm/laydate/laydate.js");
        jsArray.push("resource/js/o3/util/Util_new.js");
        jsArray.push("resource/js/o3/draw/MeasureControl.js");
        jsArray.push("resource/js/o3/draw/centerCrossEffect.js");
        jsArray.push("resource/js/o3/draw/SelectEffectControl.js");
        jsArray.push("resource/js/o3/pointControl/FirstClassControl.js");
        jsArray.push("resource/js/o3/pointControl/PersonClassControl.js");
        jsArray.push("resource/js/o3/pointControl/ThirdClassControl.js");
        jsArray.push("resource/js/o3/pointControl/PoliceMapControl.js");
        jsArray.push("resource/js/o3/pointControl/MobileSiteLayerControl.js");
        jsArray.push("resource/js/o3/pointControl/KaKouLayerControl.js");
        jsArray.push("resource/js/o3/mapEvent/mapClick.js");
        jsArray.push("resource/js/o3/mapStyle/mapStyle.js");
        jsArray.push("resource/js/o3/PopupControl.js");
        jsArray.push("resource/js/o3/PopupControlCluster.js");
        jsArray.push("resource/js/o3/JhPopupControl.js");
        jsArray.push("resource/js/o3/PersonPopupControl.js");
        jsArray.push("resource/js/o3/PopupControlLabel.js");
        jsArray.push("resource/js/o3/util/util.js");
        jsArray.push("resource/js/o3/mapStyle/featureFlash.js");
        jsArray.push("resource/js/o3/draw/diffusePointEffect.js");
        jsArray.push("resource/js/policeDuty/FocalDeptLayerControl.js");
        jsArray.push("resource/js/zdxlqy/KeyAreaLayerControl.js");
        jsArray.push("resource/js/policeDuty/PoliceDutyLayerControl.js");
        jsArray.push("resource/js/o3/pointControl/HotelLayerControl.js");
        jsArray.push("resource/js/o3/pointControl/NetbarLayerControl.js");
        jsArray.push("resource/js/o3/pointControl/PoliceStationFocalManControl.js");
        jsArray.push("resource/js/o3/pointControl/dtgps/DtPopupControl.js");
        jsArray.push("resource/js/o3/pointControl/dtgps/DtGpsControl.js");
        jsArray.push("resource/js/o3/PersonPopupControl.js");
        jsArray.push("resource/js/o3/pointControl/PersonClassControl.js");
        jsArray.push("resource/js/o3/quickMenu.js");
        jsArray.push("resource/comm/js/jquery.pagination.js");
        jsArray.push("resource/comm/js/jquery.datagrid.js");
        jsArray.push("resource/js/assistInvestigate/singleInvestigation.js");
        jsArray.push("resource/js/assistInvestigate/multiInvestigation.js");
        for (var i = 0; i < jsArray.length; i++) {
            if (_this._isIncludeJs(jsArray[i]) == false) {
                $('<script type="text/javascript" src="' + jsArray[i] + '"> <\/script>').appendTo(head);
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

        $("#menuContainer a").click(function () {
        	event.stopPropagation();
            var name = $(this).attr("name");
            switch (name) {
                case "mapToolControl":
                    var dispaly = $("#mapToolListContainer").css("display");
                    if (dispaly == "none") {
                        $(this).find(".PSBMenu_Down").removeClass("PSBMenu_Down").addClass("PSBMenu_Up");
                    } else {
                        $(this).find(".PSBMenu_Up").removeClass("PSBMenu_Up").addClass("PSBMenu_Down");
                    }
                    $("#layerListContainer").hide();
                    $("#appToolListContainer").hide();
                    $("#mapToolListContainer").toggle(200);
                    break;
                case "appToolControl":
                    var dispaly = $("#appToolListContainer").css("display");
                    if (dispaly == "none") {
                        $(this).find(".PSBMenu_Down").removeClass("PSBMenu_Down").addClass("PSBMenu_Up");
                    } else {
                        $(this).find(".PSBMenu_Up").removeClass("PSBMenu_Up").addClass("PSBMenu_Down");
                    }
                    $("#layerListContainer").hide();
                    $("#mapToolListContainer").hide();
                    $("#appToolListContainer").toggle(200);
                    break;
                case "layerControl":
                    $("#mapToolListContainer").hide();
                    $("#appToolListContainer").hide();
                    $("#layerListContainer").toggle(200);
                    break;
                default:
                    break;
            }
        });

        $("#mapToolListContainer a").click(function () {
        	event.stopPropagation();
        	var name = $(this).attr("name");
            $("#menuContainer a[name='mapToolControl']").click();
            switch (name) {
                case "fullView":
                    if ($('#OfflineMapInitLevel').val()) {
                        var offline_center = $('#offline_center').val();
                        var OfflineMapInitLevel = $('#OfflineMapInitLevel').val();
                        var center = eval(offline_center);
                        window.gisInteraction.setPosition(center[0], center[1], OfflineMapInitLevel);
                    } else if (G_FULLSCREEN_BOUNDS && G_FULLSCREEN_BOUNDS.center) {
                        OfflineMapInitLevel = 12;
                        var center = G_FULLSCREEN_BOUNDS.center;
                        window.gisInteraction.setPosition(center[0], center[1], OfflineMapInitLevel);
                    }
                    break;
                case "disMeasure":
                    window.gisInteraction.clearMeaure();
                    window.gisInteraction.meaureLine();
                    break;
                case "areaMeasure":
                    window.gisInteraction.clearMeaure();
                    window.gisInteraction.meaureArea();
                    break;
                case "clear":
                    window.gisInteraction.clearMeaure();
                    break;
                default:
                    break;
            }
        });

        $("#appToolListContainer a").click(function () {
        	event.stopPropagation();
        	$("#menuContainer a[name='appToolControl']").click();
            var name = $(this).attr("name");
            switch (name) {
                case "singleInvest":
                    _this.singleInvestigation.trackSingleInvestCircle();
                    break;
                case "multiInvest":
                    _this.multiInvestigation.trackMultiInvestCircle();
                    break;
                default:
                    break;
            }
        });

        $("#menuSwitcherContainer button").click(function () {
            var dispaly = $("#menuContainer").css("display");
            if (dispaly == "none") {
                $(this).find("span").html("»");
            } else {
                $(this).find("span").html("«");
            }
            $("#menuContainer").toggle(200);
            $("#mapToolListContainer").hide();
            $("#appToolListContainer").hide();
            $("#layerListContainer").hide();
        });

        $("#layerListContainer input[type='checkbox']").click(function () {
            var value = $(this).attr("value");
            var state = $(this).is(':checked');
            _this._showLayer(value, state);
        });
    },
    _showLayer: function (value, state) {
        var _this = this;
        top.setClickType(0);
        switch (value) {
            case "JKD":
                if (!_this.popupControl) {
                    window.popupControl = _this.popupControl = new PopupControl(_this.map);
                }
                if (!_this.firstClassControl) {
                    if (!window.isImportantActivity) {
                        window.isImportantActivity = 0;
                    }
                    window.firstClassControl = _this.firstClassControl = new FirstClassControl(_this.map);
                } else {
                    if (state) {
                        _this.firstClassControl.firstclusters.setVisible(true);
                    } else {
                        _this.firstClassControl.firstclusters.setVisible(false);
                        _this.popupControl.closePopUpwin();
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
                    window.personClassControl = _this.personClassControl = new PersonClassControl(_this.map);
                } else {
                    if (state) {
                        _this.personClassControl.firstclusters.setVisible(true);
                    } else {
                        _this.personClassControl.firstclusters.setVisible(false);
                        _this.personPopupControl.closePopUpwin();
                    }
                }
                break;
            case "DT":
                if (!window.dataArray) {
                    window.dataArray = [];
                }
                if (!_this.dtPopupControl) {
                    window.dtPopupControl = _this.dtPopupControl = new DtPopupControl(_this.map);
                }
                if (!_this.popupControl) {
                    window.popupControl = _this.popupControl = new PopupControl(_this.map);
                }
                if (!_this.dtGpsControl) {
                    window.dtGpsControl = _this.dtGpsControl = new DtGpsControl(_this.map);
                } else {
                    if (state) {
                        _this.dtGpsControl.firstclusters.setVisible(true);
                    } else {
                        _this.dtGpsControl.firstclusters.setVisible(false);
                        _this.dtPopupControl.closePopUpwin();
                        _this.popupControl.closePopUpwin();
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
                    _this.policeDutyLayerControl = new PoliceDutyLayerControl(_this.map);
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
            default:
                break;
        }
    },
    _getMenuContainerHtmlTemplate: function () {
        var html = '<div id="menuContainer" class="PSBMenu" style="width: auto; top: 10px; right: 70px; display: block;">'
                 + '    <a name="mapToolControl"><img src="resource/images/Gis/PSBMenuIcon03.png" width="20" height="20"><span>地图工具</span><span class="PSBMenu_Down"></span></a>'
                 + '    <p class="PSBMenuLine"></p>'
                 + '    <a name="appToolControl"><img src="resource/images/Gis/PSBMenuIcon08.png" width="20" height="20"><span>应用工具</span><span class="PSBMenu_Down"></span></a>'
                 + '    <p class="PSBMenuLine"></p>'
                 + '    <a name="layerControl"><img src="resource/images/Gis/PSBMenuIcon04.png" width="20" height="20"><span>图层</span></a>'
                 + '</div>';
        return html;
    },
    _getToolListContainerHtmlTemplate: function () {
        var html = '<div id="mapToolListContainer" class="PSBSecond" style="right: 110px; top: 50px; display: none;">'
                 + '    <ul class="PSBGisList">'
                 + '        <li><a name="fullView"><img src="resource/images/Gis/allmap.png">全图</a></li>'
                 + '        <li><a name="disMeasure"><img src="resource/images/Gis/distance.png">距离量算</a></li>'
                 + '        <li><a name="areaMeasure"><img src="resource/images/Gis/area.png">面积量算</a></li>'
                 + '        <li><a name="clear"><img src="resource/images/Gis/del.png">清除图形</a></li>'
                 + '    </ul>'
                 + '</div>';
        return html;
    },
    _getLayerListContainerHtmlTemplate: function () {
        var html = '<div id="layerListContainer" class="PSBSecond" style="top: 50px; padding: 10px; right: 15px; display: none; ">'
                 + '    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="line-height:30px;">'
                 + '        <tbody>'
                 + '            <tr value="JKD" style="display: JKD;">'
                 + '                <td width="20" align="center"><input type="checkbox" value="JKD"></td>'
                 + '                <td class="layerName">监控点位</td>'
                 + '            </tr>'
                 + '            <tr value="JZ" style="display: JZ;">'
                 + '                <td align="center"><input type="checkbox" value="JZ"></td>'
                 + '                <td class="layerName">基站</td>'
                 + '            </tr>'
                 + '            <tr value="JWT" style="display: JWT;">'
                 + '                <td align="center"><input type="checkbox" value="JWT"></td>'
                 + '                <td class="layerName">警务通</td>'
                 + '            </tr>'
                 + '            <tr value="Hotel" style="display: Hotel;">'
                 + '                <td align="center"><input type="checkbox" value="Hotel"></td>'
                 + '                <td class="layerName">宾馆酒店</td>'
                 + '            </tr>'
                 + '            <tr value="Netbar" style="display: Netbar;">'
                 + '                <td align="center"><input type="checkbox" value="Netbar"></td>'
                 + '                <td class="layerName">网吧</td>'
                 + '            </tr>'
                 + '            <tr value="DT" style="display: DT;">'
                 + '                <td align="center"><input type="checkbox" value="DT"></td>'
                 + '                <td class="layerName">电台</td>'
                 + '            </tr>'
                 + '            <tr value="ZRQ" style="display: ZRQ;">'
                 + '                <td align="center"><input type="checkbox" value="ZRQ"></td>'
                 + '                <td class="layerName">责任区</td>'
                 + '            </tr>'
                 + '            <tr value="FocalDept" style="display: FocalDept;">'
                 + '                <td align="center"><input type="checkbox" value="FocalDept"></td>'
                 + '                <td class="layerName">重点单位</td>'
                 + '            </tr>'
                 + '            <tr value="keyArea" style="display: keyArea;">'
                 + '                <td align="center"><input type="checkbox" value="keyArea"></td>'
                 + '                <td class="layerName">重点区域</td>'
                 + '            </tr>'
                 + '            <tr value="FocalMan" style="display: FocalMan;">'
                 + '                <td align="center"><input type="checkbox" value="FocalMan"></td>'
                 + '                <td class="layerName">重点人员</td>'
                 + '            </tr>'
                 + '        </tbody>'
                 + '    </table>'
                 + '</div>';
        return html;
    },
    _getMenuSwitcherContainerHtmlTemplate: function () {
        var html = '<div id="menuSwitcherContainer" class="ol-control" style="position: absolute; top: 10px; right: 10px; display: block;">'
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
        var html = '<div id="appToolListContainer" class="PSBSecond" style="right: 110px; top: 50px; display: none;">'
                 + '    <ul class="PSBGisList">'
                 + '        <li><a name="singleInvest"><img src="resource/images/Gis/dand.png">单点碰撞</a></li>'
                 + '        <li><a name="multiInvest"><img src="resource/images/Gis/duod.png">多点碰撞</a></li>'
                 + '    </ul>'
                 + '</div>';
        return html;
    },
    _getSingleInvestResultHtmlTemplate: function () {
        var html = '<div class="Popups01" id="singleInvestDiv" style="display:none;width:721px; height:500px; position:absolute; left:50px;top:50px;z-index:1752;">'
                 + '    <div class="PopupsHeader">'
                 + '        <h1 id="titleH1">单点摸排</h1>'
                 + '        <a id="closeSingleInvest" class="PUClose"></a>'
                 + '    </div>'
                 + '    <div class="PopupsContent">'
                 + '        <div class="PopupsContenta" style="padding:10px;overflow:auto;height:442px;">'
                 + '            <div class="titleTextArea" id="titleTextAreaId">'
                 + '                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom:5px;">'
				 + '                    <tr>'
				 + '                    	<td width="40">姓名：</td>'
				 + '                    	<td width="155"><input id="xm" type="text" class="Text01 Text02" style="width:147px;"/></td>'
				 + '                    	<td width="65" style="text-align:right;">身份证号：</td>'
				 + '                    	<td width="155"><input id="sfzh" type="text" class="Text01 Text02" style="width:147px;"/></td>'
				 + '                    	<td><input id="sameIn" type="checkbox" style="margin-left:12px;"/>同时出现</td>'
				 + '                    </tr>'
				 + '                </table>'
                 + '                <table width="100%" border="0" cellspacing="0" cellpadding="0">'
                 + '                    <tr>'
                 + '                        <td width="40">'
                 + '                            <p>时间：</p>'
                 + '                        </td>'
                 + '                        <td width="155">'
                 + '                            <input id="startTime" name="startTime" type="text" class="Text01 Text02" style="width:147px;" />'
                 + '                        </td>'
                 + '                        <td width="20" align="center">至</td>'
                 + '                        <td width="150">'
                 + '                            <input id="endTime" name="endTime" type="text" class="Text01 Text02" style="width:146px;" />'
                 + '                        </td>'
                 + '                        <td>'
                 + '                            <a id="startSingleInvest" class="But02">开始摸排</a>'
                 + '                        </td>'
                 + '                    </tr>'
                 + '                </table>'
                 + '            </div>'
                 + '            <div class="resultTitle">'
                 + '                <h1>'
                 + '                    <a href="javascript:void(0);" style="font-size:14px;">住店信息</a>'
                 + '                    <a href="javascript:void(0);" id="btnSingleInvestMax_Hotel" class="EPPlateBtn01" style="float: right; " title="最大化"></a>'
                 + '                </h1>'
                 + '            </div>'
                 + '            <div style="margin:5px 0 5px 0;border:1px solid #C5C5C5;">'
                 + '                <table id="hotelData" class=" easyui-datagrid" border="0" cellspacing="0" cellpadding="0"></table>'
                 + '            </div>'
                 + '            <div class="resultTitle">'
                 + '                <h1>'
                 + '                    <a href="javascript:void(0);" style="font-size: 14px;">网吧上网信息</a>'
                 + '                    <a href="javascript:void(0);" id="btnSingleInvestMax_Netbar" class="EPPlateBtn01" style="float: right;" title="最大化"></a>'
                 + '                </h1>'
                 + '            </div>'
                 + '            <div style="margin:5px 0 5px 0;border:1px solid #C5C5C5;">'
                 + '                <table id="netBarData" class=" easyui-datagrid" border="0" cellspacing="0" cellpadding="0"></table>'
                 + '            </div>'
                 + '        </div>'
                 + '    </div>'
                 + '</div>';
        return html;
    },
    _getMultiInvestGuidBarHtmlTemplate: function () {
        var html = '<div class="PSBElastic" id="multiInvestGuidBar" style="display:none;z-index: 1000;width:515px; right: 70px; top: 70px;">'
                  + '    <div class="PSBElasticTitle" style="cursor:move;user-select:none;">'
                  + '        <h1>设置</h1>'
                  + '        <a href="javascript:void(0);" class="PSBElasticClose"></a>'
                  + '    </div>'
                  + '    <div class="TimeChooseBox">'
                  + '        <span class="TimeChooseBoxInputBox">'
                  + '            <a href="javascript:void(0);" class="TSInputDate" style="display:none;"></a>'
                  + '            <input id="startTime_duodianPZ" type="text" class="TSInput" onfocus="if(value==defaultValue){value=\'\';this.style.color=\'#000\'}" onblur="if (value==\'\') {value=defaultValue;this.style.color=\'#999\'}" style="color:#999" value="开始时间">'
                  + '        </span>'
                  + '        <span class="TimeChooseLine">-</span>'
                  + '        <span class="TimeChooseBoxInputBox">'
                  + '            <a href="javascript:void(0);" class="TSInputDate" style="display:none;"></a>'
                  + '            <input id="endTime_duodianPZ" type="text" class="TSInput" onfocus="if(value==defaultValue){value=\'\';this.style.color=\'#000\'}" onblur="if (value==\'\') {value=defaultValue;this.style.color=\'#999\'}" style="color:#999" value="结束时间">'
                  + '        </span>'
                  + '        <span class="TimeChooseBoxInputBox">'
                  + '            <a name="finishConfig" href="javascript:void(0);" class="PSBElasticBtn" style="padding:0 10px;">完成设置</a>'
                  + '        </span>'
                  + '        <span class="TimeChooseBoxInputBox">'
                  + '            <a name="startPZ" href="javascript:void(0);" class="PSBElasticBtn" style="padding:0 10px;">开始碰撞</a>'
                  + '        </span>'
                  + '        <div class="clear"></div>'
                  + '    </div>'
                  + '</div>';
        return html;
    },
    CLASS_NAME: "BasalResourcesLayerControl"
};
