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
		keysToggle[e.keyCode] = keysToggle[e.keyCode] == false ? true : false;
	});
	
	// when a key is let go
	window.addEventListener('keyup', function(e) {
		delete keysDown[e.keyCode];
	});

// END - General Animation and Canvas definitions

// START - Game Asset Definitions and Rendering

	// scoring and ghost counter text
	
	
	// define a game paddle
	function Paddle(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.x_speed = 0;
		this.y_speed = 0;
	};
	
	function Score(x, y, count) {
		this.x = x;
		this.y = y;
		this.count = 0;
	};
	
	// define player and computer paddles
	function Player() {
		this.paddle = new Paddle(.98*canvas.width, .4*canvas.height, .01*canvas.width, .2*canvas.height);
	};
	
	function Computer() {
		this.paddle = new Paddle(.01*canvas.width, .4*canvas.height, .01*canvas.width, .2*canvas.height);
	};
	
	function Ghost() {
		this.paddle = new Paddle(.495*canvas.width, .4*canvas.height, .01*canvas.width, .2*canvas.height);
	};
	
	function ScoreOne() {
		this.score = new Score(.83*canvas.width, .05*canvas.height, 0);
	};
	
	function ScoreTwo() {
		this.score = new Score(.05*canvas.width, .05*canvas.height, 0);
	};
	
	// add render method to paddle prototype
	Paddle.prototype.render = function(color) {
		ctx.fillStyle = color;
		ctx.fillRect(this.x, this.y, this.width, this.height);
	};
	
	// add render methods to player and computer prototypes which render paddles
	Player.prototype.render = function() {
		this.paddle.render('white');
	};
	
	Computer.prototype.render = function() {
		this.paddle.render('white');
	};
	
	Ghost.prototype.render = function() {
		this.paddle.render('rgba(255, 255, 255, .2)');
	};
	
	Score.prototype.render = function() {
		ctx.font = '20px Helvetica';
		ctx.fillStyle = 'rgba(255, 255, 255, .6)';
		ctx.fillText('Score: ' + this.count, this.x, this.y);
	};
	
	ScoreOne.prototype.render = function() {
		this.score.render();
	};
	
	ScoreTwo.prototype.render = function() {
		this.score.render();
	};

	// define game ball
	function Ball(x, y) {
		this.radius = .02*canvas.height;
		this.x = x;
		this.y = y;
		this.x_speed = Math.random() >= .5 ? .5*this.radius : -.5*this.radius;
		this.y_speed = 0;
		this.score1 = 0;
		this.score2 = 0;
	};
	
	// add render method to ball prototype
	Ball.prototype.render = function() {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0*Math.PI, 2*Math.PI, false);
		ctx.fillStyle = "white";
		ctx.fill();
	};

// END - Game Asset Definitions and Rendering

// START - Game Asset Update Mechanisms

	// game asset updates
	var update = function() {
		player.update();
		computer.update(ball);
		ghost.update();
		scoreone.update(ball);
		scoretwo.update(ball);
		ball.update(player.paddle, computer.paddle);
	};
	
	// player position updating / movement
	Player.prototype.update = function() {
		for(var key in keysDown) {
			var value = Number(key);
			// up arrow
			if(value == 38) {
				// paddle moves by 10% of paddle height
				this.paddle.move(0, -(.02*canvas.height));
			// down arrow
			} else if(value == 40) {
				this.paddle.move(0, .02*canvas.height);
			} else {
				this.paddle.move(0, 0);
			}
		}
	};	

	Ghost.prototype.update = function() {
		for(var key in keysToggle) {
			var value = Number(key);
			if(value == 71) {
				
			}
		}
	};
	
	// AI 
	Computer.prototype.update = function(ball) {
		// take the position of ball top
		var y_pos = ball.y;
		// take the difference between the center of the paddle and the ball
		var diff = -((this.paddle.y + (this.paddle.height / 2)) - y_pos);
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
	Ball.prototype.update = function(paddle1, paddle2) {
		this.x += this.x_speed;
		this.y += this.y_speed;
		// ball definition
		var top_x = this.x - this.radius;
		var top_y = this.y - this.radius;
		var bottom_x = this.x + this.radius;
		var bottom_y = this.y + this.radius;
	
		if(this.y - this.radius < 0) { // hitting the top wall
		  this.y = this.radius;
		  this.y_speed = -this.y_speed;	
		} else if(this.y + this.radius > height()) { // hitting the bottom wall
		  this.y = height() - this.radius;
		  this.y_speed = -this.y_speed;
		}
		
		if(this.x < 0 || this. x > width()) { // point was scored
		  if(this.x < 0) {
			  // player scores
			  this.score2 += 2;
		  } else if(this.x > canvas.width) {
			  //computer scores
			  this.score1 += 1;
		  }
		  console.log(this.score1);
		  // randomize starting ball direction
		  this.x_speed = Math.random() >= .5 ? .5*this.radius : -.5*this.radius;
		  // restore default game parameters
		  this.y_speed = 0;
		  this.x = canvas.width/2 - this.radius;
		  this.y = canvas.height/2 - this.radius;
		}
		
		if(top_x > (canvas.width / 2)) {
			if(top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x && top_y < (paddle1.y + paddle1.height) && bottom_y > (paddle1.y)) {
				// hitting player paddle right of screen
				this.x_speed = -this.radius;
				this.y_speed += (paddle1.y_speed/6);
				this.x += this.x_speed;
			}
		} else {
			if(bottom_x > (paddle2.x + paddle2.width) && top_x < (paddle2.x + paddle2.width) && top_y < (paddle2.y + paddle2.height) && bottom_y > (paddle2.y)) {
				// hitting computer paddle left of screen
				this.x_speed = this.radius;
				this.y_speed += (paddle2.y_speed/6);
				this.x += this.x_speed;
			}
		}
	};

// END - Game Asset Update Mechanisms

// START - Initialization
	
	// game asset calls
	var player = new Player();
	var computer = new Computer();
	var ghost = new Ghost();
	var scoreone = new ScoreOne();
	var scoretwo = new ScoreTwo();
	var ball = new Ball((canvas.width/2 - .01*canvas.height), (canvas.height/2 - .01*canvas.height));
	
	// render the board and the game assets
	var render = function() {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, width(), height());
		player.render();
		computer.render();
		ball.render();
		ghost.render();
		scoreone.render();
		scoretwo.render();
	};

// END - Initialization