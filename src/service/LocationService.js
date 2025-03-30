import { Alert } from "react-native";
import * as Location from "expo-location";
export const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log("Status là ",status)
    if (status !== "granted") {
      Alert.alert("Lỗi", "Cần quyền truy cập vị trí để tìm bạn bè gần đây");
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    console.log('Location',loc)
    if (loc) {
        return loc;
    } else {
      console.log('lỗi lấy vị trí')
    }
};

export const updateLocation = async (lat,lon,api) =>{
    try{
        let formData ={
            latitude:lat,
            longitude:lon
        }
        const response = await api.patch('/user/update-location',formData);
        console.log("Cập nhật thành công")
    }catch(e){
        console.log("Error update location",e)
    }
};