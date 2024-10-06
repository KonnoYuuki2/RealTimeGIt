import Player from "./Player.js";
import Ground from "./Ground.js";
import CactiController from "./CactiController.js";
import Score from "./Score.js";
import ItemController from "./ItemController.js";
import "./socket.js";
import { sendEvent } from "./socket.js";
import gameAssets from "./gameAssets.js";

//43.203.214.111
//해당 URL로 요청한 데이터를 받아서 처리
const gameDataRequest = await fetch("http://43.203.214.111:3000/getGameAssets");
const gameData = await gameDataRequest.json();

const redisDataRequest = await fetch("http://43.203.214.111:3000/getRedisData");
const redisData = await redisDataRequest.json();

const { stages, items, itemUnlocks, records, plants } = gameData;
export const newGameAssets = new gameAssets(
  stages,
  items,
  itemUnlocks,
  redisData ? redisData : records // 만약 레디스 데이터가 날라갈 경우를 대비하기 위함
);

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

export const gameLog = document.getElementById("gameLog");

const GAME_SPEED_START = 1;
const GAME_SPEED_INCREMENT = 0.00001;

// 게임 크기
const GAME_WIDTH = 800;
const GAME_HEIGHT = 250;

// 플레이어
// 800 * 200 사이즈의 캔버스에서는 이미지의 기본크기가 크기때문에 1.5로 나눈 값을 사용. (비율 유지)
const PLAYER_WIDTH = 88 / 1.5; // 58
const PLAYER_HEIGHT = 94 / 1.5; // 62
const MAX_JUMP_HEIGHT = GAME_HEIGHT;
const MIN_JUMP_HEIGHT = 150;

// 땅
const GROUND_WIDTH = 1200;
const GROUND_HEIGHT = 250;
const GROUND_SPEED = 0.6;

// 식물들
const PLANTS_CONFIG = plants.PLANTS_CONFIG;

// 아이템
const ITEM_CONFIG = items.ITEM_CONFIG;

// 게임 요소들
export let player = null;
let ground = null;
let cactiController = null;
let itemController = null;
let score = null;

let scaleRatio = null;
let previousTime = null;
let gameSpeed = GAME_SPEED_START;
let gameover = false;
let hasAddedEventListenersForRestart = false;
let waitingToStart = true;

// 오디오 기능 추가
const BGM = new Audio("./audios/BGM2.mp3");
BGM.loop = true;
const Dead = new Audio("./audios/girl_cry.mp3");

function createSprites() {
  // 비율에 맞는 크기
  // 유저
  const playerWidthInGame = PLAYER_WIDTH * scaleRatio;
  const playerHeightInGame = PLAYER_HEIGHT * scaleRatio;
  const minJumpHeightInGame = MIN_JUMP_HEIGHT * scaleRatio;
  const maxJumpHeightInGame = MAX_JUMP_HEIGHT * scaleRatio;

  // 땅
  const groundWidthInGame = GROUND_WIDTH * scaleRatio;
  const groundHeightInGame = GROUND_HEIGHT * scaleRatio;

  player = new Player(
    ctx,
    playerWidthInGame,
    playerHeightInGame,
    minJumpHeightInGame,
    maxJumpHeightInGame,
    scaleRatio
  );

  ground = new Ground(
    ctx,
    groundWidthInGame,
    groundHeightInGame,
    GROUND_SPEED,
    scaleRatio
  );

  const cactiImages = PLANTS_CONFIG.map((cactus) => {
    const image = new Image();
    image.src = cactus.image;
    return {
      image,
      width: cactus.width * scaleRatio,
      height: cactus.height * scaleRatio,
    };
  });

  cactiController = new CactiController(
    ctx,
    cactiImages,
    scaleRatio,
    GROUND_SPEED
  );

  const itemImages = ITEM_CONFIG.map((item) => {
    // 아이템 제한 및 추가

    const image = new Image();
    image.src = item.image;
    return {
      image,
      id: item.id,
      width: item.width * scaleRatio,
      height: item.height * scaleRatio,
    };
  });

  itemController = new ItemController(
    ctx,
    itemImages,
    scaleRatio,
    GROUND_SPEED,
    newGameAssets.itemUnlocks
  );

  score = new Score(
    ctx,
    scaleRatio,
    newGameAssets.stages,
    newGameAssets.items,
    newGameAssets.itemUnlocks
  );
}

function getScaleRatio() {
  const screenHeight = Math.min(
    window.innerHeight,
    document.documentElement.clientHeight
  );
  const screenWidth = Math.min(
    window.innerHeight,
    document.documentElement.clientWidth
  );

  // window is wider than the game width
  if (screenWidth / screenHeight < GAME_WIDTH / GAME_HEIGHT) {
    return screenWidth / GAME_WIDTH;
  } else {
    return screenHeight / GAME_HEIGHT;
  }
}

function setScreen() {
  scaleRatio = getScaleRatio();
  canvas.width = GAME_WIDTH * scaleRatio;
  canvas.height = GAME_HEIGHT * scaleRatio;
  createSprites();
}

setScreen();
window.addEventListener("resize", setScreen);

if (screen.orientation) {
  screen.orientation.addEventListener("change", setScreen);
}

function showGameOver() {
  const fontSize = 70 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "red";
  const x = canvas.width / 4.5;
  const y = canvas.height / 2;
  ctx.fillText("YOU DIED...", x, y);
}

function showStartGameText() {
  const fontSize = 40 * scaleRatio;
  ctx.font = `${fontSize}px Verdana`;
  ctx.fillStyle = "white";
  const x = canvas.width / 14;
  const y = canvas.height / 2;
  ctx.fillText("Tap Screen or Press Space To Start", x, y);
}

function updateGameSpeed(deltaTime) {
  gameSpeed += deltaTime * GAME_SPEED_INCREMENT;
}

function reset() {
  hasAddedEventListenersForRestart = false;
  gameover = false;
  waitingToStart = false;
  ground.reset();
  cactiController.reset();
  score.reset();
  itemController.reset(); // 아이템 리셋 추가
  gameSpeed = GAME_SPEED_START;
  // 게임시작 핸들러ID 2, payload 에는 게임 시작 시간
  gameLog.innerHTML = "<div>게임 시작!!</div>"; // 게임 시작 문구 출력
  sendEvent(2, { timestamp: Date.now() });
  BGM.play(); // 브금 실행
}

function setupGameReset() {
  if (!hasAddedEventListenersForRestart) {
    hasAddedEventListenersForRestart = true;

    setTimeout(() => {
      window.addEventListener("keyup", reset, { once: true });
    }, 1000);
  }
}

function clearScreen() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function gameLoop(currentTime) {
  if (previousTime === null) {
    previousTime = currentTime;
    requestAnimationFrame(gameLoop);
    return;
  }

  // 모든 환경에서 같은 게임 속도를 유지하기 위해 구하는 값
  // 프레임 렌더링 속도
  const deltaTime = currentTime - previousTime;
  previousTime = currentTime;

  clearScreen();

  if (!gameover && !waitingToStart) {
    // update
    // 땅이 움직임
    ground.update(gameSpeed, deltaTime);
    // 선인장
    cactiController.update(gameSpeed, deltaTime);
    itemController.update(gameSpeed, deltaTime);
    // 달리기
    player.update(gameSpeed, deltaTime);
    updateGameSpeed(deltaTime);

    score.update(deltaTime);
  }

  if (!gameover && cactiController.collideWith(player)) {
    gameover = true;
    score.setHighScore();
    sendEvent(3, { timestamp: Date.now(), score: score });
    setupGameReset();

    // 죽을 때 독이 걸려있었을 경우 독을 해제하고 플레이어 정보를 리셋
    if (player.isPoision) {
      player.isPoision = false;
      player.reset();
    }
    gameLog.innerHTML = '<div style="color:red">당신은 죽었습니다..</div>';
    BGM.pause(); // 브금 정지
    Dead.play(); // 죽는 소리 실행
  }
  const collideWithItem = itemController.collideWith(player);
  if (collideWithItem && collideWithItem.itemId) {
    score.getItem(collideWithItem.itemId);
  }

  // draw
  ground.draw();
  score.draw();

  player.draw();
  cactiController.draw();
  itemController.draw();

  if (gameover) {
    showGameOver();
  }

  if (waitingToStart) {
    showStartGameText();
  }

  // 재귀 호출 (무한반복)
  requestAnimationFrame(gameLoop);
}

// 게임 프레임을 다시 그리는 메서드
requestAnimationFrame(gameLoop);

window.addEventListener("keyup", reset, { once: true });
