const users = [];

export const addUser = (user) => { // 유저 추가
    users.push(user);
}

export const removeUser = (socketId) => {
    const index = users.findIndex((user) => user.socketId = socketId);

    if(index !== -1) {
        return users.splice(index,1)[0];
    }
} 
export const getUser = () => { // 유저 조회
   return users;
}