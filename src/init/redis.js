import dotenv from "dotenv";
import redis from "redis";

dotenv.config();

// 레디스 연결
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
  legacyMode: true,
});
redisClient.on("connect", () => {
  console.info("Redis connected!");
});
redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});
redisClient.connect().then(); // redis v4 연결 (비동기)

export const redisCli = redisClient.v4; // 기본 redisClient 객체는 콜백기반인데 v4버젼은 프로미스 기반이라 사용

//  const saveRecords = {
//     userId: '039cef0a-08cb-4f2b-a2bb-744ec1d678b2',
//     HighScore: 100,
//     timestamp: 1727944416425
//     };
//  await redisCli.set('key',JSON.stringify(saveRecords));
//  export const getRedis = (redisClient) => {
//     return new Promise((resolve,reject) => {
//         const saveRedis = redisClient.get((err,value) => {
//             return value;
//         })

//         resolve(JSON.parse(saveRedis));
//     })
//  }
