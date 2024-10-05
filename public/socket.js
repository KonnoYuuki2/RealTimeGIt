import { CLIENT_VERSION } from './constants.js';
import { newGameAssets } from './index.js';

const socket = io('http://43.203.214.111:3000', { // 이 주소로 연결하겠다.
  query: {
    clientVersion: CLIENT_VERSION, //서버가 시작될떄 연결이 될떄
    // 밑에 이벤트인 connection 으로는 서버의 버전을 전송하지 않기 때문에 별도로 전송한다.
  },
});

// 이런 파일들에 대해서 클래스 파일을 만들어 관리하면 깔끔할 것이다.
export let currentStage = {};
let userId = null; // 유저아이디 초기화
const accessLog = document.getElementById('access');
// 일반적으로 이렇게 불러오게 되면 안에 제대로 값을 넣지 못하게 된다.
//var newRecords = saveRecords;

socket.on('response', (response) => { // response라는 이름의 이벤트가 발생했을 떄 해당 이벤트를 출력한다.
  if(response.currentStage) {
    console.log(`현재 스테이지: `, response.currentStage);
     currentStage = response.currentStage;
  }

  if(response.broadCast) {
    //gameLog.after(response.broadCast);
    console.log(response.broadCast);
  }

  if(response.records) {
    //console.log(`response.records`, response.records);
    newGameAssets.update(response.records);
    //return 시 제대로 작동하지 않는다는 점
  }

  if(response.ranker) {
    accessLog.innerHTML = `<H3 style="color:greenyellow">${response.ranker}</H3>`;
    console.log(response.ranker);
  }
  console.log(`client response:` + response);
});

socket.on('connection', (data) => { // 서버에서 connection으로 이벤트가 클라이언트에 왔을 때 
  console.log('connection: ', data);
  userId = data.uuid; // uuid를 받아서 저장한다.
});

const sendEvent = (handlerId, payload) => {
  socket.emit('event', { // 클라이언트에서 서버로 패킷을 보내는 것.
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId,
    payload,
  });
};

export { sendEvent };
