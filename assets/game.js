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
		keysToggle[e.keyCode] = keysToggle[e.keyCode] == true ? false : true;
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
		this.count = 0;
	};
	
	// define a game ball
	function Ball(x, y) {
		this.radius = .01*canvas.width;
		this.x = x;
		this.y = y;
		this.x_speed = Math.random() >= .5 ? .5*this.radius : -.5*this.radius;
		this.y_speed = 0;
		this.score1 = 0;
		this.score2 = 0;
	};
	
	// define game assets
	function Player() {
		this.paddle = new Paddle(.98*canvas.width, .4*canvas.height, .01*canvas.width, .2*canvas.height, 'white');
		this.ghost = new Paddle(.5*canvas.width, .4*canvas.height, .01*canvas.width, .2*canvas.height, 'rgba(255, 255, 255, 0)');
	};
	
	function Computer() {
		this.paddle = new Paddle(.01*canvas.width, .4*canvas.height, .01*canvas.width, .2*canvas.height, 'white');
	};
	
	function ScoreOne() {
		this.score = new Score(.83*canvas.width, .05*canvas.height, 0);
	};
	
	function ScoreTwo() {
		this.score = new Score(.05*canvas.width, .05*canvas.height, 0);
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
		this.paddle.render('white');
	};
	
	ScoreOne.prototype.render = function() {
		this.score.render();
	};
	
	ScoreTwo.prototype.render = function() {
		this.score.render();
	};

// END - Game Asset Definitions and Rendering

// START - Game Asset Update Mechanisms

	// game asset updates
	var update = function() {
		player.update();
		computer.update(ball);
		scoreone.update(ball);
		scoretwo.update(ball);
		ball.update(player.paddle, computer.paddle, player.ghost);
	};
	
	// player position updating / movement
	Player.prototype.update = function() {
		var _this = this;
		var lowercaseG = keysToggle[71];
		
		for(var key in keysDown) {
			var value = Number(key);
			if(lowercaseG) {
				toggleGhost(value);
			} else {
				togglePlayer(value);
			}
		};
		
		function togglePlayer(value) {
			_this.ghost.color = 'rgba(255, 255, 255, 0)';
			if(value == 38) {
				// paddle moves by 10% of paddle height
				_this.paddle.move(0, -(.02*canvas.height));
			} else if(value == 40) {
				_this.paddle.move(0, .02*canvas.height);
			} else {
				_this.paddle.move(0, 0);
			}
		};
		
		function toggleGhost(value) {
			_this.ghost.color = 'rgba(255, 255, 255, .4)';
			moveGhost(value);
		};
		
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
		// take the position of ball top
		var y_pos = ball.y + ball.radius;
		// take the difference between the center of the paddle and the ball
		var diff = -(this.paddle.y + this.paddle.height / 2 - y_pos);
		// limit AI paddle speed
		if(diff < 0 && diff < -.02*canvas.height) { // max speed up
			diff = -.02*canvas.height;
		} else if(diff > 0 && diff > .02*canvas.height) { // max speed down
			diff = .02*canvas.height;
		}
		// move the paddle so its center aligns with the center of the ball
		this.paddle.move(0, diff);
		// computer paddle goes off screen to top
		if(this.paddle.y < 0) {
			this.paddle.y = 0;
		// computer paddle goes off screen to bottom
		} else if(this.paddle.y > canvas.height) {
			this.paddle.y = canvas.height - this.height;
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
	
	// ball position updating / movement
	Ball.prototype.update = function(paddle1, paddle2, ghost) {
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
		  this.y = this.radius;
		  this.y_speed = -this.y_speed;	
		} else if(this.y + this.radius > height()) { // hitting the bottom wall
		  this.y = height() - this.radius;
		  this.y_speed = -this.y_speed;
		}
		
		// hitting the paddles
		  // if the ghost is active and ball in range of player
		if((top_x > (canvas.width / 2)) && ghost.color == 'rgba(255, 255, 255, .4)') {
			if(top_x < (ghost.x + ghost.width) && bottom_x > ghost.x && top_y < (ghost.y + ghost.height) && bottom_y > (ghost.y)) {
				// hitting ghost paddle right of screen
				playerPaddleHitBall(ghost);
			}
		  // if the ghost is not active and ball in range of player
		} else if(top_x > (canvas.width / 2)) {
			if(top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x && top_y < (paddle1.y + paddle1.height) && bottom_y > (paddle1.y)) {
				// hitting player paddle right of screen
				playerPaddleHitBall(paddle1);
			}
		  // if ball in range of computer
		} else {
			if(bottom_x > (paddle2.x + paddle2.width) && top_x < (paddle2.x + paddle2.width) && top_y < (paddle2.y + paddle2.height) && bottom_y > (paddle2.y)) {
				// hitting computer paddle left of screen
				computerPaddleHitBall();
			}
		}
		
		// reset and scoring
		if(this.x < 0 || this. x > width()) { // point was scored
		  if(this.x < 0) {
			  // player scores
			  this.score1 += 1;
		  } else if(this.x > canvas.width) {
			  //computer scores
			  this.score2 += 1;
		  }
		  // reset - randomize starting ball direction
		  this.x_speed = Math.random() >= .5 ? .5*this.radius : -.5*this.radius;
		  // reset game parameters
		  this.y_speed = 0;
		  this.x = canvas.width/2 - .01*canvas.width;
		  this.y = canvas.height/2 - .01*canvas.width;
		}
		
		// ball movement after hitting player paddles
		function playerPaddleHitBall(paddle) {
			_this.x_speed = -_this.radius;
			_this.y_speed += (paddle.y_speed/6);
			_this.x += _this.x_speed;
		}
		
		// ball movement after hitting computer paddle
		function computerPaddleHitBall() {
			_this.x_speed = _this.radius;
			_this.y_speed += (paddle2.y_speed/6);
			_this.x += _this.x_speed;
		}
	};

// END - Game Asset Update Mechanisms

// START - Initialization
	
	// game asset calls
	var player = new Player();
	var computer = new Computer();
	var scoreone = new ScoreOne();
	var scoretwo = new ScoreTwo();
	var ball = new Ball((canvas.width/2 - .01*canvas.width), (canvas.height/2 - .01*canvas.width));
	
	// render the board and the game assets
	var render = function() {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, width(), height());
		player.render();
		computer.render();
		ball.render();
		scoreone.render();
		scoretwo.render();
	};

// END - Initialization