import { getGameAssets } from "../init/assets.js";
import { redisCli } from "../init/redis.js";

// 아이템 검증 로직
export function itemHandler(userId, payload) {
  const { itemUnlocks } = getGameAssets();

  if (
    !itemUnlocks.data.some((item) => {
      return item.stage_id >= payload.currentStage;
    })
  ) {
    redisCli.SREM(user_set, userId); // 유저 정보 삭제
    console.log(
      `아이템 오류! , 현재 스테이지에서 얻을 수 없는 아이템 입니다!!`
    );
  }

  return {
    status: "fail",
    errorItemsMessage: "버그 유저 확인, 연결을 강제 종료합니다.",
  };
}
