import { currentStage, sendEvent } from "./socket.js";
import { player, newGameAssets, gameLog } from "./index.js";
//`${window.location.pathname}src/init/assets/assets.js`

const stageLogs = document.getElementById("stages");
class Score {
  score = 0;
  stageChange = true;
  stages = {};
  items = {};
  itemUnlocks = {};

  constructor(ctx, scaleRatio, stages, items, itemUnlocks) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.stages = stages;
    this.items = items;
    this.itemUnlocks = itemUnlocks;
  }

  update(deltaTime) {
    let stageKey = 0;

    // 현재 스테이지의 순서값을 가져옴
    for (let key in this.stages.data) {
      if (this.stages.data[key].id === currentStage) {
        stageKey = key;
        break;
      }
    }

    // 현재 스테이지 및 다음 스테이지의 정보 저장
    const nowStage = this.stages.data[stageKey];
    const newStage = this.stages.data[+stageKey + 1];
    this.score += nowStage.scorePerSecond * deltaTime * 0.001; // 프레임 하나가 랜더링 되는 시간을 체크
    // 점수가 100점 이상이 될 시 서버에 메세지 전송
    // 델타 타임으로 구하고 있기 때문에 소수점으로 구하게 되서 이를 100.000001 이 나올 수도 있다.

    // 다음 스테이지가 마지막 스테이지 였을 경우에 더이상 스테이지 변경 불가
    if (newStage.id === this.stages.data[this.stages.data.length - 1].id) {
      this.stageChange = false;
    }

    // 스테이지 로그 추가
    stageLogs.innerHTML = `<div style="color:slateblue">스테이지: ${nowStage.id}</div>`;

    // 다음 스테이지의 스코어 값을 넘어가게 되면 스테이지를 변경
    if (Math.floor(this.score) >= newStage.score && this.stageChange) {
      console.log(`스테이지 변경!`);

      // 스테이지 이벤트 전송
      sendEvent(11, {
        currentStage: currentStage,
        targetStage: newStage.id,
        stageKey: stageKey,
      });
    }
  }

  getItem(itemId) {
    //현재 스테이지에서 얻을 수 있는 아이템들을 불러와야만 한다.
    // 그리고 가져온 아이템 아이디가 현재 스테이지에서 얻을 수 있는 아이템 배열에 있는지 확인
    const item = this.items.ITEM_CONFIG.find((item) => {
      return item.id === itemId;
    });

    // 얻은 아이템의 type에 따라서 구분
    if (item.type === "score") {
      gameLog.innerHTML = `<div style="color:gold">+${item.score}</div>`;
    }

    if (item.type === "poision" && !player.isPoision) {
      player.maxJumpHeight -= 50;
      player.isPoision = true;
      gameLog.innerHTML =
        '<div style="color:green">독병을 마셨습니다! 점프력 -50</div>';

      const poisionTimer = setTimeout(() => {
        if (player.isPoision) {
          player.maxJumpHeight += 30;
          player.isPoision = false;
          gameLog.innerHTML = '<div style="color:blue">독이 풀렸습니다!</div>';
        } else {
          gameLog.innerHTML =
            '<div style="color:blue">이미 독이 풀려 있습니다!</div>';
        }
      }, 5000);
    }

    if (item.type === "poisionFruit" && !player.isPoision) {
      player.GRAVITY *= 2;
      player.isPoision = true;
      gameLog.innerHTML =
        '<div style="color:green">독사과를 먹었습니다! 중력 2배</div>';

      const poisionFruitTimer = setTimeout(() => {
        if (player.isPoision) {
          player.GRAVITY /= 2;
          player.isPoision = false;
          gameLog.innerHTML = '<div style="color:blue">독이 풀렸습니다!</div>';
        } else {
          console.log(`이미 독이 풀린 상태입니다.`);
        }
      }, 5000);
    }

    console.log(item.score);

    this.score += item.score;

    sendEvent(13, { currentStage: currentStage, itemId: itemId });
  }

  reset() {
    this.score = 0;
  }

  setHighScore() {
    if (this.score > newGameAssets.records.HighScore) {
      sendEvent(12, { timestamp: Date.now(), score: this.score });
    }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = "white";

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = newGameAssets.records.HighScore.toString().padStart(
      6,
      0
    );

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }
}

export default Score;
