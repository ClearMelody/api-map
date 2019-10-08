/**
 * @(#)olpgisLayer.js
 * 
 * @description: 加载PGIS图层
 * @author: 杨朝晖 2013/11/12
 * @version: 1.0
 * @modify: MODIFIER'S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
OpenLayers.olPgisLayer = OpenLayers.Class( {
	// 地图实例
	map : null,
	
	tmslayer : null,
	
	layername: null,
  
	initialize : function(mainMap, hturl, layername, enabled) {
		this.map = mainMap;
        this.layername = layername;
		this.addTMSLayer(hturl, enabled);
	},
	/**
	 * 添加TMS图层
	 * */
    addTMSLayer : function(hturl, enabled) {

		 
		this.tmslayer = new OpenLayers.Layer.TMS(this.layername, hturl, {
			serviceVersion : '.',
			layername : this.layername,
			alpha : true,
			type : 'png',
			getURL : this.overlay_getTileURL,
			isBaseLayer : true,
			tileOrigin : new OpenLayers.LonLat(0, 0)
		}, {
			buffer : 16,
			displayOutsideMaxExtent : false
		}

		);

		this.tmslayer.setVisibility(enabled);
		// this.tmslayer.displayInLayerSwitcher= false;
		this.map.addLayer(this.tmslayer);

	},
	
	/**
	  http://10.4.0.130:8080/website/PGIS_S_LWTileMap/Maps/SL/EzMap?Service=getImage&Type=RGB&Col=54&Row=15&Zoom=8&V=0.3
	  计算出网格个数
	*/
    overlay_getTileURL : function(bounds) {

		var z = this.map.getZoom();

		bounds = this.adjustBounds(bounds);
		var res = this.map.getResolution();
		var x = Math.round((bounds.left - this.tileOrigin.lon)
				/ (res * this.tileSize.w));
		var y = Math.round((bounds.bottom - this.tileOrigin.lat)
				/ (res * this.tileSize.h));
 
		var url = this.url;

		var postfix = "EzMap?Service=getImage&Type=RGB&Col="+x+"&Row="+y+"&Zoom="+z+"&V=0.3";
		
		url+="/"+postfix;
		return url;
		
	},
	CLASS_NAME : "OpenLayers.olPgisLayer"
});
