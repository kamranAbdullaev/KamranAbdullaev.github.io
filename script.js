const road = document.getElementById("road");
const car = document.getElementById("car");
const scoreEl = document.getElementById("score");
const speedEl = document.getElementById("speed");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const select = document.getElementById("select");
const carList = document.getElementById("carList");
const startBtn = document.getElementById("startBtn");

const lanes = [
  { left: "16%" },
  { left: "42%" },
  { left: "68%" },
];

const obstacleTypes = [
  {
    id: "car",
    className: "enemy",
    score: 10,
    speedMul: 1,
  },
  {
    id: "truck",
    className: "enemy enemy--truck",
    score: 14,
    speedMul: 0.9,
  },
  {
    id: "cone",
    className: "enemy enemy--cone",
    score: 8,
    speedMul: 1.1,
  },
  {
    id: "oil",
    className: "enemy enemy--oil",
    score: 6,
    speedMul: 1.2,
  },
];

let currentLane = 1;
let running = false;
let paused = false;
let score = 0;
let speed = 1;
let best = Number(localStorage.getItem("bestScore") || 0);
let spawnTimer = null;
let frameId = null;
let enemies = [];
let elapsed = 0;
let slowUntil = 0;
let audioCtx = null;
let audioEnabled = false;
let selectedSkin = null;
const skinClasses = ["car--blue", "car--red", "car--green"];

const carSkins = [
  { id: "blue", className: "car--blue", label: "Синий" },
  { id: "red", className: "car--red", label: "Красный" },
  { id: "green", className: "car--green", label: "Зеленый" },
];

bestEl.textContent = best.toString();

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playBeep({ freq = 440, duration = 0.12, type = "sine", gain = 0.08 } = {}) {
  if (!audioEnabled) {
    return;
  }
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.value = gain;
  osc.connect(amp);
  amp.connect(ctx.destination);
  osc.start();
  amp.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
}

function playCrash() {
  playBeep({ freq: 120, duration: 0.2, type: "sawtooth", gain: 0.15 });
  playBeep({ freq: 70, duration: 0.25, type: "square", gain: 0.1 });
}

function playScore() {
  playBeep({ freq: 600, duration: 0.08, type: "triangle", gain: 0.06 });
}

function playOil() {
  playBeep({ freq: 200, duration: 0.15, type: "sine", gain: 0.08 });
}

function playStart() {
  playBeep({ freq: 520, duration: 0.1, type: "triangle", gain: 0.06 });
  playBeep({ freq: 680, duration: 0.1, type: "triangle", gain: 0.06 });
}

function setCarLane(laneIndex) {
  currentLane = Math.max(0, Math.min(lanes.length - 1, laneIndex));
  car.style.left = lanes[currentLane].left;
}

function applySkin(skinClass) {
  skinClasses.forEach((cls) => car.classList.remove(cls));
  if (skinClass) {
    car.classList.add(skinClass);
  }
}

function renderSkins() {
  carList.innerHTML = "";
  carSkins.forEach((skin) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "select__item";
    item.dataset.skin = skin.id;
    item.innerHTML = `<div class="select__car ${skin.className}"></div>`;
    item.addEventListener("click", () => {
      selectedSkin = skin.id;
      applySkin(skin.className);
      [...carList.children].forEach((child) =>
        child.classList.toggle("active", child === item)
      );
      startBtn.disabled = false;
    });
    carList.appendChild(item);
  });
}

function resetGame() {
  enemies.forEach((enemy) => enemy.remove());
  enemies = [];
  score = 0;
  speed = 1;
  elapsed = 0;
  slowUntil = 0;
  scoreEl.textContent = "0";
  speedEl.textContent = "1";
  setCarLane(1);
}

function showOverlay(title, text) {
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

function pickObstacleType() {
  const roll = Math.random();
  if (roll < 0.55) {
    return obstacleTypes[0];
  }
  if (roll < 0.75) {
    return obstacleTypes[1];
  }
  if (roll < 0.9) {
    return obstacleTypes[2];
  }
  return obstacleTypes[3];
}

function spawnEnemy() {
  const enemy = document.createElement("div");
  const type = pickObstacleType();
  enemy.className = type.className;
  const laneIndex = Math.floor(Math.random() * lanes.length);
  enemy.style.left = lanes[laneIndex].left;
  enemy.dataset.lane = laneIndex.toString();
  enemy.dataset.type = type.id;
  enemy.dataset.speedMul = type.speedMul.toString();
  enemy.dataset.score = type.score.toString();
  enemy.style.top = "-140px";
  road.appendChild(enemy);
  enemies.push(enemy);
}

function getObstacleSpeed(enemy) {
  const mul = Number(enemy.dataset.speedMul || 1);
  const base = 180 + speed * 70;
  const slowFactor = Date.now() < slowUntil ? 0.65 : 1;
  return base * mul * slowFactor;
}

function updateEnemies(delta) {
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    const top = Number(enemy.style.top.replace("px", ""));
    const nextTop = top + getObstacleSpeed(enemy) * delta;
    enemy.style.top = `${nextTop}px`;

    if (nextTop > road.clientHeight + 140) {
      enemy.remove();
      enemies.splice(i, 1);
      score += Number(enemy.dataset.score || 10);
      scoreEl.textContent = score.toString();
      playScore();
    }
  }
}

function checkCollision() {
  const carRect = car.getBoundingClientRect();
  for (const enemy of enemies) {
    const enemyRect = enemy.getBoundingClientRect();
    const overlap =
      enemyRect.bottom > carRect.top + 10 &&
      enemyRect.top < carRect.bottom - 10 &&
      enemyRect.left < carRect.right - 10 &&
      enemyRect.right > carRect.left + 10;

    if (overlap) {
      if (enemy.dataset.type === "oil") {
        slowUntil = Date.now() + 1800;
        enemy.remove();
        enemies = enemies.filter((item) => item !== enemy);
        playOil();
        continue;
      }
      playCrash();
      return true;
    }
  }
  return false;
}

function updateSpeed(delta) {
  elapsed += delta;
  const timeBoost = Math.floor(elapsed / 6);
  const scoreBoost = Math.floor(score / 120);
  const nextSpeed = Math.min(10, 1 + timeBoost + scoreBoost);
  if (nextSpeed !== speed) {
    speed = nextSpeed;
    speedEl.textContent = speed.toString();
    startSpawning();
  }
}

function gameLoop(timestamp) {
  if (!running) {
    return;
  }

  if (!gameLoop.lastTime) {
    gameLoop.lastTime = timestamp;
  }

  const delta = Math.min((timestamp - gameLoop.lastTime) / 1000, 0.05);
  gameLoop.lastTime = timestamp;

  if (!paused) {
    updateSpeed(delta);
    updateEnemies(delta);

    if (checkCollision()) {
      endGame();
      return;
    }
  }

  frameId = requestAnimationFrame(gameLoop);
}

function startSpawning() {
  if (spawnTimer) {
    clearInterval(spawnTimer);
  }
  const interval = Math.max(820 - speed * 45, 360);
  spawnTimer = setInterval(() => {
    if (running && !paused) {
      spawnEnemy();
    }
  }, interval);
}

function startGame() {
  resetGame();
  running = true;
  paused = false;
  hideOverlay();
  select.classList.add("hidden");
  gameLoop.lastTime = null;
  startSpawning();
  frameId = requestAnimationFrame(gameLoop);
  playStart();
}

function pauseGame() {
  if (!running) {
    return;
  }
  paused = !paused;
  overlayTitle.textContent = paused ? "Пауза" : "";
  overlayText.textContent = paused
    ? "Нажми пробел, чтобы продолжить"
    : "";
  if (paused) {
    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
  }
}

function endGame() {
  running = false;
  paused = false;
  cancelAnimationFrame(frameId);
  clearInterval(spawnTimer);
  if (score > best) {
    best = score;
    localStorage.setItem("bestScore", best.toString());
    bestEl.textContent = best.toString();
  }
  showOverlay("Игра окончена", "Нажми Enter, чтобы начать заново");
}

function handleKeydown(event) {
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    setCarLane(currentLane - 1);
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    setCarLane(currentLane + 1);
  }
  if (event.code === "Space") {
    event.preventDefault();
    pauseGame();
  }
  if (event.code === "Enter") {
    if (!running) {
      if (!selectedSkin) {
        return;
      }
      audioEnabled = true;
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      startGame();
    }
  }
}

window.addEventListener("keydown", handleKeydown);

renderSkins();
overlay.classList.add("hidden");
select.classList.remove("hidden");
setCarLane(1);

startBtn.addEventListener("click", () => {
  if (!selectedSkin) {
    return;
  }
  audioEnabled = true;
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  startGame();
});
