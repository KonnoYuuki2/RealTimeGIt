//key: uuid, value: array => stage 정보는 배열

const stages = {};

//스테이지 초기화
export const createStage = (uuid) => {
  stages[uuid] = [];
}

export const getStage = (uuid) => {
    return stages[uuid]; // 현재 유저의 스테이지 
}

export const setStage = (uuid,id, timestamp) => {
    return stages[uuid].push({ id, timestamp }); // 현재 유저의 스테이지 설정
}

export const clearStage = (uuid) => {
  (stages[uuid] = []);
}