import { getGameAssets } from "../init/assets.js";
import { clearStage, getStage, setStage } from "../models/stage.model.js";

export const gameStart = (uuid, payload) => {
  const { stages } = getGameAssets();

  clearStage(uuid);

  // stages 배열에서 0번째 = 첫번째 스테이지
  setStage(uuid, stages.data[0].id, payload.timestamp);

  const currentStage = getStage(uuid);

  console.log(`Stage: `, getStage(uuid));

  return { status: "success", currentStage: currentStage[0].id };
};

export const gameEnd = (uuid, payload) => {
  // 클라이언트는 게임 종료 시 타임스탬프와 총 점수를 서버에게 준다.
  const { timestamp: gameEndTime, score } = payload; // timestamp:gameEndTime 이름을 gameEndTime으로 쓰겠다.
  const stages = getStage(uuid);

  const EndStage = stages.sort((a, b) => a.id + b.id);
  console.log(`stage End: ` + EndStage);
  if (!stages.length) {
    return { status: "fail", message: "No stages found for user" };
  }

  // 각 스테이지의 지속 시간을 계산하여 총 점수 계산
  let totalScore = 0;
  stages.forEach((stage, index) => {
    let stageEndTime;
    if (index === stages.length - 1) {
      stageEndTime = gameEndTime;
    } else {
      stageEndTime = stages[index + 1].timestamp;
    }

    const stageDuration = (stageEndTime - stage.timestamp) / 1000;
    totalScore += stageDuration;
  });

  // 점수와 타임스탬프 검증
  // 오차범위 5
  if (Math.abs(score - totalScore) > 5) {
    return { status: "fail", message: "Score verfication failed" };
  }

  // DB에 저장시 이곳에서 저장
  // setResult(userId, score, timestamp);
  return { status: "success", message: "Game Ended", score: score };
};
