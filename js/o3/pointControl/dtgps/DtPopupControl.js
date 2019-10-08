var DtPopupControl = function(){
	this.init.apply(this, arguments);
}

DtPopupControl.prototype ={

	container:null,
	popUpContent:null,
	closer:null,
	overlay:null,

init : function(map){
	var _self = this;
	this.container = document.getElementById('dtPop');
	this.popUpContent = document.getElementById('dtPopContent');
	this.closer = document.getElementById('dtClose');

	this.closer.onclick = function() {
		_self.overlay.setPosition(undefined);
		_self.closer.blur();
		return false;
	};

	//popup图层
	this.overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
		element: this.container,
		autoPan: true,
		autoPanAnimation: {
			duration: 250
		}
	}));
	map.addOverlay(this.overlay);
	$("#dtPop").css("display","block");
	//解决部分电脑pop显示不出来的问题，被其它信息遮挡
	$("#dtPop").parent().css("z-index",200);
},

//显示popup
showPopUpWin : function(text,coordinate,type){
	if(clientGISKind==clientGISKinds.OFFLINEGIS){
		coordinate = ol.proj.transform(ZT.Utils.gps84_To_Gcj02(coordinate[0],coordinate[1]), 'EPSG:4326', 'EPSG:3857');
	}
	this.popUpContent.innerHTML = text;// '<p>You clicked here:123</p>';
	this.overlay.setPosition(coordinate);
},

closePopUpwin : function(){
	this.overlay.setPosition(undefined);
	this.closer.blur();
},

CLASS_NAME : "DtPopupControl"

}