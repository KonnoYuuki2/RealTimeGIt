import { CLIENT_VERSION } from './constants.js';

const socket = io('http://localhost:3000', { // 이 주소로 연결하겠다.
  query: {
    clientVersion: CLIENT_VERSION, //서버가 시작될떄 연결이 될떄
    // 밑에 이벤트인 connection 으로는 서버의 버전을 전송하지 않기 때문에 별도로 전송한다.
  },
});

export let currentStage = {};

export let userId = null; // 유저아이디 초기화
socket.on('response', (response) => { // response라는 이름의 이벤트가 발생했을 떄 해당 이벤트를 출력한다.
  if(response.currentStage) {
    console.log(response.currentStage);
     currentStage = response.currentStage;
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
