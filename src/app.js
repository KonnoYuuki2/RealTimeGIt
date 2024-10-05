import express from "express";
import { createServer } from "http";
import initSocket from "./init/socket.js";
import { getGameAssets, loadGameAsset } from "./init/assets.js";
import { redisCli } from "./init/redis.js";

const app = express();
const server = createServer(app); // 서버를 키고 웹소켓을 하는 등에 사용

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false })); // 페이로드를 자동으로 파싱해준다.
app.use(express.static("public")); // express 의 static 메서드를 사용해서 정적파일 (html, css, js)을 서빙하는 것을 설정합니다.
//경로는 ‘public’ 폴더로 지정합니다.
initSocket(server);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/getGameAssets", (req, res) => {
  res.send(getGameAssets()); // 클라이언트로 데이터를 보냄
});

app.get("/getRedisData", async (req, res) => {
  res.send(
    await redisCli.get("key", (err, value) => {
      return value;
    })
  ); // 클라이언트로 데이터를 보냄
});

server.listen(PORT, async () => {
  // -> 서버가 실행되는 부분
  console.log(`Server is Running on port ${PORT}`);

  try {
    // 이 곳에서 파일을 읽음
    const assets = await loadGameAsset();
    console.log(assets);
    console.log("Assets loaded Successfully");
  } catch (err) {
    console.error("Failed to game assets: ", err);
  }
});
