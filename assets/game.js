// START - General Animation and Canvas definitions

	// animation framerate
	var animate = window.requestAnimationFrame ||
	  window.webkitRequestAnimationFrame ||
	  window.mozRequestAnimationFrame ||
	  function(callback) { window.setTimeout(callback, 1000/60) };
	
	// create the canvas
	var canvas = document.createElement('canvas');
	
	// function to get window width
	var width = function getActualWidth() {
	    var actualWidth = window.innerWidth ||
	                      document.documentElement.clientWidth ||
	                      document.body.clientWidth ||
	                      document.body.offsetWidth;
	
	    return actualWidth;
	};
	
	// function to get window height
	var height = function getActualHeight() {
	    var actualHeight = window.innerHeight ||
	                      document.documentElement.clientHeight ||
	                      document.body.clientHeight ||
	                      document.body.offsetHeight;
	
	    return actualHeight;
	};
	
	// define canvas width and height
	canvas.width = width();
	canvas.height = height();
	
	// canvas context for 2D
	var ctx = canvas.getContext('2d');
	
	// create the canvas when window loads and begin animating
	window.onload = function() {
		document.body.appendChild(canvas);
		animate(step);
	};
	
	// game function calls for continuous animation 
	var step = function() {
		update();
		render();
		animate(step);
	};
	
	// define interaction
	var keysDown = {};
	var keysToggle = {};
	
	// when a key is pressed
	window.addEventListener('keydown', function(e) {
		keysDown[e.keyCode] = true;
		isGhostReady(e, keysToggle, this.ghostcounter1);
		
		// prevent ghost toggling memory when ghost counter not counted down
		function isGhostReady(e, keysToggle, ghostcounter1) {
			this.keysToggle[e.keyCode] = this.keysToggle[e.keyCode] !== true && ghostcounter1.ghostCounter.count === 'Press "g"' ? true : false;
		}
	});
	
	// when a key is let go
	window.addEventListener('keyup', function(e) {
		delete keysDown[e.keyCode];
	});

// END - General Animation and Canvas definitions

// START - Game Asset Definitions and Rendering
	
	// define a game paddle
	function Paddle(x, y, width, height, color) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.x_speed = 0;
		this.y_speed = 0;
		this.color = color;
	};
	
	// define a score	
	function Score(x, y, count) {
		this.x = x;
		this.y = y;
		this.count = count;
	};
	
	// define a ghost counter
	function GhostCounter(x, y, count) {
		this.x = x;
		this.y = y;
		this.count = count;
	}
	
	// define a game ball
	function Ball(x, y) {
		this.radius = .01*canvas.width;
		this.x = x;
		this.y = y;
		this.x_speed = Math.random() >= .5 ? .5*this.radius : -.5*this.radius;
		this.y_speed = 0;
		this.score1 = 0;
		this.score2 = 0;
		this.ghostcounter1 = -5;
		this.ghostcounter2 = -5;
	};
	
	// define game assets
	function Player() {
		this.paddle = new Paddle(.98*canvas.width, .4*canvas.height, .01*canvas.width, .2*canvas.height, 'white');
		this.ghost = new Paddle(.5*canvas.width, .4*canvas.height, .01*canvas.width, .2*canvas.height, 'rgba(255, 255, 255, 0)');
	};
	
	function Computer() {
		this.paddle = new Paddle(.01*canvas.width, .4*canvas.height, .01*canvas.width, .2*canvas.height, 'white');
		this.ghost = new Paddle(.49*canvas.width, .4*canvas.height, .01*canvas.width, .2*canvas.height, 'rgba(255, 255, 255, 0)');
	};
	
	function ScoreOne() {
		this.score = new Score(.78*canvas.width, .05*canvas.height, 0);
	};
	
	function ScoreTwo() {
		this.score = new Score(.05*canvas.width, .05*canvas.height, 0);
	};
	
	function GhostCounterOne() {
		this.ghostCounter = new GhostCounter(.85*canvas.width, .05*canvas.height, -5);
	};
	
	function GhostCounterTwo() {
		this.ghostCounter = new GhostCounter(.12*canvas.width, .05*canvas.height, -5);
	};
	
	// add render method to paddle prototype
	Paddle.prototype.render = function() {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	};
	
	// add render method to score prototype
	Score.prototype.render = function() {
		ctx.font = '20px Helvetica';
		ctx.fillStyle = 'rgba(255, 255, 255, .6)';
		ctx.fillText('Score: ' + this.count, this.x, this.y);
	};
	
	// add render method to ghost countdown property
	GhostCounter.prototype.render = function() {
		ctx.font = '20px Helvetica';
		ctx.fillStyle = 'rgba(255, 255, 255, .6)';
		ctx.fillText('Ghost: ' + this.count, this.x, this.y);
	};
	
	// add render method to ball prototype
	Ball.prototype.render = function() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0*Math.PI, 2*Math.PI, false);
		ctx.fillStyle = "white";
		ctx.fill();
	};
	
	// utilize renders for game assets
	Player.prototype.render = function() {
		this.paddle.render();
		this.ghost.render();
	};
	
	Computer.prototype.render = function() {
		this.paddle.render();
		this.ghost.render();
	};
	
	ScoreOne.prototype.render = function() {
		this.score.render();
	};
	
	ScoreTwo.prototype.render = function() {
		this.score.render();
	};
	
	GhostCounterOne.prototype.render = function() {
		this.ghostCounter.render();
	};
	
	GhostCounterTwo.prototype.render = function() {
		this.ghostCounter.render();
	};

// END - Game Asset Definitions and Rendering

// START - Game Asset Update Mechanisms

	// game asset updates
	var update = function() {
		player.update(ball);
		computer.update(ball);
		score1.update(ball);
		score2.update(ball);
		ghostcounter1.update(ball);
		ghostcounter2.update(ball);
		ball.update(player.paddle, computer.paddle, player.ghost, computer.ghost);
	};
	
	// player and ghost position updating / movement
	Player.prototype.update = function(ball) {
		var _this = this;
		var lowercaseG = keysToggle[71];
		
		// switch between player and ghost paddles
		for(var key in keysDown) {
			var value = Number(key);
			if(lowercaseG && ball.ghostcounter1 === 'Press "g"') {
				toggleGhost(value);
			} else {
				togglePlayer(value);
			}
		};
		
		// player paddle active and ghost paddle not active
		function togglePlayer(value) {
			setTimeout(function() {
				_this.ghost.color = 'rgba(255, 255, 255, 0)';
			}, 150);
			if(value == 38) {
				// paddle moves by 10% of paddle height
				_this.paddle.move(0, -(.02*canvas.height));
			} else if(value == 40) {
				_this.paddle.move(0, .02*canvas.height);
			} else {
				_this.paddle.move(0, 0);
			}
		};
		
		// ghost paddle active and player paddle not active
		function toggleGhost(value) {
			_this.ghost.color = 'rgba(255, 255, 255, .4)';
			moveGhost(value);
		};
		
		// ghost paddle movement
		function moveGhost(value) {
			if(value == 38) {
				_this.ghost.move(0, -(.02*canvas.height));
			} else if(value == 40) {
				_this.ghost.move(0, .02*canvas.height);
			} else {
				_this.ghost.move(0, 0);
			}
		};
	};	
	
	// AI 
	Computer.prototype.update = function(ball) {
		var _this = this;		
		
		// switch between paddle and ghost
		activePaddle();
		
		// determine which paddle takes focus
		function activePaddle() {
			// if ghost mode is available
			if(!(this.ball.ghostcounter2 < 0)) {
				// show the ghost
				renderGhost();
				// declare speed and move ghost
				paddleActivation(_this.ghost);	
			// if ghost mode is not available and/or active
			} else {
				// make ghost disappear
				_this.ghost.color = 'rgba(255, 255, 255, 0)';
				// declare speed and move player
				paddleActivation(_this.paddle);
			}
		}
		
		// set AI speed and call movement
		function paddleActivation(paddle) {
			var y_pos = ball.y;
			// regular computer speed vs ghost speed
			var speed = paddle === _this.paddle ? .02 * canvas.height : .04 * canvas.height;
			// take the difference between the center of the paddle and the ball
			var diff = -(paddle.y + paddle.height / 2 - y_pos);
			if(diff < 0 && diff < -speed) { // max speed up
				diff = -speed;
			} else if(diff > 0 && diff > speed) { // max speed down
				diff = speed;
			}
			paddle.move(0, diff);
		}
		
		// show the ghost
		function renderGhost() {
			_this.ghost.color = 'rgba(255, 255, 255, .4)';
		}
	};
	
	// paddle movement
	Paddle.prototype.move = function(x, y) {
	  	this.x += x;
		this.y += y;
		this.x_speed = x;
		this.y_speed = y;
		if(this.y < 0) {
			// paddle moves off screen to the top
			this.y = 0;
			this.y_speed = 0;
		} else if(this.y + this.height > canvas.height) {
			// paddle moves off screen to the bottom
			this.y = canvas.height - this.height;
			this.y_speed = 0;
		}
	};
	
	// player score updating - computer scores a point
	ScoreOne.prototype.update = function(ball) {
		this.score.count = ball.score1;
	};
	
	// computer score updating - player scores a point
	ScoreTwo.prototype.update = function(ball) {
		this.score.count = ball.score2;
	};
	
	// ghost toggle counter for player
	GhostCounterOne.prototype.update = function(ball) {
		this.ghostCounter.count = ball.ghostcounter1;	
	};
	
	// ghost toggle countdown for computer
	GhostCounterTwo.prototype.update = function(ball) {
		this.ghostCounter.count = ball.ghostcounter2;
	};
	
	// ball position updating / movement
	Ball.prototype.update = function(paddle1, paddle2, ghost1, ghost2) {
		var _this = this;
		this.x += this.x_speed;
		this.y += this.y_speed;
		// ball definition
		var top_x = this.x - this.radius;
		var top_y = this.y - this.radius;
		var bottom_x = this.x + this.radius;
		var bottom_y = this.y + this.radius;
		
		// verical boundaries
		if(this.y - this.radius < 0) { // hitting the top wall
		  bounceBackDown();
		} else if(this.y + this.radius > height()) { // hitting the bottom wall
		  bounceBackUp();
		}
		
		// hitting the paddles
		  // if the ghost is active and ball in range of ghost
		if(top_x > (canvas.width / 2) && ghost1.color === 'rgba(255, 255, 255, .4)') {
			if(top_x < (ghost1.x + ghost1.width) && bottom_x > ghost1.x && top_y < (ghost1.y + ghost1.height) && bottom_y > (ghost1.y)) {
				// hitting ghost paddle right of screen
				playerPaddleHitBall(ghost1);
				setTimeout(function() {
					ghost1.color = 'rgba(255, 255, 255, 0)';
				}, 150);
				this.ghostcounter1 = -5;
				keysToggle[71] = false;
			}
		  // if the ghost is not active and ball in range of player
		} else if(top_x > (canvas.width / 2) && ghost1.color !== 'rgba(255, 255, 255, .4)') {
			if(top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x && top_y < (paddle1.y + paddle1.height) && bottom_y > (paddle1.y)) {
				// hitting player paddle right of screen
				playerPaddleHitBall(paddle1);
				ghostCounterOneCountDown();
			}
		  // if ball in range of computer
		} else if(bottom_x > (canvas.width / 2) && this.x_speed < 0 && ghost2.color === 'rgba(255, 255, 255, .4)') {
			if(bottom_x > (ghost2.x + ghost2.width) && top_x < (ghost2.x + ghost2.width) && top_y < (ghost2.y + ghost2.height) && bottom_y > (ghost2.y)) {
				computerPaddleHitBall(ghost2);
				setTimeout(function() {
					ghost2.color = 'rgba(255, 255, 255, 0)';
				}, 150);
				this.ghostcounter2 = -5;
			}
		} else if(bottom_x < (canvas.width / 2) && ghost2.color !== 'rgba(255, 255, 255, .4)') {
			if(bottom_x > (paddle2.x + paddle2.width) && top_x < (paddle2.x + paddle2.width) && top_y < (paddle2.y + paddle2.height) && bottom_y > (paddle2.y)) {
				// hitting computer paddle left of screen
				computerPaddleHitBall(paddle2);
				ghostCounterTwoCountDown();
			}
		}

		
		// reset and scoring
		if(this.x < 0 || this. x > width()) { // point was scored	
		  if(this.x < 0) {
			  // player scores
			  this.score1 += 1;
			  // player ghost counter is reset
			  this.ghostcounter1 = -5;
		  } else if(this.x > canvas.width) {
			  //computer scores
			  this.score2 += 1;
			  // computer ghost counter is reset
			  this.ghostcounter2 = -5;
		  }
		  // reset - randomize starting ball direction
		  this.x_speed = Math.random() >= .5 ? .5*this.radius : -.5*this.radius;
		  // reset game parameters
		  this.y_speed = 0;
		  this.x = canvas.width/2 - .01*canvas.width;
		  this.y = canvas.height/2 - .01*canvas.width;
		}
		
		// ball bounce off top wall
		function bounceBackDown() {
			_this.y = _this.radius;
		  	_this.y_speed = -_this.y_speed;	
		}
		
		// ball bounce off bottom wall
		function bounceBackUp() {
		  _this.y = this.height() - _this.radius;
		  _this.y_speed = -_this.y_speed;
		}
		
		// ball movement after hitting player paddles
		function playerPaddleHitBall(paddle) {
			_this.x_speed = -_this.radius;
			_this.y_speed += (paddle.y_speed/6);
			_this.x += _this.x_speed;
		}
		
		// ball movement after hitting computer paddle
		function computerPaddleHitBall(paddle) {
			_this.x_speed = _this.radius;
			_this.y_speed += (paddle.y_speed/6);
			_this.x += _this.x_speed;
		}
		
		// ghost counter countdown for the player after ball is hit
		function ghostCounterOneCountDown() {
			if(_this.ghostcounter1 === -1) {
				_this.ghostcounter1 = 'Press "g"';
			} else if(_this.ghostcounter1 < 0) {
				_this.ghostcounter1 += 1;
			} 
		}
		
		// ghost counter countdown for the computer after ball is hit
		function ghostCounterTwoCountDown() {
			if(_this.ghostcounter2 === -1) {
				_this.ghostcounter2 = 'AI - random';
			} else if(_this.ghostcounter2 < 0) {
				_this.ghostcounter2 += 1;
			} 
		}
	};

// END - Game Asset Update Mechanisms

// START - Initialization
	
	// game asset calls
	var player = new Player();
	var computer = new Computer();
	var score1 = new ScoreOne();
	var score2 = new ScoreTwo();
	var ghostcounter1 = new GhostCounterOne();
	var ghostcounter2 = new GhostCounterTwo();
	var ball = new Ball((canvas.width/2 - .01*canvas.width), (canvas.height/2 - .01*canvas.width));
	
	// render the board and the game assets
	var render = function() {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, width(), height());
		player.render();
		computer.render();
		ball.render();
		score1.render();
		score2.render();
		ghostcounter1.render();
		ghostcounter2.render();
	};

// END - Initialization