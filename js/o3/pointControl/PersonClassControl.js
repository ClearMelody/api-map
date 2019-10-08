/**
 * @(#)PersonClassControl.js
 *
 * @description: 在map上显示person
 * @author: 李达 2016/04/16
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */

var PersonClassControl = function () {
    this.init.apply(this, arguments);
}

var orgType2Map = {
    "99": "其他",
    "00": "视侦",
    "01": "技侦",
    "03": "网侦",
    "04": "刑侦"
};

PersonClassControl.prototype = {
    map: null,
    personClassSource: null,
    vectorLayer: null,
    firstclusters: null,
    userList: null,
    userLonLatMap: null,
    userDic: {},
    init: function (map) {
        this.map = map;
        this.personClassSource = new ol.source.Vector({});
        this.vectorLayer = new ol.layer.Vector({
            name: "personClassLayer",
            source: this.personClassSource
        });

        var clusterSource = new ol.source.Cluster({
            distance: 50,
            source: this.personClassSource
        });

        this.userLonLatMap = new HashMap();
        var styleCache = {};
        this.firstclusters = new ol.layer.Vector({
            name: "personClassLayer",
            source: clusterSource,
            style: function (feature, resolution) {
                var style;
                var size = feature.get('features').length;
                if (size > 1) {
                    style = [new ol.style.Style({
                        image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
                            opacity: 1,
                            src: 'resource/images/m0.png'
                        })),
                        text: new ol.style.Text({
                            font: '11px sans-serif',
                            text: size.toString(),
                            fill: textFill,
                            stroke: textStroke
                        })
                    })];
                } else {
                    var contentTemp = feature.get('features')[0];
                    var pointStyle = getPointClassStype("resource/images/pls_01.png");
                    var obj = new Object();
                    obj.custId = contentTemp.get("custId");
                    obj.custCode = contentTemp.get("custCode");
                    obj.onlineState = contentTemp.get("onlineState");
                    obj.custName = contentTemp.get("custName");
                    obj.orgName = contentTemp.get("orgName");
                    obj.realName = contentTemp.get("realName");
                    obj.roleName = contentTemp.get("roleName");
                    obj.lon = contentTemp.get("lon");
                    obj.lat = contentTemp.get("lat");
                    feature.set("content", obj);
                    feature.setStyle(pointStyle);
                }
                return style;

            }

        });
        map.addLayer(this.firstclusters);
        //30s刷新一次人员坐标
        window.setInterval(this.getPersonClassPoint, 10000);
        this.getPersonClassPoint();
        this.bindEvent();
        top.showTwinkle = showTwinkle;
    },
    getPersonClassPoint: function () {
        var _this = this;
        dataArray = null;
        dataArray = new Array();

        $.post("getPersonClassPoint.do", {}, function (data) {
            var xHtml = "";
            if (data && data.value) {
                var users = data.response;
                $("#jwtNum").text(users.length);
                if (users.length == 0) return;
                var iconFeatures = [];
                var name = null;
                for (var i = 0, len = users.length; i < len; i++) {
                    var user = users[i];
                    if (!user.LONGITUDE) continue;

                    if (clientGISKind == clientGISKinds.OFFLINEGIS) {
                        var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(user.LONGITUDE, user.LATITUDE), 'EPSG:4326', 'EPSG:3857');
                    } else {
                        var cor = [user.LONGITUDE * 1, user.LATITUDE * 1];
                    }
                    var content = {
                        custId: user.CUST_ID,
                        custCode: user.CUST_CODE,
                        onlineState: user.ONLINE_STATE,
                        custName: user.CUST_NAME,
                        orgName: user.ORG_NAME,
                        realName: user.REAL_NAME,
                        roleName: user.ROLE_NAME,
                        lon: user.LONGITUDE,
                        lat: user.LATITUDE
                    };
                    //_this.userDic[user.CUST_ID] = content;
                    var iconFeature = new ol.Feature({
                        geometry: new ol.geom.Point(cor),
                        custId: user.CUST_ID,
                        custCode: user.CUST_CODE,
                        onlineState: user.ONLINE_STATE,
                        custName: user.CUST_NAME,
                        orgName: user.ORG_NAME,
                        realName: user.REAL_NAME,
                        roleName: user.ROLE_NAME,
                        lon: user.LONGITUDE,
                        lat: user.LATITUDE
                    });
                    iconFeature.setId(user.CUST_ID);
                    personClassControl.userLonLatMap.put(user.CUST_ID, { lon: user.LONGITUDE, lat: user.LATITUDE });
                    //var pointStyle = getPointClassStype("resource/images/Gis/PoliceOnline.png");
                    var pointStyle = getPointClassStype("resource/images/pls_01.png");
                    //  xHtml += '<a class="j_mobile"><li data-cust-id="' + user.CUST_ID + '" data-cust-code="' + user.CUST_CODE
                    //      +'" data-real-name="'+user.REAL_NAME+'" data-lon="'+user.LONGITUDE +'" data-lat="'+user.LATITUDE
                    //     + '"><img src="resource/images/pls_01.png" width="16" height="16" />' + user.REAL_NAME + '<span style="float:right;">' + orgType2Map[user.ORG_TYPE2] + '</span></li></a>';
                    iconFeature.setStyle(pointStyle);
                    iconFeatures.push(iconFeature);

                    var personContent = {
                        id: user.CUST_ID,
                        xm: user.REAL_NAME,
                        lon: user.LONGITUDE,
                        lat: user.LATITUDE,
                        jh: null
                    };
                    dataArray.push(personContent);
                    var flag = true;
                    if (personClassControl.userList) {
                        for (var j = 0 ; j < personClassControl.userList.length; j++) {
                            var nUser = personClassControl.userList[j];
                            if (nUser.REAL_NAME == user.REAL_NAME) {
                                flag = false;
                                break;
                            }
                        }
                    }
                    if (flag) {
                        name = user.REAL_NAME;
                    }
                }
                if (name) {
                    $(".PSBDopeTitle").html('<span id="titleTip" class="live-tile"></span>');
                    $("#titleTip").html(name + "的警务通上线了");
                    createMarquee({
                        duration: 10000,
                        padding: -100,
                        marquee_class: '.live-tile',
                        container_class: '.PSBDopeTitle',
                        hover: true
                    });
                }
                personClassControl.userList = users;
                parent.parent.personClassFeatures = iconFeatures;
                personClassControl.clear();
                // $("#policeDistruList").html(xHtml);
                personClassControl.personClassSource.addFeatures(iconFeatures);
            }
        }, "json");

        try {
            dtGpsControl.getDtClassPoint();
        } catch (e) {
        }

    },
    addPopUp: function (content) {
        var _this = this;
        if (typeof content == "string") {
            var custId = content;
            content = _this.userDic[custId];
        }
        var _self = this;
        var coordinate = new Array();
        coordinate.push(content.lon * 1);
        coordinate.push(content.lat * 1);
        var text = document.getElementById('personClassPop').innerHTML;
        text = text.replace("%orgName", content.orgName);
        text = text.replace(/%realName/g, content.realName);
        text = text.replace("%lon", content.lon);
        text = text.replace("%lat", content.lat);
        popupControl.showPopUpWin(text, coordinate);
        var obj = $('#popup-content');
        obj.find(".j_sendMsg").click(function () {
            //parent.openMyMsgDialog(content.custId);
            var custIds = content.custId + "," + top.window.chatFrame.userInfo.custId;
            var names = content.realName + "," + top.window.chatFrame.userInfo.realName;
            try {
                chatWithUser(names, custIds);
            } catch (e) {
            }
        })
        // var taskFlag=false;
        obj.find(".j_sendTask").click(function () {
            parent.caseInvestigation.toAddTaskOnMap(parent.caseId, content.custId, content.realName);
        })
        obj.find(".j_sendBackVideo").click(function () {
            parent.sendMsgToClient("511", content.custCode + "@" + content.realName);
        });
    },
    /*
     * 添加聚合的人员列表
     */
    addClusterPointListPop: function (features) {
        var lon = features[0].get("lon");
        var lat = features[0].get("lat");

        var resambleHtml = '';
        resambleHtml += '<ul class="PSBPoliceList">';
        for (var i = 0; i < features.length; i++) {
            var tmpObj = features[i];
            var custId = tmpObj.get("custId");
            var name = tmpObj.get("realName");
            var custCode = tmpObj.get("custCode");
            resambleHtml += '<li>';
            resambleHtml += '<a title="' + name + '" class="jhList" > ';
            resambleHtml += '<img src="resource/images/pls_01.png" width="25" height="19" />';
            resambleHtml += '<span onclick="personClassControl.addPopUp(\'' + custId + '\')" ';
            resambleHtml += '  name="' + name + '"  title="' + name + '" >' + name + '</span> ';
            resambleHtml += '</li>';
        }
        resambleHtml += '</ul>'
        personPopupControl.showPopUpWin(resambleHtml, [lon, lat], 1);
    },

    /*
        弹出发送消息的对话框
     */
    popoutNewsDialog: function (receiverId) {
        personClassControl.openMyMsgDialog(receiverId);
    },

    myMsgDialog: null,

    openMyMsgDialog: function (receiverId) {

        // var mainBubble=this.parent.$(".j_bubble");
        var mainBubble = $(top.document.getElementsByClassName(".j_bubble")[0]);
        mainBubble.text("");
        mainBubble.removeClass("BubbleNumber01");
        var title = "我的消息";
        var url = "url:userNews/list?receiverId=" + receiverId;
        if (personClassControl.myMsgDialog) {
            return;
        }
        personClassControl.myMsgDialog = window.top.jQuery.dialog({
            id: "myMsgDialog",
            title: title,
            content: url,
            width: '900px',
            height: '527px',
            top: "40px",
            left: "90px",
            lock: true,
            drag: false,
            max: false,
            min: false,
            resize: false,
            close: function () {
                $("#policeRightMenu").hide();
                personClassControl.myMsgDialog = null;
            }
        });
    },

    /*
        右键点击弹出菜单
     */
    popoutMenu: function (custId, name, custCode, event) {
        var menu = $("#policeRightMenu");
        if (event.button == 0) {
            //左键点击
            menu.hide();
        } else if (event.button == 2) {
            //右键点击
            menu.css("left", event.clientX + "px");
            menu.css("top", event.clientY + "px");
            menu.show();
            var rightMenu = menu[0];
            rightMenu.dataset.custId = custId;
            rightMenu.dataset.custCode = custCode;
            rightMenu.dataset.realName = name;
        }

    },


    /*
     * 播放聚合中的设备
     */
    playPersonPoint: function (obj) {
        obj = $(obj);
        var content = {
            name: obj.attr("name"),
            pointId: obj.attr("pointId"),
            lon: obj.attr("lon"),
            lat: obj.attr("lat"),
            puid: obj.attr("puid"),
            channel: obj.attr("channel"),
            state: obj.attr("state")
        }
        firstClassControl.playVideo(content);
    },
    clear: function () {
        this.personClassSource.clear();
    },
    bindEvent: function () {
        $(".j_mobile").live("mousedown", function (event) {
            if (event.button == 0) {//左键点击
                var switcher = $('#layersSwither22');
                if (!switcher.attr("checked")) {
                    switcher.attr("checked", "checked");
                    personClassControl.firstclusters.setVisible(true);
                }
                var mobileLi = event.target;
                var lon = mobileLi.dataset.lon;
                var lat = mobileLi.dataset.lat;
                if (clientGISKind == clientGISKinds.OFFLINEGIS && lon != "" && lon != undefined) {
                    var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(lon * 1, lat * 1), 'EPSG:4326', 'EPSG:3857');
                    lon = cor[0];
                    lat = cor[1];
                }
                if (!lon && !lat) {
                    fadingTip("用户暂时无法定位！")
                }
                setTimeout(function () {
                    map.getView().setZoom(20);
                    map.getView().setCenter([lon, lat]);
                    centerCrossEffect.startAnimate(lon, lat);
                }, 300)
            } else if (event.button == 2) {//右键点击
                var menu = $("#policeRightMenu");
                menu.css("left", event.clientX + "px");
                menu.css("top", event.clientY + "px");
                menu.show();
                var mobileLi = event.target;
                var rightMenu = menu[0];
                rightMenu.dataset.custId = mobileLi.dataset.custId;
                rightMenu.dataset.custCode = mobileLi.dataset.custCode;
                rightMenu.dataset.realName = mobileLi.dataset.realName;
            } else {
                return false;
            }
        })
        $("#j_rightMenu_sendMsg").live("click", function (event) {
            var rightMenu = event.target.parentNode.parentNode;
            var custId = rightMenu.dataset.custId;
            if (custId == top.custId) {
                fadingTip("无法给自己发送消息");
                return;
            }
            parent.openMyMsgDialog(custId);
            $("#policeRightMenu").hide();

        })
        $("#j_rightMenu_sendTask").live("click", function (event) {
            var rightMenu = event.target.parentNode.parentNode;
            var caseId = parent.caseId;
            var custId = rightMenu.dataset.custId;
            if (custId == top.custId) {
                fadingTip("无法给自己下发任务");
                return;
            }
            var realName = rightMenu.dataset.realName;
            parent.caseInvestigation.toAddTaskOnMap(caseId, custId, realName);
            $("#policeRightMenu").hide();
        })
        $("#j_rightMenu_sendVideo").live("click", function (event) {
            var rightMenu = event.target.parentNode.parentNode;
            var custCode = rightMenu.dataset.custCode;
            var realName = rightMenu.dataset.realName;
            parent.sendMsgToClient("511", custCode + "@" + realName);
            $("#policeRightMenu").hide();
        })

        $('#policePop').delegate('', 'mousedown', function (event) {
            if (event.button == 0) {
                $("#policeRightMenu").hide();
            }
        })
    },
    CLASS_NAME: "PersonClassControl"
};

//闪烁图标
function showTwinkle(custId, type) {
    try {
        if (type && type.toString().substr(0, 2) == 'dt') {
            var data = dtGpsControl.userLonLatMap.get(custId);
            if (data) {
                $("#dtSearchResultDiv").hide();
                var feature = dtGpsControl.dtgpsClassSource.getFeatureById(custId);
                dtGpsControl.dtgpsClassSource.removeFeature(feature);
                var imgUrl = "resource/images/dtcar_gps.png";
                if (type == 3) {
                    imgUrl = "resource/images/dt_gps.png";
                }
                var pointStyle = getPointClassStype(imgUrl);
                feature.setStyle(pointStyle);
                dtGpsControl.dtgpsClassSource.addFeature(feature);
                window.gisInteraction.clearTwinkle();
                window.gisInteraction.setPosition(data.lon, data.lat, 18);
                window.gisInteraction.showTwinkle(parseInt(Math.random(10) * 1000000), data.lon, data.lat, 5);
            }
            return;
        } else if (type) {
            var data = firstClassControl.deviceMap.get(custId);
            if (data) {
                $("#dtSearchResultDiv").hide();
                window.gisInteraction.clearTwinkle();
                window.gisInteraction.setPosition(data.lon, data.lat, 18);
                window.gisInteraction.showTwinkle(parseInt(Math.random(10) * 1000000), data.lon, data.lat, 5);
                firstClassControl.getPointInfo(custId, 1);
            }
        }
        var data = personClassControl.userLonLatMap.get(custId);
        if (data) {
            $("#dtSearchResultDiv").hide();
            var feature = personClassControl.personClassSource.getFeatureById(custId);
            personClassControl.personClassSource.removeFeature(feature);
            var pointStyle = getPointClassStype("resource/images/pls_01_onmsg.png");
            feature.setStyle(pointStyle);
            personClassControl.personClassSource.addFeature(feature);
            window.gisInteraction.clearTwinkle();
            window.gisInteraction.setPosition(data.lon, data.lat, 18);
            window.gisInteraction.showTwinkle(parseInt(Math.random(10) * 1000000), data.lon, data.lat, 5);
        }
    } catch (e) {
    }
}
