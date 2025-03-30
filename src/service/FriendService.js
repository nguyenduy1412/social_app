export const fetchNearbyFriends = async (lat, lon,api) => {
    try {
        let formData={
            latitude:lat,
            longitude:lon
        }
        console.log("FormData: " , formData)
      const response = await api.post(`/user/get-friend-near-location`,formData);
      return response.data;
    } catch (error) {
     console.log("Error",error);
    }
  };
export const searchFriend = async (page,size,keyword,api) => {
  let formData = {
      page: page,
      size: size,
      keyword: keyword
  }
  try {
      const response = await api.post(`/friends/search-friend`, formData);
      return response.data;
  } catch (error) {
      console.log(error);
  }
}