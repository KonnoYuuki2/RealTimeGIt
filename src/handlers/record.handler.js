// 스코어 갱신시 호출할 함수
//import fs from "fs";
//import path from "path";
//import { fileURLToPath } from "url";
import { redisCli } from "../init/redis.js";

//const __filename = fileURLToPath(import.meta.url); // assets.js의 경로 - 현재 파일의 절대 경로(RealTimePlatFormerGame\src\init\assets.js)
//const __dirname = path.dirname(__filename); // 현재 디렉토리의 경로(RealTimePlatFormerGame\src\init)
// 최상위 경로 + assets 폴더
//const basePath = path.join(__dirname,'../../assets/records.json'); // 현재 디렉토리에서 assets 파일의 경로 가져오기

export const recordHandler = async (uuid, payload) => {
  // 기존의 레코드를 두면서 새롭게 랭킹을 갱신한 사람들을 추가하기
  const { timestamp: gameEndTime, score } = payload;
  // 저장할 레코드
  const saveRecords = {
    userId: uuid,
    HighScore: Math.floor(score),
    timestamp: gameEndTime,
  };

  await redisCli.set("key", JSON.stringify(saveRecords));
  let saveRedis = await JSON.parse(
    await redisCli.get("key", (err, value) => {
      if (err) {
        console.log(err);
      }
      return value;
    })
  );

  console.log(`저장한 레디스:`, saveRedis);

  // fs.writeFileSync(basePath, JSON.stringify(saveRecords));
  // const saveScoreFile = JSON.parse(fs.readFileSync(basePath));
  //console.log(`saveScoreFile: `, saveScoreFile);
  // 하이스코어를 로컬 스토리지를 쓰지 않고 쓰는 알고리즘
  let { HighScore } = saveRedis;
  const returnScore = HighScore;

  console.log("최대 점수: " + returnScore);

  return {
    status: "success",
    broadCast: `${uuid}가 최대 점수 ${returnScore}를 갱신했습니다!`,
    records: saveRedis,
  };
};
