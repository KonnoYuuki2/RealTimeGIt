import { Server as SocketIO } from "socket.io"; // 이름은 SockeIO로 쓸것이다.
import registerHandler from "../handlers/register.handler.js";

const initSocket = (server) => {
  const io = new SocketIO();
  io.attach(server);

  registerHandler(io);
};

export default initSocket;
