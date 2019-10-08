/**
 * @(#)PgisLayerswitcher.js
 * 
 * @description:  pgis图层开关器
 * @author: 杨朝晖 2013/11/15
 * @version: 1.0
 * @modify: MODIFIER"S NAME YYYY/MM/DD 修改内容简述
 * @Copyright: 版权信息
 */
var PgisLayerswitcher = function() {
	this.init.apply(this, arguments);
};
PgisLayerswitcher.prototype = {
		
		map:null,
		////pgis地图服务图层
		pgisServerLayers:null,
		/**
		 * 构造函数
		 *
		 */
		init : function(mainMap) {
	 
	          this.map = mainMap;
			 //defined in configLoadPgisLayers()
	          this.pgisServerLayers = map.pgisServerLayers;
			 
	        //矢量地图图层名
	        var slLayerName = this.pgisServerLayers[0].layername;
	        //影像地图
	        var yxLayerName = this.pgisServerLayers[1].layername;
	        //矢量影像叠加地图
	        var sydjLayerName = this.pgisServerLayers[2].layername;
	        //DEM数字高程地图
	        var demLayerName = this.pgisServerLayers[3].layername;
	        
	        //地图图源显示div切换	
		    var c=document.createElement("div");	
			var jsHtml = '<a id="pgisMapSourceSwitcherFirstLeveMenu" '+
			             ' title="'+slLayerName+'" href="javascript:void(0);" '+
			             'class="pgismapserver1" id="gis_switching_but" hidefocus="true" onclick="">'+
		                 '</a>';
		 
			  c.style.cssText='position:absolute;'+
			                'top:50px;left:80px;width:57px;height:59px;';
			 
			
			c.innerHTML=jsHtml;
			 
			$('body').append(c);
			 
			//地图图源切换divs
			 var d=document.createElement("div");
			 var jsHtmld = '';
				 jsHtmld+='<a msrc=0 href="javascript:void(0);" title="'+slLayerName+'" class="pgismapserver1" id="gis_switching_but" hidefocus="true" style="display:none;">'+
		            '</a>';
				 jsHtmld+='<a msrc=1 href="javascript:void(0);" title="'+yxLayerName+'" class="pgismapserver2" id="gis_switching_but" hidefocus="true" >'+
			        '</a>';
				 jsHtmld+='<a msrc=2 href="javascript:void(0);" title="'+sydjLayerName+'" class="pgismapserver3" id="gis_switching_but" hidefocus="true" >'+
			        '</a>';
				 //jsHtmld+='<a msrc=3 href="javascript:void(0);" title="2.5维仿真地图" class="pgismapserver4" id="gis_switching_but" hidefocus="true" >'+
			       // '</a>';
				 jsHtmld+='<a msrc=3 href="javascript:void(0);" title="'+demLayerName+'" class="pgismapserver4" id="gis_switching_but" hidefocus="true" >'+
			        '</a>';
		     d.id="pgisMapSourceSwitcherSecendLeveMenu";
      
	    	 d.style.cssText='position:absolute;display:none;'+
	         'top:107px;left:80px;width:57px;z-index:2000;';
    
		     //如果父页面是警情接入管理页面
		     if(parent && parent.parentWindowName && parent.parentWindowName=="policeAlarmInfIndex"){
		    	 c.style.cssText='position:absolute;'+
		         'top:50px;left:100px;width:57px;height:59px;';
		    	 d.style.cssText='position:absolute;display:none;'+
		         'top:107px;left:100px;width:57px;';
		     }
		     
		     d.innerHTML=jsHtmld;
		     $('body').append(d);
		 	 
		 	 c.onmouseover=function(){
		 		 $('#pgisMapSourceSwitcherSecendLeveMenu').show();
		 	 };
		 	 d.onmouseleave = function(){
		 		 $('#pgisMapSourceSwitcherSecendLeveMenu').hide();
		 	 };
 	
		 	var _self = this;
		 	
		 	$(d).children().click(function(){
		 		var cur = $(this).attr("msrc");
		 		cur = parseInt(cur);
		 		//var url = _self.mapSrcURL[cur][1];
		 		//alert(cur);
		 		//切换图源
		 		_self.switcherMapSource(cur);
		 		
		 		 $('#pgisMapSourceSwitcherSecendLeveMenu').hide();
		 		
		 		//将已经选中的mapserver隐藏
		  		$('.pgismapserver1,.pgismapserver2,.pgismapserver3,.pgismapserver4').show();
		  		$('a[msrc='+(cur)+']').hide();
		 		 
		  		var tmpLayerName = _self.pgisServerLayers[cur].layername;
		  		
		 		$('#pgisMapSourceSwitcherFirstLeveMenu').attr("title",tmpLayerName);
		 		$('#pgisMapSourceSwitcherFirstLeveMenu').attr("class","");
		 		$('#pgisMapSourceSwitcherFirstLeveMenu').attr("class","pgismapserver"+(cur+1));
		 		$('#pgisMapSourceSwitcherFirstLeveMenu').show();
		 	}); 
		}, 
		/**
		 * 切换图源
		 * */
		switcherMapSource: function(cur){
			 
			for(var i = 0;i<this.pgisServerLayers.length;i++){
				
				this.pgisServerLayers[i].tmslayer.setVisibility(false);
			}
			
			this.pgisServerLayers[cur].tmslayer.setVisibility(true);
			
			this.map.setBaseLayer(this.pgisServerLayers[cur].tmslayer);
		},
		CLASS_NAME : "PgisLayerswitcher"
	};