/**
 * @(#)GetPointControl.js
 * 
 * @description: 添加疑情管理
 * @author: 肖振亚 2015/11/3
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
var GetPointControl = function(){
    this.init.apply(this, arguments);
}

GetPointControl.prototype ={

    map:null,

    caseId : null,

    casePointSource : null,
    vectorLayer:null,
    heatmapVector:null,
    //前后追
    trackevt : null,
    init : function(map,caseId){

    this.map = map;
    this.caseId = "289166452E9D8D76E050007F0100120B";

    this.casePointSource = new ol.source.Vector({});
    this.casePointSourceHeatMap = new ol.source.Vector({});
    var clusterSource = new ol.source.Cluster({
                distance: 50,
                source: this.casePointSource
    });
    
    this.vectorLayer = new ol.layer.Vector({
        name : "casePointLayer",
        source: clusterSource,
        style: function(feature, resolution){
                var style;
                var size = feature.get('features').length;
                if (size > 1) {
                    style = [new ol.style.Style({
                        image: new ol.style.Icon(({
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
                }else{
                    feature.set("content",feature.get('features')[0].get("content"));
                    
                    var bjlbdm = feature.get('features')[0].get("content").bjlbdm;
                    var markImgUrl = top.window.getJQIcoTemplate(feature.get('features')[0].get("content"));
                    var pointStyle = getPointClassStype(markImgUrl);
                    
                    feature.setStyle(pointStyle);
                }
                return style;
            }
    });
    
    
    this.heatmapVector = new ol.layer.Heatmap({
          source: this.casePointSourceHeatMap,
          blur: 20,
          radius: 10
        });
    map.addLayer(this.heatmapVector);
    map.addLayer(this.vectorLayer);
    this.caseInvestigationInit(caseId);



},
caseInvestigationInit : function(caseId)
{
	    if(popupControl && jhpopupControl){
	    	popupControl.closePopUpwin();
            jhpopupControl.closePopUpwin();
	    }
	    var _this = this;
        var yqgetpoint =  $('#yqgetpoint').val();
        var bjnr = $("#bjnr").val();
        var bjlbdm = $("#bjlbdm").val();
        var startTime = $("#begintime").val();
        var endTime = $("#endtime").val();
        
        var bjlbdm = $("#bjlbdm").val();
        var bjlxdm = $("#bjlxdm").val();
        var bjxldm = $("#bjxldm").val();
        var afdd = $("#afdd").val();
        
        if(typeof(startTime) == "undefined"){
          startTime="";
        }
        if(typeof(endTime) == "undefined"){
         	 endTime="";
        }
        if(typeof(bjnr) == "undefined"){
         	 bjnr="";
        }
        if(typeof(bjlbdm) == "undefined"){
         	 bjlbdm="";
        }
        
        if(typeof(bjlxdm) == "undefined"){
         	 bjlxdm="";
        }
        if(typeof(bjxldm) == "undefined"){
         	 bjxldm="";
        }
        if(typeof(afdd) == "undefined"){
         	 afdd="";
        }
        this.casePointSource.clear();
        this.casePointSourceHeatMap.clear();
        if(jhpopupControl){
       		 jhpopupControl.closePopUpwin();
        }
        var _self = this;
        var url = "getHomeCjData.do?bjlbdm="+bjlbdm+"&bjlxdm="+bjlxdm+"&bjxldm="+bjxldm+"&afdd="+afdd+"&bjnr="+bjnr+"&bjlbdm="+bjlbdm+"&startTime="+startTime+"&endTime="+endTime;
        ZT.Utils.Ajax().request(url,{
        data : "",
        success : function(resobj){
        var content = eval("("+resobj.response+")");
        var result = content.cjData;
        _self.clear();  
        var alarmBjlbDict = content.dict.alarmBjlb;
        var alarmBjlxDict = content.dict.alarmBjlx;
        var alarmBjxlDict = content.dict.alarmBjxl;
        var lon = 0;
        var lat = 0;
        var iconFeatures = [];
        var iconFeaturesHeatMap = [];
        var countSize = 0;
        var countLon = 0;
        var countLat = 0;
        for(var i=0,len=result.length;i<len;i++){ 
        	//根据数据字典 将报警类型转换成相应的数据   由于数据字典不全导致可能匹配不上 所以要加判断
        	if(typeof(alarmBjlbDict[result[i].bjlbdm]) != 'undefined'){
        		result[i].bjlbdm  = alarmBjlbDict[result[i].bjlbdm];
        	}else{
        		result[i].bjlbdm = "";
        	}
    		if(typeof(alarmBjlxDict[result[i].bjlxdm]) != 'undefined'){
	    		result[i].bjlxdm  = alarmBjlxDict[result[i].bjlxdm];
    		}else{
    			result[i].bjlxdm = "";
    		}
    		if(typeof(alarmBjxlDict[result[i].bjxldm]) != 'undefined'){
	    		result[i].bjxldm  = alarmBjxlDict[result[i].bjxldm];
    		}else{
    			result[i].bjxldm = "";
    		}
            lon=result[i].longitude*1;
            lat=result[i].latitude*1;
            if(clientGISKind==clientGISKinds.OFFLINEGIS&&result[i].longitude!=""&&result[i].longitude!=undefined){  
                var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(result[i].longitude*1,result[i].latitude*1), 'EPSG:4326', 'EPSG:3857');
                lon = cor[0];
                lat = cor[1];
            }
            if(result[i].longitude*1 && result[i].latitude*1){
                countSize++;
                countLon += lon*1;
                countLat += lat*1;
                var iconFeature = new ol.Feature({
                    geometry: new ol.geom.Point([lon,lat]),
                    content : result[i]
                });
                var iconFeatureHeatMap = new ol.Feature({
                            geometry: new ol.geom.Point([lon,lat]),
                            weight: 0.3
                        });
                iconFeature.setStyle(newJQStyle);   
                iconFeatures.push(iconFeature);
                iconFeaturesHeatMap.push(iconFeatureHeatMap);
            }
            
        }
        if(countLon != 0 && countLat!= 0 ){
            //map.getView().setCenter([countLon/countSize,countLat/countSize]);
        }
        //map.getView().setCenter(ol.proj.transform(eval($(offline_center).val()),'EPSG:4326', 'EPSG:3857'));
        _self.casePointSource.addFeatures(iconFeatures);
        _self.casePointSourceHeatMap.addFeatures(iconFeaturesHeatMap);
    },
    failure : function(resobj){
    }
    });
},
    /**
     * 添加案件marker
     * 
     * @param 经度，纬度，设备id，气泡文本，是否定位到maker,icon图片
     * @return 无
     * @exception 无
     * @History: 无
     * 
     */
    addPointMarker : function(lon,lat) {
       this.delMakerById("mapMarkPoint");
       
       var feature = new ol.Feature({
        geometry: new ol.geom.Point([lon,lat]),
        });
       feature.setId("mapMarkPoint");
       feature.setStyle(newJQStyle);
    
       
      this.casePointSource.addFeature(feature);
    },
    addClusterPointListPop : function(features){
            var lon = features[0].get("content").longitude;
            var lat = features[0].get("content").latitude;
            var resambleHtml = '';
            //resambleHtml += '<div><div class="jhTitle">警情列表</div><div class="jh">';
            resambleHtml += '                       <ul>';
            for(var i=0;i<features.length;i++){
                var tmpObj = features[i].get("content");
                var jjdbh = tmpObj.jjdbh;
                var afdd = tmpObj.afdd;
                var bjnr = tmpObj.bjnr;
                var bjlbdm = tmpObj.bjlbdm;
                var bjlxdm = tmpObj.bjlxdm;
                var bjxldm = tmpObj.bjxldm;
                var hrsj = tmpObj.hrsj;
                var longitude = tmpObj.longitude;
                var latitude = tmpObj.latitude;
                var markImgUrl = top.window.getJQIcoTemplate(tmpObj);
                resambleHtml+='<li>';
                resambleHtml+='<a class="jhList" style="line-height:25px; padding:4px 0;" > ';
                resambleHtml+='<img src="' + markImgUrl  + '" width="23" height="25" style="float:left" />';
                resambleHtml+='<span style="margin-left:5px;"  title="' + bjnr + '" onclick="getPointControl.showClusterCase(this)" jjdbh="'+jjdbh+'" hrsj="'+hrsj+'" afdd="'+afdd+'"  bjnr="'+bjnr+'" bjlbdm="'+bjlbdm+'"  lon="'+longitude+'"  lat="'+latitude+'"  bjlxdm="'+bjlxdm+'" bjxldm="'+bjxldm+'" ';
                resambleHtml+='   >'+bjnr+'</span> ';
                resambleHtml+='</li>';
            }
            resambleHtml += '</ul>'
            jhpopupControl.showPopUpWin(resambleHtml,[lon*1,lat*1],1);
    },
    //删除临时点
    delMakerById : function(lid){
        var feature = this.casePointSource.getFeatureById("mapMarkPoint");
		if(feature){
			this.casePointSource.removeFeature(feature);
		}
        
    },
    showClusterCase : function(obj){
        obj = $(obj);
        var content = {
            jjdbh : obj.attr("jjdbh"),
            hrsj : obj.attr("hrsj"),
            afdd : obj.attr("afdd"),
            latitude : obj.attr("lat"),
            longitude : obj.attr("lon"),
            bjnr : obj.attr("bjnr"),
            bjlbdm : obj.attr("bjlbdm"),
            bjlxdm : obj.attr("bjlxdm"),
            bjxldm : obj.attr("bjxldm")
        }
        this.addpopUp(content);
   
    },
    clear : function(){
    
    },
    addpopUp : function(content){
        var text= document.getElementById("casePopUp").innerHTML
        text = text.replace(/%caseId/g,content.jjdbh);
        text = text.replace(/%happenTimeUpder/g,content.hrsj);
        text = text.replace(/%happenAddr/g,content.afdd);
        text = text.replace("%caseLongitude",content.latitude);
        text = text.replace("%caseLongitude",content.longitude);
        text = text.replace(/%simpleCaseCondition/g,content.bjnr);
        text = text.replace(/%bjlbdm/g,content.bjlbdm);
        text = text.replace(/%bjlxdm/g,content.bjlxdm);
        text = text.replace(/%bjxldm/g,content.bjxldm);
        text = text.replace(/%fqyp/g,"fqyp('"+content.jjdbh+"')");
        text = text.replace(/%dealJQ/g,"dealJQ('"+content.jjdbh+"')");
        text = text.replace(/%locateJQ/g,"locateJQ('"+content.jjdbh+"')")
        popupControl.showPopUpWin(text,[content.longitude*1,content.latitude*1]);
        if(top.window.isZBZ == 'true'){
            $("a[aliasid='fqypBtn']").hide();
        
        }
    
    },
    queryJQDetail : function(jqh){
    	var getJQList = this.casePointSource.getFeatures();
    	var result = null;
    	$.each(getJQList,function(i,item){
    		var content = item.get("content");
    		if(content.jjdbh == jqh){
    			result = content;
    			return true;
    		}
    	})
    	
    	this.addpopUp(result);
    	centerCrossEffect.startAnimate(result.longitude*1,result.latitude*1);
    	
    },
    CLASS_NAME : "GetPointControl"
    
    }

function backToAddCasePage() {
    if(parent.bottomFrame.yqMap){
        parent.bottomFrame.yqMap.close();
    }else{
        parent.yqMap.close();
    }
}

//警情提请合成
function fqyp(jjdbh){
    $.ajax({
       url:"fqypByjjh.do?isYP=1&jjh="+jjdbh,
       success:function(res){
          var res = eval("("+res+")");
          var caseId = res.resp;
          if(max != ""){
            toFQYP(caseId);
          }else{
            parent.toFQYP(caseId);
          }
       }
    })
}

var jqypPop = null;
function toFQYP(caseId) {
         //先判断是否可以提请合成
        var repeat = true;
        jQuery.ajax({
            async:false,
            url:"checkRepeatYP?caseId="+caseId,
            success:function(res){
               res = eval("("+res+")");
               repeat = res.result;
            }
        })
        if(!repeat){
           fadingTip("您已对该案件发起过研判,请不要重复提交",3000);
           return;
        }
        var url = 'url:fqypDetail.do?caseId=' + caseId + "&isEdit=1";
        jqypPop = jQuery.dialog({
            title: top.tqhcTitle,
            content: url,
            resize: false,
            lock: true,
            drag: false,
            width: '1100px',
            height: window.screen.availHeight-(40*2)-40,
            top: '43px',
            max: false,
            min: false,
            close: function () {
                jqypPop = null;
            }
        });
}

function dealCaseEvent(caseId){
        parent.sendMsgToClient(533, "案件侦办@caseInvestigation.do?caseId="+caseId, "disposeAlarm");
        parent.sendMsgToClient(444,caseId, "disposeAlarm");
}

//处理警情
function dealJQ(jjdbh){
    $.ajax({
       url:"fqypByjjh.do?jjh="+jjdbh,
       success:function(res){
          var res = eval("("+res+")");
          var caseId = res.resp;
          if(max != ""){
              dealCaseEvent(caseId);
          }else{
              parent.dealCaseEvent(caseId);
          }
       }
    })
}

//警情定位
function locateJQ(jjdbh){
    popupControl.closePopUpwin();
    jhpopupControl.closePopUpwin();
    window.top.curJJH = jjdbh;
    clickType = 12;
	mshp(10);
	showFadingTipDiv("点击地图取点");
}
