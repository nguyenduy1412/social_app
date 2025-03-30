export const handleChatMessage = async (item, navigation, api) => {
    if(!api)
        return;
    try {
      const response = await api.get(`/room/${item.id}`);  
      console.log("Room Data: ", response.data);
  
      // Chuyển màn hình sau khi lấy dữ liệu thành công
      navigation.navigate("ChatMessage", { roomId: response.data.id, friend: item });
    } catch (error) {
      console.log("Lỗi lấy roomId: ", error);
    }
  };
  