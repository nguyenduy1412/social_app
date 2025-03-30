import { useAuth } from "../component/AuthProvider";

export const like = async (postId, createdBy,api) => {
   
    if(!api){
        console.log("Api lỗi")
        return;
    }
    try {
      // Tạo object chứa thông tin like
      let formData = {
        postId: postId,
        createdBy: createdBy
      };
      // Gửi yêu cầu đến server
      const response = await api.post(`/reaction`, formData);
      console.log("Like thành công:");
      // WebSocket sẽ cập nhật lại trạng thái chính xác sau khi server xử lý
    } catch (error) {
      console.error("Lỗi khi like:", error);
    }
};
export const getComment =  (postId,navigation) => {
    navigation.navigate('Comment', { postId: postId })
};