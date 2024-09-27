// 스코어 갱신시 호출할 함수
export const recordHandler = (uuid,payload) => {
   
    const {timestamp:gameEndTime , score} = payload;
    
    const MaxScore = Math.abs(score)
    console.log('최대 점수: ' + MaxScore);

    return {status: 'success' , broadCast: `${uuid}가 최대 점수 ${MaxScore}를 갱신했습니다!`};
}