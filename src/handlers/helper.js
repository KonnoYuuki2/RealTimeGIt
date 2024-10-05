import { CLIENT_VERSION } from "../constatns.js";
import { createStage } from "../models/stage.model.js";
import { getUser, removeUser } from "../models/user.model.js";
import handlerMapping from "./handlerMapping.js";
import { redisCli } from "../init/redis.js";

export const handleDisconnect = async (socket, uuid) => {
  console.log(`User disconnected ${socket.id}`);
  await removeUser({ uuid: uuid, socketId: socket.id });
  console.log(`Current users:`, await getUser());
};

// 스테이지에 따라서 더 높은 점수 획득
// 1 스테이지, 0점 => 1점씩
// 2 스테이지 , 1000점 => 2점씩

// 유저가 생성되거나, 게임이 시작되거나 => 생성
export const handleConnection = async (socket, uuid) => {
  const redisData = await JSON.parse(
    await redisCli.get("key", (err, value) => {
      return value;
    })
  );

  if (redisData && uuid === redisData.userId) {
    socket.emit(`response`, { ranker: `환영합니다 랭커 ${uuid}님` });
  }
  console.log(`New user connected: ${uuid} with socket ID ${socket.id}`);
  console.log(`Current users: `, await getUser());

  createStage(uuid);

  // 본인에게 보내는 것(response)
  socket.emit(`connection`, { uuid });
};

//
export const handlerEvent = async (io, socket, data) => {
  //data = payload
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    socket.emit("response", {
      status: "fail",
      message: "Client version mismatch",
    });
    return;
  }

  const handler = handlerMapping[data.handlerId];
  if (!handler) {
    socket.emit("response", { status: "fail", message: "Handler not found" });
    return;
  }

  // async, await를 붙인 이유는 record핸들러에서 값이 넘어오기전에 먼저 출력해버리는 걸 막기 위함
  const response = await handler(data.userId, data.payload); // 스테이지

  if (response.broadCast) {
    // 브로드 캐스트 할 메시지 인가?
    await io.emit("response", {
      status: "broadCast",
      broadCast: `${response.broadCast}`,
      records: response.records,
    });
    //console.log(`브로드 캐스트 됨`);
    return;
  }

  socket.emit("response", response);
};
