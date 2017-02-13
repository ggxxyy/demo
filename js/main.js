app.pixelRatio = window.devicePixelRatio || 1;
app.ios = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
app.weixin = navigator.userAgent.toLowerCase().match(/MicroMessenger/i)=="micromessenger";
app.width = window.innerWidth;
app.height = window.innerHeight;
app.isTouch = window.ontouchstart===undefined ? false : true;
app.evtDown = app.isTouch?"touchstart":"mousedown";
app.evtMove = app.isTouch?"touchmove":"mousemove";
app.evtUp = app.isTouch?"touchend":"mouseup";
app.evtClick = app.isTouch?"tap":"click";


$(function(){

	/***** 本地储存 *****/
	function setLocalData(name, value, expires){
		if(!expires || typeof(expires)!='number'){ expires=24; }
		if (window.localStorage) {
		    localStorage.setItem(name, value);
		    localStorage.setItem(name+'_expires', new Date().getTime()+expires*60*60*1000);
		}else{
		    var date=new Date();
		    date.setTime(date.getTime()+expires*60*60*1000); 
		    document.cookie=name+"="+encodeURIComponent(value)+";expires="+date.toGMTString(); 
		}
	}
	function getLocalData(name){
		if (window.localStorage) {
		    var expires=localStorage.getItem(name+'_expires');
		    if(!expires || expires<new Date().getTime()){
		    	localStorage.removeItem(name);
		    	localStorage.removeItem(name+'_expires');
		    	return null;
		    }else{
		    	return localStorage.getItem(name);
		    }
		}else{
		    var arr, reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)"); 
		    if(arr=document.cookie.match(reg)){ 
		    	if(arr[2].match(/^-?[1-9]+[0-9]*|0$/)){
		    		return parseInt(arr[2]);
		    	}else{
		    		return decodeURIComponent(arr[2]); 
		    	}
		    }else{ 
		        return null; 
		    } 
		}
	}
	function delLocalData(name){
		if (window.localStorage) {
		    localStorage.removeItem(name);
	    	localStorage.removeItem(name+'_expires');
		}else{
		    var exp = new Date(); 
		    exp.setTime(exp.getTime() - 1); 
		    var cval = getLocalData(name); 
		    cval += "||cval:" +cval; 
		    if (cval != null){ document.cookie=name+"="+encodeURIComponent(cval)+";expires="+exp.toGMTString(); } 
		}
	}
	
	
	/***** 获取URL参数 *****/
	function GetQueryString(name) {
	   var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
	   var r = window.location.search.substr(1).match(reg);
	   if (r!=null) return decodeURIComponent(r[2]); return null;
	}
	
	
	/***** 自定义tap事件 *****/
	if(app.isTouch){
		 $.event.special.tap = {
	        setup: function () {
	            $(this).on('touchstart.tap', function (e) {
	                $(this).data('@tap_startTime', e.timeStamp);
	            });
	            $(this).on('touchmove.tap', function (e) {
	                $(this).removeData('@tap_startTime');
	            });
	            $(this).on('touchend.tap', function (e) {
	                if($(this).data('@tap_startTime') && e.timeStamp-$(this).data('@tap_startTime')<800){
	                	$(this).removeData('@tap_startTime');
	                	var myevt=$.Event("tap");
	                	myevt.originalEvent=e.originalEvent;
	                	$.event.trigger(myevt, null, e.target);
	                	//return false;
	                	//window.clearTimeout(this.tap_timer);
	                	//this.tap_timer=window.setTimeout(function(){ $.event.trigger(myevt, null, e.target); });
	                } 
	            });
	        },
	        teardown: function () {
	        	$(this).off('touchstart.tap').off('touchmove.tap').off('touchend.tap');
	            $.event.remove(this, 'tap');
	            $.removeData(this, '@tap_startTime');
	            //this.tap_timer=undefined;
	        }
	    };
		$.fn.tap = function (callback) { // tap快捷方式
		    return this.on('tap', callback);
		};
	}
	
		
	/***** 提示弹窗 *****/
	function myAlert(info, callback){
		var html='';
		if(info===undefined){ info = ''; }
		if(info===null){ info = 'null'; }
		if(typeof(info)==='boolean'){ info= info?'true':'false'; }
		html+='<div class="alert"><article>';
		html+='<header>'+info+'</header>';
		html+='<footer><a>确定</a></footer>';
		html+='</article></div>';
		html=$(html);
		html.find('footer').on(app.evtClick, function(){
			var div = $(this).parents('.alert');
			div.addClass('alert_out');
			setTimeout(function(){ 
				div.remove();
				if(typeof(callback)=='function'){ callback(); }
			},350);
		})
		$('body').append(html);
	}
	
	
	
	
	/***** begin *****/
	$("body").css({
		//'height': app.height, 
		'font-size':app.width/320*12
	}).on('contextmenu', function(e) {
		e.preventDefault();
	});
	if(app.ios){
		$('body').on('touchend', function(){
			var delta, time = new Date().getTime();
			if(!app._last_touchend_time){ app._last_touchend_time=time; return; }
			delta = time - app._last_touchend_time;
			app._last_touchend_time = time;
			if(delta<500){ return false; }
		});
	}
	window.appBegin = function(){
		$("img").each(function(){ $(this).attr('assetUrl') && $(this).attr('src', $(this).attr('assetUrl')); });
		$(".assetloading").transit({opacity:0}, 300, function(){
			$(".assetloading, .asset").remove();
			$(".wrapper").removeClass('cache');
			$(".game").show();
			
			initGame();
			
		});
	}
	
	
	
	/***** phaser *****/
	var game;
	function initGame(){
		//game = new Phaser.Game(app.width*app.pixelRatio*0.5, app.height*app.pixelRatio*0.5, Phaser.WEBGL, document.querySelector('.game'), {
		game = new Phaser.Game(640, 1008, Phaser.WEBGL, document.querySelector('.game'), {
			preload: gamePreload, 
			create: gameCreate
		});
		setTimeout(function(){
			game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
		});
		
	};
	
	function gamePreload(){
		game.load.image('heart', 'img/s4-9.png');
	};
	
	function gameCreate(){
		var s, t;
		s = game.add.sprite(0,0,'heart');
	};
	
	function test(){
		alert(2);
	}


});