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
		null,
		true
	);
	game._state = {
		boot: {
			init: function(){
				console.log('boot.init');
				game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
			},
			create: function(){
				console.log('boot.create');
				setTimeout(function(){
					game.state.start('loading');
				}, 100);
			},
			shutdown: function(){
				console.log('boot.shutdown');
			}
		},
		loading: {
			init: function(){
				console.log('loading.init');
				this._childs = {};
				
				this._childs.line = game.add.graphics(0, 0);
				this._childs.line.lineStyle(2, 0xffffff, 0.2);
				this._childs.line.moveTo(game.width*0.2, game.height*0.5);
				this._childs.line.lineTo(game.width*0.8, game.height*0.5);
				
				this._childs.line2 = game.add.graphics(0, 0);
				this._childs.line2.lineStyle(2, 0xffffff, 1);
				
				this._childs.text = game.add.text(game.width*0.5, game.height*0.47, '0%');
				this._childs.text.anchor.setTo(0.5, 0.5);
				this._childs.text.align = 'center';
				this._childs.text.fontWeight = 'normal';
				this._childs.text.fontSize = 24;
				this._childs.text.fill = '#fff';
			},
			preload: function(){
				console.log('loading.preload');
				var _this = this;
				game.load.onFileComplete.add(function(p){
					_this._childs.text.text = p+'%';
					_this._childs.line2.moveTo(game.width*0.2, game.height*0.5);
					_this._childs.line2.lineTo(game.width*0.2+(game.width*0.6*p*0.01), game.height*0.5);
				});
				game.load.onLoadComplete.addOnce(function(){
					game.add.tween(game.world).to({alpha:0}, 300, Phaser.Easing.Linear.None, true, 300).onComplete.add(function(){
						game.state.start('home');
					});
				});
				game.load.image('loading', 'img/loading.png');
				game.load.image('bg', 'img/bg.jpg');
				game.load.image('btn', 'img/btn.png');
				game.load.image('food', 'img/food.png');
				game.load.image('title', 'img/title.png');
				game.load.image('snake-head', 'img/snake-head.png');
				game.load.image('snake-body', 'img/snake-body.png');
				
			},
			shutdown: function(){
				game.world.alpha=1;
			}
		},
		home: {
			create: function(){
				console.log('home.create');
				var temp;
				this._childs = {};
				
				this._childs.bg = game.add.tileSprite(0, 0, game.width, game.height, 'bg');
				
				this._childs.title = game.add.sprite(0, 100, 'title');
				this._childs.title.anchor.set(0.5);
				this._childs.title.position.set(game.width*0.5, game.height*0.2);
				
				this._childs.btn = game.add.button(0,0,'btn');
				this._childs.btn.anchor.set(0.5);
				this._childs.btn.position.set(game.width*0.5, game.height*0.75);
				temp = game.add.text(0,0,'START');
				temp.align = 'center';
				temp.fontWeight = 'normal';
				temp.fontSize = 48;
				temp.fill = '#fff';
				temp.anchor.setTo(0.5, 0.45);
				this._childs.btn.addChild(temp);
				this._childs.btn.onInputDown.add(function(el, e){
					el.scale.set(0.97);
					el.getChildAt(0).fill = '#cfc';
				});
				this._childs.btn.onInputUp.add(function(el, e){
					el.scale.set(1);
					el.getChildAt(0).fill = '#fff';
					if(e.timeUp-e.timeDown<500){
						game.add.tween(game.world).to({alpha:0}, 300, Phaser.Easing.Linear.None, true).onComplete.add(function(){
							game.state.start('play');
						});
					}
				});
				game.add.tween(this._childs.title.scale).from({x:5,y:5}, 600, Phaser.Easing.Cubic.In, true);
				game.add.tween(this._childs.title).from({alpha:0, rotation:-Math.PI*2}, 600, Phaser.Easing.Cubic.In, true);
				game.add.tween(this._childs.btn).from({alpha:0,y:'+200'}, 300, Phaser.Easing.Cubic.Out, true, 700);
			},
			update: function(){
				this._childs.bg.tilePosition.y+=1;
			},
			shutdown: function(){
				game.world.alpha=1;
			}
		},
		play: {
			create: function(){
				console.log('play.create');
				var temp, _this=this;
				this._childs = {};
				game.physics.startSystem(Phaser.Physics.ARCADE);
				
				this._childs.bg = game.add.tileSprite(0, 0, game.width, game.height, 'bg');
				
				this._childs.snakeHead = game.add.sprite(0,0,'snake-head');
				this._childs.snakeHead.anchor.set(0.5);
				this._childs.snakeHead.position.set(game.width*0.5, game.height*0.5);
				game.physics.enable(this._childs.snakeHead, Phaser.Physics.ARCADE);
				this._childs.snakeHead.body.allowRotation = false;
				this._childs.snakeHead.body.velocity_speed = 400;
				this._childs.snakeHead.body.velocity.setTo(0, -this._childs.snakeHead.body.velocity_speed);
				
				this._childs.touchLayer = game.add.button(0,0);
				this._childs.touchLayer.width = game.width;
				this._childs.touchLayer.height = game.height;
				this._childs.touchLayer.onInputDown.add(function(el, e){
					var p = new Phaser.Point(e.position.x-_this._childs.snakeHead.x, e.position.y-_this._childs.snakeHead.y);
					p.normalize();
					p.multiply(_this._childs.snakeHead.body.velocity_speed, _this._childs.snakeHead.body.velocity_speed);
					_this._childs.snakeHead.body.velocity.setTo(p.x, p.y);
					_this._childs.snakeHead.rotation = game.physics.arcade.angleToPointer(_this._childs.snakeHead, e)+Math.PI*0.5;
				});
				
			},
			update: function(){
				
				if(!this._childs.snakeHead.inWorld){
					//game.physics.arcade.isPaused = true;
					//game.state.getCurrentState().state.pause();
					game.paused = true;
					console.log('游戏结束')
				}
				
			}
		}
	}
	
	for(var i in game._state){
		game.state.add(i, game._state[i], false);
	}
	game.state.start('boot');
	
	
};


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
