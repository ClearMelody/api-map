/**
 * @(#)util.js
 * 
 * @description: util工具函数
 * @author: 杨朝晖 2012/02/23
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
/**
 * 判断浏览器
 * 
 * @param 无
 * @return true or false 是否是IE
 * @exception 无
 * @History: 无
 * 
 */
var AutoSizeFramedCloud, AutoSizeFramedCloudAdjusted, AutoSizeFramedCloudWhite;
var AutoSizeAnchoredMinSize;
var wktYouKeyuan;
var featureYouKeyuan;
//默认线路id
var defaultGroupId = "-100";

//组织鼠标滚轮按下事件：解决滚轮按下后，状态未释放，导致点击其它功能失效
$(document).ready(function(){
	$("body").live("mousedown",function(e){
        if(e && e.which && e.which == 2){
			window.event.cancelBubble = true;//停止冒泡
			window.event.returnValue = false;//阻止事件的默认行为
		}
	});
});

function isIE() {
	if (window.navigator.userAgent.toString().toLowerCase().indexOf("msie") >= 1)
		return true;
	else
		return false;
}
/**
 * 鼠标在地图上的形状
 * 
 * @param num
 *            标识鼠标在地图上的形状
 * @return 无
 * @exception 无
 * @History: 无
 * 
 */
function mshp(num){
	if(document.getElementById("map")){
		mshpGISMap(document.getElementById("map"), num);
	}
	if(document.getElementById("maphtmlEle")){
		mshpPicMap(num);
	}
}
/**
 * 鼠标在GIS地图上的形状
 * 
 * @param num
 *            标识鼠标在地图上的形状
 * @return 无
 * @exception 无
 * @History: 无
 * 
 */
function mshpGISMap(map, num) {
	switch (num) {
	case 0:
		map.style.cursor = "default";
		$("body").css("cursor","default");
		break;
	case 1:
		$("body").css("cursor","url('resource/images/eazymapwin/zoomin.cur'),pointer");
		map.style.cursor = "url('resource/images/eazymapwin/zoomin.cur'),pointer";
		break;
	case 2:
		$("body").css("cursor","url('url('resource/images/eazymapwin/zoomout.cur'),pointer");
		map.style.cursor = "url('resource/images/eazymapwin/zoomout.cur'),pointer";
		break;	
	case 10:
		map.style.cursor = "crosshair";
		$("body").css("cursor","crosshair");
		break;
	};
}
/**
 * 鼠标在图片地图上的形状
 * 
 * @param num
 *            标识鼠标在地图上的形状
 * @return 无
 * @exception 无
 * @History: 无
 * 
 */
function mshpPicMap(num) {
	switch (num) {
	case 0:
		document.getElementById("maphtmlEle").style.cursor = "default";
		break;
	case 1:
		document.getElementById("maphtmlEle").style.cursor = "url('resource/images/eazymapwin/zoomin.cur'),pointer";
		break;
	case 2:
		document.getElementById("maphtmlEle").style.cursor = "url('resource/images/eazymapwin/zoomout.cur'),pointer";
		break;	
	case 10:
		document.getElementById("maphtmlEle").style.cursor = "crosshair";
		break;

	};
}
/**
 * 设置vector图层上的样式
 * 
 * @param style_o
 *            目标样式
 * @return 无
 * @exception 无
 * @History: 无
 * 
 */
function setVectorLayerStyle(style_o) {
	OpenLayers.Feature.Vector.style['default'] = style_o;
	var layer_style = OpenLayers.Util.extend( {},
			OpenLayers.Feature.Vector.style['default']);
	return layer_style;
}
/**
 * 注册onmouseOut事件，移入也触发的解决方法
 * 
 * @param parentNode,
 *            childNode
 * @return 无
 * @exception 无
 * @History: 无
 * 
 */
function contains(parentNode, childNode) {
    if (parentNode.contains) {
        return parentNode != childNode && parentNode.contains(childNode);
    } else {
        return !!(parentNode.compareDocumentPosition(childNode) & 16);
    }
}
/**
 * 检查鼠标是否离开了某个控件
 * 
 * @param e,target
 * @return 无
 * @exception 无
 * @History: 无
 * 
 */
function checkHover(e,target){
    if (getEvent(e).type=="mouseover")  {
        return !contains(target,getEvent(e).relatedTarget||getEvent(e).fromElement) && !((getEvent(e).relatedTarget||getEvent(e).fromElement)===target);
    } else {
        return !contains(target,getEvent(e).relatedTarget||getEvent(e).toElement) && !((getEvent(e).relatedTarget||getEvent(e).toElement)===target);
    }
}
/**
 * 获得鼠标事件对象
 * 
 * @param e
 * @return 无
 * @exception 无
 * @History: 无
 * 
 */
function getEvent(e){
    return e||window.event;
}
/*
 * document.getElementById("test").onmouseout=function(e){
 * if(checkHover(e,this)){ alert('执行的代码'); } }
 */

/**
 * 获得对象的某个属性的值
 * 
 * @param obj
 *            对象,col 属性名（大小写不区分）
 * @return 无
 * @exception 无
 * @History: 无
 * 
 */
function getV(obj,col){
	 
/*
 * if(setslayer.os == "windows") return obj[col.toLowerCase()]; else
 * if(setslayer.os == "linux") return obj[col];
 */	
	var field =  col in obj?col:col.toLowerCase();
	// alert(field);
	return obj[field];
}
/**
 * 是否含有特殊字符
 * 
 * @param value
 *            输入字符
 * @return boolean 包含返回true，不包含返回false
 * @exception 无
 * @History: 无
 * 
 */
function hasUniqueChar(value){
	/*var reg =/^[a-z\d\u4E00-\u9FA5]+$/i;
	if(reg.test(value)){
		return false;
	}else{
		return true;
	}*/
	var flg = false;
	var SPECIAL_STR ="￥#$~!@%^&*;'\"?><[]{}\\|,=+—“”‘";	
	for(var j=0;j<value.length;j++){
		if (SPECIAL_STR.indexOf(value.charAt(j)) !=-1) { 
			flg =  true;  
			break;
	    }  
	} 
	return flg;
}
/**
 * 清除地图上所有的popup
 * 
 * @param 无
 * @return 无
 * @exception 无
 * @History: 无
 * 
 */
function rmAllMapPopups() {

	while (map.popups.length) {
		map.removePopup(map.popups[0]);
	}
}

function _showCloseLight(){
	if($('#fade_light') && $('#fade_light').size()>0){
		return;
	}
	
	var fade= document.createElement("div");
	fade.id='fade_light';
	fade.className="black_overlay_light";
		
	document.body.appendChild(fade);
	
	fade.style.display='block'; 

}

function _hideCloseLight(){
	
	var obj = document.getElementById("fade_light");  
	if(obj){
		document.body.removeChild(obj);
//		OpenLayers.Element.destroy(obj);
		}
	
}

/**
 * 显示正在分析onLoading提示
 * 
 * @param 无
 * @return 无
 * @exception 无
 * @History: 无
 * 
 */ 
function _showWait(){
	if($('#fade') && $('#fade').size()>0){
		return;
	}
	
	var fade= document.createElement("div");
	fade.id='fade';
	fade.className="black_overlay";
		
	document.body.appendChild(fade);

	fade.style.display='block'; 

	var divInit = document.createElement("div");
	divInit.id='loadingC';
	divInit.className="loadingC";
	divInit.innerHTML = '<img src="resource/images/eazymapwin/loading.gif" width="100" height="100" />';	
	document.body.appendChild(divInit);

	divInit.style.zIndex = '100';
	
	divInit.style.display='block'; 				 
	divInit.style.left=(document.body.clientWidth-100)/2 +"px"; 
	divInit.style.top = (document.body.clientHeight-100)/2+"px";
	
}
/**
 * 隐藏正在分析onLoading提示
 * 
 * @param 无
 * @return 无
 * @exception 无
 * @History: 无
 * 
 */ 
function _hideWait(){
	
	
	var obj = document.getElementById("fade");  
	if(obj){
		document.body.removeChild(obj);
//		OpenLayers.Element.destroy(obj);
		}

	obj = document.getElementById("loadingC");  
	if(obj){  
		document.body.removeChild(obj);
//		OpenLayers.Element.destroy(obj);
	}
	
}

/**
 * 显示正在分析onLoading提示
 * 
 * @param 无
 * @return 无
 * @exception 无
 * @History: 无
 * 
 */ 
function _showYanPanWait(){
	if($('#fade') && $('#fade').size()>0){
		return;
	}
	
	var fade= document.createElement("div");
	fade.id='fade';
	fade.className="black_overlay";
	//fade.style.width=(document.body.clientWidth-386) +"px"; 
	document.body.appendChild(fade);

	fade.style.display='block'; 

	var divInit = document.createElement("div");
	divInit.id='loadingC';
	divInit.className="loadingC";
	divInit.innerHTML = '<img src="resource/images/loading.gif" width="100" height="100" />';	
	document.body.appendChild(divInit);

	divInit.style.display='block'; 				 
	divInit.style.left=(document.body.clientWidth-100-376)/2 +"px"; 
	divInit.style.top = (document.body.clientHeight-100)/2+"px";
	
}

/**
 * 在map上注册交互对象函数
 * 
 * @param map
 * @return 无
 * @exception 无
 * @History: 无
 * 
 */ 
function regInteractiveFunc(map){
	
	map.interactiveObj = [];
	
	map.addInteractiveObj=function(obj){
		
		if(obj.map.interactiveObj==undefined)
			obj.map.interactiveObj = [];
		
		obj.map.interactiveObj.push(obj);		
		
	};
	// 关闭所有取点开关
    map.stopInteractiveObj=function(map){
		
    	// alert(555);
		var objs = map.interactiveObj;
		
		// console.log(map.interactiveObj.length);
		// console.log(map.interactiveObj);
		
		 
		for(var c in objs){
         // console.log(objs[c]);
			if(objs[c] && objs[c].closePickPFlg){
			 objs[c].closePickPFlg();
			}
		}
		
	};
	
	
}
/**
 * 解析地址栏参数
 */
function getParameter(param)
{
        var query = window.location.search;
		var iLen = param.length;
		var iStart = query.indexOf(param);
		if (iStart == -1)
 		  return "";
		iStart += iLen + 1;
		var iEnd = query.indexOf("&", iStart);
		if (iEnd == -1)
   			return query.substring(iStart);

		return query.substring(iStart, iEnd);
}
/**
 * 日期构造函数
 * */
function dateConstruct(str){

	var strArr = str.split(" ");
	var dateStr = strArr[0];
	var timeStr = strArr[1];
	//alert(dateStr +"-- "+timeStr)
	var dateArr = dateStr.split("-");
	var timeArr = timeStr.split(":");
	var y = dateArr[0];
	var m = parseInt(dateArr[1]);
	var d = parseInt(dateArr[2]);
	//alert(y +" "+ m +" "+ d)
	var h = parseInt(timeArr[0]);
	var minite = parseInt(timeArr[1]);
	var s = parseInt(timeArr[2]);

	var mydate =new Date();
	mydate.setFullYear(y);		 	
	mydate.setMonth(m-1);
	mydate.setDate(d);
	mydate.setHours(h);
	mydate.setMinutes(minite);
	mydate.setSeconds(s);
    return mydate;
}
function checkJson(str){
    
	var obj = JSON.parse(str);
    if(obj){
	  return true;
	}else{
     alert("字符串不是正确的JSON格式."+str);
	  return false;
	}
}
/**
 * 绘制popup--摘自setslayer.js
 * 
 * @param content内容
 * @return 无
 * @exception 无
 * @History: 无
 * 
 */
function drawPopupWin(content) {
	

	
	var shotid = content.puid + "/" + content.channel;

	var name = content.name;
	
	name = name.substr(0, 26);
	
	if(sysVersionBranch==sysVersionVal.EYESHOT6000){
		var jscontent = '';
	
		jscontent += '<div class="map_pp_box_V5"><div class="map_pp1_V5"></div>';
		jscontent += '<div class="map_pp_V5">';
		jscontent += '	<table border="0" cellspacing="0" cellpadding="0">';
		jscontent += '		<tr height="22">';
		jscontent += '			<td>'+geti18nMsg('sp.name')+'：<span title="' + content.name + '">'
				+ name + '</span></td>';
		jscontent += '		</tr>';
		jscontent += '		<tr height="22">';
		jscontent += '			<td>PUID：' + content.puid + '</td>';
		jscontent += '		</tr>';
		jscontent += '		<tr height="22">';
		jscontent += '			<td>'+geti18nMsg('sp.channel')+'：' + content.channel + '</td>';
		jscontent += '		</tr>';
		jscontent += '		<tr height="22">';
		jscontent += '			<td>IP：' + content.ip + '</td>';
		jscontent += '		</tr>';
		jscontent += '		<tr height="22">';
		
		jscontent += '			<td>'+geti18nMsg('sp.longitude')+'：'
				+ OpenLayers.Number.limitSigDigs(content.lon, 10)
				+ '&nbsp;'
				+ '</td>';
		
		
		jscontent += '		</tr>';
		jscontent += '		<tr height="22" >';
		//jscontent += '			<td><div class="span_tanchu_V5'+langcssprefix+'"><a href="javascript:void(0);" onclick=sendMsgToClient(2,"' + shotid + '")></a></div></td>';
		jscontent += '<td>'+geti18nMsg('sp.latitude')+'：'	+ OpenLayers.Number.limitSigDigs(content.lat, 9)+"</td>";
		jscontent += '		</tr>';
		jscontent += '	</table>';
		jscontent += '	';
		jscontent += '	<div class="map_pp_close_V5"><a href="javascript:void(0);" onclick="rmAllMapPopups();"></a></div><!--/map_pp_close-->';
		jscontent += '';
		jscontent += '</div>';
		// jscontent+='<div
		// class="map_pp_arrow"></div><!--/map_pp_arrow-->';
		jscontent += '</div><!--/map_pp_box-->';
	}else{
		var jscontent = '';
	
		jscontent += '<div class="map_pp_box"><div class="map_pp1"></div>';
		jscontent += '<div class="map_pp">';
		jscontent += '	<table border="0" cellspacing="0" cellpadding="0">';
		jscontent += '		<tr height="22">';
		jscontent += '			<td><span class="popup-text-overflow" title="' + content.name + '">'
		   +geti18nMsg('sp.name')+'：'+ content.name + '</span></td>';
		jscontent += '		</tr>';
		jscontent += '		<tr height="22">';
		jscontent += '			<td>PUID：' + content.puid + '</td>';
		jscontent += '		</tr>';
		jscontent += '		<tr height="22">';
		jscontent += '			<td>'+geti18nMsg('sp.channel')+'：' + content.channel + '</td>';
		jscontent += '		</tr>';
		jscontent += '		<tr height="22">';
		jscontent += '			<td>IP：' + content.ip + '</td>';
		jscontent += '		</tr>';
		jscontent += '		<tr height="22">';
		
		jscontent += '			<td>'+geti18nMsg('sp.longitude')+'：'
				+ OpenLayers.Number.limitSigDigs(content.lon, 10)
				+ '&nbsp;'
				+ '</td>';
		
		
		jscontent += '		</tr>';
		jscontent += '		<tr height="22" >';
		//jscontent += '			<td><div class="span_tanchu'+langcssprefix+'"><a href="javascript:void(0);" onclick=sendMsgToClient(2,"' + shotid + '")></a></div></td>';
		jscontent += '<td>'+geti18nMsg('sp.latitude')+'：'	+ OpenLayers.Number.limitSigDigs(content.lat, 9)+"</td>";
		jscontent += '		</tr>';
		jscontent += '	</table>';
		jscontent += '	';
		jscontent += '	<div class="map_pp_close"><a href="javascript:void(0);" onclick="rmAllMapPopups();"></a></div><!--/map_pp_close-->';
		jscontent += '';
		jscontent += '</div>';
		// jscontent+='<div
		// class="map_pp_arrow"></div><!--/map_pp_arrow-->';
		jscontent += '</div><!--/map_pp_box-->';
	}

	
	
	return jscontent;
}
/**
 * 矫正addpopup的位置
 * feature.popup.id  feature.popup.relativePosition
 * */
/*
function adjustAddPopupPosition(id,relativePosition){
	
	var objP = document.getElementById(id);				
	var fprp = relativePosition;				
	if(fprp && fprp=="tl"){
		var pLeft  = objP.style.left.replace("px","");
		var pTop  = objP.style.top.replace("px","");
		
		objP.style.left = (pLeft-17)+"px";
		objP.style.top = (pTop-17)+"px";
	
	}else if(fprp && fprp=="tr"){
		var pLeft  = objP.style.left.replace("px","");
		var pTop  = objP.style.top.replace("px","");
		//alert(pLeft +" "+pTop +" "+  (pLeft+17));
		 objP.style.left = (parseInt(pLeft)+16)+"px";
		 objP.style.top = (pTop-16)+"px";
		//
	}else if(fprp && fprp=="bl"){
		var pLeft  = objP.style.left.replace("px","");
		var pTop  = objP.style.top.replace("px","");
		
		 objP.style.left = (parseInt(pLeft)-16)+"px";
		 objP.style.top = (parseInt(pTop)+16)+"px";		
	}else if(fprp && fprp=="br"){
		var pLeft  = objP.style.left.replace("px","");
		var pTop  = objP.style.top.replace("px","");		
		 objP.style.left = (parseInt(pLeft)+16)+"px";
		 objP.style.top = (parseInt(pTop)+16)+"px";		
	}
	
	
}*/
//邮科院轮廓
function addFhLayer(map){
	
	//描出fh的轮廓
	// 定义样式地图，可以显示属性标签
	var style = new OpenLayers.Style( {		
		fillColor : "#ee9900",
		fillOpacity : 0,
		hoverFillColor : "white",
		hoverFillOpacity : 0.8,
		strokeColor : "#ee9900",
		strokeOpacity : 0,
		strokeWidth : 3,
		strokeLinecap : "round",
		hoverStrokeColor : "#ee9900",
		hoverStrokeOpacity : 1,
		hoverStrokeWidth : 0.2,
		pointRadius : 1,
		hoverPointRadius : 1,
		hoverPointUnit : "%",
		pointerEvents : "visiblePainted",
		graphicWidth : 21,
		graphicHeight : 25,
		graphicYOffset : -28,
		

		fontColor : "black",
		fontSize : "16px",
		fontFamily : "微软雅黑",
		fontWeight : "bold",
		labelAlign : "rt",
		labelXOffset : "20",
		labelYOffset : "20"
		
	});
	// 展厅gis才需要  
	var fhvlayer = new OpenLayers.Layer.Vector("fhLayer", {
		rendererOptions : {zIndexing : true},
		styleMap : new OpenLayers.StyleMap({
            "default": style,
            "select": {
                fillColor: "#ffffff",//ee9900
                strokeColor: "#ffff00",
                fillOpacity : 0.3,
                strokeOpacity : 1,
                label : "${name}" 
                
            }
        })
	});
	fhvlayer.setZIndex(490);
	map.addLayer(fhvlayer);
	
	var fhSelect = new OpenLayers.Control.SelectFeature(
			 fhvlayer, {hover: true}
         );
	//单击
	var clickFeature = function (feature){
		
		//alert(666);
		var  g_map = feature.attributes["map"];
		// console.log(g_map.getCenter()+" "+g_map.getZoom());
		var tmp_ll = g_map.getCenter();
		 
		// window.location.href="FlashMapCs/cu.html?x="+tmp_ll.lon+"&y="+tmp_ll.lat+"&z="+g_map.getZoom();		
		window.location.href="Map3D/fiberhome.html";
	}
	
	
	var cb = fhSelect.callbacks;
    cb.click=clickFeature;
    fhSelect.callbacks = cb;
	
    map.addControl(fhSelect);
    fhSelect.activate();
	
	var wkt = new OpenLayers.Format.WKT();
	
	
	featureYouKeyuan.attributes = {
			name : "武汉邮科院",
			map:map
		};
	fhvlayer.addFeatures(featureYouKeyuan);
	
	

 //fhvlayer
	
}
/**
 *获取eyeshot6000gis地图iframe高度
*/
function getTabHeight(tanChuangId) {
	var tmpWinH;
	//myFrame_myWin_gis
	if(window.parent && window.parent.document.getElementById(tanChuangId)){
		tmpWinH = window.parent.document.getElementById(tanChuangId).style.height;// 带px符号
	}else{
		return 0;
	}
	var pxIndex = tmpWinH.lastIndexOf("px");
	if(pxIndex == -1) {
		pxIndex = tmpWinH.lastIndexOf("PX");
	}
	// 去除单位PX
	var winH = tmpWinH.substr(0, pxIndex);
	var tabHeight = winH;
	return tabHeight;
}
/**
 *获取eyeshot6000gis地图iframe宽度
*/
function getTabWidth(tanChuangId) {
	var tmpWinW;
	//myFrame_myWin_gis
	if(window.parent && window.parent.document.getElementById(tanChuangId)){
		tmpWinW = window.parent.document.getElementById(tanChuangId).style.width;// 带px符号
	}else{
		return 0;
	}
	var pxIndex = tmpWinW.lastIndexOf("px");
	if(pxIndex == -1) {
		pxIndex = tmpWinW.lastIndexOf("PX");
	}
	// 去除单位PX
	var winW = tmpWinW.substr(0, pxIndex);
	var tabWidth = winW;
	return tabWidth;
}
//如果是eyeshot则href = "javascript:void(0)",如果是展厅gis则用href = "#"
var isJavascriptVoidValue;
/**
 *设置html元素的高度和宽度
*/
function setComponetSize_index() {
	
	$("#maphtmlEle").width($("body").width());
	$("#maphtmlEle").height($("body").height() - 32);
	  
	isJavascriptVoidValue = "#";
	var h = document.documentElement.clientHeight;
	var w = document.documentElement.clientWidth;
    if(document.getElementById('map') && h!=0 && w!=0){	
	  document.getElementById('map').style.height = (h - 0) + "px";
	  document.getElementById('map').style.width = (w-0) + "px";
	  //alert(h+" , "+$("#gisPopupSelectDiv").height());
	  //右侧图层开关
	 
	  var yanpanSwitcherTmpH = 0;
	  yanpanSwitcherTmpH = $("#switchLayerBox").height();
	  if(yanpanSwitcherTmpH==0){
		  yanpanSwitcherTmpH = 132;
	  }	  
	  $("#switchLayerBox").css('top',(h-yanpanSwitcherTmpH)/2+'px');
	}
	
}
/**
 *设置html元素的高度和宽度
*/
function setComponetSize_indexOnresize() {
	//针对eyeshot6000版本的样式初始化设置
	if(sysVersionBranch==sysVersionVal.EYESHOT6000){
		  
		  isJavascriptVoidValue = "javascript:void(0);";
			  
		  var w = $("body").width();
	      var h = $("body").height();
	      
	      var cmsMainDivHeight = parent.$("#cmsMainDiv").height();
	      var cmsMainDivWidth = parent.$("#cmsMainDiv").width();
	      parent.$("#mainIndex").height(cmsMainDivHeight);//避免出现y轴缩放条
	      parent.$("#mainIndex").width(cmsMainDivWidth);//避免出现y轴缩放条
	      
	      $("#equipsTree").height(h - 16 - 30 - 34);
	     // $("#treeDemo").height($("#equipsTree").height());
	      $("#imageMapTree").height(h - 16 - 30 - 34);
	     // $("#treeDemo2").height($("#imageMapTree").height());
	      if($("#equipsTree").css("display") != "none") { 
	      	  $("#manageBar2").css("top",h - 32);	  
	      }else {
	    	  $("#manageBar2").css("top",48);	  
	      }
	      
	      //设置电子地图的width和height
	      if($("#equipsTreeContent").css("display") != "none") {
	    	  $("#maphtmlEle").width($("body").width()- 249);
	      }else {
	    	  $("#maphtmlEle").width($("body").width()- 20);
	      }  
		  $("#maphtmlEle").height($("body").height() - 34);
	      
	     var refreshTop = $("#manageBar2").css("top");
	      //获取没有“px”的数值
	      refreshTop = refreshTop.split("p")[0]*1+4; 
	      $("#refresh_video2").css("top",refreshTop);
	      $("#manage_video2").css("top",refreshTop);
	      
	      
	      if($("#equipsTreeContent").css("display") == "none"){
			  $('#map').width((w - 16));
		  }else {
			  $('#map').width((w - 5 - 240));//16:缩放条  247：设备树
		  }
		  
		  
		  $('#map').height((h - 0)); 
		 
		  //window.setTimeout(setImageMapComponet1, 150);
		  //设置电子地图
		  setImageMapComponet();
		 
		//设置toolbar
		 var w = document.documentElement.clientWidth;		  
		 //getMapControlLTCornor()获取已经判断了equipsTreeContent的隐藏显示时的宽度。
		 $('#parentToolbar').css('right',(w - 672 - getMapControlLTCornor())/2 + "px");  
		 $('#tbToggleDiv').css('right',(w - 48 - getMapControlLTCornor())/2 + "px");
	
	}else{
		isJavascriptVoidValue = "#";
		var h = document.documentElement.clientHeight;
		var w = document.documentElement.clientWidth;
		if(document.getElementById('map') && h!=0 && w!=0){	
		  document.getElementById('map').style.height = (h - 0) + "px";
		  document.getElementById('map').style.width = (w-0) + "px";
		//右侧图层开关
		  var yanpanSwitcherTmpH = 0;
		  yanpanSwitcherTmpH = $("#switchLayerBox").height();
		  if(yanpanSwitcherTmpH==0){
			  yanpanSwitcherTmpH = 132;
		  }	  
		  $("#switchLayerBox").css('top',(h-yanpanSwitcherTmpH)/2+'px');
		
		  $("#maphtmlEle").width(w);
		  $("#maphtmlEle").height(h - 32);
		}
	 }
}
/**
 * js计算分页
 * */
function computePages(totalCount, pageSize, curPage){
 //alert(totalCount +"  "+ pageSize+"  "+curPage );
	var pages=(totalCount%pageSize=='0')?
	           totalCount/pageSize:
	           totalCount/pageSize+1;    
	pages=parseInt(pages);
	var offset=(curPage-1)*pageSize;

	var end = offset+pageSize-1;
	if(end>=totalCount){
	 end = totalCount-1;
	}

	return {"start": offset, "end": end, "pages": pages}

}
/**
 * 中英文字符长度判断和截取
   var caela = new CnAndEnCharacter_LenAndclip();
   caela.setNum(2);
   alert(caela.lenCC("一二三"));
 */  
function CnAndEnCharacter_LenAndclip(){
  //一个中文字符相当于几个英文字符
   this.num = 2;

   //设置一个中文字符相当于几个英文字符
   this.setNum = function(val){
    this.num = val;
   };
  
 
 //判断字符长度（包含中文和英文） 
this.lenCC = function(s) {
  var l = 0;
  var a = s.split("");
  for (var i=0;i<a.length;i++) {
    if (a[i].charCodeAt(0)<299) {
		l++;
		} else {
			l+=this.num;
		}
	  }
	return l;
  }
  /**
 * 截取字符长度（包含中文和英文）
 */
 this.clipStrCC = function(s,num) {
  var strs = "";
  var l = 0;
  var a = s.split("");
  for (var i=0;i<a.length;i++) {
  	if (a[i].charCodeAt(0)<299) {
  		l++;
  	}else {
  		l+=this.num;
  	}
	if(l>num)break;
	strs +=a[i];					  
  }
  //if(lenCC(s)>num)strs+="...";	 
	return strs;
 }
}
/**
 * openlayers几个变量的初始化
 */
function initOpenlayersValue(){
	
		// 设置弹出FramedCloud样式
	OpenLayers.Popup.FramedCloud.prototype.autoSize = true;
	// FramedCloud赋值
	AutoSizeFramedCloud = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
		'autoSize' : true,
		'minSize' : new OpenLayers.Size(160,190)
	
	});
	
	AutoSizeFramedCloudWhite= OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
		
		'autoSize' : true,
		'minSize' : new OpenLayers.Size(300,165),
	    //'contentDisplayClass': "olFramedCloudPopupContent-white",
	    initialize:function(id, lonlat, contentSize, contentHTML, anchor, closeBox, 
                    closeBoxCallback) {

		    this.imageSrc = OpenLayers.Util.getImagesLocation() + 'cloud-popup-relative-white.png';
		    
		    OpenLayers.Popup.Framed.prototype.initialize.apply(this, arguments);
		    this.contentDiv.className = this.contentDisplayClass;
		}
	});
	
	AutoSizeAnchoredMinSize = OpenLayers.Class(OpenLayers.Popup.Anchored, {
	    'autoSize': true, 
	    'minSize': new OpenLayers.Size(100, 70)// ,
	    // 'padding':0
	});
	//offset调整体的位置距离中心点的偏移位置；padding 调popup圆角矩形的padding (left, 下 ,右, top)。
	AutoSizeFramedCloudAdjusted = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
		'autoSize' : true,
		'minSize' : new OpenLayers.Size(160,190),		
	    'positionBlocks':{
			"tl":{'offset':new OpenLayers.Pixel(27,-17),'padding':new OpenLayers.Bounds(0,25,-3,0),
			      'blocks':[{size:new OpenLayers.Size('auto','auto'),anchor:new OpenLayers.Bounds(0,51,22,0),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,'auto'),anchor:new OpenLayers.Bounds(null,50,0,0),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size('auto',19),anchor:new OpenLayers.Bounds(0,32,22,null),position:new OpenLayers.Pixel(0,-631)},{size:new OpenLayers.Size(22,18),anchor:new OpenLayers.Bounds(null,32,0,null),position:new OpenLayers.Pixel(-1238,-632)},{size:new OpenLayers.Size(81,35),anchor:new OpenLayers.Bounds(null,0,0,null),position:new OpenLayers.Pixel(0,-688)}]},
			"tr":{'offset':new OpenLayers.Pixel(-29,-16),'padding':new OpenLayers.Bounds(0,25,-3,0),
			      'blocks':[{size:new OpenLayers.Size('auto','auto'),anchor:new OpenLayers.Bounds(0,51,22,0),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,'auto'),anchor:new OpenLayers.Bounds(null,50,0,0),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size('auto',19),anchor:new OpenLayers.Bounds(0,32,22,null),position:new OpenLayers.Pixel(0,-631)},{size:new OpenLayers.Size(22,19),anchor:new OpenLayers.Bounds(null,32,0,null),position:new OpenLayers.Pixel(-1238,-631)},{size:new OpenLayers.Size(81,35),anchor:new OpenLayers.Bounds(0,0,null,null),position:new OpenLayers.Pixel(-215,-687)}]},
			"bl":{'offset':new OpenLayers.Pixel(29,16),'padding':new OpenLayers.Bounds(0,0,-3,27),
			      'blocks':[{size:new OpenLayers.Size('auto','auto'),anchor:new OpenLayers.Bounds(0,21,22,32),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,'auto'),anchor:new OpenLayers.Bounds(null,21,0,32),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size('auto',21),anchor:new OpenLayers.Bounds(0,0,22,null),position:new OpenLayers.Pixel(0,-629)},{size:new OpenLayers.Size(22,21),anchor:new OpenLayers.Bounds(null,0,0,null),position:new OpenLayers.Pixel(-1238,-629)},{size:new OpenLayers.Size(81,33),anchor:new OpenLayers.Bounds(null,null,0,0),position:new OpenLayers.Pixel(-101,-674)}]},
			"br":{'offset':new OpenLayers.Pixel(-28,16),'padding':new OpenLayers.Bounds(0,0,-3,27),
			      'blocks':[{size:new OpenLayers.Size('auto','auto'),anchor:new OpenLayers.Bounds(0,21,22,32),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,'auto'),anchor:new OpenLayers.Bounds(null,21,0,32),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size('auto',21),anchor:new OpenLayers.Bounds(0,0,22,null),position:new OpenLayers.Pixel(0,-629)},{size:new OpenLayers.Size(22,21),anchor:new OpenLayers.Bounds(null,0,0,null),position:new OpenLayers.Pixel(-1238,-629)},{size:new OpenLayers.Size(81,33),anchor:new OpenLayers.Bounds(0,null,null,0),position:new OpenLayers.Pixel(-311,-674)}]}}
		
	});
	
	//offset调整体的位置距离中心点的偏移位置；padding 调popup圆角矩形的padding (left, 下 ,右, top)。
	AutoSizeFramedCloudKakouAdjusted = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
		'autoSize' : true,
		'minSize' : new OpenLayers.Size(390,210),		
	    'positionBlocks':{
			"tl":{'offset':new OpenLayers.Pixel(27,-17),'padding':new OpenLayers.Bounds(0,25,-3,0),
			      'blocks':[{size:new OpenLayers.Size('auto','auto'),anchor:new OpenLayers.Bounds(0,51,22,0),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,'auto'),anchor:new OpenLayers.Bounds(null,50,0,0),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size('auto',19),anchor:new OpenLayers.Bounds(0,32,22,null),position:new OpenLayers.Pixel(0,-631)},{size:new OpenLayers.Size(22,18),anchor:new OpenLayers.Bounds(null,32,0,null),position:new OpenLayers.Pixel(-1238,-632)},{size:new OpenLayers.Size(81,35),anchor:new OpenLayers.Bounds(null,0,0,null),position:new OpenLayers.Pixel(0,-688)}]},
			"tr":{'offset':new OpenLayers.Pixel(-29,-16),'padding':new OpenLayers.Bounds(0,25,-3,0),
			      'blocks':[{size:new OpenLayers.Size('auto','auto'),anchor:new OpenLayers.Bounds(0,51,22,0),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,'auto'),anchor:new OpenLayers.Bounds(null,50,0,0),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size('auto',19),anchor:new OpenLayers.Bounds(0,32,22,null),position:new OpenLayers.Pixel(0,-631)},{size:new OpenLayers.Size(22,19),anchor:new OpenLayers.Bounds(null,32,0,null),position:new OpenLayers.Pixel(-1238,-631)},{size:new OpenLayers.Size(81,35),anchor:new OpenLayers.Bounds(0,0,null,null),position:new OpenLayers.Pixel(-215,-687)}]},
			"bl":{'offset':new OpenLayers.Pixel(29,16),'padding':new OpenLayers.Bounds(0,0,-3,27),
			      'blocks':[{size:new OpenLayers.Size('auto','auto'),anchor:new OpenLayers.Bounds(0,21,22,32),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,'auto'),anchor:new OpenLayers.Bounds(null,21,0,32),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size('auto',21),anchor:new OpenLayers.Bounds(0,0,22,null),position:new OpenLayers.Pixel(0,-629)},{size:new OpenLayers.Size(22,21),anchor:new OpenLayers.Bounds(null,0,0,null),position:new OpenLayers.Pixel(-1238,-629)},{size:new OpenLayers.Size(81,33),anchor:new OpenLayers.Bounds(null,null,0,0),position:new OpenLayers.Pixel(-101,-674)}]},
			"br":{'offset':new OpenLayers.Pixel(-28,16),'padding':new OpenLayers.Bounds(0,0,-3,27),
			      'blocks':[{size:new OpenLayers.Size('auto','auto'),anchor:new OpenLayers.Bounds(0,21,22,32),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,'auto'),anchor:new OpenLayers.Bounds(null,21,0,32),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size('auto',21),anchor:new OpenLayers.Bounds(0,0,22,null),position:new OpenLayers.Pixel(0,-629)},{size:new OpenLayers.Size(22,21),anchor:new OpenLayers.Bounds(null,0,0,null),position:new OpenLayers.Pixel(-1238,-629)},{size:new OpenLayers.Size(81,33),anchor:new OpenLayers.Bounds(0,null,null,0),position:new OpenLayers.Pixel(-311,-674)}]}}
		
	});
	
		
	//offset调整体的位置距离中心点的偏移位置；padding 调popup圆角矩形的padding (left, 下 ,右, top)。
	AutoSizeFramedCloudAlarmAdjusted = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
		'autoSize' : true,
		'minSize' : new OpenLayers.Size(390,230),		
	    'positionBlocks':{
			"tl":{'offset':new OpenLayers.Pixel(27,-17),'padding':new OpenLayers.Bounds(0,25,-3,0),
			      'blocks':[{size:new OpenLayers.Size('auto','auto'),anchor:new OpenLayers.Bounds(0,51,22,0),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,'auto'),anchor:new OpenLayers.Bounds(null,50,0,0),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size('auto',19),anchor:new OpenLayers.Bounds(0,32,22,null),position:new OpenLayers.Pixel(0,-631)},{size:new OpenLayers.Size(22,18),anchor:new OpenLayers.Bounds(null,32,0,null),position:new OpenLayers.Pixel(-1238,-632)},{size:new OpenLayers.Size(81,35),anchor:new OpenLayers.Bounds(null,0,0,null),position:new OpenLayers.Pixel(0,-688)}]},
			"tr":{'offset':new OpenLayers.Pixel(-29,-16),'padding':new OpenLayers.Bounds(0,25,-3,0),
			      'blocks':[{size:new OpenLayers.Size('auto','auto'),anchor:new OpenLayers.Bounds(0,51,22,0),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,'auto'),anchor:new OpenLayers.Bounds(null,50,0,0),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size('auto',19),anchor:new OpenLayers.Bounds(0,32,22,null),position:new OpenLayers.Pixel(0,-631)},{size:new OpenLayers.Size(22,19),anchor:new OpenLayers.Bounds(null,32,0,null),position:new OpenLayers.Pixel(-1238,-631)},{size:new OpenLayers.Size(81,35),anchor:new OpenLayers.Bounds(0,0,null,null),position:new OpenLayers.Pixel(-215,-687)}]},
			"bl":{'offset':new OpenLayers.Pixel(29,16),'padding':new OpenLayers.Bounds(0,0,-3,27),
			      'blocks':[{size:new OpenLayers.Size('auto','auto'),anchor:new OpenLayers.Bounds(0,21,22,32),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,'auto'),anchor:new OpenLayers.Bounds(null,21,0,32),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size('auto',21),anchor:new OpenLayers.Bounds(0,0,22,null),position:new OpenLayers.Pixel(0,-629)},{size:new OpenLayers.Size(22,21),anchor:new OpenLayers.Bounds(null,0,0,null),position:new OpenLayers.Pixel(-1238,-629)},{size:new OpenLayers.Size(81,33),anchor:new OpenLayers.Bounds(null,null,0,0),position:new OpenLayers.Pixel(-101,-674)}]},
			"br":{'offset':new OpenLayers.Pixel(-28,16),'padding':new OpenLayers.Bounds(0,0,-3,27),
			      'blocks':[{size:new OpenLayers.Size('auto','auto'),anchor:new OpenLayers.Bounds(0,21,22,32),position:new OpenLayers.Pixel(0,0)},{size:new OpenLayers.Size(22,'auto'),anchor:new OpenLayers.Bounds(null,21,0,32),position:new OpenLayers.Pixel(-1238,0)},{size:new OpenLayers.Size('auto',21),anchor:new OpenLayers.Bounds(0,0,22,null),position:new OpenLayers.Pixel(0,-629)},{size:new OpenLayers.Size(22,21),anchor:new OpenLayers.Bounds(null,0,0,null),position:new OpenLayers.Pixel(-1238,-629)},{size:new OpenLayers.Size(81,33),anchor:new OpenLayers.Bounds(0,null,null,0),position:new OpenLayers.Pixel(-311,-674)}]}}
		
	});
	//覆盖map的setLayerZIndex方法，用以设置vecor和marker层的覆盖关系
	 
	OpenLayers.Map.prototype.setLayerZIndex = function (layer, zIdx) {
		 //console.log('dfdf '+layer.CLASS_NAME);
		if(layer.CLASS_NAME=="OpenLayers.Layer.Markers"&&
				layer.name=="OpenLayers.multipleSelectEffect"){
			 layer.setZIndex(2499);
		}
		else if(layer.CLASS_NAME=="OpenLayers.Layer.Markers"){
		   layer.setZIndex(2500 + zIdx * 5 );
	   }else if(layer.CLASS_NAME=="OpenLayers.Layer.Vector" && layer.name!='fhLayer'){
		   layer.setZIndex(1500 + zIdx * 5 );
	   }else{
         layer.setZIndex(
            this.Z_INDEX_BASE[layer.isBaseLayer ? 'BaseLayer' : 'Overlay']
            + zIdx * 5 );
        }
    }
	//覆盖OpenLayers.Handler.RegularPolygon的createGeometry方法，为的是获取圆形的圆心和半径
	OpenLayers.Handler.RegularPolygon.prototype.createGeometry = function() {
        this.angle = Math.PI * ((1/this.sides) - (1/2));
        if(this.snapAngle) {
            this.angle += this.snapAngle * (Math.PI / 180);
        }
        this.feature.geometry = OpenLayers.Geometry.Polygon.createRegularPolygon(
            this.origin, this.radius, this.sides, this.snapAngle
        );
        this.feature.geometry.originCustom = this.origin;
        this.feature.geometry.radiusCustom = this.radius;
    }
	//修复修复IE 10  11 的bug。
	OpenLayers.Layer.Grid.prototype.initGriddedTiles = function(bounds) {
        
        // work out mininum number of rows and columns; this is the number of
        // tiles required to cover the viewport plus at least one for panning

        var viewSize = this.map.getSize();
        var minRows = Math.ceil(viewSize.h/this.tileSize.h) + 
                      Math.max(1, 2 * this.buffer);
        var minCols = Math.ceil(viewSize.w/this.tileSize.w) +
                      Math.max(1, 2 * this.buffer);
        
        var origin = this.getTileOrigin();
        var resolution = this.map.getResolution();
        
        var tileLayout = this.calculateGridLayout(bounds, origin, resolution);

        var tileoffsetx = Math.round(tileLayout.tileoffsetx); // heaven help us
        var tileoffsety = Math.round(tileLayout.tileoffsety);

        var tileoffsetlon = tileLayout.tileoffsetlon;
        var tileoffsetlat = tileLayout.tileoffsetlat;
        
        var tilelon = tileLayout.tilelon;
        var tilelat = tileLayout.tilelat;

        this.origin = new OpenLayers.Pixel(tileoffsetx, tileoffsety);

        var startX = tileoffsetx; 
        var startLon = tileoffsetlon;

        var rowidx = 0;
        
        var layerContainerDivLeft = parseInt(this.map.layerContainerDiv.style.left);
        var layerContainerDivTop = parseInt(this.map.layerContainerDiv.style.top);
        
    
        do {
            var row = this.grid[rowidx++];
            if (!row) {
                row = [];
                this.grid.push(row);
            }

            tileoffsetlon = startLon;
            tileoffsetx = startX;
            var colidx = 0;
 
            do {
            	//修复IE 10  11 的bug。
            	if(tileoffsetlon != startLon && colidx==0 ) {
            	       tileoffsetlon = startLon;
            	}

                var tileBounds = 
                    new OpenLayers.Bounds(tileoffsetlon, 
                                          tileoffsetlat, 
                                          tileoffsetlon + tilelon,
                                          tileoffsetlat + tilelat);

                var x = tileoffsetx;
                x -= layerContainerDivLeft;

                var y = tileoffsety;
                y -= layerContainerDivTop;

                var px = new OpenLayers.Pixel(x, y);
                var tile = row[colidx++];
                if (!tile) {
                    tile = this.addTile(tileBounds, px);
                    this.addTileMonitoringHooks(tile);
                    row.push(tile);
                } else {
                    tile.moveTo(tileBounds, px, false);
                }
     
                tileoffsetlon += tilelon;       
                tileoffsetx += this.tileSize.w;
            } while ((tileoffsetlon <= bounds.right + tilelon * this.buffer)
                     || colidx < minCols);
             
            tileoffsetlat -= tilelat;
            tileoffsety += this.tileSize.h;
        } while((tileoffsetlat >= bounds.bottom - tilelat * this.buffer)
                || rowidx < minRows);
        
        //shave off exceess rows and colums
        this.removeExcessTiles(rowidx, colidx);

        //now actually draw the tiles
        this.spiralTileLoad();
    }
	
	//增加arrow类型
    OpenLayers.Renderer.symbol.arrow = [0, 2, 1, 0, 2, 2, 1, 0, 0, 2];

	wktYouKeyuan = new OpenLayers.Format.WKT();
 	featureYouKeyuan = /*wkt.read("POLYGON((114.3891573517 30.518838362155,114.38910776427 30.518922279351,114.38911157868 30.51933042208,114.38922601122 "

		+"30.519326607662,114.38923364006 30.519357123007,114.38969518464 30.519364751843,114.3897295144 "

		+"30.519288463482,114.38973714324 30.519315164408,114.38998508041 30.519303721154,114.39002322459 "

		+"30.519261762556,114.39002703901 30.518941351441,114.38939766004 30.518910836097,114.38939766004 "

		+"30.518891764007,114.38930229959 30.518884135171,114.38929467075 30.518861248663,114.38924508331 "

		+"30.518842176573,114.3891573517 30.518838362155))");*/
	
	wktYouKeyuan.read("POLYGON((114.38678793996 30.516188088498,114.38602505635 30.51670684935,114.38544526481 30.517164579513,"
			+"114.38517062671 30.517805401742,114.38486547327 30.518354677938,114.38440774311 30.518842923446,"
			+"114.38428568173 30.519361684298,114.3844687738 30.520155083249,114.38489598862 30.520856936166,"
			+"114.38544526481 30.521558789084,114.38599454101 30.522138580624,114.38614711773 30.522504764755,"
			+"114.38623866376 30.52311507164,114.38633020979 30.523420225082,114.3868184553 30.523298163705,"
			+"114.38721515478 30.523725378524,114.38779494632 30.524640838852,114.38794752304 30.525129084359,"
			+"114.38831370717 30.525434237802,114.38916813681 30.525617329867,114.38974792835 30.525312176425,"
			+"114.38996153576 30.525190115048,114.39048029661 30.525190115048,114.39072441936 30.524457746786,"
			+"114.39173142572 30.52448826213,114.39176194107 30.520704359445,114.39173142572 30.520033021872,"
			+"114.39093802677 30.519239622921,114.38983947438 30.518873438791,114.38843576855 30.518690346725,"
			+"114.38819164579 30.518568285348,114.38678793996 30.516188088498))");
}

//显示/隐藏设备图层、站点图层
function checkLayers(){
	var puckd = $("#pucheck").attr("checked");
	var siteckd = $("#sitecheck").attr("checked");
	if(puckd){
		shotLyr6000V5.showMLyr();
		kakouLyr6000V5.showMLyr();
	}else{
		shotLyr6000V5.hideMLyr();
		kakouLyr6000V5.hideMLyr();
	}
	
	if(siteckd){
		siteLyr6000V5.showMLyr();
	}else{
		//先停止黑名单告警
		kakou.isSubscribe = 0;
		$("#tbItem53").find("a").html(geti18nMsg('toolbar.listenalarm'));
		$("#tbItem53").find("a").attr("title",geti18nMsg('toolbar.listenalarm'));
		$("#blackListTrackTr").hide();
		//清空站点轨迹图层
		kakou.clearNoCarTrack(gpsMonitor);
		siteLyr6000V5.hideMLyr();
	}
}

// 设置默认查询时间
function initDefaultTime(){
	var now = new Date(); //获取系统日期，如Sat Jul 29 08:24:48 UTC+0800 2012    
    var yy = now.getFullYear(); //截取年，即2012    
    var MM = now.getMonth()+1; //截取月，即07    
    var dd = now.getDate(); //截取日，即29    
    if(MM<10){//目的是构造2012-12-04这样的日期
    	MM = "0"+MM;
    }
    if(dd<10){
    	dd = "0"+dd;
    }
    
     //取时间    
    var hh = now.getHours(); //截取小时，即8    
    var mm = now.getMinutes(); //截取分钟，即34    
    var ss = now.getTime() % 60000;    
    //获取时间，因为系统中时间是以毫秒计算的， 所以秒要通过余60000得到。    
    ss = (ss - (ss % 1000)) / 1000; //然后，将得到的毫秒数再处理成秒    
    if (hh < 10) hh = '0' + hh; //字符串    
    var clock = hh+':'; //将得到的各个部分连接成一个日期时间    
    if (mm < 10) clock += '0'; //字符串    
    clock += mm+':';     
    if (ss < 10) clock += '0';     
    clock += ss;    
    var defaultStartTime = yy + "-" + MM + "-" + dd + " " + "00:00:00";
    var defaultEndTime = yy + "-" + MM + "-" + dd + " " + clock;
	
	$('#fromTime').val(defaultStartTime);
	$('#toTime').val(defaultEndTime);
	var toTime = document.getElementById("toTime"); 
	var fromTime = document.getElementById("fromTime"); 
}

//将字符串时间格式转换为Date类型
function toDate(str){
    var sd=str.split("-");
	var sd1=sd[2].split(" ");
	var sd2 = sd1[1].split(":");
	return new Date(sd[0],sd[1]-1,sd1[0],sd2[0],sd2[1],sd2[2]);
}
/**
 * 设备树图标类型
 * */
var TREE_EQUIP_KIND_ICON = {};

TREE_EQUIP_KIND_ICON.IMAGEPATH="resource/images/unityicon/unitytreeicon/";

TREE_EQUIP_KIND_ICON.WIDTH = 16;
TREE_EQUIP_KIND_ICON.HEIGHT = 16;
//枪机
TREE_EQUIP_KIND_ICON["QIANG"]={
   "OFFLINE":{
     "NOTLOCATED":"qj_offline.png",
	  "LOCATED":"qj_offline_position.png"
   },
   "ONLINE":{
      "NOTLOCATED":"qj_online.png",
	  "LOCATED":"qj_online_position.png"
   }
}
//全球
TREE_EQUIP_KIND_ICON["QUANQIU"]={
   "OFFLINE":{
     "NOTLOCATED":"qiuj_offline.png",
	  "LOCATED":"qiuj_offline_position.png"
   },
   "ONLINE":{
      "NOTLOCATED":"qiuj_online.png",
	  "LOCATED":"qiuj_online_position.png"
   }
}
//半球
TREE_EQUIP_KIND_ICON["BANQIU"]={
   "OFFLINE":{
     "NOTLOCATED":"bq_offline.png",
	  "LOCATED":"bq_offline_position.png"
   },
   "ONLINE":{
      "NOTLOCATED":"bq_online.png",
	  "LOCATED":"bq_online_position.png"
   }
}
//全景
TREE_EQUIP_KIND_ICON["QUANJING"]={
   "OFFLINE":{
     "NOTLOCATED":"quanj_offline.png",
	  "LOCATED":"quanj_offline_position.png"
   },
   "ONLINE":{
      "NOTLOCATED":"quanj_online.png",
	  "LOCATED":"quanj_online_position.png"
   }
}
//卡口
TREE_EQUIP_KIND_ICON["KAKOU"]={
   "OFFLINE":{
     "NOTLOCATED":"kk_offline.png",
	  "LOCATED":"kk_offline_position.png"
   },
   "ONLINE":{
      "NOTLOCATED":"kk_online.png",
	  "LOCATED":"kk_online_position.png"
   }
}
//默认
TREE_EQUIP_KIND_ICON["DEFAULT"]={
   "OFFLINE":{
     "NOTLOCATED":"mr_offline.png",
	  "LOCATED":"mr_offline.png"
   },
   "ONLINE":{
      "NOTLOCATED":"mr_online.png",
	  "LOCATED":"mr_online.png"
   }
}
/**
 * 地图上的设备图标类型
 * */
var MAP_EQUIP_KIND_ICON = {};

MAP_EQUIP_KIND_ICON.IMAGEPATH="resource/images/unityicon/unitymapiconEye";

MAP_EQUIP_KIND_ICON.WIDTH = 47;
MAP_EQUIP_KIND_ICON.HEIGHT = 33;

//枪机
MAP_EQUIP_KIND_ICON["QIANG"]={
   "OFFLINE":{     
	  "LOCATED":"qiangqiu_off.png"
   },
   "ONLINE":{      
	  "LOCATED":"qiang_on.png"
   },
   "ALARM":"qiang_alarm.png"
   
}
//全球
MAP_EQUIP_KIND_ICON["QUANQIU"]={
   "OFFLINE":{    
	  "LOCATED":"qiangqiu_off.png"
   },
   "ONLINE":{     
	  "LOCATED":"qiu_on.gif"
   },
   "ALARM":"qiu_alarm.gif"
 
}
//半球
MAP_EQUIP_KIND_ICON["BANQIU"]={
   "OFFLINE":{     
	  "LOCATED":"qiangqiu_off.png"
   },
   "ONLINE":{      
	  "LOCATED":"qiu_on.gif"
   },
   "ALARM":"qiu_alarm.gif"
  
}

//全景
MAP_EQUIP_KIND_ICON["QUANJING"]={
   "OFFLINE":{     
	  "LOCATED":"qiangqiu_off.png"
   },
   "ONLINE":{     
	  "LOCATED":"qiang_on.png"
   },
   "ALARM":"qiang_alarm.png"
   
}
//卡口
MAP_EQUIP_KIND_ICON["KAKOU"]={
   "OFFLINE":{     
	  "LOCATED":"qiangqiu_off.png"
   },
   "ONLINE":{     
	  "LOCATED":"qiang_on.png"
   },
   "ALARM":"qiang_alarm.png"
   
}
MAP_EQUIP_KIND_ICON["DEFAULT"]={
   "OFFLINE":{     
	  "LOCATED":"qiangqiu_off.png"
   },
   "ONLINE":{      
	  "LOCATED":"qiang_on.png"
   },
   "ALARM":"qiang_alarm.png"
   
}

/**
 * cu下视频巡逻任务列表用到的图标类型
 * */
var Patrol_EQUIP_KIND_ICON = {};

Patrol_EQUIP_KIND_ICON.IMAGEPATH="resource/images/unityicon/unitytreeiconPatrol/";

Patrol_EQUIP_KIND_ICON.WIDTH = 24;
Patrol_EQUIP_KIND_ICON.HEIGHT = 24;
//枪机
Patrol_EQUIP_KIND_ICON["QIANG"]={
   "OFFLINE":{
     "NOTLOCATED":"qj_offline.png",
	  "LOCATED":"qj_offline.png"
   },
   "ONLINE":{
      "NOTLOCATED":"qj_online.png",
	  "LOCATED":"qj_online.png"
   }
}
//全球
Patrol_EQUIP_KIND_ICON["QUANQIU"]={
   "OFFLINE":{
     "NOTLOCATED":"qiuj_offline.png",
	  "LOCATED":"qiuj_offline.png"
   },
   "ONLINE":{
      "NOTLOCATED":"qiuj_online.png",
	  "LOCATED":"qiuj_online.png"
   }
}
//半球
Patrol_EQUIP_KIND_ICON["BANQIU"]={
  "OFFLINE":{
    "NOTLOCATED":"qiuj_offline.png",
	  "LOCATED":"qiuj_offline.png"
  },
  "ONLINE":{
     "NOTLOCATED":"qiuj_online.png",
	  "LOCATED":"qiuj_online.png"
  }
}
//全景
Patrol_EQUIP_KIND_ICON["QUANJING"]={
   "OFFLINE":{
     "NOTLOCATED":"quan_offline.png",
	  "LOCATED":"quan_offline.png"
   },
   "ONLINE":{
      "NOTLOCATED":"quanj_online.png",
	  "LOCATED":"quanj_online.png"
   }
}
//卡口
Patrol_EQUIP_KIND_ICON["KAKOU"]={
 "OFFLINE":{
    "NOTLOCATED":"qj_offline.png",
	  "LOCATED":"qj_offline.png"
  },
  "ONLINE":{
     "NOTLOCATED":"qj_online.png",
	  "LOCATED":"qj_online.png"
  }
}
//默认
Patrol_EQUIP_KIND_ICON["DEFAULT"]={
 "OFFLINE":{
    "NOTLOCATED":"qj_offline.png",
	  "LOCATED":"qj_offline.png"
  },
  "ONLINE":{
     "NOTLOCATED":"qj_online.png",
	  "LOCATED":"qj_online.png"
  }
}
/**
 * 根据信息判断设备的类型 * 
 * callSource: 从设备树上调用的，还是地图上调用的，取值： "TREE", "MAP"
 * located:定位与否： "NOTLOCATED", "LOCATED"
 * 返回对象{"markImgUrl":***,"size":***}
 * */
function determineEquipKindByInfo(
		callSource,state,isKaKou,deviceShape,located){
	
	//返回对象
	var iconInfo = {};
	//icon库
	var iconResposity = TREE_EQUIP_KIND_ICON;
	
	if(callSource=="TREE"){
		iconResposity = TREE_EQUIP_KIND_ICON;
	}else{
		iconResposity = MAP_EQUIP_KIND_ICON;
	}
	
	//不在线全球
	if ((state==null||state==""||state==0||state==113) 
			&& !isKaKou && deviceShape == 1) {
		
		   iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
		          iconResposity.QUANQIU.OFFLINE[located];
		
		
	}
	//在线全球
	else if((state!=null&&state!=""&&state!=0 &&state!=113) 
			&& !isKaKou && deviceShape == 1) {
		
		 iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
		          iconResposity.QUANQIU.ONLINE[located];
		
	}
	//不在线枪机
	else if ((state==null||state==""||state==0||state==113) 
			&& !isKaKou && deviceShape == 3) {
		
		 iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
         iconResposity.QIANG.OFFLINE[located];
		
	}
	//在线枪机
	else if((state!=null&&state!=""&&state!=0&&state!=113) 
			&& !isKaKou && deviceShape == 3) {
		
		
		   iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
           iconResposity.QIANG.ONLINE[located];
		
	}
	//不在线半球机
	else if ((state==null||state==""||state==0||state==113) 
			&& !isKaKou && deviceShape == 4) {
		
		
		  iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
          iconResposity.BANQIU.OFFLINE[located];
		
	}
	//在线半球机
	else if((state!=null&&state!=""&&state!=0&&state!=113) 
			&& !isKaKou && deviceShape == 4) {
		
		    iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
            iconResposity.BANQIU.ONLINE[located];
		
	}
	//不在线全景
	else if ((state==null||state==""||state==0||state==113) 
			&& !isKaKou && deviceShape == 6) {
		iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
        iconResposity.QUANJING.OFFLINE[located];
	}
	//在线全景
	else if((state!=null&&state!=""&&state!=0&&state!=113) 
			&& !isKaKou && deviceShape == 6) {
		iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
        iconResposity.QUANJING.ONLINE[located];
	}
	//不在线卡口
	else if((state==null||state==""||state==0||state==113) 
			&& isKaKou) {
		iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
        iconResposity.KAKOU.OFFLINE[located];
	}
	//在线卡口
	else if((state!=null&&state!=""&&state!=0&&state!=113) && isKaKou) {
		iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
        iconResposity.KAKOU.ONLINE[located];
	}
	//不在线其他类型
	else if ((state==null||state==""||state==0||state==113)) {
		
		  iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
          iconResposity.DEFAULT.OFFLINE[located];
		
	}
	//在线其他类型
	else if((state!=null&&state!="" && state!=0 && state!=113)) {
		
		  iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
          iconResposity.DEFAULT.ONLINE[located];
		  
	}
	else{
		
		iconInfo = null;
	}
	
	iconInfo.size = new OpenLayers.Size(
			iconResposity.WIDTH,
			iconResposity.HEIGHT);
	return iconInfo;
}

/**
 * 分了1 2 3类点  根据信息判断设备的类型 * 
 * callSource: 从设备树上调用的，还是地图上调用的，取值： "TREE", "MAP"
 * located:定位与否： "NOTLOCATED", "LOCATED"
 * 返回对象{"markImgUrl":***,"size":***}
 * */
function newDetermineEquipKindByInfo(callSource,state,isKaKou,deviceShape,located,ponitKind){
	
	//返回对象
	var iconInfo = {};
	var iconResposity =  MAP_EQUIP_KIND_ICON;
	//不在线全球
	if ((state==null||state==""||state==0||state==113) 
			&& !isKaKou && deviceShape == 1) {
		   iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
		   "/"+ponitKind+"class/qiu/off" + ponitKind + ".png";
	}
	//在线全球
	else if((state!=null&&state!=""&&state!=0 &&state!=113) 
			&& !isKaKou && deviceShape == 1) {
		  iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
		   "/"+ponitKind+"class/qiu/onQiu" + ponitKind + ".png";   
		
	}
	//不在线枪机
	else if ((state==null||state==""||state==0||state==113) 
			&& !isKaKou && deviceShape == 3) {
		 iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
		 "/"+ponitKind+"class/qiang/off" + ponitKind + ".png";
	}
	//在线枪机
	else if((state!=null&&state!=""&&state!=0&&state!=113) 
			&& !isKaKou && deviceShape == 3) {
		 iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
		 "/"+ponitKind+"class/qiang/on" + ponitKind + ".png";
		
	}
	//不在线半球机
	else if ((state==null||state==""||state==0||state==113) 
			&& !isKaKou && deviceShape == 4) {
		  iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
		  "/"+ponitKind+"class/banqiu/off" + ponitKind + ".png";
	}
	//在线半球机
	else if((state!=null&&state!=""&&state!=0&&state!=113) 
			&& !isKaKou && deviceShape == 4) {
		    iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
		    "/"+ponitKind+"class/banqiu/onQiu" + ponitKind + ".png";
	}
	//不在线全景
	else if ((state==null||state==""||state==0||state==113) 
			&& !isKaKou && deviceShape == 6) {
		iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
		"/"+ponitKind+"class/quanjing/off" + ponitKind + ".png";
	}
	//在线全景
	else if((state!=null&&state!=""&&state!=0&&state!=113) 
			&& !isKaKou && deviceShape == 6) {
		iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
		"/"+ponitKind+"class/quanjing/onQiu" + ponitKind + ".png";
	}
	//不在线卡口
	else if((state==null||state==""||state==0||state==113) 
			&& isKaKou) {
//		iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
//		"/"+ponitKind+"class/quanjing/off" + ponitKind + ".png";
		iconInfo.markImgUrl = "resource/images/yanpan/unityicon/k4.png";
	}
	//在线卡口
	else if((state!=null&&state!=""&&state!=0&&state!=113) && isKaKou) {
//		iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
//        i"/"+ponitKind+"class/quanjing/off" + ponitKind + ".png";
		if(deviceShape){
			iconInfo.markImgUrl = "resource/images/yanpan/unityicon/k1.png"
		}else{
			iconInfo.markImgUrl = "resource/images/yanpan/unityicon/k2.png"
		}
		
		
	}
	//不在线其他类型
	else if ((state==null||state==""||state==0||state==113)) {
		  iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
		  "/"+ponitKind+"class/default/off" + ponitKind + ".png";
	}
	//在线其他类型
	else if((state!=null&&state!="" && state!=0 && state!=113)) {
		  iconInfo.markImgUrl = iconResposity.IMAGEPATH + 
		  "/"+ponitKind+"class/default/on" + ponitKind + ".png";
	}
	else{
		iconInfo = null;
	}
	return iconInfo;
}
/**
清除地图上新式气泡弹窗
*/
function removeAllNewStylePopups(){
	
	var prefixStr = "newMapIconPopup_";
			
	$("div[id*='"+prefixStr+"']").remove();
	
	prefixStr = "socialResPointPopup_";
	$("div[id*='"+prefixStr+"']").remove();
		
	prefixStr = "gisSubMapPopup_";
	$("div[id*='"+prefixStr+"']").remove();
	
	prefixStr = "picMapIconPopup_";
	$("div[id*='"+prefixStr+"']").remove();
	
	
	prefixStr = "kkzdPopup_";
	$("div[id*='"+prefixStr+"']").remove();
	
	prefixStr = "anjianPopup_";
	$("div[id*='"+prefixStr+"']").remove();
	
	prefixStr = "yanpan12ClassPointPopup_";
	$("div[id*='"+prefixStr+"']").remove();
	
	prefixStr = "yanpanSocialResPointPopup_";
	$("div[id*='"+prefixStr+"']").remove();
	
	prefixStr = "yanpanCommonFilePopup_";
	$("div[id*='"+prefixStr+"']").remove();
	
	prefixStr = "yanpanUserCustomPopup_";
	$("div[id*='"+prefixStr+"']").remove();
	
	prefixStr = "yanpanUnmannedPlaneImageLayerPopup_";
	$("div[id*='"+prefixStr+"']").remove();
	
	prefixStr = "yanpanFieldSurveyImageLayerPopup_";
	$("div[id*='"+prefixStr+"']").remove();
	
	prefixStr = "yanpanMobileSiteLayerPopup_";
	$("div[id*='"+prefixStr+"']").remove();
	
	prefixStr = "yanpanMonitorHouseLayerPopup_";
	$("div[id*='"+prefixStr+"']").remove();
	
	prefixStr = "caseDetailPopup_";
	$("div[id*='"+prefixStr+"']").remove();
	
	prefixStr = "yanpanMapMarkPointPopup_"; 
	$("div[id*='"+prefixStr+"']").remove();
	
	 $('#unmannedplaneimagePreviewContainer').hide();
	 $('#unmannedplaneimagePreviewCinner').html("");
}
/**
获取象限角
*/
 function getQuadrantAngle(angle, dx, dy){
	
	    var qAngle = [-1, 90, -90, 270, 90];
	    var Quadrant = 0;
	    if(dx>=0 && dy>=0){
	        Quadrant = 1;
	    }else if(dx>=0 && dy<0){
	        Quadrant = 4;
	    }else if(dx<=0 && dy>=0){
	        Quadrant = 2;
	    }else if(dx<=0 && dy<0){
	        Quadrant = 3;
         }
	    return (-angle + qAngle[Quadrant]);
}
/**
 获取角度（以正北为0度，顺时针依次增加到360）
*/
function computeAngleByNorth(pt,ptNext){
	
	 //var prevPt = {x:2,y:1};
    // var pt = {x: 1,y:4};
     var dx = ptNext.x - pt.x;
     var dy = ptNext.y - pt.y;
     var angle;
     
     if(dy==0&&dx==0){
 	    angle  = Math.atan(Infinity)*180/Math.PI; 
 	 }else{
 	   angle  = Math.atan(dy/dx)*180/Math.PI;
 	 }
 	 var angle2 = getQuadrantAngle(angle, dx, dy); 
 	 if(angle2<0){
 	  angle2 +=360;
 	 }
 	 //console.log(angle2 + " "+pt.x + " "+ pt.y + " "+ ptNext.x+ " "+ ptNext.y);
 	 
 	 return angle2;
}
/**
 * 显示自消失提示框
 * */
function showFadingTipDiv(tipText,time){
	if(tipText==null || tipText==""){
		tipText = "";
	}
	
	var bodyW = $('body').width();
	var bodyH = $('body').height();
	
	var left = (bodyW-$('#fadingTipDiv').width())/2;
	var top = (bodyH-$('#fadingTipDiv').height())/2;
	
	$("#fadingTipDiv").css({'left':left+'px','top':top+'px'});
	$("#fadingTipDiv").show();
	$("#fadingTipDiv").find("div").html(tipText);
	if(time != null && time != undefined && time != ""){
		setTimeout(function(){ 
			$("#fadingTipDiv").fadeOut("fast");
		},time);
	}else{
		setTimeout(function(){ 
			$("#fadingTipDiv").fadeOut("fast");
		},1500);
	}
	
}

/**
 * yanpan 点类型转换
 * */
function pointTypeTransform(srcType){
	var rsType = 1;
	if(srcType==QUERY_SHOT_POINT_KINDS.FIRSTCLASS || 
			srcType==QUERY_SHOT_POINT_KINDS.SECONDCLASS	){
		rsType = 1;
	}else if(srcType==QUERY_SHOT_POINT_KINDS.THIRDCLASS){
		rsType = 3;
	}else if(srcType==QUERY_SHOT_POINT_KINDS.KAKOUSITE){
		rsType = 4;
	}
	return rsType;
}
/**
 * 释放ol ajax对象
 * */
function releaseOLAjax(currentInstan,jsobj,originalRequest,res,jsobjRes){
	
	currentInstan = null;
	
	originalRequest.request.options.currentInstance = null;
	originalRequest.request.options.onComplete = null;	
	
	originalRequest.responseText = null;
	//originalRequest.transport.responseText = null;	
	
	originalRequest = null;
	
	if(jsobj && jsobj.clusterReturn){
		if(jsobj.clusterReturn.length>0){
			for(o in jsobj.clusterReturn){
				jsobj.clusterReturn[o]=null;
			}
		}
		
		jsobj.clusterReturn = null;				
	}
	jsobj = null;
	res = null;	
	jsobjRes = null;
	
	if(typeof CollectGarbage!='undefined'){
		CollectGarbage();
	} 
	
}
/*
 * gc回收
 * **/
function gcCleanup(){
	
	if(typeof CollectGarbage!='undefined'){
		CollectGarbage();
	} 
}
//数值 positive, negative, and floating decimal
function checkNumeric(cnt){

   if(/^[\-\+]?((([0-9]{1,3})([,][0-9]{3})*)|([0-9]+))?([\.]([0-9]+))?$/.test(cnt)){
     return true;
   }else{
     return false;
   }

}
//关闭已经打开的结果框
function closeAlreadyOpenedResultWin(){
	
	if(paraseSchRsControl){
		  paraseSchRsControl.closeSchRsWin();
	 }
	if(paraseSchRs4TaskControl){
		paraseSchRs4TaskControl.closeSchRsWin();
	}
}



//格式化时间 new Date().format('hh:mm:ss'); 返回当前时间的时、分、秒
Date.prototype.format = function(format) {
       var date = {
              "M+": this.getMonth() + 1,
              "d+": this.getDate(),
              "h+": this.getHours(),
              "m+": this.getMinutes(),
              "s+": this.getSeconds(),
              "q+": Math.floor((this.getMonth() + 3) / 3),
              "S+": this.getMilliseconds()
       };
       if (/(y+)/i.test(format)) {
              format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
       }
       for (var k in date) {
              if (new RegExp("(" + k + ")").test(format)) {
                     format = format.replace(RegExp.$1, RegExp.$1.length == 1
                            ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
              }
       }
       return format;
}

//timeStamp类型转换成Date类型
function timeStampToDate(timeStamp){
	if(!/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]) ([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(timeStamp)){
    	//通过验证
		alert("不是正确的时间类型")
		return false;
	}
	
	var year,month,day,hour,minute,second;
	var time = timeStamp.split(" ");
	//年月日
	year = time[0].split("-")[0];
	month = time[0].split("-")[1];
	day = time[0].split("-")[2];
	
	//时分秒
	hour = time[1].split(":")[0];
	minute = time[1].split(":")[1];
	second = time[1].split(":")[2];
	
	//console.log(year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second);
	var myDate = new Date();
	myDate.setYear(year);
	myDate.setMonth(month-1);
	myDate.setDate(day);
	
	myDate.setHours(hour,minute,second);
	
	//console.log(myDate);
	return myDate;
	
}
/**
 * 路径格式的校验
 */
function isValidPath(path) {
	if (path.charAt(0) != '/') {  //windowpath
		var winpath = /^[a-zA-Z]{1}:\\([^\/\\&?*:\"<>|]+\\?)*$/; 
		var re = new RegExp(winpath);
		if(path.match(re) != null){
			return true;
		}else{
			return false;
		}
	} else if (path.length == 1) //"/"
		return true;
	var lnxPath = /^\/([^\/]+\/?)+$/;
	var re1 = new RegExp(lnxPath);
	if(path.match(re1) != null){
		return true;
	}else{
		return false;
	}
}	
/**
 * 处理返回的字符串味空的情况
 */
function dealWithParam(str){
	
	if($.trim(str) == null || $.trim(str) == "" || $.trim(str) == "null" || $.trim(str) == "undefined"){
		str = "";
	}
	return str;
}
/**
 * 获取字符串时间
 * @return {TypeName} 
 * time:时间毫秒
 */
function getDateString(time){
	  
	  var dateNow = new Date();
	  if(time){
		  dateNow = new Date(time);
	  }
	  var year = dateNow.getFullYear();
	  var month = dateNow.getMonth()+1;
	  var day = dateNow.getDate();
	  var hour = dateNow.getHours();
	  var minute = dateNow.getMinutes();
	  var second = dateNow.getSeconds();
	  
	  if(month <10) month="0"+month;
	  if(day <10) day="0"+day;
	  if(hour <10) hour="0"+hour;
	  if(minute <10) minute="0"+minute;
	  if(second <10) second="0"+second;
	  
	  var dateString = {
		  todayStartTime: year + "-" + month + "-" + day + " 00:00:00",
		  todayEndTime: year + "-" + month + "-" + day + " 23:59:59", 
		  nowTime: year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second,
		  dayDate: year+"-"+month+"-"+day
	  }
	  return dateString;
}
//判断经纬度是否有值，有是true，无是false
function isNotNullLonLat(val){
	val = (val==0||val==""|| val == null || val == "null" 
		   || typeof val =="undefined" || val == "NaN")?
				   null:val;
	if(val==null){
		return false;
	}else{
		return true;
	}
}
/*
 * 显示dialog弹框模态背景
 */
function showDialogBackGround(){
	window.setTimeout(function(){
		//不将背景处理一下，背景在弹框上面
		if($("#ldg_lockmask") && $("#ldg_lockmask").attr("id")){
			$("#ldg_lockmask").css("z-index","1000");
			$("#ldg_lockmask").show();
		}
	},10);
}
/**
 * 截取字符长度（包含中文和英文）
 * s: 待截取的字符串   num: 截取长度 
 */
function clipStrCC(s,num) {
	  var strs = "";
	  var l = 0;
	  var a = s.split("");
	  for (var i=0;i<a.length;i++) {
		if (a[i].charCodeAt(0)<299) {
			l++;
		}else {
			l+=2;
		}
		if(l>num)break;
		strs +=a[i];	  
	  }
	  if(l > num)strs+="...";	 
	  return strs;
}