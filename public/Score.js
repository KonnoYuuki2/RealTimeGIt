import { currentStage, sendEvent, userId } from "./socket.js";

//`${window.location.pathname}src/init/assets/assets.js`


class Score { 
  score = 0;
  HIGH_SCORE_KEY = 'highScore';
  stageChange = true;
  gameData = {};

  constructor(ctx, scaleRatio, gameData) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.scaleRatio = scaleRatio;
    this.gameData = gameData;
  }

  update(deltaTime) {
    const {stages} = this.gameData;
    let savekey = 0;
    for(let key in stages.data) {
      if(stages.data[key].id === currentStage) {
        savekey = key;
      }
    }  
      this.score +=  stages.data[savekey].scorePerSecond * deltaTime * 0.001;       // 프레임 하나가 랜더링 되는 시간을 체크
      // 점수가 100점 이상이 될 시 서버에 메세지 전송
      // 델타 타임으로 구하고 있기 때문에 소수점으로 구하게 되서 이를 100.000001 이 나올 수도 있다.

      //console.log(stages.data[+savekey + 1].id);
      if(stages.data[+savekey + 1].id === stages.data[stages.data.length - 1].id) {
        this.stageChange = false;
      } 

      if (Math.floor(this.score) >= stages.data[+savekey + 1].score && this.stageChange) {
        console.log(`스테이지 변경이 시작되고 있어요`);
            
        sendEvent(11, { currentStage: stages.data[savekey].id, targetStage: stages.data[+savekey + 1].id});
      }
  }

  getItem(itemId) {
    this.score += 8;
  }

  reset() {
    this.score = 0;
  }

  setHighScore() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    if (this.score > highScore) {
      localStorage.setItem(this.HIGH_SCORE_KEY, Math.floor(this.score));
      sendEvent(12, {score: this.score})
    }
  }

  getScore() {
    return this.score;
  }

  draw() {
    const highScore = Number(localStorage.getItem(this.HIGH_SCORE_KEY));
    const y = 20 * this.scaleRatio;

    const fontSize = 20 * this.scaleRatio;
    this.ctx.font = `${fontSize}px serif`;
    this.ctx.fillStyle = '#525250';

    const scoreX = this.canvas.width - 75 * this.scaleRatio;
    const highScoreX = scoreX - 125 * this.scaleRatio;

    const scorePadded = Math.floor(this.score).toString().padStart(6, 0);
    const highScorePadded = highScore.toString().padStart(6, 0);

    this.ctx.fillText(scorePadded, scoreX, y);
    this.ctx.fillText(`HI ${highScorePadded}`, highScoreX, y);
  }
}

export default Score;
