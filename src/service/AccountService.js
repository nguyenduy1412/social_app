import { FRIEND_STATUS } from "../../contants/theme";
import { useAuth } from "../component/AuthProvider";


export const fetchPeople = async (friendId,api) => {
  try {
    const response = await api.get(`/user/${friendId}`)
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách bạn bè:", err);
    throw err;
  }
};

export const checkFriend = async (friendId,api) => {
  const response = await api.get(`/friends/checkFriend/${friendId}`);
  return response.data;
};

export const fetchFriend = async (friendId,api,page,status,size) => {
  let formData = {
    page: page,
    size: size,
    status: status
  };
  try {
    const response = await api.post(`/friends/getFriend/${friendId}`, formData)
    return response.data.list;
  } catch (err) {
    console.error("Lỗi khi lấy friend:", err);
  }
};
export const fetchPosts = async (friendId,api,check,userId) => {
  try {
    const response = await api.post('/post/search',
      {
        size: 10,
        userId: friendId,
        content: "",
        visibility: check ? 0 : 1,
        lastCreatedAt: "",
        viewId: userId
      }
    );
    return response.data;
    
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
  }
};
export const fetchPostsSuggest = async (api,page,size) => {
  try {
    const response = await api.post('/post/get-post-suggest',
      {
        size: size,
        page:page
      }
    );
    return response.data;
    
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
  }
};
