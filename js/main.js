var app = {}, game;
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

window.addEventListener('load', function(){
	document.querySelector('.game').style.display = 'block';
	initGame();
}, false);

function initGame(){
	//game = new Phaser.Game(app.width*app.pixelRatio*0.5, app.height*app.pixelRatio*0.5, Phaser.WEBGL, document.querySelector('.game'), {
	game = new Phaser.Game(
		640, 
		1008,
		Phaser.WEBGL, document.querySelector('.game'),
		null, //{preload: gamePreload, create: gameCreate}, 
		true
	);
	game._state = {
		boot: {
			init: function(){
				console.log('boot.init');
				game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
			},
			preload: function(){
				console.log('boot.preload');
			},
			create: function(){
				console.log('boot.create');
				game.state.start('loading');
			},
			shutdown: function(){
				console.log('boot.shutdown');
			}
		},
		loading: {
			preload: function(){
				console.log('loading.preload');
			},
			create: function(){
				console.log('loading.create');
				console.log(this)
			},
		}
	}
	game.state.add('boot', game._state.boot, false);
	game.state.add('loading', game._state.loading, false);
	game.state.start('boot');
	
	
};

function gameBoot(){
	console.log(11)
}

function gamePreload(){
	console.log(22)
	var preload, preload_line, preload_text;
	preload = game.add.group(game.stage, 'preload');
	
	preload_text = game.add.text(game.width*0.5, game.height*0.47, '0%');
	preload_text.anchor.setTo(0.5, 0.5);
	preload_text.align = 'center';
	preload_text.fontWeight = 'normal';
	preload_text.fontSize = 24;
	preload_text.fill = '#fff';
	preload.addChild(preload_text);
	
	preload_line = game.add.graphics(0, 0);
	preload_line.lineStyle(2, 0xffffff, 0.2);
	preload_line.moveTo(game.width*0.2, game.height*0.5);
	preload_line.lineTo(game.width*0.8, game.height*0.5);
	preload.addChild(preload_line);
	
	game.load.onFileComplete.add(function(p){
		console.log(p)
	});
	game.load.onLoadComplete.addOnce(function(){
		console.log('loaded');
	});
	
	game.load.image('loading', 'img/loading.png');
	game.load.image('bg', 'img/bg.jpg');
	game.load.image('btn', 'img/btn.png');
	game.load.image('food', 'img/food.png');
	game.load.image('title', 'img/title.png');
	game.load.image('snake-head', 'img/snake-head.png');
	game.load.image('snake-body', 'img/snake-body.png');
	
};

function gameCreate(){
	var s, t;
	console.log(1)
	//s = game.add.sprite(320,0,'bg');
};
