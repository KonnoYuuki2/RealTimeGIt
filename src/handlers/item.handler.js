import { getGameAssets } from "../init/assets.js";

export function itemHandler(userId,payload) {
   
    const {itemUnlocks} = getGameAssets();

    if(!itemUnlocks.data.some((item) => { return item.stage_id >= payload.currentStage })) {
        console.log(`아이템 오류! , 현재 스테이지에서 얻을 수 없는 아이템 입니다!!`);
        
    }

    return {status: 'fail', errorItemsMessage: '버그 유저 확인, 연결을 강제 종료합니다.'};
    
}