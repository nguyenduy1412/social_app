import AsyncStorage from "@react-native-async-storage/async-storage";

const COLORS ={
    primary:"#1877f2",
    blue:"#00ABE0",
    gray:"#E5E6EB",
    sky:"#00A5F4",
    gold:"gold",
    error:"red",
    teal:"teal",
    danger:'#DC3545',
    blue_o:'#EBF5FF'
   
}
const ENV ={
    API_URL:"http://192.168.1.14:8888/api/v1",
    token:"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyNTA1NzE1NDkyNjAzMjI1MzM1OTY3MTU5OTY2NTMwNiIsImlhdCI6MTc0MjMwMjA5MCwiZXhwIjoxNzQ0MDMwMDkwfQ.cS8597osJ508GS2P82JPsWNj25JNfbotI8ak8VoHHIk",
    URL_SOCKET: "http://192.168.1.14:8888/ws",
   
}
const FRIEND_STATUS={
    APPROVED:0,
    FRIEND:1,
    BLOCK:2,
    NOT_SUGGESTED:3,
    INVITATION:4,
    NO_FRIEND:null,
    CANCEL:5,
    REJECT:6
}
const MESSAGE_TYPE={
    TEXT:0,
    IMAGE:1
}

const NOTIFICATION_TYPE = {
    LIKE_POST: 0,
    LIKE_IMAGE: 1,
    LIKE_COMMENT: 2,
    REQUEST_FRIEND: 3,
    FRIEND:4,
    COMMENT_POST: 5,
    COMMENT_IMAGE: 6,
    REPLY_COMMENT: 7,
};
export {COLORS,ENV,FRIEND_STATUS,MESSAGE_TYPE,NOTIFICATION_TYPE};