import { redisCli } from "../init/redis.js";

const users = [];
const user_set = 'user';

export const addUser = async (user) => { // 유저 추가
    users.push(user);

    try{
        await redisCli.SADD(user_set, user.uuid);
    }catch(err) {
       console.log(err);
    }
    
}

export const removeUser = async (user) => {
    try {
      await redisCli.SREM(user_set, user.uuid);
      //console.log(await redisCli.SMEMBERS(user_set));
    }
    catch(err) {
       console.log(err);
    }
} 
export const getUser = () => { // 유저 조회
    //const getRedis = await redisCli.SMEMBER('user','userId');
    const userList = redisCli.SMEMBERS(user_set);
   return userList;
}