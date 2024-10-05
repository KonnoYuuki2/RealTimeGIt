// 클라이언트에 메시지에서 온 핸들 아이디를 매핑해주기 위함
import { gameEnd, gameStart } from "./game.handler.js";
import { itemHandler } from "./item.handler.js";
import {recordHandler} from "./record.handler.js";
import { moveStageHandler } from "./stage.handler.js";

const handlerMapping = {
    2: gameStart,
    3: gameEnd,
    11: moveStageHandler,
    12: recordHandler,
    13: itemHandler
}


export default handlerMapping