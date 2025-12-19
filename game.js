// DOM Elements
const player = document.getElementById('player');
const obstaclesContainer = document.getElementById('obstacles');
const scoreEl = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const bestScoreEl = document.getElementById('best-score');
const restartBtn = document.getElementById('restart');

const menu = document.getElementById('menu');
const startBtn = document.getElementById('start-game');
const shapeSelect = document.getElementById('shape-select');
const colorPicker = document.getElementById('color-picker');
const pngUpload = document.getElementById('png-upload');

// Game variables
let laneCenters = [16.66, 50, 83.33]; // centered lanes
let playerLane = 1;
let obstacles = [];
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let speed = 1;
let acceleration = 0.0005; // gradual speed increase
let spawnTimer = 0;
let spawnInterval = 100;
let gameRunning = false;

let playerShape = 'square';
let playerColor = '#4caf50';
let playerPNG = null;

// Hide Game Over at start
gameOverScreen.style.display = 'none';

// =========================
// Menu / Start Game functionality
startBtn.addEventListener('click', () => {
  playerShape = shapeSelect.value;
  playerColor = colorPicker.value;

  const file = pngUpload.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      playerPNG = e.target.result;
      applyPlayerCustomization();
      startGame();
    };
    reader.readAsDataURL(file);
  } else {
    applyPlayerCustomization();
    startGame();
  }
});

function applyPlayerCustomization() {
  player.style.backgroundColor = playerColor;

  if (playerShape === 'circle') {
    player.style.borderRadius = '50%';
  } else if (playerShape === 'rectangle') {
    player.style.borderRadius = '10%';
    player.style.height = '15%';
  } else { // square
    player.style.borderRadius = '10%';
    player.style.height = '10%';
  }

  if (playerPNG) {
    player.style.backgroundImage = `url(${playerPNG})`;
    player.style.backgroundSize = 'cover';
    player.style.backgroundColor = 'transparent';
  } else {
    player.style.backgroundImage = '';
  }
}

function startGame() {
  menu.style.display = 'none';
  document.getElementById('game-container').style.display = 'block';
  gameOverScreen.style.display = 'none';
  gameRunning = true;
  playerLane = 1;
  player.style.left = laneCenters[playerLane] + '%';
  requestAnimationFrame(update);
}

// =========================
// Swipe controls
let touchStartX = null;
let touchEndX = null;

document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleGesture();
});

function handleGesture() {
  if (touchEndX < touchStartX - 30) movePlayer(-1);
  if (touchEndX > touchStartX + 30) movePlayer(1);
}

function movePlayer(direction) {
  playerLane += direction;
  if (playerLane < 0) playerLane = 0;
  if (playerLane > 2) playerLane = 2;
  player.style.left = laneCenters[playerLane] + '%';
  if (navigator.vibrate) navigator.vibrate(30);
}

// =========================
// Obstacles
function spawnObstacleRow() {
  let blocked = [];
  let blockCount = Math.random() < 0.7 ? 1 : 2;
  while (blocked.length < blockCount) {
    let lane = Math.floor(Math.random() * 3);
    if (!blocked.includes(lane)) blocked.push(lane);
  }
  if (blocked.length === 3) blocked.pop();

  blocked.forEach(lane => {
    let obs = document.createElement('div');
    obs.classList.add('obstacle');
    obs.style.left = laneCenters[lane] - 16.66 + '%'; // align obstacle with lane center
    obs.style.bottom = '100%';
    obstaclesContainer.appendChild(obs);
    obstacles.push({el: obs, lane});
  });
}

// =========================
// Game loop
function update() {
  if (!gameRunning) return;

  obstacles.forEach(o => {
    let bottom = parseFloat(o.el.style.bottom);
    bottom -= speed;
    o.el.style.bottom = bottom + '%';
  });

  obstacles = obstacles.filter(o => {
    if (parseFloat(o.el.style.bottom) < -10) {
      o.el.remove();
      return false;
    }
    return true;
  });

  obstacles.forEach(o => {
    if (parseFloat(o.el.style.bottom) <= 10 && o.lane === playerLane) {
      endGame();
    }
  });

  score += 1;
  scoreEl.textContent = 'Score: ' + score;

  speed += acceleration; // gradually increase speed

  spawnTimer++;
  if (spawnTimer > spawnInterval) {
    spawnObstacleRow();
    spawnTimer = 0;
  }

  requestAnimationFrame(update);
}

// =========================
// Game Over
function endGame() {
  gameRunning = false;
  finalScoreEl.textContent = 'Score: ' + score;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('bestScore', bestScore);
  }
  bestScoreEl.textContent = 'Best: ' + bestScore;

  // Show menu so user can re-customize
  menu.style.display = 'flex';
  // Hide Game Over overlay
  gameOverScreen.style.display = 'none';
}

// =========================
// Restart button
restartBtn.addEventListener('click', () => {
  obstacles.forEach(o => o.el.remove());
  obstacles = [];

  playerLane = 1;
  player.style.left = laneCenters[playerLane] + '%';

  score = 0;
  speed = 1;
  spawnTimer = 0;

  gameRunning = false;
  // Menu stays visible, player clicks Start Game to play again
});
