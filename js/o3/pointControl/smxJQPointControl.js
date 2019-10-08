/**
 * @(#)GetPointControl.js
 * 
 * @description: 添加疑情管理
 * @author: 肖振亚 2015/11/3
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
var contants = {
		page : 1,
		rows : 1000
}

var curentJjdbh = '';
var currentBjnr = '';

var GetPointControl = function(){
    this.init.apply(this, arguments);
}

GetPointControl.prototype ={
	jqRecordList: [],
    jqRecordMap: new HashMap(),
    jqMarkerLayer: "jqypMarkerLayer",
    jqHeatMarkerLayer: "jqypHeatMarkerLayer",
    map:null,
    //前后追
    trackevt : null,
    loadState : true,
    init : function(map){
    this.map = map;
    top.window.smxJQMapCallBack =  this.caseInvestigationInit;  //三门峡警情地图刷新回调函数
    top.window.addJqtoMap4List = this.addJqtoMap4List;
    if(top.window.jqfxJqData && top.window.jqfxJqData != null){
    	this.addJqtoMap4List(top.window.jqfxJqData);
    	top.window.jqfxJqData = null;
    }else{
    	this.caseInvestigationInit();
    }

    setTimeout(function () {
        //加载基础图层控件
    	initialBasalResourcesLayerControl(this.map);
    }, 1000);
},


caseInvestigationInit : function()
{
	    var _this = this;
        var _self = this;
        var url = 'smxQueryAlarm.do?time=' + new Date();
        url += top.window.getJqQueryParam();
        _this.loadState = false;
        _showWait();
        jQuery.ajax({
        	url : url,
        	type : "POST",
        	success : function(res){
        	     _hideWait();
        	     _this.loadState = true;
	        	 var content = eval("("+res+")");
	             var result = content.cjData;
	             var lon = 0;
	             var lat = 0;
	             var countSize = 0;
	             var countLon = 0;
	             var countLat = 0;
	             for(var i=0,len=result.length;i<len;i++){ 
	             	//根据数据字典 将报警类型转换成相应的数据   由于数据字典不全导致可能匹配不上 所以要加判断
	             	if(top.window.jqTypeMap.get(result[i].jqType)){
						result[i].jqType  = top.window.jqTypeMap.get(result[i].jqType).name;
					}else{
						result[i].jqType = "";
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
	                }
	                _this.jqRecordMap.put(result[i].jjdbh,result[i]);
	            }
	            if(countLon != 0 && countLat!= 0 ){
	                //map.getView().setCenter([countLon/countSize,countLat/countSize]);
	            }
	           // map.getView().setCenter(ol.proj.transform(eval($(offline_center).val()),'EPSG:4326', 'EPSG:3857'));
	            map.getView().setZoom(13);
//	            _self.casePointSource.addFeatures(iconFeatures);
//	            _self.casePointSourceHeatMap.addFeatures(iconFeaturesHeatMap);
	            _this.jqRecordList = result;
	            _this._showMarkers();  //警情
//	            _this._showHeatMap();  //警情热力图
	            //显示敏感警情预警
	        	if(top.toType){
	        		top.window.jqPointControl.queryJQDetail(top.jjdbhYj,null);
	        		top.toType = null;
	        	}
	            
	            if(top.locateMapCallback){
	        		top.locateMapCallback();// 工作台进入警情定位回调
	        	}
	            }
        })
},
_showMarkers:function(){
	var markerList = [];
 	var _this = this;
     for (var i = 0; i <  _this.jqRecordList.length; i++) {
     	var item =  _this.jqRecordList[i];
     	if (!item.longitude || !item.latitude) {
     		continue;
     	}
     	var maker = {
	            id: item.jjdbh,
	            name: item.bjnr,
	            lon: item.longitude * 1.0,
	            lat: item.latitude * 1.0,
	            att: item,
	            img: top.window.getJQIcoTemplate(item),
	            weight: 1.0
	        };
         markerList.push(maker);
     }
     window.gisInteraction.clearMarkers(_this.jqMarkerLayer);
 	 window.gisInteraction.addClusterMarkers(_this.jqMarkerLayer, markerList, function (attList) {
 		//地图上点击时不居中不放大
         top.window.isZoom = false;
         top.window.isCenter = false;
 		//点击图标显示气泡
        if (!attList || attList.length < 1)
            return;
        if (attList.length == 1) {
            var att = attList[0];
            _this.addpopUp(att);
        } else if (attList.length < 100) {
            _this.addClusterPointListPop(attList);
        }
    });
},
_showHeatMap : function(){
	var markerList = [];
	var _this = this;
    for (var i = 0; i <  _this.jqRecordList.length; i++) {
    	var item =   _this.jqRecordList[i];
    	if (!item.longitude || !item.latitude) {
    		continue;
    	}
    	var maker = {
            id: item.caseId,
            name: item.name,
            lon: item.longitude * 1.0,
            lat: item.latitude * 1.0,
            att: item,
            weight: 1.0
        };
        markerList.push(maker);
    }
    window.gisInteraction.clearHeatmap(_this.jqHeatMarkerLayer);
	window.gisInteraction.addHeatmap(_this.jqHeatMarkerLayer, markerList);
},
addJqtoMap4List:function(content){
	    var _this = this;
	     var result = content.rows;
//	     _self.clear();  
	     var lon = 0;
	     var lat = 0;
	     var iconFeatures = [];
	     var iconFeaturesHeatMap = [];
	     var countSize = 0;
	     var countLon = 0;
	     var countLat = 0;
	     for(var i=0,len=result.length;i<len;i++){ 
	     	if(top.window.jqTypeMap.get(result[i].jqType)){
				result[i].jqType  = top.window.jqTypeMap.get(result[i].jqType).name;
			}else{
				result[i].jqType = "";
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
	            iconFeature.setId(result[i].jjdbh);
	            var iconFeatureHeatMap = new ol.Feature({
	                        geometry: new ol.geom.Point([lon,lat]),
	                        weight: 0.3
	                    });
//	            iconFeature.setStyle(newJQStyle);   
//	            iconFeatures.push(iconFeature);
//	            iconFeaturesHeatMap.push(iconFeatureHeatMap);
	            
	            _this.jqRecordMap.put(result[i].jjdbh,result[i]);
	        }
	        
	    }
	    _this.jqRecordList.push(result);
	    if(countLon != 0 && countLat!= 0 ){
	        //map.getView().setCenter([countLon/countSize,countLat/countSize]);
	    }
	    map.getView().setCenter(ol.proj.transform(eval($(offline_center).val()),'EPSG:4326', 'EPSG:3857'));
	    map.getView().setZoom(13);
//	    _self.casePointSource.addFeatures(iconFeatures);
//	    _self.casePointSourceHeatMap.addFeatures(iconFeaturesHeatMap);
	    _this._showMarkers();
//	    _this._showHeatMap(); // 璧山不显示热力图
		
	    if(top.locateMapCallback){
			top.locateMapCallback();// 工作台进入警情定位回调
		}
       
},

    updateLocation : function (jjdbh,lon,lat){
    	var _this = this;
    	$.ajax({
    		type:"post",
    		url:"saveJcjbLonLat.do",
    		data:{
    			"jjdbh":jjdbh,
    			"lon":lon,
    			"lat":lat
    		},
    		success:function(data){
			     var contents = null;
			     if(_this.jqRecordMap.get(jjdbh)){
				    	contents = _this.jqRecordMap.get(jjdbh);
				    	contents.latitude = lat*1;
					    contents.longitude = lon*1;
					    _this.jqRecordMap.remove(jjdbh);
			    }else{
			    	$.ajax({
			    		url : "smxQueryAlarm.do?jjdbh="+jjdbh,
			    		async:false,
			    		success : function(res){
			    		   var content = eval("("+res+")");
			               var jcjbData = content.cjData[0];
				             if(top.window.jqTypeMap.get(jcjbData.jqType)){
				            	 jcjbData.jqType  = top.window.jqTypeMap.get(jcjbData.jqType).name;
				             }else{
				             	 jcjbData.jqType = "";
				             }
			                 var lon=jcjbData.longitude*1;
			                 var lat=jcjbData.latitude*1;
			                 if(clientGISKind==clientGISKinds.OFFLINEGIS&&jcjbData.longitude!=""&&jcjbData.longitude!=undefined){  
			                    var cor = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(jcjbData.longitude*1,jcjbData.latitude*1), 'EPSG:4326', 'EPSG:3857');
			                    lon = cor[0];
			                    lat = cor[1];
			                 }
			                 jcjbData.longitude = lon*1;
			                 jcjbData.latitude = lat*1;
			                 contents = jcjbData;
			    	    }
			    	})
			    }
			     _this.jqRecordMap.put(jjdbh,contents);
			     _this._showMarkers();
			     _this._showHeatMap();
			     top.window.isRelocate = false;
    		},
    		error:function(data){
    			console.log(data);
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
    addClusterPointListPop : function(attList){
            var lon = attList[0].longitude;
            var lat = attList[0].latitude;
            var resambleHtml = '';
            //resambleHtml += '<div><div class="jhTitle">警情列表</div><div class="jh">';
//            resambleHtml += '                       <ul>';
            resambleHtml+=' <div class="NPopUpBox02" style="width:350px;" id="clusterPopUp">';
            resambleHtml+='<a href="javascript:void(0);" class="NPopUpClose02" onclick="top.window.gisInteraction.clearPopup();"></a>';
            resambleHtml+=' <div class="NPUTwoContent">';
            resambleHtml+='<div class="GPUHeader02"><h1>警情聚合列表</h1></div>';
            resambleHtml+='   <div class="GPUInnerBox">';
            resambleHtml+='   	<div class="GPUInnerBox_Border">';
            resambleHtml+='       	<div class="GkkListBox" style="height:200px;" id="clusterPopUpContent">';
            for(var i=0;i<attList.length;i++){
                var tmpObj = attList[i];
                var jjdbh = tmpObj.jjdbh;
                var afdd = tmpObj.afdd;
                var bjnr = tmpObj.bjnr;
                var jqType = tmpObj.jqType;
                var hrsj = tmpObj.bjsj||tmpObj.hrsj;
                var longitude = tmpObj.longitude;
                var latitude = tmpObj.latitude;
                var markImgUrl = top.window.getJQIcoTemplate(tmpObj);
                var rn = tmpObj.rn;
//                resambleHtml+='<li>';
//                resambleHtml+='<a class="jhList" style="line-height:25px; padding:4px 0;" > ';
//                resambleHtml+='<img src="' + markImgUrl  + '" width="23" height="25" style="float:left" />';
//                resambleHtml+='<span style="margin-left:5px;"  title="' + bjnr + '" onclick="getPointControl.showClusterCase(this)" rn ="'+rn+'" jjdbh="'+jjdbh+'" hrsj="'+hrsj+'" afdd="'+afdd+'"  bjnr="'+bjnr+'" jqType="'+jqType+'"  lon="'+longitude+'"  lat="'+latitude+'" ';
//                resambleHtml+='   >'+bjnr+'</span> ';
//                resambleHtml+='</li>';
                
                resambleHtml+='<a href="javascript:void(0);" class="GkkListNav" style="height:42px;line-height:30px;"> ';
                resambleHtml+='    <img src="' + markImgUrl  + '" width="29" height="42" style="margin-top: -3px;"/>';
                resambleHtml+='    <span style="margin-left:5px;" title="' + bjnr + '" onclick="getPointControl.showClusterCase(this)" rn ="'+rn+'" jjdbh="'+jjdbh+'" hrsj="'+hrsj+'" afdd="'+afdd+'"  bjnr="'+bjnr+'" jqType="'+jqType+'"  lon="'+longitude+'"  lat="'+latitude+'" ';
                resambleHtml+='       >'+bjnr+'</span> ';
                resambleHtml+='</a>';
            }      	
            resambleHtml+='           </div>';
        	resambleHtml+='       	<div class="GPUInnerBox_Line01"></div>';
        	resambleHtml+='   	<div class="GPUInnerBox_Line02"></div>';
        	resambleHtml+='    </div>';
        	resambleHtml+='  </div>';
        	resambleHtml+=' </div>';
        	resambleHtml+='<div class="NPopUpBox02_line01"></div>';
        	resambleHtml+='<div class="NPopUpBox02_line02"></div>';
        	resambleHtml+=' <div class="NPopUpBox02_j01"></div>';
        	resambleHtml+=' <div class="NPopUpBox02_j02"></div>';
        	resambleHtml+=' <div class="NPopUpBox02_j03"></div>';
        	resambleHtml+='<div class="NPopUpBox02_j04"></div>';
        	resambleHtml+='<div class="NPopUpBox02_j05"></div>';
        	resambleHtml+='<div class="NPopUpBox02_j06"></div>';
        	resambleHtml+=' </div>';
            
//            resambleHtml += '</ul>'
//            jhpopupControl.showPopUpWin(resambleHtml,[lon*1,lat*1],1);
            window.gisInteraction.showPopup(attList[0].jjdbh, lon, lat, resambleHtml, false);
	        window.gisInteraction.setCenterLeft(lon,lat);
            
    },
    //删除临时点
    delMakerById : function(lid){
        var feature = this.casePointSource.getFeatureById("mapMarkPoint");
		if(feature){
			this.casePointSource.removeFeature(feature);
		}
        
    },
    showClusterCase : function(obj){
    	$("#jhclose").click();
        obj = $(obj);
        var content = {
            jjdbh : obj.attr("jjdbh"),
            hrsj : obj.attr("hrsj"),
            afdd : obj.attr("afdd"),
            latitude : obj.attr("lat"),
            longitude : obj.attr("lon"),
            bjnr : obj.attr("bjnr"),
            jqType : obj.attr("jqType"),
            rn : obj.attr("rn")
        }
        this.addpopUp(content);
   
    },
    clear : function(){
    
    },
    addpopUp : function(content){
    	var _this = this;
    	
    	var slUserId = '';  //警情受理人ID
    	var pfrUserId = '';  //现勘指派的人ID
    	
        //查看该警情是否被受理
    	$.ajax({
    		url : 'queryJqDetailByJjdbh.do?jjdbh='+content.jjdbh,
    		success:function(res){
    		   res = eval("("+res+")");
    		   var isShow = true;
    		   if(res.detail.caseId){
    			   $.each(res.detail.jqProcess,function(i,item){
    				   if(item.createUserid){
    					   slUserId = item.createUserid;
    					   isShow = false;
    					   return true;
    				   }
    			   })
    		   }
    		   
    		   if(res.detail.xkryzp){
    			   $.each(res.detail.xkryzp,function(i,item){
    				   if(item.custId){
    					   pfrUserId += item.custId + ',';
    				   }
    			   })
    		   }
    		   
    		   var isQx = true;
    		   if(res.isLeader == 0){
    			   isQx = false;
    		   }
    		   var html =_this._getJqMarkerPopupHtmlTemplate(res.isPf);
    		   
    		   if(res.hcStatu==0){
    			   html = html.replace(/%tqhcNR/g, top.tqhcTitle || "");
    			   html = html.replace(/%showTqhc/g, "block");
    		   }else if(res.hcStatu==2){
    			   html = html.replace(/%tqhcNR/g, "还原合成");
    			   html = html.replace(/%showTqhc/g, "block");
    		   } else {
    			   html = html.replace(/%showTqhc/g, "none");
    		   }
    		    html = html.replace(/%bjnr/g, content.bjnr || "");
    	        html = html.replace(/%jjdbh/g, content.jjdbh || "");
    	        html = html.replace(/%bjsj/g, (dealWithParam(content.bjsj) ==  "" ? content.hrsj : content.bjsj) || "");
    	        html = html.replace(/%afdd/g, content.afdd || "");
    	        html = html.replace(/%jqType/g, content.jqType || "");
    	        html = html.replace(/%longitude/g, content.longitude || "");
    	        html = html.replace(/%latitude/g, content.latitude || "");
    	        
    	        html = html.replace(/%fqyp/g,"fqyp('"+content.jjdbh+"')");
    	        html = html.replace(/%dealJQ/g,"dealJQ('"+content.jjdbh+"')");
    	        html = html.replace(/%locateJQ/g,"locateJQ('"+content.jjdbh+"')");
    	        html = html.replace(/%xsry/g,"top.showRelativePersonUI('"+res.detail.jcjb.longitude*1+"','"+res.detail.jcjb.latitude*1+"','','"+ 1 +"');");
    	        html = html.replace(/%tqhc/g,"parent.judgementMain.fqyp('"+content.jjdbh+"',"+res.hcStatu+")");
			    if(isShow){
			    	html = html.replace(/%sl/g," parent.judgementMain.acceptJq('"+content.jjdbh+"'); popupControl.closePopUpwin();");
			    }else{
			    	html = html.replace(/%sl/g,"fadingTip('该警情已被受理',3000)");
			    }
			    html = html.replace(/%xxxx/g,"parent.judgementMain.openJqDetailForMap('"+content.jjdbh+"','"+content.jjdbh+"','"+content.rn+"')");
			    html = html.replace(/%xsaj/g,"caseMerge('"+content.jjdbh+"')");
			    html = html.replace(/%xgry/g,"top.showCaseRefFocalManUI('"+content.longitude*1+"','"+content.latitude*1+"','ZDRY_"+content.jjdbh+"','"+res.detail.jcjb.bjsj+"');");
			    html = html.replace(/%secondLocation/g, content.jjdbh);
//		        text = text.replace(/%sptj/g,"top.videoRecommend('"+content.longitude*1+"','"+content.latitude*1+"')");
		        if(res.detail.jcjb.bjsj){
		        	html = html.replace(/%sptj/g,"top.videoRecommend('"+content.longitude*1+"','"+content.latitude*1+"','"+res.detail.jcjb.bjsj+"')");
		        	html = html.replace(/%cltj/g,"top.carRecommend('"+content.longitude*1+"','"+content.latitude*1+"','"+res.detail.jcjb.bjsj+"')");
		        }else{
		        	html = html.replace(/%sptj/g,"top.videoRecommend('"+content.longitude*1+"','"+content.latitude*1+"','"+res.detail.jcjb.hrsj+"')");
		        	html = html.replace(/%cltj/g,"top.carRecommend('"+content.longitude*1+"','"+content.latitude*1+"','"+res.detail.jcjb.hrsj+"')");
		        }
		        if(res.isPf == "false"){
		        	if(isQx){
		        		 html = html.replace(/%jqpf/g, "showJqpfDialog('"+content.jjdbh+"')");
		        	}else{
		        		 html = html.replace(/%jqpf/g,"fadingTip('您没有该功能的权限!',2000)");
		        	}
		        	
		        }
		        html = html.replace(/%cjfk/g,"toPcsCollectFk('"+content.jjdbh+"');");
		        html = html.replace(/%xkcj/g,"toXsjsCollectFk('"+content.jjdbh+"');");
		        html = html.replace(/%xkryzp/g,"toXkryPf('"+content.jjdbh+"','"+content.gxdwdm+"','"+content.longitude*1+"','"+content.latitude*1+"');");
    	        //单点摸排
    	        html = html.replace(/%ddmp/g,"top.toSinglePointScreen('"+content.jjdbh+"','"+res.detail.jcjb.bjsj+"');");
    	        //多点碰撞
    	        html = html.replace(/%ddpz/g,"top.toMultiPointScreen('"+content.jjdbh+"','"+res.detail.jcjb.bjsj+"');");
    	        html = html.replace(/%kshyp/g,"parent.widnow.jqToCaseProcess();");
    	        
    	        
    	        var id = "jq_" + content.jjdbh;
    	        var lon = content.longitude * 1.0;
    	        var lat = content.latitude * 1.0;
	            
    	        window.gisInteraction.clearPopup(id);
    	        var maxZoom =  top.window.getMapMaxZoom();
    	        window.gisInteraction.setZoom(maxZoom-3);
    	        window.gisInteraction.showPopup(id, lon, lat, html, false);
    	        window.gisInteraction.showTwinkle(id,lon,lat,2);
    	        window.gisInteraction.setCenterLeft(lon,lat);
    	        
    	        if(slUserId == userInfo.custId){
    	        	$("#cjcjBut").show();
    	        }
    	        if(pfrUserId.indexOf(userInfo.custId) > -1){
    	        	$("#xkcjBut").show();
    	        }
//    	        if(res.isPcs && res.isPcs == "fasle"){
//    	        	$("#xkryzpBut").show();
//    	        }
    	        if(window.orgName.indexOf('刑事侦查支队')>-1 || window.isLeader == '2'){
//    	        	$("#xkryzpBut").show();
    	        }
    	        
    	        curentJjdbh = content.jjdbh;
    	        currentBjnr = content.bjnr;
    	        
				if(top.window.isZBZ == 'true'){
				    $("a[aliasid='fqypBtn']").hide();
				}
				$("a[aliasid='acceptJq']").show();
				if(top.jqMapType == "myAlarm"){
					 $("a[aliasid='acceptJq']").hide();
				}
				//20180119屏蔽合成研判'补充申请'按钮
		        if($("#jqMarkerHtml .GPUBtn01[aliasid='fqyp']").text().indexOf("补充申请")>-1){
		        	//$("#jqMarkerHtml .GPUBtn01[aliasid='fqyp']").hide();
		        	//此处修改了补充申请按钮点击事件20180120
		        	$("#jqMarkerHtml .GPUBtn01[aliasid='fqyp']").attr("onclick","").attr("jjdbh",content.jjdbh);
			        $("#jqMarkerHtml .GPUBtn01[aliasid='fqyp']").unbind("click").bind("click",function(e){
						var event = window.event || arguments.callee.caller.arguments[0];
						event.stopPropagation();
			        	var jjdbh=$(this).attr("jjdbh");
			        	//打开警情-合成研判-补充申请界面
			        	top.jqHcypBctjDialog = jQuery.fn.scienceDialog({
							url : "toJqHcypBctj.do?jjdbh="+jjdbh,
							width:'auto',
							height:'auto',
							close: function() {
							}
						});
			        });
		        }
    		}
    	})
    },
    
    _getJqMarkerPopupHtmlTemplate: function (isPf) {
  	  var html = '  	<div class="NPopUpBox02" id="jqMarkerHtml" style="width:420px;">'
  	     + '   <a href="javascript:void(0);" class="NPopUpClose02" id="btnCloseJQPopup" onclick="top.window.gisInteraction.clearPopup();"></a>'
  	     + '   <div class="NPUTwoContent">'
  	     + '   	<div class="GSDHeader" title="%bjnr">&nbsp;&nbsp;&nbsp;&nbsp;%bjnr</div>'
  	     + '       <div class="GPUInnerBox">'
  	     + '       	<div class="GPUInnerBox_Border">'
  	     + '               <div class="GStaffDetailsBox">'
  	     + '                   <div class="GStaffDetails">'
  	     + '                       <div class="GStaffDetailsTitle">报警时间：</div>'
  	     + '                       <div class="GStaffDetails_r">%bjsj</div>'
  	     + '                       <div class="clear"></div>'
  	     + '                  </div>'
  	     + '                   <div class="GStaffDetails">'
  	     + '                       <div class="GStaffDetailsTitle">报警地址：</div>'
  	     + '                       <div class="GStaffDetails_r" title="%afdd">%afdd</div>'
  	     + '                       <div class="clear"></div>'
  	     + '                   </div>'
  	     + '                   <div class="GStaffDetails">'
  	     + '                       <div class="GStaffDetailsTitle">警情类别：</div>'
  	     + '                       <div class="GStaffDetails_r">%jqType</div>'
  	     + '                       <div class="clear"></div>'
  	     + '                   </div>'
  	     + '               </div>'
  	     + '           	<div class="GPUInnerBox_Line01"></div>'
  	     + '           	<div class="GPUInnerBox_Line02"></div>'
  	     + '           </div>'
  	     + '       </div>'
  	     + '       <div class="GPUBtnBox01" style="height:52px;">'
  	     + '           <div class="GPUBtnBox02">'
  	     + '				<a href="javascript:void(0);" class="GPUBtn01" aliasid="expandDetailBtn"onclick="%xxxx" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;研判进展</a>';
  	  	 if(top.window.regionCode !='420106'){
//  	  		html += ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="relativePerson"  onclick="%xsry" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;打处人员</a>';
  	     }
  	     html+= ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="relativeCase"  onclick="%xsaj" style="cursor:pointer;margin-top:4px;display:none;"  hidefocus="true">&nbsp;相似案件</a>'
  	     //20180119屏蔽警情合成研判小弹窗中的'补充申请'按钮
  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="fqyp" style="cursor:pointer;margin-top:4px;display:%showTqhc" onclick="%tqhc"  hidefocus="true">&nbsp;%tqhcNR</a>'
//  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="acceptJq" style="cursor:pointer;margin-top:4px;"  onclick="%sl" hidefocus="true">&nbsp;受理</a>'
  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" alias="%secondLocation" style="cursor:pointer;margin-top:4px;"  onclick="parent.updateJQLocation(this)" hidefocus="true">&nbsp;二次定位</a>'
  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="videoRecommend"  onclick="%sptj" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;视频推荐</a>'
  	     + ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="carRecommend"  onclick="%cltj" style="cursor:pointer;margin-top:4px;display:none;"  hidefocus="true">&nbsp;嫌疑车辆推荐</a>';
  	     html += ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="caseRefFocalMan" onclick="%xgry" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;重点人员筛查</a>';
  	     html += ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="ddmp" onclick="%ddmp" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;单点摸排</a>';
  		 html += ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="ddpz" onclick="%ddpz" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;多点碰撞</a>';
  		 html += ' 				<a href="javascript:void(0);" class="GPUBtn01" aliasid="kshyp" onclick="%kshyp" style="cursor:pointer;margin-top:4px;"  hidefocus="true">&nbsp;可视化研判</a>';
  		 html+= '           </div>'
  	     + '       </div>'
  	     + '   </div>'
  	     + '   <div class="NPopUpBox02_line01"></div>'
  	     + '   <div class="NPopUpBox02_line02"></div>'
  	     + '   <div class="NPopUpBox02_j01"></div>'
  	     + '   <div class="NPopUpBox02_j02"></div>'
  	     + '   <div class="NPopUpBox02_j03"></div>'
  	     + '   <div class="NPopUpBox02_j04"></div>'
  	     + '   <div class="NPopUpBox02_j05"></div>'
  	     + '   <div class="NPopUpBox02_j06"></div>'
  	     + '</div>';
  	     return html;
      	
      },
    
    queryJQDetail : function(jqh,me){
    	$(".PUBox02").remove();
    	$(".NPopUpBox02").remove();
    	var _this = this;
    	var getJQList =  _this.jqRecordList;
    	if(!_this.loadState){
    		return;
    	}
    	var result = null;
    	$.each(getJQList,function(i,item){
    		if(item && item.jjdbh == jqh){
    			result = item;
    			return true;
    		}
    	})
    	if(result == null){
    		window.gisInteraction.clearPopup();
//  		new ConfirmDialog("该警情暂无坐标,是否进行定位？", function () {
//  			var span = document.createElement("span");
//				span.setAttribute("alias", jqh);
//				parent.updateJQLocation(span);
//				mshp(10);
//  		});
			//2018.4.24无坐标的警情直接定位到璧山公安局
			window.gisInteraction.setCenterLeft(106.1971,29.5785);
    		return;
    	}
    	if(!result.longitude || !result.latitude){
    		window.gisInteraction.clearPopup();
//  		new ConfirmDialog("该警情暂无坐标,是否进行定位？", function () {
//  			var span = document.createElement("span");
//				span.setAttribute("alias", jqh);
//				parent.updateJQLocation(span);
//				mshp(10);
//  		});
			//2018.4.24无坐标的警情直接定位到璧山公安局
			window.gisInteraction.setCenterLeft(106.1971,29.5785);
    		return;
    	}
    	if(result.latitude>90){
    		fadingTip("纬度异常，请重新定位！");
    		return;
    	}
    	if(top){
    		top.window.isCenter = true;
        	top.window.isZoom = true;
    	}
    	this.map.getView().setZoom(14);
    	this.addpopUp(result);
    },
    
    /**
     * 搜索警员派警
     * @param jjdbh
     * @param longitude
     * @param latitude
     */
    queryPolice : function (jjdbh, gxdwdm, longitude,latitude) {
    	var _this = this;
    	$('#queryPoliceList').html('');
//    	if ($('#policeSearchText').val()=='' || $('#policeSearchText').val()==undefined) {
//    		fadingTip("请输入警号或姓名！");
//    		return;
//    	}
    	var list = [];
    	jQuery.ajax({
            type: "POST",
            cache : false,
            async : false,
            url: "queryPoliceListForBs.do",
            data : {
            	jjdbh : jjdbh,
            	gxdwdm : gxdwdm,
            	searchText : $('#policeSearchText').val()
            },
            success: function(msg) {
                if(!msg) return;
                var data = eval("(" + msg + ")");
                if( data && data.errorCode=='0'){
                	list = data.resp;
                }else{
                	fadingTip("查询出错！");
                }
            }
        });
    	if (!list || list.length < 1) {
    		return;
    	}
    	var fjjyHtml = '';
    	//计算警员距离该警情的距离
    	for(var i=0; i<list.length; i++){
    		var value = list[i];
    		if (!value.longitude || !value.latitude) {
    			value.distance = 999999999;
    		} else {
    			var distance = Math.ceil(Math.sqrt((value.longitude - longitude)*(value.longitude - longitude)+
        				(value.latitude - latitude)*(value.latitude - latitude)) / 0.00000916);
    			value.distance = distance;
    		}
    	}
    	//根据距离正序排序
    	list.sort(function(obj1,obj2){
            if(obj1.distance<obj2.distance){
                return -1;
            }
            else if(obj1.distance==obj2.distance){
                return 0;
            }else{
                return 1;
            }
        });
    	//弹框中显示搜索到的警员列表
    	for(var i=0; i<list.length; i++){
    		var value = list[i];
			fjjyHtml += _this.getFjjyHtml(value, value.distance);
    	}
    	fjjyHtml = fjjyHtml.replace(/%jqLon/g, longitude);
    	fjjyHtml = fjjyHtml.replace(/%jqLat/g, latitude);
    	$('#queryPoliceList').html(fjjyHtml);
    },
    
    //获取附近警力弹框中的警员列表html
    getFjjyHtml : function (item, distance){
    	var html = '<div class="GPUPListNav" custId="%custId" custName="%custName" realName="%realName" orgName="%orgName" orgId="%orgId">'
    				+'    <div class="GPUPListNav_img">'
//    				+'        <div class="GPUPListBubble02" onclick="getPointControl.showPoliceJqList(%custId, %jqLon, %jqLat)"></div>'
    				+'        <img src="resource/scienceLayout/images/GisNew/Police02_offline.png" width="32" height="32" />'
    				+'    </div>'
    				+'    <span class="GPUPListNav_Name" title="%realName(%custName)">%realName(%custName)</span>'
    				+'    <span class="GPUPListNav_Name" style="width:80px;" title="%orgName">%orgName</span>'
    				+'    <div class="GPUPListDrive">'
    				+'        <span class="GPUPListDistance">%distance</span>'
//    				+'        <a href="javascript:void(0);" class="GPUPListSound"></a>'
//    				+'        <a href="javascript:void(0);" class="GPUPListCommand"></a>'
    				+'        <a href="javascript:void(0);" class="GPUPListCheckBox" onclick="getPointControl.clickBtn(this);"></a>'
    				+'    </div>'
    				+'</div>';
    	if (distance > 10000000) {
    		html = html.replace('%distance', '未定位');
    	} else if (parseFloat(distance) > 1000){
    		html = html.replace('%distance', (parseFloat(distance)/1000).toFixed(2) + 'km');
    	} else {
    		html = html.replace('%distance', parseFloat(distance).toFixed(2) + 'm');
    	}
//    	if (item.unsolvedJQ > 2) {
//    		html = html.replace('GPUPListBubble02', 'GPUPListBubble01');
//    	}
    	if (item.mobileOnlineStatus == 1) {
    		html = html.replace('Police02_offline.png', 'Police02_online.png');
    	}
    	html = html.replace(/%custId/g, item.custId);
    	html = html.replace(/%custName/g, item.custName);
    	html = html.replace(/%realName/g, item.realName);
    	html = html.replace(/%orgName/g, item.orgName);
    	html = html.replace(/%orgId/g, item.orgId);
    	
    	return html;
    },
    
    clickBtn : function (obj) {
    	if($(obj).hasClass("GPUPListCheckBox")){
    		$(obj).removeClass().addClass("GPUPListCheckBox_on");
    	}else{
    		$(obj).removeClass().addClass("GPUPListCheckBox");
    	}
    },
    
    /**
     * 确认调度
     */
    commitCommand : function () {
    	var _this = this;
    	var jjdbh = curentJjdbh;
    	var custIds = [];
    	var content = [];
    	$('.GPUPListCheckBox_on').each(function (index, obj) {
    		var custId = $(obj).parent().parent().attr('custId');
    		var realName = $(obj).parent().parent().attr('realName');
    		var custName = $(obj).parent().parent().attr('custName');
    		var orgName = $(obj).parent().parent().attr('orgName');
    		var orgId = $(obj).parent().parent().attr('orgId');
    		var item = {
				custId:custId,
				realName:realName,
				custName:custName,
				orgName:orgName,
				orgId:orgId
    		};
    		content.push(item);
    		custIds.push(custId);
    	});
    	if (content.length < 1 || content.length > 1) {
    		fadingTip('请选择一个民警！');
    		return;
    	}
        var  userJsonStr = JSON.stringify(content)
        _this.saveCommit(jjdbh ,userJsonStr);
        var msg = {
        	dataType : "2002",//2002：派警信息推送；
            id : jjdbh,
            title : currentBjnr,
            name : currentBjnr,
            userName : userInfo.realName,
            type:'jq'
        };
        top.window.sendMsg(custIds,msg);
        $('#popup-closer').click();
//        _this.refreshPopup();
        //刷新右侧列表的出警状态
//        top.window.refreshJqState(jjdbh);
        fadingTip("调度成功！")
        parent.window.queryJqBoard();
        
        var id = "jq_" + jjdbh;
        window.gisInteraction.clearPopup(id);
    },
    
    //刷新警情弹框
    refreshPopup : function () {
    	jQuery.ajax({
            type: "POST",
            cache : false,
            async : false,
            url: "queryJqDetailByJjdbh.do?jjdbh="+curentJjdbh,
            success: function(msg) {
                if(!msg) return;
                var data = eval("(" + msg + ")");
                if( data && data.detail){
                	getPointControl.addpopUp(data.detail.jcjb);
                }
            }
        });
    },
    
    //保存调度信息
    saveCommit : function (jjdbh, userJsonStr) {
    	jQuery.ajax({
            type: "POST",
            cache : false,
            async : false,
            url: "commitCommand.do",
            data : {
            	jjdbh : jjdbh,
            	userJsonStr : userJsonStr
            },
            success: function(msg) {
                if(!msg) return;
                var data = eval("(" + msg + ")");
                if( data && data.errCode=='0'){
                	fadingTip("调度成功！");
                }else{
                    
                }
            }
        });
    },
    
    /**
     * 现勘人员指派
     */
    xkryPf : function (jjdbh, gxdwdm, longitude, latitude){
    	window.gisInteraction.setPosition(longitude, latitude);
    	//关闭弹框
    	$('#popup-closer').click();
    	var html = getManualCommandHtml(jjdbh, gxdwdm, longitude, latitude);
    	
        var id = "jq_" + jjdbh;
        window.gisInteraction.clearPopup(id);
        window.gisInteraction.showPopup(id, longitude*1, latitude*1, html, true);
        getPointControl.queryPolice(jjdbh, gxdwdm, longitude, latitude);
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
function fqyp(jjdbh,hcStatu){
	var url = "fqypByjjh.do?isYP=1&jjh="+jjdbh;
	$.ajax({
	   url:url,
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

function caseMerge(jjdbh){
	$.ajax({
       url:"fqypByjjh.do?jjh="+jjdbh,
       success:function(res){
            var res = eval("("+res+")");
            var caseId = res.resp;
            var title = '相似案件';
			var url = 'toRecommendCasePage.do?caseId='+caseId+'&time=' + new Date();
			var top=100;
			
			caseRecommendDialog = jQuery.fn.scienceDialog({
			    url : url,
			    zIndex : 999999,
				width:'auto',
				height:'auto',
			    top:'1',
			    close:function(){
			    	caseRecommendDialog = null;
		        }
			});
       }
    })	
}

/**
 * 警情派发
 * @param jjdbh
 */
function showJqpfDialog(jjdbh){
	var url = "toJqDistributed.do?jjdbh="+jjdbh;
	
	top.jqpfDialog = jQuery.fn.scienceDialog({
	    url : url,
	    zIndex : 999999,
		width:'800',
		height:'500',
	    top:0,
		lockMask:true,
	    close:function(){
	    	top.jqpfDialog = null;
       }
	});
}

/**
 * 派出所现场 采集反馈
 */
function toPcsCollectFk(jjdbh){
    top.pcsCollectFk = jQuery.fn.scienceDialog({
	    url : 'toPcsCollectFk.do?jjdbh='+jjdbh+'&type=jq',
	    zIndex : 999999,
		width:'auto',
		height:'auto',
	    close:function(){
	    	parent.window.queryJqBoard();
            top.pcsCollectFk = null;
       }
	});
}

/**
 * 刑事技术现场 采集反馈
 */
function toXsjsCollectFk(jjdbh){
    top.xsjsCollectFk = jQuery.fn.scienceDialog({
	    url : 'toXsjsCollectFk.do?jjdbh='+jjdbh+'&type=jq',
	    zIndex : 999999,
		width:'auto',
		height:'auto',
	    close:function(){
	    	parent.window.queryJqBoard();
            top.xsjsCollectFk = null;
       }
	});
}

/**
 * 现勘人员指派
 */
function toXkryPf(jjdbh, gxdwdm, longitude, latitude){
	//关闭弹框
	$('#popup-closer').click();
	var html = getManualCommandHtml(jjdbh, gxdwdm, longitude, latitude);
	
    var id = "jq_" + jjdbh;
    window.gisInteraction.clearPopup(id);
    window.gisInteraction.showPopup(id, longitude*1, latitude*1, html, true);
    
    getPointControl.queryPolice(jjdbh, gxdwdm, longitude, latitude);
}

function getManualCommandHtml(jjdbh, gxdwdm, longitude, latitude){
	var html = $('#policeSearchhtml').html();
	html = html.replace('%id', 'queryPoliceList');
	html = html.replace(/%jjdbh/g, jjdbh);
	html = html.replace(/%gxdwdm/g, gxdwdm);
	html = html.replace(/%longitude/g, longitude);
	html = html.replace(/%latitude/g, latitude);
	return html;
}

//加载基础图层控件，页面需要引用#parse("o3/popUp/yanpanPopups.vm")
//以及<script type="text/javascript" src="resource/js/o3/BasalResourcesLayerControl.js?version=1.01" ></script>
function initialBasalResourcesLayerControl(map){
	var style = {
	    MenuSwitcherVisible: true,
	    collapse: false,
	    defualtShowLayerList: false,
	    defualtDockAndAlign: true,
	    top: 5,
	    right: 5,
		JKD: true,
//	    JZ: true,
//	    JWT: true,
//	    DT: true,
	    ZRQ: true,
//	    FocalDept: true,
	    elecFence: true,
//      FocalMan: true,
        Hotel: true,
        carKK : true,
        Netbar: true,
//      keyArea:true,
        wifi:true,
        community:true,
        carKK_Checked: true,
        JKD_Checked: false,
        elecFence_Checked: false,
	};
	basalResourcesLayerControl = new BasalResourcesLayerControl(map, style);
	basalResourcesLayerControl.addLayerNode("警情分布", true, function (checked) {
		top.window.jqPointControl.vectorLayer.setVisible(checked);
		top.window.jqPointControl.heatmapLayer.setVisible(checked);
	});
}