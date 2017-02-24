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
				//进度条背景
				this._childs.line = game.add.graphics(0, 0);
				this._childs.line.lineStyle(2, 0xffffff, 0.2);
				this._childs.line.moveTo(game.width*0.2, game.height*0.5);
				this._childs.line.lineTo(game.width*0.8, game.height*0.5);
				//进度条
				this._childs.line2 = game.add.graphics(0, 0);
				this._childs.line2.lineStyle(2, 0xffffff, 1);
				//进度文字
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
					game.add.tween(game.world).to({alpha:0}, 300, Phaser.Easing.Linear.None, true, 300).onComplete.addOnce(function(){
						game.state.start('home');
					});
				});
				game.load.image('loading', 'img/loading.png');
				game.load.image('bg', 'img/bg.jpg');
				game.load.image('btn', 'img/btn.png');
				game.load.spritesheet('food', 'img/food.png', 32, 32, 3);
				game.load.image('title', 'img/title.png');
				game.load.image('snake-head', 'img/snake-head.png');
				game.load.image('snake-body', 'img/snake-body.png');
				game.load.spritesheet('result', 'img/result.png', 32, 32, 3);
				game.load.audio('fx', 'sound/fx.mp3');
				game.load.audio('bg', 'sound/bg.mp3');
			},
			create: function(){
				app.sound = {};
				app.sound.fx = game.add.audio('fx');
				app.sound.fx.allowMultiple = true;
				app.sound.fx.addMarker('btn', 1, 0.3);
				app.sound.fx.addMarker('food0', 2, 0.9);
				app.sound.fx.addMarker('food1', 4, 0.5);
				app.sound.fx.addMarker('die', 5, 2.6);
				app.sound.fx.addMarker('title', 9, 2);
				
				app.sound.bg = game.add.audio('bg');
				app.sound.bg.loopFull(0.5);
			},
			shutdown: function(){
				game.world.alpha=1;
			}
		},
		home: {
			init: function(data){
				this._result = data;
			},
			create: function(){
				console.log('home.create');
				var temp, _this = this;
				this._childs = {};
				//背景
				this._childs.bg = game.add.tileSprite(0, 0, game.width, game.height, 'bg');
				//标题
				this._childs.title = game.add.sprite(0, 100, 'title');
				this._childs.title.anchor.set(0.5);
				this._childs.title.position.set(game.width*0.5, game.height*0.2);
				//按钮
				this._childs.btn = game.add.button(0,0,'btn');
				this._childs.btn.anchor.set(0.5);
				this._childs.btn.position.set(game.width*0.5, this._result?game.height*0.85:game.height*0.75);
				temp = game.add.text(0,0, this._result?'再玩一次':'开始游戏');
				temp.align = 'center';
				temp.font = 'arial';
				temp.fontWeight = 'normal';
				temp.fontSize = 48;
				temp.fill = '#fff';
				temp.anchor.setTo(0.5, 0.45);
				this._childs.btn.addChild(temp);
				this._childs.btn.onInputDown.add(function(el, e){
					el.scale.set(0.97);
					el.getChildAt(0).fill = '#cfc';
					app.sound.fx.play('btn');
				});
				this._childs.btn.onInputUp.add(function(el, e){
					el.scale.set(1);
					el.getChildAt(0).fill = '#fff';
					if(e.timeUp-e.timeDown<500){
						game.add.tween(game.world).to({alpha:0}, 300, Phaser.Easing.Linear.None, true).onComplete.addOnce(function(){
							game.state.start('play');
						});
					}
				});
				//动画
				game.add.tween(this._childs.title.scale).from({x:5,y:5}, 600, Phaser.Easing.Cubic.In, true);
				game.add.tween(this._childs.title).from({alpha:0, rotation:-Math.PI*2}, 600, Phaser.Easing.Cubic.In, true);
				game.add.tween(this._childs.btn).from({alpha:0,y:'+200'}, 300, Phaser.Easing.Cubic.Out, true, 700);
				app.sound.fx.play('title');
				//成绩
				if(this._result){
					this._childs.point = game.add.text(0,0,'0');
					this._childs.point.align = 'center';
					this._childs.point.fontSize = 72;
					this._childs.point.fill = '#fff';
					this._childs.point.anchor.set(0.5);
					this._childs.point.position.set(game.width*0.5, this._childs.title.y+200);
					this._childs.point_line = game.add.graphics(game.width*0.5, this._childs.point.y+60);
					this._childs.point_line.lineStyle(3, 0xffffff, 0.75);
					this._childs.point_line.moveTo(-game.width*0.3, 0);
					this._childs.point_line.lineTo(game.width*0.3, 0);
					for(var i=1; i<=3; i++){
						temp = game.add.text(game.width*0.42, this._childs.point_line.y-10+i*50, ' ');
						temp.font = 'arial';
						temp.fontSize = 30;
						temp.fill = '#fff';
						temp.fontWeight = 'normal';
						temp.addChild(game.add.image(-50, 0, 'result', i-1));
						this._childs['point'+i] = temp;
					}
					this._childs.point1.text = '身长 '+this._result.size+'米';
					this._childs.point2.text = '吃掉 '+this._result.food+'个';
					this._childs.point3.text = '用时 '+this._result.time+'秒';
					game.add.tween(this._childs.point_line.scale).from({x:0}, 300, Phaser.Easing.Cubic.Out, true, 1000);
					game.add.tween(this._childs.point).from({y:'+50', alpha:0}, 300, Phaser.Easing.Cubic.Out, true, 1200);
					game.add.tween(this._childs.point1).from({y:'-50', alpha:0}, 300, Phaser.Easing.Cubic.Out, true, 1500);
					game.add.tween(this._childs.point2).from({y:'-50', alpha:0}, 300, Phaser.Easing.Cubic.Out, true, 1750);
					game.add.tween(this._childs.point3).from({y:'-50', alpha:0}, 300, Phaser.Easing.Cubic.Out, true, 2000);
					game.add.tween(this._result).from({point:0}, 1000, Phaser.Easing.Linear.None, true, 1400).onUpdateCallback(function(tween, percent, tweenData){
						_this._childs.point.text = Math.floor(tween.target.point);
					}).onComplete.addOnce(function(){
						_this._childs.point.text = _this._result.point;
					});
				}
				
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
				var _this=this, temp;
				this._childs = {};
				this._gdata = {
					is_end: false,
					time_begin: game.time.now,
					food_get: 0,
					snake_speed: 400,
					snake_path: []
				}
				game.physics.startSystem(Phaser.Physics.ARCADE);
				//背景
				this._childs.bg = game.add.tileSprite(0, 0, game.width, game.height, 'bg');
				//食物
				this._childs.foods = game.add.group(undefined, 'foods');
				this._childs.foods.enableBody = true;
    			this._childs.foods.physicsBodyType = Phaser.Physics.ARCADE;
				function addFood(){
					if(_this._gdata.is_end || _this._childs.foods.length>10){ return; }
					var type = game.rnd.frac()>0.3 ? 0 : (game.rnd.frac()>0.4 ? 1 : 2);
					var temp = _this._childs.foods.create(game.rnd.between(20, game.width-20), game.rnd.between(20, game.height-20), 'food', type);
					temp.name = 'foot'+type;
					temp.anchor.set(0.5);
					temp.body.enable = false;
					game.add.tween(temp.scale).from({x:0, y:0}, 200, Phaser.Easing.Linear.None, true).onComplete.addOnce(function(){
						if(_this._gdata.is_end){ return; }
						temp = 0.7;
						this.body.setSize(this.width*temp, this.height*temp, this.width*(1-temp)*0.5, this.height*(1-temp)*0.5);
						this.body.enable = true;
						game.time.events.add(Math.floor(Math.random()*1000)+1000, addFood);
					}, temp);
					if(type>0){
						game.add.tween(temp).to({alpha:0}, 200, Phaser.Easing.Linear.None, true, 4000).onComplete.addOnce(function(e){
							e.parent.remove(e, true);
						});
					}
				}
				game.time.events.add(800, addFood);
				//蛇头
				this._childs.snakeHead = game.add.sprite(0,0,'snake-head');
				this._childs.snakeHead.anchor.set(0.5);
				this._childs.snakeHead.position.set(game.width*0.5, game.height);
				game.physics.arcade.enableBody(this._childs.snakeHead);
				temp = 0.6;
				this._childs.snakeHead.body.setSize(this._childs.snakeHead.width*temp, this._childs.snakeHead.height*temp, this._childs.snakeHead.width*(1-temp)*0.5, this._childs.snakeHead.height*(1-temp)*0.5);
				this._childs.snakeHead.body.allowRotation = false;
				this._childs.snakeHead.body.velocity.setTo(0, -this._gdata.snake_speed);
				//蛇身
				this._childs.snakeBody = game.add.group(undefined, 'snakeBody');
				for(var i=0;i<3;i++){
					temp = game.add.image(0,0,'snake-body',0,this._childs.snakeBody);
					temp.anchor.set(0.5);
					temp.position.set(this._childs.snakeHead.x, this._childs.snakeHead.y);
					temp.angle_fix = temp.angle = Math.random()*360;
				}
				game.world.swapChildren(this._childs.snakeHead, this._childs.snakeBody);
				//交互层
				this._childs.touchLayer = game.add.button(0,0);
				this._childs.touchLayer.width = game.width;
				this._childs.touchLayer.height = game.height;
				this._childs.touchLayer.onInputDown.add(function(el, e){
					if(_this._gdata.is_end){ return; }
					var p = new Phaser.Point(e.position.x-_this._childs.snakeHead.x, e.position.y-_this._childs.snakeHead.y);
					p.normalize();
					p.multiply(_this._gdata.snake_speed, _this._gdata.snake_speed);
					_this._gdata.snake_speed+=1;
					_this._childs.snakeHead.body.velocity.setTo(p.x, p.y);
					_this._childs.snakeHead.rotation = game.physics.arcade.angleToPointer(_this._childs.snakeHead, e)+Math.PI*0.5;
				});
				//游戏结束
				this._endAction = function(){
					game.physics.arcade.isPaused = true;
					game.state.getCurrentState().state.pause();
					game.add.tween(game.world).to({alpha:0}, 300, Phaser.Easing.Linear.None, true, 1500).onComplete.addOnce(function(){
						var result = { 
							point: 0,
							size: ((_this._childs.snakeBody.length+1)*0.1).toFixed(1)*1, 
							time: ((game.time.now-_this._gdata.time_begin)*0.001).toFixed(1)*1, 
							food: _this._gdata.food_get
						};
						result.point = Math.ceil(result.size*100+result.time*2+result.food*25); 
						game.world.remove(_this._childs.foods, true);
						game.world.remove(_this._childs.snakeHead, true);
						game.world.remove(_this._childs.snakeBody, true);
						game.state.start('home', false, false, result);
					});
					app.sound.fx.play('die');
				}
			},
			update: function(){
				var _this = this;
				if(this._gdata.is_end){ return; }
				//出界
				if(!this._childs.snakeHead.inWorld){
					_this._gdata.is_end = true;
					_this._endAction();
					return;
				}
				//吃食
				game.physics.arcade.overlap(this._childs.snakeHead, this._childs.foods, function(a, b){
					var temp, data;
					if(b.name == 'foot0'){ //蛇身增长
						temp = game.add.image(0,0,'snake-body',0, _this._childs.snakeBody);
						data = _this._gdata.snake_path[temp.z*3+3] || {x:-999, y:-999};
						temp.anchor.set(0.5);
						temp.position.set(data.x, data.y);
						temp.angle_fix = temp.angle = Math.random()*360;
						_this._gdata.food_get += 1;
						app.sound.fx.play('food0');
					}else if(b.name == 'foot1'){ //蛇身减少
						if(_this._childs.snakeBody.length>1){
							_this._childs.snakeBody.remove(_this._childs.snakeBody.getBottom(), true);
						}
						app.sound.fx.play('food1');
					}else if(b.name == 'foot2'){ //中毒死亡
						_this._gdata.is_end = true;
						_this._endAction();
					}
					b.parent.remove(b, true);
				});
				//更新蛇身
				this._gdata.snake_path.unshift({x: this._childs.snakeHead.x, y:this._childs.snakeHead.y, a:this._childs.snakeHead.angle});
				if(this._gdata.snake_path.length>300){ this._gdata.snake_path.pop(); }
				this._childs.snakeBody.forEachExists(function(child){
					var data = _this._gdata.snake_path[child.z*3+3];
					if(!data){ return; }
					child.position.set(data.x, data.y);
					child.angle=data.angle+data.angle_fix;
				});
			},
			shutdown: function(){
				game.world.alpha=1;
			}
		}
	}
	
	for(var i in game._state){
		game.state.add(i, game._state[i], false);
	}
	game.state.start('boot');
	
	
};
