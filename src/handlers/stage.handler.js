import { getGameAssets } from "../init/assets.js";
import { getStage, setStage } from "../models/stage.model.js";

export const moveStageHandler = (userId, payload) => {
  //userId = uuid

  const { stages } = getGameAssets();
  // 유저는 스테이지를 하나씩 올라갈 수 있다. (1 -> 2 , 2 -> 3)
  // 유저는 일정 점수가 되면 다음 스테이지로 이동한다.

  // currentStage, targetStage 를 클라이언트가 서버에 보내줌
  // 유저의 현재 스테이지 정보
  let currentStages = getStage(userId);

  //console.log('현재 스테이지: ' , currentStages);
  if (!currentStages.length) {
    return { status: "fail", message: "No Stage found for user" };
  }

  //오름차순 -> 가장 큰 스테이지 ID를 확인 <- 유저의 현재 스테이지
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];

  // 클라이언트 vs 서버 비교
  if (currentStage.id !== payload.currentStage) {
    return { status: "fail", message: "Current Stage mismatch" };
  }

  // 점수 검증 로직
  const serverTime = Date.now();
  const elapsedTime = (serverTime - currentStage.timestamp) / 1000; // timestamp => ms로 되어있기 때문에 1000을 나눠서 1초로 구함.

  // target 스테이지에 대한 검증 <- 게임 에셋에 존재하는가?

  const stageKey = payload.stageKey;
  const nowStageScore = stages.data[+stageKey + 1].score;
  //console.log(`서버:` , stageKey);
  // 1 스테이지에서 2 스테이지로 넘어가는 과정
  // 5 => 임의로 정한 오차범위
  if (elapsedTime === nowStageScore && elapsedTime > nowStageScore + 5) {
    // 다음 스테이지로 넘어가기 위해 필요한 점수가 100이고 그에 해당하는 값이 되면 자동으로 넘어간다.
    return { status: "fail", message: "Invalid elapsed time" };
  }

  // 배열을 구성하는 값 중에서 조건이 하나라도 맞을 경우 -> some
  if (!stages.data.some((stage) => stage.id === payload.targetStage)) {
    // 다음 스테이지에 있는 id가 stage.json에 존재하는가?
    return { status: "fail", message: "Target stage is not found" };
  }

  setStage(userId, payload.targetStage, serverTime);

  return { status: "success", currentStage: payload.targetStage };
};
