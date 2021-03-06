canvas.width = document.body.offsetWidth;
canvas.height = document.body.offsetHeight;
var ctx = canvas.getContext("2d");

var BRICK_WIDTH = 40;
var BRICK_HEIGHT = 20;
var FALLING_BRICKS_COUNT = 9;
var COLORS = ["#fff", "#f0f", "#00f", "#0f0", "#f00"];
var START_POINTS = 50;
var BONUS_POINTS = 10;
var PENALTY_POINTS = -5;
var GAME_OVER = "Game Over !!!";

var points;
var falling;
var catcher;
var startTime = Date.now();
var lastDificultyChangeTime = Date.now();
var anymationFrameId;
var isRunning;

function startGame() {
  points = START_POINTS;
  falling = new fallingBricks(FALLING_BRICKS_COUNT);
  catcher = catcherBrick();
  startTime = Date.now();
  document.getElementById('startButton').textContent = 'Restart';
  resumeGame();
  gameLoop();
}

function gameLoop() {
  window.cancelAnimationFrame(anymationFrameId);
  if(isRunning) {
    var currentScore = getCurrentScore();
    var difficultyTimer = getDifficultyTimer();
    falling.move();
    draw(currentScore);
    // TODO: Make this smarter.
    if (Date.now() - lastDificultyChangeTime  > 10000) {
      falling.addOne();
      lastDificultyChangeTime = Date.now();
    }
    if (points > 0) {
      resumeGame();
    } else {
      gameOver("Score: " + currentScore);
    }
  }
  anymationFrameId = window.requestAnimationFrame(gameLoop);
}

function resumeGame() {
  isRunning = true;
}

function pauseGame() {
  isRunning = false;
}

function pauseResumeGame() {
  if (isRunning) {
    pauseGame();
  } else {
    resumeGame();
  }
  document.getElementById('pauseResumeButton').textContent = isRunning ?  'Pause' : 'Resume';
}

function fallingBrick () {
  return new brick(
    Math.random() * (canvas.width - BRICK_WIDTH),
    0,
    COLORS[Math.ceil(Math.random() * COLORS.length) - 1],
    0,
    Math.ceil(3 + Math.random() * 9)/3.5);
}

function catcherBrick () {
  return new brick(
    (canvas.width - BRICK_WIDTH) / 2,
    canvas.height - BRICK_HEIGHT,
    "#f00",
    0,
    0);
}

function brick (x, y, c, dx, dy) {
  this.x = x;
  this.y = y;
  this.c = c;
  this.dx = dx;
  this.dy = dy;
  this.move = () => this.moveBy(this.dx, this.dy);
  this.moveBy = (dx, dy) => {
    this.x += dx;
    this.y += dy;
    this.x = Math.min(canvas.width - BRICK_WIDTH,
                      Math.max(0, this.x ));
    this.isOffScreen = this.y > canvas.height;
  };
  this.draw = () => {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.fillRect(this.x, this.y, BRICK_WIDTH, BRICK_HEIGHT);
    /* 3D look on bricks */
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();
    ctx.moveTo(this.x + 1, this.y + BRICK_HEIGHT - 1);
    ctx.lineTo(this.x + 1, this.y + 1);
    ctx.lineTo(this.x + BRICK_WIDTH - 1, this.y + 1);
    ctx.stroke();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.7)";
    ctx.beginPath();
    ctx.moveTo(this.x + BRICK_WIDTH - 1, this.y + 1);
    ctx.lineTo(this.x + BRICK_WIDTH - 1, this.y + BRICK_HEIGHT - 1);
    ctx.lineTo(this.x + 1, this.y + BRICK_HEIGHT - 1);
    ctx.stroke();
  };
  this.isHit = another => Math.abs(this.x - another.x) < BRICK_WIDTH &&
    Math.abs(this.y - another.y) < BRICK_HEIGHT;
}

function fallingBricks(count) {
  this.bricks = [];
  for(var i = 0; i < count; i++) {
    this.bricks[i] = new fallingBrick();
  }
  this.move = () => {
    for(var i = 0; i < this.bricks.length; i++) {
      var b = this.bricks[i];
      b.move();
      if (b.isHit(catcher)) {
        points += b.c == catcher.c ? BONUS_POINTS : PENALTY_POINTS;
        this.bricks[i] = fallingBrick();
      } else if (b.isOffScreen) {
        this.bricks[i] = fallingBrick();
        points += b.c == catcher.c ? 2 * PENALTY_POINTS : 0;
      }
    }
  };
  this.draw = () => {
    for(var i = 0; i < this.bricks.length; i++) {
      this.bricks[i].draw();
    }
  };
  this.addOne = () => {
    this.bricks.push(fallingBrick());
  };
}

function getCurrentScore() {
  return Math.floor((Date.now() - startTime)/1000);
}
function getDifficultyTimer() {
  return Math.floor((Date.now() - startTime)/1000);
}

function draw(currentScore) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  falling.move();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  falling.draw();
  catcher.draw();
  document.getElementById('points').textContent = 'Points: ' + points;
  document.getElementById('startTime').textContent = 'Score: ' + currentScore;
}

function gameOver(currentScore) {
  pauseGame();
  var base = 100;
  ctx.font = base + "px san serif";
  ctx.fillStyle = '#00C9FF';
  ctx.textBaseline = "middle";
  var mesure = ctx.measureText(GAME_OVER);
  var maxWidth = canvas.width - 20;
  var size = maxWidth / mesure.width * base;
  ctx.font="100px san serif";
  ctx.fillStyle = '#00FF11';
  ctx.fillText(currentScore, canvas.width / 2 - 200, canvas.height / 2 - size / 3 + 165);
  ctx.fillStyle = '#00C9FF';
  ctx.font = size + "px san serif";
  ctx.fillText(GAME_OVER, canvas.width / 2 - maxWidth / 2, canvas.height / 2 + size / 3 - 170);
}

document.addEventListener('keydown', e => {
  switch (e.keyCode) {
    case 37:
      catcher.moveBy(-20, 0);
      break;
    case 39:
      catcher.moveBy(20, 0);
      break;
    default:
      console.log(e.keyCode);
      break;
                   }
});

document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('pauseResumeButton').addEventListener('click', pauseResumeGame);

document.getElementById('canvas').addEventListener('click', e => {
  if (e.screenX < canvas.width / 2) {
    catcher.moveBy(-20, 0);
  } else {
    catcher.moveBy(20, 0);
  }
  e.preventDefault();
});
