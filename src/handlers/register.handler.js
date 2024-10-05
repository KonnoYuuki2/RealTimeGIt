import { addUser } from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";
import { handleConnection, handleDisconnect, handlerEvent } from "./helper.js";

// io => 서버에 접속하는 모든 유저를 위한 이벤트
const registerHandler = (io) => {
  io.on("connection", (socket) => {
    // 'connection' 이라는 이벤트가 발생할 때까지 대기하겠다.
    // 이벤트 처리
    const userUUID = uuidv4();
    addUser({ uuid: userUUID, socketId: socket.id });

    handleConnection(socket, userUUID);

    socket.on("event", (data) => handlerEvent(io, socket, data)); //evnet 가 들어왔을때 처리

    // 접속 해제시 이벤트
    socket.on(
      "disconnect",
      async (socket) => await handleDisconnect(socket, userUUID)
    ); // 하나의 유저를 대상으로 한 이벤트
  });
};

export default registerHandler;
