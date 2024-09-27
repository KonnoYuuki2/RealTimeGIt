import { CLIENT_VERSION } from "../constatns.js";
import { createStage } from "../models/stage.model.js";
import { getUser, removeUser } from "../models/user.model.js";
import handlerMapping from "./handlerMapping.js";

export const handleDisconnect = (socket, uuid) => {
    console.log(`User disconnected ${socket.id}`);
    removeUser(socket.id);
    console.log(`Current users:`, getUser());
}

// 스테이지에 따라서 더 높은 점수 획득
// 1 스테이지, 0점 => 1점씩
// 2 스테이지 , 1000점 => 2점씩

// 유저가 생성되거나, 게임이 시작되거나 => 생성
export const handleConnection = (socket, uuid) => {
    console.log(`New user connected: ${uuid} with socket ID ${socket.id}`);
    console.log(`Current users: `, getUser());
    
    createStage(uuid);

    // 본인에게 보내는 것(response)
    socket.emit(`connection`, {uuid});
    
}

// 
export const handlerEvent = (io,socket,data) => { //data = payload
   if(!CLIENT_VERSION.includes(data.clientVersion)) {
      socket.emit('response', {status: 'fail', message: 'Client version mismatch'});
      return;
   }

   const handler = handlerMapping[data.handlerId];
   if(!handler) {
    socket.emit('response', {status: 'fail', message: 'Handler not found'});
    return;
   }

   const response = handler(data.userId, data.payload); // 스테이지 

   if(response.broadCast) { // 브로드 캐스트 할 메시지 인가?
     io.emit('response', {status:'broadCast', message:`${response.broadCast}`});
     console.log(`브로드 캐스트 됨`);
     return; 
   }

   socket.emit('response', response);
}