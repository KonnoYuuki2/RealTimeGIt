import { getGameAssets } from "../init/assets.js";
import { redisCli } from "../init/redis.js";

const user_set = "user";
// 아이템 검증 로직
export function itemHandler(userId, payload) {
  const { itemUnlocks } = getGameAssets();

  const canGetItem = itemUnlocks.data.find((item) => {
    return item.item_id === payload.itemId;
  });

  if (payload.currentStage < canGetItem.stage_id) {
    redisCli.SREM(user_set, userId); // 유저 정보 삭제
    console.log(
      `아이템 오류! , 현재 스테이지에서 얻을 수 없는 아이템 입니다!!`
    );

    return {
      status: "fail",
      errorMessage: "버그 유저 확인, 연결을 강제 종료합니다.",
    };
  }

  return { status: "success" };
}
