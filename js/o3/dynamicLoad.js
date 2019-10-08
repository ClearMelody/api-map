/**
 * @(#)dynamicLoadJs.js
 * 
 * @description: 动态判断加载js
 * @author: 张添 2015/10/28
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
  var jsArray = [];
  jsArray = new Array(
//		  "resource/js/gis/comm/halftripletiles.js",
//		  "resource/js/gis/embedMap/embedLayer.js",
//		  "resource/comm/js/json.js"
  );
    if(clientGISKind==clientGISKinds.FHGIS){
		
		jsArray.push("resource/js/o3/adapter/fhgisadapter/FHgisAdapter.js");	
		
	}
	//pgis
	else if(clientGISKind==clientGISKinds.PGIS){
		
		//jsArray.push("resource/js/o3/adapter/pgisadapter/OLPgisLayer.js");
		jsArray.push("resource/js/o3/adapter/pgisadapter/PgisAdapter.js");
		//jsArray.push("resource/js/o3/adapter/pgisadapter/PgisLayerswitcher.js");
	}  
    //arcgis
	else if(clientGISKind==clientGISKinds.ARCGIS){
//		jsArray.push("resource/js/gis/adapter/fhgisadapter/FHgisAdapter.js");	
		jsArray.push("resource/js/o3/adapter/arcgisadapter/ArcgisRestAdapter.js");	

	}else if(clientGISKind=='OFFLINEGIS'){
		jsArray.push("resource/js/o3/adapter/offlineadapter/OfflineAdapter_new.js");	

	}
   
	for ( var i = 0; i < jsArray.length; i++) {
		document.write("<script   src='"+ jsArray[i]+ "'  > <\/script>");
	}

