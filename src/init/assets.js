import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { redisCli } from "./redis.js";

let gameAssets = {};

const __filename = fileURLToPath(import.meta.url); // assets.js의 경로 - 현재 파일의 절대 경로(RealTimePlatFormerGame\src\init\assets.js)
const __dirname = path.dirname(__filename); // 현재 디렉토리의 경로(RealTimePlatFormerGame\src\init)
// 최상위 경로 + assets 폴더
const basePath = path.join(__dirname, "../../assets"); // 현재 디렉토리에서 assets 파일의 경로 가져오기

// console.log(__filename);
// console.log(__dirname);
// console.log(basePath);

// 파일 읽는 함수
// 비동기 병렬로 파일을 읽는다. => 가장 늦게 처리되는 시간까지 기다렸다가 한번에 처리한다.
const readFileAsync = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, filename), "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(JSON.parse(data));
    });
  });
};

export const loadGameAsset = async () => {
  try {
    const [stages, items, itemUnlocks, records, plants] = await Promise.all([
      readFileAsync("stage.json"),
      readFileAsync("item.json"),
      readFileAsync("item_unlock.json"),
      readFileAsync("records.json"),
      readFileAsync("plants.json"),
    ]);

    //redisCli.SADD('stages', stages)
    gameAssets = { stages, items, itemUnlocks, records, plants };
    return gameAssets;
  } catch (err) {
    throw new Error("Failed to load game assets: " + err.message);
  }
};

export const getGameAssets = () => {
  return gameAssets;
};
